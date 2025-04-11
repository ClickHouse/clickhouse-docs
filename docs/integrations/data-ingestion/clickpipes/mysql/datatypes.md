---
title: 'ClickPipes for MySQL: Supported data types'
slug: /integrations/clickpipes/mysql/datatypes
description: 'Page describing MySQL ClickPipe datatype mapping from MySQL to ClickHouse'
---

Here is the supported data-type mapping for the MySQL ClickPipe:

| MySQL Type                                                                 | ClickHouse type                             | Notes                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Enum                                                                       | LowCardinality(String)                     | MySQL doesn't have user-defined types for enums; instead, columns have type `enum('a','b','c')`. |
| Set                                                                        | String                                     | `set` is like `enum`, except from `set('a','b','c')` value can be `'a,b'`. `set` can only have 64 items, as it's internally a 64-bit bitset. |
| Decimal                                                                    | Decimal                                   |  |
| TinyInt                                                                    | Int8                                      | Supports unsigned.                                                                     |
| SmallInt                                                                   | Int16                                     | Supports unsigned.                                                                     |
| MediumInt, Int                                                             | Int32                                     | Supports unsigned.                                                                     |
| BigInt                                                                     | Int64                                     | Supports unsigned.                                                                     |
| Year                                                                       | Int16                                     |                    |
| TinyText, Text, MediumText, LongText                                       | String                                    |                                                                                        |
| TinyBlob, Blob, MediumBlob, LongBlob                                       | String                                    |                                                                                        |
| Char, Varchar                                                              | String                                    |                                                                                        |
| Binary, VarBinary                                                          | String                                    |                                                                                        |
| TinyInt(1)                                                                 | Bool                                      | This is a display hint; MySQL has `boolean` aliased to `tinyint(1)`.                   |
| JSON                                                                       | String                                    | MySQL only; MariaDB `json` is just an alias for `text` with a constraint.              |
| Geometry & Geometry Types                                                 | String                                    | WKT (Well-Known Text). WKT may suffer from small precision loss. |
| Vector                                                                     | Array(Float32)                            | MySQL only; MariaDB is adding support soon.                                            |
| Float                                                                      | Float32                                   | May lose a bit of precision during initial load due to text protocols.                 |
| Double                                                                     | Float64                                   | May lose a bit of precision during initial load due to text protocols.                 |
| Date                                                                       | Date32                                    |                                                                                        |
| Time                                                                       | DateTime64(6)                             | The date portion is Unix epoch.                                                       |
| Datetime, Timestamp                                                        | DateTime64(6)                             |                                                                                        |
