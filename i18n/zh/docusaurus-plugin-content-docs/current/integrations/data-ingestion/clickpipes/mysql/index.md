---
sidebar_label: '从 MySQL 向 ClickHouse 摄取数据'
description: '将 MySQL 或 MariaDB 数据库中的数据无缝摄取到 ClickHouse Cloud。'
slug: /integrations/clickpipes/mysql
title: '从 MySQL 向 ClickHouse 摄取数据（使用 CDC）'
doc_type: 'guide'
keywords: ['MySQL', 'ClickPipes', 'CDC', '变更数据捕获', '数据库复制']
integration:
   - support_level: '核心'
   - category: 'clickpipes'
---

import Aurorasvg from '@site/static/images/integrations/logos/amazon_aurora.svg';
import AFSsvg from '@site/static/images/integrations/logos/azure_database_mysql.svg';
import CloudSQLsvg from '@site/static/images/integrations/logos/gcp_cloudsql.svg';
import MariaDBsvg from '@site/static/images/integrations/logos/mariadb.svg';
import MySQLsvg from '@site/static/images/integrations/logos/mysql.svg';
import RDSsvg from '@site/static/images/integrations/logos/amazon_rds.svg';
import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';

# 将数据从 MySQL 摄取到 ClickHouse（使用 CDC） \{#ingesting-data-from-mysql-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
通过 ClickPipes 将数据从 MySQL 摄取到 ClickHouse Cloud 目前处于公开测试阶段。
:::

MySQL ClickPipe 提供了一种完全托管且高可靠的方式，将 MySQL 和 MariaDB 数据库中的数据摄取到 ClickHouse Cloud 中。它同时支持用于一次性摄取的 **批量加载（bulk load）** 和用于持续摄取的 **Change Data Capture（CDC，变更数据捕获）**。

可以使用 ClickPipes UI 手动部署和管理 MySQL ClickPipes。未来，还可以使用 [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 和 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) 以编程方式部署和管理 MySQL ClickPipes。

## 前置条件 \\{#prerequisites\\}

