---
title: 'MergeTree로 분석 가속화'
sidebar_label: '쿼리 가속화'
slug: /use-cases/data-lake/getting-started/accelerating-analytics
sidebar_position: 3
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/connecting-catalogs
pagination_next: use-cases/data_lake/guides/writing-data
description: '분석 쿼리 성능을 대폭 높이기 위해 오픈 테이블 포맷의 데이터를 ClickHouse MergeTree 테이블로 로드합니다.'
keywords: ['데이터 레이크', '레이크하우스', 'MergeTree', '가속화', '분석', '역 인덱스', '전문 검색 인덱스', 'INSERT INTO SELECT']
doc_type: 'guide'
---

[이전 섹션](/use-cases/data-lake/getting-started/connecting-catalogs)에서는 ClickHouse를 데이터 카탈로그에 연결하고 오픈 테이블 포맷을 직접 쿼리했습니다. 원본 위치의 데이터를 그대로 쿼리하는 방식은 편리하지만, 오픈 테이블 포맷은 대시보드와 운영 보고를 뒷받침하는 저지연·고동시성 워크로드에 최적화되어 있지 않습니다. 이러한 사용 사례에서는 데이터를 ClickHouse의 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 엔진에 로드하면 성능이 크게 향상됩니다.

MergeTree는 오픈 테이블 포맷을 직접 읽는 방식보다 다음과 같은 여러 장점을 제공합니다:

* **[희소 기본 인덱스](/optimize/sparse-primary-indexes)** - 선택한 키를 기준으로 디스크에 데이터를 정렬하므로, 쿼리 실행 중 관련 없는 행의 넓은 범위를 ClickHouse가 건너뛸 수 있습니다.
* **향상된 데이터 타입** - [JSON](/sql-reference/data-types/json), [LowCardinality](/sql-reference/data-types/lowcardinality), [Enum](/sql-reference/data-types/enum)과 같은 타입을 기본 지원하므로, 더 압축된 저장과 더 빠른 처리가 가능합니다.
* **[스킵 인덱스](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-data_skipping-indexes)** 및 **[전문 검색 인덱스](/engines/table-engines/mergetree-family/invertedindexes)** - 쿼리의 필터 조건과 일치하지 않는 그래뉼을 ClickHouse가 건너뛸 수 있게 해주는 보조 인덱스 구조로, 특히 텍스트 검색 워크로드에서 효과적입니다.
* **자동 컴팩션을 통한 빠른 삽입** - ClickHouse는 고처리량 삽입에 맞게 설계되었으며, 백그라운드에서 데이터 파트를 자동으로 병합합니다. 이는 오픈 테이블 포맷의 컴팩션과 유사합니다.
* **동시 읽기에 최적화** - MergeTree의 열 지향 저장 레이아웃은 [여러 캐시 계층](/operations/caches)과 결합되어 높은 동시성이 필요한 실시간 분석 워크로드를 지원합니다. 이는 오픈 테이블 포맷이 염두에 두고 설계된 영역이 아닙니다.

이 가이드에서는 더 빠른 분석을 위해 `INSERT INTO SELECT`를 사용하여 카탈로그의 데이터를 MergeTree 테이블로 로드하는 방법을 설명합니다.

## 카탈로그에 연결 \{#connect-catalog\}

[이전 가이드](/use-cases/data-lake/getting-started/connecting-catalogs)에서 사용한 것과 동일한 Unity Catalog 연결을 사용하며, Iceberg REST 엔드포인트를 통해 연결합니다:

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```

### 테이블 목록 보기 \{#list-tables\}

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘
```

### 스키마 살펴보기 \{#explore-schema\}

