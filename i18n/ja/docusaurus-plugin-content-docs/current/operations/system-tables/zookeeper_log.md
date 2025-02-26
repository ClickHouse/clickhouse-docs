---
description: "ZooKeeperサーバーへのリクエストのパラメータとその応答に関する情報を含むシステムテーブルです。"
slug: /operations/system-tables/zookeeper_log
title: "zookeeper_log"
keywords: ["システムテーブル", "zookeeper_log"]
---

このテーブルは、ZooKeeperサーバーへのリクエストのパラメータとそれに対する応答に関する情報を含んでいます。

リクエストについては、リクエストパラメータを持つカラムのみが填充され、残りのカラムはデフォルト値（`0`または`NULL`）で填充されます。応答が到着すると、応答からのデータが他のカラムに追加されます。

リクエストパラメータを持つカラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeperクライアント内のイベントタイプ。次のいずれかの値を持つことができます:
    - `Request` — リクエストが送信されました。
    - `Response` — 応答が受信されました。
    - `Finalize` — 接続が失われ、応答が受信されませんでした。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントが発生した日付。
- `event_time` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — イベントが発生した日時。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — リクエストを行うために使用されたZooKeeperサーバーのIPアドレス。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — リクエストを行うために使用されたZooKeeperサーバーのポート。
- `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeperサーバーが各接続に設定するセッションID。
- `xid` ([Int32](../../sql-reference/data-types/int-uint.md)) — セッション内のリクエストのID。通常は連続したリクエスト番号です。リクエスト行とペアの`response`/`finalize`行で同じです。
- `has_watch` ([UInt8](../../sql-reference/data-types/int-uint.md)) — [watch](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#ch_zkWatches)が設定されているかどうかのリクエスト。
- `op_num` ([Enum](../../sql-reference/data-types/enum.md)) — リクエストまたは応答のタイプ。
- `path` ([String](../../sql-reference/data-types/string.md)) — リクエストで指定されたZooKeeperノードへのパス、またはパスを指定する必要がないリクエストの場合は空文字列。
- `data` ([String](../../sql-reference/data-types/string.md)) — ZooKeeperノードに書き込まれたデータ（`SET`および`CREATE`リクエストの場合は、リクエストが書き込もうとした内容、`GET`リクエストの応答の場合は、読み取られた内容）または空文字列。
- `is_ephemeral` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeperノードは[一時的な](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Ephemeral+Nodes)として作成されていますか。
- `is_sequential` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ZooKeeperノードは[順序付き](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html#Sequence+Nodes+--+Unique+Naming)として作成されていますか。
- `version` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)) — リクエスト実行時にZooKeeperノードが期待するバージョン。`CHECK`、`SET`、`REMOVE`リクエストに対してサポートされており（バージョンを確認しないリクエストには`-1`が関連し、バージョン確認をサポートしていない他のリクエストには`NULL`）。
- `requests_size` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの数（これは、いくつかの連続した通常のリクエストで構成され、それらを原子的に実行する特別なリクエストです）。マルチリクエストに含まれるすべてのリクエストは同じ`xid`を持ちます。
- `request_idx` ([UInt32](../../sql-reference/data-types/int-uint.md)) — マルチリクエストに含まれるリクエストの番号（マルチリクエストの場合は`0`、その後は`1`からの順番）。

応答パラメータを持つカラム:

- `zxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — ZooKeeperトランザクションID。成功裏に実行されたリクエストに対するZooKeeperサーバーによって発行されたシリアル番号（リクエストが実行されなかった場合/エラーが返された場合/クライアントがリクエストが実行されたかどうかわからない場合は`0`）。
- `error` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — エラーコード。多くの値を持つことができますが、いくつかの例を以下に示します:
    - `ZOK` — リクエストが成功裏に実行されました。
    - `ZCONNECTIONLOSS` — 接続が失われました。
    - `ZOPERATIONTIMEOUT` — リクエストの実行タイムアウトが経過しました。
	- `ZSESSIONEXPIRED` — セッションが期限切れになりました。
    - `NULL` — リクエストが完了しました。
- `watch_type` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch`イベントのタイプ（`op_num`が`Watch`の応答の場合）、他の応答の場合は`NULL`。
- `watch_state` ([Nullable(Enum)](../../sql-reference/data-types/nullable.md)) — `watch`イベントのステータス（`op_num`が`Watch`の応答の場合）、他の応答の場合は`NULL`。
- `path_created` ([String](../../sql-reference/data-types/string.md)) — 作成されたZooKeeperノードへのパス（`CREATE`リクエストへの応答の場合）、ノードが`sequential`として作成された場合、`path`とは異なる場合があります。
- `stat_czxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードを作成する原因となった変更の`zxid`。
- `stat_mzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードを最後に変更した変更の`zxid`。
- `stat_pzxid` ([Int64](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子を最後に変更した変更のトランザクションID。
- `stat_version` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードのデータの変更数。
- `stat_cversion` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子の変更数。
- `stat_dataLength` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードのデータフィールドの長さ。
- `stat_numChildren` ([Int32](../../sql-reference/data-types/int-uint.md)) — このZooKeeperノードの子の数。
- `children` ([Array(String)](../../sql-reference/data-types/array.md)) — 子ZooKeeperノードのリスト（`LIST`リクエストへの応答の場合）。

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

**関連記事**

- [ZooKeeper](../../operations/tips.md#zookeeper)
- [ZooKeeperガイド](https://zookeeper.apache.org/doc/r3.3.3/zookeeperProgrammers.html)
