---
description: '削除された行のマスクを適用するためのドキュメント'
sidebar_label: '削除マスクを適用'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: '削除された行のマスクを適用'
---


# 削除された行のマスクを適用

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

このコマンドは、[軽量削除](/sql-reference/statements/delete)によって作成されたマスクを適用し、削除マークされた行をディスクから強制的に削除します。このコマンドはヘビーウェイトな変異であり、意味的にはクエリ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0```と等しいです。

:::note
これは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md)ファミリーのテーブル（[レプリケート](../../../engines/table-engines/mergetree-family/replication.md)テーブルを含む）にのみ機能します。
:::

**関連情報**

- [軽量削除](/sql-reference/statements/delete)
- [ヘビーウェイト削除](/sql-reference/statements/alter/delete.md)
