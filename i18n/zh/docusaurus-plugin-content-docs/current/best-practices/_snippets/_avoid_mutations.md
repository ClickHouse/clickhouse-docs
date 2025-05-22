---
null
...
---

在 ClickHouse 中，**变更** 指的是修改或删除表中现有数据的操作 - 通常使用 `ALTER TABLE ... DELETE` 或 `ALTER TABLE ... UPDATE`。虽然这些语句看起来与标准 SQL 操作相似，但它们在底层是根本不同的。

在 ClickHouse 中，变更不是直接修改行，而是异步后台进程，会重写因更改而受影响的整个 [数据部分](/parts)。这种方法是必要的，因为 ClickHouse 的列式、不可变存储模型，但它可能导致显著的 I/O 和资源使用。

当发出变更请求时，ClickHouse 会安排创建新的 **变更部分**，原始部分保持不变，直到新的部分准备好。一旦准备就绪，变更部分将原子性地替换原始部分。然而，由于操作重写整个部分，即使是微小的更改（例如更新单行）也可能导致大规模的重写和过度的写放大。

对于大型数据集，这可能会导致磁盘 I/O 的显著激增并降低整体集群性能。与合并不同，变更一旦提交就无法回滚，并且即使在服务器重启后仍会继续执行，除非显式取消 - 请参阅 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)。

变更是 **完全有序** 的：它们适用于在发出变更之前插入的数据，而新数据则不受影响。变更不会阻止插入，但仍可能与其他正在进行的查询重叠。在变更进行时运行的 SELECT 可能会读取变更和未变更部分的混合，这可能导致执行期间数据视图不一致。ClickHouse 在每个部分并行执行变更，这可能进一步加剧内存和 CPU 使用，特别是在涉及复杂子查询（例如 x IN (SELECT ...））时。

通常，**避免频繁或大规模的变更**，特别是在高吞吐量的表上。相反，使用其他表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，这些引擎被设计用来在查询时或在合并过程中更有效地处理数据更正。如果变更绝对必要，请使用 system.mutations 表仔细监控它们，并在进程卡住或表现不正常时使用 `KILL MUTATION`。滥用变更可能导致性能下降、存储剧烈变动以及潜在的服务不稳定 - 因此请谨慎并适度地应用它们。

对于删除数据，用户还可以考虑 [轻量级删除](/guides/developer/lightweight-delete) 或通过 [分区](/best-practices/choosing-a-partitioning-key) 管理数据，这允许有效地 [删除整个部分](/sql-reference/statements/alter/partition#drop-partitionpart)。
