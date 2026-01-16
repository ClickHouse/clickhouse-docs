---
description: 'ALTER TABLE ... DELETE 文に関するドキュメント'
sidebar_label: 'DELETE'
sidebar_position: 39
slug: /sql-reference/statements/alter/delete
title: 'ALTER TABLE ... DELETE 文'
doc_type: 'reference'
---

# ALTER TABLE ... DELETE 文 \\{#alter-table-delete-statement\\}

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

指定されたフィルタ式に一致するデータを削除します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

:::note
`ALTER TABLE` という接頭辞が付くことで、この構文は SQL をサポートする他の多くのシステムとは異なります。これは、OLTP データベースにおける類似のクエリとは異なり、この操作が頻繁な利用を想定していない重い処理であることを示すためのものです。`ALTER TABLE` は、削除前に基盤となるデータのマージを必要とする重量級の操作と見なされます。MergeTree テーブルでは、より軽量な削除を行い、かなり高速に動作しうる [`DELETE FROM` クエリ](/sql-reference/statements/delete.md) の利用を検討してください。
:::

`filter_expr` は `UInt8` 型でなければなりません。クエリは、この式の値が 0 以外になる行をテーブルから削除します。

1 つのクエリに、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期方式は、[mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは非同期です。

**関連項目**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [ALTER クエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 設定

## 関連コンテンツ \\{#related-content\\}

- ブログ記事: [ClickHouse における更新と削除の扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
