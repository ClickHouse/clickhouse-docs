---
sidebar_label: 'SQLAlchemy'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'ClickHouse SQLAlchemy dialect for Core queries, DDL, and Apache Superset'
slug: /integrations/language-clients/python/sqlalchemy
title: 'SQLAlchemy'
doc_type: 'reference'
---

# SQLAlchemy {#sqlalchemy}

ClickHouse Connect includes a SQLAlchemy dialect (`clickhousedb`) built on top of the core driver. It targets SQLAlchemy Core APIs and supports SQLAlchemy 1.4.40+ and 2.0.x.

## When to use it {#when-to-use-it}

Use the SQLAlchemy dialect when:

- You need a SQLAlchemy engine for Apache Superset or other tools that expect one.
- You want to use SQLAlchemy Core for building queries programmatically.
- You need table reflection and basic DDL.

Use the [Core Client](querying.md) directly when:

- You need DataFrame, Arrow, or streaming query methods.
- You want the best insert performance (bulk inserts via `insert`, `insert_df`, `insert_arrow`).
- You need full control over ClickHouse settings, read/write formats, or timezone handling.
- You need async support.

## Connect {#sqlalchemy-connect}

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

URL query parameters map to ClickHouse settings, client options, and HTTP/TLS transport options. See [Driver API (Connection Arguments)](driver-api.md#connection-arguments) for all supported options.

## Data types {#sqlalchemy-data-types}

All ClickHouse types are available as SQLAlchemy column types. Import from `clickhouse_connect.cc_sqlalchemy.datatypes.sqltypes`.

### Numeric types {#numeric-types}

| SQLAlchemy type                            | ClickHouse type                |
|--------------------------------------------|--------------------------------|
| `Int8`, `UInt8` ... `Int256`, `UInt256`    | Int8 ... UInt256               |
| `Float32`, `Float64`                       | Float32, Float64               |
| `Bool` / `Boolean`                         | Bool                           |
| `Decimal(precision, scale)`                | Decimal(P, S)                  |
| `Decimal32(scale)` ... `Decimal256(scale)` | Decimal32(S) ... Decimal256(S) |

### String and enum types {#string-and-enum-types}

| SQLAlchemy type                          | ClickHouse type |
|------------------------------------------|-----------------|
| `String`                                 | String          |
| `FixedString(size)`                      | FixedString(N)  |
| `Enum(...)`, `Enum8(...)`, `Enum16(...)` | Enum8, Enum16   |

### Date and time types {#date-and-time-types}

| SQLAlchemy type                 | ClickHouse type | Notes             |
|---------------------------------|-----------------|-------------------|
| `Date`, `Date32`                | Date, Date32    |                   |
| `DateTime(tz=...)`              | DateTime        | Optional timezone |
| `DateTime64(precision, tz=...)` | DateTime64(P)   | Precision 0-9     |
| `Time`, `Time64(precision)`     | Time, Time64(P) |                   |

### Other types {#other-types}

| SQLAlchemy type                            | ClickHouse type              |
|--------------------------------------------|------------------------------|
| `IPv4`, `IPv6`                             | IPv4, IPv6                   |
| `UUID`                                     | UUID                         |
| `Point`, `Ring`, `Polygon`, `MultiPolygon` | Geometric types              |
| `Array(element)`                           | Array(T)                     |
| `Map(key, value)`                          | Map(K, V)                    |
| `Tuple(elements)`                          | Tuple(T1, T2, ...)           |
| `JSON`                                     | JSON (DDL only)              |
| `Nested`                                   | Nested (DDL only)            |
| `SimpleAggregateFunction(name, element)`   | SimpleAggregateFunction      |
| `AggregateFunction(*params)`               | AggregateFunction (DDL only) |
| `Nothing`                                  | Nothing                      |

### Type modifiers {#type-modifiers}

```python
import sqlalchemy as db
from clickhouse_connect.cc_sqlalchemy.datatypes.sqltypes import (
    Nullable, LowCardinality, String,
)

db.Column("description", Nullable(String))
db.Column("status", LowCardinality(String))
```

## Core queries {#sqlalchemy-core-queries}

The dialect supports SQLAlchemy Core `SELECT` with joins, filters, ordering, limits, and `DISTINCT`.

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)

# Basic SELECT
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()

