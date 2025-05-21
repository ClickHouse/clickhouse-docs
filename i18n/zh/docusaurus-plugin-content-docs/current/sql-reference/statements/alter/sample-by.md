---
'description': '操纵 SAMPLE BY 表达式的文档'
'sidebar_label': '采样键表达式'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/sample-by'
'title': '更改采样键表达式'
---




# 操作 SAMPLE BY 表达式

以下操作可用：

## MODIFY {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

该命令将表的 [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) 更改为 `new_expression`（一个表达式或表达式的元组）。主键必须包含新的取样键。

## REMOVE {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

该命令将表的 [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) 移除。

命令 `MODIFY` 和 `REMOVE` 是轻量级的，因为它们仅更改元数据或移除文件。

:::note    
它仅适用于 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 家族中的表（包括 [replicated](../../../engines/table-engines/mergetree-family/replication.md) 表）。
:::
