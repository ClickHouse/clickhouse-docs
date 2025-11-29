---
sidebar_label: '创建首个 Kafka ClickPipe'
description: '创建首个 Kafka ClickPipe 的分步指南。'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: '创建首个 Kafka ClickPipe'
doc_type: 'guide'
keywords: ['创建 kafka clickpipe', 'kafka', 'clickpipes', '数据源', '设置指南']
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


# 创建您的第一个 Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

> 本指南将指导您完成创建第一个 Kafka ClickPipe 的过程。

<VerticalStepper type="numbered" headerLevel="h2">


## 导航到数据源 {#1-load-sql-console}
在左侧菜单中点击 `Data Sources`，然后选择“Set up a ClickPipe”。
<Image img={cp_step0} alt="Select imports" size="md"/>



## 选择数据源 {#2-select-data-source}
从列表中选择您的 Kafka 数据源。
<Image img={cp_step1} alt="选择数据源类型" size="md"/>



## 配置数据源 {#3-configure-data-source}
在表单中为你的 ClickPipe 填写名称、描述（可选）、凭据以及其他连接信息。
<Image img={cp_step2} alt="填写连接信息" size="md"/>



## 配置 schema registry（可选） {#4-configure-your-schema-registry}
Avro 流需要一个有效的 schema。有关如何配置 schema registry 的更多信息，请参阅 [Schema registries](./02_schema-registries.md)。



## 配置反向私有端点（可选） {#5-configure-reverse-private-endpoint}
配置反向私有端点，以便通过 AWS PrivateLink 允许 ClickPipes 连接到您的 Kafka 集群。
有关更多信息，请参阅我们的 [AWS PrivateLink 文档](../aws-privatelink.md)。



## 选择你的主题 {#6-select-your-topic}
选择你的主题后，UI 将会显示该主题中的示例文档。
<Image img={cp_step3} alt="设置主题" size="md"/>



## 配置目标表 {#7-configure-your-destination-table}

在下一步中，你可以选择将数据摄取到一个新的 ClickHouse 表，或者复用一个已有的表。按照界面中的说明修改表名、schema 和设置。你可以在顶部的示例表中实时预览你的更改。

<Image img={cp_step4a} alt="设置表、schema 和相关配置" size="md"/>

你也可以使用提供的控件自定义高级设置。

<Image img={cp_table_settings} alt="设置高级选项" size="md"/>



## 配置权限 {#8-configure-permissions}
ClickPipes 会为向目标表写入数据创建一个专用用户。你可以为这个内部用户选择角色，可以使用自定义角色或预定义角色之一：
- `Full access`：拥有对集群的完全访问权限。如果你在目标表上使用物化视图或 Dictionary，这个角色会很有用。
- `Only destination table`：仅对目标表拥有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" size="md"/>



## 完成设置 {#9-complete-setup}

点击"Create ClickPipe"将创建并运行您的 ClickPipe。创建后,它将显示在数据源部分。

<Image img={cp_overview} alt='查看概览' size='md' />

</VerticalStepper>
