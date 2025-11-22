---
description: 'ATTACH に関するドキュメント'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'ATTACH ステートメント'
doc_type: 'reference'
---

テーブルまたは辞書をアタッチします。たとえば、データベースを別のサーバーへ移行する際などに使用します。

**構文**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

このクエリはディスク上にデータを新たに作成することはせず、データがすでに適切な場所に存在していることを前提として、指定されたテーブル、辞書、またはデータベースに関する情報をサーバーに登録するだけです。`ATTACH` クエリを実行すると、サーバーはそのテーブル、辞書、またはデータベースの存在を把握するようになります。

テーブルが以前に（[DETACH](../../sql-reference/statements/detach.md) クエリによって）切り離されていて、その構造がすでにサーバーに知られている場合は、構造を定義せずに簡略な記法を使用できます。


## 既存テーブルのアタッチ {#attach-existing-table}

**構文**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

このクエリはサーバー起動時に使用されます。サーバーはテーブルのメタデータを`ATTACH`クエリを含むファイルとして保存し、起動時にそれらを実行します(明示的に作成される一部のシステムテーブルを除く)。

テーブルが永続的にデタッチされている場合、サーバー起動時に自動的に再アタッチされないため、`ATTACH`クエリを明示的に実行する必要があります。


## 新しいテーブルの作成とデータのアタッチ {#create-new-table-and-attach-data}

### テーブルデータへのパスを指定する場合 {#with-specified-path-to-table-data}

このクエリは、指定された構造で新しいテーブルを作成し、`user_files`内の指定されたディレクトリからテーブルデータをアタッチします。

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

### テーブルUUIDを指定する場合 {#with-specified-table-uuid}

このクエリは、指定された構造で新しいテーブルを作成し、指定されたUUIDを持つテーブルからデータをアタッチします。
[Atomic](../../engines/database-engines/atomic.md)データベースエンジンでサポートされています。

**構文**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```


## MergeTreeテーブルをReplicatedMergeTreeとしてアタッチする {#attach-mergetree-table-as-replicatedmergetree}

非レプリケートのMergeTreeテーブルをReplicatedMergeTreeとしてアタッチできます。ReplicatedMergeTreeテーブルは`default_replica_path`と`default_replica_name`設定の値で作成されます。また、レプリケートされたテーブルを通常のMergeTreeとしてアタッチすることも可能です。

このクエリではZooKeeper内のテーブルデータは影響を受けません。つまり、アタッチ後に`SYSTEM RESTORE REPLICA`を使用してZooKeeperにメタデータを追加するか、`SYSTEM DROP REPLICA ... FROM ZKPATH ...`でクリアする必要があります。

既存のReplicatedMergeTreeテーブルにレプリカを追加する場合、変換されたMergeTreeテーブル内のすべてのローカルデータがデタッチされることに留意してください。

**構文**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**テーブルをレプリケート化する**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**テーブルを非レプリケート化する**

テーブルのZooKeeperパスとレプリカ名を取得します:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```

結果:

```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```

テーブルを非レプリケートとしてアタッチし、ZooKeeperからレプリカのデータを削除します:

```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```


## 既存のディクショナリをアタッチする {#attach-existing-dictionary}

以前にデタッチされたディクショナリをアタッチします。

**構文**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```


## 既存のデータベースをアタッチする {#attach-existing-database}

以前にデタッチされたデータベースをアタッチします。

**構文**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
