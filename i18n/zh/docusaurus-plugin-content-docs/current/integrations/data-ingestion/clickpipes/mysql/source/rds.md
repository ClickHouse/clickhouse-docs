---
'sidebar_label': 'Amazon RDS MySQL'
'description': '逐步指南，介绍如何将 Amazon RDS MySQL 设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mysql/source/rds'
'title': 'RDS MySQL 源设置指南'
'doc_type': 'guide'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# RDS MySQL 源设置指南

本分步指南将指导您如何配置 Amazon RDS MySQL，以使用 [MySQL ClickPipe](../index.md) 将数据复制到 ClickHouse Cloud。有关 MySQL CDC 的常见问题，请参阅 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。

## 启用二进制日志保留 {#enable-binlog-retention-rds}

二进制日志是一组日志文件，包含对 MySQL 服务器实例进行的数据修改信息，二进制日志文件是进行复制所必需的。要在 RDS MySQL 中配置二进制日志保留，您必须 [启用二进制日志](#enable-binlog-logging) 并 [增加 binlog 保留时间间隔](#binlog-retention-interval)。

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging}

自动备份功能决定了 MySQL 是否启用二进制日志。可以通过 RDS 控制台为您的实例配置自动备份，步骤是导航到 **修改** > **附加配置** > **备份**，然后选中 **启用自动备份** 复选框（如果尚未选中）。

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

我们建议将 **备份保留期** 设置为一个相对较长的值，具体取决于复制的使用场景。

### 2. 增加 binlog 保留时间间隔 {#binlog-retention-interval}

:::warning
如果 ClickPipes 尝试恢复复制，而由于配置的 binlog 保留值导致所需的 binlog 文件被清除，ClickPipe 将进入错误状态，需进行重新同步。
:::

默认情况下，Amazon RDS 尽快清除二进制日志（即 _延迟清除_）。我们建议将 binlog 保留时间间隔增加到至少 **72 小时**，以确保在故障场景下二进制日志文件的可用性。要设置二进制日志保留时间间隔 ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours))，请使用 [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) 存储过程：

[//]: # "注意：大多数 CDC 提供商建议 RDS 的最大保留期为 7 天/168 小时。由于这会影响磁盘使用情况，我们保守建议设置最低 3 天/72 小时。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

如果未设置此配置或设置为较低的时间间隔，可能会导致二进制日志中出现空白，从而影响 ClickPipes 恢复复制的能力。 

## 配置 binlog 设置 {#binlog-settings}

可以通过在 RDS 控制台中单击您的 MySQL 实例，然后导航到 **配置** 选项卡找到参数组。

:::tip
如果您有 MySQL 集群，以下参数可以在 [DB 集群](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到，而不是在 DB 实例组中。
:::

<Image img={rds_config} alt="在 RDS 中找到参数组的位置" size="lg" border/>

<br/>
单击参数组链接，您将被带到该页面的专用部分。您应该在右上角看到一个 **编辑** 按钮。

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

以下参数需要设置如下：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将 Binlog 格式设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image img={binlog_row_metadata} alt="将 Binlog 行元数据设置为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt="将 Binlog 行图像设置为 FULL" size="lg" border/>

<br/>
然后，单击右上角的 **保存更改**。您可能需要重启实例以使更改生效 —— 确认的方法是查看 RDS 实例的 **配置** 选项卡中参数组链接旁是否显示 `待重启`。

## 启用 GTID 模式 {#gtid-mode}

:::tip
MySQL ClickPipe 也支持在没有 GTID 模式的情况下进行复制。然而，建议启用 GTID 模式以获得更好的性能和更简单的故障排除。
:::

[全局事务标识符 (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) 是分配给 MySQL 中每个已提交事务的唯一 ID。它们简化了 binlog 复制并使故障排除更加直接。我们 **建议** 启用 GTID 模式，以便 MySQL ClickPipe 可以使用基于 GTID 的复制。

GTID 基于的复制支持 Amazon RDS 的 MySQL 版本 5.7、8.0 和 8.4。要为您的 Aurora MySQL 实例启用 GTID 模式，请按照以下步骤操作：

1. 在 RDS 控制台中单击您的 MySQL 实例。
2. 点击 **配置** 选项卡。
3. 单击参数组链接。
4. 单击右上角的 **编辑** 按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 单击右上角的 **保存更改**。
8. 重启您的实例以使更改生效。

<Image img={enable_gtid} alt="GTID 启用" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe 也支持在没有 GTID 模式的情况下进行复制。然而，建议启用 GTID 模式以获得更好的性能和更简单的故障排除。
:::

## 配置数据库用户 {#configure-database-user}

作为管理员用户连接到 RDS MySQL 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例显示了对 `mysql` 数据库的权限。对每个您要复制的数据库和主机重复这些命令：

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

要限制流量到您的 Aurora MySQL 实例，请将 [文档中的静态 NAT IP](../../index.md#list-of-static-ips) 添加到 RDS 安全组的 **入站规则** 中。

<Image img={security_group_in_rds_mysql} alt="在 RDS MySQL 中找到安全组的位置？" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 进行私有访问 {#private-access-via-aws-privatelink}

要通过专用网络连接到您的 RDS 实例，可以使用 AWS PrivateLink。请按照 [ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 设置连接。

## 下一步骤 {#next-steps}

现在您的 Amazon RDS MySQL 实例已配置为 binlog 复制并安全连接到 ClickHouse Cloud，您可以 [创建您的第一个 MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe)。有关 MySQL CDC 的常见问题，请参阅 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。
