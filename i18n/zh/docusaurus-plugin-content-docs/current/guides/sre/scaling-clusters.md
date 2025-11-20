---
slug: /guides/sre/scaling-clusters
sidebar_label: '分片再平衡'
sidebar_position: 20
description: 'ClickHouse 不支持自动分片再平衡，因此本文提供了一些关于如何对分片进行再平衡的最佳实践。'
title: '数据再平衡'
doc_type: 'guide'
keywords: ['scaling', 'clusters', 'horizontal scaling', 'capacity planning', 'performance']
---

# 数据再平衡

ClickHouse 不支持自动分片再平衡。不过，可以按优先级顺序通过以下方式对分片进行再平衡：

1. 调整[分布式表](/engines/table-engines/special/distributed.md)的分片配置，使写入更偏向新的分片。这可能会在集群中造成负载不均和热点，但在大多数写入吞吐量不是极高的场景下是可行的。此方式不要求用户更改写入目标，即可以继续向分布式表写入。但它无法对已有数据进行再平衡。

2. 作为 (1) 的替代方案，可以修改现有集群，并在集群重新达到平衡之前只向新分片写入，即通过手动调整写入权重来实现。这与 (1) 具有相同的限制。

3. 如果需要对已有数据进行再平衡，并且已经对数据进行了分区，可以考虑先分离分区，然后手动将其迁移到另一个节点，再将其重新附加到新分片上。与后续方法相比，这种方式需要更多手动操作，但可能更快且资源消耗更少。由于这是手动操作，因此需要自行规划和控制数据再平衡过程。

4. 通过 [INSERT FROM SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 将数据从源集群导出到新集群。在非常大的数据集上，这种方式性能不佳，且可能在源集群上产生大量 IO，同时占用大量网络资源。这应被视为最后的手段。