[//]: # "TODO 对于一次性摄取的管道，不需要进行 binlog 复制配置。过去这一直是困惑的来源，因此我们也应该提供批量加载所需的最低要求，以避免把用户吓跑。"

在开始之前，首先需要确保你的 MySQL 数据库已正确配置为支持 binlog 复制。具体配置步骤取决于你是如何部署 MySQL 的，请按照下面相应的指南进行操作：

### 支持的数据源 \\{#supported-data-sources\\}

| 名称                 | Logo | 详情           |
|----------------------|------|-------------------|
| **Amazon RDS MySQL** <br></br> _一次性导入，CDC_ | <RDSsvg class="image" alt="Amazon RDS 徽标" style={{width: '2.5rem', height: 'auto'}}/> | 请参阅 [Amazon RDS MySQL](./mysql/source/rds) 配置指南。 |
| **Amazon Aurora MySQL** <br></br> _一次性导入，CDC_ | <Aurorasvg class="image" alt="Amazon Aurora 徽标" style={{width: '2.5rem', height: 'auto'}}/> | 请参阅 [Amazon Aurora MySQL](./mysql/source/aurora) 配置指南。 |
| **Cloud SQL for MySQL** <br></br> _一次性导入，CDC_ | <CloudSQLsvg class="image" alt="Cloud SQL 徽标" style={{width: '2.5rem', height: 'auto'}}/>|  请参阅 [Cloud SQL for MySQL](./mysql/source/gcp) 配置指南。 |
| **Azure Flexible Server for MySQL** <br></br> _一次性导入_ | <AFSsvg class="image" alt="Azure Flexible Server for MySQL 徽标" style={{width: '2.5rem', height: 'auto'}}/> | 请参阅 [Azure Flexible Server for MySQL](./mysql/source/azure-flexible-server-mysql) 配置指南。 |
| **自托管 MySQL** <br></br> _一次性导入，CDC_ | <MySQLsvg class="image" alt="MySQL 徽标" style={{width: '2.5rem', height: 'auto'}}/>|  请参阅 [通用 MySQL](./mysql/source/generic) 配置指南。 |
| **Amazon RDS MariaDB** <br></br> _一次性导入，CDC_ | <RDSsvg class="image" alt="Amazon RDS 徽标" style={{width: '2.5rem', height: 'auto'}}/> | 请参阅 [Amazon RDS MariaDB](./mysql/source/rds_maria) 配置指南。 |
| **自托管 MariaDB** <br></br> _一次性导入，CDC_ | <MariaDBsvg class="image" alt="MariaDB 徽标" style={{width: '2.5rem', height: 'auto'}}/>|  请参阅 [通用 MariaDB](./mysql/source/generic_maria) 配置指南。 |

在完成源 MySQL 数据库的配置后，可以继续创建 ClickPipe。

## 创建你的 ClickPipe \\{#create-your-clickpipe\\}

请确保你已登录到你的 ClickHouse Cloud 账户。如果你还没有账户，可以在[这里](https://cloud.clickhouse.com/)注册。

[//]: # (   TODO update image here)
1. 在 ClickHouse Cloud 控制台中，导航到你的 ClickHouse Cloud Service。

<Image img={cp_service} alt="ClickPipes 服务" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击 "Set up a ClickPipe"

<Image img={cp_step0} alt="选择导入" size="lg" border/>

3. 选择 `MySQL CDC` 磁贴

<Image img={mysql_tile} alt="选择 MySQL" size="lg" border/>

### 添加你的源 MySQL 数据库连接 \\{#add-your-source-mysql-database-connection\\}

4. 填写在前置条件步骤中配置好的源 MySQL 数据库的连接信息。

   :::info
   在开始添加连接信息之前，请确保你已经在防火墙规则中将 ClickPipes 的 IP 地址加入允许列表。你可以在以下页面找到一份[ClickPipes IP 地址列表](../index.md#list-of-static-ips)。
   更多信息请参考[本页顶部](#prerequisites)链接的源 MySQL 设置指南。
   :::

   <Image img={mysql_connection_details} alt="填写连接信息" size="lg" border/>

#### （可选）设置 SSH 隧道 \\{#optional-set-up-ssh-tunneling\\}

如果你的源 MySQL 数据库无法通过公网访问，你可以配置 SSH 隧道的相关参数。

1. 启用 "Use SSH Tunnelling" 开关。
2. 填写 SSH 连接信息。

   <Image img={ssh_tunnel} alt="SSH 隧道" size="lg" border/>

3. 如需使用基于密钥的认证，点击 "Revoke and generate key pair" 以生成新的密钥对，并将生成的公钥复制到 SSH 服务器的 `~/.ssh/authorized_keys` 中。
4. 点击 "Verify Connection" 以验证连接。

:::note
请确保在 SSH 堡垒机的防火墙规则中将 [ClickPipes IP addresses](../clickpipes#list-of-static-ips) 加入允许列表，以便 ClickPipes 能够建立 SSH 隧道。
:::

在填写完连接信息后，点击 `Next`。

#### 配置高级设置 \\{#advanced-settings\\}

如有需要，你可以配置高级设置。下面是每个设置的简要说明：

- **Sync interval**：ClickPipes 轮询源数据库变更的时间间隔。这会对目标 ClickHouse 服务产生影响；对于对成本敏感的用户，建议将其保持在较大的数值（大于 `3600`）。
- **Parallel threads for initial load**：用于抓取初始快照的并行工作线程数量。当你有大量表并希望控制用于抓取初始快照的并行工作线程数量时，这个设置会很有用。该设置是针对每张表的。
- **Pull batch size**：单个批次中要抓取的行数。这是一个尽力而为型配置，在所有情况下可能不会被严格遵守。
- **Snapshot number of rows per partition**：在初始快照期间，每个分区中将要抓取的行数。当你的表中有大量行，并希望控制每个分区抓取的行数时，这个设置会很有用。
- **Snapshot number of tables in parallel**：在初始快照期间，将并行抓取的表的数量。当你有大量表，并希望控制并行抓取的表数量时，这个设置会很有用。

### 配置表 \\{#configure-the-tables\\}

5. 在这里你可以选择 ClickPipe 的目标数据库。你可以选择一个已存在的数据库，或者创建一个新数据库。

   <Image img={select_destination_db} alt="选择目标数据库" size="lg" border/>

6. 你可以选择要从源 MySQL 数据库复制的表。在选择表时，你还可以选择在目标 ClickHouse 数据库中重命名这些表，以及排除特定列。

### 检查权限并启动 ClickPipe \\{#review-permissions-and-start-the-clickpipe\\}

7. 在权限下拉框中选择 "Full access" 角色，然后点击 "Complete Setup"。

   <Image img={ch_permissions} alt="检查权限" size="lg" border/>

最后，如需了解更多常见问题及其解决方法，请参阅 ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq) 页面。

## 下一步操作 \\{#whats-next\\}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

完成使用 ClickPipe 将数据从 MySQL 复制到 ClickHouse Cloud 的设置后，即可专注于如何查询和建模数据，以实现最佳性能。有关 MySQL CDC（变更数据捕获）和故障排除的常见问题，请参阅 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。