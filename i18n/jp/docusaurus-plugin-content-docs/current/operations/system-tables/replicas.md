---
'description': 'System table containing information about and status of replicated
  tables residing on the local server. Useful for monitoring.'
'keywords':
- 'system table'
- 'replicas'
'slug': '/operations/system-tables/replicas'
'title': 'system.replicas'
---




# system.replicas

ローカルサーバー上のレプリケートされたテーブルに関する情報とステータスを含みます。
このテーブルは監視に使用できます。テーブルには、すべてのReplicated\*テーブルの行が含まれます。

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
    複数のレプリカが同時にリーダーになることができます。レプリカは、`merge_tree`設定`replicated_can_become_leader`を使用してリーダーにならないようにすることができます。リーダーはバックグラウンドマージをスケジューリングする責任があります。
    リーダーであるかどうかにかかわらず、利用可能でZKにセッションがある任意のレプリカに対して書き込みが行えます。
- `can_become_leader` (`UInt8`) - レプリカがリーダーになることができるかどうか。
- `is_readonly` (`UInt8`) - レプリカが読み取り専用モードであるかどうか。
    このモードは、設定にClickHouse Keeperのセクションがない場合、ClickHouse Keeperでのセッション再初期化時に未知のエラーが発生した場合、およびClickHouse Keeperでのセッション再初期化中に有効になります。
- `is_session_expired` (`UInt8`) - ClickHouse Keeperとのセッションが期限切れになりました。基本的には`is_readonly`と同じです。
- `future_parts` (`UInt32`) - 未完成のINSERTまたはマージの結果として現れるデータパーツの数。
- `parts_to_check` (`UInt32`) - 検証のためのキューにあるデータパーツの数。パーツに損傷の疑いがある場合、そのパーツは検証キューに入れられます。
- `zookeeper_path` (`String`) - ClickHouse Keeper内のテーブルデータへのパス。
- `replica_name` (`String`) - ClickHouse Keeper内のレプリカ名。同じテーブルの異なるレプリカは異なる名前を持ちます。
- `replica_path` (`String`) - ClickHouse Keeper内のレプリカデータへのパス。'zookeeper_path/replicas/replica_path'を結合したものと同じです。
- `columns_version` (`Int32`) - テーブル構造のバージョン番号。ALTERが何回実行されたかを示します。レプリカが異なるバージョンを持っている場合、いくつかのレプリカがすべてのALTERをまだ適用していないことを意味します。
- `queue_size` (`UInt32`) - 実行待ちの操作のためのキューのサイズ。操作にはデータブロックの挿入、マージ、一部のその他のアクションが含まれます。通常、これは`future_parts`と一致します。
- `inserts_in_queue` (`UInt32`) - 実行する必要があるデータブロックの挿入数。挿入は通常、比較的迅速にレプリケートされます。この数が大きい場合、何か問題があることを意味します。
- `merges_in_queue` (`UInt32`) - 実行待ちのマージの数。マージは長くなることがあるため、この値が長時間0より大きいままである可能性があります。
- `part_mutations_in_queue` (`UInt32`) - 実行待ちの変異の数。
- `queue_oldest_time` (`DateTime`) - `queue_size`が0より大きい場合、最も古い操作がキューに追加された時間を示します。
- `inserts_oldest_time` (`DateTime`) - `queue_oldest_time`を参照してください
- `merges_oldest_time` (`DateTime`) - `queue_oldest_time`を参照してください
- `part_mutations_oldest_time` (`DateTime`) - `queue_oldest_time`を参照してください

次の4つのカラムは、ZKとのアクティブなセッションがある場合にのみ非ゼロの値を持ちます。

- `log_max_index` (`UInt64`) - 一般的な活動のログ内の最大エントリ番号。
- `log_pointer` (`UInt64`) - レプリカがその実行キューにコピーした一般的な活動のログ内の最大エントリ番号に1を加えたもの。`log_pointer`が`log_max_index`よりもかなり小さい場合、何か問題があります。
- `last_queue_update` (`DateTime`) - 最後にキューが更新された時間。
- `absolute_delay` (`UInt64`) - 現在のレプリカの遅延の大きさ（秒単位）。
- `total_replicas` (`UInt8`) - このテーブルの知られているレプリカの合計数。
- `active_replicas` (`UInt8`) - ClickHouse Keeperにセッションを持つこのテーブルのレプリカの数（つまり、機能しているレプリカの数）。
- `lost_part_count` (`UInt64`) - テーブルの作成以来、すべてのレプリカで失われたデータパーツの数。この値はClickHouse Keeperに永続化され、増加することしかありません。
- `last_queue_update_exception` (`String`) - キューに壊れたエントリが含まれている場合。特に、ClickHouseがバージョン間で後方互換性を壊すとき、より新しいバージョンによって書き込まれたログエントリが古いバージョンによって解析できない場合に重要です。
- `zookeeper_exception` (`String`) - ClickHouse Keeperから情報を取得するときにエラーが発生した場合に得られる最後の例外メッセージ。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — レプリカ名とレプリカのアクティブ状態のマップ。

すべてのカラムをリクエストすると、各行に対してClickHouse Keeperからの読み取りが行われるため、テーブルは少し遅く動作する可能性があります。
最後の4つのカラム（log_max_index、log_pointer、total_replicas、active_replicas）をリクエストしなければ、テーブルは迅速に動作します。

例えば、次のようにしてすべてが正しく動作しているか確認できます:

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

このクエリが何も返さない場合、すべては正常です。
