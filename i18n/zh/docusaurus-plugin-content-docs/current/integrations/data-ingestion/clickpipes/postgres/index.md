---
'sidebar_label': '从Postgres将数据摄入到ClickHouse'
'description': '无缝连接您的Postgres到ClickHouse云。'
'slug': '/integrations/clickpipes/postgres'
'title': 'Ingesting Data from Postgres to ClickHouse (using CDC)'
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


# 从 Postgres 迁移数据到 ClickHouse（使用 CDC）

<BetaBadge/>

:::info
目前，通过 ClickPipes 从 Postgres 向 ClickHouse Cloud 迁移数据正在进行公开测试。
:::


您可以使用 ClickPipes 将源 Postgres 数据库中的数据迁移到 ClickHouse Cloud。源 Postgres 数据库可以托管在本地或云中，包括 Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabase 等。

## 前提条件 {#prerequisites}

要开始，您首先需要确保您的 Postgres 数据库已正确设置。根据您的源 Postgres 实例，您可以遵循以下任意指南：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [通用 Postgres 源](./postgres/source/generic)，如果您使用其他 Postgres 提供商或自托管实例。

9. [TimescaleDB](./postgres/source/timescale)，如果您在托管服务或自托管实例上使用 TimescaleDB 扩展。


:::warning

Postgres 代理如 PgBouncer、RDS Proxy、Supabase Pooler 等不支持基于 CDC 的复制。请确保在 ClickPipes 设置中不要使用它们，而是添加实际 Postgres 数据库的连接详细信息。

:::

一旦您的源 Postgres 数据库设置完成，您可以继续创建您的 ClickPipe。

## 创建您的 ClickPipe {#creating-your-clickpipe}

确保您已登录到您的 ClickHouse Cloud 帐户。如果您还没有帐户，可以在 [这里](https://cloud.clickhouse.com/) 注册。

[//]: # (   TODO update image here)
1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击“设置 ClickPipe”

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 `Postgres CDC` 瓷砖

   <Image img={postgres_tile} alt="选择 Postgres" size="lg" border/>

### 添加您的源 Postgres 数据库连接 {#adding-your-source-postgres-database-connection}

4. 填写您在前提条件步骤中配置的源 Postgres 数据库的连接详细信息。

   :::info

   在开始添加连接详细信息之前，请确保您已在防火墙规则中将 ClickPipes 的 IP 地址列入白名单。您可以在 [这里](../index.md#list-of-static-ips) 找到 ClickPipes IP 地址的列表。
   有关更多信息，请参阅位于 [本页顶部](#prerequisites) 的源 Postgres 设置指南。

   :::

   <Image img={postgres_connection_details} alt="填写连接详细信息" size="lg" border/>

#### （可选）设置 AWS Private Link {#optional-setting-up-aws-private-link}

如果您的源 Postgres 数据库托管在 AWS 上，您可以使用 AWS Private Link 进行连接。如果您想保持数据传输的私密性，这将非常有用。
您可以按照[设置指南](/integrations/clickpipes/aws-privatelink)进行连接设置。

#### （可选）设置 SSH 隧道 {#optional-setting-up-ssh-tunneling}

如果您的源 Postgres 数据库无法公开访问，您可以指定 SSH 隧道的详细信息。

1. 启用“使用 SSH 隧道”切换按钮。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt="SSH 隧道" size="lg" border/>

3. 若要使用基于密钥的身份验证，请单击“撤销并生成密钥对”生成新的密钥对，并将生成的公钥复制到您的 SSH 服务器的 `~/.ssh/authorized_keys` 中。
4. 点击“验证连接”以验证连接。

:::note

确保在 SSH 跳板主机的防火墙规则中将 [ClickPipes IP 地址](../clickpipes#list-of-static-ips) 列入白名单，以便 ClickPipes 能够建立 SSH 隧道。

:::

填写完连接详细信息后，单击“下一步”。

### 配置复制设置 {#configuring-the-replication-settings}

5. 确保从下拉列表中选择您在前提条件步骤中创建的复制槽。

   <Image img={select_replication_slot} alt="选择复制槽" size="lg" border/>

#### 高级设置 {#advanced-settings}

如果需要，您可以配置高级设置。以下是每个设置的简要描述：

- **同步间隔**：这是 ClickPipes 将轮询源数据库以获取更改的间隔。这会影响目标 ClickHouse 服务，对于注重成本的用户，我们建议将其保持在较高的值（超过 `3600`）。
- **初始加载的并行线程**：这是用于获取初始快照的并行工作者数量。当您有大量表时，这很有用，您可以控制用于获取初始快照的并行工作者数量。此设置是逐表的。
- **拉取批处理大小**：单次批处理中要获取的行数。这是一个尽力而为的设置，可能在某些情况下不被遵守。
- **每个分区的快照行数**：在初始快照期间，每个分区中将获取的行数。当您在表中有大量行时，这很有用，您可以控制每个分区中获取的行数。
- **并行快照的表数**：在初始快照期间将并行获取的表数。当您有大量表时，这很有用，您可以控制并行获取的表数。

### 配置表 {#configuring-the-tables}

6. 在这里您可以选择 ClickPipe 的目标数据库。您可以选择一个现有数据库或创建一个新数据库。

   <Image img={select_destination_db} alt="选择目标数据库" size="lg" border/>

7. 您可以选择要从源 Postgres 数据库中复制的表。在选择表时，您还可以选择在目标 ClickHouse 数据库中重命名表以及排除特定列。

   :::warning
   如果您在 ClickHouse 中定义的排序键与 Postgres 中的主键不同，请不要忘记阅读所有关于 [排序键的注意事项](/integrations/clickpipes/postgres/ordering_keys)！
   :::

### 审核权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

8. 从权限下拉列表中选择“完全访问”角色，然后点击“完成设置”。

   <Image img={ch_permissions} alt="审核权限" size="lg" border/>

## 接下来做什么？ {#whats-next}

一旦您将数据从 Postgres 移动到 ClickHouse，下一个显而易见的问题是如何在 ClickHouse 中查询和建模您的数据，以充分利用它。请参考 [迁移指南](/migrations/postgresql/overview)，了解从 PostgreSQL 迁移到 ClickHouse 的逐步方法。 除了迁移指南，确保查看关于 [去重策略（使用 CDC）](/integrations/clickpipes/postgres/deduplication) 和 [排序键](/integrations/clickpipes/postgres/ordering_keys) 的页面，以了解在使用 CDC 时如何处理重复项和自定义排序键。

最后，请参考 ["ClickPipes for Postgres FAQ"](/integrations/clickpipes/postgres/faq) 页面，以获取有关常见问题及其解决方法的更多信息。
