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
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```

## 句 \{#clauses\}

### IF NOT EXISTS \{#if-not-exists\}

`db_name` データベースがすでに存在する場合、ClickHouse は新しいデータベースを作成せず、次のように動作します。

* この句が指定されている場合は、例外をスローしません。
* この句が指定されていない場合は、例外をスローします。

### ON CLUSTER \{#on-cluster\}

ClickHouse は、指定したクラスタ内のすべてのサーバーに `db_name` データベースを作成します。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) の記事を参照してください。

### ENGINE \{#engine\}

デフォルトでは、ClickHouse は独自の [Atomic](../../../engines/database-engines/atomic.md) データベースエンジンを使用します。このほかに、[Lazy](../../../engines/database-engines/lazy.md)、[MySQL](../../../engines/database-engines/mysql.md)、[PostgresSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md) があります。

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
