---
description: 'クォータに関する情報を含むシステムテーブル。'
keywords: ['システムテーブル', 'クォータ', 'クォータ']
slug: /operations/system-tables/quotas
title: 'system.quotas'
---


# system.quotas

[クォータ](../../operations/system-tables/quotas.md)に関する情報を含みます。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — クォータID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — クォータのストレージ。可能な値: "users.xml" は users.xml ファイルで構成されたクォータ、"disk" は SQLクエリによって構成されたクォータを示します。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — クォータがどのように共有されるかを指定するキー。2つの接続が同じクォータとキーを使用している場合、同じリソース量を共有します。値:
    - `[]` — すべてのユーザーが同じクォータを共有します。
    - `['user_name']` — 同じユーザー名の接続が同じクォータを共有します。
    - `['ip_address']` — 同じIPからの接続が同じクォータを共有します。
    - `['client_key']` — 同じキーの接続が同じクォータを共有します。キーはクライアントによって明示的に指定する必要があります。 [clickhouse-client](../../interfaces/cli.md) を使用する場合、`--quota_key` パラメータにキー値を渡すか、クライアント設定ファイルの `quota_key` パラメータを使用します。HTTPインターフェースを使用する場合は、`X-ClickHouse-Quota` ヘッダーを使用します。
    - `['user_name', 'client_key']` — 同じ `client_key` の接続が同じクォータを共有します。キーがクライアントによって提供されていない場合、クォータは `user_name` に対して追跡されます。
    - `['client_key', 'ip_address']` — 同じ `client_key` の接続が同じクォータを共有します。キーがクライアントによって提供されていない場合、クォータは `ip_address` に対して追跡されます。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 秒単位の時間間隔の長さ。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。クォータが適用されるユーザーを示します。値:
    - `0` — クォータは `apply_to_list` で指定されたユーザーに適用されます。
    - `1` — クォータは `apply_to_except` にリストされているユーザーを除くすべてのユーザーに適用されます。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータが適用されるユーザー名/[役割](../../guides/sre/user-management/index.md#role-management)のリスト。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータが適用されないユーザー名/役割のリスト。

## See Also {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
