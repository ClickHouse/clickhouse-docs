---
'description': '根据指定的输入格式解析来自参数的数据。如果未指定结构参数，则将从数据中提取它。'
'slug': '/sql-reference/table-functions/format'
'sidebar_position': 65
'sidebar_label': '格式'
'title': '格式'
'doc_type': 'reference'
---


# format Table Function

根据指定的输入格式从参数中解析数据。如果未指定结构参数，则从数据中提取。

## Syntax {#syntax}

```sql
format(format_name, [structure], data)
```

## Arguments {#arguments}

- `format_name` — 数据的 [格式](/sql-reference/formats)。
- `structure` - 表的结构。可选。格式为 'column1_name column1_type, column2_name column2_type, ...'。
- `data` — 字符串字面量或返回包含指定格式数据的字符串的常量表达式。

## Returned value {#returned_value}

根据指定格式和指定或提取的结构，从 `data` 参数中解析出的数据表。

## Examples {#examples}

没有 `structure` 参数：

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

有 `structure` 参数：

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
