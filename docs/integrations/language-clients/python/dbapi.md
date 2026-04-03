---
sidebar_label: 'DB-API'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'dbapi', 'pep249', 'cursor']
description: 'DB-API 2.0 (PEP 249) interface for clickhouse-connect'
slug: /integrations/language-clients/python/dbapi
title: 'DB-API 2.0'
doc_type: 'guide'
---

# DB-API 2.0 {#dbapi}

ClickHouse Connect includes a [PEP 249](https://peps.python.org/pep-0249/) (DB-API 2.0) interface. Use this when you need compatibility with tools, frameworks, or libraries that expect a standard Python database connection.

For most applications, the [Core Client](querying.md) is a better fit because it exposes streaming, DataFrame, Arrow, and context features that the DB-API cursor does not surface. Use the DB-API when interoperability with PEP 249 tooling is the priority.

## Connect {#connect}

```python
from clickhouse_connect import dbapi

conn = dbapi.connect(
    host="localhost",
    port=8123,
    username="default",
    password="password",
    database="default",
)
```

The `connect` function accepts `host`, `database`, `username`, `password`, `port`, `secure`, and any additional keyword arguments supported by the core `get_client` function.

## Cursor basics {#cursor-basics}

```python
cursor = conn.cursor()

# Execute a query
cursor.execute("SELECT number, toString(number) AS str FROM system.numbers LIMIT 5")

# Fetch all rows
rows = cursor.fetchall()
for row in rows:
    print(row)
# (0, '0')
# (1, '1')
# (2, '2')
# (3, '3')
# (4, '4')

# Column metadata (PEP 249 description)
for col in cursor.description:
    print(col[0], col[1])  # name, type_code
# number UInt64
# str String

cursor.close()
conn.close()
```

## Fetch methods {#fetch-methods}

```python
cursor.execute("SELECT number FROM system.numbers LIMIT 5")

# One row at a time
row = cursor.fetchone()
print(row)  # (0,)

# Multiple rows
rows = cursor.fetchmany(size=3)
print(rows)  # [(1,), (2,), (3,)]

# Remaining rows
rest = cursor.fetchall()
print(rest)  # [(4,)]
```

## Parameters {#parameters}

Parameters work the same as the core client. Both server-side and client-side binding are supported:

```python
# Server-side binding
cursor.execute(
    "SELECT * FROM events WHERE id = {id:UInt32}",
    {"id": 17},
)

# Client-side binding (printf-style)
cursor.execute(
    "SELECT * FROM events WHERE status = %(s)s",
    {"s": "active"},
)
```

## executemany {#executemany}

`executemany` runs the same statement with different parameter sets. For bulk inserts, pass a list of dicts:

```python
cursor.executemany(
    "INSERT INTO events (id, event_type) VALUES",
    [
        {"id": 1, "event_type": "click"},
        {"id": 2, "event_type": "view"},
        {"id": 3, "event_type": "purchase"},
    ],
)
```

## Commands {#commands}

DDL and other non-SELECT statements work through `execute`:

```python
cursor.execute("CREATE TABLE t (id UInt32) ENGINE MergeTree ORDER BY id")
cursor.execute("DROP TABLE t")
```

For single-value queries or DDL, you can also use the connection's `command` method directly:

```python
result = conn.command("SELECT count() FROM system.tables")
print(result)  # 151
```

## Cursor properties {#cursor-properties}

| Property      | Type           | Description                                        |
|---------------|----------------|----------------------------------------------------|
| `description` | list of tuples | Column metadata per PEP 249 (name, type_code, ...) |
| `rowcount`    | int            | Number of rows in the last result                  |
| `arraysize`   | int            | Default fetch size hint for `fetchmany`            |
| `summary`     | list of dicts  | Query summary for each executed statement          |

## Transactions {#transactions}

ClickHouse does not support transactions. `conn.commit()` and `conn.rollback()` are no-ops, present only for PEP 249 compliance.

## Scope and limitations {#scope-and-limitations}

- The DB-API interface wraps the core `Client` internally. Performance characteristics are the same.
- `cursor.execute` runs a single statement. Multi-statement strings are not supported.
- Advanced features like streaming, DataFrame queries, and Arrow inserts are not exposed through the DB-API. Use the [Core Client](querying.md) for those.
- The `Connection` object also exposes `command()` for convenience if you need it alongside DB-API usage.
