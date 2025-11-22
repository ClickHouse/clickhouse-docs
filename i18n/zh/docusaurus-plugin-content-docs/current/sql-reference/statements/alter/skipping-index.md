---
description: '用于操作数据跳过（Data Skipping）索引的文档'
sidebar_label: '索引'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: '操作数据跳过（Data Skipping）索引'
toc_hidden_folder: true
doc_type: 'reference'
---



# 操作数据跳过索引

可以执行以下操作：



## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - 向表元数据添加索引描述。


## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - 从表的元数据中删除索引描述,并从磁盘中删除索引文件。该操作以[变更(mutation)](/sql-reference/statements/alter/index.md#mutations)方式实现。


## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 为指定的 `partition_name` 重建二级索引 `name`。该操作以[变更](/sql-reference/statements/alter/index.md#mutations)方式实现。如果省略 `IN PARTITION` 部分,则对整个表的数据重建索引。


## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 从磁盘删除二级索引文件,但保留索引定义。此操作以[变更(mutation)](/sql-reference/statements/alter/index.md#mutations)方式实现。

`ADD`、`DROP` 和 `CLEAR` 命令属于轻量级操作,它们仅修改元数据或删除文件。
此外,这些操作会被复制,并通过 ClickHouse Keeper 或 ZooKeeper 同步索引元数据。

:::note  
索引操作仅支持 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎系列的表(包括[复制](/engines/table-engines/mergetree-family/replication.md)变体)。
:::
