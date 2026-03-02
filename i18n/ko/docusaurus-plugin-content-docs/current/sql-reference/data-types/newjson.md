---
description: 'ClickHouse의 JSON 데이터 타입에 대한 문서로, JSON 데이터를 네이티브하게 처리할 수 있도록 지원합니다.'
keywords: ['json', '데이터 타입']
sidebar_label: 'JSON'
sidebar_position: 63
slug: /sql-reference/data-types/newjson
title: 'JSON 데이터 타입'
doc_type: 'reference'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import WhenToUseJson from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_when-to-use-json.md';
import Link from '@docusaurus/Link'

<Link to="/docs/best-practices/use-json-where-appropriate" style={{display: 'flex', textDecoration: 'none', width: 'fit-content'}}>
  <CardSecondary badgeState="success" badgeText="" description="예시, 고급 기능 및 JSON 타입 사용 시 고려 사항을 다루는 JSON 모범 사례 가이드를 참고하십시오." icon="book" infoText="자세히 보기" infoUrl="/docs/best-practices/use-json-where-appropriate" title="가이드가 필요하신가요?" />
</Link>

<br />

`JSON` 타입은 JavaScript Object Notation(JSON) 문서를 단일 컬럼에 저장합니다.

:::note
ClickHouse 오픈 소스에서 JSON 데이터 타입은 버전 25.3에서 프로덕션 사용 준비 완료 상태로 표시되었습니다. 이전 버전에서는 이 타입을 프로덕션 환경에서 사용하는 것을 권장하지 않습니다.
:::

`JSON` 타입 컬럼을 선언하려면 다음 구문을 사용할 수 있습니다:

```sql
<column_name> JSON
(
    max_dynamic_paths=N, 
    max_dynamic_types=M, 
    some.path TypeName, 
    SKIP path.to.skip, 
    SKIP REGEXP 'paths_regexp'
)
```

위 구문에서 사용하는 파라미터는 다음과 같이 정의됩니다.

