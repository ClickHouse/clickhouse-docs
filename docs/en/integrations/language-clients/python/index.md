---
sidebar_label: ClickHouse Connect
sidebar_position: 1
keywords: [clickhouse, python, client, connect, integrate]
slug: /en/integrations/python
description: A suite of Python packages for connecting Python to ClickHouse
---

# ClickHouse Connect

## Introduction
ClickHouse Connect is a suite of packages providing interoperability with a wide range of Python applications.
The three primary components are:

- A low level driver in the package `clickhouse_connect.driver`.  This package includes a basic client that handles 
all ClickHouse Connect requests to the ClickHouse Server, as well assorted helper classes and utility functions.
- A limited SQLAlchemy dialect in the package `clickhouse_connect.cc_sqlalchemy`.  This package focuses
implements query/cursor functionality, and does not generally support SQLAlchemy DDL and ORM operations.
(SQLAlchemy is targeted toward OLTP databased, and we recommend more specialized tools and frameworks to manage
the ClickHouse OLAP database.)
- A Superset EngineSpec in the `clickhouse_connect.cc_superset`.  This package will automatically add a **ClickHouse
Connect** Superset connector when ClickHouses Connet installed.  This EngineSpec supports all core Superset query
functionality, but does not currently support certain advanced features such as file upload to a ClickHouse table.

## Requirements and Compatibility

ClickHouse Connect requires Python 3.7 or greater.  It has been tested on Linux (x86 and Aarch64), Windows, and Mac OS
(x86 and M1), but should run on most Python installations.

ClickHouse Connect uses the ClickHouse HTTP protocol and has been tested against all currently supported ClickHouse
versions.  It should also work correctly for most older versions of ClickHouse.

The limited SQLAlchemy implementation is compatible with SQLAlchemy versions 1.3.x and 1.4.x.  The ClickHouse Connect
Superset package is compatible with and has been tested against Superset versions 1.4.x, 1.5.x, and 2.0.0.

## Installation

Install ClickHouse Connect from PyPI via pip:

`pip install clickhouse-connect`

ClickHouse connect can also be installed from source by checking out the GitHub repository and running `pip install .` 
in the project root directory.


## Support Policy

