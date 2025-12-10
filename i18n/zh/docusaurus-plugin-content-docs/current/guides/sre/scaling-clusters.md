---
slug: /guides/sre/scaling-clusters
sidebar_label: '分片再均衡'
sidebar_position: 20
description: 'ClickHouse 不支持自动分片再均衡，因此我们在此提供一些关于如何进行分片再均衡的最佳实践。'
title: '数据再均衡'
doc_type: 'guide'
keywords: ['扩展', '集群', '水平扩展', '容量规划', '性能']
---

# 数据再平衡 {#rebalancing-data}

ClickHouse 不支持自动分片再平衡。不过，可以按以下优先级通过多种方式对分片进行再平衡：

1. 调整[分布式表](/engines/table-engines/special/distributed.md)的分片，使写入更偏向新的分片。这可能会导致集群负载不均和热点，但在大多数写入吞吐量不是极高的场景下是可行的。此方法不要求用户更改写入目标，即仍然可以将分布式表作为写入目标。该方法无法对已有数据进行再平衡。

2. 作为 (1) 的替代方案，可以修改现有集群，并在集群恢复平衡前只向新分片写入，即通过手动调整写入权重来实现。这一方案与 (1) 有相同的局限性。

3. 如果需要对已有数据进行再平衡，并且数据已经分区，可以考虑先分离分区，再在重新挂载到新分片之前，将这些分区手动迁移到另一个节点。相比后续方法，此方案更为手动，但可能更快且资源消耗更少。这是手动操作，因此需要自行规划数据再平衡过程。

4. 通过 [INSERT FROM SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 将源集群中的数据导出到新集群。对于非常大的数据集，该方法性能较差，可能在源集群上产生大量 IO，并消耗大量网络资源。此方法应作为最后手段。