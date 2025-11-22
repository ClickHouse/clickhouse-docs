---
description: 'ClickHouse 采样查询分析器工具文档'
sidebar_label: '查询分析'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: '采样查询分析器'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# 采样查询分析器

ClickHouse 运行采样分析器，用于分析查询执行情况。借助该分析器，你可以找出在查询执行过程中被最频繁调用的源代码例程。你可以跟踪 CPU 时间和墙钟时间的消耗，包括空闲时间。

查询分析器在 ClickHouse Cloud 中会自动启用，你可以按如下方式运行示例查询：

:::note 如果你在 ClickHouse Cloud 中运行以下查询，请确保将 `FROM system.trace_log` 修改为 `FROM clusterAllReplicas(default, system.trace_log)`，以便从集群的所有节点读取数据
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

* 配置服务端配置文件中的 [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) 部分。

  此部分用于配置系统表 [trace&#95;log](/operations/system-tables/trace_log)，该表包含分析器运行的结果。默认已配置。请注意，此表中的数据仅对正在运行的服务器有效。服务器重启后，ClickHouse 不会清理该表，所有已存储的虚拟内存地址都可能变为无效。

* 配置 [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) 或 [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns) 设置。两项设置可以同时使用。

  这些设置用于配置分析器的定时器。由于它们是会话级别的设置，你可以为整个服务器、单个用户或用户配置文件、交互式会话以及每个单独查询设置不同的采样频率。

默认采样频率为每秒一次，同时启用 CPU 与真实时间定时器。此频率可以收集到足够的 ClickHouse 集群相关信息。同时，在该频率下运行时，分析器不会影响 ClickHouse 服务器的性能。如果你需要对每个单独查询进行分析，请尝试使用更高的采样频率。

要分析 `trace_log` 系统表：

* 安装 `clickhouse-common-static-dbg` 软件包。参见 [Install from DEB Packages](../../getting-started/install/install.mdx)。

* 通过 [allow&#95;introspection&#95;functions](../../operations/settings/settings.md#allow_introspection_functions) 设置允许使用自省函数。

  出于安全原因，自省函数在默认情况下是禁用的。

* 使用 `addressToLine`、`addressToLineWithInlines`、`addressToSymbol` 和 `demangle` 等[自省函数](../../sql-reference/functions/introspection.md)，以获取函数名称及其在 ClickHouse 代码中的位置。要获得某个查询的分析结果，需要对 `trace_log` 表中的数据进行聚合。你可以按单个函数或按整个堆栈跟踪进行聚合。

如果需要可视化 `trace_log` 信息，可尝试使用 [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) 和 [speedscope](https://github.com/laplab/clickhouse-speedscope)。


## 示例 {#example}

在此示例中,我们将:

- 按查询标识符和当前日期过滤 `trace_log` 数据。

- 按堆栈跟踪进行聚合。

- 使用内省函数获取以下报告:
  - 符号名称及其对应的源代码函数。
  - 这些函数的源代码位置。

<!-- -->

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
