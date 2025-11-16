---
'description': 'CREATE DATABASE에 대한 문서'
'sidebar_label': 'DATABASE'
'sidebar_position': 35
'slug': '/sql-reference/statements/create/database'
'title': 'CREATE DATABASE'
'doc_type': 'reference'
---


# CREATE DATABASE

새 데이터베이스를 생성합니다.

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```

## Clauses {#clauses}

### IF NOT EXISTS {#if-not-exists}

`db_name` 데이터베이스가 이미 존재하는 경우, ClickHouse는 새 데이터베이스를 생성하지 않으며:

- 절이 지정된 경우 예외를 발생시키지 않습니다.
- 절이 지정되지 않은 경우 예외를 발생시킵니다.

### ON CLUSTER {#on-cluster}

ClickHouse는 지정된 클러스터의 모든 서버에 `db_name` 데이터베이스를 생성합니다. 자세한 내용은 [Distributed DDL](../../../sql-reference/distributed-ddl.md) 문서를 참조하세요.

### ENGINE {#engine}

기본적으로 ClickHouse는 자체 [Atomic](../../../engines/database-engines/atomic.md) 데이터베이스 엔진을 사용합니다. 또한 [Lazy](../../../engines/database-engines/lazy.md), [MySQL](../../../engines/database-engines/mysql.md), [PostgresSQL](../../../engines/database-engines/postgresql.md), [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md), [Replicated](../../../engines/database-engines/replicated.md), [SQLite](../../../engines/database-engines/sqlite.md)도 사용 가능합니다.

### COMMENT {#comment}

데이터베이스를 생성할 때 주석을 추가할 수 있습니다.

주석은 모든 데이터베이스 엔진에서 지원됩니다.

**Syntax**

```sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Comment'
```

**Example**

쿼리:

```sql
CREATE DATABASE db_comment ENGINE = Memory COMMENT 'The temporary database';
SELECT name, comment FROM system.databases WHERE name = 'db_comment';
```

결과:

```text
┌─name───────┬─comment────────────────┐
│ db_comment │ The temporary database │
└────────────┴────────────────────────┘
```
