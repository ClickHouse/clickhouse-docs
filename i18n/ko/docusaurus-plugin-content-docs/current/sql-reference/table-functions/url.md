---
'description': '주어진 `format` 및 `structure`로 `URL`에서 테이블을 생성합니다.'
'sidebar_label': 'url'
'sidebar_position': 200
'slug': '/sql-reference/table-functions/url'
'title': 'url'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# url 테이블 함수

`url` 함수는 주어진 `format`과 `structure`로 `URL`에서 테이블을 생성합니다.

`url` 함수는 [URL](../../engines/table-engines/special/url.md) 테이블의 데이터에 대한 `SELECT` 및 `INSERT` 쿼리에서 사용할 수 있습니다.

## 구문 {#syntax}

```sql
url(URL [,format] [,structure] [,headers])
```

## 매개변수 {#parameters}

| 매개변수   | 설명                                                                                                                                                       |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URL`       | 단일 인용부호로 묶인 HTTP 또는 HTTPS 서버 주소로, `GET` 또는 `POST` 요청을 수락할 수 있는 주소입니다 (각각 `SELECT` 또는 `INSERT` 쿼리에 해당). 유형: [String](../../sql-reference/data-types/string.md).  |
| `format`    | 데이터의 [형식](/sql-reference/formats). 유형: [String](../../sql-reference/data-types/string.md).                                                               |
| `structure` | `'UserID UInt64, Name String'` 형식의 테이블 구조입니다. 컬럼 이름과 유형을 결정합니다. 유형: [String](../../sql-reference/data-types/string.md).                      |
| `headers`   | `'headers('key1'='value1', 'key2'='value2')'` 형식의 헤더입니다. HTTP 호출에 대한 헤더를 설정할 수 있습니다.                                             |

## 반환 값 {#returned_value}

지정된 형식과 구조의 테이블과 정의된 `URL`의 데이터입니다.

## 예제 {#examples}

[UInt32](../../sql-reference/data-types/int-uint.md) 유형의 `String` 컬럼을 포함하는 테이블의 처음 3줄을 HTTP 서버로부터 [CSV](/interfaces/formats/CSV) 형식으로 가져오는 방법.

```sql
SELECT * FROM url('http://127.0.0.1:12345/', CSV, 'column1 String, column2 UInt32', headers('Accept'='text/csv; charset=utf-8')) LIMIT 3;
```

`URL`에서 테이블로 데이터를 삽입하는 방법:

```sql
CREATE TABLE test_table (column1 String, column2 UInt32) ENGINE=Memory;
INSERT INTO FUNCTION url('http://127.0.0.1:8123/?query=INSERT+INTO+test_table+FORMAT+CSV', 'CSV', 'column1 String, column2 UInt32') VALUES ('http interface', 42);
SELECT * FROM test_table;
```

## URL의 글로브 {#globs-in-url}

중괄호 `{ }` 안의 패턴은 샤드 집합을 생성하거나 장애 조치 주소를 지정하는 데 사용됩니다. 지원되는 패턴 유형과 예제는 [remote](remote.md#globs-in-addresses) 함수의 설명에서 확인할 수 있습니다. 패턴 안의 `|` 문자는 장애 조치 주소를 지정하는 데 사용됩니다. 이러한 주소는 패턴에 나열된 순서와 동일한 순서로 반복됩니다. 생성된 주소의 수는 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 설정에 의해 제한됩니다.

## 가상 컬럼 {#virtual-columns}

- `_path` — `URL`의 경로입니다. 유형: `LowCardinality(String)`.
- `_file` — `URL`의 리소스 이름입니다. 유형: `LowCardinality(String)`.
- `_size` — 리소스의 크기(바이트)입니다. 유형: `Nullable(UInt64)`. 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간입니다. 유형: `Nullable(DateTime)`. 시간을 알 수 없는 경우 값은 `NULL`입니다.
- `_headers` - HTTP 응답 헤더입니다. 유형: `Map(LowCardinality(String), LowCardinality(String))`.

## use_hive_partitioning 설정 {#hive-style-partitioning}

`use_hive_partitioning` 설정이 1로 설정되면 ClickHouse는 경로(`name=value/`)에서 Hive 스타일 파티셔닝을 감지하고 쿼리에서 파티션 열을 가상 열로 사용할 수 있도록 허용합니다. 이러한 가상 열은 파티셔닝된 경로와 동일한 이름을 가지지만 `_`로 시작합니다.

**예제**

Hive 스타일 파티셔닝으로 생성된 가상 열 사용

```sql
SELECT * FROM url('http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## 저장 설정 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 읽는 동안 빈 파일을 건너뛸 수 있도록 합니다. 기본적으로 비활성화되어 있습니다.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI의 경로에서 디코딩/인코딩을 활성화/비활성화할 수 있도록 합니다. 기본적으로 활성화되어 있습니다.

## 권한 {#permissions}

`url` 함수는 `CREATE TEMPORARY TABLE` 권한이 필요합니다. 따라서 [readonly](/operations/settings/permissions-for-queries#readonly) = 1 설정이 있는 사용자에게는 작동하지 않습니다. 최소한 readonly = 2가 필요합니다.

## 관련 항목 {#related}

- [가상 열](/engines/table-engines/index.md#table_engines-virtual_columns)
