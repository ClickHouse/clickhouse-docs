---
description: '“应用已删除行掩码”文档'
sidebar_label: '应用已删除行掩码'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: '应用已删除行掩码'
doc_type: 'reference'
---

# 应用删除行掩码

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

该命令会应用由[轻量级删除](/sql-reference/statements/delete)创建的掩码，并强制将标记为已删除的行从磁盘中移除。此命令属于重量级变更操作，在语义上等同于查询 `ALTER TABLE [db].name DELETE WHERE _row_exists = 0`。

:::note
它仅适用于[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md)系列的表（包括[复制](../../../engines/table-engines/mergetree-family/replication.md)表）。
:::

**另请参阅**

* [轻量级删除](/sql-reference/statements/delete)
* [重量级删除](/sql-reference/statements/alter/delete.md)
