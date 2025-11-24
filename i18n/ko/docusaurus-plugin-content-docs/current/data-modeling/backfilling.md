---
'slug': '/data-modeling/backfilling'
'title': '데이터 보충'
'description': 'ClickHouse에서 대규모 데이터 세트를 보충하는 방법'
'keywords':
- 'materialized views'
- 'backfilling'
- 'inserting data'
- 'resilient data load'
'doc_type': 'guide'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# 데이터 백필

ClickHouse를 처음 사용하는 경우든 기존 배포의 책임이 있든, 사용자는 역사적 데이터를 사용하여 테이블을 백필해야 할 필요가 있을 것입니다. 어떤 경우에는 이것이 비교적 간단하지만, 물리화된 뷰를 채워야 할 때 더 복잡해질 수 있습니다. 이 가이드는 사용자가 자신의 사용 사례에 적용할 수 있는 이 작업을 위한 몇 가지 프로세스를 문서화합니다.

:::note
이 가이드는 사용자가 [점진적 물리화된 뷰](/materialized-view/incremental-materialized-view) 및 [s3 및 gcs와 같은 테이블 함수 사용을 통한 데이터 로딩](/integrations/s3) 개념에 이미 익숙하다고 가정합니다. 또한 사용자가 [객체 스토리지에서의 삽입 성능 최적화](/integrations/s3/performance)에 대한 가이드를 읽어보기를 권장하며, 이 조언은 이 가이드 전반에 걸쳐 삽입에 적용할 수 있습니다.
:::

## 예제 데이터셋 {#example-dataset}

이 가이드에서는 PyPI 데이터셋을 사용합니다. 이 데이터셋의 각 행은 `pip`와 같은 도구를 사용하여 Python 패키지를 다운로드한 것을 나타냅니다.

