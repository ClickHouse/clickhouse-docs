---
description: 'ALTER TABLE ... UPDATE ステートメントのドキュメント'
sidebar_label: 'UPDATE'
sidebar_position: 40
slug: /sql-reference/statements/alter/update
title: 'ALTER TABLE ... UPDATE ステートメント'
doc_type: 'reference'
---



# ALTER TABLE ... UPDATE 文

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを操作します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

:::note\
`ALTER TABLE` というプレフィックスにより、この構文は SQL をサポートする多くの他システムと異なります。これは、OLTP データベースにおける類似のクエリとは異なり、頻繁な利用を想定していない重い処理であることを示すためのものです。
:::

`filter_expr` は型 `UInt8` でなければなりません。このクエリは、`filter_expr` が 0 以外の値をとる行において、指定されたカラムの値を対応する式の値に更新します。値は `CAST` 演算子を用いてカラム型にキャストされます。プライマリキーまたはパーティションキーの計算に使用されるカラムの更新はサポートされていません。

1 つのクエリ内に、複数のコマンドをカンマ区切りで含めることができます。

クエリ処理の同期方法は、[mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは非同期です。

**関連項目**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [ALTER クエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 設定


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
