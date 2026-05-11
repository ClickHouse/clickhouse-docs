---
description: 'ClickHouse 采样查询分析器工具文档'
sidebar_label: '查询性能分析'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: '采样查询分析器'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 采样查询分析器 \{#sampling-query-profiler\}

ClickHouse 运行采样分析器，可用于分析查询执行情况。
使用该分析器，您可以找出查询执行期间最常使用的源代码例程。
您可以跟踪所消耗的 CPU 时间和实际经过时间，包括空闲时间。

查询分析器在 ClickHouse Cloud 中默认自动启用。
以下示例查询会查找已分析查询中最常见的堆栈跟踪，并解析出函数名称和源代码位置：

:::tip
请将 `query_id` 的值替换为您要分析的查询 ID。
:::

<Tabs groupId="deployment">
  <TabItem value="cloud" label="ClickHouse Cloud">
    在 ClickHouse Cloud 中，您可以点击查询结果表上方栏最右侧的 **&quot;...&quot;** (位于表格/图表切换开关旁边) 来获取查询 ID。这会打开一个上下文菜单，您可以点击 **&quot;Copy query ID&quot;**。

    使用 `clusterAllReplicas(default, system.trace_log)` 从集群的所有节点中查询：

    ```sql
    SELECT
        count(),
        arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
    FROM clusterAllReplicas(default, system.trace_log)
    WHERE query_id = '<query_id>' AND trace_type = 'CPU' AND event_date = today()
    GROUP BY trace
    ORDER BY count() DESC
    LIMIT 10
    SETTINGS allow_introspection_functions = 1
    ```
  </TabItem>

  <TabItem value="self-managed" label="自管理">
    ```sql
    SELECT
        count(),
        arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'CPU' AND event_date = today()
    GROUP BY trace
    ORDER BY count() DESC
    LIMIT 10
    SETTINGS allow_introspection_functions = 1
    ```
  </TabItem>
</Tabs>

## 在自管理部署中使用查询分析器 \{#self-managed-query-profiler\}

在自管理部署中，要使用查询分析器，请按以下步骤操作：

<VerticalStepper headerLevel="h3">
  ### 安装带调试信息的 ClickHouse \{#debug-info\}

  安装 `clickhouse-common-static-dbg` 软件包：

  1. 按照步骤[“搭建 Debian 代码仓库”](/install/debian_ubuntu#setup-the-debian-repository)中的说明操作
  2. 运行 `sudo apt-get install clickhouse-server clickhouse-client clickhouse-common-static-dbg`，安装包含调试信息的 ClickHouse 编译二进制文件
  3. 运行 `sudo service clickhouse-server start` 启动服务器
  4. 运行 `clickhouse-client`。`clickhouse-common-static-dbg` 中的调试符号会被服务器自动识别，您无需执行任何额外操作来启用它们

  ### 检查服务器配置 \{#server-config\}

  确保您的[服务器配置文件](/operations/configuration-files)中已配置 [`trace_log`](../../operations/server-configuration-parameters/settings.md#trace_log) 部分。默认情况下，它是启用的：

  ```xml
  <!-- Trace 日志。存储由查询分析器收集的堆栈跟踪。
       请参见 query_profiler_real_time_period_ns 和 query_profiler_cpu_time_period_ns 设置。 -->
  <trace_log>
      <database>system</database>
      <table>trace_log</table>

      <partition_by>toYYYYMM(event_date)</partition_by>
      <flush_interval_milliseconds>7500</flush_interval_milliseconds>
      <max_size_rows>1048576</max_size_rows>
      <reserved_size_rows>8192</reserved_size_rows>
      <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
      <!-- 指示在发生崩溃时是否应将日志写入磁盘 -->
      <flush_on_crash>false</flush_on_crash>
      <symbolize>true</symbolize>
  </trace_log>
  ```

  此部分配置了 [trace&#95;log](/operations/system-tables/trace_log) 系统表，其中包含分析器运行产生的结果。
  请注意，此表中的数据仅对正在运行的服务器有效。
  服务器重启后，ClickHouse 不会清理该表，因此其中存储的所有虚拟内存地址都可能失效。

  ### 配置分析器计时器 \{#configure-profile-timers\}

  设置 [`query_profiler_cpu_time_period_ns`](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) 或 [`query_profiler_real_time_period_ns`](../../operations/settings/settings.md#query_profiler_real_time_period_ns)。
  这两个设置可以同时使用。

  这些设置可用于配置分析器计时器。
  由于它们是会话级设置，您可以为整个服务器、单个用户或用户 profile、当前交互式会话以及每个单独的查询设置不同的采样频率。

  默认采样频率为每秒一个样本，并且 CPU 和实时时钟计时器均已启用。
  该频率既能为您的 ClickHouse 集群收集足够的信息，又不会影响服务器性能。
  如果您需要分析每个单独的查询，请使用更高的采样频率。

  ### 分析 `trace_log` 系统表 \{#analyze-trace-log-system-table\}

  要分析 `trace_log` 系统表，请通过 [`allow_introspection_functions`](../../operations/settings/settings.md#allow_introspection_functions) 设置启用自省函数：

  ```sql
  SET allow_introspection_functions=1
  ```

  :::note
  出于安全原因，自省函数默认处于禁用状态
  :::

  使用 `addressToLine`、`addressToLineWithInlines`、`addressToSymbol` 和 `demangle` [自省函数](../../sql-reference/functions/introspection.md) 获取函数名称及其在 ClickHouse 代码中的位置。
  要获取某个查询的 profile，您需要聚合 `trace_log` 表中的数据。
  您可以按单个函数或整个堆栈跟踪聚合数据。

  :::tip
  如果您需要将 `trace_log` 信息可视化，可尝试使用 [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) 和 [speedscope](https://www.speedscope.app)。
  :::
</VerticalStepper>

## 使用 `flameGraph` 函数构建火焰图 \{#flamegraph\}

ClickHouse 提供了聚合函数 [`flameGraph`](/sql-reference/aggregate-functions/reference/flame_graph)，可直接从存储在 `trace_log` 中的堆栈跟踪生成火焰图。
输出为字符串数组，格式与 [flamegraph.pl](https://github.com/brendangregg/FlameGraph) 兼容。

**语法：**

```sql
flameGraph(traces, [size = 1], [ptr = 0])
```

**参数：**

* `traces` — 调用栈。[`Array(UInt64)`](/sql-reference/data-types/array)。
* `size` — 内存性能分析中的分配大小。[`Int64`](/sql-reference/data-types/int-uint)。
* `ptr` — 分配地址。[`UInt64`](/sql-reference/data-types/int-uint)。

当 `ptr` 非零时，`flameGraph` 会将大小和指针相同的内存分配 (`size > 0`) 与释放 (`size < 0`) 对应起来。
只显示尚未释放的分配。
未匹配的释放会被忽略。

### CPU 火焰图 \{#cpu-flame-graph\}

:::note
以下查询要求您已安装 [flamegraph.pl](https://github.com/brendangregg/FlameGraph)。

您可以运行以下命令进行安装：

```bash
git clone https://github.com/brendangregg/FlameGraph
# Then use it as:
# ~/FlameGraph/flamegraph.pl
```

将以下查询中的 `flamegraph.pl` 替换为你本机上 `flamegraph.pl` 所在的路径
:::

```sql
SET query_profiler_cpu_time_period_ns = 10000000;
```

运行查询，然后生成火焰图：

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(arrayReverse(trace)))
        FROM system.trace_log
        WHERE trace_type = 'CPU' AND query_id = '<query_id>'" \
    | flamegraph.pl > flame_cpu.svg
```

### 内存火焰图——所有内存分配 \{#memory-flame-graph-all\}

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1;
```

运行查询，然后生成火焰图：

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size))
        FROM system.trace_log
        WHERE trace_type = 'MemorySample' AND query_id = '<query_id>'" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### 内存火焰图 — 未释放的分配 \{#memory-flame-graph-unfreed\}

此变体会按指针对分配和释放进行匹配，并且仅显示查询期间未释放的内存。

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1,
    use_uncompressed_cache = 1,
    merge_tree_max_rows_to_use_cache = 100000000000,
    merge_tree_max_bytes_to_use_cache = 1000000000000;
```

运行以下查询，生成火焰图：

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size, ptr))
        FROM system.trace_log
        WHERE trace_type = 'MemorySample' AND query_id = '<query_id>'" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_unfreed.svg
```

### 内存火焰图——某一时刻的活跃分配 \{#memory-flame-graph-time-point\}

这种方法可帮助你找出峰值内存占用，并将该时刻分配的内容可视化出来。

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1;
```

#### 查看一段时间内的内存使用情况 \{#find-memory-usage-over-time\}

```sql
SELECT
    event_time,
    formatReadableSize(max(s)) AS m
FROM (
    SELECT
        event_time,
        sum(size) OVER (ORDER BY event_time) AS s
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'MemorySample'
)
GROUP BY event_time
ORDER BY event_time;
```

#### 找到内存使用量最高的时间点 \{#find-time-point-maximum-memory-usage\}

```sql
SELECT
    argMax(event_time, s),
    max(s)
FROM (
    SELECT
        event_time,
        sum(size) OVER (ORDER BY event_time) AS s
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'MemorySample'
);
```

#### 构建该时刻活跃分配的火焰图 \{#build-flame-graph\}

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size, ptr))
        FROM (
            SELECT * FROM system.trace_log
            WHERE trace_type = 'MemorySample'
              AND query_id = '<query_id>'
              AND event_time <= '<time_point>'
            ORDER BY event_time
        )" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

#### 构建该时间点之后内存释放操作的火焰图 (用于了解随后释放了哪些内存) \{#build-flame-graph-deallocations\}

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, -size, ptr))
        FROM (
            SELECT * FROM system.trace_log
            WHERE trace_type = 'MemorySample'
              AND query_id = '<query_id>'
              AND event_time > '<time_point>'
            ORDER BY event_time DESC
        )" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```

## 示例 \{#example\}

下面的代码片段：

* 使用查询标识符和当前日期过滤 `trace_log` 数据。
* 按堆栈跟踪进行聚合。
* 使用自省函数生成一份报告，其中包括：
  * 符号名称及其对应的源代码函数。
  * 这些函数在源代码中的位置。

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = '<query_id>') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
