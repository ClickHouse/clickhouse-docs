---
slug: /sql-reference/statements/alter/delete
sidebar_position: 39
sidebar_label: DELETE
---


# ALTER TABLE ... DELETE ステートメント

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを削除します。これは [mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

:::note
`ALTER TABLE` プレフィックスにより、この構文は SQL をサポートする他のシステムとは異なります。これは、OLTPデータベースにおける類似のクエリとは異なり、頻繁に使用することは想定されていない重い操作であることを示しています。 `ALTER TABLE` は、削除される前に基になるデータをマージする必要があるため、重い操作と見なされます。 MergeTree テーブルの場合は、軽量削除を行い、かなり速くなる [`DELETE FROM` クエリ](/sql-reference/statements/delete.md) の使用を検討してください。
:::

`filter_expr` は `UInt8` 型でなければなりません。この式が非ゼロの値を取る行がテーブルから削除されます。

1つのクエリには、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期性は [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは非同期です。

**参照してください**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [ALTERクエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定

## 関連コンテンツ {#related-content}

- Blog: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
