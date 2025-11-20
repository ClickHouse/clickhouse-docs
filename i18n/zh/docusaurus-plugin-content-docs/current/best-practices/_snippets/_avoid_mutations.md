在 ClickHouse 中，**mutation（变更）**指的是对表中已有数据进行修改或删除的操作——通常通过 `ALTER TABLE ... DELETE` 或 `ALTER TABLE ... UPDATE` 来实现。尽管这些语句在表面上与标准 SQL 操作类似，但它们在底层实现上有着根本性的不同。

在 ClickHouse 中，mutation 并不是就地修改行数据，而是以异步后台进程的形式，对受影响的整个[数据分片（data parts）](/parts)进行重写。这种方式是由 ClickHouse 面向列、不可变的存储模型所决定的，同时也可能带来显著的 I/O 和资源消耗。

当发起一次 mutation 时，ClickHouse 会调度创建新的**变更后的分片（mutated parts）**，在新分片准备就绪之前，原始分片会保持不变。一旦新分片就绪，它们会以原子方式替换原有分片。然而，由于该操作会重写整个分片，即使只是很小的变更（例如更新单行数据），也可能触发大规模重写，并造成严重的写放大。

对于大型数据集，这可能导致磁盘 I/O 出现明显峰值，并降低整个集群的整体性能。与合并（merge）不同，mutation 一旦提交就无法回滚，并且在服务器重启后也会继续执行，除非显式取消——参见 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)。

:::tip 监控 ClickHouse 中处于活动或排队状态的 mutation 数量
关于如何监控处于活动或排队状态的 mutation 数量，请参考以下[知识库文章](/knowledgebase/view_number_of_active_mutations)。
:::

Mutation 是**全序的（totally ordered）**：它们会作用于 mutation 发起之前插入的数据，而之后新插入的数据不受影响。Mutation 不会阻塞写入，但仍可能与其他正在执行的查询重叠。在 mutation 期间运行的 SELECT 查询，可能会读取到已经变更和尚未变更分片的混合结果，这会在执行过程中导致数据视图不一致。ClickHouse 会按分片并行执行 mutation，这会进一步加剧内存与 CPU 的占用，尤其是在涉及复杂子查询（例如 `x IN (SELECT ...)`）的情况下。

一般来说，**应避免频繁或大规模的 mutation**，特别是在高吞吐量表上。可以优先考虑使用 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 等替代表引擎，它们被设计为在查询时或在合并期间更高效地处理数据更正。如果确实必须使用 mutation，应通过 `system.mutations` 表进行严密监控，并在某个进程卡住或异常时使用 `KILL MUTATION`。不当使用 mutation 可能导致性能下降、存储频繁抖动以及潜在的服务不稳定——因此应谨慎且少量地使用。

在删除数据时，用户还可以考虑使用[轻量级删除（Lightweight deletes）](/guides/developer/lightweight-delete)，或通过[分区](/best-practices/choosing-a-partitioning-key)来管理数据，从而能够高效地[删除整个分区](/sql-reference/statements/alter/partition#drop-partitionpart)。