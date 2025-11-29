---
description: 'クォータに関する情報を含むシステムテーブル。'
keywords: ['system テーブル', 'クォータ', 'quota']
slug: /operations/system-tables/quotas
title: 'system.quotas'
doc_type: 'reference'
---



# system.quotas {#systemquotas}

[クォータ](../../operations/system-tables/quotas.md)に関する情報を含みます。

Columns:
- `name` ([String](../../sql-reference/data-types/string.md)) — クォータ名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — クォータID。
- `storage`([String](../../sql-reference/data-types/string.md)) — クォータのストレージ。可能な値: クォータが users.xml ファイルで設定されている場合は "users.xml"、SQL クエリで設定されている場合は "disk"。
- `keys` ([Array](../../sql-reference/data-types/array.md)([Enum8](../../sql-reference/data-types/enum.md))) — クォータをどのように共有するかを指定するキー。同じクォータとキーを使用する 2 つの接続は、同じ量のリソースを共有します。値:
  - `[]` — すべてのユーザーが同じクォータを共有します。
  - `['user_name']` — 同じユーザー名の接続が同じクォータを共有します。
  - `['ip_address']` — 同一 IP からの接続が同じクォータを共有します。
  - `['client_key']` — 同じキーを持つ接続が同じクォータを共有します。キーはクライアントによって明示的に指定する必要があります。[clickhouse-client](../../interfaces/cli.md) を使用する場合は、`--quota_key` パラメータでキー値を渡すか、クライアント構成ファイル内で `quota_key` パラメータを使用します。HTTP インターフェイスを使用する場合は、`X-ClickHouse-Quota` ヘッダーを使用します。
  - `['user_name', 'client_key']` — 同じ `client_key` を持つ接続が同じクォータを共有します。キーがクライアントによって指定されない場合、クォータは `user_name` ごとに追跡されます。
  - `['client_key', 'ip_address']` — 同じ `client_key` を持つ接続が同じクォータを共有します。キーがクライアントによって指定されない場合、クォータは `ip_address` ごとに追跡されます。
- `durations` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 秒単位の時間間隔の長さ。
- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 論理値。クォータがどのユーザーに適用されるかを示します。値:
  - `0` — クォータは `apply_to_list` で指定されたユーザーに適用されます。
  - `1` — クォータは `apply_to_except` に列挙されたユーザーを除くすべてのユーザーに適用されます。
- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータを適用するユーザー名/[ロール](../../guides/sre/user-management/index.md#role-management)のリスト。
- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — クォータを適用しないユーザー名/ロールのリスト。



## 関連項目 {#see-also}

- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)
