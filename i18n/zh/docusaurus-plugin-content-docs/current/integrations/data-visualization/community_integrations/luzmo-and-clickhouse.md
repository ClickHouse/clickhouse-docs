---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo 是一款嵌入式分析平台，提供对 ClickHouse 的原生集成，专为软件和 SaaS 应用打造。'
title: '将 Luzmo 与 ClickHouse 集成'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Luzmo 与 ClickHouse 集成

<CommunityMaintainedBadge/>



## 1. 设置 ClickHouse 连接 {#1-setup-a-clickhouse-connection}

要建立与 ClickHouse 的连接,请导航至 **Connections 页面**,选择 **New Connection**,然后从 New Connection 模态框中选择 ClickHouse。

<Image
  img={luzmo_01}
  size='md'
  alt='Luzmo 界面显示已选择 ClickHouse 的创建新连接对话框'
  border
/>

系统将要求您提供 **host**、**username** 和 **password**:

<Image
  img={luzmo_02}
  size='md'
  alt='Luzmo 连接配置表单显示 ClickHouse 主机、用户名和密码字段'
  border
/>

- **Host**: 这是您的 ClickHouse 数据库所在的主机地址。请注意,此处仅允许使用 `https` 以确保数据传输的安全性。主机 URL 的格式为:`https://url-to-clickhouse-db:port/database`
  默认情况下,插件将连接到 'default' 数据库和 443 端口。您可以在 '/' 后指定数据库名称来配置要连接的数据库。
- **Username**: 用于连接到您的 ClickHouse 集群的用户名。
- **Password**: 连接到您的 ClickHouse 集群的密码

请参阅我们开发者文档中的示例,了解如何通过 API [创建到 ClickHouse 的连接](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)。


## 2. 添加数据集 {#2-add-datasets}

连接 ClickHouse 后,您可以按照[此处](https://academy.luzmo.com/article/ldx3iltg)的说明添加数据集。您可以选择 ClickHouse 中可用的一个或多个数据集,并在 Luzmo 中[关联](https://academy.luzmo.com/article/gkrx48x5)它们,以确保可以在仪表板中一起使用。另外,请务必查看这篇关于[为分析准备数据](https://academy.luzmo.com/article/u492qov0)的文章。

要了解如何使用 API 添加数据集,请参阅[开发者文档中的示例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)。

现在,您可以使用这些数据集构建精美的(嵌入式)仪表板,甚至可以为 AI 数据分析师([Luzmo IQ](https://luzmo.com/iq))提供支持,让其回答客户的问题。

<Image
  img={luzmo_03}
  size='md'
  alt='Luzmo 仪表板示例,展示了来自 ClickHouse 的多种数据可视化'
  border
/>


## 使用说明 {#usage-notes}

1. Luzmo ClickHouse 连接器使用 HTTP API 接口(通常运行在 8123 端口)进行连接。
2. 如果您使用 `Distributed` 表引擎的表,当 `distributed_product_mode` 设置为 `deny` 时,某些 Luzmo 图表可能会失败。但是,这种情况仅在您将表关联到另一个表并在图表中使用该关联时才会发生。在这种情况下,请确保将 `distributed_product_mode` 设置为适合您 ClickHouse 集群的其他选项。如果您使用的是 ClickHouse Cloud,则可以放心忽略此设置。
3. 为了确保只有 Luzmo 应用程序可以访问您的 ClickHouse 实例,强烈建议将 [Luzmo 静态 IP 地址范围](https://academy.luzmo.com/article/u9on8gbm)加入**白名单**。我们还建议使用技术性只读用户。
4. ClickHouse 连接器目前支持以下数据类型:

   | ClickHouse 类型 | Luzmo 类型 |
   | --------------- | ---------- |
   | UInt            | numeric    |
   | Int             | numeric    |
   | Float           | numeric    |
   | Decimal         | numeric    |
   | Date            | datetime   |
   | DateTime        | datetime   |
   | String          | hierarchy  |
   | Enum            | hierarchy  |
   | FixedString     | hierarchy  |
   | UUID            | hierarchy  |
   | Bool            | hierarchy  |
