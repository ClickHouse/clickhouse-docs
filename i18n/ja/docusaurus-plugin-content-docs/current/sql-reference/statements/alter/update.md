---
slug: /sql-reference/statements/alter/update
sidebar_position: 40
sidebar_label: UPDATE
---

# ALTER TABLE ... UPDATE ステートメント

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを操作します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

:::note    
`ALTER TABLE` プレフィックスは、この構文を SQL をサポートする他のシステムのほとんどとは異なるものにします。これは、OLTP データベースの類似のクエリとは異なり、頻繁に使用するために設計されていない重い操作であることを示すことを目的としています。
:::

`filter_expr` は `UInt8` 型である必要があります。このクエリは、`filter_expr` が非ゼロ値を取る行の指定されたカラムの値を、対応する式の値に更新します。値は `CAST` 演算子を使用してカラム型にキャストされます。主キーまたはパーティションキーの計算に使用されるカラムの更新はサポートされていません。

1 つのクエリには、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期性は、[mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは、非同期です。

**関連情報**

- [ミューテーション](/sql-reference/statements/alter/index.md#mutations)
- [ALTER クエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定


## 関連コンテンツ {#related-content}

- Blog: [ClickHouse における更新と削除の取り扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