```sql
SHOW CREATE TABLE unity.`icebench.single_day_log`

CREATE TABLE unity.`icebench.single_day_log`
(
    `pull_request_number` Nullable(Int64),
    `commit_sha` Nullable(String),
    `check_start_time` Nullable(DateTime64(6, 'UTC')),
    `check_name` Nullable(String),
    `instance_type` Nullable(String),
    `instance_id` Nullable(String),
    `event_date` Nullable(Date32),
    `event_time` Nullable(DateTime64(6, 'UTC')),
    `event_time_microseconds` Nullable(DateTime64(6, 'UTC')),
    `thread_name` Nullable(String),
    `thread_id` Nullable(Decimal(20, 0)),
    `level` Nullable(String),
    `query_id` Nullable(String),
    `logger_name` Nullable(String),
    `message` Nullable(String),
    `revision` Nullable(Int64),
    `source_file` Nullable(String),
    `source_line` Nullable(Decimal(20, 0)),
    `message_format_string` Nullable(String)
)
ENGINE = Iceberg('s3://...')
```

이 테이블에는 ClickHouse CI 테스트 실행에서 수집된 약 2억 8,300만 개의 로그 행이 포함되어 있어, 분석 성능을 살펴보기에 적합한 현실적인 데이터세트입니다.

```sql
SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

## 데이터 레이크 테이블에 대해 쿼리 실행 \{#query-lakehouse\}

스레드 이름과 인스턴스 유형으로 로그를 필터링하고, 메시지 텍스트에서 오류를 검색하며, 로거별로 결과를 그룹화하는 쿼리를 실행해 보겠습니다:

```sql
SELECT
    logger_name,
    count() AS c
FROM icebench.`icebench.single_day_log`
WHERE (thread_name = 'TCPHandler')
    AND (instance_type = 'm6i.4xlarge')
    AND hasToken(message, 'error')
GROUP BY logger_name
ORDER BY c DESC
LIMIT 5

┌─logger_name──────────────┬────c─┐
│ executeQuery             │ 6907 │
│ TCPHandler               │ 4145 │
│ TCP-Session              │  790 │
│ PostgreSQLConnectionPool │  530 │
│ ContextAccess (default)  │  392 │
└──────────────────────────┴──────┘

5 rows in set. Elapsed: 8.921 sec. Processed 282.63 million rows, 5.42 GB (31.68 million rows/s., 607.26 MB/s.)
Peak memory usage: 4.35 GiB.
```

ClickHouse가 객체 스토리지의 모든 Parquet 파일을 대상으로 전체 테이블 스캔을 수행해야 하므로 이 쿼리에는 거의 **9초**가 걸립니다. 파티션을 사용하면 성능을 개선할 수 있지만, `logger_name`과 같은 컬럼은 카디널리티가 너무 높아 파티션을 효과적으로 적용하기 어려울 수 있습니다. 또한 데이터를 추가로 걸러낼 수 있는 [텍스트 인덱스](/engines/table-engines/mergetree-family/mergetree#text)와 같은 인덱스도 없습니다. 바로 이런 부분에서 MergeTree가 강점을 발휘합니다.

## MergeTree에 데이터 적재 \{#load-data\}

### 최적화된 테이블 생성 \{#create-table\}

스키마를 최적화하도록 몇 가지를 고려해 MergeTree 테이블을 생성합니다. Iceberg 스키마와 비교하면 몇 가지 중요한 차이점이 있습니다.

* **`Nullable` 래퍼 없음** - `Nullable`을 제거하면 저장 효율과 쿼리 성능이 향상됩니다.
* **`level`, `instance_type`, `thread_name`, `check_name` 컬럼의 `LowCardinality(String)`** - 고유값이 적은 컬럼을 딕셔너리 인코딩하여 압축 효율을 높이고 필터링을 더 빠르게 수행합니다.
* **`message` 컬럼의 [전문 검색 인덱스](/engines/table-engines/mergetree-family/invertedindexes)** - `hasToken(message, 'error')`와 같은 토큰 기반 텍스트 검색을 가속화합니다.
* **`(instance_type, thread_name, toStartOfMinute(event_time))`의 `ORDER BY` 키** - 일반적인 필터 패턴에 맞게 디스크의 데이터를 정렬하여 [희소 기본 인덱스](/guides/best-practices/sparse-primary-indexes)가 관련 없는 그래뉼을 건너뛸 수 있도록 합니다.

```sql
SET enable_full_text_index = 1;

