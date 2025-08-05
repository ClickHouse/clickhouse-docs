---
description: 'Documentation for Attach'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: '/sql-reference/statements/attach'
title: 'ATTACH Statement'
---



テーブルまたは辞書を添付します。たとえば、データベースを別のサーバーに移動するときです。

**構文**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

このクエリはディスク上にデータを作成するのではなく、データがすでに適切な場所にあることを前提とし、指定されたテーブル、辞書、またはデータベースに関する情報をサーバーに追加するだけです。`ATTACH` クエリを実行した後、サーバーはテーブル、辞書、またはデータベースの存在を認識します。

以前に切り離されたテーブル（[DETACH](../../sql-reference/statements/detach.md) クエリ）であれば、その構造が知られているため、構造を定義せずにショートハンドを使用できます。

## 既存のテーブルを添付 {#attach-existing-table}

**構文**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

このクエリはサーバーを起動する際に使用されます。サーバーは、`ATTACH` クエリを含むファイルとしてテーブルメタデータを保存し、サーバーの起動時にそれを単に実行します（サーバーで明示的に作成されるシステムテーブルを除く）。

テーブルが永久に切り離された場合、サーバーの起動時に再接続されることはないため、`ATTACH` クエリを明示的に使用する必要があります。

## 新しいテーブルを作成し、データを添付 {#create-new-table-and-attach-data}

### テーブルデータへの指定パスで {#with-specified-path-to-table-data}

このクエリは、提供された構造で新しいテーブルを作成し、`user_files` 内の指定されたディレクトリからテーブルデータを添付します。

**構文**

```sql
ATTACH TABLE name FROM 'path/to/data/' (col1 Type1, ...)
```

**例**

クエリ:

```sql
DROP TABLE IF EXISTS test;
INSERT INTO TABLE FUNCTION file('01188_attach/test/data.TSV', 'TSV', 's String, n UInt8') VALUES ('test', 42);
ATTACH TABLE test FROM '01188_attach/test' (s String, n UInt8) ENGINE = File(TSV);
SELECT * FROM test;
```
結果:

```sql
┌─s────┬──n─┐
│ test │ 42 │
└──────┴────┘
```

### 指定されたテーブルUUIDで {#with-specified-table-uuid}

このクエリは、提供された構造で新しいテーブルを作成し、指定されたUUIDを持つテーブルからデータを添付します。
これは、[Atomic](../../engines/database-engines/atomic.md) データベースエンジンによってサポートされています。

**構文**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## MergeTreeテーブルをReplicatedMergeTreeとして添付 {#attach-mergetree-table-as-replicatedmergetree}

非レプリケートのMergeTreeテーブルをReplicatedMergeTreeとして添付します。ReplicatedMergeTreeテーブルは、`default_replica_path` と `default_replica_name` 設定の値を使って作成されます。また、レプリケートされたテーブルを通常のMergeTreeとして添付することも可能です。

このクエリでは、ZooKeeper内のテーブルデータには影響しません。つまり、添付後に `SYSTEM RESTORE REPLICA` を使用してZooKeeperにメタデータを追加するか、`SYSTEM DROP REPLICA ... FROM ZKPATH ...` でクリアする必要があります。

既存のReplicatedMergeTreeテーブルにレプリカを追加しようとする場合、変換されたMergeTreeテーブル内のすべてのローカルデータは切り離されることに注意してください。

**構文**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**テーブルをレプリケートに変換**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**テーブルをレプリケートしないように変換**

テーブルのZooKeeperのパスとレプリカ名を取得:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```
結果:
```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```
レプリケートしないとしてテーブルを添付し、ZooKeeperからレプリカのデータを削除:
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## 既存の辞書を添付 {#attach-existing-dictionary}

以前に切り離された辞書を添付します。

**構文**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## 既存のデータベースを添付 {#attach-existing-database}

以前に切り離されたデータベースを添付します。

**構文**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
