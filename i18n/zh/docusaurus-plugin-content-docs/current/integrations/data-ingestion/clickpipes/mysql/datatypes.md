---
'title': 'ClickPipes for MySQL: Supported data types'
'slug': '/integrations/clickpipes/mysql/datatypes'
'description': 'Page describing MySQL ClickPipe datatype mapping from MySQL to ClickHouse'
---



Here is the supported data-type mapping for the MySQL ClickPipe:

| MySQL 类型                                                               | ClickHouse 类型                            | 备注                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Enum                                                                    | LowCardinality(String)                     |                                                                                       |
| Set                                                                     | String                                     |                                                                                       |
| Decimal                                                                 | Decimal                                    |                                                                                       |
| TinyInt                                                                 | Int8                                       | 支持无符号。                                                                          |
| SmallInt                                                                | Int16                                      | 支持无符号。                                                                          |
| MediumInt, Int                                                          | Int32                                      | 支持无符号。                                                                          |
| BigInt                                                                  | Int64                                      | 支持无符号。                                                                          |
| Year                                                                    | Int16                                      |                                                                                       |
| TinyText, Text, MediumText, LongText                                    | String                                     |                                                                                       |
| TinyBlob, Blob, MediumBlob, LongBlob                                    | String                                     |                                                                                       |
| Char, Varchar                                                           | String                                     |                                                                                       |
| Binary, VarBinary                                                       | String                                     |                                                                                       |
| TinyInt(1)                                                              | Bool                                       |                                                                                       |
| JSON                                                                    | String                                     | 仅限 MySQL；MariaDB 的 `json` 只是带有约束的 `text` 的别名。                             |
| Geometry & Geometry Types                                              | String                                     | WKT (Well-Known Text)。WKT 可能会有小的精度损失。                                     |
| Vector                                                                  | Array(Float32)                             | 仅限 MySQL；MariaDB 即将添加支持。                                                       |
| Float                                                                   | Float32                                    | 由于文本协议，在初始加载时 ClickHouse 的精度可能与 MySQL 不同。                             |
| Double                                                                  | Float64                                    | 由于文本协议，在初始加载时 ClickHouse 的精度可能与 MySQL 不同。                             |
| Date                                                                    | Date32                                     |                                                                                       |
| Time                                                                    | DateTime64(6)                             | 日期部分为 Unix 纪元。                                                                |
| Datetime, Timestamp                                                     | DateTime64(6)                             |                                                                                       |
