---
'description': '操作数据跳跃索引的文档'
'sidebar_label': '索引'
'sidebar_position': 42
'slug': '/sql-reference/statements/alter/skipping-index'
'title': '操作数据跳跃索引'
'toc_hidden_folder': true
---




# 操作数据跳过索引

以下操作可用：

## 添加索引 {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - 将索引描述添加到表的元数据中。

## 删除索引 {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - 从表的元数据中删除索引描述，并从磁盘中删除索引文件。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

## 物化索引 {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 为指定的 `partition_name` 重建次级索引 `name`。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。如果省略 `IN PARTITION` 部分，则会为整个表数据重建索引。

## 清除索引 {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 删除次级索引文件而不移除描述。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

命令 `ADD`、`DROP` 和 `CLEAR` 是轻量级的，因为它们只更改元数据或移除文件。同时，它们是复制的，通过 ClickHouse Keeper 或 ZooKeeper 同步索引元数据。

:::note    
仅支持对具有 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎的表进行索引操作（包括 [复制](/engines/table-engines/mergetree-family/replication.md) 变体）。
:::
