---
'description': 'ALTER 的文档'
'sidebar_label': 'ALTER'
'sidebar_position': 35
'slug': '/sql-reference/statements/alter/'
'title': 'ALTER'
---


# ALTER

大多数 `ALTER TABLE` 查询修改表设置或数据：

| 修饰符                                                                                      |
|---------------------------------------------------------------------------------------------|
| [COLUMN](/sql-reference/statements/alter/column.md)                                     |
| [PARTITION](/sql-reference/statements/alter/partition.md)                               |
| [DELETE](/sql-reference/statements/alter/delete.md)                                     |
| [UPDATE](/sql-reference/statements/alter/update.md)                                     |
| [ORDER BY](/sql-reference/statements/alter/order-by.md)                                 |
| [INDEX](/sql-reference/statements/alter/skipping-index.md)                              |
| [CONSTRAINT](/sql-reference/statements/alter/constraint.md)                             |
| [TTL](/sql-reference/statements/alter/ttl.md)                                           |
| [STATISTICS](/sql-reference/statements/alter/statistics.md)                             |
| [APPLY DELETED MASK](/sql-reference/statements/alter/apply-deleted-mask.md)             |

:::note
大多数 `ALTER TABLE` 查询仅支持 [\*MergeTree](/engines/table-engines/mergetree-family/index.md), [Merge](/engines/table-engines/special/merge.md) 和 [Distributed](/engines/table-engines/special/distributed.md) 表。
:::

这些 `ALTER` 语句操作视图：

| 语句                                                                             | 描述                                                                                  |
|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | 修改 [物化视图](/sql-reference/statements/create/view) 结构。                             |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | 刷新 [实时视图](/sql-reference/statements/create/view.md/#live-view)。                |

这些 `ALTER` 语句修改与基于角色的访问控制相关的实体：

| 语句                                                                             |
|-----------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                             |
| [ROLE](/sql-reference/statements/alter/role.md)                             |
| [QUOTA](/sql-reference/statements/alter/quota.md)                           |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)                 |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md)     |

| 语句                                                                                   | 描述                                                                                  |
|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | 向表添加、修改或删除注释，无论其是否之前已设置。                                       |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | 修改 [命名集合](/operations/named-collections.md)。                                     |

## Mutations {#mutations}

旨在操作表数据的 `ALTER` 查询通过一种称为“变更”的机制实现，特别是 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) 和 [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md)。它们是异步后台进程，类似于 [MergeTree](/engines/table-engines/mergetree-family/index.md) 表中的合并，以生成“变更”版本的分片。

对于 `*MergeTree` 表，变更通过 **重写整个数据分片** 来执行。
没有原子性—一旦分片准备好，就会用变更的分片替换原来的分片，在变更过程中开始执行的 `SELECT` 查询会看到已经变更的分片的数据以及尚未变更的分片的数据。

变更按照其创建顺序完全排序，并按该顺序应用于每个分片。变更与 `INSERT INTO` 查询部分排序：在提交变更之前插入表中的数据将被变更，而在变更提交后插入的数据不会被变更。请注意，变更不会以任何方式阻塞插入。

变更查询在变更条目添加后立即返回（对于复制表则是添加到 ZooKeeper，对于非复制表则是添加到文件系统）。变更本身使用系统配置设置异步执行。要跟踪变更的进度，可以使用 [`system.mutations`](/operations/system-tables/mutations) 表。成功提交的变更将继续执行，即使 ClickHouse 服务器重启。一旦提交变更，就无法回滚，但如果变更因某种原因被卡住，可以通过 [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) 查询取消该变更。

已完成变更的条目不会立即删除（保留条目的数量由 `finished_mutations_to_keep` 存储引擎参数决定）。旧的变更条目会被删除。

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

对于非复制表，所有 `ALTER` 查询都是同步执行的。对于复制表，该查询只是将相应操作的指令添加到 `ZooKeeper`，这些操作将在尽可能快的时间内执行。然而，查询可以等待这些操作在所有副本上完成。

对于创建变更的 `ALTER` 查询（例如：包括但不限于 `UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC`），同步性由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置定义。

对于其他仅修改元数据的 `ALTER` 查询，您可以使用 [alter_sync](/operations/settings/settings#alter_sync) 设置来配置等待。

您可以使用 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置指定等待多少秒（以秒为单位）来等待非活动副本执行所有 `ALTER` 查询。

:::note
对于所有 `ALTER` 查询，如果 `alter_sync = 2` 且某些副本在 `replication_wait_for_inactive_replica_timeout` 设置中指定的时间内未激活，则会抛出异常 `UNFINISHED`。
:::

## Related content {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
