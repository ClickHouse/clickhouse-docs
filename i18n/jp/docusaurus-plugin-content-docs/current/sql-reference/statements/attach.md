---
slug: /sql-reference/statements/attach
sidebar_position: 40
sidebar_label: ATTACH
title: "ATTACH ステートメント"
---

データベースを別のサーバーに移動する際などに、テーブルまたは辞書をアタッチします。

**構文**

``` sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

このクエリはディスク上にデータを作成せず、データがすでに適切な場所にあることを前提とします。そして、指定されたテーブル、辞書、またはデータベースに関する情報をサーバーに追加します。`ATTACH` クエリを実行した後、サーバーはテーブル、辞書、またはデータベースの存在を認識します。

テーブルが以前にデタッチされていた場合（[DETACH](../../sql-reference/statements/detach.md) クエリ）、その構造が知られているので、構造を定義することなく省略形を使用できます。

## 既存のテーブルをアタッチ {#attach-existing-table}

**構文**

``` sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

このクエリはサーバー起動時に使用されます。サーバーはテーブルメタデータを `ATTACH` クエリを含むファイルとして保存し、起動時に単に実行されます（サーバー上で明示的に作成される一部のシステムテーブルは例外です）。

テーブルが永久にデタッチされていた場合、サーバー起動時には再接続されないため、`ATTACH` クエリを明示的に使用する必要があります。

## 新しいテーブルを作成し、データをアタッチ {#create-new-table-and-attach-data}

### テーブルデータへの指定されたパスを使用する場合 {#with-specified-path-to-table-data}

このクエリは、提供された構造で新しいテーブルを作成し、`user_files` 内の指定されたディレクトリからテーブルデータをアタッチします。

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

### 指定されたテーブル UUID を使用する場合 {#with-specified-table-uuid}

このクエリは、提供された構造で新しいテーブルを作成し、指定された UUID のテーブルからデータをアタッチします。
これは [Atomic](../../engines/database-engines/atomic.md) データベースエンジンによってサポートされています。

**構文**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## MergeTree テーブルを ReplicatedMergeTree としてアタッチ {#attach-mergetree-table-as-replicatedmergetree}

非レプリケートの MergeTree テーブルを ReplicatedMergeTree としてアタッチすることを許可します。ReplicatedMergeTree テーブルは `default_replica_path` および `default_replica_name` 設定の値を使用して作成されます。レプリケートされたテーブルを通常の MergeTree としてアタッチすることも可能です。

このクエリでは、ZooKeeper 内のテーブルのデータには影響しません。これは、アタッチ後に `SYSTEM RESTORE REPLICA` を使って ZooKeeper にメタデータを追加したり、`SYSTEM DROP REPLICA ... FROM ZKPATH ...` でクリアする必要があることを意味します。

既存の ReplicatedMergeTree テーブルにレプリカを追加しようとしている場合、変換された MergeTree テーブル内のすべてのローカルデータがデタッチされることに注意してください。

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

テーブルの ZooKeeper パスとレプリカ名を取得:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```
結果:
```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```
レプリケートしないテーブルとしてアタッチし、ZooKeeper からレプリカのデータを削除:
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
