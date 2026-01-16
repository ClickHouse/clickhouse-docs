---
description: 'ATTACH ステートメントのドキュメント'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'ATTACH ステートメント'
doc_type: 'reference'
---

テーブルまたは辞書を ATTACH します。たとえば、データベースを別のサーバーに移行する際などに使用します。

**構文**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

このクエリはディスク上にデータを作成せず、データがすでに適切な場所にあることを前提として、指定されたテーブル、ディクショナリ、またはデータベースに関する情報だけをサーバーに追加します。`ATTACH` クエリを実行した後は、サーバーはそのテーブル、ディクショナリ、またはデータベースの存在を把握します。

テーブルが以前に ([DETACH](../../sql-reference/statements/detach.md) クエリによって) デタッチされており、その構造が既知である場合は、構造を定義せずに省略形の記法を使用できます。

## 既存のテーブルをアタッチ \\{#attach-existing-table\\}

**構文**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

このクエリはサーバーの起動時に使用されます。サーバーはテーブルのメタデータを `ATTACH` クエリの形でファイルに保存し、起動時にそれらをそのまま実行します（一部のシステムテーブルを除き、それらはサーバー上で明示的に作成されます）。

テーブルが恒久的に DETACH されている場合、サーバー起動時に自動的に再度 ATTACH されないため、明示的に `ATTACH` クエリを使用する必要があります。

## 新しいテーブルを作成してデータをアタッチする \\{#create-new-table-and-attach-data\\}

### テーブルデータのパスを指定する場合 \\{#with-specified-path-to-table-data\\}

このクエリは、指定された構造で新しいテーブルを作成し、`user_files` 内の指定されたディレクトリからテーブルデータをアタッチします。

**構文**

```sql
ATTACH TABLE name FROM 'path/to/data/' (col1 Type1, ...)
```

**例**

クエリ：

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

### 指定したテーブル UUID の使用 \\{#with-specified-table-uuid\\}

このクエリは、指定された構造の新しいテーブルを作成し、指定された UUID を持つテーブルからデータをアタッチします。
これは [Atomic](../../engines/database-engines/atomic.md) データベースエンジンでサポートされています。

**構文**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## MergeTree テーブルを ReplicatedMergeTree としてアタッチする \\{#attach-mergetree-table-as-replicatedmergetree\\}

レプリケーションされていない MergeTree テーブルを ReplicatedMergeTree としてアタッチできます。ReplicatedMergeTree テーブルは、`default_replica_path` と `default_replica_name` 設定の値を用いて作成されます。また、レプリケートされたテーブルを通常の MergeTree としてアタッチすることも可能です。

このクエリでは、ZooKeeper 内のテーブルのデータは影響を受けないことに注意してください。つまり、アタッチ後に `SYSTEM RESTORE REPLICA` を使用して ZooKeeper にメタデータを追加するか、`SYSTEM DROP REPLICA ... FROM ZKPATH ...` を使ってメタデータを削除する必要があります。

既存の ReplicatedMergeTree テーブルにレプリカを追加しようとしている場合、変換された MergeTree テーブル内のローカルデータはすべてデタッチされることに注意してください。

**構文**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**テーブルをレプリケートテーブルに変換**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**テーブルを非レプリケートテーブルに変換する**

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

テーブルをレプリケーションなしとしてアタッチし、レプリカのデータを ZooKeeper から削除します:

```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## 既存の辞書をアタッチする \\{#attach-existing-dictionary\\}

以前にデタッチした辞書を再アタッチします。

**構文**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## 既存のデータベースをアタッチ \\{#attach-existing-database\\}

以前にデタッチしたデータベースを再度アタッチします。

**構文**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
