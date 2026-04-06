---
title: '监控 ClickHouse Cloud 部署'
slug: /cloud/monitoring
description: 'ClickHouse Cloud 监控与可观测性能力概述'
keywords: ['云', '监控', '可观测性', '指标']
sidebar_label: '概述'
sidebar_position: 1
doc_type: 'guide'
---

# 监控 ClickHouse Cloud 部署 \{#monitoring-your-clickhouse-cloud-deployment\}

## 概述 \{#overview\}

本指南为企业团队介绍 ClickHouse Cloud 生产环境部署中的监控与可观测性能力。企业客户经常会询问开箱即用的监控功能、如何与现有可观测性技术栈 (包括 Datadog 和 AWS CloudWatch 等工具) 集成，以及 ClickHouse 的监控能力与自托管部署相比有何差异。

用户可通过以下方式监控其 ClickHouse 部署：

| 章节                                                  | 描述                                                | 会唤醒空闲服务吗？ | 所需配置                    |
| --------------------------------------------------- | ------------------------------------------------- | --------- | ----------------------- |
| [Cloud 控制台仪表板](/cloud/monitoring/cloud-console)     | 使用内置仪表板对服务健康状况、资源利用率和查询性能进行日常监控                   | 否         | 无                       |
| [通知](/cloud/notifications)                          | 针对扩缩容事件、错误、变更和计费的告警                               | 否         | 无 (可自定义)                |
| [Prometheus endpoint](/integrations/prometheus)     | 将指标导出到 Grafana、Datadog 或其他兼容 Prometheus 的工具       | 否         | API 密钥 + scraper config |
| [系统表查询](/cloud/monitoring/system-tables)            | 通过直接查询 `system` 表进行深度调试和自定义分析                     | 是         | SQL 查询                  |
| [社区和合作伙伴集成](/cloud/monitoring/integrations)         | Datadog agent 集成、社区监控工具以及 Billing &amp; Usage API | 视情况而定     | 取决于具体工具                 |
| [高级仪表板参考](/cloud/manage/monitor/advanced-dashboard) | 针对各个高级仪表板可视化的详细参考说明，包括故障排查示例                      | 否         | 无                       |

## 快速开始 \{#quick-start\}

打开 ClickHouse Cloud 控制台，进入 **监控** 选项卡。这篇[博客](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)总结了入门时常见的注意事项。

对于大多数用户，[Cloud 控制台仪表板](/cloud/monitoring/cloud-console) 无需任何配置，即可满足监控服务健康状况、资源利用率和查询性能的全部需求。如果您需要与外部监控栈集成，请先从 [Prometheus-compatible metrics endpoint](/integrations/prometheus) 开始。

## 系统影响考量 \{#system-impact\}

上述方法结合了以下几种方式：依赖 Prometheus 端点、由 ClickHouse Cloud 托管，或直接[查询系统表](/cloud/monitoring/system-tables)。其中最后一种方式依赖于查询生产 ClickHouse 服务，这会给被观测系统增加查询负载，并阻止 ClickHouse Cloud 实例[进入闲置状态](/manage/scaling)，从而可能影响成本。此外，如果生产系统发生故障，监控也可能受到影响，因为两者是耦合的。

直接查询系统表非常适合做深度分析和调试，但不太适合实时生产监控。[Cloud Console dashboards](/cloud/monitoring/cloud-console) 和 [Prometheus endpoint](/integrations/prometheus) 都使用预先抓取的指标，不会唤醒闲置服务，因此更适合持续性的生产监控。请权衡详细系统分析能力与运维开销之间的取舍。