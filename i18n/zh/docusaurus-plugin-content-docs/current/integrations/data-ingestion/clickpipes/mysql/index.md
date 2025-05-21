---
'sidebar_label': 'ClickPipes for MySQL'
'description': '描述如何无缝连接您的 MySQL 到 ClickHouse 云。'
'slug': '/integrations/clickpipes/mysql'
'title': 'Ingesting Data from MySQL to ClickHouse (using CDC)'
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


# 从 MySQL 到 ClickHouse 的数据摄取使用 CDC

<BetaBadge/>

:::info
目前，通过 ClickPipes 从 MySQL 向 ClickHouse Cloud 摄取数据正处于私人预览阶段。
:::

您可以使用 ClickPipes 将来自源 MySQL 数据库的数据摄取到 ClickHouse Cloud。源 MySQL 数据库可以托管在本地或云中。

## 前提条件 {#prerequisites}

要开始，您首先需要确保您的 MySQL 数据库已正确设置。根据您的源 MySQL 实例，您可以遵循以下任何指南：

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [Amazon RDS MariaDB](./mysql/source/rds_maria)

一旦您的源 MySQL 数据库设置完成，您可以继续创建 ClickPipe。

## 创建您的 ClickPipe {#creating-your-clickpipe}

确保您已登录到 ClickHouse Cloud 帐户。如果您还没有帐户，可以在 [这里](https://cloud.clickhouse.com/) 注册。

[//]: # (   TODO update image here)
1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 在左侧菜单中选择 `Data Sources` 按钮，然后点击 "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 `MySQL CDC` 瓦块

<Image img={mysql_tile} alt="Select MySQL" size="lg" border/>

### 添加您的源 MySQL 数据库连接 {#adding-your-source-mysql-database-connection}

4. 填写您在前提条件步骤中配置的源 MySQL 数据库的连接详细信息。

   :::info
   
   在您开始添加连接详细信息之前，请确保您已在防火墙规则中将 ClickPipes 的 IP 地址列入白名单。在以下页面中，您可以找到 [ClickPipes IP 地址列表](../index.md#list-of-static-ips)。
   有关更多信息，请参阅链接到 [本页顶部](#prerequisites) 的源 MySQL 设置指南。

   :::

   <Image img={mysql_connection_details} alt="Fill in connection details" size="lg" border/>

#### （可选）设置 SSH 隧道 {#optional-setting-up-ssh-tunneling}

如果您的源 MySQL 数据库不对外公开，您可以指定 SSH 隧道详细信息。

1. 启用 "Use SSH Tunnelling" 切换开关。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 要使用基于密钥的身份验证，请点击 "Revoke and generate key pair" 生成新的密钥对，并将生成的公钥复制到您的 SSH 服务器上的 `~/.ssh/authorized_keys`。
4. 点击 "Verify Connection" 以验证连接。

:::note

请确保在 SSH 中继主机的防火墙规则中将 [ClickPipes IP 地址](../clickpipes#list-of-static-ips) 列入白名单，以便 ClickPipes 可以建立 SSH 隧道。

:::

填写连接详细信息后，点击 "Next"。

#### 配置高级设置 {#advanced-settings}

如有需要，您可以配置高级设置。以下是每个设置的简要说明：

- **同步间隔**：这是 ClickPipes 查询源数据库更改的间隔。这会影响目标 ClickHouse 服务，对于成本敏感的用户，我们建议将其设置为较高的值（超过 `3600`）。
- **初始加载的并行线程**：这是用于获取初始快照的并行工作线程数量。这在您有大量表并且想控制用于获取初始快照的并行工作线程数量时非常有用。这个设置是按表进行的。
- **拉取批量大小**：单次批量中要获取的行数。这是一个最佳努力设置，可能在所有情况下都不被遵守。
- **每个分区的快照行数**：在初始快照期间，每个分区将获取的行数。当您在表中有大量行并希望控制每个分区中获取的行数时，带来便利。
- **并行快照的表数量**：在初始快照期间，将并行获取的表的数量。当您有大量表并希望控制并行获取的表数量时，这个设置很有用。

### 配置表 {#configuring-the-tables}

5. 在此处，您可以选择 ClickPipe 的目标数据库。您可以选择现有数据库或创建新数据库。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. 您可以选择要从源 MySQL 数据库复制的表。在选择表时，您还可以选择重命名目标 ClickHouse 数据库中的表，并排除特定列。

### 审阅权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

7. 从权限下拉菜单中选择 "Full access" 角色，然后点击 "Complete Setup"。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

最后，请参考 ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq) 页面，以获取关于常见问题及其解决方案的更多信息。
