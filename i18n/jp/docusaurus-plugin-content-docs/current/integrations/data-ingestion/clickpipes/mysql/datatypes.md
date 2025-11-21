---
title: 'サポートされているデータ型'
slug: /integrations/clickpipes/mysql/datatypes
description: 'MySQL から ClickHouse への MySQL ClickPipe のデータ型マッピングを説明するページ'
doc_type: 'reference'
keywords: ['MySQL ClickPipe データ型', 'MySQL から ClickHouse へのデータ型', 'ClickPipe データ型マッピング', 'MySQL ClickHouse 型変換', 'データベース型互換性']
---

MySQL ClickPipe でサポートされるデータ型のマッピングは次のとおりです。

| MySQL の型                | ClickHouse の型        | 備考                                                                                   |
| --------------------------| -----------------------| -------------------------------------------------------------------------------------- |
| Enum                      | LowCardinality(String) ||
| Set                       | String                 ||
| Decimal                   | Decimal                ||
| TinyInt                   | Int8                   | 符号なしをサポートします。|
| SmallInt                  | Int16                  | 符号なしをサポートします。|
| MediumInt, Int            | Int32                  | 符号なしをサポートします。|
| BigInt                    | Int64                  | 符号なしをサポートします。|
| Year                      | Int16                  ||
| TinyText, Text, MediumText, LongText | String      ||
| TinyBlob, Blob, MediumBlob, LongBlob | String      ||
| Char, Varchar             | String                 ||
| Binary, VarBinary         | String                 ||
| TinyInt(1)                | Bool                   ||
| JSON                      | String                 | MySQL のみ。MariaDB の `json` は、制約付きの `text` への単なるエイリアスです。              |
| Geometry & Geometry Types | String                 | WKT（Well-Known Text）。WKT ではわずかな精度低下が発生する場合があります。                       |
| Vector                    | Array(Float32)         | MySQL のみ。MariaDB は近日中にサポートを追加する予定です。                                            |
| Float                     | Float32                | テキストプロトコルの使用により、初回の読み込み時に ClickHouse 上の精度が MySQL と異なる場合があります。|
| Double                    | Float64                | テキストプロトコルの使用により、初回の読み込み時に ClickHouse 上の精度が MySQL と異なる場合があります。|
| Date                      | Date32                 | 日または月が 00 の場合は 01 にマッピングされます。|
| Time                      | DateTime64(6)          | Unix エポックからの時間オフセットとして扱われます。|
| Datetime, Timestamp       | DateTime64(6)          | 日または月が 00 の場合は 01 にマッピングされます。|