---
'description': '削除された行のマスクを適用に関するDocumentation'
'sidebar_label': 'APPLY DELETED MASK'
'sidebar_position': 46
'slug': '/sql-reference/statements/alter/apply-deleted-mask'
'title': '削除された行のマスクを適用'
'doc_type': 'reference'
---


# 削除された行のマスクを適用

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

このコマンドは、[軽量削除](/sql-reference/statements/delete)によって作成されたマスクを適用し、ディスクから削除としてマークされた行を強制的に削除します。このコマンドはヘビーウェイトの変異であり、意味的にはクエリ ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0``` と等しいです。

:::note
このコマンドは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md)ファミリー（[レプリカ](../../../engines/table-engines/mergetree-family/replication.md)テーブルを含む）のテーブルにのみ機能します。
:::

**関連情報**

- [軽量削除](/sql-reference/statements/delete)
- [ヘビーウェイト削除](/sql-reference/statements/alter/delete.md)
