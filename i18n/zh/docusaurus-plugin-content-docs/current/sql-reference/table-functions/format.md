---
'description': 'Parses data from arguments according to specified input format. If
  structure argument is not specified, it''s extracted from the data.'
'slug': '/sql-reference/table-functions/format'
'sidebar_position': 65
'sidebar_label': 'format'
'title': 'format'
---




# format 表函数

根据指定的输入格式解析来自参数的数据。如果未指定结构参数，则会从数据中提取。

## 语法 {#syntax}

```sql
format(format_name, [structure], data)
```

## 参数 {#arguments}

- `format_name` — 数据的 [格式](/sql-reference/formats)。
- `structure` - 表的结构。可选。格式为 'column1_name column1_type, column2_name column2_type, ...'。
- `data` — 字符串字面量或常量表达式，返回包含指定格式数据的字符串。

## 返回值 {#returned_value}

一个表，包含从 `data` 参数中根据指定格式和指定或提取的结构解析的数据。

## 示例 {#examples}

未包含 `structure` 参数：

**查询:**
```sql
SELECT * FROM format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**结果:**

```response
┌───b─┬─a─────┐
│ 111 │ Hello │
│ 123 │ World │
│ 112 │ Hello │
│ 124 │ World │
└─────┴───────┘
```

**查询:**
```sql
DESC format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**结果:**

```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ b    │ Nullable(Float64) │              │                    │         │                  │                │
│ a    │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

包含 `structure` 参数：

**查询:**
```sql
SELECT * FROM format(JSONEachRow, 'a String, b UInt32',
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**结果:**
```response
┌─a─────┬───b─┐
│ Hello │ 111 │
│ World │ 123 │
│ Hello │ 112 │
│ World │ 124 │
└───────┴─────┘
```

## 相关 {#related}

- [格式](../../interfaces/formats.md)
