---
'description': 'ClickHouse에서 JSON 데이터와 작업하기 위한 기본 지원을 제공하는 JSON 데이터 유형에 대한 문서'
'keywords':
- 'json'
- 'data type'
'sidebar_label': 'JSON'
'sidebar_position': 63
'slug': '/sql-reference/data-types/newjson'
'title': 'JSON 데이터 유형'
'doc_type': 'reference'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

<Link to="/docs/best-practices/use-json-where-appropriate" style={{display: 'flex', textDecoration: 'none', width: 'fit-content'}}>
<CardSecondary
  badgeState="success"
  badgeText=""
  description="JSON 타입 사용에 대한 예제, 고급 기능 및 고려사항에 대한 가이드를 확인해 보세요."
  icon="book"
  infoText="자세히 읽기"
  infoUrl="/docs/best-practices/use-json-where-appropriate"
  title="가이드가 필요하신가요?"
/>
</Link>
<br/>

`JSON` 타입은 JavaScript Object Notation (JSON) 문서를 단일 컬럼에 저장합니다.

:::note
ClickHouse Open-Source에서 JSON 데이터 타입은 버전 25.3에서 프로덕션 준비 완료로 표시됩니다. 이전 버전에서는 이 타입을 프로덕션에서 사용하는 것이 권장되지 않습니다.
:::

`JSON` 타입의 컬럼을 선언하기 위해 다음 구문을 사용할 수 있습니다:

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
위 구문에서 매개변수는 다음과 같이 정의됩니다:

| Parameter                   | Description                                                                                                                                                                                                                                                                                                                                                | Default Value |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `max_dynamic_paths`         | 별도의 데이터 블록에서 저장될 수 있는 경로의 수를 나타내는 선택적 매개변수입니다(예: MergeTree 테이블의 단일 데이터 파트에 걸쳐). <br/><br/>이 한도를 초과하면 나머지 모든 경로는 단일 구조에 함께 저장됩니다.                                                                                                       | `1024`        |
| `max_dynamic_types`         | `Dynamic` 타입으로 지정된 단일 경로 컬럼 내에서 저장될 수 있는 다양한 데이터 타입의 수를 나타내는 선택적 매개변수입니다(예: MergeTree 테이블의 단일 데이터 파트에 걸쳐). <br/><br/>이 한도를 초과하면 모든 새로운 타입은 `String` 타입으로 변환됩니다.                                               | `32`          |
| `some.path TypeName`        | JSON의 특정 경로에 대한 선택적 타입 힌트. 이러한 경로는 항상 지정된 타입의 서브 컬럼으로 저장됩니다.                                                                                                                                                                                                                                                |               |
| `SKIP path.to.skip`         | JSON 파싱 중에 건너뛰어야 하는 특정 경로에 대한 선택적 힌트입니다. 이러한 경로는 JSON 컬럼에 저장되지 않습니다. 지정된 경로가 중첩된 JSON 객체인 경우 전체 중첩 객체는 건너뛰게 됩니다.                                                                                                                                   |               |
| `SKIP REGEXP 'path_regexp'` | JSON 파싱 중에 경로를 건너뛰기 위해 사용되는 정규 표현식이 포함된 선택적 힌트입니다. 이 정규 표현식과 일치하는 모든 경로는 JSON 컬럼에 저장되지 않습니다.                                                                                                                                                                           |               |

## Creating JSON {#creating-json}

이 섹션에서는 `JSON`을 생성하는 다양한 방법을 살펴보겠습니다.

### Using `JSON` in a table column definition {#using-json-in-a-table-column-definition}

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

### Using CAST with `::JSON` {#using-cast-with-json}

`::JSON`의 특수 구문을 사용하여 다양한 타입을 캐스팅하는 것이 가능합니다.

#### CAST from `String` to `JSON` {#cast-from-string-to-json}

