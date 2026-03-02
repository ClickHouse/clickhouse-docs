---
alias: []
description: 'JSONObjectEachRow 형식에 대한 문서'
input_format: true
keywords: ['JSONObjectEachRow']
output_format: true
slug: /interfaces/formats/JSONObjectEachRow
title: 'JSONObjectEachRow'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 설명 \{#description\}

이 형식에서는 모든 데이터가 하나의 JSON 객체로 표현되며, 각 행은 [`JSONEachRow`](./JSONEachRow.md) 형식과 유사하게 이 객체의 개별 필드로 표현됩니다.



## 사용 예시 \{#example-usage\}

### 기본 예시 \{#basic-example\}

다음과 같은 JSON이 있다고 가정합니다:

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

객체 이름을 컬럼 값으로 사용하려면 특별한 설정인 [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)을(를) 사용할 수 있습니다.
이 설정의 값은 컬럼 이름으로 지정되며, 결과 객체에서 각 행에 대한 JSON 키로 사용됩니다.

#### 출력 \{#output\}

테이블 `test`에 두 개의 컬럼이 있다고 가정합니다:

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

`JSONObjectEachRow` 포맷으로 출력하고 `format_json_object_each_row_column_for_object_name` 설정을 사용해 보겠습니다:

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

#### 입력 \{#input\}

이전 예제의 출력을 `data.json`이라는 파일에 저장해 두었다고 가정합니다:

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

스키마 추론에도 적용됩니다:

```sql title="Query"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```

### 데이터 삽입 \{#json-inserting-data\}

```sql title="Query"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouse는 다음을 허용합니다:

* 객체 내 key-value 쌍의 순서는 자유롭습니다.
* 일부 값을 생략할 수 있습니다.

ClickHouse는 요소 사이의 공백과 객체 뒤에 오는 쉼표를 무시합니다. 모든 객체를 한 줄로 전달해도 됩니다. 줄 바꿈으로 구분할 필요는 없습니다.

#### 생략된 값 처리 \{#omitted-values-processing\}

ClickHouse는 생략된 값을 해당 [데이터 타입](/sql-reference/data-types/index.md)에 대한 기본값으로 대체합니다.

`DEFAULT expr`가 지정된 경우, ClickHouse는 [input&#95;format&#95;defaults&#95;for&#95;omitted&#95;fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 설정에 따라 서로 다른 대체 규칙을 사용합니다.

다음 테이블을 살펴보십시오:

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

* `input_format_defaults_for_omitted_fields = 0`인 경우, `x`와 `a`의 기본값은 `UInt32` 데이터 타입의 기본값과 동일하게 `0`입니다.
* `input_format_defaults_for_omitted_fields = 1`인 경우, `x`의 기본값은 `0`이지만, `a`의 기본값은 `x * 2`입니다.

:::note
`input_format_defaults_for_omitted_fields = 1`로 데이터를 삽입하면, `input_format_defaults_for_omitted_fields = 0`으로 삽입하는 경우에 비해 ClickHouse가 더 많은 연산 자원을 사용합니다.
:::

### 데이터 조회 \{#json-selecting-data\}

예제로 `UserActivity` 테이블을 살펴보십시오:


```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

`SELECT * FROM UserActivity FORMAT JSONEachRow` 쿼리는 다음을 반환합니다:

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

[JSON](/interfaces/formats/JSON) 형식과 달리, 잘못된 UTF-8 시퀀스는 치환되지 않습니다. 값은 `JSON`과 동일한 방식으로 이스케이프됩니다.

:::info
문자열 값에 임의의 바이트 집합을 출력할 수 있습니다. 테이블의 데이터가 정보 손실 없이 JSON으로 포맷될 수 있다고 확신하는 경우 [`JSONEachRow`](./JSONEachRow.md) 형식을 사용하십시오.
:::

### 중첩 구조 사용 \{#jsoneachrow-nested\}

[`Nested`](/sql-reference/data-types/nested-data-structures/index.md) 데이터 타입의 컬럼이 있는 테이블이 있다면 동일한 구조의 JSON 데이터를 삽입할 수 있습니다. [input&#95;format&#95;import&#95;nested&#95;json](/operations/settings/settings-formats.md/#input_format_import_nested_json) 설정을 활성화하여 이 기능을 사용할 수 있습니다.

예를 들어, 다음과 같은 테이블을 가정해 보겠습니다:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

`Nested` 데이터 형식 설명에서 볼 수 있듯이, ClickHouse는 중첩 구조의 각 구성 요소를 별도의 컬럼으로 취급합니다(이 테이블에서는 `n.s`와 `n.i`). 데이터를 다음과 같이 삽입합니다.

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

계층 구조의 JSON 객체로 데이터를 삽입하려면 [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json)을(를) 설정하십시오.

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

이 SETTING이 없으면 ClickHouse는 예외를 발생시킵니다.

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


## 형식 설정 \{#format-settings\}



| 설정                                                                                                                                                                           | 설명                                                                                                                                                                                            | 기본값      | 비고                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                               | 중첩된 JSON 데이터를 중첩 테이블에 매핑합니다(JSONEachRow 포맷에서 동작합니다).                                                                                                                                          | `false`  |                                                                                                                                                                      |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                               | JSON 입력 포맷에서 bool 값을 숫자로 파싱할 수 있도록 허용합니다.                                                                                                                                                     | `true`   |                                                                                                                                                                      |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                               | JSON 입력 포맷에서 bool 값을 문자열로 파싱할 수 있도록 허용합니다.                                                                                                                                                    | `true`   |                                                                                                                                                                      |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                           | JSON 입력 포맷에서 숫자를 문자열로 파싱할 수 있도록 허용합니다.                                                                                                                                                        | `true`   |                                                                                                                                                                      |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                             | JSON 입력 포맷에서 JSON 배열을 문자열로 파싱할 수 있도록 허용합니다.                                                                                                                                                   | `true`   |                                                                                                                                                                      |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                           | JSON 입력 포맷에서 JSON 객체를 문자열로 파싱할 수 있도록 허용합니다.                                                                                                                                                   | `true`   |                                                                                                                                                                      |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                           | 이름이 있는 튜플 컬럼을 JSON 객체로 파싱합니다.                                                                                                                                                                 | `true`   |                                                                                                                                                                      |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                             | 스키마 추론 중 문자열 필드에서 숫자 타입을 추론하려고 시도합니다.                                                                                                                                                         | `false`  |                                                                                                                                                                      |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                   | 스키마 추론 중 JSON 객체에서 이름이 있는 튜플을 추론하려고 시도합니다.                                                                                                                                                    | `true`   |                                                                                                                                                                      |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                       | JSON 입력 포맷에서 스키마를 추론할 때, Null 또는 비어 있는 객체/배열만 포함하는 키에 대해 String 타입을 사용합니다.                                                                                                                    | `true`   |                                                                                                                                                                      |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 이름이 있는 튜플을 파싱할 때 JSON 객체에서 누락된 요소에 기본값을 삽입합니다.                                                                                                                                                | `true`   |                                                                                                                                                                      |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                     | 이름이 있는 튜플에 대해 JSON 객체의 알 수 없는 키를 무시합니다.                                                                                                                                                       | `false`  |                                                                                                                                                                      |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)         | JSONCompact/JSONCompactEachRow 포맷에서 가변 개수의 컬럼을 허용하고, 초과 컬럼은 무시하며, 누락된 컬럼에는 기본값을 사용합니다.                                                                                                        | `false`  |                                                                                                                                                                      |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                 | JSON 문자열에 잘못된 이스케이프 시퀀스가 포함된 경우 예외를 발생시킵니다. 비활성화하면 잘못된 이스케이프 시퀀스는 데이터에 그대로 남습니다.                                                                                                              | `true`   |                                                                                                                                                                      |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                         | JSON 입력에서 비어 있는 필드를 기본값으로 처리합니다. 복잡한 기본 표현식에는 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)도 함께 활성화해야 합니다. | `false`. | 복잡한 기본 표현식을 사용하려면 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 설정도 함께 활성화해야 합니다. |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                               | JSON 출력 포맷에서 64비트 정수에 대한 따옴표 처리 방식을 제어합니다.                                                                                                                                                    | `true`   |                                                                                                                                                                      |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                   | JSON 출력 포맷에서 64비트 부동소수점 수에 대한 따옴표 처리 방식을 제어합니다.                                                                                                                                               | `false`  |                                                                                                                                                                      |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                         | JSON 출력 포맷에서 &#39;+nan&#39;, &#39;-nan&#39;, &#39;+inf&#39;, &#39;-inf&#39; 출력 사용을 활성화합니다.                                                                                                    | `false`  |                                                                                                                                                                      |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                           | JSON 출력 포맷에서 Decimal 값에 대한 따옴표 처리 방식을 제어합니다.                                                                                                                                                  | `false`  |                                                                                                                                                                      |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                           | JSON 출력 포맷에서 문자열 출력에 포함된 슬래시(/)의 이스케이프 처리 방식을 제어합니다.                                                                                                                                          | `true`   |                                                                                                                                                                      |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                         | 이름이 있는 튜플 컬럼을 JSON 객체로 직렬화합니다.                                                                                                                                                                | `true`   |                                                                                                                                                                      |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                             | JSONEachRow(Compact) 포맷에서 모든 행을 포함하는 JSON 배열을 출력합니다.                                                                                                                                          | `false`  |                                                                                                                                                                      |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                             | JSON 출력 포맷에서 UTF-8 시퀀스의 검증을 활성화합니다(JSON/JSONCompact/JSONColumnsWithMetadata 포맷에는 영향을 주지 않으며, 이들 포맷은 항상 UTF-8을 검증합니다).                                                                         | `false`  |                                                                                                                                                                      |