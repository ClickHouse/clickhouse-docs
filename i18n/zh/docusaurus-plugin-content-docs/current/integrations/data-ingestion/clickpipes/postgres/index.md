---
'sidebar_label': '从 Postgres 到 ClickHouse 的数据摄取'
'description': '无缝连接你的 Postgres 到 ClickHouse Cloud。'
'slug': '/integrations/clickpipes/postgres'
'title': '从 Postgres 到 ClickHouse 的数据摄取 (使用 CDC)'
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


# 从 Postgres 向 ClickHouse 导入数据（使用 CDC）

<BetaBadge/>

:::info
目前，通过 ClickPipes 从 Postgres 向 ClickHouse Cloud 导入数据处于公开测试阶段。
:::


您可以使用 ClickPipes 将数据从源 Postgres 数据库导入到 ClickHouse Cloud。源 Postgres 数据库可以托管在本地或云中，包括 Amazon RDS、Google Cloud SQL、Azure Postgre 数据库、Supabase 等。

## 前提条件 {#prerequisites}

要开始，您需要确保您的 Postgres 数据库已正确设置。根据您使用的源 Postgres 实例，您可以遵循以下任一指南：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [通用 Postgres 源](./postgres/source/generic)，如果您使用其他 Postgres 提供商或使用自托管实例。

9. [TimescaleDB](./postgres/source/timescale)，如果您在托管服务或自托管实例上使用 TimescaleDB 扩展。

:::warning

像 PgBouncer、RDS Proxy、Supabase Pooler 等 Postgres 代理不支持基于 CDC 的复制。请确保在 ClickPipes 设置中不要使用它们，而是添加实际 Postgres 数据库的连接详细信息。

:::

一旦您的源 Postgres 数据库设置完成，您可以继续创建您的 ClickPipe。

## 创建你的 ClickPipe {#creating-your-clickpipe}

确保您已登录到 ClickHouse Cloud 帐户。如果您还没有帐户，可以在 [这里](https://cloud.clickhouse.com/) 注册。

[//]: # (   TODO update image here)
1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击“设置 ClickPipe”

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 `Postgres CDC` 瓦片

   <Image img={postgres_tile} alt="Select Postgres" size="lg" border/>

### 添加源 Postgres 数据库连接 {#adding-your-source-postgres-database-connection}

4. 填写您在前提条件步骤中配置的源 Postgres 数据库的连接详细信息。

   :::info

   在开始添加连接详细信息之前，请确保您已在防火墙规则中列入 ClickPipes 的 IP 地址。您可以在 [这里](../index.md#list-of-static-ips) 找到 ClickPipes 的 IP 地址列表。
   有关更多信息，请参考链接在 [本页面顶部](#prerequisites) 的源 Postgres 设置指南。

   :::

   <Image img={postgres_connection_details} alt="Fill in connection details" size="lg" border/>

#### （可选）设置 AWS Private Link {#optional-setting-up-aws-private-link}

如果您的源 Postgres 数据库托管在 AWS 上，可以使用 AWS Private Link 进行连接。这对于希望保持数据传输私密的用户非常有用。
您可以按照 [设置指南来设置连接](/integrations/clickpipes/aws-privatelink)。

#### （可选）设置 SSH 隧道 {#optional-setting-up-ssh-tunneling}

如果您的源 Postgres 数据库无法公开访问，您可以指定 SSH 隧道详细信息。

1. 启用“使用 SSH 隧道”切换按钮。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 要使用基于密钥的身份验证，请点击“撤销并生成密钥对”以生成新密钥对，并将生成的公钥复制到您的 SSH 服务器下的 `~/.ssh/authorized_keys`。
4. 点击“验证连接”以验证连接。

:::note

确保在 SSH 大堡礁主机的防火墙规则中列入 [ClickPipes IP 地址](../clickpipes#list-of-static-ips)，以便 ClickPipes 能够建立 SSH 隧道。

:::

一旦填写连接详细信息，点击“下一步”。

### 配置复制设置 {#configuring-the-replication-settings}

5. 确保从下拉列表中选择您在前提条件步骤中创建的复制插槽。

   <Image img={select_replication_slot} alt="Select replication slot" size="lg" border/>

#### 高级设置 {#advanced-settings}

如果需要，您可以配置高级设置。下面简要说明每个设置：

- **同步间隔**：这是 ClickPipes 将轮询源数据库以检测更改的间隔。这会影响目标 ClickHouse 服务，对于对成本敏感的用户，我们建议将此值保持在较高水平（超过 `3600`）。
- **初始加载的并行线程**：这是用于获取初始快照的并行工作线程数量。当您有大量表并希望控制用于获取初始快照的并行工作线程数量时，这很有用。此设置为每个表单独设置。
- **拉取批次大小**：在单个批次中获取的行数。这是最佳努力设置，可能在所有情况下都不被尊重。
- **每个分区快照的行数**：在初始快照期间，每个分区中获取的行数。当您的表中有大量行时，您可以控制每个分区中获取的行数。
- **并行快照的表数**：在初始快照期间，您将并行获取的表的数量。当您有大量表时，这很有用，您可以控制并行获取的表数。

### 配置表 {#configuring-the-tables}

6. 在这里，您可以选择 ClickPipe 的目标数据库。您可以选择现有数据库或创建新数据库。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

7. 您可以选择要从源 Postgres 数据库复制的表。在选择表时，您还可以选择在目标 ClickHouse 数据库中重命名这些表，以及排除特定列。

   :::warning
   如果您在 ClickHouse 中定义的排序键与 Postgres 中的主键不同，请务必阅读关于此的所有 [注意事项](/integrations/clickpipes/postgres/ordering_keys)！
   :::

### 审查权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

8. 从权限下拉菜单中选择“完全访问”角色，然后点击“完成设置”。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## 下一步是什么？ {#whats-next}

一旦您将数据从 Postgres 移动到 ClickHouse，接下来显而易见的问题是如何在 ClickHouse 中查询和建模数据以充分利用它。请参考 [迁移指南](/migrations/postgresql/overview)，以获取从 PostgreSQL 迁移到 ClickHouse 的逐步方法。除了迁移指南之外，确保查看关于 [去重策略（使用 CDC）](/integrations/clickpipes/postgres/deduplication) 和 [排序键](/integrations/clickpipes/postgres/ordering_keys) 的页面，以了解在使用 CDC 时如何处理重复项和自定义排序键。

最后，请参考 ["ClickPipes for Postgres 常见问题"](/integrations/clickpipes/postgres/faq) 页面，以获取有关常见问题及其解决方案的更多信息。
