---
slug: /cloud/get-started/cloud/resource-tour
title: '资源导览'
description: 'ClickHouse Cloud 文档资源总览，涵盖查询优化、扩展策略、监控以及最佳实践'
keywords: ['clickhouse cloud']
hide_title: true
doc_type: 'guide'
---

import TableOfContentsBestPractices from '@site/docs/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/docs/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/docs/cloud/_snippets/_security_table_of_contents.md';


# 资源导览

本文旨在为您概述文档中可用的各类资源，帮助您充分发挥 ClickHouse Cloud 部署的价值。
您可以按以下主题浏览相关资源：

- [查询优化技术与性能调优](#query-optimization)
- [监控](#monitoring)
- [安全最佳实践与合规特性](#security)
- [成本优化与计费](#cost-optimization)

在深入了解更具体的主题之前，我们建议您先阅读通用的 ClickHouse 最佳实践指南，这些指南涵盖在使用 ClickHouse 时应遵循的通用最佳实践：

<TableOfContentsBestPractices />



## 查询优化技术与性能调优 {#query-optimization}

<TableOfContentsOptimizationAndPerformance />


## 监控 {#monitoring}

| 页面                                                                       | 描述                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [高级仪表板](/cloud/manage/monitor/advanced-dashboard)             | 使用内置的高级仪表板监控服务运行状况和性能 |
| [Prometheus 集成](/integrations/prometheus)                         | 使用 Prometheus 监控 ClickHouse Cloud 服务                                      |
| [Cloud 监控功能](/use-cases/observability/cloud-monitoring) | 了解内置监控功能和集成选项概览   |


## 安全性 {#security}

<TableOfContentsSecurity />


## 成本优化与账单 {#cost-optimization}

| 页面                                                 | 说明                                                                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [数据传输](/cloud/manage/network-data-transfer) | 了解 ClickHouse Cloud 如何计量入站和出站的数据传输量                                |
| [通知](/cloud/notifications)                | 为您的 ClickHouse Cloud 服务设置通知。例如,当额度使用量超过阈值时 |
