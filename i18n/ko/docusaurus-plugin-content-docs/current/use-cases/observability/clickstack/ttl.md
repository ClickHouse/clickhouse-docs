---
'slug': '/use-cases/observability/clickstack/ttl'
'title': 'TTL 관리'
'sidebar_label': 'TTL 관리'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack으로 TTL 관리'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'ttl'
- 'data retention'
- 'lifecycle'
- 'storage management'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

## ClickStack의 TTL {#ttl-clickstack}

Time-to-Live (TTL)은 ClickStack에서 효율적인 데이터 보존 및 관리를 위한 중요한 기능으로, 방대한 양의 데이터가 지속적으로 생성되는 상황에서 특히 필요합니다. TTL은 오래된 데이터를 자동으로 만료하고 삭제할 수 있도록 하여 저장 공간이 최적화되고 성능이 수동적인 개입 없이 유지될 수 있도록 합니다. 이 기능은 데이터베이스를 슬림하게 유지하고 저장 비용을 줄이며, 가장 관련성이 높은 최신 데이터에 초점을 맞춤으로써 쿼리가 빠르고 효율적으로 유지되도록 하는 데 필수적입니다. 또한, 데이터 생애 주기를 체계적으로 관리함으로써 데이터 보존 정책 준수에도 도움이 되어, 관찰 가능성 솔루션의 전반적인 지속 가능성과 확장성을 향상시킵니다.

**기본적으로 ClickStack은 데이터를 3일 동안 보존합니다. 이를 수정하려면 ["Modifying TTL"](#modifying-ttl)를 참조하십시오.**

TTL은 ClickHouse에서 테이블 수준에서 제어됩니다. 예를 들어, 로그에 대한 스키마는 아래와 같이 표시됩니다:

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
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

ClickHouse의 파티셔닝은 데이터를 컬럼 또는 SQL 표현식에 따라 디스크에서 논리적으로 분리할 수 있게 합니다. 데이터를 논리적으로 분리함으로써 각 파티션은 독립적으로 작업할 수 있으며, 예를 들어 TTL 정책에 따라 만료될 때 삭제될 수 있습니다.

위의 예에서 보여준 바와 같이, 파티셔닝은 `PARTITION BY` 절을 사용하여 테이블이 처음 정의될 때 지정됩니다. 이 절은 컬럼/컬럼에 대한 SQL 표현식을 포함할 수 있으며, 이 표현식의 결과는 행이 전송될 파티션을 정의합니다. 이는 데이터가 디스크에서 각 파티션과 논리적으로 연관되어(공통 폴더 이름 접두사를 통해) 격리되어 쿼리될 수 있음을 의미합니다. 위의 예에서 기본 `otel_logs` 스키마는 `toDate(Timestamp)` 표현식을 사용하여 하루 단위로 파티션을 나눕니다. ClickHouse에 행이 삽입될 때 이 표현식은 각 행에 대해 평가되고, 결과 파티션이 존재할 경우 해당 파티션으로 라우팅됩니다(하루의 첫 번째 행인 경우 파티션이 생성됨). 파티셔닝 및 그 다른 응용 프로그램에 대한 자세한 내용은 ["Table Partitions"](/partitions)를 참조하십시오.

<Image img={observability_14} alt="Partitions" size="lg"/>

테이블 스키마에는 또한 `TTL TimestampTime + toIntervalDay(3)` 및 설정 `ttl_only_drop_parts = 1`이 포함됩니다. 첫 번째 절은 데이터가 3일을 초과하면 삭제되도록 보장합니다. 설정 `ttl_only_drop_parts = 1`은 모든 데이터가 만료된 데이터 파트만 삭제되도록 강제합니다(부분적으로 행을 삭제하려는 시도와 비교하여). 파티셔닝이 서로 다른 날의 데이터가 결코 "병합"되지 않도록 보장하므로 데이터를 효율적으로 삭제할 수 있습니다.

:::important `ttl_only_drop_parts`
항상 설정 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)을 사용하는 것을 권장합니다. 이 설정이 활성화되면, ClickHouse는 모든 행이 만료된 경우 전체 파트를 삭제합니다. 전체 파트를 삭제하는 대신 부분적으로 TTL이 만료된 행을 청소하는 것은(`ttl_only_drop_parts=0`일 때 발생하는 자원 집약적인 변형을 통해) 짧은 `merge_with_ttl_timeout` 시간을 유지하고 시스템 성능에 대한 영향을 줄일 수 있습니다. 데이터가 TTL 만료를 수행하는 단위에서 파티셔닝되어 있을 경우(예: 하루), 파트는 자연스럽게 정의된 간격의 데이터만 포함하게 됩니다. 이렇게 하면 `ttl_only_drop_parts=1`을 효율적으로 적용할 수 있습니다.
:::

