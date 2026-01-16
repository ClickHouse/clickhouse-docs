---
description: '关于键表达式操作的文档'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: '键表达式操作'
doc_type: 'reference'
---

# 键表达式操作 \{#manipulating-key-expressions\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

该命令将表的[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)更改为 `new_expression`（一个表达式或表达式元组）。主键保持不变。

该命令是轻量级的，因为它仅修改元数据。为了保持数据部分中的行按照排序键表达式有序这一性质，不能将包含现有列的表达式添加到排序键中（只能使用在同一条 `ALTER` 查询中通过 `ADD COLUMN` 命令新增的列，且这些列不能有默认值）。

:::note
它仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 系列的表（包括[复制](../../../engines/table-engines/mergetree-family/replication.md)表）。
:::
