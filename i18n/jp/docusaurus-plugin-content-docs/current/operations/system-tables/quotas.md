---
description: 'クォータ情報を含むシステムテーブル。'
keywords: ['システムテーブル', 'クォータ', 'クォータ']
slug: /operations/system-tables/quotas
title: 'system.quotas'
doc_type: 'reference'
---



# system.quotas

[quota](../../operations/system-tables/quotas.md) に関する情報を含みます。

Columns:
- `name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — クォータ ID。
- `storage`([String](../../sql-reference/data-types/string.md)) — クォータの保存先。取り得る値: users.xml ファイルでクォータが設定されている場合は "users.xml"、SQL クエリでクォータが設定されている場合は "disk"。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — クォータの共有方法を指定するキー。同じクォータとキーを使用する 2 つの接続は、同じリソース量を共有します。値:
  - `[]` — すべてのユーザーが同じクォータを共有する。
  - `['user_name']` — 同じユーザー名での接続が同じクォータを共有する。
  - `['ip_address']` — 同じ IP からの接続が同じクォータを共有する。
  - `['client_key']` — 同じキーを持つ接続が同じクォータを共有する。キーはクライアントから明示的に指定する必要があります。[clickhouse-client](../../interfaces/cli.md) を使用する場合、`--quota_key` パラメータでキー値を渡すか、クライアント設定ファイルで `quota_key` パラメータを使用します。HTTP インターフェイスを使用する場合は、`X-ClickHouse-Quota` ヘッダーを使用します。
  - `['user_name', 'client_key']` — 同じ `client_key` を持つ接続が同じクォータを共有する。クライアントからキーが提供されない場合、クォータは `user_name` ごとに追跡される。
  - `['client_key', 'ip_address']` — 同じ `client_key` を持つ接続が同じクォータを共有する。クライアントからキーが提供されない場合、クォータは `ip_address` ごとに追跡される。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 秒単位の時間間隔の長さ。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。どのユーザーにクォータが適用されるかを示します。値:
  - `0` — クォータは `apply_to_list` で指定されたユーザーに適用される。
  - `1` — クォータは `apply_to_except` に列挙されたユーザーを除くすべてのユーザーに適用される。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータを適用するユーザー名/[ロール](../../guides/sre/user-management/index.md#role-management) の一覧。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータを適用しないユーザー名/ロールの一覧。



## 関連項目 {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
