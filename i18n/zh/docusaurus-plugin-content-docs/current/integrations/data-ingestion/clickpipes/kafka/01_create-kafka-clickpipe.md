---
sidebar_label: '创建首个 Kafka ClickPipe'
description: '创建首个 Kafka ClickPipe 的分步指南。'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: '创建首个 Kafka ClickPipe'
doc_type: 'guide'
keywords: ['创建 kafka clickpipe', 'kafka', 'clickpipes', '数据源', '设置指南']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import Image from '@theme/IdealImage';

# 创建你的第一个 Kafka ClickPipe \{#creating-your-first-kafka-clickpipe\}

> 在本指南中，我们将引导你完成创建第一个 Kafka ClickPipe 的过程。

<VerticalStepper type="numbered" headerLevel="h2">

## 导航到数据源 \{#1-load-sql-console\}
在左侧菜单中选择 `Data Sources` 按钮，然后点击“Set up a ClickPipe”。
<Image img={cp_step0} alt="选择导入" size="md"/>

## 选择数据源 \{#2-select-data-source\}
在列表中选择你的 Kafka 数据源。
<Image img={cp_step1} alt="选择数据源类型" size="md"/>

## 配置数据源 \{#3-configure-data-source\}
填写表单，为你的 ClickPipe 提供名称、描述（可选）、凭证以及其他连接详细信息。
<Image img={cp_step2} alt="填写连接详细信息" size="md"/>

## 配置 schema registry（可选） \{#4-configure-your-schema-registry\}
Avro 流需要有效的 schema。有关如何配置 schema registry 的更多详细信息，请参阅 [Schema registries](./02_schema-registries.md)。

## 配置反向私有端点（可选） \{#5-configure-reverse-private-endpoint\}
配置一个 Reverse Private Endpoint，使 ClickPipes 能够使用 AWS PrivateLink 连接到你的 Kafka 集群。
更多信息请参阅我们的 [AWS PrivateLink 文档](../aws-privatelink.md)。

## 选择你的 topic \{#6-select-your-topic\}
选择你的 topic，UI 将显示该 topic 中的一个示例文档。
<Image img={cp_step3} alt="设置你的 topic" size="md"/>

## 配置目标表 \{#7-configure-your-destination-table\}

在下一步中，你可以选择将数据摄取到一个新的 ClickHouse 表，或者复用一个已有的表。按照界面中的说明修改表名、schema 和设置。你可以在顶部的示例表中实时预览你的更改。

<Image img={cp_step4a} alt="设置表、schema 和相关配置" size="md"/>

你也可以使用提供的控件自定义高级设置。

<Image img={cp_table_settings} alt="设置高级选项" size="md"/>

## 配置权限 \{#8-configure-permissions\}
ClickPipes 会创建一个专用用户，用于向目标表写入数据。你可以为该内部用户选择一个角色，可以使用自定义角色或以下预定义角色之一：
- `Full access`：对整个集群具有完全访问权限。如果你在目标表上使用 Materialized View 或 Dictionary，这可能会很有用。
- `Only destination table`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" size="md"/>

## 完成设置 \{#9-complete-setup\}
点击“Create ClickPipe”会创建并运行你的 ClickPipe。它现在会显示在 Data Sources 区域中。

<Image img={cp_overview} alt="查看概览" size="md"/>

</VerticalStepper>