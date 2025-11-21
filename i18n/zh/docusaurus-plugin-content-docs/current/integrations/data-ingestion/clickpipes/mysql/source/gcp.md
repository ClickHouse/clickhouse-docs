---
sidebar_label: 'Cloud SQL for MySQL'
description: '关于如何将 Cloud SQL for MySQL 配置为 ClickPipes 源的分步指南'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Cloud SQL for MySQL 源配置指南'
keywords: ['google cloud sql', 'mysql', 'clickpipes', 'pitr', 'root ca certificate']
doc_type: 'guide'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Cloud SQL for MySQL 源端设置指南

本文是一个逐步指南，介绍如何配置 Cloud SQL for MySQL 实例，以通过 MySQL ClickPipe 实现数据复制。



## 启用二进制日志保留 {#enable-binlog-retention-gcp}

二进制日志是一组日志文件,其中包含对 MySQL 服务器实例进行的数据修改信息,复制功能需要使用二进制日志文件。

### 通过 PITR 启用二进制日志记录{#enable-binlog-logging-gcp}

PITR 功能决定 Google Cloud 中 MySQL 的二进制日志记录是开启还是关闭。可以在 Cloud 控制台中编辑您的 Cloud SQL 实例并向下滚动到以下部分进行设置。

<Image img={gcp_pitr} alt='在 Cloud SQL 中启用 PITR' size='lg' border />

建议根据复制使用场景将该值设置为合理的较长时间。

如果尚未配置,请确保通过编辑 Cloud SQL 在数据库标志部分设置以下参数:

1. 将 `binlog_expire_logs_seconds` 设置为 >= `86400`(1 天)的值。
2. 将 `binlog_row_metadata` 设置为 `FULL`
3. 将 `binlog_row_image` 设置为 `FULL`

要执行此操作,请单击实例概览页面右上角的 `Edit` 按钮。

<Image
  img={gcp_mysql_edit_button}
  alt='GCP MySQL 中的编辑按钮'
  size='lg'
  border
/>

然后向下滚动到 `Flags` 部分并添加上述标志。

<Image
  img={gcp_mysql_flags}
  alt='在 GCP 中设置 binlog 标志'
  size='lg'
  border
/>


## 配置数据库用户 {#configure-database-user-gcp}

以 root 用户身份连接到您的 Cloud SQL MySQL 实例并执行以下命令:

1. 为 ClickPipes 创建专用用户:

   ```sql
   CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
   ```

2. 授予模式权限。以下示例显示了 `clickpipes` 数据库的权限。对要复制的每个数据库和主机重复执行这些命令:

   ```sql
   GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
   ```

3. 向用户授予复制权限:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```


## 配置网络访问 {#configure-network-access-gcp-mysql}

如果您想限制对 Cloud SQL 实例的流量,请将[文档中记录的静态 NAT IP 地址](../../index.md#list-of-static-ips)添加到 Cloud SQL MySQL 实例的 IP 白名单中。
这可以通过编辑实例或在 Cloud 控制台侧边栏中进入 `Connections` 选项卡来完成。

<Image img={gcp_mysql_ip} alt='GCP MySQL 中的 IP 白名单' size='lg' border />


## 下载并使用根 CA 证书 {#download-root-ca-certificate-gcp-mysql}

要连接到您的 Cloud SQL 实例,需要下载根 CA 证书。

1. 在 Cloud 控制台中进入您的 Cloud SQL 实例。
2. 在侧边栏中点击 `Connections`。
3. 点击 `Security` 选项卡。
4. 在 `Manage server CA certificates` 部分,点击底部的 `DOWNLOAD CERTIFICATES` 按钮。

<Image img={gcp_mysql_cert} alt='下载 GCP MySQL 证书' size='lg' border />

5. 在 ClickPipes 用户界面中,创建新的 MySQL ClickPipe 时上传下载的证书。

<Image img={rootca} alt='使用 GCP MySQL 证书' size='lg' border />
