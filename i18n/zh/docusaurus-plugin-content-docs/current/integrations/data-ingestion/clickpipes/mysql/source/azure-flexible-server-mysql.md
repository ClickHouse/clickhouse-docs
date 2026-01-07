---
sidebar_label: 'Azure Flexible Server for MySQL'
description: '将 Azure Flexible Server for MySQL 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/mysql/source/azure-flexible-server-mysql
title: 'Azure Flexible Server for MySQL 源端配置指南'
keywords: ['azure', 'flexible server', 'mysql', 'clickpipes', 'binlog']
doc_type: 'guide'
---

import configure_network_security from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/azure-flexible-server-mysql/1_configure_network_security.png';
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Azure Flexible Server for MySQL 源端设置指南 {#azure-flexible-server-for-mysql-source-setup-guide}

本分步指南将演示如何配置 Azure Flexible Server for MySQL，通过 [MySQL ClickPipe](../index.md) 将数据复制到 ClickHouse Cloud。此服务仅支持**一次性摄取**。关于 MySQL CDC 的常见问题，请参阅 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。

:::warning
此服务**不支持通过 CDC 持续摄取**。Azure Flexible Server for MySQL 不允许将 [`binlog_row_metadata`](https://dev.mysql.com/doc/refman/en/replication-options-binary-log.html#sysvar_binlog_row_metadata) 系统变量配置为 `FULL`，而这是在 ClickPipes 中实现完整 MySQL CDC 所必需的。

请在 [Azure 反馈论坛](https://feedback.azure.com/d365community/forum/47b1e71d-ee24-ec11-b6e6-000d3a4f0da0)提交功能请求，为 [此问题](https://learn.microsoft.com/en-us/answers/questions/766047/setting-binlog-row-metadata-to-full-in-azure-db-fo)投票，或[联系 Azure 支持](https://azure.microsoft.com/en-us/support/create-ticket/)以请求此功能。
:::

## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到您的 Azure Flexible Server for MySQL 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. 授予 schema 权限。以下示例展示了为 `mysql` 数据库授予的权限。对于每个您想要复制的数据库和主机，重复执行这些命令：

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'%';
    ```

3. 应用权限更改：

   ```sql
   FLUSH PRIVILEGES;
   ```

## 配置网络访问 {#configure-network-access}

:::note
ClickPipes 不支持 Azure Private Link 连接。如果不允许从公网访问 Azure Flexible Server for MySQL 实例，可以[使用 SSH 隧道](#configure-network-security)进行安全连接。Azure Private Link 将在未来得到支持。
:::

接下来，需要允许 ClickPipes 连接到 Azure Flexible Server for MySQL 实例。

<Tabs groupId="network-configuration">
<TabItem value="public-ip" label="允许 ClickPipes IP">

1. 在 Azure 门户中，导航到 **All resources**。选择 Azure Flexible Server for MySQL 实例以打开 **Overview** 页面。

2. 在 **Settings** 下选择 **Networking**，并确保已启用 **Public access**。

3. 在 **Firewall rules** 部分中，为服务部署所在区域输入[ClickPipes 静态 IP 地址列表](../../index.md#list-of-static-ips)。

   <Image img={configure_network_security} alt="为具有 IP 允许列表的公共访问配置网络" size="lg" border/>

4. 单击 **Save** 以保存网络安全配置更改。

</TabItem>
<TabItem value="ssh-tunnel" label="使用 SSH 隧道">

如果不允许从公网访问 Azure Flexible Server for MySQL 实例，则必须先设置一个 SSH 跳板机（bastion host），以通过安全隧道建立连接。在 Azure 上设置 SSH 跳板机：

1. 按照[官方文档](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)创建并启动 Azure Virtual Machine (VM)。
   - 确保该 VM 与 Azure Flexible Server for MySQL 实例位于同一虚拟网络 (VNet)，或位于已对等互联且具备连通性的 VNet 中。
   - 确保该 VM 拥有[静态公网 IP 地址](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/virtual-network-public-ip-address)。在将 ClickPipes 连接到 SSH 跳板机时，将使用此 IP 地址。

2. 更新 SSH 跳板机的 Network Security Group (NSG) 规则，以允许来自服务部署所在区域[ClickPipes 静态 IP 地址列表](../../index.md#list-of-static-ips)的流量。

3. 更新 Azure Flexible Server for MySQL 实例的防火墙规则，以允许来自 SSH 跳板机[私有 IP 地址](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses)的流量。

</TabItem>
</Tabs>

## 后续步骤 {#whats-next}

现在可以[创建 ClickPipe](../index.md)，并开始将 Azure Flexible Server for MySQL 实例中的数据摄取到 ClickHouse Cloud 中。请务必记录在设置实例时使用的连接信息，因为在创建 ClickPipe 的过程中将需要这些信息。