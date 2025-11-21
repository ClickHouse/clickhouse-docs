---
sidebar_position: 1
sidebar_label: 'Make Before Break (MBB)'
slug: /cloud/features/mbb
description: '介绍 ClickHouse Cloud 中 Make Before Break (MBB) 操作的页面'
keywords: ['Make Before Break', 'MBB', 'Scaling', 'ClickHouse Cloud']
title: 'ClickHouse Cloud 中的 Make Before Break (MBB) 操作'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mbb_diagram from '@site/static/images/cloud/features/mbb/vertical_scaling.png';

ClickHouse Cloud 在执行集群升级和集群扩缩容时采用 **Make Before Break（MBB，先建后拆）** 策略。
在这种策略中，会先向集群中添加新的副本，然后才从集群中移除旧的副本。
这与先拆后建（break-first）的方法相反，后者会先移除旧副本，再添加新的副本。

MBB 策略具有以下几个优点：

* 由于在移除副本之前就已经向集群增加了容量，**集群的整体容量不会下降**，而这在先拆后建的方法中是可能发生的。当然，在云环境中仍然可能发生诸如节点或磁盘故障等非计划事件。
* 当集群处于高负载时，这种方法尤其有用，因为它 **可以防止现有副本被过载**，而在先拆后建的方法中则容易出现这种情况。
* 由于可以在不必等待先移除副本的情况下快速添加新副本，这种方法能够带来 **更快速、响应更灵敏** 的扩缩容体验。

下图展示了在具有 3 个副本的集群中，当服务进行垂直扩容时，MBB 的执行过程示例：

<Image img={mbb_diagram} size="lg" alt="具有 3 个副本并进行垂直扩容的集群示例图" />

总体而言，与之前采用的先拆后建方法相比，MBB 能够实现更加无缝、干扰更小的扩缩容和升级体验。

在使用 MBB 时，用户需要了解以下一些关键行为：

1. MBB 操作在终止当前副本之前，会等待该副本上已有的工作负载完成。
   当前这一等待时间设置为 1 小时，这意味着在移除某个副本之前，扩缩容或升级操作会最多等待该副本上运行中的长查询达 1 小时。
   另外，如果某个副本上正在运行备份进程，也会等待备份完成后才终止该副本。
2. 由于在终止副本之前存在等待时间，可能会出现某个集群的副本数量在一段时间内超过为该集群配置的副本上限的情况。
   例如，某个服务原本总共有 6 个副本，但在某次 MBB 操作过程中，可能会向集群额外添加 3 个新副本，使总副本数在一段时间内达到 9 个，而旧副本此时仍在处理查询。
   这意味着在一段时间内，集群的副本数会超过期望值。
   另外，多次 MBB 操作本身可能会相互重叠，从而导致副本数量累积。这种情况可能发生在通过 API 向集群发送多次垂直扩容请求的场景中。
   ClickHouse Cloud 内置了检查机制，用于限制集群在这种情况下可能累积的副本数量。
3. 在 MBB 操作中，系统表数据会保留 30 天。这意味着每当某个集群上发生一次 MBB 操作时，会将旧副本上最近 30 天的系统表数据复制到新副本上。

若希望进一步了解 MBB 操作的具体机制，请参阅 ClickHouse 工程团队撰写的这篇[博客文章](https://clickhouse.com/blog/make-before-break-faster-scaling-mechanics-for-clickhouse-cloud)。
