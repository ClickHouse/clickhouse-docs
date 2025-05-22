---
'title': 'ClickPipes for MySQL: 支持的数据类型'
'slug': '/integrations/clickpipes/mysql/datatypes'
'description': '页面描述MySQL ClickPipe数据类型从MySQL到ClickHouse的映射'
---

Here is the supported data-type mapping for the MySQL ClickPipe:

| MySQL 类型                                                                  | ClickHouse 类型                           | 说明                                                                                   |
| -------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| Enum                                                                       | LowCardinality(String)                   |                                                                                        |
| Set                                                                        | String                                   |                                                                                        |
| Decimal                                                                    | Decimal                                  |                                                                                        |
| TinyInt                                                                    | Int8                                     | 支持无符号。                                                                          |
| SmallInt                                                                   | Int16                                    | 支持无符号。                                                                          |
| MediumInt, Int                                                             | Int32                                    | 支持无符号。                                                                          |
| BigInt                                                                     | Int64                                    | 支持无符号。                                                                          |
| Year                                                                       | Int16                                    |                                                                                        |
| TinyText, Text, MediumText, LongText                                       | String                                   |                                                                                        |
| TinyBlob, Blob, MediumBlob, LongBlob                                       | String                                   |                                                                                        |
| Char, Varchar                                                              | String                                   |                                                                                        |
| Binary, VarBinary                                                          | String                                   |                                                                                        |
| TinyInt(1)                                                                 | Bool                                     |                                                                                        |
| JSON                                                                       | String                                   | MySQL 专用；MariaDB 的 `json` 只是带约束的 `text` 的别名。                                       |
| Geometry & Geometry Types                                                 | String                                   | WKT（已知的文本）。WKT 可能会有小的精度损失。                                           |
| Vector                                                                     | Array(Float32)                          | MySQL 专用；MariaDB 将很快添加支持。                                                     |
| Float                                                                      | Float32                                  | 由于文本协议，ClickHouse 在初始加载时的精度可能与 MySQL 不同。                           |
| Double                                                                     | Float64                                  | 由于文本协议，ClickHouse 在初始加载时的精度可能与 MySQL 不同。                           |
| Date                                                                       | Date32                                   |                                                                                        |
| Time                                                                       | DateTime64(6)                           | 日期部分为 Unix 纪元。                                                                  |
| Datetime, Timestamp                                                        | DateTime64(6)                           |                                                                                        |
