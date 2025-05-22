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

[クォータ](../../operations/system-tables/quotas.md)に関する情報を含みます。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — クォータID。
- `storage`([String](../../sql-reference/data-types/string.md)) — クォータのストレージ。可能な値: "users.xml"（users.xmlファイルに設定されたクォータ）、"disk"（SQLクエリで設定されたクォータ）。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — キーは、クォータの共有方法を指定します。二つの接続が同じクォータとキーを使用する場合、リソースを同じ量だけ共有します。値:
    - `[]` — すべてのユーザーが同じクォータを共有します。
    - `['user_name']` — 同じユーザー名を持つ接続は同じクォータを共有します。
    - `['ip_address']` — 同じIPからの接続は同じクォータを共有します。
    - `['client_key']` — 同じキーを持つ接続は同じクォータを共有します。キーはクライアントによって明示的に提供される必要があります。[clickhouse-client](../../interfaces/cli.md)を使用する際は、`--quota_key`パラメータでキーの値を渡すか、クライアント設定ファイルで`quota_key`パラメータを使用します。HTTPインターフェースを使用する際は、`X-ClickHouse-Quota`ヘッダーを使用します。
    - `['user_name', 'client_key']` — 同じ`client_key`を持つ接続は同じクォータを共有します。クライアントによってキーが提供されていない場合、クォータは`user_name`に対して追跡されます。
    - `['client_key', 'ip_address']` — 同じ`client_key`を持つ接続は同じクォータを共有します。クライアントによってキーが提供されていない場合、クォータは`ip_address`に対して追跡されます。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 時間間隔の長さ（秒単位）。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。クォータが適用されるユーザーを示します。値:
    - `0` — クォータは`apply_to_list`に指定されたユーザーに適用されます。
    - `1` — クォータは`apply_to_except`にリストされているユーザーを除くすべてのユーザーに適用されます。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータが適用されるユーザー名/[ロール](../../guides/sre/user-management/index.md#role-management)のリスト。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータが適用されないユーザー名/ロールのリスト。

## See Also {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