ClickHouse Connect is currently in beta and only the current beta release is supported.  Please update to the latest
version before reported any issues.  Issues should be filed in the [GitHub project](https://github.com/ClickHouse/clickhouse-connect/issues).

## Basic Usage

Use a ClickHouse Connect client instance to connect to the ClickHouse server:

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

To execute a ClickHouse SQL command, use the client `command` method:
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
result.result_set
Out[13]: [(2000, -50.9035)]
```

## Core Driver API

### Client Initialization

The `clickhouse_connect.driver.client` class provides the primary interface between a Python application and the
ClickHouse database server. Use the `clickhouse_connect.get_client` function to obtain a Client instance, which accepts
the following parameters:

#### Connection Parameters
| Parameter            | Type | Default            | Description                                                                                                                                                                                                                                                                  |
|----------------------|------|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface            | str  | http               | Must be http or https.                                                                                                                                                                                                                                                       |
| host                 | str  | localhost          | The hostname or IP address of the ClickHouse server                                                                                                                                                                                                                          |
| port                 | int  | 8123 or 8443       | The ClickHouse HTTP or HTTPS port.  If not set will default to 8123, or to 8443 if *secure*=*True* or *interface*=*https*.                                                                                                                                                   |
| username             | str  | *None*             | The ClickHouse user name.  If not set, the default ClickHouse user will be used.                                                                                                                                                                                             |
| password             | str  | *<empty string*>   | The password for *username*.                                                                                                                                                                                                                                                 |
| database             | str  | *None*             | The default database for the connection.  If not set, ClickHouse Connect will use the default database for *username*.                                                                                                                                                       |
| compress             | bool | True               | Request gzip compression from ClickHouse HTTP requests.  Either the ClickHouse server must have the setting `enable_http_compression=1`, or the *username* must have permission to send settings with the request.                                                           |
| query_limit          | int  | 5000               | Maximum number of rows to return for any `query` response.  Set this to zero to return unlimited rows.                                                                                                                                                                       |
| query_retries        | int  | 2                  | Maximum number of retries for a `query` request.  Only "retryable" HTTP responses will be retried.  `command` or `insert` requests are not automatically retried by the driver to prevent unintended duplicate requests.                                                     |
| connect_timeout      | int  | 10                 | HTTP connection timeout in seconds.                                                                                                                                                                                                                                          |
| send_receive_timeout | int  | 300                | Send/receive timeout for the HTTP connection in seconds.                                                                                                                                                                                                                     |
| client_name          | str  | clickhouse-connect | HTTP User agent string.  Modifying this to track client queries in the ClickHouse system.query_log.                                                                                                                                                                          |
| send_progress        | bool | True               | This sets the ClickHouse settings `send_progress_in_http_headers=1` and `wait_end_of_query=1`.  This ensures that the summary information returned by ClickHouse on query completion is populated, and also prevents ClickHouse from closing the connection on long queries. |

#### HTTPS/TLS Parameters
| Parameter       | Type | Default | Description                                                                                                                                                                                                                                                                        |
|-----------------|------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify          | bool | True    | Validate the ClickHouse server TLS/SSL certificate (hostname, expiration, etc.) if using HTTPS/TLS.                                                                                                                                                                                |
| ca_cert         | str  | *None*  | If *verify*=*True*, the file path to Certificate Authority root to validate ClickHouse server certificate, in .pem format.  Ignored if verify is False.  This is not necessary if the ClickHouse server certificate is a globally trusted root as verified by the operating system |
| client_cert     | str  | *None*  | File path to a TLS Client certificate in .pem format (for mutual TLS authentication).  The file should contain a full certificate chain, including any intermediate certificates                                                                                                   |
| client_cert_key | str  | *None*  | File path to the private key for the Client Certificate.  Required if the private key is not included the Client Certificate key file                                                                                                                                              |
                                                                                                                                                                                                                                                                                   |
#### Additional Parameters

Additional keyword args to `clickhouse_connect.get_client` not listed above are used as query parameters for all requests to the ClickHouse server.
Because they are sent as query parameters, all values for these additional arguments are converted to strings.  
The following parameters are related to the actual query or command:

| Parameter         | Description                                                                                                                                                           |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | Buffer size (in bytes) used by ClickHouse Server before writing to the HTTP channel.                                                                                  |
| session_id        | A unique session id to associate related queries on the server.  Required for temporary tables.                                                                       |
| compress          | Whether the ClickHouse server should compress the POST response data.  This setting should only be used for "raw" requests.                                           |
| decompress        | Whether the data sent to ClickHouse server must be decompressed.  This setting is should only be used for "raw" requests.                                             |
| quota_key         | The quota key associated with this requests.  See the ClickHouse server documentation on quotas.                                                                      |
| session_check     | Used to check the session status.                                                                                                                                     |
| session_timeout   | Number of seconds of inactivity before the identified by the session id will timeout and no longer be considered valid.  Defaults to 60 seconds.                      |
| wait_end_of_query | Buffers the entire response on the ClickHouse server.  This setting is necessary to return summary information.  It is set automatically when *send_progress*=*True*. |

All other keyword args and interpreted as ClickHouse user settings for each request. Please see the full ClickHouse  documentation for a complete list.  Note that
in most cases, users with *readonly*=*1* access cannot alter settings sent with a query, so ClickHouse Connect will drop such settings in the final request and log a warning.

#### Client Creation Examples

- Without any parameters, a ClickHouse Connect client will connect to the default HTTP port on localhost with the default user and no password:
```python
import clickhouse_connect

client = clickhouse_connect.get_client()
client.server_version
Out[2]: '22.10.1.98'
```
- Connecting to a secure (https) external ClickHouse server
```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
client.command('SELECT timezone()')
Out[2]: 'Etc/UTC'
```

- Connecting with a session id and other custom connection parameters
```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com',
                                       user='play',
                                       password='clickhouse',
                                       port=443,
                                       session_id='example_session_1',
                                       connect_timeout=15,
                                       database='github',
                                       distributed_ddl_task_timeout=300)
