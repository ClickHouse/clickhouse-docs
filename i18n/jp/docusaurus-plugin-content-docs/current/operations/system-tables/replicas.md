---
description: 'ローカルサーバー上に存在するレプリケートされたテーブルの情報とステータスを含む system テーブル。監視に役立ちます。'
keywords: ['system table', 'レプリカ']
slug: /operations/system-tables/replicas
title: 'system.replicas'
doc_type: 'reference'
---

# system.replicas

ローカルサーバー上に存在するレプリケートテーブルに関する情報およびステータスを含みます。
このテーブルは監視に利用できます。テーブルには、各 `Replicated*` テーブルにつき 1 行が含まれます。

例:

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
- `is_leader` (`UInt8`) - レプリカがリーダーかどうか。
    複数のレプリカが同時にリーダーになることがあります。`merge_tree` 設定 `replicated_can_become_leader` を使用して、レプリカがリーダーになるのを禁止できます。リーダーはバックグラウンドマージのスケジューリングを担当します。
    書き込みは、リーダーかどうかにかかわらず、利用可能で ZK にセッションを持つ任意のレプリカに対して実行できることに注意してください。
- `can_become_leader` (`UInt8`) - レプリカがリーダーになれるかどうか。
- `is_readonly` (`UInt8`) - レプリカが読み取り専用モードかどうか。
    このモードは、設定に ClickHouse Keeper のセクションが存在しない場合、ClickHouse Keeper でセッションを再初期化する際に不明なエラーが発生した場合、または ClickHouse Keeper でセッションを再初期化している間に有効になります。
- `is_session_expired` (`UInt8`) - ClickHouse Keeper とのセッションが期限切れになっているかどうか。基本的には `is_readonly` と同じです。
- `future_parts` (`UInt32`) - まだ実行されていない INSERT またはマージの結果として出現するデータパーツの数。
- `parts_to_check` (`UInt32`) - 検証キューに入っているデータパーツの数。パーツが破損している疑いがある場合、そのパーツは検証キューに入れられます。
- `zookeeper_path` (`String`) - ClickHouse Keeper におけるテーブルデータへのパス。
- `replica_name` (`String`) - ClickHouse Keeper におけるレプリカ名。同じテーブルの異なるレプリカは異なる名前を持ちます。
- `replica_path` (`String`) - ClickHouse Keeper におけるレプリカデータへのパス。'zookeeper_path/replicas/replica_path' を連結したものと同じです。
- `columns_version` (`Int32`) - テーブル構造のバージョン番号。何回 ALTER が実行されたかを示します。レプリカ間でバージョンが異なる場合、一部のレプリカがまだすべての ALTER を適用していないことを意味します。
- `queue_size` (`UInt32`) - 実行待ちの操作のキューサイズ。操作にはデータブロックの挿入、マージ、その他いくつかのアクションが含まれます。通常、`future_parts` と一致します。
- `inserts_in_queue` (`UInt32`) - 実行が必要なデータブロック挿入の数。挿入は通常かなり高速にレプリケートされます。この数が大きい場合、何か問題が発生している可能性があります。
- `merges_in_queue` (`UInt32`) - 実行待ちのマージの数。マージには時間がかかることがあるため、この値が長時間 0 より大きいままになることがあります。
- `part_mutations_in_queue` (`UInt32`) - 実行待ちのミューテーションの数。
- `queue_oldest_time` (`DateTime`) - `queue_size` が 0 より大きい場合、キューに追加された最古の操作の時刻を示します。
- `inserts_oldest_time` (`DateTime`) - `queue_oldest_time` を参照
- `merges_oldest_time` (`DateTime`) - `queue_oldest_time` を参照
- `part_mutations_oldest_time` (`DateTime`) - `queue_oldest_time` を参照

次の 4 列が 0 以外の値を持つのは、ZK とのアクティブなセッションが存在する場合のみです。

- `log_max_index` (`UInt64`) - 全体のアクティビティログ内の最大エントリ番号。
- `log_pointer` (`UInt64`) - レプリカが自身の実行キューにコピーした全体のアクティビティログ内の最大エントリ番号に 1 を加えた値。`log_pointer` が `log_max_index` よりかなり小さい場合、何か問題が発生している可能性があります。
- `last_queue_update` (`DateTime`) - キューが最後に更新された時刻。
- `absolute_delay` (`UInt64`) - 現在のレプリカが何秒遅延しているか。
- `total_replicas` (`UInt8`) - このテーブルの既知のレプリカの総数。
- `active_replicas` (`UInt8`) - ClickHouse Keeper にセッションを持つこのテーブルのレプリカの数（つまり、動作しているレプリカの数）。
- `lost_part_count` (`UInt64`) - テーブル作成以降、すべてのレプリカで合計してテーブル内で失われたデータパーツの数。この値は ClickHouse Keeper に永続化され、増加する一方です。
- `last_queue_update_exception` (`String`) - キューに破損したエントリが含まれている場合のメッセージ。特に、ClickHouse がバージョン間の後方互換性を壊し、新しいバージョンによって書き込まれたログエントリを古いバージョンが解釈できない場合に重要です。
- `zookeeper_exception` (`String`) - ClickHouse Keeper から情報を取得する際にエラーが発生した場合に記録される、直近の例外メッセージ。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — レプリカ名と、そのレプリカがアクティブかどうかを対応付けるマップ。

すべてのカラムを取得すると、各行ごとに ClickHouse Keeper への読み取りが複数回発生するため、テーブルの動作がやや遅くなる可能性があります。
最後の 4 カラム（log&#95;max&#95;index、log&#95;pointer、total&#95;replicas、active&#95;replicas）を取得しない場合、テーブルは高速に動作します。

たとえば、次のようにして正常に動作しているかを確認できます。

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

このクエリが何も返さなければ、問題ありません。
