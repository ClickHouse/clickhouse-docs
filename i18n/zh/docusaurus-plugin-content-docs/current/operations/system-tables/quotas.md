---
'description': 'System table containing information about quotas.'
'keywords':
- 'system table'
- 'quotas'
- 'quota'
'slug': '/operations/system-tables/quotas'
'title': 'system.quotas'
---




# system.quotas

包含关于 [配额](../../operations/system-tables/quotas.md) 的信息。

列：
- `name` ([String](../../sql-reference/data-types/string.md)) — 配额名称。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 配额 ID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — 配额的存储。可能的值：如果配额在 users.xml 文件中配置，则为 "users.xml"；如果配额通过 SQL 查询配置，则为 "disk"。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — 键指定配额的共享方式。如果两个连接使用相同的配额和键，则它们共享相同的资源量。值：
    - `[]` — 所有用户共享相同的配额。
    - `['user_name']` — 具有相同用户名的连接共享相同的配额。
    - `['ip_address']` — 来自相同 IP 的连接共享相同的配额。
    - `['client_key']` — 具有相同键的连接共享相同的配额。key 必须由客户端显式提供。当使用 [clickhouse-client](../../interfaces/cli.md) 时，使用 `--quota_key` 参数传递键值，或在客户端配置文件中使用 `quota_key` 参数。当使用 HTTP 接口时，使用 `X-ClickHouse-Quota` 头。
    - `['user_name', 'client_key']` — 具有相同 `client_key` 的连接共享相同的配额。如果客户端没有提供键，则根据 `user_name` 跟踪配额。
    - `['client_key', 'ip_address']` — 具有相同 `client_key` 的连接共享相同的配额。如果客户端没有提供键，则根据 `ip_address` 跟踪配额。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 时间间隔长度（以秒为单位）。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。指示配额适用于哪些用户。值：
    - `0` — 配额适用于在 `apply_to_list` 中指定的用户。
    - `1` — 配额适用于所有用户，除了在 `apply_to_except` 中列出的人。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 配额应适用的用户名/[角色](../../guides/sre/user-management/index.md#role-management) 列表。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 配额不应适用的用户名/角色列表。

## 另请参阅 {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
