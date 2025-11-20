---
sidebar_label: '从 MongoDB 导入数据到 ClickHouse'
description: '介绍如何将 MongoDB 无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/mongodb
title: '从 MongoDB 导入数据到 ClickHouse（使用 CDC）'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# 使用 CDC 将数据从 MongoDB 导入 ClickHouse

<BetaBadge/>

:::info
通过 ClickPipes 将数据从 MongoDB 导入 ClickHouse Cloud 的功能目前处于公开测试阶段。
:::

:::note
在 ClickHouse Cloud 控制台和文档中，对于 MongoDB，“table”和“collection”这两个术语可以互换使用。
:::

你可以使用 ClickPipes 将 MongoDB 数据库中的数据导入 ClickHouse Cloud。源 MongoDB 数据库可以部署在本地，或通过 MongoDB Atlas 等云服务托管在云端。



## 前置条件 {#prerequisites}

开始之前,您需要确保 MongoDB 数据库已正确配置复制功能。具体配置步骤取决于您的 MongoDB 部署方式,请参考以下相关指南:

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [通用 MongoDB](./mongodb/source/generic)

完成源 MongoDB 数据库配置后,即可继续创建 ClickPipe。


## 创建 ClickPipe {#create-your-clickpipe}

请确保您已登录 ClickHouse Cloud 账户。如果您还没有账户,可以在[此处](https://cloud.clickhouse.com/)注册。

1. 在 ClickHouse Cloud 控制台中,导航至您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt='ClickPipes 服务' size='lg' border />

2. 在左侧菜单中选择 `Data Sources` 按钮,然后点击"Set up a ClickPipe"。

<Image img={cp_step0} alt='选择导入' size='lg' border />

3. 选择 `MongoDB CDC` 选项。

<Image img={mongodb_tile} alt='选择 MongoDB' size='lg' border />

### 添加源 MongoDB 数据库连接 {#add-your-source-mongodb-database-connection}

4. 填写您在前提条件步骤中配置的源 MongoDB 数据库连接详细信息。

   :::info
   在开始添加连接详细信息之前,请确保您已在防火墙规则中将 ClickPipes IP 地址加入白名单。您可以在以下页面找到 [ClickPipes IP 地址列表](../index.md#list-of-static-ips)。
   有关更多信息,请参阅[本页顶部](#prerequisites)链接的源 MongoDB 设置指南。
   :::

   <Image
     img={mongodb_connection_details}
     alt='填写连接详细信息'
     size='lg'
     border
   />

填写完连接详细信息后,点击 `Next`。

#### 配置高级设置 {#advanced-settings}

如有需要,您可以配置高级设置。以下是各项设置的简要说明:

- **同步间隔**: ClickPipes 轮询源数据库以获取变更的时间间隔。这会影响目标 ClickHouse 服务,对于成本敏感的用户,我们建议将此值设置得更高(超过 `3600`)。
- **拉取批次大小**: 单次批处理中获取的行数。这是一个尽力而为的设置,在某些情况下可能无法严格遵守。
- **并行快照表数量**: 初始快照期间并行获取的表数量。当您有大量表并希望控制并行获取的表数量时,此设置非常有用。

### 配置表 {#configure-the-tables}

5. 在此处您可以为 ClickPipe 选择目标数据库。您可以选择现有数据库或创建新数据库。

   <Image
     img={select_destination_db}
     alt='选择目标数据库'
     size='lg'
     border
   />

6. 您可以选择要从源 MongoDB 数据库复制的表。在选择表时,您还可以选择在目标 ClickHouse 数据库中重命名这些表。

### 检查权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

7. 从权限下拉菜单中选择"Full access"角色,然后点击"Complete Setup"。

   <Image img={ch_permissions} alt='检查权限' size='lg' border />


## 下一步 {#whats-next}

完成 ClickPipe 的配置,将数据从 MongoDB 复制到 ClickHouse Cloud 后,您可以专注于如何查询和建模数据以实现最佳性能。


## 注意事项 {#caveats}

使用此连接器时需要注意以下几点:

- 要求 MongoDB 版本为 5.1.0 或更高版本。
- 我们使用 MongoDB 原生的 Change Streams API 进行 CDC,该 API 依赖 MongoDB oplog 来捕获实时变更。
- 默认情况下,来自 MongoDB 的文档会以 JSON 类型复制到 ClickHouse 中。这允许灵活的模式管理,并可以使用 ClickHouse 中丰富的 JSON 操作符进行查询和分析。您可以在[此处](https://clickhouse.com/docs/sql-reference/data-types/newjson)了解更多关于查询 JSON 数据的信息。
- 目前暂不支持自助配置 PrivateLink。如果您使用 AWS 并需要 PrivateLink,请联系 db-integrations-support@clickhouse.com 或创建支持工单,我们将与您合作启用该功能。
