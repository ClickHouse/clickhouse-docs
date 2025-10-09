---
'description': 'ALTER 的文档'
'sidebar_label': 'ALTER'
'sidebar_position': 35
'slug': '/sql-reference/statements/alter/'
'title': 'ALTER'
'doc_type': 'reference'
---


# ALTER

大多数 `ALTER TABLE` 查询修改表设置或数据：

| Modifier                                                                            |
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

| Statement                                                                           | Description                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | 修改 [物化视图](/sql-reference/statements/create/view) 结构。                                      |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | 刷新 [实时视图](/sql-reference/statements/create/view.md/#live-view)。|

这些 `ALTER` 语句修改与基于角色的访问控制相关的实体：

| Statement                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Statement                                                                             | Description                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | 添加、修改或删除表的注释，无论其之前是否设置。                                           |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | 修改 [命名集合](/operations/named-collections.md)。                               |

## Mutations {#mutations}

`ALTER` 查询旨在操作表数据是通过称为“变更”的机制实现的，特别是 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) 和 [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md)。它们是异步后台进程，类似于 [MergeTree](/engines/table-engines/mergetree-family/index.md) 表中的合并，用于生成新“变更”的部分版本。

对于 `*MergeTree` 表，变更通过 **重写整个数据部分** 执行。
没有原子性——随着变更后的部分准备就绪，部分会被替换，正在执行的 `SELECT` 查询将看到已变更部分的数据以及尚未变更部分的数据。

变更完全按创建顺序排序，并按此顺序应用于每个部分。变更与 `INSERT INTO` 查询也部分排序：在提交变更之前插入的表的数据将会被变更，而在此之后插入的数据将不会被变更。请注意，变更不会以任何方式阻止插入。

变更查询在变更条目添加后立即返回（对于复制表，添加到 ZooKeeper，对于非复制表，添加到文件系统）。变更本身是使用系统配置设置异步执行的。要跟踪变更的进度，可以使用 [`system.mutations`](/operations/system-tables/mutations) 表。成功提交的变更将继续执行，即使 ClickHouse 服务器重启。提交后无法回滚变更，但如果变更因为某种原因卡住，可以使用 [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) 查询取消。

已完成变更的条目不会立即删除（保留条目的数量由 `finished_mutations_to_keep` 存储引擎参数确定）。较旧的变更条目会被删除。

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

对于非复制表，所有 `ALTER` 查询都是同步执行的。对于复制表，查询只会将相关操作的指令添加到 `ZooKeeper`，而这些操作本身会尽快执行。然而，查询可以等待这些操作在所有副本上完成。

对于创建变更的 `ALTER` 查询（例如：包括但不限于 `UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC`），同步性由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置定义。

对于仅修改元数据的其他 `ALTER` 查询，可以使用 [alter_sync](/operations/settings/settings#alter_sync) 设置来设置等待。

您可以指定等待非活动副本执行所有 `ALTER` 查询的时间（以秒为单位），方法是使用 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置。

:::note
对于所有 `ALTER` 查询，如果 `alter_sync = 2` 且某些副本在 `replication_wait_for_inactive_replica_timeout` 设置中指定的时间内未处于活动状态，则会抛出异常 `UNFINISHED`。
:::

## Related content {#related-content}

- Blog: [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
