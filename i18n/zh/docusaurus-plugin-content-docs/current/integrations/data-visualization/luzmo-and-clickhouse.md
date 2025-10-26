---
'sidebar_label': 'Luzmo'
'slug': '/integrations/luzmo'
'keywords':
- 'clickhouse'
- 'Luzmo'
- 'connect'
- 'integrate'
- 'ui'
- 'embedded'
'description': 'Luzmo 是一个嵌入式分析平台，具有原生 ClickHouse 集成功能，专为软件和 SaaS 应用程序而设计。'
'title': '将 Luzmo 与 ClickHouse 集成'
'sidebar': 'integrations'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Luzmo 与 ClickHouse 集成

<CommunityMaintainedBadge/>

## 1. 设置 ClickHouse 连接 {#1-setup-a-clickhouse-connection}

要连接到 ClickHouse，请导航到 **Connections page**，选择 **New Connection**，然后在新连接模态框中选择 ClickHouse。

<Image img={luzmo_01} size="md" alt="Luzmo 界面显示创建新连接对话框，已选择 ClickHouse" border />

系统会提示您提供 **host**、**username** 和 **password**：

<Image img={luzmo_02} size="md" alt="Luzmo 连接配置表单显示 ClickHouse 的 host、username 和 password 字段" border />

*   **Host**：这是您的 ClickHouse 数据库暴露的主机。请注意，这里仅允许使用 `https` 以安全地传输数据。主机 URL 的结构为：`https://url-to-clickhouse-db:port/database`
    默认情况下，该插件将连接到 'default' 数据库和 443 端口。通过在 '/' 后提供数据库，您可以配置要连接的数据库。
*   **Username**：将用于连接到您的 ClickHouse 集群的用户名。
*   **Password**：连接到您的 ClickHouse 集群的密码。

请参考我们开发者文档中的示例，了解如何通过我们的 API [创建连接到 ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)。

## 2. 添加数据集 {#2-add-datasets}

连接到 ClickHouse 后，您可以按照 [此处](https://academy.luzmo.com/article/ldx3iltg) 所述添加数据集。您可以选择您的 ClickHouse 中可用的一个或多个数据集，并在 Luzmo 中 [链接](https://academy.luzmo.com/article/gkrx48x5) 它们，以确保可以在仪表板中一起使用。还请务必查看本文，了解 [为分析准备数据](https://academy.luzmo.com/article/u492qov0)。

有关如何使用我们的 API 添加数据集的信息，请参考 [开发者文档中的此示例](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)。

现在，您可以使用数据集构建精美的（嵌入式）仪表板，甚至为可以回答客户问题的 AI 数据分析师 ([Luzmo IQ](https://luzmo.com/iq)) 提供支持。

<Image img={luzmo_03} size="md" alt="Luzmo 仪表板示例，显示来自 ClickHouse 的多种数据可视化" border />

## 使用注意事项 {#usage-notes}

1. Luzmo ClickHouse 连接器使用 HTTP API 接口（通常在 8123 端口运行）进行连接。
2. 如果您使用带有 `Distributed` 表引擎的表，某些 Luzmo 图表可能在 `distributed_product_mode` 设置为 `deny` 时失败。然而，只有在您将表链接到其他表并在图表中使用该链接时才会发生这种情况。在这种情况下，请确保将 `distributed_product_mode` 设置为适合您 ClickHouse 集群的其他选项。如果您使用的是 ClickHouse Cloud，则可以安全地忽略此设置。
3. 为确保例如只有 Luzmo 应用程序可以访问您的 ClickHouse 实例，强烈建议 **白名单** [Luzmo 的静态 IP 地址范围](https://academy.luzmo.com/article/u9on8gbm)。我们还建议使用技术只读用户。
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
