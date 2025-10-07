---
'description': 'CREATE DATABASE のためのドキュメント'
'sidebar_label': 'DATABASE'
'sidebar_position': 35
'slug': '/sql-reference/statements/create/database'
'title': 'CREATE DATABASE'
'doc_type': 'reference'
---


# CREATE DATABASE

新しいデータベースを作成します。

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```

## Clauses {#clauses}

### IF NOT EXISTS {#if-not-exists}

`db_name` データベースがすでに存在する場合、ClickHouse は新しいデータベースを作成せず、以下の動作をします：

- 条件が指定されている場合、例外をスローしません。
- 条件が指定されていない場合、例外をスローします。

### ON CLUSTER {#on-cluster}

ClickHouse は指定されたクラスタのすべてのサーバーに `db_name` データベースを作成します。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) 記事を参照してください。

### ENGINE {#engine}

デフォルトでは、ClickHouse は独自の [Atomic](../../../engines/database-engines/atomic.md) データベースエンジンを使用します。他に [Lazy](../../../engines/database-engines/lazy.md)、[MySQL](../../../engines/database-engines/mysql.md)、[PostgresSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md) もあります。

### COMMENT {#comment}

データベースを作成する際にコメントを追加することができます。

コメントはすべてのデータベースエンジンでサポートされています。

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
