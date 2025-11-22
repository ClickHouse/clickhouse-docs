---
description: 'CREATE DATABASE ステートメントのドキュメント'
sidebar_label: 'DATABASE'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'CREATE DATABASE'
doc_type: 'reference'
---



# CREATE DATABASE

新しいデータベースを作成します。

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```


## 句 {#clauses}

### IF NOT EXISTS {#if-not-exists}

`db_name` データベースが既に存在する場合、ClickHouseは新しいデータベースを作成せず、以下のように動作します:

- 句が指定されている場合は例外をスローしません。
- 句が指定されていない場合は例外をスローします。

### ON CLUSTER {#on-cluster}

ClickHouseは指定されたクラスタのすべてのサーバーに `db_name` データベースを作成します。詳細は[分散DDL](../../../sql-reference/distributed-ddl.md)の記事を参照してください。

### ENGINE {#engine}

デフォルトでは、ClickHouseは独自の[Atomic](../../../engines/database-engines/atomic.md)データベースエンジンを使用します。他にも[Lazy](../../../engines/database-engines/lazy.md)、[MySQL](../../../engines/database-engines/mysql.md)、[PostgresSQL](../../../engines/database-engines/postgresql.md)、[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)、[Replicated](../../../engines/database-engines/replicated.md)、[SQLite](../../../engines/database-engines/sqlite.md)があります。

### COMMENT {#comment}

データベースを作成する際にコメントを追加できます。

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
