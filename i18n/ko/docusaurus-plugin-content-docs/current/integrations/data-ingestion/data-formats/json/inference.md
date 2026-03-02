---
title: 'JSON 스키마 추론'
slug: /integrations/data-formats/json/inference
description: 'JSON 스키마 추론 사용 방법'
keywords: ['json', 'schema', 'inference', '스키마 추론']
doc_type: 'guide'
---

ClickHouse는 JSON 데이터의 구조를 자동으로 결정할 수 있습니다. 이를 사용하면 `clickhouse-local`을 이용해 디스크에 있는 JSON 데이터나 S3 버킷의 JSON 데이터를 직접 쿼리하고, 데이터를 ClickHouse로 로드하기 전에 스키마를 자동으로 생성할 수 있습니다.

## 타입 추론을 언제 사용해야 하는가 \{#when-to-use-type-inference\}

* **일관된 구조** - 타입을 추론하려는 데이터에 관심 있는 모든 키가 포함되어 있어야 합니다. 타입 추론은 [최대 행 수](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) 또는 [바이트 수](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference)까지 데이터를 샘플링하여 수행합니다. 샘플 이후에 추가 컬럼이 포함된 데이터는 무시되며 조회할 수 없습니다.
* **일관된 타입** - 특정 키의 데이터 타입은 서로 호환 가능해야 합니다. 즉, 한 타입을 다른 타입으로 자동으로 변환(coerce)할 수 있어야 합니다.

