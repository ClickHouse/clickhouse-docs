---
'sidebar_label': '从 Postgres 到 ClickHouse 的数据摄取'
'description': '无缝连接你的 Postgres 到 ClickHouse Cloud。'
'slug': '/integrations/clickpipes/postgres'
'title': '从 Postgres 到 ClickHouse 的数据摄取 (使用 CDC)'
'doc_type': 'guide'
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


# 从 Postgres 到 ClickHouse 的数据摄取（使用 CDC）

您可以使用 ClickPipes 将数据从源 Postgres 数据库摄取到 ClickHouse Cloud。源 Postgres 数据库可以托管在本地或云端，包括 Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabase 等。

## 前提条件 {#prerequisites}

要开始，您首先需要确保您的 Postgres 数据库已正确设置。根据您的源 Postgres 实例，您可以遵循以下任一指南：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [通用 Postgres 来源](./postgres/source/generic)，如果您使用的是其他 Postgres 提供商或使用自托管实例。

9. [TimescaleDB](./postgres/source/timescale)，如果您在托管服务或自托管实例上使用 TimescaleDB 扩展。

:::warning

Postgres 代理如 PgBouncer、RDS Proxy、Supabase Pooler 等，不支持基于 CDC 的复制。请确保在 ClickPipes 设置中**不要使用它们**，而是添加实际 Postgres 数据库的连接详情。

:::

一旦您的源 Postgres 数据库设置完成，您可以继续创建您的 ClickPipe。

## 创建您的 ClickPipe {#creating-your-clickpipe}

确保您已登录到 ClickHouse Cloud 账户。如果您还没有账户，可以在 [这里注册](https://cloud.clickhouse.com/)。

[//]: # (   TODO update image here)
1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击“设置 ClickPipe”

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 `Postgres CDC` 瓦片

   <Image img={postgres_tile} alt="Select Postgres" size="lg" border/>

### 添加您的源 Postgres 数据库连接 {#adding-your-source-postgres-database-connection}

4. 填写您在前提条件步骤中配置的源 Postgres 数据库的连接详情。

   :::info

   在开始添加连接详情之前，请确保在防火墙规则中列入 ClickPipes IP 地址。您可以在 [这里](../index.md#list-of-static-ips) 找到 ClickPipes IP 地址的列表。
   有关更多信息，请参考本页顶部链接的源 Postgres 设置指南 [前提条件](#prerequisites)。

   :::

   <Image img={postgres_connection_details} alt="Fill in connection details" size="lg" border/>

#### （可选）设置 AWS Private Link {#optional-setting-up-aws-private-link}

如果您的源 Postgres 数据库托管在 AWS 上，您可以使用 AWS Private Link 进行连接。这对于想要保持数据传输私密的用户非常有用。
您可以遵循 [设置指南来设置连接](/integrations/clickpipes/aws-privatelink)。

#### （可选）设置 SSH 隧道 {#optional-setting-up-ssh-tunneling}

如果您的源 Postgres 数据库不可公开访问，您可以指定 SSH 隧道的详细信息。

1. 启用“使用 SSH 隧道”切换按钮。
2. 填写 SSH 连接详情。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 要使用基于密钥的身份验证，请单击“撤销并生成密钥对”以生成新密钥对，并将生成的公钥复制到您的 SSH 服务器的 `~/.ssh/authorized_keys`。
4. 单击“验证连接”以验证连接。

:::note

确保在 SSH 中继主机的防火墙规则中列入 [ClickPipes IP 地址](../clickpipes#list-of-static-ips)，以便 ClickPipes 可以建立 SSH 隧道。

:::

填写连接详情后，单击“下一步”。

### 配置复制设置 {#configuring-the-replication-settings}

5. 确保从下拉列表中选择前提条件步骤中创建的复制槽。

   <Image img={select_replication_slot} alt="Select replication slot" size="lg" border/>

#### 高级设置 {#advanced-settings}

如果需要，您可以配置高级设置。每个设置的简要描述如下：

- **同步间隔**：这是 ClickPipes 每次轮询源数据库以获取更改的时间间隔。这会影响目标 ClickHouse 服务，对于对成本敏感的用户，我们建议将此值保持在较高的值（超过 `3600`）。
- **初始加载的并行线程**：这是用于获取初始快照的并行工作者的数量。当您有大量表并希望控制用于获取初始快照的并行工作者数量时，这非常有用。此设置是按表计算的。
- **拉取批量大小**：单次批量中要提取的行数。这是基于最大努力的设置，在某些情况下可能无法遵守。
- **每个分区的快照行数**：这是在初始快照期间在每个分区中要获取的行数。当您的表中有大量行且希望控制每个分区获取的行数时，这非常有用。
- **并行快照的表数量**：这是在初始快照期间将并行提取的表数量。当您有大量表并希望控制并行提取的表数量时，这非常有用。

### 配置表 {#configuring-the-tables}

6. 在此处，您可以选择 ClickPipe 的目标数据库。您可以选择一个现有的数据库或创建一个新的。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

7. 您可以选择要从源 Postgres 数据库复制的表。在选择表时，您还可以选择在目标 ClickHouse 数据库中重命名表以及排除特定列。

   :::warning
   如果您在 ClickHouse 中定义的排序键与 Postgres 中的主键不同，请务必阅读有关的所有 [注意事项](/integrations/clickpipes/postgres/ordering_keys)
   :::

### 审查权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

8. 从权限下拉菜单中选择“完全访问”角色，然后单击“完成设置”。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## 接下来做什么？ {#whats-next}

一旦您设置了 ClickPipe 将数据从 PostgreSQL 复制到 ClickHouse Cloud，您可以专注于如何查询和建模您的数据以获取最佳性能。请参阅 [迁移指南](/migrations/postgresql/overview)，评估哪种策略最适合您的需求，以及有关 CDC 工作负载的最佳实践的 [去重策略（使用 CDC）](/integrations/clickpipes/postgres/deduplication) 和 [排序键](/integrations/clickpipes/postgres/ordering_keys) 页面。

有关 PostgreSQL CDC 和故障排除的常见问题，请参阅 [Postgres 常见问题页面](/integrations/clickpipes/postgres/faq)。
