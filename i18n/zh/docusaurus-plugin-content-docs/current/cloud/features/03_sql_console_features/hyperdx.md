---
'sidebar_label': 'HyperDX'
'slug': '/cloud/manage/hyperdx'
'title': 'HyperDX'
'description': '提供 HyperDX，这是一个用于 ClickStack 的用户界面 - 一个基于 ClickHouse 和 OpenTelemetry
  (OTel) 的生产级可观察性平台，将日志、跟踪、指标和会话统一在一个高性能可扩展的解决方案中。'
'doc_type': 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge/>

HyperDX 是 [**ClickStack**](/use-cases/observability/clickstack) 的用户界面 - 一款基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观察性平台，将日志、追踪、指标和会话统一在一个高性能解决方案中。ClickStack 旨在监控和调试复杂系统，使开发人员和 SRE 能够在不切换工具或手动使用时间戳或关联 ID 拼接数据的情况下，进行端到端的问题追踪。

HyperDX 是一个专门构建的前端，用于探索和可视化可观察性数据，支持 Lucene 风格和 SQL 查询、交互式仪表板、警报、追踪探索等功能——所有这些都是针对 ClickHouse 作为后端进行了优化。

ClickHouse Cloud 中的 HyperDX 允许用户享受更便捷的 ClickStack 体验——无须管理基础设施，无需配置单独的身份验证。HyperDX 可以一键启动并连接到您的数据——完全整合到 ClickHouse Cloud 身份验证系统中，实现无缝、安全地访问您的可观察性洞见。

## 部署 {#main-concepts}

ClickHouse Cloud 中的 HyperDX 目前处于私人预览阶段，必须在组织级别启用。一旦启用，用户将在选择任何服务时，在左侧主导航菜单中找到 HyperDX。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

要开始使用 ClickHouse Cloud 中的 HyperDX，我们建议您参考我们的专用 [入门指南](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)。

有关 ClickStack 的更多详细信息，请参见 [完整文档](/use-cases/observability/clickstack)。
