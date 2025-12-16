---
description: '指定された入力形式に従って引数からデータを解析します。structure 引数が指定されていない場合は、データから構造を自動的に抽出します。'
slug: /sql-reference/table-functions/format
sidebar_position: 65
sidebar_label: 'format'
title: 'format'
doc_type: 'reference'
---

# format テーブル関数 {#format-table-function}

指定された入力フォーマットに従って、引数からデータをパースします。`structure` 引数が指定されていない場合は、データから自動的に抽出されます。

## 構文 {#syntax}

```sql
format(format_name, [structure], data)
```

## 引数 {#arguments}

- `format_name` — データの[フォーマット](/sql-reference/formats)。
- `structure` - テーブル構造。省略可能。形式は `column1_name column1_type, column2_name column2_type, ...`。
- `data` — 指定したフォーマットのデータを含む文字列を返す文字列リテラルまたは定数式。

## 返される値 {#returned_value}

指定された形式および、指定または抽出された構造に従って `data` 引数を解析した結果を含むテーブル。

## 例 {#examples}

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

**クエリ：**

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

`structure` 引数を指定する場合:

**クエリ：**

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

## 関連項目 {#related}

- [フォーマット](../../interfaces/formats.md)
