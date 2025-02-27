---
description: "ローカルサーバー上のレプリケートされたテーブルに関する情報とステータスを含むシステムテーブル。監視に役立ちます。"
slug: /operations/system-tables/replicas
title: "レプリカ"
keywords: ["システムテーブル", "レプリカ"]
---

ローカルサーバーに存在するレプリケートされたテーブルに関する情報とステータスを含んでいます。  
このテーブルは監視に利用できます。テーブルは各 Replicated\* テーブルの行を含みます。

例:

``` sql
SELECT *
FROM system.replicas
WHERE table = 'test_table'
FORMAT Vertical
```

``` text
クエリID: dc6dcbcb-dc28-4df9-ae27-4354f5b3b13e

行 1:
───────
データベース:                    db
テーブル:                       test_table
エンジン:                      ReplicatedMergeTree
リーダーであるか:                   1
リーダーになれるか:           1
読み取り専用か:                 0
セッションが期限切れか:          0
将来のパーツ:                0
確認待ちのパーツ:              0
zookeeperパス:              /test/test_table
レプリカ名:                r1
レプリカパス:                /test/test_table/replicas/r1
カラムバージョン:             -1
キューサイズ:                  27
キュー内のインサート数:            27
キュー内のマージ数:             0
キュー内のパートミューテーション数:     0
キュー最古の時間:           2021-10-12 14:48:48
インサート最古の時間:         2021-10-12 14:48:48
マージ最古の時間:          1970-01-01 03:00:00
パートミューテーション最古の時間:  1970-01-01 03:00:00
取得すべき最古のパート:          1_17_17_0
マージ先の最古のパート:
ミューテーション先の最古のパート:
ログ最大インデックス:               206
ログポインタ:                 207
最後のキュー更新:           2021-10-12 14:50:08
絶対的な遅延:              99
総レプリカ数:              5
アクティブラプリーカ数:             5
失われたパート数:             0
最後のキュー更新例外:
zookeeper例外:
レプリカはアクティブ:           {'r1':1,'r2':1}
```

カラム:

- `database` (`String`) - データベース名
- `table` (`String`) - テーブル名
- `engine` (`String`) - テーブルエンジン名
- `is_leader` (`UInt8`) - レプリカがリーダーであるかどうか。
    複数のレプリカが同時にリーダーになることができます。`merge_tree`設定の`replicated_can_become_leader`を使用すると、レプリカがリーダーになることを防ぐことができます。リーダーはバックグラウンドマージのスケジューリングを担当します。  
    書き込みは、リーダーかどうかにかかわらず、利用可能でZKにセッションがある任意のレプリカに対して行えます。
- `can_become_leader` (`UInt8`) - レプリカがリーダーになれるかどうか。
- `is_readonly` (`UInt8`) - レプリカが読み取り専用モードにあるかどうか。
    このモードは、構成にClickHouse Keeperのセクションがない場合、不明なエラーがClickHouse Keeperでのセッション再初期化時に発生した場合、およびClickHouse Keeperでのセッション再初期化中にオフになります。
- `is_session_expired` (`UInt8`) - ClickHouse Keeperとのセッションが期限切れです。基本的には`is_readonly`と同じです。
- `future_parts` (`UInt32`) - まだ実行されていないINSERTやマージの結果として現れるデータパーツの数。
- `parts_to_check` (`UInt32`) - 確認のためのキュー内のデータパーツの数。損傷の疑いがある場合、パートは確認キューに入れられます。
- `zookeeper_path` (`String`) - ClickHouse Keeper内のテーブルデータへのパス。
- `replica_name` (`String`) - ClickHouse Keeper内のレプリカ名。同じテーブルの異なるレプリカは異なる名前を持ちます。
- `replica_path` (`String`) - ClickHouse Keeper内のレプリカデータへのパス。'zookeeper_path/replicas/replica_path'の連結と同じです。
- `columns_version` (`Int32`) - テーブル構造のバージョン番号。ALTERが何回実行されたかを示します。レプリカが異なるバージョンを持っている場合、これは一部のレプリカがすべてのALTERをまだ行っていないことを意味します。
- `queue_size` (`UInt32`) - 実行待ちの操作のためのキューのサイズ。操作にはデータブロックの挿入、マージ、および特定の他のアクションが含まれます。通常、`future_parts`と一致します。
- `inserts_in_queue` (`UInt32`) - 作成する必要があるデータブロックの挿入数。挿入は通常かなり迅速にレプリケートされます。この数が大きい場合、何かが間違っています。
- `merges_in_queue` (`UInt32`) - 実行待ちのマージの数。時々、マージが長時間かかることがあるため、この値は長い間ゼロ以上のことがあります。
- `part_mutations_in_queue` (`UInt32`) - 実行待ちのミューテーションの数。
- `queue_oldest_time` (`DateTime`) - `queue_size`が0より大きい場合、キューに最も古い操作が追加された時間を示します。
- `inserts_oldest_time` (`DateTime`) - `queue_oldest_time`を参照
- `merges_oldest_time` (`DateTime`) - `queue_oldest_time`を参照
- `part_mutations_oldest_time` (`DateTime`) - `queue_oldest_time`を参照

次の4つのカラムは、ZKとのアクティブなセッションがある場合にのみゼロ以外の値を持ちます。

- `log_max_index` (`UInt64`) - 一般的な活動のログ内の最大エントリ番号。
- `log_pointer` (`UInt64`) - レプリカが実行キューにコピーした一般的な活動のログ内の最大エントリ番号プラス1。`log_pointer`が`log_max_index`よりもかなり小さい場合、何かが間違っています。
- `last_queue_update` (`DateTime`) - 最後にキューが更新された時間。
- `absolute_delay` (`UInt64`) - 現在のレプリカの遅延が何秒か。
- `total_replicas` (`UInt8`) - このテーブルの既知のレプリカの総数。
- `active_replicas` (`UInt8`) - ClickHouse Keeperにセッションを持つこのテーブルのレプリカの数（すなわち、動作しているレプリカの数）。
- `lost_part_count` (`UInt64`) - テーブル作成以来、すべてのレプリカで失われたデータパーツの数。値はClickHouse Keeperに保存され、増加することしかありません。
- `last_queue_update_exception` (`String`) - キューに壊れたエントリが含まれるとき。特に、ClickHouseがバージョン間で後方互換性を壊した場合や、新しいバージョンによって書き込まれたログエントリが古いバージョンで解析できない場合に重要です。
- `zookeeper_exception` (`String`) - ClickHouse Keeperから情報を取得中にエラーが発生した場合の最後の例外メッセージ。
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — レプリカ名とレプリカのアクティブ状態のマップ。

すべてのカラムを要求すると、各行に対してClickHouse Keeperから複数回読み取るため、テーブルは少し遅くなる可能性があります。  
最後の4つのカラム（log_max_index、log_pointer、total_replicas、active_replicas）を要求しない場合、テーブルは迅速に動作します。

たとえば、以下のようにしてすべてが正しく機能しているか確認できます。

``` sql
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
