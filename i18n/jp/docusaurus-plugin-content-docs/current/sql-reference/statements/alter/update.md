---
'description': 'ALTER TABLE ... UPDATE 文のための文書'
'sidebar_label': 'UPDATE'
'sidebar_position': 40
'slug': '/sql-reference/statements/alter/update'
'title': 'ALTER TABLE ... UPDATE 文'
'doc_type': 'reference'
---


# ALTER TABLE ... UPDATE Statements

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

指定されたフィルタリング式に一致するデータを操作します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

:::note    
`ALTER TABLE` プレフィックスにより、この構文はSQLをサポートする他の多くのシステムとは異なります。これは、OLTPデータベースにおける類似のクエリとは異なり、頻繁な使用を意図していない重い操作であることを示すために設計されています。
:::

`filter_expr`は`UInt8`型でなければなりません。このクエリは、`filter_expr`が非ゼロの値を持つ行の指定されたカラムの値を、対応する式の値に更新します。値は`CAST`演算子を使用してカラム型にキャストされます。主キーまたはパーティションキーの計算に使用されるカラムの更新はサポートされていません。

1つのクエリには、カンマで区切られた複数のコマンドを含むことができます。

クエリ処理の同期性は、[mutations_sync](/operations/settings/settings.md/#mutations_sync)設定によって定義されます。デフォルトでは、非同期です。

**関連情報**

- [ミューテーション](/sql-reference/statements/alter/index.md#mutations)
- [ALTERクエリの同期性](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync)設定

## Related content {#related-content}

- Blog: [ClickHouse における更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
