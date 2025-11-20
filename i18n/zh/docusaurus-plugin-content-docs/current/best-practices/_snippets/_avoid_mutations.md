在 ClickHouse 中，**mutation（变更）**指的是对表中已有数据进行修改或删除的操作——通常使用 `ALTER TABLE ... DELETE` 或 `ALTER TABLE ... UPDATE`。虽然这些语句看起来与标准 SQL 操作类似，但在底层实现上有本质区别。

在 ClickHouse 中，mutation 并不是就地修改行，而是作为异步的后台进程，对受影响的完整[数据 part](/parts)进行重写。这种方式是由 ClickHouse 面向列且存储不可变的模型所决定的，并且可能导致显著的 I/O 与资源消耗。

当发起一次 mutation 时，ClickHouse 会调度创建新的**变更后的 part**，在新 part 准备就绪之前，原始的 part 会保持不变。一旦准备完成，变更后的 part 会以原子方式替换原始 part。然而，由于该操作会重写整个 part，即便是非常小的修改（例如更新单行数据），也可能导致大规模重写和严重的写放大。

对于大型数据集，这可能会造成磁盘 I/O 的大幅飙升，并降低整个集群的整体性能。与 merge 不同，mutation 一旦提交就无法回滚，并且即使在服务器重启之后也会继续执行，除非被显式取消——参见 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)。

:::tip Monitoring the number of active or queued mutations in ClickHouse
关于如何监控 ClickHouse 中处于活动状态或排队中的 mutation 数量，请参阅以下[知识库文章](/knowledgebase/view_number_of_active_mutations)。
:::

Mutation 是**全序的（totally ordered）**：它们只会应用于 mutation 发出之前插入的数据，而之后插入的新数据则不受影响。它们不会阻塞插入操作，但仍可能与其他正在进行的查询并发执行。在 mutation 执行期间运行的 SELECT 查询，可能会读取到已变更和未变更 part 的混合数据，从而在执行过程中产生数据视图不一致的情况。ClickHouse 会按 part 并行执行 mutation，这会进一步加剧内存和 CPU 的使用，尤其是在涉及复杂子查询（如 x IN (SELECT ...)）的场景中。

通常，应当**避免频繁或大规模的 mutation**，特别是在高数据量的表上。相反，应优先使用如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 等其他表引擎，这些引擎被设计用于在查询时或在合并过程中更高效地处理数据纠正。如果 mutation 的使用不可避免，应通过 `system.mutations` 表对其进行仔细监控，并在进程卡住或行为异常时使用 `KILL MUTATION`。不当使用 mutation 可能导致性能下降、存储频繁抖动以及潜在的服务不稳定——因此应谨慎、少量地使用。

对于删除数据，用户还可以考虑使用 [Lightweight deletes](/guides/developer/lightweight-delete)，或通过[分区](/best-practices/choosing-a-partitioning-key)来管理数据，从而能够[高效地删除](/sql-reference/statements/alter/partition#drop-partitionpart)整个 part。