---
description: "クォータに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/quotas
title: "system.quotas"
keywords: ["システムテーブル", "クォータ", "クォータ"]
---

クォータに関する情報を含みます。[quotas](../../operations/system-tables/quotas.md)。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — クォータID。
- `storage`([String](../../sql-reference/data-types/string.md)) — クォータのストレージ。可能な値: users.xmlファイルで設定された場合は "users.xml"、SQLクエリによって設定された場合は "disk"。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — キーはクォータがどのように共有されるべきかを指定します。同じクォータとキーを使用する2つの接続は、同じリソース量を共有します。値:
    - `[]` — すべてのユーザーが同じクォータを共有します。
    - `['user_name']` — 同じユーザー名の接続が同じクォータを共有します。
    - `['ip_address']` — 同じIPからの接続が同じクォータを共有します。
    - `['client_key']` — 同じキーを持つ接続が同じクォータを共有します。キーはクライアントによって明示的に提供される必要があります。[clickhouse-client](../../interfaces/cli.md)を使用する場合、`--quota_key`パラメータにキー値を渡すか、クライアント設定ファイルの`quota_key`パラメータを使用します。HTTPインターフェースを使用する場合は、`X-ClickHouse-Quota`ヘッダーを使用します。
    - `['user_name', 'client_key']` — 同じ`client_key`を持つ接続が同じクォータを共有します。クライアントによってキーが提供されていない場合、クォータは`user_name`に対してトラッキングされます。
    - `['client_key', 'ip_address']` — 同じ`client_key`を持つ接続が同じクォータを共有します。クライアントによってキーが提供されていない場合、クォータは`ip_address`に対してトラッキングされます。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 秒単位の時間間隔の長さ。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — ロジカル値。クォータが適用されるユーザーを示します。値:
    - `0` — クォータは`apply_to_list`で指定されたユーザーに適用されます。
    - `1` — クォータは`apply_to_except`にリストされているユーザー以外のすべてのユーザーに適用されます。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータを適用すべきユーザー名/[roles](../../guides/sre/user-management/index.md#role-management)のリスト。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータを適用しないべきユーザー名/rolesのリスト。

## See Also {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
