---
description: 'ALTER TABLE ... DELETE ステートメントに関するドキュメント'
sidebar_label: 'DELETE'
sidebar_position: 39
slug: /sql-reference/statements/alter/delete
title: 'ALTER TABLE ... DELETE ステートメント'
doc_type: 'reference'
---



# ALTER TABLE ... DELETE 文

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを削除します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

:::note
`ALTER TABLE` プレフィックスにより、この構文は SQL をサポートする他のほとんどのシステムとは異なります。これは、OLTP データベースにおける類似のクエリとは異なり、頻繁な使用を想定していない重い処理であることを明示するためのものです。`ALTER TABLE` は、削除前に基礎となるデータのマージを必要とする重量級の操作と見なされます。MergeTree テーブルの場合は、軽量な削除を行い、かなり高速になり得る [`DELETE FROM` クエリ](/sql-reference/statements/delete.md) の使用を検討してください。
:::

`filter_expr` は `UInt8` 型でなければなりません。クエリは、この式がゼロ以外の値を取るテーブル内の行を削除します。

1 つのクエリには、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期性は、[mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは非同期です。

**関連項目**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [ALTER クエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 設定


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
