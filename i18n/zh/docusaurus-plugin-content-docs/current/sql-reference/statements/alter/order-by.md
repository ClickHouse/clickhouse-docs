---
'description': 'Manipulating Key Expressions 的文档'
'sidebar_label': 'ORDER BY'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/order-by'
'title': '操作主键表达式'
'doc_type': 'reference'
---


# 操作关键表达式

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

该命令将表的 [排序关键](../../../engines/table-engines/mergetree-family/mergetree.md) 更改为 `new_expression`（一个表达式或表达式的元组）。主键保持不变。

该命令是轻量级的，因为它仅更改元数据。为了保持数据部分行按排序关键表达式有序的特性，您不能将包含现有列的表达式添加到排序关键中（只能在同一 `ALTER` 查询中通过 `ADD COLUMN` 命令添加的列，且不带默认列值）。

:::note    
它仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 系列的表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 表）。
:::
