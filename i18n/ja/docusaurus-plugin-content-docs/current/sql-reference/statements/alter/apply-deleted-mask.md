---
slug: /sql-reference/statements/alter/apply-deleted-mask
sidebar_position: 46
sidebar_label: 削除マスクの適用
---

# 削除行のマスクを適用

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

このコマンドは、[軽量削除](/sql-reference/statements/delete)によって作成されたマスクを適用し、削除としてマークされた行をディスクから強制的に削除します。このコマンドは重たい変異であり、文脈的にはクエリ ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0``` に等しいです。

:::note
このコマンドは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーに属するテーブル（[レプリカ](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）にのみ適用可能です。
:::

**関連情報**

- [軽量削除](/sql-reference/statements/delete)
- [重重量削除](/sql-reference/statements/alter/delete.md)
