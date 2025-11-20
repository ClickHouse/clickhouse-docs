---
description: '说明备份或恢复的其他方法'
sidebar_label: '其他方法'
slug: /operations/backup/alternative_methods
title: '其他备份或恢复方法'
doc_type: 'reference'
---



# 替代备份方法

ClickHouse 将数据存储在磁盘上,备份磁盘有多种方式。
以下是一些过去使用过的替代方案,可能适合您的使用场景。

### 在其他位置复制源数据 {#duplicating-source-data-somewhere-else}

导入到 ClickHouse 的数据通常通过某种持久化队列传输,
例如 [Apache Kafka](https://kafka.apache.org)。在这种情况下,可以配置一组
额外的订阅者,在数据写入 ClickHouse 的同时读取相同的数据流,
并将其存储到某处的冷存储中。大多数公司
已经有一些默认推荐的冷存储方案,可以是对象存储
或分布式文件系统,如 [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)。

### 文件系统快照 {#filesystem-snapshots}

某些本地文件系统提供快照功能(例如 [ZFS](https://en.wikipedia.org/wiki/ZFS)),
但它们可能不是服务实时查询的最佳选择。一个可行的解决方案
是使用这种文件系统创建额外的副本,并将它们从用于 `SELECT` 查询的
[Distributed](/engines/table-engines/special/distributed) 表中排除。
这些副本上的快照将不会受到任何修改数据的查询影响。
此外,这些副本可能具有特殊的硬件配置,每台服务器连接更多
磁盘,这样更具成本效益。

对于较小的数据量,简单的 `INSERT INTO ... SELECT ...` 到远程表
也可能有效。

### 数据分片操作 {#manipulations-with-parts}

ClickHouse 允许使用 `ALTER TABLE ... FREEZE PARTITION ...` 查询创建
表分区的本地副本。这是通过硬链接到 `/var/lib/clickhouse/shadow/`
目录实现的,因此通常不会为旧数据消耗额外的磁盘空间。创建的
文件副本不由 ClickHouse 服务器处理,因此您可以将它们保留在那里:
您将拥有一个不需要任何额外外部系统的简单备份,
但它仍然容易受到硬件问题的影响。因此,最好将它们
远程复制到另一个位置,然后删除本地副本。
分布式文件系统和对象存储仍然是不错的选择,
但具有足够容量的普通挂载文件服务器也可能有效
(在这种情况下,传输将通过网络文件系统或 [rsync](https://en.wikipedia.org/wiki/Rsync) 进行)。
可以使用 `ALTER TABLE ... ATTACH PARTITION ...` 从备份恢复数据。

有关分区操作相关查询的更多信息,请参阅
[`ALTER` 文档](/sql-reference/statements/alter/partition)。

有一个第三方工具可用于自动化此方法:[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。
