---
'description': '系统表包含有关参数 `graphite_rollup` 的信息，这些参数用于具有 `GraphiteMergeTree` 类型引擎的表中。'
'keywords':
- 'system table'
- 'graphite_retentions'
'slug': '/operations/system-tables/graphite_retentions'
'title': 'system.graphite_retentions'
---

包含有关参数 [graphite_rollup](../../operations/server-configuration-parameters/settings.md#graphite) 的信息，这些参数用于具有 [\*GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md) 引擎的表中。

列：

- `config_name` (字符串) - `graphite_rollup` 参数名称。
- `regexp` (字符串) - 指标名称的模式。
- `function` (字符串) - 聚合函数的名称。
- `age` (UInt64) - 数据的最小年龄（秒）。
- `precision` (UInt64) - 定义数据年龄的精确度（秒）。
- `priority` (UInt16) - 模式优先级。
- `is_default` (UInt8) - 模式是否为默认值。
- `Tables.database` (数组(字符串)) - 使用 `config_name` 参数的数据库表名称数组。
- `Tables.table` (数组(字符串)) - 使用 `config_name` 参数的表名称数组。
