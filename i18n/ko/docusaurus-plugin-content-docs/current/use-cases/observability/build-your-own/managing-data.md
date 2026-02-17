---
title: '데이터 관리'
description: '관측성을 위한 데이터 관리'
slug: /observability/managing-data
keywords: ['관측성', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# 데이터 관리 \{#managing-data\}

관측성을 위해 ClickHouse를 배포하면 관리가 필요한 대용량 데이터셋이 필연적으로 수반됩니다. ClickHouse는 이러한 데이터 관리를 지원하는 다양한 기능을 제공합니다.

## 파티션 \{#partitions\}

ClickHouse에서 파티션을 사용하면 데이터를 특정 컬럼이나 SQL 표현식에 따라 디스크 상에서 논리적으로 분리할 수 있습니다. 데이터를 논리적으로 분리하면 각 파티션을 예를 들어 삭제와 같은 작업을 독립적으로 수행할 수 있습니다. 이를 통해 파티션, 즉 데이터의 하위 집합을 스토리지 계층 간에 효율적으로 이동하거나, 시간 기준으로 [데이터를 만료/클러스터에서 효율적으로 삭제](/sql-reference/statements/alter/partition)할 수 있습니다.

파티션은 테이블을 처음 정의할 때 `PARTITION BY` 절을 통해 지정합니다. 이 절에는 하나 이상의 컬럼에 대한 SQL 표현식을 포함할 수 있으며, 이 표현식의 결과에 따라 각 행이 어떤 파티션으로 전송될지 결정됩니다.

<Image img={observability_14} alt="Partitions" size="md" />

데이터 파트는 디스크 상에서 각 파티션과 공통 폴더 이름 접두사를 통해 논리적으로 연관되며, 개별적으로 쿼리할 수 있습니다. 아래 예시에서 기본 `otel_logs` 스키마는 `toDate(Timestamp)` 표현식을 사용하여 일 단위로 파티션을 나눕니다. 행이 ClickHouse에 삽입될 때마다 이 표현식이 각 행에 대해 평가되고, 해당 일자의 파티션이 존재하면 그 파티션으로 라우팅됩니다(해당 행이 그 날짜의 첫 번째 행이면, 그 날짜에 대한 파티션이 새로 생성됩니다).

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

파티션에 대해 수행할 수 있는 [여러 가지 작업](/sql-reference/statements/alter/partition)이 있습니다. 여기에는 [백업](/sql-reference/statements/alter/partition#freeze-partition), [컬럼 조작](/sql-reference/statements/alter/partition#clear-column-in-partition), 행 단위로 데이터를 [변경](/sql-reference/statements/alter/partition#update-in-partition)/[삭제](/sql-reference/statements/alter/partition#delete-in-partition)하는 뮤테이션, 그리고 [인덱스 정리(예: 보조 인덱스)](/sql-reference/statements/alter/partition#clear-index-in-partition)가 포함됩니다.

예를 들어, `otel_logs` 테이블이 일 단위로 파티션이 구성되어 있다고 가정합니다. 구조화된 로그 데이터셋을 적재하면 이 테이블에는 며칠치 데이터가 포함됩니다.

```sql
SELECT Timestamp::Date AS day,
         count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-26 │ 1986456 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

5 rows in set. Elapsed: 0.058 sec. Processed 10.37 million rows, 82.92 MB (177.96 million rows/s., 1.42 GB/s.)
Peak memory usage: 4.41 MiB.
```

현재 파티션은 시스템 테이블에 대한 간단한 쿼리로 확인할 수 있습니다:

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'otel_logs'

┌─partition──┐
│ 2019-01-22 │
│ 2019-01-23 │
│ 2019-01-24 │
│ 2019-01-25 │
│ 2019-01-26 │
└────────────┘

5 rows in set. Elapsed: 0.005 sec.
```

오래된 데이터를 저장하기 위해 `otel_logs_archive`라는 또 다른 테이블을 둘 수 있습니다. 데이터는 파티션 단위로 이 테이블로 효율적으로 이동할 수 있으며, 이는 메타데이터만 변경하는 작업입니다.


```sql
CREATE TABLE otel_logs_archive AS otel_logs
--move data to archive table
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--confirm data has been moved
SELECT
        Timestamp::Date AS day,
        count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

4 rows in set. Elapsed: 0.051 sec. Processed 8.38 million rows, 67.03 MB (163.52 million rows/s., 1.31 GB/s.)
Peak memory usage: 4.40 MiB.

SELECT Timestamp::Date AS day,
        count() AS c
FROM otel_logs_archive
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-26 │ 1986456 │
└────────────┴─────────┘

1 row in set. Elapsed: 0.024 sec. Processed 1.99 million rows, 15.89 MB (83.86 million rows/s., 670.87 MB/s.)
Peak memory usage: 4.99 MiB.
```

이는 다른 기법들과 대조적입니다. 다른 기법들은 `INSERT INTO SELECT`를 사용하여 데이터를 새로운 대상 테이블로 다시 기록해야 합니다.

:::note 파티션 이동
[테이블 간 파티션 이동](/sql-reference/statements/alter/partition#move-partition-to-table)을 수행하려면 여러 조건을 충족해야 하며, 특히 테이블의 구조, 파티션 키, 기본 키, 인덱스/프로젝션이 동일해야 합니다. `ALTER` DDL에서 파티션을 지정하는 방법에 대한 자세한 내용은 [여기](/sql-reference/statements/alter/partition#how-to-set-partition-expression)를 참고하십시오.
:::

또한 데이터는 파티션 단위로 효율적으로 삭제할 수 있습니다. 이는 다른 기법들(뮤테이션 또는 경량한 삭제)에 비해 훨씬 더 리소스를 효율적으로 사용하므로, 이러한 방식을 우선적으로 사용하는 것이 좋습니다.

```sql
ALTER TABLE otel_logs
        (DROP PARTITION tuple('2019-01-25'))

SELECT
        Timestamp::Date AS day,
        count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC
┌────────day─┬───────c─┐
│ 2019-01-22 │ 4667954 │
│ 2019-01-23 │ 4653388 │
│ 2019-01-24 │ 3792510 │
└────────────┴─────────┘
```

:::note
이 기능은 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 설정을 사용하는 경우 TTL에서 활용됩니다. 자세한 내용은 [TTL을 사용한 데이터 관리](#data-management-with-ttl-time-to-live)를 참조하십시오.
:::


### Applications \{#applications\}

위 예시는 데이터를 파티션 단위로 효율적으로 이동하고 조작하는 방법을 보여 줍니다. 실제 환경에서는 관측성 활용 사례에서 다음 두 가지 시나리오에서 파티션 연산을 가장 자주 사용하게 됩니다:

- **계층형 아키텍처** - 스토리지 계층 간에 데이터를 이동하여([Storage tiers](#storage-tiers) 참고), 핫-콜드 아키텍처를 구성할 수 있습니다.
- **효율적인 삭제** - 데이터가 지정된 TTL에 도달했을 때 데이터를 삭제하는 것([Data management with TTL](#data-management-with-ttl-time-to-live) 참고)

아래에서는 이 두 가지를 자세히 살펴봅니다.

### 쿼리 성능 \{#query-performance\}

파티션은 쿼리 성능 향상에 도움이 될 수 있지만, 이는 액세스 패턴에 크게 의존합니다. 쿼리가 소수의 파티션(이상적으로는 하나)만을 대상으로 하는 경우, 성능이 향상될 수 있습니다. 다만 이는 일반적으로 파티셔닝 키가 기본 키에 포함되어 있지 않고 해당 키로 필터링하는 경우에만 유용합니다. 반대로, 많은 파티션을 걸쳐야 하는 쿼리는 파티셔닝을 사용하지 않을 때보다 성능이 더 나빠질 수 있습니다(파트 수가 더 많아질 수 있기 때문입니다). 단일 파티션만을 대상으로 할 때의 이점은, 파티셔닝 키가 이미 기본 키의 앞부분에 있는 경우에는 효과가 거의 없거나 전혀 없을 수 있습니다. 또한, 각 파티션 내 값이 유일하다면, 파티셔닝은 [GROUP BY 쿼리 최적화](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)에 활용할 수 있습니다. 그러나 일반적으로는 기본 키가 최적화되어 있는지 먼저 확인하고, 접근 패턴이 데이터의 특정 예측 가능한 하위 집합에만 집중되는 예외적인 상황(예: 일 단위로 파티셔닝하고 대부분의 쿼리가 마지막 1일에 집중되는 경우)에서만 쿼리 최적화 기법으로서 파티셔닝을 고려하는 것이 좋습니다. 이러한 동작의 예시는 [여기](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)를 참고하십시오.

## TTL (Time-to-live)을 활용한 데이터 관리 \{#data-management-with-ttl-time-to-live\}

Time-to-Live (TTL)은 ClickHouse 기반 관측성 솔루션에서, 방대한 양의 데이터가 지속적으로 생성되는 환경에서 효율적인 데이터 보존 및 관리를 위해 매우 중요한 기능입니다. ClickHouse에서 TTL을 구현하면 오래된 데이터를 자동으로 만료시키고 삭제하여, 수동 개입 없이도 스토리지를 최적으로 사용하고 성능을 유지할 수 있습니다. 이러한 기능은 데이터베이스를 슬림하게 유지하고 스토리지 비용을 절감하며, 가장 관련성이 높고 최신 데이터에 집중함으로써 쿼리 속도와 효율성을 보장하는 데 필수적입니다. 또한 데이터 수명 주기를 체계적으로 관리하여 데이터 보존 정책을 준수할 수 있도록 도와주며, 이를 통해 관측성 솔루션의 전반적인 지속 가능성과 확장성을 향상합니다.

TTL은 ClickHouse에서 테이블 수준 또는 컬럼 수준으로 지정할 수 있습니다.

### 테이블 수준 TTL \{#table-level-ttl\}

로그와 트레이스 모두에 대한 기본 스키마에는 지정된 기간 이후 데이터를 자동으로 만료하는 TTL이 포함됩니다. 이는 ClickHouse exporter에서 `ttl` 키 아래에 예를 들어 다음과 같이 지정합니다.

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

이 구문은 현재 [Golang Duration 구문](https://pkg.go.dev/time#ParseDuration)을 지원합니다. **`h`를 사용하고, 이 값이 파티셔닝 주기와 일치하도록 설정할 것을 권장합니다. 예를 들어 일 단위로 파티션하는 경우 24h, 48h, 72h처럼 일 수의 배수가 되도록 설정하십시오.** 이렇게 하면 `ttl: 96h`와 같이 설정한 경우 테이블에 TTL 절이 자동으로 추가됩니다.

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

기본적으로 만료된 TTL이 있는 데이터는 ClickHouse가 [데이터 파트 병합](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)을 수행할 때 제거됩니다. ClickHouse가 데이터 만료를 감지하면, 예정되지 않은 병합을 수행합니다.

:::note Scheduled TTLs
TTL은 위에서 언급한 것처럼 즉시 적용되지 않고 일정에 따라 적용됩니다. MergeTree 테이블 설정 `merge_with_ttl_timeout`은 삭제 TTL을 사용하는 병합을 다시 수행하기 전까지의 최소 지연 시간을 초 단위로 설정합니다. 기본값은 14400초(4시간)입니다. 하지만 이는 최소 지연 시간일 뿐이며, TTL 병합이 트리거될 때까지 더 오래 걸릴 수 있습니다. 값이 너무 낮으면 예정되지 않은 병합이 자주 수행되어 많은 리소스를 소모할 수 있습니다. `ALTER TABLE my_table MATERIALIZE TTL` 명령을 사용하여 TTL 만료를 강제로 수행할 수 있습니다.
:::

**중요: 설정 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 사용을 권장합니다** (기본 스키마에서 적용됨). 이 설정이 활성화되면, ClickHouse는 해당 파트 안의 모든 행이 만료된 경우 전체 파트를 드롭합니다. 이는 (`ttl_only_drop_parts=0`일 때 리소스를 많이 사용하는 뮤테이션을 통해 수행되는) TTL이 적용된 행의 부분 정리 대신 전체 파트를 드롭하는 방식으로, 더 짧은 `merge_with_ttl_timeout` 시간 설정과 더 낮은 시스템 성능 영향을 가능하게 합니다. 데이터가 TTL 만료를 수행하는 단위(예: 일 단위)와 동일한 기준으로 파티션되어 있으면, 각 파트에는 자연스럽게 정의된 구간의 데이터만 포함됩니다. 이렇게 하면 `ttl_only_drop_parts=1`을 효율적으로 적용할 수 있습니다.


### 컬럼 수준 TTL \{#column-level-ttl\}

위 예시는 테이블 수준에서 데이터를 만료합니다. 데이터는 컬럼 수준에서도 만료할 수 있습니다. 데이터가 오래될수록, 조사 과정에서의 활용 가치에 비해 보존을 위한 리소스 오버헤드가 정당화되지 않는 컬럼을 제거하는 데 이 기능을 사용할 수 있습니다. 예를 들어, 새로운 Kubernetes 레이블과 같이 적재 시점에 추출되지 않은 새로운 동적 메타데이터가 추가되는 경우를 대비해 `Body` 컬럼을 보존하는 것을 권장합니다. 1개월과 같은 일정 기간이 지난 후에는 이러한 추가 메타데이터가 유용하지 않다는 것이 명확해질 수 있으며, 이 경우 `Body` 컬럼을 계속 보존하는 가치는 제한적일 수 있습니다.

아래에서는 `Body` 컬럼을 30일 후에 제거하는 방법을 보여줍니다.

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
컬럼 수준 TTL을 지정하려면 사용자가 직접 스키마를 정의해야 합니다. 이 설정은 OTel collector에서 지정할 수 없습니다.
:::


## 데이터 재압축 \{#recompressing-data\}

관측성 데이터셋에는 일반적으로 `ZSTD(1)` 사용을 권장하지만, 다른 압축 알고리즘이나 더 높은 압축 수준(예: `ZSTD(3)`)을 시도해 볼 수 있습니다. 스키마 생성 시 이를 지정할 수 있을 뿐만 아니라, 일정 기간이 지난 후 압축 방식을 변경하도록 설정할 수도 있습니다. 코덱이나 압축 알고리즘이 더 나은 압축률을 제공하지만 쿼리 성능을 저하시키는 경우에 이러한 설정이 적절할 수 있습니다. 이러한 트레이드오프는 조회 빈도가 낮은 오래된 데이터에는 허용될 수 있지만, 조사 시 더 자주 사용되는 최신 데이터에는 적절하지 않을 수 있습니다.

아래 예시는 데이터를 삭제하는 대신 4일 후 `ZSTD(3)`을 사용하여 데이터를 다시 압축하는 방법을 보여 줍니다.

```sql
CREATE TABLE default.otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
TTL Timestamp + INTERVAL 4 DAY RECOMPRESS CODEC(ZSTD(3))
```

:::note 성능 평가
항상 서로 다른 압축 수준과 알고리즘이 데이터 삽입 및 쿼리 성능에 미치는 영향을 함께 평가할 것을 권장합니다. 예를 들어, 델타 코덱은 타임스탬프를 압축하는 데 유용할 수 있습니다. 그러나 이것이 기본 키의 일부인 경우 필터링 성능이 저하될 수 있습니다.
:::

TTL 구성에 대한 자세한 내용과 예시는 [여기](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)에서 확인할 수 있습니다. 테이블 및 컬럼에 TTL을 추가하거나 수정하는 방법 등의 예시는 [여기](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)에서 확인할 수 있습니다. TTL이 hot-warm 아키텍처와 같은 스토리지 계층 구조를 어떻게 구현하는지에 대해서는 [Storage tiers](#storage-tiers)를 참고하십시오.


## 스토리지 계층 \{#storage-tiers\}

ClickHouse에서는 서로 다른 디스크에 스토리지 계층을 생성할 수 있습니다. 예를 들어, 최근/핫 데이터는 SSD에, 오래된 데이터는 S3에 저장하는 방식입니다. 이 아키텍처를 사용하면, 조사에 자주 사용되지 않아 더 느린 쿼리 SLA를 허용할 수 있는 오래된 데이터에는 비용이 더 저렴한 스토리지를 사용할 수 있습니다.

:::note ClickHouse Cloud에는 해당 없음
ClickHouse Cloud는 S3에 저장된 단일 데이터 사본과 SSD 기반 노드 캐시를 사용합니다. 따라서 ClickHouse Cloud에서는 스토리지 계층이 필요하지 않습니다.
:::

스토리지 계층을 생성하려면 사용자가 먼저 디스크를 생성한 후, 이를 사용해 스토리지 정책을 정의하고, 테이블 생성 시 지정할 수 있는 볼륨을 구성해야 합니다. 데이터는 디스크의 사용량 비율, 파트 크기, 볼륨 우선순위에 따라 디스크 간에 자동으로 이동될 수 있습니다. 자세한 내용은 [여기](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)를 참조하십시오.

데이터는 `ALTER TABLE MOVE PARTITION` 명령을 사용하여 디스크 간에 수동으로 이동할 수 있지만, 볼륨 간 데이터 이동은 TTL을 사용해 제어할 수도 있습니다. 전체 예제는 [여기](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)에서 확인할 수 있습니다.

## 스키마 변경 관리 \{#managing-schema-changes\}

로그 및 트레이스 스키마는 시스템의 전체 수명 동안 필연적으로 변경됩니다. 예를 들어 서로 다른 메타데이터나 파드 레이블을 가진 신규 시스템을 모니터링하게 되는 경우가 있습니다. OTel 스키마를 사용해 데이터를 생성하고, 원본 이벤트 데이터를 구조화된 형식으로 캡처하면 ClickHouse 스키마는 이러한 변경에도 견고하게 유지됩니다. 다만 새로운 메타데이터가 추가되고 쿼리 조회 패턴이 바뀌면, 이러한 변화를 반영하도록 스키마를 업데이트할 필요가 있습니다.

스키마 변경 중 다운타임을 방지하기 위해, 아래와 같은 여러 가지 옵션을 사용할 수 있습니다.

### 기본값 사용 \{#use-default-values\}

컬럼은 [`DEFAULT` 값](/sql-reference/statements/create/table#default)을 사용하여 스키마에 추가할 수 있습니다. 지정된 기본값은 INSERT 시에 값이 지정되지 않은 경우 사용됩니다.

스키마 변경은 materialized view 변환 로직이나 이러한 새 컬럼을 전송하도록 하는 OTel collector 설정을 수정하기 전에 수행할 수 있습니다.

스키마가 변경된 후에는 OTel collector를 다시 구성할 수 있습니다. OTel collector가 데이터를 Null table engine으로 전송하고, materialized view가 대상 스키마를 추출하여 결과를 저장용 대상 테이블로 전송하는 역할을 하도록 「[Extracting structure with SQL](/docs/use-cases/observability/schema-design#extracting-structure-with-sql)」에 설명된 권장 프로세스를 사용한다고 가정하면, [`ALTER TABLE ... MODIFY QUERY` 구문](/sql-reference/statements/alter/view)을 사용하여 뷰를 수정할 수 있습니다. 아래와 같이, OTel 구조화 로그에서 대상 스키마를 추출하기 위해 (「Extracting structure with SQL」에서 사용된 것과 유사한) 해당 materialized view가 연결된 대상 테이블이 있다고 가정해 보겠습니다:

```sql
CREATE TABLE default.otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)

CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

`LogAttributes`에서 새로운 컬럼 `Size`를 추출하려 한다고 가정합니다. `ALTER TABLE`을 사용하여 기본값을 지정해 이 컬럼을 스키마에 추가할 수 있습니다:

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

위 예제에서는 기본값을 `LogAttributes`의 `size` 키로 지정합니다(해당 키가 없으면 0이 됩니다). 이는 이 컬럼에 접근하는 쿼리가 값이 삽입되지 않은 행에 대해서는 맵을 조회해야 하므로, 그만큼 더 느려진다는 의미입니다. 대신 0과 같은 상수로 간단히 지정할 수도 있으며, 이렇게 하면 값이 없는 행에 대해 이후에 실행되는 쿼리의 비용을 줄일 수 있습니다. 이 테이블을 쿼리해 보면 맵에서 기대한 대로 값이 채워져 있음을 확인할 수 있습니다.

```sql
SELECT Size
FROM otel_logs_v2
LIMIT 5
┌──Size─┐
│ 30577 │
│  5667 │
│  5379 │
│  1696 │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.012 sec.
```

향후 입력되는 모든 데이터에 이 값이 삽입되도록 하려면, 아래와 같이 `ALTER TABLE` 구문을 사용하여 materialized view를 수정합니다:


```sql
ALTER TABLE otel_logs_mv
        MODIFY QUERY
SELECT
        Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300,                 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

이후에 삽입되는 행에서는 삽입 시점에 `Size` 컬럼이 채워지게 됩니다.


### 새 테이블 생성 \{#create-new-tables\}

위 과정의 대안으로, 새 스키마를 사용하는 새 대상 테이블을 생성하면 됩니다. 그런 다음 모든 materialized view를 위의 `ALTER TABLE MODIFY QUERY`를 사용하여 새 테이블을 참조하도록 수정할 수 있습니다. 이 방법을 사용하면 `otel_logs_v3`와 같이 테이블에 버전을 붙일 수 있습니다.

이 방식은 사용자가 쿼리해야 하는 여러 개의 테이블을 남기게 됩니다. 여러 테이블에 걸쳐 쿼리하려면, 테이블 이름에 와일드카드 패턴을 허용하는 [`merge` function](/sql-reference/table-functions/merge)을 사용할 수 있습니다. 아래 예에서는 `otel_logs` 테이블의 v2와 v3를 대상으로 쿼리하는 방법을 보여 줍니다:

```sql
SELECT Status, count() AS c
FROM merge('otel_logs_v[2|3]')
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.137 sec. Processed 41.46 million rows, 82.92 MB (302.43 million rows/s., 604.85 MB/s.)
```

사용자가 `merge` 함수를 사용하지 않고 여러 테이블을 결합한 단일 테이블을 엔드 사용자에게 제공하고자 하는 경우 [Merge 테이블 엔진](/engines/table-engines/special/merge)을 사용할 수 있습니다. 아래에서 이를 예제로 보여 줍니다:

```sql
CREATE TABLE otel_logs_merged
ENGINE = Merge('default', 'otel_logs_v[2|3]')

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.073 sec. Processed 41.46 million rows, 82.92 MB (565.43 million rows/s., 1.13 GB/s.)
```

새로운 테이블이 추가될 때마다 `EXCHANGE` 테이블 구문을 사용하여 이를 언제든지 업데이트할 수 있습니다. 예를 들어 v4 테이블을 추가하려면 새 테이블을 생성한 후, 이를 이전 버전 테이블과 원자적으로 교환할 수 있습니다.

```sql
CREATE TABLE otel_logs_merged_temp
ENGINE = Merge('default', 'otel_logs_v[2|3|4]')

EXCHANGE TABLE otel_logs_merged_temp AND otel_logs_merged

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 39259996 │
│   304  │  1378564 │
│   302  │   820118 │
│   404  │   429220 │
│   301  │   276960 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.068 sec. Processed 42.46 million rows, 84.92 MB (620.45 million rows/s., 1.24 GB/s.)
```
