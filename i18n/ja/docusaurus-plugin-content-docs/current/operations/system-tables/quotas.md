---
description: "クォータに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/quotas
title: "クォータ"
keywords: ["システムテーブル", "クォータ", "クォータ"]
---

[クォータ](../../operations/system-tables/quotas.md)に関する情報を含みます。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — クォータID。
- `storage`([String](../../sql-reference/data-types/string.md)) — クォータの保存場所。可能な値: "users.xml"（users.xmlファイルで設定されたクォータの場合）、"disk"（SQLクエリで設定されたクォータの場合）。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — キーはクォータの共有方法を指定します。2つの接続が同じクォータとキーを使用する場合、リソースは同じ量を共有します。値：
    - `[]` — すべてのユーザーが同じクォータを共有します。
    - `['user_name']` — 同じユーザー名を持つ接続は同じクォータを共有します。
    - `['ip_address']` — 同じIPからの接続は同じクォータを共有します。
    - `['client_key']` — 同じキーを持つ接続は同じクォータを共有します。キーはクライアントによって明示的に提供される必要があります。[clickhouse-client](../../interfaces/cli.md)を使用する場合、`--quota_key`パラメータでキーの値を渡すか、クライアント設定ファイルの`quota_key`パラメータを使用します。HTTPインターフェースを使用する場合は、`X-ClickHouse-Quota`ヘッダーを使用します。
    - `['user_name', 'client_key']` — 同じ`client_key`を持つ接続は同じクォータを共有します。クライアントによってキーが提供されない場合、クォータは`user_name`に対してトラッキングされます。
    - `['client_key', 'ip_address']` — 同じ`client_key`を持つ接続は同じクォータを共有します。クライアントによってキーが提供されない場合、クォータは`ip_address`に対してトラッキングされます。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 秒単位の時間間隔の長さ。
- `apply_to_all` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 論理値。このクォータが適用されるユーザーを示します。値：
    - `0` — クォータは`apply_to_list`で指定されたユーザーに適用されます。
    - `1` — クォータは`apply_to_except`でリストされたユーザーを除くすべてのユーザーに適用されます。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータを適用すべきユーザー名/[ロール](../../guides/sre/user-management/index.md#role-management)のリスト。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータを適用しないユーザー名/ロールのリスト。

## 参照 {#see-also}

- [SHOW QUOTAS](../../sql-reference/statements/show.md#show-quotas-statement)
