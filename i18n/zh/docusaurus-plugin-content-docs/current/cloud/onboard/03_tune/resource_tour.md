---
slug: /cloud/get-started/cloud/resource-tour
title: '资源导览'
description: 'ClickHouse Cloud 文档资源概览：涵盖查询优化、扩展策略、监控和最佳实践'
keywords: ['clickhouse cloud']
hide_title: true
doc_type: 'guide'
---

import TableOfContentsBestPractices from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/i18n/zh/docusaurus-plugin-content-docs/current/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/i18n/zh/docusaurus-plugin-content-docs/current/cloud/_snippets/_security_table_of_contents.md';

# 资源导览 \{#resource-tour\}

本文旨在为您概述文档中可用的资源，帮助您充分发挥 ClickHouse Cloud 部署的价值。
您可以按以下主题浏览资源：

- [查询优化技术与性能调优](#query-optimization)
- [监控](#monitoring)
- [安全最佳实践与合规特性](#security)
- [成本优化与计费](#cost-optimization)

在深入了解更具体的主题之前，我们建议您先从我们的
ClickHouse 通用最佳实践指南开始，这些指南涵盖了使用 ClickHouse 时应遵循的通用最佳实践：

<TableOfContentsBestPractices />

## 查询优化技术及性能调优 \{#query-optimization\}

<TableOfContentsOptimizationAndPerformance/>

## 监控 \{#monitoring\}

| 页面                                                                       | 描述                                                                               |
|----------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| [高级仪表板](/cloud/manage/monitor/advanced-dashboard)                     | 使用内置高级仪表板监控服务健康状况和性能                                           |
| [Prometheus 集成](/integrations/prometheus)                                | 使用 Prometheus 监控云服务                                                         |
| [云监控功能](/use-cases/observability/cloud-monitoring)                   | 概览内置监控功能以及可用的集成选项                                                 |

## 安全性 \{#security\}

<TableOfContentsSecurity/>

## 成本优化与计费 \{#cost-optimization\}

| 页面                                                | 说明                                                                                                      |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| [数据传输](/cloud/manage/network-data-transfer)     | 了解 ClickHouse Cloud 如何对入站和出站的数据传输进行计量                                                 |
| [通知](/cloud/notifications)                        | 为您的 ClickHouse Cloud 服务设置通知，例如当信用使用量超过某个阈值时                                     |
