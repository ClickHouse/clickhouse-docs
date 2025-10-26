---
'description': 'ALTER TABLE ... DELETE ステートメント のドキュメント'
'sidebar_label': 'DELETE'
'sidebar_position': 39
'slug': '/sql-reference/statements/alter/delete'
'title': 'ALTER TABLE ... DELETE ステートメント'
'doc_type': 'reference'
---


# ALTER TABLE ... DELETE 文

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを削除します。 [ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

:::note
`ALTER TABLE`のプレフィックスは、この構文をSQLをサポートする他のシステムとは異なるものにしています。これは、OLTPデータベースの類似クエリとは異なり、頻繁に使用されるようには設計されていない重い操作であることを示すためのものです。 `ALTER TABLE`は、データ削除の前に基盤となるデータをマージする必要がある重い操作と見なされます。MergeTreeテーブルの場合は、軽量削除を行い、かなり高速に実行できる[`DELETE FROM`クエリ](/sql-reference/statements/delete.md)の使用を検討してください。
:::

`filter_expr`は`UInt8`型でなければなりません。この式が非ゼロの値を取る行がテーブルから削除されます。

1つのクエリには、カンマで区切られた複数のコマンドを含むことができます。

クエリ処理の同期性は、[mutations_sync](/operations/settings/settings.md/#mutations_sync)設定によって定義されます。デフォルトでは非同期です。

**関連情報**

- [ミューテーション](/sql-reference/statements/alter/index.md#mutations)
- [ALTERクエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync)設定

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける更新と削除の取り扱い](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
