---
'description': '系统表包含有关配额的信息。'
'keywords':
- 'system table'
- 'quotas'
- 'quota'
'slug': '/operations/system-tables/quotas'
'title': 'system.quotas'
'doc_type': 'reference'
---


# system.quotas

包含有关 [配额](../../operations/system-tables/quotas.md) 的信息。

列：
- `name` ([String](../../sql-reference/data-types/string.md)) — 配额名称。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 配额 ID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — 配额的存储。可能的值：如果在 users.xml 文件中配置了配额，则为 "users.xml"；如果通过 SQL 查询配置了配额，则为 "disk"。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — 关键字指定配额应如何共享。如果两个连接使用相同的配额和关键字，则它们共享相同数量的资源。值：
  - `[]` — 所有用户共享相同的配额。
  - `['user_name']` — 同一用户名的连接共享相同的配额。
  - `['ip_address']` — 来自同一 IP 的连接共享相同的配额。
  - `['client_key']` — 具有相同关键字的连接共享相同的配额。关键字必须由客户端明确提供。当使用 [clickhouse-client](../../interfaces/cli.md) 时，在 `--quota_key` 参数中传递关键字值，或在客户端配置文件中使用 `quota_key` 参数。当使用 HTTP 接口时，使用 `X-ClickHouse-Quota` 头。
  - `['user_name', 'client_key']` — 具有相同 `client_key` 的连接共享相同的配额。如果客户端没有提供关键字，则配额是为 `user_name` 进行跟踪。
  - `['client_key', 'ip_address']` — 具有相同 `client_key` 的连接共享相同的配额。如果客户端没有提供关键字，则配额是为 `ip_address` 进行跟踪。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 以秒为单位的时间间隔长度。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。它显示配额适用于哪些用户。值：
  - `0` — 配额适用于在 `apply_to_list` 中指定的用户。
  - `1` — 配额适用于除 `apply_to_except` 中列出之外的所有用户。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 应适用于配额的用户名/[角色](../../guides/sre/user-management/index.md#role-management) 列表。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 不应适用配额的用户名/角色列表。

## 另见 {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
