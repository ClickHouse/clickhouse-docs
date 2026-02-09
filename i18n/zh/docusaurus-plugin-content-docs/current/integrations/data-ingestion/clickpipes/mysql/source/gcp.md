---
sidebar_label: 'Cloud SQL For MySQL 源设置指南'
description: '分步指南，介绍如何将 Cloud SQL for MySQL 配置为 ClickPipes 的源'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Cloud SQL for MySQL 源设置指南'
keywords: ['google cloud sql', 'mysql', 'clickpipes', 'pitr', 'root ca certificate']
doc_type: 'guide'
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


# Cloud SQL for MySQL 源设置指南 \{#cloud-sql-for-mysql-source-setup-guide\}

本指南通过分步说明，介绍如何配置 Cloud SQL for MySQL 实例，使其能够通过 MySQL ClickPipe 进行数据复制。

## 启用二进制日志保留 \{#enable-binlog-retention-gcp\}

二进制日志是一组日志文件，用于记录对 MySQL 服务器实例所做的数据修改，而二进制日志文件是实现复制所必需的。

### 通过 PITR 启用二进制日志 \{#enable-binlog-logging-gcp\}

PITR 功能决定了在 Google Cloud 中 MySQL 的二进制日志是否开启。可以在 Cloud 控制台中进行设置：编辑 Cloud SQL 实例，然后向下滚动到下方相关部分。

<Image img={gcp_pitr} alt="在 Cloud SQL 中启用 PITR" size="lg" border/>

根据复制场景，将该值设置为相对较长的时间是推荐做法。

如果尚未配置，请在编辑 Cloud SQL 时，确保在数据库 flags 部分设置以下参数：

1. 将 `binlog_expire_logs_seconds` 设置为 >= `86400`（1 天）。
2. 将 `binlog_row_metadata` 设置为 `FULL`
3. 将 `binlog_row_image` 设置为 `FULL`

为此，请在实例概览页面右上角点击 `Edit` 按钮。

<Image img={gcp_mysql_edit_button} alt="GCP MySQL 中的 Edit 按钮" size="lg" border/>

然后向下滚动到 `Flags` 部分并添加上述 flags。

<Image img={gcp_mysql_flags} alt="在 GCP 中设置 binlog flags" size="lg" border/>

## 配置数据库用户 \{#configure-database-user-gcp\}

以 root 用户身份连接到 Cloud SQL MySQL 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. 授予 schema 权限。以下示例展示了为 `clickpipes` 数据库授予的权限。对于每个你希望复制的数据库和主机，重复执行这些命令：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## 配置网络访问 \{#configure-network-access-gcp-mysql\}

如果你想限制发往 Cloud SQL 实例的流量，请将[文档中列出的静态 NAT IP](../../index.md#list-of-static-ips) 添加到 Cloud SQL MySQL 实例的 IP 允许列表中。
你可以通过编辑实例来完成此操作，或者在 Cloud 控制台侧边栏中转到 `Connections` 选项卡进行配置。

<Image img={gcp_mysql_ip} alt="在 GCP MySQL 中配置 IP 允许列表" size="lg" border/>

## 下载并使用根 CA 证书 \{#download-root-ca-certificate-gcp-mysql\}

要连接到 Cloud SQL 实例，首先需要下载根 CA 证书。

1. 在 Cloud 控制台中打开并选择您的 Cloud SQL 实例。
2. 在侧边栏中点击 `Connections`。
3. 点击 `Security` 选项卡。
4. 在 `Manage server CA certificates` 部分，点击底部的 `DOWNLOAD CERTIFICATES` 按钮。

<Image img={gcp_mysql_cert} alt="下载 GCP MySQL 证书" size="lg" border/>

5. 在 ClickPipes UI 中，新建 MySQL ClickPipe 时上传刚才下载的证书。

<Image img={rootca} alt="使用 GCP MySQL 证书" size="lg" border/>