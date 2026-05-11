---
slug: /use-cases/observability/clickstack/getting-started/managed
title: '托管版 ClickStack 入门'
sidebar_label: '托管版'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: '托管版 ClickStack 入门'
doc_type: 'guide'
keywords: ['托管版 ClickStack', '入门', 'ClickHouse Cloud']
---

import Image from '@theme/IdealImage';
import signup_page from '@site/static/images/clickstack/getting-started/signup_page.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import BetaBadge from '@theme/badges/BetaBadge';
import SetupManagedIngestion from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import ProviderSelection from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import NavigateClickStackUI from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import service_connect from '@site/static/images/_snippets/service_connect.png';

<BetaBadge />

开始使用的最简便方式，是在 **ClickHouse Cloud** 上部署 **Managed ClickStack**。它提供一个完全托管且安全的后端，同时仍然让您对摄取、schema 和可观测性工作流保持完全控制。这样您无需自行运维 ClickHouse，并可获得一系列优势：

* 计算资源可自动伸缩，并且与存储解耦
* 基于对象存储的低成本且几乎无限的保留期
* 能够通过 warehouses 将读写工作负载彼此独立隔离
* 集成的身份验证
* 自动化备份
* 安全和合规特性
* 无缝升级

<VerticalStepper headerLevel="h2">
  ## 注册 ClickHouse Cloud \{#signup-to-clickhouse-cloud\}

  若要在 [ClickHouse Cloud](https://console.clickhouse.cloud) 中创建一个 Managed ClickStack 服务，请先完成 [ClickHouse Cloud 快速入门指南](/getting-started/quick-start/cloud)中的**第一步**。

  <ProviderSelection />

  ## 配置摄取 \{#setup-ingestion\}

  服务预配完成后，确保已选中该服务，然后在左侧菜单中单击 &quot;ClickStack&quot;。

  <SetupManagedIngestion />

  ## 进入 ClickStack UI \{#navigate-to-clickstack-ui-cloud\}

  <NavigateClickStackUI />

  ## 后续步骤 \{#next-steps\}

  :::important[记录默认凭证]
  如果您在上述步骤中尚未记录默认凭证，请进入该服务并选择 `Connect`，记录密码以及 HTTP/native 端点。请安全地存储这些管理员凭证，以便在后续指南中重复使用。
  :::

  <Image img={service_connect} size="lg" alt="Service Connect" border />

  若要执行诸如创建新用户或添加更多数据源之类的任务，请参阅[托管 ClickStack 部署指南](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks)。
</VerticalStepper>
