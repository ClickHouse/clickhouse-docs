---
description: 'ローカルサーバーに存在するレプリケートされたテーブルに関する情報とステータスを含むシステムテーブル。監視に役立ちます。'
keywords: ['system table', 'replicas']
slug: /operations/system-tables/replicas
title: 'system.replicas'
---


# system.replicas

ローカルサーバーに存在するレプリケートされたテーブルに関する情報とステータスを含みます。
このテーブルは監視に使用できます。テーブルは、各 Replicated\* テーブルの行を含んでいます。

例:

```sql
SELECT *
FROM system.replicas
WHERE table = 'test_table'
FORMAT Vertical
```

```text
クエリ ID: dc6dcbcb-dc28-4df9-ae27-4354f5b3b13e

行 1:
───────
database:                    db
table:                       test_table
engine:                      ReplicatedMergeTree
is_leader:                   1
can_become_leader:           1
is_readonly:                 0
is_session_expired:          0
future_parts:                0
parts_to_check:              0
zookeeper_path:              /test/test_table
replica_name:                r1
replica_path:                /test/test_table/replicas/r1
columns_version:             -1
queue_size:                  27
inserts_in_queue:            27
merges_in_queue:             0
part_mutations_in_queue:     0
queue_oldest_time:           2021-10-12 14:48:48
inserts_oldest_time:         2021-10-12 14:48:48
merges_oldest_time:          1970-01-01 03:00:00
part_mutations_oldest_time:  1970-01-01 03:00:00
oldest_part_to_get:          1_17_17_0
oldest_part_to_merge_to:
oldest_part_to_mutate_to:
log_max_index:               206
log_pointer:                 207
last_queue_update:           2021-10-12 14:50:08
absolute_delay:              99
total_replicas:              5
active_replicas:             5
lost_part_count:             0
last_queue_update_exception:
zookeeper_exception:
replica_is_active:           {'r1':1,'r2':1}
```

カラム:

- `database` (`String`) - データベース名
- `table` (`String`) - テーブル名
- `engine` (`String`) - テーブルエンジン名
- `is_leader` (`UInt8`) - レプリカがリーダーであるかどうか。
    複数のレプリカが同時にリーダーになることがあります。レプリカは、`merge_tree` 設定 `replicated_can_become_leader` を使用して、リーダーになることは防げます。リーダーはバックグラウンドマージのスケジュールを担当します。
    書き込みはリーダーにかかわらず、利用可能で ZK にセッションがある任意のレプリカに対して行うことができます。
- `can_become_leader` (`UInt8`) - レプリカがリーダーになれるかどうか。
- `is_readonly` (`UInt8`) - レプリカが読み取り専用モードであるかどうか。
    このモードは、設定に ClickHouse Keeper のセクションが含まれていない場合、ClickHouse Keeper でセッションの再初期化中に未知のエラーが発生した場合、ClickHouse Keeper でのセッションの再初期化中にオンになります。
- `is_session_expired` (`UInt8`) - ClickHouse Keeper とのセッションが期限切れです。基本的には `is_readonly` と同じです。
- `future_parts` (`UInt32`) - まだ実行されていない INSERT やマージの結果として出現するデータパーツの数。
- `parts_to_check` (`UInt32`) - 検証のためキューにあるデータパーツの数。パーツはダメージが疑われる場合、検証キューに入れられます。
- `zookeeper_path` (`String`) - ClickHouse Keeper におけるテーブルデータのパス。
- `replica_name` (`String`) - ClickHouse Keeper におけるレプリカ名。同じテーブルの異なるレプリカは異なる名前を持ちます。
- `replica_path` (`String`) - ClickHouse Keeper におけるレプリカデータのパス。これは 'zookeeper_path/replicas/replica_path' を連結するのと同じです。
- `columns_version` (`Int32`) - テーブル構造のバージョン番号。ALTER が何回行われたかを示します。レプリカのバージョンが異なる場合、一部のレプリカがすべての ALTER をまだ実行していないことを意味します。
- `queue_size` (`UInt32`) - 実行待ちの操作のキューのサイズ。操作にはデータブロックの挿入、マージ、および特定のその他のアクションが含まれます。通常は `future_parts` と一致します。
- `inserts_in_queue` (`UInt32`) - 実行する必要があるデータブロックの挿入数。挿入は通常、非常に迅速にレプリケートされています。この数が大きい場合、何かおかしいことを意味します。
- `merges_in_queue` (`UInt32`) - 実行待ちのマージの数。時々マージが長くなることがあるため、この値が長い間ゼロより大きい場合があります。
- `part_mutations_in_queue` (`UInt32`) - 実行待ちのミューテーションの数。
- `queue_oldest_time` (`DateTime`) - `queue_size` が 0 より大きい場合、最も古い操作がキューに追加された時刻を示します。
- `inserts_oldest_time` (`DateTime`) - `queue_oldest_time` を参照
- `merges_oldest_time` (`DateTime`) - `queue_oldest_time` を参照
- `part_mutations_oldest_time` (`DateTime`) - `queue_oldest_time` を参照

次の4つのカラムは、ZK とのアクティブなセッションがある場合のみ、非ゼロの値を持ちます。

- `log_max_index` (`UInt64`) - 一般的な活動のログにおける最大エントリ番号。
- `log_pointer` (`UInt64`) - レプリカが実行キューにコピーした一般的な活動のログにおける最大エントリ番号に 1 を加えたもの。`log_pointer` が `log_max_index` よりも大幅に小さい場合、何かおかしいことを意味します。
- `last_queue_update` (`DateTime`) - キューが最後に更新された時刻。
- `absolute_delay` (`UInt64`) - 現在のレプリカの遅延の大きさ（秒）。
- `total_replicas` (`UInt8`) - このテーブルの全てのレプリカの総数。
- `active_replicas` (`UInt8`) - ClickHouse Keeper にセッションがあるこのテーブルのレプリカの数（つまり、機能しているレプリカの数）。
- `lost_part_count` (`UInt64`) - テーブルのすべてのレプリカで失われたデータパーツの総数。テーブル作成以降の増加のみが許可されています。
- `last_queue_update_exception` (`String`) - キューに壊れたエントリが含まれているとき。特に、ClickHouse がバージョン間で後方互換性を壊し、新しいバージョンで書き込まれたログエントリが古いバージョンで解析できない場合に重要です。
- `zookeeper_exception` (`String`) - ClickHouse Keeper から情報を取得する際にエラーが発生した場合の最後の例外メッセージ。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — レプリカ名とレプリカがアクティブであるかのマップ。

すべてのカラムをリクエストすると、各行に対して ClickHouse Keeper から複数の読み取りが行われるため、テーブルは少し遅く動作する場合があります。
最後の4つのカラム（log_max_index, log_pointer, total_replicas, active_replicas）をリクエストしない場合、テーブルは迅速に動作します。

例えば、すべてが正常に機能しているかを次のように確認できます:

```sql
SELECT
    database,
    table,
    is_leader,
    is_readonly,
    is_session_expired,
    future_parts,
    parts_to_check,
    columns_version,
    queue_size,
    inserts_in_queue,
    merges_in_queue,
    log_max_index,
    log_pointer,
    total_replicas,
    active_replicas
FROM system.replicas
WHERE
       is_readonly
    OR is_session_expired
    OR future_parts > 20
    OR parts_to_check > 10
    OR queue_size > 20
    OR inserts_in_queue > 10
    OR log_max_index - log_pointer > 10
    OR total_replicas < 2
    OR active_replicas < total_replicas
```

このクエリが何も返さなければ、すべてが正常であることを意味します。
