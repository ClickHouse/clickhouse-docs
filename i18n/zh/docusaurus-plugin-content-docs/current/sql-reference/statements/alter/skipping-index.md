---
'description': '操作数据跳过索引的文档'
'sidebar_label': '索引'
'sidebar_position': 42
'slug': '/sql-reference/statements/alter/skipping-index'
'title': '操作数据跳过索引'
'toc_hidden_folder': true
---


# 操作数据跳过索引

以下操作是可用的：

## 添加索引 {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - 将索引描述添加到表的元数据中。

## 删除索引 {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - 从表的元数据中删除索引描述，并从磁盘删除索引文件。作为一个[变更操作](/sql-reference/statements/alter/index.md#mutations)实现。

## 物化索引 {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 为指定的 `partition_name` 重新构建次级索引 `name`。作为一个[变更操作](/sql-reference/statements/alter/index.md#mutations)实现。如果省略 `IN PARTITION` 部分，则会为整个表数据重新构建索引。

## 清除索引 {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 从磁盘删除次级索引文件，而不删除描述。作为一个[变更操作](/sql-reference/statements/alter/index.md#mutations)实现。

命令 `ADD`、`DROP` 和 `CLEAR` 是轻量级的，因为它们仅更改元数据或删除文件。同时，它们是复制的，通过 ClickHouse Keeper 或 ZooKeeper 同步索引元数据。

:::note    
索引操作仅支持使用 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎的表（包括 [复制](/engines/table-engines/mergetree-family/replication.md) 变体）。
:::
