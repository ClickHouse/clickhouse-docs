---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', '连接', '集成', 'ui', '分析']
description: 'Hashboard 是一个功能强大的分析平台，可轻松与 ClickHouse 集成，实现实时数据分析。'
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

<CommunityMaintainedBadge />

[Hashboard](https://hashboard.com) 是一款交互式数据探索工具，可让组织中的任何人跟踪指标并发现可付诸实践的洞察。Hashboard 会对您的 ClickHouse 数据库直接发起实时 SQL 查询，尤其适合自助式临时数据探索场景。

<Image size="md" img={hashboard_01} alt="显示交互式查询构建器和可视化功能的 Hashboard 数据探索界面" border />

<br />

本指南将逐步介绍如何将 Hashboard 连接到您的 ClickHouse 实例。相关信息也可参阅 Hashboard 的 [ClickHouse integration documentation](https://docs.hashboard.com/docs/database-connections/clickhouse)。

## 前提条件 \{#pre-requisites\}

* 一个部署在您自有基础设施上或托管于 [ClickHouse Cloud](https://clickhouse.com/) 的 ClickHouse 数据库。
* 一个 [Hashboard 账户](https://hashboard.com/getAccess) 和对应项目。

## 将 Hashboard 连接到 ClickHouse 的操作步骤 \{#steps-to-connect-hashboard-to-clickhouse\}

### 1. 准备您的连接信息 \{#1-gather-your-connection-details\}

<ConnectionDetails />

### 2. 在 Hashboard 中添加新的数据库连接 \{#2-add-a-new-database-connection-in-hashboard\}

1. 前往你的 [Hashboard 项目](https://hashboard.com/app)。
2. 点击侧边导航栏中的齿轮图标，打开 Settings 页面。
3. 点击 `+ New Database Connection`。
4. 在弹窗中选择“ClickHouse”。
5. 使用前面收集的信息填写 **Connection Name**、**Host**、**Port**、**Username**、**Password** 和 **Database** 字段。
6. 点击“Test”，验证连接是否已成功配置。
7. 点击“Add”

你的 ClickHouse 数据库现已连接到 Hashboard，接下来可以继续创建 [数据模型](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[Explorations](https://docs.hashboard.com/docs/visualizing-data/explorations)、[指标](https://docs.hashboard.com/docs/metrics) 和 [仪表盘](https://docs.hashboard.com/docs/dashboards)。有关这些功能的更多信息，请参阅相应的 Hashboard 文档。

## 了解更多 \{#learn-more\}

如需了解更多高级功能和故障排查信息，请参阅 [Hashboard 文档](https://docs.hashboard.com/)。