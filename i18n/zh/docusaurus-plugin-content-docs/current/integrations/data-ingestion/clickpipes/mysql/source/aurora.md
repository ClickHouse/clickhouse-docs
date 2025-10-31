---
'sidebar_label': 'Amazon Aurora MySQL'
'description': '逐步指南，介绍如何将 Amazon Aurora MySQL 设置为 ClickPipes 的源'
'slug': '/integrations/clickpipes/mysql/source/aurora'
'title': 'Aurora MySQL 源设置指南'
'doc_type': 'guide'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import aurora_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/aurora_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# Aurora MySQL 源设置指南

本分步指南展示了如何配置 Amazon Aurora MySQL 将数据复制到 ClickHouse Cloud，使用 [MySQL ClickPipe](../index.md)。有关 MySQL CDC 的常见问题，请参见 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。

## 启用二进制日志保留 {#enable-binlog-retention-aurora}

二进制日志是一组包含有关对 MySQL 服务器实例进行的数据修改的信息的日志文件，二进制日志文件是复制所必需的。要在 Aurora MySQL 中配置二进制日志保留，您必须 [启用二进制日志记录](#enable-binlog-logging) 和 [增加 binlog 保留间隔](#binlog-retention-interval)。

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging}

自动备份功能决定了 MySQL 是否启用二进制日志。可以在 RDS 控制台为您的实例配置自动备份，导航到 **修改** > **附加配置** > **备份**，然后选择 **启用自动备份** 复选框（如果尚未选择）。

<Image img={rds_backups} alt="在 Aurora 中启用自动备份" size="lg" border/>

我们建议根据复制用例将 **备份保留期** 设置为一个相对较长的值。

### 2. 增加 binlog 保留间隔 {#binlog-retention-interval}

:::warning
如果 ClickPipes 尝试恢复复制，而所需的 binlog 文件由于配置的 binlog 保留值而被清除，则 ClickPipe 将进入错误状态，需要重新同步。
:::

默认情况下，Aurora MySQL 会尽快清除二进制日志（即，_惰性清除_）。我们建议将 binlog 保留间隔增加到至少 **72 小时**，以确保在故障场景下可用的二进制日志文件。要设置 binlog 保留间隔 ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours))，请使用 [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) 过程：

[//]: # "NOTE Most CDC providers recommend the maximum retention period for Aurora RDS (7 days/168 hours). Since this has an impact on disk usage, we conservatively recommend a minimum of 3 days/72 hours."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

如果未设置此配置或设置为较低的间隔，可能会导致二进制日志中的间隙，从而影响 ClickPipes 恢复复制的能力。

## 配置 binlog 设置 {#binlog-settings}

要找到参数组，请在 RDS 控制台中点击您的 MySQL 实例，然后导航到 **配置** 标签。

:::tip
如果您有 MySQL 集群，上述参数可以在 [DB 集群](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到，而不是 DB 实例组中。
:::

<Image img={aurora_config} alt="在 Aurora 中找到参数组的位置" size="lg" border/>

<br/>
点击参数组链接，这将带您到其专用页面。您应该会在右上角看到一个 **编辑** 按钮。

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

<br/>
以下参数需要设置如下：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="Binlog 格式为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`。

<Image img={binlog_row_metadata} alt="Binlog 行元数据" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`。

<Image img={binlog_row_image} alt="Binlog 行图像" size="lg" border/>

<br/>
然后，点击右上角的 **保存更改**。您可能需要重启您的实例才能使更改生效 — 一种知道这一点的方法是在 Aurora 实例的 **配置** 标签中，您能在参数组链接旁边看到 `待重启`。

## 启用 GTID 模式（推荐） {#gtid-mode}

:::tip
MySQL ClickPipe 也支持在未启用 GTID 模式的情况下进行复制。然而，建议启用 GTID 模式以获得更好的性能和更容易的故障排除。
:::

[全局事务标识符 (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) 是分配给 MySQL 中每个已提交事务的唯一 ID。它们简化了 binlog 复制，并使故障排除更为简单。我们 **建议** 启用 GTID 模式，以便 MySQL ClickPipe 可以使用基于 GTID 的复制。

GTID 基于复制支持 Amazon Aurora MySQL v2 (MySQL 5.7) 和 v3 (MySQL 8.0)，以及 Aurora Serverless v2。要为您的 Aurora MySQL 实例启用 GTID 模式，请按照以下步骤操作：

1. 在 RDS 控制台中，点击您的 MySQL 实例。
2. 点击 **配置** 标签。
3. 点击参数组链接。
4. 点击右上角的 **编辑** 按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 点击右上角的 **保存更改**。
8. 重启您的实例以使更改生效。

<Image img={enable_gtid} alt="GTID 已启用" size="lg" border/>

## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到您的 Aurora MySQL 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例展示了 `mysql` 数据库的权限。对每个您想要复制的数据库和主机重复这些命令：

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. 授予用户复制权限：

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## 配置网络访问 {#configure-network-access}

### 基于 IP 的访问控制 {#ip-based-access-control}

要限制对您的 Aurora MySQL 实例的流量，请将 [记录的静态 NAT IPs](../../index.md#list-of-static-ips) 添加到您的 Aurora 安全组的 **入站规则**。

<Image img={security_group_in_rds_mysql} alt="在 Aurora MySQL 中找到安全组的位置？" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 的私有访问 {#private-access-via-aws-privatelink}

要通过私人网络连接到您的 Aurora MySQL 实例，您可以使用 AWS PrivateLink。请遵循 [ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 设置连接。

## 接下来是什么？ {#whats-next}

现在您的 Amazon Aurora MySQL 实例已配置为 binlog 复制，并安全连接到 ClickHouse Cloud，您可以 [创建您的第一个 MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe)。有关 MySQL CDC 的常见问题，请参见 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。
