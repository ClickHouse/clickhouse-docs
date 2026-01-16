---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: '提供 HyperDX，即 ClickStack 的 UI：一个基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台，将日志、追踪、指标和会话统一到单一高性能、可扩展的解决方案中。'
doc_type: 'guide'
keywords: ['hyperdx', '可观测性', '集成', '云功能', '监控']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX 是 [**ClickStack**](/use-cases/observability/clickstack) 的用户界面 —— 一个基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台，将日志、追踪、指标和会话数据统一到单一的高性能解决方案中。ClickStack 专为监控和调试复杂系统而设计，使开发者和 SRE 能够在无需在不同工具之间切换，也无需通过时间戳或关联 ID 手动拼接数据的情况下，实现端到端问题追踪。

HyperDX 是专为探索和可视化可观测性数据构建的前端，支持 Lucene 风格和 SQL 查询、交互式仪表盘、告警、追踪探索等功能——并针对以 ClickHouse 作为后端的场景进行了全面优化。

在 ClickHouse Cloud 中使用 HyperDX，使您能够获得更加开箱即用的 ClickStack 体验 —— 无需管理基础设施，也无需单独配置身份验证。
HyperDX 可以一键启动并连接到您的数据 —— 与 ClickHouse Cloud 身份验证系统完全集成，为您的可观测性洞察提供无缝且安全的访问体验。


## 部署 \\{#main-concepts\\}

ClickHouse Cloud 中的 HyperDX 目前处于私有预览阶段，需在组织级别启用。启用后，当选择任意服务时，用户会在左侧主导航菜单中看到 HyperDX。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

若要开始在 ClickHouse Cloud 中使用 HyperDX，建议参考我们的专门[快速入门指南](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)。

有关 ClickStack 的更多详细信息，请参阅[完整文档](/use-cases/observability/clickstack)。 