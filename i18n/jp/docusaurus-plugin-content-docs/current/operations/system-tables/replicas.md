---
'description': 'ローカルサーバーに存在するレプリカテーブルに関する情報とステータスを含むシステムテーブル。監視に役立ちます。'
'keywords':
- 'system table'
- 'replicas'
'slug': '/operations/system-tables/replicas'
'title': 'system.replicas'
'doc_type': 'reference'
---


# system.replicas

ローカルサーバーに存在する複製テーブルの情報とステータスを含んでいます。
このテーブルは監視に使用できます。このテーブルには、すべてのReplicated\*テーブルに対して1行が含まれています。

例：

```sql
SELECT *
FROM system.replicas
WHERE table = 'test_table'
FORMAT Vertical
```

```text
Query id: dc6dcbcb-dc28-4df9-ae27-4354f5b3b13e

Row 1:
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

カラム：

- `database` (`String`) - データベース名
- `table` (`String`) - テーブル名
- `engine` (`String`) - テーブルエンジン名
- `is_leader` (`UInt8`) - レプリカがリーダーであるかどうか。
    複数のレプリカが同時にリーダーになれる場合があります。レプリカがリーダーになるのを防ぐには、`merge_tree`設定 `replicated_can_become_leader`を使用します。リーダーはバックグラウンドマージのスケジューリングを担当します。
    書き込みは、リーダーかどうかに関係なく、利用可能でZKにセッションがある任意のレプリカに対しておこなえます。
- `can_become_leader` (`UInt8`) - レプリカがリーダーになれるかどうか。
- `is_readonly` (`UInt8`) - レプリカが読み取り専用モードであるかどうか。
    このモードは、設定にClickHouse Keeperのセクションがない場合、ClickHouse Keeperでセッションを再初期化する際に未知のエラーが発生した場合、およびClickHouse Keeperでのセッション再初期化中にオンになります。
- `is_session_expired` (`UInt8`) - ClickHouse Keeperとのセッションが期限切れになったこと。基本的には`is_readonly`と同じです。
- `future_parts` (`UInt32`) - まだ行われていないINSERTやマージの結果として表示されるデータパーツの数。
- `parts_to_check` (`UInt32`) - 検証キューにあるデータパーツの数。パーツは、損傷の疑いがある場合に検証キューに入れられます。
- `zookeeper_path` (`String`) - ClickHouse Keeper内のテーブルデータへのパス。
- `replica_name` (`String`) - ClickHouse Keeper内のレプリカ名。同じテーブルの異なるレプリカは異なる名前を持ちます。
- `replica_path` (`String`) - ClickHouse Keeper内のレプリカデータへのパス。'zookeeper_path/replicas/replica_path'の連結と同じです。
- `columns_version` (`Int32`) - テーブル構造のバージョン番号。ALTERが何回行われたかを示します。レプリカのバージョンが異なる場合、いくつかのレプリカがすべてのALTERをまだ実行していないことを意味します。
- `queue_size` (`UInt32`) - 実行待ちの操作のキューサイズ。操作にはデータブロックの挿入、マージ、特定のその他のアクションが含まれます。通常、`future_parts`と一致します。
- `inserts_in_queue` (`UInt32`) - 実行する必要があるデータブロックの挿入数。挿入は通常かなり迅速に複製されます。この数が大きい場合、何か問題があることを意味します。
- `merges_in_queue` (`UInt32`) - 実行待ちのマージの数。時にはマージが長引くことがあるため、この値は長い間ゼロより大きいことがあります。
- `part_mutations_in_queue` (`UInt32`) - 実行待ちの変異の数。
- `queue_oldest_time` (`DateTime`) - `queue_size`が0より大きい場合、キューに最も古い操作が追加された時刻を示します。
- `inserts_oldest_time` (`DateTime`) - `queue_oldest_time`を参照
- `merges_oldest_time` (`DateTime`) - `queue_oldest_time`を参照
- `part_mutations_oldest_time` (`DateTime`) - `queue_oldest_time`を参照

次の4つのカラムは、ZKとのアクティブなセッションが存在する場合にのみ非ゼロの値を持ちます。

- `log_max_index` (`UInt64`) - 一般的なアクティビティのログの最大エントリ番号。
- `log_pointer` (`UInt64`) - レプリカが実行キューにコピーした一般的なアクティビティのログ内の最大エントリ番号に1を加えたもの。 `log_pointer`が`log_max_index`よりもずっと小さい場合、何か問題があります。
- `last_queue_update` (`DateTime`) - 最後にキューが更新された時刻。
- `absolute_delay` (`UInt64`) - 現在のレプリカが持つ遅延の大きさ（秒単位）。
- `total_replicas` (`UInt8`) - このテーブルの既知のレプリカの総数。
- `active_replicas` (`UInt8`) - ClickHouse Keeperにセッションがあるこのテーブルのレプリカの数（つまり、機能しているレプリカの数）。
- `lost_part_count` (`UInt64`) - テーブル作成以降にすべてのレプリカで失われたデータパーツの数。値はClickHouse Keeperに永続化され、増加し続けます。
- `last_queue_update_exception` (`String`) - キューが壊れたエントリを含む場合。特に、ClickHouseがバージョン間の後方互換性を壊した場合で、新しいバージョンによって記録されたログエントリが古いバージョンで解析できない場合に重要です。
- `zookeeper_exception` (`String`) - ClickHouse Keeperから情報を取得する際にエラーが発生した場合に受け取る最後の例外メッセージ。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — レプリカ名とレプリカのアクティブ状態のマップ。

すべてのカラムを要求すると、各行に対してClickHouse Keeperから数回の読み取りが行われるため、テーブルの動作が少し遅くなることがあります。
最後の4つのカラム（log_max_index、log_pointer、total_replicas、active_replicas）を要求しない場合、テーブルは迅速に動作します。

たとえば、次のようにしてすべてが正しく動作していることを確認できます：

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

このクエリが何も返さない場合、すべてが正常であることを意味します。
