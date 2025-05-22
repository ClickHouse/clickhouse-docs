---
null
...
---

## 术语 {#terminology}
### 副本 {#replica}
数据的副本。 ClickHouse 始终至少保留一份您的数据副本，因此最低的 **replicas** 数量为一。这是一个重要的细节，您可能不习惯将数据的原始副本视为副本，但这就是 ClickHouse 代码和文档中使用的术语。添加第二个数据副本可以提供容错能力。

### 分片 {#shard}
数据的子集。 ClickHouse 始终至少为您的数据保留一个分片，因此如果您不将数据划分到多个服务器上，您的数据将存储在一个分片中。在多个服务器上分片数据可以用于分担负载，如果您超出了单个服务器的容量。目标服务器由 **sharding key** 决定，并在您创建分布式表时定义。分片键可以是随机的或作为 [哈希函数](/sql-reference/functions/hash-functions) 的输出。涉及分片的部署示例将使用 `rand()` 作为分片键，并将提供关于何时以及如何选择不同分片键的进一步信息。

### 分布式协调 {#distributed-coordination}
ClickHouse Keeper 提供了数据复制和分布式 DDL 查询执行的协调系统。 ClickHouse Keeper 与 Apache ZooKeeper 兼容。
