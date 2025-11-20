---
title: 'サポートされているデータ型'
slug: /integrations/clickpipes/mysql/datatypes
description: 'MySQL から ClickHouse への MySQL ClickPipe のデータ型マッピングについて説明するページ'
doc_type: 'reference'
keywords: ['MySQL ClickPipe datatypes', 'MySQL to ClickHouse data types', 'ClickPipe datatype mapping', 'MySQL ClickHouse type conversion', 'database type compatibility']
---

MySQL ClickPipe でサポートされているデータ型のマッピングは次のとおりです。

| MySQL Type                | ClickHouse type        | Notes                                                                                  |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | UNSIGNED をサポートします。|
| SmallInt                  | Int16                  | UNSIGNED をサポートします。|
| MediumInt, Int            | Int32                  | UNSIGNED をサポートします。|
| BigInt                    | Int64                  | UNSIGNED をサポートします。|
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | MySQL のみ。MariaDB の `json` は、制約付き `text` 型のエイリアスにすぎません。              |
| Geometry & Geometry Types | String                 | WKT（Well-Known Text）。WKT ではわずかな精度低下が発生する可能性があります。                       |
| Vector                    | Array(Float32)         | MySQL のみ。MariaDB も近日中にサポートを追加予定です。                                            |
| Float                     | Float32                | テキストプロトコルにより、初回ロード時には ClickHouse 側の精度が MySQL と異なる場合があります。|
| Double                    | Float64                | テキストプロトコルにより、初回ロード時には ClickHouse 側の精度が MySQL と異なる場合があります。|
| Date                      | Date32                 | 日または月が 00 の場合は 01 にマッピングされます。|
| Time                      | DateTime64(6)          | Unix エポックからの時間オフセット。|
| Datetime, Timestamp       | DateTime64(6)          | 日または月が 00 の場合は 01 にマッピングされます。|