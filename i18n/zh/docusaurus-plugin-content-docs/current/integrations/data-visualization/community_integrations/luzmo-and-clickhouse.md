---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo 是一款嵌入式分析平台，具有原生 ClickHouse 集成，专为软件和 SaaS 应用而构建。'
title: '将 Luzmo 与 ClickHouse 集成'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Luzmo 与 ClickHouse 集成 {#integrating-luzmo-with-clickhouse}

<CommunityMaintainedBadge/>



## 1. 设置 ClickHouse 连接 {#1-setup-a-clickhouse-connection}

要建立与 ClickHouse 的连接，先进入 **Connections 页面**，选择 **New Connection**，然后在 New Connection 弹窗中选择 ClickHouse。

<Image img={luzmo_01} size="md" alt="Luzmo 界面，显示选中 ClickHouse 的 Create a New Connection 对话框" border />

系统会要求你提供 **host**、**username** 和 **password**：

<Image img={luzmo_02} size="md" alt="Luzmo 连接配置表单，显示 ClickHouse host、username 和 password 字段" border />

*   **Host**：用于对外提供 ClickHouse 数据库服务的主机地址。注意，这里只允许使用 `https`，以便在传输过程中安全地传输数据。host URL 的结构应为：`https://url-to-clickhouse-db:port/database`  
    默认情况下，插件会连接到 `default` 数据库和 443 端口。通过在 `/` 之后添加数据库名称，你可以配置要连接的具体数据库。
*   **Username**：用于连接到 ClickHouse 集群的用户名。
*   **Password**：用于连接到 ClickHouse 集群的密码。

请参考我们开发者文档中的示例，了解如何通过我们的 API [创建 ClickHouse 连接](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)。



## 2. 添加数据集 {#2-add-datasets}

在您连接好 ClickHouse 之后，可以按照[这里](https://academy.luzmo.com/article/ldx3iltg)的说明添加数据集。您可以从 ClickHouse 中选择一个或多个可用的数据集，并在 Luzmo 中将它们[关联](https://academy.luzmo.com/article/gkrx48x5)，以确保它们可以在同一个仪表板中联合使用。同时，请务必查看这篇关于[为分析准备数据](https://academy.luzmo.com/article/u492qov0)的文章。

若要了解如何通过我们的 API 添加数据集，请参阅[开发者文档中的这个示例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)。

现在，您可以使用这些数据集构建精美的（嵌入式）仪表板，甚至驱动一个可以回答您客户问题的 AI 数据分析助手（[Luzmo IQ](https://luzmo.com/iq)）。

<Image img={luzmo_03} size="md" alt="Luzmo 仪表板示例，展示来自 ClickHouse 的多个数据可视化" border />



## 使用说明 {#usage-notes}

1. Luzmo ClickHouse 连接器通过 HTTP API 接口（通常监听 8123 端口）进行连接。
2. 如果你在使用 `Distributed` 表引擎的表，当 `distributed_product_mode` 设置为 `deny` 时，一些 Luzmo 图表可能会执行失败。不过，这通常只会在你将该表与另一张表建立关联并在图表中使用该关联时发生。在这种情况下，请确保在你的 ClickHouse 集群中将 `distributed_product_mode` 设置为对你而言更合适的其他选项。如果你使用的是 ClickHouse Cloud，可以放心忽略此设置。
3. 为确保例如只有 Luzmo 应用能够访问你的 ClickHouse 实例，强烈建议将 [Luzmo 的静态 IP 地址范围](https://academy.luzmo.com/article/u9on8gbm) 加入白名单。我们同样建议使用一个技术型只读用户。
4. ClickHouse 连接器目前支持以下数据类型：

    | ClickHouse Type | Luzmo Type |
    | --- | --- |
    | UInt | numeric |
    | Int | numeric |
    | Float | numeric |
    | Decimal | numeric |
    | Date | datetime |
    | DateTime | datetime |
    | String | hierarchy |
    | Enum | hierarchy |
    | FixedString | hierarchy |
    | UUID | hierarchy |
    | Bool | hierarchy |
