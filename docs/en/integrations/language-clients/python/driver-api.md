---
sidebar_label: Driver API
sidebar_position: 20
keywords: [clickhouse, python, client, connect, integrate]
slug: /en/integrations/language-clients/python/driver-api
description: The ClickHouse Connect Core Driver API
---

# ClickHouse Connect Driver API

***Note:*** Passing keyword arguments is recommended for most api methods given the number of
possible arguments, many of which are optional.


## Client Initialization

The `clickhouse_connect.driver.client` class provides the primary interface between a Python application and the
ClickHouse database server. Use the `clickhouse_connect.get_client` function to obtain a Client instance, which accepts
the following arguments:

### Connection Arguments

| Parameter            | Type        | Default                       | Description                                                                                                                                                                                                                                                                 |
|----------------------|-------------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface            | str         | http                          | Must be http or https.                                                                                                                                                                                                                                                      |
| host                 | str         | *None*                        | The hostname or IP address of the ClickHouse server.  If not set, `localhost` will be used.                                                                                                                                                                                 |
| port                 | int         | 8123 or 8443                  | The ClickHouse HTTP or HTTPS port. If not set will default to 8123, or to 8443 if *secure*=*True* or *interface*=*https*.                                                                                                                                                   |
| username             | str         | *None*                        | The ClickHouse user name. If not set, the `default` ClickHouse user will be used.                                                                                                                                                                                           |
| password             | str         | *&lt;empty string&gt;*        | The password for *username*.                                                                                                                                                                                                                                                |
| database             | str         | *None*                        | The default database for the connection. If not set, ClickHouse Connect will use the default database for *username*.                                                                                                                                                       |
| secure               | bool        | False                         | Use https/TLS.  This overrides inferred values from the interface or port arguments.                                                                                                                                                                                        |
| dsn                  | str         | *None*                        | A string in standard DSN (Data Source Name) format.  Other connection values (such as host or user) will be extracted from this string if not set otherwise.                                                                                                                |
| compress             | bool or str | True                          | Enable compression for ClickHouse HTTP inserts and query results. See [Additional Options (Compression)](/docs/en/integrations/language-clients/python/options#compression)                                                                                                 |
| query_limit          | int         | 5000                          | Maximum number of rows to return for any `query` response. Set this to zero to return unlimited rows.  Note that large query limits may result in out of memory exceptions if results are not streamed, as all results are loaded into memory at once.                      |
| query_retries        | int         | 2                             | Maximum number of retries for a `query` request. Only "retryable" HTTP responses will be retried. `command` or `insert` requests are not automatically retried by the driver to prevent unintended duplicate requests.                                                      |
| connect_timeout      | int         | 10                            | HTTP connection timeout in seconds.                                                                                                                                                                                                                                         |
| send_receive_timeout | int         | 300                           | Send/receive timeout for the HTTP connection in seconds.                                                                                                                                                                                                                    |
| client_name          | str         | *None*                        | client_name prepended to the HTTP User Agent header. Set this to track client queries in the ClickHouse system.query_log.                                                                                                                                                   |
| send_progress        | bool        | True                          | This sets the ClickHouse settings `send_progress_in_http_headers=1` and `wait_end_of_query=1`. This ensures that the summary information returned by ClickHouse on query completion is populated, and also prevents ClickHouse from closing the connection on long queries. |
| pool_mgr             | obj         | *&lt;default PoolManager&gt;* | The `urllib3` library PoolManager to use.   For advanced use cases requiring multiple connection pools to different hosts.                                                                                                                                                  |
| http_proxy           | str         | *None*                        | HTTP proxy address (equivalent to setting the HTTP_PROXY environment variable).                                                                                                                                                                                             |
| https_proxy          | str         | *None*                        | HTTPS proxy address (equivalent to setting the HTTPS_PROXY environment variable).                                                                                                                                                                                           |

### HTTPS/TLS Arguments

| Parameter       | Type | Default | Description                                                                                                                                                                                                                                                                       |
|-----------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify          | bool | True    | Validate the ClickHouse server TLS/SSL certificate (hostname, expiration, etc.) if using HTTPS/TLS.                                                                                                                                                                               |
| ca_cert         | str  | *None*  | If *verify*=*True*, the file path to Certificate Authority root to validate ClickHouse server certificate, in .pem format. Ignored if verify is False. This is not necessary if the ClickHouse server certificate is a globally trusted root as verified by the operating system. |
| client_cert     | str  | *None*  | File path to a TLS Client certificate in .pem format (for mutual TLS authentication). The file should contain a full certificate chain, including any intermediate certificates.                                                                                                  |
| client_cert_key | str  | *None*  | File path to the private key for the Client Certificate. Required if the private key is not included the Client Certificate key file.                                                                                                                                             |

### Settings Argument

Finally, the `settings` argument to `get_client` is used to pass additional ClickHouse settings to the server for each client request.  Note that
in most cases, users with *readonly*=*1* access cannot alter settings sent with a query, so ClickHouse Connect will drop such settings in the final request and log a warning.
The following settings apply only to HTTP queries/sessions used by ClickHouse Connect, and are not documented as general ClickHouse settings.

| Setting           | Description                                                                                                                                                         |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | Buffer size (in bytes) used by ClickHouse Server before writing to the HTTP channel.                                                                                |
| session_id        | A unique session id to associate related queries on the server. Required for temporary tables.                                                                      |
| compress          | Whether the ClickHouse server should compress the POST response data. This setting should only be used for "raw" queries.                                           |
| decompress        | Whether the data sent to ClickHouse server must be decompressed. This setting is should only be used for "raw" inserts.                                             |
| quota_key         | The quota key associated with this requests. See the ClickHouse server documentation on quotas.                                                                     |
| session_check     | Used to check the session status.                                                                                                                                   |
| session_timeout   | Number of seconds of inactivity before the identified by the session id will timeout and no longer be considered valid. Defaults to 60 seconds.                     |
| wait_end_of_query | Buffers the entire response on the ClickHouse server. This setting is necessary to return summary information. It is set automatically when *send_progress*=*True*. |

For other ClickHouse settings that can be sent with each query, see [the ClickHouse documentation](https://clickhouse.com/docs/en/operations/settings/settings). 

### Client Creation Examples

- Without any parameters, a ClickHouse Connect client will connect to the default HTTP port on `localhost` with the
  default user and no password:

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

- Connecting with a session id and other custom connection parameters and ClickHouse settings.

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com',
                                       user='play',
                                       password='clickhouse',
                                       port=443,
                                       session_id='example_session_1',
                                       connect_timeout=15,
                                       database='github',
                                       settings={'distributed_ddl_task_timeout':300)
client.database                                       
Out[2]: 'github'
```

## Common Method Arguments

Several client methods use one or both of the common `parameters` and `settings` arguments.  These keyword
arguments are described below.

### Parameters Argument

ClickHouse Connect Client `query*` and `command` methods accept an optional `parameters` keyword argument used for
binding Python expressions to a ClickHouse value expression.  Two sorts of binding are available.

#### Server Side Binding

ClickHouse supports [server side binding](https://clickhouse.com/docs/en/interfaces/http/#cli-queries-with-parameters) for most query values,
where the bound value is sent separate from the query as an HTTP query parameter.  ClickHouse Connect will add the appropriate
query parameters if it detects a binding expression of the form {&lt;name&gt;:&lt;datatype&gt;}.  For server side binding,
the `parameters` argument should be a Python dictionary.

- Server Side Binding with Python Dictionary, DateTime value and string value

```python
import datetime

my_date = datetime.datetime(2022, 10, 01, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM some_table WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)

# Generates the following query on the server
# SELECT * FROM some_table WHERE date >= '2022-10-01 15:20:05' AND string ILIKE 'a string with a single quote\''  
```

#### Client Side Binding

ClickHouse Connect also supports client side parameter binding which can allow more flexibility in generating templated
SQL queries.  For client side binding, the `parameters` argument should be a dictionary or a sequence. Client side binding 
uses the Python ["printf" style](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) string formatting 
for parameter substitution.

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

### Settings Argument

All the core SQL Client ClickHouse database server accept an optional `settings` keyword argument used for passing
ClickHouse server [user settings](https://clickhouse.com/docs/en/operations/settings/settings) for the included SQL
statement. The `settings` argument should be a dictionary.  Each item should be a ClickHouse setting name and its
associated value. Note that values will be converted to strings when sent to the server as query parameters.

As with client level settings, ClickHouse Connect will drop any settings that the server marks as *readonly*=*1*, with
an associated log message. Settings that apply only to queries via the ClickHouse HTTP interface are always valid.  Those
settings are described under the `get_client` [API](#settings-argument).

Example of using ClickHouse settings:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)            
```

## Client _command_ Method

Use the `Client.command` method to send SQL queries to the ClickHouse Server that do not normally return data or return
a simple single value rather than a full dataset. This method takes the following parameters:

| Parameter    | Type             | Default    | Description                                                                                                                                                   |
|--------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd          | str              | *Required* | A ClickHouse SQL statement that returns a single value or a single row of values.                                                                             |                                                                                                                                                                                                                                                                              |
| parameters   | dict or iterable | *None*     | See [parameters description](#parameters-argument).                                                                                                           |
| data         | str or bytes     | *None*     | Optional data to include with the command as the POST body.                                                                                                   |
| settings     | dict             | *None*     | See [settings description](#settings-argument).                                                                                                               |
| use_database | bool             | True       | Use the client database (specified when creating the client). False means the command will use the default ClickHouse Server database for the connected user. |

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

## Client _query_ Method

The `Client.query` method is the primary way to retrieve a single "batch" dataset from the ClickHouse Server. It utilizes the Native
ClickHouse format over HTTP to transmit large datasets (up to approximately one million rows) efficiently. This method
takes the following parameters. 

| Parameter       | Type             | Default    | Description                                                                                                                                                                                       |
|-----------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query           | str              | *Required* | The ClickHouse SQL SELECT or DESCRIBE query.                                                                                                                                                      |
| parameters      | dict or iterable | *None*     | See [parameters description](#parameters-argument).                                                                                                                                               |
| settings        | dict             | *None*     | See [settings description](#settings-argument).                                                                                                                                                   |                                                                                                                                                |
| query_formats   | dict             | *None*     | Datatype formatting specification for result values. See Advanced Usage (Read Formats)                                                                                                            |
| column_formats  | dict             | *None*     | Datatype formatting per column. See Advanced Usage (Read Formats)                                                                                                                                 |
| encoding        | str              | *None*     | Encoding used to encode ClickHouse String columns into Python strings.  Python defaults to `UTF-8` if not set.                                                                                    |
| use_none        | bool             | True*      | Use Python *None* type for ClickHouse nulls. If False, use a datatype default (such as 0) for ClickHouse nulls. Note - defaults to False for numpy/Pandas for performance reasons.                |
| column_oriented | bool             | False      | Return the results as a sequence of columns rather than a sequence of rows.  Helpful for transforming Python data to other column oriented data formats.                                          |
| context         | QueryContext     | *None*     | A reusable QueryContext object can be used to encapsulate the above method arguments. See [Advanced Queries (QueryContexts)](/docs/en/integrations/language-clients/python/queries#querycontexts) |

### The QueryResult Object

The base `query` method returns a QueryResult object with the following public properties:

- `result_rows` -- A matrix of the data returned in the form of a Sequence of rows, with each row element being a
  sequence of column values.
- `result_columns` -- A matrix of the data returned in the form of a Sequence of columns, with each column element being a
sequence of the row values for that column
- `column_names` -- A tuple of strings representing the column names in the `result_set`
- `column_types` -- A tuple of ClickHouseType instances representing the ClickHouse data type for each column in
  the `result_columns`
- `query_id` -- The ClickHouse query_id (useful for examining the query in the `system.query_log` table)
- `summary` -- Any data returned by the `X-ClickHouse-Summary` HTTP response header
- `first_item` -- A convenience property for retrieving the first row of the response as a dictionary (keys are column names)
- `first_row` -- A convenience property to return the first row of the result
- `column_block_stream` -- A generator of query results in column oriented format.  This property should not be referenced directly (see below).
- `row_block_stream` -- A generator of query results in row oriented format.  This property should not be referenced directly (see below). 
- `rows_stream` -- A generator of query results that yields a single row per invocation.  This property should not be referenced directly (see below).

The `*_stream` properties return a Python Context that can be used as an iterator for the returned data.  They should only be
accessed indirectly using the Client `*_stream` methods.  In a future release, the QueryResult object returned by the main Client `query`
method will have consumed the stream and contain the entire populated `result_set` to provide a clean separation between
completed, "batch" results retrieved via the Client `query` method and streaming results retrieved via the Client `query_*_stream` methods.

The complete details of streaming query results (using StreamContext objects) are outlined in
[Advanced Queries (Streaming Queries)](/docs/en/integrations/language-clients/python/queries#streaming-queries).

Note -- streaming behavior from versions v0.5.0-v0.5.3 using the QueryResult object as a Python context is deprecated as version v0.5.4
and will be removed in a future release.  The QueryResult methods `stream_column_blocks`, `stream_row_blocks`, and `stream_rows`
should not be used and are only included for backward compatibility.


## Specialized Client Query Methods
There are three specialized versions of the main `query` method:

- `query_np` -- This version returns a Numpy Array instead a ClickHouse Connect QueryResult.  Note that the `use_none` argument
is defaulted to `False` for numpy arrays for performance reasons.
- `query_df` -- This version returns a Pandas Dataframe instead of a ClickHouse Connect QueryResult.  Note that the `use_none`
argument is defaulted to `False` for Pandas dataframes for performance reasons.
- `query_arrow` -- This version returns a PyArrow Table. It utilizes the ClickHouse `Arrow` format directly, so
  it only accepts three arguments in common with the main `query method`:  `query`, `parameters`, and `settings`. In
  addition there is additional argument `use_strings` which determines whether the Arrow Table will render ClickHouse
  String types as strings (if True) or bytes (if False).


## Client Streaming Query Methods
The ClickHouse Connect Client provides multiple methods for retrieving data as a stream (implemented as a Python generator):

- `query_column_block_stream` -- Returns query data in blocks as a sequence of columns using native Python object 
- `query_column_rows_stream` -- Returns query data as a block of rows using native Python object
- `query_rows_stream` -- Returns query data as a sequence of rows using native Python object
- `query_np_stream` -- Returns each ClickHouse block of query data as a Numpy array
- `query_df_stream` -- Returns each ClickHouse Block of query data as a Pandas Dataframe

Each of these methods returns a `ContextStream` object that must be opened via a `with` statement to start consuming the
stream.  See [Advanced Queries (Streaming Queries)](/docs/en/integrations/language-clients/python/queries#streaming-queries)
for details and examples.


## Client _insert_ Method

For the common use case of inserting multiple records into ClickHouse, there is the `Client.insert` method. It takes the
following parameters:

| Parameter         | Type                              | Default    | Description                                                                                                                                                                                           |
|-------------------|-----------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table             | str                               | *Required* | The ClickHouse table to insert into. The full table name (including database) is permitted.                                                                                                           |
| data              | Sequence of Sequences             | *Required* | The matrix of data to insert, either a Sequence of rows, each of which is a sequence of column values, or a Sequence of columns, each of which is a sequence of row values.                           |
| column_names      | Sequence of str, or str           | '*'        | A list of column_names for the data matrix. If '*' is used instead, ClickHouse Connect will execute a "pre-query" to retrieve all of the column names for the table.                                  |
| database          | str                               | ''         | The target database of the insert. If not specified, the database for the client will be assumed.                                                                                                     |
| column_types      | Sequence of ClickHouseType        | *None*     | A list of ClickHouseType instances. If neither column_types or column_type_names is specified, ClickHouse Connect will execute a "pre-query" to retrieve all the column types for the table.          |
| column_type_names | Sequence of ClickHouse type names | *None*     | A list of ClickHouse datatype names. If neither column_types or column_type_names is specified, ClickHouse Connect will execute a "pre-query" to retrieve all the column types for the table.         |
| column_oriented   | bool                              | False      | If True, the `data` argument is assume to be a Sequence of columns (and no "pivot" will be necessary to insert the data). Otherwise `data` is interpreted as a Sequence of rows.                      |
| settings          | dict                              | *None*     | See [settings description](#settings-argument).                                                                                                                                                       |
| insert_context    | InsertContext                     | *None*     | A reusable InsertContext object can be used to encapsulate the above method arguments.  See [Advanced Inserts (InsertContexts)](/docs/en/integrations/language-clients/python/inserts#insertcontexts) |

This method does not return a value. An exception will be raised if the insert fails for any reason.

There are two specialized versions of the main `query` method:

- `insert_df` -- Instead of Python Sequence of Sequences `data` argument, the second parameter of this method requires a `df`
argument that must be a Pandas Dataframe instance.  ClickHouse Connect automatically processes the Dataframe as a column oriented datasource,
so the `column_oriented` parameter is not required or available.
- `insert_arrow` -- Instead of a Python Sequence of Sequences `data` argument, this method requires an `arrow_table`.  ClickHouse
Connect passes the Arrow table unmodified to the ClickHouse server for processing, so only the `database` and `settings` arguments
are available in addition to `table` and `arrow_table`.

*Note:* A Numpy array is a valid Sequence of Sequences and can be used as the `data` argument to the main `insert` method, so a specialized
method is not required.

## File Inserts

The `clickhouse_connect.driver.tools` includes the `insert_file` method that allows inserting data directly from the file system
into an existing ClickHouse table.  Parsing is delegated to the ClickHouse server.  `insert_file` accepts the following parameters:

| Parameter    | Type            | Default           | Description                                                                                                                 |
|--------------|-----------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------|
| client       | Client          | *Required*        | The `driver.Client` used to perform the insert                                                                              |
| table        | str             | *Required*        | The ClickHouse table to insert into. The full table name (including database) is permitted.                                 |
| file_path    | str             | *Required*        | The native file system path to the data file                                                                                |
| fmt          | str             | CSV, CSVWithNames | The ClickHouse Input Format of the file.  CSVWithNames is assumed if `column_names` is not provided                         |
| column_names | Sequence of str | *None*            | A list of column_names in the data file.  Not required for formats that include column names                                |
| database     | str             | *None*            | Database of the table.  Ignored if the table is fully qualified.  If not specified, the insert will use the client database |
| settings     | dict            | *None*            | See [settings description](#settings-argument).                                                                             |  

For files with inconsistent data or date/time values in an unusual format, settings that apply to data imports (such as 
`input_format_allow_errors_num` and `input_format_allow_errors_num`) are recognized for this method.

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```

## Raw API

For use cases which do not require transformation between ClickHouse data and native or third party data types and structures,
the ClickHouse Connect client provides two methods for direct usage of the ClickHouse connection.

### Client _raw_query_ Method

The `Client.raw_query` method allows direct usage of the ClickHouse HTTP query interface using the client connection.  The
return value is an unprocessed `bytes` object.  It offers a convenient wrapper with parameter binding, error handling,
retries, and settings management using a minimal interface:

| Parameter  | Type             | Default    | Description                                                                               |
|------------|------------------|------------|-------------------------------------------------------------------------------------------|
| query      | str              | *Required* | Any valid ClickHouse query                                                                |
| parameters | dict or iterable | *None*     | See [parameters description](#parameters-argument).                                       |
| settings   | dict             | *None*     | See [settings description](#settings-argument).                                           |                                                                                                                                                |
| fmt        | str              | *None*     | ClickHouse Output Format for the resulting bytes.  (ClickHouse uses TSV if not specified) |

It is the caller's responsibility to handle the resulting `bytes` object.  Note that the `Client.query_arrow` is just a thin wrapper
around this method using the ClickHouse `Arrow` output format.

### Client _raw_insert_ Method

The `Client.raw_insert` method allows direct inserts of `bytes` objects or `bytes` object generators using the client
connection. Because it does no processing of the insert payload, it is highly performant.  The method provides options
to specify settings and insert format:

| Parameter    | Type                                   | Default    | Description                                                                                  |
|--------------|----------------------------------------|------------|----------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | Either the simple or database qualified table name                                           |
| column_names | Sequence[str]                          | *None*     | Column names for the insert block.  Required if the `fmt` parameter does not include names   |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | Data to insert.  Strings will be encoding with the client encoding.                          |
| settings     | dict                                   | *None*     | See [settings description](#settings-argument).                                              |                                                                                                                                                |
| fmt          | str                                    | *None*     | ClickHouse Input Format of the `insert_block` bytes.  (ClickHouse uses TSV if not specified) |

It is the caller's responsibility that the `insert_block` is in the specified format.  ClickHouse Connect uses these raw
inserts for file uploads and PyArrow Tables, delegating parsing to the ClickHouse server.