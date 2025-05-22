---
'sidebar_label': 'MySQL 的 ClickPipes'
'description': '描述如何无缝连接您的 MySQL 与 ClickHouse Cloud。'
'slug': '/integrations/clickpipes/mysql'
'title': '从 MySQL 到 ClickHouse 的数据摄取 (使用 CDC)'
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

# 从 MySQL 到 ClickHouse 使用 CDC 导入数据

<BetaBadge/>

:::info
目前，通过 ClickPipes 从 MySQL 向 ClickHouse Cloud 导入数据处于私有预览阶段。
:::

您可以使用 ClickPipes 将数据从您的源 MySQL 数据库导入到 ClickHouse Cloud。源 MySQL 数据库可以托管在本地或云中。

## 前提条件 {#prerequisites}

要开始，请首先确保您的 MySQL 数据库已正确设置。根据您的源 MySQL 实例，您可以遵循以下任何指南：

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [Amazon RDS MariaDB](./mysql/source/rds_maria)

一旦您的源 MySQL 数据库设置完成，您就可以继续创建您的 ClickPipe。

## 创建您的 ClickPipe {#creating-your-clickpipe}

确保您已登录到您的 ClickHouse Cloud 帐户。如果您还没有帐户，可以 [在这里注册](https://cloud.clickhouse.com/)。

[//]: # (   TODO update image here)
1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 在左侧菜单中选择 `数据源` 按钮，然后点击“设置 ClickPipe”

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 `MySQL CDC` 瓦片

<Image img={mysql_tile} alt="Select MySQL" size="lg" border/>

### 添加源 MySQL 数据库连接 {#adding-your-source-mysql-database-connection}

4. 填写您在前提条件步骤中配置的源 MySQL 数据库的连接详细信息。

   :::info

   在您开始添加连接详细信息之前，请确保您已在防火墙规则中列入 ClickPipes IP 地址。在以下页面中，您可以找到 [ClickPipes IP 地址的列表](../index.md#list-of-static-ips)。
   有关更多信息，请参阅链接到 [本页面顶部](#prerequisites) 的源 MySQL 设置指南。

   :::

   <Image img={mysql_connection_details} alt="Fill in connection details" size="lg" border/>

#### （可选）设置 SSH 隧道 {#optional-setting-up-ssh-tunneling}

如果您的源 MySQL 数据库不可公开访问，您可以指定 SSH 隧道详细信息。

1. 启用“使用 SSH 隧道”切换。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 要使用基于密钥的身份验证，单击“撤销并生成密钥对”以生成新的密钥对，并将生成的公钥复制到您的 SSH 服务器下的 `~/.ssh/authorized_keys`。
4. 单击“验证连接”以验证连接。

:::note

确保在 SSH 中转主机的防火墙规则中列入 [ClickPipes IP 地址](../clickpipes#list-of-static-ips)，以便 ClickPipes 能够建立 SSH 隧道。

:::

填写连接详细信息后，单击“下一步”。

#### 配置高级设置 {#advanced-settings}

如果需要，您可以配置高级设置。以下是每个设置的简要说明：

- **同步间隔**: 这是 ClickPipes 每次查询源数据库进行更改的间隔。对于成本敏感的用户，我们建议将该值保持在较高的值（超过 `3600`）。
- **初始负载的并行线程**: 这是将用于获取初始快照的并行工作者数量。当您有大量表并且希望控制用于获取初始快照的并行工作者数量时，这很有用。此设置是按表的。
- **拉取批量大小**: 在单个批次中提取的行数。这是一个尽力而为的设置，可能在所有情况下不被遵守。
- **每个分区的快照行数**: 这是在初始快照期间每个分区中将被提取的行数。当您的表中有大量行时，这很有用，您希望控制每个分区中提取的行数。
- **并行处理的表数量快照**: 这是在初始快照期间将并行提取的表的数量。当您有大量表并且希望控制并行提取的表数量时，这很有用。

### 配置表 {#configuring-the-tables}

5. 在这里，您可以选择 ClickPipe 的目标数据库。您可以选择现有数据库或创建新数据库。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. 您可以选择要从源 MySQL 数据库复制的表。在选择表时，您还可以选择在目标 ClickHouse 数据库中重命名表以及排除特定列。

### 审核权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

7. 从权限下拉菜单中选择“完全访问”角色，然后点击“完成设置”。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

最后，请访问 ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq) 页面以获取有关常见问题及其解决方法的更多信息。
