---
slug: /sql-reference/statements/alter/apply-deleted-mask
sidebar_position: 46
sidebar_label: 削除マスクの適用
---


# 削除行のマスクを適用

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

このコマンドは、[論理削除](/sql-reference/statements/delete)によって作成されたマスクを適用し、削除されたとしてマークされた行をディスクから強制的に削除します。このコマンドは重量級の変更であり、意味的にはクエリ ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0``` と同等です。

:::note
このコマンドは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル（[レプリケート](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のみで機能します。
:::

**関連情報**

- [軽量削除](/sql-reference/statements/delete)
- [重量削除](/sql-reference/statements/alter/delete.md)
