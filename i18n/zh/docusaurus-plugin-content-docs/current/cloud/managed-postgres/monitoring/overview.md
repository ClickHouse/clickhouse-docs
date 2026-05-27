---
slug: /cloud/managed-postgres/monitoring/overview
sidebar_label: '概述'
title: 'Managed Postgres 监控'
description: 'ClickHouse Managed Postgres 的监控与可观测性选项概览'
keywords: ['Managed Postgres', '监控', '可观测性', '指标', '仪表板', 'Prometheus', '查询洞察', 'pg_stat_ch']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# Managed Postgres 监控 \{#managed-postgres-monitoring\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.monitoring-overview-beta" />

您可以通过以下
方法监控 Managed Postgres 服务：

| 部分                                                             | 说明                                                       | 所需配置            |
| -------------------------------------------------------------- | -------------------------------------------------------- | --------------- |
| [仪表板](/cloud/managed-postgres/monitoring/dashboard)            | Cloud Console 中用于查看资源使用情况和数据库活动的内置图表                     | 无               |
| [Query Insights](/cloud/managed-postgres/monitoring/query-insights)      | 按 statement 提供遥测数据：按影响程度对每种查询模式进行排序，并附带诊断计数器             | 无               |
| [Prometheus 端点](/cloud/managed-postgres/monitoring/prometheus) | 将指标抓取到 Prometheus、Grafana、Datadog 或任何兼容 OpenMetrics 的收集器 | API key + 抓取器配置 |
| [指标参考](/cloud/managed-postgres/monitoring/metrics)             | Prometheus 端点公开的完整指标列表，包括类型、标签和含义                        | 不适用             |

## 快速入门 \{#quick-start\}

打开 Cloud Console，然后转到任意
Managed Postgres 实例的 **Monitoring** 选项卡，即可查看 CPU、内存、IOPS、
连接数、事务、缓存命中率和死锁的实时图表。无需任何
配置。

对于每个查询的遥测数据——延迟百分位数、缓存与磁盘读取、
临时溢写、并行工作线程利用率以及 WAL 量——请打开同一实例上的
[Query Insights](/cloud/managed-postgres/monitoring/query-insights) 选项卡。
若要将主机级指标接入你自己的可观测性堆栈，请使用
[Prometheus 端点](/cloud/managed-postgres/monitoring/prometheus)。