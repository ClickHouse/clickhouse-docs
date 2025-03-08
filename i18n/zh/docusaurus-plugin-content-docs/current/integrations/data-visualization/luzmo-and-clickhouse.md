---
sidebar_label: 'Luzmo'
slug: '/integrations/luzmo'
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo 是一个嵌入式分析平台，具有原生的 ClickHouse 集成，专为软件和 SaaS 应用程序而设计。'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';


# 将 Luzmo 与 ClickHouse 集成

## 1. 设置 ClickHouse 连接 {#1-setup-a-clickhouse-connection}

要连接到 ClickHouse，请导航到 **Connections page**，选择 **New Connection**，然后在新连接模态中选择 ClickHouse。

<p>
  <img src={luzmo_01} class="image" alt="创建 ClickHouse 连接" />
</p>

系统会要求您提供 **host**、**username** 和 **password**：

<p>
  <img src={luzmo_02} class="image" alt="提供 ClickHouse 连接详细信息" />
</p>

*   **Host**：这是您的 ClickHouse 数据库所暴露的主机。请注意，这里只允许使用 `https`，以安全地通过网络传输数据。主机 URL 的结构应为：`https://url-to-clickhouse-db:port/database`
    默认情况下，插件将连接到 'default' 数据库和 443 端口。您可以在 '/' 后提供一个数据库，以配置要连接的数据库。
*   **Username**：将用于连接到您的 ClickHouse 集群的用户名。
*   **Password**：连接到您的 ClickHouse 集群的密码。

请查阅我们开发者文档中的示例，以了解如何通过我们的 API [创建 ClickHouse 连接](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)。

## 2. 添加数据集 {#2-add-datasets}

连接到 ClickHouse 后，您可以按照 [这里](https://academy.luzmo.com/article/ldx3iltg) 的说明添加数据集。您可以选择一个或多个可用的 ClickHouse 数据集并在 Luzmo 中 [链接](https://academy.luzmo.com/article/gkrx48x5) 这些数据集，以确保它们可以在仪表板中一起使用。还请务必查看此文章 [为分析准备数据](https://academy.luzmo.com/article/u492qov0)。

要了解如何使用我们的 API 添加数据集，请查阅 [我们开发者文档中的这个示例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)。

您现在可以使用您的数据集构建美观的（嵌入式）仪表板，甚至可以支持一个可以回答客户问题的 AI 数据分析师 ([Luzmo IQ](https://luzmo.com/iq))。

<p>
  <img src={luzmo_03} class="image" alt="Luzmo 仪表板示例" />
</p>

## 使用说明 {#usage-notes}

1. Luzmo ClickHouse 连接器使用 HTTP API 接口（通常运行在 8123 端口）进行连接。
2. 如果您使用具有 `Distributed` 表引擎的表，当 `distributed_product_mode` 为 `deny` 时，一些 Luzmo 图表可能会失败。但是，这种情况只有在您将表链接到另一个表并在图表中使用该链接时才会发生。在这种情况下，请确保将 `distributed_product_mode` 设置为在您的 ClickHouse 集群内合适的其他选项。如果您使用的是 ClickHouse Cloud，可以安全地忽略此设置。
3. 为确保只有 Luzmo 应用程序可以访问您的 ClickHouse 实例，强烈建议您 **白名单** [Luzmo 的静态 IP 地址范围](https://academy.luzmo.com/article/u9on8gbm)。我们还建议使用技术只读用户。
4. ClickHouse 连接器当前支持以下数据类型：

    | ClickHouse 类型 | Luzmo 类型 |
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
