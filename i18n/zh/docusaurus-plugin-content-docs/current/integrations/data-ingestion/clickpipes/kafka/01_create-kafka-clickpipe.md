---
'sidebar_label': '创建你的第一个 Kafka ClickPipe'
'description': '逐步指南以创建你的第一个 Kafka ClickPipe。'
'slug': '/integrations/clickpipes/kafka/create-your-first-kafka-clickpipe'
'sidebar_position': 1
'title': '创建你的第一个 Kafka ClickPipe'
'doc_type': 'guide'
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

> 在本指南中，我们将带您完成创建第一个 Kafka ClickPipe 的过程。

<VerticalStepper type="numbered" headerLevel="h2">

## 导航到数据源 {#1-load-sql-console}
选择左侧菜单中的 `数据源` 按钮，然后点击“设置 ClickPipe”。
<Image img={cp_step0} alt="选择导入" size="md"/>

## 选择数据源 {#2-select-data-source}
从列表中选择您的 Kafka 数据源。
<Image img={cp_step1} alt="选择数据源类型" size="md"/>

## 配置数据源 {#3-configure-data-source}
填写表单，为您的 ClickPipe 提供一个名称、描述（可选）、凭据和其他连接详细信息。
<Image img={cp_step2} alt="填写连接详细信息" size="md"/>

## 配置模式注册中心（可选） {#4-configure-your-schema-registry}
有效的模式对于 Avro 流是必需的。有关如何配置模式注册中心的更多详细信息，请参阅 [模式注册中心](./02_schema-registries.md)。

## 配置反向私有端点（可选） {#5-configure-reverse-private-endpoint}
配置反向私有端点，以允许 ClickPipes 使用 AWS PrivateLink 连接到您的 Kafka 集群。
有关更多信息，请参阅我们的 [AWS PrivateLink 文档](../aws-privatelink.md)。

## 选择您的主题 {#6-select-your-topic}
选择您的主题，UI 将显示该主题的示例文档。
<Image img={cp_step3} alt="设置您的主题" size="md"/>

## 配置您的目标表 {#7-configure-your-destination-table}

在下一步中，您可以选择是否希望将数据导入到新的 ClickHouse 表中，或重用现有的表。按照屏幕上的说明修改您的表名称、模式和设置。您可以在顶部的示例表中实时预览您的更改。

<Image img={cp_step4a} alt="设置表、模式和设置" size="md"/>

您还可以使用提供的控件自定义高级设置。

<Image img={cp_table_settings} alt="设置高级控件" size="md"/>

## 配置权限 {#8-configure-permissions}
ClickPipes 将为将数据写入目标表创建一个专用用户。您可以使用自定义角色或预定义角色之一来为该内部用户选择角色：
- `完全访问`: 对集群具有完全访问权限。如果您在目标表中使用物化视图或字典，这可能会很有用。
- `仅目标表`: 仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" size="md"/>

## 完成设置 {#9-complete-setup}
点击“创建 ClickPipe”将创建并运行您的 ClickPipe。它现在将在数据源部分列出。

<Image img={cp_overview} alt="查看概览" size="md"/>

</VerticalStepper>
