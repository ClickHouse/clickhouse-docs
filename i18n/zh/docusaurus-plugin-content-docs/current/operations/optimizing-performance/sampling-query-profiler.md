---
'description': 'ClickHouse 中抽样查询分析器工具的文档'
'sidebar_label': '查询分析'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/sampling-query-profiler'
'title': '抽样查询分析器'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 采样查询分析器

ClickHouse 运行采样分析器，允许分析查询执行。使用分析器，您可以找到在查询执行期间使用最频繁的源代码例程。您可以跟踪 CPU 时间和包括空闲时间在内的实际经过时间。

查询分析器在 ClickHouse Cloud 中自动启用，您可以按如下方式运行示例查询

:::note 如果您在 ClickHouse Cloud 中运行以下查询，请确保将 `FROM system.trace_log` 更改为 `FROM clusterAllReplicas(default, system.trace_log)` 以从集群的所有节点选择
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

在自管理部署中，要使用查询分析器：

- 设置服务器配置的 [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) 部分。

    该部分配置了包含分析器功能结果的 [trace_log](/operations/system-tables/trace_log) 系统表。它默认配置。请记住，该表中的数据仅对运行中的服务器有效。服务器重启后，ClickHouse 不会清理该表，所有存储的虚拟内存地址可能会变得无效。

- 设置 [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) 或 [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns) 设置。这两个设置可以同时使用。

    这些设置允许您配置分析器定时器。由于这些是会话设置，您可以获得整个服务器、单个用户或用户配置文件、交互会话和每个单独查询的不同采样频率。

默认的采样频率为每秒一个样本，同时启用 CPU 和实际定时器。该频率可以收集关于 ClickHouse 集群的足够信息。同时，使用该频率时，分析器不会影响 ClickHouse 服务器的性能。如果您需要分析每个单独的查询，建议使用更高的采样频率。

要分析 `trace_log` 系统表：

- 安装 `clickhouse-common-static-dbg` 包。请参见 [从 DEB 包安装](../../getting-started/install/install.mdx)。

- 通过 [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions) 设置允许内省函数。

    出于安全原因，内省函数默认是禁用的。

- 使用 `addressToLine`、`addressToLineWithInlines`、`addressToSymbol` 和 `demangle` [内省函数](../../sql-reference/functions/introspection.md) 获取 ClickHouse 代码中的函数名称及其位置。要获取某个查询的分析结果，您需要从 `trace_log` 表中汇总数据。您可以按单个函数或整个堆栈跟踪汇总数据。

如果您需要可视化 `trace_log` 信息，可以尝试 [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) 和 [speedscope](https://github.com/laplab/clickhouse-speedscope)。

## 示例 {#example}

在此示例中，我们：

- 按查询标识符和当前日期过滤 `trace_log` 数据。

- 按堆栈跟踪汇总。

- 使用内省函数，我们将获得以下报告：

    - 符号名称和相应的源代码函数。
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
