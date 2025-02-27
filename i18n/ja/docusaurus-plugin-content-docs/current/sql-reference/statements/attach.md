---
slug: /sql-reference/statements/attach
sidebar_position: 40
sidebar_label: ATTACH
title: "ATTACH文"
---

別のサーバーにデータベースを移動する際などに、テーブルや辞書をアタッチします。

**構文**

``` sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

このクエリはディスク上にデータを作成するものではなく、データがすでに適切な場所にあることを前提として、指定されたテーブル、辞書、またはデータベースに関する情報をサーバーに追加します。`ATTACH`クエリを実行した後、サーバーはテーブル、辞書、またはデータベースの存在を認識します。

もしテーブルが以前にデタッチされていた場合（[DETACH](../../sql-reference/statements/detach.md)クエリ）、その構造が知られているため、構造を定義せずに略式を使用できます。

## 既存のテーブルをアタッチする {#attach-existing-table}

**構文**

``` sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

このクエリはサーバー起動時に使用されます。サーバーは`ATTACH`クエリとしてファイルにテーブルのメタデータを保存し、起動時に単純に実行します（明示的にサーバー上で作成されるいくつかのシステムテーブルを除く）。

テーブルが永久にデタッチされていた場合、サーバーの起動時には再度アタッチされないため、`ATTACH`クエリを明示的に使用する必要があります。

## 新しいテーブルを作成し、データをアタッチする {#create-new-table-and-attach-data}

### テーブルデータへの指定パス {#with-specified-path-to-table-data}

このクエリは提供された構造で新しいテーブルを作成し、`user_files`内の指定されたディレクトリからテーブルデータをアタッチします。

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

### 指定されたテーブルUUIDでのアタッチ {#with-specified-table-uuid}

このクエリは提供された構造で新しいテーブルを作成し、指定されたUUIDを持つテーブルからデータをアタッチします。これは[Atomic](../../engines/database-engines/atomic.md)データベースエンジンでサポートされています。

**構文**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## MergeTreeテーブルをReplicatedMergeTreeとしてアタッチ {#attach-mergetree-table-as-replicatedmergetree}

レプリケートされていないMergeTreeテーブルをReplicatedMergeTreeとしてアタッチできます。ReplicatedMergeTreeテーブルは`default_replica_path`および`default_replica_name`設定の値で作成されます。また、レプリケートされたテーブルを通常のMergeTreeとしてアタッチすることも可能です。

このクエリではテーブルのデータがZooKeeperに影響されない点に注意してください。これは、`ATTACH`後に`SYSTEM RESTORE REPLICA`を使用してZooKeeperにメタデータを追加するか、`SYSTEM DROP REPLICA ... FROM ZKPATH ...`でクリアする必要があることを意味します。

既存のReplicatedMergeTreeテーブルにレプリカを追加しようとする場合、変換されたMergeTreeテーブル内のすべてのローカルデータはデタッチされることに注意してください。

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

**テーブルを非レプリケートに変換**

テーブルのZooKeeperパスとレプリカ名を取得:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```
結果:
```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```
テーブルを非レプリケートとしてアタッチし、ZooKeeperからレプリカのデータを削除:
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## 既存の辞書をアタッチ {#attach-existing-dictionary}

以前にデタッチされた辞書をアタッチします。

**構文**

``` sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## 既存のデータベースをアタッチ {#attach-existing-database}

以前にデタッチされたデータベースをアタッチします。

**構文**

``` sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
