---
'sidebar_label': '从 MySQL 到 ClickHouse 进行数据摄取'
'description': '描述如何无缝连接您的 MySQL 到 ClickHouse Cloud。'
'slug': '/integrations/clickpipes/mysql'
'title': '从 MySQL 到 ClickHouse 进行数据摄取 (使用 CDC)'
'doc_type': 'guide'
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


# 从 MySQL 向 ClickHouse 中摄取数据 (使用 CDC)

<BetaBadge/>

:::info
通过 ClickPipes 将数据从 MySQL 摄取到 ClickHouse Cloud 当前处于公开测试阶段。
:::

您可以使用 ClickPipes 将数据从源 MySQL 数据库摄取到 ClickHouse Cloud。源 MySQL 数据库可以托管在本地或使用 Amazon RDS、Google Cloud SQL 等服务在云中。

## 前提条件 {#prerequisites}

要开始，您首先需要确保您的 MySQL 数据库已正确配置为 binlog 复制。配置步骤取决于您部署 MySQL 的方式，因此请遵循以下相关指南：

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [通用 MySQL](./mysql/source/generic)

5. [Amazon RDS MariaDB](./mysql/source/rds_maria)

6. [通用 MariaDB](./mysql/source/generic_maria)

一旦您的源 MySQL 数据库设置完成，您可以继续创建 ClickPipe。

## 创建你的 ClickPipe {#create-your-clickpipe}

确保您已登录到您的 ClickHouse Cloud 账户。如果您还没有账户，可以 [在这里注册](https://cloud.clickhouse.com/)。

[//]: # (   TODO update image here)
1. 在 ClickHouse Cloud 控制台中，导航到您的 ClickHouse Cloud 服务。

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. 选择左侧菜单中的 `数据源` 按钮，然后点击 "设置 ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. 选择 `MySQL CDC` 瓷砖

<Image img={mysql_tile} alt="Select MySQL" size="lg" border/>

### 添加源 MySQL 数据库连接 {#add-your-source-mysql-database-connection}

4. 填写您在前提条件步骤中配置的源 MySQL 数据库的连接详细信息。

   :::info
   在您开始添加连接详细信息之前，请确保已在防火墙规则中将 ClickPipes IP 地址列入白名单。在以下页面中，您可以找到 [ClickPipes IP 地址列表](../index.md#list-of-static-ips)。
   有关更多信息，请参考此页面顶部链接的源 MySQL 设置指南 [（前提条件）](#prerequisites)。
   :::

   <Image img={mysql_connection_details} alt="Fill in connection details" size="lg" border/>

#### （可选）设置 SSH 隧道 {#optional-set-up-ssh-tunneling}

如果您的源 MySQL 数据库无法公开访问，您可以指定 SSH 隧道详细信息。

1. 启用 "使用 SSH 隧道" 切换。
2. 填写 SSH 连接详细信息。

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. 若要使用基于密钥的身份验证，单击 "撤销并生成密钥对" 以生成新的密钥对，并将生成的公钥复制到您的 SSH 服务器下的 `~/.ssh/authorized_keys` 文件中。
4. 点击 "验证连接" 以验证连接。

:::note
确保在防火墙规则中将 [ClickPipes IP 地址](../clickpipes#list-of-static-ips) 列入白名单，以便 SSH 路由主机可以建立 SSH 隧道。
:::

填写连接详细信息后，单击 `下一步`。

#### 配置高级设置 {#advanced-settings}

如果需要，您可以配置高级设置。以下是每个设置的简要说明：

- **同步间隔**：这是 ClickPipes 轮询源数据库以获取更改的间隔。对于成本敏感的用户，我们建议将其保持在较高值（超过 `3600`）。
- **初始加载的并行线程**：这是用于获取初始快照的并行工作者数量。当您有大量表时，这很有用，您可以控制获取初始快照所用的并行工作者数量。此设置是每个表的。
- **拉取批量大小**：在单个批次中要获取的行数。这是一个最佳努力设置，可能在所有情况下都无法得到遵守。
- **每个分区的快照行数**：在初始快照时每个分区将获取的行数。当您在表中有大量行并希望控制在每个分区中获取的行数时，这非常有用。
- **并行快照表的数量**：在初始快照期间将并行获取的表数量。当您有大量表并希望控制并行获取的表数量时，这很有用。

### 配置表 {#configure-the-tables}

5. 在这里，您可以选择 ClickPipe 的目标数据库。您可以选择现有数据库或创建新数据库。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. 您可以选择要从源 MySQL 数据库复制的表。在选择表时，您还可以选择在目标 ClickHouse 数据库中重命名表以及排除特定列。

### 审核权限并启动 ClickPipe {#review-permissions-and-start-the-clickpipe}

7. 从权限下拉菜单中选择 "完全访问" 角色，然后点击 "完成设置"。

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

最后，请参考 ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq) 页面以获取关于常见问题和解决方案的更多信息。

## 接下来做什么？ {#whats-next}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

一旦您设置了 ClickPipe 从 MySQL 向 ClickHouse Cloud 复制数据，您可以专注于如何查询和建模您的数据以获得最佳性能。有关 MySQL CDC 和故障排除的常见问题，请参见 [MySQL FAQs 页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。
