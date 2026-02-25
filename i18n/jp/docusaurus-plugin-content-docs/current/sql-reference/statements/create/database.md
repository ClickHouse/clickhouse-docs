---
description: 'CREATE DATABASE ステートメントのドキュメント'
sidebar_label: 'DATABASE'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'CREATE DATABASE'
doc_type: 'reference'
---

# CREATE DATABASE \{#create-database\}

新しいデータベースを作成します。

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [SETTINGS ...] [COMMENT 'Comment']
```


## 句 \{#clauses\}

### IF NOT EXISTS \{#if-not-exists\}

`db_name` データベースがすでに存在する場合、ClickHouse は新しいデータベースを作成せず、次のように動作します。

* この句が指定されている場合は、例外をスローしません。
* この句が指定されていない場合は、例外をスローします。

### ON CLUSTER \{#on-cluster\}

ClickHouse は、指定したクラスタ内のすべてのサーバーに `db_name` データベースを作成します。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) の記事を参照してください。

### ENGINE \{#engine\}

デフォルトでは、ClickHouse は独自の [Atomic](../../../engines/database-engines/atomic.md) データベースエンジンを使用します。このほかに、[MySQL](../../../engines/database-engines/mysql.md)、[PostgresSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md) があります。

### COMMENT \{#comment\}

データベースを作成する際に、コメントを追加できます。

コメント指定は、すべてのデータベースエンジンでサポートされています。

**構文**

```sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Comment'
```

**例**

クエリ:

```sql
CREATE DATABASE db_comment ENGINE = Memory COMMENT 'The temporary database';
SELECT name, comment FROM system.databases WHERE name = 'db_comment';
```

結果:

```text
┌─name───────┬─comment────────────────┐
│ db_comment │ The temporary database │
└────────────┴────────────────────────┘
```


### SETTINGS \{#settings\}

#### lazy_load_tables \{#lazy-load-tables\}

有効にすると、データベースの起動時にテーブルが完全にはロードされません。その代わり、各テーブルに対して軽量なプロキシが作成され、最初にアクセスされたときに実際のテーブルエンジンが生成されます。これにより、多数のテーブルを持ち、そのうち実際にクエリされるのは一部に限られるデータベースにおいて、起動時間とメモリ使用量を削減できます。

```sql
CREATE DATABASE db_name ENGINE = Atomic SETTINGS lazy_load_tables = 1;
```

テーブルのメタデータをディスク上に保存するデータベースエンジン（例：`Atomic`、`Ordinary`）に適用されます。ビュー、materialized view、辞書、テーブル関数を基盤とするテーブルは、この設定に関係なく常に即時にロードされます。

**使用するタイミング:** この設定は、テーブル数が多い（数百〜数千）データベースで、そのうち一部のみが頻繁にクエリされる場合に有用です。テーブルエンジンオブジェクトの作成、データパーツのスキャン、バックグラウンドスレッドの初期化を初回アクセスまで遅延させることで、サーバーの起動時間とメモリ使用量を削減します。

**`system.tables` への影響:**

* テーブルへのアクセス前は、`system.tables` はそのエンジンを `TableProxy` として表示します。初回アクセス後は、実際のエンジン名（例：`MergeTree`）を表示します。
* 実ストレージがまだ作成されていないため、`total_rows` や `total_bytes` のようなカラムは、未ロードのテーブルに対しては `NULL` を返します。

**DDL 操作との相互作用:**

* `SELECT`、`INSERT`、`ALTER`、`DROP` は、初回使用時に実テーブルエンジンのロードを透過的にトリガーします。
* `RENAME TABLE` はロードをトリガーせずに動作します。
* 一度テーブルがロードされると、そのサーバープロセスのライフタイム中はロードされたままになります。

**制限事項:**

* `system.tables` のメタデータ（例：`total_rows`、`engine`）に依存する監視ツールは、未ロードのテーブルについては不完全な情報しか取得できない場合があります。
* 未ロードのテーブルへの最初のクエリでは、保存されている `CREATE TABLE` ステートメントのパースおよびエンジンの初期化に伴う一度きりのロードコストが発生します。

デフォルト値: `0`（無効）。
