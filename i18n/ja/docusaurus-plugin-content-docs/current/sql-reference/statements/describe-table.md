---
slug: /sql-reference/statements/describe-table
sidebar_position: 42
sidebar_label: テーブルの説明
title: "テーブルの説明"
---

テーブルのカラムに関する情報を返します。

**構文**

``` sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

`DESCRIBE` ステートメントは、以下の [String](../../sql-reference/data-types/string.md) 値を持つ各テーブルカラムについての行を返します。

- `name` — カラム名。
- `type` — カラムの型。
- `default_type` — カラムの [デフォルト式](../../sql-reference/statements/create/table.md#create-default-values) で使用される句: `DEFAULT`, `MATERIALIZED` または `ALIAS`。デフォルト式がない場合は、空の文字列が返されます。
- `default_expression` — `DEFAULT` 句の後に指定された式。
- `comment` — [カラムコメント](../../sql-reference/statements/alter/column.md#alter_comment-column)。
- `codec_expression` — カラムに適用される [コーデック](../../sql-reference/statements/create/table.md#codecs)。
- `ttl_expression` — [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 式。
- `is_subcolumn` — 内部のサブカラムに対して `1` に等しいフラグです。サブカラムの説明が [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定によって有効になっている場合のみ、結果に含まれます。

[Nested](../../sql-reference/data-types/nested-data-structures/index.md) データ構造のすべてのカラムは別々に説明されます。各カラムの名前は親カラム名とドットで接頭辞が付けられます。

他のデータ型の内部サブカラムを表示するには、[describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定を使用してください。

**例**

クエリ:

``` sql
CREATE TABLE describe_example (
    id UInt64, text String DEFAULT 'unknown' CODEC(ZSTD),
    user Tuple (name String, age UInt8)
) ENGINE = MergeTree() ORDER BY id;

DESCRIBE TABLE describe_example;
DESCRIBE TABLE describe_example SETTINGS describe_include_subcolumns=1;
```

結果:

``` text
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id   │ UInt64                        │              │                    │         │                  │                │
│ text │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │
│ user │ Tuple(name String, age UInt8) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

2番目のクエリは追加でサブカラムを表示します:

``` text
┌─name──────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┬─is_subcolumn─┐
│ id        │ UInt64                        │              │                    │         │                  │                │            0 │
│ text      │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │            0 │
│ user      │ Tuple(name String, age UInt8) │              │                    │         │                  │                │            0 │
│ user.name │ String                        │              │                    │         │                  │                │            1 │
│ user.age  │ UInt8                         │              │                    │         │                  │                │            1 │
└───────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┴──────────────┘
```

**関連項目**

- [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定。
