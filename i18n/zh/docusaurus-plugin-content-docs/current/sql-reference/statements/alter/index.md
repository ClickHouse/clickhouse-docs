---
slug: '/sql-reference/statements/alter/'
sidebar_position: 35
sidebar_label: 'ALTER'
---


# ALTER

大多数 `ALTER TABLE` 查询用于修改表设置或数据：

| 修饰符                                                                            |
|-------------------------------------------------------------------------------------|
| [COLUMN](/sql-reference/statements/alter/column.md)                         |
| [PARTITION](/sql-reference/statements/alter/partition.md)                   |
| [DELETE](/sql-reference/statements/alter/delete.md)                         |
| [UPDATE](/sql-reference/statements/alter/update.md)                         |
| [ORDER BY](/sql-reference/statements/alter/order-by.md)                     |
| [INDEX](/sql-reference/statements/alter/skipping-index.md)                  |
| [CONSTRAINT](/sql-reference/statements/alter/constraint.md)                 |
| [TTL](/sql-reference/statements/alter/ttl.md)                               |
| [STATISTICS](/sql-reference/statements/alter/statistics.md)                 |
| [APPLY DELETED MASK](/sql-reference/statements/alter/apply-deleted-mask.md) |

:::note
大多数 `ALTER TABLE` 查询仅支持 [\*MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md) 和 [Distributed](/engines/table-engines/special/distributed.md) 表。
:::

这些 `ALTER` 语句操作视图：

| 语句                                                                           | 描述                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | 修改 [物化视图](/sql-reference/statements/create/view) 结构。                                       |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | 刷新 [实时视图](/sql-reference/statements/create/view.md/#live-view)。|

这些 `ALTER` 语句修改与基于角色的访问控制有关的实体：

| 语句                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| 语句                                                                             | 描述                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | 向表中添加、修改或删除注释，无论之前是否设置过。                                       |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | 修改 [命名集合](/operations/named-collections.md)。                   |

## Mutations {#mutations}

意图操作表数据的 `ALTER` 查询是通过名为“变更”的机制实现的，特别是 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) 和 [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md)。它们是异步后台进程，类似于 [MergeTree](/engines/table-engines/mergetree-family/index.md) 表中的合并，用于生成新“变更”的部分版本。

对于 `*MergeTree` 表，变更通过 **重写整个数据部分** 执行。 
没有原子性 — 部分在变更准备好后立即被替换为变更部分，期间开始执行的 `SELECT` 查询将看到来自已经变更的部分的数据以及来自尚未变更的部分的数据。

变更是按照创建顺序完全有序，并按照该顺序应用于每个部分。变更与 `INSERT INTO` 查询也是部分有序的：在提交变更之前插入到表中的数据将被变更，而在此之后插入的数据将不会被变更。请注意，变更不会以任何方式阻塞插入。

变更查询在添加变更条目后立即返回（对于复制表，则添加到 ZooKeeper，对于非复制表，则添加到文件系统）。变更本身使用系统配置设置异步执行。要跟踪变更进度，可以使用 [`system.mutations`](/operations/system-tables/mutations) 表。成功提交的变更将继续执行，即使 ClickHouse 服务器重启。提交后无法回滚变更，但如果变更因某种原因被卡住，可以通过 [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) 查询进行取消。

完成的变更条目不会立即删除（保留的条目数量由 `finished_mutations_to_keep` 存储引擎参数决定）。较早的变更条目会被删除。

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

对于非复制表，所有 `ALTER` 查询都是同步执行的。对于复制表，查询仅将适当操作的指令添加到 `ZooKeeper`，操作本身尽快执行。不过，查询可以等待这些操作在所有副本上完成。

对于创建变更的 `ALTER` 查询（例如：包括但不限于 `UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC`），同步性由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置定义。

对于仅修改元数据的其他 `ALTER` 查询，可以使用 [alter_sync](/operations/settings/settings#alter_sync) 设置进行等待。

您可以使用 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置指定等待非活动副本执行所有 `ALTER` 查询的时间（以秒为单位）。

:::note
对于所有 `ALTER` 查询，如果 `alter_sync = 2` 并且某些副本在 `replication_wait_for_inactive_replica_timeout` 设置指定的时间内未激活，则会抛出异常 `UNFINISHED`。
:::

## Related content {#related-content}

- 博客: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
