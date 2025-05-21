---
'description': 'Documentation for Apply mask of deleted rows'
'sidebar_label': 'APPLY DELETED MASK'
'sidebar_position': 46
'slug': '/sql-reference/statements/alter/apply-deleted-mask'
'title': 'Apply mask of deleted rows'
---




# 应用已删除行的掩码

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

该命令应用由 [轻量级删除](/sql-reference/statements/delete) 创建的掩码，并强制从磁盘中移除标记为已删除的行。此命令是一个重量级变更，从语义上等同于查询 ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0```。

:::note
它仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 家族的表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 表）。
:::

**另请参阅**

- [轻量级删除](/sql-reference/statements/delete)
- [重量级删除](/sql-reference/statements/alter/delete.md)
