---
sidebar_position: 1
sidebar_label: '先建后拆 (MBB)'
slug: /cloud/features/mbb
description: '介绍 ClickHouse Cloud 中先建后拆 (MBB) 操作的页面'
keywords: ['Make Before Break', 'MBB', 'Scaling', 'ClickHouse Cloud']
title: 'ClickHouse Cloud 中的先建后拆 (MBB) 操作'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mbb_diagram from '@site/static/images/cloud/features/mbb/vertical_scaling.png';

ClickHouse Cloud 在执行集群升级和集群伸缩时采用 **Make Before Break**（MBB，先建后拆）策略。
在这种策略下，新副本会在旧副本被移除之前先添加到集群中。
这与先拆后建的策略相反，后者会先移除旧副本，再添加新副本。

MBB 策略有以下几个优点：

* 由于是在移除之前先向集群添加容量，**整体集群容量不会下降**，这不同于先拆后建的方式。当然，在云环境中，诸如节点或磁盘故障等非计划性事件仍然可能发生。
* 这种方式在集群处于高负载的情况下尤其有用，因为它可以**防止现有副本过载**，而在先拆后建的方式中，这种过载往往会发生。
* 由于可以在不必等待先移除副本的情况下快速添加副本，这种方式可以带来**更快、更灵敏**的伸缩体验。

下图展示了对于一个具有 3 个副本且进行垂直伸缩的集群，这一过程可能如何发生：

<Image img={mbb_diagram} size="lg" alt="Example diagram for a cluster with 3 replicas which gets vertically scaled" />

总体而言，与之前采用的先拆后建策略相比，MBB 能带来更加无缝、干扰更小的集群伸缩和升级体验。

在使用 MBB 时，有一些关键行为需要用户注意：

1. MBB 操作会等待当前副本上已存在的工作负载完成后，才终止这些副本。
   该等待时间目前设置为 1 小时，这意味着对于某个副本上的长时间运行查询，伸缩或升级操作最多会等待一小时，之后才会移除该副本。
   此外，如果某个副本上正在运行备份流程，也会等待其完成之后才终止该副本。
2. 由于在副本被终止前存在等待时间，在某些情况下，集群中的副本数量可能会超过为该集群设定的最大副本数。
   例如，你的服务可能总共有 6 个副本，但在一次 MBB 操作进行期间，又向集群添加了 3 个新副本，从而在旧副本仍在处理查询的情况下，总副本数达到 9 个。
   这意味着在一段时间内，集群中的副本数量会超过期望的数量。
   此外，多次 MBB 操作本身也可能发生重叠，导致副本堆积。这种情况可能出现在通过 API 向集群发出了多次垂直伸缩请求的场景中。
   ClickHouse Cloud 内部包含了一些检查机制，用于限制集群可能累积的副本数量。
3. 对于 MBB 操作，`system` 表数据会保留 30 天。这意味着每当一个集群上发生一次 MBB 操作时，会将 30 天的 `system` 表数据从旧副本复制到新副本上。

如果你想进一步了解 MBB 操作的具体机制，请参阅 ClickHouse 工程团队撰写的这篇[博客文章](https://clickhouse.com/blog/make-before-break-faster-scaling-mechanics-for-clickhouse-cloud)。
