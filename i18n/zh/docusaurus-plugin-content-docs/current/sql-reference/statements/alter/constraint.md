---
'description': 'Manipulating Constraints 的文档'
'sidebar_label': 'CONSTRAINT'
'sidebar_position': 43
'slug': '/sql-reference/statements/alter/constraint'
'title': '操作约束'
---


# 操作约束

约束可以使用以下语法添加或删除：

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

有关更多信息，请参见 [constraints](../../../sql-reference/statements/create/table.md#constraints)。

查询将关于约束的元数据添加或移除自表，因此它们会立即处理。

:::tip
约束检查 **不会在** 已存在的数据上执行，如果它被添加了。
:::

在复制表上的所有更改都会广播到 ZooKeeper，并将在其他副本上也应用。
