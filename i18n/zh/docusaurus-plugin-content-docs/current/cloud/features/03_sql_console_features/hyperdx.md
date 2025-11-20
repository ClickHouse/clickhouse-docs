---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: '提供 HyperDX，这是一款面向生产环境的可观测性平台 ClickStack 的 UI。ClickStack 基于 ClickHouse 和 OpenTelemetry (OTel) 构建，将日志、追踪、指标和会话统一在单一高性能、可扩展的解决方案中。'
doc_type: 'guide'
keywords: ['hyperdx', 'observability', 'integration', 'cloud features', 'monitoring']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX 是 [**ClickStack**](/use-cases/observability/clickstack) 的用户界面——一个基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台，在单一高性能解决方案中统一日志、追踪、指标和会话数据。ClickStack 专为监控和调试复杂系统而设计，使开发人员和 SRE 能够实现端到端问题排查，而无需在多个工具之间来回切换，也不必依赖时间戳或关联 ID 手动拼接数据。

HyperDX 是一个专为探索和可视化可观测性数据构建的前端，支持类 Lucene 查询和 SQL 查询、交互式仪表板、告警、追踪分析等功能——并针对以 ClickHouse 作为后端进行了全面优化。

在 ClickHouse Cloud 中使用 HyperDX，用户可以获得更加开箱即用的 ClickStack 体验——无需管理基础设施，也无需单独配置身份验证。
HyperDX 可通过一次点击即启动并连接到你的数据——与 ClickHouse Cloud 的身份验证系统深度集成，让你能够无缝、安全地访问可观测性洞察。


## 部署 {#main-concepts}

ClickHouse Cloud 中的 HyperDX 目前处于私有预览阶段,需要在组织级别启用。启用后,用户在选择任何服务时,都可以在左侧主导航菜单中找到 HyperDX。

<Image img={hyperdx_cloud} alt='ClickHouse Cloud HyperDX' size='lg' />

要在 ClickHouse Cloud 中开始使用 HyperDX,我们建议您参考专门的[入门指南](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)。

有关 ClickStack 的更多详细信息,请参阅[完整文档](/use-cases/observability/clickstack)。
