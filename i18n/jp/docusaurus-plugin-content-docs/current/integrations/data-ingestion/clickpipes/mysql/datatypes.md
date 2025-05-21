---
title: 'MySQL用のClickPipes: サポートされているデータ型'
slug: /integrations/clickpipes/mysql/datatypes
description: 'MySQLからClickHouseへのClickPipeデータ型マッピングを説明するページ'
---

MySQL ClickPipeのサポートされているデータ型マッピングは以下の通りです：

| MySQL Type                                                                 | ClickHouse type                             | Notes                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Enum                                                                       | LowCardinality(String)                     | |
| Set                                                                        | String                                     |  |
| Decimal                                                                    | Decimal                                   |  |
| TinyInt                                                                    | Int8                                      | アン signed をサポートしています。                                                                 |
| SmallInt                                                                   | Int16                                     | アン signed をサポートしています。                                                                 |
| MediumInt, Int                                                             | Int32                                     | アン signed をサポートしています。                                                                 |
| BigInt                                                                     | Int64                                     | アン signed をサポートしています。                                                                 |
| Year                                                                       | Int16                                     |                    |
| TinyText, Text, MediumText, LongText                                       | String                                    |                                                                                        |
| TinyBlob, Blob, MediumBlob, LongBlob                                       | String                                    |                                                                                        |
| Char, Varchar                                                              | String                                    |                                                                                        |
| Binary, VarBinary                                                          | String                                    |                                                                                        |
| TinyInt(1)                                                                 | Bool                                      |                  |
| JSON                                                                       | String                                    | MySQL専用; MariaDBの `json` は制約付きの `text` のエイリアスです。              |
| Geometry & Geometry Types                                                 | String                                    | WKT (Well-Known Text)。WKTは小さな精度損失が生じる可能性があります。 |
| Vector                                                                     | Array(Float32)                            | MySQL専用; MariaDBは近日中にサポートを追加予定です。                                            |
| Float                                                                      | Float32                                   | 初期ロード中にClickHouseの精度はMySQLと異なる場合があります。テキストプロトコルに起因します。                |
| Double                                                                     | Float64                                   | 初期ロード中にClickHouseの精度はMySQLと異なる場合があります。テキストプロトコルに起因します。                |
| Date                                                                       | Date32                                    |                                                                                        |
| Time                                                                       | DateTime64(6)                             | 日付部分はUnixエポックです。                                                       |
| Datetime, Timestamp                                                        | DateTime64(6)                             |                                                                                        |
