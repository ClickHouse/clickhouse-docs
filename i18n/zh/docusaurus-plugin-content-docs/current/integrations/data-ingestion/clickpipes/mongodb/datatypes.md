---
title: '支持的数据类型'
slug: /integrations/clickpipes/mongodb/datatypes
description: '介绍 MongoDB ClickPipe 中从 MongoDB 到 ClickHouse 的数据类型映射的页面'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
---

MongoDB 将数据记录存储为 BSON 文档。在 ClickPipes 中，可以配置将 BSON 文档以 JSON 或 JSON String 的形式摄取到 ClickHouse。下表展示了支持的 BSON 到 JSON 字段类型映射：

| MongoDB BSON 类型        | ClickHouse JSON 类型                   | 说明                     |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601 格式            |
| Regular Expression       | \{Options: String, Pattern: String\}   | MongoDB 正则表达式，具有固定字段：Options（正则标志）和 Pattern（正则模式） |
| Timestamp                | \{T: Int64, I: Int64\}                 | MongoDB 内部时间戳格式，具有固定字段：T（时间戳）和 I（自增值） |
| Decimal128               | String                                 |                          |
| Binary data              | \{Data: String, Subtype: Int64\}       | MongoDB 二进制数据，具有固定字段：Data（base64 编码）和 Subtype（[二进制类型](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)） |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Array                    | Dynamic                                | 同构类型的数组会变为 Array(Nullable(T))；包含多种原始类型的数组会提升到最通用的公共类型；包含复杂且不兼容类型的数组会变为 Tuple 类型 |
| Object                   | Dynamic                                | 每个嵌套字段会递归映射 |

:::info
要了解更多关于 ClickHouse 的 JSON 数据类型的信息，请参阅[我们的文档](https://clickhouse.com/docs/sql-reference/data-types/newjson)。
:::