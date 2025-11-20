---
sidebar_position: 1
sidebar_label: '先建后拆（MBB）'
slug: /cloud/features/mbb
description: '介绍 ClickHouse Cloud 中先建后拆（MBB）操作的页面'
keywords: ['Make Before Break', 'MBB', 'Scaling', 'ClickHouse Cloud']
title: 'ClickHouse Cloud 中的先建后拆（MBB）操作'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mbb_diagram from '@site/static/images/cloud/features/mbb/vertical_scaling.png';

ClickHouse Cloud 在执行集群升级和集群扩缩容时采用 **Make Before Break**（MBB，“先建后拆”）方法。
在这种方法中，会先向集群中添加新的副本，然后再从集群中移除旧的副本。
这与“先拆后建”的方法相反，在那种方法中，会先移除旧副本，然后再添加新副本。

MBB 方法具有以下几个优点：

* 由于在移除副本之前就向集群增加了容量，**整体集群容量不会下降**，这与先拆后建的方法不同。当然，在云环境中仍然可能发生节点或磁盘故障等非计划事件。
* 这种方法在集群处于高负载的情况下尤其有用，因为它**防止现有副本被过载**，而在先拆后建方法中则可能发生这种情况。
* 由于可以在不必等待先移除副本的情况下快速添加副本，这种方法可带来**更快速、更敏捷**的扩缩容体验。

下图展示了在具有 3 个副本的集群上进行垂直扩容时，该过程可能如何进行：

<Image img={mbb_diagram} size="lg" alt="针对具有 3 个副本并进行垂直扩容的集群的示意图示例" />

总体而言，与之前使用的先拆后建方法相比，MBB 能够带来更加无缝、干扰更小的扩缩容和升级体验。

在使用 MBB 时，用户需要注意以下一些关键行为：

1. MBB 操作会在终止当前副本之前等待其上现有工作负载完成。
   该等待时间当前设定为 1 小时，这意味着在移除某个副本之前，扩缩容或升级操作会对该副本上运行时间较长的查询最多等待一小时。
   此外，如果某个副本上正在运行备份进程，将会等待其完成后再终止该副本。
2. 由于在终止副本之前存在等待时间，因此在某些情况下，集群中副本数量可能会超过为该集群设置的最大副本数。
   例如，你可能有一个总共 6 个副本的服务，但在执行 MBB 操作的过程中，可能会向集群中额外添加 3 个副本，从而在旧副本仍在处理查询的情况下，副本总数达到 9 个。
   这意味着在一段时间内，集群中的副本数量会超过期望的数量。
   此外，多次 MBB 操作本身也可能重叠，导致副本累积。例如，这可能发生在通过 API 向集群发送了多次垂直扩容请求的场景中。
   ClickHouse Cloud 具备相关检查机制，用于限制集群可能累积的副本数量。
3. 在 MBB 操作中，system 表数据会保留 30 天。
   这意味着每当在集群上执行一次 MBB 操作时，来自旧副本的最近 30 天的 system 表数据会被复制到新副本上。

如果你希望进一步了解 MBB 操作的具体机制，请参阅 ClickHouse 工程团队的这篇[博客文章](https://clickhouse.com/blog/make-before-break-faster-scaling-mechanics-for-clickhouse-cloud)。
