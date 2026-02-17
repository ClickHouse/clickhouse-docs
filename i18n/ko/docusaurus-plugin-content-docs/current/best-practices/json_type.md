---
slug: /best-practices/use-json-where-appropriate
sidebar_position: 10
sidebar_label: 'JSON 사용'
title: 'JSON을 적절하게 사용하기'
description: 'JSON을 언제 사용해야 하는지 설명하는 페이지'
keywords: ['JSON']
show_related_blogs: true
doc_type: 'reference'
---

import WhenToUseJson from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_when-to-use-json.md';

ClickHouse는 이제 반정형 및 동적 데이터용으로 설계된 네이티브 JSON 컬럼 타입을 제공합니다. **이는 데이터 포맷이 아니라 컬럼 타입**임을 명확히 할 필요가 있습니다. JSON을 문자열로 저장하거나 [JSONEachRow](/interfaces/formats/JSONEachRow)와 같은 지원되는 포맷을 통해 ClickHouse에 삽입할 수 있지만, 이것이 JSON 컬럼 타입을 사용한다는 의미는 아닙니다. JSON 타입은 데이터의 구조가 동적인 경우에만 사용해야 하며, 단순히 JSON을 저장한다는 이유만으로 JSON 타입을 사용하는 것은 적절하지 않습니다.

<WhenToUseJson />


## JSON 사용 시 고려 사항과 팁 \{#considerations-and-tips-for-using-json\}

JSON 타입은 경로를 서브컬럼으로 평탄화하여 효율적인 열 지향 저장을 가능하게 합니다. 그러나 유연성이 큰 만큼 그에 따른 책임도 있습니다. 효과적으로 사용하려면 다음을 따르십시오:

* 알려진 서브컬럼에 대한 타입을 지정해 불필요한 타입 추론을 피하기 위해 [컬럼 정의의 힌트](/sql-reference/data-types/newjson)를 사용하여 **경로 타입을 지정**합니다. 
* 값이 필요하지 않은 경우 [SKIP 및 SKIP REGEXP](/sql-reference/data-types/newjson)를 사용해 **경로를 건너뛰어** 저장 공간을 줄이고 성능을 향상시킵니다.
* **[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)를 너무 높게 설정하지 마십시오**. 값이 클수록 리소스 사용량이 증가하고 효율성이 떨어집니다. 일반적인 기준으로 10,000 미만으로 유지하는 것이 좋습니다.

:::note 타입 힌트 
타입 힌트는 불필요한 타입 추론을 피하는 것 이상의 기능을 제공합니다. 저장 및 처리 과정에서의 간접 참조를 완전히 제거합니다. 타입 힌트가 있는 JSON 경로는 항상 기존 컬럼과 동일하게 저장되며, [**discriminator 컬럼**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)이나 쿼리 시점의 동적 해석이 필요하지 않습니다. 이는 잘 정의된 타입 힌트를 사용하면 중첩된 JSON 필드가 처음부터 최상위 필드로 모델링된 것과 동일한 성능과 효율을 달성한다는 의미입니다. 따라서 대부분은 일관적이지만 여전히 JSON의 유연성에서 이점을 얻는 데이터셋에 대해, 타입 힌트는 스키마나 수집 파이프라인을 재구성할 필요 없이 성능을 유지하는 편리한 방법을 제공합니다.
:::

## 고급 기능 \{#advanced-features\}

