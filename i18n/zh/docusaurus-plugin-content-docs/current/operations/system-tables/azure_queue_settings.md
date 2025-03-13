---
description: '包含有关 AzureQueue 表设置的信息。可从 `24.10` 服务器版本开始使用。'
slug: /operations/system-tables/azure_queue_settings
title: 'system.azure_queue_settings'
keywords: ['system table', 'azure_queue_settings']
---

包含有关 [AzureQueue](../../engines/table-engines/integrations/azure-queue.md) 表设置的信息。
可从 `24.10` 服务器版本开始使用。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表名称。
- `table` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。
- `name` ([String](../../sql-reference/data-types/string.md)) — 设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 设置值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 设置是否在配置中明确定义或明确更改。
- `description` ([String](../../sql-reference/data-types/string.md)) — 设置描述。
- `alterable` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示是否可以通过 `ALTER TABLE ... MODIFY SETTING` 更改该设置。
    - `0` — 当前用户可以更改该设置。
    - `1` — 当前用户无法更改该设置。
- `type` ([String](../../sql-reference/data-types/string.md)) — 设置类型（实现特定的字符串值）。
