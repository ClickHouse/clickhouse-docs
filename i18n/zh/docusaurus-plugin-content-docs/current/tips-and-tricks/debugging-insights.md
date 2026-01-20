---
sidebar_position: 1
slug: /community-wisdom/debugging-insights
sidebar_label: '调试洞见'
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
title: '实践经验 - 调试洞见'
description: '查找最常见 ClickHouse 问题的解决方案，包括慢查询、内存错误、连接问题和配置问题。'
---

# ClickHouse 运维：社区调试洞见 \{#clickhouse-operations-community-debugging-insights\}

*本指南是基于社区活动中总结出的经验与结论的一部分。想获取更多真实场景下的解决方案与洞见，可以[按具体问题浏览](./community-wisdom.md)。*
*是否正为高昂的运维成本发愁？请查看[成本优化](./cost-optimization.md)社区洞见指南。*

## 关键系统表 \{#essential-system-tables\}

以下系统表是生产环境调试/排障的基础：

### system.errors \{#system-errors\}

显示 ClickHouse 实例中当前所有存在的错误。

```sql
SELECT name, value, changed 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```


### system.replicas \{#system-replicas\}

包含用于监控集群健康状况的复制延迟和状态信息。

```sql
SELECT database, table, replica_name, absolute_delay, queue_size, inserts_in_queue
FROM system.replicas 
WHERE absolute_delay > 60
ORDER BY absolute_delay DESC;
```


### system.replication&#95;queue \{#system-replication-queue\}

提供用于诊断复制相关问题的详细信息。

```sql
SELECT database, table, replica_name, position, type, create_time, last_exception
FROM system.replication_queue 
WHERE last_exception != ''
ORDER BY create_time DESC;
```


### system.merges \{#system-merges\}

显示当前正在进行的合并操作，并可用于识别卡住的进程。

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges 
ORDER BY elapsed DESC;
```


### system.parts \{#system-parts\}

对监控数据片数量和识别碎片化问题至关重要。

```sql
SELECT database, table, count() as part_count
FROM system.parts 
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```


## 常见生产环境问题 \{#common-production-issues\}

### 磁盘空间问题 \{#disk-space-problems\}

在复制架构中，磁盘空间耗尽会引发级联问题。当某个节点磁盘用尽时，其他节点会持续尝试与其同步，导致网络流量激增并出现难以理解的异常现象。有一位社区用户花了 4 小时排查，结果只是磁盘空间不足。请参考这个用于监控特定集群磁盘存储情况的[查询](/knowledgebase/useful-queries-for-troubleshooting#show-disk-storage-number-of-parts-number-of-rows-in-systemparts-and-marks-across-databases)。

如果你在使用 AWS，需要注意默认通用型 EBS 卷的容量上限为 16TB。

### too many parts 错误 \{#too-many-parts-error\}

小而频繁的插入会造成性能问题。社区实践表明，当插入速率超过每秒 10 次时，经常会触发 “too many parts” 错误，因为 ClickHouse 无法以足够快的速度合并这些 part。

**解决方案：**

* 使用 30 秒或 200MB 阈值对数据进行批处理
* 启用 `async_insert` 实现自动批处理
* 使用 Buffer 表在服务端进行批处理
* 配置 Kafka 以控制批大小

[官方建议](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)：每次插入至少 1,000 行，理想范围为 10,000 到 100,000 行。

### 无效时间戳问题 \{#data-quality-issues\}

应用程序如果发送带有任意时间戳的数据，会导致分区问题。这可能生成包含不现实日期（如 1998 或 2050 年）的分区，从而引发意外的存储行为。

### `ALTER` 操作风险 \{#alter-operation-risks\}

在多 TB 级表上执行大型 `ALTER` 操作会消耗大量资源，并有可能锁住数据库。某个社区案例中，将 14TB 数据中的 Integer 修改为 Float，结果锁住了整个数据库，只能通过备份重建。

**监控开销巨大的变更操作（mutation）：**

```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations 
WHERE is_done = 0;
```

先在较小的数据集上测试模式变更。


## 内存与性能 \{#memory-and-performance\}

### 外部聚合 \{#external-aggregation\}

为内存密集型操作启用外部聚合。虽然速度会更慢，但通过将数据写入磁盘来防止因内存不足而导致的崩溃。可以通过使用 `max_bytes_before_external_group_by` 来实现，这有助于在大型 `GROUP BY` 操作中避免内存不足崩溃。有关此设置的更多信息，请参见[此处](/operations/settings/settings#max_bytes_before_external_group_by)。

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


### 异步插入详情 \{#async-insert-details\}

异步插入会在服务端自动将小规模插入请求合并成批量写入，以提升性能。可以配置在返回确认之前是否等待数据写入磁盘——立即返回速度更快，但持久性较差。较新版本支持去重，以处理批次中的重复数据。

**相关文档**

- [选择插入策略](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)

### Distributed 表配置 \{#distributed-table-configuration\}

默认情况下，Distributed 表使用单线程插入。启用 `insert_distributed_sync` 可进行并行处理，并将数据立即发送到各分片。

在使用 Distributed 表时，应监控临时数据的累积情况。

### 性能监控阈值 \{#performance-monitoring-thresholds\}

社区推荐的监控阈值：

* 每个分区的 parts 数量：最好少于 100
* 延迟插入：应保持为 0
* 插入速率：建议限制在每秒约 1 次，以获得最佳性能

**相关文档**

* [自定义分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)

## 快速参考 \{#quick-reference\}

| 问题 | 检测方式 | 解决方案 |
|-------|-----------|----------|
| 磁盘空间 | 检查 `system.parts` 总字节数 | 监控使用情况，规划扩容 |
| 分区片段过多 | 统计每张表的分区片段数量 | 批量写入，启用 async_insert |
| 副本延迟 | 检查 `system.replicas` 延迟 | 监控网络，重启副本 |
| 异常数据 | 校验分区日期 | 实施时间戳校验 |
| 卡住的 mutations | 检查 `system.mutations` 状态 | 先在小规模数据上测试 |

### 视频资料 \{#video-sources\}

- [运维 ClickHouse 的 10 条经验教训](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [ClickHouse 中快速、并发且一致的异步 INSERT](https://www.youtube.com/watch?v=AsMPEfN5QtM)