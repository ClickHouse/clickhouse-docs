---
slug: /use-cases/observability/oss-monitoring
title: '自托管监控'
sidebar_label: '自托管监控'
description: '自托管监控指南'
doc_type: 'guide'
keywords: ['可观测性', '监控', '自托管', '指标', '系统健康状况']
---

import ObservabilityIntegrations from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';


# 自主管理监控 {#cloud-monitoring}

本指南为评估 ClickHouse 开源版本的企业团队提供有关生产环境部署中监控与可观测性能力的全面信息。企业客户经常会询问开箱即用的监控功能、与现有可观测性技术栈（包括 Datadog 和 AWS CloudWatch 等工具）的集成方式，以及 ClickHouse 的监控能力与自托管部署相比有哪些差异。

### 基于 Prometheus 的集成架构 {#prometheus}

ClickHouse 会根据你的部署模型，通过不同的端点暴露与 Prometheus 兼容的指标，每种方式都有各自不同的运维特征：

**自主管理 / 开源版 ClickHouse**

可通过 ClickHouse 服务器上的标准 /metrics 端点访问的服务器直连 Prometheus 端点。此方式提供：

- 完整的指标暴露能力：在没有任何内置过滤的情况下，提供 ClickHouse 所有可用指标
- 实时指标：在被抓取时直接从 system 表生成

**直接访问系统表** 

对生产环境的 system 表执行查询，会增加监控负载，并阻止系统进入空闲以实现节省成本

<ObservabilityIntegrations/>

### ClickStack 部署选项 {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm)：推荐用于基于 Kubernetes 的调试环境。支持通过 `values.yaml` 配置特定环境、资源限制和弹性伸缩。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)：分别部署各个组件（ClickHouse、HyperDX、OTel collector、MongoDB）。
- [仅 HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)：独立运行的 HyperDX 容器。

有关完整的部署选项和架构细节，请参阅 [ClickStack 文档](/use-cases/observability/clickstack/overview) 和 [数据摄取指南](/use-cases/observability/clickstack/ingesting-data/overview)。

<DirectIntegrations/>

<CommunityMonitoring/>