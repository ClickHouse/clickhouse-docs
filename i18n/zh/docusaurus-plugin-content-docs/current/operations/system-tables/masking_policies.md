---
description: '包含系统中所有数据脱敏策略信息的系统表。'
keywords: ['系统表', 'masking_policies']
slug: /operations/system-tables/masking_policies
title: 'system.masking_policies'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# system.masking_policies \{#systemmasking_policies\}

包含系统中定义的所有脱敏策略的信息。

Columns:

* `name` ([String](/sql-reference/data-types/string.md)) — 脱敏策略名称。完整名称格式为 `short_name ON database.table`。
* `short_name` ([String](/sql-reference/data-types/string.md)) — 脱敏策略的短名。例如，如果完整名称是 `mask_email ON mydb.mytable`，则短名为 `mask_email`。
* `database` ([String](/sql-reference/data-types/string.md)) — 数据库名称。
* `table` ([String](/sql-reference/data-types/string.md)) — 表名。
* `id` ([UUID](/sql-reference/data-types/uuid.md)) — 脱敏策略 ID。
* `storage` ([String](/sql-reference/data-types/string.md)) — 存储该脱敏策略的目录名称。
* `update_assignments` ([Nullable(String)](/sql-reference/data-types/nullable.md)) — 定义数据应如何脱敏的 `UPDATE` 赋值表达式。例如：`email = '***masked***', phone = '***-***-****'`。
* `where_condition` ([Nullable(String)](/sql-reference/data-types/nullable.md)) — 可选的 `WHERE` 条件，用于指定何时应用脱敏。
* `priority` ([Int64](/sql-reference/data-types/int-uint.md)) — 应用多个脱敏策略时的优先级。优先级更高的策略会先被应用。默认值为 0。
* `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint.md)) — 指示该脱敏策略是否适用于所有角色和/或用户。为 1 表示是，否则为 0。
* `apply_to_list` ([Array(String)](/sql-reference/data-types/array.md)) — 应用该脱敏策略的角色和/或用户列表。
* `apply_to_except` ([Array(String)](/sql-reference/data-types/array.md)) — 该脱敏策略应用于除列出的角色和/或用户以外的所有角色和/或用户。仅当 `apply_to_all` 为 1 时才会被填充。