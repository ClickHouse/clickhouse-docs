---
sidebar_label: 'Amazon RDS MySQL'
description: '将 Amazon RDS MySQL 设置为 ClickPipes 源的分步指南'
slug: /integrations/clickpipes/mysql/source/rds
title: 'RDS MySQL 源设置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
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


# RDS MySQL 源端设置指南 \{#rds-mysql-source-setup-guide\}

本分步指南介绍如何配置 Amazon RDS MySQL，使用 [MySQL ClickPipe](../index.md) 将数据复制到 ClickHouse Cloud。关于 MySQL CDC 的常见问题，请参阅 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。

## 启用二进制日志保留 \{#enable-binlog-retention-rds\}

二进制日志是一组日志文件，其中包含对 MySQL 服务器实例所做数据修改的信息，而二进制日志文件是实现复制所必需的。要在 RDS MySQL 中配置二进制日志保留，必须先[启用二进制日志记录](#enable-binlog-logging)，然后[增加 binlog 保留时间间隔](#binlog-retention-interval)。

### 1. 通过自动备份启用二进制日志记录 \{#enable-binlog-logging\}

自动备份功能决定是否为 MySQL 启用或关闭二进制日志记录。您可以在 RDS 控制台中为实例配置自动备份，路径为 **Modify** > **Additional configuration** > **Backup**，并勾选 **Enable automated backups** 复选框（如果尚未勾选）。

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

我们建议根据您的复制场景，将 **Backup retention period** 设置为一个相对较长的保留期。

### 2. 增加 binlog 保留时间间隔 \{#binlog-retention-interval\}

:::warning
如果 ClickPipes 尝试恢复复制时，所需的 binlog 文件已经因为配置的 binlog 保留时间被清理，ClickPipe 将进入错误状态，并且需要重新同步。
:::

默认情况下，Amazon RDS 会尽快清理二进制日志（即 *lazy purging*）。我们建议将 binlog 保留时间间隔增加到至少 **72 小时**，以确保在故障场景下复制所需的二进制日志文件可用。要为二进制日志保留设置时间间隔（[`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)），请使用 [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) 存储过程：

[//]: # "注意：大多数 CDC 提供商建议将 RDS 的保留期设置为最大值（7 天 / 168 小时）。由于这会影响磁盘使用量，我们保守地建议至少 3 天 / 72 小时。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

如果未设置此配置或将其设置为过短的间隔，可能会导致二进制日志中出现间隙，从而影响 ClickPipes 恢复复制的能力。


## 配置 binlog 设置 \{#binlog-settings\}

在 RDS 控制台中点击 MySQL 实例，然后进入 **Configuration** 选项卡，可以找到对应的 parameter group（参数组）。

:::tip
如果使用的是 MySQL 集群，下面这些参数位于 [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) parameter group 中，而不是 DB instance parameter group 中。
:::

<Image img={rds_config} alt="在 RDS 中查找 parameter group 的位置" size="lg" border/>

<br/>

点击 parameter group 链接，会跳转到该 parameter group 的专用页面。你应该能在右上角看到一个 **Edit** 按钮。

<Image img={edit_button} alt="编辑 parameter group" size="lg" border/>

需要按如下方式设置以下参数：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将 binlog format 设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image img={binlog_row_metadata} alt="将 binlog row metadata 设置为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt="将 binlog row image 设置为 FULL" size="lg" border/>

<br/>

然后点击右上角的 **Save Changes**。可能需要重启实例变更才会生效——判断是否需要重启的一种方式是查看 RDS 实例 **Configuration** 选项卡中 parameter group 链接旁边是否显示 `Pending reboot`。

## 启用 GTID 模式 \{#gtid-mode\}

:::tip
MySQL ClickPipe 也支持在未启用 GTID 模式的情况下进行复制。但是，仍然推荐启用 GTID 模式，以获得更好的性能并简化故障排查。
:::

[Global Transaction Identifiers (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) 是分配给 MySQL 中每个已提交事务的唯一 ID。它们可以简化 binlog 复制，并让故障排查更加简单明了。我们**推荐**启用 GTID 模式，以便 MySQL ClickPipe 可以使用基于 GTID 的复制。

Amazon RDS for MySQL 版本 5.7、8.0 和 8.4 支持基于 GTID 的复制。要为 Aurora MySQL 实例启用 GTID 模式，请按以下步骤操作：

1. 在 RDS Console 中，单击 MySQL 实例。
2. 单击 **Configuration** 选项卡。
3. 单击参数组链接。
4. 单击右上角的 **Edit** 按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 在右上角单击 **Save Changes**。
8. 重启实例以使更改生效。

<Image img={enable_gtid} alt="GTID enabled" size="lg" border/>

<br/>

:::tip
MySQL ClickPipe 也支持在未启用 GTID 模式的情况下进行复制。但是，仍然推荐启用 GTID 模式，以获得更好的性能并简化故障排查。
:::

## 配置数据库用户 \{#configure-database-user\}

以管理员用户身份连接到 RDS MySQL 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. 授予 schema 权限。以下示例展示了对 `mysql` 数据库的权限。对每个你希望进行复制的数据库和主机重复执行这些命令：

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## 配置网络访问 \{#configure-network-access\}

### 基于 IP 的访问控制 \{#ip-based-access-control\}

要限制对 Aurora MySQL 实例的访问流量，请将[文档中列出的静态 NAT IP 地址](../../index.md#list-of-static-ips)添加到 RDS 安全组的 **Inbound rules** 中。

<Image img={security_group_in_rds_mysql} alt="在 RDS MySQL 中到哪里可以找到安全组？" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 实现私有访问 \{#private-access-via-aws-privatelink\}

要通过私有网络连接到您的 RDS 实例，可以使用 AWS PrivateLink。请按照 [适用于 ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 完成连接配置。

## 后续步骤 \{#next-steps\}

现在，您的 Amazon RDS MySQL 实例已经配置为 binlog 复制并安全连接到 ClickHouse Cloud，您可以[创建您的第一个 MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe)。有关 MySQL CDC 的常见问题，请参阅 [MySQL 常见问题解答页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。