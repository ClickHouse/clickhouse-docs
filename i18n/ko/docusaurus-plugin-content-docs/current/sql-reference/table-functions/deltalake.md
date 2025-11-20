---
'description': 'Amazon S3에 있는 Delta Lake 테이블에 대한 읽기 전용 테이블과 유사한 인터페이스를 제공합니다.'
'sidebar_label': 'deltaLake'
'sidebar_position': 45
'slug': '/sql-reference/table-functions/deltalake'
'title': 'deltaLake'
'doc_type': 'reference'
---


# deltaLake 테이블 함수

Amazon S3, Azure Blob Storage 또는 로컬로 마운트된 파일 시스템의 [Delta Lake](https://github.com/delta-io/delta) 테이블에 대한 읽기 전용 테이블과 유사한 인터페이스를 제공합니다.

## 구문 {#syntax}

`deltaLake`는 호환성을 위해 `deltaLakeS3`의 별칭입니다.

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

deltaLakeLocal(path, [,format])
```

## 인수 {#arguments}

인수에 대한 설명은 테이블 함수 `s3`, `azureBlobStorage`, `HDFS` 및 `file`의 인수 설명과 일치합니다. `format`은 Delta Lake 테이블의 데이터 파일 형식을 나타냅니다.

## 반환 값 {#returned_value}

지정된 Delta Lake 테이블에서 데이터를 읽기 위해 지정된 구조의 테이블을 반환합니다.

## 예제 {#examples}

S3 `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/`에서 테이블의 행 선택:

```sql
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

```response
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일 경로. 유형: `LowCardinality(String)`.
- `_file` — 파일 이름. 유형: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트). 유형: `Nullable(UInt64)`. 파일 크기가 알려지지 않은 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간. 유형: `Nullable(DateTime)`. 시간이 알려지지 않은 경우 값은 `NULL`입니다.
- `_etag` — 파일의 etag. 유형: `LowCardinality(String)`. etag가 알려지지 않은 경우 값은 `NULL`입니다.

## 관련 {#related}

- [DeltaLake 엔진](engines/table-engines/integrations/deltalake.md)
- [DeltaLake 클러스터 테이블 함수](sql-reference/table-functions/deltalakeCluster.md)
