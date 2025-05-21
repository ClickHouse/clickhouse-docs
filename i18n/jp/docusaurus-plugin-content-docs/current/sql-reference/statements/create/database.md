---
description: 'データベース作成に関するドキュメント'
sidebar_label: 'データベース'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'データベース作成'
---


# CREATE DATABASE

新しいデータベースを作成します。

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```

## クローズ {#clauses}

### IF NOT EXISTS {#if-not-exists}

`db_name` データベースがすでに存在する場合、ClickHouse は新しいデータベースを作成せず、次のようになります：

- 指定された場合は例外をスローしません。
- 指定されていない場合は例外をスローします。

### ON CLUSTER {#on-cluster}

ClickHouse は指定されたクラスターのすべてのサーバーに `db_name` データベースを作成します。詳細については [Distributed DDL](../../../sql-reference/distributed-ddl.md) 記事をご覧ください。

### ENGINE {#engine}

デフォルトでは、ClickHouse は自身の [Atomic](../../../engines/database-engines/atomic.md) データベースエンジンを使用します。他にも [Lazy](../../../engines/database-engines/lazy.md)、[MySQL](../../../engines/database-engines/mysql.md)、[PostgresSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md) があります。

### COMMENT {#comment}

データベースを作成する際にコメントを追加できます。

このコメントはすべてのデータベースエンジンでサポートされています。

**構文**

```sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Comment'
```

**例**

クエリ：

```sql
CREATE DATABASE db_comment ENGINE = Memory COMMENT '一時データベース';
SELECT name, comment FROM system.databases WHERE name = 'db_comment';
```

結果：

```text
┌─name───────┬─comment────────────────┐
│ db_comment │ 一時データベース       │
└────────────┴────────────────────────┘
```
