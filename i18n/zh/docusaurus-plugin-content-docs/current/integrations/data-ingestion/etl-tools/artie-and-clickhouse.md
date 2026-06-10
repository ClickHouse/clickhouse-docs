---
sidebar_label: 'Artie'
sidebar_position: 12
keywords: ['clickhouse', 'Artie', 'connect', 'integrate', 'cdc', 'etl', 'data integration', 'real-time', 'streaming']
slug: /integrations/artie
description: '使用 Artie CDC 流式平台将数据导入 ClickHouse'
title: '连接 Artie 与 ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import artie_signup from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_signup.png';
import artie_edit_pipeline from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_edit_pipeline.png';
import analytics from '@site/static/images/integrations/data-ingestion/etl-tools/artie/analytics.png';
import monitor from '@site/static/images/integrations/data-ingestion/etl-tools/artie/monitor.png';
import schema_notification from '@site/static/images/integrations/data-ingestion/etl-tools/artie/schema_notification.png';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<a href="https://www.artie.com/" target="_blank">Artie</a> 是一个全托管的实时数据流平台，可将生产数据实时复制到 ClickHouse，从而支持面向客户的分析、运营工作流以及生产环境中的 Agentic AI。

## 概述 \{#overview\}

Artie 是 AI 时代的新一代数据基础设施层——一个全托管的实时数据流平台，可让生产数据持续与您的数据仓库保持同步。

随着企业将数据仓库用于实时 AI 工作负载、运营分析和面向客户的数据产品，它们正开始统一采用快速、可靠且具备扩展能力的基础设施。

我们为企业提供 Netflix、DoorDash 和 Instacart 自建的那类流式管道和深度可观测性，而无需招聘 10 多名工程师，也无需花费 1-2 年进行平台建设。Artie 可自动化整个摄取生命周期——变更捕获、合并、回填和可观测性——几乎无需工程维护，并可在几分钟内部署完成。

ClickUp、Substack 和 Alloy 等领先企业使用 Artie，不仅是为了解决当前的管道问题，更是为了在其 AI 战略加速推进时，让数据栈具备面向未来的能力。

<VerticalStepper headerLevel="h2">
  ## 创建 Artie 账户 \{#1-create-an-artie-account\}

  访问 <a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a> 并填写表单以申请访问权限。

  <Image img={artie_signup} size="md" border alt="Artie 注册页面" />

  ## 查找您的 ClickHouse 凭据 \{#2-find-your-clickhouse-credentials\}

  在 ClickHouse Cloud 中创建服务后，找到以下必需设置：

  <ConnectionDetails />

  ## 在 Artie 中创建新管道 \{#3-create-a-new-pipeline-in-artie\}

  前往 Artie，使用您在前面步骤中收集的信息，按照 3 个步骤创建一个新管道。

  1. **连接您的源端** - 配置您的源数据库 (Postgres、MySQL、Events API 等)
  2. **选择您要复制的表** - 选择要同步到 ClickHouse 的表
  3. **连接您的目标端** - 输入您的 ClickHouse 凭据

  <Image img={artie_edit_pipeline} size="lg" border alt="Artie 编辑管道界面" />
</VerticalStepper>

## 联系我们 \{#contact-us\}

如果您有任何疑问，请参阅我们的<a href="https://www.artie.com/docs/destinations/clickhouse" target="_blank">ClickHouse 文档</a>，或发送邮件至 <a href="mailto:hi@artie.com">hi@artie.com</a> 联系团队。

## 产品截图 \{#product-screenshots\}

分析门户

<Image img={analytics} size="md" border alt="分析门户" />

管道和表级监控

<Image img={monitor} size="md" border alt="内置监控" />

每日 schema 变更通知

<Image img={schema_notification} size="md" border alt="schema 变更通知" />