---
'description': '系统表是什么以及它们为何有用的概述。'
'keywords':
- 'system tables'
- 'overview'
'sidebar_label': '概述'
'sidebar_position': 52
'slug': '/operations/system-tables/overview'
'title': '系统表概述'
---



## 系统表概述 {#system-tables-introduction}

系统表提供以下信息：

- 服务器状态、进程和环境。
- 服务器的内部进程。
- ClickHouse 二进制文件构建时使用的选项。

系统表：

- 位于 `system` 数据库中。
- 仅可用于读取数据。
- 不能被删除或更改，但可以被分离。

大多数系统表将数据存储在 RAM 中。ClickHouse 服务器在启动时创建这些系统表。

与其他系统表不同，系统日志表 [metric_log](../../operations/system-tables/metric_log.md)、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[trace_log](../../operations/system-tables/trace_log.md)、[part_log](../../operations/system-tables/part_log.md)、[crash_log](../../operations/system-tables/crash-log.md)、[text_log](../../operations/system-tables/text_log.md) 和 [backup_log](../../operations/system-tables/backup_log.md) 由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表引擎提供服务，并默认将其数据存储在文件系统中。如果您从文件系统中删除一个表，ClickHouse 服务器将在下次写入数据时再次创建空表。如果在新版本中系统表架构发生了变化，则 ClickHouse 会重命名当前表并创建一个新表。

系统日志表可以通过在 `/etc/clickhouse-server/config.d/` 下创建与表同名的配置文件，或在 `/etc/clickhouse-server/config.xml` 中设置相应元素进行自定义。可以自定义的元素包括：

- `database`: 系统日志表所属的数据库。此选项现已弃用。所有系统日志表均位于数据库 `system` 下。
- `table`: 插入数据的表。
- `partition_by`: 指定 [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 表达式。
- `ttl`: 指定表的 [TTL](../../sql-reference/statements/alter/ttl.md) 表达式。
- `flush_interval_milliseconds`: 刷新数据到磁盘的时间间隔。
- `engine`: 提供完整的引擎表达式（以 `ENGINE =` 开头），并带有参数。此选项与 `partition_by` 和 `ttl` 冲突。如果同时设置，服务器将引发异常并退出。

示例如下：

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

默认情况下，表的增长是无限制的。要控制表的大小，可以使用 [TTL](/sql-reference/statements/alter/ttl) 设置以删除过时的日志记录。此外，您还可以使用 `MergeTree` 引擎表的分区功能。

## 系统指标来源 {#system-tables-sources-of-system-metrics}

ClickHouse 服务器用于收集系统指标的方式有：

- `CAP_NET_ADMIN` 权限。
- [procfs](https://en.wikipedia.org/wiki/Procfs)（仅在 Linux 上）。

**procfs**

如果 ClickHouse 服务器没有 `CAP_NET_ADMIN` 权限，它会尝试回退到 `ProcfsMetricsProvider`。`ProcfsMetricsProvider` 允许收集每个查询的系统指标（对于 CPU 和 I/O）。

如果系统支持并启用了 procfs，ClickHouse 服务器则会收集这些指标：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
在从 5.14.x 开始的 Linux 内核中，`OSIOWaitMicroseconds` 默认是禁用的。
您可以通过 `sudo sysctl kernel.task_delayacct=1` 或在 `/etc/sysctl.d/` 下创建 `.conf` 文件并设置 `kernel.task_delayacct = 1` 来启用它。
:::

## ClickHouse Cloud 中的系统表 {#system-tables-in-clickhouse-cloud}

在 ClickHouse Cloud 中，系统表提供了对服务状态和性能的重要见解，功能与自管理部署中的表现相同。一些系统表在集群级别操作，特别是那些从管理分布式元数据的 Keeper 节点获取数据的表。这些表反映了集群的整体状态，在对单个节点进行查询时应保持一致。例如，[`parts`](/operations/system-tables/parts) 表应在任何查询的节点上保持一致：

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

相反，其他系统表是特定于节点的，例如在内存中或使用 MergeTree 表引擎持久化其数据。这对于如日志和指标等数据是典型的。这种持久性确保历史数据可用于分析。然而，这些特定于节点的表各自是独特的。

通常，在确定系统表是否特定于节点时，可以应用以下规则：

- 具有 `_log` 后缀的系统表。
- 暴露指标的系统表，例如 `metrics`、`asynchronous_metrics`、`events`。
- 暴露正在进行的进程的系统表，例如 `processes`、`merges`。

此外，系统表的新版本可能是由于升级或架构更改而创建的。这些版本通过数值后缀命名。

例如，考虑 `system.query_log` 表，它为每个由节点执行的查询包含一行：

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

11 rows in set. Elapsed: 0.004 sec.
```

### 查询多个版本 {#querying-multiple-versions}

我们可以使用 [`merge`](/sql-reference/table-functions/merge) 函数跨这些表进行查询。例如，下面的查询识别每个 `query_log` 表中针对目标节点发布的最新查询：

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

11 rows in set. Elapsed: 0.373 sec. Processed 6.44 million rows, 25.77 MB (17.29 million rows/s., 69.17 MB/s.)
Peak memory usage: 28.45 MiB.
```

:::note 不要依赖数值后缀进行排序
虽然表上的数值后缀可以暗示数据的顺序，但它绝不能被依赖。因此，在针对特定日期范围时，请始终使用合并表函数结合日期筛选。
:::

重要的是，这些表依然是 **每个节点本地** 的。

### 跨节点查询 {#querying-across-nodes}

为了全面查看整个集群，用户可以利用 [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 函数与 `merge` 函数相结合。`clusterAllReplicas` 函数允许在 "default" 集群的所有副本中查询系统表，将特定于节点的数据整合到一个统一结果中。当与 `merge` 函数结合使用时，这可以用于针对集群中特定表的所有系统数据。

这种方法对于监控和调试集群范围内的操作特别有价值，确保用户可以有效分析其 ClickHouse Cloud 部署的健康和性能。

:::note
ClickHouse Cloud 提供多个副本的集群以实现冗余和故障转移。这启用了其功能，例如动态自动缩放和零停机升级。在某一时刻，新的节点可能正在被添加到集群中或从集群中移除。要跳过这些节点，请在使用 `clusterAllReplicas` 的查询中添加 `SETTINGS skip_unavailable_shards = 1`，如下所示。
:::

例如，考虑在查询 `query_log` 表时的差异 - 这通常对分析至关重要。

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
```

### 跨节点和版本查询 {#querying-across-nodes-and-versions}

由于系统表版本控制，这仍未代表集群中的完整数据。当将上述与 `merge` 函数结合使用时，我们获得了针对我们的日期范围的准确结果：

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

3 rows in set. Elapsed: 0.462 sec. Processed 7.94 million rows, 31.75 MB (17.17 million rows/s., 68.67 MB/s.)
```

## 相关内容 {#related-content}

- 博客: [系统表与 ClickHouse 内部的窗口](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- 博客: [重要的监控查询 - 第 1 部分 - INSERT 查询](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- 博客: [重要的监控查询 - 第 2 部分 - SELECT 查询](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
