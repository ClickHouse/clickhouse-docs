---
'sidebar_label': 'Cloud SQL For MySQL '
'description': '逐步指南，介绍如何将 Cloud SQL for MySQL 设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mysql/source/gcp'
'title': 'Cloud SQL for MySQL 源设置指南'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Cloud SQL for MySQL 源设置指南

这是一个逐步指导，说明如何配置您的 Cloud SQL for MySQL 实例，通过 MySQL ClickPipe 复制其数据。

## 启用二进制日志保留 {#enable-binlog-retention-gcp}
二进制日志是一组日志文件，包含有关对 MySQL 服务器实例进行的数据修改的信息，并且二进制日志文件是复制所必需的。

### 通过 PITR 启用二进制日志 {#enable-binlog-logging-gcp}
PITR 功能决定了 Google Cloud 中 MySQL 的二进制日志是否打开或关闭。可以在 Cloud 控制台中设置，通过编辑您的 Cloud SQL 实例并向下滚动到以下部分。

<Image img={gcp_pitr} alt="在 Cloud SQL 中启用 PITR" size="lg" border/>

建议根据复制用例将值设置为一个合理的较长值。

如果尚未配置，请确保在数据库标志部分通过编辑 Cloud SQL 设置以下内容：
1. `binlog_expire_logs_seconds` 设置为 >= `86400`（1 天）。
2. `binlog_row_metadata` 设置为 `FULL`
3. `binlog_row_image` 设置为 `FULL`

要执行此操作，请单击实例概述页面右上角的 `Edit` 按钮。
<Image img={gcp_mysql_edit_button} alt="GCP MySQL 中的编辑按钮" size="lg" border/>

然后向下滚动到 `Flags` 部分并添加上述标志。

<Image img={gcp_mysql_flags} alt="在 GCP 中设置 binlog 标志" size="lg" border/>

## 配置数据库用户 {#configure-database-user-gcp}

以 root 用户身份连接到您的 Cloud SQL MySQL 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予架构权限。以下示例显示了 `clickpipes` 数据库的权限。对每个要复制的数据库和主机重复这些命令：

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
```

3. 授予用户复制权限：

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## 配置网络访问 {#configure-network-access-gcp-mysql}

如果您希望限制对 Cloud SQL 实例的流量，请将 [文档中的静态 NAT IP](../../index.md#list-of-static-ips) 添加到您的 Cloud SQL MySQL 实例的白名单 IP 中。
这可以通过编辑实例或在 Cloud 控制台的侧边栏中转到 `Connections` 选项卡来完成。

<Image img={gcp_mysql_ip} alt="GCP MySQL 中的 IP 白名单" size="lg" border/>

## 下载并使用根 CA 证书 {#download-root-ca-certificate-gcp-mysql}
要连接到您的 Cloud SQL 实例，您需要下载根 CA 证书。

1. 在 Cloud 控制台中访问您的 Cloud SQL 实例。
2. 点击侧边栏中的 `Connections`。
3. 点击 `Security` 选项卡。
4. 在 `Manage server CA certificates` 部分，点击底部的 `DOWNLOAD CERTIFICATES` 按钮。

<Image img={gcp_mysql_cert} alt="下载 GCP MySQL 证书" size="lg" border/>

5. 在 ClickPipes UI 中，上传下载的证书以创建新的 MySQL ClickPipe。

<Image img={rootca} alt="使用 GCP MySQL 证书" size="lg" border/>
