---
'description': 'ClickHouse에서 입력 데이터에 대한 자동 스키마 추론을 설명하는 페이지'
'sidebar_label': '스키마 추론'
'slug': '/interfaces/schema-inference'
'title': '입력 데이터에서 자동 스키마 추론'
'doc_type': 'reference'
---

ClickHouse는 거의 모든 지원되는 [입력 형식](formats.md)에서 입력 데이터의 구조를 자동으로 결정할 수 있습니다. 이 문서에서는 스키마 추론이 사용되는 시점, 다양한 입력 형식과의 작동 방식, 이를 제어할 수 있는 설정에 대해 설명합니다.

## 사용법 {#usage}

스키마 추론은 ClickHouse가 특정 데이터 형식으로 데이터를 읽어야 하며 구조가 알려지지 않은 경우에 사용됩니다.

## 테이블 함수 [file](../sql-reference/table-functions/file.md), [s3](../sql-reference/table-functions/s3.md), [url](../sql-reference/table-functions/url.md), [hdfs](../sql-reference/table-functions/hdfs.md), [azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md) {#table-functions-file-s3-url-hdfs-azureblobstorage}

이 테이블 함수들은 입력 데이터의 구조를 나타내는 선택적 인수 `structure`를 갖고 있습니다. 이 인수가 지정되지 않거나 `auto`로 설정되면, 구조는 데이터에서 추론됩니다.

**예제:**

`user_files` 디렉토리에 JSONEachRow 형식의 `hobbies.jsonl` 파일이 있고 다음과 같은 내용을 가진다고 가정해 보겠습니다:
```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

구조를 명시하지 않고도 ClickHouse는 이 데이터를 읽을 수 있습니다:
```sql
SELECT * FROM file('hobbies.jsonl')
```
```response
┌─id─┬─age─┬─name───┬─hobbies──────────────────────────┐
│  1 │  25 │ Josh   │ ['football','cooking','music']   │
│  2 │  19 │ Alan   │ ['tennis','art']                 │
│  3 │  32 │ Lana   │ ['fitness','reading','shopping'] │
│  4 │  47 │ Brayan │ ['movies','skydiving']           │
└────┴─────┴────────┴──────────────────────────────────┘
```

참고: `JSONEachRow` 형식은 파일 확장자 `.jsonl`에 의해 자동으로 결정되었습니다.

자동으로 결정된 구조는 `DESCRIBE` 쿼리를 사용하여 확인할 수 있습니다:
```sql
DESCRIBE file('hobbies.jsonl')
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## 테이블 엔진 [File](../engines/table-engines/special/file.md), [S3](../engines/table-engines/integrations/s3.md), [URL](../engines/table-engines/special/url.md), [HDFS](../engines/table-engines/integrations/hdfs.md), [azureBlobStorage](../engines/table-engines/integrations/azureBlobStorage.md) {#table-engines-file-s3-url-hdfs-azureblobstorage}

`CREATE TABLE` 쿼리에서 열 목록이 지정되지 않으면, 테이블의 구조는 데이터에서 자동으로 추론됩니다.

**예제:**

