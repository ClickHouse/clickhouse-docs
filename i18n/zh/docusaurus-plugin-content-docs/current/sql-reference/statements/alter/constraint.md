---
'description': '关于操作约束的文档'
'sidebar_label': 'CONSTRAINT'
'sidebar_position': 43
'slug': '/sql-reference/statements/alter/constraint'
'title': '操作约束'
'doc_type': 'reference'
---


# 操作约束

可以使用以下语法添加或删除约束：

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

有关更多信息，请参见 [constraints](../../../sql-reference/statements/create/table.md#constraints)。

查询将从表中添加或删除关于约束的元数据，因此它们会立即处理。

:::tip
如果添加了约束，则**不会对现有数据执行约束检查**。
:::

对复制表的所有更改都会广播到 ZooKeeper，并将应用于其他副本。
