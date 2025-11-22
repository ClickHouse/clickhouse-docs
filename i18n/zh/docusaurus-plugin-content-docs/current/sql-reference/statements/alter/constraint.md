---
description: '约束操作文档'
sidebar_label: 'CONSTRAINT'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: '操作约束'
doc_type: 'reference'
---

# 操作约束

可以使用以下语法添加或删除约束：

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

参见[约束](../../../sql-reference/statements/create/table.md#constraints)以了解更多信息。

查询会在表上添加或移除约束的元数据，因此会立即生效。

:::tip
如果是新增的约束，对已有数据**不会执行**约束检查。
:::

对复制表的所有更改都会广播到 ZooKeeper，并同样应用到其他副本上。
