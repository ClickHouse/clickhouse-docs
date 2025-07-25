---
title: 'ClickPipes for MongoDB: Supported data types'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'Page describing MongoDB ClickPipe datatype mapping from MongoDB to ClickHouse'
---

Mongo BSON documents are stored to ClickHouse as `JSON` data type. `JSON` fields are recursively mapped to ClickHouse data types based on the following mapping:

| MongoDB Type             | ClickHouse JSON Field Type             | Notes                    |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601 format          |
| Regular Expression       | {Options: String, Pattern: String}     |                          |
| Timestamp                | {T: Int64, I: Int64}                   | Mongo internal timestamp format|
| Decimal128               | String                                 |                          |
| Array                    | Array(Nullable(String))                |                          |
| Binary data              | {Data: String, Subtype: Int64}         | See [Mongo Subtypes](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data) for reference                         |
| JavaScript               | String                                 |                          |
| Object                   | Dynamic type                           | Types of each field recursively applies this mapping                          |
