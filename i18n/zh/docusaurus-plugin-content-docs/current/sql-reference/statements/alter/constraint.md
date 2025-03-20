---
slug: /sql-reference/statements/alter/constraint
sidebar_position: 43
sidebar_label: 主键
---


# 操作约束

约束可以使用以下语法添加或删除：

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

有关更多信息，请参见 [约束](../../../sql-reference/statements/create/table.md#constraints)。

查询将向表中添加或删除有关约束的元数据，因此这些操作会立即处理。

:::tip
如果约束被添加，则**不会对现有数据执行约束检查**。
:::

对复制表的所有更改都将广播到 ZooKeeper，并将在其他副本上应用。
