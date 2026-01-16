---
sidebar_label: 'Artie'
sidebar_position: 12
keywords: ['clickhouse', 'Artie', '连接', '集成', 'CDC（变更数据捕获）', 'ETL', '数据集成', '实时', '流式处理']
slug: /integrations/artie
description: '使用 Artie CDC（变更数据捕获）流式平台将数据流式传输到 ClickHouse'
title: '将 Artie 连接到 ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import artie_signup from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_signup.png';
import artie_edit_pipeline from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_edit_pipeline.png';
import analytics from '@site/static/images/integrations/data-ingestion/etl-tools/artie/analytics.png';
import monitor from '@site/static/images/integrations/data-ingestion/etl-tools/artie/monitor.png';
import schema_notification from '@site/static/images/integrations/data-ingestion/etl-tools/artie/schema_notification.png';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# 将 Artie 连接到 ClickHouse \{#connect-artie-to-clickhouse\}

<a href="https://www.artie.com/" target="_blank">Artie</a> 是一个全托管的实时数据流平台，可将生产数据实时复制/同步到 ClickHouse，从而在生产环境中支持面向客户的分析、运营工作流以及 Agentic AI 等能力。

## 概览 \\{#overview\\}

Artie 是面向 AI 时代的现代数据基础设施层——一个完全托管的实时数据流平台，使生产数据与数据仓库持续保持同步。

随着公司将数据仓库用于实时 AI 工作负载、运营分析以及面向客户的数据产品，它们正逐步统一采用快速、可靠且具备大规模扩展能力的基础设施。

我们为公司提供类似 Netflix、DoorDash 和 Instacart 在内部构建的那种流式数据管道和深度可观测性，而无需招聘 10 多名工程师并花费 1–2 年进行平台建设。Artie 将整个摄取生命周期——变更捕获、合并、回填和可观测性——实现自动化，无需任何工程化维护，并可在数分钟内完成部署。

像 ClickUp、Substack 和 Alloy 这样的领军企业使用 Artie，不仅是为了解决当下的管道问题，更是为了在其 AI 战略加速发展的同时，为数据栈提供前瞻性的保障。

<VerticalStepper headerLevel="h2">

## 创建 Artie 账户 \\{#1-create-an-artie-account\\}

访问 <a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a> 并填写表单以申请访问权限。

<Image img={artie_signup} size="md" border alt="Artie 注册页面" />

## 查找你的 ClickHouse 凭证 \\{#2-find-your-clickhouse-credentials\\}

在 ClickHouse Cloud 中创建服务后，找到以下必需的配置：

<ConnectionDetails />

## 在 Artie 中创建新 pipeline \\{#3-create-a-new-pipeline-in-artie\\}

使用你在前面步骤中收集的信息前往 Artie，并按照 3 个步骤创建一个新的 pipeline。

1. **连接你的源** - 配置你的源数据库（Postgres、MySQL、Events API 等）
2. **选择要复制的表** - 选择要同步到 ClickHouse 的表
3. **连接你的目标端** - 输入你的 ClickHouse 凭证

<Image img={artie_edit_pipeline} size="lg" border alt="Artie 编辑 Pipeline 界面" />

</VerticalStepper>

## 联系我们 \\{#contact-us\\}

如果您有任何问题，请查阅我们的 <a href="https://www.artie.com/docs/destinations/clickhouse" target="_blank">ClickHouse 文档</a>，或发送邮件至 <a href="mailto:hi@artie.com">hi@artie.com</a> 与团队联系。

## 产品截图 \\{#product-screenshots\\}

Analytics Portal（分析门户）

<Image img={analytics} size="md" border alt="Analytics Portal"/>

针对 pipeline 和数据表的专用监控

<Image img={monitor} size="md" border alt="Built-in monitoring"/>

每日 Schema 变更通知

<Image img={schema_notification} size="md" border alt="Schema notification"/>