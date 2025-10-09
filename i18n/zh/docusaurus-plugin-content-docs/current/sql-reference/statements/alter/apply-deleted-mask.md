---
'description': '关于应用已删除行的掩码的文档'
'sidebar_label': 'APPLY DELETED MASK'
'sidebar_position': 46
'slug': '/sql-reference/statements/alter/apply-deleted-mask'
'title': '应用已删除行的掩码'
'doc_type': 'reference'
---


# 应用已删除行的掩码

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

该命令应用通过 [轻量级删除](/sql-reference/statements/delete) 创建的掩码，并强制从磁盘中删除标记为已删除的行。该命令属于重量级变更，与查询 ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0``` 在语义上等价。

:::note
它仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 家族中的表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 表）。
:::

**另见**

- [轻量级删除](/sql-reference/statements/delete)
- [重量级删除](/sql-reference/statements/alter/delete.md)
