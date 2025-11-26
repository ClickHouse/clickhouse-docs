---
description: 'ZooKeeper サーバーへのリクエストのパラメータおよびレスポンスに関する情報を含むシステムテーブル。'
keywords: ['システムテーブル', 'zookeeper_log']
slug: /operations/system-tables/zookeeper_log
title: 'system.zookeeper_log'
doc_type: 'reference'
---

# system.zookeeper_log

このテーブルには、ZooKeeper サーバーへのリクエストのパラメータと、そのレスポンスに関する情報が含まれます。

リクエスト時には、リクエストパラメータを持つカラムのみが埋められ、残りのカラムはデフォルト値（`0` または `NULL`）で埋められます。レスポンスが到着すると、そのレスポンスのデータが他のカラムに追加されます。

リクエストパラメータを持つカラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper クライアントにおけるイベント種別。次のいずれかの値を取ります:
  - `Request` — リクエストが送信された。
  - `Response` — レスポンスを受信した。
  - `Finalize` — 接続が失われ、レスポンスを受信しなかった。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日付。
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生した日時。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — リクエストに使用された ZooKeeper サーバーの IP アドレス。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — リクエストに使用された ZooKeeper サーバーのポート。
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 各接続に対して ZooKeeper サーバーが設定するセッション ID。
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — セッション内でのリクエスト ID。通常は連番のリクエスト番号です。リクエスト行と、それに対応する `response` / `finalize` 行で同じ値になります。
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches) が設定されているかどうかを示すフラグ。
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — リクエストまたはレスポンスの種別。
- `path` ([String](../../sql-reference/data-types/string.md)) — リクエストで指定された ZooKeeper ノードへのパス。パスの指定を必要としないリクエストの場合は空文字列。
- `data` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper ノードに書き込まれるデータ（`SET` および `CREATE` リクエストではリクエストが書き込もうとした内容、`GET` リクエストのレスポンスでは読み取られた内容）、または空文字列。
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper ノードが[エフェメラル](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes)として作成されているかどうか。
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper ノードが[シーケンシャル](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming)として作成されているかどうか。
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — 実行時にリクエストが期待する ZooKeeper ノードのバージョン。これは `CHECK`、`SET`、`REMOVE` リクエストでサポートされています（リクエストがバージョンをチェックしない場合は `-1` が設定され、バージョンチェックをサポートしない他のリクエストでは `NULL`）。
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの数（これは複数の連続した通常リクエストから構成され、それらをアトミックに実行する特別なリクエストです）。マルチリクエストに含まれるすべてのリクエストは同じ `xid` を持ちます。
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの番号（マルチリクエスト本体は `0`、その後 `1` から順番）。

レスポンスパラメータを持つカラム:

* `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper トランザクション ID。ZooKeeper サーバーが、正常に実行されたリクエストに対する応答として発行する通し番号（リクエストが実行されなかった／エラーを返した／クライアントがリクエストが実行されたかどうかを認識していない場合は `0`）。
* `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — エラーコード。取りうる値は多数あるが、以下はその一部:
  * `ZOK` — リクエストは正常に実行された。
  * `ZCONNECTIONLOSS` — 接続が失われた。
  * `ZOPERATIONTIMEOUT` — リクエスト実行のタイムアウトが発生した。
  * `ZSESSIONEXPIRED` — セッションが期限切れになった。
  * `NULL` — リクエストは完了している。
* `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` イベントの種別（`op_num` = `Watch` のレスポンスの場合）。それ以外のレスポンスでは `NULL`。
* `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` イベントのステータス（`op_num` = `Watch` のレスポンスの場合）。それ以外のレスポンスでは `NULL`。
* `path_created` ([String](../../sql-reference/data-types/string.md)) — 作成された ZooKeeper ノードへのパス（`CREATE` リクエストへのレスポンスの場合）。ノードが `sequential` として作成された場合は、`path` と異なることがある。
* `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードが作成される原因となった変更の `zxid`。
* `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードを最後に変更したときの `zxid`。
* `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードの子ノードを最後に変更したときのトランザクション ID。
* `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードのデータに対する変更回数。
* `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードの子ノードに対する変更回数。
* `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードのデータフィールドの長さ。
* `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードの子ノード数。
* `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 子 ZooKeeper ノードのリスト（`LIST` リクエストへのレスポンスの場合）。

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

**関連項目**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [ZooKeeper ガイド](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
