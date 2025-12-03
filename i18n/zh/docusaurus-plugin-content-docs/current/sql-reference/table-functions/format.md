---
description: '根据指定的输入格式从参数中解析数据。如果未指定 structure 参数，则从数据中提取该结构。'
slug: /sql-reference/table-functions/format
sidebar_position: 65
sidebar_label: 'format'
title: 'format'
doc_type: 'reference'
---



# format 表函数 {#format-table-function}

根据指定的输入格式从参数中解析数据。如果未指定 structure 参数，则从数据中提取结构。



## 语法 {#syntax}

```sql
format(format_name, [structure], data)
```


## 参数 {#arguments}

- `format_name` — 数据的[格式](/sql-reference/formats)。
- `structure` - 表结构。可选。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
- `data` — 字符串字面量或返回一个按指定格式组织的数据字符串的常量表达式。



## 返回值 {#returned_value}

一个数据表，包含根据指定格式和指定或提取的结构从 `data` 参数中解析得到的数据。



## 示例 {#examples}

不带 `structure` 参数：

**查询：**

```sql
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
│ 111 │ 你好  │
│ 123 │ 世界  │
│ 112 │ 你好  │
│ 124 │ 世界  │
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

使用 `structure` 参数：

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
│ 你好  │ 111 │
│ 世界  │ 123 │
│ 你好  │ 112 │
│ 世界  │ 124 │
└───────┴─────┘
```


## 相关内容 {#related}

- [格式](../../interfaces/formats.md)
