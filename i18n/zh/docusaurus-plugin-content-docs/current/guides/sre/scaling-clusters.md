---
'slug': '/guides/sre/scaling-clusters'
'sidebar_label': '重新平衡分片'
'sidebar_position': 20
'description': 'ClickHouse 不支持自动分片重新平衡，因此我们提供一些最佳实践来平衡分片。'
'title': '重新平衡数据'
'doc_type': 'guide'
---


# 重新平衡数据

ClickHouse 不支持自动分片重新平衡。然而，有几种按优先顺序重新平衡分片的方法：

1. 调整 [分布式表](/engines/table-engines/special/distributed.md) 的分片，允许写入偏向新的分片。这可能导致集群中的负载不均衡和热点，但在大多数写入吞吐量不是极高的场景中是可行的。这不需要用户更改他们的写入目标，即可以保持为分布式表。这并不有助于重新平衡现有数据。

2. 作为 (1) 的替代方案，修改现有集群并专门写入新分片，直到集群平衡 - 手动加权写入。这与 (1) 有相同的限制。

3. 如果您需要重新平衡现有数据并且已经对数据进行了分区，考虑分离分区并手动将其重新定位到另一个节点，然后再重新附加到新分片。这比后续技术更为手动，但可能更快且资源消耗更少。这是一个手动操作，因此需要考虑数据的重新平衡。

4. 通过 [INSERT FROM SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select) 将数据从源集群导出到新集群。这在非常大的数据集上性能不佳，并可能对源集群造成显著的 IO，并使用大量网络资源。这代表着最后的手段。