* JSON 컬럼은 **다른 컬럼과 마찬가지로 프라이머리 키에 사용할 수 있습니다**. 하위 컬럼에는 코덱을 지정할 수 없습니다.
* [`JSONAllPathsWithTypes()` 및 `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions)와 같은 함수를 통해 인트로스펙션(introspection)을 지원합니다.
* `.^` 구문을 사용하여 중첩된 하위 객체를 읽을 수 있습니다.
* 쿼리 구문은 표준 SQL과 다를 수 있으며, 중첩 필드에는 별도의 캐스팅이나 연산자가 필요할 수 있습니다.

추가 안내는 [ClickHouse JSON 문서](/sql-reference/data-types/newjson)를 참조하거나 블로그 글 [A New Powerful JSON Data Type for ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)를 살펴보십시오.

## 예시 \{#examples\}

다음 JSON 샘플은 [Python PyPI 데이터셋](https://clickpy.clickhouse.com/)의 행 1개를 나타냅니다.

```json
{
  "date": "2022-11-15",
  "country_code": "ES",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "pip",
  "python_minor": "3.9",
  "system": "Linux",
  "version": "0.3.0"
}
```

이 스키마가 정적이고 각 필드의 타입을 명확하게 정의할 수 있다고 가정합니다. 데이터가 NDJSON 형식(각 줄마다 하나의 JSON 행)이라 하더라도, 이러한 스키마에는 JSON 타입을 사용할 필요가 없습니다. 기본 타입들만으로 스키마를 정의하면 됩니다.

```sql
CREATE TABLE pypi (
  `date` Date,
  `country_code` String,
  `project` String,
  `type` String,
  `installer` String,
  `python_minor` String,
  `system` String,
  `version` String
)
ENGINE = MergeTree
ORDER BY (project, date)
```

그리고 JSON 행을 삽입합니다:

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

250만 개의 학술 논문을 포함하는 [arXiv 데이터셋](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)을 생각해 보십시오. NDJSON 형식으로 제공되는 이 데이터셋의 각 행은 출판된 학술 논문 한 편을 나타냅니다. 예시 행은 아래와 같습니다.

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
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

여기서 JSON은 중첩된 구조를 가지고 있어 복잡하지만 예측 가능합니다. 필드의 개수와 타입은 변경되지 않습니다. 이 예제에 `JSON` 타입을 사용할 수도 있지만, [Tuples](/sql-reference/data-types/tuple) 및 [Nested](/sql-reference/data-types/nested-data-structures/nested) 타입을 사용해 구조를 명시적으로 정의할 수도 있습니다.

```sql
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

이번에도 데이터를 JSON 형식으로 삽입할 수 있습니다:


```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

`tags`라는 또 다른 컬럼이 추가되었다고 가정합니다. 이것이 단순히 문자열 목록이라면 `Array(String)`으로 모델링할 수 있겠지만, 혼합 타입을 가진 임의의 태그 구조를 추가할 수 있다고 가정해 보겠습니다 (`score`가 문자열 또는 정수임에 유의하십시오). 수정된 JSON 문서는 다음과 같습니다.

```sql
{
 "id": "2101.11408",
 "submitter": "Daniel Lemire",
 "authors": "Daniel Lemire",
 "title": "Number Parsing at a Gigabyte per Second",
 "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
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
 ],
 "tags": {
   "tag_1": {
     "name": "ClickHouse user",
     "score": "A+",
     "comment": "A good read, applicable to ClickHouse"
   },
   "28_03_2025": {
     "name": "professor X",
     "score": 10,
     "comment": "Didn't learn much",
     "updates": [
       {
         "name": "professor X",
         "comment": "Wolverine found more interesting"
       }
     ]
   }
 }
}
```

이 경우 arXiv 문서를 모두 JSON으로 모델링하거나, JSON `tags` 컬럼만 추가하는 방식으로 모델링할 수 있습니다. 아래에 두 가지 예제를 모두 제공합니다.

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
정렬 순서와 기본 키에 사용하므로 JSON 정의에서 `update_date` 컬럼에 타입 힌트를 제공합니다. 이를 통해 ClickHouse가 이 컬럼은 null이 될 수 없다는 것을 알 수 있고, 어떤 `update_date` 하위 컬럼을 사용해야 하는지 알 수 있도록 합니다(각 타입마다 여러 개가 있을 수 있으므로, 그렇지 않으면 모호합니다).
:::

이 테이블에 데이터를 삽입한 후, [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) 함수와 [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 출력 포맷을 사용하여 이후에 추론된 스키마를 확인할 수 있습니다:


```sql
INSERT INTO arxiv FORMAT JSONAsObject 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"A good read, applicable to ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Didn't learn much","updates":[{"name":"professor X","comment":"Wolverine found more interesting"}]}}}
```

```sql
SELECT JSONAllPathsWithTypes(doc)
FROM arxiv
FORMAT PrettyJSONEachRow

{
  "JSONAllPathsWithTypes(doc)": {
    "abstract": "String",
    "authors": "String",
    "authors_parsed": "Array(Array(Nullable(String)))",
    "categories": "String",
    "comments": "String",
    "doi": "String",
    "id": "String",
    "journal-ref": "String",
    "license": "String",
    "submitter": "String",
    "tags.28_03_2025.comment": "String",
    "tags.28_03_2025.name": "String",
    "tags.28_03_2025.score": "Int64",
    "tags.28_03_2025.updates": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
    "tags.tag_1.comment": "String",
    "tags.tag_1.name": "String",
    "tags.tag_1.score": "String",
    "title": "String",
    "update_date": "Date",
    "versions": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))"
  }
}

1 row in set. Elapsed: 0.003 sec.
```

또는 앞에서 정의한 스키마와 JSON `tags` 컬럼을 사용해 이를 모델링할 수 있습니다. 이는 일반적으로 더 선호되는 접근 방식으로, ClickHouse에서 필요한 추론을 최소화합니다.

```sql
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
    `authors_parsed` Array(Array(String)),
    `tags` JSON()
)
ENGINE = MergeTree
ORDER BY update_date
```

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]],"tags":{"tag_1":{"name":"ClickHouse user","score":"A+","comment":"A good read, applicable to ClickHouse"},"28_03_2025":{"name":"professor X","score":10,"comment":"Didn't learn much","updates":[{"name":"professor X","comment":"Wolverine found more interesting"}]}}}
```


이제 서브컬럼 `tags`의 데이터 타입을 추론할 수 있습니다.

```sql
SELECT JSONAllPathsWithTypes(tags)
FROM arxiv
FORMAT PrettyJSONEachRow

{
  "JSONAllPathsWithTypes(tags)": {
    "28_03_2025.comment": "String",
    "28_03_2025.name": "String",
    "28_03_2025.score": "Int64",
    "28_03_2025.updates": "Array(JSON(max_dynamic_types=16, max_dynamic_paths=256))",
    "tag_1.comment": "String",
    "tag_1.name": "String",
    "tag_1.score": "String"
  }
}

1 row in set. Elapsed: 0.002 sec.
```
