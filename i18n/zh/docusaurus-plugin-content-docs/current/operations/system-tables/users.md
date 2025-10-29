---
'description': '系统表包含在服务器上配置的用户帐户列表。'
'keywords':
- 'system table'
- 'users'
'slug': '/operations/system-tables/users'
'title': 'system.users'
'doc_type': 'reference'
---


# system.users

包含在服务器上配置的 [用户帐户](../../guides/sre/user-management/index.md#user-account-management) 列表。

列：
- `name` ([String](../../sql-reference/data-types/string.md)) — 用户名。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 用户ID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 用户存储的路径。配置在 `access_control_path` 参数中。

- `auth_type` ([Enum8](../../sql-reference/data-types/enum.md)('no_password' = 0, 'plaintext_password' = 1, 'sha256_password' = 2, 'double_sha1_password' = 3, 'ldap' = 4, 'kerberos' = 5, 'ssl_certificate' = 6, 'bcrypt_password' = 7)) — 显示身份验证类型。用户识别的方式有多种：无密码、明文密码、[SHA256](https://en.wikipedia.org/wiki/SHA-2) 编码密码、[双 SHA-1](https://en.wikipedia.org/wiki/SHA-1) 编码密码或 [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 编码密码。

- `auth_params` ([String](../../sql-reference/data-types/string.md)) — 根据 `auth_type` 的 JSON 格式的身份验证参数。

- `host_ip` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 允许连接到 ClickHouse 服务器的主机的 IP 地址。

- `host_names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 允许连接到 ClickHouse 服务器的主机名称。

- `host_names_regexp` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 允许连接到 ClickHouse 服务器的主机名称的正则表达式。

- `host_names_like` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 使用 LIKE 谓词设置的允许连接到 ClickHouse 服务器的主机名称。

- `default_roles_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示为用户默认设置的所有授予角色。

- `default_roles_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 默认提供的授予角色列表。

- `default_roles_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 所有默认设置的授予角色，排除了列出的角色。

## 另见 {#see-also}

- [SHOW USERS](/sql-reference/statements/show#show-users)