```sql title="Query"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### CAST from `Tuple` to `JSON` {#cast-from-tuple-to-json}

```sql title="Query"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="Response"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### CAST from `Map` to `JSON` {#cast-from-map-to-json}

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
JSON 경로는 평면으로 저장됩니다. 이는 `a.b.c`와 같은 경로에서 JSON 객체가 포맷될 때, 객체가 `{ "a.b.c" : ... }` 또는 `{ "a" : {"b" : {"c" : ... }}}`로 구성되어야 하는지 알 수 없음을 의미합니다. 우리의 구현은 항상 후자를 가정합니다.

예를 들어:

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') AS json
```

는 다음을 반환합니다:

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

그리고 **아닌**:

```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```
:::

## Reading JSON paths as sub-columns {#reading-json-paths-as-sub-columns}

`JSON` 타입은 각 경로를 별도의 서브 컬럼으로 읽을 수 있습니다. 
요청된 경로의 타입이 JSON 타입 선언에서 지정되지 않은 경우, 
해당 경로의 서브 컬럼은 항상 [Dynamic](/sql-reference/data-types/dynamic.md) 타입을 가집니다.

예를 들어:

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

`getSubcolumn` 함수를 사용하여 JSON 타입에서 서브컬럼을 읽을 수도 있습니다:

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

요청된 경로가 데이터에서 발견되지 않으면 `NULL` 값으로 채워집니다:

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

반환된 서브 컬럼의 데이터 타입을 확인해 보겠습니다:

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

보시다시피, `a.b`의 경우, 타입은 JSON 타입 선언에서 지정한 대로 `UInt32`이고, 
모든 다른 서브 컬럼의 타입은 `Dynamic`입니다.

`Dynamic` 타입의 서브 컬럼은 어떤 데이터 타입으로도 캐스팅될 수 있습니다. 이 경우, `Dynamic` 내의 내부 타입이 요청된 타입으로 캐스팅될 수 없는 경우 예외가 발생합니다:

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
Compact MergeTree 파트에서 서브컬럼을 효율적으로 읽으려면 MergeTree 설정 [write_marks_for_substreams_in_compact_parts](../../operations/settings/merge-tree-settings.md#write_marks_for_substreams_in_compact_parts)를 활성화하세요.
:::

## Reading JSON sub-objects as sub-columns {#reading-json-sub-objects-as-sub-columns}

`JSON` 타입은 특정 경로의 중첩 객체를 `JSON` 타입의 서브 컬럼으로 읽는 것을 지원합니다. 이를 위해 특수 구문 `json.^some.path`를 사용합니다:

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
서브-객체를 서브-컬럼으로 읽는 것은 비효율적일 수 있으며, 이는 JSON 데이터의 거의 전체 스캔을 요구할 수 있습니다.
:::

## Type inference for paths {#type-inference-for-paths}

JSON을 분석하는 동안 ClickHouse는 각 JSON 경로에 가장 적합한 데이터 타입을 감지하려고 합니다. 
이는 [입력 데이터로부터의 자동 스키마 유추](/interfaces/schema-inference.md)와 유사하게 작동하며, 동일한 설정에 의해 제어됩니다:
 
- [input_format_try_infer_dates](/operations/settings/formats#input_format_try_infer_dates)
- [input_format_try_infer_datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
- [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
- [input_format_json_try_infer_numbers_from_strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
- [input_format_json_infer_incomplete_types_as_strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
- [input_format_json_read_numbers_as_strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
- [input_format_json_read_bools_as_strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
- [input_format_json_read_bools_as_numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
- [input_format_json_read_arrays_as_strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)
- [input_format_json_infer_array_of_dynamic_from_array_of_different_types](/operations/settings/formats#input_format_json_infer_array_of_dynamic_from_array_of_different_types)

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

## Handling arrays of JSON objects {#handling-arrays-of-json-objects}

객체의 배열을 포함하는 JSON 경로는 `Array(JSON)` 타입으로 분석되어 해당 경로의 `Dynamic` 컬럼에 삽입됩니다. 
객체의 배열을 읽으려면 `Dynamic` 컬럼에서 서브 컬럼으로 추출할 수 있습니다:

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

눈치채셨겠지만, 중첩된 `JSON` 타입의 `max_dynamic_types`/`max_dynamic_paths` 매개변수는 기본값보다 줄어들었습니다. 
이는 중첩된 JSON 객체 배열에서 서브 컬럼 수가 통제 불가능하게 증가하는 것을 방지하기 위해 필요합니다.

중첩된 `JSON` 컬럼에서 서브 컬럼을 읽어보겠습니다:

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

`Array(JSON)` 서브 컬럼 이름에서 `Array(JSON)`을 작성하지 않도록 특수 구문을 사용할 수 있습니다:

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

경로 뒤의 `[]`의 수는 배열의 레벨을 나타냅니다. 예를 들어, `json.path[][]`는 `json.path.:Array(Array(JSON))`로 변환됩니다.

`Array(JSON)` 내의 경로와 타입을 확인해 보겠습니다:

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

`Array(JSON)` 컬럼에서 서브 컬럼을 읽어 보겠습니다:

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

중첩된 `JSON` 컬럼에서 서브-객체의 서브 컬럼도 읽을 수 있습니다:

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

## Handling JSON keys with NULL {#handling-json-keys-with-nulls}

우리의 JSON 구현에서 `null`과 값의 부재는 동등하게 간주됩니다.

```sql title="Query"
SELECT '{}'::JSON AS json1, '{"a" : null}'::JSON AS json2, json1 = json2
```

```text title="Response"
┌─json1─┬─json2─┬─equals(json1, json2)─┐
│ {}    │ {}    │                    1 │
└───────┴───────┴──────────────────────┘
```

이는 원래 JSON 데이터가 NULL 값의 경로를 포함하고 있었는지 아니면 전혀 포함하고 있지 않았는지를 결정할 수 없음을 의미합니다.

## Handling JSON keys with dots {#handling-json-keys-with-dots}

내부적으로 JSON 컬럼은 모든 경로와 값을 평면 형태로 저장합니다. 이는 기본적으로 이 두 객체가 동일한 것으로 간주됩니다:
```json
{"a" : {"b" : 42}}
{"a.b" : 42}
```

이 두 객체는 내부적으로 경로 `a.b`와 값 `42`의 쌍으로 저장될 것입니다. JSON 포맷팅을 하는 동안 우리는 항상 점으로 구분된 경로 부분에 따라 중첩 객체를 형성합니다:

```sql title="Query"
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Response"
┌─json1────────────┬─json2────────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a":{"b":"42"}} │ ['a.b']             │ ['a.b']             │
└──────────────────┴──────────────────┴─────────────────────┴─────────────────────┘
```

보시다시피, 초기 JSON `{"a.b" : 42}`는 이제 `{"a" : {"b" : 42}}`로 포맷되었습니다.

이 제한으로 인해 다음과 같은 유효한 JSON 객체의 파싱이 실패할 수도 있습니다:

```sql title="Query"
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json;
```

```text title="Response"
Code: 117. DB::Exception: Cannot insert data into JSON column: Duplicate path found during parsing JSON object: a.b. You can enable setting type_json_skip_duplicated_paths to skip duplicated paths during insert: In scope SELECT CAST('{"a.b" : 42, "a" : {"b" : "Hello, World"}}', 'JSON') AS json. (INCORRECT_DATA)
```

키에 점을 포함하여 중첩 객체로 포맷되는 것을 피하고 싶다면
설정 [json_type_escape_dots_in_keys](/operations/settings/formats#json_type_escape_dots_in_keys)를 활성화해야 합니다(버전 `25.8`부터 사용 가능). 이 경우 JSON 키의 모든 점은 
`%2E`로 이스케이프되고 포맷팅 시 다시 이스케이프가 해제됩니다.

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

이스케이프된 점을 서브컬럼으로 읽으려면 서브컬럼 이름에 이스케이프된 점을 사용해야 합니다:

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┘
```

