---
description: 'ClickHouse 采样查询分析器工具文档'
sidebar_label: '查询性能分析'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: '采样查询分析器'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# 采样查询分析器

ClickHouse 运行一个采样分析器，用于分析查询的执行情况。通过该分析器，您可以找到在查询执行期间被最频繁调用的源代码函数/例程。您可以跟踪 CPU 时间以及包括空闲时间在内的实际耗时（wall-clock time）。

在 ClickHouse Cloud 中，查询分析器会自动启用，您可以按如下方式运行一个示例查询：

:::note 如果您在 ClickHouse Cloud 中运行以下查询，请确保将 `FROM system.trace_log` 更改为 `FROM clusterAllReplicas(default, system.trace_log)`，以便从集群中所有节点读取数据
:::

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c' AND trace_type = 'CPU' AND event_date = today()
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
SETTINGS allow_introspection_functions = 1
```

在自托管部署中，要使用查询分析器（query profiler）：

* 配置服务器配置中的 [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) 部分。

  该部分用于配置 [trace&#95;log](/operations/system-tables/trace_log) 系统表，其中包含分析器运行的结果。默认情况下已启用该配置。请注意，此表中的数据仅对正在运行的服务器有效。服务器重启后，ClickHouse 不会清理该表，其中存储的所有虚拟内存地址都可能失效。

* 配置 [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) 或 [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns) 设置。这两个设置可以同时使用。

  这些设置用于配置分析器的计时器。由于它们是会话级设置，因此可以为整个服务器、单个用户或用户配置文件、交互式会话以及每条单独查询设置不同的采样频率。

默认采样频率为每秒采集一个样本，且 CPU 和 real 两种计时器均处于启用状态。该频率可以收集到足够的 ClickHouse 集群信息。同时，在该频率下工作时，分析器不会影响 ClickHouse 服务器的性能。如果需要对每条单独的查询进行分析，尝试使用更高的采样频率。

要分析 `trace_log` 系统表：

* 安装 `clickhouse-common-static-dbg` 软件包。参见 [从 DEB 软件包安装](../../getting-started/install/install.mdx)。

* 通过 [allow&#95;introspection&#95;functions](../../operations/settings/settings.md#allow_introspection_functions) 设置允许使用内省函数。

  出于安全原因，内省函数默认被禁用。

* 使用 `addressToLine`、`addressToLineWithInlines`、`addressToSymbol` 和 `demangle` 等[内省函数](../../sql-reference/functions/introspection.md)，以获取 ClickHouse 代码中的函数名及其位置。要获取某条查询的分析信息，需要对 `trace_log` 表中的数据进行聚合。可以按单个函数或整条堆栈跟踪进行聚合。

如果需要可视化 `trace_log` 信息，可尝试使用 [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) 和 [speedscope](https://github.com/laplab/clickhouse-speedscope)。


## 示例

在本示例中，我们将：

* 使用查询标识符和当前日期过滤 `trace_log` 数据。

* 按堆栈跟踪进行聚合。

* 使用自省函数生成一份报告，其中包括：

  * 符号名称及其对应的源代码函数。
  * 这些函数在源代码中的位置。

{/* */ }

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
