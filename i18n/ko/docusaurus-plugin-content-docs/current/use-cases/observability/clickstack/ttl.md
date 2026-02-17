---
slug: /use-cases/observability/clickstack/ttl
title: 'TTL 관리'
sidebar_label: 'TTL 관리'
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 TTL 관리하기'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', '데이터 보존', '수명 주기', '스토리지 관리']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

## ClickStack의 TTL \{#ttl-clickstack\}

Time-to-Live (TTL)은 ClickStack에서 효율적인 데이터 보존 및 관리를 위해 매우 중요한 기능입니다. 특히 방대한 양의 데이터가 지속적으로 생성되는 환경에서 중요합니다. TTL은 오래된 데이터를 자동으로 만료시키고 삭제하여, 수동 개입 없이도 스토리지를 최적으로 활용하고 성능을 유지할 수 있도록 합니다. 이 기능은 데이터베이스를 가볍게 유지하고 저장 비용을 절감하며, 가장 관련성이 높고 최신 데이터에 집중함으로써 쿼리가 빠르고 효율적으로 동작하도록 하는 데 필수적입니다. 또한 데이터 수명 주기를 체계적으로 관리하여 데이터 보존 정책 준수를 돕고, 이를 통해 관측성 솔루션의 전반적인 지속 가능성과 확장성을 향상합니다.

