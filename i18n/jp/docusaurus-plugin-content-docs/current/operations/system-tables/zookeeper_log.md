---
description: 'リクエストのパラメータに関する情報と、ZooKeeperサーバーからの応答を含むシステムテーブル。'
keywords: ['system table', 'zookeeper_log']
slug: /operations/system-tables/zookeeper_log
title: 'system.zookeeper_log'
---


# system.zookeeper_log

このテーブルは、ZooKeeperサーバーへのリクエストのパラメータに関する情報と、その応答を含んでいます。

リクエストについては、リクエストパラメータがあるカラムのみが埋められ、残りのカラムはデフォルト値 (`0` または `NULL`) で埋められます。応答が到着すると、応答からのデータが他のカラムに追加されます。

リクエストパラメータのカラム：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeperクライアントのイベントタイプ。以下の値のいずれかを持つことができます：
    - `Request` — リクエストが送信されました。
    - `Response` — 応答が受信されました。
    - `Finalize` — 接続が失われ、応答が受信されませんでした。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日付。
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生した日付と時間。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — リクエストを行うために使用されたZooKeeperサーバーのIPアドレス。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — リクエストに使用されたZooKeeperサーバーのポート。
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeperサーバーが各接続に対して設定するセッションID。
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — セッション内のリクエストのID。これは通常、順次のリクエスト番号です。リクエスト行と対応する `response`/`finalize` 行で同じです。
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches) が設定されているかどうかのリクエスト。
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — リクエストまたは応答のタイプ。
- `path` ([String](../../sql-reference/data-types/string.md)) — リクエストで指定されたZooKeeperノードへのパス、またはパスの指定が不要な場合は空文字列。
- `data` ([String](../../sql-reference/data-types/string.md)) — ZooKeeperノードに書き込まれたデータ（`SET` および `CREATE` リクエストの場合 — リクエストが書き込もうとした内容、`GET` リクエストの応答の場合 — 読み取られた内容）または空文字列。
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeperノードが[エフェメラル](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes)として作成されるかどうか。
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeperノードが[シーケンシャル](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming)として作成されるかどうか。
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — リクエストが実行時に期待するZooKeeperノードのバージョン。これは `CHECK`, `SET`, `REMOVE` リクエストでサポートされています（バージョンをチェックしない場合は `-1` またはバージョンチェックをサポートしないその他のリクエストの場合は `NULL`）。
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの数（これは、いくつかの連続した通常のリクエストからなる特別なリクエストであり、それらを原子的に実行します）。マルチリクエストに含まれるすべてのリクエストは同じ `xid` を持ちます。
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの番号（マルチリクエストの場合は `0`、その後 `1`から順に）。

リクエスト応答パラメータのカラム：

- `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeperトランザクションID。成功裏に実行されたリクエストに応じてZooKeeperサーバーによって発行される系列番号（リクエストが実行されなかった/エラーを返した/クライアントがリクエストが実行されたかどうかわからない場合は `0`）。
- `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — エラーコード。いくつかの値を持つことができ、以下のいくつかを示します：
    - `ZOK` — リクエストが正常に実行されました。
    - `ZCONNECTIONLOSS` — 接続が失われました。
    - `ZOPERATIONTIMEOUT` — リクエスト実行のタイムアウトが期限切れになりました。
    - `ZSESSIONEXPIRED` — セッションが期限切れになりました。
    - `NULL` — リクエストが完了しました。
- `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch`イベントのタイプ（`op_num` = `Watch` の応答の場合）、他の応答の場合：`NULL`。
- `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch`イベントの状態（`op_num` = `Watch` の応答の場合）、他の応答の場合：`NULL`。
- `path_created` ([String](../../sql-reference/data-types/string.md)) — 作成されたZooKeeperノードへのパス（`CREATE` リクエストの応答の場合）、ノードが `sequential` として作成された場合、`path` と異なることがあります。
- `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの作成の原因となった変更の `zxid`。
- `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードを最後に変更した変更の `zxid`。
- `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子を最後に変更した変更のトランザクションID。
- `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードのデータへの変更の回数。
- `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子への変更の回数。
- `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードのデータフィールドの長さ。
- `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子の数。
- `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 子ZooKeeperノードのリスト（`LIST` リクエストの応答の場合）。

**例**

クエリ:

```sql
SELECT * FROM system.zookeeper_log WHERE (session_id = '106662742089334927') AND (xid = '10858') FORMAT Vertical;
```

結果:

```text
Row 1:
──────
hostname:         clickhouse.eu-central1.internal
type:             Request
event_date:       2021-08-09
event_time:       2021-08-09 21:38:30.291792
address:          ::
port:             2181
session_id:       106662742089334927
xid:              10858
has_watch:        1
op_num:           List
path:             /clickhouse/task_queue/ddl
data:
is_ephemeral:     0
is_sequential:    0
version:          ᴺᵁᴸᴸ
requests_size:    0
request_idx:      0
zxid:             0
error:            ᴺᵁᴸᴸ
watch_type:       ᴺᵁᴸᴸ
watch_state:      ᴺᵁᴸᴸ
path_created:
stat_czxid:       0
stat_mzxid:       0
stat_pzxid:       0
stat_version:     0
stat_cversion:    0
stat_dataLength:  0
stat_numChildren: 0
children:         []

Row 2:
──────
type:             Response
event_date:       2021-08-09
event_time:       2021-08-09 21:38:30.292086
address:          ::
port:             2181
session_id:       106662742089334927
xid:              10858
has_watch:        1
op_num:           List
path:             /clickhouse/task_queue/ddl
data:
is_ephemeral:     0
is_sequential:    0
version:          ᴺᵁᴸᴸ
requests_size:    0
request_idx:      0
zxid:             16926267
error:            ZOK
watch_type:       ᴺᵁᴸᴸ
watch_state:      ᴺᵁᴸᴸ
path_created:
stat_czxid:       16925469
stat_mzxid:       16925469
stat_pzxid:       16926179
stat_version:     0
stat_cversion:    7
stat_dataLength:  0
stat_numChildren: 7
children:         ['query-0000000006','query-0000000005','query-0000000004','query-0000000003','query-0000000002','query-0000000001','query-0000000000']
```

**参照**

- [ZooKeeper](../../operations/tips.md#zookeeper)
- [ZooKeeperガイド](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
