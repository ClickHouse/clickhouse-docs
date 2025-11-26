---
description: '削除済み行のマスク適用に関するドキュメント'
sidebar_label: '削除マスクの適用'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: '削除済み行のマスクを適用する'
doc_type: 'reference'
---

# 削除された行のマスクを適用する

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

このコマンドは、[lightweight delete](/sql-reference/statements/delete) によって作成されたマスクを適用し、削除済みとしてマークされた行をディスクから強制的に削除します。このコマンドは重いミューテーション操作であり、意味的にはクエリ `ALTER TABLE [db].name DELETE WHERE _row_exists = 0` を実行するのと同じです。

:::note
このコマンドが動作するのは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のテーブルのみです。
:::

**関連項目**

* [Lightweight deletes](/sql-reference/statements/delete)
* [Heavyweight deletes](/sql-reference/statements/alter/delete.md)
