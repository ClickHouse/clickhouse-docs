---
'description': 'System table containing information about parameters `graphite_rollup`
  which are used in tables with `GraphiteMergeTree` type engines.'
'keywords':
- 'system table'
- 'graphite_retentions'
'slug': '/operations/system-tables/graphite_retentions'
'title': 'system.graphite_retentions'
---



包含有关参数 [graphite_rollup](../../operations/server-configuration-parameters/settings.md#graphite) 的信息，该参数用于具有 [\*GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md) 引擎的表。

列：

- `config_name` (String) - `graphite_rollup` 参数名称。
- `regexp` (String) - 指标名称的模式。
- `function` (String) - 聚合函数的名称。
- `age` (UInt64) - 数据的最小年龄（以秒为单位）。
- `precision` (UInt64) - 精确定义数据年龄的精度（以秒为单位）。
- `priority` (UInt16) - 模式优先级。
- `is_default` (UInt8) - 模式是否为默认值。
- `Tables.database` (Array(String)) - 使用 `config_name` 参数的数据库表名称数组。
- `Tables.table` (Array(String)) - 使用 `config_name` 参数的表名称数组。
