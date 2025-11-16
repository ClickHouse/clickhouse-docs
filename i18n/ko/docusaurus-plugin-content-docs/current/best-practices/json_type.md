---
'slug': '/best-practices/use-json-where-appropriate'
'sidebar_position': 10
'sidebar_label': 'JSON 사용하기'
'title': '적절할 때 JSON 사용'
'description': 'JSON을 언제 사용해야 하는지 설명하는 페이지'
'keywords':
- 'JSON'
'show_related_blogs': true
'doc_type': 'reference'
---

ClickHouse는 이제 반구조적이고 동적인 데이터에 맞춰 설계된 네이티브 JSON 컬럼 유형을 제공합니다. **이것은 데이터 형식이 아니라 컬럼 유형이라는 점을 명확히 하는 것이 중요합니다**—JSON을 ClickHouse에 문자열로 삽입하거나  [JSONEachRow](/interfaces/formats/JSONEachRow)와 같은 지원되는 형식을 통해 삽입할 수 있지만, 이는 JSON 컬럼 유형을 사용하는 것을 의미하지 않습니다. 사용자는 데이터의 구조가 동적일 때만 JSON 유형을 사용해야 하며, 단순히 JSON 형식을 저장할 때는 사용하지 않아야 합니다.

## JSON 유형을 사용할 때 {#when-to-use-the-json-type}

데이터에 다음과 같은 특성이 있을 때 JSON 유형을 사용하십시오:

* **예측할 수 없는 키**가 시간이 지남에 따라 변할 수 있습니다.
* **다양한 유형의 값**이 포함되어 있습니다 (예: 경로가 때때로 문자열을 포함할 수 있고, 때로는 숫자를 포함할 수 있음).
* 엄격한 형식 지정이 불가능한 스키마의 유연성이 필요합니다.

데이터 구조가 알려져 있고 일관된 경우, JSON 유형의 필요성은 거의 없으며, 데이터가 JSON 형식에 있더라도 마찬가지입니다. 특히 데이터가 다음과 같은 경우에는:

* **알려진 키를 가진 평면 구조**: 표준 컬럼 유형(예: String)을 사용하십시오.
* **예측 가능한 중첩 구조**: 이러한 구조에는 Tuple, Array 또는 Nested 유형을 사용하십시오.
* **변동되는 유형의 예측 가능한 구조**: Dynamic 또는 Variant 유형을 고려하십시오.

정적 컬럼을 예측 가능한 최상위 필드에 사용하고 페이로드의 동적 섹션에 대해 단일 JSON 컬럼을 사용하는 등 방법을 혼합할 수도 있습니다.

## JSON 사용 시 고려 사항 및 팁 {#considerations-and-tips-for-using-json}

JSON 유형은 경로를 하위 컬럼으로 평면화하여 효율적인 컬럼 저장을 가능하게 합니다. 그러나 유연성에는 책임이 따릅니다. 이를 효과적으로 사용하려면:

