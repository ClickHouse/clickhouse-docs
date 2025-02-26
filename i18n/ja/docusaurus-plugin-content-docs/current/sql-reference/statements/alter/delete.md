---
slug: /sql-reference/statements/alter/delete
sidebar_position: 39
sidebar_label: DELETE
---

# ALTER TABLE ... DELETE ステートメント

``` sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

指定されたフィルタリング式に合致するデータを削除します。これは[変異](https://clickhouse.com/docs/sql-reference/statements/alter/index.md#mutations)として実装されています。


:::note
`ALTER TABLE`のプレフィックスは、この構文がSQLをサポートするほとんどの他のシステムと異なることを示しています。これは、OLTPデータベースにおける類似のクエリとは異なり、頻繁に使用するためには設計されていない重い操作であることを示すためのものです。`ALTER TABLE`は、データが削除される前に統合される必要があるため、重たい操作と見なされます。MergeTreeテーブルの場合は、軽量の削除を実行し、かなり速くなる可能性がある[`DELETE FROM`クエリ](https://clickhouse.com/docs/sql-reference/statements/delete.md)の使用を検討してください。
:::

`filter_expr`は`UInt8`型でなければなりません。この式が非ゼロの値を取る行をテーブルから削除します。

1つのクエリには、カンマで区切られた複数のコマンドを含むことができます。

クエリ処理の同期性は、[mutations_sync](https://clickhouse.com/docs/operations/settings/settings.md/#mutations_sync)設定によって定義されます。デフォルトでは非同期です。

**関連情報**

- [変異](https://clickhouse.com/docs/sql-reference/statements/alter/index.md#mutations)
- [ALTERクエリの同期性](https://clickhouse.com/docs/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](https://clickhouse.com/docs/operations/settings/settings.md/#mutations_sync)設定

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