client.database                                       
Out[2]: 'github'
```

### Client Core SQL Methods 

ClickHouse Connect provides four core methods for executing SQL statements against a ClickHouse database.

- `raw_query` -- Execute any SQL statement and return the raw response as a byte array.  This bypasses any additional processing by the ClickHouse Connect driver.
- `command` -- Execute a SQL command that does not return data
- `query` -- Execute a SQL query and return a result set of Python values.  There are also specialized variants:
  - `query_np` -- Execute a SQL query and return a Numpy array (Numpy installation required)
  - `query_df` -- Execute a SQL query and return a Pandas Dataframe
  - `query_arrow` -- Execute a SQL query and return a PyArrow Table
- `insert` -- Insert a matrix of Python data into ClickHouse.  It also has specialized variants:
  - `insert_df` -- Insert a Pandas Dataframe
  - `insert_arrow` -- Insert a PyArrow Table

#### Parameters Argument 

ClickHouse Connect Client `query*` and `command` methods accept an optional `parameters` keyword argument used for 
binding Python expressions to a ClickHouse value expression in the rendered SQL.  The `parameters` argument should be
a dictionary or a sequence.  ClickHouse Connect currently uses the Python
["printf" style](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 
string formatting for parameter substitution.

- Example with Python Dictionary, DateTime value and string escaping
```python
import datetime

my_date = datetime.datetime(2022, 10, 01, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)

# Generates the following query:
# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''  
```

- Example with Python Sequence (Tuple), Float64, and IPv4Address
```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)

