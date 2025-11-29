---
sidebar_position: 1
sidebar_label: '先建后拆（Make Before Break，MBB）'
slug: /cloud/features/mbb
description: '介绍 ClickHouse Cloud 中先建后拆（Make Before Break，MBB）操作的页面'
keywords: ['先建后拆（Make Before Break）', 'MBB', '扩缩容', 'ClickHouse Cloud']
title: 'ClickHouse Cloud 中的先建后拆（Make Before Break，MBB）操作'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mbb_diagram from '@site/static/images/cloud/features/mbb/vertical_scaling.png';

ClickHouse Cloud 在执行集群升级和集群扩缩容时采用 **Make Before Break（MBB，“先建后拆”）** 策略。
在这种策略下，会先向集群添加新的副本，然后再从集群中移除旧的副本。
这与“先拆后建”的策略相反，后者会先移除旧副本，再添加新副本。

MBB 策略有以下几个优点：

* 由于在移除副本之前就已向集群增加容量，**整体集群容量不会下降**，而不像“先拆后建”那样。当然，在云环境中仍可能发生节点或磁盘故障等非计划性事件。
* 当集群处于高负载情况下时，此策略尤其有用，因为它**防止现有副本被过载**，而“先拆后建”则容易出现这种情况。
* 由于可以在不必等待先移除副本的前提下快速添加新副本，此策略可带来**更快且响应更灵敏**的扩缩容体验。

下图展示了一个具有 3 个副本的集群在进行垂直扩缩容时可能出现的情况：

<Image img={mbb_diagram} size="lg" alt="具有 3 个副本并进行垂直扩缩容的集群示意图示例" />

总体而言，与之前采用的“先拆后建”策略相比，MBB 能够实现更平滑、干扰更小的扩缩容和升级体验。

在使用 MBB 时，有一些关键行为需要用户注意：

1. MBB 操作会等待当前副本上现有工作负载完成后，再终止这些副本。
   这一等待时长目前设定为 1 小时，这意味着对于在某个副本上运行时间较长的查询，扩缩容或升级操作可能会最多等待 1 小时才会移除该副本。
   此外，如果某个副本上正在运行备份进程，则会等待该备份完成后才终止该副本。
2. 由于在终止副本前存在等待时间，集群可能在一段时间内拥有超过为该集群设定的最大副本数。
   例如，你可能有一个总计 6 个副本的服务，但在某次 MBB 操作进行期间，会向集群再添加 3 个副本，从而在旧副本仍在处理查询的同时，使副本总数达到 9 个。
   这意味着在一段时间内，集群的副本数会超过期望的副本数。
   此外，多次 MBB 操作本身也可能重叠，导致副本不断累积。例如，在通过 API 向集群发送多次垂直扩缩容请求的场景中，就可能发生这种情况。
   ClickHouse Cloud 内置了相关检查机制，以限制集群可能累积的副本数量。
3. 在执行 MBB 操作时，system 表数据会保留 30 天。这意味着每当集群上发生一次 MBB 操作时，会将过去 30 天的 system 表数据从旧副本复制到新副本。

如果你希望进一步了解 MBB 操作的具体机制，请参阅 ClickHouse 工程团队发布的这篇[博客文章](https://clickhouse.com/blog/make-before-break-faster-scaling-mechanics-for-clickhouse-cloud)。
