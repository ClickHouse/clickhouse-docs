---
sidebar_label: 'Amazon RDS MariaDB'
description: '关于如何将 Amazon RDS MariaDB 设置为 ClickPipes 源的分步指南'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'RDS MariaDB 源设置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
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


# RDS MariaDB 源端设置指南

本文是关于如何配置 RDS MariaDB 实例，以通过 MySQL ClickPipe 进行数据复制的分步指南。
<br/>
:::info
我们也推荐你查看 [MySQL 常见问题解答](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题页面正在持续更新。
:::



## 启用二进制日志保留 {#enable-binlog-retention-rds}

二进制日志是一组日志文件,包含对 MySQL 服务器实例所做的数据修改信息。复制功能需要二进制日志文件。必须完成以下两个步骤:

### 1. 通过自动备份启用二进制日志记录{#enable-binlog-logging-rds}

自动备份功能决定 MySQL 的二进制日志记录是启用还是禁用。可以在 AWS 控制台中进行设置:

<Image
  img={rds_backups}
  alt='在 RDS 中启用自动备份'
  size='lg'
  border
/>

建议根据复制使用场景将备份保留期设置为合理的较长时间。

### 2. 二进制日志保留小时数{#binlog-retention-hours-rds}

Amazon RDS for MariaDB 采用不同的方法来设置二进制日志保留时长,即包含变更的二进制日志文件的保留时间。如果在二进制日志文件被删除之前某些变更未被读取,复制将无法继续。二进制日志保留小时数的默认值为 NULL,这意味着不保留二进制日志。

要指定在数据库实例上保留二进制日志的小时数,请使用 mysql.rds_set_configuration 函数,并设置足够长的二进制日志保留期以确保复制正常进行。建议最小值为 `24 小时`。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```


## 在参数组中配置 binlog 设置 {#binlog-parameter-group-rds}

在 RDS 控制台中点击您的 MariaDB 实例,然后导航到 `Configurations` 选项卡,即可找到参数组。

<Image
  img={rds_config}
  alt='在 RDS 中查找参数组的位置'
  size='lg'
  border
/>

点击参数组链接后,您将进入参数组页面。您会在右上角看到编辑按钮:

<Image img={edit_button} alt='编辑参数组' size='lg' border />

需要按如下方式设置 `binlog_format`、`binlog_row_metadata` 和 `binlog_row_image`:

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt='将 Binlog 格式设置为 ROW' size='lg' border />

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image
  img={binlog_row_metadata}
  alt='将 Binlog 行元数据设置为 FULL'
  size='lg'
  border
/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt='将 Binlog 行镜像设置为 FULL' size='lg' border />

接下来,点击右上角的 `Save Changes`。您可能需要重启实例才能使更改生效。如果在 RDS 实例的 Configurations 选项卡中参数组链接旁边看到 `Pending reboot`,则表明需要重启您的实例。

<br />
:::tip 如果您使用的是 MariaDB 集群,上述参数应在 [DB
Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)
参数组中查找,而不是在数据库实例组中。 :::


## 启用 GTID 模式 {#gtid-mode-rds}

全局事务标识符(GTID)是分配给 MySQL/MariaDB 中每个已提交事务的唯一 ID。它们简化了 binlog 复制,并使故障排查更加简便。MariaDB 默认启用 GTID 模式,因此无需用户操作即可使用。


## 配置数据库用户 {#configure-database-user-rds}

以管理员用户身份连接到您的 RDS MariaDB 实例并执行以下命令:

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

如果您想限制对 RDS 实例的流量,请将[文档中记录的静态 NAT IP 地址](../../index.md#list-of-static-ips)添加到 RDS 安全组的`入站规则`中。

<Image
  img={security_group_in_rds_mysql}
  alt='在 RDS 中哪里可以找到安全组?'
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

要通过私有网络连接到您的 RDS 实例,可以使用 AWS PrivateLink。请参阅我们的 [ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes)来建立连接。
