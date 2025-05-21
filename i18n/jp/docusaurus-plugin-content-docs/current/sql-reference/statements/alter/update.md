---
description: 'ALTER TABLE ... UPDATE ステートメントに関するドキュメント'
sidebar_label: 'UPDATE'
sidebar_position: 40
slug: /sql-reference/statements/alter/update
title: 'ALTER TABLE ... UPDATE ステートメント'
---


# ALTER TABLE ... UPDATE ステートメント

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを操作します。これは [mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

:::note    
`ALTER TABLE` プレフィックスにより、この構文は大部分の他の SQL をサポートするシステムとは異なります。これは、OLTP データベースにおける類似のクエリとは異なり、頻繁に使用されることを想定していない重い操作であることを示すためのものです。
:::

`filter_expr` は `UInt8` 型である必要があります。このクエリは、`filter_expr` が非ゼロ値を取る行の指定されたカラムの値を、対応する式の値に更新します。値は `CAST` 演算子を使用してカラムタイプにキャストされます。主キーまたはパーティションキーの計算に使用されるカラムを更新することはサポートされていません。

1 つのクエリには、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期性は [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されています。デフォルトでは、非同期です。

**関連情報**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [ALTER クエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
