---
description: "クォータに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/quotas
title: "system.quotas"
keywords: ["システムテーブル", "クォータ", "クォータ"]
---

[クォータ](../../operations/system-tables/quotas.md)に関する情報を含みます。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — クォータID。
- `storage`([String](../../sql-reference/data-types/string.md)) — クォータのストレージ。可能な値: "users.xml" は users.xml ファイルに設定されたクォータであり、"disk" は SQLクエリによって設定されたクォータです。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — キーはクォータがどのように共有されるかを指定します。2つの接続が同じクォータとキーを使用する場合、同じ量のリソースを共有します。値:
    - `[]` — すべてのユーザーが同じクォータを共有します。
    - `['user_name']` — 同じユーザー名の接続が同じクォータを共有します。
    - `['ip_address']` — 同じIPからの接続が同じクォータを共有します。
    - `['client_key']` — 同じキーの接続が同じクォータを共有します。キーはクライアントによって明示的に提供される必要があります。[clickhouse-client](../../interfaces/cli.md)を使用する場合、`--quota_key`パラメータでキー値を渡すか、クライアント構成ファイルの`quota_key`パラメータを使用します。HTTPインターフェースを使用する場合は、`X-ClickHouse-Quota`ヘッダーを使用します。
    - `['user_name', 'client_key']` — 同じ`client_key`の接続が同じクォータを共有します。クライアントによってキーが提供されていない場合、`user_name`のためにクォータが追跡されます。
    - `['client_key', 'ip_address']` — 同じ`client_key`の接続が同じクォータを共有します。クライアントによってキーが提供されていない場合、`ip_address`のためにクォータが追跡されます。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 秒単位の時間間隔の長さ。
- `apply_to_all` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 論理値。クォータが適用されるユーザーを示します。値:
    - `0` — クォータは`apply_to_list`で指定されたユーザーに適用されます。
    - `1` — クォータは`apply_to_except`にリストされたユーザーを除くすべてのユーザーに適用されます。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータが適用されるべきユーザー名/[役割](../../guides/sre/user-management/index.md#role-management)のリスト。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータが適用されないべきユーザー名/役割のリスト。

## 関連項目 {#see-also}

- [SHOW QUOTAS](../../sql-reference/statements/show.md#show-quotas-statement)
