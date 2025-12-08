---
description: 'ALTER 语句文档'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
doc_type: 'reference'
---

# ALTER {#alter}

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

这些 `ALTER` 语句用于操作视图：

| 语句                                                                           | 描述                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | 修改 [物化视图](/sql-reference/statements/create/view) 的结构。                                       |

这些 `ALTER` 语句用于修改与基于角色的访问控制相关的实体：

| 语句                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| 语句                                                                             | 描述                                                                               |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | 无论之前是否设置过注释，都可以向表添加、修改或删除注释。 |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | 修改[命名集合](/operations/named-collections.md)。                   |

## 变更 {#mutations}

用于操作表数据的 `ALTER` 查询是通过一种称为“变更（mutations）”的机制实现的，最典型的是 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) 和 [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md)。它们是类似于 [MergeTree](/engines/table-engines/mergetree-family/index.md) 表中合并操作的异步后台进程，用来生成新的“已变更”数据分片版本。

对于 `*MergeTree` 表，变更是通过**重写整个数据分片**来执行的。
变更不是原子的——一旦某个变更后的分片准备就绪，就会替换原分片，而在变更过程中开始执行的 `SELECT` 查询会同时看到已经变更过的分片数据和尚未变更的分片数据。

变更按照其创建顺序形成全序关系，并以该顺序应用到每个分片上。变更与 `INSERT INTO` 查询之间也存在部分顺序关系：在提交变更之前插入到表中的数据会被变更，而在这之后插入的数据不会被变更。请注意，变更不会以任何方式阻塞插入操作。

变更查询会在变更条目被添加之后立即返回（对于复制表，条目会添加到 ZooKeeper；对于非复制表，则添加到文件系统）。变更本身会根据系统 profile 设置异步执行。要跟踪变更的执行进度，可以使用 [`system.mutations`](/operations/system-tables/mutations) 表。已成功提交的变更即使在 ClickHouse 服务器重启后也会继续执行。一旦提交变更，就无法回滚；但如果变更由于某种原因卡住，可以使用 [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) 查询将其取消。

已完成变更的条目不会立即被删除（保留条目的数量由存储引擎参数 `finished_mutations_to_keep` 决定）。更旧的变更条目会被删除。

## ALTER 查询的同步性 {#synchronicity-of-alter-queries}

对于非复制表，所有 `ALTER` 查询都会以同步方式执行。对于复制表，查询只是向 `ZooKeeper` 中添加相应操作的指令，而这些操作本身会尽快执行。不过，查询可以等待这些操作在所有副本上完成。

对于会创建 mutation 的 `ALTER` 查询（例如包括但不限于 `UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC`），其同步行为由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置控制。

对于仅修改元数据的其他 `ALTER` 查询，可以使用 [alter_sync](/operations/settings/settings#alter_sync) 设置来配置等待行为。

可以通过 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置指定在非活动副本上等待其执行完所有 `ALTER` 查询的最长时间（以秒为单位）。

:::note
对于所有 `ALTER` 查询，如果 `alter_sync = 2`，并且某些副本处于非活动状态的时间超过 `replication_wait_for_inactive_replica_timeout` 设置中指定的时长，则会抛出 `UNFINISHED` 异常。
:::

## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
