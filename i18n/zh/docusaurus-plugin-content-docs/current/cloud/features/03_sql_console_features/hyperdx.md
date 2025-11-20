---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: '提供 HyperDX，ClickStack 的 UI——一个基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台，在单一高性能且可扩展的解决方案中统一日志、链路追踪、指标和会话。'
doc_type: 'guide'
keywords: ['hyperdx', 'observability', 'integration', 'cloud features', 'monitoring']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX 是 [**ClickStack**](/use-cases/observability/clickstack) 的用户界面——一个基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台，将日志、链路追踪、指标和会话统一到一个高性能解决方案中。ClickStack 专为监控和调试复杂系统而设计，使开发者和 SRE 能够在无需在各类工具之间来回切换、也无需依赖时间戳或关联 ID 手动拼接数据的情况下，对问题进行端到端追踪。

HyperDX 是一个专为探索和可视化可观测性数据而构建的前端，支持类 Lucene 查询和 SQL 查询、交互式仪表盘、告警、链路追踪分析等功能——所有能力都针对以 ClickHouse 作为后端进行了优化。

在 ClickHouse Cloud 中使用 HyperDX，用户可以获得更即开即用的 ClickStack 体验——无需管理基础设施，无需单独配置认证。
HyperDX 可一键启动并连接到您的数据——与 ClickHouse Cloud 身份认证系统深度集成，为您的可观测性洞察提供无缝且安全的访问体验。


## 部署 {#main-concepts}

ClickHouse Cloud 中的 HyperDX 目前处于私有预览阶段,需要在组织级别启用。启用后,用户在选择任何服务时,都可以在左侧主导航菜单中找到 HyperDX。

<Image img={hyperdx_cloud} alt='ClickHouse Cloud HyperDX' size='lg' />

要在 ClickHouse Cloud 中开始使用 HyperDX,建议参考我们的专用[入门指南](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)。

有关 ClickStack 的更多详细信息,请参阅[完整文档](/use-cases/observability/clickstack)。
