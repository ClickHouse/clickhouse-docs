---
slug: /cloud/bestpractices/avoid-optimize-final
sidebar_label: 避免 Optimize Final
title: 避免 Optimize Final
keywords: ['OPTIMIZE TABLE', 'FINAL', '未计划合并']
---

使用 [`OPTIMIZE TABLE ... FINAL`](/sql-reference/statements/optimize/) 查询会启动一个特定表的未计划数据分片合并，将其合并为一个单一的数据分片。 
在此过程中，ClickHouse 执行以下步骤：

- 读取数据分片。
- 对分片进行解压缩。
- 合并分片。
- 将其压缩为一个单一的分片。
- 然后，将该分片写回对象存储。

上述操作资源密集，消耗大量的 CPU 和磁盘 I/O。 
需要注意的是，使用这种优化将迫使对一个分片进行重写，即使已经合并为一个单一分片。

此外，使用 `OPTIMIZE TABLE ... FINAL` 查询可能会忽视 
设置 [`max_bytes_to_merge_at_max_space_in_pool`](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)，该设置控制 ClickHouse 通常在后台合并的最大分片大小。

`[`max_bytes_to_merge_at_max_space_in_pool`](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)` 设置默认值为 150 GB。 
运行 `OPTIMIZE TABLE ... FINAL` 时，将执行上述步骤，合并后结果为一个单一的分片。 
这个剩余的单一分片可能会超过该设置默认值中指定的 150 GB。 
这是另一个重要的考虑因素，也是您应该避免使用此语句的理由，因为将大量 150 GB 的分片合并为一个分片可能需要大量的时间和/或内存。
