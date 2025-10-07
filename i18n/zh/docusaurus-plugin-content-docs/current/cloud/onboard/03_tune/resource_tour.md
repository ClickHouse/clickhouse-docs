---
'slug': '/cloud/get-started/cloud/resource-tour'
'title': '资源巡回'
'description': '关于 ClickHouse Cloud 文档资源的概述，包括查询优化、扩展策略、监控和最佳实践'
'keywords':
- 'clickhouse cloud'
'hide_title': true
'doc_type': 'guide'
---

import TableOfContentsBestPractices from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/i18n/zh/docusaurus-plugin-content-docs/current/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/i18n/zh/docusaurus-plugin-content-docs/current/cloud/_snippets/_security_table_of_contents.md';


# 资源导览

本文旨在为您提供概述，以了解在文档中可用的资源，学习如何最大化利用您的 ClickHouse Cloud 部署。根据以下主题探索资源：

- [查询优化技术和性能调优](#query-optimization)
- [监控](#monitoring)
- [安全最佳实践和合规功能](#security)
- [成本优化和计费](#cost-optimization)

在深入具体主题之前，我们建议您先查看我们的通用 ClickHouse 最佳实践指南，其中涵盖了使用 ClickHouse 时应遵循的通用最佳实践：

<TableOfContentsBestPractices />

## 查询优化技术和性能调优 {#query-optimization}

<TableOfContentsOptimizationAndPerformance/>

## 监控 {#monitoring}

| 页面                                                              | 描述                                                                      |
|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| [高级仪表板](/cloud/manage/monitor/advanced-dashboard)           | 使用内置的高级仪表板监控服务状态和性能                                  |
| [Prometheus 集成](/integrations/prometheus)                      | 使用 Prometheus 监控云服务                                               |

## 安全 {#security}

<TableOfContentsSecurity/>

## 成本优化和计费 {#cost-optimization}

| 页面                                                  | 描述                                                                                                 |
|-------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| [数据传输](/cloud/manage/network-data-transfer)      | 理解 ClickHouse Cloud 如何计量传入和传出的数据传输                                                |
| [通知](/cloud/notifications)                          | 为您的 ClickHouse Cloud 服务设置通知。例如，当信用使用量超过一个阈值时                              |