**기본적으로 ClickStack은 데이터를 3일 동안 보존합니다. 이를 변경하려면 [&quot;TTL 수정하기&quot;](#modifying-ttl)를 참조하십시오.**

TTL은 ClickHouse에서 테이블 단위로 제어됩니다. 예를 들어, 로그에 대한 스키마는 아래와 같습니다.

```sql
CREATE TABLE default.otel_logs
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TimestampTime` DateTime DEFAULT toDateTime(Timestamp),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `TraceFlags` UInt8,
    `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
    `SeverityNumber` UInt8,
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `Body` String CODEC(ZSTD(1)),
    `ResourceSchemaUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeSchemaUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` LowCardinality(String) CODEC(ZSTD(1)),
    `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(TimestampTime)
PRIMARY KEY (ServiceName, TimestampTime)
ORDER BY (ServiceName, TimestampTime, Timestamp)
TTL TimestampTime + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

ClickHouse에서 파티셔닝은 데이터를 특정 컬럼 또는 SQL 표현식에 따라 디스크 상에서 논리적으로 분리하도록 합니다. 데이터를 논리적으로 분리하면 각 파티션에 대해 TTL 정책에 따른 만료 시 삭제 등 작업을 서로 독립적으로 수행할 수 있습니다.

위 예시에서 보듯이 파티셔닝은 테이블을 처음 정의할 때 `PARTITION BY` 절을 통해 지정합니다. 이 절에는 하나 이상의 컬럼에 대한 SQL 표현식을 포함할 수 있으며, 이 표현식의 결과에 따라 각 행이 어느 파티션에 저장될지가 결정됩니다. 이로 인해 데이터는 디스크 상에서 각 파티션과 공통 폴더 이름 접두어를 통해 논리적으로 연관되며, 이후 개별적으로 조회할 수 있습니다. 위 예시의 경우 기본 `otel_logs` 스키마는 `toDate(Timestamp)` 표현식을 사용해 하루 단위로 파티션을 나눕니다. 행이 ClickHouse에 삽입될 때마다 이 표현식이 각 행에 대해 평가되고, 해당 결과에 해당하는 파티션이 존재하면 그 파티션으로 라우팅됩니다(해당 날짜의 첫 번째 행이라면 파티션이 생성됩니다). 파티셔닝 및 그 외 활용 사례에 대한 자세한 내용은 [「테이블 파티션(Table Partitions)」](/partitions)을 참조하십시오.

<Image img={observability_14} alt="Partitions" size="lg" />

테이블 스키마에는 `TTL TimestampTime + toIntervalDay(3)`와 `ttl_only_drop_parts = 1` 설정도 포함되어 있습니다. 앞의 절은 데이터가 3일보다 오래되면 삭제되도록 보장합니다. `ttl_only_drop_parts = 1` 설정은 (행을 부분적으로 삭제하려는 대신) 그 안의 모든 데이터가 만료된 데이터 파트만 만료된 것으로 간주해 삭제하도록 강제합니다. 파티셔닝을 통해 서로 다른 날짜의 데이터가 절대 「병합」되지 않도록 보장하면, 데이터를 효율적으로 삭제할 수 있습니다.

:::important `ttl_only_drop_parts`
[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 설정을 항상 사용할 것을 권장합니다. 이 설정이 활성화되면 ClickHouse는 파트 안의 모든 행이 만료되었을 때 전체 파트를 삭제합니다. `ttl_only_drop_parts=0`일 때 리소스를 많이 사용하는 뮤테이션으로 TTL이 적용된 행만 부분적으로 정리하는 대신 전체 파트를 삭제하면, `merge_with_ttl_timeout` 시간을 더 짧게 유지할 수 있고 시스템 성능에 미치는 영향도 줄일 수 있습니다. 데이터가 TTL 만료를 수행하는 단위(예: 일)와 동일한 단위로 파티션되어 있으면, 각 파트는 자연스럽게 정의된 구간의 데이터만 포함하게 됩니다. 이렇게 하면 `ttl_only_drop_parts=1`을 효율적으로 적용할 수 있습니다.
:::

기본적으로, 만료된 TTL을 가진 데이터는 ClickHouse가 [데이터 파트를 병합할 때](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 제거됩니다. ClickHouse가 데이터가 만료되었음을 감지하면, 일정에 없는(off-schedule) 병합을 수행합니다.

:::note TTL 일정
TTL은 즉시 적용되지 않고, 위에서 언급한 것처럼 일정에 따라 적용됩니다. MergeTree 테이블 설정인 `merge_with_ttl_timeout`은 삭제 TTL이 적용된 병합을 반복하기 전까지의 최소 지연 시간을 초 단위로 설정합니다. 기본값은 14400초(4시간)입니다. 하지만 이는 최소 지연 시간일 뿐이며, TTL 병합이 트리거될 때까지 더 오래 걸릴 수 있습니다. 값이 너무 낮으면, 리소스를 많이 소모하는 비정기 병합이 자주 수행될 수 있습니다. `ALTER TABLE my_table MATERIALIZE TTL` 명령을 사용하여 TTL 만료를 강제로 수행할 수 있습니다.
:::

## TTL 수정 \{#modifying-ttl\}

TTL을 수정하는 방법은 다음 두 가지입니다:

1. **테이블 스키마를 수정합니다(권장)**. 이를 위해 [clickhouse-client](/interfaces/cli) 또는 [Cloud SQL Console](/cloud/get-started/sql-console)을 사용하여 ClickHouse 인스턴스에 연결해야 합니다. 예를 들어, 다음 DDL을 사용하여 `otel_logs` 테이블의 TTL을 수정할 수 있습니다:

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **OTel collector를 수정합니다.** ClickStack OpenTelemetry collector는 테이블이 존재하지 않을 경우 ClickHouse에 테이블을 생성합니다. 이는 ClickHouse exporter를 통해 수행되며, 이 exporter는 기본 TTL 식을 제어하기 위한 `ttl` 파라미터를 노출합니다. 예를 들면 다음과 같습니다.

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### 컬럼 수준 TTL \{#column-level-ttl\}

위 예시는 테이블 수준에서 데이터를 만료합니다. 컬럼 수준에서도 데이터를 만료하도록 설정할 수 있습니다. 데이터가 오래될수록, 조사에 기여하는 가치에 비해 보존에 필요한 리소스 오버헤드가 정당화되지 않는 컬럼을 삭제하는 데 활용할 수 있습니다. 예를 들어, 새로운 동적 메타데이터(예: 새로운 Kubernetes 라벨)가 삽입 시점에 아직 추출되지 않은 경우를 대비해 `Body` 컬럼을 유지하는 것을 권장합니다. 예를 들어 1개월과 같은 기간이 지난 후에는 이 추가 메타데이터가 유용하지 않다는 것이 분명해질 수 있으며, 이 경우 `Body` 컬럼을 계속 유지할 가치는 크지 않을 수 있습니다.

아래 예시는 `Body` 컬럼을 30일 이후에 삭제하도록 설정하는 방법을 보여줍니다.

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String TTL Timestamp + INTERVAL 30 DAY,
        `Timestamp` DateTime,
 ...
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note
컬럼 수준 TTL을 지정하려면 스키마를 직접 정의해야 합니다. OTel collector에서는 이를 지정할 수 없습니다.
:::
