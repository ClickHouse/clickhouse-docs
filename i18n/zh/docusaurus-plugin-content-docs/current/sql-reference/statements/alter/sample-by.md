---
'description': 'Manipulating SAMPLE BY 表达式的文档'
'sidebar_label': 'SAMPLE BY'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/sample-by'
'title': '操作采样键表达式'
---


# 操作 SAMPLE BY 表达式

以下操作可用：

## MODIFY {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

该命令将表的 [采样键](../../../engines/table-engines/mergetree-family/mergetree.md) 更改为 `new_expression` （一个表达式或表达式的元组）。主键必须包含新的采样键。

## REMOVE {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

该命令移除表的 [采样键](../../../engines/table-engines/mergetree-family/mergetree.md)。

命令 `MODIFY` 和 `REMOVE` 是轻量级的，因为它们仅更改元数据或删除文件。

:::note    
它仅适用于 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 系列的表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 表）。
:::
