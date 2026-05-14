---
description: '关于操作约束条件的文档'
sidebar_label: 'CONSTRAINT'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: '操作约束条件'
doc_type: 'reference'
---

可以使用以下语法添加或删除约束条件：

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

在[约束](../../../sql-reference/statements/create/table.md#constraints)部分查看更多内容。

查询会对表的约束元数据进行添加或删除操作，因此会立即生效。

:::tip
如果是后来添加的约束，将**不会在已有数据上执行**检查。
:::

对复制表的所有更改都会广播到 ZooKeeper，并会同样应用到其他副本上。