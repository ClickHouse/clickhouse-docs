---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', 'connect', 'integrate', 'ui', 'analytics']
description: 'Hashboard 是一个强大的分析平台，可以轻松与 ClickHouse 集成以实现实时数据分析。'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';


# 将 ClickHouse 连接到 Hashboard

[Hashboard](https://hashboard.com) 是一个互动数据探索工具，使您组织中的任何人都可以跟踪指标并发现可操作的洞察。 Hashboard 向您的 ClickHouse 数据库发出实时 SQL 查询，特别适用于自助式和临时的数据探索用例。  

<img src={hashboard_01} class="image" alt="Hashboard 数据探索器" />  

<br/>

本指南将引导您完成将 Hashboard 与您的 ClickHouse 实例连接的步骤。该信息也可在 Hashboard 的 [ClickHouse 集成文档](https://docs.hashboard.com/docs/database-connections/clickhouse) 中找到。

## 前提条件 {#pre-requisites}

- 一个运行在您自己基础设施或 [ClickHouse Cloud](https://clickhouse.com/) 上的 ClickHouse 数据库。
- 一个 [Hashboard 账户](https://hashboard.com/getAccess) 和项目。

## 将 Hashboard 连接到 ClickHouse 的步骤 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 收集您的连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. 在 Hashboard 中添加新的数据库连接 {#2-add-a-new-database-connection-in-hashboard}

1. 访问您的 [Hashboard 项目](https://hashboard.com/app)。
2. 点击侧边导航栏中的齿轮图标以打开设置页面。
3. 点击 `+ New Database Connection`。
4. 在模式对话框中选择 "ClickHouse." 
5. 填写 **Connection Name**、**Host**、**Port**、**Username**、**Password** 和 **Database** 字段，用之前收集的信息填充。
6. 点击 "Test" 验证连接配置是否成功。
7. 点击 "Add"

您的 ClickHouse 数据库现在已连接到 Hashboard，您可以通过构建 [数据模型](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[探索](https://docs.hashboard.com/docs/visualizing-data/explorations)、[指标](https://docs.hashboard.com/docs/metrics) 和 [仪表板](https://docs.hashboard.com/docs/dashboards) 来继续进行。有关这些功能的更多详细信息，请参见相应的 Hashboard 文档。

## 了解更多 {#learn-more}

有关更多高级功能和故障排除，请访问 [Hashboard 的文档](https://docs.hashboard.com/)。
