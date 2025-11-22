---
description: '用于修改键表达式的文档'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: '修改键表达式'
doc_type: 'reference'
---

# 键表达式操作

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

该命令将表的[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)更改为 `new_expression`（一个表达式或表达式元组）。主键保持不变。

该命令是轻量级的，因为它只会修改元数据。为了保持数据部件中的行按排序键表达式有序这一特性，不能将包含已有列的表达式添加到排序键中（只能使用同一条 `ALTER` 查询中通过 `ADD COLUMN` 命令新增的列，且这些列不能有默认值）。

:::note\
它仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 家族中的表（包括[复制](../../../engines/table-engines/mergetree-family/replication.md)表）。
:::
