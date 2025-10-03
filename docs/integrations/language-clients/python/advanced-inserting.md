---
sidebar_label: 'Advanced Inserting'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: 'Advanced Inserting with ClickHouse Connect'
slug: /integrations/language-clients/python/advanced-inserting
title: 'Advanced Inserting'
---

## Inserting data with ClickHouse Connect: Advanced usage {#inserting-data-with-clickhouse-connect--advanced-usage}

### InsertContexts {#insertcontexts}

ClickHouse Connect executes all inserts within an `InsertContext`. The `InsertContext` includes all the values sent as arguments to the client `insert` method. In addition, when an `InsertContext` is originally constructed, ClickHouse Connect retrieves the data types for the insert columns required for efficient Native format inserts. By reusing the `InsertContext` for multiple inserts, this "pre-query" is avoided and inserts are executed more quickly and efficiently.

An `InsertContext` can be acquired using the client `create_insert_context` method. The method takes the same arguments as the `insert` function. Note that only the `data` property of `InsertContext`s should be modified for reuse. This is consistent with its intended purpose of providing a reusable object for repeated inserts of new data to the same table.

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

`InsertContext`s include mutable state that is updated during the insert process, so they are not thread safe.

### Write formats {#write-formats}
Write formats are currently implemented for limited number of types. In most cases ClickHouse Connect will attempt to automatically determine the correct write format for a column by checking the type of the first (non-null) data value. For example, if inserting into a `DateTime` column, and the first insert value of the column is a Python integer, ClickHouse Connect will directly insert the integer value under the assumption that it's actually an epoch second.

In most cases, it is unnecessary to override the write format for a data type, but the associated methods in the `clickhouse_connect.datatypes.format` package can be used to do so at a global level.

#### Write format options {#write-format-options}

| ClickHouse Type       | Native Python Type      | Write Formats     | Comments                                                                                                    |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                             |
| UInt64                | int                     |                   |                                                                                                             |
| [U]Int[128,256]       | int                     |                   |                                                                                                             |
| BFloat16              | float                   |                   |                                                                                                             |
| Float32               | float                   |                   |                                                                                                             |
| Float64               | float                   |                   |                                                                                                             |
| Decimal               | decimal.Decimal         |                   |                                                                                                             |
| String                | string                  |                   |                                                                                                             |
| FixedString           | bytes                   | string            | If inserted as a string, additional bytes will be set to zeros                                              |
| Enum[8,16]            | string                  |                   |                                                                                                             |
| Date                  | datetime.date           | int               | ClickHouse stores Dates as days since 01/01/1970. int types will be assumed to be this "epoch date" value   |
| Date32                | datetime.date           | int               | Same as Date, but for a wider range of dates                                                                |
| DateTime              | datetime.datetime       | int               | ClickHouse stores DateTime in epoch seconds. int types will be assumed to be this "epoch second" value      |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetime is limited to microsecond precision. The raw 64 bit int value is available         |
| Time                  | datetime.timedelta      | int, string, time | ClickHouse stores DateTime in epoch seconds. int types will be assumed to be this "epoch second" value      |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedelta is limited to microsecond precision. The raw 64 bit int value is available        |
| IPv4                  | `ipaddress.IPv4Address` | string            | Properly formatted strings can be inserted as IPv4 addresses                                                |
| IPv6                  | `ipaddress.IPv6Address` | string            | Properly formatted strings can be inserted as IPv6 addresses                                                |
| Tuple                 | dict or tuple           |                   |                                                                                                             |
| Map                   | dict                    |                   |                                                                                                             |
| Nested                | Sequence[dict]          |                   |                                                                                                             |
| UUID                  | uuid.UUID               | string            | Properly formatted strings can be inserted as ClickHouse UUIDs                                              |
| JSON/Object('json')   | dict                    | string            | Either dictionaries or JSON strings can be inserted into JSON Columns (note `Object('json')` is deprecated) |
| Variant               | object                  |                   | At this time on all variants are inserted as Strings and parsed by the ClickHouse server                    |
| Dynamic               | object                  |                   | Warning -- at this time any inserts into a Dynamic column are persisted as a ClickHouse String              |

### Specialized insert methods {#specialized-insert-methods}

ClickHouse Connect provides specialized insert methods for common data formats:

- `insert_df` -- Insert a Pandas DataFrame. Instead of a Python Sequence of Sequences `data` argument, the second parameter of this method requires a `df` argument that must be a Pandas DataFrame instance. ClickHouse Connect automatically processes the DataFrame as a column oriented datasource, so the `column_oriented` parameter is not required or available.
- `insert_arrow` -- Insert a PyArrow Table. ClickHouse Connect passes the Arrow table unmodified to the ClickHouse server for processing, so only the `database` and `settings` arguments are available in addition to `table` and `arrow_table`.
- `insert_df_arrow` -- Insert an arrow-backed Pandas DataFrame or a Polars DataFrame. ClickHouse Connect will automatically determine if the DataFrame is a Pandas or Polars type. If Pandas, validation will be performed to ensure that each column's dtype backend is Arrow-based and an error will be raised if any are not.

:::note
A NumPy array is a valid Sequence of Sequences and can be used as the `data` argument to the main `insert` method, so a specialized method is not required.
:::

#### Pandas DataFrame insert {#pandas-dataframe-insert}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
})

client.insert_df("users", df)
```

#### PyArrow Table insert {#pyarrow-table-insert}

```python
import clickhouse_connect
import pyarrow as pa

client = clickhouse_connect.get_client()

arrow_table = pa.table({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
})

client.insert_arrow("users", arrow_table)
```

#### Arrow-backed DataFrame insert (pandas 2.x) {#arrow-backed-dataframe-insert-pandas-2}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

# Convert to Arrow-backed dtypes for better performance
df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)
```

## File inserts {#file-inserts}

The `clickhouse_connect.driver.tools` package includes the `insert_file` method that allows inserting data directly from the file system into an existing ClickHouse table. Parsing is delegated to the ClickHouse server. `insert_file` accepts the following parameters:

| Parameter    | Type            | Default           | Description                                                                                                               |
|--------------|-----------------|-------------------|---------------------------------------------------------------------------------------------------------------------------|
| client       | Client          | *Required*        | The `driver.Client` used to perform the insert                                                                            |
| table        | str             | *Required*        | The ClickHouse table to insert into. The full table name (including database) is permitted.                               |
| file_path    | str             | *Required*        | The native file system path to the data file                                                                              |
| fmt          | str             | CSV, CSVWithNames | The ClickHouse Input Format of the file. CSVWithNames is assumed if `column_names` is not provided                        |
| column_names | Sequence of str | *None*            | A list of column names in the data file. Not required for formats that include column names                               |
| database     | str             | *None*            | Database of the table. Ignored if the table is fully qualified. If not specified, the insert will use the client database |
| settings     | dict            | *None*            | See [settings description](driver-api.md#settings-argument).                                                              |
| compression  | str             | *None*            | A recognized ClickHouse compression type (zstd, lz4, gzip) used for the Content-Encoding HTTP header                      |

For files with inconsistent data or date/time values in an unusual format, settings that apply to data imports (such as `input_format_allow_errors_num` and `input_format_allow_errors_num`) are recognized for this method.

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```


