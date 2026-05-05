---
slug: /use-cases/observability/clickstack/performance_tuning
title: 'ClickStack - 성능 튜닝'
sidebar_label: '성능 튜닝'
description: 'ClickStack 성능 튜닝 - ClickHouse 관측성 스택'
doc_type: 'guide'
keywords: ['clickstack', '관측성', '로그', '성능', '최적화']
---

import BetaBadge from '@theme/badges/BetaBadge';
import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import trace_filtering from '@site/static/images/clickstack/performance_guide/trace_filtering.png';
import trace_filtering_v2 from '@site/static/images/clickstack/performance_guide/trace_filtering_v2.png';
import select_merge_table from '@site/static/images/clickstack/performance_guide/select_merge_table.png';

import Image from '@theme/IdealImage';


## 소개 \{#introduction\}

이 가이드는 ClickStack에 대한 가장 일반적이면서도 효과적인 성능 최적화에 초점을 둡니다. 이는 실제 관측성 워크로드의 대부분을 최적화하기에 충분하며, 일반적으로 하루 수십 테라바이트 수준의 데이터를 처리하는 경우까지를 대상으로 합니다.

여기서 설명하는 최적화 기법은 의도적인 순서로 배열되어 있습니다. 가장 단순하면서도 영향도가 큰 기법부터 시작하여, 점차 더 고급이고 특수화된 튜닝으로 진행합니다. 앞부분의 최적화는 먼저 적용해야 하며, 그 자체만으로도 상당한 성능 향상을 제공하는 경우가 많습니다. 데이터 볼륨이 커지고 워크로드 요구 사항이 더 까다로워질수록, 후반부의 기법들을 검토해 볼 가치는 점점 더 커집니다.

## ClickHouse 개념 \{#clickhouse-concepts\}

이 가이드에서 설명하는 최적화를 적용하기 전에 몇 가지 핵심 ClickHouse 개념에 익숙해지는 것이 중요합니다.

ClickStack에서는 각 **데이터 소스가 하나 이상의 ClickHouse 테이블에 직접 매핑됩니다**. OpenTelemetry를 사용하는 경우 ClickStack은 로그, 트레이스, 메트릭 데이터를 저장하는 기본 테이블 세트를 생성하고 관리합니다. 사용자 정의 스키마를 사용하거나 직접 테이블을 관리하고 있다면 이미 이러한 개념에 익숙할 수 있습니다. 반면 OpenTelemetry Collector를 통해 데이터만 전송하는 경우 이 테이블들은 자동으로 생성되며, 아래에서 설명하는 모든 최적화가 적용되는 대상이 됩니다.

