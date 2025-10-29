---
'description': 'システムテーブルに関する情報が含まれています quotas.'
'keywords':
- 'system table'
- 'quotas'
- 'quota'
'slug': '/operations/system-tables/quotas'
'title': 'system.quotas'
'doc_type': 'reference'
---



# system.quotas

[クォータ](../../operations/system-tables/quotas.md)に関する情報を含んでいます。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — クォータID。
- `storage`([String](../../sql-reference/data-types/string.md)) — クォータのストレージ。可能な値: "users.xml" は users.xml ファイルに設定されたクォータ、"disk" は SQL クエリによって設定されたクォータを示します。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — クォータがどのように共有されるかを指定するキーです。同じクォータとキーを使用する2つの接続は、同じリソース量を共有します。値:
  - `[]` — すべてのユーザーが同じクォータを共有します。
  - `['user_name']` — 同じユーザー名を持つ接続が同じクォータを共有します。
  - `['ip_address']` — 同じIPからの接続が同じクォータを共有します。
  - `['client_key']` — 同じキーを持つ接続が同じクォータを共有します。キーはクライアントによって明示的に提供される必要があります。[clickhouse-client](../../interfaces/cli.md)を使用する場合は、`--quota_key` パラメータにキー値を渡すか、クライアント設定ファイルの `quota_key` パラメータを使用します。HTTPインターフェースを使用する場合は、`X-ClickHouse-Quota` ヘッダーを使用します。
  - `['user_name', 'client_key']` — 同じ `client_key` を持つ接続が同じクォータを共有します。キーがクライアントによって提供されていない場合、クォータは `user_name` に対して追跡されます。
  - `['client_key', 'ip_address']` — 同じ `client_key` を持つ接続が同じクォータを共有します。キーがクライアントによって提供されていない場合、クォータは `ip_address` に対して追跡されます。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 秒単位の時間間隔の長さ。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。どのユーザーにクォータが適用されるかを示します。値:
  - `0` — クォータは `apply_to_list` に指定されたユーザーに適用されます。
  - `1` — クォータは `apply_to_except` にリストされていないすべてのユーザーに適用されます。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータが適用されるユーザー名/[ロール](../../guides/sre/user-management/index.md#role-management)のリスト。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータが適用されないユーザー名/ロールのリスト。

## See Also {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
