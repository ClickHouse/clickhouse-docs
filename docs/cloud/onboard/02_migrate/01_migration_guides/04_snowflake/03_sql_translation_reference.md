---
sidebar_label: 'SQL translation reference'
slug: /migrations/snowflake-translation-reference
description: 'SQL translation reference'
keywords: ['Snowflake']
title: 'Migrating from Snowflake to ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---

# Snowflake SQL translation guide

## Data types {#data-types}

### Numerics {#numerics}

Users moving data between ClickHouse and Snowflake will immediately notice that 
ClickHouse offers more granular precision concerning declaring numerics. For example,
Snowflake offers the type Number for numerics. This requires the user to specify a 
precision (total number of digits) and scale (digits to the right of the decimal place)
up to a total of 38. Integer declarations are synonymous with Number, and simply 
define a fixed precision and scale where the range is the same. This convenience 
is possible as modifying the precision (scale is 0 for integers) does not impact the 
size of data on disk in Snowflake - the minimal required bytes are used for a 
numeric range at write time at a micro partition level. The scale does, however,
impact storage space and is offset with compression. A `Float64` type offers a 
wider range of values with a loss of precision.

Contrast this with ClickHouse, which offers multiple signed and unsigned 
precision for floats and integers. With these, ClickHouse users can be explicit about
the precision required for integers to optimize storage and memory overhead. A 
Decimal type, equivalent to Snowflake’s Number type, also offers twice the 
precision and scale at 76 digits. In addition to a similar `Float64` value, 
ClickHouse also provides a `Float32` for when precision is less critical and 
compression paramount.

### Strings {#strings}

