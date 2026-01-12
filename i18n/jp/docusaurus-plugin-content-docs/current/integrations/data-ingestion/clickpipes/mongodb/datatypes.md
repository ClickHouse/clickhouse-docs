---
title: 'サポートされるデータ型'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'MongoDB ClickPipe における MongoDB から ClickHouse へのデータ型マッピングを説明するページ'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

MongoDB はデータレコードを BSON ドキュメントとして保存します。ClickPipes では、BSON ドキュメントを JSON または JSON String として ClickHouse に取り込むように設定できます。次の表は、サポートされている BSON から JSON へのフィールド型のマッピングを示しています。

| MongoDB BSON Type        | ClickHouse JSON Type                   | Notes                    |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601 形式            |
| Regular Expression       | \{Options: String, Pattern: String\}   | 固定フィールド Options（正規表現フラグ）および Pattern（正規表現パターン）を持つ MongoDB の正規表現 |
| Timestamp                | \{T: Int64, I: Int64\}                 | 固定フィールド T（タイムスタンプ）および I（インクリメント）を持つ MongoDB の内部タイムスタンプ形式 |
| Decimal128               | String                                 |                          |
| Binary data              | \{Data: String, Subtype: Int64\}       | 固定フィールド Data（base64 エンコード済み）および Subtype（[バイナリの種類](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)）を持つ MongoDB のバイナリデータ |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Array                    | Dynamic                                | 同種の型を持つ配列は Array(Nullable(T)) になり、混在するプリミティブ型を持つ配列は最も一般的な共通型に昇格し、互換性のない複雑な型を持つ配列は Tuple になります |
| Object                   | Dynamic                                | 各ネストされたフィールドは再帰的にマッピングされます |

:::info
ClickHouse の JSON データ型の詳細については、[ドキュメント](https://clickhouse.com/docs/sql-reference/data-types/newjson)を参照してください。
:::