참고: 식별자 파서 및 분석기 제한으로 인해 서브컬럼 `` json.`a.b` ``는 서브컬럼 `json.a.b`와 동등하며 이스케이프된 점이 포함된 경로를 읽지 않습니다:

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.`a.b`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

JSON 경로가 점을 포함하고 있는 경우 이 경로에 대한 힌트를 지정하고자 한다면 (또는 `SKIP`/`SKIP REGEX` 섹션에서 사용할 경우) 힌트 내에서 이스케이프된 점을 사용해야 합니다:

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

## Reading JSON type from data {#reading-json-type-from-data}

모든 텍스트 형식
([`JSONEachRow`](/interfaces/formats/JSONEachRow),
[`TSV`](/interfaces/formats/TabSeparated),
[`CSV`](/interfaces/formats/CSV),
[`CustomSeparated`](/interfaces/formats/CustomSeparated),
[`Values`](/interfaces/formats/Values), 등)은 `JSON` 타입을 읽는 것을 지원합니다.

예제:

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

`CSV`/`TSV`/등과 같은 텍스트 형식에서는 `JSON`이 JSON 객체를 포함하는 문자열에서 파싱됩니다:

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

## Reaching the limit of dynamic paths inside JSON {#reaching-the-limit-of-dynamic-paths-inside-json}

