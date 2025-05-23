---
'description': '系统表包含关于在之前的 ClickHouse 版本中设置更改的信息。'
'keywords':
- 'system table'
- 'settings_changes'
'slug': '/operations/system-tables/settings_changes'
'title': 'system.settings_changes'
---


# system.settings_changes

包含有关以前 ClickHouse 版本中设置更改的信息。

列：

- `type` ([Enum](../../sql-reference/data-types/enum.md)) - 设置类型：`Core` （一般/查询设置），`MergeTree`。
- `version` ([String](../../sql-reference/data-types/string.md)) — 更改设置的 ClickHouse 版本
- `changes` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — 设置更改的描述： (设置名称， 以前的值， 新的值， 更改原因)

**示例**

```sql
SELECT *
FROM system.settings_changes
WHERE version = '23.5'
FORMAT Vertical
```

```text
Row 1:
──────
type:    Core
version: 23.5
changes: [('input_format_parquet_preserve_order','1','0','Allow Parquet reader to reorder rows for better parallelism.'),('parallelize_output_from_storages','0','1','Allow parallelism when executing queries that read from file/url/s3/etc. This may reorder rows.'),('use_with_fill_by_sorting_prefix','0','1','Columns preceding WITH FILL columns in ORDER BY clause form sorting prefix. Rows with different values in sorting prefix are filled independently'),('output_format_parquet_compliant_nested_types','0','1','Change an internal field name in output Parquet file schema.')]
```

**另见**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [system.settings](settings.md)
