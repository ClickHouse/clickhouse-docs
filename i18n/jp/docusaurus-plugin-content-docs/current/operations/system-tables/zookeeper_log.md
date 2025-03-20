---
description: "ZooKeeperサーバーへのリクエストのパラメータとそのレスポンスに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/zookeeper_log
title: "system.zookeeper_log"
keywords: ["システムテーブル", "zookeeper_log"]
---

このテーブルは、ZooKeeperサーバーへのリクエストのパラメータとそのレスポンスに関する情報を含んでいます。

リクエストに関しては、リクエストパラメータを含むカラムのみが埋められ、残りのカラムはデフォルト値（`0` または `NULL`）が埋められます。レスポンスが到着すると、レスポンスから得られたデータが他のカラムに追加されます。

リクエストパラメータを含むカラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeperクライアントにおけるイベントタイプ。次のいずれかの値を持つことができます：
    - `Request` — リクエストが送信されました。
    - `Response` — レスポンスが受信されました。
    - `Finalize` — 接続が失われ、レスポンスが受信されませんでした。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日付。
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生した日時。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — リクエストを行うために使用されたZooKeeperサーバーのIPアドレス。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — リクエストを行うために使用されたZooKeeperサーバーのポート。
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeperサーバーが各接続に対して設定するセッションID。
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — セッション内のリクエストのID。通常は連続したリクエスト番号です。リクエスト行と対応する `response` / `finalize` 行で同じになります。
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)が設定されているかどうかのリクエスト。
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — リクエストまたはレスポンスのタイプ。
- `path` ([String](../../sql-reference/data-types/string.md)) — リクエストで指定されたZooKeeperノードへのパス。パスを指定する必要がない場合は空文字列。
- `data` ([String](../../sql-reference/data-types/string.md)) — ZooKeeperノードに書き込まれたデータ（`SET` および `CREATE` リクエストの場合はリクエストが書き込もうとした内容、`GET` リクエストのレスポンスの場合は読み取った内容）または空文字列。
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeperノードが[エフェメラル](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes)として作成されるかどうか。
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeperノードが[シーケンシャル](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming)として作成されるかどうか。
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — 実行時にリクエストが期待するZooKeeperノードのバージョン。`CHECK`、`SET`、`REMOVE` リクエストでサポートされます（バージョンチェックを行わない場合は `-1`、バージョンチェックをサポートしない他のリクエストの場合は `NULL`）。
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの数（これはいくつかの連続した通常のリクエストから成る特別なリクエストで、原子性を持って実行されます）。マルチリクエストに含まれるすべてのリクエストは同じ `xid` を持ちます。
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの番号（マルチリクエストの場合は `0`、その後は `1` から順番に）。

リクエストレスポンスパラメータを含むカラム:

- `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeperトランザクションID。成功裏に実行されたリクエストに対してZooKeeperサーバーが発行するシリアル番号（リクエストが実行されなかった/エラーを返した/クライアントがリクエストが実行されたかどうかわからない場合は `0`）。
- `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — エラーコード。多くの値を持つことができ、いくつかの値は以下の通りです：
    - `ZOK` — リクエストが正常に実行されました。
    - `ZCONNECTIONLOSS` — 接続が失われました。
    - `ZOPERATIONTIMEOUT` — リクエストの実行タイムアウトが期限切れになりました。
	- `ZSESSIONEXPIRED` — セッションが期限切れになりました。
    - `NULL` — リクエストが完了しました。
- `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` イベントのタイプ（`op_num` = `Watch` のレスポンスの場合）、その他のレスポンスの場合は `NULL`。
- `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` イベントの状態（`op_num` = `Watch` のレスポンスの場合）、その他のレスポンスの場合は `NULL`。
- `path_created` ([String](../../sql-reference/data-types/string.md)) — 作成されたZooKeeperノードへのパス（`CREATE` リクエストに対するレスポンスの場合）、ノードが `sequential` として作成された場合は `path` とは異なる場合があります。
- `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードが作成される原因となった変更の `zxid`。
- `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードを最後に変更した変更の `zxid`。
- `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子を最後に変更した変更のトランザクションID。
- `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードのデータに対する変更の数。
- `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子に対する変更の数。
- `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードのデータフィールドの長さ。
- `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子の数。
- `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 子ZooKeeperノードのリスト（`LIST` リクエストに対するレスポンスの場合）。

**例**

クエリ:

``` sql
SELECT * FROM system.zookeeper_log WHERE (session_id = '106662742089334927') AND (xid = '10858') FORMAT Vertical;
```

結果:

``` text
行 1:
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

行 2:
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
