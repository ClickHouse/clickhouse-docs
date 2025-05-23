---
'sidebar_label': 'Hashboard'
'sidebar_position': 132
'slug': '/integrations/hashboard'
'keywords':
- 'clickhouse'
- 'Hashboard'
- 'connect'
- 'integrate'
- 'ui'
- 'analytics'
'description': 'Hashboard 是一个强大的分析平台，可以轻松与 ClickHouse 集成进行实时数据分析。'
'title': '将 ClickHouse 连接到 Hashboard'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 ClickHouse 连接到 Hashboard

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) 是一款交互式数据探索工具，使您组织中的任何人都能跟踪指标并发现可操作的洞察。 Hashboard 向您的 ClickHouse 数据库发出实时 SQL 查询，特别适用于自助式、临时的数据探索用例。

<Image size="md" img={hashboard_01} alt="Hashboard 数据探索器界面，显示交互式查询构建器和可视化" border />

<br/>

本指南将指导您完成将 Hashboard 连接到您的 ClickHouse 实例的步骤。此信息也可以在 Hashboard 的 [ClickHouse 集成文档](https://docs.hashboard.com/docs/database-connections/clickhouse) 中找到。

## 先决条件 {#pre-requisites}

- 一个 ClickHouse 数据库，可以在您自己的基础设施上托管，也可以在 [ClickHouse Cloud](https://clickhouse.com/) 上托管。
- 一个 [Hashboard 账户](https://hashboard.com/getAccess) 和项目。

## 将 Hashboard 连接到 ClickHouse 的步骤 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 收集您的连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. 在 Hashboard 中添加一个新的数据库连接 {#2-add-a-new-database-connection-in-hashboard}

1. 导航到您的 [Hashboard 项目](https://hashboard.com/app)。
2. 点击侧边导航栏中的齿轮图标，打开设置页面。
3. 点击 `+ 新建数据库连接`。
4. 在弹出窗口中选择 "ClickHouse"。
5. 使用之前收集的信息填写 **连接名称**、**主机**、**端口**、**用户名**、**密码** 和 **数据库** 字段。
6. 点击 "测试"，验证连接是否配置成功。
7. 点击 "添加"

您的 ClickHouse 数据库现在已连接到 Hashboard，您可以继续构建 [数据模型](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[探索](https://docs.hashboard.com/docs/visualizing-data/explorations)、[指标](https://docs.hashboard.com/docs/metrics) 和 [仪表板](https://docs.hashboard.com/docs/dashboards)。有关这些功能的更多详细信息，请参阅相应的 Hashboard 文档。

## 了解更多 {#learn-more}

有关更多高级功能和故障排除，请访问 [Hashboard 的文档](https://docs.hashboard.com/)。
