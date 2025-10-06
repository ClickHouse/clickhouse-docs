---
'description': 'Attachに関するDocumentation'
'sidebar_label': 'ATTACH'
'sidebar_position': 40
'slug': '/sql-reference/statements/attach'
'title': 'ATTACH ステートメント'
'doc_type': 'reference'
---

テーブルまたは辞書を添付します。たとえば、データベースを別のサーバーに移動する際に使用します。

**構文**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

このクエリはディスク上にデータを作成するのではなく、データがすでに適切な場所にあることを前提として、指定されたテーブル、辞書、またはデータベースに関する情報をサーバーに追加します。 `ATTACH` クエリを実行した後、サーバーはテーブル、辞書、またはデータベースの存在を認識します。

テーブルが以前にデタッチされていた場合（[DETACH](../../sql-reference/statements/detach.md) クエリ）、その構造が既に知られているため、構造を定義せずに短縮形を使用できます。

## 既存のテーブルを添付 {#attach-existing-table}

**構文**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

このクエリはサーバーを起動する際に使用されます。サーバーは `ATTACH` クエリとしてファイルにテーブルメタデータを保存し、起動時に単純に実行します（サーバー上で明示的に作成されるいくつかのシステムテーブルを除く）。

テーブルが永続的にデタッチされた場合、サーバーの起動時に再添付されないため、`ATTACH` クエリを明示的に使用する必要があります。

## 新しいテーブルを作成し、データを添付 {#create-new-table-and-attach-data}

### 指定されたテーブルデータのパスで {#with-specified-path-to-table-data}

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

### 指定されたテーブル UUID で {#with-specified-table-uuid}

このクエリは、提供された構造で新しいテーブルを作成し、指定された UUID を持つテーブルからデータを添付します。
これは [Atomic](../../engines/database-engines/atomic.md) データベースエンジンでサポートされています。

**構文**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## MergeTree テーブルを ReplicatedMergeTree として添付 {#attach-mergetree-table-as-replicatedmergetree}

非レプリケートの MergeTree テーブルを ReplicatedMergeTree として添付することができます。ReplicatedMergeTree テーブルは `default_replica_path` と `default_replica_name` 設定の値で作成されます。また、レプリケートされているテーブルを通常の MergeTree として添付することも可能です。

このクエリでは、ZooKeeper 内のテーブルデータには影響を与えません。これは、`SYSTEM RESTORE REPLICA` を使用して ZooKeeper にメタデータを追加するか、`SYSTEM DROP REPLICA ... FROM ZKPATH ...` を使用してクリアする必要があることを意味します。

既存の ReplicatedMergeTree テーブルにレプリカを追加しようとしている場合、変換された MergeTree テーブル内のローカルデータはすべてデタッチされることを考慮してください。

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
テーブルを非レプリケートとして添付し、ZooKeeper からレプリカのデータを削除します:
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## 既存の辞書を添付 {#attach-existing-dictionary}

以前にデタッチされた辞書を添付します。

**構文**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## 既存のデータベースを添付 {#attach-existing-database}

以前にデタッチされたデータベースを添付します。

**構文**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
