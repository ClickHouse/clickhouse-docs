---
sidebar_position: 1
slug: /community-wisdom/debugging-insights
sidebar_label: '调试洞察'
doc_type: 'guide'
keywords: [
  'ClickHouse 故障排查',
  'ClickHouse 错误',
  '慢查询',
  '内存问题', 
  '连接问题',
  '性能优化',
  '数据库错误',
  '配置问题',
  '调试',
  '解决方案'
]
title: '经验总结 - 调试洞察'
description: '获取针对最常见 ClickHouse 问题的解决方案，包括慢查询、内存错误、连接问题和配置问题。'
---



# ClickHouse 运维：社区调试经验 {#clickhouse-operations-community-debugging-insights}

_本指南是社区交流会中总结的系列经验之一。如需了解更多实际解决方案和经验，您可以[按具体问题浏览](./community-wisdom.md)。_
_运维成本过高？请参阅[成本优化](./cost-optimization.md)社区经验指南。_


## 核心系统表 {#essential-system-tables}

这些系统表是生产环境调试的基础：

### system.errors {#system-errors}

显示 ClickHouse 实例中的所有活动错误。

```sql
SELECT name, value, changed
FROM system.errors
WHERE value > 0
ORDER BY value DESC;
```

### system.replicas {#system-replicas}

包含用于监控集群健康状况的复制延迟和状态信息。

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

显示当前的合并操作，可用于识别卡住的进程。

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges
ORDER BY elapsed DESC;
```

### system.parts {#system-parts}

对于监控数据分片数量和识别碎片化问题至关重要。

```sql
SELECT database, table, count() as part_count
FROM system.parts
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```


## 常见生产环境问题 {#common-production-issues}

### 磁盘空间问题 {#disk-space-problems}

在副本集群中,磁盘空间耗尽会引发连锁反应。当某个节点空间不足时,其他节点仍会持续尝试与其同步,导致网络流量激增并产生令人困惑的症状。曾有社区成员花费4小时排查问题,最终发现根本原因仅仅是磁盘空间不足。可以使用此[查询](/knowledgebase/useful-queries-for-troubleshooting#show-disk-storage-number-of-parts-number-of-rows-in-systemparts-and-marks-across-databases)来监控特定集群的磁盘存储情况。

AWS 用户需要注意,默认的通用型 EBS 卷存在 16TB 的容量限制。

### 分区过多错误 {#too-many-parts-error}

频繁的小批量插入会导致性能问题。社区发现,当插入速率超过每秒10次时,经常会触发"分区过多"错误,这是因为 ClickHouse 无法足够快地合并分区。

**解决方案:**

- 使用30秒或200MB阈值进行批量处理
- 启用 async_insert 实现自动批处理
- 使用缓冲表进行服务器端批处理
- 配置 Kafka 以控制批次大小

[官方建议](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous):每次插入至少1,000行,理想情况下为10,000至100,000行。

### 无效时间戳问题 {#data-quality-issues}

应用程序发送带有任意时间戳的数据会造成分区问题。这会导致分区中包含不合理日期(如1998年或2050年)的数据,从而引发意外的存储行为。

### `ALTER` 操作风险 {#alter-operation-risks}

在多TB级别的表上执行大型 `ALTER` 操作可能会消耗大量资源,并可能导致数据库锁定。一个社区案例中,在14TB数据上将 Integer 类型更改为 Float 类型,结果锁定了整个数据库,最终需要从备份重建。

**监控高成本的变更操作:**

```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations
WHERE is_done = 0;
```

建议先在较小的数据集上测试模式变更。


## 内存与性能 {#memory-and-performance}

### 外部聚合 {#external-aggregation}

为内存密集型操作启用外部聚合。虽然速度较慢,但可以通过溢出到磁盘来防止内存不足导致的崩溃。您可以使用 `max_bytes_before_external_group_by` 设置来实现此功能,这有助于防止大型 `GROUP BY` 操作时出现内存不足崩溃。您可以在[此处](/operations/settings/settings#max_bytes_before_external_group_by)了解有关此设置的更多信息。

```sql
SELECT
    column1,
    column2,
    COUNT(*) as count,
    SUM(value) as total
FROM large_table
GROUP BY column1, column2
SETTINGS max_bytes_before_external_group_by = 1000000000; -- 1GB 阈值
```

### 异步插入详情 {#async-insert-details}

异步插入会在服务器端自动批处理小批量插入以提高性能。您可以配置是否在返回确认之前等待数据写入磁盘——立即返回速度更快但持久性较低。现代版本支持去重功能以处理批次内的重复数据。

**相关文档**

- [选择插入策略](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)

### 分布式表配置 {#distributed-table-configuration}

默认情况下,分布式表使用单线程插入。启用 `insert_distributed_sync` 可实现并行处理并立即将数据发送到各分片。

使用分布式表时需监控临时数据的累积情况。

### 性能监控阈值 {#performance-monitoring-thresholds}

社区推荐的监控阈值:

- 每个分区的数据部分数:建议少于 100
- 延迟插入:应保持为零
- 插入速率:建议限制在每秒约 1 次以获得最佳性能

**相关文档**

- [自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)


## 快速参考 {#quick-reference}

| 问题           | 检测方法                        | 解决方案                           |
| --------------- | -------------------------------- | ---------------------------------- |
| 磁盘空间      | 检查 `system.parts` 总字节数 | 监控使用情况,规划扩容        |
| 分片过多  | 统计每个表的分片数            | 批量插入,启用 async_insert |
| 复制延迟 | 检查 `system.replicas` 延迟    | 监控网络,重启副本  |
| 数据异常        | 验证分区日期         | 实施时间戳验证     |
| Mutation 卡住 | 检查 `system.mutations` 状态  | 先在小数据集上测试           |

### 视频资源 {#video-sources}

- [ClickHouse 运维的 10 个经验教训](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [ClickHouse 中快速、并发且一致的异步插入](https://www.youtube.com/watch?v=AsMPEfN5QtM)
