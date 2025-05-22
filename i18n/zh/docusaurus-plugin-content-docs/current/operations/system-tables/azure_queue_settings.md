---
'description': '系统表，包含有关AzureQueue表设置的信息。从服务器版本`24.10`开始可用。'
'keywords':
- 'system table'
- 'azure_queue_settings'
'slug': '/operations/system-tables/azure_queue_settings'
'title': 'system.azure_queue_settings'
---

包含有关 [AzureQueue](../../engines/table-engines/integrations/azure-queue.md) 表设置的信息。  
自 `24.10` 服务器版本起可用。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `table` ([String](../../sql-reference/data-types/string.md)) — 数据库名。
- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 设置是否在配置中显式定义或被显式更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置描述。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示是否可以通过 `ALTER TABLE ... MODIFY SETTING` 更改设置。
    - `0` — 当前用户可以更改该设置。
    - `1` — 当前用户无法更改该设置。
- `type` ([String](../../sql-reference/data-types/string.md)) — 设置类型（实现特定的字符串值）。
