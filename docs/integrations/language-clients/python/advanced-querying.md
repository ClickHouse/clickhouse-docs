---
sidebar_label: 'Advanced Querying'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: 'Advanced Querying with ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-querying
title: 'Advanced Querying'
doc_type: 'reference'
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

The ClickHouse Connect Client provides multiple methods for retrieving data as a stream (implemented as a Python generator):

- `query_column_block_stream` -- Returns query data in blocks as a sequence of columns using native Python objects
- `query_row_block_stream` -- Returns query data as a block of rows using native Python objects
- `query_rows_stream` -- Returns query data as a sequence of rows using native Python objects
- `query_np_stream` -- Returns each ClickHouse block of query data as a NumPy array
- `query_df_stream` -- Returns each ClickHouse Block of query data as a Pandas DataFrame
- `query_arrow_stream` -- Returns query data in PyArrow RecordBlocks
- `query_df_arrow_stream` -- Returns each ClickHouse Block of query data as an arrow-backed Pandas DataFrame or a Polars DataFrame depending on the kwarg `dataframe_library` (default is "pandas").

Each of these methods returns a `ContextStream` object that must be opened via a `with` statement to start consuming the stream.

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

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```

The `query_df_arrow_stream` method returns each ClickHouse Block as a DataFrame with PyArrow dtype backend. This method supports both Pandas (2.x or later) and Polars DataFrames via the `dataframe_library` parameter (defaults to `"pandas"`). Each iteration yields a DataFrame converted from PyArrow record batches, providing better performance and memory efficiency for certain data types.

Finally, the `query_arrow_stream` method returns a ClickHouse `ArrowStream` formatted result as a `pyarrow.ipc.RecordBatchStreamReader` wrapped in `StreamContext`. Each iteration of the stream returns PyArrow RecordBlock.

### Streaming examples {#streaming-examples}

#### Stream rows {#stream-rows}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Stream large result sets row by row
with client.query_rows_stream("SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000") as stream:
    for row in stream:
        print(row)  # Process each row
        # Output:
        # (0, 0)
        # (1, 2)
        # (2, 4)
        # ....
```

#### Stream row blocks {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Stream in blocks of rows (more efficient than row-by-row)
with client.query_row_block_stream("SELECT number, number * 2 FROM system.numbers LIMIT 100000") as stream:
    for block in stream:
        print(f"Received block with {len(block)} rows")
        # Output:
        # Received block with 65409 rows
        # Received block with 34591 rows
```

#### Stream Pandas DataFrames {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Stream query results as Pandas DataFrames
with client.query_df_stream("SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000") as stream:
    for df in stream:
        # Process each DataFrame block
        print(f"Received DataFrame with {len(df)} rows")
        print(df.head(3))
        # Output:
        # Received DataFrame with 65409 rows
        #    number str
        # 0       0   0
        # 1       1   1
        # 2       2   2
        # Received DataFrame with 34591 rows
        #    number    str
        # 0   65409  65409
        # 1   65410  65410
        # 2   65411  65411
```

#### Stream Arrow batches {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Stream query results as Arrow record batches
with client.query_arrow_stream("SELECT * FROM large_table") as stream:
    for arrow_batch in stream:
        # Process each Arrow batch
        print(f"Received Arrow batch with {arrow_batch.num_rows} rows")
        # Output:
        # Received Arrow batch with 65409 rows
        # Received Arrow batch with 34591 rows
```

## NumPy, Pandas, and Arrow queries {#numpy-pandas-and-arrow-queries}

ClickHouse Connect provides specialized query methods for working with NumPy, Pandas, and Arrow data structures. These methods allow you to retrieve query results directly in these popular data formats without manual conversion.

### NumPy queries {#numpy-queries}

The `query_np` method returns query results as a NumPy array instead of a ClickHouse Connect `QueryResult`.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Query returns a NumPy array
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(np_array))
# Output:
# <class "numpy.ndarray">

print(np_array)
# Output:
# [[0 0]
#  [1 2]
#  [2 4]
#  [3 6]
#  [4 8]]
```

### Pandas queries {#pandas-queries}

The `query_df` method returns query results as a Pandas DataFrame instead of a ClickHouse Connect `QueryResult`.

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Query returns a Pandas DataFrame
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(df))
# Output: <class "pandas.core.frame.DataFrame">
print(df)
# Output:
#    number  doubled
# 0       0        0
# 1       1        2
# 2       2        4
# 3       3        6
# 4       4        8
```

### PyArrow queries {#pyarrow-queries}

The `query_arrow` method returns query results as a PyArrow Table. It utilizes the ClickHouse `Arrow` format directly, so it only accepts three arguments in common with the main `query` method: `query`, `parameters`, and `settings`. In addition, there is an additional argument, `use_strings`, which determines whether the Arrow Table will render ClickHouse String types as strings (if True) or bytes (if False).

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Query returns a PyArrow Table
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

print(type(arrow_table))
# Output:
# <class "pyarrow.lib.Table">

print(arrow_table)
# Output:
# pyarrow.Table
# number: uint64 not null
# str: string not null
# ----
# number: [[0,1,2]]
# str: [["0","1","2"]]
```