기본적으로 만료된 TTL을 가진 데이터는 ClickHouse가 [데이터 파트를 병합할 때](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 제거됩니다. ClickHouse가 데이터가 만료되었음을 감지하면, 일정에 맞지 않는 병합을 수행합니다.

:::note TTL 일정
TTL은 즉시 적용되지 않고 일정에 따라 적용됩니다, 위에서 언급한 바와 같이. MergeTree 테이블 설정 `merge_with_ttl_timeout`은 삭제 TTL을 가진 병합을 반복하기 전에 최소 지연 시간을 초 단위로 설정합니다. 기본값은 14400초(4시간)입니다. 그러나 이는 최소 지연 시간일 뿐이며, TTL 병합이 트리거되는 데 더 오랜 시간이 걸릴 수 있습니다. 값이 너무 낮으면 많은 일정에 맞지 않는 병합이 수행되어 많은 자원을 소모할 수 있습니다. TTL 만료는 `ALTER TABLE my_table MATERIALIZE TTL` 명령을 사용하여 강제로 수행할 수 있습니다.
:::

## TTL 수정하기 {#modifying-ttl}

TTL을 수정하려면 사용자는 다음 방법 중 하나를 선택할 수 있습니다:

1. **테이블 스키마 수정 (권장)**. 이를 위해 ClickHouse 인스턴스에 연결해야 합니다. 예를 들어, [clickhouse-client](/interfaces/cli) 또는 [Cloud SQL Console](/cloud/get-started/sql-console)을 사용할 수 있습니다. 예를 들어, 다음 DDL을 사용하여 `otel_logs` 테이블의 TTL을 수정할 수 있습니다:

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **OTel 수집기 수정**. ClickStack OpenTelemetry 수집기는 테이블이 존재하지 않는 경우 ClickHouse에서 테이블을 생성합니다. 이는 ClickHouse 익스포터를 통해 이루어지며, 이 익스포터는 기본 TTL 표현식을 제어하는 데 사용되는 `ttl` 매개변수를 노출합니다. 예:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### 열 수준 TTL {#column-level-ttl}

위의 예는 테이블 수준에서 데이터를 만료시킵니다. 사용자는 또한 열 수준에서 데이터를 만료시킬 수 있습니다. 데이터가 오래됨에 따라, 조사 시 값이 유지할 리소스 오버헤드에 정당화되지 않는 열을 삭제하는 데 사용할 수 있습니다. 예를 들어, 새 동적 메타데이터가 삽입 시 추출되지 않은 경우, `Body` 컬럼을 유지하는 것을 권장합니다. 예를 들어 Kubernetes의 새로운 라벨이 추가될 수 있습니다. 예를 들어, 1개월 후에는 이 추가 메타데이터가 유용하지 않다는 것이 명확해질 수 있으며 - 따라서 `Body` 컬럼을 유지하는 가치가 제한됩니다.

아래에서는 `Body` 컬럼을 30일 후에 삭제하는 방법을 보여줍니다.

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
열 수준 TTL을 지정하려면 사용자가 자신의 스키마를 지정해야 합니다. 이는 OTel 수집기에서 지정할 수 없습니다.
:::
