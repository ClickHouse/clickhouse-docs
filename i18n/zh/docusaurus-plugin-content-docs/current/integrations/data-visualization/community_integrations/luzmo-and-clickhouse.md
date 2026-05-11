---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo 是一款嵌入式分析平台，提供原生 ClickHouse 集成，专为软件和 SaaS 应用打造。'
title: '将 Luzmo 与 ClickHouse 集成'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Luzmo 与 ClickHouse 集成 \{#integrating-luzmo-with-clickhouse\}

<CommunityMaintainedBadge/>

## 1. 配置 ClickHouse 连接 \{#1-setup-a-clickhouse-connection\}

要与 ClickHouse 建立连接，进入 **Connections 页面**，选择 **New Connection**，然后在 New Connection 对话框中选择 ClickHouse。

<Image img={luzmo_01} size="md" alt="Luzmo 界面显示 Create a New Connection 对话框，并选中了 ClickHouse" border />

系统会要求你提供 **host**、**username** 和 **password**：

<Image img={luzmo_02} size="md" alt="Luzmo 连接配置表单，展示了 ClickHouse host、username 和 password 字段" border />

*   **Host**：ClickHouse 数据库对外提供服务的主机地址。请注意，这里仅允许使用 `https`，以便在网络上传输数据时保证安全。host URL 的结构应为：`https://url-to-clickhouse-db:port/database`
    默认情况下，插件会连接到 `default` 数据库和 443 端口。通过在 `/` 之后指定数据库名称，你可以配置要连接的具体数据库。
*   **Username**：用于连接到 ClickHouse 集群的用户名。
*   **Password**：用于连接到 ClickHouse 集群的密码。

请参阅我们的开发者文档中的示例，了解如何通过 API [创建到 ClickHouse 的连接](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)。

## 2. 添加数据集 \{#2-add-datasets\}

连接好 ClickHouse 之后，您可以按照[这篇文章](https://academy.luzmo.com/article/ldx3iltg)中的说明添加数据集。您可以选择 ClickHouse 中可用的一个或多个数据集，并在 Luzmo 中[将它们关联](https://academy.luzmo.com/article/gkrx48x5)，以确保它们可以在同一个仪表盘中联合作用。也请务必查看这篇关于[为分析准备数据](https://academy.luzmo.com/article/u492qov0)的文章。

如需了解如何使用我们的 API 添加数据集，请参考[开发者文档中的这个示例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)。

现在，您可以使用这些数据集构建精美的（可嵌入）仪表盘，甚至驱动一个 AI 数据分析助手（[Luzmo IQ](https://luzmo.com/iq)），用于回答您客户的问题。

<Image img={luzmo_03} size="md" alt="Luzmo 仪表盘示例，展示了来自 ClickHouse 的多个数据可视化" border />

## 使用说明 \{#usage-notes\}

1. Luzmo ClickHouse 连接器使用 HTTP API（通常监听在 8123 端口）进行连接。
2. 如果你使用了 `Distributed` 表引擎的表，当 `distributed_product_mode` 为 `deny` 时，某些 Luzmo 图表可能会出现失败。不过，这通常只会在你将该表关联到另一张表，并在图表中使用该关联时发生。在这种情况下，请确保在你的 ClickHouse 集群中将 `distributed_product_mode` 设置为对你的场景更合适的其他选项。如果你使用的是 ClickHouse Cloud，则可以放心忽略此设置。
3. 为确保例如只有 Luzmo 应用能够访问你的 ClickHouse 实例，强烈建议你**将 [Luzmo 的静态 IP 地址范围](https://academy.luzmo.com/article/u9on8gbm) 加入白名单**。我们也建议使用一个用于技术访问的只读用户账号。
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