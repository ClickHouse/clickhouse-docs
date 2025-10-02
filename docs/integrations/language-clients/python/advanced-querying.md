---
sidebar_label: 'Advanced Querying'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: 'Advanced Querying with ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-querying
title: 'Advanced Querying'
---

# Querying data with ClickHouse Connect: Advanced usage {#querying-data-with-clickhouse-connect--advanced-usage}

## QueryContexts {#querycontexts}

ClickHouse Connect executes standard queries within a `QueryContext`. The `QueryContext` contains the key structures that are used to build queries against the ClickHouse database, and the configuration used to process the result into a `QueryResult` or other response data structure. That includes the query itself, parameters, settings, read formats, and other properties.

A `QueryContext` can be acquired using the client `create_query_context` method. This method takes the same parameters as the core query method. This query context can then be passed to the `query`, `query_df`, or `query_np` methods as the `context` keyword argument instead of any or all of the other arguments to those methods. Note that additional arguments specified for the method call will override any properties of QueryContext.

The clearest use case for a `QueryContext` is to send the same query with different binding parameter values. All parameter values can be updated by calling the `QueryContext.set_parameters` method with a dictionary, or any single value can be updated by calling `QueryContext.set_parameter` with the desired `key`, `value` pair.

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

Note that `QueryContext`s are not thread safe, but a copy can be obtained in a multi-threaded environment by calling the `QueryContext.updated_copy` method.

## Streaming queries {#streaming-queries}

### Data blocks {#data-blocks}
ClickHouse Connect processes all data from the primary `query` method as a stream of blocks received from the ClickHouse server. These blocks are transmitted in the custom "Native" format to and from ClickHouse. A "block" is simply a sequence of columns of binary data, where each column contains an equal number of data values of the specified data type. (As a columnar database, ClickHouse stores this data in a similar form.) The size of a block returned from a query is governed by two user settings that can be set at several levels (user profile, user, session, or query). They are:

- [max_block_size](/operations/settings/settings#max_block_size) -- Limit on the size of the block in rows. Default 65536.
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- Soft limit on the size of the block in bytes. Default 1,000,0000.

Regardless of the `preferred_block_size_setting`, each block will never be more than `max_block_size` rows. Depending on the type of query, the actual blocks returned can be of any size. For example, queries to a distributed table covering many shards may contain smaller blocks retrieved directly from each shard.

When using one of the Client `query_*_stream` methods, results are returned on a block by block basis. ClickHouse Connect only loads a single block at a time. This allows processing large amounts of data without the need to load all of a large result set into memory. Note the application should be prepared to process any number of blocks and the exact size of each block cannot be controlled.

### HTTP data buffer for slow processing {#http-data-buffer-for-slow-processing}

Because of limitations in the HTTP protocol, if blocks are processed at a rate significantly slower than the ClickHouse server is streaming data, the ClickHouse server will close the connection, resulting in an Exception being thrown in the processing thread. Some of this can be mitigated by increasing the buffer size of the HTTP streaming buffer (which defaults to 10 megabytes) using the common `http_buffer_size` setting. Large `http_buffer_size` values should be okay in this situation if there is sufficient memory available to the application. Data in the buffer is stored compressed if using `lz4` or `zstd` compression, so using those compression types will increase the overall buffer available.

### StreamContexts {#streamcontexts}

Each of the `query_*_stream` methods (like `query_row_block_stream`) returns a ClickHouse `StreamContext` object, which is a combined Python context/generator. This is the basic usage:

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

Note that trying to use a StreamContext without a `with` statement will raise an error. The use of a Python context ensures that the stream (in this case, a streaming HTTP response) will be properly closed even if not all the data is consumed and/or an exception is raised during processing. Also, `StreamContext`s can only be used once to consume the stream. Trying to use a `StreamContext` after it has exited will produce a `StreamClosedError`.

You can use the `source` property of the `StreamContext` to access the parent `QueryResult` object, which includes column names and types.

### Stream types {#stream-types}

The `query_column_block_stream` method returns the block as a sequence of column data stored as native Python data types. Using the above `taxi_trips` queries, the data returned will be a list where each element of the list is another list (or tuple) containing all the data for the associated column. So `block[0]` would be a tuple containing nothing but strings. Column oriented formats are most used for doing aggregate operations for all the values in a column, like adding up total fares.

The `query_row_block_stream` method returns the block as a sequence of rows like a traditional relational database. For taxi trips, the data returned will be a list where each element of the list is another list representing a row of data. So `block[0]` would contain all the fields (in order) for the first taxi trip , `block[1]` would contain a row for all the fields in the second taxi trip, and so on. Row oriented results are normally used for display or transformation processes.

The `query_row_stream` is a convenience method that automatically moves to the next block when iterating through the stream. Otherwise, it is identical to `query_row_block_stream`.

The `query_np_stream` method return each block as a two-dimensional NumPy Array. Internally, NumPy arrays are (usually) stored as columns, so no distinct row or column methods are needed. The "shape" of the NumPy array will be expressed as (columns, rows). The NumPy library provides many methods of manipulating NumPy arrays. Note that if all columns in the query share the same NumPy dtype, the returned NumPy array will only have one dtype as well, and can be reshaped/rotated without actually changing its internal structure.

The `query_df_stream` method returns each ClickHouse Block as a two-dimensional Pandas DataFrame. Here's an example which shows that the `StreamContext` object can be used as a context in a deferred fashion (but only once).

Finally, the `query_arrow_stream` method returns a ClickHouse `ArrowStream` formatted result as a `pyarrow.ipc.RecordBatchStreamReader` wrapped in `StreamContext`. Each iteration of the stream returns PyArrow RecordBlock.

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```

## Read formats {#read-formats}

Read formats control the data types of values returned from the client `query`, `query_np`, and `query_df` methods. (The `raw_query` and `query_arrow` do not modify incoming data from ClickHouse, so format control does not apply.) For example, if the read format for a UUID is changed from the default `native` format to the alternative `string` format, a ClickHouse query of `UUID` column will be returned as string values (using the standard 8-4-4-4-12 RFC 1422 format) instead of Python UUID objects.

The "data type" argument for any formatting function can include wildcards. The format is a single lower case string.

Read formats can be set at several levels:

- Globally, using the methods defined in the `clickhouse_connect.datatypes.format` package. This will control the format of the configured datatype for all queries.
```python
from clickhouse_connect.datatypes.format import set_read_format

# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')

# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```
- For an entire query, using the optional `query_formats` dictionary argument. In that case any column (or subcolumn) of the specified data types(s) will use the configured format.
```python
# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```
- For the values in a specific column, using the optional `column_formats` dictionary argument. The key is the column named as return by ClickHouse, and format for the data column or a second level "format" dictionary of a ClickHouse type name and a value of query formats. This secondary dictionary can be used for nested column types such as Tuples or Maps.
```python
# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### Read format options (Python types) {#read-format-options-python-types}

| ClickHouse Type       | Native Python Type      | Read Formats      | Comments                                                                                                          |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                   |
| UInt64                | int                     | signed            | Superset does not currently handle large unsigned UInt64 values                                                   |
| [U]Int[128,256]       | int                     | string            | Pandas and NumPy int values are 64 bits maximum, so these can be returned as strings                              |
| BFloat16              | float                   | -                 | All Python floats are 64 bits internally                                                                          |
| Float32               | float                   | -                 | All Python floats are 64 bits internally                                                                          |
| Float64               | float                   | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                   |
| String                | string                  | bytes             | ClickHouse String columns have no inherent encoding, so they are also used for variable length binary data        |
| FixedString           | bytes                   | string            | FixedStrings are fixed size byte arrays, but sometimes are treated as Python strings                              |
| Enum[8,16]            | string                  | string, int       | Python enums don't accept empty strings, so all enums are rendered as either strings or the underlying int value. |
| Date                  | datetime.date           | int               | ClickHouse stores Dates as days since 01/01/1970. This value is available as an int                               |
| Date32                | datetime.date           | int               | Same as Date, but for a wider range of dates                                                                      |
| DateTime              | datetime.datetime       | int               | ClickHouse stores DateTime in epoch seconds. This value is available as an int                                    |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime is limited to microsecond precision. The raw 64 bit int value is available               |
| Time                  | datetime.timedelta      | int, string, time | The point in time is saved as a Unix timestamp. This value is available as an int                                 |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta is limited to microsecond precision. The raw 64 bit int value is available              |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP addresses can be read as strings and properly formatted strings can be inserted as IP addresses                |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP addresses can be read as strings and properly formatted can be inserted as IP addresses                        |
| Tuple                 | dict or tuple           | tuple, json       | Named tuples returned as dictionaries by default. Named tuples can also be returned as JSON strings               |
| Map                   | dict                    | -                 |                                                                                                                   |
| Nested                | Sequence[dict]          | -                 |                                                                                                                   |
| UUID                  | uuid.UUID               | string            | UUIDs can be read as strings formatted as per RFC 4122<br/>                                                       |
| JSON                  | dict                    | string            | A python dictionary is returned by default. The `string` format will return a JSON string                         |
| Variant               | object                  | -                 | Returns the matching Python type for the ClickHouse datatype stored for the value                                 |
| Dynamic               | object                  | -                 | Returns the matching Python type for the ClickHouse datatype stored for the value                                 |


## External data {#external-data}

ClickHouse queries can accept external data in any ClickHouse format. This binary data is sent along with the query string to be used to process the data. Details of the External Data feature are [here](/engines/table-engines/special/external-data.md). The client `query*` methods accept an optional `external_data` parameter to take advantage of this feature. The value for the `external_data` parameter should be a `clickhouse_connect.driver.external.ExternalData` object. The constructor for that object accepts the following arguments:

| Name      | Type              | Description                                                                                                                                   |
|-----------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| file_path | str               | Path to a file on the local system path to read the external data from. Either `file_path` or `data` is required                              |
| file_name | str               | The name of the external data "file". If not provided, will be determined from the `file_path` (without extensions)                           |
| data      | bytes             | The external data in binary form (instead of being read from a file). Either `data` or `file_path` is required                                |
| fmt       | str               | The ClickHouse [Input Format](/sql-reference/formats.mdx) of the data. Defaults to `TSV`                                                      |
| types     | str or seq of str | A list of column data types in the external data. If a string, types should be separated by commas. Either `types` or `structure` is required |
| structure | str or seq of str | A list of column name + data type in the data (see examples). Either `structure` or `types` is required                                       |
| mime_type | str               | Optional MIME type of the file data. Currently ClickHouse ignores this HTTP subheader                                                         |


To send a query with an external CSV file containing "movie" data, and combine that data with an `directors` table already present on the ClickHouse server:

```python
import clickhouse_connect
from clickhouse_connect.driver.external import ExternalData

client = clickhouse_connect.get_client()
ext_data = ExternalData(file_path='/data/movies.csv',
                        fmt='CSV',
                        structure=['movie String', 'year UInt16', 'rating Decimal32(3)', 'director String'])
result = client.query('SELECT name, avg(rating) FROM directors INNER JOIN movies ON directors.name = movies.director GROUP BY directors.name',
                      external_data=ext_data).result_rows
```

Additional external data files can be added to the initial `ExternalData` object using the `add_file` method, which takes the same parameters as the constructor. For HTTP, all external data is transmitted as part of a `multi-part/form-data` file upload.

## Time zones {#time-zones}
There are multiple mechanisms for applying a time zone to ClickHouse DateTime and DateTime64 values. Internally, the ClickHouse server always stores any DateTime or `DateTime64` object as a time zone naive number representing seconds since the epoch, 1970-01-01 00:00:00 UTC time. For `DateTime64` values, the representation can be milliseconds, microseconds, or nanoseconds since the epoch, depending on precision. As a result, the application of any time zone information always occurs on the client side. Note that this involves meaningful extra calculation, so in performance critical applications it is recommended to treat DateTime types as epoch timestamps except for user display and conversion (Pandas Timestamps, for example, are always a 64-bit integer representing epoch nanoseconds to improve performance).

When using time zone aware data types in queries - in particular the Python `datetime.datetime` object -- `clickhouse-connect` applies a client side time zone using the following precedence rules:

1. If the query method parameter `client_tzs` is specified for the query, the specific column time zone is applied
2. If the ClickHouse column has timezone metadata (i.e., it is a type like DateTime64(3, 'America/Denver')), the ClickHouse column timezone is applied. (Note this timezone metadata is not available to clickhouse-connect for DateTime columns prior to ClickHouse version 23.2)
3. If the query method parameter `query_tz` is specified for the query, the "query timezone" is applied.
4. If a timezone setting is applied to the query or session, that timezone is applied. (This functionality is not yet released in the ClickHouse server)
5. Finally, if the client `apply_server_timezone` parameter has been set to True (the default), the ClickHouse server timezone is applied.

Note that if the applied timezone based on these rules is UTC, `clickhouse-connect` will _always_ return a time zone naive Python `datetime.datetime` object. Additional timezone information can then be added to this timezone naive object by the application code if desired.

