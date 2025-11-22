---
description: '包含配额信息的系统表。'
keywords: ['system 表', 'quotas', 'quota']
slug: /operations/system-tables/quotas
title: 'system.quotas'
doc_type: 'reference'
---



# system.quotas

包含有关[配额](../../operations/system-tables/quotas.md)的信息。

列：
- `name` ([String](../../sql-reference/data-types/string.md)) — 配额名称。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 配额 ID。
- `storage`([String](../../sql-reference/data-types/string.md)) — 配额的存储位置。可能的值："users.xml" 表示在 users.xml 文件中配置的配额，"disk" 表示通过 SQL 查询配置的配额。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — 键用于指定配额在连接之间如何共享。如果两个连接使用相同的配额和键，它们共享同一资源配额。取值：
  - `[]` — 所有用户共享同一个配额。
  - `['user_name']` — 具有相同用户名的连接共享同一个配额。
  - `['ip_address']` — 来自相同 IP 地址的连接共享同一个配额。
  - `['client_key']` — 具有相同键的连接共享同一个配额。键必须由客户端显式提供。使用 [clickhouse-client](../../interfaces/cli.md) 时，在 `--quota_key` 参数中传递键值，或在客户端配置文件中使用 `quota_key` 参数。使用 HTTP 接口时，使用 `X-ClickHouse-Quota` 头部。
  - `['user_name', 'client_key']` — 具有相同 `client_key` 的连接共享同一个配额。如果客户端未提供键，则按 `user_name` 跟踪配额。
  - `['client_key', 'ip_address']` — 具有相同 `client_key` 的连接共享同一个配额。如果客户端未提供键，则按 `ip_address` 跟踪配额。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 以秒为单位的时间间隔长度。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值，指示配额适用于哪些用户。取值：
  - `0` — 配额应用于 `apply_to_list` 中指定的用户。
  - `1` — 配额应用于除 `apply_to_except` 中列出的用户之外的所有用户。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 应应用该配额的用户名/[角色](../../guides/sre/user-management/index.md#role-management)列表。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 不应应用该配额的用户名/角色列表。



## 另请参阅 {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
