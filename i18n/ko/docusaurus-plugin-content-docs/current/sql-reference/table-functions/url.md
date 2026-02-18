---
description: '지정된 `format` 및 `structure`를 사용하여 `URL`에서 테이블을 생성합니다.'
sidebar_label: 'url'
sidebar_position: 200
slug: /sql-reference/table-functions/url
title: 'url'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url 테이블 함수 \{#url-table-function\}

`url` 함수는 지정된 `format` 및 `structure`를 사용하여 `URL`로부터 테이블을 생성합니다.

`url` 함수는 [URL](../../engines/table-engines/special/url.md) 테이블의 데이터에 대한 `SELECT` 및 `INSERT` 쿼리에서 사용할 수 있습니다.



## 구문 \{#syntax\}

```sql
url(URL [,format] [,structure] [,headers])
```


## 매개변수 \{#parameters\}

| Parameter   | Description                                                                                                                                            |
|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URL`       | `GET` 또는 `POST` 요청을 수신할 수 있는, 작은따옴표로 감싼 HTTP 또는 HTTPS 서버 주소입니다 (`SELECT` 또는 `INSERT` 쿼리에 각각 해당). 형식: [String](../../sql-reference/data-types/string.md). |
| `format`    | 데이터의 [형식](/sql-reference/formats)입니다. 형식: [String](../../sql-reference/data-types/string.md).                                                  |
| `structure` | `'UserID UInt64, Name String'` 형식의 테이블 구조입니다. 컬럼 이름과 타입을 결정합니다. 형식: [String](../../sql-reference/data-types/string.md).     |
| `headers`   | `'headers('key1'='value1', 'key2'='value2')'` 형식의 헤더입니다. HTTP 호출에 사용할 헤더를 설정할 수 있습니다.                                                  |



## 반환 값 \{#returned_value\}

지정한 형식과 구조를 가지며, 정의된 `URL`의 데이터를 포함하는 테이블입니다.



## 예시 \{#examples\}

[CSV](/interfaces/formats/CSV) 포맷으로 응답하는 HTTP 서버에서 `String` 및 [UInt32](../../sql-reference/data-types/int-uint.md) 타입의 컬럼을 포함하는 테이블의 처음 3개 행을 가져옵니다.

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL`에서 가져온 데이터를 테이블에 삽입:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```


## URL의 글롭 패턴 \{#globs-in-url\}

중괄호 `{ }` 안의 패턴은 세그먼트 집합을 생성하거나 장애 조치(failover) 주소를 지정하는 데 사용됩니다. 지원되는 패턴 유형과 예시는 [remote](remote.md#globs-in-addresses) 함수 설명을 참조하십시오.
패턴 내부의 문자 `|` 는 장애 조치 주소를 지정하는 데 사용됩니다. 이 주소들은 패턴에 나열된 순서대로 차례로 사용됩니다. 생성되는 주소 개수는 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 설정에 의해 제한됩니다.



## 가상 컬럼 \{#virtual-columns\}

- `_path` — `URL`의 경로입니다. 타입: `LowCardinality(String)`.
- `_file` — `URL`의 리소스 이름입니다. 타입: `LowCardinality(String)`.
- `_size` — 리소스의 크기(바이트 단위)입니다. 타입: `Nullable(UInt64)`. 크기를 알 수 없으면 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간입니다. 타입: `Nullable(DateTime)`. 시간을 알 수 없으면 값은 `NULL`입니다.
- `_headers` — HTTP 응답 헤더입니다. 타입: `Map(LowCardinality(String), LowCardinality(String))`.



## use_hive_partitioning 설정 \{#hive-style-partitioning\}

`use_hive_partitioning`을 1로 설정하면 ClickHouse는 경로(`/name=value/`)에서 Hive 스타일 파티션을 감지하고, 쿼리에서 파티션 컬럼을 가상 컬럼으로 사용할 수 있도록 허용합니다. 이러한 가상 컬럼은 파티션 경로에 있는 이름과 동일하지만 앞에 `_`가 붙습니다.

**예시**

Hive 스타일 파티션으로 생성된 가상 컬럼 사용

```sql
SELECT * FROM url('http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## 저장 설정 \{#storage-settings\}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 데이터를 읽을 때 비어 있는 파일을 건너뛸 수 있도록 허용합니다. 기본값은 비활성화입니다.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI 경로의 인코딩/디코딩을 활성화하거나 비활성화하도록 허용합니다. 기본값은 활성화입니다.



## 권한 \{#permissions\}

`url` 함수에는 `CREATE TEMPORARY TABLE` 권한이 필요합니다. 따라서 [readonly](/operations/settings/permissions-for-queries#readonly) = 1로 설정된 사용자에게는 동작하지 않습니다. 최소한 readonly 설정 값이 2 이상이어야 합니다.



## 관련 항목 \{#related\}

- [가상 컬럼](/engines/table-engines/index.md#table_engines-virtual_columns)
