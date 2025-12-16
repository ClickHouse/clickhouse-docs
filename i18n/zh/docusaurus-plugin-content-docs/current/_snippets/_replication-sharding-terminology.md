## 术语 {#terminology}
### 副本 {#replica}
数据的一份副本。ClickHouse 始终至少保留一份数据副本，因此 **副本** 的最小数量为 1。这个细节非常重要：你可能不习惯把原始数据副本也计作一个副本，但这正是 ClickHouse 代码和文档中使用的术语。为数据添加第二个副本可以提供容错能力。 

### 分片 {#shard}
数据的一个子集。ClickHouse 始终至少有一个分片来存储你的数据，因此如果你不在多台服务器之间拆分数据，你的数据将只存储在一个分片中。当单台服务器的容量不足以承载负载时，可以通过在多台服务器之间对数据进行分片来分担负载。目标服务器由 **分片键（sharding key）** 决定，并在你创建分布式表时定义。分片键可以是随机的，也可以是[哈希函数](/sql-reference/functions/hash-functions)的输出。涉及分片的部署示例将使用 `rand()` 作为分片键，并会进一步说明在何时以及如何选择不同的分片键。

### 分布式协调 {#distributed-coordination}
ClickHouse Keeper 提供用于数据复制和分布式 DDL 查询执行的协调系统。ClickHouse Keeper 与 Apache ZooKeeper 兼容。
