---
sidebar_label: Advanced Queries
sidebar_position: 30
keywords: [clickhouse, python, client, connect, integrate, query]
slug: /en/integrations/language-clients/python/queries
description: ClickHouse Connect Queries In Depth
---

# Querying Data with ClickHouse Connect:  Advanced Usage

## QueryContexts

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

## Read Formats

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

### Read Format Options (Python Types)

| ClickHouse Type       | Native Python Type    | Read Formats | Comments                                                                                                          |
|-----------------------|-----------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -            |                                                                                                                   |
| UInt64                | int                   | signed       | Superset does not currently handle large unsigned UInt64 values                                                   |
| [U]Int[128,256]       | int                   | string       | Pandas and Numpy int values are 64 bits maximum, so these can be returned as strings                              |
| Float32               | float                 | -            | All Python floats are 64 bits internally                                                                          |
| Float64               | float                 | -            |                                                                                                                   |
| Decimal               | decimal.Decimal       | -            |                                                                                                                   |
| String                | string                | -            |                                                                                                                   |
| FixedString           | bytes                 | string       | FixedStrings are fixed size byte arrays, but sometimes are treated as Python strings                              |
| Enum[8,16]            | string                | string, int  | Python enums don't accept empty strings, so all enums are rendered as either strings or the underlying int value. |
| Date                  | datetime.date         | int          | ClickHouse stores Dates as days since 01/01/1970.  This value is available as an int                              |
| Date32                | datetime.date         | int          | Same as Date, but for a wider range of dates                                                                      |
| DateTime              | datetime.datetime     | int          | ClickHouse stores DateTime in epoch seconds.  This value is available as an int                                   |
| DateTime64            | datetime.datetime     | int          | Python datetime.datetime is limited to microsecond precision. The raw 64 bit int value is available               |
| IPv4                  | ipaddress.IPv4Address | string       | IP addresses can be read as strings and properly formatted strings can be inserted as IP addresses                |
| IPv6                  | ipaddress.IPv6Address | string       | IP addresses can be read as strings and properly formatted can be inserted as IP addresses                        |
| Tuple                 | dict or tuple         | tuple, json  | Named tuples returned as dictionaries by default.  Named tuples can also be returned as JSON strings              |
| Map                   | dict                  | -            |                                                                                                                   |
| Nested                | Sequence[dict]        | -            |                                                                                                                   |
| UUID                  | uuid.UUID             | string       | UUIDs can be read as strings formatted as per RFC 4122                                                            |


