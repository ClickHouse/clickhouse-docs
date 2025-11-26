---
description: 'ALTER TABLE ... UPDATE ステートメントに関するドキュメント'
sidebar_label: 'UPDATE'
sidebar_position: 40
slug: /sql-reference/statements/alter/update
title: 'ALTER TABLE ... UPDATE ステートメント'
doc_type: 'reference'
---



# ALTER TABLE ... UPDATE ステートメント

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

指定されたフィルタ式に一致するデータを操作します。[mutation](/sql-reference/statements/alter/index.md#mutations)として実装されています。

:::note\
`ALTER TABLE` プレフィックスにより、この構文は SQL をサポートする他の多くのシステムとは異なります。これは、OLTP データベースにおける類似のクエリとは異なり、この操作が頻繁な使用を想定していない重い処理であることを示すためのものです。
:::

`filter_expr` は型 `UInt8` でなければなりません。このクエリは、`filter_expr` が 0 以外の値を取る行に対して、指定された列の値を対応する式の値に更新します。値は `CAST` 演算子を使用して列の型にキャストされます。プライマリキーまたはパーティションキーの計算に使用される列の更新はサポートされません。

1 つのクエリには、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期動作は、[mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは非同期です。

**関連項目**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [ALTER クエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 設定


## 関連記事 {#related-content}

- ブログ記事: [ClickHouse での更新および削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
