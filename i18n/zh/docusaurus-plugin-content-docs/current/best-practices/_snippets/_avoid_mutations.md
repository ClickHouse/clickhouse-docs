在 ClickHouse 中，**mutations（变更）** 指的是修改或删除表中已有数据的操作——通常通过 `ALTER TABLE ... DELETE` 或 `ALTER TABLE ... UPDATE` 来实现。尽管这些语句表面上与标准 SQL 操作类似，但在底层实现上有本质区别。 

在 ClickHouse 中，mutation 并不是就地修改行，而是通过异步的后台进程，重写所有受变更影响的 [data parts](/parts)。由于 ClickHouse 是列式、不可变存储模型，这种方式是必须的，但也会带来显著的 I/O 和资源开销。

当发出一条 mutation 时，ClickHouse 会调度创建新的 **mutated parts（变更后的 parts）**，在新 parts 准备好之前，会保持原始 parts 不变。一旦新 parts 就绪，它们会以原子方式替换原始 parts。然而，由于该操作会重写整个 part，即便是很小的变更（例如仅更新一行数据）也可能导致大规模重写和严重的写放大。 

对于大型数据集，这会造成磁盘 I/O 的明显峰值，并降低整个集群的性能。与 merge 不同，mutation 一旦提交就无法回滚，即使服务器重启也会继续执行，除非显式取消——参见 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)。

:::tip 监控 ClickHouse 中处于活动或排队状态的 mutation 数量
关于如何监控处于活动或排队状态的 mutation 数量，请参考以下[知识库文章](/knowledgebase/view_number_of_active_mutations)。
:::

Mutations 是**全序的（totally ordered）**：它们只会作用于 mutation 发出之前插入的数据，而之后插入的新数据则不受影响。它们不会阻塞插入操作，但仍可能与其他正在执行的查询重叠。在 mutation 执行期间运行的 SELECT 可能会同时读取已经变更和未变更的 parts，从而在执行过程中产生数据视图不一致的情况。ClickHouse 会按 part 并行执行 mutation，这会进一步加剧内存和 CPU 的使用，尤其在涉及复杂子查询（例如 `x IN (SELECT ...)`）时更为明显。

一般来说，应**避免频繁或大规模的 mutation**，特别是在高吞吐量表上。应优先考虑使用其他表引擎，比如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，这些引擎被设计为在查询时或 merge 过程中更高效地处理数据纠错。如果 mutation 确实不可避免，应通过 system.mutations 表对其进行密切监控，并在进程卡住或行为异常时使用 `KILL MUTATION`。错误使用 mutation 会导致性能下降、存储频繁 churn，以及潜在的服务不稳定——因此应谨慎且少量地使用。

在删除数据时，你还可以考虑使用 [轻量级删除（Lightweight deletes）](/guides/developer/lightweight-delete)，或者通过[分区](/best-practices/choosing-a-partitioning-key)来管理数据，这样可以高效地[删除整个 part](/sql-reference/statements/alter/partition#drop-partitionpart)。