`JSON` 데이터 타입은 내부적으로 제한된 수의 경로만을 개별 서브 컬럼으로 저장할 수 있습니다. 
기본적으로 이 한도는 `1024`이며, `max_dynamic_paths` 매개변수를 사용하여 변경할 수 있습니다.

한도에 도달하면, `JSON` 컬럼에 삽입되는 모든 새로운 경로는 단일 공유 데이터 구조에 저장됩니다. 
이러한 경로를 서브컬럼으로 읽는 것은 여전히 가능하지만, 
효율성이 떨어질 수 있습니다([공유 데이터 섹션 참조](#shared-data-structure)). 
이 한도는 테이블을 사용할 수 없게 만들 수 있는 막대한 수의 서로 다른 서브 컬럼을 방지하기 위해 필요합니다.

여러 다른 시나리오에서 한도에 도달했을 때 어떤 일이 발생하는지 살펴보겠습니다.

### Reaching the limit during data parsing {#reaching-the-limit-during-data-parsing}

데이터에서 `JSON` 객체를 파싱하는 동안, 현재 데이터 블록에 대해 한도에 도달하면 
모든 새로운 경로는 공유 데이터 구조에 저장됩니다. 다음 두 가지 인트로스펙션 함수 `JSONDynamicPaths`, `JSONSharedDataPaths`를 사용할 수 있습니다:

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

`e`와 `f.g` 경로를 삽입한 후 한도에 도달하였고, 공유 데이터 구조에 삽입 되었습니다.

### During merges of data parts in MergeTree table engines {#during-merges-of-data-parts-in-mergetree-table-engines}

여러 데이터 파트를 `MergeTree` 테이블에서 병합하는 동안, 결과 데이터 파트의 `JSON` 컬럼은 동적 경로의 한도에 도달할 수 있으며 
모든 경로를 서브 컬럼으로 저장할 수 없습니다.
이 경우 ClickHouse는 병합 후 어떤 경로는 서브 컬럼으로 남길 것인지, 어떤 경로는 공유 데이터 구조에 저장할 것인지를 선택합니다. 
대부분의 경우, ClickHouse는 
가장 많은 수의 non-null 값을 포함한 경로를 유지하고 드문 경로는 공유 데이터 구조로 이동하려고 합니다. 이는 구현에 따라 다릅니다.

이러한 병합의 예를 살펴보겠습니다. 
먼저, `JSON` 컬럼을 가진 테이블을 생성하고, 동적 경로의 한도를 `3`으로 설정한 다음, `5`개의 서로 다른 경로로 값을 삽입합니다:

```sql title="Query"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

각 삽입은 단일 경로를 포함하는 `JSON` 컬럼을 가진 개별 데이터 파트를 생성합니다:

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

이제 모든 파트를 하나로 병합하고 무슨 일이 일어날지 살펴보겠습니다:

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

ClickHouse는 가장 빈번한 경로인 `a`, `b` 및 `c`를 유지하고 경로 `d` 및 `e`를 공유 데이터 구조로 이동했습니다.

## Shared data structure {#shared-data-structure}

이전 섹션에서 설명했듯이, `max_dynamic_paths` 한도에 도달하면 모든 새로운 경로가 단일 공유 데이터 구조에 저장됩니다.
이 섹션에서는 공유 데이터 구조의 세부사항과 서브컬럼을 읽는 방법을 살펴보겠습니다.

JSON 컬럼의 내용을 검사하는 데 사용되는 함수에 대한 세부정보는 섹션 ["인트로스펙션 함수"](/sql-reference/data-types/newjson#introspection-functions)를 참조하세요.

### Shared data structure in memory {#shared-data-structure-in-memory}

메모리에서는 공유 데이터 구조는 평면 JSON 경로를 이진 부호화된 값으로 매핑하는 `Map(String, String)` 타입의 서브 컬럼입니다. 이를 통해, 요청된 경로와 해당 값을 찾으려고 모든 행을 반복할 수 있습니다.

### Shared data structure in MergeTree parts {#shared-data-structure-in-merge-tree-parts}

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에서는 데이터를 디스크(로컬 또는 원격)에 저장하는 데이터 파트에 저장합니다. 그리고 디스크의 데이터는 메모리와는 다른 방식으로 저장될 수 있습니다.
현재 MergeTree 데이터 파트에는 `map`, `map_with_buckets` 및 `advanced`의 3가지 서로 다른 공유 데이터 구조 직렬화가 있습니다.

직렬화 버전은 MergeTree 설정 [object_shared_data_serialization_version](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version)과 [object_shared_data_serialization_version_for_zero_level_parts](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version_for_zero_level_parts) 
(제로 레벨 파트는 테이블에 데이터를 삽입하는 동안 생성되는 파트이며, 병합하는 동안 파트는 더 높은 레벨을 가집니다.)에 의해 제어됩니다.

참고: 공유 데이터 구조 직렬화 변경은 `v3` [객체 직렬화 버전](../../operations/settings/merge-tree-settings.md#object_serialization_version)에서만 지원됩니다.

#### Map {#shared-data-map}

`map` 직렬화 버전에서 공유 데이터는 메모리에 저장되는 것과 동일한 `Map(String, String)` 타입의 단일 컬럼으로 직렬화됩니다. 이 유형의 직렬화에서 경로 서브 컬럼을 읽고자 하면 ClickHouse는 전체 `Map` 컬럼을 읽고
메모리에서 요청된 경로를 추출합니다.

이 직렬화는 데이터를 쓰고 전체 `JSON` 컬럼을 읽는 데 효율적이지만, 경로 서브 컬럼을 읽는 데는 비효율적입니다.

#### Map with buckets {#shared-data-map-with-buckets} 

`map_with_buckets` 직렬화 버전에서 공유 데이터는 `Map(String, String)` 타입의 `N` 컬럼("버킷")으로 직렬화됩니다. 
각 버킷은 경로의 하위 집합만 포함합니다. 이 유형의 직렬화에서 경로 서브 컬럼을 읽고자 하면 ClickHouse는 단일 버킷에서 전체 `Map` 컬럼을 읽고
메모리에서 요청된 경로를 추출합니다.

이 직렬화는 전체 데이터를 쓰거나 전체 `JSON` 컬럼을 읽는 데는 효율이 떨어지지만, 경로 서브 컬럼을 읽는 데는 더 효율적입니다.
왜냐하면 필요한 버킷에서만 데이터를 읽기 때문입니다.

버킷의 수 `N`은 MergeTree 설정 [object_shared_data_buckets_for_compact_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_compact_part) (기본 8) 및 
[object_shared_data_buckets_for_wide_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_wide_part) (기본 32)에 의해 제어됩니다.

#### Advanced {#shared-data-advanced}

`advanced` 직렬화 버전에서 공유 데이터는 요청된 경로의 데이터를 읽는 데 필요한 추가 정보를 저장하여 경로 서브 컬럼의 성능을 극대화하는 특별한 데이터 구조로 직렬화됩니다.
이 직렬화는 또한 버킷을 지원하므로 각 버킷에는 경로의 하위 집합만 포함됩니다.

이 직렬화는 데이터 쓰기에는 대단히 비효율적이므로 (제로 레벨 파트에서 이 직렬화를 사용하는 것은 권장되지 않음), 전체 `JSON` 컬럼을 읽는 것은 `map` 직렬화와 비교해 약간 덜 효율적이지만, 경로 서브 컬럼을 읽는 데 매우 효율적입니다.

참고: 이 데이터 구조 내에 일부 추가 정보를 저장하기 때문에 이 직렬화는 
`map` 및 `map_with_buckets` 직렬화에 비해 디스크 저장 크기가 더 큽니다.

새로운 공유 데이터 직렬화 및 구현 세부정보에 대한 상세한 개요는 [블로그 게시물](https://clickhouse.com/blog/json-data-type-gets-even-better)을 참조하세요.

## Introspection functions {#introspection-functions}

JSON 컬럼의 내용을 검사하는 데 도움이 되는 여러 함수가 있습니다: 
- [`JSONAllPaths`](../functions/json-functions.md#JSONAllPaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#JSONAllPathsWithTypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#JSONDynamicPaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#JSONDynamicPathsWithTypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#JSONSharedDataPaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#JSONSharedDataPathsWithTypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**예제**

2020년 1월 1일 날짜에 대한 [GH Archive](https://www.gharchive.org/) 데이터 세트의 내용을 조사해 보겠습니다:

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

## ALTER MODIFY COLUMN to JSON type {#alter-modify-column-to-json-type}

기존 테이블을 변경하고 열의 타입을 새로운 `JSON` 타입으로 변경하는 것이 가능합니다. 현재는 `String` 타입에서만 `ALTER`가 지원됩니다.

**예제**

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

## Comparison between values of the JSON type {#comparison-between-values-of-the-json-type}

JSON 객체는 Maps와 유사하게 비교됩니다. 

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

**참고:** 2개의 경로가 서로 다른 데이터 타입의 값을 포함할 경우, 이들은 `Variant` 데이터 타입의 [비교 규칙](/sql-reference/data-types/variant#comparing-values-of-variant-data)에 따라 비교됩니다.

## Tips for better usage of the JSON type {#tips-for-better-usage-of-the-json-type}

`JSON` 컬럼을 생성하고 데이터를 로드하기 전에 다음 팁을 고려하세요:

- 데이터를 조사하고 가능한 한 많은 경로 힌트와 타입을 지정하세요. 이를 통해 저장 및 읽기가 훨씬 더 효율적이 됩니다.
- 필요한 경로와 절대 필요하지 않은 경로를 생각해 보세요. 필요하지 않은 경로는 `SKIP` 섹션과 필요 시 `SKIP REGEXP` 섹션에 지정하세요. 이렇게 하면 저장이 개선됩니다.
- `max_dynamic_paths` 매개변수를 너무 높은 값으로 설정하지 마세요, 이는 저장 및 읽기를 덜 효율적으로 만들 수 있습니다. 
  시스템 매개변수인 메모리, CPU 등이 매우 의존적이긴 하지만, 일반 원칙은 로컬 파일 시스템 저장소에 대해 `max_dynamic_paths`를 10,000 이하로, 원격 파일 시스템 저장소에 대해 1024 이하로 설정하는 것입니다.

## Further Reading {#further-reading}

- [ClickHouse를 위한 새로운 강력한 JSON 데이터 타입 구축 방법](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [억 문서 JSON 챌린지: ClickHouse vs. MongoDB, Elasticsearch 등](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
