---
title: 'Supported data types'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'Page describing MongoDB ClickPipe datatype mapping from MongoDB to ClickHouse'
doc_type: 'reference'
---

MongoDB stores data records as BSON documents. In ClickPipes, you can configure to ingest BSON documents to ClickHouse as either JSON or JSON String. The following table shows the supported BSON to JSON field type mapping:

| MongoDB BSON Type        | ClickHouse JSON Type                   | Notes                    |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601 format          |
| Regular Expression       | \{Options: String, Pattern: String\}   | MongoDB regex with fixed fields: Options (regex flags) and Pattern (regex pattern) |
| Timestamp                | \{T: Int64, I: Int64\}                 | MongoDB internal timestamp format with fixed fields: T (timestamp) and I (increment) |
| Decimal128               | String                                 |                          |
| Binary data              | \{Data: String, Subtype: Int64\}       | MongoDB binary data with fixed fields: Data (base64-encoded) and Subtype ([type of binary](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)) |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Array                    | Dynamic                                | Arrays with homogeneous types become Array(Nullable(T)); arrays with mixed primitive types are promoted to the most general common type; arrays with complex incompatible types become Tuples |
| Object                   | Dynamic                                | Each nested field is mapped recursively |

:::info
To learn more about ClickHouse's JSON data types, see [our documentation](https://clickhouse.com/docs/sql-reference/data-types/newjson).
:::
