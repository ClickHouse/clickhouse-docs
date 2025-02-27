---
slug: /sql-reference/statements/create/database
sidebar_position: 35
sidebar_label: DATABASE
---

# データベースの作成

新しいデータベースを作成します。

``` sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```

## クローズ {#clauses}

### 存在しない場合 {#if-not-exists}

`db_name` データベースがすでに存在する場合、ClickHouse は新しいデータベースを作成せずに以下の動作をします：

- クローズが指定されている場合、例外をスローしません。
- クローズが指定されていない場合、例外をスローします。

### クラスター上で {#on-cluster}

ClickHouse は指定されたクラスターのすべてのサーバー上に `db_name` データベースを作成します。詳細は [分散DDL](../../../sql-reference/distributed-ddl.md) 記事を参照してください。

### エンジン {#engine}

デフォルトで、ClickHouse は独自の [Atomic](../../../engines/database-engines/atomic.md) データベースエンジンを使用します。他にも [Lazy](../../../engines/database-engines/lazy.md)、[MySQL](../../../engines/database-engines/mysql.md)、[PostgreSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md) があります。

### コメント {#comment}

データベースを作成するときにコメントを追加することができます。

このコメントはすべてのデータベースエンジンでサポートされています。

**構文**

``` sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Comment'
```

**例**

クエリ：

``` sql
CREATE DATABASE db_comment ENGINE = Memory COMMENT '一時的なデータベース';
SELECT name, comment FROM system.databases WHERE name = 'db_comment';
```

結果：

```text
┌─name───────┬─comment────────────────┐
│ db_comment │ 一時的なデータベース   │
└────────────┴────────────────────────┘
```
