---
'description': '設定されている場合にのみ存在するシステムテーブルであり、ClickHouse KeeperまたはZooKeeperが構成されています。これは、設定で定義されたKeeperクラスタからデータを公開します。'
'keywords':
- 'system table'
- 'zookeeper'
'slug': '/operations/system-tables/zookeeper'
'title': 'system.zookeeper'
'doc_type': 'reference'
---


# system.zookeeper

このテーブルは、ClickHouse Keeper または ZooKeeper が設定されていない限り存在しません。`system.zookeeper` テーブルは、設定ファイルに定義された Keeper クラスターからデータを公開します。
クエリには、以下に示すように `WHERE` 句に `path =` 条件または `path IN` 条件のどちらかを設定する必要があります。これは、データを取得したい子のパスに対応します。

クエリ `SELECT * FROM system.zookeeper WHERE path = '/clickhouse'` は、`/clickhouse` ノードのすべての子のデータを出力します。
すべてのルートノードのデータを出力するには、`path = '/'` と記述します。
'path' に指定されたパスが存在しない場合、例外がスローされます。

クエリ `SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')` は、`/` および `/clickhouse` ノードのすべての子のデータを出力します。
指定された 'path' コレクションに存在しないパスがある場合、例外がスローされます。
これは、Keeper パスクエリのバッチ処理に使用できます。

クエリ `SELECT * FROM system.zookeeper WHERE path = '/clickhouse' AND zookeeperName = 'auxiliary_cluster'` は、`auxiliary_cluster` ZooKeeper クラスターのデータを出力します。
指定された 'auxiliary_cluster' が存在しない場合、例外がスローされます。

カラム:

- `name` (String) — ノードの名前。
- `path` (String) — ノードへのパス。
- `value` (String) — ノードの値。
- `zookeeperName` (String) — デフォルトまたは補助の ZooKeeper クラスターの名前。
- `dataLength` (Int32) — 値のサイズ。
- `numChildren` (Int32) — 子孫の数。
- `czxid` (Int64) — ノードを作成したトランザクションの ID。
- `mzxid` (Int64) — 最後にノードを変更したトランザクションの ID。
- `pzxid` (Int64) — 最後に子孫を削除または追加したトランザクションの ID。
- `ctime` (DateTime) — ノードの作成時間。
- `mtime` (DateTime) — ノードの最終修正時間。
- `version` (Int32) — ノードのバージョン：ノードが変更された回数。
- `cversion` (Int32) — 追加または削除された子孫の数。
- `aversion` (Int32) — ACL の変更回数。
- `ephemeralOwner` (Int64) — エフェメラルノードの場合、このノードを所有するセッションの ID。

例:

```sql
SELECT *
FROM system.zookeeper
WHERE path = '/clickhouse/tables/01-08/visits/replicas'
FORMAT Vertical
```

```text
Row 1:
──────
name:           example01-08-1
value:
czxid:          932998691229
mzxid:          932998691229
ctime:          2015-03-27 16:49:51
mtime:          2015-03-27 16:49:51
version:        0
cversion:       47
aversion:       0
ephemeralOwner: 0
dataLength:     0
numChildren:    7
pzxid:          987021031383
path:           /clickhouse/tables/01-08/visits/replicas

Row 2:
──────
name:           example01-08-2
value:
czxid:          933002738135
mzxid:          933002738135
ctime:          2015-03-27 16:57:01
mtime:          2015-03-27 16:57:01
version:        0
cversion:       37
aversion:       0
ephemeralOwner: 0
dataLength:     0
numChildren:    7
pzxid:          987021252247
path:           /clickhouse/tables/01-08/visits/replicas
```