| Parameter                   | Description                                                                                                                                                                                                                                                                                                           | Default Value |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `max_dynamic_paths`         | 선택적 파라미터로, 별도로 저장되는 단일 데이터 블록(예: MergeTree 테이블의 단일 데이터 파트)에서 경로를 서브 컬럼으로 각각 몇 개까지 개별적으로 저장할 수 있는지를 나타냅니다. <br /><br />이 한도를 초과하면, 나머지 모든 경로는 [shared data](#shared-data-structure)라고 불리는 단일 구조에 함께 저장됩니다.<br /><br />또한 이 파라미터 자체를 변경하지 않고도 동적 경로의 한도를 변경할 수 있는 [방법](#controlling-the-number-of-dynamic-paths)이 있습니다. | `1024`        |
| `max_dynamic_types`         | `1`에서 `255` 사이의 값을 가지는 선택적 파라미터로, 별도로 저장되는 단일 데이터 블록(예: MergeTree 테이블의 단일 데이터 파트)에서 단일 경로 컬럼(`Dynamic` 타입) 내부에 서로 다른 데이터 타입을 각각 몇 개까지 개별적으로 저장할 수 있는지를 나타냅니다. <br /><br />이 한도를 초과하면, 새로 등장하는 모든 타입은 `shared variant`라고 불리는 단일 구조에 함께 저장됩니다.                                                                          | `32`          |
| `some.path TypeName`        | JSON 내 특정 경로에 대한 선택적 타입 힌트입니다. 이러한 경로는 항상 지정된 타입의 서브 컬럼으로 저장됩니다.                                                                                                                                                                                                                                                      |               |
| `SKIP path.to.skip`         | JSON 파싱 중 건너뛰어야 하는 특정 경로에 대한 선택적 힌트입니다. 이러한 경로는 JSON 컬럼에 절대 저장되지 않습니다. 지정된 경로가 중첩 JSON 객체인 경우 전체 중첩 객체가 건너뛰어집니다.                                                                                                                                                                                                      |               |
| `SKIP REGEXP 'path_regexp'` | JSON 파싱 중 경로를 건너뛰는 데 사용되는 정규식에 대한 선택적 힌트입니다. 이 정규식과 일치하는 모든 경로는 JSON 컬럼에 절대 저장되지 않습니다.                                                                                                                                                                                                                                |               |

<WhenToUseJson />


## `JSON` 생성하기 \{#creating-json\}

이 섹션에서는 `JSON`을 생성하는 여러 가지 방법을 살펴봅니다.

### 테이블 컬럼 정의에서 `JSON`을 사용하기 \{#using-json-in-a-table-column-definition\}

```sql title="Query (Example 1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response (Example 1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"Hello, World!"}                       │
│ {"a":{"b":"43","e":"10"},"c":["4","5","6"]} │
└─────────────────────────────────────────────┘
```

```sql title="Query (Example 2)"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response (Example 2)"
┌─json──────────────────────────────┐
│ {"a":{"b":42},"c":["1","2","3"]}  │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":["4","5","6"]}  │
└───────────────────────────────────┘
```


### `::JSON`과 함께 CAST 사용하기 \{#using-cast-with-json\}

특수 구문인 `::JSON`을 사용하여 다양한 타입을 `JSON`으로 캐스팅할 수 있습니다.

#### `String`을 `JSON`으로 CAST하기 \{#cast-from-string-to-json\}

```sql title="Query"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```


#### `Tuple`을 `JSON`으로 CAST하기 \{#cast-from-tuple-to-json\}

```sql title="Query"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```


#### `Map`을 `JSON`으로 CAST하기 \{#cast-from-map-to-json\}

```sql title="Query"
SET use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

:::note
JSON 경로는 평탄화(flatten)된 형태로 저장됩니다. 이는 `a.b.c`와 같은 경로에서 JSON 객체를 다시 구성할 때,
객체를 `{ "a.b.c" : ... }`처럼 만들어야 하는지, 아니면 `{ "a": { "b": { "c": ... } } }`처럼 중첩 구조로 만들어야 하는지를 알 수 없다는 의미입니다.
본 구현에서는 항상 후자의 형태로 가정합니다.

예를 들어:

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') AS json
```

다음이 반환됩니다:

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

그리고 **다음과 같이 하면 안 됩니다**:

```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```

:::


## JSON 경로를 서브 컬럼으로 읽기 \{#reading-json-paths-as-sub-columns\}

`JSON` 타입은 모든 경로를 개별 서브 컬럼으로 읽을 수 있도록 지원합니다.
요청한 경로의 타입이 JSON 타입 선언에서 지정되지 않은 경우,
해당 경로의 서브 컬럼 타입은 항상 [Dynamic](/sql-reference/data-types/dynamic.md) 타입이 됩니다.

예를 들면 다음과 같습니다.

```sql title="Query"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42, "g" : 42.42}, "c" : [1, 2, 3], "d" : "2020-01-01"}'), ('{"f" : "Hello, World!", "d" : "2020-01-02"}'), ('{"a" : {"b" : 43, "e" : 10, "g" : 43.43}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response"
┌─json────────────────────────────────────────────────────────┐
│ {"a":{"b":42,"g":42.42},"c":["1","2","3"],"d":"2020-01-01"} │
│ {"a":{"b":0},"d":"2020-01-02","f":"Hello, World!"}          │
│ {"a":{"b":43,"g":43.43},"c":["4","5","6"]}                  │
└─────────────────────────────────────────────────────────────┘
```

```sql title="Query (Reading JSON paths as sub-columns)"
SELECT json.a.b, json.a.g, json.c, json.d FROM test;
```

```text title="Response (Reading JSON paths as sub-columns)"
┌─json.a.b─┬─json.a.g─┬─json.c──┬─json.d─────┐
│       42 │ 42.42    │ [1,2,3] │ 2020-01-01 │
│        0 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ    │ 2020-01-02 │
│       43 │ 43.43    │ [4,5,6] │ ᴺᵁᴸᴸ       │
└──────────┴──────────┴─────────┴────────────┘
```

`getSubcolumn` 함수를 사용하여 JSON 타입 컬럼에서 서브컬럼을 읽을 수도 있습니다:

```sql title="Query"
SELECT getSubcolumn(json, 'a.b'), getSubcolumn(json, 'a.g'), getSubcolumn(json, 'c'), getSubcolumn(json, 'd') FROM test;
```

```text title="Response"
┌─getSubcolumn(json, 'a.b')─┬─getSubcolumn(json, 'a.g')─┬─getSubcolumn(json, 'c')─┬─getSubcolumn(json, 'd')─┐
│                        42 │ 42.42                     │ [1,2,3]                 │ 2020-01-01              │
│                         0 │ ᴺᵁᴸᴸ                      │ ᴺᵁᴸᴸ                    │ 2020-01-02              │
│                        43 │ 43.43                     │ [4,5,6]                 │ ᴺᵁᴸᴸ                    │
└───────────────────────────┴───────────────────────────┴─────────────────────────┴─────────────────────────┘
```

요청한 경로가 데이터에 없으면 `NULL` 값으로 채워집니다:

```sql title="Query"
SELECT json.non.existing.path FROM test;
```

```text title="Response"
┌─json.non.existing.path─┐
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
└────────────────────────┘
```

반환된 서브컬럼의 데이터 타입을 확인합니다:

```sql title="Query"
SELECT toTypeName(json.a.b), toTypeName(json.a.g), toTypeName(json.c), toTypeName(json.d) FROM test;
```


```text title="Response"
┌─toTypeName(json.a.b)─┬─toTypeName(json.a.g)─┬─toTypeName(json.c)─┬─toTypeName(json.d)─┐
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
└──────────────────────┴──────────────────────┴────────────────────┴────────────────────┘
```

위에서 볼 수 있듯이 `a.b`의 타입은 JSON 타입 선언에서 지정한 대로 `UInt32`이며,
그 외 모든 서브 컬럼의 타입은 `Dynamic`입니다.

특수 문법인 `json.some.path.:TypeName`을 사용하여 `Dynamic` 타입의 서브 컬럼을 읽을 수도 있습니다:

```sql title="Query"
SELECT
    json.a.g.:Float64,
    dynamicType(json.a.g),
    json.d.:Date,
    dynamicType(json.d)
FROM test
```

```text title="Response"
┌─json.a.g.:`Float64`─┬─dynamicType(json.a.g)─┬─json.d.:`Date`─┬─dynamicType(json.d)─┐
│               42.42 │ Float64               │     2020-01-01 │ Date                │
│                ᴺᵁᴸᴸ │ None                  │     2020-01-02 │ Date                │
│               43.43 │ Float64               │           ᴺᵁᴸᴸ │ None                │
└─────────────────────┴───────────────────────┴────────────────┴─────────────────────┘
```

`Dynamic` 서브컬럼은 임의의 데이터 타입으로 캐스팅할 수 있습니다. 이때 `Dynamic`의 내부 데이터 타입을 요청된 데이터 타입으로 캐스팅할 수 없으면 예외가 발생합니다:

```sql title="Query"
SELECT json.a.g::UInt64 AS uint 
FROM test;
```

```text title="Response"
┌─uint─┐
│   42 │
│    0 │
│   43 │
└──────┘
```

```sql title="Query"
SELECT json.a.g::UUID AS float 
FROM test;
```

```text title="Response"
Received exception from server:
Code: 48. DB::Exception: Received from localhost:9000. DB::Exception: 
Conversion between numeric types and UUID is not supported. 
Probably the passed UUID is unquoted: 
while executing 'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0'. 
(NOT_IMPLEMENTED)
```

:::note
Compact MergeTree 파트에서 서브컬럼을 효율적으로 읽으려면 MergeTree 설정 [write&#95;marks&#95;for&#95;substreams&#95;in&#95;compact&#95;parts](../../operations/settings/merge-tree-settings.md#write_marks_for_substreams_in_compact_parts)가 활성화되어 있는지 확인하십시오.
:::


## JSON 하위 객체를 하위 컬럼으로 읽기 \{#reading-json-sub-objects-as-sub-columns\}

`JSON` 타입에서는 특수한 문법 `json.^some.path`를 사용하여 중첩 객체를 `JSON` 타입의 하위 컬럼으로 읽을 수 있습니다.

```sql title="Query"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : {"c" : 42, "g" : 42.42}}, "c" : [1, 2, 3], "d" : {"e" : {"f" : {"g" : "Hello, World", "h" : [1, 2, 3]}}}}'), ('{"f" : "Hello, World!", "d" : {"e" : {"f" : {"h" : [4, 5, 6]}}}}'), ('{"a" : {"b" : {"c" : 43, "e" : 10, "g" : 43.43}}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Response"
┌─json──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":"42","g":42.42}},"c":["1","2","3"],"d":{"e":{"f":{"g":"Hello, World","h":["1","2","3"]}}}} │
│ {"d":{"e":{"f":{"h":["4","5","6"]}}},"f":"Hello, World!"}                                                 │
│ {"a":{"b":{"c":"43","e":"10","g":43.43}},"c":["4","5","6"]}                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="Query"
SELECT json.^a.b, json.^d.e.f FROM test;
```

```text title="Response"
┌─json.^`a`.b───────────────────┬─json.^`d`.e.f──────────────────────────┐
│ {"c":"42","g":42.42}          │ {"g":"Hello, World","h":["1","2","3"]} │
│ {}                            │ {"h":["4","5","6"]}                    │
│ {"c":"43","e":"10","g":43.43} │ {}                                     │
└───────────────────────────────┴────────────────────────────────────────┘
```

:::note
하위 객체를 하위 컬럼으로 읽으면 JSON 데이터를 거의 전체 스캔해야 할 수 있어 비효율적일 수 있습니다.
:::


## 경로에 대한 타입 추론 \{#type-inference-for-paths\}

`JSON`을 파싱하는 동안 ClickHouse는 각 JSON 경로에 대해 가장 적절한 데이터 타입을 자동으로 감지합니다.
이는 [입력 데이터에서의 자동 스키마 추론](/interfaces/schema-inference.md)과 유사하게 동작하며,
다음 설정들에 의해 제어됩니다:

* [input&#95;format&#95;try&#95;infer&#95;dates](/operations/settings/formats#input_format_try_infer_dates)
* [input&#95;format&#95;try&#95;infer&#95;datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
* [schema&#95;inference&#95;make&#95;columns&#95;nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
* [input&#95;format&#95;json&#95;try&#95;infer&#95;numbers&#95;from&#95;strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
* [input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
* [input&#95;format&#95;json&#95;read&#95;numbers&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
* [input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
* [input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
* [input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)
* [input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;dynamic&#95;from&#95;array&#95;of&#95;different&#95;types](/operations/settings/formats#input_format_json_infer_array_of_dynamic_from_array_of_different_types)

몇 가지 예제를 살펴보겠습니다:

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=1, input_format_try_infer_datetimes=1;
```

```text title="Response"
┌─paths_with_types─────────────────┐
│ {'a':'Date','b':'DateTime64(9)'} │
└──────────────────────────────────┘
```

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=0, input_format_try_infer_datetimes=0;
```

```text title="Response"
┌─paths_with_types────────────┐
│ {'a':'String','b':'String'} │
└─────────────────────────────┘
```

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=1;
```

```text title="Response"
┌─paths_with_types───────────────┐
│ {'a':'Array(Nullable(Int64))'} │
└────────────────────────────────┘
```

```sql title="Query"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=0;
```

```text title="Response"
┌─paths_with_types─────┐
│ {'a':'Array(Int64)'} │
└──────────────────────┘
```


## JSON 객체 배열 처리 \{#handling-arrays-of-json-objects\}

객체 배열을 포함하는 JSON 경로는 `Array(JSON)` 타입으로 파싱된 후 해당 경로의 `Dynamic` 컬럼에 삽입됩니다.
객체 배열을 읽으려면 `Dynamic` 컬럼에서 하위 컬럼으로 추출해 사용할 수 있습니다:

```sql title="Query"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES
('{"a" : {"b" : [{"c" : 42, "d" : "Hello", "f" : [[{"g" : 42.42}]], "k" : {"j" : 1000}}, {"c" : 43}, {"e" : [1, 2, 3], "d" : "My", "f" : [[{"g" : 43.43, "h" : "2020-01-01"}]],  "k" : {"j" : 2000}}]}}'),
('{"a" : {"b" : [1, 2, 3]}}'),
('{"a" : {"b" : [{"c" : 44, "f" : [[{"h" : "2020-01-02"}]]}, {"e" : [4, 5, 6], "d" : "World", "f" : [[{"g" : 44.44}]],  "k" : {"j" : 3000}}]}}');
SELECT json FROM test;
```

```text title="Response"
┌─json────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":[{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}},{"c":"43"},{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}]}} │
│ {"a":{"b":["1","2","3"]}}                                                                                                                                               │
│ {"a":{"b":[{"c":"44","f":[[{"h":"2020-01-02"}]]},{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}]}}                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="Query"
SELECT json.a.b, dynamicType(json.a.b) FROM test;
```

```text title="Response"
┌─json.a.b──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─dynamicType(json.a.b)────────────────────────────────────┐
│ ['{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}}','{"c":"43"}','{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}'] │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
│ [1,2,3]                                                                                                                                                           │ Array(Nullable(Int64))                                   │
│ ['{"c":"44","f":[[{"h":"2020-01-02"}]]}','{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}']                                                  │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

이미 알 수 있듯이, 중첩된 `JSON` 타입의 `max_dynamic_types`/`max_dynamic_paths` 파라미터 값은 기본값보다 더 낮게 설정되었습니다.
이는 JSON 객체의 중첩 배열에서 하위 컬럼(sub-column)의 개수가 제어할 수 없을 정도로 증가하는 것을 방지하기 위해 필요합니다.

이제 중첩된 `JSON` 컬럼에서 하위 컬럼을 읽어 보겠습니다:

```sql title="Query"
SELECT json.a.b.:`Array(JSON)`.c, json.a.b.:`Array(JSON)`.f, json.a.b.:`Array(JSON)`.d FROM test; 
```


```text title="Response"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

특수 구문을 사용하면 `Array(JSON)` 서브 컬럼 이름을 직접 지정하지 않아도 됩니다:

```sql title="Query"
SELECT json.a.b[].c, json.a.b[].f, json.a.b[].d FROM test;
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

경로 뒤에 오는 `[]`의 개수는 배열의 수준을 나타냅니다. 예를 들어, `json.path[][]`는 `json.path.:Array(Array(JSON))`로 변환됩니다.

`Array(JSON)` 내부의 경로와 타입을 확인해 보겠습니다:

```sql title="Query"
SELECT DISTINCT arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b[]))) FROM test;
```

```text title="Response"
┌─arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b.:`Array(JSON)`)))──┐
│ ('c','Int64')                                                         │
│ ('d','String')                                                        │
│ ('f','Array(Array(JSON(max_dynamic_types=8, max_dynamic_paths=64)))') │
│ ('k.j','Int64')                                                       │
│ ('e','Array(Nullable(Int64))')                                        │
└───────────────────────────────────────────────────────────────────────┘
```

`Array(JSON)` 컬럼에서 하위 컬럼을 읽어 보겠습니다.

```sql title="Query"
SELECT json.a.b[].c.:Int64, json.a.b[].f[][].g.:Float64, json.a.b[].f[][].h.:Date FROM test;
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.c.:`Int64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.g.:`Float64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.h.:`Date`─┐
│ [42,43,NULL]                       │ [[[42.42]],[],[[43.43]]]                                     │ [[[NULL]],[],[['2020-01-01']]]                            │
│ []                                 │ []                                                           │ []                                                        │
│ [44,NULL]                          │ [[[NULL]],[[44.44]]]                                         │ [[['2020-01-02']],[[NULL]]]                               │
└────────────────────────────────────┴──────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

중첩된 `JSON` 컬럼에서 하위 객체의 서브 컬럼도 읽을 수 있습니다:

```sql title="Query"
SELECT json.a.b[].^k FROM test
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.^`k`─────────┐
│ ['{"j":"1000"}','{}','{"j":"2000"}'] │
│ []                                   │
│ ['{}','{"j":"3000"}']                │
└──────────────────────────────────────┘
```


## NULL이 포함된 JSON 키 처리 \{#handling-json-keys-with-nulls\}

이 JSON 구현에서는 `null` 값과 값이 없는 경우를 동일한 것으로 간주합니다.

```sql title="Query"
SELECT '{}'::JSON AS json1, '{"a" : null}'::JSON AS json2, json1 = json2
```

```text title="Response"
┌─json1─┬─json2─┬─equals(json1, json2)─┐
│ {}    │ {}    │                    1 │
└───────┴───────┴──────────────────────┘
```

이는 원본 JSON 데이터에 어떤 경로에 NULL 값이 있었는지, 아니면 해당 경로가 아예 존재하지 않았는지를 구분하는 것이 불가능함을 의미합니다.


## 점을 포함한 JSON 키 처리 \{#handling-json-keys-with-dots\}

내부적으로 JSON 컬럼은 모든 경로와 값을 평면화된 형태로 저장합니다. 이는 기본적으로 다음 두 객체가 동일한 것으로 간주된다는 의미입니다:

```json
{"a" : {"b" : 42}}
{"a.b" : 42}
```

두 경우 모두 내부적으로 경로 `a.b`와 값 `42`의 쌍으로 저장됩니다. JSON을 포맷팅할 때는 항상 점으로 구분된 경로 파트에 기반하여 중첩 객체를 생성합니다:

```sql title="Query"
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Response"
┌─json1────────────┬─json2────────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a":{"b":"42"}} │ ['a.b']             │ ['a.b']             │
└──────────────────┴──────────────────┴─────────────────────┴─────────────────────┘
```

위에서 볼 수 있듯이, 초기 JSON `{"a.b" : 42}`는 이제 `{"a" : {"b" : 42}}` 형식으로 변환됩니다.

이 제한 때문에 다음과 같은 유효한 JSON 객체를 파싱하는 데도 실패합니다:

```sql title="Query"
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json;
```

```text title="Response"
Code: 117. DB::Exception: Cannot insert data into JSON column: Duplicate path found during parsing JSON object: a.b. You can enable setting type_json_skip_duplicated_paths to skip duplicated paths during insert: In scope SELECT CAST('{"a.b" : 42, "a" : {"b" : "Hello, World"}}', 'JSON') AS json. (INCORRECT_DATA)
```

점이 포함된 키를 그대로 유지하면서 이를 중첩 객체로 해석하지 않으려면,
`25.8` 버전부터 사용할 수 있는 setting [json&#95;type&#95;escape&#95;dots&#95;in&#95;keys](/operations/settings/formats#json_type_escape_dots_in_keys)를 활성화하면 됩니다. 이 경우 파싱 과정에서 JSON 키에 있는 모든 점은 `%2E`로 이스케이프되며, 포맷 시 다시 이스케이프가 해제됩니다.

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Response"
┌─json1────────────┬─json2────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a.b":"42"} │ ['a.b']             │ ['a%2Eb']           │
└──────────────────┴──────────────┴─────────────────────┴─────────────────────┘
```

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, JSONAllPaths(json);
```

```text title="Response"
┌─json──────────────────────────────────┬─JSONAllPaths(json)─┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ ['a%2Eb','a.b']    │
└───────────────────────────────────────┴────────────────────┘
```

이스케이프된 마침표(.)가 포함된 키를 하위 컬럼으로 읽으려면 하위 컬럼 이름에서도 이스케이프된 마침표(.)를 사용해야 합니다.

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┘
```

참고: 식별자 파서와 분석기의 제약으로 인해 서브컬럼 `` json.`a.b` `` 는 서브컬럼 `json.a.b` 와 동일하게 취급되며, 이스케이프된 점(.)이 포함된 경로는 읽지 않습니다:


```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.`a.b`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

또한 점 문자(`.`)가 포함된 키를 가진 JSON 경로에 대한 힌트를 지정해야 하거나(또는 이를 `SKIP`/`SKIP REGEX` 섹션에서 사용하려는 경우), 힌트에서는 점 문자를 이스케이프하여 사용해야 합니다:

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON(`a%2Eb` UInt8) as json, json.`a%2Eb`, toTypeName(json.`a%2Eb`);
```

```text title="Response"
┌─json────────────────────────────────┬─json.a%2Eb─┬─toTypeName(json.a%2Eb)─┐
│ {"a.b":42,"a":{"b":"Hello World!"}} │         42 │ UInt8                  │
└─────────────────────────────────────┴────────────┴────────────────────────┘
```

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON(SKIP `a%2Eb`) as json, json.`a%2Eb`;
```

```text title="Response"
┌─json───────────────────────┬─json.a%2Eb─┐
│ {"a":{"b":"Hello World!"}} │ ᴺᵁᴸᴸ       │
└────────────────────────────┴────────────┘
```


## 데이터에서 JSON 타입 읽기 \{#reading-json-type-from-data\}

모든 텍스트 포맷
([`JSONEachRow`](/interfaces/formats/JSONEachRow),
[`TSV`](/interfaces/formats/TabSeparated),
[`CSV`](/interfaces/formats/CSV),
[`CustomSeparated`](/interfaces/formats/CustomSeparated),
[`Values`](/interfaces/formats/Values) 등)은 `JSON` 타입을 읽는 것을 지원합니다.

예시:

```sql title="Query"
SELECT json FROM format(JSONEachRow, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP d.e, SKIP REGEXP \'b.*\')', '
{"json" : {"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}}
{"json" : {"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}}
{"json" : {"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}}
{"json" : {"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}}
{"json" : {"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}}
')
```

```text title="Response"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```

`CSV`/`TSV`/기타와 같은 텍스트 형식에서는 `JSON`이 JSON 객체가 포함된 문자열에서 파싱됩니다:


```sql title="Query"
SELECT json FROM format(TSV, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP REGEXP \'b.*\')',
'{"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}
{"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}
{"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}
{"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}
{"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}')
```

```text title="Response"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```


## JSON 내부의 동적 경로 한계에 도달하기 \{#reaching-the-limit-of-dynamic-paths-inside-json\}

`JSON` 데이터 타입은 내부적으로 제한된 개수의 경로만 별도의 하위 컬럼으로 저장할 수 있습니다. 
기본적으로 이 한계는 `1024`이지만, 타입 선언에서 `max_dynamic_paths` 파라미터를 사용하여 변경할 수 있습니다.

한계에 도달하면, `JSON` 컬럼에 새로 삽입되는 모든 경로는 단일 공유 데이터 구조에 저장됩니다. 
이러한 경로를 여전히 하위 컬럼처럼 읽을 수는 있지만, 
효율성이 떨어질 수 있습니다([공유 데이터에 대한 섹션 참조](#shared-data-structure)). 
이 한계는 서로 다른 하위 컬럼의 수가 지나치게 많아져 테이블을 사용할 수 없게 되는 상황을 방지하기 위해 필요합니다.

이제 몇 가지 서로 다른 시나리오에서 이 한계에 도달하면 어떤 일이 발생하는지 살펴보겠습니다.

### 데이터 파싱 중 한계에 도달하는 경우 \{#reaching-the-limit-during-data-parsing\}

데이터에서 `JSON` 객체를 파싱하는 동안, 현재 데이터 블록의 제한값에 도달하면
이후에 발견되는 모든 새로운 경로는 공유 데이터 구조에 저장됩니다. 다음 두 가지 인트로스펙션 함수인 `JSONDynamicPaths`, `JSONSharedDataPaths`를 사용할 수 있습니다:

```sql title="Query"
SELECT json, JSONDynamicPaths(json), JSONSharedDataPaths(json) FROM format(JSONEachRow, 'json JSON(max_dynamic_paths=3)', '
{"json" : {"a" : {"b" : 42}, "c" : [1, 2, 3]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-01"}}
{"json" : {"a" : {"b" : 44}, "c" : [4, 5, 6]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-02", "e" : "Hello", "f" : {"g" : 42.42}}}
{"json" : {"a" : {"b" : 43}, "c" : [7, 8, 9], "f" : {"g" : 43.43}, "h" : "World"}}
')
```

```text title="Response"
┌─json───────────────────────────────────────────────────────────┬─JSONDynamicPaths(json)─┬─JSONSharedDataPaths(json)─┐
│ {"a":{"b":"42"},"c":["1","2","3"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-01"}                              │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"44"},"c":["4","5","6"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-02","e":"Hello","f":{"g":42.42}}  │ ['a.b','c','d']        │ ['e','f.g']               │
│ {"a":{"b":"43"},"c":["7","8","9"],"f":{"g":43.43},"h":"World"} │ ['a.b','c','d']        │ ['f.g','h']               │
└────────────────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────┘
```

위에서 볼 수 있듯이, 경로 `e`와 `f.g`를 삽입한 후 제한에 도달했고, 이 경로들은 공유 데이터 구조에 저장되었습니다.


### MergeTree 테이블 엔진에서 데이터 파트 머지 중 \{#during-merges-of-data-parts-in-mergetree-table-engines\}

`MergeTree` 테이블에서 여러 데이터 파트를 머지하는 동안, 결과 데이터 파트의 `JSON` 컬럼이 동적 경로 한도에 도달하여
소스 파트의 모든 경로를 서브컬럼으로 저장하지 못할 수 있습니다.
이 경우 ClickHouse는 머지 이후 서브컬럼로 유지할 경로와 공유 데이터 구조에 저장할 경로를 선택합니다.
대부분의 경우 ClickHouse는 널이 아닌 값이 가장 많이 포함된 경로를 서브컬럼으로 유지하려 하고, 가장 희귀한 경로를 공유 데이터 구조로 이동합니다.
다만 이는 구현에 따라 달라질 수 있습니다.

이러한 머지의 예를 살펴보겠습니다.
먼저 `JSON` 컬럼이 있는 테이블을 생성하고 동적 경로 한도를 `3`으로 설정한 다음, 서로 다른 `5`개의 경로를 가진 값을 삽입합니다:

```sql title="Query"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

각 insert 작업은 `JSON` 컬럼에 단일 경로만 포함하는 별도의 데이터 파트를 생성합니다:

```sql title="Query"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="Response"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│       5 │ ['a']         │ []                │ all_1_1_0 │
│       4 │ ['b']         │ []                │ all_2_2_0 │
│       3 │ ['c']         │ []                │ all_3_3_0 │
│       2 │ ['d']         │ []                │ all_4_4_0 │
│       1 │ ['e']         │ []                │ all_5_5_0 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

이제 모든 파트를 하나로 병합한 뒤 어떤 일이 일어나는지 살펴보겠습니다:

```sql title="Query"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="Response"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│      15 │ ['a','b','c'] │ ['d','e']         │ all_1_5_2 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

위에서 볼 수 있듯이 ClickHouse는 가장 자주 사용되는 경로인 `a`, `b`, `c`는 그대로 두고, 경로 `d`와 `e`는 공유 데이터 구조로 옮겼습니다.


## 공유 데이터 구조 \{#shared-data-structure\}

이전 섹션에서 설명했듯이 `max_dynamic_paths` 제한값에 도달하면 새로 생성되는 모든 경로는 하나의 공유 데이터 구조에 저장됩니다.
이 섹션에서는 이 공유 데이터 구조의 세부 사항과 이 구조에서 경로 서브컬럼을 읽는 방법을 살펴봅니다.

JSON 컬럼의 내용을 검사하는 데 사용되는 함수에 대한 자세한 내용은 ["introspection functions"](/sql-reference/data-types/newjson#introspection-functions) 섹션을 참고하십시오.

### Shared data structure in memory \{#shared-data-structure-in-memory\}

메모리에서 공유 데이터 구조는 평탄화된 JSON 경로에서 이진 인코딩된 값으로의 매핑을 저장하는 `Map(String, String)` 타입의 하위 컬럼일 뿐입니다.
해당 구조에서 특정 경로 하위 컬럼을 추출하기 위해서는 이 `Map` 컬럼의 모든 행을 순회하면서 요청된 경로와 그 값을 찾습니다.

### MergeTree 파트의 공유 데이터 구조 \{#shared-data-structure-in-merge-tree-parts\}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에서는 데이터를 디스크(로컬 또는 원격)에 모든 내용을 저장하는 데이터 파트에 보관합니다. 그리고 디스크에 있는 데이터는 메모리에 있는 데이터와는 다른 방식으로 저장될 수 있습니다.
현재 MergeTree 데이터 파트에는 3가지 서로 다른 공유 데이터 구조 직렬화 방식인 `map`, `map_with_buckets`
및 `advanced`가 있습니다.

직렬화 버전은 MergeTree
설정인 [object_shared_data_serialization_version](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version)
과 [object_shared_data_serialization_version_for_zero_level_parts](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version_for_zero_level_parts)
으로 제어됩니다(0 레벨 파트는 테이블에 데이터를 삽입할 때 생성되는 파트이며, 머지 과정에서 생성되는 파트는 더 높은 레벨을 가집니다).

참고: 공유 데이터 구조 직렬화 변경은 `v3` [object serialization version](../../operations/settings/merge-tree-settings.md#object_serialization_version)에 대해서만 지원됩니다.

#### Map \{#shared-data-map\}

`map` 직렬화 버전에서는 공유 데이터가 메모리에 저장되는 방식과 동일하게 `Map(String, String)` 타입의 단일 컬럼으로 직렬화됩니다.
이러한 방식의 직렬화에서 경로 하위 컬럼을 읽기 위해서는 ClickHouse가 전체 `Map` 컬럼을 읽은 다음 메모리에서 요청된 경로를 추출합니다.

이 직렬화 방식은 데이터를 기록하고 전체 `JSON` 컬럼을 읽는 데에는 효율적이지만, 경로 하위 컬럼들을 읽는 데에는 비효율적입니다.

#### 버킷을 사용하는 Map \{#shared-data-map-with-buckets\}

`map_with_buckets` 직렬화 버전에서는 공유 데이터가 `Map(String, String)` 타입의 `N`개의 컬럼(「버킷」)으로 직렬화됩니다.
각 버킷에는 경로의 부분 집합만 포함됩니다. 이 직렬화 방식에서 경로 서브컬럼을 읽기 위해 ClickHouse는
하나의 버킷에서 전체 `Map` 컬럼을 읽은 다음, 메모리에서 요청된 경로를 추출합니다.

이 직렬화 방식은 데이터를 쓰거나 전체 `JSON` 컬럼을 읽을 때는 효율성이 떨어지지만,
필요한 버킷에서만 데이터를 읽기 때문에 경로 서브컬럼을 읽을 때는 더 효율적입니다.

버킷 개수 `N`은 MergeTree 설정
[object_shared_data_buckets_for_compact_part](
../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_compact_part) (기본값 8)과
[object_shared_data_buckets_for_wide_part](
../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_wide_part) (기본값 32)으로 제어됩니다.

#### Advanced \{#shared-data-advanced\}

`advanced` 직렬화 버전에서 공유 데이터는 특수한 데이터 구조로 직렬화되며, 경로(path) 서브컬럼의 읽기 성능을 최대화하도록 설계됩니다. 이 구조는 요청된 경로에 해당하는 데이터만 읽어올 수 있도록 추가 정보를 저장합니다. 또한 이 직렬화 방식은 버킷도 지원하므로, 각 버킷에는 경로의 일부만 포함됩니다.

이 직렬화 방식은 데이터 쓰기에는 다소 비효율적이므로 0 레벨 파트에는 사용하는 것이 권장되지 않습니다. 전체 `JSON` 컬럼을 읽을 때는 `map` 직렬화와 비교해 약간 덜 효율적이지만, 경로 서브컬럼을 읽을 때는 매우 효율적입니다.

참고: 데이터 구조 내부에 일부 추가 정보를 저장하기 때문에, 이 직렬화 방식은 `map` 및 `map_with_buckets` 직렬화와 비교했을 때 디스크 저장 공간 사용량이 더 많습니다.

새로운 공유 데이터 직렬화 방식과 구현 세부 사항에 대한 보다 자세한 내용은 [블로그 게시글](https://clickhouse.com/blog/json-data-type-gets-even-better)을 참조하십시오.

## MergeTree 파트의 JSON 내 동적 경로 개수 제어하기 \{#controlling-the-number-of-dynamic-paths\}

JSON에서 동적 경로에 대한 제한을 설정하는 기본 방법은 JSON 타입 선언에 `max_dynamic_paths` 매개변수를 사용하는 것입니다.
그러나 기존 컬럼의 `max_dynamic_paths` 값을 변경하려면, 모든 기존 파트를 다시 쓰는 백그라운드 mutation을 수행하는 `ALTER TABLE <table> MODIFY COLUMN <column> JSON(max_dynamic_paths=K)` 명령을 실행해야 합니다.
이러한 mutation은 부하가 매우 클 수 있으며, 완료될 때까지 서버 성능에 영향을 줄 수 있습니다. 이를 피하기 위해, 새로운 데이터 파트에 대해 MergeTree 테이블에서 동적 경로 제한을 변경하는 데 도움이 되는 다음 3가지 설정을 사용할 수 있습니다.

- `merge_max_dynamic_subcolumns_in_wide_part` - Wide 데이터 파트로 머지하는 동안 각 JSON 컬럼의 동적 서브컬럼 개수를 제한하는 MergeTree 설정입니다.
- `merge_max_dynamic_subcolumns_in_compact_part` - Compact 데이터 파트로 머지하는 동안 각 JSON 컬럼의 동적 서브컬럼 개수를 제한하는 MergeTree 설정입니다.
- `max_dynamic_subcolumns_in_json_type_parsing` - JSON 데이터를 JSON 컬럼으로 파싱하는 동안 각 JSON 컬럼의 동적 서브컬럼 개수를 제한하는 세션 설정입니다.

참고: 위에서 설명한 설정 값이 더 크더라도, 동적 경로에 대한 제한은 `max_dynamic_paths` 매개변수에 지정된 값을 초과할 수 없습니다.

## 내부 조회 함수 \{#introspection-functions\}

JSON 컬럼의 내용을 검사하는 데 도움이 되는 여러 함수가 있습니다:

* [`JSONAllPaths`](../functions/json-functions.md#JSONAllPaths)
* [`JSONAllPathsWithTypes`](../functions/json-functions.md#JSONAllPathsWithTypes)
* [`JSONDynamicPaths`](../functions/json-functions.md#JSONDynamicPaths)
* [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#JSONDynamicPathsWithTypes)
* [`JSONSharedDataPaths`](../functions/json-functions.md#JSONSharedDataPaths)
* [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#JSONSharedDataPathsWithTypes)
* [`distinctDynamicTypes`](../aggregate-functions/reference/distinctDynamicTypes.md)
* [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctJSONPaths.md)

**예제**

`2020-01-01` 날짜에 대한 [GH Archive](https://www.gharchive.org/) 데이터셋의 내용을 살펴보겠습니다:

```sql title="Query"
SELECT arrayJoin(distinctJSONPaths(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject) 
```

```text title="Response"
┌─arrayJoin(distinctJSONPaths(json))─────────────────────────┐
│ actor.avatar_url                                           │
│ actor.display_login                                        │
│ actor.gravatar_id                                          │
│ actor.id                                                   │
│ actor.login                                                │
│ actor.url                                                  │
│ created_at                                                 │
│ id                                                         │
│ org.avatar_url                                             │
│ org.gravatar_id                                            │
│ org.id                                                     │
│ org.login                                                  │
│ org.url                                                    │
│ payload.action                                             │
│ payload.before                                             │
│ payload.comment._links.html.href                           │
│ payload.comment._links.pull_request.href                   │
│ payload.comment._links.self.href                           │
│ payload.comment.author_association                         │
│ payload.comment.body                                       │
│ payload.comment.commit_id                                  │
│ payload.comment.created_at                                 │
│ payload.comment.diff_hunk                                  │
│ payload.comment.html_url                                   │
│ payload.comment.id                                         │
│ payload.comment.in_reply_to_id                             │
│ payload.comment.issue_url                                  │
│ payload.comment.line                                       │
│ payload.comment.node_id                                    │
│ payload.comment.original_commit_id                         │
│ payload.comment.original_position                          │
│ payload.comment.path                                       │
│ payload.comment.position                                   │
│ payload.comment.pull_request_review_id                     │
...
│ payload.release.node_id                                    │
│ payload.release.prerelease                                 │
│ payload.release.published_at                               │
│ payload.release.tag_name                                   │
│ payload.release.tarball_url                                │
│ payload.release.target_commitish                           │
│ payload.release.upload_url                                 │
│ payload.release.url                                        │
│ payload.release.zipball_url                                │
│ payload.size                                               │
│ public                                                     │
│ repo.id                                                    │
│ repo.name                                                  │
│ repo.url                                                   │
│ type                                                       │
└─arrayJoin(distinctJSONPaths(json))─────────────────────────┘
```

```sql
SELECT arrayJoin(distinctJSONPathsAndTypes(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject)
SETTINGS date_time_input_format = 'best_effort'
```


```text
┌─arrayJoin(distinctJSONPathsAndTypes(json))──────────────────┐
│ ('actor.avatar_url',['String'])                             │
│ ('actor.display_login',['String'])                          │
│ ('actor.gravatar_id',['String'])                            │
│ ('actor.id',['Int64'])                                      │
│ ('actor.login',['String'])                                  │
│ ('actor.url',['String'])                                    │
│ ('created_at',['DateTime'])                                 │
│ ('id',['String'])                                           │
│ ('org.avatar_url',['String'])                               │
│ ('org.gravatar_id',['String'])                              │
│ ('org.id',['Int64'])                                        │
│ ('org.login',['String'])                                    │
│ ('org.url',['String'])                                      │
│ ('payload.action',['String'])                               │
│ ('payload.before',['String'])                               │
│ ('payload.comment._links.html.href',['String'])             │
│ ('payload.comment._links.pull_request.href',['String'])     │
│ ('payload.comment._links.self.href',['String'])             │
│ ('payload.comment.author_association',['String'])           │
│ ('payload.comment.body',['String'])                         │
│ ('payload.comment.commit_id',['String'])                    │
│ ('payload.comment.created_at',['DateTime'])                 │
│ ('payload.comment.diff_hunk',['String'])                    │
│ ('payload.comment.html_url',['String'])                     │
│ ('payload.comment.id',['Int64'])                            │
│ ('payload.comment.in_reply_to_id',['Int64'])                │
│ ('payload.comment.issue_url',['String'])                    │
│ ('payload.comment.line',['Int64'])                          │
│ ('payload.comment.node_id',['String'])                      │
│ ('payload.comment.original_commit_id',['String'])           │
│ ('payload.comment.original_position',['Int64'])             │
│ ('payload.comment.path',['String'])                         │
│ ('payload.comment.position',['Int64'])                      │
│ ('payload.comment.pull_request_review_id',['Int64'])        │
...
│ ('payload.release.node_id',['String'])                      │
│ ('payload.release.prerelease',['Bool'])                     │
│ ('payload.release.published_at',['DateTime'])               │
│ ('payload.release.tag_name',['String'])                     │
│ ('payload.release.tarball_url',['String'])                  │
│ ('payload.release.target_commitish',['String'])             │
│ ('payload.release.upload_url',['String'])                   │
│ ('payload.release.url',['String'])                          │
│ ('payload.release.zipball_url',['String'])                  │
│ ('payload.size',['Int64'])                                  │
│ ('public',['Bool'])                                         │
│ ('repo.id',['Int64'])                                       │
│ ('repo.name',['String'])                                    │
│ ('repo.url',['String'])                                     │
│ ('type',['String'])                                         │
└─arrayJoin(distinctJSONPathsAndTypes(json))──────────────────┘
```


## ALTER MODIFY COLUMN을 JSON 타입으로 변경 \{#alter-modify-column-to-json-type\}

기존 테이블에서 컬럼 타입을 새로운 `JSON` 타입으로 변경할 수 있습니다. 현재는 `String` 타입에서의 `ALTER`만 지원됩니다.

**예시**

```sql title="Query"
CREATE TABLE test (json String) ENGINE=MergeTree ORDER BY tuple();
INSERT INTO test VALUES ('{"a" : 42}'), ('{"a" : 43, "b" : "Hello"}'), ('{"a" : 44, "b" : [1, 2, 3]}'), ('{"c" : "2020-01-01"}');
ALTER TABLE test MODIFY COLUMN json JSON;
SELECT json, json.a, json.b, json.c FROM test;
```

```text title="Response"
┌─json─────────────────────────┬─json.a─┬─json.b──┬─json.c─────┐
│ {"a":"42"}                   │ 42     │ ᴺᵁᴸᴸ    │ ᴺᵁᴸᴸ       │
│ {"a":"43","b":"Hello"}       │ 43     │ Hello   │ ᴺᵁᴸᴸ       │
│ {"a":"44","b":["1","2","3"]} │ 44     │ [1,2,3] │ ᴺᵁᴸᴸ       │
│ {"c":"2020-01-01"}           │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ    │ 2020-01-01 │
└──────────────────────────────┴────────┴─────────┴────────────┘
```


## JSON 타입 값 간의 비교 \{#comparison-between-values-of-the-json-type\}

JSON 객체는 맵(Map)과 비슷한 방식으로 비교됩니다.

예를 들어:

```sql title="Query"
CREATE TABLE test (json1 JSON, json2 JSON) ENGINE=Memory;
INSERT INTO test FORMAT JSONEachRow
{"json1" : {}, "json2" : {}}
{"json1" : {"a" : 42}, "json2" : {}}
{"json1" : {"a" : 42}, "json2" : {"a" : 41}}
{"json1" : {"a" : 42}, "json2" : {"a" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : [1, 2, 3]}}
{"json1" : {"a" : 42}, "json2" : {"a" : "Hello"}}
{"json1" : {"a" : 42}, "json2" : {"b" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : 42, "b" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : 41, "b" : 42}}

SELECT json1, json2, json1 < json2, json1 = json2, json1 > json2 FROM test;
```

```text title="Response"
┌─json1──────┬─json2───────────────┬─less(json1, json2)─┬─equals(json1, json2)─┬─greater(json1, json2)─┐
│ {}         │ {}                  │                  0 │                    1 │                     0 │
│ {"a":"42"} │ {}                  │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"41"}          │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"42"}          │                  0 │                    1 │                     0 │
│ {"a":"42"} │ {"a":["1","2","3"]} │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"Hello"}       │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"b":"42"}          │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"a":"42","b":"42"} │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"a":"41","b":"42"} │                  0 │                    0 │                     1 │
└────────────┴─────────────────────┴────────────────────┴──────────────────────┴───────────────────────┘
```

**참고:** 두 경로에 있는 값의 데이터 타입이 서로 다른 경우, `Variant` 데이터 타입의 [비교 규칙](/sql-reference/data-types/variant#comparing-values-of-variant-data)에 따라 비교합니다.


## JSON 타입을 더 잘 사용하는 팁 \{#tips-for-better-usage-of-the-json-type\}

`JSON` 컬럼을 생성하고 그 안에 데이터를 로드하기 전에 다음 사항을 고려하십시오:

- 데이터를 분석하고 가능한 한 많은 경로 힌트와 해당 타입을 지정하십시오. 이렇게 하면 저장 및 읽기 효율이 훨씬 좋아집니다.
- 어떤 경로가 필요하고 어떤 경로는 전혀 필요하지 않은지 생각하십시오. 필요하지 않은 경로는 `SKIP` 섹션에, 필요하다면 `SKIP REGEXP` 섹션에 지정하십시오. 이렇게 하면 저장 효율이 향상됩니다.
- `max_dynamic_paths` 파라미터를 너무 큰 값으로 설정하지 마십시오. 저장 및 읽기 효율이 떨어질 수 있습니다.  
  메모리, CPU 등 시스템 파라미터에 크게 의존하지만, 일반적인 기준으로 로컬 파일 시스템 스토리지의 경우 `max_dynamic_paths`를 10 000보다 크게 설정하지 말고, 원격 파일 시스템 스토리지의 경우 1024보다 크게 설정하지 않는 것이 좋습니다.

## 추가로 읽어볼 자료 \{#further-reading\}

- [ClickHouse에 새롭고 강력한 JSON 데이터 타입을 구현한 방법](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [10억 개 문서 JSON 챌린지: ClickHouse vs. MongoDB, Elasticsearch 등](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)