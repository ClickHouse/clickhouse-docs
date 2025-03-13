## 术语 {#terminology}
### 副本 {#replica}
数据的副本。ClickHouse始终至少有一个数据副本，因此副本的最小数量为1。这是一个重要细节，您可能不习惯将数据的原始副本视为副本，但这是ClickHouse代码和文档中使用的术语。添加数据的第二个副本可以提供故障容错能力。

### 分片 {#shard}
数据的子集。ClickHouse始终至少为您的数据提供一个分片，因此如果您不将数据拆分到多个服务器上，您的数据将存储在一个分片中。在多个服务器上对数据进行分片可以在超出单个服务器的容量时分担负载。目标服务器由**分片键**确定，并在创建分布式表时定义。分片键可以是随机的，也可以是[哈希函数](/sql-reference/functions/hash-functions)的输出。涉及分片的部署示例将使用 `rand()` 作为分片键，并提供有关何时以及如何选择不同分片键的进一步信息。

### 分布式协调 {#distributed-coordination}
ClickHouse Keeper提供数据复制和分布式DDL查询执行的协调系统。ClickHouse Keeper与Apache ZooKeeper兼容。
