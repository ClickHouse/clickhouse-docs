---
{}
---

在 ClickHouse 中，**突变**指的是修改或删除现有表中数据的操作—通常使用 `ALTER TABLE ... DELETE` 或 `ALTER TABLE ... UPDATE`。虽然这些语句可能与标准 SQL 操作看起来相似，但在底层上它们是根本不同的。

在 ClickHouse 中，突变不是在原地修改行，而是异步后台进程，重写受更改影响的整个 [数据部分](/parts)。这种方法是必要的，因为 ClickHouse 是列式、不可变的存储模型，但这可能导致显著的 I/O 和资源使用。

当突变被发出时，ClickHouse 会安排创建新的 **突变部分**，在新部分准备好之前，原始部分保持不变。一旦准备就绪，突变部分会原子性地替换原始部分。然而，由于操作重写整个部分，即使是微小的更改（例如更新单行）也可能导致大规模重写和过度写放大。

对于大型数据集，这会导致磁盘 I/O 的显著激增，并降低整体集群性能。与合并不同，突变一旦提交便无法回滚，即使在服务器重启后仍会继续执行，除非被显式取消 - 请参见 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)。

突变是 **完全有序的**：它们适用于在突变发出之前插入的数据，而新数据则不受影响。它们不会阻塞插入，但仍可能与其他进行中的查询重叠。在突变进行期间运行的 SELECT 可能会读取突变和未突变部分的混合，这可能导致在执行期间对数据的视图不一致。ClickHouse 对每个部分并行执行突变，这可能进一步加大内存和 CPU 使用，特别是在涉及复杂子查询（如 x IN (SELECT ...)）时。

通常，**避免频繁或大规模的突变**，尤其是在高流量表上。相反，可以使用其他表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，它们旨在在查询时或合并期间更高效地处理数据修正。如果突变绝对必要，请使用 system.mutations 表仔细监控，并在进程卡住或表现不佳时使用 `KILL MUTATION`。错误使用突变可能导致性能下降、过度的存储变动和潜在的服务不稳定——因此应谨慎使用，并尽量少用。

对于删除数据，用户还可以考虑 [轻量级删除](/guides/developer/lightweight-delete) 或通过 [分区](/best-practices/choosing-a-partitioning-key) 管理数据，这允许高效地 [丢弃整个部分](/sql-reference/statements/alter/partition#drop-partitionpart)。
