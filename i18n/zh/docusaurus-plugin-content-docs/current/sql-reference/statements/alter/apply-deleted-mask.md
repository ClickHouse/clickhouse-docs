
# 应用已删除行的掩码

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

该命令应用通过 [轻量级删除](/sql-reference/statements/delete) 创建的掩码，并强制从磁盘上删除标记为已删除的行。该命令是一种重型变更，它在语义上等同于查询 ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0```。

:::note
它仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 家族中的表（包括 [复制表](../../../engines/table-engines/mergetree-family/replication.md)）。
:::

**另见**

- [轻量级删除](/sql-reference/statements/delete)
- [重型删除](/sql-reference/statements/alter/delete.md)
