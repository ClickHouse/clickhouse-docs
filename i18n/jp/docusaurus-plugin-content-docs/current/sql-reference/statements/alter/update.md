---
slug: /sql-reference/statements/alter/update
sidebar_position: 40
sidebar_label: UPDATE
---


# ALTER TABLE ... UPDATE ステートメント

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを操作します。これは [mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

:::note    
`ALTER TABLE` プレフィックスは、この構文が SQL をサポートする他のシステムとは異なることを示しています。これは、OLTP データベースの類似のクエリとは異なり、頻繁に使用することを目的とした重い操作であることを示すためにあります。
:::

`filter_expr` は `UInt8` 型でなければなりません。このクエリは、`filter_expr` がゼロ以外の値を取る行の指定されたカラムの値を対応する式の値に更新します。値は `CAST` 演算子を使用してカラム型にキャストされます。主キーまたはパーティションキーの計算に使用されるカラムの更新はサポートされていません。

1 つのクエリには、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期性は、[mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは非同期です。

**関連情報**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [ALTER クエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
