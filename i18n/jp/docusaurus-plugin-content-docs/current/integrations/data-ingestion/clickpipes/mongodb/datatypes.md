---
'title': 'サポートされているデータタイプ'
'slug': '/integrations/clickpipes/mongodb/datatypes'
'description': 'MongoDBからClickHouseへのMongoDB ClickPipeデータ型マッピングを説明するページ'
'doc_type': 'reference'
---

MongoDBはデータレコードをBSONドキュメントとして保存します。ClickPipesでは、BSONドキュメントをClickHouseにJSONまたはJSON Stringとして取り込むように設定できます。以下の表は、サポートされているBSONからJSONへのフィールドタイプのマッピングを示します。

| MongoDB BSONタイプ     | ClickHouse JSONタイプ                  | メモ                     |
| ------------------------ | -------------------------------------- | ------------------------ |
| ObjectId                 | String                                 |                          |
| String                   | String                                 |                          |
| 32ビット整数            | Int64                                  |                          |
| 64ビット整数            | Int64                                  |                          |
| Double                   | Float64                                |                          |
| Boolean                  | Bool                                   |                          |
| Date                     | String                                 | ISO 8601形式            |
| 正規表現                | \{Options: String, Pattern: String\}   | MongoDBの正規表現は固定フィールド: Options (正規表現フラグ) と Pattern (正規表現パターン) を持ちます |
| タイムスタンプ          | \{T: Int64, I: Int64\}                 | MongoDBの内部タイムスタンプ形式は固定フィールド: T (タイムスタンプ) および I (インクリメント) を持ちます |
| Decimal128               | String                                 |                          |
| バイナリデータ          | \{Data: String, Subtype: Int64\}       | MongoDBのバイナリデータは固定フィールド: Data (base64エンコード) および Subtype ([バイナリの種類](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data)) を持ちます |
| JavaScript               | String                                 |                          |
| Null                     | Null                                   |                          |
| 配列                    | Dynamic                                | 同種の型を持つ配列はArray(Nullable(T))となり; 混合プリミティブ型の配列は最も一般的な共通型に昇格され; 複雑で互換性のない型を持つ配列はTuplesになります |
| オブジェクト            | Dynamic                                | 各ネストされたフィールドは再帰的にマッピングされます |

:::info
ClickHouseのJSONデータタイプについてもっと知りたい方は、[当社のドキュメント](https://clickhouse.com/docs/sql-reference/data-types/newjson)を参照してください。
:::
