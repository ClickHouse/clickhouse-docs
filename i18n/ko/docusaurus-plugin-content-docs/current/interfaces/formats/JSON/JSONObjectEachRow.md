---
'alias': []
'description': 'JSONObjectEachRow 포맷에 대한 문서'
'input_format': true
'keywords':
- 'JSONObjectEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONObjectEachRow'
'title': 'JSONObjectEachRow'
'doc_type': 'reference'
---


| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

이 포맷에서는 모든 데이터가 단일 JSON 객체로 표현되며, 각 행은 이 객체의 개별 필드로 표현됩니다. 이는 [`JSONEachRow`](./JSONEachRow.md) 포맷과 유사합니다.

## 사용 예시 {#example-usage}

### 기본 예시 {#basic-example}

JSON 데이터가 주어진 경우:

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

객체 이름을 컬럼 값으로 사용하려면 특별한 설정인 [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)을 사용할 수 있습니다. 이 설정의 값은 결과 객체의 행에서 JSON 키로 사용되는 컬럼의 이름으로 설정됩니다.

#### 출력 {#output}

`test`라는 테이블이 두 개의 컬럼을 갖는다고 가정합시다:

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

이를 `JSONObjectEachRow` 포맷으로 출력하고 `format_json_object_each_row_column_for_object_name` 설정을 사용하겠습니다:

```sql title="Query"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="Response"
{
    "first_obj": {"number": 1},
    "second_obj": {"number": 2},
    "third_obj": {"number": 3}
}
```

#### 입력 {#input}

이전 예시의 출력을 `data.json`이라는 파일에 저장했다고 가정합시다:

```sql title="Query"
SELECT * FROM file('data.json', JSONObjectEachRow, 'object_name String, number UInt64') SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

이것은 스키마 추론에도 작동합니다:

```sql title="Query"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```

### 데이터 삽입 {#json-inserting-data}

```sql title="Query"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouse는 다음을 허용합니다:

- 객체 내에서 키-값 쌍의 임의의 순서.
- 일부 값 생략.

ClickHouse는 요소 간의 공백과 객체 뒤의 쉼표를 무시합니다. 모든 객체를 한 줄로 전달할 수 있으며, 줄 바꿈으로 구분할 필요는 없습니다.

#### 생략된 값 처리 {#omitted-values-processing}

ClickHouse는 생략된 값을 해당하는 [데이터 타입](/sql-reference/data-types/index.md)의 기본 값으로 대체합니다.

`DEFAULT expr`가 지정된 경우, ClickHouse는 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 설정에 따라 다른 대체 규칙을 사용합니다.

다음 테이블을 고려해봅시다:

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- `input_format_defaults_for_omitted_fields = 0`인 경우, `x`와 `a`의 기본 값은 `0`입니다 (이것은 `UInt32` 데이터 타입의 기본 값입니다).
- `input_format_defaults_for_omitted_fields = 1`인 경우, `x`의 기본 값은 `0`이지만 `a`의 기본 값은 `x * 2`입니다.

:::note
`input_format_defaults_for_omitted_fields = 1`로 데이터를 삽입할 때, ClickHouse는 자원 소모가 더 큽니다. 이는 `input_format_defaults_for_omitted_fields = 0`로 삽입할 때보다 더 많은 계산 리소스를 소모합니다.
:::

### 데이터 선택 {#json-selecting-data}

`UserActivity` 테이블을 예로 들어봅시다:

```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

쿼리 `SELECT * FROM UserActivity FORMAT JSONEachRow`는 다음과 같은 결과를 반환합니다:

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

[JSON](/interfaces/formats/JSON) 포맷과 달리, 유효하지 않은 UTF-8 시퀀스의 대체는 없습니다. 값들은 `JSON`과 동일한 방식으로 이스케이프됩니다.

:::info
임의의 바이트 세트를 문자열로 출력할 수 있습니다. 테이블의 데이터가 JSON으로 형식화될 수 있다고 확신하는 경우 [`JSONEachRow`](./JSONEachRow.md) 포맷을 사용하세요.
:::

### 중첩 구조 사용 {#jsoneachrow-nested}

[`Nested`](/sql-reference/data-types/nested-data-structures/index.md) 데이터 타입 컬럼이 있는 테이블이 있는 경우, 동일한 구조의 JSON 데이터를 삽입할 수 있습니다. 이 기능은 [input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json) 설정을 통해 활성화할 수 있습니다.

예를 들어, 다음 테이블을 고려해보십시오:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

`Nested` 데이터 타입 설명에서 볼 수 있듯이, ClickHouse는 중첩 구조의 각각의 구성 요소를 별도의 컬럼으로 처리합니다 (`n.s` 및 `n.i`는 우리의 테이블에 해당됨). 다음과 같은 방식으로 데이터를 삽입할 수 있습니다:

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

계층적 JSON 객체로 데이터를 삽입하려면 [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json)으로 설정하십시오.

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

이 설정이 없으면 ClickHouse는 예외를 발생시킵니다.

```sql title="Query"
SELECT name, value FROM system.settings WHERE name = 'input_format_import_nested_json'
```

```response title="Response"
┌─name────────────────────────────┬─value─┐
│ input_format_import_nested_json │ 0     │
└─────────────────────────────────┴───────┘
```

```sql title="Query"
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
```

```response title="Response"
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: n: (at row 1)
```

```sql title="Query"
SET input_format_import_nested_json=1
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
SELECT * FROM json_each_row_nested
```

```response title="Response"
┌─n.s───────────┬─n.i────┐
│ ['abc','def'] │ [1,23] │
└───────────────┴────────┘
```

## 포맷 설정 {#format-settings}

| 설정                                                                                                                                                                       | 설명                                                                                                                                                          | 기본값  | 비고                                                                                                                                                                                             |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                             | 중첩 JSON 데이터를 중첩 테이블로 매핑 (JSONEachRow 포맷에 적용됨).                                                                                       | `false`  |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                         | JSON 입력 포맷에서 bool을 숫자로 파싱할 수 있도록 허용합니다.                                                                                              | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                         | JSON 입력 포맷에서 bool을 문자열로 파싱할 수 있도록 허용합니다.                                                                                              | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                       | JSON 입력 포맷에서 숫자를 문자열로 파싱할 수 있도록 허용합니다.                                                                                            | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                         | JSON 입력 포맷에서 JSON 배열을 문자열로 파싱할 수 있도록 허용합니다.                                                                                        | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                       | JSON 입력 포맷에서 JSON 객체를 문자열로 파싱할 수 있도록 허용합니다.                                                                                          | `true`   |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                       | named tuple 컬럼을 JSON 객체로 파싱합니다.                                                                                                                 | `true`   |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                       | 스키마 추론할 때 문자열 필드에서 숫자를 유추하려고 시도합니다.                                                                                                   | `false`  |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)            | 스키마 추론할 때 JSON 객체에서 named tuple을 유추하려고 시도합니다.                                                                                           | `true`   |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                 | JSON 입력 포맷에서 Null 또는 비어 있는 객체/배열만 포함하는 키에 대해 스키마 추론 시 키 타입을 String으로 사용합니다.                                          | `true`   |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | named tuple을 파싱하는 동안 JSON 객체에서 누락된 요소에 대한 기본 값을 삽입합니다.                                                                             | `true`   |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                 | named tuple의 JSON 객체에서 알려지지 않은 키를 무시합니다.                                                                                                      | `false`  |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)    | JSONCompact/JSONCompactEachRow 포맷에서 가변 개수의 컬럼을 허용하고, 추가 컬럼을 무시하며 누락된 컬럼에서 기본 값을 사용합니다.                               | `false`  |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                           | JSON 문자열에 잘못된 이스케이프 시퀀스가 포함된 경우 예외를 발생시킵니다. 비활성화되면 잘못된 이스케이프 시퀀스는 데이터에서 그대로 유지됩니다.               | `true`   |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                   | JSON 입력의 빈 필드를 기본 값으로 처리합니다.                                                                                                               | `false`  | 복잡한 기본 표현식을 위해 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)도 활성화해야 합니다. |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                         | JSON 출력 포맷에서 64비트 정수의 따옴표 표시를 제어합니다.                                                                                                | `true`   |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                             | JSON 출력 포맷에서 64비트 부동 소수점의 따옴표 표시를 제어합니다.                                                                                            | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                   | JSON 출력 포맷에서 '+nan', '-nan', '+inf', '-inf' 출력을 활성화합니다.                                                                                       | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                      | JSON 출력 포맷에서 소수의 따옴표 표시를 제어합니다.                                                                                                        | `false`  |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                       | JSON 출력 포맷에서 문자열 출력을 위한 슬래시의 이스케이프 처리를 제어합니다.                                                                                 | `true`   |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                     | named tuple 컬럼을 JSON 객체로 직렬화합니다.                                                                                                                 | `true`   |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                       | JSONEachRow(Compact) 포맷에서 모든 행의 JSON 배열을 출력합니다.                                                                                                | `false`  |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                        | JSON 출력 포맷에서 UTF-8 시퀀스의 유효성을 검사합니다 (JSON/JSONCompact/JSONColumnsWithMetadata 포맷에는 영향을 미치지 않으며, 항상 UTF-8을 확인합니다). | `false`  |                                                                                                                                                                                               |
