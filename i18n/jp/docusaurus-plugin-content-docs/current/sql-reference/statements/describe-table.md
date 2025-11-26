---
description: 'DESCRIBE TABLE のドキュメント'
sidebar_label: 'DESCRIBE TABLE'
sidebar_position: 42
slug: /sql-reference/statements/describe-table
title: 'DESCRIBE TABLE'
doc_type: 'reference'
---

テーブル列に関する情報を返します。

**構文**

```sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

`DESCRIBE` ステートメントは、各テーブル列に対して次の [String](../../sql-reference/data-types/string.md) 型の値を持つ行を返します:

* `name` — 列名。
* `type` — 列の型。
* `default_type` — 列の [default expression](/sql-reference/statements/create/table) で使用される句。`DEFAULT`、`MATERIALIZED`、または `ALIAS` のいずれか。デフォルト式がない場合は空文字列が返されます。
* `default_expression` — `DEFAULT` 句の後に指定される式。
* `comment` — [列コメント](/sql-reference/statements/alter/column#comment-column)。
* `codec_expression` — 列に適用される [codec](/sql-reference/statements/create/table#column_compression_codec)。
* `ttl_expression` — [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 式。
* `is_subcolumn` — 内部サブカラムに対して `1` となるフラグ。[describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定でサブカラムの説明が有効になっている場合にのみ、結果に含まれます。

[Nested](../../sql-reference/data-types/nested-data-structures/index.md) データ構造内のすべての列は個別に記述されます。各列名には、親列名とドットが接頭辞として付けられます。

その他のデータ型の内部サブカラムを表示するには、[describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定を使用します。

**例**

クエリ:`

```sql
CREATE TABLE describe_example (
    id UInt64, text String DEFAULT 'unknown' CODEC(ZSTD),
    user Tuple (name String, age UInt8)
) ENGINE = MergeTree() ORDER BY id;

DESCRIBE TABLE describe_example;
DESCRIBE TABLE describe_example SETTINGS describe_include_subcolumns=1;
```

結果:

```text
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id   │ UInt64                        │              │                    │         │                  │                │
│ text │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │
│ user │ Tuple(name String, age UInt8) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

2つ目のクエリでは、サブカラムも併せて表示されます。

```text
┌─name──────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┬─is_subcolumn─┐
│ id        │ UInt64                        │              │                    │         │                  │                │            0 │
│ text      │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │            0 │
│ user      │ Tuple(name String, age UInt8) │              │                    │         │                  │                │            0 │
│ user.name │ String                        │              │                    │         │                  │                │            1 │
│ user.age  │ UInt8                         │              │                    │         │                  │                │            1 │
└───────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┴──────────────┘
```

**関連項目**

* [describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定
