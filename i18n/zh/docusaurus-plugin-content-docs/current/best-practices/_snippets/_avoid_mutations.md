在 ClickHouse 中，**变更**指的是修改或删除表中现有数据的操作，通常使用 `ALTER TABLE ... DELETE` 或 `ALTER TABLE ... UPDATE`。虽然这些语句看起来与标准 SQL 操作相似，但从底层来看它们是根本不同的。

与其就地修改行，ClickHouse 中的变更是异步后台进程，会重写受更改影响的整个 [数据部分](/parts)。这种方法是由于 ClickHouse 的列式、不可变存储模型所必需的，但会导致显著的 I/O 和资源使用。

当发出变更时，ClickHouse 会调度创建新的 **变更部分**，在新部分准备好之前，原始部分保持不变。一旦准备就绪，变更部分将原子性地替换原始部分。然而，由于操作重写了整个部分，即使是微小的更改（例如更新单个行）也可能导致大规模的重写和过多的写入放大。

对于大型数据集，这会导致磁盘 I/O 的显著上升，并降低整体集群性能。与合并不同，一旦提交，变更无法回滚，即使在服务器重启后也会继续执行，除非显式取消 - 请参见 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)。

变更是 **完全有序** 的：它们适用于在发出变更之前插入的数据，而较新的数据则不受影响。变更不会阻止插入，但仍可能与其他正在进行的查询重叠。在变更进行期间运行的 SELECT 查询可能会读取变更部分和未变更部分的混合，这可能导致在执行过程中数据视图的不一致。ClickHouse 会按部分并行执行变更，这可能进一步加大内存和 CPU 的使用，特别是在涉及复杂子查询（如 x IN (SELECT ...)）时。

作为一条规则，**避免频繁或大规模的变更**，尤其是在高容量表上。相反，可以使用其他表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，这些引擎旨在在查询时或合并时更有效地处理数据修正。如果变更绝对必要，请使用 system.mutations 表仔细监控它们，并在进程卡住或表现异常时使用 `KILL MUTATION`。误用变更可能导致性能降低、存储频繁波动以及潜在的服务不稳定——因此要谨慎使用并适度应用。

对于删除数据，用户也可以考虑 [轻量级删除](/guides/developer/lightweight-delete) 或通过 [分区](/best-practices/choosing-a-partitioning-key) 管理数据，这允许以 [高效方式删除整个部分](/sql-reference/statements/alter/partition#drop-partitionpart)。
