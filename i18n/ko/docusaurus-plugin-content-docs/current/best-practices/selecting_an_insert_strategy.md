---
'slug': '/best-practices/selecting-an-insert-strategy'
'sidebar_position': 10
'sidebar_label': '삽입 전략 선택하기'
'title': '삽입 전략 선택하기'
'description': 'ClickHouse에서 삽입 전략을 선택하는 방법에 대한 페이지'
'keywords':
- 'INSERT'
- 'asynchronous inserts'
- 'compression'
- 'batch inserts'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

Efficient data ingestion forms the basis of high-performance ClickHouse deployments. Selecting the right insert strategy can dramatically impact throughput, cost, and reliability. This section outlines best practices, tradeoffs, and configuration options to help you make the right decision for your workload.

:::note  
다음 내용은 클라이언트를 통해 ClickHouse에 데이터를 전송하는 경우를 가정합니다. 만약 [s3](/sql-reference/table-functions/s3)와 [gcs](/sql-reference/table-functions/gcs)와 같은 내장 테이블 함수들을 사용하여 ClickHouse로 데이터를 가져오고 있다면, ["S3 삽입 및 읽기 성능 최적화 가이드"](/integrations/s3/performance)를 참고하시기 바랍니다.  
:::

## 기본값으로 동기 삽입 {#synchronous-inserts-by-default}

기본적으로 ClickHouse에 대한 삽입은 동기적입니다. 각 삽입 쿼리는 즉시 디스크에 메타데이터와 인덱스를 포함한 저장 파트를 생성합니다.

