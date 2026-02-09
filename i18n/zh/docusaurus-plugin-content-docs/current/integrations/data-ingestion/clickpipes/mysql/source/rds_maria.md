---
sidebar_label: 'Amazon RDS MariaDB'
description: '关于如何将 Amazon RDS MariaDB 设置为 ClickPipes 数据源的分步指南'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'RDS MariaDB 数据源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '数据摄取', '实时同步']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS MariaDB 源端设置指南 \{#rds-mariadb-source-setup-guide\}

本指南将逐步介绍如何配置 RDS MariaDB 实例，使其能够通过 MySQL ClickPipe 进行数据复制。

<br/>

:::info
我们也建议你阅读 MySQL 常见问题解答文档，可在[这里](/integrations/data-ingestion/clickpipes/mysql/faq.md)查看。该常见问题页面会持续更新。
:::

## 启用二进制日志保留 \{#enable-binlog-retention-rds\}

二进制日志是一组日志文件，其中包含在 MySQL 服务器实例上进行的数据修改的信息。复制功能需要二进制日志文件。必须完成以下两个步骤：

### 1. 通过自动备份启用二进制日志记录 \{#enable-binlog-logging-rds\}

`automated backups` 功能决定是否为 MySQL 启用或禁用二进制日志记录。可以在 AWS 控制台中进行配置：

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

建议根据具体的复制场景，将备份保留期设置为相对较长的值。

### 2. Binlog 保留时间（小时） \{#binlog-retention-hours-rds\}

Amazon RDS for MariaDB 采用不同的方式来设置 binlog 的保留时长，即包含变更的 binlog 文件被保留的时间。如果在 binlog 文件被删除之前，某些变更尚未被读取，则复制将无法继续。binlog 保留时间的默认值为 NULL，这意味着不会保留任何二进制日志。

要指定在某个 DB 实例上保留二进制日志的小时数，请使用 `mysql.rds_set_configuration` 函数，并将 binlog 保留时间设置得足够长，以保证复制可以完成。推荐的最小值为 `24 hours`。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```


## 在参数组中配置 binlog 设置 \{#binlog-parameter-group-rds\}

在 RDS 控制台中点击您的 MariaDB 实例，然后导航到 `Configurations` 选项卡，可以找到参数组。

<Image img={rds_config} alt="Where to find parameter group in RDS" size="lg" border/>

点击参数组链接后，您会进入参数组详情页面。您会在右上角看到一个 Edit 按钮：

<Image img={edit_button} alt="Edit parameter group" size="lg" border/>

需要按如下方式设置 `binlog_format`、`binlog_row_metadata` 和 `binlog_row_image`：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="Binlog format to ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image img={binlog_row_metadata} alt="Binlog row metadata to FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt="Binlog row image to FULL" size="lg" border/>

接下来，点击右上角的 `Save Changes`。您可能需要重启实例以使更改生效。如果在 RDS 实例的 Configurations 选项卡中，您在参数组链接旁看到 `Pending reboot`，这通常表明需要重启实例。

<br/>

:::tip
如果您使用的是 MariaDB 集群，上述参数会在 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中，而不是在 DB 实例参数组中。
:::

## 启用 GTID 模式 \{#gtid-mode-rds\}

全局事务标识符（GTID）是在 MySQL/MariaDB 中分配给每个已提交事务的唯一 ID。它们简化了二进制日志（binlog）复制，并使故障排查更加简单。MariaDB 默认启用 GTID 模式，因此用户无需进行任何额外操作即可使用它。

## 配置数据库用户 \{#configure-database-user-rds\}

以管理员身份连接到你的 RDS MariaDB 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. 授予 schema 权限。下面的示例展示了为 `mysql` 数据库授予权限。对于你希望复制的每个数据库和主机，重复执行这些命令：

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';


## 配置网络访问 {#configure-network-access}

### 基于 IP 的访问控制 {#ip-based-access-control}

如果要限制访问 RDS 实例的流量，请将[文档中列出的静态 NAT IP](../../index.md#list-of-static-ips) 添加到 RDS 安全组的 `Inbound rules`（入站规则）中。

<Image img={security_group_in_rds_mysql} alt="在 RDS 中查看安全组的位置" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 进行私有访问 {#private-access-via-aws-privatelink}

要通过私有网络连接到 RDS 实例，可以使用 AWS PrivateLink。请按照我们的 [适用于 ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 完成连接配置。