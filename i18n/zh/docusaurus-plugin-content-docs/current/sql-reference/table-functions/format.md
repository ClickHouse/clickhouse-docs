---
slug: /sql-reference/table-functions/format
sidebar_position: 65
sidebar_label: format
title: 'format'
description: '根据指定的输入格式解析参数中的数据。如果未指定结构参数，则从数据中提取。'
---


# format 表函数

根据指定的输入格式解析参数中的数据。如果未指定结构参数，则从数据中提取。

**语法**

``` sql
format(format_name, [structure], data)
```

**参数**

- `format_name` — 数据的 [格式](/sql-reference/formats)。
- `structure` - 表的结构。可选。格式为 'column1_name column1_type, column2_name column2_type, ...'。
- `data` — 字符串字面量或返回包含指定格式数据的字符串的常量表达式。

**返回值**

根据指定的格式和指定或提取的结构，从 `data` 参数解析的数据表。

**示例**

不带 `structure` 参数的情况：

**查询：**
``` sql
SELECT * FROM format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**结果：**

```response
┌───b─┬─a─────┐
│ 111 │ Hello │
│ 123 │ World │
│ 112 │ Hello │
│ 124 │ World │
└─────┴───────┘
```

**查询：**
```sql
DESC format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**结果：**

```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ b    │ Nullable(Float64) │              │                    │         │                  │                │
│ a    │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

带 `structure` 参数的情况：

**查询：**
```sql
SELECT * FROM format(JSONEachRow, 'a String, b UInt32',
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**结果：**
```response
┌─a─────┬───b─┐
│ Hello │ 111 │
│ World │ 123 │
│ Hello │ 112 │
│ World │ 124 │
└───────┴─────┘
```

**另见**

- [Formats](../../interfaces/formats.md)
