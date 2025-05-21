---
'description': 'Documentation for Manipulating Constraints'
'sidebar_label': 'CONSTRAINT'
'sidebar_position': 43
'slug': '/sql-reference/statements/alter/constraint'
'title': 'Manipulating Constraints'
---




# 操作约束

可以使用以下语法添加或删除约束：

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

有关更多信息，请参见 [constraints](../../../sql-reference/statements/create/table.md#constraints)。

查询将添加或删除有关约束的元数据，因此它们会立即被处理。

:::tip
如果已添加约束，则对现有数据**不会执行**约束检查。
:::

在副本表上的所有更改都会广播到 ZooKeeper，并将应用于其他副本。