* **[컬럼 정의의 힌트](/sql-reference/data-types/newjson)를 사용하여 경로 유형을 지정하십시오**. 이를 통해 알려진 하위 컬럼의 유형을 지정하므로 불필요한 형식 추론을 피할 수 있습니다.
* **필요하지 않은 경로는 건너뛰십시오**, [SKIP 및 SKIP REGEXP](/sql-reference/data-types/newjson)을 사용하여 저장 공간을 줄이고 성능을 향상시킵니다.
* **[`max_dynamic_paths`](/sql-reference/data-types/newjson#reaching-the-limit-of-dynamic-paths-inside-json)를 너무 높게 설정하는 것을 피하십시오**—큰 값은 자원 소비를 증가시키고 효율성을 떨어뜨립니다. 일반적인 경험법칙으로 10,000 이하로 유지하는 것이 좋습니다.

:::note 유형 힌트 
유형 힌트는 불필요한 형식 추론을 피하는 방법 그 이상을 제공합니다—저장 및 처리 간접성을 완전히 없앱니다. 유형 힌트가 있는 JSON 경로는 항상 전통적인 컬럼처럼 저장되어 [**구분자 컬럼**](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse#storage-extension-for-dynamically-changing-data)이나 쿼리 시 동적 해석의 필요성을 우회합니다. 잘 정의된 유형 힌트가 있는 경우, 중첩된 JSON 필드는 처음부터 최상위 필드로 모델링된 것처럼 동일한 성능과 효율성을 달성합니다. 따라서 데이터셋이 대체로 일관되지만 여전히 JSON의 유연성으로부터 이익을 얻는 경우, 유형 힌트는 스키마나 데이터 수집 파이프라인을 다시 구조화할 필요 없이 성능을 보존하는 편리한 방법을 제공합니다.
:::

## 고급 기능 {#advanced-features}

* JSON 컬럼은 다른 컬럼과 마찬가지로 **기본 키에 사용할 수** 있습니다. 하위 컬럼에 대한 코덱은 지정할 수 없습니다.
* [`JSONAllPathsWithTypes()` 및 `JSONDynamicPaths()`](/sql-reference/data-types/newjson#introspection-functions)와 같은 기능을 통해 내부 검사가 가능합니다.
* `.^` 구문을 사용하여 중첩된 하위 객체를 읽을 수 있습니다.
* 쿼리 구문은 표준 SQL과 다를 수 있으며, 중첩 필드에 대한 특별한 형식 변환이나 연산자가 필요할 수 있습니다.

추가 지침은 [ClickHouse JSON 문서](/sql-reference/data-types/newjson)를 참조하거나 블로그 게시물 [ClickHouse를 위한 새로운 강력한 JSON 데이터 유형](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)을 탐색하십시오.

## 예제 {#examples}

다음 JSON 샘플을 고려하십시오. 이는 [Python PyPI 데이터셋](https://clickpy.clickhouse.com/)에서 나온 행을 나타냅니다.

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

이 스키마가 정적이며 유형을 잘 정의할 수 있다고 가정합니다. 데이터 형식이 NDJSON(각 행이 JSON)일지라도 그러한 스키마에 JSON 유형을 사용할 필요는 없습니다. 클래식 유형으로 스키마를 정의하십시오.

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

그리고 JSON 행을 삽입하십시오:

```sql
INSERT INTO pypi FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"ES","project":"clickhouse-connect","type":"bdist_wheel","installer":"pip","python_minor":"3.9","system":"Linux","version":"0.3.0"}
```

[arXiv 데이터셋](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download)을 고려하십시오. 이 데이터셋은 250만 개의 학술 논문을 포함하고 있습니다. 이 데이터셋의 각 행은 발표된 학술 논문을 나타냅니다. 다음은 예제 행입니다:

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

여기의 JSON은 중첩된 구조로 복잡하지만, 예측 가능합니다. 필드의 수와 유형은 변하지 않을 것입니다. 이 예제에 JSON 유형을 사용할 수 있지만, [Tuples](/sql-reference/data-types/tuple) 및 [Nested](/sql-reference/data-types/nested-data-structures/nested) 유형을 사용하여 구조를 명시적으로 정의할 수도 있습니다:

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

다시 JSON으로 데이터를 삽입할 수 있습니다:

```sql
INSERT INTO arxiv FORMAT JSONEachRow 
{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/","journal-ref":"Software: Practice and Experience 51 (8), 2021","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"With disks and networks providing gigabytes per second ....\n","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}
```

`tags`라는 다른 컬럼이 추가되었다고 가정해 봅시다. 만약 이것이 단순한 문자열 목록이라면 `Array(String)`으로 모델링할 수 있지만, 사용자가 혼합 유형의 임의 태그 구조를 추가할 수 있다고 가정해 봅시다(여기서 `score`는 문자열 또는 정수입니다). 우리의 수정된 JSON 문서:

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

이 경우, arXiv 문서를 모두 JSON으로 모델링하거나 단순히 JSON `tags` 컬럼을 추가할 수 있습니다. 아래에 두 가지 예제를 제공합니다:

```sql
CREATE TABLE arxiv
(
  `doc` JSON(update_date Date)
)
ENGINE = MergeTree
ORDER BY doc.update_date
```

:::note
JSON 정의에서 `update_date` 컬럼에 대한 유형 힌트를 제공합니다. 우리는 이를 정렬/기본 키로 사용합니다. 이는 ClickHouse가 이 컬럼이 null이 아닐 것임을 알고, 어떤 `update_date` 하위 컬럼을 사용해야 하는지 알 수 있도록 도와줍니다(유형마다 여러 개가 있을 수 있으므로, 그렇지 않으면 애매합니다).
:::

이 테이블에 삽입하고 [`JSONAllPathsWithTypes`](/sql-reference/functions/json-functions#JSONAllPathsWithTypes) 함수와 [`PrettyJSONEachRow`](/interfaces/formats/PrettyJSONEachRow) 출력 형식으로 그 후에 추론된 스키마를 볼 수 있습니다:

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

또는 이전 스키마와 JSON `tags` 컬럼을 사용하여 모델링할 수도 있습니다. 이는 일반적으로 ClickHouse가 요구하는 추론을 최소화하므로 선호됩니다:

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

이제 하위 컬럼 `tags`의 유형을 추론할 수 있습니다.

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
