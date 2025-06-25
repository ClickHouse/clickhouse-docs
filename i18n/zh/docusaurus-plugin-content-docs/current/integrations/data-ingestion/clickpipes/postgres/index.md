---
'sidebar_label': '从 Postgres 向 ClickHouse 传输数据'
'description': '无缝连接你的 Postgres 和 ClickHouse Cloud.'
'slug': '/integrations/clickpipes/postgres'
'title': '从 Postgres 向 ClickHouse (使用 CDC) 传输数据'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_tile from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-tile.png'
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# 将数据从 Postgres 导入到 ClickHouse（使用 CDC）

您可以使用 ClickPipes 将数据从源 Postgres 数据库导入到 ClickHouse Cloud。源 Postgres 数据库可以在本地或云中托管，包括 Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabase 等。

## 前提条件 {#prerequisites}

要开始，您首先需要确保您的 Postgres 数据库已正确设置。根据您的源 Postgres 实例，您可以遵循以下任一指南：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic)，如果您使用的是其他 Postgres 提供商或使用自托管实例。

9. [TimescaleDB](./postgres/source/timescale)，如果您在托管服务或自托管实例上使用 TimescaleDB 扩展。


:::warning

不支持基于 CDC 的复制的 Postgres 代理，如 PgBouncer、RDS Proxy、Supabase Pooler 等。请确保在 ClickPipes 设置中**不要**使用它们，而是添加实际 Postgres 数据库的连接详细信息。

:::

一旦您的源 Postgres 数据库设置完成，您可以继续创建您的 ClickPipe。

## 创建 ClickPipe {#creating-your-clickpipe}

确保您已登录到您的 ClickHouse Cloud 账户。如果您还没有账户，可以在 [这里](https://cloud.clickhouse.com/) 注册。

[//]: # (   TODO update image here)
1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 在左侧菜单上选择 `Data Sources` 按钮，然后点击 "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 `Postgres CDC` 模块

   <Image img={postgres_tile} alt="Select Postgres" size="lg" border/>

### 添加源 Postgres 数据库连接 {#adding-your-source-postgres-database-connection}

4. 填写您在前提条件步骤中配置的源 Postgres 数据库的连接详细信息。

   :::info

   在您开始添加连接详细信息之前，请确保在防火墙规则中将 ClickPipes IP 地址列入白名单。您可以在 [这里](../index.md#list-of-static-ips) 找到 ClickPipes IP 地址列表。有关更多信息，请参考 [本页顶部](#prerequisites) 提到的源 Postgres 设置指南。

   :::

   <Image img={postgres_connection_details} alt="Fill in connection details" size="lg" border/>

#### （可选）设置 AWS Private Link {#optional-setting-up-aws-private-link}

如果您的源 Postgres 数据库托管在 AWS 上，您可以使用 AWS Private Link 进行连接。这在您希望保持数据传输隐私时非常有用。您可以按照 [设置指南来设置连接](/integrations/clickpipes/aws-privatelink)。

#### （可选）设置 SSH 隧道 {#optional-setting-up-ssh-tunneling}

如果您的源 Postgres 数据库无法公开访问，您可以指定 SSH 隧道详细信息。

1. 启用 "Use SSH Tunnelling" 切换开关。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 要使用基于密钥的身份验证，单击 "Revoke and generate key pair" 生成新的密钥对，并将生成的公钥复制到您的 SSH 服务器 `~/.ssh/authorized_keys` 下。
4. 单击 "Verify Connection" 以验证连接。

:::note

确保在防火墙规则中为 SSH 大师主机列入 [ClickPipes IP 地址](../clickpipes#list-of-static-ips) 的白名单，以便 ClickPipes 可以建立 SSH 隧道。

:::

一旦填写了连接详细信息，单击 "Next"。

### 配置复制设置 {#configuring-the-replication-settings}

5. 确保从下拉列表中选择在前提条件步骤中创建的复制槽。

   <Image img={select_replication_slot} alt="Select replication slot" size="lg" border/>

#### 高级设置 {#advanced-settings}

如果需要，您可以配置高级设置。每个设置的简要描述如下：

- **同步间隔**: 这是 ClickPipes 轮询源数据库以检测更改的间隔。对于成本敏感的用户，我们建议将其保持在较高的值（超过 `3600`）。
- **初始加载的并行线程**: 这是用于获取初始快照的并行工作者数量。当您有大量表并希望控制获取初始快照时使用的并行工作者数量时，这很有用。此设置是针对每个表的。
- **拉取批大小**: 单次批次要获取的行数。这是一个最佳努力的设置，可能在某些情况下无法遵守。
- **每个分区的快照行数**: 在初始快照期间，每个分区将获取的行数。当您在表中有大量行并希望控制每个分区获取的行数时，这很有用。
- **并行快照表数**: 在初始快照期间将并行获取的表的数量。当您有大量表，并希望控制并行获取的表数时，这很有用。


### 配置表 {#configuring-the-tables}

6. 在这里，您可以选择 ClickPipe 的目标数据库。您可以选择现有数据库或创建新数据库。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

7. 您可以从源 Postgres 数据库中选择要复制的表。在选择表时，您还可以选择在目标 ClickHouse 数据库中重命名表以及排除特定列。

   :::warning
   如果您在 ClickHouse 中定义的 Ordering Key 与 Postgres 中的主键不同，请务必查看所有相关的 [注意事项](/integrations/clickpipes/postgres/ordering_keys)!
   :::

### 审查权限并开始 ClickPipe {#review-permissions-and-start-the-clickpipe}

8. 从权限下拉列表中选择 "Full access" 角色，然后单击 "Complete Setup"。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## 接下来是什么？ {#whats-next}

一旦您将数据从 Postgres 移动到 ClickHouse，接下来的显而易见的问题是如何在 ClickHouse 中查询和建模您的数据，以最大限度地利用它。请参考 [迁移指南](/migrations/postgresql/overview) 获取有关从 PostgreSQL 迁移到 ClickHouse 的逐步方法。此外，请确保查看有关 [去重策略（使用 CDC）](/integrations/clickpipes/postgres/deduplication) 和 [Ordering Keys](/integrations/clickpipes/postgres/ordering_keys) 的页面，以了解如何处理重复项并在使用 CDC 时自定义排序键。

最后，请参考 ["ClickPipes for Postgres FAQ"](/integrations/clickpipes/postgres/faq) 页面以获取有关常见问题及其解决方法的更多信息。
