---
'slug': '/guides/sre/scaling-clusters'
'sidebar_label': '平衡分片'
'sidebar_position': 20
'description': 'ClickHouse不支持自动分片重新平衡，因此我们提供了一些关于如何重新平衡分片的最佳实践。'
'title': '重新平衡数据'
---




# 数据再平衡

ClickHouse 不支持自动分片再平衡。但是，有几种按优先级顺序再平衡分片的方法：

1. 调整 [分布式表](/engines/table-engines/special/distributed.md) 的分片，让写入偏向新的分片。这可能会导致集群的负载不平衡和热点，但在写入吞吐量不是极高的大多数场景中是可行的。它不要求用户更改其写入目标，即可以保持为分布式表。这并不有助于再平衡现有数据。

2. 作为（1）的替代方案，修改现有集群并专门写入新的分片，直到集群平衡—手动加权写入。这与（1）有相同的限制。

3. 如果您需要再平衡现有数据，并且已经对数据进行了分区，考虑分离分区并手动将其重新定位到另一个节点，然后再重新附加到新分片。这种方法比随后的技术更手动，但可能更快且耗资较少。这是一个手动操作，因此需要考虑数据的再平衡。

4. 通过 [INSERT FROM SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 将数据从源集群导出到新集群。这在处理非常大的数据集时性能不佳，并可能会对源集群造成显著的 IO 负担，并消耗大量网络资源。这是最后的手段。