예를 들어, 하위 집합은 단일 일인 `2024-12-17`을 포함하며 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/`에서 공개적으로 사용할 수 있습니다. 사용자는 다음과 같이 쿼리할 수 있습니다:

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

이 버킷의 전체 데이터셋에는 320GB 이상의 Parquet 파일이 포함되어 있습니다. 아래 예제에서는 glob 패턴을 사용하여 의도적으로 하위 집합을 목표로 설정합니다.

우리는 사용자가 Kafka 또는 객체 스토리지와 같은 스트림을 소비하고 있다고 가정하며, 이 날짜 이후의 데이터를 처리합니다. 이 데이터의 스키마는 아래에 표시됩니다:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')
FORMAT PrettyCompactNoEscapesMonoBlock
SETTINGS describe_compact_output = 1

┌─name───────────────┬─type────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ timestamp │ Nullable(DateTime64(6))                                                                                                                 │
│ country_code       │ Nullable(String)                                                                                                                        │
│ url │ Nullable(String)                                                                                                                        │
│ project            │ Nullable(String)                                                                                                                        │
│ file │ Tuple(filename Nullable(String), project Nullable(String), version Nullable(String), type Nullable(String))                             │
│ installer          │ Tuple(name Nullable(String), version Nullable(String))                                                                                  │
│ python             │ Nullable(String)                                                                                                                        │
│ implementation     │ Tuple(name Nullable(String), version Nullable(String))                                                                                  │
│ distro             │ Tuple(name Nullable(String), version Nullable(String), id Nullable(String), libc Tuple(lib Nullable(String), version Nullable(String))) │
│ system │ Tuple(name Nullable(String), release Nullable(String))                                                                                  │
│ cpu                │ Nullable(String)                                                                                                                        │
│ openssl_version    │ Nullable(String)                                                                                                                        │
│ setuptools_version │ Nullable(String)                                                                                                                        │
│ rustc_version      │ Nullable(String)                                                                                                                        │
│ tls_protocol       │ Nullable(String)                                                                                                                        │
│ tls_cipher         │ Nullable(String)                                                                                                                        │
└────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

:::note
1조 개 이상의 행으로 구성된 전체 PyPI 데이터셋은 우리의 공개 데모 환경 [clickpy.clickhouse.com](https://clickpy.clickhouse.com)에서 사용할 수 있습니다. 이 데이터셋에 대한 추가 세부정보는 성능을 위한 물리화된 뷰 사용 및 데이터가 매일 어떻게 채워지는지에 대한 내용을 [여기](https://github.com/ClickHouse/clickpy)에서 확인할 수 있습니다.
:::

## 백필 시나리오 {#backfilling-scenarios}

백필은 일반적으로 특정 시점에서 데이터 스트림을 소비할 때 필요합니다. 이 데이터는 [점진적 물리화된 뷰](/materialized-view/incremental-materialized-view)와 함께 ClickHouse 테이블에 삽입되며, 데이터가 삽입될 때 블록이 트리거됩니다. 이러한 뷰는 삽입 전에 데이터 변환 또는 집계를 수행하여 결과를 다운스트림 애플리케이션에서 나중에 사용할 수 있는 대상 테이블로 보냅니다.

우리는 다음 시나리오를 다룰 것입니다:

1. **기존 데이터 수집으로 백필 수행하기** - 새로운 데이터가 로드되고, 역사적 데이터를 백필해야 합니다. 이 역사적 데이터는 이미 식별되었습니다.
2. **기존 테이블에 물리화된 뷰 추가** - 역사적 데이터가 채워진 설정에 새 물리화된 뷰를 추가해야 하며 데이터가 이미 스트리밍되고 있습니다.

데이터는 객체 스토리지에서 백필될 것이라고 가정합니다. 모든 경우에 우리는 데이터 삽입의 중단을 피하는 것을 목표로 합니다.

우리는 객체 스토리지에서 역사적 데이터를 백필하는 것을 권장합니다. 데이터는 가능한 경우 Parquet로 내보내져 최적의 읽기 성능과 압축(네트워크 전송 감소)을 위해 사용되어야 합니다. 일반적으로 150MB 크기의 파일이 선호되지만 ClickHouse는 [70개 이상의 파일 형식](/interfaces/formats)을 지원하며 모든 크기의 파일을 처리할 수 있습니다.

## 중복 테이블 및 뷰 사용 {#using-duplicate-tables-and-views}

모든 시나리오에서 우리는 "중복 테이블과 뷰"의 개념에 의존합니다. 이러한 테이블과 뷰는 실시간 스트리밍 데이터에 사용되는 복사본을 나타내며 실패가 발생할 경우 복구를 쉽게 수행할 수 있도록 백필을 고립 상태에서 수행할 수 있게 해줍니다. 예를 들어, 우리는 다음과 같은 주요 `pypi` 테이블과 Python 프로젝트별 다운로드 수를 계산하는 물리화된 뷰를 가지고 있습니다:

```sql
CREATE TABLE pypi
(
    `timestamp` DateTime,
    `country_code` LowCardinality(String),
    `project` String,
    `type` LowCardinality(String),
    `installer` LowCardinality(String),
    `python_minor` LowCardinality(String),
    `system` LowCardinality(String),
    `on` String
)
ENGINE = MergeTree
ORDER BY (project, timestamp)