# JOINs (INNER/LEFT OUTER/FULL OUTER/CROSS)
with engine.begin() as conn:
    stmt = (
        select(users.c.name, orders.c.product)
        .select_from(users.join(orders, users.c.id == orders.c.user_id))
    )
    rows = conn.execute(stmt).fetchall()
```

Lightweight `DELETE` with a required `WHERE` clause is supported:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
```

## DDL and reflection {#sqlalchemy-ddl-reflection}

### Database management {#database-management}

```python
from clickhouse_connect.cc_sqlalchemy.ddl.custom import CreateDatabase, DropDatabase

with engine.begin() as conn:
    conn.execute(CreateDatabase("example_db", exists_ok=True))
    conn.execute(DropDatabase("example_db", missing_ok=True))
```

### Creating tables {#creating-tables}

```python
import sqlalchemy as db
from sqlalchemy import MetaData
from clickhouse_connect.cc_sqlalchemy.ddl.tableengine import MergeTree
from clickhouse_connect.cc_sqlalchemy.datatypes.sqltypes import UInt32, String, DateTime64

metadata = MetaData(schema="example_db")
table = db.Table(
    "events",
    metadata,
    db.Column("id", UInt32, primary_key=True),
    db.Column("user", String),
    db.Column("created_at", DateTime64(3)),
    MergeTree(order_by="id", partition_by="toYYYYMM(created_at)"),
)

with engine.begin() as conn:
    table.create(conn)
```

### Reflection {#reflection}

```python
metadata = MetaData(schema="example_db")
reflected = db.Table("events", metadata, autoload_with=engine)

print(reflected.engine.name)  # e.g. "MergeTree"

for col in reflected.columns:
    print(col.name, col.type)
```

Reflected columns include ClickHouse-specific attributes: `clickhousedb_default_type`, `clickhousedb_codec_expression`, `clickhousedb_ttl_expression`.

## Table engines {#table-engines}

Import from `clickhouse_connect.cc_sqlalchemy.ddl.tableengine`. All MergeTree-family engines accept `order_by`, `primary_key`, `partition_by`, and `sample_by`.

### MergeTree family {#mergetree-family}

| Engine                         | Extra parameters             |
|--------------------------------|------------------------------|
| `MergeTree`                    |                              |
| `ReplacingMergeTree`           | `ver` (optional)             |
| `SummingMergeTree`             |                              |
| `AggregatingMergeTree`         |                              |
| `CollapsingMergeTree`          | `sign` (required)            |
| `VersionedCollapsingMergeTree` | `sign`, `version` (required) |
| `GraphiteMergeTree`            | `config_section` (required)  |

```python
from clickhouse_connect.cc_sqlalchemy.ddl.tableengine import (
    MergeTree, ReplacingMergeTree, CollapsingMergeTree,
)

MergeTree(order_by="id", partition_by="toYYYYMM(created_at)")
ReplacingMergeTree(ver="updated_at", order_by="id")
CollapsingMergeTree(sign="sign", order_by="id")
```

### Replicated variants {#replicated-variants}

All MergeTree variants have `Replicated*` counterparts with optional `zk_path` and `replica` parameters:

```python
from clickhouse_connect.cc_sqlalchemy.ddl.tableengine import ReplicatedMergeTree

ReplicatedMergeTree(
    order_by="id",
    zk_path="/clickhouse/tables/{shard}/events",
    replica="{replica}",
)
```

### Shared variants {#shared-variants}

For ClickHouse Cloud: `SharedMergeTree`, `SharedReplacingMergeTree`, `SharedSummingMergeTree`, `SharedAggregatingMergeTree`, `SharedVersionedCollapsingMergeTree`, `SharedGraphiteMergeTree`.

### Simple and special engines {#simple-and-special-engines}

| Engine                                       | Parameters                              |
|----------------------------------------------|-----------------------------------------|
| `Memory`                                     |                                         |
| `Log`, `StripeLog`, `TinyLog`                |                                         |
| `Null`                                       |                                         |
| `Set`                                        |                                         |
| `File(fmt)`                                  | `fmt` (required)                        |
| `Dictionary(dictionary)`                     | `dictionary` (required)                 |
| `Merge(db_name, tables_regexp)`              | Both required                           |
| `Distributed(cluster, database, table, ...)` | `cluster`, `database`, `table` required |

## Inserts {#sqlalchemy-inserts}

