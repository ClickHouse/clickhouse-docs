---
description: '削除された行のマスクを適用する方法に関するドキュメント'
sidebar_label: '削除行マスクの適用'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: '削除行マスクの適用'
doc_type: 'reference'
---

# 削除された行のマスクを適用する

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

このコマンドは、[lightweight delete](/sql-reference/statements/delete) によって作成されたマスクを適用し、削除済みとしてマークされた行をディスクから強制的に削除します。このコマンドは重いミューテーション（heavyweight mutation）であり、意味的には `ALTER TABLE [db].name DELETE WHERE _row_exists = 0` というクエリと同等です。

:::note
これは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のテーブルでのみ利用できます。
:::

**関連項目**

* [Lightweight deletes](/sql-reference/statements/delete)
* [Heavyweight deletes](/sql-reference/statements/alter/delete.md)
