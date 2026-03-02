---
description: 'Amazon S3의 Delta Lake 테이블에 대해 테이블과 유사한 읽기 전용 인터페이스를 제공합니다.'
sidebar_label: 'deltaLake'
sidebar_position: 45
slug: /sql-reference/table-functions/deltalake
title: 'deltaLake'
doc_type: 'reference'
---

# deltaLake 테이블 함수 \{#deltalake-table-function\}

Amazon S3, Azure Blob Storage 또는 로컬로 마운트된 파일 시스템에 있는 [Delta Lake](https://github.com/delta-io/delta) 테이블에 대해 테이블 형식 인터페이스를 제공하며, v25.10부터 읽기와 쓰기 모두를 지원합니다.

## 구문 \{#syntax\}

`deltaLake`은(는) 호환성을 위해 제공되는 `deltaLakeS3`의 별칭입니다.

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

deltaLakeLocal(path, [,format])
```


## Arguments \{#arguments\}

이 테이블 함수의 인수는 각각 `s3`, `azureBlobStorage`, `HDFS`, `file` 테이블 함수의 인수와 동일합니다.  
`format` 인수는 Delta lake 테이블에서 데이터 파일의 형식을 나타냅니다.

## 반환 값 \{#returned_value\}

지정된 Delta Lake 테이블에서 데이터를 읽거나 해당 테이블로 데이터를 기록하기 위해, 지정된 구조를 가진 테이블을 반환합니다.

## 예제 \{#examples\}

### 데이터 읽기 \{#reading-data\}

`https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/` 위치의 S3 스토리지에 테이블이 있다고 가정합니다.
ClickHouse에서 이 테이블의 데이터를 읽으려면 다음 명령을 실행하십시오.

```sql title="Query"
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

```response title="Response"
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```


### 데이터 삽입 \{#inserting-data\}

`s3://ch-docs-s3-bucket/people_10k/` 경로의 S3 스토리지에 테이블이 있다고 가정합니다.
테이블에 데이터를 삽입하려면 먼저 실험적 기능을 활성화해야 합니다:

```sql
SET allow_experimental_delta_lake_writes=1
```

그런 다음 다음 내용을 작성합니다:

```sql title="Query"
INSERT INTO TABLE FUNCTION deltaLake('s3://ch-docs-s3-bucket/people_10k/', '<access_key>', '<secret>') VALUES (10001, 'John', 'Smith', 'Male', 30)
```

```response title="Response"
Query id: 09069b47-89fa-4660-9e42-3d8b1dde9b17

Ok.

1 row in set. Elapsed: 3.426 sec.
```

테이블을 다시 조회하여 INSERT가 정상적으로 수행되었는지 확인할 수 있습니다:

```sql title="Query"
SELECT *
FROM deltaLake('s3://ch-docs-s3-bucket/people_10k/', '<access_key>', '<secret>')
WHERE (firstname = 'John') AND (lastname = 'Smith')
```

```response title="Response"
Query id: 65032944-bed6-4d45-86b3-a71205a2b659

   ┌────id─┬─firstname─┬─lastname─┬─gender─┬─age─┐
1. │ 10001 │ John      │ Smith    │ Male   │  30 │
   └───────┴───────────┴──────────┴────────┴─────┘
```


## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로입니다. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름입니다. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위)입니다. 타입: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시각입니다. 타입: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.
- `_etag` — 파일의 etag입니다. 타입: `LowCardinality(String)`. etag를 알 수 없는 경우 값은 `NULL`입니다.

## 관련 문서 \{#related\}

- [DeltaLake 엔진](engines/table-engines/integrations/deltalake.md)
- [DeltaLake 클러스터 테이블 함수](sql-reference/table-functions/deltalakeCluster.md)