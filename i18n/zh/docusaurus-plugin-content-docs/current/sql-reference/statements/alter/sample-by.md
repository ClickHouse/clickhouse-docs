---
description: '关于 SAMPLE BY 表达式操作的文档'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: '采样键表达式的操作'
doc_type: 'reference'
---



# 操作 SAMPLE BY 表达式

可以执行以下操作：



## 修改

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

该命令将表的[采样键](../../../engines/table-engines/mergetree-family/mergetree.md)更改为 `new_expression`（一个表达式或表达式元组）。主键必须包含新的采样键。


## REMOVE

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

该命令会移除表的[采样键](../../../engines/table-engines/mergetree-family/mergetree.md)。

`MODIFY` 和 `REMOVE` 命令是轻量级操作，因为它们只会修改元数据或删除文件。

:::note\
它仅适用于 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 系列表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 表）。
:::
