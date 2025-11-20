---
title: 'サポートされているデータ型'
slug: /integrations/clickpipes/mongodb/datatypes
description: 'MongoDB から ClickHouse への MongoDB ClickPipe のデータ型マッピングを説明するページ'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

MongoDB はデータレコードを BSON ドキュメントとして保存します。ClickPipes では、BSON ドキュメントを JSON または JSON String として ClickHouse に取り込むように設定できます。次の表は、サポートされている BSON から JSON へのフィールド型マッピングを示します。

| MongoDB BSON Type        | ClickHouse JSON Type                   | Notes                    |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32-bit integer           | Int64                                  |                          |
| 64-bit integer           | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601 形式            |
| Regular Expression       | \{Options: String, Pattern: String\}   | MongoDB の正規表現で、固定フィールド Options（正規表現フラグ）と Pattern（正規表現パターン）を持ちます |
| Timestamp                | \{T: Int64, I: Int64\}                 | 固定フィールド T（timestamp）と I（increment）を持つ MongoDB の内部タイムスタンプ形式 |
| Decimal128               | String                                 |                          |
| Binary data              | \{Data: String, Subtype: Int64\}       | 固定フィールド Data（base64 エンコード）と Subtype（[バイナリの種類](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)）を持つ MongoDB のバイナリデータ |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| Array                    | Dynamic                                | 単一の型で構成される配列は Array(Nullable(T)) になり、複数のプリミティブ型が混在する配列は最も汎用的な共通型に昇格し、互換性のない複雑な型を含む配列は Tuple になります |
| Object                   | Dynamic                                | 各ネストされたフィールドは再帰的にマッピングされます |

:::info
ClickHouse の JSON データ型の詳細については、[こちらのドキュメント](https://clickhouse.com/docs/sql-reference/data-types/newjson)を参照してください。
:::