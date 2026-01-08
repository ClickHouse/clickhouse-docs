---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', '连接', '集成', 'ui', '分析']
description: 'Hashboard 是一个功能强大的分析平台，可以轻松与 ClickHouse 集成，用于实时数据分析。'
title: '连接 ClickHouse 与 Hashboard'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 将 ClickHouse 连接到 Hashboard {#connecting-clickhouse-to-hashboard}

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) 是一款交互式数据探索工具，可让你组织中的任何人跟踪各类指标并发现可操作的洞察。Hashboard 会向你的 ClickHouse 数据库发出实时 SQL 查询，特别适用于自助式、临时性的数据探索场景。

<Image size="md" img={hashboard_01} alt="Hashboard 数据探索界面，展示交互式查询构建器和可视化" border />

<br/>

本指南将引导你完成将 Hashboard 与 ClickHouse 实例连接的步骤。你也可以在 Hashboard 的 [ClickHouse 集成文档](https://docs.hashboard.com/docs/database-connections/clickhouse) 中找到相同信息。

## 前提条件 {#pre-requisites}

- 一个 ClickHouse 数据库，可以部署在你自己的基础设施上，或托管在 [ClickHouse Cloud](https://clickhouse.com/) 上。
- 一个 [Hashboard 账户](https://hashboard.com/getAccess) 以及一个项目。

## 将 Hashboard 连接到 ClickHouse 的步骤 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. 在 Hashboard 中添加新的数据库连接 {#2-add-a-new-database-connection-in-hashboard}

1. 进入你的 [Hashboard 项目](https://hashboard.com/app)。
2. 点击侧边导航栏中的齿轮图标，打开 Settings 页面。
3. 点击 `+ New Database Connection`。
4. 在弹出窗口中选择 "ClickHouse"。
5. 使用之前收集的信息填写 **Connection Name**、**Host**、**Port**、**Username**、**Password** 和 **Database** 字段。
6. 点击 "Test" 以验证连接是否已成功配置。
7. 点击 "Add"。

你的 ClickHouse 数据库现在已经连接到 Hashboard。接下来，你可以开始构建 [Data Models](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations)、[Metrics](https://docs.hashboard.com/docs/metrics) 和 [Dashboards](https://docs.hashboard.com/docs/dashboards)。有关这些功能的更多详细信息，请参阅对应的 Hashboard 文档。

## 了解更多 {#learn-more}

如需了解更多高级功能和故障排查内容，请访问 [Hashboard 文档](https://docs.hashboard.com/)。