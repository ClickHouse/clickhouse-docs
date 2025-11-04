---
'description': '系统表包含有关 S3Queue 表设置的信息。可从服务器版本 `24.10` 获取。'
'keywords':
- 'system table'
- 's3_queue_settings'
'slug': '/operations/system-tables/s3_queue_settings'
'title': 'system.s3_queue_settings'
'doc_type': 'reference'
---


# system.s3_queue_settings

包含有关[S3Queue](../../engines/table-engines/integrations/s3queue.md) 表的设置的信息。自服务器版本 `24.10` 起可用。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `table` ([String](../../sql-reference/data-types/string.md)) — 数据库名。
- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 设置是否在配置中显式定义或显式更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置描述。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示设置是否可以通过 `ALTER TABLE ... MODIFY SETTING` 更改。
  - `0` — 当前用户可以更改设置。
  - `1` — 当前用户无法更改设置。
- `type` ([String](../../sql-reference/data-types/string.md)) — 设置类型（特定于实现的字符串值）。