CREATE TABLE pypi_downloads
(
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY project

CREATE MATERIALIZED VIEW pypi_downloads_mv TO pypi_downloads
AS SELECT
 project,
    count() AS count
FROM pypi
GROUP BY project
```

우리는 주요 테이블과 관련된 뷰를 데이터의 하위 집합으로 채웁니다:

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. Elapsed: 15.702 sec. Processed 41.23 million rows, 3.94 GB (2.63 million rows/s., 251.01 MB/s.)
Peak memory usage: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 20.61 million
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   20612750 │ -- 20.61 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 96.15 thousand rows, 769.23 KB (16.53 million rows/s., 132.26 MB/s.)
Peak memory usage: 682.38 KiB.
```

다른 하위 집합 `{101..200}`을 로드하려고 한다고 가정해 봅시다. `pypi`에 직접 삽입할 수 있지만, 중복 테이블을 생성함으로써 이 백필 작업을 고립 상태에서 수행할 수 있습니다.

백필에 실패하면, 주요 테이블에 영향을 미치지 않으며 중복 테이블을 [truncate](/managing-data/truncate)하고 반복할 수 있습니다.

이러한 뷰의 새 복사본을 생성하기 위해 `CREATE TABLE AS` 절을 사용하여 `_v2` 접미사를 추가할 수 있습니다:

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT
 project,
    count() AS count
FROM pypi_v2
GROUP BY project
```

이로 인해 두 번째 하위 집합의 약간의 크기로 채워지고 성공적으로 로드되었음을 확인합니다.

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. Elapsed: 17.545 sec. Processed 40.80 million rows, 3.90 GB (2.33 million rows/s., 222.29 MB/s.)
Peak memory usage: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 20.40 million
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 20.40 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 95.49 thousand rows, 763.90 KB (14.81 million rows/s., 118.45 MB/s.)
Peak memory usage: 688.77 KiB.
```

이 두 번째 로드 과정에서 어떤 실패를 경험하면, `pypi_v2` 및 `pypi_downloads_v2`를 간단히 [truncate](/managing-data/truncate)하고 데이터 로드를 반복할 수 있습니다.

데이터 로드가 완료되면, [`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 절을 사용하여 중복 테이블에서 주요 테이블로 데이터를 이동할 수 있습니다.

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0 rows in set. Elapsed: 0.389 sec.
```

:::note 파티션 이름
위의 `MOVE PARTITION` 호출은 파티션 이름 `()`를 사용합니다. 이는 이 테이블의 단일 파티션을 나타냅니다(파티셔닝되지 않음). 파티션이 있는 테이블의 경우, 사용자는 각 파티션에 대해 여러 `MOVE PARTITION` 호출을 수행해야 합니다. 현재 파티션의 이름은 [`system.parts`](/operations/system-tables/parts) 테이블에서 확인할 수 있습니다. 예: `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`.
:::

이제 `pypi` 및 `pypi_downloads`가 완전한 데이터를 포함하고 있음을 확인할 수 있습니다. `pypi_downloads_v2` 및 `pypi_v2`는 안전하게 삭제할 수 있습니다.

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 41.01 million
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 41.01 million
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 191.64 thousand rows, 1.53 MB (27.34 million rows/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

중요하게도, `MOVE PARTITION` 작업은 가벼우며(하드 링크를 활용) 원자적입니다. 즉, 실패하거나 성공하며 중간 상태가 없습니다.

우리는 다음의 백필 시나리오에서 이 프로세스를 많이 활용합니다.

이 프로세스가 사용자가 각 삽입 작업의 크기를 선택해야 함을 요구한다는 점에 주목하십시오.

더 큰 삽입, 즉 더 많은 행은 더 적은 `MOVE PARTITION` 작업이 필요하게 됩니다. 그러나 이는 삽입 실패(예: 네트워크 중단) 시 회복 비용과 균형을 맞춰야 합니다. 사용자는 이 과정에 배치 파일을 추가하여 위험을 줄일 수 있습니다. 이는 범위 쿼리(예: `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`) 또는 glob 패턴을 사용하여 수행할 수 있습니다. 예를 들어,

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--continued to all files loaded OR MOVE PARTITION call is performed
```

:::note
ClickPipes는 객체 스토리지에서 데이터를 로드할 때 이 접근 방식을 사용하며, 대상 테이블과 그 물리화된 뷰의 중복을 자동으로 생성하고 사용자가 위 단계를 수행할 필요가 없도록 합니다. 또한 서로 다른 하위 집합(글로브 패턴을 통해)과 각자의 중복 테이블을 처리하는 여러 작업 스레드를 사용하여 데이터를 빠르게 적재하며 정확히 한 번씩의 의미론을 유지합니다. 관심 있는 분들은 [이 블로그](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)를 참조하실 수 있습니다.
:::

## 시나리오 1: 기존 데이터 수집으로 백필 {#scenario-1-backfilling-data-with-existing-data-ingestion}

이 시나리오에서는 백필해야 하는 데이터가 격리된 버킷에 없고 필터링이 필요하다고 가정합니다. 데이터가 이미 삽입되고 있으며, 역사적 데이터를 백필해야 하는 타임스탬프 또는 단조롭게 증가하는 컬럼 값을 식별할 수 있습니다.

이 과정은 다음 단계를 따릅니다:

1. 체크포인트를 식별합니다 - 역사적 데이터를 복원해야 하는 타임스탬프 또는 컬럼 값을 식별합니다.
2. 주요 테이블과 물리화된 뷰의 대상 테이블의 중복본을 생성합니다.
3. (2)에서 생성된 대상 테이블을 가리키는 모든 물리화된 뷰의 복사본을 만듭니다.
4. (2)에서 생성된 우리의 중복 주요 테이블에 삽입합니다.
5. 중복 테이블에서 모든 파티션을 원래 버전으로 이동합니다. 중복 테이블을 삭제합니다.

예를 들어, PyPI 데이터에서 데이터가 로드된 상태라고 가정해 보겠습니다. 최소 타임스탬프를 식별하고, 따라서 체크포인트를 확인할 수 있습니다.

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

위의 내용에서 `2024-12-17 09:00:00` 이전의 데이터를 로드해야 함을 알 수 있습니다. 이전 프로세스를 사용하여 중복 테이블과 뷰를 생성하고, 타임스탬프에 대한 필터를 사용하여 하위 집합을 로드합니다.

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT project, count() AS count
FROM pypi_v2
GROUP BY project

INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-*.parquet')
WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 500.152 sec. Processed 2.74 billion rows, 364.40 GB (5.47 million rows/s., 728.59 MB/s.)
```
:::note
Parquet에서 타임스탬프 컬럼에 대한 필터링은 매우 효율적일 수 있습니다. ClickHouse는 전체 데이터 범위를 식별하기 위해 타임스탬프 컬럼만 읽으므로 네트워크 트래픽이 최소화됩니다. ClickHouse 쿼리 엔진은 min-max와 같은 Parquet 인덱스도 활용할 수 있습니다.
:::

이 삽입이 완료되면 관련 파티션을 이동할 수 있습니다.

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

역사적 데이터가 격리된 버킷에 있는 경우 위의 시간 필터가 필요하지 않습니다. 시간 또는 단조롭게 증가하는 컬럼을 사용할 수 없는 경우, 역사적 데이터를 격리하세요.

:::note ClickHouse Cloud에서 ClickPipes 사용
ClickHouse Cloud 사용자는 데이터를 고립된 버킷에 복원할 수 있는 경우 ClickPipes를 사용해야 합니다(필터가 필요하지 않음). 여러 작업자를 통해 로드를 병렬화하여 로드 시간을 단축할 수 있으며, ClickPipes는 위의 프로세스를 자동화하여 주요 테이블과 물리화된 뷰 모두에 대한 중복 테이블을 생성합니다.
:::

## 시나리오 2: 기존 테이블에 물리화된 뷰 추가 {#scenario-2-adding-materialized-views-to-existing-tables}

중요한 데이터가 채워진 설정에 새 물리화된 뷰를 추가할 필요가 있는 경우는 드뭅니다. 타임스탬프 또는 단조롭게 증가하는 컬럼을 사용하여 스트림의 지점을 식별하는 것은 여기서 유용하며, 데이터 삽입 중단을 피할 수 있습니다. 아래 예제에서는 두 가지 경우를 가정하며, 삽입 시 중단을 피하는 접근 방식을 선호합니다.

:::note POPULATE 피하기
`POPULATE`(/sql-reference/statements/create/view#materialized-view) 명령을 사용하여 물리화된 뷰를 백필하는 것은 삽입이 중단된 소규모 데이터 집합을 제외하고는 권장하지 않습니다. 이 연산자는 소스 테이블에 삽입된 행을 놓칠 수 있으며, 물리화된 뷰는 populate 해시가 완료된 후에 생성될 수 있습니다. 또한 이 populate는 모든 데이터를 대상으로 실행되며, 대규모 데이터셋에서 중단이나 메모리 제한에 취약합니다.
:::

### 타임스탬프 또는 단조롭게 증가하는 컬럼 사용 가능 {#timestamp-or-monotonically-increasing-column-available}

이 경우, 새 물리화된 뷰에 임의의 미래의 시간보다 큰 행만 고려하는 필터를 포함하도록 권장합니다. 이 물리화된 뷰는 이후 이 날짜를 기준으로 주요 테이블의 역사적 데이터를 사용하여 백필할 수 있습니다. 백필 접근 방식은 데이터 크기와 관련 쿼리의 복잡성에 따라 달라집니다.

가장 간단한 접근 방식은 다음 단계를 따릅니다:

1. 임의의 가까운 미래의 시간보다 큰 행만 고려하는 필터와 함께 물리화된 뷰를 생성합니다.
2. 소스 테이블에서 뷰의 집계 쿼리를 읽어 물리화된 뷰의 대상 테이블에 삽입하는 `INSERT INTO SELECT` 쿼리를 실행합니다.

이는 (2)단계에서 데이터의 하위 집합을 목표로 하거나 물리화된 뷰에 대한 중복 대상 테이블을 사용할 수 있도록 향상될 수 있습니다(삽입 완료 후 원본에 파티션을 연결).

다음 물리화된 뷰를 고려합니다. 이 뷰는 시간당 가장 인기 있는 프로젝트를 계산합니다.

```sql
CREATE TABLE pypi_downloads_per_day
(
    `hour` DateTime,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, hour)

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi
GROUP BY
    hour,
 project
```

대상 테이블을 추가할 수 있지만, 물리화된 뷰를 추가하기 전에 `SELECT` 절을 수정하여 임의의 가까운 미래의 시간보다 큰 행만 고려하도록 필터를 추가합니다. 이 경우 `2024-12-17 09:00:00`이 몇 분 후의 시간이라고 가정합니다.

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) AS hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

이 뷰가 추가된 후, 이 데이터 이전의 모든 데이터를 물리화된 뷰에 대해 백필할 수 있습니다.

이 작업을 수행하는 가장 간단한 방법은 주요 테이블에서 타임스탬프가 최근에 추가된 데이터를 무시하는 필터가 있는 쿼리를 실행하고 결과를 우리의 뷰의 대상 테이블에 분산 삽입하는 것입니다. 예를 들어, 위의 뷰의 경우:

```sql
INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) AS hour,
 project,
    count() AS count
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
GROUP BY
    hour,
 project

Ok.

0 rows in set. Elapsed: 2.830 sec. Processed 798.89 million rows, 17.40 GB (282.28 million rows/s., 6.15 GB/s.)
Peak memory usage: 543.71 MiB.
```

:::note
위의 예에서 우리의 대상 테이블은 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)입니다. 이 경우, 원래 집계 쿼리를 간단히 사용할 수 있습니다. [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)를 활용하는 더 복잡한 사용 사례의 경우, 사용자는 집계에 대해 `-State` 함수를 사용해야 합니다. 이의 예시는 [여기](/integrations/s3/performance#be-aware-of-merges)에서 확인할 수 있습니다.
:::

우리의 경우, 이는 비교적 경량 집계로 3초 이내에 완료되며 600MiB 미만의 메모리를 사용합니다. 더 복잡한 집계나 긴 실행 시간을 요구하는 경우, 사용자는 이전 중복 테이블 접근 방식을 사용하여 이 프로세스를 더욱 탄력 있게 만들 수 있습니다. 즉, 그림자 대상 테이블을 생성하고(`pypi_downloads_per_day_v2`와 같은) 이 테이블에 삽입하고 그 결과 파티션을 `pypi_downloads_per_day`에 연결하는 것입니다.

종종 물리화된 뷰의 쿼리는 더 복잡할 수 있으며(사용자가 뷰를 사용하지 않을 이유가 없다면 드물지 않음) 리소스를 소모할 수 있습니다. 드물게는 쿼리를 수행하는 데 필요한 리소스가 서버의 능력을 초과할 수 있습니다. 이는 ClickHouse 물리화된 뷰의 장점 중 하나를 강조합니다. 즉, 점진적이며 한 번에 전체 데이터셋을 처리하지 않습니다!

이 경우, 사용자는 여러 옵션을 가집니다:

1. 쿼리를 수정하여 범위를 백필합니다. 예: `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`, `WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` 등.
2. [Null 테이블 엔진](/engines/table-engines/special/null)을 사용하여 물리화된 뷰를 채웁니다. 이렇게 하면 일반적인 물리화된 뷰의 점진적 채우기를 복제하며, 블록 단위로 쿼리를 실행합니다(구성 가능한 크기).

(1)은 가장 간단한 접근 방식으로 종종 충분합니다. 간결함을 위해 예제를 포함하지 않습니다.

(2)를 아래에서 더 탐색합니다.

#### 물리화된 뷰를 채우기 위해 Null 테이블 엔진 사용 {#using-a-null-table-engine-for-filling-materialized-views}

[Null 테이블 엔진](/engines/table-engines/special/null)은 데이터를 지속하지 않는 스토리지 엔진을 제공합니다(테이블 엔진 세계의 `/dev/null`로 생각할 수 있습니다). 이것은 모순처럼 보이지만, 물리화된 뷰는 여전히 이 테이블 엔진에 삽입된 데이터에 대해 실행됩니다. 이를 통해 원래 데이터를 지속하지 않고 물리화된 뷰를 구축할 수 있으며, I/O 및 관련 스토리지를 피할 수 있습니다.

중요하게도, 테이블 엔진에 연결된 모든 물리화된 뷰는 삽입되는 블록 단위로 실행되며, 그 결과를 대상 테이블로 전송합니다. 이러한 블록은 구성 가능 크기입니다. 더 큰 블록은 효율성을 높일 수 있지만(더 빠른 처리) 더 많은 리소스(주로 메모리)가 소모됩니다. 이 테이블 엔진을 사용하면 물리화된 뷰를 점진적으로 구축할 수 있습니다. 즉, 블록 단위로 진행하며 전체 집계를 메모리에 유지할 필요가 없습니다.

<Image img={nullTableMV} size="md" alt="ClickHouse의 비정규화"/>

<br />

다음 예를 고려합니다:

```sql
CREATE TABLE pypi_v2
(
    `timestamp` DateTime,
    `project` String
)
ENGINE = Null

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv_v2 TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project
```

여기서 우리는 물리화된 뷰를 구축하는 데 사용될 행을 수신할 `pypi_v2`라는 Null 테이블을 생성합니다. 필요한 열만 포함하도록 스키마를 제한하는 방법에 주목하십시오. 우리의 물리화된 뷰는 이 테이블에 삽입된 행에 대해 집계를 수행하며(한 번에 한 블록씩), 그 결과를 우리의 대상 테이블인 `pypi_downloads_per_day`로 전송합니다.

:::note
여기서 우리는 `pypi_downloads_per_day`을 대상 테이블로 사용했습니다. 추가적인 복원력을 위해, 사용자는 이전 예제에서 보여준 것처럼 중복 테이블 `pypi_downloads_per_day_v2`를 생성하고 이를 뷰의 대상 테이블로 사용할 수 있습니다. 삽입이 완료되면 `pypi_downloads_per_day_v2`의 파티션은 `pypi_downloads_per_day`로 이동될 수 있습니다. 이는 삽입이 메모리 문제나 서버 중단으로 인해 실패하는 경우 복구를 가능하게 합니다. 즉, 우리는 단순히 `pypi_downloads_per_day_v2`를 truncate하고, 설정을 조정하고, 재시도하면 됩니다.
:::

이 물리화된 뷰를 채우기 위해, 우리는 `pypi`에서 `pypi_v2`로 백필할 관련 데이터를 간단히 삽입합니다.

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

여기에서 우리의 메모리 사용량이 `639.47 MiB`임을 확인하세요.

##### 성능 및 리소스 조정 {#tuning-performance--resources}

위 시나리오에서 성능과 리소스의 여러 요인이 결정됩니다. 조정을 시도하기 전에, 우리는 독자들이 [S3 삽입 및 읽기 성능 최적화 가이드](/integrations/s3/performance)에서 문서화된 삽입 메커니즘을 이해할 것을 권장합니다. 요약하면:

- **읽기 병렬성** - 읽는 데 사용되는 스레드 수입니다. [`max_threads`](/operations/settings/settings#max_threads)를 통해 제어됩니다. ClickHouse Cloud에서는 인스턴스 크기에 따라 결정되며 기본값은 vCPU 수입니다. 이 값을 늘리면 메모리 사용량이 증가하는 대신 읽기 성능이 향상될 수 있습니다.
- **삽입 병렬성** - 삽입에 사용되는 삽입 스레드 수입니다. [`max_insert_threads`](/operations/settings/settings#max_insert_threads)를 통해 제어됩니다. ClickHouse Cloud에서는 인스턴스 크기에 따라 결정되며(2~4 사이) OSS에서는 1로 설정됩니다. 이 값을 늘리면 메모리 사용량이 증가하는 대가로 성능이 향상될 수 있습니다.
- **삽입 블록 크기** - 데이터는 블록을 메모리 삽입 블록에 따라 끌어와서 구문 분석하고 형성하는 루프에서 처리됩니다. 이러한 블록은 정렬되어 최적화되고 압축되며 새 [데이터 파트](/parts)로 스토리지에 기록됩니다. 삽입 블록의 크기는 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)와 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)(압축되지 않음) 설정에 의해 제어되며 메모리 사용량과 디스크 I/O에 영향을 미칩니다. 더 큰 블록은 더 많은 메모리를 사용하지만 더 적은 파트를 생성하여 I/O 및 백그라운드 병합을 줄입니다. 이러한 설정은 최소 임계값을 나타내며(먼저 도달하는 것이 플러시를 트리거함).
- **물리화된 뷰 블록 크기** - 주요 삽입을 위한 위의 메커니즘 외에도, 물리화된 뷰에 삽입하기 전에 블록이 압축되어 더 효율적으로 처리됩니다. 이러한 블록의 크기는 [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views)와 [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) 설정에 의해 결정됩니다. 더 큰 블록은 더 많은 메모리 사용량을 감수하더라도 더 효율적인 처리를 가능하게 합니다. 기본적으로 이러한 설정은 원본 테이블 설정값인 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)와 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)로 되돌아갑니다.

성능 향상을 위해, 사용자는 [삽입의 스레드 및 블록 크기 조정](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts) 섹션에 설명된 가이드를 따를 수 있습니다. 대부분의 경우 성능 향상을 위해 `min_insert_block_size_bytes_for_materialized_views` 및 `min_insert_block_size_rows_for_materialized_views`를 수정할 필요는 없습니다. 이를 수정한다면, `min_insert_block_size_rows` 및 `min_insert_block_size_bytes`에 대해 논의된 동일한 모범 사례를 사용하십시오.

메모리를 최소화하려면 사용자는 이러한 설정을 실험해 볼 수 있습니다. 이는 불가피하게 성능을 낮출 것입니다. 앞의 쿼리를 사용하여 아래에 예를 보여줍니다.

`max_insert_threads`를 1로 낮추면 메모리 오버헤드를 줄일 수 있습니다.

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1

0 rows in set. Elapsed: 27.752 sec. Processed 1.50 billion rows, 33.48 GB (53.89 million rows/s., 1.21 GB/s.)
Peak memory usage: 506.78 MiB.
```

`max_threads` 설정을 1로 낮추면 메모리를 추가로 줄일 수 있습니다.

```sql
INSERT INTO pypi_v2
SELECT timestamp, project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1

Ok.

0 rows in set. Elapsed: 43.907 sec. Processed 1.50 billion rows, 33.48 GB (34.06 million rows/s., 762.54 MB/s.)
Peak memory usage: 272.53 MiB.
```

마지막으로, `min_insert_block_size_rows`를 0으로 설정(블록 크기에 대한 결정 요소 비활성화)하고 `min_insert_block_size_bytes`를 10485760(10MiB)으로 설정하면 메모리를 추가로 줄일 수 있습니다.

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0 rows in set. Elapsed: 43.293 sec. Processed 1.50 billion rows, 33.48 GB (34.54 million rows/s., 773.36 MB/s.)
Peak memory usage: 218.64 MiB.
```

마지막으로, 블록 크기를 낮추면 더 많은 파트가 생성되고 더 큰 병합 압력이 발생한다는 점에 유의해야 합니다. 위에서 논의된 바와 같이 [여기](https://integrations/s3/performance#be-aware-of-merges)에서 이러한 설정은 신중히 변경해야 합니다.

### 타임스탬프 또는 단조롭게 증가하는 컬럼 없음 {#no-timestamp-or-monotonically-increasing-column}

위의 프로세스는 사용자가 타임스탬프 또는 단조롭게 증가하는 컬럼을 보유하고 있어야 합니다. 어떤 경우에는 이는 단순히 제공되지 않습니다. 이 경우, 우리는 다음 프로세스를 권장합니다. 이는 앞서 설명한 많은 단계를 활용하지만 사용자가 삽입을 일시 중지해야 합니다.

1. 주요 테이블에 대한 삽입을 일시 중지합니다.
2. `CREATE AS` 구문을 사용하여 주요 대상 테이블의 중복본을 생성합니다.
3. [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart)를 사용하여 원래 대상 테이블의 파티션을 중복본에 연결합니다. **참고:** 이 attach 작업은 이전에 사용된 이동과 다릅니다. 하드 링크에 의존하지만, 원래 테이블의 데이터는 보존됩니다.
4. 새 물리화된 뷰를 생성합니다.
5. 삽입을 다시 시작합니다. **참고:** 삽입은 대상 테이블만 업데이트하며, 중복본은 원래 데이터만 참조하게 됩니다.
6. 위에서 사용한 타임스탬프가 있는 데이터에 대해 사용한 것과 동일한 방식으로 물리화된 뷰를 백필합니다. 중복 테이블을 소스로 사용합니다.

PyPI와 이전의 새로운 물리화된 뷰 `pypi_downloads_per_day`를 사용한 다음 예제를 고려합니다(타임스탬프를 사용할 수 없다고 가정함):

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- (1) Pause inserts
-- (2) Create a duplicate of our target table

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.004 sec.

-- (3) Attach partitions from the original target table to the duplicate.

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) Create our new materialized views

CREATE TABLE pypi_downloads_per_day
(
    `hour` DateTime,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, hour)

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi
GROUP BY
    hour,
 project

-- (4) Restart inserts. We replicate here by inserting a single row.

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- notice how pypi_v2 contains same number of rows as before

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

-- (5) Backfill the view using the backup pypi_v2

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 rows in set. Elapsed: 3.719 sec. Processed 2.04 billion rows, 47.15 GB (548.57 million rows/s., 12.68 GB/s.)

DROP TABLE pypi_v2;
```

결전적인 단계에서 우리는 이전에 설명한 간단한 `INSERT INTO SELECT` 접근 방식을 사용하여 `pypi_downloads_per_day`를 백필합니다. 이는 위에서 문서화된 Null 테이블 접근 방식을 활용하여 중복 테이블에 대한 사용을 선택적으로 포함시킬 수 있습니다.

이 작업을 수행하려면 삽입을 일시 중지해야 하지만, 중간 작업은 일반적으로 빠르게 완료될 수 있습니다. 데이터 중단을 최소화하여 진행할 수 있습니다.
