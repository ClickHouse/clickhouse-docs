---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'ClickHouse SQLAlchemy Support'
slug: /integrations/language-clients/python/sqlalchemy
title: 'SQLAlchemy Support'
doc_type: 'reference'
---

ClickHouse Connect includes a SQLAlchemy dialect (`clickhousedb`) built on top of the core driver. It targets SQLAlchemy Core APIs and supports SQLAlchemy 1.4.40+ and 2.0.x.

## Connect with SQLAlchemy {#sqlalchemy-connect}

Create an engine using either `clickhousedb://` or `clickhousedb+connect://` URLs. Query parameters map to ClickHouse settings, client options, and HTTP/TLS transport options.

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

Notes on URL/query parameters:
- ClickHouse settings: pass as query parameters (for example, `use_skip_indexes=0`).
- Client options: `compression` (alias for `compress`), `query_limit`, timeouts, and more.
- HTTP/TLS options: options for the HTTP pool and TLS (for example, `ch_http_max_field_name_size=99999`, `ca_cert=certifi`).

See [Connection arguments and Settings](driver-api.md#connection-arguments) in the sections below for the full list of supported options. These can also be supplied via the SQLAlchemy DSN.

## Core queries {#sqlalchemy-core-queries}

The dialect supports SQLAlchemy Core `SELECT` queries with joins, filters, ordering, limits/offsets, and `DISTINCT`.

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

You can create databases and tables using the provided DDL helpers and type/engine constructs. Table reflection (including column types and engine) is supported.

```python
import sqlalchemy as db
from sqlalchemy import MetaData
from clickhouse_connect.cc_sqlalchemy.ddl.custom import CreateDatabase, DropDatabase
from clickhouse_connect.cc_sqlalchemy.ddl.tableengine import MergeTree
from clickhouse_connect.cc_sqlalchemy.datatypes.sqltypes import UInt32, String, DateTime64

with engine.begin() as conn:
    # Databases
    conn.execute(CreateDatabase("example_db", exists_ok=True))

    # Tables
    metadata = MetaData(schema="example_db")
    table = db.Table(
        "events",
        metadata,
        db.Column("id", UInt32, primary_key=True),
        db.Column("user", String),
        db.Column("created_at", DateTime64(3)),
        MergeTree(order_by="id"),
    )
    table.create(conn)

    # Reflection
    reflected = db.Table("events", metadata, autoload_with=engine)
    assert reflected.engine is not None
```

Reflected columns include dialect-specific attributes such as `clickhousedb_default_type`, `clickhousedb_codec_expression`, and `clickhousedb_ttl_expression` when present on the server.

## Inserts (Core and basic ORM) {#sqlalchemy-inserts}

Inserts work via SQLAlchemy Core as well as with simple ORM models for convenience.

```python
# Core insert
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))

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
    session.add(User(id=1, name="Alice"))
    session.bulk_save_objects([User(id=2, name="Bob")])
    session.commit()
```

## Scope and limitations {#scope-and-limitations}
- Core focus: Enable SQLAlchemy Core features like `SELECT` with `JOIN`s (`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`), `WHERE`, `ORDER BY`, `LIMIT`/`OFFSET`, and `DISTINCT`.
- `DELETE` with `WHERE` only: The dialect supports lightweight `DELETE` but requires an explicit `WHERE` clause to avoid accidental full-table deletes. To clear a table, use `TRUNCATE TABLE`.
- No `UPDATE`: ClickHouse is append-optimized. The dialect does not implement `UPDATE`. If you need to change data, apply transformations upstream and re-insert, or use explicit text SQL (for example, `ALTER TABLE ... UPDATE`) at your own risk.
- DDL and reflection: Creating databases and tables is supported, and reflection returns column types and table engine metadata. Traditional PK/FK/index metadata is not present because ClickHouse does not enforce those constraints.
- ORM scope: Declarative models and inserts via `Session.add(...)`/`bulk_save_objects(...)` work for convenience. Advanced ORM features (relationship management, unit-of-work updates, cascading, eager/lazy loading semantics) are not supported.
- Primary key semantics: `Column(..., primary_key=True)` is used by SQLAlchemy for object identity only. It does not create a server-side constraint in ClickHouse. Define `ORDER BY` (and optional `PRIMARY KEY`) via table engines (for example, `MergeTree(order_by=...)`).
- Transactions and server features: Two-phase transactions, sequences, `RETURNING`, and advanced isolation levels are not supported. `engine.begin()` provides a Python context manager for grouping statements but performs no actual transaction control (commit/rollback are no-ops).
