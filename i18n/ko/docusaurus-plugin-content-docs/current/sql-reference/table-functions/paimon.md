---
description: 'Amazon S3, Azure, HDFS 또는 로컬에 저장된 Apache Paimon 테이블에 대해 읽기 전용 테이블과 유사한 인터페이스를 제공합니다.'
sidebar_label: 'paimon'
sidebar_position: 90
slug: /sql-reference/table-functions/paimon
title: 'paimon'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# paimon 테이블 함수 \{#paimon-table-function\}

<ExperimentalBadge />

Amazon S3, Azure, HDFS 또는 로컬에 저장된 Apache [Paimon](https://paimon.apache.org/) 테이블에 대한 읽기 전용 테이블 인터페이스를 제공합니다.



## 구문 \{#syntax\}

```sql
paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFS(path_to_table, [,format] [,compression_method])

paimonLocal(path_to_table, [,format] [,compression_method])
```


## Arguments \{#arguments\}

인수에 대한 설명은 각각 테이블 함수 `s3`, `azureBlobStorage`, `HDFS`, `file`에 대한 인수 설명과 동일합니다.  
`format`은 Paimon 테이블에서 사용되는 데이터 파일의 형식을 나타냅니다.

### Returned value \{#returned-value\}

지정된 Paimon 테이블에서 데이터를 읽기 위한, 지정된 구조를 가진 테이블입니다.



## 이름이 지정된 컬렉션 정의하기 \{#defining-a-named-collection\}

다음은 URL과 자격 증명을 저장하기 위한 이름이 지정된 컬렉션을 구성하는 예시입니다.

```xml
<clickhouse>
    <named_collections>
        <paimon_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </paimon_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM paimonS3(paimon_conf, filename = 'test_table')
DESCRIBE paimonS3(paimon_conf, filename = 'test_table')
```


## 별칭 \{#aliases\}

테이블 함수 `paimon`은 이제 `paimonS3`의 별칭입니다.



## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위). 타입: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시각. 타입: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.
- `_etag` — 파일의 etag. 타입: `LowCardinality(String)`. etag를 알 수 없는 경우 값은 `NULL`입니다.



## 지원되는 데이터 타입 \{#data-types-supported\}

| Paimon 데이터 타입 | ClickHouse 데이터 타입 
|-------|--------|
|BOOLEAN     |Int8      |
|TINYINT     |Int8      |
|SMALLINT     |Int16      |
|INTEGER     |Int32      |
|BIGINT     |Int64      |
|FLOAT     |Float32      |
|DOUBLE     |Float64      |
|STRING,VARCHAR,BYTES,VARBINARY     |String      |
|DATE     |Date      |
|TIME(p),TIME     |Time('UTC')      |
|TIMESTAMP(p) WITH LOCAL TIME ZONE     |DateTime64      |
|TIMESTAMP(p)     |DateTime64('UTC')      |
|CHAR     |FixedString(1)      |
|BINARY(n)     |FixedString(n)      |
|DECIMAL(P,S)     |Decimal(P,S)      |
|ARRAY     |Array      |
|MAP     |Map    |



## 지원되는 파티션 \{#partition-supported\}
Paimon 파티션 키에서 지원되는 데이터 타입은 다음과 같습니다:
* `CHAR`
* `VARCHAR`
* `BOOLEAN`
* `DECIMAL`
* `TINYINT`
* `SMALLINT`
* `INTEGER`
* `DATE`
* `TIME`
* `TIMESTAMP`
* `TIMESTAMP WITH LOCAL TIME ZONE`
* `BIGINT`
* `FLOAT`
* `DOUBLE`



## 함께 보기 \{#see-also\}

* [Paimon 클러스터 테이블 함수](/sql-reference/table-functions/paimonCluster.md)