:::note 클라이언트 측에서 데이터를 배치할 수 있다면 동기 삽입을 사용하세요  
그렇지 않다면 아래의 [비동기 삽입](#asynchronous-inserts)을 참조하세요.  
:::

아래에서 ClickHouse의 MergeTree 삽입 메커니즘을 간략히 검토합니다:

<Image img={insert_process} size="lg" alt="Insert processes" background="black"/>

#### 클라이언트 측 단계 {#client-side-steps}

최적의 성능을 위해 데이터는 ① [배치](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)되어야 하며, 배치 크기가 **첫 번째 결정 사항**입니다.

ClickHouse는 삽입된 데이터를 디스크에, [주 키 컬럼 순서대로](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 저장합니다. **두 번째 결정 사항**은 서버로 전송하기 전에 데이터를 ② 미리 정렬할 것인지입니다. 배치가 주 키 컬럼 순서에 따라 미리 정렬되어 도착한다면 ClickHouse는 ⑩ 정렬 단계를 [건너뛰고](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) 삽입 속도를 높일 수 있습니다.

삽입할 데이터에 미리 정의된 형식이 없는 경우, **주요 결정**은 형식 선택입니다. ClickHouse는 [70개 이상의 형식](/interfaces/formats)으로 데이터 삽입을 지원합니다. 그러나 ClickHouse 명령줄 클라이언트나 프로그래밍 언어 클라이언트를 사용할 때 이 선택은 종종 자동으로 처리됩니다. 필요 시 이 자동 선택을 명시적으로 오버라이드할 수도 있습니다.

다음 **주요 결정**은 ④ ClickHouse 서버로 전송하기 전에 데이터를 압축할 것인지입니다. 압축은 전송 크기를 줄이고 네트워크 효율성을 향상시켜, 특히 대규모 데이터 세트에 대해 더 빠른 데이터 전송과 낮은 대역폭 사용을 가능하게 합니다.

데이터는 ⑤ ClickHouse 네트워크 인터페이스—[네이티브](/interfaces/tcp) 또는 [HTTP](/interfaces/http) 인터페이스—로 전송됩니다(이 부분은 나중에 [비교](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)합니다).

#### 서버 측 단계 {#server-side-steps}

ClickHouse는 ⑥ 데이터를 수신하면, 압축이 사용되었다면 이를 ⑦ 압축 해제하고, 원래 전송된 형식에서 ⑧ 구문 분석을 진행합니다.

형식화된 데이터의 값과 대상 테이블의 [DDL](/sql-reference/statements/create/table) 문을 사용하여, ClickHouse는 ⑨ MergeTree 형식의 메모리 내 [블록](/development/architecture#block)을 구축하고, 주 키 컬럼에 따라 행을 ⑩ [정렬](/parts#what-are-table-parts-in-clickhouse)하며, ⑪ [스파스 기본 인덱스](/guides/best-practices/sparse-primary-indexes)를 생성하고, ⑫ [컬럼별 압축](/parts#what-are-table-parts-in-clickhouse)을 적용하며, ⑬ 데이터를 새 ⑭ [데이터 파트](/parts)로 디스크에 기록합니다.

### 동기인 경우 배치 삽입 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 아이들포턴트 재시도 보장 {#ensure-idempotent-retries}

동기 삽입은 **아이들포턴트**입니다. MergeTree 엔진을 사용할 때, ClickHouse는 기본적으로 삽입을 중복 제거합니다. 이는 다음과 같은 애매한 실패 사례로부터 보호합니다:

* 삽입이 성공했으나 클라이언트가 네트워크 중단으로 인해 응답을 받지 못함.
* 삽입이 서버에서 실패하고 타임아웃 됨.

두 경우 모두 **삽입을 재시도하는 것이 안전합니다** — 배치 내용과 순서가 동일한 한에서. 이러한 이유로, 클라이언트가 일관되게 재시도하고 데이터를 수정하거나 재정렬하지 않는 것이 중요합니다.

### 올바른 삽입 대상을 선택하세요 {#choose-the-right-insert-target}

샤드 클러스터에서는 두 가지 옵션이 있습니다:

* **MergeTree** 또는 **ReplicatedMergeTree** 테이블에 직접 삽입합니다. 클라이언트가 샤드 간 부하 분산을 수행할 수 있을 때 가장 효율적인 옵션입니다. `internal_replication = true`를 설정하면 ClickHouse가 복제를 투명하게 처리합니다.
* [분산 테이블](/engines/table-engines/special/distributed)에 삽입합니다. 이를 통해 클라이언트는 데이터를任意 노드로 전송하고 ClickHouse가 이를 올바른 샤드로 전달하게 할 수 있습니다. 이는 간단하지만 추가 포워딩 단계 때문에 성능이 약간 떨어집니다. 여전히 `internal_replication = true`를 권장합니다.

**ClickHouse Cloud에서는 모든 노드가 동일한 단일 샤드에 대해 읽고 씁니다. 삽입은 자동으로 노드 간에 균형을 이룹니다. 사용자는 노출된 엔드포인트에 간단히 삽입을 전송할 수 있습니다.**

### 올바른 형식 선택 {#choose-the-right-format}

올바른 입력 형식 선택은 ClickHouse에서 효율적인 데이터 삽입을 위해 매우 중요합니다. 지원되는 70개 이상의 형식 중에서 가장 성능이 우수한 옵션을 선택하면 삽입 속도, CPU 및 메모리 사용, 시스템 전체 효율성에 큰 영향을 미칠 수 있습니다.

데이터 엔지니어링 및 파일 기반 가져오기에 유용한 유연성도 있지만, **애플리케이션은 성능 지향 형식을 우선시해야 합니다**:

* **네이티브 형식** (권장): 가장 효율적입니다. 컬럼 지향이며, 서버 측에서의 최소한의 구문 분석이 필요합니다. Go 및 Python 클라이언트에서 기본적으로 사용됩니다.
* **RowBinary**: 효율적인 행 기반 형식으로, 클라이언트 측에서 컬럼형 변환이 어려운 경우에 적합합니다. Java 클라이언트에서 사용됩니다.
* **JSONEachRow**: 사용하기 쉽지만 구문 분석 비용이 발생합니다. 저체적 사용 사례나 빠른 통합에 적합합니다.

### 압축 사용 {#use-compression}

압축은 네트워크 오버헤드를 줄이고 삽입 속도를 높이며 ClickHouse의 저장 비용을 낮추는 데 중요한 역할을 합니다. 효과적으로 사용하면 데이터 형식이나 스키마 변경을 요구하지 않고도 삽입 성능을 향상시킵니다.

삽입할 데이터를 압축하면 네트워크를 통해 전송되는 페이로드 크기가 줄어들어 대역폭 사용을 최소화하고 전송 속도를 가속화합니다.

삽입의 경우, 네이티브 형식과 함께 사용할 때 압축이 특히 효과적입니다. 이 형식은 ClickHouse의 내부 컬럼형 저장 모델과 이미 일치합니다. 이 설정에서 서버는 빠르게 데이터의 압축을 해제하고 최소한의 변형으로 데이터를 직접 저장할 수 있습니다.

#### 속도를 위한 LZ4 사용, 압축 비율을 위한 ZSTD 사용 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse는 데이터 전송 중 여러 압축 코덱을 지원합니다. 두 가지 일반적인 옵션은 다음과 같습니다:

* **LZ4**: 빠르고 경량입니다. CPU 오버헤드가 최소화되어 높은 전송량의 삽입에 적합하며, 대부분의 ClickHouse 클라이언트에서 기본적으로 사용됩니다.
* **ZSTD**: 더 높은 압축 비율을 제공하지만 CPU 집약적입니다. 네트워크 전송 비용이 높은 경우(예: 크로스 리전 또는 클라우드 공급자 시나리오) 유용하지만 클라이언트 측 컴퓨팅과 서버 측 압축 해제 시간이 약간 증가합니다.

모범 사례: 대역폭 제약이나 데이터 이탈 비용이 없다면 LZ4를 사용하세요 — 그렇지 않으면 ZSTD를 고려하세요.

:::note  
[FastFormats 벤치마크](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) 테스트에서 LZ4 압축된 네이티브 삽입은 데이터 크기를 50% 이상 줄여 5.6 GiB 데이터 세트의 삽입 시간을 150초에서 131초로 단축했습니다. ZSTD로 전환 시 같은 데이터 세트의 크기가 1.69 GiB로 줄어들었지만 서버 측 처리 시간이 약간 증가했습니다.  
:::

#### 압축이 자원 사용을 줄입니다 {#compression-reduces-resource-usage}

압축은 네트워크 트래픽을 줄일 뿐만 아니라 서버의 CPU 및 메모리 효율성 또한 개선합니다. 압축된 데이터를 통해 ClickHouse는 더 적은 바이트를 수신하고 대량 입력 구문 분석에 소요되는 시간을 줄입니다. 이 이점은 관찰 가능성 시나리오와 같이 여러 동시 클라이언트로부터 데이터를 삽입할 때 특히 중요합니다.

LZ4의 경우 CPU와 메모리에 대한 영향은 미미하며 ZSTD의 경우 중간 정도입니다. 부하가 있을 때도 데이터의 양이 줄어들어 서버 측 효율성이 개선됩니다.

**압축과 배치 및 효율적인 입력 형식(예: 네이티브)을 결합하면 최상의 삽입 성능을 얻을 수 있습니다.**

네이티브 인터페이스([clickhouse-client](/interfaces/cli) 등)를 사용할 때 LZ4 압축이 기본적으로 활성화됩니다. 필요한 경우 설정을 통해 ZSTD로 전환할 수 있습니다.

[HTTP 인터페이스](/interfaces/http)를 사용할 때는 콘텐츠 인코딩 헤더를 사용하여 압축을 적용합니다(예: Content-Encoding: lz4). 전체 페이로드를 전송 전에 압축해야 합니다.

### 저비용이라면 미리 정렬 {#pre-sort-if-low-cost}

삽입 전에 데이터를 주 키로 미리 정렬하면 ClickHouse에서 삽입 효율성을 높일 수 있으며, 특히 대규모 배치의 경우 그렇습니다.

데이터가 미리 정렬되어 도착하면 ClickHouse는 파트 생성 과정에서 내부 정렬 단계를 건너뛰거나 간소화할 수 있어 CPU 사용량을 줄이고 삽입 프로세스를 가속화할 수 있습니다. 미리 정렬은 또한 유사한 값이 함께 그룹화되므로, LZ4 또는 ZSTD와 같은 코덱이 더 나은 압축 비율을 달성할 수 있습니다. 이는 대량 배치 삽입 및 압축과 결합할 때 특히 유리하여 처리 오버헤드와 전송되는 데이터 양을 줄입니다.

**말하자면, 미리 정렬은 선택적 최적화일 뿐 필수 사항은 아닙니다.** ClickHouse는 병렬 처리를 사용하여 데이터를 매우 효율적으로 정렬하며, 많은 경우 서버 측에서의 정렬이 클라이언트 측에서 미리 정렬하는 것보다 더 빠르거나 편리합니다.

**데이터가 거의 정렬되어 있거나 클라이언트 측 리소스(CPU, 메모리)가 충분하고 활용도가 낮은 경우에만 미리 정렬을 권장합니다.** 관찰 가능성 같은 지연 민감 또는 고TPS 사용 사례에서는 데이터가 정렬되지 않거나 여러 에이전트에서 오는 경우가 많기 때문에 미리 정렬을 건너뛰고 ClickHouse의 내장 성능을 활용하는 것이 더 좋습니다.

## 비동기 삽입 {#asynchronous-inserts}

<AsyncInserts />

## 인터페이스 선택 - HTTP 또는 네이티브 {#choose-an-interface}

### 네이티브 {#choose-an-interface-native}

ClickHouse는 데이터 삽입을 위한 두 가지 주요 인터페이스: **네이티브 인터페이스**와 **HTTP 인터페이스**를 제공합니다—각각 성능과 유연성 간의 트레이드오프가 있습니다. [clickhouse-client](/interfaces/cli) 및 Go, C++와 같은 특정 언어 클라이언트에서 사용되는 네이티브 인터페이스는 성능을 위해 목적에 맞게 설계되었습니다. 이 인터페이스는 항상 ClickHouse의 매우 효율적인 네이티브 형식으로 데이터를 전송하며, LZ4 또는 ZSTD로 블록 단위 압축을 지원하고, 서버 측에서 구문 분석 및 형식 변환과 같은 작업을 클라이언트로 오프로드하여 서버 측 처리를 최소화합니다.

또한 MATERIALIZED 및 DEFAULT 컬럼 값의 클라이언트 측 계산을 허용하여 서버가 이러한 단계를 완전히 건너뛰도록 합니다. 이는 효율성이 중요한 고속 삽입 시나리오에 대해 네이티브 인터페이스가 이상적이게 합니다.

### HTTP {#choose-an-interface-http}

많은 전통적인 데이터베이스와 달리 ClickHouse는 HTTP 인터페이스도 지원합니다. **반대의 경우, 이 인터페이스는 호환성과 유연성을 우선시합니다.** 이는 [모든 지원 형식](/integrations/data-formats)—JSON, CSV, Parquet 등—으로 데이터를 전송할 수 있으며, Python, Java, JavaScript, Rust를 포함한 대부분의 ClickHouse 클라이언트에서 널리 지원됩니다.

이것은 ClickHouse의 네이티브 프로토콜보다 선호되는 경우가 많으며, 로드 밸런서를 통해 트래픽을 쉽게 전환할 수 있도록 합니다. 네이티브 프로토콜에서는 성능이 약간 덜하지만 삽입 성능에서 소규모 차이를 기대할 수 있습니다.

단, 네이티브 프로토콜의 깊은 통합이 부족하고 MATERIALIZED 값 계산이나 네이티브 형식으로의 자동 변환과 같은 클라이언트 측 최적화를 수행할 수 없습니다. 비록 HTTP 삽입이 여전히 표준 HTTP 헤더(e.g. `Content-Encoding: lz4`)를 사용하여 압축할 수 있지만, 압축이 개별 데이터 블록이 아니라 전체 페이로드에 적용됩니다. 이 인터페이스는 종종 프로토콜 단순성, 로드 밸런싱 또는 폭넓은 형식 호환성이 원초적 성능보다 더 중요한 환경에서 선호됩니다.

이들 인터페이스에 대한 더 자세한 설명은 [여기](https://interfaces/overview)를 참조하세요.
