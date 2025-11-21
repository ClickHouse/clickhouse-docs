---
sidebar_label: '从 Postgres 导入数据到 ClickHouse'
description: '将 Postgres 无缝连接至 ClickHouse Cloud。'
slug: /integrations/clickpipes/postgres
title: '从 Postgres 导入数据到 ClickHouse（使用 CDC）'
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


# 使用 CDC 将数据从 Postgres 导入 ClickHouse

你可以使用 ClickPipes 将源 Postgres 数据库中的数据导入 ClickHouse Cloud。源 Postgres 数据库可以部署在本地或云端，包括 Amazon RDS、Google Cloud SQL、Azure Database for Postgres、Supabase 等。



## 前置条件 {#prerequisites}

开始之前,您需要确保 Postgres 数据库已正确配置。根据您使用的源 Postgres 实例类型,可以参考以下相应指南:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [通用 Postgres 源](./postgres/source/generic),适用于使用其他 Postgres 提供商或自托管实例的情况。

9. [TimescaleDB](./postgres/source/timescale),适用于在托管服务或自托管实例上使用 TimescaleDB 扩展的情况。

:::warning

基于 CDC 的复制不支持 Postgres 代理(如 PgBouncer、RDS Proxy、Supabase Pooler 等)。请确保在配置 ClickPipes 时不要使用这些代理,而应直接添加实际 Postgres 数据库的连接信息。

:::

源 Postgres 数据库配置完成后,即可继续创建 ClickPipe。


## 创建您的 ClickPipe {#creating-your-clickpipe}

请确保您已登录 ClickHouse Cloud 账户。如果您还没有账户,可以在[此处](https://cloud.clickhouse.com/)注册。

[//]: # "   TODO update image here"

1. 在 ClickHouse Cloud 控制台中,导航至您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt='ClickPipes 服务' size='lg' border />

2. 在左侧菜单中选择 `Data Sources` 按钮,然后点击"Set up a ClickPipe"

<Image img={cp_step0} alt='选择导入' size='lg' border />

3. 选择 `Postgres CDC` 选项

   <Image img={postgres_tile} alt='选择 Postgres' size='lg' border />

### 添加源 Postgres 数据库连接 {#adding-your-source-postgres-database-connection}

4. 填写您在前提条件步骤中配置的源 Postgres 数据库的连接详细信息。

   :::info

   在开始添加连接详细信息之前,请确保您已在防火墙规则中将 ClickPipes IP 地址加入白名单。您可以在[此处](../index.md#list-of-static-ips)找到 ClickPipes IP 地址列表。
   有关更多信息,请参阅[本页顶部](#prerequisites)链接的源 Postgres 设置指南。

   :::

   <Image
     img={postgres_connection_details}
     alt='填写连接详细信息'
     size='lg'
     border
   />

#### (可选)设置 AWS Private Link {#optional-setting-up-aws-private-link}

如果您的源 Postgres 数据库托管在 AWS 上,您可以使用 AWS Private Link 进行连接。如果您希望保持数据传输的私密性,这将非常有用。
您可以按照[设置指南建立连接](/integrations/clickpipes/aws-privatelink)。

#### (可选)设置 SSH 隧道 {#optional-setting-up-ssh-tunneling}

如果您的源 Postgres 数据库无法公开访问,您可以指定 SSH 隧道详细信息。

1. 启用"Use SSH Tunnelling"开关。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt='SSH 隧道' size='lg' border />

3. 要使用基于密钥的身份验证,请点击"Revoke and generate key pair"生成新的密钥对,并将生成的公钥复制到您的 SSH 服务器的 `~/.ssh/authorized_keys` 下。
4. 点击"Verify Connection"验证连接。

:::note

请确保在 SSH 堡垒主机的防火墙规则中将 [ClickPipes IP 地址](../clickpipes#list-of-static-ips)加入白名单,以便 ClickPipes 可以建立 SSH 隧道。

:::

填写完连接详细信息后,点击"Next"。

### 配置复制设置 {#configuring-the-replication-settings}

5. 请确保从下拉列表中选择您在前提条件步骤中创建的复制槽。

   <Image
     img={select_replication_slot}
     alt='选择复制槽'
     size='lg'
     border
   />

#### 高级设置 {#advanced-settings}

如果需要,您可以配置高级设置。以下是每个设置的简要说明:

- **Sync interval**:ClickPipes 轮询源数据库以获取更改的时间间隔。这会对目标 ClickHouse 服务产生影响,对于成本敏感的用户,我们建议将此值设置得更高(超过 `3600`)。
- **Parallel threads for initial load**:用于获取初始快照的并行工作线程数。当您有大量表并且希望控制用于获取初始快照的并行工作线程数时,这很有用。此设置是按表配置的。
- **Pull batch size**:单次批处理中要获取的行数。这是一个尽力而为的设置,可能并非在所有情况下都会被遵守。
- **Snapshot number of rows per partition**:初始快照期间每个分区中将获取的行数。当您的表中有大量行并且希望控制每个分区中获取的行数时,这很有用。
- **Snapshot number of tables in parallel**:初始快照期间将并行获取的表数。当您有大量表并且希望控制并行获取的表数时,这很有用。

### 配置表 {#configuring-the-tables}

6. 在这里您可以为您的 ClickPipe 选择目标数据库。您可以选择现有数据库或创建新数据库。

   <Image
     img={select_destination_db}
     alt='选择目标数据库'
     size='lg'
     border
   />


7. 您可以从源 Postgres 数据库中选择要复制的表。在选择表时,您还可以选择在目标 ClickHouse 数据库中重命名表,以及排除特定列。

   :::warning
   如果您在 ClickHouse 中定义的排序键与 Postgres 中的主键不同,请务必阅读所有相关[注意事项](/integrations/clickpipes/postgres/ordering_keys)
   :::

### 检查权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

8. 从权限下拉菜单中选择"完全访问"角色,然后单击"完成设置"。

   <Image img={ch_permissions} alt='检查权限' size='lg' border />


## 下一步是什么？ {#whats-next}

在设置好 ClickPipe 将数据从 PostgreSQL 复制到 ClickHouse Cloud 后,您可以专注于如何查询和建模数据以实现最佳性能。请参阅[迁移指南](/migrations/postgresql/overview)以评估最适合您需求的策略,以及[去重策略(使用 CDC)](/integrations/clickpipes/postgres/deduplication) 和[排序键](/integrations/clickpipes/postgres/ordering_keys)页面,了解 CDC 工作负载的最佳实践。

有关 PostgreSQL CDC 和故障排除的常见问题,请参阅 [Postgres 常见问题页面](/integrations/clickpipes/postgres/faq)。
