---
description: 'ZooKeeper サーバーへのリクエストのパラメーターとそのレスポンスに関する情報を含むシステムテーブル。'
keywords: ['システムテーブル', 'zookeeper_log']
slug: /operations/system-tables/zookeeper_log
title: 'system.zookeeper_log'
doc_type: 'reference'
---

# system.zookeeper_log

このテーブルには、ZooKeeper サーバーへのリクエストのパラメータおよびそれに対するレスポンスに関する情報が格納されます。

リクエストについては、リクエストパラメータを表す列だけが埋められ、残りの列はデフォルト値（`0` または `NULL`）で埋められます。レスポンスが到着すると、レスポンスのデータが他の列に追加されます。

リクエストパラメータを表す列:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper クライアントでのイベント種別。次のいずれかの値を取ります:
  - `Request` — リクエストが送信された。
  - `Response` — レスポンスを受信した。
  - `Finalize` — 接続が失われ、レスポンスを受信しなかった。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日付。
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生した日時。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — リクエスト送信に使用された ZooKeeper サーバーの IP アドレス。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — リクエスト送信に使用された ZooKeeper サーバーのポート。
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — 各接続に対して ZooKeeper サーバーが設定するセッション ID。
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — セッション内でのリクエスト ID。通常は連番のリクエスト番号です。リクエスト行と、それに対応する `response` / `finalize` 行で同じ値になります。
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — リクエストで [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches) が設定されているかどうか。
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — リクエストまたはレスポンスのタイプ。
- `path` ([String](../../sql-reference/data-types/string.md)) — リクエストで指定された ZooKeeper ノードへのパス。パスの指定を必要としないリクエストの場合は空文字列。
- `data` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper ノードに書き込まれるデータ（`SET` および `CREATE` リクエストの場合 — リクエストが書き込みを行おうとした内容、`GET` リクエストに対するレスポンスの場合 — 読み取られた内容）、または空文字列。
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper ノードが [ephemeral](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes) ノードとして作成されているかどうか。
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeper ノードが [sequential](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming) ノードとして作成されているかどうか。
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — 実行時にリクエストが想定している ZooKeeper ノードのバージョン。`CHECK`、`SET`、`REMOVE` リクエストでサポートされます（リクエストがバージョンをチェックしない場合は `-1` を指定し、バージョンチェックをサポートしない他のリクエストでは `NULL`）。
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの数（複数の連続した通常のリクエストから構成され、それらをアトミックに実行する特別なリクエストです）。マルチリクエストに含まれるすべてのリクエストは同じ `xid` を持ちます。
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの番号（マルチリクエスト本体では `0`、それに続くリクエストでは `1` からの連番）。

レスポンスパラメータを持つ列:

* `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper トランザクション ID。リクエストが正常に実行された場合に ZooKeeper サーバーから発行される連番（リクエストが実行されなかった／エラーを返した／クライアントがリクエストが実行されたかどうかを知らない場合は `0`）。
* `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — エラーコード。多くの値を取り得ますが、ここではその一部のみを示します:
  * `ZOK` — リクエストは正常に実行されました。
  * `ZCONNECTIONLOSS` — 接続が失われました。
  * `ZOPERATIONTIMEOUT` — リクエスト実行のタイムアウトが発生しました。
  * `ZSESSIONEXPIRED` — セッションが期限切れになりました。
  * `NULL` — リクエストは完了しました。
* `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` イベントの種類（`op_num` = `Watch` のレスポンスの場合）、それ以外のレスポンスでは `NULL`。
* `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch` イベントの状態（`op_num` = `Watch` のレスポンスの場合）、それ以外のレスポンスでは `NULL`。
* `path_created` ([String](../../sql-reference/data-types/string.md)) — 作成された ZooKeeper ノードへのパス（`CREATE` リクエストへのレスポンスの場合）。ノードが `sequential` として作成される場合は `path` と異なることがあります。
* `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードの作成を引き起こした変更の `zxid`。
* `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードを最後に変更した変更の `zxid`。
* `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードの子ノードを最後に変更した変更のトランザクション ID。
* `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードのデータに対する変更回数。
* `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードの子ノードに対する変更回数。
* `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードのデータフィールドの長さ。
* `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — この ZooKeeper ノードの子ノード数。
* `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 子 ZooKeeper ノードの一覧（`LIST` リクエストへのレスポンスの場合）。

**例**

クエリ:

```sql
SELECT * FROM system.zookeeper_log WHERE (session_id = '106662742089334927') AND (xid = '10858') FORMAT Vertical;
```

結果：


```text
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

**関連項目**

* [ZooKeeper](../../operations/tips.md#zookeeper)
* [ZooKeeper ガイド](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
