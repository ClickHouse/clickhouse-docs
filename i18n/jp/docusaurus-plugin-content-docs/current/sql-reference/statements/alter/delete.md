---
'description': 'Documentation for ALTER TABLE ... DELETE Statement'
'sidebar_label': 'DELETE'
'sidebar_position': 39
'slug': '/sql-reference/statements/alter/delete'
'title': 'ALTER TABLE ... DELETE Statement'
---




# ALTER TABLE ... DELETE 文

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

:::note
`ALTER TABLE` プレフィックスは、SQLをサポートする他のシステムとは異なるこの構文を作ります。これは、OLTPデータベースの類似のクエリとは異なり、頻繁に使用することを目的としない重い操作であることを示すために設計されています。 `ALTER TABLE` は、削除される前に基礎となるデータをマージする必要があるため、重い操作と見なされます。MergeTree テーブルの場合、軽量削除を実行し、かなり速くなる可能性のある [`DELETE FROM` クエリ](/sql-reference/statements/delete.md) の使用を検討してください。
:::

`filter_expr` は `UInt8` 型でなければなりません。この式が非ゼロ値を取るテーブル内の行を削除します。

1つのクエリには、カンマで区切られた複数のコマンドを含めることができます。

クエリ処理の同期性は、[mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定によって定義されます。デフォルトでは非同期です。

**関連情報**

- [ミューテーション](/sql-reference/statements/alter/index.md#mutations)
- [ALTER クエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 設定

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
