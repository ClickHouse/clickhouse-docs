---
description: '关于操作数据跳过索引的文档'
sidebar_label: '索引'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: '操作数据跳过索引'
toc_hidden_folder: true
doc_type: 'reference'
---

# 对数据跳过索引的操作 {#manipulating-data-skipping-indices}

可以执行以下操作：

## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - 向表的元数据中添加索引描述。

## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - 从表的元数据中移除索引定义，并从磁盘上删除索引文件。该操作作为一次[mutation](/sql-reference/statements/alter/index.md#mutations)来实现。

## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 为指定的 `partition_name` 重建名为 `name` 的二级索引。该操作作为一次[变更](/sql-reference/statements/alter/index.md#mutations)实现。如果省略 `IN PARTITION` 子句，则会为整张表的数据重建索引。

## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 从磁盘中删除二级索引文件，但不会移除索引定义。该操作实现为一次[mutation](/sql-reference/statements/alter/index.md#mutations)。

命令 `ADD`、`DROP` 和 `CLEAR` 是轻量级的，因为它们只会更改元数据或删除文件。
此外，这些命令是可复制的，会通过 ClickHouse Keeper 或 ZooKeeper 同步索引元数据。

:::note    
索引操作仅支持使用 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎（包括[复制](/engines/table-engines/mergetree-family/replication.md)变体）的表。
:::
