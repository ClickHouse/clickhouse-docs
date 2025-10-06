---
'description': 'Describe Table のドキュメント'
'sidebar_label': 'DESCRIBE TABLE'
'sidebar_position': 42
'slug': '/sql-reference/statements/describe-table'
'title': 'DESCRIBE TABLE'
'doc_type': 'reference'
---

テーブルのカラムに関する情報を返します。

**構文**

```sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

`DESCRIBE` ステートメントは、以下の [String](../../sql-reference/data-types/string.md) 値を持つ各テーブルカラムに対して行を返します。

- `name` — カラム名。
- `type` — カラムの型。
- `default_type` — カラムの [デフォルト式](/sql-reference/statements/create/table) に使用される句： `DEFAULT`、`MATERIALIZED` または `ALIAS` 。デフォルト式がない場合、空の文字列が返されます。
- `default_expression` — `DEFAULT` 句の後に指定された式。
- `comment` — [カラムコメント](/sql-reference/statements/alter/column#comment-column)。
- `codec_expression` — カラムに適用される [コーデック](/sql-reference/statements/create/table#column_compression_codec)。
- `ttl_expression` — [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 式。
- `is_subcolumn` — 内部サブカラムの場合は `1` になるフラグ。この結果には、[describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定によってサブカラムの説明が有効にされている場合のみ含まれます。

[Nested](../../sql-reference/data-types/nested-data-structures/index.md) データ構造のすべてのカラムは別々に記述されます。各カラムの名前は親カラム名とドットで接頭辞が付けられます。

他のデータ型の内部サブカラムを表示するには、[describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定を使用します。

**例**

クエリ:

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

二番目のクエリは、追加でサブカラムも表示します:

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

- [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 設定。
