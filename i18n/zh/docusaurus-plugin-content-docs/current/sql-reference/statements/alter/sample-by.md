---
description: 'SAMPLE BY 表达式操作文档'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: '采样键表达式操作'
doc_type: 'reference'
---



# 操作 SAMPLE BY 表达式

可以执行以下操作：



## MODIFY {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

该命令将表的[采样键](../../../engines/table-engines/mergetree-family/mergetree.md)更改为 `new_expression`(一个表达式或一个表达式元组)。主键必须包含新的采样键。


## REMOVE {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

该命令用于移除表的[采样键](../../../engines/table-engines/mergetree-family/mergetree.md)。

`MODIFY` 和 `REMOVE` 命令属于轻量级操作,它们仅修改元数据或删除文件。

:::note  
此命令仅适用于 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 系列表引擎(包括[复制表](../../../engines/table-engines/mergetree-family/replication.md))。
:::