| Data type                        | Table                                                                                                                  |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------|
| Logs                             | [otel_logs](/use-cases/observability/clickstack/ingesting-data/schemas#logs)                                          |
| Traces                           | [otel_traces](/use-cases/observability/clickstack/ingesting-data/schemas#traces)                                       |
| Metrics (gauges)                 | [otel_metrics_gauge](/use-cases/observability/clickstack/ingesting-data/schemas#gauge)                                 |
| Metrics (sums)                   | [otel_metrics_sum](/use-cases/observability/clickstack/ingesting-data/schemas#sum)                                     |
| Metrics (histogram)              | [otel_metrics_histogram](/use-cases/observability/clickstack/ingesting-data/schemas#histogram)                         |
| Metrics (Exponential histograms) | [otel_metrics_exponentialhistogram](/use-cases/observability/clickstack/ingesting-data/schemas#exponential-histograms) |
| Metrics (summary)                | [otel_metrics_summary](/use-cases/observability/clickstack/ingesting-data/schemas#summary-table)                       |
| Sessions                         | [hyperdx_sessions](/use-cases/observability/clickstack/ingesting-data/schemas#sessions)                                |

테이블은 ClickHouse에서 [데이터베이스](/sql-reference/statements/create/database)에 할당됩니다. 기본적으로 `default` 데이터베이스가 사용되며, 이는 [OpenTelemetry collector에서 변경](/use-cases/observability/clickstack/config#otel-collector)할 수 있습니다.

:::important 로그와 트레이스에 집중
대부분의 경우 성능 튜닝은 로그 및 트레이스 테이블에 초점을 맞춥니다. 메트릭 테이블도 필터링을 위해 최적화할 수 있지만, 스키마가 Prometheus 스타일 워크로드에 맞게 설계되어 있어 일반적인 차트 용도로는 수정이 거의 필요하지 않습니다. 반면 로그와 트레이스는 훨씬 더 다양한 액세스 패턴을 지원하므로 튜닝에 따른 이점이 가장 큽니다. 세션 데이터는 고정된 사용자 경험을 가지며, 스키마를 수정해야 할 일도 거의 없습니다.
:::

최소한 다음 ClickHouse 기본 개념은 이해하고 있는 것이 좋습니다.

| Concept | Description |
|---------|-------------|
| **Tables** | ClickStack의 데이터 소스가 기본 ClickHouse 테이블에 어떻게 대응되는지에 대한 개념입니다. ClickHouse의 테이블은 주로 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 엔진을 사용합니다. |
| **Parts** | 데이터가 변경 불가능한 파트로 어떻게 기록되고, 시간이 지나면서 어떻게 병합되는지에 대한 개념입니다. |
| **Partitions** | 파티션은 테이블의 데이터 파트를 정리된 논리적 단위로 그룹화합니다. 이러한 단위는 관리, 쿼리, 최적화를 더 쉽게 해 줍니다. |
| **Merges** | 쿼리해야 할 파트 개수를 줄이기 위해 파트를 서로 병합하는 내부 프로세스입니다. 쿼리 성능을 유지하는 데 필수적입니다. |
| **Granules** | ClickHouse가 쿼리 실행 중에 읽고 가지치기(prune)하는 가장 작은 데이터 단위입니다. |
| **Primary (ordering) keys** | `ORDER BY` 키가 디스크 상의 데이터 레이아웃, 압축, 쿼리 가지치기에 어떤 영향을 주는지에 대한 개념입니다. |

이러한 개념은 ClickHouse 성능의 핵심입니다. 데이터가 어떻게 기록되는지, 디스크에 어떻게 구조화되는지, 쿼리 시 ClickHouse가 데이터를 얼마나 효율적으로 건너뛸 수 있는지를 결정합니다. 이 가이드에서 다루는 모든 최적화(예: materialized 컬럼, 스킵 인덱스, 프라이머리 키, 프로젝션, materialized view)는 이러한 핵심 메커니즘을 바탕으로 합니다.

튜닝을 시작하기 전에 다음 ClickHouse 문서를 검토하는 것이 좋습니다.

- [ClickHouse에서 테이블 생성](/guides/creating-tables) - 테이블에 대한 간단한 소개입니다.
- [Parts](/parts)
- [Partitions](/partitions)
- [Merges](/merges)
- [프라이머리 키/인덱스](/primary-indexes)
- [ClickHouse의 데이터 저장 방식: parts와 granules](/guides/best-practices/sparse-primary-indexes) - ClickHouse에서 데이터가 어떻게 구조화되고 쿼리되는지, 그래뉼과 프라이머리 키를 상세히 다루는 고급 가이드입니다.
- [MergeTree](/engines/table-engines/mergetree-family/mergetree)- 명령 및 내부 동작을 이해하는 데 유용한 고급 MergeTree 레퍼런스 가이드입니다.

아래에 설명된 모든 최적화는 표준 ClickHouse SQL을 사용하여 기반 테이블에 직접 적용할 수 있으며, [ClickHouse Cloud SQL console](/integrations/sql-clients/sql-console) 또는 [ClickHouse client](/interfaces/cli)를 통해 실행할 수 있습니다.

## 최적화 1. 자주 조회되는 속성 materialize하기 \{#materialize-frequently-queried-attributes\}

ClickStack 사용자를 위한 첫 번째이자 가장 간단한 최적화 방법은 `LogAttributes`, `ScopeAttributes`, `ResourceAttributes`에서 자주 조회되는 속성을 식별한 다음, materialized 컬럼을 사용하여 이를 최상위 컬럼으로 승격하는 것입니다.

이 최적화만으로도 ClickStack 배포 환경을 하루 수십 테라바이트 수준까지 확장하는 데 충분한 경우가 많으며, 더 고급 튜닝 기법을 고려하기 전에 우선 적용해야 합니다.

### 왜 속성을 materialize해야 하는가 \{#why-materialize-attributes\}

ClickStack은 Kubernetes 레이블, 서비스 메타데이터, 커스텀 속성과 같은 메타데이터를 `Map(String, String)` 컬럼에 저장합니다. 이는 유연성을 제공하지만, 맵의 하위 키를 쿼리할 때 중요한 성능상의 영향을 미칩니다.

Map 컬럼에서 단일 키를 쿼리하면 ClickHouse는 디스크에서 전체 맵 컬럼을 읽어야 합니다. 맵에 많은 키가 포함되어 있으면, 전용 컬럼을 읽는 것에 비해 불필요한 I/O와 더 느린 쿼리로 이어집니다.

자주 접근되는 속성을 materialize하면 삽입 시점에 값을 추출하여 일반 컬럼으로 저장함으로써 이러한 오버헤드를 피할 수 있습니다.

Materialized 컬럼의 특징은 다음과 같습니다.

- INSERT 시 자동으로 계산됩니다.
- INSERT SQL 문에서 명시적으로 설정할 수 없습니다.
- 모든 ClickHouse 표현식을 지원합니다.
- String에서 더 효율적인 숫자 또는 날짜 타입으로의 타입 변환을 허용합니다.
- skip 인덱스 및 primary key 사용을 가능하게 합니다.
- 전체 맵에 접근하지 않고도 처리할 수 있어 디스크 읽기를 줄입니다.

:::note
ClickStack은 맵에서 추출된 materialized 컬럼을 자동으로 감지하고, 사용자가 계속해서 기존 속성 경로를 쿼리하더라도 쿼리 실행 시 이를 투명하게 사용합니다.
:::

### 예시 \{#materialize-column-example\}

Kubernetes 메타데이터를 `ResourceAttributes`에 저장하는 트레이스 기본 ClickStack 스키마를 살펴보겠습니다:

```sql
CREATE TABLE IF NOT EXISTS otel_traces
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `ParentSpanId` String CODEC(ZSTD(1)),
    `TraceState` String CODEC(ZSTD(1)),
    `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
    `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `Duration` UInt64 CODEC(ZSTD(1)),
    `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
    `StatusMessage` String CODEC(ZSTD(1)),
    `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
    `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `Links.TraceId` Array(String) CODEC(ZSTD(1)),
    `Links.SpanId` Array(String) CODEC(ZSTD(1)),
    `Links.TraceState` Array(String) CODEC(ZSTD(1)),
    `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `__hdx_materialized_rum.sessionId` String MATERIALIZED ResourceAttributes['rum.sessionId'] CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_rum_session_id __hdx_materialized_rum.sessionId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1,
    INDEX idx_lower_span_name lower(SpanName) TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
TTL toDate(Timestamp) + toIntervalDay(30)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

사용자는 Lucene 문법을 사용하여 트레이스를 필터링할 수 있습니다. 예: `ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"`:

<Image img={trace_filtering} size="lg" alt="트레이스 필터링" />

이는 다음과 유사한 SQL 조건식(predicate)으로 변환됩니다:

```sql
ResourceAttributes['k8s.pod.name'] = 'checkout-675775c4cc-f2p9c'
```

맵 키에 액세스해야 하므로, ClickHouse는 각 일치하는 행에 대해 `ResourceAttributes` 컬럼 전체를 읽어야 합니다. 맵에 키가 많이 포함되어 있다면 컬럼 크기가 매우 커질 수 있습니다.

이 속성이 자주 조회된다면 최상위 컬럼으로 구체화하는 것이 좋습니다.

삽입 시점에 파드 이름을 추출하려면 구체화된 컬럼을 추가하십시오:

```sql
ALTER TABLE otel_v2.otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

이 시점부터는 **새로운** 데이터가 전용 컬럼 `PodName`에 파드 이름을 저장합니다.

사용자는 이제 Lucene 구문을 사용하여 파드 이름을 효율적으로 쿼리할 수 있습니다. 예: `PodName:"checkout-675775c4cc-f2p9c"`

<Image img={trace_filtering_v2} size="lg" alt="트레이스 필터링 v2" />

새로 삽입되는 데이터의 경우, 맵에 대한 접근을 완전히 피할 수 있어 I/O를 크게 줄일 수 있습니다.


그러나 사용자가 계속해서 원래 속성 경로(예: `ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"`)로 쿼리를 실행하더라도, **ClickStack은 내부적으로 쿼리를 자동으로 재작성하여** 구체화된 `PodName` 컬럼을 사용하도록 하며, 다음과 같은 조건식을 사용합니다.

```sql
PodName = 'checkout-675775c4cc-f2p9c'
```

이렇게 하면 대시보드, 알림, 저장된 쿼리를 변경하지 않고도 사용자가 최적화 효과를 얻을 수 있습니다.

:::note
기본적으로 materialized 컬럼은 `SELECT *` 쿼리에서 제외됩니다. 이는 쿼리 결과를 언제든지 테이블에 다시 삽입할 수 있는 불변식을 보장합니다.
:::


### 과거 데이터 materialize 처리 \{#materializing-historical-data\}

materialized 컬럼은 해당 컬럼이 생성된 이후에 삽입되는 데이터에만 자동으로 적용됩니다. 기존 데이터의 경우 materialized 컬럼을 대상으로 한 쿼리는 자동으로 원본 맵에서 읽도록 처리됩니다.

과거 데이터에 대한 성능이 중요하다면, 예를 들어 mutation을 사용하여 컬럼을 백필(backfill)할 수 있습니다.

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
```

이 작업은 기존 [파트](/parts)를 재작성하여 컬럼을 채웁니다. 뮤테이션은 각 파트마다 단일 스레드로 수행되며, 대규모 데이터셋에서는 시간이 걸릴 수 있습니다. 영향 범위를 제한하기 위해 뮤테이션을 특정 파티션에만 적용되도록 제한할 수 있습니다.

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
IN PARTITION '2026-01-02'
```

뮤테이션 진행 상태는 예를 들어 `system.mutations` 테이블을 조회하여 모니터링할 수 있습니다.

```sql
SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

해당 뮤테이션에서 `is_done = 1`가 될 때까지 기다리십시오.

:::important
뮤테이션은 추가적인 I/O 및 CPU 오버헤드를 발생시키므로 최소한으로 사용하는 것이 좋습니다. 대부분의 경우, 기존 데이터가 자연스럽게 만료되어 제거되도록 두고 새로 수집된 데이터에 대한 성능 향상만으로도 충분합니다.
:::


## Optimization 2. Adding skip indices \{#adding-skip-indices\}

자주 쿼리되는 속성을 구체화한 후, 다음 최적화 단계는 데이터 스키핑 인덱스를 추가하여 쿼리 실행 중 ClickHouse가 읽어야 하는 데이터 양을 더 줄이는 것입니다.

데이터 스키핑 인덱스를 사용하면 일치하는 값이 존재하지 않는다고 판단할 수 있을 때 ClickHouse가 전체 데이터 블록을 스캔하지 않도록 할 수 있습니다. 기존의 보조 인덱스와 달리 데이터 스키핑 인덱스는 그래뉼(granule) 수준에서 동작하며, 쿼리 필터가 데이터셋의 큰 부분을 제외할 때 가장 효과적입니다. 적절히 사용하면 쿼리 의미를 변경하지 않고도 카디널리티가 높은 속성에 대한 필터링을 크게 가속할 수 있습니다.

다음은 데이터 스키핑 인덱스를 포함하는 ClickStack의 기본 traces 스키마입니다.

```sql
CREATE TABLE IF NOT EXISTS otel_traces
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `ParentSpanId` String CODEC(ZSTD(1)),
    `TraceState` String CODEC(ZSTD(1)),
    `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
    `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `Duration` UInt64 CODEC(ZSTD(1)),
    `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
    `StatusMessage` String CODEC(ZSTD(1)),
    `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
    `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `Links.TraceId` Array(String) CODEC(ZSTD(1)),
    `Links.SpanId` Array(String) CODEC(ZSTD(1)),
    `Links.TraceState` Array(String) CODEC(ZSTD(1)),
    `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `__hdx_materialized_rum.sessionId` String MATERIALIZED ResourceAttributes['rum.sessionId'] CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_rum_session_id __hdx_materialized_rum.sessionId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1,
    INDEX idx_lower_span_name lower(SpanName) TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
TTL toDate(Timestamp) + toIntervalDay(30)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

이러한 인덱스는 두 가지 일반적인 패턴에 중점을 둡니다:

* TraceId, 세션 식별자, 속성 키 또는 값과 같은 카디널리티가 높은 문자열 필터링
* 스팬 지속 시간과 같은 숫자 범위 필터링


### Bloom filters \{#bloom-filters\}

블룸 필터 인덱스는 ClickStack에서 가장 일반적으로 사용되는 스킵 인덱스 유형입니다. 서로 다른 값이 보통 수만 개 이상인, 카디널리티가 높은 문자열 컬럼에 적합합니다. granularity가 1일 때 거짓 양성률을 0.01로 설정하는 것이 기본값으로 적절하며, 스토리지 오버헤드와 효과적인 프루닝(pruning) 사이의 균형을 잘 맞춥니다.

Optimization 1의 예제를 이어서, Kubernetes 파드 이름이 ResourceAttributes에서 구체화되었다고 가정하십시오:

```sql
ALTER TABLE otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

그 다음 이 컬럼에 대한 필터링을 더 빠르게 수행하기 위해 블룸 필터 스킵 인덱스를 추가할 수 있습니다.

```sql
ALTER TABLE otel_traces
ADD INDEX idx_pod_name PodName
TYPE bloom_filter(0.01)
GRANULARITY 1
```

추가한 후에는 skip index를 구체화(Materialize)해야 합니다. [&quot;Materialize skip index.&quot;](#materialize-skip-index)를 참조하십시오.

생성 및 구체화가 완료되면 ClickHouse는 요청된 파드 이름을 포함하지 않는 것이 확실한 전체 그래뉼을 건너뛸 수 있으므로, `PodName:"checkout-675775c4cc-f2p9c"`와 같은 쿼리에서 읽어야 하는 데이터 양을 줄일 수 있습니다.

블룸 필터는 값의 분포 특성상 특정 값이 상대적으로 적은 수의 파트에만 나타나는 경우에 가장 효과적입니다. 이는 관측성 워크로드에서 자주 자연스럽게 발생하는데, 파드 이름, 트레이스 ID, 세션 식별자와 같은 메타데이터가 시간과 연관되기 때문에 테이블의 정렬 키(ordering key)에 따라 클러스터링되기 때문입니다.

모든 skip index와 마찬가지로, 블룸 필터는 선별적으로 추가하고 실제 쿼리 패턴에 대해 검증하여 측정 가능한 이점을 제공하는지 확인해야 합니다. [&quot;Evaluating skip index effectiveness.&quot;](#evaluating-skip-index-effectiveness)를 참조하십시오.


### 최소-최대 인덱스 \{#min-max-indices\}

Minmax 인덱스는 각 그래뉼(granule) 단위로 최소값과 최대값을 저장하며, 매우 가볍습니다. 특히 숫자 컬럼과 범위 쿼리에 효과적입니다. 모든 쿼리의 속도를 높이지는 못하더라도 비용이 거의 들지 않기 때문에, 숫자 필드에는 거의 항상 추가할 만한 가치가 있습니다.

Minmax 인덱스는 숫자 값이 자연스럽게 정렬되어 있거나 각 파트(part) 내에서 좁은 범위에 제한되어 있을 때 가장 효과적입니다.

`SpanAttributes`에서 Kafka 오프셋을 자주 쿼리한다고 가정해 보겠습니다:

```sql
SpanAttributes['messaging.kafka.offset']
```

이 값을 구체화하여 숫자형으로 변환할 수 있습니다:

```sql
ALTER TABLE otel_traces
ADD COLUMN KafkaOffset UInt64
MATERIALIZED toUInt64(SpanAttributes['messaging.kafka.offset'])
```

그런 다음 minmax 인덱스를 추가할 수 있습니다:

```sql
ALTER TABLE otel_traces
ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1
```

이렇게 하면 ClickHouse가 Kafka 오프셋 범위로 필터링할 때 파트를 효율적으로 건너뛰어, 예를 들어 컨슈머 지연이나 재생 동작을 디버깅하는 데 활용할 수 있습니다.

인덱스를 사용하려면 먼저 [구체화](#materialize-skip-index)해야 합니다.


### Skip 인덱스 구체화(Materialize) \{#materialize-skip-index\}

Skip 인덱스를 추가한 이후에는 새로 수집된 데이터에만 적용됩니다. 인덱스를 명시적으로 구체화하기 전에는 과거 데이터에는 이 인덱스의 효과가 적용되지 않습니다.

이미 Skip 인덱스를 추가한 경우, 예를 들어 다음과 같습니다:

```sql
ALTER TABLE otel_traces ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1;
```

기존 데이터에 대해서는 인덱스를 반드시 명시적으로 생성해야 합니다:

```sql
ALTER TABLE otel_traces MATERIALIZE INDEX idx_kafka_offset;
```

:::note[스킵 인덱스 머티리얼라이즈]
스킵 인덱스를 머티리얼라이즈하는 작업은 일반적으로 부담이 적고 실행해도 안전하며, 특히 minmax 인덱스에 대해 그렇습니다. 대용량 데이터셋에서 블룸 필터 인덱스를 사용할 때에는 리소스 사용량을 더 잘 제어하기 위해 파티션 단위로 머티리얼라이즈하는 방식을 선호할 수 있습니다. 예:

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE INDEX idx_kafka_offset
IN PARTITION '2026-01-02';
```

:::

skip 인덱스를 구체화하는 작업은 mutation으로 처리됩니다. 진행 상황은 system 테이블을 통해 모니터링할 수 있습니다.

```sql

SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

해당 mutation이 `is_done = 1`이 될 때까지 대기합니다.

완료되면 인덱스 데이터가 생성되었는지 확인합니다:

```sql
SELECT database, table, name,
       data_compressed_bytes,
       data_uncompressed_bytes,
       marks_bytes
FROM system.data_skipping_indices
WHERE database = 'otel'
  AND table = 'otel_traces'
  AND name = 'idx_kafka_offset';
```

0이 아닌 값은 인덱스가 성공적으로 머터리얼라이즈되었음을 나타냅니다.

데이터 스키핑 인덱스(스킵 인덱스)의 크기는 쿼리 성능에 직접적인 영향을 주기 때문에 중요합니다. 수십 또는 수백 기가바이트 수준의 매우 큰 스킵 인덱스는 쿼리 실행 중에 평가하는 데 눈에 띄는 시간이 걸릴 수 있으며, 이로 인해 이점이 줄어들거나 심지어 상쇄될 수 있습니다.

실무에서는 minmax 인덱스가 일반적으로 매우 작고 평가 비용이 낮아, 거의 항상 안전하게 머터리얼라이즈할 수 있습니다. 반면 블룸 필터 인덱스는 카디널리티, 그래뉼 크기, 허용되는 오탐(false positive) 확률에 따라 크게 커질 수 있습니다.

블룸 필터 크기는 허용되는 오탐률을 높여 줄일 수 있습니다. 예를 들어, probability 매개변수를 `0.01`에서 `0.05`로 증가시키면, 덜 공격적으로 프루닝(pruning)하는 대신 더 작고 더 빠르게 평가되는 인덱스를 생성합니다. 스킵되는 그래뉼 수는 줄어들 수 있지만, 인덱스를 더 빠르게 평가함으로써 전체 쿼리 지연 시간이 개선될 수 있습니다.

따라서 블룸 필터 매개변수 조정은 워크로드에 따라 달라지는 최적화이며, 실제 쿼리 패턴과 운영 환경과 유사한 데이터 볼륨을 사용해 검증해야 합니다.

스킵 인덱스에 대한 자세한 내용은 가이드 [「ClickHouse 데이터 스키핑 인덱스 이해하기」](/optimize/skipping-indexes/examples)를 참조하십시오.


### 스킵 인덱스 효율성 평가 \{#evaluating-skip-index-effectiveness\}

스킵 인덱스를 통한 가지치기 효과를 평가하는 가장 신뢰할 수 있는 방법은 `EXPLAIN indexes = 1`을 사용하는 것입니다. 이 명령은 쿼리 계획 수립의 각 단계에서 얼마나 많은 [파트](/parts)와 [그래뉼](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)이 제거되는지를 보여 줍니다. 대부분의 경우 Skip 단계에서 그래뉼 수가 크게 감소하는 것을 확인하는 것이 좋으며, 이상적으로는 프라이머리 키가 이미 검색 범위를 줄인 이후에 발생하는 것이 바람직합니다. 스킵 인덱스는 파티션 가지치기와 프라이머리 키 가지치기 이후에 평가되므로, 그 효과는 남아 있는 파트와 그래뉼을 기준으로 측정하는 것이 가장 적절합니다.

`EXPLAIN`은 가지치기가 발생하는지를 확인해 주지만, 전체적인 속도 향상을 보장하지는 않습니다. 스킵 인덱스는 특히 인덱스 크기가 클 경우 평가 비용이 듭니다. 실제 성능 향상을 확인하기 위해 인덱스를 추가하고 구체화하기 전과 후의 쿼리를 항상 벤치마크해야 합니다.

예를 들어, 기본 Traces 스키마에 포함된 TraceId용 기본 블룸 필터 스킵 인덱스를 살펴보겠습니다.

```sql
INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1
```

선택도가 높은 쿼리에 대해 얼마나 효과적인지 확인하려면 `EXPLAIN indexes = 1`을 사용할 수 있습니다.

```sql
EXPLAIN indexes = 1
SELECT *
FROM otel_v2.otel_traces
WHERE (ServiceName = 'accounting')
  AND (TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974');

ReadFromMergeTree (otel_v2.otel_traces)
Indexes:
  PrimaryKey
    Keys:
      ServiceName
    Parts: 6/18
    Granules: 255/35898
  Skip
    Name: idx_trace_id
    Description: bloom_filter GRANULARITY 1
    Parts: 1/6
    Granules: 1/255
```

이 경우 기본 키 필터가 먼저 데이터셋을 상당히 줄입니다(35,898개의 그래뉼에서 255개로 감소시키고), 이어서 블룸 필터가 이를 단일 그래뉼(1/255)까지 추가로 줄입니다. 이는 skip 인덱스에 이상적인 패턴입니다. 기본 키 프루닝으로 검색 범위를 좁힌 다음, skip 인덱스가 남은 대부분을 제거합니다.

실제 영향을 검증하려면 설정을 일정하게 유지한 상태에서 쿼리를 벤치마크하고 실행 시간을 비교하십시오. 결과 직렬화 오버헤드를 피하기 위해 `FORMAT Null`을 사용하고, 실행을 반복 가능하게 유지하기 위해 쿼리 조건 캐시를 비활성화하십시오:

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
SETTINGS use_query_condition_cache = 0

2 rows in set. Elapsed: 0.025 sec. Processed 8.52 thousand rows, 299.78 KB (341.22 thousand rows/s., 12.00 MB/s.)
Peak memory usage: 41.97 MiB.
```

이제 skip 인덱스를 비활성화한 채로 동일한 쿼리를 다시 실행합니다:

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
FORMAT Null
SETTINGS use_query_condition_cache = 0, use_skip_indexes = 0;

0 rows in set. Elapsed: 0.702 sec. Processed 1.62 million rows, 56.62 MB (2.31 million rows/s., 80.71 MB/s.)
Peak memory usage: 198.39 MiB.
```

`use_query_condition_cache`를 비활성화하면 캐시된 필터링 결정에 의해 결과가 영향을 받지 않으며, `use_skip_indexes = 0`으로 설정하면 비교를 위한 명확한 기준선을 제공합니다. 프루닝 효과가 좋고 인덱스 평가 비용이 낮다면, 위 예시처럼 인덱스를 사용하는 쿼리가 체감될 정도로 더 빨라져야 합니다.

:::tip
`EXPLAIN` 결과에서 granule 프루닝이 거의 보이지 않거나 skip 인덱스가 매우 큰 경우, 인덱스를 평가하는 비용이 이점을 상쇄할 수 있습니다. `EXPLAIN indexes = 1`을 사용해 프루닝을 확인한 다음, 엔드 투 엔드(end-to-end) 성능 향상을 검증하기 위해 벤치마크를 수행하십시오.
:::


### 스킵 인덱스를 추가할 때 \{#when-to-add-skip-indexes\}

스킵 인덱스는 사용자가 가장 자주 실행하는 필터 유형과 파트 및 그래뉼 내 데이터 분포 형태를 기준으로 선별적으로 추가해야 합니다. 목표는 인덱스 자체를 평가하는 데 드는 비용을 상쇄할 만큼 충분한 그래뉼을 프루닝(pruning)하는 것이므로, 실제 운영 환경과 유사한 데이터에서 벤치마킹하는 것이 필수적입니다.

**필터에 사용되는 수치형 컬럼에는 `minmax` 스킵 인덱스를 사용하는 것이 거의 항상 좋은 선택입니다.** 이 인덱스는 가볍고 평가 비용이 저렴하며, 특히 값이 대략적으로 정렬되어 있거나 파트 내부에서 좁은 범위에 제한되는 경우 범위 조건에 효과적입니다. 특정 쿼리 패턴에서 `minmax`가 도움이 되지 않더라도, 오버헤드는 일반적으로 충분히 낮기 때문에 유지하는 것이 타당한 경우가 많습니다.

**문자열 컬럼: 카디널리티가 높고 값이 희소한 경우 블룸 필터를 사용하십시오.**

블룸 필터는 각 값의 출현 빈도가 상대적으로 낮은 고카디널리티 문자열 컬럼에 가장 효과적입니다. 즉, 대부분의 파트와 그래뉼에는 조회 대상 값이 포함되어 있지 않은 경우입니다. 경험칙으로, 컬럼에 서로 다른 값이 최소 10,000개 이상일 때 블룸 필터의 효과를 기대할 수 있으며, 100,000개 이상의 상이한 값이 있을 때 가장 좋은 성능을 보이는 경우가 많습니다. 또한, 일치하는 값이 소수의 연속된 파트에 클러스터링되어 있을 때 더 효과적인데, 이는 일반적으로 해당 컬럼이 정렬 키와 연관되어 있을 때 발생합니다. 마찬가지로 환경에 따라 결과가 달라질 수 있으므로, 실제 환경에서의 테스트를 대체할 수 있는 것은 없습니다.

## Optimization 3. Modifying the primary key \{#modifying-the-primary-key\}

기본 키는 대부분의 워크로드에서 ClickHouse 성능 튜닝의 가장 중요한 구성 요소 중 하나입니다. 이를 효과적으로 튜닝하려면 기본 키가 어떻게 동작하는지, 그리고 쿼리 패턴과 어떻게 상호작용하는지 이해해야 합니다. 궁극적으로 기본 키는 사용자가 데이터를 조회하는 방식, 특히 어떤 컬럼을 가장 자주 필터링하는지에 맞추어야 합니다.

기본 키는 압축 및 저장 레이아웃에도 영향을 미치지만, 주된 목적은 쿼리 성능입니다. ClickStack에서는 기본 제공되는 기본 키가 가장 일반적인 관측성(access pattern) 패턴과 강력한 압축을 위해 이미 최적화되어 있습니다. 로그, 트레이스, 메트릭 테이블의 기본 키는 일반적인 워크플로에서 좋은 성능을 내도록 설계되어 있습니다.

기본 키에서 더 앞에 위치한 컬럼으로 필터링할수록, 더 뒤에 위치한 컬럼으로 필터링하는 것보다 효율적입니다. 기본 구성만으로도 대부분의 경우에는 충분하지만, 특정 워크로드에 대해서는 기본 키를 수정하여 성능을 향상시킬 수 있는 경우가 있습니다.

:::note[A note on terminology]
이 문서 전반에서 「ordering key」라는 용어는 「primary key」와 혼용하여 사용됩니다. 엄밀히 말하면 ClickHouse에서는 이 둘이 다르지만, ClickStack에서는 일반적으로 테이블의 `ORDER BY` 절에 지정된 동일한 컬럼을 가리킵니다. 자세한 내용은 정렬 키와 다른 기본 키를 선택하는 방법에 대한 [ClickHouse 문서](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)를 참조하십시오.
:::

어떤 기본 키를 수정하기 전에, ClickHouse에서 [기본 인덱스가 어떻게 동작하는지 이해하기 위한 가이드](/primary-indexes)를 읽을 것을 강력히 권장합니다:

기본 키 튜닝은 테이블 및 데이터 타입별로 달라집니다. 한 테이블과 데이터 타입에 도움이 되는 변경이 다른 테이블에는 적용되지 않을 수 있습니다. 목표는 항상 특정 데이터 타입(예: 로그)에 대해 최적화하는 것입니다.

**일반적으로 로그와 트레이스 테이블을 최적화하게 됩니다. 다른 데이터 타입에 대해 기본 키를 변경해야 하는 경우는 드뭅니다.**

아래는 로그와 메트릭용 ClickStack 테이블의 기본 기본 키입니다.

- Logs ([`otel_logs`](/use-cases/observability/clickstack/ingesting-data/schemas#logs)) - `(ServiceName, TimestampTime, Timestamp)`
- Traces (['otel_traces](/use-cases/observability/clickstack/ingesting-data/schemas#traces)) - `(ServiceName, SpanName, toDateTime(Timestamp))`

다른 데이터 타입의 테이블에서 사용되는 기본 키는 ["Tables and schemas used by ClickStack"](/use-cases/observability/clickstack/ingesting-data/schemas)를 참조하십시오. 예를 들어, 트레이스 테이블은 서비스 이름과 스팬 이름으로 필터링하는 데 최적화되어 있으며, 그 뒤를 타임스탬프와 트레이스 ID가 따릅니다. 반대로 로그 테이블은 서비스 이름, 그다음 날짜, 그다음 타임스탬프로 필터링하는 데 최적화되어 있습니다. 최적의 순서는 기본 키의 순서대로 필터를 적용하는 것이지만, 어떤 순서로든 이 컬럼들로 필터링하더라도 ClickHouse가 [읽기 전에 데이터를 프루닝(pruning)](/optimize/skipping-indexes)하므로 쿼리는 여전히 큰 이점을 얻을 수 있습니다.

기본 키를 선택할 때는 컬럼의 최적 정렬 순서를 결정하기 위한 다른 고려 사항도 있습니다. ["Choosing a primary key."](#choosing-a-primary-key)를 참조하십시오.

**기본 키는 테이블별로 개별적으로 변경해야 합니다. 로그에 적합한 구성이 트레이스나 메트릭에는 적합하지 않을 수 있습니다.**

### 기본 키 선택하기 \{#choosing-a-primary-key\}

먼저, 특정 테이블에 대한 액세스 패턴이 해당 테이블의 기본 설정과 의미 있게 다른지 확인합니다. 예를 들어, 로그를 조회할 때 대부분의 경우 서비스 이름보다 Kubernetes 노드를 먼저 기준으로 필터링하고, 이것이 지배적인 워크플로라면 기본 키를 변경할 충분한 이유가 될 수 있습니다.

:::note[기본 기본 키 수정]
기본으로 제공되는 기본 키만으로도 대부분의 경우에 충분합니다. 변경은 쿼리 패턴을 명확히 이해한 경우에만 신중하게 수행해야 합니다. 기본 키를 수정하면 다른 워크플로의 성능이 저하될 수 있으므로, 테스트가 필수입니다.
:::

원하는 컬럼을 추출했다면, 이제 정렬/기본 키 최적화를 시작할 수 있습니다.

정렬 키를 선택하는 데 도움이 되는 몇 가지 간단한 규칙을 적용할 수 있습니다. 아래 기준은 서로 충돌할 수 있으므로, 제시된 순서대로 고려하십시오. 이 과정을 통해 최대 4–5개의 키를 선택하는 것을 목표로 합니다:

1. 일반적인 필터 조건과 액세스 패턴에 잘 맞는 컬럼을 선택합니다. 관측성(Observability) 분석을 시작할 때 보통 특정 컬럼(예: 파드 이름)으로 먼저 필터링한다면, 이 컬럼은 `WHERE` 절에서 자주 사용될 것입니다. 사용 빈도가 낮은 컬럼보다 이러한 컬럼을 키에 우선적으로 포함합니다.
2. 필터링 시 전체 행 중 상당 부분을 배제하여, 읽어야 할 데이터 양을 줄여 주는 컬럼을 선호합니다. 서비스 이름과 상태 코드는 종종 좋은 후보입니다. 단, 상태 코드의 경우 대부분의 행을 제외하는 값으로 필터링하는 경우에만 의미가 있습니다. 예를 들어, 200 코드로 필터링하면 대부분의 시스템에서는 대부분의 행과 일치하는 반면, 500 오류는 상대적으로 매우 작은 부분집합에만 해당합니다.
3. 테이블의 다른 컬럼과 높은 상관관계를 가질 가능성이 큰 컬럼을 선호합니다. 이렇게 하면 해당 값들이 연속적으로 저장되는 경향이 강해져 압축률이 개선됩니다.
4. 정렬 키에 포함된 컬럼에 대해 수행되는 `GROUP BY`(차트용 집계) 및 `ORDER BY`(정렬) 연산은 메모리를 더 효율적으로 사용할 수 있습니다.

정렬 키로 사용할 컬럼의 부분 집합을 식별했다면, 이를 특정 순서로 선언해야 합니다. 이 순서는 쿼리에서 보조 키 컬럼에 대한 필터링 효율과 테이블 데이터 파일의 압축 비율 모두에 상당한 영향을 줄 수 있습니다. 일반적으로는 카디널리티가 낮은 순으로 키를 나열하는 것이 가장 좋습니다. 다만, 정렬 키 튜플에서 뒤쪽에 위치한 컬럼에 대한 필터링은 앞쪽에 위치한 컬럼에 비해 덜 효율적이라는 점을 함께 고려해야 합니다. 이러한 동작을 균형 있게 감안하고 실제 액세스 패턴을 반영하십시오. 가장 중요한 것은 다양한 변형을 테스트하는 것입니다. 정렬 키와 그 최적화 방법에 대해 더 깊이 이해하려면, 기본 키 튜닝과 내부 데이터 구조에 대해 더 심도 있는 인사이트를 제공하는 ["기본 키 선택하기."](/best-practices/choosing-a-primary-key)와 ["ClickHouse의 기본 인덱스에 대한 실용적인 소개."](/guides/best-practices/sparse-primary-indexes)를 참고하는 것이 좋습니다.

### 기본 키 변경 \{#changing-the-primary-key\}

데이터 수집 이전에 액세스 패턴에 대한 확신이 있다면, 해당 데이터 유형에 대해 테이블을 삭제한 후 다시 생성하면 됩니다.

아래 예시는 기존 스키마를 그대로 사용하되, `ServiceName` 앞에 `SeverityText` 컬럼을 포함하는 새로운 기본 키를 사용하는 새로운 로그 테이블을 생성하는 간단한 방법을 보여줍니다.

<VerticalStepper headerLevel="h4">

#### 새 테이블 생성 \{#create-new-table-with-key\}

```sql
CREATE TABLE otel_logs_temp AS otel_logs
PRIMARY KEY (SeverityText, ServiceName, TimestampTime)
ORDER BY (SeverityText, ServiceName, TimestampTime)
```

:::note 정렬 키 vs 기본 키
위 예시에서는 `PRIMARY KEY`와 `ORDER BY`를 모두 지정해야 합니다.
ClickStack에서는 이 둘이 거의 항상 동일합니다.
`ORDER BY`는 물리적인 데이터 레이아웃을 제어하고, `PRIMARY KEY`는 희소 인덱스를 정의합니다.
드물게, 매우 큰 워크로드에서는 이 둘이 다를 수 있지만, 대부분의 사용자는 이를 일치시키는 편이 좋습니다.
:::

#### 테이블 교환 및 삭제 \{#exhange-and-drop-table\}

`EXCHANGE` 구문은 테이블 이름을 [원자적으로](/concepts/glossary#atomicity) 서로 교환하는 데 사용됩니다. 임시 테이블(이제 이전 기본 테이블)은 삭제할 수 있습니다.

```sql
EXCHANGE TABLES otel_logs_temp AND otel_logs
DROP TABLE otel_logs_temp
```

</VerticalStepper>

그러나 **기존 테이블의 기본 키는 수정할 수 없습니다.** 이를 변경하려면 새 테이블을 생성해야 합니다.

다음 절차를 사용하면 이전 데이터를 유지하면서도 투명하게 쿼리할 수 있습니다. 필요하다면 HyperDX에서 기존 키를 사용해 쿼리할 수 있고, 동시에 새로운 데이터는 사용자의 액세스 패턴에 최적화된 새 테이블을 통해 제공됩니다. 이 접근 방식은 수집 파이프라인을 수정할 필요가 없도록 보장하며, 데이터는 계속 기본 테이블 이름으로 전송되고 모든 변경 사항은 사용자에게 투명하게 처리됩니다.

:::note
새 테이블로 기존 데이터를 백필(backfill)하는 작업은 대규모 환경에서는 거의 가치가 없습니다. 필요한 컴퓨팅 리소스와 I/O 비용이 보통 매우 크고, 성능 향상 효과를 정당화하지 못합니다. 대신, 오래된 데이터는 [TTL을 통해](/use-cases/observability/clickstack/ttl) 만료되도록 두고, 최신 데이터에 대해서만 개선된 키의 이점을 활용하는 것이 좋습니다.
:::

<VerticalStepper headerLevel="h4">

아래에서는 기본 키의 첫 번째 컬럼으로 `SeverityText`를 도입하는 동일한 예시를 사용합니다. 이 경우, 새로운 데이터용 테이블을 생성하고, 기존 테이블은 과거 데이터 분석용으로 유지합니다.

#### 새 테이블 생성 \{#create-new-table-with-key-2\}

원하는 기본 키로 새 테이블을 생성합니다. `_23_01_2025` 접미사에 주목하십시오. 이 값은 현재 날짜에 맞게 변경하면 됩니다. 예:

```sql
CREATE TABLE otel_logs_23_01_2025 AS otel_logs
PRIMARY KEY (SeverityText, ServiceName, TimestampTime)
ORDER BY (SeverityText, ServiceName, TimestampTime)
```

#### Merge 테이블 생성 \{#create-merge-table\}

[Merge 엔진](/engines/table-engines/special/merge)은(는) MergeTree와 혼동하면 안 되며, 자체적으로 데이터를 저장하지 않고 여러 테이블의 데이터를 동시에 읽을 수 있게 해 줍니다.

```sql
CREATE TABLE otel_logs_merge
AS otel_logs
ENGINE = Merge(currentDatabase(), 'otel_logs*')
```

:::note
`currentDatabase()`는 명령이 올바른 데이터베이스에서 실행된다고 가정합니다. 그렇지 않다면 데이터베이스 이름을 명시적으로 지정해야 합니다.
:::

이제 이 테이블을 쿼리하여 `otel_logs`에서 데이터를 반환하는지 확인할 수 있습니다.

#### HyperDX를 Merge 테이블을 읽도록 업데이트 \{#update-hyperdx-to-read-from-merge-tree\}

HyperDX에서 로그 데이터 소스의 테이블로 `otel_logs_merge`를 사용하도록 구성합니다.

<Image img={select_merge_table} size="lg" alt="Merge 테이블 선택"/>

이 시점에서 쓰기는 원래 기본 키를 가진 `otel_logs`로 계속 수행되며, 읽기는 Merge 테이블을 사용합니다. 사용자에게 보이는 변경 사항은 없으며 수집에도 영향이 없습니다.

#### 테이블 교환 \{#exchange-the-tables\}

이제 `EXCHANGE` 구문을 사용하여 `otel_logs`와 `otel_logs_23_01_2025` 테이블의 이름을 원자적으로 교환합니다.

```sql
EXCHANGE TABLES otel_logs AND otel_logs_23_01_2025
```

이제 쓰기는 업데이트된 기본 키를 가진 새로운 `otel_logs` 테이블로 수행됩니다. 기존 데이터는 `otel_logs_23_01_2025`에 남아 있으며, 여전히 Merge 테이블을 통해 액세스할 수 있습니다. 접미사는 변경이 적용된 날짜를 나타내며, 해당 테이블에 포함된 최신 타임스탬프를 의미합니다.

이 프로세스를 통해 수집 중단 없이, 그리고 사용자에게 보이는 영향 없이 기본 키를 변경할 수 있습니다.

</VerticalStepper>

이 과정은 기본 키에 추가 변경이 필요한 경우에도 동일하게 적용할 수 있습니다. 예를 들어, 1주일 후에 `SeverityText` 대신 `SeverityNumber`를 기본 키의 일부로 포함해야 한다고 결정하는 경우입니다. 다음 과정은 기본 키 변경이 필요할 때마다 반복해서 적용할 수 있습니다.

<VerticalStepper headerLevel="h4">

#### 새 테이블 생성 \{#create-new-table-with-key-3\}

원하는 기본 키를 사용하여 새 테이블을 생성합니다.
아래 예시에서는 테이블의 날짜를 나타내기 위해 `30_01_2025`를 접미사로 사용합니다. 예를 들면 다음과 같습니다.

```sql
CREATE TABLE otel_logs_30_01_2025 AS otel_logs
PRIMARY KEY (SeverityNumber, ServiceName, TimestampTime)
ORDER BY (SeverityNumber, ServiceName, TimestampTime)
```

#### 테이블 교환 \{#exchange-the-tables-v2\}

이제 `EXCHANGE` 문을 사용하여 `otel_logs`와 `otel_logs_30_01_2025` 테이블의 이름을 원자적으로 교환합니다.

```sql
EXCHANGE TABLES otel_logs AND otel_logs_30_01_2025
```

이제 쓰기 작업은 업데이트된 기본 키를 가진 새로운 `otel_logs` 테이블로 기록됩니다. 기존 데이터는 `otel_logs_30_01_2025`에 남아 있으며, 머지 테이블을 통해 액세스할 수 있습니다.

</VerticalStepper>

:::note Redundant tables
권장되는 방식대로 TTL 정책이 설정되어 있는 경우, 더 이상 쓰기를 받지 않는 이전 기본 키를 가진 테이블은 데이터가 만료됨에 따라 점진적으로 비워집니다. 이러한 테이블은 모니터링해야 하며, 데이터가 전혀 남지 않으면 주기적으로 정리해야 합니다. 현재로서는 이 정리 과정은 수동으로 수행됩니다.
:::

## 최적화 4. materialized view 활용 \{#exploting-materialied-views\}

<BetaBadge/>

ClickStack은 [증분형 Materialized Views](/materialized-view/incremental-materialized-view)를 활용하여, 시간 경과에 따른 분 단위 평균 요청 지속 시간 계산과 같이 집계 연산이 많은 쿼리에 의존하는 시각화를 가속화할 수 있습니다. 이 기능은 쿼리 성능을 획기적으로 향상시킬 수 있으며, 하루 10 TB 이상 수준의 대규모 배포에서 특히 유용하고, 하루 수 페타바이트 범위까지 확장할 수 있도록 해 줍니다. 증분형 Materialized Views는 현재 Beta 단계이므로 신중하게 사용해야 합니다.

For details on using this feature in ClickStack, see our dedicated guide ["ClickStack - Materialized Views."](/use-cases/observability/clickstack/materialized_views)

## Optimization 5. Exploiting Projections \{#exploting-projections\}

프로젝션은 materialized 컬럼, 스킵 인덱스(skip index), 기본 키(primary key), materialized view를 모두 검토한 이후에 고려할 수 있는 최종 단계의 고급 최적화입니다. 프로젝션과 materialized view는 비슷해 보일 수 있지만, ClickStack에서 이들은 서로 다른 목적을 가지며 서로 다른 시나리오에서 사용할 때 가장 효과적입니다.

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

실질적으로 **프로젝션은 테이블의 추가적인 숨겨진 복사본**으로 볼 수 있으며, 동일한 행을 **서로 다른 물리적 순서**로 저장합니다. 이를 통해 프로젝션은 기본 테이블의 `ORDER BY` 키와는 별도의 자체 기본 인덱스를 가지게 되고, 원래 정렬 방식과 맞지 않는 접근 패턴에 대해서 ClickHouse가 데이터를 더 효과적으로 걸러낼 수 있도록 합니다.

Materialized view는 다른 정렬 키를 가진 별도의 대상 테이블에 행을 명시적으로 기록하여 유사한 효과를 얻을 수 있습니다. 핵심 차이는 **프로젝션은 ClickHouse에 의해 자동으로, 투명하게 관리된다는 점**이며, materialized view는 ClickStack에서 명시적으로 등록하고 선택해야 하는 테이블이라는 점입니다.

쿼리가 기본 테이블을 대상으로 실행되면 ClickHouse는 기본 레이아웃과 사용 가능한 프로젝션들을 평가하고, 각자의 기본 인덱스를 샘플링한 뒤, 올바른 결과를 반환하면서 가장 적은 그래뉼을 읽는 레이아웃을 선택합니다. 이 결정은 쿼리 분석기가 자동으로 수행합니다.

따라서 ClickStack에서 프로젝션은 다음과 같은 **순수한 데이터 재정렬**에 가장 적합합니다.

- 접근 패턴이 기본 primary 키와 근본적으로 다른 경우
- 단일 정렬 키로 모든 워크플로를 포괄하기가 비현실적인 경우
- ClickHouse가 최적의 물리 레이아웃을 투명하게 선택하도록 하고 싶은 경우

사전 집계 및 메트릭 가속을 위해 ClickStack은 애플리케이션 계층이 뷰 선택과 사용을 완전히 제어할 수 있는 **명시적인 materialized view** 사용을 강력히 권장합니다.

추가적인 배경 지식은 다음을 참고하십시오.

- [프로젝션 가이드](/data-modeling/projections)
- [프로젝션을 사용할 때](/data-modeling/projections#when-to-use-projections)
- [Materialized view와 프로젝션 비교](/managing-data/materialized-views-versus-projections)

### 프로젝션 예시 \{#example-projections\}

traces 테이블이 기본 ClickStack 접근 패턴에 맞춰 최적화되어 있다고 가정합니다:

```sql
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
```

TraceId로 필터링하는 주된 워크플로(또는 TraceId를 기준으로 자주 그룹화하고 필터링하는 워크플로)가 있는 경우, TraceId와 시간 기준으로 정렬된 행을 저장하는 projection을 추가할 수 있습니다:

```sql
ALTER TABLE otel_v2.otel_traces
ADD PROJECTION prj_traceid_time
(
    SELECT *
    ORDER BY (TraceId, toDateTime(Timestamp))
);
```

:::note 와일드카드를 사용하십시오
위의 예시 프로젝션에서는 와일드카드(`SELECT *`)가 사용됩니다. 컬럼의 일부만 선택하면 쓰기 오버헤드는 줄어들 수 있지만, 해당 컬럼만으로 완전히 처리할 수 있는 쿼리만 프로젝션을 사용할 수 있으므로 프로젝션의 사용 가능 범위가 제한됩니다. ClickStack에서는 이로 인해 프로젝션 사용이 매우 제한적인 일부 경우로 국한되는 일이 많습니다. 이러한 이유로 일반적으로는 적용 범위를 최대화하기 위해 와일드카드를 사용할 것을 권장합니다.
:::

다른 데이터 레이아웃 변경과 마찬가지로 프로젝션은 새로 기록되는 파트에만 영향을 줍니다. 기존 데이터에 대해 프로젝션을 적용하려면 이를 구체화하십시오:

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE PROJECTION prj_traceid_time;
```

:::note
프로젝션을 머티리얼라이즈하는 작업은 오랜 시간이 걸리고 상당한 리소스를 소모할 수 있습니다. 관측성 데이터는 일반적으로 TTL을 통해 만료되므로, 이는 정말로 필요할 때만 수행해야 합니다. 대부분의 경우, 프로젝션을 새로 수집되는 데이터에만 적용하도록 두는 것으로 충분하며, 이렇게 하면 최근 24시간과 같이 가장 자주 쿼리되는 시간 범위를 최적화할 수 있습니다.
:::

ClickHouse는 프로젝션이 기본 레이아웃보다 더 적은 그래뉼을 스캔할 것으로 예상될 때 프로젝션을 자동으로 선택할 수 있습니다. 프로젝션은 전체 행 집합(`SELECT *`)의 단순한 재정렬을 표현하고, 쿼리 필터가 프로젝션의 `ORDER BY`와 밀접하게 일치할 때 가장 신뢰성이 높습니다.

TraceId에 대한 필터(특히 동등 조건)를 사용하고 시간 범위를 포함하는 쿼리는 위의 프로젝션으로부터 이점을 얻을 수 있습니다. 예를 들면 다음과 같습니다.

```sql
-- Fetch a specific trace quickly
SELECT *
FROM otel_traces
WHERE TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974'
  AND Timestamp >= now() - INTERVAL 1 DAY
ORDER BY Timestamp;

-- Trace-scoped aggregation
SELECT
  toStartOfMinute(Timestamp) AS t,
  count() AS spans
FROM otel_traces
WHERE TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974'
  AND Timestamp >= now() - INTERVAL 1 DAY
GROUP BY t
ORDER BY t;
```

`TraceId`를 제한하지 않거나 프로젝션의 정렬 키에서 선행하지 않는 다른 차원을 주로 필터링하는 쿼리는 일반적으로 성능 향상을 얻지 못하며(대신 기본 레이아웃을 통해 읽게 될 수 있습니다).

:::note
프로젝션은 집계 결과도 저장할 수 있으며(구체화된 뷰(materialized view)와 유사합니다). 그러나 ClickStack에서는 일반적으로 프로젝션 기반 집계를 권장하지 않습니다. 선택이 ClickHouse analyzer에 의존하며, 사용을 제어하고 이해하기가 더 어려울 수 있기 때문입니다. 대신 ClickStack이 애플리케이션 계층에서 명시적으로 등록하고 선택할 수 있는 구체화된 뷰(materialized view)를 사용하는 것이 좋습니다.
:::

실제 운영 환경에서는 프로젝션이 넓은 범위의 검색에서 자주 트레이스 중심의 드릴다운으로 전환하는 워크플로(예: 특정 `TraceId`에 대한 모든 span을 가져오는 경우)에 가장 적합합니다.


### 비용과 안내 \{#projection-costs-and-guidance\}

- **삽입 오버헤드**: 서로 다른 정렬 키를 가진 `SELECT *` 프로젝션은 사실상 데이터를 두 번 기록하는 것이므로, 쓰기 I/O가 증가하고 수집을 지속하기 위해 추가 CPU 및 디스크 처리량이 필요할 수 있습니다.
- **절제된 사용**: 프로젝션은 두 번째 물리적 정렬을 통해 많은 쿼리에서 의미 있는 프루닝을 제공할 수 있을 정도로 액세스 패턴이 실제로 다양할 때 사용하는 것이 가장 좋습니다. 예를 들어 두 팀이 동일한 데이터셋을 근본적으로 다른 방식으로 쿼리하는 경우입니다.
- **벤치마크로 검증**: 모든 튜닝과 마찬가지로, 프로젝션을 추가하고 materialize하기 전후의 실제 쿼리 지연 시간과 리소스 사용량을 비교해야 합니다.

자세한 배경 설명은 다음을 참고하십시오.

- [ClickHouse 프로젝션 가이드](/data-modeling/projections#when-to-use-projections)
- [Materialized view와 프로젝션 비교](/managing-data/materialized-views-versus-projections)

### `_part_offset`를 사용하는 경량 프로젝션 \{#lightweight-projections\}

<BetaBadge/>

:::note[경량 프로젝션은 ClickStack에서 베타 기능입니다]
`_part_offset` 기반 경량 프로젝션은 ClickStack 워크로드에는 권장되지 않습니다. 저장소와 쓰기 I/O는 줄어들지만, 쿼리 시 더 많은 랜덤 액세스를 야기할 수 있으며, 관측성 규모의 프로덕션 환경에서의 동작은 아직 평가 중입니다. 이 기능이 성숙해지고 운영 데이터를 더 많이 확보하면 이 권장 사항은 변경될 수 있습니다.
:::

최근 ClickHouse 버전에서는 전체 행을 중복 저장하는 대신, 프로젝션 정렬 키와 기본 테이블에 대한 `_part_offset` 포인터만 저장하는 보다 경량인 프로젝션도 지원합니다. 이를 통해 저장소 오버헤드를 크게 줄일 수 있으며, 최근 개선으로 그래뉼(granule) 수준 프루닝이 가능해져 실제 보조 인덱스에 더 가깝게 동작합니다. 자세한 내용은 다음을 참고하십시오.

- [Smarter storage with _part_offset](/data-modeling/projections#smarter_storage_with_part_offset)
- [Blog explanation and examples](https://clickhouse.com/blog/projections-secondary-indices#example-combining-multiple-projection-indexes)

### 대안 \{#projection-alternatives\}

여러 개의 정렬 키가 필요하다면, 프로젝션만이 유일한 옵션은 아닙니다. 운영 제약 사항과 ClickStack에서 쿼리를 라우팅하려는 방식에 따라 다음을 고려하십시오.

- OpenTelemetry collector를 구성하여 서로 다른 `ORDER BY` 키를 가진 두 개의 테이블에 쓰도록 하고, 각 테이블에 대해 별도의 ClickStack 소스를 생성하십시오.
- materialized view를 복사 파이프라인(copy pipeline)으로 생성하십시오. 즉, 기본 테이블에 materialized view를 연결하여 원시 행을 다른 정렬 키를 가진 보조 테이블로 선택하도록 합니다(비정규화 또는 라우팅 패턴). 이 대상 테이블에 대한 소스를 생성하십시오. 예시는 [여기](/materialized-view/incremental-materialized-view#filtering-and-transformation)에서 확인할 수 있습니다.