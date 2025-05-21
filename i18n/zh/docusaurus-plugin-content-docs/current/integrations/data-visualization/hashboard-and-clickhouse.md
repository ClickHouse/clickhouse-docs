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
'description': 'Hashboard is a robust analytics platform that can be easily integrated
  with ClickHouse for real-time data analysis.'
'title': 'Connecting ClickHouse to Hashboard'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 ClickHouse 与 Hashboard

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) 是一个交互式数据探索工具，使您组织中的任何人都可以跟踪指标并发现可行的见解。 Hashboard 向您的 ClickHouse 数据库发出实时 SQL 查询，对于自助式的临时数据探索用例特别有用。

<Image size="md" img={hashboard_01} alt="Hashboard 数据探索界面显示交互式查询构建器和可视化" border />

<br/>

本指南将引导您完成将 Hashboard 连接到 ClickHouse 实例的步骤。此信息也可在 Hashboard 的 [ClickHouse 集成文档](https://docs.hashboard.com/docs/database-connections/clickhouse) 中找到。

## 前提条件 {#pre-requisites}

- 一个 ClickHouse 数据库，可以托管在您的基础设施上或在 [ClickHouse Cloud](https://clickhouse.com/) 上。
- 一个 [Hashboard 账户](https://hashboard.com/getAccess) 和项目。

## 将 Hashboard 连接到 ClickHouse 的步骤 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. 在 Hashboard 中添加新的数据库连接 {#2-add-a-new-database-connection-in-hashboard}

1. 导航到您的 [Hashboard 项目](https://hashboard.com/app)。
2. 通过点击侧边导航栏中的齿轮图标打开“设置”页面。
3. 点击 `+ 新数据库连接`。
4. 在弹出窗口中，选择“ClickHouse”。
5. 用前面收集的信息填写 **连接名称**、**主机**、**端口**、**用户名**、**密码** 和 **数据库** 字段。
6. 点击“测试”以验证连接是否配置成功。
7. 点击“添加”

您的 ClickHouse 数据库现在已经连接到 Hashboard，您可以通过构建 [数据模型](https://docs.hashboard.com/docs/data-modeling/add-data-model)、[探索](https://docs.hashboard.com/docs/visualizing-data/explorations)、[指标](https://docs.hashboard.com/docs/metrics) 和 [仪表板](https://docs.hashboard.com/docs/dashboards) 来继续操作。有关这些功能的更多详细信息，请参阅相应的 Hashboard 文档。

## 了解更多 {#learn-more}

有关更多高级功能和故障排除，请访问 [Hashboard 的文档](https://docs.hashboard.com/)。
