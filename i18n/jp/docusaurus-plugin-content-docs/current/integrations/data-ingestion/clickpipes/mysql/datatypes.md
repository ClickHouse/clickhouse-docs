---
'title': 'サポートされているデータ型'
'slug': '/integrations/clickpipes/mysql/datatypes'
'description': 'MySQL から ClickHouse への MySQL ClickPipe データ型マッピングを説明するページ'
'doc_type': 'reference'
---

Here is the supported data-type mapping for the MySQL ClickPipe:

| MySQL Type                | ClickHouse type        | Notes                                                                                  |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) |                                                                                       |
| Set                       | String                 |                                                                                       |
| Decimal                   | Decimal                |                                                                                       |
| TinyInt                   | Int8                   | 符号なしをサポートします。                                                           |
| SmallInt                  | Int16                  | 符号なしをサポートします。                                                           |
| MediumInt, Int            | Int32                  | 符号なしをサポートします。                                                           |
| BigInt                    | Int64                  | 符号なしをサポートします。                                                           |
| Year                      | Int16                  |                                                                                       |
| TinyText, Text, MediumText, LongText | String      |                                                                                       |
| TinyBlob, Blob, MediumBlob, LongBlob | String      |                                                                                       |
| Char, Varchar             | String                 |                                                                                       |
| Binary, VarBinary         | String                 |                                                                                       |
| TinyInt(1)                | Bool                   |                                                                                       |
| JSON                      | String                 | MySQL専用; MariaDBの `json` は制約のある `text` のエイリアスです。                  |
| Geometry & Geometry Types | String                 | WKT (Well-Known Text)。WKTは精度のわずかな損失を受ける可能性があります。            |
| Vector                    | Array(Float32)         | MySQL専用; MariaDBは近日中にサポートを追加します。                                    |
| Float                     | Float32                | 初期ロード時にテキストプロトコルによりClickHouseの精度はMySQLと異なる場合があります。 |
| Double                    | Float64                | 初期ロード時にテキストプロトコルによりClickHouseの精度はMySQLと異なる場合があります。 |
| Date                      | Date32                 | 00日/月は01にマッピングされます。                                                   |
| Time                      | DateTime64(6)          | UNIXエポックからの時間オフセット。                                                  |
| Datetime, Timestamp       | DateTime64(6)          | 00日/月は01にマッピングされます。                                                   |