# Generates the following query:
# SELECT * FROM some_table WHERE metric >= 35200.44 AND ip_address = '68.61.4.254''  
```

#### Settings Argument

All the core SQL Client ClickHouse database server accept an optional `settings` keyword argument used for passing 
ClickHouse Server users settings for the included SQL statement.  The `settings` argument should be a dictionary.
Each item should be a ClickHouse setting name and its associated value.  Values will be converted to strings when sent
to the server as query parameters.

As with client level settings, ClickHouse Connect will drop any settings that the server marks as *readonly*=*1*, with
an associated log message.  Settings that apply only to queries via the ClickHouse HTTP interface are always valid.
Currently those include `buffer_size`, `session_id`, `compress`, `decompress`,
`session_timeout`, `session_check`, `query_id`, `quota_key`, and `wait_end_of_query`.

Example of using ClickHouse settings:
```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)            
```

### Client _command_ Method

Use the `Client.command` method to send SQL queries to the ClickHouse Server that do not normally return data or return a simple single
value rather than a full dataset.  This method takes the following parameters:

| Parameter    | Type             | Default    | Description                                                                                                                                                                     |
|--------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd          | str              | *Required* | A ClickHouse SQL statement that returns a single value or a single row of values.                                                                                               |                                                                                                                                                                                                                                                                              |
| parameters   | dict or iterable | *None*     | See [parameters description](#parameters-argument).                                                                                                                             |
| data         | str or bytes     | *None*     | Optional data to include with the command as the POST body.                                                                                                                     |
| settings     | dict             | *None*     | See [settings description](#settings-argument).                                                                                                                                 | 
| use_database | bool             | True       | Use the client database (specified when creating the client).  False means the command will use the default ClickHouse Server database for the connected user. |

- _command_ can be used for DDL statements
```python
client.command('CREATE TABLE test_command (col_1 String, col_2 DateTime) Engine MergeTree ORDER BY tuple()')
client.command('SHOW CREATE TABLE test_command')
Out[6]: 'CREATE TABLE default.test_command\\n(\\n    `col_1` String,\\n    `col_2` DateTime\\n)\\nENGINE = MergeTree\\nORDER BY tuple()\\nSETTINGS index_granularity = 8192'
```

- _command_ can also be used for simple queries that return only a single row
```python
result = client.command('SELECT count() FROM system.tables')
result
Out[7]: 110
```

### Client _query_ Method

The `Client.query` method is the primary way to retrieve data from the ClickHouse Server.  It utilizes the Native
ClickHouse format over HTTP to transmit large datasets (up to approximately one million rows) efficiently.  This method
takes the following parameters:

| Parameter      | Type             | Default    | Description                                                                                                                                                                                 |
|----------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query          | str              | *Required* | The ClickHouse SQL SELECT or DESCRIBE query.                                                                                                                                                |
| parameters     | dict or iterable | *None*     | See [parameters description](#parameters-argument).                                                                                                                                         |
| settings       | dict             | *None*     | See [settings description](#settings-argument).                                                                                                                                             |                                                                                                                                                  |
| encoding       | str              | *None*     | Encoding used to encode ClickHouse String columns into Python strings.                                                                                                                      |
| use_none       | bool             | True       | Use Python *None* type for ClickHouse nulls.  If False, use a datatype default (such as 0) for ClickHouse nulls.  This is useful for some library data structures that don't accept *None*. |
| context        | QueryContext     | *None*     | A QueryContext object can be used to encapsulate all of the above method arguments.  This is useful for reusing the same group of settings.                                                 |

The base `query` method returns a QueryResult object with the following properties:
- `result_set` -- A matrix representing the data returned.  It consists of a Sequence of rows, with each row being a sequence of column values
- `column_names` -- A tuple of strings representing the column names in the `result_set`
- `column_types` -- A tuple of ClickHouseType instances representing the ClickHouse data type for column in the `result_set`
- `query_id` -- The ClickHouse query_id (useful for examining the query in the `system.query_log` table)
- `summary` -- Any data returned by the `X-ClickHouse-Summary` HTTP response header

There are three specialized versions of the main `query` method:
- `query_np` -- This version returns a Numpy Array instead a ClickHouse Connect QueryResult.  The same method arguments are available (except `use_none`, which is always False for Numpy Arrays).
- `query_df` -- This version returns a Pandas Dataframe instead of a ClickHouse Connect QueryResult.  Again the same method arguments are available, except `use_none`.
- `query_arrow` -- This version returns a PyArrow Table.  It utilizes the ClickHouse `Arrow` format directly, so
it only accepts three arguments in common with the main `query method`:  `query`, `parameters`, and `settings`.  In addition there is additional argument `use_strings` which
determines whether the Arrow Table will render ClickHouse String types as strings (if True) or bytes (if False).

### Client _insert_ Method

For the common use case of inserting multiple records into ClickHouse, there is the `Client.insert` method. It takes the
following parameters:

| Parameter         | Type                              | Default    | Description                                                                                                                                                                                           |
|-------------------|-----------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                               | *Required* | The ClickHouse table to insert into.  The full table name (including database) is permitted.                                                                                                          |
| data              | Sequence of Sequences             | *Required* | The matrix of data to insert, either a Sequence of rows, each of which is a sequence of column values, or a Sequence of columns, each of which is a sequence of row values.                           |
| column_names      | Sequence of str, or str           | '*'        | A list of column_names for the data matrix.  If '*' is used instead, ClickHouse Connect will execute a "pre-query" to retrieve all of the column names for the table.                                 |
| database          | str                               | ''         | The target database of the insert. If not specified, the database for the client will be assumed.                                                                                                     |
| column_types      | Sequence of ClickHouseType        | *None*     | A list of ClickHouseType instances. If neither column_types or column_type_names is specified, ClickHouse Connect will execute a "pre-query" to retrieve all the column types for the table.          |
| column_type_names | Sequence of ClickHouse type names | *None*     | A list of ClickHouse datatype names. If neither column_types or column_type_names is specified, ClickHouse Connect will execute a "pre-query" to retrieve all the column types for the table.         |
| column_oriented   | bool                              | False      | If True, the `data` argument is assume to be a Sequence of columns (and no "pivot" will be necessary to insert the data).  Otherwise `data` is interpreted as a Sequence of rows. |
| settings          | dict                              | *None*     | See [settings description](#settings-argument).                                                                                                                                                                             |

This method does not return a value.  An exception will be raised if the insert fails for any reason.

There are two specialized versions of the main `query` method:
- `insert_df` -- This method requires a `data_frame` argument that must be a Pandas Dataframe instance.  In addition to
`data_frame`, the  destination `table` argument is required, and the optional `database` and `settings` arguments may also be specified.
- `insert_arrow` -- This method requires an `arrow_table` argument that must be a PyArrow Table instance.  In addition to
`arrow_table`, the  destination `table` argument is required, and the optional `database` and `settings` arguments may also be specified.

(Note that a Numpy array is a valid Sequence of Sequences, so it can be used as the `data` argument to the main `insert` method).
