---
description: 'ClickHouse Keeper または ZooKeeper が構成されている場合にのみ存在するシステムテーブル。設定ファイルで定義された Keeper クラスタのデータを提供します。'
keywords: ['システムテーブル', 'zookeeper']
slug: /operations/system-tables/zookeeper
title: 'system.zookeeper'
doc_type: 'reference'
---

# system.zookeeper

このテーブルは、ClickHouse Keeper または ZooKeeper が設定されている場合にのみ存在します。`system.zookeeper` テーブルは、設定ファイルで定義された Keeper クラスターのデータを参照します。
クエリには、以下のように `WHERE` 句で `path =` 条件または `path IN` 条件のいずれかを必ず指定する必要があります。これは、データを取得したい子ノードのパスに対応します。

`SELECT * FROM system.zookeeper WHERE path = '/clickhouse'` というクエリは、`/clickhouse` ノード配下のすべての子ノードに対するデータを出力します。
すべてのルートノードのデータを出力するには、path = &#39;/&#39; と記述します。
&#39;path&#39; で指定したパスが存在しない場合、例外がスローされます。

`SELECT * FROM system.zookeeper WHERE path IN ('/', '/clickhouse')` というクエリは、`/` および `/clickhouse` ノード配下のすべての子ノードに対するデータを出力します。
指定した &#39;path&#39; コレクション内に存在しないパスが含まれている場合、例外がスローされます。
これを使用すると、複数の Keeper パスに対するクエリをバッチ形式で実行できます。

`SELECT * FROM system.zookeeper WHERE path = '/clickhouse' AND zookeeperName = 'auxiliary_cluster'` というクエリは、`auxiliary_cluster` ZooKeeper クラスター内のデータを出力します。
指定した &#39;auxiliary&#95;cluster&#39; が存在しない場合、例外がスローされます。

カラム:

* `name` (String) — ノード名。
* `path` (String) — ノードへのパス。
* `value` (String) — ノードの値。
* `zookeeperName` (String) — デフォルトもしくは補助的な ZooKeeper クラスターの名前。
* `dataLength` (Int32) — 値のサイズ。
* `numChildren` (Int32) — 子孫ノードの数。
* `czxid` (Int64) — ノードを作成したトランザクションの ID。
* `mzxid` (Int64) — 最後にノードを変更したトランザクションの ID。
* `pzxid` (Int64) — 最後に子孫ノードを削除または追加したトランザクションの ID。
* `ctime` (DateTime) — ノード作成時刻。
* `mtime` (DateTime) — ノードの最終更新時刻。
* `version` (Int32) — ノードのバージョン（ノードが変更された回数）。
* `cversion` (Int32) — 追加または削除された子孫ノードの数。
* `aversion` (Int32) — ACL の変更回数。
* `ephemeralOwner` (Int64) — 一時ノードの場合、このノードを所有するセッションの ID。

例:

```sql
SELECT *
FROM system.zookeeper
WHERE path = '/clickhouse/tables/01-08/visits/replicas'
FORMAT Vertical
```

```text
行 1:
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

行 2:
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
