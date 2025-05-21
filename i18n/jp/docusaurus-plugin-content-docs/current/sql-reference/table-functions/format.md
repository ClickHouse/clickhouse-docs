---
description: '指定された入力形式に従って引数からデータを解析します。構造引数が指定されていない場合は、データから抽出されます。'
slug: /sql-reference/table-functions/format
sidebar_position: 65
sidebar_label: 'format'
title: 'format'
---


# format テーブル関数

指定された入力形式に従って引数からデータを解析します。構造引数が指定されていない場合は、データから抽出されます。

**構文**

```sql
format(format_name, [structure], data)
```

**パラメータ**

- `format_name` — データの[形式](/sql-reference/formats)。
- `structure` - テーブルの構造。オプション。形式 'column1_name column1_type, column2_name column2_type, ...'。
- `data` — 指定された形式のデータを含む文字列リテラルまたは定数式

**返される値**

指定された形式と指定されたまたは抽出された構造に従って、`data` 引数から解析されたデータを持つテーブル。

**例**

`structure` 引数なしの場合:

**クエリ:**
```sql
SELECT * FROM format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**結果:**

```response
┌───b─┬─a─────┐
│ 111 │ Hello │
│ 123 │ World │
│ 112 │ Hello │
│ 124 │ World │
└─────┴───────┘
```

**クエリ:**
```sql
DESC format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**結果:**

```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ b    │ Nullable(Float64) │              │                    │         │                  │                │
│ a    │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

`structure` 引数ありの場合:

**クエリ:**
```sql
SELECT * FROM format(JSONEachRow, 'a String, b UInt32',
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**結果:**
```response
┌─a─────┬───b─┐
│ Hello │ 111 │
│ World │ 123 │
│ Hello │ 112 │
│ World │ 124 │
└───────┴─────┘
```

**その他の情報**

- [フォーマット](../../interfaces/formats.md)
