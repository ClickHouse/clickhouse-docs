---
'description': 'Apply mask of deleted rowsのドキュメント'
'sidebar_label': '削除済み行のマスクを適用する'
'sidebar_position': 46
'slug': '/sql-reference/statements/alter/apply-deleted-mask'
'title': 'Apply mask of deleted rows'
---




# 削除された行のマスクを適用する

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

このコマンドは、[軽量削除](/sql-reference/statements/delete) によって作成されたマスクを適用し、ディスクから削除されたとしてマークされた行を強制的に削除します。このコマンドは重い変異であり、意味的にはクエリ ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0``` と等しいです。

:::note
これは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル（[レプリケート](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）でのみ機能します。
:::

**関連情報**

- [軽量削除](/sql-reference/statements/delete)
- [重い削除](/sql-reference/statements/alter/delete.md)
