import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

Asynchronous inserts in ClickHouse는 클라이언트 측 배치가 불가능할 때 강력한 대안을 제공합니다. 이는 수백 또는 수천 개의 에이전트가 지속적으로 데이터를 전송하는 관측 가능성 작업에서 특히 가치가 있습니다—로그, 메트릭, 추적—종종 작고 실시간 페이로드로 이루어집니다. 이러한 환경에서 클라이언트 측에서 데이터를 버퍼링하면 복잡성이 증가하며, 충분히 큰 배치를 전송하기 위해 중앙 집중식 큐가 필요합니다.

:::note
동기 모드에서 많은 작은 배치를 전송하는 것은 권장되지 않으며, 이는 많은 파트가 생성되는 결과를 초래합니다. 이는 쿼리 성능 저하와 ["너무 많은 파트"](/knowledgebase/exception-too-many-parts) 오류를 초래할 수 있습니다.
:::

비동기 삽입은 들어오는 데이터를 인메모리 버퍼에 기록한 후 구성 가능한 임계값에 따라 저장소로 플러시하여 클라이언트에서 서버로 배치 책임을 전가합니다. 이 접근 방식은 파트 생성 오버헤드를 상당히 줄이고 CPU 사용량을 낮추며 고수준의 동시성 하에서도 효율적인 데이터 수집을 보장합니다.

핵심 동작은 [`async_insert`](/operations/settings/settings#async_insert) 설정을 통해 제어됩니다.

<Image img={async_inserts} size="lg" alt="비동기 삽입"/>

활성화되면 (1) 삽입이 버퍼링되며 플러시 조건 중 하나가 충족될 때만 디스크에 기록됩니다: 

(1) 버퍼가 지정된 크기에 도달할 때 (async_insert_max_data_size)
(2) 시간 임계값이 경과할 때 (async_insert_busy_timeout_ms) 또는 
(3) 최대 삽입 쿼리 수가 누적될 때 (async_insert_max_query_number). 

이 배치 프로세스는 클라이언트에 보이지 않으며 ClickHouse가 여러 소스의 삽입 트래픽을 효율적으로 병합하는 데 도움을 줍니다. 그러나 플러시가 발생할 때까지 데이터는 쿼리할 수 없습니다. 중요한 것은 각 삽입 형태와 설정 조합에 따라 여러 버퍼가 있으며, 클러스터에서는 노드별로 버퍼가 유지되어 다중 테넌트 환경에서 세분화된 제어가 가능합니다. 삽입 메커니즘은 [동기 삽입](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)에서 설명한 것과 동일합니다.

### 반환 모드 선택 {#choosing-a-return-mode}

비동기 삽입의 동작은 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 설정을 통해 더욱 세분화됩니다. 

1로 설정하면(기본값), ClickHouse는 데이터가 디스크에 성공적으로 플러시된 후에만 삽입을 인정합니다. 이는 강력한 내구성 보장을 보장하고 오류 처리를 간단하게 만듭니다: 플러시 중에 문제가 발생하면 오류가 클라이언트에 반환됩니다. 이 모드는 삽입 실패를 신뢰할 수 있게 추적해야 하는 대부분의 프로덕션 시나리오에 추천됩니다. 

[벤치마크](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)는 200 또는 500 클라이언트를 실행하더라도 동시성에서 잘 확장된다는 것을 보여줍니다—적응형 삽입 및 안정적인 파트 생성 동작 덕분입니다.

`wait_for_async_insert = 0`으로 설정하면 "fire-and-forget" 모드가 활성화됩니다. 이 경우, 서버는 데이터가 버퍼링되는 즉시 삽입을 인정하며 저장소에 도달할 때까지 기다리지 않습니다.

이것은 초저지연 삽입과 최대 처리량을 제공하며, 고속, 낮은 중요성 데이터를 위해 이상적입니다. 그러나 이러한 방식에는 단점이 있습니다: 데이터가 지속될 것이라는 보장이 없으며, 오류는 플러시 중에만 나타날 수 있고, 실패한 삽입을 추적하기 어렵습니다. 데이터 손실을 허용할 수 있는 작업 부하가 아니라면 이 모드를 사용하지 마십시오.

[벤치마크 또한 보여줍니다](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 버퍼 플러시가 드문 경우(예: 30초마다) 파트 수가 상당히 줄어들고 CPU 사용량이 낮아지지만, 침묵의 실패 위험은 여전히 존재합니다.

비동기 삽입을 사용할 경우 `async_insert=1,wait_for_async_insert=1`을 사용하는 것을 강력히 추천합니다. `wait_for_async_insert=0`을 사용하는 것은 매우 위험하며, 이는 INSERT 클라이언트가 오류를 인식하지 못할 수 있고, ClickHouse 서버가 쓰기를 늦춰야 할 필요가 있을 때 클라이언트가 계속해서 빠르게 쓰는 경우 과부하를 초래할 수 있습니다.

### 중복 제거 및 신뢰성 {#deduplication-and-reliability}

기본적으로 ClickHouse는 동기 삽입에 대해 자동 중복 제거를 수행하여 실패 시나리오에서 재시도를 안전하게 합니다. 그러나 비동기 삽입에서는 명시적으로 활성화하지 않는 한 이 기능이 비활성화됩니다(의존성 있는 물리화된 뷰가 있는 경우에는 활성화하지 않아야 합니다—[문제 참고](https://github.com/ClickHouse/ClickHouse/issues/66003)). 

실제로, 중복 제거가 활성화되고 동일한 삽입을 재시도하는 경우—예를 들어, 타임아웃이나 네트워크 중단으로 인해—ClickHouse는 중복을 안전하게 무시할 수 있습니다. 이는 불변성을 유지하고 데이터를 두 번 쓰는 것을 피하는 데 도움이 됩니다. 그러나 삽입 검증 및 스키마 파싱은 버퍼 플러시 중에만 발생하므로, 오류(예: 타입 불일치)는 그 시점에서만 나타날 수 있습니다.

### 비동기 삽입 활성화 {#enabling-asynchronous-inserts}

비동기 삽입은 특정 사용자 또는 특정 쿼리에 대해 활성화할 수 있습니다:

- 사용자 수준에서 비동기 삽입 활성화. 이 예제에서는 사용자 `default`를 사용하며, 다른 사용자를 만들면 해당 사용자 이름으로 대체하십시오:
```sql
ALTER USER default SETTINGS async_insert = 1
```
- 삽입 쿼리의 SETTINGS 절을 사용하여 비동기 삽입 설정을 지정할 수 있습니다:
```sql
INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
```
- ClickHouse 프로그래밍 언어 클라이언트를 사용할 때 연결 매개변수로 비동기 삽입 설정을 지정할 수도 있습니다.

  예를 들어, ClickHouse Cloud에 연결할 때 ClickHouse Java JDBC 드라이버를 사용할 때 JDBC 연결 문자열 내에서 이렇게 할 수 있습니다:
```bash
"jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
```
