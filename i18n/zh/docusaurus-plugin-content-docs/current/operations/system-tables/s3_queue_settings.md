---
'description': 'System table containing information about the settings of S3Queue
  tables. Available from server version `24.10`.'
'keywords':
- 'system table'
- 's3_queue_settings'
'slug': '/operations/system-tables/s3_queue_settings'
'title': 'system.s3_queue_settings'
---




# system.s3_queue_settings

包含有关[S3Queue](../../engines/table-engines/integrations/s3queue.md)表设置的信息。从服务器版本`24.10`开始提供。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `table` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。
- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 设置是否在配置中被明确定义或被明确更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置描述。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示该设置是否可以通过`ALTER TABLE ... MODIFY SETTING`进行更改。
    - `0` — 当前用户可以更改该设置。
    - `1` — 当前用户无法更改该设置。
- `type` ([String](../../sql-reference/data-types/string.md)) — 设置类型（实现特定的字符串值）。
