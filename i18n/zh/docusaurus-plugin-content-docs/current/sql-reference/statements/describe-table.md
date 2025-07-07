---
'description': '描述 TABLE 的文档'
'sidebar_label': '描述 TABLE'
'sidebar_position': 42
'slug': '/sql-reference/statements/describe-table'
'title': '描述 TABLE'
---

返回有关表列的信息。

**语法**

```sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

`DESCRIBE` 语句为每个表列返回一行，包含以下 [String](../../sql-reference/data-types/string.md) 值：

- `name` — 列名。
- `type` — 列类型。
- `default_type` — 用于列 [default expression](/sql-reference/statements/create/table) 的子句： `DEFAULT`、`MATERIALIZED` 或 `ALIAS`。如果没有默认表达式，则返回空字符串。
- `default_expression` — 在 `DEFAULT` 子句之后指定的表达式。
- `comment` — [列注释](/sql-reference/statements/alter/column#comment-column)。
- `codec_expression` — 应用于列的 [codec](/sql-reference/statements/create/table#column_compression_codec)。
- `ttl_expression` — [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 表达式。
- `is_subcolumn` — 一个标志，如果是内部子列，则等于 `1`。仅当通过 [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 设置启用子列描述时，会将其包含在结果中。

在 [Nested](../../sql-reference/data-types/nested-data-structures/index.md) 数据结构中的所有列将单独描述。每列的名称以父列名称和一个点作为前缀。

要显示其他数据类型的内部子列，请使用 [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 设置。

**示例**

查询：

```sql
CREATE TABLE describe_example (
    id UInt64, text String DEFAULT 'unknown' CODEC(ZSTD),
    user Tuple (name String, age UInt8)
) ENGINE = MergeTree() ORDER BY id;

DESCRIBE TABLE describe_example;
DESCRIBE TABLE describe_example SETTINGS describe_include_subcolumns=1;
```

结果：

```text
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id   │ UInt64                        │              │                    │         │                  │                │
│ text │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │
│ user │ Tuple(name String, age UInt8) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

第二个查询另外显示子列：

```text
┌─name──────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┬─is_subcolumn─┐
│ id        │ UInt64                        │              │                    │         │                  │                │            0 │
│ text      │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │            0 │
│ user      │ Tuple(name String, age UInt8) │              │                    │         │                  │                │            0 │
│ user.name │ String                        │              │                    │         │                  │                │            1 │
│ user.age  │ UInt8                         │              │                    │         │                  │                │            1 │
└───────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┴──────────────┘
```

**另见**

- [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 设置。
