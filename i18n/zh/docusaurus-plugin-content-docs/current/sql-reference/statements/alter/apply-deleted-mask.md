---
slug: /sql-reference/statements/alter/apply-deleted-mask
sidebar_position: 46
sidebar_label: 应用已删除掩码
---


# 应用已删除行的掩码

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

该命令应用由 [轻量级删除](/sql-reference/statements/delete) 创建的掩码，并强制从磁盘删除标记为已删除的行。此命令是一个重量级变更，其语义等同于查询 ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0```。

:::note
它仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 家族中的表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 表）。
:::

**另见**

- [轻量级删除](/sql-reference/statements/delete)
- [重量级删除](/sql-reference/statements/alter/delete.md)
