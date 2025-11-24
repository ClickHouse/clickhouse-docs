---
'description': '주어진 입력 형식에 따라 인수로부터 데이터를 구문 분석합니다. 구조 인수가 지정되지 않은 경우, 데이터로부터 추출됩니다.'
'slug': '/sql-reference/table-functions/format'
'sidebar_position': 65
'sidebar_label': '형식'
'title': '형식'
'doc_type': 'reference'
---


# format Table Function

지정된 입력 형식에 따라 인수에서 데이터를 구문 분석합니다. 구조 인수가 지정되지 않으면 데이터에서 추출됩니다.

## Syntax {#syntax}

```sql
format(format_name, [structure], data)
```

## Arguments {#arguments}

- `format_name` — 데이터의 [형식](/sql-reference/formats).
- `structure` - 테이블의 구조. 선택 사항. 형식 'column1_name column1_type, column2_name column2_type, ...'.
- `data` — 지정된 형식의 데이터를 포함하는 문자열 리터럴 또는 상수 표현식.

## Returned value {#returned_value}

지정된 형식과 지정되었거나 추출된 구조에 따라 `data` 인수에서 구문 분석된 데이터로 구성된 테이블.

## Examples {#examples}

`structure` 인수 없이:

**Query:**
```sql
SELECT * FROM format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**Result:**

```response
┌───b─┬─a─────┐
│ 111 │ Hello │
│ 123 │ World │
│ 112 │ Hello │
│ 124 │ World │
└─────┴───────┘
```

**Query:**
```sql
DESC format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**Result:**

```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ b    │ Nullable(Float64) │              │                    │         │                  │                │
│ a    │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

`structure` 인수와 함께:

**Query:**
```sql
SELECT * FROM format(JSONEachRow, 'a String, b UInt32',
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**Result:**
```response
┌─a─────┬───b─┐
│ Hello │ 111 │
│ World │ 123 │
│ Hello │ 112 │
│ World │ 124 │
└───────┴─────┘
```

## Related {#related}

- [Formats](../../interfaces/formats.md)
