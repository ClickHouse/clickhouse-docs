---
'title': 'JSON 스키마 추론'
'slug': '/integrations/data-formats/json/inference'
'description': 'JSON 스키마 추론을 사용하는 방법'
'keywords':
- 'json'
- 'schema'
- 'inference'
- 'schema inference'
'doc_type': 'guide'
---

ClickHouse는 JSON 데이터의 구조를 자동으로 결정할 수 있습니다. 이는 `clickhouse-local` 또는 S3 버킷의 디스크에서 JSON 데이터를 직접 쿼리하는 데 사용되며, ClickHouse에 데이터를 로드하기 전에 스키마를 자동으로 생성하는 데 사용할 수 있습니다.

## 타입 추론을 사용할 때 {#when-to-use-type-inference}

* **일관된 구조** - 타입을 추론할 데이터는 관심 있는 모든 키를 포함하고 있습니다. 타입 추론은 [최대 행 수](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) 또는 [바이트 수](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)까지 데이터를 샘플링하는 데 기반합니다. 샘플 이후의 데이터는 추가 열을 포함하고 있으므로 무시되며 쿼리할 수 없습니다.
* **일관된 타입** - 특정 키에 대한 데이터 타입은 호환 가능해야 하며, 즉 하나의 타입을 다른 타입으로 자동으로 강제변환할 수 있어야 합니다.

