---
'title': '데이터 관리'
'description': 'Observability를 위한 데이터 관리'
'slug': '/observability/managing-data'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';



# 데이터 관리

ClickHouse를 이용한 가시성 배포는 항상 대규모 데이터 세트를 포함하며, 이를 관리해야 합니다. ClickHouse는 데이터 관리를 지원하는 여러 기능을 제공합니다.

## 파티션 {#partitions}

ClickHouse에서의 파티셔닝은 데이터를 컬럼이나 SQL 표현식에 따라 디스크에서 논리적으로 분리할 수 있게 해줍니다. 데이터를 논리적으로 분리함으로써 각 파티션은 독립적으로 조작될 수 있으며, 예를 들어 삭제될 수 있습니다. 이는 사용자가 파티션을 이동하고, 따라서 하위 집합을 효율적으로 저장소 계층 간에 이동할 수 있게 해줍니다. 또는 [클러스터에서 데이터를 만료/효율적으로 삭제](/sql-reference/statements/alter/partition)하는 데 사용할 수 있습니다.

파티셔닝은 테이블이 처음 정의될 때 `PARTITION BY` 절을 통해 지정됩니다. 이 절은 결과에 의해 행이 어느 파티션으로 전송될지를 결정하는 SQL 표현식을 포함할 수 있습니다.

<Image img={observability_14} alt="Partitions" size="md"/>

데이터 파트는 디스크의 각 파티션과 논리적으로 연결되어 있으며 (공통 폴더 이름 접두사를 통해), 개별적으로 쿼리할 수 있습니다. 다음 예에서, 기본 `otel_logs` 스키마는 `toDate(Timestamp)` 표현식을 사용하여 날짜별로 파티셔닝됩니다. 행이 ClickHouse에 삽입될 때, 이 표현식은 각 행에 대해 평가되며, 해당하는 파티션이 존재할 경우 그곳으로 라우팅됩니다 (일일 파티션이 처음이면, 파티션이 생성됩니다).

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

