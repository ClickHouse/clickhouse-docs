---
sidebar_label: '从 Postgres 摄取数据到 ClickHouse'
description: '将您的 Postgres 无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/postgres
title: '从 Postgres 摄取数据到 ClickHouse（使用 CDC）'
keywords: ['PostgreSQL', 'ClickPipes', 'CDC', '变更数据捕获', '数据库复制']
doc_type: '指南'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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

# 使用 CDC 将数据从 Postgres 摄取到 ClickHouse \\{#ingesting-data-from-postgres-to-clickhouse-using-cdc\\}

你可以使用 ClickPipes 将源 Postgres 数据库中的数据摄取到 ClickHouse Cloud。源 Postgres 数据库可以托管在本地环境或云端，例如 Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabase 等。

## 前提条件 \\{#prerequisites\\}

在开始之前，需要先确保您的 Postgres 数据库已正确配置。根据您使用的源端 Postgres 实例类型，可以参考以下任一指南：

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [通用 Postgres 源](./postgres/source/generic)，如果您使用的是其他任何 Postgres 服务提供商，或使用自建实例。

9. [TimescaleDB](./postgres/source/timescale)，如果您在托管服务或自建实例上使用 TimescaleDB 扩展。

:::warning

PgBouncer、RDS Proxy、Supabase Pooler 等 Postgres 代理不支持基于 CDC（变更数据捕获）的复制。请务必不要在 ClickPipes 配置中使用这些代理，而应填写实际 Postgres 数据库的连接信息。

:::

在完成源端 Postgres 数据库的配置之后，您就可以继续创建 ClickPipe 了。

## 创建 ClickPipe \\{#creating-your-clickpipe\\}

请确保你已登录到 ClickHouse Cloud 账号。如果你还没有账号，可以在[这里](https://cloud.clickhouse.com/)注册。

[//]: # (   TODO 在此更新图片)
1. 在 ClickHouse Cloud 控制台中，找到并进入你的 ClickHouse Cloud 服务实例。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击 “Set up a ClickPipe”。

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 `Postgres CDC` 卡片。

   <Image img={postgres_tile} alt="选择 Postgres" size="lg" border/>

### 添加源 Postgres 数据库连接 \\{#adding-your-source-postgres-database-connection\\}

4. 填写你在前提条件步骤中已经配置好的源 Postgres 数据库连接信息。

   :::info

   在开始添加连接信息之前，请确保你已经在防火墙规则中将 ClickPipes 的 IP 地址加入白名单。你可以在[这里](../index.md#list-of-static-ips)找到 ClickPipes IP 地址列表。
   更多信息请参考[本页顶部](#prerequisites)链接的源 Postgres 设置指南。

   :::

   <Image img={postgres_connection_details} alt="填写连接信息" size="lg" border/>

#### （可选）配置 AWS Private Link \\{#optional-setting-up-aws-private-link\\}

如果你的源 Postgres 数据库托管在 AWS 上，你可以使用 AWS Private Link 进行连接。这样可以让你的数据传输保持私有。
你可以按照[此设置指南来配置连接](/integrations/clickpipes/aws-privatelink)。

#### （可选）配置 SSH 隧道 \\{#optional-setting-up-ssh-tunneling\\}

如果你的源 Postgres 数据库无法公开访问，你可以配置 SSH 隧道。

1. 启用 “Use SSH Tunnelling” 开关。
2. 填写 SSH 连接信息。

   <Image img={ssh_tunnel} alt="SSH 隧道" size="lg" border/>

3. 若要使用基于密钥的认证，点击 “Revoke and generate key pair” 生成新的密钥对，并将生成的公钥复制到 SSH 服务器的 `~/.ssh/authorized_keys` 中。
4. 点击 “Verify Connection” 以验证连接。

:::note

请确保在 SSH 堡垒机的防火墙规则中将 [ClickPipes IP addresses](../clickpipes#list-of-static-ips) 加入白名单，以便 ClickPipes 能够建立 SSH 隧道。

:::

填写完所有连接信息后，点击 “Next”。

### 配置复制设置 \\{#configuring-the-replication-settings\\}

5. 确保从下拉列表中选择你在前提条件步骤中创建的 replication slot。

   <Image img={select_replication_slot} alt="选择 replication slot" size="lg" border/>

#### 高级设置 \\{#advanced-settings\\}

如有需要，你可以配置高级设置。下面是每个设置项的简要说明：

- **Sync interval**：ClickPipes 轮询源数据库变更的时间间隔。这会对目标 ClickHouse 服务产生影响。对于成本敏感型用户，我们建议将其设置为较大的数值（大于 `3600`）。
- **Parallel threads for initial load**：用于获取初始快照的并行工作线程数量。当你有大量表并希望控制用于获取初始快照的并行工作线程数量时，此设置会很有用。此设置按表生效。
- **Pull batch size**：单次批量拉取的行数。这是一个尽力而为的设置，在某些情况下可能不会被严格遵守。
- **Snapshot number of rows per partition**：初始快照期间，每个分区要获取的行数。当你的表中有大量行，并希望控制每个分区中获取的行数时，此设置会很有用。
- **Snapshot number of tables in parallel**：初始快照期间并行获取的表数量。当你有大量表，并希望控制并行获取的表数量时，此设置会很有用。

### 配置表 \\{#configuring-the-tables\\}

6. 在这里你可以为 ClickPipe 选择目标数据库。你可以选择一个已有数据库，或者创建一个新数据库。

   <Image img={select_destination_db} alt="选择目标数据库" size="lg" border/>

7. 你可以从源 Postgres 数据库中选择要复制的表。在选择表时，你还可以在目标 ClickHouse 数据库中重命名这些表，并排除特定列。

   :::warning
   如果你在 ClickHouse 中定义的排序键与 Postgres 中的主键不同，别忘了阅读与其相关的所有[注意事项](/integrations/clickpipes/postgres/ordering_keys)。
   :::

### 检查权限并启动 ClickPipe \\{#review-permissions-and-start-the-clickpipe\\}

8. 在权限下拉菜单中选择 “Full access” 角色，然后点击 “Complete Setup”。

   <Image img={ch_permissions} alt="检查权限" size="lg" border/>

## 接下来是什么？ \\{#whats-next\\}

在您设置好 ClickPipe，将数据从 PostgreSQL 复制到 ClickHouse Cloud 之后，就可以专注于如何查询和建模数据以获得最佳性能。请参阅[迁移指南](/migrations/postgresql/overview)，评估哪种策略最适合您的需求，并参考[去重策略（使用 CDC）](/integrations/clickpipes/postgres/deduplication)和[排序键](/integrations/clickpipes/postgres/ordering_keys)页面，了解 CDC 工作负载的最佳实践。

如需了解 PostgreSQL CDC 的常见问题及故障排除方法，请参阅 [Postgres 常见问题页面](/integrations/clickpipes/postgres/faq)。
