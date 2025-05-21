---
description: 'ALTER TABLE ... DELETE文のドキュメント'
sidebar_label: 'DELETE'
sidebar_position: 39
slug: /sql-reference/statements/alter/delete
title: 'ALTER TABLE ... DELETE文'
---


# ALTER TABLE ... DELETE文

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを削除します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

:::note
`ALTER TABLE` プレフィックスにより、この構文はSQLをサポートするほとんどの他のシステムとは異なります。これは、OLTPデータベースの類似のクエリとは異なり、頻繁に使用することを意図していない重い操作であることを示すためのものです。`ALTER TABLE` は、削除する前に基礎データをマージする必要がある重い操作と見なされます。MergeTreeテーブルの場合、軽量削除を実行し、かなり高速になる [`DELETE FROM` クエリ](/sql-reference/statements/delete.md) の使用を検討してください。
:::

`filter_expr` は `UInt8` 型でなければなりません。このクエリは、この式が非ゼロの値を取る行をテーブルから削除します。

1つのクエリには、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期性は、[mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは、非同期です。

**関連情報**

- [ミューテーション](/sql-reference/statements/alter/index.md#mutations)
- [ALTERクエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
