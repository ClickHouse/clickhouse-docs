---
'sidebar_label': '从 MongoDB 到 ClickHouse 导入数据'
'description': '描述如何无缝连接您的 MongoDB 到 ClickHouse Cloud.'
'slug': '/integrations/clickpipes/mongodb'
'title': '从 MongoDB 到 ClickHouse (使用 CDC) 导入数据'
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# 从 MongoDB 向 ClickHouse 导入数据（使用 CDC）

<BetaBadge/>

:::info
通过 ClickPipes 从 MongoDB 向 ClickHouse Cloud 导入数据处于公开测试阶段。
:::

:::note
在 ClickHouse Cloud 控制台和文档中，“表”和“集合”可以互换使用，适用于 MongoDB。
:::

您可以使用 ClickPipes 将数据从 MongoDB 数据库导入到 ClickHouse Cloud。源 MongoDB 数据库可以托管在本地或云端，如使用 MongoDB Atlas 等服务。

## 前提条件 {#prerequisites}

首先，您需要确保您的 MongoDB 数据库已正确配置用于复制。配置步骤取决于您如何部署 MongoDB，因此请遵循以下相关指南：

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [通用 MongoDB](./mongodb/source/generic)

一旦您的源 MongoDB 数据库设置完成，您可以继续创建您的 ClickPipe。

## 创建您的 ClickPipe {#create-your-clickpipe}

确保您已登录到您的 ClickHouse Cloud 账户。如果您还没有账户，可以 [在这里注册](https://cloud.clickhouse.com/)。

1. 在 ClickHouse Cloud 控制台中，导航至您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击“设置 ClickPipe”。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 `MongoDB CDC` 瓦片。

<Image img={mongodb_tile} alt="选择 MongoDB" size="lg" border/>

### 添加您的源 MongoDB 数据库连接 {#add-your-source-mongodb-database-connection}

4. 填写您在前提条件步骤中配置的源 MongoDB 数据库的连接详细信息。

   :::info
   在开始添加连接详细信息之前，请确保您已在防火墙规则中白名单 ClickPipes 的 IP 地址。在以下页面，您可以找到 [ClickPipes IP 地址列表](../index.md#list-of-static-ips)。
   有关更多信息，请参考在 [本页面顶部](#prerequisites) 链接的源 MongoDB 设置指南。
   :::

   <Image img={mongodb_connection_details} alt="填写连接详细信息" size="lg" border/>

填写连接详细信息后，点击 `下一步`。

#### 配置高级设置 {#advanced-settings}

如果需要，您可以配置高级设置。下面提供了每个设置的简要描述：

- **同步间隔**：这是 ClickPipes 轮询源数据库以检测更改的间隔。这对目标 ClickHouse 服务有影响，对于费用敏感的用户，我们建议将此值保持在较高的数值（超过 `3600`）。
- **拉取批处理大小**：在单个批处理中获取的行数。这是一个最佳努力设置，可能并不在所有情况下都得到遵守。
- **并行快照表的数量**：在初始快照期间将并行获取的表的数量。当您有大量表时，这很有用，您可以控制并行提取的表的数量。

### 配置表 {#configure-the-tables}

5. 在这里，您可以选择 ClickPipe 的目标数据库。您可以选择现有数据库或创建一个新数据库。

   <Image img={select_destination_db} alt="选择目标数据库" size="lg" border/>

6. 您可以选择要从源 MongoDB 数据库复制的表。在选择表时，您还可以选择重命名目标 ClickHouse 数据库中的表。

### 审查权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

7. 从权限下拉菜单中选择“完全访问”角色，然后点击“完成设置”。

   <Image img={ch_permissions} alt="审查权限" size="lg" border/>

## 接下来是什么？ {#whats-next}

一旦您设置好 ClickPipe 从 MongoDB 向 ClickHouse Cloud 复制数据，您可以专注于如何查询和建模数据以获得最佳性能。

## 注意事项 {#caveats}

使用此连接器时请注意以下几点：

- 我们要求 MongoDB 版本为 5.1.0+。
- 我们使用 MongoDB 的原生变更流 API 进行 CDC，它依赖于 MongoDB 的 oplog 来捕获实时更改。
- 默认情况下，来自 MongoDB 的文档作为 JSON 类型复制到 ClickHouse。这允许灵活的模式管理，并使得可以使用 ClickHouse 中丰富的 JSON 操作符进行查询和分析。您可以在[这里](https://clickhouse.com/docs/sql-reference/data-types/newjson)了解有关查询 JSON 数据的更多信息。
- 自助式 PrivateLink 配置目前不可用。如果您在 AWS 上并需要 PrivateLink，请联系 db-integrations-support@clickhouse.com 或创建支持票据——我们将与您合作以启用它。
