---
sidebar_label: '从 MongoDB 摄取数据到 ClickHouse'
description: '介绍如何将 MongoDB 无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/mongodb
title: '从 MongoDB 摄取数据到 ClickHouse（使用 CDC）'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'


# 将 MongoDB 数据摄取到 ClickHouse（使用 CDC（变更数据捕获）） \{#ingesting-data-from-mongodb-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
通过 ClickPipes 将 MongoDB 的数据摄取到 ClickHouse Cloud 目前处于公开测试阶段。
:::

:::note
在 ClickHouse Cloud 控制台和文档中，针对 MongoDB，“table”和“collection”这两个术语可互换使用。
:::

你可以使用 ClickPipes 将 MongoDB 数据库中的数据摄取到 ClickHouse Cloud。源 MongoDB 数据库可以托管在本地部署环境，或者使用 MongoDB Atlas 等服务托管在云上。

## 前置条件 \{#prerequisites\}

在开始之前，先确保你的 MongoDB 数据库已正确配置为支持复制。具体配置步骤取决于你如何部署 MongoDB，请参考以下相应指南：

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [通用 MongoDB](./mongodb/source/generic)

3. [Amazon DocumentDB](./mongodb/source/documentdb)

源 MongoDB 数据库配置完成后，即可继续创建 ClickPipe。

## 创建 ClickPipe \{#create-your-clickpipe\}

请确保您已登录到 ClickHouse Cloud 帐户。如果还没有帐户，可以在[这里](https://cloud.clickhouse.com/)注册。

1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud Service。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击 “Set up a ClickPipe”。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 `MongoDB CDC` 卡片。

<Image img={mongodb_tile} alt="选择 MongoDB" size="lg" border/>

### 添加源 MongoDB 数据库连接 \{#add-your-source-mongodb-database-connection\}

4. 填写在前提条件步骤中配置的源 MongoDB 数据库的连接详细信息。

   :::info
   在开始填写连接详细信息之前，请确保已在防火墙规则中将 ClickPipes IP 地址加入白名单。您可以在下述页面找到 [ClickPipes IP 地址列表](../index.md#list-of-static-ips)。
   更多信息请参阅[本页顶部](#prerequisites)链接的源 MongoDB 配置指南。
   :::

   <Image img={mongodb_connection_details} alt="填写连接详细信息" size="lg" border/>

#### (可选)配置 SSH 隧道 \{#optional-set-up-ssh-tunneling\}

如果源 MongoDB 数据库不可公开访问,可以配置 SSH 隧道连接。

1. 启用"使用 SSH 隧道"开关。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 若使用基于密钥的身份验证,点击"撤销并生成密钥对"生成新密钥对,并将生成的公钥复制到 SSH 服务器的 `~/.ssh/authorized_keys` 文件中。
4. 点击"验证连接"验证连接。

:::note
请确保在 SSH 堡垒主机的防火墙规则中将 [ClickPipes IP 地址](../clickpipes#list-of-static-ips)加入白名单,以便 ClickPipes 能够建立 SSH 隧道。
:::

填写完连接详细信息后,点击 `下一步`。

#### 配置高级设置 \{#advanced-settings\}

如有需要，您可以配置高级设置。下面简要说明每个设置的含义：

- **Sync interval**：ClickPipes 轮询源数据库以检测变更的时间间隔。该设置会影响目标 ClickHouse 服务的资源消耗；对于对成本敏感的用户，我们建议将其设置为较大的数值（高于 `3600`）。
- **Pull batch size**：单次批量抓取的行数。这是一个尽力而为型的配置项，在某些情况下可能不会被严格遵守。
- **Snapshot number of tables in parallel**：执行初始快照时并行抓取的表数量。当您有大量表且希望控制并行抓取的表数量时，该设置非常有用。

### 配置表 \{#configure-the-tables\}

5. 在此步骤中，您可以为 ClickPipe 选择目标数据库。您可以选择一个现有数据库，或创建一个新数据库。

   <Image img={select_destination_db} alt="选择目标数据库" size="lg" border/>

6. 您可以选择要从源 MongoDB 数据库复制的表。在选择这些表时，您还可以为目标 ClickHouse 数据库中的表重命名。

### 检查权限并启动 ClickPipe \{#review-permissions-and-start-the-clickpipe\}

7. 在权限下拉菜单中选择“Full access”角色，然后点击“Complete Setup”。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## 接下来该做什么？ \{#whats-next\}

在通过 ClickPipe 将数据从 MongoDB 复制到 ClickHouse Cloud 之后，你就可以专注于如何对数据进行查询和建模，以获得最佳性能。

## 注意事项 \{#caveats\}

在使用此连接器时，需要注意以下几点：

- 需要使用 MongoDB 版本 5.1.0 及以上。
- 我们使用 MongoDB 原生的 Change Streams API 实现 CDC（变更数据捕获），其依赖 MongoDB 的 oplog 来捕获实时变更。
- 来自 MongoDB 的文档会默认以 ClickHouse 中的 JSON 类型进行复制。这样可以实现更灵活的 schema 管理，并使您能够在 ClickHouse 中使用丰富的 JSON 运算符进行查询和分析。您可以在[此处](https://clickhouse.com/docs/sql-reference/data-types/newjson)进一步了解如何查询 JSON 数据。
- 目前尚不支持自助配置 PrivateLink。如果您在 AWS 上并且需要使用 PrivateLink，请发送邮件至 db-integrations-support@clickhouse.com 或创建支持工单——我们会与您协作为您启用该功能。