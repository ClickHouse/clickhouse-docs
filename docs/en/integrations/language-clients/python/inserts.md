---
sidebar_label: Advanced Inserts
sidebar_position: 40
keywords: [clickhouse, python, client, connect, integrate, insert]
slug: /en/integrations/language-clients/python/inserts
description: ClickHouse Connect Inserts In Depth
---

# Inserting Data with ClickHouse Connect:  Advanced Usage

## InsertContexts

ClickHouse Connect executes all inserts within an InsertContext.  The InsertContext includes  all the values sent as arguments to
the client `insert` method.  In addition, when an InsertContext is originally constructed, ClickHouse Connect retrieves the data types
for the insert columns required for efficient Native format inserts.  By reusing the  InsertContext for multiple inserts, this "pre-query"
is avoided and inserts are executed more quickly and efficiently.

An InsertContext can be acquired using the client `get_insert_context` method.  The method takes the same arguments as
the `insert` function.  Note that only the `data` property of InsertContexts should be modified for reuse.  This is consistent
with its intended purpose of providing a reusable object for repeated inserts of new data to the same table.

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


## Write Formats
Write formats are currently implemented for limited number of types.  In most cases ClickHouse Connect will attempt to
automatically determine the correct write format for a column by checking the type of the first (non-null) data value.
For example, if inserting into a DateTime column, and the first insert value of the column is a Python integer, ClickHouse
Connect will directly insert the integer value under the assumption that it's actually an epoch second.

In most cases, it is unnecessary to override the write format for a data type, but the associated methods in the
`clickhouse_connect.datatypes.format` package can be used to do so at a global level.

### Write Format Options

| ClickHouse Type       | Native Python Type    | Write Formats | Comments                                                                                                   |
|-----------------------|-----------------------|---------------|------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                   | -             |                                                                                                            |
| UInt64                | int                   |               |                                                                                                            |
| [U]Int[128,256]       | int                   |               |                                                                                                            |
| Float32               | float                 |               |                                                                                                            |
| Float64               | float                 |               |                                                                                                            |
| Decimal               | decimal.Decimal       |               |                                                                                                            |
| String                | string                |               |                                                                                                            |
| FixedString           | bytes                 | string        | If inserted as a string, additional bytes will be set to zeros                                             |
| Enum[8,16]            | string                |               |                                                                                                            |
| Date                  | datetime.date         | int           | ClickHouse stores Dates as days since 01/01/1970.  int types will be assumed to be this "epoch date" value |
| Date32                | datetime.date         | int           | Same as Date, but for a wider range of dates                                                               |
| DateTime              | datetime.datetime     | int           | ClickHouse stores DateTime in epoch seconds.  int types will be assumed to be this "epoch second" value    |
| DateTime64            | datetime.datetime     | int           | Python datetime.datetime is limited to microsecond precision. The raw 64 bit int value is available        |
| IPv4                  | ipaddress.IPv4Address | string        | Properly formatted strings can be inserted as IPv4 addresses                                               |
| IPv6                  | ipaddress.IPv6Address | string        | Properly formatted strings can be inserted as IPv6 addresses                                               |
| Tuple                 | dict or tuple         |               |                                                                                                            |
| Map                   | dict                  |               |                                                                                                            |
| Nested                | Sequence[dict]        |               |                                                                                                            |
| JSON/Object('json')   | dict                  | string        | Either dictionaries or JSON strings can be inserted into JSON Columns.                                     |
| UUID                  | uuid.UUID             | string        | Properly formatted strings can be inserted as ClickHouse UUIDs                                             |