변화가 많은 JSON 데이터의 경우, 새로운 키가 추가되고 동일한 경로에 대해 여러 타입이 가능할 수 있습니다. ["반구조화된 및 동적 데이터 작업하기"](/integrations/data-formats/json/inference#working-with-semi-structured-data)를 참조하십시오.

## 타입 감지 {#detecting-types}

다음은 JSON이 일관된 구조를 가지며 각 경로에 대해 단일 타입이 있다고 가정합니다.

우리의 이전 예제는 `NDJSON` 형식의 [Python PyPI 데이터셋](https://clickpy.clickhouse.com/)의 간단한 버전을 사용했습니다. 이 섹션에서는 중첩 구조가 있는 더 복잡한 데이터셋인 [arXiv 데이터셋](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), 즉 250만 개의 학술 논문이 포함된 데이터셋을 탐색합니다. 이 데이터셋의 각 행은 출판된 학술 논문을 나타냅니다. 예제 행은 아래와 같습니다:

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "With disks and networks providing gigabytes per second ....\n",
  "versions": [
    {
      "created": "Mon, 11 Jan 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Sat, 30 Jan 2021 23:57:29 GMT",
      "version": "v2"
    }
  ],
  "update_date": "2022-11-07",
  "authors_parsed": [
    [
      "Lemire",
      "Daniel",
      ""
    ]
  ]
}
```

이 데이터는 이전 예제보다 훨씬 복잡한 스키마를 필요로 합니다. 아래에 이 스키마를 정의하는 과정을 설명하며, `Tuple` 및 `Array`와 같은 복합 타입을 소개합니다.

이 데이터셋은 `s3://datasets-documentation/arxiv/arxiv.json.gz`의 공용 S3 버킷에 저장되어 있습니다.

위의 데이터셋이 중첩된 JSON 객체를 포함하고 있음을 알 수 있습니다. 사용자는 스키마를 초안 작성하고 버전 관리해야 하지만, 추론을 통해 데이터에서 타입을 추론할 수 있습니다. 이는 스키마 DDL을 자동으로 생성하여 수동으로 구축할 필요를 없애고 개발 프로세스를 가속화합니다.

:::note 자동 포맷 감지
스키마를 감지하는 것 외에도, JSON 스키마 추론은 파일 확장자 및 내용을 통해 데이터의 형식을 자동으로 추론합니다. 위의 파일은 자동으로 NDJSON 형식으로 감지됩니다.
:::

[s3 함수](/sql-reference/table-functions/s3)를 사용하여 `DESCRIBE` 명령어를 실행하면 추론될 타입을 보여줍니다.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS describe_compact_output = 1
```
```response
┌─name───────────┬─type────────────────────────────────────────────────────────────────────┐
│ id             │ Nullable(String)                                                        │
│ submitter      │ Nullable(String)                                                        │
│ authors        │ Nullable(String)                                                        │
│ title          │ Nullable(String)                                                        │
│ comments       │ Nullable(String)                                                        │
│ journal-ref    │ Nullable(String)                                                        │
│ doi            │ Nullable(String)                                                        │
│ report-no      │ Nullable(String)                                                        │
│ categories     │ Nullable(String)                                                        │
│ license        │ Nullable(String)                                                        │
│ abstract       │ Nullable(String)                                                        │
│ versions       │ Array(Tuple(created Nullable(String),version Nullable(String)))         │
│ update_date    │ Nullable(Date)                                                          │
│ authors_parsed │ Array(Array(Nullable(String)))                                          │
└────────────────┴─────────────────────────────────────────────────────────────────────────┘
```
:::note NULL 방지
많은 열이 Nullable로 감지되는 것을 볼 수 있습니다. 꼭 필요하지 않은 경우 [Nullable](/sql-reference/data-types/nullable#storage-features) 타입의 사용을 권장하지 않습니다. [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)를 사용하여 Nullable이 적용되는 경우의 동작을 제어할 수 있습니다.
:::

대부분의 열이 자동으로 `String`으로 감지되었으며, `update_date` 열은 정확하게 `Date`로 감지되었습니다. `versions` 열은 객체 목록을 저장하기 위해 `Array(Tuple(created String, version String))`으로 생성되었으며, `authors_parsed`는 중첩 배열에 대해 `Array(Array(String))`로 정의되었습니다.

:::note 타입 감지 제어
날짜와 날짜/시간의 자동 감지는 설정 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) 및 [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes)에 의해 제어될 수 있습니다(둘 다 기본적으로 활성화됨). 객체를 튜플로 추론하는 것은 설정 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects)에 의해 제어됩니다. 숫자의 자동 감지와 같은 JSON의 스키마 추론을 제어하는 다른 설정은 [여기](/interfaces/schema-inference#text-formats)에서 확인할 수 있습니다.
:::

## JSON 쿼리하기 {#querying-json}

다음은 JSON이 일관된 구조를 가지며 각 경로에 대해 단일 타입이 있다고 가정합니다.

우리는 스키마 추론을 통해 제자리에서 JSON 데이터를 쿼리할 수 있습니다. 아래에서는 날짜와 배열이 자동으로 감지되는 점을 활용하여 각 연도의 주요 저자를 찾습니다.

```sql
SELECT
 toYear(update_date) AS year,
 authors,
    count() AS c
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
GROUP BY
    year,
 authors
ORDER BY
    year ASC,
 c DESC
LIMIT 1 BY year

┌─year─┬─authors────────────────────────────────────┬───c─┐
│ 2007 │ The BABAR Collaboration, B. Aubert, et al  │  98 │
│ 2008 │ The OPAL collaboration, G. Abbiendi, et al │  59 │
│ 2009 │ Ashoke Sen                                 │  77 │
│ 2010 │ The BABAR Collaboration, B. Aubert, et al  │ 117 │
│ 2011 │ Amelia Carolina Sparavigna                 │  21 │
│ 2012 │ ZEUS Collaboration                         │ 140 │
│ 2013 │ CMS Collaboration                          │ 125 │
│ 2014 │ CMS Collaboration                          │  87 │
│ 2015 │ ATLAS Collaboration                        │ 118 │
│ 2016 │ ATLAS Collaboration                        │ 126 │
│ 2017 │ CMS Collaboration                          │ 122 │
│ 2018 │ CMS Collaboration                          │ 138 │
│ 2019 │ CMS Collaboration                          │ 113 │
│ 2020 │ CMS Collaboration                          │  94 │
│ 2021 │ CMS Collaboration                          │  69 │
│ 2022 │ CMS Collaboration                          │  62 │
│ 2023 │ ATLAS Collaboration                        │ 128 │
│ 2024 │ ATLAS Collaboration                        │ 120 │
└──────┴────────────────────────────────────────────┴─────┘

18 rows in set. Elapsed: 20.172 sec. Processed 2.52 million rows, 1.39 GB (124.72 thousand rows/s., 68.76 MB/s.)
```

스키마 추론 덕분에 스키마를 명시하지 않고도 JSON 파일을 쿼리할 수 있어 즉석에서 데이터 분석 작업을 가속화할 수 있습니다.

## 테이블 생성 {#creating-tables}

우리는 테이블의 스키마를 생성하기 위해 스키마 추론을 사용할 수 있습니다. 다음 `CREATE AS EMPTY` 명령은 테이블의 DDL을 추론하고 테이블을 생성합니다. 이는 데이터 로드 없이 수행됩니다:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

테이블 스키마를 확인하기 위해 `SHOW CREATE TABLE` 명령을 사용합니다:

```sql
SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `journal-ref` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

위의 내용은 이 데이터에 대한 올바른 스키마입니다. 스키마 추론은 데이터를 샘플링하고 행별로 데이터를 읽는 데 기반합니다. 열 값은 형식에 따라 추출되며, 각 값의 타입을 결정하기 위해 재귀 파서 및 휴리스틱이 사용됩니다. 스키마 추론에서 읽는 최대 행 수 및 바이트 수는 설정 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) (기본값 25000) 및 [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference) (기본값 32MB)로 제어됩니다. 감지가 올바르지 않은 경우 사용자는 [여기](/operations/settings/formats#schema_inference_make_columns_nullable)에 설명된대로 힌트를 제공할 수 있습니다.

### 스니펫에서 테이블 생성 {#creating-tables-from-snippets}

위의 예제는 S3의 파일을 사용하여 테이블 스키마를 생성했습니다. 사용자는 단일 행 스니펫에서 스키마를 생성하고자 할 수도 있습니다. 이는 아래와 같이 [format](/sql-reference/table-functions/format) 함수를 사용하여 달성할 수 있습니다:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM format(JSONEachRow, '{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"Withdisks and networks providing gigabytes per second ","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}') SETTINGS schema_inference_make_columns_nullable = 0

SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

## JSON 데이터 로드 {#loading-json-data}

다음은 JSON이 일관된 구조를 가지며 각 경로에 대해 단일 타입이 있다고 가정합니다.

이전 명령은 데이터가 로드될 수 있는 테이블을 생성했습니다. 이제 다음의 `INSERT INTO SELECT`를 사용하여 데이터를 테이블에 삽입할 수 있습니다:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

파일 등 다른 소스에서 데이터 로드에 대한 예는 [여기](/sql-reference/statements/insert-into)를 참조하십시오.

일단 로드되면, 원래 구조에서 행을 표시하기 위해 `PrettyJSONEachRow` 형식을 옵션으로 사용하여 데이터를 쿼리할 수 있습니다:

```sql
SELECT *
FROM arxiv
LIMIT 1
FORMAT PrettyJSONEachRow

{
  "id": "0704.0004",
  "submitter": "David Callan",
  "authors": "David Callan",
  "title": "A determinant of Stirling cycle numbers counts unlabeled acyclic",
  "comments": "11 pages",
  "journal-ref": "",
  "doi": "",
  "report-no": "",
  "categories": "math.CO",
  "license": "",
  "abstract": "  We show that a determinant of Stirling cycle numbers counts unlabeled acyclic\nsingle-source automata.",
  "versions": [
    {
      "created": "Sat, 31 Mar 2007 03:16:14 GMT",
      "version": "v1"
    }
  ],
  "update_date": "2007-05-23",
  "authors_parsed": [
    [
      "Callan",
      "David"
    ]
  ]
}

1 row in set. Elapsed: 0.009 sec.
```

## 오류 처리 {#handling-errors}

때때로 잘못된 데이터가 있을 수 있습니다. 예를 들어 특정 열이 올바른 타입이 아니거나 잘못된 형식의 JSON 객체가 있을 수 있습니다. 이를 위해, 데이터가 삽입 오류를 유발하는 경우 무시할 수 있는 특정 행 수를 허용하기 위해 설정 [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) 및 [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio)를 사용할 수 있습니다. 추가적으로, 추론을 돕기 위해 [힌트](/operations/settings/formats#schema_inference_hints)를 제공할 수 있습니다.

## 반구조화된 및 동적 데이터 작업하기 {#working-with-semi-structured-data}

우리의 이전 예제는 잘 알려진 키 이름과 타입을 가진 정적인 JSON을 사용했습니다. 그러나 이는 종종 그렇지 않습니다 - 키가 추가되거나 그 타입이 변경될 수 있습니다. 이는 모니터링 데이터와 같은 사용 사례에서 흔히 발생합니다.

ClickHouse는 전용 [`JSON`](/sql-reference/data-types/newjson) 타입을 통해 이를 처리합니다.

JSON이 매우 동적이고, 많은 고유 키와 동일한 키에 대해 여러 타입이 있는 경우, `JSONEachRow`와 함께 스키마 추론을 사용하여 각 키에 대한 열을 추론하려고 하지 않는 것이 좋습니다 - 데이터가 줄바꿈으로 구분된 JSON 형식이라고 해도 말입니다.

위의 [Python PyPI 데이터셋](https://clickpy.clickhouse.com/) 데이터셋의 확장 버전에서 다음 예제를 고려해 보십시오. 여기서는 임의의 `tags` 열에 임의의 키-값 쌍을 추가했습니다.

```json
{
  "date": "2022-09-22",
  "country_code": "IN",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "bandersnatch",
  "python_minor": "",
  "system": "",
  "version": "0.2.8",
  "tags": {
    "5gTux": "f3to*PMvaTYZsz!*rtzX1",
    "nD8CV": "value"
  }
}
```

이 데이터의 샘플은 줄바꿈으로 구분된 JSON 형식으로 공개적으로 제공됩니다. 이 파일에서 스키마 추론을 시도하면, 성능이 저하되고 매우 장황한 응답을 받게 될 것입니다:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

여기서 주요 문제는 스키마 추론에 `JSONEachRow` 형식이 사용되기 때문입니다. 이는 JSON 내의 **각 키에 대한 열 타입을 추론하려고 시도합니다** - 즉, [`JSON`](/sql-reference/data-types/newjson) 타입을 사용하지 않고 데이터를 고정된 스키마로 적용하려는 것입니다. 

수천 개의 고유 열이 있는 경우 이 추론 방식은 느립니다. 대신 사용자는 `JSONAsObject` 형식을 사용할 수 있습니다.

`JSONAsObject`는 전체 입력을 단일 JSON 객체로 간주하고, 이를 단일 [`JSON`](/sql-reference/data-types/newjson) 타입의 열에 저장하여 매우 동적이거나 중첩된 JSON 페이로드에 더 적합합니다.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

이 형식은 열이 조정할 수 없는 여러 타입을 가질 경우에도 필수적입니다. 예를 들어, 다음의 줄바꿈으로 구분된 JSON을 가진 `sample.json` 파일을 고려하십시오:

```json
{"a":1}
{"a":"22"}
```

이 경우 ClickHouse는 타입 충돌을 강제 변환하고 열 `a`를 `Nullable(String)`으로 해결할 수 있습니다.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 타입 강제 변환
이 타입 강제 변환은 여러 설정을 통해 제어할 수 있습니다. 위의 예제는 설정 [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings)에 의존합니다.
:::

그러나 일부 타입은 호환되지 않습니다. 다음 예제를 고려하십시오:

```json
{"a":1}
{"a":{"b":2}}
```

이 경우 어떤 형태의 타입 변환도 불가능합니다. 따라서 `DESCRIBE` 명령은 실패합니다:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

이 경우, `JSONAsObject`는 각 행을 단일 [`JSON`](/sql-reference/data-types/newjson) 타입으로 간주합니다(이는 동일한 열이 여러 타입을 갖는 것을 지원합니다). 이는 필수입니다:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```

## 추가 자료 {#further-reading}

데이터 타입 추론에 대해 더 알아보려면 이 [문서 페이지](/interfaces/schema-inference)를 참조할 수 있습니다.
