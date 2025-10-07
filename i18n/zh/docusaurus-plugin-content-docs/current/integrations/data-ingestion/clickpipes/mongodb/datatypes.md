---
'title': '支持的数据类型'
'slug': '/integrations/clickpipes/mongodb/datatypes'
'description': '页面描述 MongoDB ClickPipe 数据类型从 MongoDB 映射到 ClickHouse'
'doc_type': 'reference'
---

MongoDB将数据记录存储为BSON文档。在ClickPipes中，您可以配置以将BSON文档以JSON或JSON字符串的形式导入到ClickHouse。下表显示了支持的BSON到JSON字段类型映射：

| MongoDB BSON类型         | ClickHouse JSON类型                     | 备注                     |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32位整数                 | Int64                                  |                          |
| 64位整数                 | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601格式              |
| 正则表达式              | \{Options: String, Pattern: String\}   | MongoDB正则表达式，固定字段：Options（正则标志）和Pattern（正则模式） |
| 时间戳                  | \{T: Int64, I: Int64\}                 | MongoDB内部时间戳格式，固定字段：T（时间戳）和I（增量） |
| Decimal128               | String                                 |                          |
| 二进制数据              | \{Data: String, Subtype: Int64\}       | MongoDB二进制数据，固定字段：Data（base64编码）和Subtype（[二进制类型](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)） |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| 数组                    | Dynamic                                | 同质类型的数组变为Array(Nullable(T)); 混合原始类型的数组提升为最一般的公共类型; 复杂不兼容类型的数组变为元组 |
| 对象                    | Dynamic                                | 每个嵌套字段递归映射   |

:::info
要了解有关ClickHouse的JSON数据类型的更多信息，请参阅 [我们的文档](https://clickhouse.com/docs/sql-reference/data-types/newjson)。
:::
