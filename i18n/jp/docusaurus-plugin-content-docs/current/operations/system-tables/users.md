---
'description': 'System table containing a list of user accounts configured on the
  server.'
'keywords':
- 'system table'
- 'users'
'slug': '/operations/system-tables/users'
'title': 'system.users'
---




# system.users

サーバー上に構成された [ユーザーアカウント](../../guides/sre/user-management/index.md#user-account-management) のリストが含まれています。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — ユーザー名。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — ユーザーID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — ユーザーのストレージへのパス。 `access_control_path` パラメータで構成されます。

- `auth_type` ([Enum8](../../sql-reference/data-types/enum.md)('no_password' = 0, 'plaintext_password' = 1, 'sha256_password' = 2, 'double_sha1_password' = 3, 'ldap' = 4, 'kerberos' = 5, 'ssl_certificate' = 6, 'bcrypt_password' = 7)) — 認証タイプを示します。ユーザー識別の方法はいくつかあります: パスワードなし、プレーンテキストパスワード、[SHA256](https://en.wikipedia.org/wiki/SHA-2) エンコードされたパスワード、[ダブルSHA-1](https://en.wikipedia.org/wiki/SHA-1) エンコードされたパスワード、または [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) エンコードされたパスワード。

- `auth_params` ([String](../../sql-reference/data-types/string.md)) — `auth_type` に応じたJSON形式の認証パラメータ。

- `host_ip` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ClickHouseサーバーに接続を許可されたホストのIPアドレス。

- `host_names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ClickHouseサーバーに接続を許可されたホストの名前。

- `host_names_regexp` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ClickHouseサーバーに接続を許可されたホスト名のための正規表現。

- `host_names_like` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — LIKE述語を使用して設定されたClickHouseサーバーに接続を許可されたホストの名前。

- `default_roles_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — ユーザーにデフォルトで設定されたすべての付与されたロールを示します。

- `default_roles_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — デフォルトで付与されたロールのリスト。

- `default_roles_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — リストされたものを除くデフォルトで設定されたすべての付与されたロール。

## See Also {#see-also}

- [SHOW USERS](/sql-reference/statements/show#show-users)