CREATE TABLE single_day_log
(
    `pull_request_number` Int64,
    `commit_sha` String,
    `check_start_time` DateTime64(6, 'UTC'),
    `check_name` LowCardinality(String),
    `instance_type` LowCardinality(String),
    `instance_id` String,
    `event_date` Date32,
    `event_time` DateTime64(6, 'UTC'),
    `event_time_microseconds` DateTime64(6, 'UTC'),
    `thread_name` LowCardinality(String),
    `thread_id` Decimal(20, 0),
    `level` LowCardinality(String),
    `query_id` String,
    `logger_name` String,
    `message` String,
    `revision` Int64,
    `source_file` String,
    `source_line` Decimal(20, 0),
    `message_format_string` String,
    INDEX text_idx(message) TYPE text(tokenizer = splitByNonAlpha)
)
ENGINE = MergeTree
ORDER BY (instance_type, thread_name, toStartOfMinute(event_time))
```

### 카탈로그에서 데이터 삽입 \{#insert-data\}

데이터 레이크 테이블의 약 3억 건 데이터를 ClickHouse 테이블에 적재하려면 `INSERT INTO SELECT`를 사용하십시오:

```sql
INSERT INTO single_day_log SELECT * FROM icebench.`icebench.single_day_log`

282634391 rows in set. Elapsed: 237.680 sec. Processed 282.63 million rows, 5.42 GB (1.19 million rows/s., 22.79 MB/s.)
Peak memory usage: 18.62 GiB.
```

## 쿼리 다시 실행 \{#reexecute-query\}

이제 동일한 쿼리를 MergeTree 테이블에서 다시 실행하면 성능이 크게 향상되는 것을 확인할 수 있습니다:

```sql
SELECT
    logger_name,
    count() AS c
FROM single_day_log
WHERE (thread_name = 'TCPHandler')
    AND (instance_type = 'm6i.4xlarge')
    AND hasToken(message, 'error')
GROUP BY logger_name
ORDER BY c DESC
LIMIT 5

┌─logger_name──────────────┬────c─┐
│ executeQuery             │ 6907 │
│ TCPHandler               │ 4145 │
│ TCP-Session              │  790 │
│ PostgreSQLConnectionPool │  530 │
│ ContextAccess (default)  │  392 │
└──────────────────────────┴──────┘

5 rows in set. Elapsed: 0.220 sec. Processed 13.84 million rows, 2.85 GB (62.97 million rows/s., 12.94 GB/s.)
Peak memory usage: 1.12 GiB.
```

이제 동일한 쿼리는 **0.22초** 만에 완료되며, **약 40배 빨라집니다**. 이러한 개선은 두 가지 핵심 최적화에 의해 가능합니다.

* **희소 기본 인덱스** - `ORDER BY (instance_type, thread_name, ...)` 키를 사용하면 ClickHouse가 `instance_type = 'm6i.4xlarge'` 및 `thread_name = 'TCPHandler'`에 해당하는 그래뉼로 바로 건너뛸 수 있으므로, 처리해야 하는 행 수가 2억 8,300만 개에서 1,400만 개로 줄어듭니다.
* **전문 검색 인덱스** - `message` 컬럼의 `text_idx` 인덱스를 사용하면 `hasToken(message, 'error')`를 모든 메시지 문자열을 스캔하는 대신 인덱스를 통해 처리할 수 있어, ClickHouse가 읽어야 하는 데이터가 더욱 줄어듭니다.

그 결과, 실시간 대시보드를 충분히 구동할 수 있는 쿼리가 되며, 객체 스토리지의 Parquet 파일을 쿼리하는 방식으로는 따라올 수 없는 규모와 지연 시간을 제공합니다.
