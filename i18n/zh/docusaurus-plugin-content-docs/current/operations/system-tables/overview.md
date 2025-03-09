---
description: '系统表概述及其用途的介绍。'
slug: /operations/system-tables/overview
sidebar_position: 52
sidebar_label: 概述
title: '系统表概述'
keywords: ['系统表', '概述']
---

## 介绍 {#system-tables-introduction}

系统表提供以下信息：

- 服务器状态、进程和环境。
- 服务器的内部进程。
- 构建 ClickHouse 二进制文件时使用的选项。

系统表：

- 位于 `system` 数据库中。
- 仅可用于读取数据。
- 不能被删除或更改，但可以被分离。

大多数系统表将其数据存储在内存中。ClickHouse 服务器在启动时创建这些系统表。

与其他系统表不同，系统日志表 [metric_log](../../operations/system-tables/metric_log.md)、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[trace_log](../../operations/system-tables/trace_log.md)、[part_log](../../operations/system-tables/part_log.md)、[crash_log](../../operations/system-tables/crash-log.md)、[text_log](../../operations/system-tables/text_log.md) 和 [backup_log](../../operations/system-tables/backup_log.md) 由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表引擎提供，并默认将其数据存储在文件系统中。如果从文件系统中删除表，ClickHouse 服务器将在下次数据写入时再次创建空表。如果新版本中系统表架构发生更改，则 ClickHouse 会重命名当前表并创建新表。

系统日志表可以通过在 `/etc/clickhouse-server/config.d/` 下创建与表同名的配置文件，或在 `/etc/clickhouse-server/config.xml` 中设置相应元素来进行自定义。可以自定义的元素包括：

- `database` : 系统日志表所属的数据库。此选项现已弃用，所有系统日志表都在数据库 `system` 下。
- `table` : 插入数据的表。
- `partition_by` : 指定 [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 表达式。
- `ttl` : 指定表 [TTL](../../sql-reference/statements/alter/ttl.md) 表达式。
- `flush_interval_milliseconds` : 刷新数据到磁盘的间隔。
- `engine` : 提供完整的引擎表达式（以 `ENGINE =` 开头）及参数。此选项与 `partition_by` 和 `ttl` 冲突。如果同时设置，服务器将引发异常并退出。

示例：

```xml
<clickhouse>
    <query_log>
        <database>system</database>
        <table>query_log</table>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <ttl>event_date + INTERVAL 30 DAY DELETE</ttl>
        <!--
        <engine>ENGINE = MergeTree PARTITION BY toYYYYMM(event_date) ORDER BY (event_date, event_time) SETTINGS index_granularity = 1024</engine>
        -->
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_log>
</clickhouse>
```

默认情况下，表的增长是无限的。要控制表的大小，可以使用 [TTL](/sql-reference/statements/alter/ttl) 设置来删除过时的日志记录。此外，还可以使用 `MergeTree` 引擎表的分区功能。

## 系统指标的来源 {#system-tables-sources-of-system-metrics}

为收集系统指标，ClickHouse 服务器使用：

- `CAP_NET_ADMIN` 能力。
- [procfs](https://en.wikipedia.org/wiki/Procfs) （仅在 Linux 中）。

**procfs**

如果 ClickHouse 服务器没有 `CAP_NET_ADMIN` 能力，它会尝试回退到 `ProcfsMetricsProvider`。`ProcfsMetricsProvider` 允许收集每个查询的系统指标（用于 CPU 和 I/O）。

如果系统支持且启用了 procfs，ClickHouse 服务器会收集以下指标：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
在 5.14.x 开始的 Linux 内核中，`OSIOWaitMicroseconds` 默认是禁用的。
您可以使用 `sudo sysctl kernel.task_delayacct=1` 启用它，或者在 `/etc/sysctl.d/` 中创建一个 `.conf` 文件，内容为 `kernel.task_delayacct = 1`
:::

## ClickHouse Cloud 中的系统表 {#system-tables-in-clickhouse-cloud}

在 ClickHouse Cloud 中，系统表提供对服务状态和性能的关键见解，如同在自管理的部署中一样。一些系统表在集群级别操作，尤其是那些从 Keeper 节点获取其数据的系统表，这些节点管理分布式元数据。这些表反映集群的整体状态，并在对各个节点进行查询时应保持一致。例如，[`parts`](/operations/system-tables/parts) 的查询结果应无论从哪个节点查询都保持一致：

```sql
SELECT hostname(), count()
FROM system.parts
WHERE `table` = 'pypi'

┌─hostname()────────────────────┬─count()─┐
│ c-ecru-qn-34-server-vccsrty-0 │      26 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.005 sec.

SELECT
 hostname(),
    count()
FROM system.parts
WHERE `table` = 'pypi'

┌─hostname()────────────────────┬─count()─┐
│ c-ecru-qn-34-server-w59bfco-0 │      26 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.004 sec.
```

相反，其他系统表是节点特定的，例如使用 MergeTree 表引擎在内存中或持久化其数据。这种情况通常适用于日志和指标等数据。这种持久化确保历史数据可用于分析。然而，这些节点特定的表在每个节点上本质上是唯一的。

要全面查看整个集群，用户可以利用 [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 函数。此函数允许在 "default" 集群内跨所有副本查询系统表，将节点特定数据汇总为统一的结果。这种方法对于监控和调试集群级操作尤其有价值，确保用户能够有效分析 ClickHouse Cloud 部署的健康和性能。

:::note
ClickHouse Cloud 提供多个副本的集群以确保冗余和故障转移。这启用了动态自动扩展和零停机升级等功能。在某个时间点，新节点可能正在添加到集群中，或从集群中移除。要跳过这些节点，可以在使用 `clusterAllReplicas` 的查询中添加 `SETTINGS skip_unavailable_shards = 1`，如下所示。
:::

例如，考虑查询 `query_log` 表时的区别——这些表通常对分析很重要。

```sql
SELECT
    hostname() AS host,
    count()
FROM system.query_log
WHERE (event_time >= '2024-12-20 12:30:00') AND (event_time <= '2024-12-20 14:30:00')
GROUP BY host

┌─host──────────────────────────┬─count()─┐
│ c-ecru-oc-31-server-ectk72m-0 │   84132 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.010 sec. Processed 154.63 thousand rows, 618.55 KB (16.12 million rows/s., 64.49 MB/s.)


SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', system.query_log)
WHERE (event_time >= '2024-12-20 12:30:00') AND (event_time <= '2024-12-20 14:30:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-oc-31-server-ectk72m-0 │   84132 │
│ c-ecru-oc-31-server-myt0lr4-0 │   81473 │
│ c-ecru-oc-31-server-5mp9vn3-0 │   84292 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.309 sec. Processed 686.09 thousand rows, 2.74 MB (2.22 million rows/s., 8.88 MB/s.)
Peak memory usage: 6.07 MiB.
```

一般而言，在判断系统表是否为节点特定时，可以应用以下规则：

- 以 `_log` 结尾的系统表。
- 曝露度量的系统表，例如 `metrics`、`asynchronous_metrics`、`events`。
- 曝露正在进行的进程的系统表，例如 `processes`、`merges`。

## 相关内容 {#related-content}

- 博客: [系统表及其对 ClickHouse 内部的透视](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- 博客: [重要监控查询 - 第 1 部分 - INSERT 查询](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- 博客: [重要监控查询 - 第 2 部分 - SELECT 查询](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
