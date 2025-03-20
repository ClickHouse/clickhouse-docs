---
description: '有关以前 ClickHouse 版本中设置更改的信息的系统表。'
slug: /operations/system-tables/settings_changes
title: 'system.settings_changes'
keywords: ['system table', 'settings_changes']
---

包含有关以前 ClickHouse 版本中设置更改的信息。

列：

- `type` ([Enum](../../sql-reference/data-types/enum.md)) - 设置类型：`Core`（通用 / 查询设置），`MergeTree`。
- `version` ([String](../../sql-reference/data-types/string.md)) — 更改设置的 ClickHouse 版本
- `changes` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — 设置更改的描述：（设置名称，先前值，新值，更改原因）

**示例**

``` sql
SELECT *
FROM system.settings_changes
WHERE version = '23.5'
FORMAT Vertical
```

``` text
Row 1:
──────
type:    Core
version: 23.5
changes: [('input_format_parquet_preserve_order','1','0','允许 Parquet 读取器重新排序行以提高并行性。'),('parallelize_output_from_storages','0','1','在执行从文件/url/s3/etc. 中读取的查询时允许并行性。这可能会重新排序行。'),('use_with_fill_by_sorting_prefix','0','1','ORDER BY 子句中 WITH FILL 列之前的列形成排序前缀。排序前缀中具有不同值的行独立填充。'),('output_format_parquet_compliant_nested_types','0','1','更改输出 Parquet 文件架构中的内部字段名称。')]
```

**另请参阅**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [system.settings](settings.md)
