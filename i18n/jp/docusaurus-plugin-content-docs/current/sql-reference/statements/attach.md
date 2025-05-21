---
description: 'ドキュメント - ATTACH'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'ATTACH文'
---

テーブルまたは辞書をアタッチします。たとえば、データベースを別のサーバーに移動する場合です。

**構文**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

このクエリは、ディスク上にデータを作成するのではなく、データがすでに適切な場所にあることを前提として、指定されたテーブル、辞書、またはデータベースに関する情報をサーバーに追加します。 `ATTACH` クエリを実行した後、サーバーはテーブル、辞書、またはデータベースの存在を認識します。

以前に切り離されたテーブル（[DETACH](../../sql-reference/statements/detach.md) クエリ）については、構造が知られている場合、構造を定義せずに省略形を使うことができます。

## 既存のテーブルをアタッチ {#attach-existing-table}

**構文**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

このクエリは、サーバーを起動する際に使用します。サーバーはテーブルのメタデータを `ATTACH` クエリを含むファイルとして保存し、起動時にそれを単純に実行します（システムテーブルの一部は、サーバー上で明示的に作成される例外があります）。

テーブルが永久に切り離された場合、サーバー起動時に再接続されませんので、`ATTACH` クエリを明示的に使用する必要があります。

## 新しいテーブルを作成しデータをアタッチ {#create-new-table-and-attach-data}

### 指定されたテーブルデータのパスを使用 {#with-specified-path-to-table-data}

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

### 指定されたテーブルUUIDを使用 {#with-specified-table-uuid}

このクエリは、提供された構造で新しいテーブルを作成し、指定されたUUIDを持つテーブルからデータをアタッチします。
これは、[Atomic](../../engines/database-engines/atomic.md) データベースエンジンによってサポートされています。

**構文**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## MergeTree テーブルを ReplicatedMergeTree としてアタッチ {#attach-mergetree-table-as-replicatedmergetree}

複製されていない MergeTree テーブルを ReplicatedMergeTree としてアタッチできます。ReplicatedMergeTree テーブルは `default_replica_path` および `default_replica_name` 設定の値で作成されます。複製されたテーブルを通常の MergeTree としてアタッチすることも可能です。

このクエリでは、ZooKeeper のテーブルデータに影響はありません。つまり、アタッチ後に `SYSTEM RESTORE REPLICA` を使用して ZooKeeper にメタデータを追加するか、`SYSTEM DROP REPLICA ... FROM ZKPATH ...` でクリアする必要があります。

既存の ReplicatedMergeTree テーブルにレプリカを追加しようとしている場合、変換された MergeTree テーブル内のすべてのローカルデータが切り離されることに注意してください。

**構文**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**テーブルを複製されたものに変換**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**テーブルを複製されていないものに変換**

テーブルの ZooKeeper パスとレプリカ名を取得します:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```
結果:
```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```
テーブルを複製されていないものとしてアタッチし、ZooKeeper からレプリカのデータを削除します:
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## 既存の辞書をアタッチ {#attach-existing-dictionary}

以前に切り離された辞書をアタッチします。

**構文**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## 既存のデータベースをアタッチ {#attach-existing-database}

以前に切り離されたデータベースをアタッチします。

**構文**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
