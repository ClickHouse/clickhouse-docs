---
sidebar_label: Introduction
sidebar_position: 10
keywords: [clickhouse, python, client, connect, integrate]
slug: /en/integrations/language-clients/python/intro
description: The ClickHouse Connect project suite for connecting Python to ClickHouse
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Python Integration with ClickHouse Connect

## Introduction

ClickHouse Connect is a suite of Python packages providing interoperability with a wide range of Python applications.
The three primary components are:

- A low level driver in the package `clickhouse_connect.driver`. This package includes a basic client that handles
  all ClickHouse Connect requests to the ClickHouse Server, as well assorted helper classes and utility functions.
- A limited [SQLAlchemy](https://www.sqlalchemy.org/) dialect in the package `clickhouse_connect.cc_sqlalchemy`. This
  package focuses implements query/cursor functionality, and does not generally support SQLAlchemy DDL and ORM
  operations.
  (SQLAlchemy is targeted toward OLTP databases, and we recommend more specialized tools and frameworks to manage
  the ClickHouse OLAP database.)
- An Apache [Superset](https://superset.apache.org/) EngineSpec in the `clickhouse_connect.cc_superset`. This package will
  automatically add a **ClickHouse Connect** Superset connector when ClickHouses Connect is installed. This EngineSpec
  supports all core Superset query functionality, but does not currently support certain advanced features such as file
  upload to a ClickHouse table.

This documentation is current as of the beta release 0.5.4.

## Requirements and Compatibility

| Python    | | Platform¹   | | ClickHouse | | SQLAlchemy² | | Apache Superset | |
|--:|:--|--:|:--|--:|:--|--:|:--|--:|:--|
| 2.x, <3.7 | ❌ | Linux (x86)     | ✅      | <22.3³     | 🟡 | <1.3       | ❌     | <1.4     | ❌      |
| 3.7.x     | ✅ | Linux (Aarch64) | ✅      | 22.3.x     | ✅ | 1.3.x      | ✅     | 1.4.x    | ✅      |
| 3.8.x     | ✅ | macOS (x86)     | ✅      | 22.4-22.7³ | 🟡 | 1.4.x      | ✅     | 1.5.x    | ✅      |
| 3.9.x     | ✅ | macOs (M1)      | ✅      | 22.8.x     | ✅ | >=2.x      | ❌     | 2.0.x    | ✅      |
| 3.10.x    | ✅ | Windows         | ✅      | 22.9-22.10³| 🟡 |            |        |          |        |
| 3.11.x    | ✅ |                 |         | 22.11.x    | ✅ |            |        |          |        |
|           |    |                 |         | 22.12.x    | ✅ |            |        |          |        |
|           |    |                 |         | 23.1.x    | ✅ |            |        |          |        |

¹ClickHouse Connect has been explicitly tested against the listed platforms.  In addition, untested binary wheels (with C
optimization) are built for all architectures supported by the excellent [cibuildwheel](https://cibuildwheel.readthedocs.io/en/stable/) project.
Finally, because ClickHouse Connect can also run as pure Python, the source installation should work on any recent
Python installation.

²Again SQLAlchemy support is limited primarily to query functionality.  The full SQLAlchemy API is not supported.

³ClickHouse Connect has been tested against all currently supported ClickHouse versions. Because it uses the HTTP
protocol, it should also work correctly for most other versions of ClickHouse, although there may be some
incompatibilities with certain advanced data types.


## Installation

Install ClickHouse Connect from PyPI via pip:

`pip install clickhouse-connect`

ClickHouse Connect can also be installed from source:
* `git clone` the [GitHub repository](https://github.com/ClickHouse/clickhouse-connect).
* (Optional) run `pip install cython` to build and enable the C/Cython optimizations
* `cd` to the project root directory and run `pip install .`

## Support Policy

ClickHouse Connect is currently in beta and only the current beta release is actively supported. Please update to the latest
version before reported any issues. Issues should be filed in
the [GitHub project](https://github.com/ClickHouse/clickhouse-connect/issues).  
Future releases of ClickHouse Connect are guaranteed to be compatible with actively supported ClickHouse versions at the
time of release (generally the three most recent `stable` and two most recent `lts` releases).

## Basic Usage

### Gather your connection details

<ConnectionDetails />

### Establish a connection

There are two examples shown for connecting to ClickHouse:
- Connecting to a ClickHouse server on localhost.
- Connecting to a ClickHouse Cloud service.

#### Use a ClickHouse Connect client instance to connect to a ClickHouse server on localhost:


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

#### Use a ClickHouse Connect client instance to connect to a ClickHouse Cloud service:

:::tip
Use the connection details gathered earlier.  ClickHouse Cloud services require TLS, so use port 8443.
:::


```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

### Interact with your database

To run a ClickHouse SQL command, use the client `command` method:

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

To insert batch data, use the client `insert` method with a two-dimensional array of rows and values:

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric']) 
```

To retrieve data using ClickHouse SQL, use the client `query` method:

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
result.result_rows
Out[13]: [(2000, -50.9035)]
```

