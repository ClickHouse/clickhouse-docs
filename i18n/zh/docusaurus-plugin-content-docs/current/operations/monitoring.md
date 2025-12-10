---
description: '您可以监控硬件资源利用率以及 ClickHouse 服务器指标。'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability
    dashboard']
sidebar_label: '监控'
sidebar_position: 45
slug: /operations/monitoring
title: '监控'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';

# 监控 {#monitoring}

:::note
本指南中介绍的监控数据可在 ClickHouse Cloud 中获取。除了可以通过下文所述的内置仪表板查看外，基础和高级性能指标也都可以直接在主服务控制台中查看。
:::

您可以监控：

- 硬件资源使用率。
- ClickHouse 服务器指标。

## 内置高级可观测性仪表板 {#built-in-advanced-observability-dashboard}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="屏幕截图 2023-11-12 6 08 58 PM" size="md" />

ClickHouse 提供内置的高级可观测性仪表板功能，可通过 `$HOST:$PORT/dashboard` 访问（需要用户名和密码），该仪表板展示以下指标：
- 每秒查询数
- CPU 使用情况（核心数）
- 正在运行的查询数
- 正在进行的合并数
- 每秒选取字节数
- I/O 等待
- CPU 等待
- 操作系统 CPU 使用率（用户态）
- 操作系统 CPU 使用率（内核态）
- 磁盘读取量
- 文件系统读取量
- 内存（已跟踪）
- 每秒插入行数
- MergeTree 数据片段总数
- 每个分区的最大数据片段数

## 资源使用情况 {#resource-utilization}

ClickHouse 还会自行监控硬件资源的状态，例如：

- 处理器的负载和温度。
- 存储系统、内存（RAM）和网络的使用率。

这些数据会被收集到 `system.asynchronous_metric_log` 表中。

## ClickHouse 服务器指标 {#clickhouse-server-metrics}

ClickHouse 服务器内置了用于自我状态监控的工具。

要跟踪服务器事件，请使用服务器日志。请参阅配置文件中的 [logger](../operations/server-configuration-parameters/settings.md#logger) 部分。

ClickHouse 会收集：

- 服务器对计算资源使用情况的各类指标。
- 查询处理的常规统计信息。

可以在 [system.metrics](/operations/system-tables/metrics)、[system.events](/operations/system-tables/events) 和 [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 表中找到这些指标。

可以将 ClickHouse 配置为将指标导出到 [Graphite](https://github.com/graphite-project)。请参阅 ClickHouse 服务器配置文件中的 [Graphite 部分](../operations/server-configuration-parameters/settings.md#graphite)。在配置指标导出之前，应先按照其官方[指南](https://graphite.readthedocs.io/en/latest/install.html)完成 Graphite 的部署。

可以将 ClickHouse 配置为将指标导出到 [Prometheus](https://prometheus.io)。请参阅 ClickHouse 服务器配置文件中的 [Prometheus 部分](../operations/server-configuration-parameters/settings.md#prometheus)。在配置指标导出之前，应先按照其官方[指南](https://prometheus.io/docs/prometheus/latest/installation/)完成 Prometheus 的部署。

此外，可以通过 HTTP API 监控服务器可用性。向 `/ping` 发送 `HTTP GET` 请求。如果服务器可用，它会返回 `200 OK`。

要监控集群配置中的服务器，需要设置 [max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) 参数并使用 HTTP 资源 `/replicas_status`。对 `/replicas_status` 的请求在副本可用且未落后于其他副本时返回 `200 OK`。如果某个副本存在延迟，它会返回 `503 HTTP_SERVICE_UNAVAILABLE`，并包含有关延迟情况的信息。
