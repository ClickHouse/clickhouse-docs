---
'description': '指定された入力フォーマットに従って、引数からデータを解析します。structure引数が指定されていない場合は、データから抽出されます。'
'slug': '/sql-reference/table-functions/format'
'sidebar_position': 65
'sidebar_label': 'フォーマット'
'title': 'フォーマット'
'doc_type': 'reference'
---


# format Table Function

指定された入力形式に従って、引数からデータを解析します。structure 引数が指定されていない場合、データから抽出されます。

## Syntax {#syntax}

```sql
format(format_name, [structure], data)
```

## Arguments {#arguments}

- `format_name` — データの [フォーマット](/sql-reference/formats)。
- `structure` - テーブルの構造。オプション。形式 'column1_name column1_type, column2_name column2_type, ...'。
- `data` — 指定された形式のデータを含む文字列を返す文字列リテラルまたは定数式。

## Returned value {#returned_value}

指定されたフォーマットおよび指定または抽出された構造に従って、`data` 引数から解析されたデータを持つテーブル。

## Examples {#examples}

`structure` 引数なしの場合:

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

`structure` 引数ありの場合:

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
