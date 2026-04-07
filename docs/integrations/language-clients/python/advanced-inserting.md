---
sidebar_label: 'Advanced inserting'
sidebar_position: 10
keywords: ['clickhouse', 'python', 'insert', 'advanced', 'formats']
description: 'Advanced insert features: InsertContexts, write formats, timezone handling, and type details'
slug: /integrations/language-clients/python/advanced-inserting
title: 'Advanced inserting'
doc_type: 'reference'
---

# Advanced Inserting {#advanced-inserting}

For common insert workflows, see [Inserting](inserting.md). This page covers InsertContexts, write formats, detailed timezone behavior, and advanced type handling.

## InsertContexts {#insertcontexts}

An `InsertContext` caches the column types for a target table, avoiding a `DESCRIBE` round-trip on each insert. Create one with `client.create_insert_context()`, which takes the same arguments as `client.insert()`.

```python
data = [[1, "v1", "v2"], [2, "v3", "v4"]]
ic = client.create_insert_context(table="test_table", data=data)
client.insert(context=ic)
assert client.command("SELECT count() FROM test_table") == 2

# Reuse with new data
new_data = [[3, "v5", "v6"], [4, "v7", "v8"]]
ic.data = new_data
client.insert(context=ic)
assert client.command("SELECT count() FROM test_table") == 4
```

Only the `data` property should be modified for reuse. This is consistent with its purpose: repeated inserts of new data into the same table.

`InsertContext` objects include mutable state updated during the insert process, so they are not thread-safe.

## Write formats {#write-formats}

Write formats control how Python values are serialized for insertion. In most cases, ClickHouse Connect auto-detects the correct format by checking the type of the first non-null value. For example, inserting a Python `int` into a `DateTime` column writes it directly as an epoch second.

Override write formats globally via `clickhouse_connect.datatypes.format`:

```python
from clickhouse_connect.datatypes.format import set_write_format

set_write_format("IPv4", "string")  # Accept formatted strings for IPv4 columns
```

### Write format options {#write-format-options}

| ClickHouse Type            | Native Python Type    | Write Formats           | Notes                                                                  |
|----------------------------|-----------------------|-------------------------|------------------------------------------------------------------------|
| Int[8-64], UInt[8-64]      | int                   | -                       |                                                                        |
| [U]Int[128,256]            | int                   | -                       |                                                                        |
| BFloat16, Float32, Float64 | float                 | -                       |                                                                        |
| Decimal                    | decimal.Decimal       | -                       |                                                                        |
| String                     | str                   | -                       |                                                                        |
| FixedString                | bytes                 | `string`                | Strings padded with zero bytes to the fixed size                       |
| Enum[8,16]                 | str                   | -                       |                                                                        |
| Date, Date32               | datetime.date         | `int`                   | Epoch day                                                              |
| DateTime                   | datetime.datetime     | `int`                   | Epoch seconds                                                          |
| DateTime64                 | datetime.datetime     | `int`                   | Raw 64-bit epoch value                                                 |
| Time, Time64               | datetime.timedelta    | `int`, `string`, `time` |                                                                        |
| IPv4                       | ipaddress.IPv4Address | `string`                | Properly formatted strings accepted                                    |
| IPv6                       | ipaddress.IPv6Address | `string`                | Properly formatted strings accepted                                    |
| Tuple                      | dict or tuple         | -                       |                                                                        |
| Map                        | dict                  | -                       |                                                                        |
| Nested                     | Sequence[dict]        | -                       |                                                                        |
| UUID                       | uuid.UUID             | `string`                | RFC 4122 formatted strings accepted                                    |
| JSON                       | dict                  | `string`                | Dicts or JSON strings accepted                                         |
| Variant                    | object                | -                       | Serialized using native ClickHouse types. See `typed_variant()` below. |
| Dynamic                    | object                | -                       | Currently inserted as String representation                            |
| QBit                       | list[float]           | -                       | Bit-transposed vector type. Experimental.                              |

### The `typed_variant()` helper {#typed-variant-helper}

When inserting into Variant columns, ClickHouse Connect determines the ClickHouse type from the Python value. For ambiguous cases (e.g., a list could map to multiple Array types), use `typed_variant()` to specify the exact type:

```python
from clickhouse_connect.datatypes.dynamic import typed_variant

data = [
    [typed_variant([1, 2, 3], "Array(UInt32)")],
    [typed_variant(["a", "b"], "Array(String)")],
    [17],  # Unambiguous types don't need the helper
]
client.insert("variant_table", data, column_names=["variant_col"])
```

Use `None` directly for null Variant values. Do not wrap `None` in `typed_variant`.

## Time zones {#time-zones}

ClickHouse stores all DateTime values as timezone-naive Unix timestamps. Timezone conversion happens on the client side.

### Timezone-aware datetime objects {#timezone-aware-datetime-objects}

Timezone-aware `datetime.datetime` objects are converted via `.timestamp()`, which correctly accounts for the timezone offset:

```python
from datetime import datetime
import pytz

denver_tz = pytz.timezone("America/Denver")
tokyo_tz = pytz.timezone("Asia/Tokyo")

data = [
    [datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)],
    [denver_tz.localize(datetime(2023, 6, 15, 10, 30, 0))],
    [tokyo_tz.localize(datetime(2023, 6, 15, 10, 30, 0))],
]

client.insert("events", data, column_names=["event_time"])
```

Each of these represents a different point in time because they have different timezones.

:::note
With pytz, always use `localize()` to attach timezone info. Passing `tzinfo=` directly to the `datetime` constructor uses incorrect historical offsets. For UTC, `tzinfo=pytz.UTC` works correctly.
:::

### Timezone-naive datetime objects {#timezone-naive-datetime-objects}

Naive datetimes (no `tzinfo`) are interpreted using the system's local timezone via `.timestamp()`. To avoid ambiguity:

1. Always use timezone-aware datetimes, or
2. Set the system timezone to UTC, or
3. Insert as epoch timestamp integers

```python
from datetime import datetime
import pytz

# Recommended: timezone-aware
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert("events", [[utc_time]], column_names=["event_time"])

# Alternative: manual epoch conversion
naive_time = datetime(2023, 6, 15, 10, 30, 0)
epoch = int(naive_time.replace(tzinfo=pytz.UTC).timestamp())
client.insert("events", [[epoch]], column_names=["event_time"])
```

### DateTime columns with timezone metadata {#datetime-columns-with-timezone-metadata}

Columns like `DateTime('America/Denver')` or `DateTime64(3, 'Asia/Tokyo')` store data the same way (UTC timestamps), but the timezone metadata controls the conversion when querying back.

When inserting, your datetime is converted to a Unix timestamp as usual. When querying, the result is returned in the column's timezone regardless of what timezone you used for insertion:

```python
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")

# Insert 10:30 AM New York time
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])

# Queried back as Los Angeles time:
# 10:30 AM New York (UTC-4) = 14:30 UTC = 7:30 AM Los Angeles (UTC-7)
result = client.query("SELECT * FROM events")
print(result.result_rows[0][0])
# datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' ...>)
```

## File inserts {#file-inserts}

Documented in [Inserting (File Inserts)](inserting.md#file-inserts).
