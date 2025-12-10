---
description: '显示 ClickHouse 用户账户已授予权限的系统表。'
keywords: ['system table', 'grants']
slug: /operations/system-tables/grants
title: 'system.grants'
doc_type: 'reference'
---

授予 ClickHouse 用户账户的权限。

列：

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 用户名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 分配给用户账户的角色。

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouse 用户账户的访问类型。

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 数据库名称。

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 表名。

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 被授予访问权限的列名。

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。用于指示是否有部分权限被撤销。可能的取值为：
  - `0` — 该行描述的是一个授予操作。
  - `1` — 该行描述的是一个部分撤销操作。

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 通过 `WITH GRANT OPTION` 授予的权限，参见 [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax)。