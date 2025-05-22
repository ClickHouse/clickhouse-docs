---
'title': 'ClickPipes for MySQL: Supported data types'
'slug': '/integrations/clickpipes/mysql/datatypes'
'description': 'Page describing MySQL ClickPipe datatype mapping from MySQL to ClickHouse'
---



Here is the supported data-type mapping for the MySQL ClickPipe:

| MySQL Type                                                                 | ClickHouse type                             | Notes                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Enum                                                                       | LowCardinality(String)                     | |
| Set                                                                        | String                                     |  |
| Decimal                                                                    | Decimal                                   |  |
| TinyInt                                                                    | Int8                                      | 符号なしをサポートしています。                                                                   |
| SmallInt                                                                   | Int16                                     | 符号なしをサポートしています。                                                                   |
| MediumInt, Int                                                             | Int32                                     | 符号なしをサポートしています。                                                                   |
| BigInt                                                                     | Int64                                     | 符号なしをサポートしています。                                                                   |
| Year                                                                       | Int16                                     |                    |
| TinyText, Text, MediumText, LongText                                       | String                                    |                                                                                        |
| TinyBlob, Blob, MediumBlob, LongBlob                                       | String                                    |                                                                                        |
| Char, Varchar                                                              | String                                    |                                                                                        |
| Binary, VarBinary                                                          | String                                    |                                                                                        |
| TinyInt(1)                                                                 | Bool                                      |                  |
| JSON                                                                       | String                                    | MySQL専用; MariaDBの `json` は `text` のエイリアスで制約が付いています。                         |
| Geometry & Geometry Types                                                 | String                                    | WKT (Well-Known Text)。WKTは小さな精度損失を被る可能性があります。                  |
| Vector                                                                     | Array(Float32)                            | MySQL専用; MariaDBはサポートを近日中に追加予定です。                                         |
| Float                                                                      | Float32                                   | 初期ロード中にClickHouseの精度がMySQLと異なる場合があります。テキストプロトコルによるため。                |
| Double                                                                     | Float64                                   | 初期ロード中にClickHouseの精度がMySQLと異なる場合があります。テキストプロトコルによるため。                |
| Date                                                                       | Date32                                    |                                                                                        |
| Time                                                                       | DateTime64(6)                             | 日付部分はUnixエポックです。                                                             |
| Datetime, Timestamp                                                        | DateTime64(6)                             |                                                                                        |
