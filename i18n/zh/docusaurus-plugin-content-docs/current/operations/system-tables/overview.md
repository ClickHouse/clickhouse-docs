## 系统表概述 {#system-tables-introduction}

系统表提供以下信息：

- 服务器状态、进程和环境。
- 服务器的内部进程。
- 构建 ClickHouse 二进制文件时使用的选项。

系统表：

- 位于 `system` 数据库中。
- 仅供读取数据。
- 不能被删除或修改，但可以被分离。

大多数系统表的数据存储在 RAM 中。ClickHouse 服务器在启动时创建这些系统表。

与其他系统表不同，系统日志表 [metric_log](../../operations/system-tables/metric_log.md)、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[trace_log](../../operations/system-tables/trace_log.md)、[part_log](../../operations/system-tables/part_log.md)、[crash_log](../../operations/system-tables/crash-log.md)、[text_log](../../operations/system-tables/text_log.md) 和 [backup_log](../../operations/system-tables/backup_log.md) 由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表引擎提供，并默认将其数据存储在文件系统中。如果从文件系统中删除一个表，ClickHouse 服务器将在下次写入数据时再次创建空表。如果系统表的模式在新版本中发生变化，ClickHouse 将重命名当前表并创建一个新表。

系统日志表可以通过在 `/etc/clickhouse-server/config.d/` 下创建与表同名的配置文件，或在 `/etc/clickhouse-server/config.xml` 中设置相应元素进行自定义。可以自定义的元素包括：

- `database`：系统日志表所属的数据库。此选项现已弃用。所有系统日志表均位于 `system` 数据库下。
- `table`：插入数据的表。
- `partition_by`：指定 [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 表达式。
- `ttl`：指定表 [TTL](../../sql-reference/statements/alter/ttl.md) 表达式。
- `flush_interval_milliseconds`：将数据刷新到磁盘的间隔。
- `engine`：提供完整的引擎表达式（以 `ENGINE =` 开头）及参数。此选项与 `partition_by` 和 `ttl` 冲突。如果同时设置，服务器将引发异常并退出。

一个示例：

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

默认情况下，表的增长是没有限制的。要控制表的大小，可以使用 [TTL](/sql-reference/statements/alter/ttl) 设置来移除过时的日志记录。也可以使用 `MergeTree` 引擎表的分区功能。

## 系统指标来源 {#system-tables-sources-of-system-metrics}

为了收集系统指标，ClickHouse 服务器使用：

- `CAP_NET_ADMIN` 能力。
- [procfs](https://en.wikipedia.org/wiki/Procfs)（仅在 Linux 上）。

**procfs**

如果 ClickHouse 服务器没有 `CAP_NET_ADMIN` 能力，则尝试回退到 `ProcfsMetricsProvider`。`ProcfsMetricsProvider` 允许收集每个查询的系统指标（针对 CPU 和 I/O）。

如果系统支持并启用 procfs，ClickHouse 服务器将收集以下指标：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` 在从 5.14.x 开始的 Linux 内核中默认禁用。您可以通过 `sudo sysctl kernel.task_delayacct=1` 启用它，或者在 `/etc/sysctl.d/` 中创建一个 `.conf` 文件，内容为 `kernel.task_delayacct = 1`。
:::

## ClickHouse Cloud 中的系统表 {#system-tables-in-clickhouse-cloud}

在 ClickHouse Cloud 中，系统表提供对服务状态和性能的关键见解，就像在自管理部署中一样。一些系统表在集群级别运行，特别是那些从管理分布式元数据的 Keeper 节点获取其数据的表。这些表反映了集群的整体状态，在单个节点查询时应保持一致。例如，[`parts`](/operations/system-tables/parts) 表在查询时应该是一致的，不管是从哪个节点查询：

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

相反，其他系统表是特定于节点的，例如在内存中或使用 MergeTree 表引擎持久化它们的数据。这是日志和指标等数据的典型情况。这种持久性确保历史数据可供分析。然而，这些特定于节点的表在本质上对每个节点都是唯一的。

通常，在确定系统表是否特定于节点时，可以应用以下规则：

- 后缀为 `_log` 的系统表。
- 暴露指标的系统表，例如 `metrics`、`asynchronous_metrics`、`events`。
- 暴露正在进行的进程的系统表，例如 `processes`、`merges`。

此外，新的系统表版本可能会由于升级或模式更改而创建。这些版本使用数字后缀命名。

例如，考虑 `system.query_log` 表，其中包含节点执行的每个查询的一行：

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

我们可以使用 [`merge`](/sql-reference/table-functions/merge) 函数跨这些表进行查询。例如，以下查询识别每个 `query_log` 表中向目标节点发出的最新查询：

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

:::note 不要依赖数字后缀进行排序
虽然表的数字后缀可以暗示数据的顺序，但决不能依赖它。因此，始终结合日期过滤器使用合并表函数以针对特定日期范围。
:::

重要的是，这些表仍然是 **每个节点本地的**。

### 跨节点查询 {#querying-across-nodes}

为了全面查看整个集群，用户可以利用 [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 函数，结合 `merge` 函数。`clusterAllReplicas` 函数允许在 "default" 集群中的所有副本之间查询系统表，将特定于节点的数据汇总为统一结果。结合 `merge` 函数，可以用于在集群中针对特定表的所有系统数据。

这种方法对于监控和调试集群范围的操作特别有价值，确保用户能够有效分析其 ClickHouse Cloud 部署的健康状况和性能。

:::note
ClickHouse Cloud 提供多个副本的集群以实现冗余和故障转移。这启用其功能，例如动态自动扩展和零停机时间升级。在某一时刻，新节点可能正在添加到集群或从集群中删除。要跳过这些节点，请在使用 `clusterAllReplicas` 的查询中添加 `SETTINGS skip_unavailable_shards = 1`，如下所示。
:::

例如，考虑在查询 `query_log` 表时的区别——往往对分析至关重要。

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

### 跨节点和版本的查询 {#querying-across-nodes-and-versions}

由于系统表版本控制，这仍然不能表示集群中的完整数据。当将上述内容与 `merge` 函数结合使用时，我们在所选日期范围内获得准确的结果：

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

- 博客：[系统表和 ClickHouse 内部窗口](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- 博客：[基本监控查询 - 第 1 部分 - 插入查询](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- 博客：[基本监控查询 - 第 2 部分 - 查询](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