새 키가 계속 추가되고, 동일한 경로에 대해 여러 타입이 존재할 수 있는 보다 동적인 JSON인 경우, ["반정형(semi-structured) 및 동적 데이터 다루기"](/integrations/data-formats/json/inference#working-with-semi-structured-data)를 참고하십시오.

## 타입 판별 \{#detecting-types\}

다음 내용에서는 JSON이 일관된 구조를 가지며, 각 경로에 대해 하나의 타입만 사용된다고 가정합니다.

앞선 예제에서는 `NDJSON` 형식의 단순화된 [Python PyPI 데이터셋](https://clickpy.clickhouse.com/)을 사용했습니다. 이 절에서는 중첩 구조를 포함한 더 복잡한 데이터셋인 [arXiv 데이터셋](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)을 살펴봅니다. 이 데이터셋에는 250만 편의 학술 논문이 포함되어 있습니다. `NDJSON` 형식으로 배포되는 이 데이터셋의 각 행은 발표된 한 편의 학술 논문을 나타냅니다. 예시 행은 아래와 같습니다:

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

이 데이터에는 앞선 예시보다 훨씬 더 복잡한 스키마가 필요합니다. 아래에서 이 스키마를 정의하는 과정을 설명하고, `Tuple` 및 `Array`와 같은 복합 타입을 소개합니다.

이 데이터셋은 공개 S3 버킷 `s3://datasets-documentation/arxiv/arxiv.json.gz`에 저장되어 있습니다.

위 데이터셋에는 중첩된 JSON 객체가 포함되어 있음을 알 수 있습니다. 스키마를 설계하고 버전 관리를 해야 하지만, 스키마 추론을 사용하면 데이터에서 타입을 자동으로 추론할 수 있습니다. 이를 통해 스키마 DDL을 자동으로 생성할 수 있으므로, 수동으로 작성할 필요가 없어지고 개발 속도를 높일 수 있습니다.

:::note Auto format detection
스키마를 감지하는 것뿐만 아니라, JSON 스키마 추론은 파일 확장자와 내용을 기반으로 데이터 포맷도 자동으로 추론합니다. 위 파일은 그 결과 NDJSON 형식으로 자동 감지됩니다.
:::

[s3 function](/sql-reference/table-functions/s3)을 `DESCRIBE` 명령과 함께 사용하면 추론될 타입을 확인할 수 있습니다.

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

:::note 널(null) 피하기
많은 컬럼이 널 허용(Nullable)로 추론된 것을 확인할 수 있습니다. [널 허용(Nullable) 타입은](/sql-reference/data-types/nullable#storage-features) 꼭 필요하지 않은 경우 사용하지 않을 것을 권장합니다. Nullable이 언제 적용될지 제어하기 위해 [schema&#95;inference&#95;make&#95;columns&#95;nullable](/operations/settings/formats#schema_inference_make_columns_nullable)을 사용할 수 있습니다.
:::

대부분의 컬럼이 자동으로 `String`으로 추론되었고, `update_date` 컬럼은 올바르게 `Date`로 추론된 것을 확인할 수 있습니다. `versions` 컬럼은 객체 목록을 저장하기 위해 `Array(Tuple(created String, version String))`으로 생성되었고, `authors_parsed`는 중첩 배열을 위해 `Array(Array(String))`으로 정의되었습니다.


:::note 타입 감지 제어
날짜와 datetime 값의 자동 감지는 각각 설정 [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) 및 [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes)을 통해 제어할 수 있습니다(둘 다 기본적으로 활성화되어 있습니다). 객체를 튜플로 추론하는 동작은 설정 [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects)을 통해 제어할 수 있습니다. 숫자의 자동 감지 등 JSON에 대한 스키마 추론을 제어하는 기타 설정은 [여기](/interfaces/schema-inference#text-formats)에서 확인할 수 있습니다.
:::

## JSON 쿼리하기 \{#querying-json\}

다음 내용에서는 JSON이 일관된 구조를 가지고 있고, 각 경로마다 단일 타입만 존재한다고 가정합니다.

스키마 추론을 활용하여 JSON 데이터에 대해 바로 쿼리를 수행할 수 있습니다. 아래 예시에서는 날짜와 배열이 자동으로 감지된다는 점을 활용하여, 연도별 상위 저자를 찾습니다.

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

스키마 추론을 사용하면 스키마를 별도로 정의할 필요 없이 JSON 파일을 바로 쿼리할 수 있어, 애드혹 데이터 분석 작업을 더 빠르게 수행할 수 있습니다.


## 테이블 생성 \{#creating-tables\}

테이블의 스키마를 생성하기 위해 스키마 추론을 활용할 수 있습니다. 다음 `CREATE AS EMPTY` 명령은 테이블에 대한 DDL을 자동으로 추론하여 테이블을 생성합니다. 이 명령은 어떠한 데이터도 로드하지 않습니다:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

테이블 스키마를 확인하려면 `SHOW CREATE TABLE` 명령을 사용합니다.

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

위의 예시는 이 데이터에 대한 올바른 스키마입니다. 스키마 추론은 데이터를 샘플링하고 데이터를 행 단위로 읽는 방식에 기반합니다. 컬럼 값은 지정된 포맷에 따라 추출되며, 각 값의 타입을 결정하기 위해 재귀 파서와 휴리스틱이 사용됩니다. 스키마 추론 시 데이터에서 읽는 최대 행 수와 바이트 수는 [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) (기본값 25,000)와 [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference) (기본값 32MB) 설정으로 제어됩니다. 스키마 추론이 올바르지 않은 경우 [여기](/operations/settings/formats#schema_inference_make_columns_nullable)에 설명된 대로 힌트를 제공할 수 있습니다.


### 스니펫에서 테이블 생성하기 \{#creating-tables-from-snippets\}

위 예제에서는 S3의 파일을 사용하여 테이블 스키마를 생성했습니다. 단일 행 스니펫에서 스키마를 생성해야 할 수도 있습니다. 이는 아래와 같이 [format](/sql-reference/table-functions/format) 함수를 사용하여 구현할 수 있습니다:

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


## JSON 데이터 로드 \{#loading-json-data\}

아래 내용은 JSON 데이터의 구조가 일정하며, 각 경로에 단일 타입만 존재한다고 가정합니다.

앞에서 실행한 명령어로 데이터를 로드할 테이블을 생성했습니다. 이제 다음 `INSERT INTO SELECT` 문을 사용하여 해당 테이블에 데이터를 삽입할 수 있습니다.

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

파일 등 다른 소스에서 데이터를 로드하는 예시는 [여기](/sql-reference/statements/insert-into)를 참고하십시오.

데이터가 로드되면 `PrettyJSONEachRow` 포맷을 선택적으로 사용하여 원래 구조 그대로의 행을 표시하면서 데이터를 쿼리할 수 있습니다:

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


## 오류 처리 \{#handling-errors\}

잘못된 데이터가 존재할 수 있습니다. 예를 들어, 특정 컬럼의 타입이 올바르지 않거나 형식이 잘못된 JSON 객체가 있을 수 있습니다. 이때 [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) 및 [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio) 설정을 사용하여, 데이터가 INSERT 오류를 발생시키는 경우 무시할 수 있는 행의 개수나 비율을 지정할 수 있습니다. 추가로, 스키마 추론을 보조하기 위해 [힌트](/operations/settings/formats#schema_inference_hints)를 제공할 수 있습니다.

## 반정형 및 동적 데이터 작업 \{#working-with-semi-structured-data\}

앞선 예제에서는 키 이름과 타입이 잘 알려져 있는 정적인 JSON 데이터를 사용했습니다. 그러나 실제로는 이런 경우가 드물며, 키가 추가되거나 타입이 변경될 수 있습니다. 이는 관측성 데이터와 같은 사용 사례에서 흔히 발생합니다.

ClickHouse는 이를 전용 [`JSON`](/sql-reference/data-types/newjson) 타입을 통해 처리합니다.

사용하는 JSON이 매우 동적이고 고유한 키가 많으며, 동일한 키에 여러 타입이 사용되는 것을 알고 있다면, 데이터가 줄바꿈으로 구분된 JSON 형식이라 하더라도 각 키마다 컬럼을 추론하려고 `JSONEachRow`와 스키마 추론(schema inference)을 사용하는 것은 권장하지 않습니다.

다음 예제는 위에서 사용한 [Python PyPI dataset](https://clickpy.clickhouse.com/)의 확장 버전입니다. 여기서는 임의의 키-값 쌍을 가진 `tags` 컬럼을 추가했습니다.

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

이 데이터의 샘플은 newline으로 구분된 JSON 형식으로 공개되어 있습니다. 이 파일에 대해 스키마 추론을 시도하면 성능이 매우 좋지 않고, 응답이 지나치게 장황하다는 것을 확인할 수 있습니다.

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

여기에서 주요한 문제는 추론에 `JSONEachRow` 포맷을 사용하고 있다는 점입니다. 이 포맷은 **JSON의 각 키마다 컬럼 타입을 추론**하려고 시도하며, 사실상 [`JSON`](/sql-reference/data-types/newjson) 타입을 사용하지 않고 데이터에 정적 스키마를 적용하려는 것입니다.

수천 개의 고유한 컬럼이 있는 경우 이러한 추론 방식은 느립니다. 대안으로 `JSONAsObject` 포맷을 사용할 수 있습니다.

`JSONAsObject`는 전체 입력을 하나의 JSON 객체로 취급하고, 이를 [`JSON`](/sql-reference/data-types/newjson) 타입의 단일 컬럼에 저장하므로, 매우 동적이거나 중첩된 JSON 페이로드에 더 적합합니다.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

이 형식은 컬럼에 서로 호환되지 않는 여러 타입이 있을 때도 필수적입니다. 예를 들어, 다음과 같은 줄바꿈으로 구분된 JSON이 포함된 `sample.json` 파일을 가정해 보십시오.

```json
{"a":1}
{"a":"22"}
```

이 경우 ClickHouse는 타입 충돌을 강제 변환으로 해결하고 컬럼 `a`를 `Nullable(String)` 타입으로 처리합니다.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note 타입 강제 변환(Type coercion)
이 타입 강제 변환은 여러 설정을 통해 제어할 수 있습니다. 위 예시는 [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings) 설정에 따라 동작합니다.
:::

그러나 일부 타입은 서로 호환되지 않습니다. 다음 예제를 살펴보십시오.

```json
{"a":1}
{"a":{"b":2}}
```

이 경우 여기에서는 어떤 형태로든 형 변환을 할 수 없습니다. 따라서 `DESCRIBE` 명령은 실패합니다:


```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

이 경우 `JSONAsObject`는 각 행을 단일 [`JSON`](/sql-reference/data-types/newjson) 타입(동일한 컬럼에 여러 타입을 허용하는 타입)으로 간주합니다. 이는 중요합니다:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```


## 추가 자료 \{#further-reading\}

데이터 타입 추론에 대해 더 알아보려면 [해당 문서 페이지](/interfaces/schema-inference)를 참고하십시오.