```python
# Core insert
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="user_1"))

# Basic ORM insert
from sqlalchemy.orm import declarative_base, Session

Base = declarative_base(metadata=MetaData(schema="example_db"))

class User(Base):
    __tablename__ = "users"
    __table_args__ = (MergeTree(order_by=["id"]),)
    id = db.Column(UInt32, primary_key=True)
    name = db.Column(String)

Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(User(id=1, name="user_1"))
    session.bulk_save_objects([User(id=2, name="user_2")])
    session.commit()
```

## ClickHouse-specific JOINs {#clickhouse-specific-joins}

Standard SQLAlchemy `JOIN`s work via the normal `.join()` API. For ClickHouse-specific modifiers (`ANY`, `ALL`, `SEMI`, `ANTI`, `ASOF`, `GLOBAL`), use `ch_join()`:

```python
from clickhouse_connect.cc_sqlalchemy.sql.clauses import ch_join
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
events = Table("events", metadata, autoload_with=engine)

# ANY LEFT JOIN ... USING
stmt = select(users.c.name, events.c.event_type).select_from(
    ch_join(users, events, isouter=True, strictness="ANY", using=["user_id"])
)

# GLOBAL ALL INNER JOIN ... ON
stmt = select(users, events).select_from(
    ch_join(users, events, onclause=users.c.id == events.c.user_id,
            strictness="ALL", distribution="GLOBAL")
)
```

| Parameter      | Type       | Default    | Description                                        |
|----------------|------------|------------|----------------------------------------------------|
| `left`         | FromClause | *Required* | Left table                                         |
| `right`        | FromClause | *Required* | Right table                                        |
| `onclause`     | expression | *None*     | ON clause. Mutually exclusive with `using`.        |
| `isouter`      | bool       | False      | LEFT OUTER JOIN                                    |
| `full`         | bool       | False      | FULL OUTER JOIN                                    |
| `cross`        | bool       | False      | CROSS JOIN                                         |
| `using`        | list[str]  | *None*     | USING columns. Mutually exclusive with `onclause`. |
| `strictness`   | str        | *None*     | `"ALL"`, `"ANY"`, `"SEMI"`, `"ANTI"`, `"ASOF"`     |
| `distribution` | str        | *None*     | `"GLOBAL"`                                         |

## ARRAY JOIN {#array-join}

```python
from clickhouse_connect.cc_sqlalchemy.sql.clauses import array_join

# Single column
stmt = select(products.c.name, products.c.tags).select_from(
    array_join(products, products.c.tags, alias="tag")
)

# Multi-column (parallel expansion)
stmt = select(products).select_from(
    array_join(products, [products.c.names, products.c.prices], alias=["name", "price"])
)

# LEFT ARRAY JOIN (preserves rows with empty arrays)
stmt = select(products).select_from(
    array_join(products, products.c.tags, alias="tag", is_left=True)
)
```

## FINAL and SAMPLE {#final-and-sample}

```python
# FINAL modifier (forces merge of data parts)
stmt = select(events).final()

# SAMPLE (10% of data)
stmt = select(events).sample(0.1)

# SAMPLE with approximate row count
stmt = select(events).sample(10000)

# Both
stmt = select(events).final().sample(0.1)

# With joins, specify which table
stmt = select(events, users).select_from(events.join(users)).final(table=events)
```

## Scope and limitations {#scope-and-limitations}

- **Core focus.** The dialect supports SQLAlchemy Core: `SELECT` with standard and ClickHouse-specific `JOIN`s, `WHERE`, `ORDER BY`, `LIMIT`/`OFFSET`, `DISTINCT`, `FINAL`, `SAMPLE`, `ARRAY JOIN`.
- **DELETE with WHERE only.** Lightweight `DELETE` requires an explicit `WHERE`. Use `TRUNCATE TABLE` via raw SQL to clear a table.
- **No UPDATE.** ClickHouse is append-optimized. Use `ALTER TABLE ... UPDATE` via raw SQL if needed.
- **DDL and reflection.** Creating databases and tables works. Reflection returns column types and engine metadata. Traditional PK/FK/index metadata is not present.
- **ORM scope.** Declarative models and inserts via `Session.add()` / `bulk_save_objects()` work. Advanced ORM features (relationships, unit-of-work, cascading, eager/lazy loading) are not supported.
- **Primary key semantics.** `Column(..., primary_key=True)` is for SQLAlchemy identity only. It does not create a server-side constraint. Define `ORDER BY` via table engines.
- **Transactions.** `engine.begin()` provides a Python context manager but performs no transaction control. Commit and rollback are no-ops.
