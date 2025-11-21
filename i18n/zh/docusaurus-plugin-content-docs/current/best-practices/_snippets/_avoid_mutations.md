在 ClickHouse 中，**mutation（变更）** 指的是修改或删除表中已有数据的操作——通常使用 `ALTER TABLE ... DELETE` 或 `ALTER TABLE ... UPDATE`。虽然这些语句看起来与标准 SQL 操作类似，但在内部实现上有本质区别。 

在 ClickHouse 中，mutation 并不是就地修改行，而是作为异步的后台进程，对受到影响的整个 [数据片段（data parts）](/parts) 进行重写。由于 ClickHouse 采用列式、不可变的存储模型，这种方式是必要的，但同时也可能导致显著的 I/O 和资源消耗。

当发出 mutation 时，ClickHouse 会调度创建新的 **变更片段（mutated parts）**，在新片段准备就绪之前，保持原始片段不变。一旦就绪，这些变更片段会以原子方式替换原片段。然而，由于该操作会重写整个片段，即使是很小的改动（例如更新单行数据），也可能导致大规模重写和严重的写放大效应。 

对于大规模数据集，这可能会引起磁盘 I/O 的大幅峰值，并降低整个集群的性能。与合并不同，mutation 一旦提交就无法回滚，并且即使在服务器重启后也会继续执行，除非被显式取消——参见 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)。

:::tip 在 ClickHouse 中监控活动或排队中的 mutation 数量
有关如何监控活动或排队中的 mutation 数量，请参阅以下[知识库文章](/knowledgebase/view_number_of_active_mutations)。
:::

Mutation 是 **全序的（totally ordered）**：它们会应用到 mutation 发出之前插入的数据，而之后插入的新数据不受影响。它们不会阻塞插入，但仍可能与其他正在执行的查询重叠。在 mutation 过程中运行的 SELECT 查询，可能会同时读取已变更和未变更的片段，这会在执行期间导致数据视图不一致。ClickHouse 按片段并行执行 mutation，这会进一步加剧内存和 CPU 的使用量，尤其是当涉及复杂子查询（例如 x IN (SELECT ...)）时。

一般原则是，**避免频繁或大规模的 mutation**，尤其是在高写入量的表上。应优先考虑使用诸如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 等替代表引擎，这些引擎被设计为在查询时或合并过程中更高效地处理数据修正。如果 mutation 的使用不可避免，应通过 system.mutations 表对其进行严格监控，并在进程卡住或行为异常时使用 `KILL MUTATION`。不当使用 mutation 可能导致性能下降、存储频繁抖动以及潜在的服务不稳定——因此应谨慎且尽量少用。

对于删除数据，用户也可以考虑使用 [轻量级删除（Lightweight deletes）](/guides/developer/lightweight-delete)，或通过[分区](/best-practices/choosing-a-partitioning-key)管理数据，从而能够高效地[删除整个片段](/sql-reference/statements/alter/partition#drop-partitionpart)。