## 术语 {#terminology}
### 副本 {#replica}
数据的副本。 ClickHouse 始终至少保留您的数据的一份副本，因此 **副本** 的最小数量为一。这是一个重要的细节，您可能不习惯将数据的原始副本视为副本，但这就是 ClickHouse 代码和文档中使用的术语。 添加第二个数据副本提供了容错能力。

### 分片 {#shard}
数据的子集。 ClickHouse 始终至少为您的数据保留一个分片，因此，如果您没有将数据分散到多个服务器上，您的数据将存储在一个分片中。 将数据分片到多个服务器可以在您超出单个服务器的容量时分担负载。 目标服务器由 **分片键** 决定，并在创建分布式表时定义。 分片键可以是随机的或是 [哈希函数](/sql-reference/functions/hash-functions) 的输出。 涉及分片的部署示例将使用 `rand()` 作为分片键，并提供有关何时以及如何选择不同分片键的进一步信息。

### 分布式协调 {#distributed-coordination}
ClickHouse Keeper 提供数据复制和分布式 DDL 查询执行的协调系统。 ClickHouse Keeper 与 Apache ZooKeeper 兼容。
