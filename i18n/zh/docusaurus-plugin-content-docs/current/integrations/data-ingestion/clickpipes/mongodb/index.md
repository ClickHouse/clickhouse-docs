---
sidebar_label: '将数据从 MongoDB 摄取到 ClickHouse'
description: '说明如何将 MongoDB 无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/mongodb
title: '使用 CDC 将数据从 MongoDB 摄取到 ClickHouse'
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

# 将数据从 MongoDB 摄取到 ClickHouse（使用 CDC） \{#ingesting-data-from-mongodb-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
通过 ClickPipes 将数据从 MongoDB 摄取到 ClickHouse Cloud 目前处于公开测试阶段。
:::

:::note
在 ClickHouse Cloud 控制台和文档中，对于 MongoDB，「table」和「collection」这两个术语可互换使用。
:::

你可以使用 ClickPipes 将 MongoDB 数据库中的数据摄取到 ClickHouse Cloud 中。源 MongoDB 数据库可以部署在本地，或者使用 MongoDB Atlas 等服务托管在云端。

## 前置条件 \{#prerequisites\}

在开始之前，需要先确保 MongoDB 数据库已正确配置用于复制。配置步骤取决于 MongoDB 的部署方式，请按照下方相应的指南进行操作：

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [通用 MongoDB](./mongodb/source/generic)

3. [Amazon DocumentDB](./mongodb/source/documentdb)

在完成源 MongoDB 数据库的设置之后，即可继续创建 ClickPipe。

## 创建 ClickPipe \{#create-your-clickpipe\}

请确保您已登录到您的 ClickHouse Cloud 账号。如果您还没有账号，可以在[这里](https://cloud.clickhouse.com/)注册。

1. 在 ClickHouse Cloud 控制台中，进入您的 ClickHouse Cloud Service。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击 "Set up a ClickPipe"。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 `MongoDB CDC` 卡片。

<Image img={mongodb_tile} alt="选择 MongoDB" size="lg" border/>

### 添加源 MongoDB 数据库连接 \{#add-your-source-mongodb-database-connection\}

4. 填写您在前置条件步骤中配置的源 MongoDB 数据库连接详细信息。

   :::info
   在开始添加连接详细信息之前，请确保您已在防火墙规则中将 ClickPipes IP 地址加入允许列表。您可以在以下页面找到 [ClickPipes IP 地址列表](../index.md#list-of-static-ips)。
   更多信息请参考[本页顶部](#prerequisites)链接的源 MongoDB 设置指南。
   :::

   <Image img={mongodb_connection_details} alt="填写连接详情" size="lg" border/>

#### （可选）配置 SSH 隧道 \{#optional-set-up-ssh-tunneling\}

如果您的源 MongoDB 数据库不对公网开放，您可以配置 SSH 隧道的相关信息。

1. 启用 "Use SSH Tunnelling" 开关。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt="SSH 隧道" size="lg" border/>

3. 若要使用基于密钥的认证，点击 "Revoke and generate key pair" 以生成新的密钥对，并将生成的公钥复制到 SSH 服务器的 `~/.ssh/authorized_keys` 中。
4. 点击 "Verify Connection" 以验证连接。

:::note
请确保在 SSH 堡垒机的防火墙规则中将 [ClickPipes IP 地址](../clickpipes#list-of-static-ips) 加入允许列表，以便 ClickPipes 可以建立 SSH 隧道。
:::

在填写完连接详细信息后，点击 `Next`。

#### 配置高级设置 \{#advanced-settings\}

如有需要，您可以配置高级设置。以下是每个设置的简要说明：

- **Sync interval**：ClickPipes 轮询源数据库以检测变更的时间间隔。该设置会影响目标 ClickHouse 服务，对于成本敏感型用户，我们建议将其设置为较大的数值（大于 `3600`）。
- **Pull batch size**：单次批量拉取的行数。这是一个尽力而为的目标值，在某些情况下可能无法被严格遵守。
- **Snapshot number of tables in parallel**：初始快照期间并行拉取的表数量。当您拥有大量表并希望控制并行获取的表数量时，这一选项非常有用。

### 配置表 \{#configure-the-tables\}

5. 在这里您可以为 ClickPipe 选择目标数据库。您可以选择一个已有数据库，或者新建一个数据库。

   <Image img={select_destination_db} alt="选择目标数据库" size="lg" border/>

6. 您可以选择要从源 MongoDB 数据库复制的表。在选择表的同时，您也可以选择在目标 ClickHouse 数据库中对这些表进行重命名。

### 审核权限并启动 ClickPipe \{#review-permissions-and-start-the-clickpipe\}

7. 在权限下拉列表中选择 "Full access" 角色，然后点击 "Complete Setup"。

   <Image img={ch_permissions} alt="审核权限" size="lg" border/>

## 接下来该做什么？ \{#whats-next\}

在使用 ClickPipe 将数据从 MongoDB 复制到 ClickHouse Cloud 之后，你可以将重点放在如何查询和建模数据以获得最佳性能。

## 注意事项 \{#caveats\}

在使用此连接器时，需要注意以下几点：

- 需要 MongoDB 版本为 5.1.0 或更高。
- 我们使用 MongoDB 原生的 Change Streams API 实现 CDC（变更数据捕获），该 API 依赖 MongoDB 的 oplog 来捕获实时变更。
- 来自 MongoDB 的文档默认会以 JSON 类型写入 ClickHouse。这有助于灵活管理模式（schema），并使得可以在 ClickHouse 中使用丰富的 JSON 运算符进行查询和分析。你可以在[此处](https://clickhouse.com/docs/sql-reference/data-types/newjson)了解更多关于查询 JSON 数据的信息。
- 目前尚不支持自助式配置 PrivateLink。如果你在 AWS 上并需要使用 PrivateLink，请联系 db-integrations-support@clickhouse.com 或创建支持工单，我们会协助你启用该功能。