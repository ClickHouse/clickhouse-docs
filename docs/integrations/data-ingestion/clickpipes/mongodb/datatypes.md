---
title: 'ClickPipes for MongoDB: Supported data types'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'Page describing MongoDB ClickPipe datatype mapping from MongoDB to ClickHouse'
---

MongoDB stores data records as BSON documents. In ClickPipes, you can configure to ingest BSON documents to ClickHouse as either JSON or JSON String. The following table shows the supported BSON to JSON type mapping:

| MongoDB BSON Type        | ClickHouse JSON Type                   | Notes                    |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601 format          |
| Regular Expression       | \{Options: String, Pattern: String\}     | MongoDB regex with fixed fields: Options (regex flags) and Pattern (regex pattern) |
| Timestamp                | \{T: Int64, I: Int64\}                   | MongoDB internal timestamp format with fixed fields: T (timestamp) and I (increment) |
| Decimal128               | String                                 |                          |
| Array                    | Array(Nullable(String))                |                          |
| Binary data              | Array(Nullable(Int64))                 | Array of byte values     |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Object                   | Dynamic                                | Each nested field is mapped recursively |
