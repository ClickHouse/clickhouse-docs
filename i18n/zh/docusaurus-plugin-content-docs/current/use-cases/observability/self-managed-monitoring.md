---
slug: /use-cases/observability/oss-monitoring
title: '自主管理监控'
sidebar_label: '自主管理监控'
description: '自主管理监控指南'
doc_type: 'guide'
keywords: ['observability', 'monitoring', 'self-managed', 'metrics', 'system health']
---

import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# 自管理监控 {#cloud-monitoring}

本指南为评估 ClickHouse 开源版本的企业团队提供生产部署中监控和可观测性能力的全面信息。企业客户经常询问开箱即用的监控功能、与现有可观测性技术栈(包括 Datadog 和 AWS CloudWatch 等工具)的集成,以及 ClickHouse 监控与自托管部署的比较。

### 基于 Prometheus 的集成架构 {#prometheus}

ClickHouse 根据您的部署模型通过不同的端点公开 Prometheus 兼容指标,每种方式都具有不同的运维特性:

**自管理/开源 ClickHouse**

通过 ClickHouse 服务器上的标准 /metrics 端点访问的直接服务器 Prometheus 端点。此方法提供:

- 完整的指标公开:提供全部可用的 ClickHouse 指标,无内置过滤
- 实时指标:在抓取时直接从系统表生成

**直接系统访问**

查询生产系统表,这会增加监控负载并阻止节省成本的空闲状态

<ObservabilityIntegrations />

### ClickStack 部署选项 {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm):推荐用于基于 Kubernetes 的调试环境。允许通过 `values.yaml` 进行特定环境配置、资源限制和扩展。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose):单独部署每个组件(ClickHouse、HyperDX、OTel 收集器、MongoDB)。
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only):独立的 HyperDX 容器。

有关完整的部署选项和架构详细信息,请参阅 [ClickStack 文档](/use-cases/observability/clickstack/overview)和[数据摄取指南](/use-cases/observability/clickstack/ingesting-data/overview)。

<DirectIntegrations />

<CommunityMonitoring />
