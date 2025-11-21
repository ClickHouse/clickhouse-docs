---
sidebar_label: '将数据从 MySQL 导入 ClickHouse'
description: '说明如何将 MySQL 无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/mysql
title: '将数据从 MySQL 导入 ClickHouse（使用 CDC）'
doc_type: 'guide'
keywords: ['MySQL', 'ClickPipes', 'CDC', 'change data capture', 'database replication']
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# 使用 CDC 将数据从 MySQL 导入 ClickHouse Cloud

<BetaBadge/>

:::info
通过 ClickPipes 将数据从 MySQL 导入 ClickHouse Cloud 目前处于公测阶段。
:::

可以使用 ClickPipes 将源 MySQL 数据库中的数据导入 ClickHouse Cloud。源 MySQL 数据库可以部署在本地环境，或托管在 Amazon RDS、Google Cloud SQL 等云服务上。



## 前提条件 {#prerequisites}

开始之前,您需要确保 MySQL 数据库已正确配置 binlog 复制。配置步骤取决于您部署 MySQL 的方式,请参考以下相关指南:

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [通用 MySQL](./mysql/source/generic)

5. [Amazon RDS MariaDB](./mysql/source/rds_maria)

6. [通用 MariaDB](./mysql/source/generic_maria)

完成源 MySQL 数据库配置后,即可继续创建 ClickPipe。


## 创建您的 ClickPipe {#create-your-clickpipe}

请确保您已登录 ClickHouse Cloud 账户。如果您还没有账户,可以在[此处](https://cloud.clickhouse.com/)注册。

[//]: # "   TODO update image here"

1. 在 ClickHouse Cloud 控制台中,导航至您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt='ClickPipes service' size='lg' border />

2. 在左侧菜单中选择 `Data Sources` 按钮,然后点击"Set up a ClickPipe"

<Image img={cp_step0} alt='Select imports' size='lg' border />

3. 选择 `MySQL CDC` 选项

<Image img={mysql_tile} alt='Select MySQL' size='lg' border />

### 添加源 MySQL 数据库连接 {#add-your-source-mysql-database-connection}

4. 填写您在前提条件步骤中配置的源 MySQL 数据库连接详细信息。

   :::info
   在开始添加连接详细信息之前,请确保您已在防火墙规则中将 ClickPipes IP 地址加入白名单。您可以在以下页面找到 [ClickPipes IP 地址列表](../index.md#list-of-static-ips)。
   有关更多信息,请参阅[本页顶部](#prerequisites)链接的源 MySQL 设置指南。
   :::

   <Image
     img={mysql_connection_details}
     alt='Fill in connection details'
     size='lg'
     border
   />

#### (可选)设置 SSH 隧道 {#optional-set-up-ssh-tunneling}

如果您的源 MySQL 数据库无法公开访问,您可以指定 SSH 隧道详细信息。

1. 启用"Use SSH Tunnelling"开关。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt='SSH tunneling' size='lg' border />

3. 要使用基于密钥的身份验证,请点击"Revoke and generate key pair"生成新的密钥对,并将生成的公钥复制到您 SSH 服务器的 `~/.ssh/authorized_keys` 文件中。
4. 点击"Verify Connection"验证连接。

:::note
请确保在 SSH 堡垒主机的防火墙规则中将 [ClickPipes IP 地址](../clickpipes#list-of-static-ips)加入白名单,以便 ClickPipes 能够建立 SSH 隧道。
:::

填写完连接详细信息后,点击 `Next`。

#### 配置高级设置 {#advanced-settings}

如有需要,您可以配置高级设置。以下是每个设置的简要说明:

- **Sync interval**: ClickPipes 轮询源数据库以获取变更的时间间隔。这会影响目标 ClickHouse 服务,对于成本敏感的用户,我们建议将此值设置得较高(超过 `3600`)。
- **Parallel threads for initial load**: 用于获取初始快照的并行工作线程数。当您有大量表并希望控制用于获取初始快照的并行工作线程数时,此设置很有用。此设置按表配置。
- **Pull batch size**: 单批次获取的行数。这是一个尽力而为的设置,可能并非在所有情况下都会生效。
- **Snapshot number of rows per partition**: 初始快照期间每个分区将获取的行数。当您的表中有大量行并希望控制每个分区获取的行数时,此设置很有用。
- **Snapshot number of tables in parallel**: 初始快照期间将并行获取的表数。当您有大量表并希望控制并行获取的表数时,此设置很有用。

### 配置表 {#configure-the-tables}

5. 在此处您可以为 ClickPipe 选择目标数据库。您可以选择现有数据库或创建新数据库。

   <Image
     img={select_destination_db}
     alt='Select destination database'
     size='lg'
     border
   />

6. 您可以选择要从源 MySQL 数据库复制的表。在选择表时,您还可以选择在目标 ClickHouse 数据库中重命名表以及排除特定列。

### 审查权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

7. 从权限下拉菜单中选择"Full access"角色,然后点击"Complete Setup"。

   <Image img={ch_permissions} alt='Review permissions' size='lg' border />

最后,请参阅["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq)页面,了解有关常见问题及其解决方法的更多信息。


## 下一步 {#whats-next}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

完成 ClickPipe 从 MySQL 到 ClickHouse Cloud 的数据复制配置后,您可以专注于如何查询和建模数据以实现最佳性能。关于 MySQL CDC 和故障排除的常见问题,请参阅 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。