[파티션에 대해 수행할 수 있는 여러 가지 작업](/sql-reference/statements/alter/partition)에는 [백업](/sql-reference/statements/alter/partition#freeze-partition), [컬럼 조작](/sql-reference/statements/alter/partition#clear-column-in-partition), 변형 [데이터 수정](/sql-reference/statements/alter/partition#update-in-partition)/[삭제](/sql-reference/statements/alter/partition#delete-in-partition) 및 [인덱스 클리어링 (예: 보조 인덱스)](/sql-reference/statements/alter/partition#clear-index-in-partition)이 포함됩니다.

예를 들어, 만약 우리의 `otel_logs` 테이블이 날짜별로 파티셔닝되어 있다면, 구조화된 로그 데이터 세트로 채워질 경우 여러 일자의 데이터를 포함하게 됩니다:

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

현재 파티션은 간단한 시스템 테이블 쿼리를 사용하여 찾을 수 있습니다:

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

우리는 오래된 데이터를 저장하기 위해 `otel_logs_archive`라는 또 다른 테이블이 있을 수 있습니다. 데이터를 파티션별로 이 테이블로 효율적으로 이동할 수 있습니다 (이는 단지 메타데이터 변경입니다).

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

이는 `INSERT INTO SELECT`를 사용하고 데이터를 새 대상 테이블로 재작성해야 하는 다른 기술과 대조적입니다.

:::note 파티션 이동
[테이블 간 파티션 이동](/sql-reference/statements/alter/partition#move-partition-to-table)을 하려면 여러 조건이 충족되어야 하며, 특히 테이블은 동일한 구조, 파티션 키, 기본 키 및 인덱스/프로젝션을 가져야 합니다. `ALTER` DDL에서 파티션을 지정하는 방법에 대한 자세한 내용은 [여기](https://clickhouse.com/docs/en/sql-reference/statements/alter/partition#how-to-set-partition-expression)에서 찾을 수 있습니다.
:::

또한, 데이터는 파티션별로 효율적으로 삭제할 수 있습니다. 이는 대체 기술(변형 또는 경량 삭제)보다 훨씬 더 자원 효율적이며 선호되어야 합니다.

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
이 기능은 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)이 설정된 경우 TTL에 의해 이용됩니다. 자세한 내용은 [TTL(제한 시간)으로 데이터 관리](#data-management-with-ttl-time-to-live)를 참조하십시오.
:::

### 애플리케이션 {#applications}

위의 예시에서는 데이터를 효율적으로 이동하고 파티셔닝을 통해 조작할 수 있는 방법을 보여줍니다. 현실적으로, 사용자는 가시성 사용 사례에서 두 가지 시나리오에서 파티션 작업을 가장 자주 활용할 것입니다:

- **계층형 아키텍처** - 데이터를 저장소 계층 간에 이동 (자세한 내용은 [저장소 계층](#storage-tiers) 참조), 따라서 핫-콜드 아키텍처를 구축할 수 있습니다.
- **효율적인 삭제** - 데이터가 지정된 TTL에 도달했을 때 (자세한 내용은 [TTL로 데이터 관리](#data-management-with-ttl-time-to-live) 참조)

아래에서 이 두 가지를 자세히 살펴보겠습니다.

### 쿼리 성능 {#query-performance}

파티션은 쿼리 성능에 도움을 줄 수 있지만, 이는 접근 패턴에 크게 의존합니다. 쿼리가 특정 파티션(이상적으로는 하나)만 타겟 할 경우 성능이 향상될 수 있습니다. 이는 주로 파티셔닝 키가 기본 키에 포함되지 않고, 이를 필터링할 때에만 유용합니다. 그러나 많은 파티션을 커버해야 하는 쿼리는 파티셔닝을 사용하지 않는 것보다 성능이 낮아질 수 있습니다 (파트가 더 많을 수 있습니다). 단일 파티션을 타겟 하는 이점은 파티셔닝 키가 이미 기본 키의 초기 항목인 경우에는 더더욱 미미하거나 무의미할 수 있습니다. 파티셔닝은 또한 [GROUP BY 쿼리 최적화](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)에도 사용될 수 있습니다. 그러나 일반적으로 사용자는 기본 키가 최적화되었는지 확인하고, 특정 예외적 사례에서만 파티셔닝을 쿼리 최적화 기법으로 고려해야 합니다. 예를 들어, 일별 파티셔닝을 하여 대부분의 쿼리가 지난 하루에 집중될 때처럼요. 이러한 동작에 대한 예시는 [여기](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)에서 확인할 수 있습니다.

## TTL (제한 시간)으로 데이터 관리 {#data-management-with-ttl-time-to-live}

시간-제한(Time-to-Live, TTL)은 ClickHouse에 의해 구동되는 가시성 솔루션에서 효율적인 데이터 유지 및 관리에 있어 매우 중요한 기능으로, 특히 방대한 양의 데이터가 지속적으로 생성되고 있기 때문입니다. ClickHouse에서 TTL을 구현하면 오래된 데이터의 자동 만료 및 삭제가 가능하여 저장소를 최적으로 사용하고 성능을 유지할 수 있게 하며, 수동 개입 없이도 가능합니다. 이 기능은 데이터베이스를 슬림하게 유지하고 저장소 비용을 줄이며, 가장 관련 있고 최신 데이터에 집중함으로써 쿼리가 빠르고 효율적으로 유지될 수 있도록 하는 데 필수적입니다. 또한, 데이터 생애 주기를 체계적으로 관리하여 데이터 보존 정책 준수를 지원함으로써 가시성 솔루션의 전반적인 지속 가능성과 확장성을 향상시킵니다.

TTL은 ClickHouse의 테이블 수준 또는 컬럼 수준에서 지정할 수 있습니다.

### 테이블 수준 TTL {#table-level-ttl}

로그와 추적에 대한 기본 스키마에는 데이터가 지정된 기간 후에 만료되는 TTL이 포함되어 있습니다. 이는 ClickHouse 내보내기에서 `ttl` 키 아래에 지정됩니다. 예를 들어:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

이 구문은 현재 [Golang Duration syntax](https://pkg.go.dev/time#ParseDuration)를 지원합니다. **사용자는 `h`를 사용하고, 파티셔닝 기간과 일치하도록 설정하는 것이 좋습니다. 예를 들어 하루 별로 파티셔닝하는 경우, 반드시 일수의 배수로 설정하십시오. 예를 들어 24h, 48h, 72h 등으로요.** 이는 자동으로 TTL 절이 테이블에 추가되도록 보장합니다. 예를 들어, `ttl: 96h`인 경우에 말이죠.

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

기본적으로 만료된 TTL을 가진 데이터는 ClickHouse가 [데이터 파트 병합](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)을 수행할 때 제거됩니다. ClickHouse가 데이터가 만료되었음을 감지하면, 일정에 맞춰 병합이 수행됩니다.

:::note 예약된 TTL
TTL은 즉시 적용되지 않고 위에서 언급한 바와 같이 일정에 따라 적용됩니다. MergeTree 테이블 설정인 `merge_with_ttl_timeout`은 삭제 TTL과 함께 반복적인 병합을 수행하기 전에 최소 지연 시간을 초 단위로 설정합니다. 기본값은 14400초(4시간)입니다. 그러나 이는 최소 지연일 뿐이며, TTL 병합이 트리거되는 데 더 많은 시간이 걸릴 수 있습니다. 값이 너무 낮으면 많은 비일정 병합이 수행되어 많은 리소스를 소모할 수 있습니다. TTL 만료는 `ALTER TABLE my_table MATERIALIZE TTL` 명령어를 사용하여 강제할 수 있습니다.
:::

**중요**: 우리는 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 설정의 사용을 권장합니다. (기본 스키마에 적용됨) 이 설정이 활성화되면 ClickHouse는 모든 행이 만료된 경우 전체 파트를 드롭합니다. 부분적으로 TTL이 만료된 행을 청소하기보다 전체 파트를 삭제하는 것은(`ttl_only_drop_parts=0`일 때 리소스 집약적인 변형을 통해 얻은 것) 더 짧은 `merge_with_ttl_timeout` 시간과 시스템 성능에 미치는 영향을 낮출 수 있습니다. 데이터가 TTL 만료를 수행하는 단위와 동일한 단위로 파티셔닝되는 경우 예를 들어 하루로 파티셔닝된다면, 파트는 자연스럽게 정해진 간격의 데이터만 포함하게 됩니다. 이는 `ttl_only_drop_parts=1`이 효율적으로 적용될 수 있도록 합니다.

### 컬럼 수준 TTL {#column-level-ttl}

위의 예시는 테이블 수준에서 데이터를 만료시킵니다. 사용자는 또한 컬럼 수준에서 데이터를 만료시킬 수 있습니다. 데이터가 나이가 들면서, 이는 조사에서 그 값을 유지하는 것이 자원 오버헤드를 정당화하지 않을 경우 컬럼을 삭제하는 데 사용할 수 있습니다. 예를 들어, 새로운 동적 메타데이터가 삽입 시에 추출되지 않은 경우(예: 새로운 Kubernetes 레이블)가 추가될 경우 `Body` 컬럼을 유지하는 것이 좋습니다. 예를 들어 1개월 후에는 이 추가 메타데이터가 유용하지 않은 것이 분명할 수 있습니다 - 따라서 `Body` 컬럼을 유지하는 것의 가치를 제한하게 됩니다.

아래에서는 `Body` 컬럼을 30일 후에 삭제할 수 있는 방법을 보여줍니다.

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
컬럼 수준 TTL을 지정하려면 사용자가 자신의 스키마를 지정해야 합니다. 이는 OTel 수집기에서는 지정할 수 없습니다.
:::

## 데이터 재압축 {#recompressing-data}

가시성 데이터 세트에 대해 일반적으로 `ZSTD(1)`을 추천하지만, 사용자는 서로 다른 압축 알고리즘이나 더 높은 압축 수준 예를 들어 `ZSTD(3)`를 시도해 볼 수 있습니다. 이는 스키마 생성 시 지정할 수 있을 뿐만 아니라, 설정된 기간이 지나면 변경되도록 구성할 수 있습니다. 이는 코덱이나 압축 알고리즘이 압축을 개선하지만 쿼리 성능을 저하시키는 경우 적합할 수 있습니다. 이러한 균형은 오래된 데이터에 대해서는 수용 가능할 수 있지만, 최근 데이터에 대해서는 빈번한 사용으로 인해 수용되지 않을 수 있습니다.

아래 예시는 데이터를 삭제하는 대신 4일 후에 `ZSTD(3)`를 사용하여 압축하는 방법을 보여줍니다.

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
사용자는 항상 서로 다른 압축 수준과 알고리즘의 삽입 및 쿼리 성능 영향을 평가해야 합니다. 이를테면 델타 코덱은 타임스탬프 압축에 유용할 수 있습니다. 그러나 이는 기본 키의 일부인 경우 필터링 성능이 저하될 수 있습니다.
:::

TTL 구성에 대한 추가 세부정보 및 예시는 [여기](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)에서 찾을 수 있습니다. 테이블 및 컬럼에 대해 TTL을 추가하고 수정하는 방법에 대한 예시는 [여기](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)에서 찾을 수 있습니다. TTL이 핫-웜 아키텍처와 같은 저장소 계층을 가능하게 하는 방법에 대해서는 [저장소 계층](#storage-tiers)에서 확인하십시오.

## 저장소 계층 {#storage-tiers}

ClickHouse에서는 사용자가 서로 다른 디스크에 저장소 계층을 만들 수 있습니다. 예를 들어, 핫/최근 데이터는 SSD에 저장하고 오래된 데이터는 S3에 저장하는 것입니다. 이러한 아키텍처는 조사에서 자주 사용되지 않는 오래된 데이터에 대해 더 낮은 비용의 저장소를 사용할 수 있도록 해줍니다.

:::note ClickHouse Cloud와 관련 없음
ClickHouse Cloud는 S3에서 백업된 데이터의 단일 복사본을 사용하며, SSD 기반 노드 캐시가 있습니다. 따라서 ClickHouse Cloud에서 저장소 계층은 필요하지 않습니다.
:::

저장소 계층을 생성하려면 사용자가 먼저 디스크를 생성해야 하며, 이는 나중에 테이블 생성 시 저장소 정책을 형성하는 데 사용됩니다. 데이터는 채우기 비율, 파트 크기 및 볼륨 우선 순위에 따라 디스크 간에 자동으로 이동할 수 있습니다. 추가 세부정보는 [여기](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)에서 확인할 수 있습니다.

데이터는 `ALTER TABLE MOVE PARTITION` 명령어를 사용하여 수동으로 디스크 간에 이동할 수 있지만, 볼륨 간 데이터 이동 또한 TTL을 사용하여 제어할 수 있습니다. 전체 예시는 [여기](https://clickhouse.com/docs/en/guides/developer/ttl#implementing-a-hotwarmcold-architecture)에서 확인할 수 있습니다.

## 스키마 변경 관리 {#managing-schema-changes}

로그 및 추적 스키마는 시스템의 수명 주기 동안 변경될 수 있습니다. 예를 들어 사용자가 새로운 시스템을 모니터링하면서 서로 다른 메타데이터 또는 포드 레이블을 가지게 됩니다. OTel 스키마를 사용하여 데이터를 생성하고 원래 이벤트 데이터를 구조화된 형식으로 캡처함으로써 ClickHouse 스키마는 이러한 변화에 강력하게 대응할 수 있습니다. 그러나 새로운 메타데이터가 제공되고 쿼리 접근 패턴이 변경되면서, 사용자는 이러한 발전을 반영하기 위해 스키마를 업데이트하고 싶어할 것입니다.

스키마 변경 중 가동 중단 시간을 피하기 위해 사용자는 여러 가지 옵션을 갖고 있으며, 아래에 제시합니다.

### 기본값 사용 {#use-default-values}

컬럼은 [`DEFAULT` 값](/sql-reference/statements/create/table#default)을 사용하여 스키마에 추가할 수 있습니다. 지정된 기본값은 INSERT 중에 명시되지 않은 경우 사용됩니다.

스키마 변경은 새로운 컬럼이 전송되도록 하는 물리화된 뷰 변환 논리 또는 OTel 수집기 구성을 수정하기 전에 이루어질 수 있습니다.

스키마가 변경된 후, 사용자는 OTel 수집기를 재구성할 수 있습니다. 사용자가 ["SQL로 구조 추출하기"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql)에서 설명하는 권장 프로세스를 따르는 경우, OTel 수집기가 Null 테이블 엔진에 데이터를 전송하고, 물리화된 뷰가 대상 스키마를 추출하고 결과를 적재 테이블에 저장하도록 담당하도록 한 경우, `ALTER TABLE ... MODIFY QUERY` 구문을 사용하여 뷰를 수정할 수 있습니다. 아래와 같은 대상 테이블과 해당 물리화된 뷰가 있다고 가정해 보겠습니다 ( "SQL로 구조 추출하기"와 유사):

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

`LogAttributes`에서 새로운 컬럼 `Size`를 추출하고 싶다고 가정해 보겠습니다. 이를 `ALTER TABLE`을 사용하여 스키마에 추가할 수 있습니다.

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

위의 예시에서는 `LogAttributes`의 `size` 키를 기본값으로 지정합니다(존재하지 않을 경우 0이 됩니다). 이는 해당 값을 삽입하지 않은 행에 대해 이 컬럼에 접근하는 쿼리에서 맵을 접근해야 하므로 더 느려질 것입니다. 우리는 이를 상수, 예를 들어 0으로 지정하여 해당 값이 없는 행에 대한 후속 쿼리 비용을 줄일 수 있습니다. 이 테이블을 쿼리하면 값이 기대하는 대로 맵에서 채워진 것을 보여줍니다.

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

앞으로 모든 데이터에 대해 이 값이 삽입되도록 하려면, 다음과 같이 `ALTER TABLE` 구문을 사용하여 물리화된 뷰를 수정할 수 있습니다:

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

다음 행은 삽입 시 `Size` 컬럼이 채워집니다.

### 새 테이블 생성 {#create-new-tables}

위의 프로세스의 대안으로, 사용자는 새 스키마로 새 대상 테이블을 간단히 생성할 수 있습니다. 그런 다음 모든 물리화된 뷰는 위의 `ALTER TABLE MODIFY QUERY`를 사용하여 새 테이블을 사용하도록 수정할 수 있습니다. 이 접근 방식으로 사용자는 자신의 테이블에 버전을 부여할 수 있습니다. 예: `otel_logs_v3`.

이 접근 방식은 사용자가 쿼리하기 위해 여러 테이블을 남깁니다. 테이블 간에 쿼리하려면, 사용자는 [`merge` 함수](/sql-reference/table-functions/merge)를 사용할 수 있습니다. 이는 테이블 이름에 대한 와일드카드 패턴을 수용합니다. 아래에서 v2 및 v3의 `otel_logs` 테이블을 쿼리하여 이를 보여줍니다:

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

사용자가 `merge` 함수를 사용하고 여러 테이블을 결합하여 최종 사용자에게 테이블을 노출하는 것을 피하고 싶다면, [Merge 테이블 엔진](/engines/table-engines/special/merge)을 사용할 수 있습니다. 아래에서 이를 보여줍니다:

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

새 테이블이 추가될 때마다 `EXCHANGE` 테이블 구문을 사용하여 업데이트할 수 있습니다. 예를 들어, v4 테이블을 추가하려면 새로운 테이블을 생성하고 이를 이전 버전과 원자적으로 교환할 수 있습니다.

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
