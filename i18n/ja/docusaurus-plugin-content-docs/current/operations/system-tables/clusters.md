---
description: "設定ファイルに記載されているクラスタと、その中に定義されているサーバーに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/clusters
title: "クラスタ"
keywords: ["システムテーブル", "クラスタ"]
---

設定ファイルに記載されているクラスタと、その中にあるサーバーに関する情報を含みます。

カラム:

- `cluster` ([String](../../sql-reference/data-types/string.md)) — クラスタ名。
- `shard_num` ([UInt32](../../sql-reference/data-types/int-uint.md)) — クラスタ内のシャード番号、1から始まります。クラスタの変更によって変わる可能性があります。
- `shard_name` ([String](../../sql-reference/data-types/string.md)) — クラスタ内のシャードの名前。
- `shard_weight` ([UInt32](../../sql-reference/data-types/int-uint.md)) — データ書き込み時のシャードの相対的な重み。
- `replica_num` ([UInt32](../../sql-reference/data-types/int-uint.md)) — シャード内のレプリカ番号、1から始まります。
- `host_name` ([String](../../sql-reference/data-types/string.md)) — 設定ファイルに指定されたホスト名。
- `host_address` ([String](../../sql-reference/data-types/string.md)) — DNSから取得したホストのIPアドレス。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — サーバーに接続するために使用するポート。
- `is_local` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ホストがローカルかどうかを示すフラグ。
- `user` ([String](../../sql-reference/data-types/string.md)) — サーバーに接続するためのユーザー名。
- `default_database` ([String](../../sql-reference/data-types/string.md)) — デフォルトデータベース名。
- `errors_count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — このホストがレプリカに到達できなかった回数。
- `slowdowns_count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ヘッジ付きリクエストでの接続確立時にレプリカを変更させることになったスローダウンの回数。
- `estimated_recovery_time` ([UInt32](../../sql-reference/data-types/int-uint.md)) — レプリカのエラーカウントがゼロになり、正常に戻るまでの残り秒数。
- `database_shard_name` ([String](../../sql-reference/data-types/string.md)) — `Replicated` データベースシャードの名前（`Replicated` データベースに属するクラスタ用）。
- `database_replica_name` ([String](../../sql-reference/data-types/string.md)) — `Replicated` データベースのレプリカ名（`Replicated` データベースに属するクラスタ用）。
- `is_active` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — `Replicated` データベースのレプリカのステータス（`Replicated` データベースに属するクラスタ用）：1は「レプリカはオンライン」、0は「レプリカはオフライン」、`NULL`は「不明」。
- `name` ([String](../../sql-reference/data-types/string.md)) - クラスタのエイリアス。

**例**

クエリ:

```sql
SELECT * FROM system.clusters LIMIT 2 FORMAT Vertical;
```

結果:

```text
行 1:
──────
cluster:                 test_cluster_two_shards
shard_num:               1
shard_name:              shard_01
shard_weight:            1
replica_num:             1
host_name:               127.0.0.1
host_address:            127.0.0.1
port:                    9000
is_local:                1
user:                    default
default_database:
errors_count:            0
slowdowns_count:         0
estimated_recovery_time: 0
database_shard_name:
database_replica_name:
is_active:               NULL

行 2:
──────
cluster:                 test_cluster_two_shards
shard_num:               2
shard_name:              shard_02
shard_weight:            1
replica_num:             1
host_name:               127.0.0.2
host_address:            127.0.0.2
port:                    9000
is_local:                0
user:                    default
default_database:
errors_count:            0
slowdowns_count:         0
estimated_recovery_time: 0
database_shard_name:
database_replica_name:
is_active:               NULL
```

**関連項目**

- [テーブルエンジン Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap 設定](../../operations/settings/settings.md#distributed_replica_error_cap)
- [distributed_replica_error_half_life 設定](../../operations/settings/settings.md#distributed_replica_error_half_life)
