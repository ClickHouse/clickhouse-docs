---
description: 'ClickHouse에서 입력 데이터로부터 자동 스키마 추론을 설명하는 페이지'
sidebar_label: '스키마 추론'
slug: /interfaces/schema-inference
title: '입력 데이터로부터 자동 스키마 추론'
doc_type: 'reference'
---

ClickHouse는 지원되는 대부분의 [Input formats](formats.md)에서 입력 데이터의 구조를 자동으로 결정할 수 있습니다.
이 문서에서는 스키마 추론이 언제 사용되는지, 서로 다른 입력 포맷에서 어떻게 동작하는지, 그리고 어떤 설정으로
이를 제어할 수 있는지 설명합니다.

## 사용 방법 \{#usage\}

스키마 추론은 ClickHouse가 특정 데이터 형식의 데이터를 읽어야 하지만 데이터 구조를 알 수 없을 때 사용됩니다.

## 테이블 함수 [file](../sql-reference/table-functions/file.md), [s3](../sql-reference/table-functions/s3.md), [url](../sql-reference/table-functions/url.md), [hdfs](../sql-reference/table-functions/hdfs.md), [azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md). \{#table-functions-file-s3-url-hdfs-azureblobstorage\}

이들 테이블 함수에는 입력 데이터의 구조를 지정하는 선택적 인수 `structure`가 있습니다. 이 인수를 지정하지 않거나 `auto`로 설정하면, 구조는 데이터로부터 자동으로 유추됩니다.

**예시:**

`user_files` 디렉터리에 JSONEachRow 형식의 `hobbies.jsonl` 파일이 다음과 같은 내용으로 있다고 가정합니다:

