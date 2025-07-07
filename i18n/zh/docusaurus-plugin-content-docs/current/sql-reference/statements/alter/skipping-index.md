---
'description': 'Manipulating 数据跳过索引 的文档'
'sidebar_label': 'INDEX'
'sidebar_position': 42
'slug': '/sql-reference/statements/alter/skipping-index'
'title': '操作数据跳过索引'
'toc_hidden_folder': true
---


# 操作数据跳过索引

以下操作可用：

## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - 将索引描述添加到表的元数据中。

## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - 从表的元数据中删除索引描述，并从磁盘删除索引文件。实现为[变更](/sql-reference/statements/alter/index.md#mutations)。

## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 为指定的 `partition_name` 重新构建二级索引 `name`。实现为[变更](/sql-reference/statements/alter/index.md#mutations)。如果省略 `IN PARTITION` 部分，则为整个表数据重新构建该索引。

## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 从磁盘中删除二级索引文件，而不移除描述。实现为[变更](/sql-reference/statements/alter/index.md#mutations)。

`ADD`、`DROP` 和 `CLEAR` 命令是轻量级的，因为它们只改变元数据或移除文件。同时，它们是被复制的，通过 ClickHouse Keeper 或 ZooKeeper 同步索引元数据。

:::note    
索引操作仅支持使用[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)引擎的表（包括[复制](/engines/table-engines/mergetree-family/replication.md)变体）。
:::
