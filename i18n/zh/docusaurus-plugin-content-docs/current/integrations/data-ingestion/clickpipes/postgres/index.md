---
sidebar_label: 'ClickPipes 用于 Postgres'
description: '无缝连接您的 Postgres 到 ClickHouse Cloud。'
slug: '/integrations/clickpipes/postgres'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'


# 从 Postgres 导入数据到 ClickHouse（使用 CDC）

<BetaBadge/>

:::info
目前，通过 ClickPipes 将数据从 Postgres 导入到 ClickHouse Cloud 正处于公开测试阶段。
:::


您可以使用 ClickPipes 将数据从源 Postgres 数据库导入到 ClickHouse Cloud。源 Postgres 数据库可以托管在本地或云中，包括 Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabase 等。

## 前提条件 {#prerequisites}

要开始，您首先需要确保您的 Postgres 数据库已正确设置。根据您的源 Postgres 实例，您可以遵循以下任一指南：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Supabase Postgres](./postgres/source/supabase)

3. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

4. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

5. [Neon Postgres](./postgres/source/neon-postgres)

6. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

7. [通用 Postgres 源](./postgres/source/generic)，如果您使用其他 Postgres 提供商或使用自托管实例


:::warning

Postgres 代理如 PgBouncer、RDS Proxy、Supabase Pooler 等不支持基于 CDC 的复制。请确保在 ClickPipes 设置中并未使用它们，而是添加实际 Postgres 数据库的连接详细信息。

:::

一旦您的源 Postgres 数据库设置完成，您可以继续创建您的 ClickPipe。

## 创建您的 ClickPipe {#creating-your-clickpipe}

确保您已登录到您的 ClickHouse Cloud 帐户。如果您还没有帐户，可以在 [这里](https://cloud.clickhouse.com/) 注册。

[//]: # (   TODO 更新此处的图像)
1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud 服务。

<img src={cp_service} alt="ClickPipes service" />

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击 "Set up a ClickPipe"

<img src={cp_step0} alt="选择导入" />

3. 选择 `Postgres CDC` 瓦片

### 添加源 Postgres 数据库连接 {#adding-your-source-postgres-database-connection}

4. 填写您在前提条件步骤中配置的源 Postgres 数据库的连接详细信息。

   :::info

   在添加连接详细信息之前，请确保您已在防火墙规则中将 ClickPipes 的 IP 地址列入白名单。您可以在 [这里](../index.md#list-of-static-ips) 找到 ClickPipes IP 地址的列表。
   有关更多信息，请参考[本页顶部](#prerequisites)链接的源 Postgres 设置指南。

   :::

   <img src={postgres_connection_details} alt="填写连接详细信息" />

#### （可选）设置 SSH 隧道 {#optional-setting-up-ssh-tunneling}

如果您的源 Postgres 数据库无法公开访问，您可以指定 SSH 隧道详细信息。

1. 启用 "Use SSH Tunnelling" 切换。
2. 填写 SSH 连接详细信息。

   <img src={ssh_tunnel} alt="SSH 隧道" />

3. 要使用密钥认证，请点击 "Revoke and generate key pair" 以生成新的密钥对，并将生成的公钥复制到您的 SSH 服务器的 `~/.ssh/authorized_keys` 下。
4. 点击 "Verify Connection" 以验证连接。

:::note

请确保在防火墙规则中的 SSH 跃点主机上列入[ClickPipes IP 地址](../clickpipes#list-of-static-ips)的白名单，以便 ClickPipes 能够建立 SSH 隧道。

:::

在填写连接详细信息后，点击 "Next"。

### 配置复制设置 {#configuring-the-replication-settings}

5. 确保从下拉列表中选择您在前提条件步骤中创建的复制槽。

   <img src={select_replication_slot} alt="选择复制槽" />

#### 高级设置 {#advanced-settings}

如果需要，您可以配置高级设置。以下是每个设置的简要描述：

- **Sync interval**: 这是 ClickPipes 每次轮询源数据库以检查更改的间隔。这对目标 ClickHouse 服务有影响，对于对成本敏感的用户，我们建议将其保持在较高的值（超过 `3600`）。
- **Parallel threads for initial load**: 这是用于获取初始快照的并行工作线程数量。当您有大量表时，这很有用，您可以控制用于获取初始快照的并行工作线程数量。此设置是按表计算的。
- **Pull batch size**: 每次批量获取的行数。这是一个尽力而为的设置，可能在所有情况下不被遵守。
- **Snapshot number of rows per partition**: 初始快照期间，每个分区将获取的行数。当您的表中有大量行时，这非常有用，您可以控制每个分区中获取的行数。
- **Snapshot number of tables in parallel**: 初始快照期间将并行获取的表的数量。当您有大量表时，这很有用，您可以控制并行提取的表的数量。

### 配置表 {#configuring-the-tables}

6. 在这里，您可以选择 ClickPipe 的目标数据库。您可以选择一个现有的数据库或创建一个新的数据库。

   <img src={select_destination_db} alt="选择目标数据库" />
   
7. 您可以选择要从源 Postgres 数据库复制的表。在选择表时，您还可以选择在目标 ClickHouse 数据库中重命名表，以及排除特定列。

   :::warning

   如果您在 ClickHouse 中定义的排序键与 Postgres 中的主键不同，请务必阅读有关它的所有[注意事项](https://docs.peerdb.io/mirror/ordering-key-different)！

   :::

### 审查权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

8. 从权限下拉列表中选择 "Full access" 角色，然后点击 "Complete Setup"。

   <img src={ch_permissions} alt="审查权限" />

## 接下来是什么？ {#whats-next}

当您将数据从 Postgres 移动到 ClickHouse 后，接下来的明显问题是如何在 ClickHouse 中建模数据以充分利用它。请参阅此页面上的[ClickHouse 数据建模提示，适用于 Postgres 用户](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling)，以帮助您在 ClickHouse 中建模数据。

另外，请参考[ClickPipes for Postgres FAQ](./postgres/faq)，了解常见问题及其解决方案。

:::info

[此文档](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling) 尤其重要，因为 ClickHouse 与 Postgres 不同，您可能会遇到一些意外。本指南帮助解决潜在的陷阱，并确保您可以充分利用 ClickHouse。

:::