```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

ClickHouse는 사용자가 구조를 명시하지 않아도 이 데이터를 읽을 수 있습니다:

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

참고: `JSONEachRow` 포맷은 파일 확장자 `.jsonl`에 의해 자동으로 감지되었습니다.

`DESCRIBE` 쿼리를 사용하여 자동으로 감지된 구조를 확인할 수 있습니다:

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


## 테이블 엔진 [File](../engines/table-engines/special/file.md), [S3](../engines/table-engines/integrations/s3.md), [URL](../engines/table-engines/special/url.md), [HDFS](../engines/table-engines/integrations/hdfs.md), [azureBlobStorage](../engines/table-engines/integrations/azureBlobStorage.md) \{#table-engines-file-s3-url-hdfs-azureblobstorage\}

`CREATE TABLE` 쿼리에서 컬럼 목록을 지정하지 않으면, 테이블 구조는 데이터에서 자동으로 추론됩니다.

**예시:**

파일 `hobbies.jsonl`을 사용해 보겠습니다. 이 파일의 데이터를 사용하여 엔진이 `File`인 테이블을 생성할 수 있습니다:

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


## clickhouse-local \{#clickhouse-local\}

`clickhouse-local`에는 입력 데이터의 구조를 지정하는 선택적 파라미터 `-S/--structure`가 있습니다. 이 파라미터를 지정하지 않거나 `auto`로 설정하면 구조가 데이터에 기반해 자동으로 추론됩니다.

**예시:**

파일 `hobbies.jsonl`을 사용해 보겠습니다. 이 파일의 데이터를 `clickhouse-local`을 사용해 쿼리할 수 있습니다:

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


## 삽입 테이블의 구조 사용하기 \{#using-structure-from-insertion-table\}

테이블 함수 `file/s3/url/hdfs`를 사용하여 테이블에 데이터를 삽입하는 경우,
데이터에서 구조를 추출하는 대신 삽입 테이블의 구조를 사용할 수 있습니다.
스키마 추론에 시간이 소요될 수 있으므로 이 옵션을 사용하면 삽입 성능을 향상할 수 있습니다. 또한 테이블이 최적화된 스키마를 가진 경우
데이터 유형 간 변환이 수행되지 않도록 하는 데 도움이 됩니다.

이 동작을 제어하는 전용 설정 [use&#95;structure&#95;from&#95;insertion&#95;table&#95;in&#95;table&#95;functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions)이 있습니다. 이 설정은 세 가지 값을 가질 수 있습니다:

* 0 - 테이블 함수가 데이터에서 구조를 추출합니다.
* 1 - 테이블 함수가 삽입 테이블의 구조를 사용합니다.
* 2 - ClickHouse가 삽입 테이블의 구조를 사용할 수 있는지, 또는 스키마 추론을 사용할지를 자동으로 결정합니다. 기본값입니다.

**예시 1:**

다음 구조를 가진 `hobbies1` 테이블을 생성합니다:

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

그리고 `hobbies.jsonl` 파일의 데이터를 삽입합니다:

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

이 경우 파일의 모든 컬럼이 변경 없이 테이블에 삽입되므로, ClickHouse는 스키마 추론 대신 데이터를 삽입하는 테이블의 구조를 사용합니다.

**예제 2:**

다음 구조로 `hobbies2` 테이블을 생성합니다:

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

그리고 `hobbies.jsonl` 파일에서 데이터를 삽입합니다.

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

이 경우 `SELECT` 쿼리의 모든 컬럼이 테이블에 존재하므로, ClickHouse는 삽입 대상 테이블의 구조를 사용합니다.
이는 JSONEachRow, TSKV, Parquet 등과 같이 일부 컬럼만 읽는 것을 지원하는 입력 포맷에서만 동작합니다(예를 들어 TSV 포맷에는 동작하지 않습니다).

**예제 3:**

다음 구조를 갖는 `hobbies3` 테이블을 생성해 보겠습니다:

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

그리고 `hobbies.jsonl` 파일의 데이터를 삽입합니다:

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

이 경우 컬럼 `id`가 `SELECT` 쿼리에서 사용되지만, 테이블에는 이 컬럼이 없고(이름이 `identifier`인 컬럼만 있음),
ClickHouse는 삽입 대상 테이블의 구조를 사용할 수 없어서 스키마 추론이 사용됩니다.

**예시 4:**

다음과 같은 구조로 테이블 `hobbies4`를 생성해 보겠습니다:

```sql
CREATE TABLE hobbies4
(
  `id` UInt64,
  `any_hobby` Nullable(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

그리고 `hobbies.jsonl` 파일에 있는 데이터를 삽입합니다:

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

이 경우 `SELECT` 쿼리에서 테이블에 삽입하기 위해 컬럼 `hobbies`에 대해 일부 연산을 수행하므로, ClickHouse는 삽입 대상 테이블의 구조를 사용할 수 없고 대신 스키마 추론을 수행합니다.


## 스키마 추론 캐시 \{#schema-inference-cache\}

대부분의 입력 포맷에서 스키마 추론은 구조를 파악하기 위해 일부 데이터를 읽으며, 이 과정에는 시간이 걸릴 수 있습니다.
ClickHouse가 동일한 파일에서 데이터를 읽을 때마다 같은 스키마를 반복해서 추론하지 않도록, 추론된 스키마는 캐시에 저장되며, 동일한 파일에 다시 접근할 때 ClickHouse는 캐시에 있는 스키마를 사용합니다.

이 캐시를 제어하는 전용 설정이 있습니다:

* `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` - 해당 테이블 함수에 대해 캐시할 스키마의 최대 개수입니다. 기본값은 `4096`입니다. 이 설정은 서버 설정에서 지정해야 합니다.
* `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` - 스키마 추론에 캐시 사용 여부를 켜거나 끄는 설정입니다. 이 설정은 쿼리에서 사용할 수 있습니다.

파일의 스키마는 데이터를 수정하거나 포맷 설정을 변경하여 바뀔 수 있습니다.
이 때문에 스키마 추론 캐시는 파일 소스, 포맷 이름, 사용된 포맷 설정, 그리고 파일의 마지막 수정 시각을 기준으로 스키마를 식별합니다.

참고: `url` 테이블 함수에서 URL을 통해 접근하는 일부 파일에는 마지막 수정 시각 정보가 없을 수 있으며, 이 경우를 위해
`schema_inference_cache_require_modification_time_for_url`라는 전용 설정이 있습니다. 이 설정을 비활성화하면, 이러한 파일에 대해 마지막 수정 시각 정보 없이 캐시에 있는 스키마를 사용할 수 있습니다.

현재 캐시에 있는 모든 스키마를 보여주는 시스템 테이블 [schema&#95;inference&#95;cache](../operations/system-tables/schema_inference_cache.md)와,
모든 소스 또는 특정 소스에 대해 스키마 캐시를 정리할 수 있는 시스템 쿼리 `SYSTEM CLEAR SCHEMA CACHE [FOR File/S3/URL/HDFS]`도 있습니다.

**예시:**

S3의 샘플 데이터셋 `github-2022.ndjson.gz`의 구조를 추론해 보고, 스키마 추론 캐시가 어떻게 동작하는지 확인해 보겠습니다:

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

보시다시피 두 번째 쿼리는 거의 즉시 성공했습니다.

스키마 추론에 영향을 줄 수 있는 몇 가지 설정을 변경해 보겠습니다.

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

보시는 것처럼, 추론된 스키마에 영향을 줄 수 있는 설정이 변경되었기 때문에 동일한 파일에 대해서도 캐시에 저장된 스키마가 사용되지 않았습니다.

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

보시다시피 동일한 파일에 대해 서로 다른 스키마가 두 개 있습니다.

시스템 쿼리를 사용하여 스키마 캐시를 지울 수 있습니다:

```sql
SYSTEM CLEAR SCHEMA CACHE FOR S3
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


## 텍스트 포맷 \{#text-formats\}

텍스트 포맷에서 ClickHouse는 데이터를 행 단위로 읽고, 포맷에 따라 컬럼 값을 추출한 다음,
재귀 파서와 휴리스틱을 사용하여 각 값의 타입을 결정합니다. 스키마 추론(schema inference) 시 데이터에서 읽는 최대 행 수와 바이트 수는
`input_format_max_rows_to_read_for_schema_inference`(기본값 25000) 및 `input_format_max_bytes_to_read_for_schema_inference`(기본값 32MB) 설정으로 제어됩니다.
기본적으로 추론된 모든 타입은 [널 허용(Nullable)](../sql-reference/data-types/nullable.md)이지만, `schema_inference_make_columns_nullable` 설정을 변경하여 이를 바꿀 수 있습니다(예시는 [설정](#settings-for-text-formats) 섹션을 참조하십시오).

### JSON 형식 \{#json-formats\}

JSON 형식에서 ClickHouse는 JSON 사양에 따라 값을 파싱한 후 가장 적절한 데이터 타입을 찾습니다.

JSON 형식에서 어떻게 작동하는지, 어떤 타입을 추론할 수 있는지, 그리고 어떤 특정 설정(setting)을 사용할 수 있는지 살펴보겠습니다.

**예시**

이 섹션부터 예제에서는 [format](../sql-reference/table-functions/format.md) 테이블 함수를 사용합니다.

정수(Integer), 부동소수점(Float), 불리언(Boolean), 문자열(String):

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

배열에 `null`이 포함되어 있는 경우, ClickHouse는 다른 배열 요소의 타입을 사용합니다:

```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```

```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

배열에 서로 다른 타입의 값이 포함되어 있고 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` 설정이 활성화된 경우(기본값으로 활성화됨), 해당 배열은 `Array(Dynamic)` 타입을 갖습니다:

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=1;
DESC format(JSONEachRow, '{"arr" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Dynamic) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

명명된 튜플(Named Tuple):

`input_format_json_try_infer_named_tuples_from_objects` SETTING을 활성화하면 스키마 추론 중에 ClickHouse는 JSON 객체에서 이름이 지정된 Tuple을 추론하려고 합니다.
이렇게 생성된 이름이 지정된 Tuple에는 샘플 데이터의 해당 JSON 객체들에 포함된 모든 요소가 모두 포함됩니다.

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Unnamed Tuples(이름 없는 튜플):

`input_format_json_infer_array_of_dynamic_from_array_of_different_types` 설정이 비활성화되어 있으면, 서로 다른 타입의 요소를 포함하는 배열은 JSON 형식에서 이름 없는 튜플(Unnamed Tuples)로 처리됩니다.

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types = 0;
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```

```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

일부 값이 `null` 이거나 비어 있는 경우, 다른 행에 있는 해당 값의 타입을 사용합니다.

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

맵(Map):

JSON에서 값이 모두 동일한 타입인 객체를 맵(Map) 타입으로 읽을 수 있습니다.
참고: 이 동작은 `input_format_json_read_objects_as_strings` 및 `input_format_json_try_infer_named_tuples_from_objects` 설정이 비활성화되어 있을 때만 가능합니다.

```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```

```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

중첩 복합 타입:

```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```


```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

어떤 키의 데이터에 null 값/빈 객체/빈 배열만 포함되어 있어 ClickHouse에서 타입을 결정할 수 없는 경우, 설정 `input_format_json_infer_incomplete_types_as_strings`가 활성화되어 있으면 타입 `String`이 사용되고, 그렇지 않으면 예외가 발생합니다:

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


#### JSON 설정 \{#json-settings\}

##### input_format_json_try_infer_numbers_from_strings \{#input_format_json_try_infer_numbers_from_strings\}

이 설정을 활성화하면 문자열 값에서 숫자 형식을 추론합니다.

이 설정은 기본적으로 비활성화되어 있습니다.

**예시:**

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


##### input_format_json_try_infer_named_tuples_from_objects \{#input_format_json_try_infer_named_tuples_from_objects\}

이 설정을 활성화하면 JSON 객체에서 이름이 지정된 Tuple을 추론할 수 있습니다. 이렇게 생성된 이름이 지정된 Tuple에는 샘플 데이터에 포함된 해당 JSON 객체들의 모든 요소가 포함됩니다.
JSON 데이터가 희소하지 않아 데이터 샘플에 가능한 모든 객체 키가 포함되는 경우에 유용합니다.

이 설정은 기본적으로 활성화되어 있습니다.

**예시**

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


##### input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects \{#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects\}

이 설정을 활성화하면 (`input_format_json_try_infer_named_tuples_from_objects`가 활성화된 경우) JSON 객체에서 named Tuples를 추론하는 동안 모호한 경로에 대해 예외를 발생시키는 대신 `String` 타입을 사용할 수 있습니다.
이를 통해 모호한 경로가 있더라도 JSON 객체를 named Tuples로 읽을 수 있습니다.

기본적으로 비활성화되어 있습니다.

**예시**

설정이 비활성화된 경우:

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

이 설정을 활성화하면:

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


##### input_format_json_read_objects_as_strings \{#input_format_json_read_objects_as_strings\}

이 설정을 활성화하면 중첩된 JSON 객체를 문자열로 읽을 수 있습니다.
이 설정은 JSON 객체 타입을 사용하지 않고 중첩된 JSON 객체를 읽는 데 사용할 수 있습니다.

이 설정은 기본적으로 활성화되어 있습니다.

참고: 이 설정을 활성화해도 `input_format_json_try_infer_named_tuples_from_objects` 설정이 비활성화된 경우에만 효과가 있습니다.

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


##### input_format_json_read_numbers_as_strings \{#input_format_json_read_numbers_as_strings\}

이 설정을 활성화하면 숫자형 값을 문자열로 읽을 수 있습니다.

이 설정은 기본적으로 활성화되어 있습니다.

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


##### input_format_json_read_bools_as_numbers \{#input_format_json_read_bools_as_numbers\}

이 설정을 활성화하면 Bool 값을 숫자로 읽습니다.

이 설정은 기본적으로 활성화되어 있습니다.

**예시:**

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


##### input_format_json_read_bools_as_strings \{#input_format_json_read_bools_as_strings\}

이 SETTING을 활성화하면 Bool 값을 문자열로 읽도록 할 수 있습니다.

이 SETTING은 기본적으로 활성화되어 있습니다.

**예:**

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


##### input_format_json_read_arrays_as_strings \{#input_format_json_read_arrays_as_strings\}

이 설정을 활성화하면 JSON 배열 값을 문자열로 읽도록 할 수 있습니다.

이 설정은 기본값으로 활성화되어 있습니다.

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


##### input_format_json_infer_incomplete_types_as_strings \{#input_format_json_infer_incomplete_types_as_strings\}

이 설정을 활성화하면 스키마 추론 시 데이터 샘플에서 `Null`/`{}`/`[]`만 포함하는 JSON 키에 `String` 타입을 사용할 수 있습니다.
JSON 형식에서는 관련 설정이 모두 활성화되어 있으면(기본적으로 모두 활성화됨) 모든 값을 `String`으로 읽을 수 있으며, 타입을 알 수 없는 키에 `String` 타입을 사용함으로써 스키마 추론 시 `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps`와 같은 오류를 방지할 수 있습니다.

예시:

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


### CSV \{#csv\}

CSV 형식에서 ClickHouse는 구분자에 따라 행에서 컬럼 값을 추출합니다. ClickHouse는 숫자와 문자열을 제외한 모든 타입이 큰따옴표로 둘러싸여 있을 것으로 예상합니다. 값이 큰따옴표 안에 있으면 ClickHouse는 재귀 파서를 사용하여 따옴표 내부의 데이터를 파싱한 다음, 그에 가장 적합한 데이터 타입을 찾으려고 시도합니다. 값이 큰따옴표 안에 있지 않으면 ClickHouse는 해당 값을 숫자로 파싱하려고 시도하고,
값이 숫자가 아니면 문자열로 처리합니다.

일부 파서와 휴리스틱을 사용해 ClickHouse가 복잡한 타입을 자동으로 판별하지 않도록 하려면 `input_format_csv_use_best_effort_in_schema_inference` 설정을 비활성화합니다.
이 경우 ClickHouse는 모든 컬럼을 String으로 처리합니다.

`input_format_csv_detect_header` 설정이 활성화되어 있으면 ClickHouse는 스키마를 추론하는 동안 컬럼 이름(및 타입일 수도 있음)이 있는 헤더를 감지하려고 시도합니다. 이 설정은 기본적으로 활성화되어 있습니다.

**예시:**

Integers, Floats, Bools, Strings:

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

따옴표로 감싸지지 않은 문자열:

```sql
DESC format(CSV, 'Hello world!,World hello!')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Date(날짜), DateTime(날짜-시간):

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

배열에 null이 포함되어 있으면 ClickHouse는 다른 배열 요소의 타입을 사용합니다:

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

중첩 배열 및 맵:

```sql
DESC format(CSV, $$"[{'key1' : [[42, 42], []], 'key2' : [[null], [42]]}]"$$)
```

```response
┌─name─┬─type──────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Array(Nullable(Int64))))) │              │                    │         │                  │                │
└──────┴───────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

데이터에 null 값만 포함되어 있어 ClickHouse가 따옴표 안의 타입을 판별할 수 없으면, 이를 String 타입으로 처리합니다:

```sql
DESC format(CSV, '"[NULL, NULL]"')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

`input_format_csv_use_best_effort_in_schema_inference` 설정이 비활성화된 경우의 예:

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

`input_format_csv_detect_header`가 활성화된 경우 헤더 자동 감지 예시:

이름만 있는 경우:

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

이름과 데이터 타입:

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

헤더는 `String` 타입이 아닌 컬럼이 적어도 하나 있을 때만 감지됩니다. 모든 컬럼의 타입이 `String` 이면 헤더는 감지되지 않습니다:

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


#### CSV 설정 \{#csv-settings\}

##### input_format_csv_try_infer_numbers_from_strings \{#input_format_csv_try_infer_numbers_from_strings\}

이 설정을 활성화하면 문자열 값을 숫자로 추론하도록 합니다.

이 설정은 기본값으로 비활성화되어 있습니다.

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


### TSV/TSKV \{#tsv-tskv\}

TSV/TSKV 형식에서는 ClickHouse가 탭 구분 기호에 따라 행에서 컬럼 값을 추출한 뒤, 재귀 파서를 사용하여 추출된 값을 파싱하고 가장 적절한 타입을 판별합니다. 타입을 판별할 수 없으면 ClickHouse는 이 값을 String으로 처리합니다.

ClickHouse가 일부 파서와 휴리스틱을 사용하여 복잡한 타입을 추론하지 않도록 하려면, `input_format_tsv_use_best_effort_in_schema_inference` 설정을 비활성화하십시오. 이 경우 ClickHouse는 모든 컬럼을 String으로 처리합니다.

`input_format_tsv_detect_header` 설정이 활성화되어 있으면, ClickHouse는 스키마를 추론하는 동안 컬럼 이름(그리고 경우에 따라 타입)이 포함된 헤더를 자동으로 감지합니다. 이 설정은 기본적으로 활성화되어 있습니다.

**예시:**

정수, 실수, 불리언, 문자열:

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

날짜(Date), DateTime:

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

배열(Array):

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

배열에 null 값이 포함되어 있으면 ClickHouse는 다른 배열 요소의 타입을 사용합니다:

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

중첩 Array, Tuple, 맵:

```sql
DESC format(TSV, $$[{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}]$$)
```

```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

데이터에 null 값만 포함되어 있어 ClickHouse가 타입을 결정할 수 없으면, ClickHouse는 이를 String 타입으로 처리합니다:

```sql
DESC format(TSV, '[NULL, NULL]')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

`input_format_tsv_use_best_effort_in_schema_inference` 설정이 비활성화된 예:

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

헤더 자동 감지 예시(`input_format_tsv_detect_header`가 활성화된 경우):

열 이름만 있는 경우:

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

이름 및 타입:

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

헤더는 최소 하나 이상의 컬럼이 String이 아닌 타입일 때만 감지됩니다. 모든 컬럼이 String 타입이면 헤더는 감지되지 않습니다:

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


### 값(Values) \{#values\}

Values 형식에서 ClickHouse는 행에서 컬럼 값을 추출한 후, 리터럴 파싱 방식과 유사하게 재귀 파서를 사용하여 파싱합니다.

**예제:**

정수(Integer), 부동소수점(Float), 불린(Bool), 문자열(String):

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

날짜(Date), 날짜시간(DateTime):

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

배열에 null이 포함되어 있는 경우, ClickHouse는 다른 배열 요소의 타입을 사용합니다:

```sql
DESC format(Values, '([NULL, 42, NULL])')
```

```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

튜플(Tuple):

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

중첩 배열, 튜플 및 맵:

```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```

```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

데이터에 null만 있어서 ClickHouse가 타입을 판별할 수 없으면 예외가 발생합니다:

```sql
DESC format(Values, '([NULL, NULL])')
```

```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'c1' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

`input_format_tsv_use_best_effort_in_schema_inference` 설정이 비활성화된 예:

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


### CustomSeparated \{#custom-separated\}

CustomSeparated 형식에서 ClickHouse는 먼저 지정된 구분 기호에 따라 행에서 모든 컬럼 값을 추출한 다음, 이스케이프 규칙에 따라 각 값의 데이터 타입을 추론합니다.

`input_format_custom_detect_header` 설정이 활성화되어 있으면, ClickHouse는 스키마를 추론하는 동안 컬럼 이름(그리고 타입일 수도 있음)이 포함된 헤더를 감지하려고 시도합니다. 이 설정은 기본적으로 활성화되어 있습니다.

**예시**

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

헤더 자동 감지 예제 (`input_format_custom_detect_header`가 활성화된 경우):

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


### Template \{#template\}

Template 형식에서 ClickHouse는 먼저 지정된 템플릿에 따라 행에서 모든 컬럼 값을 추출한 다음, 각 값에 대해 이스케이프 규칙에 따라
데이터 타입을 유추합니다.

**예시**

`resultset`이라는 이름의 파일에 다음과 같은 내용이 있다고 가정합니다:

```bash
<result_before_delimiter>
${data}<result_after_delimiter>
```

그리고 내용이 다음과 같은 `row_format` 파일:

```text
<row_before_delimiter>${column_1:CSV}<field_delimiter_1>${column_2:Quoted}<field_delimiter_2>${column_3:JSON}<row_after_delimiter>
```

이제 다음 쿼리를 실행할 수 있습니다.

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


### Regexp \{#regexp\}

Template와 유사하게, Regexp 포맷에서 ClickHouse는 먼저 지정된 정규 표현식에 따라 행에서 모든 컬럼 값을 추출한 다음, 지정된 이스케이프 규칙에 따라 각 값의 데이터 타입을 추론합니다.

**예시**

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


### 텍스트 형식 설정 \{#settings-for-text-formats\}

#### input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference \{#input-format-max-rows-to-read-for-schema-inference\}

이 설정은 스키마 추론을 수행하는 동안 읽을 데이터의 양을 제어합니다.
더 많은 행/바이트를 읽을수록 스키마 추론에 더 많은 시간이 소요되지만, 타입을 올바르게 판별할
가능성이 더 커집니다(특히 데이터에 null 값이 많이 포함된 경우).

기본값:

-   `input_format_max_rows_to_read_for_schema_inference`의 기본값은 `25000`입니다.
-   `input_format_max_bytes_to_read_for_schema_inference`의 기본값은 `33554432`(32 MB)입니다.

#### column_names_for_schema_inference \{#column-names-for-schema-inference\}

명시적인 컬럼 이름이 없는 포맷에서 스키마 추론에 사용할 컬럼 이름 목록입니다. 지정한 이름은 기본값 `c1,c2,c3,...` 대신 사용됩니다. 형식은 `column1,column2,column3,...`입니다.

**예시**

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


#### schema_inference_hints \{#schema-inference-hints\}

자동으로 결정된 타입 대신 스키마 추론에서 사용할 컬럼 이름과 타입 목록입니다. 형식: &#39;column&#95;name1 column&#95;type1, column&#95;name2 column&#95;type2, ...&#39;.
이 SETTING은 자동으로 결정할 수 없었던 컬럼 타입을 지정하거나 스키마를 최적화하는 데 사용할 수 있습니다.

**예시**

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


#### schema_inference_make_columns_nullable $ \{#schema-inference-make-columns-nullable\}

널 허용 여부 정보가 없는 형식에서 스키마 추론 시 추론된 타입을 `Nullable`로 설정할지 여부를 제어합니다. 가능한 값:

* 0 - 추론된 타입은 `Nullable`이 될 수 없습니다,
* 1 - 추론된 모든 타입은 `Nullable`로 처리됩니다,
* 2 또는 &#39;auto&#39; - 텍스트 포맷의 경우, 스키마 추론 중에 파싱되는 샘플에서 해당 컬럼에 `NULL`이 포함된 경우에만 추론된 타입이 `널 허용`이 되며, 강 타입 포맷(Parquet, ORC, Arrow)의 경우 널 허용 여부 정보는 파일 메타데이터에서 가져옵니다,
* 3 - 텍스트 형식에서는 `Nullable`을 사용하고, 강타입 형식에서는 파일 메타데이터를 사용합니다.

기본값: 3.

**예시**

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

#### input_format_try_infer_integers \{#input-format-try-infer-integers\}

:::note
이 설정은 `JSON` 데이터 타입에는 적용되지 않습니다.
:::

활성화되면 ClickHouse는 텍스트 포맷 스키마 추론 시 부동 소수점 대신 정수를 추론하려고 시도합니다.
샘플 데이터의 해당 컬럼에 있는 모든 숫자가 정수이면 결과 타입은 `Int64`가 되며, 하나라도 부동 소수점 숫자가 있으면 결과 타입은 `Float64`가 됩니다.
샘플 데이터에 정수만 포함되고, 그중 하나 이상의 정수가 양수이면서 `Int64` 범위를 초과하면 ClickHouse는 `UInt64`로 추론합니다.

기본적으로 활성화되어 있습니다.

**예시**

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


#### input_format_try_infer_datetimes \{#input-format-try-infer-datetimes\}

이 설정을 활성화하면 ClickHouse는 텍스트 형식에 대한 스키마 추론 시 문자열 필드에서 `DateTime` 또는 `DateTime64` 타입을 추론하려고 시도합니다.
샘플 데이터에서 하나의 컬럼에 있는 모든 필드가 날짜-시간 값으로 정상적으로 파싱되면 결과 타입은 `DateTime` 또는 `DateTime64(9)`(어떤 날짜-시간 값이라도 소수 부분을 가진 경우)가 되고,
하나라도 날짜-시간 값으로 파싱되지 않은 필드가 있으면 결과 타입은 `String`이 됩니다.

기본적으로 이 설정은 활성화되어 있습니다.

**예시**

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


#### input_format_try_infer_datetimes_only_datetime64 \{#input-format-try-infer-datetimes-only-datetime64\}

이 설정을 활성화하면, datetime 값에 소수 부분이 없더라도 `input_format_try_infer_datetimes` 가 활성화되어 있는 경우 ClickHouse는 항상 `DateTime64(9)`로 추론합니다.

기본적으로 비활성화되어 있습니다.

**예시**

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

참고: 스키마 추론 중 datetime을 파싱할 때는 [date&#95;time&#95;input&#95;format](/operations/settings/settings-formats.md#date_time_input_format) 설정을 따릅니다.


#### input_format_try_infer_dates \{#input-format-try-infer-dates\}

이 설정을 활성화하면 ClickHouse는 텍스트 형식에 대한 스키마 추론에서 문자열 필드로부터 `Date` 타입을 추론하려고 시도합니다.
샘플 데이터에서 하나의 컬럼에 있는 모든 필드를 날짜로 성공적으로 파싱한 경우 결과 타입은 `Date`가 되며,
하나라도 날짜로 파싱되지 않은 필드가 있으면 결과 타입은 `String`이 됩니다.

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


#### input_format_try_infer_exponent_floats \{#input-format-try-infer-exponent-floats\}

이 설정을 활성화하면 ClickHouse는 텍스트 형식에서 지수 형태의 실수 값을 추론하려고 합니다(항상 지수 형태의 숫자를 추론하는 JSON은 예외입니다).

기본값은 비활성화입니다.

**예시**

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


## Self describing formats \{#self-describing-formats\}

Self-describing 형식은 데이터 자체에 데이터 구조에 대한 정보를 포함하는 형식으로,
설명을 담은 헤더, 이진 타입 트리, 또는 일종의 테이블일 수 있습니다.
이러한 형식의 파일에서 스키마를 자동으로 추론하기 위해 ClickHouse는
타입 정보가 포함된 데이터의 일부를 읽고 이를 ClickHouse 테이블의 스키마로 변환합니다.

### -WithNamesAndTypes 접미사가 있는 포맷 \{#formats-with-names-and-types\}

ClickHouse는 -WithNamesAndTypes 접미사가 있는 일부 텍스트 형식을 지원합니다. 이 접미사가 붙은 형식의 데이터에는 실제 데이터 앞에 컬럼 이름과 타입을 담은 행이 두 개 추가로 포함됩니다.
이러한 형식에 대해 스키마 추론을 수행할 때 ClickHouse는 처음 두 행을 읽고 컬럼 이름과 타입을 추출합니다.

**예시**

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


### 메타데이터가 포함된 JSON 포맷 \{#json-with-metadata\}

일부 JSON 입력 포맷([JSON](/interfaces/formats/JSON), [JSONCompact](/interfaces/formats/JSONCompact), [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata))에는 컬럼 이름과 타입이 포함된 메타데이터가 있습니다.
이러한 포맷에 대해 스키마 추론을 수행할 때 ClickHouse는 이 메타데이터를 읽습니다.

**예시**

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


### Avro \{#avro\}

Avro 형식에서는 ClickHouse가 데이터에서 스키마를 읽어, 다음 데이터 타입 매핑을 사용해 ClickHouse 스키마로 변환합니다.

| Avro data type                     | ClickHouse data type                                                           |
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

\* [Avro logical types](https://avro.apache.org/docs/current/spec.html#Logical+Types)

다른 Avro 타입은 지원하지 않습니다.

### Parquet \{#parquet\}

Parquet 형식에서 ClickHouse는 데이터에서 스키마를 읽은 다음, 다음과 같은 타입 매칭을 사용하여 ClickHouse 스키마로 변환합니다.

| Parquet 데이터 타입          | ClickHouse 데이터 타입                                  |
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

그 외 Parquet 데이터 타입은 지원되지 않습니다.

### Arrow \{#arrow\}

Arrow 형식에서는 ClickHouse가 데이터에서 스키마를 읽어, 아래의 타입 매핑을 사용하여 ClickHouse 스키마로 변환합니다:

| Arrow 데이터 타입               | ClickHouse 데이터 타입                                  |
|---------------------------------|---------------------------------------------------------|
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

기타 Arrow 타입은 지원되지 않습니다.

### ORC \{#orc\}

ORC 형식에서 ClickHouse는 데이터로부터 스키마를 읽고, 다음 타입 매핑을 사용하여 ClickHouse 스키마로 변환합니다:

| ORC data type                        | ClickHouse data type                                    |
|--------------------------------------|---------------------------------------------------------|
| `Boolean`                            | [Bool](../sql-reference/data-types/boolean.md)          |
| `Tinyint`                            | [Int8](../sql-reference/data-types/int-uint.md)         |
| `Smallint`                           | [Int16](../sql-reference/data-types/int-uint.md)        |
| `Int`                                | [Int32](../sql-reference/data-types/int-uint.md)        |
| `Bigint`                             | [Int64](../sql-reference/data-types/int-uint.md)        |
| `Float`                              | [Float32](../sql-reference/data-types/float.md)         |
| `Double`                             | [Float64](../sql-reference/data-types/float.md)         |
| `Date`                               | [Date32](../sql-reference/data-types/date32.md)         |
| `Timestamp`                          | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `String`, `Char`, `Varchar`,`BINARY` | [String](../sql-reference/data-types/string.md)         |
| `Decimal`                            | [Decimal](../sql-reference/data-types/decimal.md)       |
| `List`                               | [Array](../sql-reference/data-types/array.md)           |
| `Struct`                             | [Tuple](../sql-reference/data-types/tuple.md)           |
| `Map`                                | [Map](../sql-reference/data-types/map.md)               |

기타 ORC 타입은 지원되지 않습니다.

### Native \{#native\}

Native 포맷은 ClickHouse 내부에서 사용되며 데이터에 스키마 정보를 포함합니다.
스키마 추론 시 ClickHouse는 어떠한 변환도 수행하지 않고 데이터에서 스키마를 직접 읽습니다.

## 외부 스키마를 사용하는 포맷 \{#formats-with-external-schema\}

이러한 포맷은 특정 스키마 언어로 작성된, 데이터 구조를 정의하는 별도의 파일(스키마)을 필요로 합니다.
이러한 포맷의 파일에서 스키마를 자동으로 추론하기 위해 ClickHouse는 별도의 파일에 있는 외부 스키마를 읽어 이를 ClickHouse 테이블 스키마로 변환합니다.

### Protobuf \{#protobuf\}

Protobuf 포맷의 스키마 추론에서 ClickHouse는 다음과 같은 타입 매핑을 사용합니다:

| Protobuf data type            | ClickHouse data type                              |
|-------------------------------|---------------------------------------------------|
| `bool`                        | [UInt8](../sql-reference/data-types/int-uint.md)  |
| `float`                       | [Float32](../sql-reference/data-types/float.md)   |
| `double`                      | [Float64](../sql-reference/data-types/float.md)   |
| `int32`, `sint32`, `sfixed32` | [Int32](../sql-reference/data-types/int-uint.md)  |
| `int64`, `sint64`, `sfixed64` | [Int64](../sql-reference/data-types/int-uint.md)  |
| `uint32`, `fixed32`           | [UInt32](../sql-reference/data-types/int-uint.md) |
| `uint64`, `fixed64`           | [UInt64](../sql-reference/data-types/int-uint.md) |
| `string`, `bytes`             | [String](../sql-reference/data-types/string.md)   |
| `enum`                        | [Enum](../sql-reference/data-types/enum.md)       |
| `repeated T`                  | [Array(T)](../sql-reference/data-types/array.md)  |
| `message`, `group`            | [Tuple](../sql-reference/data-types/tuple.md)     |

### CapnProto \{#capnproto\}

CapnProto 형식의 스키마 추론에서 ClickHouse는 다음과 같은 타입 매핑을 사용합니다:

| CapnProto data type                | ClickHouse data type                                   |
|------------------------------------|--------------------------------------------------------|
| `Bool`                             | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `Int8`                             | [Int8](../sql-reference/data-types/int-uint.md)        |
| `UInt8`                            | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `Int16`                            | [Int16](../sql-reference/data-types/int-uint.md)       |
| `UInt16`                           | [UInt16](../sql-reference/data-types/int-uint.md)      |
| `Int32`                            | [Int32](../sql-reference/data-types/int-uint.md)       |
| `UInt32`                           | [UInt32](../sql-reference/data-types/int-uint.md)      |
| `Int64`                            | [Int64](../sql-reference/data-types/int-uint.md)       |
| `UInt64`                           | [UInt64](../sql-reference/data-types/int-uint.md)      |
| `Float32`                          | [Float32](../sql-reference/data-types/float.md)        |
| `Float64`                          | [Float64](../sql-reference/data-types/float.md)        |
| `Text`, `Data`                     | [String](../sql-reference/data-types/string.md)        |
| `enum`                             | [Enum](../sql-reference/data-types/enum.md)            |
| `List`                             | [Array](../sql-reference/data-types/array.md)          |
| `struct`                           | [Tuple](../sql-reference/data-types/tuple.md)          |
| `union(T, Void)`, `union(Void, T)` | [Nullable(T)](../sql-reference/data-types/nullable.md) |

## 강한 타입의 이진 포맷 \{#strong-typed-binary-formats\}

이러한 포맷에서는 각 직렬화된 값에 그 타입 정보(및 이름 정보가 포함될 수 있음)가 들어 있지만, 전체 테이블에 대한 정보는 포함되지 않습니다.
이러한 포맷에 대해 스키마 추론을 수행할 때 ClickHouse는 데이터를 행 단위로(`input_format_max_rows_to_read_for_schema_inference` 행 또는 `input_format_max_bytes_to_read_for_schema_inference` 바이트까지) 읽고,
데이터에서 각 값의 타입(및 이름이 있을 수 있음)을 추출한 다음, 이 타입들을 ClickHouse 타입으로 변환합니다.

### MsgPack \{#msgpack\}

MsgPack 형식에서는 행 사이에 구분자가 없으므로, 이 형식에 대해 스키마 추론을 사용하려면 `input_format_msgpack_number_of_columns` 설정을 사용하여 테이블의 컬럼 개수를 지정해야 합니다. ClickHouse에서는 다음과 같이 데이터 타입을 매핑합니다:

| MessagePack data type (`INSERT`)                                   | ClickHouse data type                                      |
|--------------------------------------------------------------------|-----------------------------------------------------------|
| `int N`, `uint N`, `negative fixint`, `positive fixint`            | [Int64](../sql-reference/data-types/int-uint.md)          |
| `bool`                                                             | [UInt8](../sql-reference/data-types/int-uint.md)          |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32` | [String](../sql-reference/data-types/string.md)           |
| `float 32`                                                         | [Float32](../sql-reference/data-types/float.md)           |
| `float 64`                                                         | [Float64](../sql-reference/data-types/float.md)           |
| `uint 16`                                                          | [Date](../sql-reference/data-types/date.md)               |
| `uint 32`                                                          | [DateTime](../sql-reference/data-types/datetime.md)       |
| `uint 64`                                                          | [DateTime64](../sql-reference/data-types/datetime.md)     |
| `fixarray`, `array 16`, `array 32`                                 | [Array](../sql-reference/data-types/array.md)             |
| `fixmap`, `map 16`, `map 32`                                       | [Map](../sql-reference/data-types/map.md)                 |

기본적으로 추론된 모든 타입은 `Nullable`(널 허용) 안에 포함되지만, `schema_inference_make_columns_nullable` 설정을 사용하여 이를 변경할 수 있습니다.

### BSONEachRow \{#bsoneachrow\}

BSONEachRow 형식에서는 각 행의 데이터가 BSON 문서로 표현됩니다. 스키마 추론(schema inference) 과정에서 ClickHouse는 BSON 문서를 하나씩 읽어 데이터에서 값, 이름, 타입을 추출한 다음, 다음 타입 매핑을 사용해 이 타입들을 ClickHouse 타입으로 변환합니다:

| BSON Type                                                                                     | ClickHouse type                                                                                                             |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `\x08` boolean                                                                                | [Bool](../sql-reference/data-types/boolean.md)                                                                              |
| `\x10` int32                                                                                  | [Int32](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x12` int64                                                                                  | [Int64](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x01` double                                                                                 | [Float64](../sql-reference/data-types/float.md)                                                                             |
| `\x09` datetime                                                                               | [DateTime64](../sql-reference/data-types/datetime64.md)                                                                     |
| `\x05` binary with`\x00` binary subtype, `\x02` string, `\x0E` symbol, `\x0D` JavaScript code | [String](../sql-reference/data-types/string.md)                                                                             |
| `\x07` ObjectId,                                                                              | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                               |
| `\x05` binary with `\x04` uuid subtype, size = 16                                             | [UUID](../sql-reference/data-types/uuid.md)                                                                                 |
| `\x04` array                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md) (if nested types are different) |
| `\x03` document                                                                               | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md) (with String keys)            |

기본적으로 모든 추론된 타입은 널 허용 `Nullable` 타입으로 처리되지만, `schema_inference_make_columns_nullable` 설정으로 이를 변경할 수 있습니다.

## 고정 스키마 형식 \{#formats-with-constant-schema\}

이러한 형식의 데이터는 항상 동일한 스키마를 사용합니다.

### LineAsString \{#line-as-string\}

이 포맷에서는 ClickHouse가 데이터의 전체 한 줄을 `String` 데이터 타입의 단일 컬럼으로 읽습니다. 이 포맷의 추론 타입은 항상 `String`이며, 컬럼 이름은 `line`입니다.

**예시**

```sql
DESC format(LineAsString, 'Hello\nworld!')
```

```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ line │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


### JSONAsString \{#json-as-string\}

이 포맷에서 ClickHouse는 데이터의 JSON 객체 전체를 `String` 데이터 타입의 하나의 컬럼으로 읽습니다. 이 포맷에서 추론되는 타입은 항상 `String`이며, 컬럼 이름은 `json`입니다.

**예시**

```sql
DESC format(JSONAsString, '{"x" : 42, "y" : "Hello, World!"}')
```

```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


### JSONAsObject \{#json-as-object\}

이 형식에서는 ClickHouse가 데이터에서 전체 JSON 객체를 `JSON` 데이터 타입의 단일 컬럼으로 읽습니다. 이 형식에서 추론되는 타입은 항상 `JSON`이며, 컬럼 이름은 `json`입니다.

**예시**

```sql
DESC format(JSONAsObject, '{"x" : 42, "y" : "Hello, World!"}');
```

```response
┌─name─┬─type─┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ JSON │              │                    │         │                  │                │
└──────┴──────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


## 스키마 추론 모드 \{#schema-inference-modes\}

데이터 파일 집합에서 스키마 추론은 `default` 및 `union` 두 가지 모드로 동작합니다.
이 모드는 `schema_inference_mode` 설정으로 제어됩니다.

### 기본 모드 \{#default-schema-inference-mode\}

기본 모드에서는 ClickHouse가 모든 파일이 동일한 스키마를 가진다고 가정하고, 성공할 때까지 파일을 하나씩 읽으면서 스키마를 추론합니다.

예:

3개의 파일 `data1.jsonl`, `data2.jsonl`, `data3.jsonl`에 다음 내용이 있다고 가정합니다:

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

이 3개의 파일에 대해 스키마 추론을 사용해 보겠습니다.

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

보는 바와 같이 파일 `data3.jsonl`에서 가져온 `field3` 컬럼이 없습니다.
이는 ClickHouse가 먼저 파일 `data1.jsonl`에서 스키마를 추론하려 했지만 `field2` 필드가 모두 null 값이라 실패하고,
그 다음에 `data2.jsonl`에서 스키마 추론을 시도해 성공했기 때문에 파일 `data3.jsonl`의 데이터는 읽히지 않았기 때문입니다.


### Union 모드 \{#default-schema-inference-mode-1\}

Union 모드에서는 파일들이 서로 다른 스키마를 가질 수 있다고 ClickHouse가 가정하므로, 각 파일의 스키마를 추론한 다음 이를 하나의 공통 스키마로 합칩니다.

예를 들어 `data1.jsonl`, `data2.jsonl`, `data3.jsonl` 3개의 파일에 다음과 같은 내용이 있다고 가정합니다:

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

이 3개 파일에 스키마 추론을 적용해 보겠습니다.

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

보는 것처럼, 모든 파일의 모든 필드를 확인할 수 있습니다.

참고:

* 일부 파일에는 최종 스키마에 포함된 일부 컬럼이 없을 수 있으므로, union 모드는 컬럼 부분 집합 읽기를 지원하는 포맷(JSONEachRow, Parquet, TSVWithNames 등)에만 지원되며, CSV, TSV, JSONCompactEachRow 등 다른 포맷에서는 동작하지 않습니다.
* ClickHouse가 파일 중 하나에서 스키마를 유추하지 못하면 예외가 발생합니다.
* 파일이 매우 많은 경우, 모든 파일에서 스키마를 읽는 데 많은 시간이 걸릴 수 있습니다.


## 자동 포맷 감지 \{#automatic-format-detection\}

데이터 포맷이 지정되지 않았고 파일 확장자로도 결정할 수 없는 경우, ClickHouse는 파일 내용을 바탕으로 포맷을 감지하려고 시도합니다.

**예시:**

다음과 같은 내용을 가진 `data`라는 이름의 데이터가 있다고 가정합니다:

```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

형식이나 구조를 직접 지정하지 않고도 이 파일을 살펴보고 쿼리를 실행할 수 있습니다:

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
ClickHouse는 일부 포맷만 자동으로 감지할 수 있으며, 이 감지에는 시간이 소요됩니다. 따라서 항상 포맷을 명시적으로 지정하는 것이 좋습니다.
:::