`s3`에 있는 `hobbies.jsonl` 파일을 사용합시다. 이 파일의 데이터를 사용하여 `File` 엔진으로 테이블을 생성할 수 있습니다:
```sql
CREATE TABLE hobbies ENGINE=File(JSONEachRow, 'hobbies.jsonl')
```
```response
Ok.
```
```sql
SELECT * FROM hobbies
```
```response
┌─id─┬─age─┬─name───┬─hobbies──────────────────────────┐
│  1 │  25 │ Josh   │ ['football','cooking','music']   │
│  2 │  19 │ Alan   │ ['tennis','art']                 │
│  3 │  32 │ Lana   │ ['fitness','reading','shopping'] │
│  4 │  47 │ Brayan │ ['movies','skydiving']           │
└────┴─────┴────────┴──────────────────────────────────┘
```
```sql
DESCRIBE TABLE hobbies
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## clickhouse-local {#clickhouse-local}

`clickhouse-local`은 입력 데이터의 구조를 나타내는 선택적 매개변수 `-S/--structure`를 갖고 있습니다. 이 매개변수가 지정되지 않거나 `auto`로 설정되면, 구조는 데이터에서 추론됩니다.

**예제:**

`hobbies.jsonl` 파일을 사용합시다. `clickhouse-local`을 사용하여 이 파일의 데이터에 쿼리할 수 있습니다:
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='DESCRIBE TABLE hobbies'
```
```response
id    Nullable(Int64)
age    Nullable(Int64)
name    Nullable(String)
hobbies    Array(Nullable(String))
```
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='SELECT * FROM hobbies'
```
```response
1    25    Josh    ['football','cooking','music']
2    19    Alan    ['tennis','art']
3    32    Lana    ['fitness','reading','shopping']
4    47    Brayan    ['movies','skydiving']
```

## 삽입 테이블에서 구조 사용하기 {#using-structure-from-insertion-table}

`file/s3/url/hdfs` 테이블 함수를 사용하여 테이블에 데이터를 삽입할 때,
데이터에서 추출하는 대신 삽입 테이블에서 구조를 사용할 수 있는 옵션이 있습니다.
스키마 추론에 시간이 소요될 수 있으므로 삽입 성능을 개선할 수 있습니다. 또한 테이블에 최적화된 스키마가 있는 경우
유형 간 변환이 수행되지 않으므로 도움이 됩니다.

이 동작을 제어하는 특별한 설정 [use_structure_from_insertion_table_in_table_functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions)가 있습니다.
3가지 가능한 값이 있습니다:
- 0 - 테이블 함수가 데이터에서 구조를 추출합니다.
- 1 - 테이블 함수가 삽입 테이블에서 구조를 사용합니다.
- 2 - ClickHouse가 삽입 테이블에서 구조를 사용할 수 있는지 또는 스키마 추론을 사용할지를 자동으로 결정합니다. 기본값입니다.

**예제 1:**

다음 구조로 `hobbies1` 테이블을 생성합시다:
```sql
CREATE TABLE hobbies1
(
    `id` UInt64,
    `age` LowCardinality(UInt8),
    `name` String,
    `hobbies` Array(String)
)
ENGINE = MergeTree
ORDER BY id;
```

그리고 `hobbies.jsonl` 파일에서 데이터를 삽입합시다:

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

이 경우, 파일의 모든 열이 변경 없이 테이블에 삽입되므로 ClickHouse는 스키마 추론 대신 삽입 테이블에서 구조를 사용할 것입니다.

**예제 2:**

다음 구조로 `hobbies2` 테이블을 생성합시다:
```sql
CREATE TABLE hobbies2
(
  `id` UInt64,
  `age` LowCardinality(UInt8),
  `hobbies` Array(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

그리고 `hobbies.jsonl` 파일에서 데이터를 삽입합시다:

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

이 경우, `SELECT` 쿼리의 모든 열이 테이블에 존재하므로 ClickHouse는 삽입 테이블에서 구조를 사용할 것입니다.
이것은 JSONEachRow, TSKV, Parquet 등과 같이 열의 하위 집합을 읽는 것을 지원하는 입력 형식에서만 작동합니다. (예: TSV 형식에서는 작동하지 않습니다.)

**예제 3:**

다음 구조로 `hobbies3` 테이블을 생성합시다:

```sql
CREATE TABLE hobbies3
(
  `identifier` UInt64,
  `age` LowCardinality(UInt8),
  `hobbies` Array(String)
)
  ENGINE = MergeTree
ORDER BY identifier;
```

그리고 `hobbies.jsonl` 파일에서 데이터를 삽입합시다:

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

이 경우, `SELECT` 쿼리에서 `id` 열이 사용되지만, 테이블에는 이 열이 없고 (이름이 `identifier`인 열이 있음) 따라서 ClickHouse는 삽입 테이블에서 구조를 사용할 수 없으며 스키마 추론이 사용될 것입니다.

**예제 4:**

다음 구조로 `hobbies4` 테이블을 생성합시다:

```sql
CREATE TABLE hobbies4
(
  `id` UInt64,
  `any_hobby` Nullable(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

그리고 `hobbies.jsonl` 파일에서 데이터를 삽입합시다:

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

이 경우, `SELECT` 쿼리에서 `hobbies` 열에 대해 일부 작업이 수행되므로 ClickHouse는 삽입 테이블에서 구조를 사용할 수 없으며 스키마 추론이 사용될 것입니다.

## 스키마 추론 캐시 {#schema-inference-cache}

대부분의 입력 형식에서 스키마 추론은 일부 데이터를 읽어 구조를 결정하며 이 과정은 시간이 걸릴 수 있습니다. 
ClickHouse가 동일한 파일에서 데이터를 읽을 때마다 동일한 스키마를 추론하지 않도록 하기 위해, 추론된 스키마는 캐시되며 동일한 파일에 다시 접근할 때 ClickHouse는 캐시에서 스키마를 사용합니다.

이 캐시를 제어하는 특별한 설정이 있습니다:
- `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` - 해당 테이블 함수에 대해 캐시된 스키마의 최대 수입니다. 기본값은 `4096`입니다. 이러한 설정은 서버 구성에 설정해야 합니다.
- `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` - 스키마 추론을 위한 캐시 사용 여부를 켜거나 끌 수 있습니다. 이러한 설정은 쿼리에서 사용할 수 있습니다.

파일의 스키마는 데이터를 수정하거나 형식 설정을 변경하여 변경할 수 있습니다. 
이러한 이유로, 스키마 추론 캐시는 파일 출처, 형식 이름, 사용된 형식 설정 및 파일의 마지막 수정 시간에 따라 스키마를 식별합니다.

참고: `url` 테이블 함수에서 URL로 접근하는 일부 파일은 마지막 수정 시간에 대한 정보를 포함하지 않을 수 있습니다. 이러한 경우, 
특별한 설정 `schema_inference_cache_require_modification_time_for_url`이 있습니다. 이 설정을 비활성화하면 이러한 파일의 경우 마지막 수정 시간 없이 캐시에서 스키마를 사용할 수 있습니다.

또한 캐시에 있는 모든 현재 스키마를 가진 시스템 테이블 [schema_inference_cache](../operations/system-tables/schema_inference_cache.md)와 시스템 쿼리 `SYSTEM DROP SCHEMA CACHE [FOR File/S3/URL/HDFS]`가 있으며, 
이는 모든 출처 또는 특정 출처에 대해 스키마 캐시를 정리할 수 있습니다.

**예제:**

S3 `github-2022.ndjson.gz`의 샘플 데이터셋에서 구조를 추론해 보고 스키마 추론 캐시가 어떻게 작동하는지 살펴보겠습니다:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
```
```response
┌─name───────┬─type─────────────────────────────────────────┐
│ type       │ Nullable(String)                             │
│ actor      │ Tuple(                                      ↴│
│            │↳    avatar_url Nullable(String),            ↴│
│            │↳    display_login Nullable(String),         ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    login Nullable(String),                 ↴│
│            │↳    url Nullable(String))                    │
│ repo       │ Tuple(                                      ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    name Nullable(String),                  ↴│
│            │↳    url Nullable(String))                    │
│ created_at │ Nullable(String)                             │
│ payload    │ Tuple(                                      ↴│
│            │↳    action Nullable(String),                ↴│
│            │↳    distinct_size Nullable(Int64),          ↴│
│            │↳    pull_request Tuple(                     ↴│
│            │↳        author_association Nullable(String),↴│
│            │↳        base Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        head Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        number Nullable(Int64),             ↴│
│            │↳        state Nullable(String),             ↴│
│            │↳        title Nullable(String),             ↴│
│            │↳        updated_at Nullable(String),        ↴│
│            │↳        user Tuple(                         ↴│
│            │↳            login Nullable(String))),       ↴│
│            │↳    ref Nullable(String),                   ↴│
│            │↳    ref_type Nullable(String),              ↴│
│            │↳    size Nullable(Int64))                    │
└────────────┴──────────────────────────────────────────────┘
5 rows in set. Elapsed: 0.601 sec.
```
```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
```
```response
┌─name───────┬─type─────────────────────────────────────────┐
│ type       │ Nullable(String)                             │
│ actor      │ Tuple(                                      ↴│
│            │↳    avatar_url Nullable(String),            ↴│
│            │↳    display_login Nullable(String),         ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    login Nullable(String),                 ↴│
│            │↳    url Nullable(String))                    │
│ repo       │ Tuple(                                      ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    name Nullable(String),                  ↴│
│            │↳    url Nullable(String))                    │
│ created_at │ Nullable(String)                             │
│ payload    │ Tuple(                                      ↴│
│            │↳    action Nullable(String),                ↴│
│            │↳    distinct_size Nullable(Int64),          ↴│
│            │↳    pull_request Tuple(                     ↴│
│            │↳        author_association Nullable(String),↴│
│            │↳        base Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        head Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        number Nullable(Int64),             ↴│
│            │↳        state Nullable(String),             ↴│
│            │↳        title Nullable(String),             ↴│
│            │↳        updated_at Nullable(String),        ↴│
│            │↳        user Tuple(                         ↴│
│            │↳            login Nullable(String))),       ↴│
│            │↳    ref Nullable(String),                   ↴│
│            │↳    ref_type Nullable(String),              ↴│
│            │↳    size Nullable(Int64))                    │
└────────────┴──────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.059 sec.
```

보시다시피, 두 번째 쿼리는 거의 즉시 성공했습니다.

추론된 스키마에 영향을 미칠 수 있는 일부 설정을 변경해 보겠습니다:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS input_format_json_try_infer_named_tuples_from_objects=0, input_format_json_read_objects_as_strings = 1

┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String) │              │                    │         │                  │                │
│ actor      │ Nullable(String) │              │                    │         │                  │                │
│ repo       │ Nullable(String) │              │                    │         │                  │                │
│ created_at │ Nullable(String) │              │                    │         │                  │                │
│ payload    │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5 rows in set. Elapsed: 0.611 sec
```

보시다시피, 추론된 스키마에 영향을 미칠 수 있는 설정이 변경되었기 때문에 동일한 파일에 대해 캐시에서 스키마가 사용되지 않았습니다.

`system.schema_inference_cache` 테이블의 내용을 확인해 보겠습니다:

```sql
SELECT schema, format, source FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─schema──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─format─┬─source───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ type Nullable(String), actor Tuple(avatar_url Nullable(String), display_login Nullable(String), id Nullable(Int64), login Nullable(String), url Nullable(String)), repo Tuple(id Nullable(Int64), name Nullable(String), url Nullable(String)), created_at Nullable(String), payload Tuple(action Nullable(String), distinct_size Nullable(Int64), pull_request Tuple(author_association Nullable(String), base Tuple(ref Nullable(String), sha Nullable(String)), head Tuple(ref Nullable(String), sha Nullable(String)), number Nullable(Int64), state Nullable(String), title Nullable(String), updated_at Nullable(String), user Tuple(login Nullable(String))), ref Nullable(String), ref_type Nullable(String), size Nullable(Int64)) │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
│ type Nullable(String), actor Nullable(String), repo Nullable(String), created_at Nullable(String), payload Nullable(String)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

보시다시피, 동일한 파일에 대해 두 개의 서로 다른 스키마가 있습니다.

시스템 쿼리를 사용하여 스키마 캐시를 지울 수 있습니다:
```sql
SYSTEM DROP SCHEMA CACHE FOR S3
```
```response
Ok.
```
```sql
SELECT count() FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─count()─┐
│       0 │
└─────────┘
```

## 텍스트 형식 {#text-formats}

텍스트 형식에서는 ClickHouse가 데이터를 행 단위로 읽고, 형식에 따라 컬럼 값을 추출한 다음, 각 값의 유형을 결정하기 위해 일부 재귀 파서와 휴리스틱을 사용합니다. 
스키마 추론에서 읽은 최대 행 수 및 바이트 수는 설정 `input_format_max_rows_to_read_for_schema_inference` (기본값 25000) 및 `input_format_max_bytes_to_read_for_schema_inference` (기본값 32Mb)로 관리됩니다.
기본적으로, 모든 추론된 유형은 [Nullable](../sql-reference/data-types/nullable.md)로 간주되지만, `schema_inference_make_columns_nullable`을 설정하여 변경할 수 있습니다 (자세한 내용은 [설정](#settings-for-text-formats) 섹션을 참조하십시오).

### JSON 형식 {#json-formats}

JSON 형식에서 ClickHouse는 JSON 사양에 따라 값을 구문 분석한 후, 가장 적합한 데이터 유형을 찾으려고 시도합니다.

어떻게 작동하는지, 어떤 유형을 추론할 수 있는지, JSON 형식에서 사용할 수 있는 특정 설정은 무엇인지 살펴보겠습니다.

**예제**

여기에서 더 이상 [format](../sql-reference/table-functions/format.md) 테이블 함수가 사용됩니다.

정수, 플롯, 불리안, 문자열:
```sql
DESC format(JSONEachRow, '{"int" : 42, "float" : 42.42, "string" : "Hello, World!"}');
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

날짜, 날짜/시간:

```sql
DESC format(JSONEachRow, '{"date" : "2022-01-01", "datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}')
```
```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date       │ Nullable(Date)          │              │                    │         │                  │                │
│ datetime   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열:
```sql
DESC format(JSONEachRow, '{"arr" : [1, 2, 3], "nested_arrays" : [[1, 2, 3], [4, 5, 6], []]}')
```
```response
┌─name──────────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr           │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ nested_arrays │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열에 `null`이 포함되어 있으면 ClickHouse는 다른 배열 요소의 유형을 사용합니다:
```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열에 서로 다른 유형의 값이 포함되어 있고 설정 `input_format_json_infer_array_of_dynamic_from_array_of_different_types`가 활성화된 경우 (기본적으로 활성화됨), 
그 배열은 `Array(Dynamic)` 유형을 가집니다:
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=1;
DESC format(JSONEachRow, '{"arr" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Dynamic) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

이름이 지정된 튜플:

설정 `input_format_json_try_infer_named_tuples_from_objects`가 활성화되면 스키마 추론 중에 ClickHouse는 JSON 객체에서 이름이 지정된 튜플을 추론하려고 시도합니다.
결과적으로 만들어진 이름이 지정된 튜플은 샘플 데이터의 모든 해당 JSON 객체의 모든 요소를 포함합니다.

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

이름이 없는 튜플:

설정 `input_format_json_infer_array_of_dynamic_from_array_of_different_types`가 비활성화된 경우, 
우리는 JSON 형식에서 서로 다른 유형의 요소를 가진 배열을 이름이 없는 튜플로 취급합니다.
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types = 0;
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

일부 값이 `null`이거나 비어 있는 경우, 우리는 다른 행의 해당 값에서 유형을 사용합니다:
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=0;
DESC format(JSONEachRow, $$
                              {"tuple" : [1, null, null]}
                              {"tuple" : [null, "Hello, World!", []]}
                              {"tuple" : [null, null, [1, 2, 3]]}
                         $$)
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

맵:

JSON에서 우리는 동일한 유형의 값을 가진 객체를 맵 유형으로 읽을 수 있습니다.
참고: 이 작업은 설정 `input_format_json_read_objects_as_strings` 및 `input_format_json_try_infer_named_tuples_from_objects`가 비활성화된 경우에만 작동합니다.

```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

중첩된 복합 유형:
```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse가 특정 키의 유형을 결정할 수 없는 경우(데이터에 오직 null/빈 객체/빈 배열만 포함되어 있는 경우), 
`input_format_json_infer_incomplete_types_as_strings` 설정이 활성화된 경우에는 `String` 유형이 사용되며, 그렇지 않으면 예외가 발생합니다:
```sql
DESC format(JSONEachRow, '{"arr" : [null, null]}') SETTINGS input_format_json_infer_incomplete_types_as_strings = 1;
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(String)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, '{"arr" : [null, null]}') SETTINGS input_format_json_infer_incomplete_types_as_strings = 0;
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'arr' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

#### JSON 설정 {#json-settings}
##### input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}

이 설정을 활성화하면 문자열 값에서 숫자를 추론할 수 있습니다.

기본적으로 이 설정은 비활성화되어 있습니다.

**예제:**

```sql
SET input_format_json_try_infer_numbers_from_strings = 1;
DESC format(JSONEachRow, $$
                              {"value" : "42"}
                              {"value" : "424242424242"}
                         $$)
```
```response
┌─name──┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(Int64) │              │                    │         │                  │                │
└───────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_try_infer_named_tuples_from_objects {#input_format_json_try_infer_named_tuples_from_objects}

이 설정을 활성화하면 JSON 객체에서 이름이 지정된 튜플을 추론할 수 있습니다. 결과적으로 만들어진 이름이 지정된 튜플은 샘플 데이터의 모든 해당 JSON 객체의 모든 요소를 포함합니다.
JSON 데이터가 드물지 않으므로 데이터 샘플에 모든 가능한 객체 키가 포함될 것입니다.

기본적으로 이 설정은 활성화되어 있습니다.

**예제**

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

결과:

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"array" : [{"a" : 42, "b" : "Hello"}, {}, {"c" : [1,2,3]}, {"d" : "2020-01-01"}]}')
```

결과:

```markdown
┌─name──┬─type────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ array │ Array(Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Nullable(Date))) │              │                    │         │                  │                │
└───────┴─────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

이 설정을 활성화하면 이름이 지정된 튜플을 JSON 객체에서 추론할 때 모호한 경로에 대해 문자열 유형을 사용할 수 있습니다 (설정 `input_format_json_try_infer_named_tuples_from_objects`가 활성화될 때) 
대신 예외가 발생합니다. 이는 모호한 경로가 있는 경우에도 JSON 객체를 이름이 지정된 튜플로 읽을 수 있게 합니다.

기본적으로 비활성화되어 있습니다.

**예제**

비활성화된 설정으로:
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 0;
DESC format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```
결과:

```response
Code: 636. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'a' has type 'Int64' and in some - 'Tuple(b String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'a'. (INCORRECT_DATA) (version 24.3.1.1).
You can specify the structure manually. (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

활성화된 설정으로:
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : "a" : 42}, {"obj" : {"a" : {"b" : "Hello"}}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```

결과:
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(String))     │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
┌─obj─────────────────┐
│ ('42')              │
│ ('{"b" : "Hello"}') │
└─────────────────────┘
```
##### input_format_json_read_objects_as_strings {#input_format_json_read_objects_as_strings}

이 설정을 활성화하면 중첩된 JSON 객체를 문자열로 읽을 수 있습니다.
이 설정은 JSON 객체 유형을 사용하지 않고 중첩된 JSON 객체를 읽기 위해 사용될 수 있습니다.

기본적으로 이 설정은 활성화되어 있습니다.

참고: 이 설정을 활성화하면 설정 `input_format_json_try_infer_named_tuples_from_objects`가 비활성화된 경우에만 효과가 있습니다.

```sql
SET input_format_json_read_objects_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, $$
                             {"obj" : {"key1" : 42, "key2" : [1,2,3,4]}}
                             {"obj" : {"key3" : {"nested_key" : 1}}}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}

이 설정을 활성화하면 숫자 값을 문자열로 읽을 수 있습니다.

기본적으로 이 설정은 활성화되어 있습니다.

**예제**

```sql
SET input_format_json_read_numbers_as_strings = 1;
DESC format(JSONEachRow, $$
                                {"value" : 1055}
                                {"value" : "unknown"}
                         $$)
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(String) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}

이 설정을 활성화하면 불리언 값을 숫자로 읽을 수 있습니다.

기본적으로 이 설정은 활성화되어 있습니다.

**예제:**

```sql
SET input_format_json_read_bools_as_numbers = 1;
DESC format(JSONEachRow, $$
                                {"value" : true}
                                {"value" : 42}
                         $$)
```
```response
┌─name──┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(Int64) │              │                    │         │                  │                │
└───────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}

이 설정을 활성화하면 불리언 값을 문자열로 읽을 수 있습니다.

기본적으로 이 설정은 활성화되어 있습니다.

**예제:**

```sql
SET input_format_json_read_bools_as_strings = 1;
DESC format(JSONEachRow, $$
                                {"value" : true}
                                {"value" : "Hello, World"}
                         $$)
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(String) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_arrays_as_strings {#input_format_json_read_arrays_as_strings}

이 설정을 활성화하면 JSON 배열 값을 문자열로 읽을 수 있습니다.

기본적으로 이 설정은 활성화되어 있습니다.

**예제**

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```
```response
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```
##### input_format_json_infer_incomplete_types_as_strings {#input_format_json_infer_incomplete_types_as_strings}

이 설정을 활성화하면 스키마 추론 중에 데이터 샘플에 `Null`/`{}`/`[]`만 포함된 JSON 키에 대해 문자열 유형을 사용할 수 있습니다.
JSON 형식에서는 모든 값이 문자열로 읽힐 수 있으며(모든 해당 설정이 활성화되어 있다면), 
스키마 추론 동안 `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps`와 같은 오류를 피할 수 있으며 알려지지 않은 유형의 키에 대해서는 문자열 유형을 사용할 수 있습니다.

예제:

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

결과:
```markdown
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

### CSV {#csv}

CSV 형식에서 ClickHouse는 구분 기호에 따라 행에서 컬럼 값을 추출합니다. ClickHouse는 숫자 및 문자열을 제외한 모든 유형이 큰따옴표로 묶여 있기를 기대합니다. 
값이 큰따옴표로 묶여 있는 경우, ClickHouse는 재귀 파서를 사용하여 따옴표 안의 데이터를 구문 분석하려고 시도한 다음, 가장 적합한 데이터 유형을 찾으려고 합니다. 
값이 큰따옴표로 묶여 있지 않으면 ClickHouse는 숫자로 구문 분석하려고 시도하며, 만약 값이 숫자가 아니면 ClickHouse는 이를 문자열로 처리합니다.

ClickHouse가 복합 유형을 결정하는 것을 원하지 않는 경우, 설정 `input_format_csv_use_best_effort_in_schema_inference`를 비활성화하면 ClickHouse는 
모든 컬럼을 문자열로 처리합니다.

설정 `input_format_csv_detect_header`가 활성화되어 있으면 ClickHouse는 스키마를 추론하는 동안 열 이름(및 아마도 유형)을 감지하려고 시도합니다. 
이 설정은 기본적으로 활성화되어 있습니다.

**예제:**

정수, 플롯, 불리안, 문자열:
```sql
DESC format(CSV, '42,42.42,true,"Hello,World!"')
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

따옴표 없이 문자열:
```sql
DESC format(CSV, 'Hello world!,World hello!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

날짜, 날짜/시간:

```sql
DESC format(CSV, '"2020-01-01","2020-01-01 00:00:00","2022-01-01 00:00:00.000"')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열:
```sql
DESC format(CSV, '"[1,2,3]","[[1, 2], [], [3, 4]]"')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(CSV, $$"['Hello', 'world']","[['Abc', 'Def'], []]"$$)
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열에 null이 포함되어 있으면 ClickHouse는 다른 배열 요소의 유형을 사용합니다:
```sql
DESC format(CSV, '"[NULL, 42, NULL]"')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

맵:
```sql
DESC format(CSV, $$"{'key1' : 42, 'key2' : 24}"$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

중첩된 배열과 맵:
```sql
DESC format(CSV, $$"[{'key1' : [[42, 42], []], 'key2' : [[null], [42]]}]"$$)
```
```response
┌─name─┬─type──────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Array(Nullable(Int64))))) │              │                    │         │                  │                │
└──────┴───────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse가 인용 부호 안에서 유형을 결정할 수 없으면 데이터에 null만 포함되어 있는 경우 ClickHouse는 이를 문자열로 처리합니다:
```sql
DESC format(CSV, '"[NULL, NULL]"')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

예제, 설정 `input_format_csv_use_best_effort_in_schema_inference`가 비활성화된 경우:
```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
DESC format(CSV, '"[1,2,3]",42.42,Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

헤더 자동 탐지 예제 (설정 `input_format_csv_detect_header`가 활성화된 경우):

이름만:
```sql
SELECT * FROM format(CSV,
$$"number","string","array"
42,"Hello","[1, 2, 3]"
43,"World","[4, 5, 6]"
$$)
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

이름과 유형:

```sql
DESC format(CSV,
$$"number","string","array"
"UInt32","String","Array(UInt16)"
42,"Hello","[1, 2, 3]"
43,"World","[4, 5, 6]"
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

헤더는 적어도 비문자 유형의 열이 하나 이상 있을 때만 탐지될 수 있습니다. 모든 열이 문자열 유형이면 헤더는 탐지되지 않습니다:

```sql
SELECT * FROM format(CSV,
$$"first_column","second_column"
"Hello","World"
"World","Hello"
$$)
```

```response
┌─c1───────────┬─c2────────────┐
│ first_column │ second_column │
│ Hello        │ World         │
│ World        │ Hello         │
└──────────────┴───────────────┘
```

#### CSV 설정 {#csv-settings}
##### input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}

이 설정을 활성화하면 문자열 값에서 숫자를 추론할 수 있습니다.

기본적으로 이 설정은 비활성화되어 있습니다.

**예제:**

```sql
SET input_format_json_try_infer_numbers_from_strings = 1;
DESC format(CSV, '42,42.42');
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### TSV/TSKV {#tsv-tskv}

TSV/TSKV 형식에서 ClickHouse는 표 형태 구분 기호에 따라 행에서 컬럼 값을 추출하고, 
그런 다음 추출된 값을 재귀 파서를 사용하여 가장 적합한 유형을 판단합니다. 
유형을 결정할 수 없는 경우, ClickHouse는 이 값을 문자열로 처리합니다.

ClickHouse가 복합 유형을 결정하는 것을 원하지 않는 경우, 설정 `input_format_tsv_use_best_effort_in_schema_inference`를 비활성화하면 ClickHouse는 
모든 컬럼을 문자열로 처리합니다.

설정 `input_format_tsv_detect_header`가 활성화되어 있으면 ClickHouse는 스키마를 추론하는 동안 열 이름(및 아마도 유형)을 감지하려고 시도합니다. 
이 설정은 기본적으로 활성화되어 있습니다.

**예제:**

정수, 플롯, 불리안, 문자열:
```sql
DESC format(TSV, '42    42.42    true    Hello,World!')
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSKV, 'int=42    float=42.42    bool=true    string=Hello,World!\n')
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

날짜, 날짜/시간:

```sql
DESC format(TSV, '2020-01-01    2020-01-01 00:00:00    2022-01-01 00:00:00.000')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열:
```sql
DESC format(TSV, '[1,2,3]    [[1, 2], [], [3, 4]]')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSV, '[''Hello'', ''world'']    [[''Abc'', ''Def''], []]')
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열에 null이 포함되어 있으면 ClickHouse는 다른 배열 요소의 유형을 사용합니다:
```sql
DESC format(TSV, '[NULL, 42, NULL]')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

튜플:
```sql
DESC format(TSV, $$(42, 'Hello, world!')$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

맵:
```sql
DESC format(TSV, $${'key1' : 42, 'key2' : 24}$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

중첩된 배열, 튜플 및 맵:
```sql
DESC format(TSV, $$[{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}]$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse가 유형을 결정할 수 없는 경우(데이터가 null만 포함되는 경우), ClickHouse는 이를 문자열로 처리합니다:
```sql
DESC format(TSV, '[NULL, NULL]')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

설정 `input_format_tsv_use_best_effort_in_schema_inference`가 비활성화된 예제:
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

헤더 자동 탐지 예제 (설정 `input_format_tsv_detect_header`가 활성화된 경우):

이름만:
```sql
SELECT * FROM format(TSV,
$$number    string    array
42    Hello    [1, 2, 3]
43    World    [4, 5, 6]
$$);
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

이름과 유형:

```sql
DESC format(TSV,
$$number    string    array
UInt32    String    Array(UInt16)
42    Hello    [1, 2, 3]
43    World    [4, 5, 6]
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

헤더는 적어도 비문자 유형의 열이 하나 이상 있을 때만 탐지될 수 있습니다. 모든 열이 문자열 유형이면 헤더는 탐지되지 않습니다:

```sql
SELECT * FROM format(TSV,
$$first_column    second_column
Hello    World
World    Hello
$$)
```

```response
┌─c1───────────┬─c2────────────┐
│ first_column │ second_column │
│ Hello        │ World         │
│ World        │ Hello         │
└──────────────┴───────────────┘
```

### 값 {#values}

값 형식에서 ClickHouse는 행에서 컬럼 값을 추출한 다음 리터럴을 구문 분석하는 방법과 유사하게 
재귀 파서를 사용하여 이를 구문 분석합니다.

**예제:**

정수, 플롯, 불리안, 문자열:
```sql
DESC format(Values, $$(42, 42.42, true, 'Hello,World!')$$)
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

날짜, 날짜/시간:

```sql
DESC format(Values, $$('2020-01-01', '2020-01-01 00:00:00', '2022-01-01 00:00:00.000')$$)
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열:
```sql
DESC format(Values, '([1,2,3], [[1, 2], [], [3, 4]])')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열에 null이 포함되어 있으면 ClickHouse는 다른 배열 요소의 유형을 사용합니다:
```sql
DESC format(Values, '([NULL, 42, NULL])')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

튜플:
```sql
DESC format(Values, $$((42, 'Hello, world!'))$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

맵:
```sql
DESC format(Values, $$({'key1' : 42, 'key2' : 24})$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

중첩된 배열, 튜플 및 맵:
```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

ClickHouse가 유형을 결정할 수 없는 경우(데이터가 null만 포함될 경우), 예외가 발생합니다:
```sql
DESC format(Values, '([NULL, NULL])')
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'c1' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

설정 `input_format_tsv_use_best_effort_in_schema_inference`가 비활성화된 예제:
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### 사용자 정의 구분 기호 {#custom-separated}

사용자 정의 구분 기호 형식에서 ClickHouse는 먼저 지정된 구분 기호에 따라 행에서 모든 컬럼 값을 추출한 다음 
escaping 규칙에 따라 각 값의 데이터 유형을 추론하려고 시도합니다.

설정 `input_format_custom_detect_header`가 활성화되어 있으면 ClickHouse는 스키마를 추론하는 동안 열 이름 (및 아마도 유형)을 감지하려고 시도합니다. 
이 설정은 기본적으로 활성화되어 있습니다.

**예제**

```sql
SET format_custom_row_before_delimiter = '<row_before_delimiter>',
       format_custom_row_after_delimiter = '<row_after_delimiter>\n',
       format_custom_row_between_delimiter = '<row_between_delimiter>\n',
       format_custom_result_before_delimiter = '<result_before_delimiter>\n',
       format_custom_result_after_delimiter = '<result_after_delimiter>\n',
       format_custom_field_delimiter = '<field_delimiter>',
       format_custom_escaping_rule = 'Quoted'

DESC format(CustomSeparated, $$<result_before_delimiter>
<row_before_delimiter>42.42<field_delimiter>'Some string 1'<field_delimiter>[1, NULL, 3]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>NULL<field_delimiter>'Some string 3'<field_delimiter>[1, 2, NULL]<row_after_delimiter>
<result_after_delimiter>
$$)
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Float64)      │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

헤더 자동 탐지 예제(설정 `input_format_custom_detect_header`가 활성화된 경우):

```sql
SET format_custom_row_before_delimiter = '<row_before_delimiter>',
       format_custom_row_after_delimiter = '<row_after_delimiter>\n',
       format_custom_row_between_delimiter = '<row_between_delimiter>\n',
       format_custom_result_before_delimiter = '<result_before_delimiter>\n',
       format_custom_result_after_delimiter = '<result_after_delimiter>\n',
       format_custom_field_delimiter = '<field_delimiter>',
       format_custom_escaping_rule = 'Quoted'

DESC format(CustomSeparated, $$<result_before_delimiter>
<row_before_delimiter>'number'<field_delimiter>'string'<field_delimiter>'array'<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>42.42<field_delimiter>'Some string 1'<field_delimiter>[1, NULL, 3]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>NULL<field_delimiter>'Some string 3'<field_delimiter>[1, 2, NULL]<row_after_delimiter>
<result_after_delimiter>
$$)
```

```response
┌─number─┬─string────────┬─array──────┐
│  42.42 │ Some string 1 │ [1,NULL,3] │
│   ᴺᵁᴸᴸ │ Some string 3 │ [1,2,NULL] │
└────────┴───────────────┴────────────┘
```

### 템플릿 {#template}

템플릿 형식에서 ClickHouse는 먼저 지정된 템플릿에 따라 행에서 모든 컬럼 값을 추출한 다음 
escaping 규칙에 따라 각 값의 데이터 유형을 추론하려고 시도합니다.

**예제**

`resultset` 파일이 다음 내용을 가진다고 가정해 보겠습니다:
```bash
<result_before_delimiter>
${data}<result_after_delimiter>
```

그리고 `row_format` 파일이 다음 내용을 가진다고 가정해 보겠습니다:

```text
<row_before_delimiter>${column_1:CSV}<field_delimiter_1>${column_2:Quoted}<field_delimiter_2>${column_3:JSON}<row_after_delimiter>
```

그런 다음 다음 쿼리를 수행할 수 있습니다:

```sql
SET format_template_rows_between_delimiter = '<row_between_delimiter>\n',
       format_template_row = 'row_format',
       format_template_resultset = 'resultset_format'

DESC format(Template, $$<result_before_delimiter>
<row_before_delimiter>42.42<field_delimiter_1>'Some string 1'<field_delimiter_2>[1, null, 2]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>\N<field_delimiter_1>'Some string 3'<field_delimiter_2>[1, 2, null]<row_after_delimiter>
<result_after_delimiter>
$$)
```
```response
┌─name─────┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ column_1 │ Nullable(Float64)      │              │                    │         │                  │                │
│ column_2 │ Nullable(String)       │              │                    │         │                  │                │
│ column_3 │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### 정규 표현식 {#regexp}

템플릿과 유사하게 정규 표현식 형식에서 ClickHouse는 먼저 지정된 정규 표현식에 따라 행에서 모든 컬럼 값을 추출한 다음 
지정된 escaping 규칙에 따라 각 값의 데이터 유형을 추론하려고 시도합니다.

**예제**

```sql
SET format_regexp = '^Line: value_1=(.+?), value_2=(.+?), value_3=(.+?)',
       format_regexp_escaping_rule = 'CSV'

DESC format(Regexp, $$Line: value_1=42, value_2="Some string 1", value_3="[1, NULL, 3]"
Line: value_1=2, value_2="Some string 2", value_3="[4, 5, NULL]"$$)
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)        │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### 텍스트 형식에 대한 설정 {#settings-for-text-formats}
#### input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference {#input-format-max-rows-to-read-for-schema-inference}

이 설정은 스키마 추론 중 읽을 데이터의 양을 제어합니다.
더 많은 행/바이트를 읽을수록 스키마 추론에 더 많은 시간이 걸리지만, 유형을 정확하게 결정할 가능성이 높아집니다 (특히 데이터가 null가 많은 경우).

기본값:
-   `25000`은 `input_format_max_rows_to_read_for_schema_inference`의 값입니다.
-   `33554432` (32 Mb)은 `input_format_max_bytes_to_read_for_schema_inference`의 값입니다.
#### column_names_for_schema_inference {#column-names-for-schema-inference}

명시적 열 이름이 없는 형식에 대한 스키마 추론에 사용할 열 이름 목록. 지정된 이름은 기본적으로 사용되는 `c1,c2,c3,...` 대신 사용됩니다. 형식: `column1,column2,column3,...`.

**예제**

```sql
DESC format(TSV, 'Hello, World!    42    [1, 2, 3]') settings column_names_for_schema_inference = 'str,int,arr'
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ str  │ Nullable(String)       │              │                    │         │                  │                │
│ int  │ Nullable(Int64)        │              │                    │         │                  │                │
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### schema_inference_hints {#schema-inference-hints}

자동으로 결정된 유형 대신 스키마 추론에 사용할 열 이름 및 유형 목록입니다. 형식: 'column_name1 column_type1, column_name2 column_type2, ...'. 
이 설정은 자동으로 결정되지 않은 열의 유형을 지정하거나 스키마를 최적화하는 데 사용될 수 있습니다.

**예제**

```sql
DESC format(JSONEachRow, '{"id" : 1, "age" : 25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}') SETTINGS schema_inference_hints = 'age LowCardinality(UInt8), status Nullable(String)', allow_suspicious_low_cardinality_types=1
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ LowCardinality(UInt8)   │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ status  │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### schema_inference_make_columns_nullable {#schema-inference-make-columns-nullable}

스키마 추론에서 null 허용에 대한 정보가 없는 형식에 대해 추론된 유형을 `Nullable`로 만들 수 있습니다. 가능한 값:
* 0 - 추론된 유형은 절대 `Nullable`이 될 수 없습니다.
* 1 - 모든 추론된 유형은 `Nullable`입니다.
* 2 또는 'auto' - 텍스트 형식의 경우, 열에 스키마 추론 중에 파싱되는 샘플에 `NULL`이 포함된 경우만 추론된 유형이 `Nullable`가 됩니다. 강력하게 유형이 지정된 형식(Parquet, ORC, Arrow)의 경우, null 허용 정보는 파일 메타데이터에서 가져옵니다.
* 3 - 텍스트 형식의 경우, `Nullable`를 사용합니다. 강력하게 유형이 지정된 형식의 경우, 파일 메타데이터를 사용합니다.

기본값: 3.

**예제**

```sql
SET schema_inference_make_columns_nullable = 1;
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ status  │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET schema_inference_make_columns_nullable = 'auto';
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response
┌─name────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Int64            │              │                    │         │                  │                │
│ age     │ Int64            │              │                    │         │                  │                │
│ name    │ String           │              │                    │         │                  │                │
│ status  │ Nullable(String) │              │                    │         │                  │                │
│ hobbies │ Array(String)    │              │                    │         │                  │                │
└─────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET schema_inference_make_columns_nullable = 0;
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response

┌─name────┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Int64         │              │                    │         │                  │                │
│ age     │ Int64         │              │                    │         │                  │                │
│ name    │ String        │              │                    │         │                  │                │
│ status  │ String        │              │                    │         │                  │                │
│ hobbies │ Array(String) │              │                    │         │                  │                │
└─────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_integers {#input-format-try-infer-integers}

:::note
이 설정은 `JSON` 데이터 유형에 적용되지 않습니다.
:::

활성화되면 ClickHouse는 텍스트 형식의 스키마 추론에서 부동 소수점 대신 정수를 추론하려고 시도합니다.
샘플 데이터의 열의 모든 숫자가 정수인 경우, 결과 유형은 `Int64`가 되며, 최소한 하나의 숫자가 부동 소수점인 경우 결과 유형은 `Float64`가 됩니다.
샘플 데이터에 정수만 포함되어 있고, 최소한 하나의 정수가 양수이고 `Int64`를 초과하는 경우 ClickHouse는 `UInt64`를 추론합니다.

기본적으로 활성화되어 있습니다.

**예제**

```sql
SET input_format_try_infer_integers = 0
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2}
                         $$)
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Float64) │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_integers = 1
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2}
                         $$)
```
```response
┌─name───┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Int64) │              │                    │         │                  │                │
└────────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 18446744073709551615}
                         $$)
```
```response
┌─name───┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(UInt64) │              │                    │         │                  │                │
└────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2.2}
                         $$)
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Float64) │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_datetimes {#input-format-try-infer-datetimes}

활성화되면 ClickHouse는 텍스트 형식에서 문자열 필드에서 `DateTime` 또는 `DateTime64` 유형을 추론하려고 시도합니다.
샘플 데이터에서 열의 모든 필드가 날짜/시간으로 성공적으로 구문 분석된 경우 결과 유형은 `DateTime` 또는 `DateTime64(9)` (만약 어떤 날짜/시간이 소수 부분을 포함하는 경우)가 되며,
최소한 하나의 필드가 날짜/시간으로 구문 분석되지 않은 경우 결과 유형은 `String`이 됩니다.

기본적으로 활성화되어 있습니다.

**예제**

```sql
SET input_format_try_infer_datetimes = 0;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```
```response
┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(String) │              │                    │         │                  │                │
│ datetime64 │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_datetimes = 1;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```
```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "unknown", "datetime64" : "unknown"}
                         $$)
```
```response
┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(String) │              │                    │         │                  │                │
│ datetime64 │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_datetimes_only_datetime64 {#input-format-try-infer-datetimes-only-datetime64}

활성화되면 ClickHouse는 `input_format_try_infer_datetimes`가 활성화되어 있을 때 
날짜/시간 값에 소수 부분이 포함되어 있지 않더라도 항상 `DateTime64(9)`로 추론합니다.

기본적으로 비활성화되어 있습니다.

**예제**

```sql
SET input_format_try_infer_datetimes = 1;
SET input_format_try_infer_datetimes_only_datetime64 = 1;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```

```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

참고: 스키마 추론 동안 날짜/시간을 구문 분석하는 것은 설정 [date_time_input_format](/operations/settings/settings-formats.md#date_time_input_format)을 존중합니다.

#### input_format_try_infer_dates {#input-format-try-infer-dates}

활성화되면 ClickHouse는 텍스트 형식에서 문자열 필드에서 `Date` 유형을 추론하려고 시도합니다.
샘플 데이터에서 열의 모든 필드가 날짜로 성공적으로 구문 분석된 경우 결과 유형은 `Date`가 되며,
최소한 하나의 필드가 날짜로 구문 분석되지 않은 경우 결과 유형은 `String`이 됩니다.

기본적으로 활성화되어 있습니다.

**예제**

```sql
SET input_format_try_infer_datetimes = 0, input_format_try_infer_dates = 0
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "2022-01-01"}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_dates = 1
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "2022-01-01"}
                         $$)
```
```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(Date) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "unknown"}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
#### input_format_try_infer_exponent_floats {#input-format-try-infer-exponent-floats}

활성화되면 ClickHouse는 텍스트 형식에서 지수 형태로 부동 소수점을 추론하려고 시도합니다 (부동 소수점 형식인 JSON에서 지수 형태로 숫자가 항상 추론됩니다).

기본적으로 비활성화되어 있습니다.

**예제**

```sql
SET input_format_try_infer_exponent_floats = 1;
DESC format(CSV,
$$1.1E10
2.3e-12
42E00
$$)
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Float64) │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## 자기 설명 형식 {#self-describing-formats}

자기 설명 형식은 데이터 자체에 대한 구조 정보를 포함하고 있습니다. 이는 설명이 포함된 일부 헤더, 이진 유형 트리 또는 일부 표일 수 있습니다. 
ClickHouse는 이러한 형식의 파일에서 스키마를 자동으로 추론하기 위해, 유형 정보를 포함하는 데이터의 일부를 읽고 이를 ClickHouse 테이블의 스키마로 변환합니다.

### -WithNamesAndTypes 접미사가 있는 형식 {#formats-with-names-and-types}

ClickHouse는 -WithNamesAndTypes 접미사가 있는 일부 텍스트 형식을 지원합니다. 이 접미사는 데이터가 실제 데이터 앞에 열 이름 및 유형이 포함된 두 개의 추가 행을 포함하고 있음을 의미합니다.
이러한 형식에 대한 스키마 추론 중에 ClickHouse는 첫 번째 두 행을 읽고 열 이름 및 유형을 추출합니다.

**예제**

```sql
DESC format(TSVWithNamesAndTypes,
$$num    str    arr
UInt8    String    Array(UInt8)
42    Hello, World!    [1,2,3]
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### 메타데이터가 있는 JSON 형식 {#json-with-metadata}

일부 JSON 입력 형식 ([JSON](/interfaces/formats/JSON), [JSONCompact](/interfaces/formats/JSONCompact), [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata))는 열 이름 및 유형에 대한 메타데이터를 포함합니다.
이러한 형식의 스키마 추론에서 ClickHouse는 이 메타데이터를 읽습니다.

**예제**
```sql
DESC format(JSON, $$
{
    "meta":
    [
        {
            "name": "num",
            "type": "UInt8"
        },
        {
            "name": "str",
            "type": "String"
        },
        {
            "name": "arr",
            "type": "Array(UInt8)"
        }
    ],

    "data":
    [
        {
            "num": 42,
            "str": "Hello, World",
            "arr": [1,2,3]
        }
    ],

    "rows": 1,

    "statistics":
    {
        "elapsed": 0.005723915,
        "rows_read": 1,
        "bytes_read": 1
    }
}
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### Avro {#avro}

Avro 형식에서 ClickHouse는 데이터에서 스키마를 읽고 이를 ClickHouse 스키마로 변환합니다. 사용되는 유형 매칭은 다음과 같습니다:

| Avro 데이터 유형                     | ClickHouse 데이터 유형                                                           |
|------------------------------------|--------------------------------------------------------------------------------|
| `boolean`                          | [Bool](../sql-reference/data-types/boolean.md)                                 |
| `int`                              | [Int32](../sql-reference/data-types/int-uint.md)                               |
| `int (date)` \*                    | [Date32](../sql-reference/data-types/date32.md)                                |
| `long`                             | [Int64](../sql-reference/data-types/int-uint.md)                               |
| `float`                            | [Float32](../sql-reference/data-types/float.md)                                |
| `double`                           | [Float64](../sql-reference/data-types/float.md)                                |
| `bytes`, `string`                  | [String](../sql-reference/data-types/string.md)                                |
| `fixed`                            | [FixedString(N)](../sql-reference/data-types/fixedstring.md)                   |
| `enum`                             | [Enum](../sql-reference/data-types/enum.md)                                    |
| `array(T)`                         | [Array(T)](../sql-reference/data-types/array.md)                               |
| `union(null, T)`, `union(T, null)` | [Nullable(T)](../sql-reference/data-types/date.md)                             |
| `null`                             | [Nullable(Nothing)](../sql-reference/data-types/special-data-types/nothing.md) |
| `string (uuid)` \*                 | [UUID](../sql-reference/data-types/uuid.md)                                    |
| `binary (decimal)` \*              | [Decimal(P, S)](../sql-reference/data-types/decimal.md)                         |

\* [Avro 논리 유형](https://avro.apache.org/docs/current/spec.html#Logical+Types)

기타 Avro 유형은 지원되지 않습니다.
### Parquet {#parquet}

Parquet 형식에서 ClickHouse는 데이터에서 스키마를 읽고 다음 유형 일치를 사용하여 ClickHouse 스키마로 변환합니다:

| Parquet 데이터 유형           | ClickHouse 데이터 유형                                 |
|------------------------------|---------------------------------------------------------|
| `BOOL`                       | [Bool](../sql-reference/data-types/boolean.md)          |
| `UINT8`                      | [UInt8](../sql-reference/data-types/int-uint.md)        |
| `INT8`                       | [Int8](../sql-reference/data-types/int-uint.md)         |
| `UINT16`                     | [UInt16](../sql-reference/data-types/int-uint.md)       |
| `INT16`                      | [Int16](../sql-reference/data-types/int-uint.md)        |
| `UINT32`                     | [UInt32](../sql-reference/data-types/int-uint.md)       |
| `INT32`                      | [Int32](../sql-reference/data-types/int-uint.md)        |
| `UINT64`                     | [UInt64](../sql-reference/data-types/int-uint.md)       |
| `INT64`                      | [Int64](../sql-reference/data-types/int-uint.md)        |
| `FLOAT`                      | [Float32](../sql-reference/data-types/float.md)         |
| `DOUBLE`                     | [Float64](../sql-reference/data-types/float.md)         |
| `DATE`                       | [Date32](../sql-reference/data-types/date32.md)         |
| `TIME (ms)`                  | [DateTime](../sql-reference/data-types/datetime.md)     |
| `TIMESTAMP`, `TIME (us, ns)` | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `STRING`, `BINARY`           | [String](../sql-reference/data-types/string.md)         |
| `DECIMAL`                    | [Decimal](../sql-reference/data-types/decimal.md)       |
| `LIST`                       | [Array](../sql-reference/data-types/array.md)           |
| `STRUCT`                     | [Tuple](../sql-reference/data-types/tuple.md)           |
| `MAP`                        | [Map](../sql-reference/data-types/map.md)               |

기타 Parquet 유형은 지원되지 않습니다.
### Arrow {#arrow}

Arrow 형식에서 ClickHouse는 데이터에서 스키마를 읽고 다음 유형 일치를 사용하여 ClickHouse 스키마로 변환합니다:

| Arrow 데이터 유형               | ClickHouse 데이터 유형                                 |
|---------------------------------|-------------------------------------------------------|
| `BOOL`                          | [Bool](../sql-reference/data-types/boolean.md)          |
| `UINT8`                         | [UInt8](../sql-reference/data-types/int-uint.md)        |
| `INT8`                          | [Int8](../sql-reference/data-types/int-uint.md)         |
| `UINT16`                        | [UInt16](../sql-reference/data-types/int-uint.md)       |
| `INT16`                         | [Int16](../sql-reference/data-types/int-uint.md)        |
| `UINT32`                        | [UInt32](../sql-reference/data-types/int-uint.md)       |
| `INT32`                         | [Int32](../sql-reference/data-types/int-uint.md)        |
| `UINT64`                        | [UInt64](../sql-reference/data-types/int-uint.md)       |
| `INT64`                         | [Int64](../sql-reference/data-types/int-uint.md)        |
| `FLOAT`, `HALF_FLOAT`           | [Float32](../sql-reference/data-types/float.md)         |
| `DOUBLE`                        | [Float64](../sql-reference/data-types/float.md)         |
| `DATE32`                        | [Date32](../sql-reference/data-types/date32.md)         |
| `DATE64`                        | [DateTime](../sql-reference/data-types/datetime.md)     |
| `TIMESTAMP`, `TIME32`, `TIME64` | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `STRING`, `BINARY`              | [String](../sql-reference/data-types/string.md)         |
| `DECIMAL128`, `DECIMAL256`      | [Decimal](../sql-reference/data-types/decimal.md)       |
| `LIST`                          | [Array](../sql-reference/data-types/array.md)           |
| `STRUCT`                        | [Tuple](../sql-reference/data-types/tuple.md)           |
| `MAP`                           | [Map](../sql-reference/data-types/map.md)               |

기타 Arrow 유형은 지원되지 않습니다.
### ORC {#orc}

ORC 형식에서 ClickHouse는 데이터에서 스키마를 읽고 다음 유형 일치를 사용하여 ClickHouse 스키마로 변환합니다:

| ORC 데이터 유형                     | ClickHouse 데이터 유형                                 |
|-------------------------------------|--------------------------------------------------------|
| `Boolean`                           | [Bool](../sql-reference/data-types/boolean.md)          |
| `Tinyint`                           | [Int8](../sql-reference/data-types/int-uint.md)         |
| `Smallint`                          | [Int16](../sql-reference/data-types/int-uint.md)        |
| `Int`                               | [Int32](../sql-reference/data-types/int-uint.md)        |
| `Bigint`                            | [Int64](../sql-reference/data-types/int-uint.md)        |
| `Float`                             | [Float32](../sql-reference/data-types/float.md)         |
| `Double`                            | [Float64](../sql-reference/data-types/float.md)         |
| `Date`                              | [Date32](../sql-reference/data-types/date32.md)         |
| `Timestamp`                         | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `String`, `Char`, `Varchar`,`BINARY` | [String](../sql-reference/data-types/string.md)         |
| `Decimal`                           | [Decimal](../sql-reference/data-types/decimal.md)       |
| `List`                              | [Array](../sql-reference/data-types/array.md)           |
| `Struct`                            | [Tuple](../sql-reference/data-types/tuple.md)           |
| `Map`                               | [Map](../sql-reference/data-types/map.md)               |

기타 ORC 유형은 지원되지 않습니다.
### Native {#native}

Native 형식은 ClickHouse 내에서 사용되며 데이터에 스키마를 포함합니다. 
스키마 추론에서 ClickHouse는 변환 없이 데이터에서 스키마를 읽습니다.
## 외부 스키마가 있는 형식 {#formats-with-external-schema}

이러한 형식은 특정 스키마 언어로 데이터 설명하는 스키마가 별도의 파일에 필요합니다. 
ClickHouse는 이러한 형식의 파일에서 자동으로 스키마를 유추하기 위해 외부 스키마를 별도의 파일에서 읽고 이를 ClickHouse 테이블 스키마로 변환합니다.
### Protobuf {#protobuf}

Protobuf 형식의 스키마 추론에서 ClickHouse는 다음 유형 일치를 사용합니다:

| Protobuf 데이터 유형            | ClickHouse 데이터 유형                              |
|-------------------------------|-----------------------------------------------------|
| `bool`                        | [UInt8](../sql-reference/data-types/int-uint.md)    |
| `float`                       | [Float32](../sql-reference/data-types/float.md)     |
| `double`                      | [Float64](../sql-reference/data-types/float.md)     |
| `int32`, `sint32`, `sfixed32` | [Int32](../sql-reference/data-types/int-uint.md)    |
| `int64`, `sint64`, `sfixed64` | [Int64](../sql-reference/data-types/int-uint.md)    |
| `uint32`, `fixed32`           | [UInt32](../sql-reference/data-types/int-uint.md)   |
| `uint64`, `fixed64`           | [UInt64](../sql-reference/data-types/int-uint.md)   |
| `string`, `bytes`             | [String](../sql-reference/data-types/string.md)     |
| `enum`                        | [Enum](../sql-reference/data-types/enum.md)         |
| `repeated T`                  | [Array(T)](../sql-reference/data-types/array.md)    |
| `message`, `group`            | [Tuple](../sql-reference/data-types/tuple.md)       |
### CapnProto {#capnproto}

CapnProto 형식의 스키마 추론에서 ClickHouse는 다음 유형 일치를 사용합니다:

| CapnProto 데이터 유형                | ClickHouse 데이터 유형                                   |
|--------------------------------------|----------------------------------------------------------|
| `Bool`                               | [UInt8](../sql-reference/data-types/int-uint.md)          |
| `Int8`                               | [Int8](../sql-reference/data-types/int-uint.md)           |
| `UInt8`                              | [UInt8](../sql-reference/data-types/int-uint.md)          |
| `Int16`                              | [Int16](../sql-reference/data-types/int-uint.md)          |
| `UInt16`                             | [UInt16](../sql-reference/data-types/int-uint.md)         |
| `Int32`                              | [Int32](../sql-reference/data-types/int-uint.md)          |
| `UInt32`                             | [UInt32](../sql-reference/data-types/int-uint.md)         |
| `Int64`                              | [Int64](../sql-reference/data-types/int-uint.md)          |
| `UInt64`                             | [UInt64](../sql-reference/data-types/int-uint.md)         |
| `Float32`                            | [Float32](../sql-reference/data-types/float.md)           |
| `Float64`                            | [Float64](../sql-reference/data-types/float.md)           |
| `Text`, `Data`                       | [String](../sql-reference/data-types/string.md)            |
| `enum`                               | [Enum](../sql-reference/data-types/enum.md)               |
| `List`                               | [Array](../sql-reference/data-types/array.md)             |
| `struct`                             | [Tuple](../sql-reference/data-types/tuple.md)             |
| `union(T, Void)`, `union(Void, T)` | [Nullable(T)](../sql-reference/data-types/nullable.md)     |
## 강력한 형식의 바이너리 형식 {#strong-typed-binary-formats}

이러한 형식에서는 각 직렬화된 값이 자신의 유형(및 이름에 대한 정보)을 포함하지만 전체 테이블에 대한 정보는 없습니다. 
이러한 형식의 스키마 추론에서 ClickHouse는 데이터를 행 단위로 읽고(`input_format_max_rows_to_read_for_schema_inference` 행 또는 `input_format_max_bytes_to_read_for_schema_inference` 바이트까지) 
각 값에 대한 유형(및 경우에 따라 이름)을 데이터에서 추출하고 이러한 유형을 ClickHouse 유형으로 변환합니다.
### MsgPack {#msgpack}

MsgPack 형식에서 행 사이에 구분자가 없으므로 이 형식에 대해 스키마 추론을 사용하려면 테이블의 열 수를 
설정 `input_format_msgpack_number_of_columns`를 사용하여 지정해야 합니다. ClickHouse는 다음 유형 일치를 사용합니다:

| MessagePack 데이터 유형 (`INSERT`)                                   | ClickHouse 데이터 유형                                      |
|--------------------------------------------------------------------|-------------------------------------------------------------|
| `int N`, `uint N`, `negative fixint`, `positive fixint`            | [Int64](../sql-reference/data-types/int-uint.md)            |
| `bool`                                                             | [UInt8](../sql-reference/data-types/int-uint.md)            |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32` | [String](../sql-reference/data-types/string.md)             |
| `float 32`                                                         | [Float32](../sql-reference/data-types/float.md)             |
| `float 64`                                                         | [Float64](../sql-reference/data-types/float.md)             |
| `uint 16`                                                          | [Date](../sql-reference/data-types/date.md)                 |
| `uint 32`                                                          | [DateTime](../sql-reference/data-types/datetime.md)         |
| `uint 64`                                                          | [DateTime64](../sql-reference/data-types/datetime.md)       |
| `fixarray`, `array 16`, `array 32`                                 | [Array](../sql-reference/data-types/array.md)               |
| `fixmap`, `map 16`, `map 32`                                       | [Map](../sql-reference/data-types/map.md)                   |

기본적으로, 유추된 모든 유형은 `Nullable` 안에 있지만, 이는 설정 `schema_inference_make_columns_nullable`를 사용하여 변경할 수 있습니다.
### BSONEachRow {#bsoneachrow}

BSONEachRow에서 데이터의 각 행은 BSON 문서로 표시됩니다. 스키마 추론에서 ClickHouse는 BSON 문서를 하나씩 읽고 
값, 이름 및 유형을 데이터에서 추출한 다음 다음 유형 일치를 사용하여 이러한 유형을 ClickHouse 유형으로 변환합니다:

| BSON 유형                                                                                     | ClickHouse 유형                                                                                                        |
|-----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `\x08` boolean                                                                                | [Bool](../sql-reference/data-types/boolean.md)                                                                        |
| `\x10` int32                                                                                  | [Int32](../sql-reference/data-types/int-uint.md)                                                                      |
| `\x12` int64                                                                                  | [Int64](../sql-reference/data-types/int-uint.md)                                                                      |
| `\x01` double                                                                                 | [Float64](../sql-reference/data-types/float.md)                                                                       |
| `\x09` datetime                                                                               | [DateTime64](../sql-reference/data-types/datetime64.md)                                                               |
| `\x05` binary with`\x00` binary subtype, `\x02` string, `\x0E` symbol, `\x0D` JavaScript code | [String](../sql-reference/data-types/string.md)                                                                        |
| `\x07` ObjectId,                                                                              | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                         |
| `\x05` binary with `\x04` uuid subtype, size = 16                                             | [UUID](../sql-reference/data-types/uuid.md)                                                                            |
| `\x04` array                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md) (if nested types are different) |
| `\x03` document                                                                               | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md) (with String keys)        |

기본적으로, 유추된 모든 유형은 `Nullable` 안에 있지만, 이는 설정 `schema_inference_make_columns_nullable`를 사용하여 변경할 수 있습니다.
## 고정 스키마가 있는 형식 {#formats-with-constant-schema}

이러한 형식의 데이터는 항상 동일한 스키마를 가집니다.
### LineAsString {#line-as-string}

이 형식에서 ClickHouse는 데이터를 단일 열의 `String` 데이터 유형으로 읽습니다. 이 형식의 유추된 유형은 항상 `String`이며 열 이름은 `line`입니다.

**예시**

```sql
DESC format(LineAsString, 'Hello\nworld!')
```
```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ line │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### JSONAsString {#json-as-string}

이 형식에서 ClickHouse는 데이터를 단일 열의 `String` 데이터 유형으로 읽습니다. 이 형식의 유추된 유형은 항상 `String`이며 열 이름은 `json`입니다.

**예시**

```sql
DESC format(JSONAsString, '{"x" : 42, "y" : "Hello, World!"}')
```
```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
### JSONAsObject {#json-as-object}

이 형식에서 ClickHouse는 데이터를 단일 열의 `JSON` 데이터 유형으로 읽습니다. 이 형식의 유추된 유형은 항상 `JSON`이며 열 이름은 `json`입니다.

**예시**

```sql
DESC format(JSONAsObject, '{"x" : 42, "y" : "Hello, World!"}');
```
```response
┌─name─┬─type─┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ JSON │              │                    │         │                  │                │
└──────┴──────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
## 스키마 추론 모드 {#schema-inference-modes}

데이터 파일 집합에서 스키마 추론은 두 가지 모드: `default`와 `union`으로 작동할 수 있습니다.
모드는 설정 `schema_inference_mode`에 의해 제어됩니다.
### 기본 모드 {#default-schema-inference-mode}

기본 모드에서 ClickHouse는 모든 파일이 동일한 스키마를 갖고 있다고 가정하며 
파일을 하나씩 읽어 스키마를 추론하려고 시도합니다.

예시:

3개의 파일 `data1.jsonl`, `data2.jsonl`, `data3.jsonl`가 다음 내용과 있다고 가정해 보겠습니다:

`data1.jsonl`:
```json
{"field1" :  1, "field2" :  null}
{"field1" :  2, "field2" :  null}
{"field1" :  3, "field2" :  null}
```

`data2.jsonl`:
```json
{"field1" :  4, "field2" :  "Data4"}
{"field1" :  5, "field2" :  "Data5"}
{"field1" :  6, "field2" :  "Data5"}
```

`data3.jsonl`:
```json
{"field1" :  7, "field2" :  "Data7", "field3" :  [1, 2, 3]}
{"field1" :  8, "field2" :  "Data8", "field3" :  [4, 5, 6]}
{"field1" :  9, "field2" :  "Data9", "field3" :  [7, 8, 9]}
```

이 3개의 파일에 대해 스키마 추론을 시도해 보겠습니다:
```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='default'
```

결과:

```response
┌─name───┬─type─────────────┐
│ field1 │ Nullable(Int64)  │
│ field2 │ Nullable(String) │
└────────┴──────────────────┘
```

보시다시피, `data3.jsonl` 파일에서는 `field3`가 없습니다.
이는 ClickHouse가 처음에 `data1.jsonl`에서 스키마를 유추하려고 시도했지만, `field2` 필드가 모두 null이기 때문에 실패하고,
그 다음 `data2.jsonl`에서 스키마를 유추하고 성공했기 때문에 `data3.jsonl` 파일의 데이터는 읽히지 않았습니다.
### Union 모드 {#default-schema-inference-mode-1}

Union 모드에서 ClickHouse는 파일이 서로 다른 스키마를 가질 수 있다고 가정하므로 모든 파일의 스키마를 유추하고 
그 후 공통 스키마로 유니온합니다.

3개의 파일 `data1.jsonl`, `data2.jsonl`, `data3.jsonl`가 다음 내용과 있다고 가정해 보겠습니다:

`data1.jsonl`:
```json
{"field1" :  1}
{"field1" :  2}
{"field1" :  3}
```

`data2.jsonl`:
```json
{"field2" :  "Data4"}
{"field2" :  "Data5"}
{"field2" :  "Data5"}
```

`data3.jsonl`:
```json
{"field3" :  [1, 2, 3]}
{"field3" :  [4, 5, 6]}
{"field3" :  [7, 8, 9]}
```

이 3개의 파일에 대해 스키마 추론을 시도해 보겠습니다:
```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='union'
```

결과:

```response
┌─name───┬─type───────────────────┐
│ field1 │ Nullable(Int64)        │
│ field2 │ Nullable(String)       │
│ field3 │ Array(Nullable(Int64)) │
└────────┴────────────────────────┘
```

보시다시피, 모든 파일에서 모든 필드가 있습니다.

참고:
- 결과 스키마의 일부 열을 포함하지 않는 파일이 있을 수 있으므로, union 모드는 열의 하위 집합을 읽는 형식(예: JSONEachRow, Parquet, TSVWithNames 등)에만 지원되며 
CSV, TSV, JSONCompactEachRow와 같은 다른 형식에서는 작동하지 않습니다.
- ClickHouse가 파일 중 하나에서 스키마를 유추할 수 없는 경우 예외가 발생합니다.
- 파일이 많을 경우, 모든 파일에서 스키마를 읽는 데 많은 시간이 소요될 수 있습니다.
## 자동 형식 감지 {#automatic-format-detection}

데이터 형식이 지정되지 않았고 파일 확장자로 결정할 수 없는 경우, ClickHouse는 내용으로 파일 형식을 감지하려고 시도합니다.

**예시:**

`data`라는 다음 내용을 가진 파일이 있다고 가정해 보겠습니다:
```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

형식이나 구조를 지정하지 않고 이 파일을 검사하고 쿼리할 수 있습니다:
```sql
:) desc file(data);
```

```repsonse
┌─name─┬─type─────────────┐
│ a    │ Nullable(Int64)  │
│ b    │ Nullable(String) │
└──────┴──────────────────┘
```

```sql
:) select * from file(data);
```

```response
┌─a─┬─b─────┐
│ 1 │ Data1 │
│ 2 │ Data2 │
│ 3 │ Data3 │
└───┴───────┘
```

:::note
ClickHouse는 일부 형식 집합만 감지할 수 있으며 이 감지는 시간이 소요됩니다. 형식을 명시적으로 지정하는 것이 항상 좋습니다.
:::
