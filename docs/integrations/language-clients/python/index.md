---
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: 'The ClickHouse Connect Python driver for ClickHouse'
title: 'ClickHouse Connect'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# ClickHouse Connect {#clickhouse-connect}

ClickHouse Connect is the official Python driver for ClickHouse. It communicates over HTTP, making it compatible with load balancers, proxies, and firewalls out of the box.

## Install {#install}

```bash
pip install clickhouse-connect
```

Requires Python 3.10+.

## Quickstart {#quickstart}

```python
import clickhouse_connect

# Create a client
client = clickhouse_connect.get_client(
    host="localhost",
    username="default",
    password="password",
)

# Create a table
client.command("""
    CREATE TABLE IF NOT EXISTS example
    (id UInt32, name String, metric Float64)
    ENGINE MergeTree ORDER BY id
""")

# Insert rows
data = [
    [1, "event_a", 3.14],
    [2, "event_b", 2.72],
    [3, "event_c", 1.62],
]
client.insert("example", data, column_names=["id", "name", "metric"])

# Query rows
result = client.query("SELECT id, name, metric FROM example")
for row in result.result_rows:
    print(row)
# (1, 'event_a', 3.14)
# (2, 'event_b', 2.72)
# (3, 'event_c', 1.62)
```

That's the core client. `query`, `insert`, and `command` cover most use cases. The core client also has built-in support for Pandas DataFrames (`query_df`, `insert_df`), PyArrow Tables (`query_arrow`, `insert_arrow`), Polars, NumPy, and streaming queries. See [Querying](querying.md) and [Inserting](inserting.md) for the full set of methods.

For async applications, the same methods are available as coroutines via the [AsyncClient](async-concurrency.md).

## Connecting to localhost vs ClickHouse Cloud {#connecting}

**Localhost:**

```python
import clickhouse_connect

client = clickhouse_connect.get_client(
    host="localhost",
    username="default",
    password="password"
)
```

**ClickHouse Cloud:**

```python
import clickhouse_connect

client = clickhouse_connect.get_client(
    host="HOSTNAME.clickhouse.cloud",
    port=8443,
    username="default",
    password="your-password",
)
```

ClickHouse Cloud requires TLS (port 8443). You can also authenticate with a JWT access token instead of username/password:

```python
client = clickhouse_connect.get_client(
    host="HOSTNAME.clickhouse.cloud",
    port=8443,
    access_token="your-jwt-token",
)
```

For full connection options including TLS, DSN strings, and proxies, see [Driver API reference](driver-api.md).

## SQLAlchemy and DB-API {#sqlalchemy-and-dbapi}

If you're using a tool that expects a SQLAlchemy engine (like Apache Superset) or a PEP 249 DB-API connection, ClickHouse Connect provides both:

- [SQLAlchemy dialect](sqlalchemy.md) - a `clickhousedb://` dialect supporting SQLAlchemy Core queries, DDL, table reflection, and ClickHouse-specific features like `FINAL`, `SAMPLE`, and `ARRAY JOIN`.
- [DB-API 2.0](dbapi.md) - a standard `Connection`/`Cursor` interface for tools and libraries that expect PEP 249.

These are wrappers around the core client. For direct Python usage, the core client is simpler and more capable.

## Where to go next {#where-to-go-next}

- [Querying](querying.md) - Read data with `query`, `query_df`, `query_arrow`, and more.
- [Inserting](inserting.md) - Write data with `insert`, `insert_df`, `insert_arrow`, and file inserts.
- [Async and concurrency](async-concurrency.md) - AsyncClient, threading, sessions, and connection pooling.
- [Driver API reference](driver-api.md) - Full reference for connection arguments, method signatures, and settings.

## Extras {#extras}

Optional dependencies are as follows. Pandas, Numpy, Arrow, and Polars are all lazy-loaded but it's still recommended to install only the extras you use:

```bash
pip install clickhouse-connect[pandas]       # Pandas DataFrame support
pip install clickhouse-connect[numpy]        # NumPy array support
pip install clickhouse-connect[arrow]        # PyArrow support
pip install clickhouse-connect[polars]       # Polars via PyArrow
pip install clickhouse-connect[sqlalchemy]   # SQLAlchemy dialect
pip install clickhouse-connect[async]        # AsyncClient via aiohttp
pip install clickhouse-connect[orjson]       # Faster JSON with orjson
pip install clickhouse-connect[tzlocal]      # Auto local timezone detection
pip install clickhouse-connect[pandas,async] # Combine multiple extras
```

## Compatibility {#compatibility}

**Python:** 3.10 - 3.14. Free-threaded 3.14t builds are provided but are considered experimental and not yet verified against the no-GIL runtime.

**Platforms:** Linux (x86, ARM64), macOS (x86, ARM), Windows. Binary wheels with C optimizations are built for all [cibuildwheel](https://cibuildwheel.readthedocs.io/en/stable/) architectures. The source installation works as pure Python on any platform.

**ClickHouse Server:** For the current state of officially supported server releases, see [security.md](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). We support the two most recent LTS releases and the three most recent stable releases. ClickHouse Connect generally works fine with versions outside this range as well, but these are the officially supported releases.

**SQLAlchemy:** 1.4.40+ and 2.x.

## Support {#support}

Please update to the latest version before reporting issues. File bugs in the [GitHub project](https://github.com/ClickHouse/clickhouse-connect/issues).
