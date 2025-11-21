---
sidebar_label: 'Amazon RDS MySQL'
description: '将 Amazon RDS MySQL 配置为 ClickPipes 数据源的分步指南'
slug: /integrations/clickpipes/mysql/source/rds
title: 'RDS MySQL 源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
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


# RDS MySQL 源端配置指南

本指南将逐步演示如何配置 Amazon RDS MySQL，通过 [MySQL ClickPipe](../index.md) 将数据复制到 ClickHouse Cloud。关于 MySQL CDC 的常见问题，请参阅 [MySQL 常见问题解答页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。



## 启用二进制日志保留 {#enable-binlog-retention-rds}

二进制日志是一组日志文件,包含对 MySQL 服务器实例所做数据修改的信息,复制功能需要使用二进制日志文件。要在 RDS MySQL 中配置二进制日志保留,您必须[启用二进制日志记录](#enable-binlog-logging)并[增加二进制日志保留时间](#binlog-retention-interval)。

### 1. 通过自动备份启用二进制日志记录 {#enable-binlog-logging}

自动备份功能决定 MySQL 的二进制日志记录是开启还是关闭。可以在 RDS 控制台中为您的实例配置自动备份,方法是导航到 **Modify** > **Additional configuration** > **Backup** 并选中 **Enable automated backups** 复选框(如果尚未选中)。

<Image
  img={rds_backups}
  alt='在 RDS 中启用自动备份'
  size='lg'
  border
/>

我们建议根据复制使用场景,将 **Backup retention period** 设置为合理的较长时间。

### 2. 增加二进制日志保留时间 {#binlog-retention-interval}

:::warning
如果 ClickPipes 尝试恢复复制时,所需的二进制日志文件由于配置的保留时间已被清除,则 ClickPipe 将进入错误状态,需要重新同步。
:::

默认情况下,Amazon RDS 会尽快清除二进制日志(即_延迟清除_)。我们建议将二进制日志保留时间增加到至少 **72 小时**,以确保在故障场景下二进制日志文件可用于复制。要设置二进制日志保留时间([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)),请使用 [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) 存储过程:

[//]: # "NOTE Most CDC providers recommend the maximum retention period for RDS (7 days/168 hours). Since this has an impact on disk usage, we conservatively recommend a minimum of 3 days/72 hours."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

如果未设置此配置或设置的时间过短,可能会导致二进制日志出现缺失,从而影响 ClickPipes 恢复复制的能力。


## 配置 binlog 设置 {#binlog-settings}

在 RDS 控制台中点击您的 MySQL 实例,然后进入 **Configuration** 选项卡,即可找到参数组。

:::tip
如果您使用的是 MySQL 集群,以下参数可以在 [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到,而不是在数据库实例组中。
:::

<Image
  img={rds_config}
  alt='在 RDS 中查找参数组的位置'
  size='lg'
  border
/>

<br />
点击参数组链接,将跳转到其专用页面。您应该会在右上角看到一个 **Edit** 按钮。

<Image img={edit_button} alt='编辑参数组' size='lg' border />

需要按以下方式设置这些参数:

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt='将 Binlog format 设置为 ROW' size='lg' border />

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image
  img={binlog_row_metadata}
  alt='将 Binlog row metadata 设置为 FULL'
  size='lg'
  border
/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt='将 Binlog row image 设置为 FULL' size='lg' border />

<br />
然后,点击右上角的 **Save Changes** 按钮。您可能需要重启实例才能使更改生效——如果在 RDS 实例的 **Configuration** 选项卡中,参数组链接旁边显示 `Pending reboot`,则说明需要重启。


## 启用 GTID 模式 {#gtid-mode}

:::tip
MySQL ClickPipe 也支持在不启用 GTID 模式的情况下进行复制。但是,为了获得更好的性能和更便捷的故障排查,建议启用 GTID 模式。
:::

[全局事务标识符 (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) 是为 MySQL 中每个已提交事务分配的唯一 ID。它们简化了 binlog 复制,使故障排查更加简便。我们**建议**启用 GTID 模式,以便 MySQL ClickPipe 可以使用基于 GTID 的复制。

Amazon RDS for MySQL 版本 5.7、8.0 和 8.4 支持基于 GTID 的复制。要为您的 Aurora MySQL 实例启用 GTID 模式,请按照以下步骤操作:

1. 在 RDS 控制台中,单击您的 MySQL 实例。
2. 单击 **Configuration** 选项卡。
3. 单击参数组链接。
4. 单击右上角的 **Edit** 按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 单击右上角的 **Save Changes**。
8. 重启您的实例以使更改生效。

<Image img={enable_gtid} alt='已启用 GTID' size='lg' border />

<br />
:::tip MySQL ClickPipe 也支持在不启用 GTID 模式的情况下进行复制。但是,为了获得更好的性能和更便捷的故障排查,建议启用 GTID 模式。 :::


## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到您的 RDS MySQL 实例并执行以下命令:

1. 为 ClickPipes 创建专用用户:

   ```sql
   CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
   ```

2. 授予模式权限。以下示例显示了 `mysql` 数据库的权限。对要复制的每个数据库和主机重复执行这些命令:

   ```sql
   GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
   ```

3. 向用户授予复制权限:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```


## 配置网络访问 {#configure-network-access}

### 基于 IP 的访问控制 {#ip-based-access-control}

要限制对 Aurora MySQL 实例的流量访问,请将[文档中记录的静态 NAT IP 地址](../../index.md#list-of-static-ips)添加到 RDS 安全组的**入站规则**中。

<Image
  img={security_group_in_rds_mysql}
  alt='在 RDS MySQL 中哪里可以找到安全组?'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='编辑上述安全组的入站规则'
  size='lg'
  border
/>

### 通过 AWS PrivateLink 进行私有访问 {#private-access-via-aws-privatelink}

要通过私有网络连接到 RDS 实例,可以使用 AWS PrivateLink。请按照 [ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes)来建立连接。


## 后续步骤 {#next-steps}

现在您的 Amazon RDS MySQL 实例已配置 binlog 复制并安全连接到 ClickHouse Cloud,您可以[创建第一个 MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe)。关于 MySQL CDC 的常见问题,请参阅 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。
