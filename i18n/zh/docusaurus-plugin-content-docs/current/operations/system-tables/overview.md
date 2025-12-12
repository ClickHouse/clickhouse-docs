---
description: '系统表的概念简介及其用途。'
keywords: ['系统表', '概述']
sidebar_label: '概述'
sidebar_position: 52
slug: /operations/system-tables/overview
title: '系统表概述'
doc_type: 'reference'
---

## 系统表概览 {#system-tables-introduction}

系统表提供以下信息：

* 服务器状态、进程和环境。
* 服务器的内部进程。
* 构建 ClickHouse 二进制文件时使用的选项。

系统表：

* 位于 `system` 数据库中。
* 仅可用于读取数据。
* 无法被 DROP 或 ALTER，但可以被 DETACH。

大多数系统表将数据存储在内存（RAM）中。ClickHouse 服务器在启动时会创建这些系统表。

与其他系统表不同，系统日志表 [metric&#95;log](../../operations/system-tables/metric_log.md)、[query&#95;log](../../operations/system-tables/query_log.md)、[query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md)、[trace&#95;log](../../operations/system-tables/trace_log.md)、[part&#95;log](../../operations/system-tables/part_log.md)、[crash&#95;log](../../operations/system-tables/crash_log.md)、[text&#95;log](../../operations/system-tables/text_log.md) 和 [backup&#95;log](../../operations/system-tables/backup_log.md) 由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表引擎驱动，并默认将数据存储在文件系统中。如果从文件系统中删除了一张表，ClickHouse 服务器会在下一次写入数据时重新创建一个空表。如果在新版本中系统表的表结构发生变化，ClickHouse 会重命名当前表并创建一个新表。

可以通过在 `/etc/clickhouse-server/config.d/` 下创建与表同名的配置文件，或者在 `/etc/clickhouse-server/config.xml` 中设置相应的元素，来自定义系统日志表。可自定义的元素包括：

* `database`：系统日志表所属的数据库。该选项目前已废弃。所有系统日志表都位于 `system` 数据库下。
* `table`：用于插入数据的表。
* `partition_by`：指定 [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 表达式。
* `ttl`：指定表的 [TTL](../../sql-reference/statements/alter/ttl.md) 表达式。
* `flush_interval_milliseconds`：将数据刷新到磁盘的时间间隔。
* `engine`：提供带参数的完整引擎表达式（以 `ENGINE =` 开头）。该选项与 `partition_by` 和 `ttl` 冲突。如果同时设置，服务器会抛出异常并退出。

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

默认情况下，表的大小不设上限。要控制表的大小，可以使用 [TTL](/sql-reference/statements/alter/ttl) 设置来删除过期的日志记录，还可以使用 `MergeTree` 引擎表的分区功能。

## 系统指标的来源 {#system-tables-sources-of-system-metrics}

为了收集系统指标，ClickHouse 服务器会使用：

- `CAP_NET_ADMIN` 能力。
- [procfs](https://en.wikipedia.org/wiki/Procfs)（仅限 Linux）。

**procfs**

如果 ClickHouse 服务器不具备 `CAP_NET_ADMIN` 能力，它会尝试回退到使用 `ProcfsMetricsProvider`。`ProcfsMetricsProvider` 允许按查询粒度收集系统指标（用于 CPU 和 I/O）。

如果系统支持并启用了 procfs，ClickHouse 服务器会收集以下指标：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
在 Linux 内核 5.14.x 及之后的版本中，`OSIOWaitMicroseconds` 默认被禁用。
可以通过执行 `sudo sysctl kernel.task_delayacct=1` 来启用它，或者在 `/etc/sysctl.d/` 中创建一个 `.conf` 文件，并写入 `kernel.task_delayacct = 1`。
:::

## ClickHouse Cloud 中的 system 表 {#system-tables-in-clickhouse-cloud}

在 ClickHouse Cloud 中，system 表与在自托管部署中一样，为服务的状态和性能提供关键洞察。一些 system 表在整个集群范围内生效，尤其是那些从 Keeper 节点获取数据的表，这些节点负责管理分布式元数据。这些表反映了整个集群的状态，并且在各个节点上查询时其结果应当保持一致。例如，[`parts`](/operations/system-tables/parts) 在从任意节点查询时都应该是一致的：

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

相反，其他一些 system 表是特定于节点的，例如仅存储在内存中，或使用 MergeTree 表引擎持久化其数据。这类用法通常适用于日志和指标等数据。这种持久化确保历史数据始终可用于分析。然而，这些特定于节点的表在每个节点上都是彼此独立的。

一般来说，在判断一个 system 表是否为特定于节点时，可以应用以下规则：

* 带有 `_log` 后缀的 system 表。
* 提供指标的 system 表，例如 `metrics`、`asynchronous_metrics`、`events`。
* 提供正在运行的进程信息的 system 表，例如 `processes`、`merges`。

此外，由于升级或其 schema 的更改，可能会创建 system 表的新版本。这些版本通过数字后缀进行命名。

例如，以 `system.query_log` 表为例，它包含节点上执行的每个查询的一行记录：

```sql
SHOW TABLES FROM system LIKE 'query_log%'

┌─name─────────┐
│ query_log    │
│ query_log_1  │
│ query_log_10 │
│ query_log_2  │
│ query_log_3  │
│ query_log_4  │
│ query_log_5  │
│ query_log_6  │
│ query_log_7  │
│ query_log_8  │
│ query_log_9  │
└──────────────┘

11 行结果，耗时 0.004 秒。
```

### 跨多个版本查询 {#querying-multiple-versions}

我们可以使用 [`merge`](/sql-reference/table-functions/merge) 函数对这些表进行跨表查询。例如，下面的查询会在每个 `query_log` 表中找出发送到目标节点的最新一次查询：

```sql
SELECT
    _table,
    max(event_time) AS most_recent
FROM merge('system', '^query_log')
GROUP BY _table
ORDER BY most_recent DESC

┌─_table───────┬─────────most_recent─┐
│ query_log    │ 2025-04-13 10:59:29 │
│ query_log_1  │ 2025-04-09 12:34:46 │
│ query_log_2  │ 2025-04-09 12:33:45 │
│ query_log_3  │ 2025-04-07 17:10:34 │
│ query_log_5  │ 2025-03-24 09:39:39 │
│ query_log_4  │ 2025-03-24 09:38:58 │
│ query_log_6  │ 2025-03-19 16:07:41 │
│ query_log_7  │ 2025-03-18 17:01:07 │
│ query_log_8  │ 2025-03-18 14:36:07 │
│ query_log_10 │ 2025-03-18 14:01:33 │
│ query_log_9  │ 2025-03-18 14:01:32 │
└──────────────┴─────────────────────┘
```

11 行数据。耗时：0.373 秒。已处理 644 万行，25.77 MB（每秒 1,729 万行，69.17 MB/s）。
峰值内存使用：28.45 MiB。

````

:::note 不要依赖数字后缀来确定顺序
虽然表上的数字后缀可以暗示数据的顺序,但绝不应依赖它。因此,在查询特定日期范围时,应始终使用 merge 表函数结合日期过滤器。
:::

重要的是,这些表仍然是**每个节点的本地表**。

### 跨节点查询                          {#querying-across-nodes}

要全面查看整个集群,用户可以结合使用 [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 函数和 `merge` 函数。`clusterAllReplicas` 函数允许在"default"集群内的所有副本上查询系统表,将各节点的数据整合为统一的结果。与 `merge` 函数结合使用时,可以查询集群中特定表的所有系统数据。 

这种方法对于监控和调试集群范围的操作特别有价值,确保用户能够有效分析其 ClickHouse Cloud 部署的健康状况和性能。

:::note
ClickHouse Cloud 提供多副本集群以实现冗余和故障转移。这使其能够实现动态自动扩展和零停机升级等功能。在某个特定时刻,新节点可能正在添加到集群或从集群中移除。要跳过这些节点,请在使用 `clusterAllReplicas` 的查询中添加 `SETTINGS skip_unavailable_shards = 1`,如下所示。
:::

例如,考虑查询 `query_log` 表时的差异——该表通常对分析至关重要。

```sql
SELECT
    hostname() AS host,
    count()
FROM system.query_log
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.010 sec. Processed 17.87 thousand rows, 71.51 KB (1.75 million rows/s., 7.01 MB/s.)

SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', system.query_log)
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
│ c-ecru-qn-34-server-6em4y4t-0 │  656029 │
│ c-ecru-qn-34-server-iejrkg0-0 │  641155 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.026 sec. Processed 1.97 million rows, 7.88 MB (75.51 million rows/s., 302.05 MB/s.)
````

### 跨节点和版本查询 {#querying-across-nodes-and-versions}

由于系统表存在版本控制，这仍然无法反映集群中的完整数据。将上述方法与 `merge` 函数结合使用后，我们就能在指定日期范围内获得精确结果：

```sql
SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', merge('system', '^query_log'))
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │ 3008000 │
│ c-ecru-qn-34-server-6em4y4t-0 │ 3659443 │
│ c-ecru-qn-34-server-iejrkg0-0 │ 1078287 │
└───────────────────────────────┴─────────┘
```

3 行数据。耗时：0.462 秒。已处理 7.94 百万行，31.75 MB（17.17 百万行/秒，68.67 MB/秒）。

```
```

## 相关内容 {#related-content}

- 博客：[系统表：窥探 ClickHouse 内部机制的窗口](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- 博客：[核心监控查询 - 第 1 部分 - INSERT 查询](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- 博客：[核心监控查询 - 第 2 部分 - SELECT 查询](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
