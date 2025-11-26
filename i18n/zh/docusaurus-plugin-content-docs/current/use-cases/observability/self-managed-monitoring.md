---
slug: /use-cases/observability/oss-monitoring
title: '自托管监控'
sidebar_label: '自托管监控'
description: '自托管监控指南'
doc_type: 'guide'
keywords: ['可观测性', '监控', '自托管', '指标', '系统健康']
---

import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# 自主管理监控 {#cloud-monitoring}

本指南为评估 ClickHouse 开源版的企业团队提供有关生产环境部署的监控与可观测性能力的全面信息。企业客户经常会询问开箱即用的监控特性、与现有可观测性技术栈（包括 Datadog 和 AWS CloudWatch 等工具）的集成方式，以及 ClickHouse 的监控功能与自托管部署方案相比有何差异。

### 基于 Prometheus 的集成架构 {#prometheus}
ClickHouse 会根据您的部署模型，通过不同的端点暴露 Prometheus 兼容的指标，每种方式都有各自的运维特性：

**自主管理 / OSS ClickHouse**

可直接通过 ClickHouse 服务器上的标准 /metrics 端点访问服务器的 Prometheus 端点。此方式提供：
- 完整指标暴露：完整的、未经内置过滤的 ClickHouse 指标集合
- 实时指标：在被抓取时直接从系统表生成

**直接访问系统** 

查询生产系统表，会增加监控负载，并使系统无法进入节省成本的空闲状态

<ObservabilityIntegrations/>

### ClickStack 部署选项 {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm)：推荐用于基于 Kubernetes 的调试环境。允许通过 `values.yaml` 进行特定于环境的配置、资源限制和伸缩。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)：单独部署各组件（ClickHouse、HyperDX、OTel collector、MongoDB）。
- [仅 HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)：独立的 HyperDX 容器。

有关完整的部署选项和架构详情，请参阅 [ClickStack 文档](/use-cases/observability/clickstack/overview)和[数据摄取指南](/use-cases/observability/clickstack/ingesting-data/overview)。

<DirectIntegrations/>

<CommunityMonitoring/>
