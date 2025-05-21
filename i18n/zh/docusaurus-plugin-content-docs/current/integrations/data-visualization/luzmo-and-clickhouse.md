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
'description': 'Luzmo is an embedded analytics platform with a native ClickHouse integration,
  purpose-built for Software and SaaS applications.'
'title': 'Integrating Luzmo with ClickHouse'
'sidebar': 'integrations'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将Luzmo与ClickHouse集成

<CommunityMaintainedBadge/>

## 1. 设置ClickHouse连接 {#1-setup-a-clickhouse-connection}

要连接到ClickHouse，请导航到**Connections page**（连接页面），选择**New Connection**（新连接），然后在新连接对话框中选择ClickHouse。

<Image img={luzmo_01} size="md" alt="Luzmo界面显示创建新连接对话框，选择ClickHouse" border />

系统会要求您提供**host**（主机）、**username**（用户名）和**password**（密码）：

<Image img={luzmo_02} size="md" alt="Luzmo连接配置表单，显示ClickHouse主机、用户名和密码的字段" border />

*   **Host**（主机）：这是您的ClickHouse数据库暴露的主机。请注意，这里只允许使用`https`以安全地传输数据。主机URL的结构期望为：`https://url-to-clickhouse-db:port/database`。
    默认情况下，插件将连接到'default'数据库和443端口。通过在'/'后提供一个数据库，您可以配置要连接到的数据库。
*   **Username**（用户名）：用于连接到您的ClickHouse集群的用户名。
*   **Password**（密码）：用于连接到您的ClickHouse集群的密码。

请参阅我们开发者文档中的实例，以了解如何通过我们的API[创建与ClickHouse的连接](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody)。

## 2. 添加数据集 {#2-add-datasets}

连接到ClickHouse后，您可以按[这里](https://academy.luzmo.com/article/ldx3iltg)所述添加数据集。您可以选择一个或多个在ClickHouse中可用的数据集，并在Luzmo中[链接](https://academy.luzmo.com/article/gkrx48x5)它们，以确保它们可以一起在仪表板中使用。同时，请务必查看关于[为分析准备数据](https://academy.luzmo.com/article/u492qov0)的文章。

要了解如何使用我们的API添加数据集，请参考[我们开发者文档中的这个例子](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody)。

现在，您可以使用您的数据集构建美观的（嵌入式）仪表板，甚至为AI数据分析师（[Luzmo IQ](https://luzmo.com/iq)）赋能，以回答客户的问题。

<Image img={luzmo_03} size="md" alt="Luzmo仪表板示例，显示来自ClickHouse的数据的多个可视化" border />

## 使用注意事项 {#usage-notes}

1. Luzmo ClickHouse连接器使用HTTP API接口（通常运行在8123端口）进行连接。
2. 如果您使用`Distributed`表引擎的表，当`distributed_product_mode`为`deny`时，某些Luzmo图表可能会失败。然而，这种情况只能在将表链接到另一个表并在图表中使用该链接时发生。在这种情况下，请确保为ClickHouse集群内设置一个更合适的`distributed_product_mode`选项。如果您使用ClickHouse Cloud，可以安全地忽略此设置。
3. 为了确保只有Luzmo应用程序可以访问您的ClickHouse实例，强烈建议**将[ Luzmo静态IP地址范围](https://academy.luzmo.com/article/u9on8gbm)列入白名单**。我们还建议使用技术只读用户。
4. ClickHouse连接器当前支持以下数据类型：

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
