---
'description': '系统表包含关于 S3Queue 表设置的信息。从服务器版本 `24.10` 开始可用。'
'keywords':
- 'system table'
- 's3_queue_settings'
'slug': '/operations/system-tables/s3_queue_settings'
'title': 'system.s3_queue_settings'
---


# system.s3_queue_settings

包含有关 [S3Queue](../../engines/table-engines/integrations/s3queue.md) 表的设置的信息。从服务器版本 `24.10` 开始可用。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表名称。
- `table` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。
- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 设置是否在配置中明确定义或被显式更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置描述。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示设置是否可以通过 `ALTER TABLE ... MODIFY SETTING` 进行更改。
    - `0` — 当前用户可以更改该设置。
    - `1` — 当前用户不能更改该设置。
- `type` ([String](../../sql-reference/data-types/string.md)) — 设置类型（实现特定字符串值）。
