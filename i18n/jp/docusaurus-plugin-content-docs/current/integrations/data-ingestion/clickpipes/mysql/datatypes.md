---
title: 'サポートされているデータ型'
slug: /integrations/clickpipes/mysql/datatypes
description: 'MySQL ClickPipe における MySQL から ClickHouse へのデータ型マッピングを説明したページ'
doc_type: 'reference'
keywords: ['MySQL ClickPipe データ型', 'MySQL から ClickHouse へのデータ型', 'ClickPipe データ型マッピング', 'MySQL ClickHouse 型変換', 'データベース型の互換性']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

MySQL ClickPipe でサポートされているデータ型マッピングは次のとおりです。

| MySQL Type                | ClickHouse type        | Notes                                                                                  |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | `UNSIGNED` をサポートします。|
| SmallInt                  | Int16                  | `UNSIGNED` をサポートします。|
| MediumInt, Int            | Int32                  | `UNSIGNED` をサポートします。|
| BigInt                    | Int64                  | `UNSIGNED` をサポートします。|
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | MySQL のみ。MariaDB の `json` は、制約付きの `text` へのエイリアスにすぎません。              |
| Geometry & Geometry Types | String                 | WKT（Well-Known Text）形式。WKT ではわずかな精度低下が発生する場合があります。                       |
| Vector                    | Array(Float32)         | MySQL のみ。MariaDB でも近日中にサポート予定です。                                            |
| Float                     | Float32                | テキストプロトコルを使用するため、初回ロード時は ClickHouse 側の精度が MySQL と異なる場合があります。|
| Double                    | Float64                | テキストプロトコルを使用するため、初回ロード時は ClickHouse 側の精度が MySQL と異なる場合があります。|
| Date                      | Date32                 | 日・月が 00 の場合は 01 にマッピングされます。|
| Time                      | DateTime64(6)          | UNIX エポックからの時間オフセットです。|
| Datetime, Timestamp       | DateTime64(6)          | 日・月が 00 の場合は 01 にマッピングされます。|