### Arrow-backed DataFrames {#arrow-backed-dataframes}

ClickHouse Connect supports fast, memory‑efficient DataFrame creation from Arrow results via the `query_df_arrow` and `query_df_arrow_stream` methods. These are thin wrappers around the Arrow query methods and perform zero‑copy conversions to DataFrames where possible:

- `query_df_arrow`: Executes the query using the ClickHouse `Arrow` output format and returns a DataFrame.
  - For `dataframe_library='pandas'`, returns a pandas 2.x DataFrame using Arrow‑backed dtypes (`pd.ArrowDtype`). This requires pandas 2.x and leverages zero‑copy buffers where possible for excellent performance and low memory overhead.
  - For `dataframe_library='polars'`, returns a Polars DataFrame created from the Arrow table (`pl.from_arrow`), which is similarly efficient and can be zero‑copy depending on the data.
- `query_df_arrow_stream`: Streams results as a sequence of DataFrames (pandas 2.x or Polars) converted from Arrow stream batches.

#### Query to Arrow-backed DataFrame {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Query returns a Pandas DataFrame with Arrow dtypes (requires pandas 2.x)
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)

print(df.dtypes)
# Output:
# number    uint64[pyarrow]
# str       string[pyarrow]
# dtype: object

# Or use Polars
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)
# Output:
# [UInt64, String]


# Streaming into batches of DataFrames (polars shown)
with client.query_df_arrow_stream(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
    for df_batch in stream:
        print(f"Received {type(df_batch)} batch with {len(df_batch)} rows and dtypes: {df_batch.dtypes}")
        # Output:
        # Received <class 'polars.dataframe.frame.DataFrame'> batch with 65409 rows and dtypes: [UInt64, String]
        # Received <class 'polars.dataframe.frame.DataFrame'> batch with 34591 rows and dtypes: [UInt64, String]
```

#### Notes and caveats {#notes-and-caveats}
- Arrow type mapping: When returning data in Arrow format, ClickHouse maps types to the closest supported Arrow types. Some ClickHouse types do not have a native Arrow equivalent and are returned as raw bytes in Arrow fields (usually `BINARY` or `FIXED_SIZE_BINARY`).
  - Examples: `IPv4` is represented as Arrow `UINT32`; `IPv6` and large integers (`Int128/UInt128/Int256/UInt256`) are often represented as `FIXED_SIZE_BINARY`/`BINARY` with raw bytes.
  - In these cases, the DataFrame column will contain byte values backed by the Arrow field; it is up to the client code to interpret/convert those bytes according to ClickHouse semantics.
- Unsupported Arrow data types (e.g., UUID/ENUM as true Arrow types) are not emitted; values are represented using the closest supported Arrow type (often as binary bytes) for output.
- Pandas requirement: Arrow‑backed dtypes require pandas 2.x. For older pandas versions, use `query_df` (non‑Arrow) instead.
- Strings vs binary: The `use_strings` option (when supported by the server setting `output_format_arrow_string_as_string`) controls whether ClickHouse `String` columns are returned as Arrow strings or as binary.

#### Mismatched ClickHouse/Arrow type conversion examples {#mismatched-clickhousearrow-type-conversion-examples}

When ClickHouse returns columns as raw binary data (e.g., `FIXED_SIZE_BINARY` or `BINARY`), it is the responsibility of application code to convert these bytes to appropriate Python types. The examples below illustrate that some conversions are feasible using DataFrame library APIs, while others may require pure Python approaches like `struct.unpack` (which sacrifice performance but maintain flexibility).

`Date` columns can arrive as `UINT16` (days since the Unix epoch, 1970‑01‑01). Converting inside the DataFrame is efficient and straightforward:
```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))

# Pandas
df["event_date"] = pd.to_datetime(df["event_date"], unit="D")
```

Columns like `Int128` can arrive as `FIXED_SIZE_BINARY` with raw bytes. Polars provides native support for 128-bit integers:
```python
# Polars - native support
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

As of NumPy 2.3 there is no public 128-bit integer dtype, so we must fall back to pure Python and can do something like:

```python
# Assuming we have a pandas dataframe with an Int128 column of dtype fixed_size_binary[16][pyarrow]

print(df)
# Output:
#   str_col                                        int_128_col
# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00...
# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00...
# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x...

print([int.from_bytes(n, byteorder="little") for n in df["int_128_col"].to_list()])
# Output:
# [1234567898765432123456789, 8, 456789123456789]
```

The key takeaway: application code must handle these conversions based on the capabilities of the chosen DataFrame library and the acceptable performance trade-offs. When DataFrame-native conversions aren't available, pure Python approaches remain an option.

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
