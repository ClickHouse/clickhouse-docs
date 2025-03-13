---
slug: /operations/monitoring
sidebar_position: 45
sidebar_label: 监控
description: 您可以监控硬件资源的利用率以及 ClickHouse 服务器指标。
keywords: ['监控', '可观察性', '高级仪表板', '仪表板', '可观察性仪表板']
---


# 监控

:::note
本指南中概述的监控数据可在 ClickHouse Cloud 中访问。除了通过下面描述的内置仪表板显示，基本和高级性能指标也可以直接在主服务控制台中查看。
:::

您可以监控：

- 硬件资源的利用率。
- ClickHouse 服务器指标。

## 内置高级可观察性仪表板 {#built-in-advanced-observability-dashboard}

<img width="400" alt="截屏 2023-11-12 18:08:58" src="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" />

ClickHouse 具有内置的高级可观察性仪表板功能，可以通过 `$HOST:$PORT/dashboard` 访问（需要用户名和密码），显示以下指标：
- 每秒查询数
- CPU 使用率（核数）
- 正在运行的查询
- 正在进行的合并
- 每秒选定字节数
- IO 等待
- CPU 等待
- 操作系统 CPU 使用率（用户空间）
- 操作系统 CPU 使用率（内核）
- 从磁盘读取
- 从文件系统读取
- 内存（跟踪）
- 每秒插入行数
- 总 MergeTree 部件
- 每个分区的最大部件数

## 资源利用率 {#resource-utilization}

ClickHouse 还会自行监控硬件资源的状态，例如：

- 处理器的负载和温度。
- 存储系统、RAM 和网络的利用率。

这些数据收集在 `system.asynchronous_metric_log` 表中。

## ClickHouse 服务器指标 {#clickhouse-server-metrics}

ClickHouse 服务器内置了自我状态监测的工具。

要跟踪服务器事件，请使用服务器日志。请参阅配置文件中的 [logger](../operations/server-configuration-parameters/settings.md#logger) 部分。

ClickHouse 收集：

- 服务器使用计算资源的不同指标。
- 查询处理的常见统计信息。

您可以在 [system.metrics](/operations/system-tables/metrics), [system.events](/operations/system-tables/events) 和 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中找到这些指标。

您可以配置 ClickHouse 将指标导出到 [Graphite](https://github.com/graphite-project)。请参阅 ClickHouse 服务器配置文件中的 [Graphite 部分](../operations/server-configuration-parameters/settings.md#graphite)。在配置指标导出之前，您应该按照他们的官方 [指南](https://graphite.readthedocs.io/en/latest/install.html) 设置 Graphite。

您可以配置 ClickHouse 将指标导出到 [Prometheus](https://prometheus.io)。请参阅 ClickHouse 服务器配置文件中的 [Prometheus 部分](../operations/server-configuration-parameters/settings.md#prometheus)。在配置指标导出之前，您应该按照他们的官方 [指南](https://prometheus.io/docs/prometheus/latest/installation/) 设置 Prometheus。

此外，您可以通过 HTTP API 监控服务器的可用性。向 `/ping` 发送 `HTTP GET` 请求。如果服务器可用，它会响应 `200 OK`。

要监控集群配置中的服务器，您应该设置 [max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) 参数，并使用 HTTP 资源 `/replicas_status`。对 `/replicas_status` 的请求如果副本可用且没有落后于其他副本，则返回 `200 OK`。如果某个副本滞后，它将返回 `503 HTTP_SERVICE_UNAVAILABLE` 以及有关延迟的信息。
