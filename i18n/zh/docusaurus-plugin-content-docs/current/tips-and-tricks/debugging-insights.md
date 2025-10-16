---
'sidebar_position': 1
'slug': '/community-wisdom/debugging-insights'
'sidebar_label': '调试洞见'
'doc_type': 'guide'
'keywords':
- 'clickhouse troubleshooting'
- 'clickhouse errors'
- 'slow queries'
- 'memory problems'
- 'connection issues'
- 'performance optimization'
- 'database errors'
- 'configuration problems'
- 'debug'
- 'solutions'
'title': '课程 - 调试洞见'
'description': '找到最常见的 ClickHouse 问题的解决方案，包括慢查询、内存错误、连接问题和配置问题。'
---


# ClickHouse 操作：社区调试洞察 {#clickhouse-operations-community-debugging-insights}
*本指南是从社区见面会中获得的一系列发现的一部分。有关更多现实世界的解决方案和洞察，您可以 [按特定问题浏览](./community-wisdom.md)。*
*高运营成本困扰您吗？请查看 [成本优化](./cost-optimization.md) 社区洞察指南。*

## 基本系统表 {#essential-system-tables}

这些系统表对于生产调试至关重要：

### system.errors {#system-errors}

显示您 ClickHouse 实例中的所有活动错误。

```sql
SELECT name, value, changed 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```

### system.replicas {#system-replicas}

包含用于监控集群健康的复制延迟和状态信息。

```sql
SELECT database, table, replica_name, absolute_delay, queue_size, inserts_in_queue
FROM system.replicas 
WHERE absolute_delay > 60
ORDER BY absolute_delay DESC;
```

### system.replication_queue {#system-replication-queue}

提供用于诊断复制问题的详细信息。

```sql
SELECT database, table, replica_name, position, type, create_time, last_exception
FROM system.replication_queue 
WHERE last_exception != ''
ORDER BY create_time DESC;
```

### system.merges {#system-merges}

显示当前的合并操作，并可以识别卡住的进程。

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges 
ORDER BY elapsed DESC;
```

### system.parts {#system-parts}

对于监控部分计数和识别碎片问题至关重要。

```sql
SELECT database, table, count() as part_count
FROM system.parts 
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```

## 常见生产问题 {#common-production-issues}

### 磁盘空间问题 {#disk-space-problems}

在复制设置中，磁盘空间耗尽会导致级联问题。当一个节点耗尽空间时，其他节点继续尝试与其同步，从而导致网络流量激增和混淆的症状。一位社区成员花了 4 小时调试，结果只是磁盘空间过低。请查看此 [查询](/knowledgebase/useful-queries-for-troubleshooting#show-disk-storage-number-of-parts-number-of-rows-in-systemparts-and-marks-across-databases) 以监控特定集群上的磁盘存储。

AWS 用户应注意，默认的一般用途 EBS 卷有 16TB 的限制。

### 部件过多错误 {#too-many-parts-error}

小的频繁插入会造成性能问题。社区发现，插入速率超过每秒 10 次通常会触发“部件过多”错误，因为 ClickHouse 无法快速合并部件。

**解决方案：**
- 使用 30 秒或 200MB 的阈值进行批量数据处理
- 启用 async_insert 进行自动分批  
- 使用缓冲表进行服务器端批处理
- 配置 Kafka 以控制批量大小

[官方建议](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)：每次插入至少 1,000 行，理想状态下为 10,000 到 100,000。

### 时间戳无效问题 {#data-quality-issues}

发送任意时间戳数据的应用程序会造成分区问题。这会导致具有不现实日期（例如 1998 或 2050 年）数据的分区，从而导致意外的存储行为。

### `ALTER` 操作风险 {#alter-operation-risks}

在多 TB 表上进行大规模 `ALTER` 操作可能会消耗大量资源并可能锁定数据库。一位社区示例涉及在 14TB 数据上将一个整数更改为浮点数，这导致整个数据库被锁定，并需要从备份中重建。

**监控高成本变更：**

```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations 
WHERE is_done = 0;
```

首先在较小的数据集上测试模式更改。

## 内存和性能 {#memory-and-performance}

### 外部聚合 {#external-aggregation}

为内存密集型操作启用外部聚合。这虽然较慢，但可以防止由于溢出到磁盘而导致的内存不足崩溃。您可以通过使用 `max_bytes_before_external_group_by` 来实现，这将帮助防止在大型 `GROUP BY` 操作中出现内存不足崩溃。您可以在 [这里]( /operations/settings/settings#max_bytes_before_external_group_by) 了解更多关于此设置的信息。

```sql
SELECT 
    column1,
    column2,
    COUNT(*) as count,
    SUM(value) as total
FROM large_table
GROUP BY column1, column2
SETTINGS max_bytes_before_external_group_by = 1000000000; -- 1GB threshold
```

### 异步插入详细信息 {#async-insert-details}

异步插入会自动在服务器端对小插入进行批处理以提高性能。您可以配置是否在返回确认之前等待数据写入磁盘——立即返回速度更快但耐久性较差。现代版本支持去重，以处理批次内的重复数据。

**相关文档**
- [选择插入策略](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)

### 分布式表配置 {#distributed-table-configuration}

默认情况下，分布式表使用单线程插入。启用 `insert_distributed_sync` 进行并行处理并立即将数据发送到分片。

使用分布式表时监控临时数据的积累。

### 性能监控阈值 {#performance-monitoring-thresholds}

社区建议的监控阈值：
- 每个分区的部件：最好少于 100
- 延迟插入：应保持在零
- 插入速率：为了最佳性能，限制在每秒约 1 次

**相关文档**
- [自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)

## 快速参考 {#quick-reference}

| 问题 | 检测 | 解决方案 |
|-------|-----------|----------|
| 磁盘空间 | 检查 `system.parts` 总字节 | 监控使用情况，规划扩展 |
| 部件过多 | 计算每个表的部件 | 批量插入，启用 async_insert |
| 复制延迟 | 检查 `system.replicas` 延迟 | 监控网络，重启副本 |
| 错误数据 | 验证分区日期 | 实施时间戳验证 |
| 卡住的变更 | 检查 `system.mutations` 状态 | 先在小数据上测试 |

### 视频来源 {#video-sources}
- [操作 ClickHouse 的 10 个经验教训](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [在 ClickHouse 中快速、并发和一致的异步插入](https://www.youtube.com/watch?v=AsMPEfN5QtM)
