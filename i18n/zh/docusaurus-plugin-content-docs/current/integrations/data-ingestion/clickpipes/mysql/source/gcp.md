---
sidebar_label: 'Cloud SQL for MySQL'
description: '将 Cloud SQL for MySQL 设置为 ClickPipes 数据源的分步指南'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Cloud SQL for MySQL 数据源配置指南'
keywords: ['Google Cloud SQL', 'MySQL', 'ClickPipes', 'PITR', 'Root CA 证书']
doc_type: '指南'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';

# Cloud SQL for MySQL 源配置指南 \{#cloud-sql-for-mysql-source-setup-guide\}

本文档是一个分步指南，介绍如何配置 Cloud SQL for MySQL 实例，以通过 MySQL ClickPipe 复制其数据。

## 启用二进制日志保留 \{#enable-binlog-retention-gcp\}

二进制日志是一组日志文件，其中包含对 MySQL 服务器实例所做数据修改的信息，且二进制日志文件是实现复制所必需的。

### 通过 PITR 启用二进制日志记录\{#enable-binlog-logging-gcp\}

PITR 功能决定是否在 Google Cloud 中为 MySQL 启用二进制日志记录。可以在 Cloud 控制台中编辑 Cloud SQL 实例，并向下滚动到下图所示部分进行配置。

<Image img={gcp_pitr} alt="在 Cloud SQL 中启用 PITR" size="lg" border/>

建议根据复制的使用场景，将该值设置为足够长的保留时间。

如果尚未配置，请通过编辑 Cloud SQL，在“数据库标志（database flags）”部分确保完成以下设置：

1. 将 `binlog_expire_logs_seconds` 设置为一个值 >= `86400`（1 天）。
2. 将 `binlog_row_metadata` 设置为 `FULL`
3. 将 `binlog_row_image` 设置为 `FULL`

为此，单击实例概览页面右上角的 `Edit` 按钮。

<Image img={gcp_mysql_edit_button} alt="GCP MySQL 中的 Edit 按钮" size="lg" border/>

然后向下滚动到 `Flags` 部分并添加上述标志。

<Image img={gcp_mysql_flags} alt="在 GCP 中设置 binlog 标志" size="lg" border/>

## 配置数据库用户 \{#configure-database-user-gcp\}

以 root 用户连接到 Cloud SQL MySQL 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. 授予 schema 权限。以下示例演示了为 `clickpipes` 数据库授予的权限。对于每个要进行复制的数据库和主机，重复执行这些命令：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## 配置网络访问 \{#configure-network-access-gcp-mysql\}

如果希望限制对 Cloud SQL 实例的网络访问，请将[文档中列出的静态 NAT IP 地址](../../index.md#list-of-static-ips) 添加到 Cloud SQL MySQL 实例的 IP 允许列表中。
可以通过编辑该实例，或在 Cloud Console 侧边栏中进入 `Connections` 选项卡来完成此操作。

<Image img={gcp_mysql_ip} alt="在 GCP MySQL 中进行 IP 允许列表配置" size="lg" border/>

## 下载并使用根 CA 证书 \{#download-root-ca-certificate-gcp-mysql\}

要连接到 Cloud SQL 实例，您需要先下载根 CA 证书。

1. 在 Cloud 控制台中转到您的 Cloud SQL 实例。
2. 点击侧边栏中的 `Connections`。
3. 点击 `Security` 选项卡。
4. 在 `Manage server CA certificates` 部分，点击底部的 `DOWNLOAD CERTIFICATES` 按钮。

<Image img={gcp_mysql_cert} alt="Downloading GCP MySQL Cert" size="lg" border/>

5. 在 ClickPipes UI 中创建新的 MySQL ClickPipe 时，上传刚刚下载的证书。

<Image img={rootca} alt="Using GCP MySQL Cert" size="lg" border/>