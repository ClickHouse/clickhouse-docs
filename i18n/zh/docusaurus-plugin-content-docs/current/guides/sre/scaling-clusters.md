---
slug: /guides/sre/scaling-clusters
sidebar_label: '分片重平衡'
sidebar_position: 20
description: 'ClickHouse 不支持自动分片重平衡,因此我们提供了一些关于如何重平衡分片的最佳实践。'
title: '数据重平衡'
doc_type: 'guide'
keywords: ['扩展', '集群', '水平扩展', '容量规划', '性能']
---

# 数据重平衡

ClickHouse 不支持自动分片重平衡。但是,可以按以下优先级顺序对分片进行重平衡:

1. 调整[分布式表](/engines/table-engines/special/distributed.md)的分片配置,使写入偏向新分片。这可能会导致集群负载不均衡和热点问题,但在写入吞吐量不是特别高的大多数场景中是可行的。此方法不需要用户更改写入目标,即可以继续使用分布式表。但此方法无法重平衡现有数据。

2. 作为方案(1)的替代,修改现有集群配置并专门写入新分片,直到集群达到平衡——通过手动加权写入实现。此方案与(1)具有相同的局限性。

3. 如果需要重平衡现有数据且数据已分区,可以考虑分离分区并手动将其迁移到另一个节点,然后重新附加到新分片。此方法比后续技术更依赖手动操作,但可能更快且资源消耗更少。这是一个手动操作过程,因此需要考虑数据重平衡的具体情况。

4. 通过 [INSERT FROM SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 将数据从源集群导出到新集群。此方法在超大数据集上性能较差,可能会在源集群上产生大量 IO 开销并消耗大量网络资源。这应作为最后的选择。