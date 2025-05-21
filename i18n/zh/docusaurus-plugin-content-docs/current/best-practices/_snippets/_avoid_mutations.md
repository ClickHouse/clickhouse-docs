---
{}
---



在 ClickHouse 中，**变更** 指的是修改或删除表中现有数据的操作 - 通常使用 `ALTER TABLE ... DELETE` 或 `ALTER TABLE ... UPDATE`。尽管这些语句在表面上可能与标准 SQL 操作相似，但它们在底层有根本的不同。

在 ClickHouse 中，变更并不是就地修改行，而是异步后台进程，重写因变更而受影响的整个 [数据部分](/parts)。这种方法是必要的，因为 ClickHouse 的列式、不可变存储模型，但这可能导致显著的 I/O 和资源使用。

当发出变更时，ClickHouse 调度创建新的 **变更部分**，在新部分准备好之前保持原始部分不变。一旦准备就绪，变更部分将原子地替换原始部分。然而，由于操作重写整个部分，即使是微小的更改（例如更新单行），也可能导致大规模重写和过度的写入放大。

对于大型数据集，这可能会导致磁盘 I/O 大幅上升，并降低集群的整体性能。与合并不同，变更一旦提交便无法回滚，并且即使在服务器重启后仍将继续执行，除非被显式取消 - 请参见 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)。

变更是 **完全有序** 的：它们适用于在发出变更之前插入的数据，而新数据保持不变。它们不会阻塞插入，但仍可能与其他正在进行的查询重叠。在变更过程中运行的 SELECT 查询可能会读取变更和未变更部分的混合，可能导致在执行期间对数据的一致性视图产生影响。ClickHouse 以并行的方式在每个部分上执行变更，这可能进一步加大内存和 CPU 的使用，尤其是在涉及复杂子查询（例如 x IN (SELECT ...)）时。

一般来说，**避免频繁或大规模的变更**，尤其是在高吞吐量表上。相反，使用替代的表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，这些表引擎旨在在查询时或在合并期间更有效地处理数据修正。如果变更绝对必要，请使用 system.mutations 表仔细监控它们，并在某个进程卡住或表现异常时使用 `KILL MUTATION`。错误使用变更可能导致性能下降、存储频繁消耗以及潜在的服务不稳定，因此应谨慎且少量使用。

对于删除数据，用户还可以考虑 [轻量级删除](/guides/developer/lightweight-delete) 或通过 [分区](/best-practices/choosing-a-partitioning-key) 管理数据，这允许有效 [删除整个部分](/sql-reference/statements/alter/partition#drop-partitionpart)。
