
# 操作关键表达式

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

该命令将表的 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md) 更改为 `new_expression`（一个表达式或表达式元组）。主键保持不变。

该命令是轻量级的，因为它只更改元数据。为了保持数据部分行按排序键表达式排序的属性，您不能将包含现有列的表达式添加到排序键中（只能在同一 `ALTER` 查询中通过 `ADD COLUMN` 命令添加的列，不带默认列值）。

:::note    
它仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 家族的表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 表）。
:::
