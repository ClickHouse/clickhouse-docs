---
description: 'ALTER 语句文档'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
doc_type: 'reference'
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
大多数 `ALTER TABLE` 查询只在 [\*MergeTree](/engines/table-engines/mergetree-family/index.md)、[Merge](/engines/table-engines/special/merge.md) 和 [Distributed](/engines/table-engines/special/distributed.md) 表上受支持。
:::

这些 `ALTER` 语句用于操作视图：

| 语句                                                                           | 描述                                                                          |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | 修改[物化视图](/sql-reference/statements/create/view)的结构。                                       |

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
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | 向表添加、修改或删除注释，无论之前是否设置过。 |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | 修改[命名集合](/operations/named-collections.md)。                   |



## 变更操作 {#mutations}

用于操作表数据的 `ALTER` 查询通过一种称为"变更操作"(mutations)的机制实现,最典型的是 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) 和 [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md)。它们是异步后台进程,类似于 [MergeTree](/engines/table-engines/mergetree-family/index.md) 表中的合并操作,用于生成数据分区的新"变更"版本。

对于 `*MergeTree` 表,变更操作通过**重写整个数据分区**来执行。
这不具有原子性——数据分区一旦准备就绪就会被变更后的分区替换,在变更操作期间开始执行的 `SELECT` 查询将同时看到已变更分区的数据和尚未变更分区的数据。

变更操作完全按照其创建顺序排序,并按该顺序应用于每个数据分区。变更操作与 `INSERT INTO` 查询也存在部分顺序关系:在提交变更操作之前插入表中的数据将被变更,而在此之后插入的数据则不会被变更。请注意,变更操作不会以任何方式阻塞插入操作。

变更查询在添加变更条目后立即返回(对于复制表是添加到 ZooKeeper,对于非复制表是添加到文件系统)。变更操作本身使用系统配置文件设置异步执行。要跟踪变更操作的进度,可以使用 [`system.mutations`](/operations/system-tables/mutations) 表。成功提交的变更操作即使在 ClickHouse 服务器重启后也会继续执行。变更操作一旦提交就无法回滚,但如果变更操作因某种原因卡住,可以使用 [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation) 查询取消它。

已完成的变更操作条目不会立即删除(保留的条目数量由存储引擎参数 `finished_mutations_to_keep` 决定)。较旧的变更操作条目会被删除。


## ALTER 查询的同步性 {#synchronicity-of-alter-queries}

对于非复制表,所有 `ALTER` 查询都是同步执行的。对于复制表,查询仅将相应操作的指令添加到 `ZooKeeper` 中,操作本身会尽快执行。不过,查询可以等待这些操作在所有副本上完成。

对于创建变更(mutation)的 `ALTER` 查询(例如:包括但不限于 `UPDATE`、`DELETE`、`MATERIALIZE INDEX`、`MATERIALIZE PROJECTION`、`MATERIALIZE COLUMN`、`APPLY DELETED MASK`、`CLEAR STATISTIC`、`MATERIALIZE STATISTIC`),其同步性由 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 设置定义。

对于仅修改元数据的其他 `ALTER` 查询,可以使用 [alter_sync](/operations/settings/settings#alter_sync) 设置来配置等待行为。

可以使用 [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 设置来指定等待非活动副本执行所有 `ALTER` 查询的时长(以秒为单位)。

:::note
对于所有 `ALTER` 查询,如果 `alter_sync = 2` 且某些副本的非活动时间超过 `replication_wait_for_inactive_replica_timeout` 设置中指定的时间,则会抛出 `UNFINISHED` 异常。
:::


## 相关内容 {#related-content}

- 博客：[ClickHouse 中的更新和删除操作处理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
