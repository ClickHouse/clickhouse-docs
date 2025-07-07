---
'title': 'ClickPipes for MySQL: 支持的数据类型'
'slug': '/integrations/clickpipes/mysql/datatypes'
'description': '页面描述 MySQL ClickPipe 数据类型从 MySQL 到 ClickHouse 的映射'
---

以下是 MySQL ClickPipe 支持的数据类型映射：

| MySQL 类型                                                                 | ClickHouse 类型                             | 备注                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Enum                                                                       | LowCardinality(String)                     | |
| Set                                                                        | String                                     |  |
| Decimal                                                                    | Decimal                                   |  |
| TinyInt                                                                    | Int8                                      | 支持无符号。                                                                         |
| SmallInt                                                                   | Int16                                     | 支持无符号。                                                                         |
| MediumInt, Int                                                             | Int32                                     | 支持无符号。                                                                         |
| BigInt                                                                     | Int64                                     | 支持无符号。                                                                         |
| Year                                                                       | Int16                                     |                    |
| TinyText, Text, MediumText, LongText                                       | String                                    |                                                                                        |
| TinyBlob, Blob, MediumBlob, LongBlob                                       | String                                    |                                                                                        |
| Char, Varchar                                                              | String                                    |                                                                                        |
| Binary, VarBinary                                                          | String                                    |                                                                                        |
| TinyInt(1)                                                                 | Bool                                      |                  |
| JSON                                                                       | String                                    | MySQL 专用；MariaDB 中的 `json` 只是 `text` 的别名，并带有约束。              |
| Geometry & Geometry Types                                                 | String                                    | WKT（已知文本）。WKT 可能会有小的精度损失。 |
| Vector                                                                     | Array(Float32)                            | MySQL 专用；MariaDB 很快会添加支持。                                            |
| Float                                                                      | Float32                                   | 由于文本协议，ClickHouse 的精度可能与 MySQL 在初始加载时有所不同。                 |
| Double                                                                     | Float64                                   | 由于文本协议，ClickHouse 的精度可能与 MySQL 在初始加载时有所不同。                 |
| Date                                                                       | Date32                                    |                                                                                        |
| Time                                                                       | DateTime64(6)                             | 日期部分为 Unix 纪元。                                                               |
| Datetime, Timestamp                                                        | DateTime64(6)                             |                                                                                        |
