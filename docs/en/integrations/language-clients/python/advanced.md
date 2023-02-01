---
sidebar_label: Advanced Usage
sidebar_position: 40
keywords: [clickhouse, python, client, connect, integrate]
slug: /en/integrations/language-clients/python/advanced
description: Advanced Usage Patterns in ClickHouse Connect
---

# Advanced Usage

ClickHouse Connect provides a number of additional tools for advanced use cases and for simplifying many common or repetitive
tasks when working with ClickHouse data.

##

## Global Settings

There are a small number of settings that control ClickHouse Connect behavior globally.  They are accessed from the top
level `common` package:

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

Three global settings are currently defined:

| Setting Name            | Default | Options                 | Description                                                                                                                                                                                                                                                   |
|-------------------------|---------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id | True    | True, False             | Autogenerate a new UUID(1) session id (if not provided) for each client session.  If no session id is provided (either at the client or query level, ClickHouse will generate random internal id for each query                                               |
| invalid_setting_action  | 'error' | 'drop', 'send', 'error' | Action to take when an invalid or readonly setting is provided (either for the client session or query).  If `drop`, the setting will be ignored, if `send`, the setting will be sent to ClickHouse, if `error` a client side ProgrammingError will be raised |
| dict_parameter_format   | 'json'  | 'json', 'map'           | This controls whether parameterized queries convert a Python dictionary to JSON or ClickHouse Map syntax. `json` should be used for inserts into JSON columns, `map` for ClickHouse Map columns                                                               |

## Compression

ClickHouse Connect supports lz4, zstd, brotli, and gzip compression for both query results and inserts.  Always keep in mind
that using compression usually involves a tradeoff between network bandwidth/transfer speed against CPU usage (both on the
client and the server.)

To receive compressed data, the ClickHouse server `enable_http_compression` must be set to 1, or the user must have
permission to change the setting on a per query basis.

Compression is controlled by the `compress` parameter when calling the `clickhouse_connect.get_client` factory method.
By default, `compress` is set to `True`, which will trigger the default compression settings.  For queries executed
with the `query`, `query_np`, and `query_df` client methods,  ClickHouse Connect will add the `Accept-Encoding` header with 
the `lz4`, `zstd`, `br` (brotli, if the brotli library is installed), `gzip`, and `deflate` encodings to queries executed
with the `query` client method (and indirectly, `query_np` and `query_df`.  (For the majority of requests the ClickHouse 
server will return with a `zstd` compressed payload.)  For inserts, by default ClickHouse Connect will compress insert
blocks with `lz4` compression, and send the `Content-Encoding: lz4` HTTP header.

The `get_client` `compress` parameter can also be set to a specific compression method, one of `lz4`, `zstd`, `br`, or
`gzip`.  That method will then be used for both inserts and query results (if supported by the ClickHouse server.)  The required
`zstd` and `lz4` compression libraries are now installed by default with ClickHouse Connect.  If `br`/brotli is specified,
the brotli library must be installed separately.

Note that the `raw*` client methods don't use the compression specified by the client configuration.

We also recommend against using `gzip` compression, as it is significantly slower than the alternatives for both compressing
and decompressing data.

## Streaming Queries

### Data Blocks
ClickHouse Connect processes all data from the primary `query` method as a stream of blocks received from the ClickHouse server.
These blocks are transmitted in the custom "Native" format to and from ClickHouse. A "block" is simply a sequence of columns of binary data,
where each column contains an equal number of data values of the specified data type. (As a columnar database, ClickHouse stores this data
in a similar form.)  The size of a block returned from a query is governed by two user settings that can be set at several levels
(user profile, user, session, or query).  They are:

- [max_block_size](https://clickhouse.com/docs/en/operations/settings/settings/#setting-max_block_size) -- Limit on the size of the block in rows.  Default 65536.
- [preferred_block_size_bytes](https://clickhouse.com/docs/en/operations/settings/settings/#preferred-block-size-bytes) -- Soft limit on the size of the block in bytes.  Default 1,000,0000.

Regardless of the `preferred_block_size_setting`, each block will never be more than `max_block_size` rows.  Depending on the
type of query, the actual blocks returned can be of any size.  For example, queries to a distributed table covering many shards
may contain smaller blocks retrieved directly from each shard.

When using one of the Client `query_*_stream` methods, results are returned on a block by block basis.  ClickHouse Connect only
loads a single block at a time.  This allows processing large amounts of data without the need to load all of a large result
set into memory.  Note the application should be prepared to process any number of blocks and the exact size of each block
cannot be controlled.

### StreamContexts

Each of the `query_*_stream` methods (like `query_row_block_stream`) returns a ClickHouse `StreamContext` object, which 
is a combined Python context/generator.  This is the basic usage:

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

Note that trying to use a StreamContext without a `with` statement will raise an error.  The use of a Python context ensures
that the stream (in this case, a streaming HTTP response) will be properly closed even if not all the data is consumed and/or
an exception is raised during processing.  Also, StreamContexts can only be used once to consume the stream.  Trying to use a StreamContext
after it has exited will produce a `StreamClosedError`.

You can use the `source` property of the StreamContext to access the parent `QueryResult` object, which includes column names
and types.  

### Stream Types

The `query_column_block_stream` method returns the block as a sequence of column data stored as native Python data types.  Using
the above `taxi_trips` queries, the data returned will be a list where each element of the list is another list (or tuple)
containing all the data for the  associated column.  So `block[0]` would be a tuple containing nothing but strings.  Column
oriented formats are most used for doing aggregate operations for all the values in a column, like adding up total fairs.

The `query_row_block_stream` method returns the block as a sequence of rows like a traditional relational database.  For taxi
trips, the data returned will be a list where each element of the list is another list representing a row of data.  So `block[0]`
would contain all the fields (in order) for the first taxi trip , `block[1]` would contain a row for all the fields in
the second taxi trip, and so on.  Row oriented results are normally used for display or transformation processes.

The `query_row_stream` is a convenience method that automatically moves to the next block when iterating through the stream.
Otherwise, it is identical to `query_row_block_stream`.

The `query_np_stream` method return each block as a two-dimensional Numpy Array.  Internally Numpy arrays are (usually) stored as columns,
so no distinct row or column methods are needed.  The "shape" of the numpy array will be expressed as (columns, rows).  The Numpy
library provides many methods of manipulating numpy arrays.  Note that if all columns in the query share the same Numpy dtype,
the returned numpy array will only have one dtype as well, and can be reshaped/rotated without actually changing its internal structure.

Finally, the `query_df_stream` method returns each ClickHouse Block as a two-dimensional Pandas Dataframe.  Here's an example
which shows that the StreamContext object can be used as a context in a deferred fashion (but only once).

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```

## QueryContext

ClickHouse Connect executes standard queries within a QueryContext.  The QueryContext contains the key structures that are used
to build queries against the ClickHouse database, and the configuration used to process the result into a QueryResult or other
response data structure.  That includes the query itself, parameters, settings, read formats, and other properties.

A QueryContext can be acquired using the client `create_query_context` method.  This method takes the same parameters
as the core query method.  This query context can then be passed to the `query`, `query_df`, or `query_np` methods as the `context`
keyword argument instead of any or all of the other arguments to those methods.  Note that additional arguments specified for the
method call will override any properties of QueryContext.

The clearest use case for a QueryContext is to send the same query with different binding parameter values.  All parameter values can
be updated by calling the `QueryContext.set_parameters` method with a dictionary, or any single value can be updated by calling
`QueryContext.set_parameter` with the desired `key`, `value` pair.

```python
client.create_query_context(query='SELECT value1, value2 FROM data_table WHERE key = {k:Int32}',
                            parameters={'k': 2},
                            column_oriented=True)
result = client.query(context=qc)
assert result.result_set[1][0] == 'second_value2'
qc.set_parameter('k', 1)
result = test_client.query(context=qc)
assert result.result_set[1][0] == 'first_value2'                                        
```

Note that QueryContexts are not thread safe, but a copy can be obtained in a multithreaded environment by calling the
`QueryContext.updated_copy` method.

## InsertContext

Similar to the QueryContext, ClickHouse Connect executes all inserts within an InsertContext.  The InsertContext includes
all the values sent as arguments to the client `insert` method.  In addition, when an InsertContext is originally constructed,
ClickHouse Connect retrieves the data types for the insert columns required for efficient Native format inserts.  By reusing the
InsertContext for multiple inserts, this "pre-query" is avoided and inserts are executed more quickly and efficiently.

An InsertContext can be acquired using the client `get_insert_context` method.  The method takes the same arguments as
the `insert` function.  Unlike QueryContexts, currently only the `data` property of InsertContexts should be modified
for reuse.  This is consistent with its intended purpose of providing a reusable object for repeated inserts of new data
to the same table.

```python
test_data = [[1, 'v1', 'v2'], [2, 'v3', 'v4']]
ic = test_client.create_insert_context(table='test_table', data='test_data')
client.insert(context=ic)
assert client.command('SELECT count() FROM test_table') == 2
new_data = [[3, 'v5', 'v6'], [4, 'v7', 'v8']]
ic.data = new_data
client.insert(context=ic)
qr = test_client.query('SELECT * FROM test_table ORDER BY key DESC')
assert qr.row_count == 4
assert qr[0][0] == 4
```

InsertContexts include mutable state that is updated during the insert process, so they are not thread safe.

## Data Type Formatting

In some cases the defaults used for translating ClickHouse data types to Python data types are not appropriate for the use case.
Several more specialized data types can be returned from or sent to ClickHouse in multiple formats.  While data can be
transformed by pre- or post-processing, using formatting options can simplify the application code, and in some cases, such
as epoch timestamps, can provide performance improvements.

### Read Formats

Read formats control the data types of values returned from the client `query`, `query_np`, and `query_df` methods.  (The `raw_query`
and `query_arrow` do not modify incoming data from ClickHouse, so format control does not apply.)  For example, if the read format
for a UUID is changed from the default `native` format to the alternative `string` format, a ClickHouse query of `UUID` column will be
returned as string values (using the standard 8-4-4-4-12 RFC 1422 format) instead of Python UUID objects.

The "data type" argument for any formatting function can include wildcards.  The format is a single lower case string.

Read formats can be set at several levels:

- Globally, using the methods defined in the `clickhouse_connect.datatypes.format` package.  This will control the format of the
configured datatype for all queries.
```python
from clickhouse_connect.datatypes.format import set_read_format

# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')

# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```
- For an entire query, using the optional `query_formats` dictionary argument.  In that case any column (or subcolumn) of the
specified data types(s) will use the configured format.
```python
# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- For the values in a specific column, using the optional `column_formats` dictionary argument.  The key is the column named as
return by ClickHouse, and format for the data column or a second level "format" dictionary of a ClickHouse type name and a value
of query formats.  This secondary dictionary can be used for nested column types such as Tuples or Maps.
```python
# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address', 'string'})
```

### Write Formats
Write formats are currently implemented for limited number of types.  In most cases ClickHouse Connect will attempt to
automatically determine the correct write format for a column by checking the type of the first (non-null) data value.
For example, if inserting into a DateTime column, and the first insert value of the column is a Python integer, ClickHouse
Connect will directly insert the integer value under the assumption that it's actually an epoch second.

In most cases, it is unnecessary to override the write format for a data type, but the associated methods in the
`clickhouse_connect.datatypes.format` package can be used to do so at a global level.

### Available Format Options

| ClickHouse Type       | Native Python Type    | Read Formats | Write Formats | Comments                                                                                                    |
|-----------------------|-----------------------|--------------|---------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            | -             |                                                                                                             |
| UInt64                | int                   | signed       |               | Superset does not currently handle large unsigned UInt64 values                                             |
| [U]Int[128,256]       | int                   | string       |               | Pandas and Numpy int values are 64 bits maximum, so these can be returned as strings                        |
| Float32               | float                 | -            |               | All Python floats are 64 bits internally                                                                    |
| Float64               | float                 | -            |               |                                                                                                             |
| Decimal               | decimal.Decimal       | -            |               |                                                                                                             |
| String                | string                | -            |               |                                                                                                             |
| FixedString           | bytes                 | string       | string        | FixedStrings are fixed size byte arrays, but sometimes are treated as Python strings                        |
| Enum[8,16]            | string                | -            |               | Python enum types cannot handle empty strings, so all enums are treated as strings                          |
| Date                  | datetime.date         | int          |               | ClickHouse stores Dates as days since 01/01/1970.  This value is available as an int                        |
| Date32                | datetime.date         | int          |               | Same as Date, but for a wider range of dates                                                                |
| DateTime              | datetime.datetime     | int          |               | ClickHouse stores DateTime in epoch seconds.  This value is available as an int                             |
| DateTime64            | datetime.datetime     | int          |               | Python datetime.datetime is limited to microsecond precision. The raw 64 bit int value is available         |
| IPv4                  | ipaddress.IPv4Address | string       | string        | IP addresses can be read as strings and properly formatted strings can be inserted as IP addresses          |
| IPv6                  | ipaddress.IPv6Address | string       | string        | IP addresses can be read as strings and properly formatted can be inserted as IP addresses                  |
| Tuple                 | dict or tuple         | tuple, json  |               | Named tuples returned as dictionaries by default.  Named tuples can also be returned as JSON                |
| Map                   | dict                  | -            |               |                                                                                                             |
| Nested                | Sequence[dict]        | -            |               |                                                                                                             |
| JSON/Object('json')   | dict                  | -            | string        | Either dictionaries or JSON strings can be inserted into JSON Columns.  Only JSON subcolumns can be queried |
| UUID                  | uuid.UUID             | string       | string        | UUIDs can be read as strings and properly formatted strings can be inserted as UUIDs                        |

