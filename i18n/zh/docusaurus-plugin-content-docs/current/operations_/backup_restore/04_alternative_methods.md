---
description: '介绍备份或恢复的替代方法'
sidebar_label: '替代方法'
slug: /operations/backup/alternative_methods
title: '备份或恢复的替代方法'
doc_type: 'reference'
---



# 其他备份方法 {#alternative-backup-methods}

ClickHouse 将数据存储在磁盘上，而对磁盘进行备份的方法有很多。  
下面是过去使用过的一些替代方案，可能适合你的使用场景。

### 在其他位置复制源数据 {#duplicating-source-data-somewhere-else}

通常摄取到 ClickHouse 的数据是通过某种持久化队列传递的，例如 [Apache Kafka](https://kafka.apache.org)。在这种情况下，可以配置一组额外的订阅者，在数据写入 ClickHouse 的同时读取相同的数据流，并将其存储到某个冷存储中。大多数公司已经有默认推荐的冷存储方案，可以是对象存储，或像 [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 这样的分布式文件系统。

### 文件系统快照 {#filesystem-snapshots}

某些本地文件系统提供快照功能（例如 [ZFS](https://en.wikipedia.org/wiki/ZFS)），
但它们可能并不是服务在线查询的最佳选择。一个可行的方案是使用这种文件系统创建额外副本，并将这些副本从用于 `SELECT` 查询的 [Distributed](/engines/table-engines/special/distributed) 表中排除。  
这些副本上的快照将不会被任何修改数据的查询访问。  
作为额外收益，这些副本可以使用特殊的硬件配置，每台服务器挂载更多磁盘，从而降低成本。

对于较小数据量，一个简单的 `INSERT INTO ... SELECT ...` 到远程表的方式也可能可行。

### 分区操作 {#manipulations-with-parts}

ClickHouse 允许使用 `ALTER TABLE ... FREEZE PARTITION ...` 查询来创建表分区的本地副本。  
该功能是通过对 `/var/lib/clickhouse/shadow/` 目录创建硬链接来实现的，因此通常不会为旧数据额外占用磁盘空间。  
这些生成的文件副本不会被 ClickHouse 服务器管理，因此你可以直接将它们保留在那里：这样你就会得到一个不需要任何外部系统的简单备份，但它仍然容易受到硬件故障的影响。基于这个原因，最好是将它们远程复制到其他位置，然后删除本地副本。  
分布式文件系统和对象存储仍然是不错的选择，但如果有容量足够大的普通挂载文件服务器，也可以使用（在这种情况下，传输将通过网络文件系统，或者通过 [rsync](https://en.wikipedia.org/wiki/Rsync)）。  
可以使用 `ALTER TABLE ... ATTACH PARTITION ...` 从备份中恢复数据。

有关与分区操作相关的查询的更多信息，请参阅
[`ALTER` 文档](/sql-reference/statements/alter/partition)。

有一个第三方工具可用于自动化这种方案：[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。