ClickHouse and Snowflake take contrasting approaches to the storage of string 
data. The `VARCHAR` in Snowflake holds Unicode characters in UTF-8, allowing the
user to specify a maximum length. This length has no impact on storage or 
performance, with the minimum number of bytes always used to store a string, and
rather provides only constraints useful for downstream tooling. Other types, such
as `Text` and `NChar`, are simply aliases for this type. ClickHouse conversely 
stores all [string data as raw bytes](/sql-reference/data-types/string) with a `String`
type (no length specification required), deferring encoding to the user, with
[query time functions](/sql-reference/functions/string-functions#lengthUTF8)
available for different encodings. We refer the reader to ["Opaque data argument"](https://utf8everywhere.org/#cookie)
for the motivation as to why. The ClickHouse `String` is thus more comparable 
to the Snowflake Binary type in its implementation. Both [Snowflake](https://docs.snowflake.com/en/sql-reference/collation)
and [ClickHouse](/sql-reference/statements/select/order-by#collation-support) 
support “collation”, allowing users to override how strings are sorted and compared.

### Semi-structured types {#semi-structured-data}

Snowflake supports the `VARIANT`, `OBJECT` and `ARRAY` types for semi-structured
data.

ClickHouse offers the equivalent [`Variant`](/sql-reference/data-types/variant),
`Object` (now deprecated in favor of the native `JSON` type) and [`Array`](/sql-reference/data-types/array)
types. Additionally, ClickHouse has the [`JSON`](/sql-reference/data-types/newjson) 
type which replaces the now deprecated `Object('json')` type and is particularly
performant and storage efficient in [comparison to other native JSON types](https://jsonbench.com/).

ClickHouse also supports named [`Tuple`s](/sql-reference/data-types/tuple) and arrays of Tuples
via the [`Nested`](/sql-reference/data-types/nested-data-structures/nested) type,
allowing users to explicitly map nested structures. This allows codecs and type 
optimizations to be applied throughout the hierarchy, unlike Snowflake, which 
requires the user to use the `OBJECT`, `VARIANT`, and `ARRAY` types for the outer
object and does not allow [explicit internal typing](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#characteristics-of-an-object).
This internal typing also simplifies queries on nested numerics in ClickHouse, 
which do not need to be cast and can be used in index definitions.

In ClickHouse, codecs and optimized types can also be applied to substructures. 
This provides an added benefit that compression with nested structures remains 
excellent, and comparable, to flattened data. In contrast, as a result of the 
inability to apply specific types to substructures, Snowflake recommends [flattening
data to achieve optimal compression](https://docs.snowflake.com/en/user-guide/semistructured-considerations#storing-semi-structured-data-in-a-variant-column-vs-flattening-the-nested-structure).
Snowflake also [imposes size restrictions](https://docs.snowflake.com/en/user-guide/semistructured-considerations#data-size-limitations)
for these data types.

### Type reference {#type-reference}

| Snowflake                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ClickHouse                                                                                                                                                     | Note                                                                                                                                                                                                                                                                                                                                                                            |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`NUMBER`](https://docs.snowflake.com/en/sql-reference/data-types-numeric)                                                                                                                                                                                                                                                                                                                                                                                                      | [`Decimal`](/sql-reference/data-types/decimal)                                                                                                                 | ClickHouse supports twice the precision and scale than Snowflake - 76 digits vs. 38.                                                                                                                                                                                                                                                                                            |
| [`FLOAT`, `FLOAT4`, `FLOAT8`](https://docs.snowflake.com/en/sql-reference/data-types-numeric#data-types-for-floating-point-numbers)                                                                                                                                                                                                                                                                                                                                             | [`Float32`, `Float64`](/sql-reference/data-types/float)                                                                                                        | All floats in Snowflake are 64 bit.                                                                                                                                                                                                                                                                                                                                             |
| [`VARCHAR`](https://docs.snowflake.com/en/sql-reference/data-types-text#varchar)                                                                                                                                                                                                                                                                                                                                                                                                | [`String`](/sql-reference/data-types/string)                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                 |
| [`BINARY`](https://docs.snowflake.com/en/sql-reference/data-types-text#binary)                                                                                                                                                                                                                                                                                                                                                                                                  | [`String`](/sql-reference/data-types/string)                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                 |
| [`BOOLEAN`](https://docs.snowflake.com/en/sql-reference/data-types-logical)                                                                                                                                                                                                                                                                                                                                                                                                     | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                 |
| [`DATE`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#date)                                                                                                                                                                                                                                                                                                                                                                                                  | [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32)                                                                         | `DATE` in Snowflake offers a wider date range than ClickHouse e.g. min for `Date32` is `1900-01-01` and `Date` `1970-01-01`. `Date` in ClickHouse provides more cost efficient (two byte) storage.                                                                                                                                                                              |
| [`TIME(N)`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#time)                                                                                                                                                                                                                                                                                                                                                                                               | No direct equivalent but can be represented by [`DateTime`](/sql-reference/data-types/datetime) and [`DateTime64(N)`](/sql-reference/data-types/datetime64).   | `DateTime64` uses the same concepts of precision.                                                                                                                                                                                                                                                                                                                               |
| [`TIMESTAMP`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp) - [`TIMESTAMP_LTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_NTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_TZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz) | [`DateTime`](/sql-reference/data-types/datetime) and [`DateTime64`](/sql-reference/data-types/datetime64)                                                      | `DateTime` and `DateTime64` can optionally have a TZ parameter defined for the column. If not present, the server's timezone is used. Additionally a `--use_client_time_zone` parameter is available for the client.                                                                                                                                                            |
| [`VARIANT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#variant)                                                                                                                                                                                                                                                                                                                                                                                      | [`JSON`, `Tuple`, `Nested`](/interfaces/formats)                                                                                                   | `JSON` type is experimental in ClickHouse. This type infers the column types at insert time. `Tuple`, `Nested` and `Array` can also be used to build explicitly type structures as an alternative.                                                                                                                                                                              |
| [`OBJECT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#object)                                                                                                                                                                                                                                                                                                                                                                                        | [`Tuple`, `Map`, `JSON`](/interfaces/formats)                                                                                                      | Both `OBJECT` and `Map` are analogous to `JSON` type in ClickHouse where the keys are a `String`. ClickHouse requires the value to be consistent and strongly typed whereas Snowflake uses `VARIANT`. This means the values of different keys can be a different type. If this is required in ClickHouse, explicitly define the hierarchy using `Tuple` or rely on `JSON` type. |
| [`ARRAY`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#array)                                                                                                                                                                                                                                                                                                                                                                                          | [`Array`](/sql-reference/data-types/array), [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                                                | `ARRAY` in Snowflake uses `VARIANT` for the elements - a super type. Conversely these are strongly typed in ClickHouse.                                                                                                                                                                                                                                                         |
| [`GEOGRAPHY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geography-data-type)                                                                                                                                                                                                                                                                                                                                                                            | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                                    | Snowflake imposes a coordinate system (WGS 84) while ClickHouse applies at query time.                                                                                                                                                                                                                                                                                          |
| [`GEOMETRY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geometry-data-type)                                                                                                                                                                                                                                                                                                                                                                              | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                                                                                                                                                      |

| ClickHouse Type   | Description                                                                                         |
|-------------------|-----------------------------------------------------------------------------------------------------|
| `IPv4` and `IPv6` | IP-specific types, potentially allowing more efficient storage than Snowflake.                      |
| `FixedString`     | Allows a fixed length of bytes to be used, which is useful for hashes.                              |
| `LowCardinality`  | Allows any type to be dictionary encoded. Useful for when the cardinality is expected to be < 100k. |
| `Enum`            | Allows efficient encoding of named values in either 8 or 16-bit ranges.                             |
| `UUID`            | For efficient storage of UUIDs.                                                                     |
| `Array(Float32)`  | Vectors can be represented as an Array of Float32 with supported distance functions.                |

Finally, ClickHouse offers the unique ability to store the intermediate 
[state of aggregate functions](/sql-reference/data-types/aggregatefunction). This
state is implementation-specific, but allows the result of an aggregation to be 
stored and later queried (with corresponding merge functions). Typically, this 
feature is used via a materialized view and, as demonstrated below, offers the 
ability to improve performance of specific queries with minimal storage cost by
storing the incremental result of queries over inserted data (more details here).
