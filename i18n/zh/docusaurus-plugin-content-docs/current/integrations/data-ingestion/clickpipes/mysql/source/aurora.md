---
sidebar_label: 'Amazon Aurora MySQL'
description: '将 Amazon Aurora MySQL 配置为 ClickPipes 数据源的分步指南'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Aurora MySQL 数据源配置指南'
doc_type: 'guide'
keywords: ['aurora mysql', 'clickpipes', 'binlog retention', 'gtid mode', 'aws']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
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

# Aurora MySQL 源端设置指南 \{#aurora-mysql-source-setup-guide\}

本分步指南演示如何配置 Amazon Aurora MySQL，通过 [MySQL ClickPipe](../index.md) 将数据复制到 ClickHouse Cloud。有关 MySQL CDC 的常见问题，请参阅 [MySQL 常见问题页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。

## 启用二进制日志保留 \{#enable-binlog-retention-aurora\}

二进制日志是一组日志文件，其中包含对 MySQL 服务器实例所做数据修改的信息，复制功能依赖这些二进制日志文件。要在 Aurora MySQL 中配置二进制日志保留，必须先[启用二进制日志记录](#enable-binlog-logging)，并[延长 binlog 保留时间间隔](#binlog-retention-interval)。

### 1. 通过自动备份启用二进制日志记录 \{#enable-binlog-logging\}

自动备份功能决定是否为 MySQL 启用二进制日志记录。可以在 RDS 控制台中，通过依次进入 **Modify** &gt; **Additional configuration** &gt; **Backup**，并勾选 **Enable automated backups** 复选框（如果尚未勾选），来为实例配置自动备份。

<Image img={rds_backups} alt="在 Aurora 中启用自动备份" size="lg" border />

我们建议根据复制场景，将 **Backup retention period** 设置为一个相对较长的值。

### 2. 延长 binlog 保留时间间隔 \{#binlog-retention-interval\}

:::warning
如果 ClickPipes 尝试恢复复制时，所需的 binlog 文件已因配置的 binlog 保留时间被清除，则对应的 ClickPipe 将进入错误状态，并且需要重新进行全量同步。
:::

默认情况下，Aurora MySQL 会尽快清除二进制日志（即 *lazy purging*）。我们建议将 binlog 保留时间间隔增加到至少 **72 小时**，以便在故障场景下确保用于复制的二进制日志文件仍然可用。要为二进制日志保留设置时间间隔（[`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)），请使用 [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) 存储过程：

[//]: # "注意 大多数 CDC 提供方建议为 Aurora RDS 配置最大保留期（7 天/168 小时）。由于这会影响磁盘使用量，我们保守地建议至少保留 3 天/72 小时。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

如果未设置该配置，或将其设置为过短的间隔，可能会导致二进制日志中出现间隙，从而影响 ClickPipes 恢复复制的能力。


## 配置 binlog 设置 \{#binlog-settings\}

在 RDS 控制台中单击 MySQL 实例，然后转到 **Configuration** 选项卡，即可找到参数组（parameter group）。

:::tip
如果您使用的是 MySQL 集群，下面这些参数会在 [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中，而不是 DB instance 参数组中。
:::

<Image img={aurora_config} alt="在 Aurora 中查找参数组的位置" size="lg" border/>

<br/>
单击参数组链接，会跳转到该参数组的详情页面。您应该能在右上角看到一个 **Edit** 按钮。

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

<br/>
需要按如下方式设置以下参数：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将 binlog_format 设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`。

<Image img={binlog_row_metadata} alt="binlog 行元数据" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`。

<Image img={binlog_row_image} alt="binlog 行镜像" size="lg" border/>

<br/>
然后，单击右上角的 **Save Changes**。您可能需要重启实例以使更改生效——判断是否需要重启的一种方法，是查看 Aurora 实例的 **Configuration** 选项卡中，参数组链接旁是否显示 `Pending reboot`。

## 启用 GTID 模式（推荐） \{#gtid-mode\}

:::tip
MySQL ClickPipe 也支持在未启用 GTID 模式的情况下进行复制。但为了获得更好的性能并简化故障排查，推荐启用 GTID 模式。
:::

[全局事务标识符（GTID，Global Transaction Identifiers）](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) 是分配给 MySQL 中每个已提交事务的唯一 ID。它们可以简化 binlog 复制，并使故障排查更加简单直观。我们**推荐**启用 GTID 模式，以便 MySQL ClickPipe 可以使用基于 GTID 的复制。

基于 GTID 的复制适用于 Amazon Aurora MySQL v2（MySQL 5.7）和 v3（MySQL 8.0），以及 Aurora Serverless v2。要为 Aurora MySQL 实例启用 GTID 模式，请执行以下步骤：

1. 在 RDS 控制台中，点击您的 MySQL 实例。
2. 点击 **Configuration** 选项卡。
3. 点击参数组链接。
4. 点击右上角的 **Edit** 按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 点击右上角的 **Save Changes**。
8. 重启实例以使更改生效。

<Image img={enable_gtid} alt="已启用 GTID" size="lg" border/>

## 配置数据库用户 \{#configure-database-user\}

以管理员身份连接到 Aurora MySQL 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. 授予 schema 权限。以下示例展示了为 `mysql` 数据库授予权限。对于每个你希望复制的数据库和主机，重复执行这些命令：

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

要限制发往 Aurora MySQL 实例的流量，请将[文档中列出的静态 NAT IP](../../index.md#list-of-static-ips) 添加到 Aurora 安全组的 **Inbound rules**（入站规则）中。

<Image img={security_group_in_rds_mysql} alt="在 Aurora MySQL 中哪里可以找到安全组？" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 的私有访问 \{#private-access-via-aws-privatelink\}

要通过私有网络连接到 Aurora MySQL 实例，可以使用 AWS PrivateLink。请按照 [ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 来完成连接配置。

## 下一步 \{#whats-next\}

现在你的 Amazon Aurora MySQL 实例已经配置为使用 binlog 进行复制，并已安全连接到 ClickHouse Cloud，即可[创建第一个 MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe)。关于 MySQL CDC 的常见问题，请参阅 [MySQL 常见问题解答页面](/integrations/data-ingestion/clickpipes/mysql/faq.md)。