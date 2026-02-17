import Image from '@theme/IdealImage';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';

ClickHouse의 비동기 insert는 클라이언트 측 배치가 불가능할 때 사용할 수 있는 강력한 대안이 됩니다. 이는 수백, 수천 개의 에이전트가 로그, 메트릭, 트레이스를 작은 실시간 페이로드로 지속적으로 전송하는 관측성 워크로드에서 특히 유용합니다. 이러한 환경에서 데이터를 클라이언트 측에서 버퍼링하면, 충분히 큰 배치를 전송하기 위해 중앙 집중형 큐가 필요해져 복잡성이 증가합니다.

:::note
동기 모드에서 많은 작은 배치를 보내는 것은 권장되지 않으며, 이는 다수의 파트(parts)가 생성되는 결과를 초래합니다. 이렇게 되면 쿼리(query) 성능이 저하되고 [&quot;too many part&quot;](/knowledgebase/exception-too-many-parts) 오류가 발생합니다.
:::

비동기 insert는 들어오는 데이터를 인메모리 버퍼에 먼저 기록한 뒤, 구성 가능한 임계값에 따라 스토리지로 flush하여 배치 책임을 클라이언트에서 서버로 전환합니다. 이 방식은 파트 생성 오버헤드를 크게 줄이고 CPU 사용량을 낮추며, 높은 동시성에서도 수집 효율을 유지합니다.

핵심 동작은 [`async_insert`](/operations/settings/settings#async_insert) SETTING을 통해 제어합니다.

<Image img={async_inserts} size="lg" alt="Async inserts" />

이 설정 값을 1로 설정하면(insert를 비동기 모드로 활성화하면), insert는 버퍼링되며 다음 중 하나의 flush 조건이 충족될 때만 디스크에 기록됩니다.

(1) 버퍼가 지정된 크기에 도달할 때(async&#95;insert&#95;max&#95;data&#95;size)
(2) 시간 임계값이 경과할 때(async&#95;insert&#95;busy&#95;timeout&#95;ms) 또는
(3) insert 쿼리의 개수가 최대값에 도달할 때(async&#95;insert&#95;max&#95;query&#95;number).

이 배치 프로세스는 클라이언트에게는 보이지 않으며, ClickHouse가 여러 소스에서 들어오는 insert 트래픽을 효율적으로 병합하는 데 도움이 됩니다. 그러나 flush가 발생하기 전까지는 해당 데이터를 쿼리할 수 없습니다. 중요한 점은 insert 형태와 설정 조합마다 여러 개의 버퍼가 존재하며, 클러스터 환경에서는 노드별로 버퍼가 유지된다는 것입니다. 이를 통해 멀티 테넌트 환경 전반에 걸쳐 세밀한 제어가 가능합니다. insert 메커니즘은 그 외에는 [동기 insert](/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)에 대해 설명된 내용과 동일합니다.


### 반환 모드 선택 \{#choosing-a-return-mode\}

비동기 insert 동작은 [`wait_for_async_insert`](/operations/settings/settings#wait_for_async_insert) 설정을 사용하여 더 세밀하게 제어할 수 있습니다. 

값을 1로 설정하면(기본값) ClickHouse는 데이터가 디스크에 성공적으로 플러시된 이후에만 insert를 성공으로 확인합니다. 이는 강력한 내구성 보장을 제공하며, 오류 처리도 단순하게 만듭니다. 플러시 과정에서 문제가 발생하면 해당 오류가 클라이언트에 반환됩니다. 이 모드는 특히 insert 실패를 신뢰성 있게 추적해야 하는 대부분의 프로덕션 시나리오에 권장됩니다. 

[벤치마크](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)에 따르면, 적응형 insert와 안정적인 part 생성 동작 덕분에 동시성이 높아져도(클라이언트가 200개이든 500개이든) 잘 확장됩니다.

`wait_for_async_insert = 0`으로 설정하면 "fire-and-forget" 모드가 활성화됩니다. 이 모드에서는 데이터가 스토리지에 기록될 때까지 기다리지 않고, 버퍼에 적재되는 즉시 서버가 insert를 성공으로 확인합니다. 

이 방식은 지연 시간이 매우 짧은 insert와 최대 처리량을 제공하므로, 유입 속도는 매우 빠르지만 중요도는 낮은 데이터에 적합합니다. 그러나 그에 따른 단점도 있습니다. 데이터가 실제로 영속적으로 저장된다는 보장이 없고, 오류는 플러시 중에만 나타날 수 있으며, 실패한 insert를 추적하기 어렵습니다. 데이터 손실을 허용할 수 있는 워크로드에서만 이 모드를 사용해야 합니다. 

[벤치마크에서는 또한](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) 버퍼 플러시 주기가 길 때(예: 30초마다) part 수가 크게 줄어들고 CPU 사용량도 낮아지는 것을 보여주지만, 조용히 실패할 위험은 여전히 존재합니다.

비동기 insert를 사용하는 경우 `async_insert=1,wait_for_async_insert=1` 구성을 강력히 권장합니다. `wait_for_async_insert=0`을 사용하는 것은 매우 위험합니다. INSERT 클라이언트가 오류 발생 여부를 인지하지 못할 수 있을 뿐 아니라, ClickHouse 서버가 서비스의 신뢰성을 보장하기 위해 쓰기 속도를 늦추고 backpressure를 만들어야 하는 상황에서도 클라이언트가 계속 빠르게 쓰기를 시도하여 잠재적으로 과부하를 초래할 수 있기 때문입니다.

### 중복 제거와 안정성 \{#deduplication-and-reliability\}

기본적으로 ClickHouse는 동기식 insert에 대해 자동 중복 제거를 수행하므로, 장애 발생 시 재시도해도 안전합니다. 그러나 비동기식 insert에서는 명시적으로 활성화하지 않으면 중복 제거가 비활성화됩니다(종속된 materialized view가 있는 경우에는 활성화하지 않아야 합니다 — [이 이슈 참조](https://github.com/ClickHouse/ClickHouse/issues/66003)). 

실제 운영에서는 중복 제거가 활성화된 상태에서 동일한 insert가, 예를 들어 시간 초과나 네트워크 단절로 인해 재시도되는 경우 ClickHouse가 중복된 insert를 안전하게 무시할 수 있습니다. 이를 통해 멱등성이 유지되고 데이터가 이중으로 기록되는 상황을 방지할 수 있습니다. 다만 insert 유효성 검사와 스키마 파싱은 버퍼 플러시 시점에만 수행되므로, 타입 불일치와 같은 오류는 그 시점에만 드러난다는 점에 유의해야 합니다.

### 비동기 insert 활성화 \{#enabling-asynchronous-inserts\}

비동기 insert는 특정 사용자 또는 특정 쿼리에 대해 활성화할 수 있습니다:

- 사용자 수준에서 비동기 insert를 활성화합니다. 이 예시에서는 `default` 사용자를 사용합니다. 다른 사용자를 생성한 경우 해당 사용자 이름으로 바꾸십시오:
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- insert 쿼리의 SETTINGS 절을 사용하여 비동기 insert 설정을 지정할 수 있습니다:
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- ClickHouse 프로그래밍 언어 클라이언트를 사용할 때 연결 매개변수로 비동기 insert 설정을 지정할 수도 있습니다.

  예를 들어, ClickHouse Cloud에 연결하기 위해 ClickHouse Java JDBC 드라이버를 사용할 때는 JDBC 연결 문자열에서 다음과 같이 설정합니다:
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```