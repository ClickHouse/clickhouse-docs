---
'sidebar_label': 'Amazon RDS MySQL'
'description': '逐步指南，教你如何将Amazon RDS MySQL设置为ClickPipes的数据源'
'slug': '/integrations/clickpipes/mysql/source/rds'
'title': 'RDS MySQL源设置指南'
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

这是一个逐步的指南，介绍如何配置您的 RDS MySQL 实例以通过 MySQL ClickPipe 复制其数据。
<br/>
:::info
我们还建议查看 MySQL 常见问题解答 [这里](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题解答页面正在积极更新中。
:::

## 启用二进制日志保留 {#enable-binlog-retention-rds}
二进制日志是一组日志文件，包含了对 MySQL 服务器实例所做数据修改的信息，并且复制需要二进制日志文件。必须按照以下两个步骤进行操作：

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging-rds}
自动备份功能决定了 MySQL 的二进制日志是开启还是关闭。它可以在 AWS 控制台中设置：

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

建议根据复制用例将备份保留时间设置为合理的较长值。

### 2. Binlog 保留时间 (小时) {#binlog-retention-hours-rds}
Amazon RDS for MySQL 有一种不同的设置 binlog 保留时长的方法，即保存包含更改的 binlog 文件的时间。如果在 binlog 文件被删除之前没有读取某些更改，复制将无法继续。binlog 保留时间的默认值为 NULL，这意味着不会保留二进制日志。

要指定在 DB 实例上保留二进制日志的小时数，请使用 mysql.rds_set_configuration 函数，并设置一个足够长的 binlog 保留期以进行复制。推荐的最小值为 `24 小时`。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## 在参数组中配置 binlog 设置 {#binlog-parameter-group-rds}

您可以在 RDS 控制台中点击您的 MySQL 实例，然后转到 `配置` 标签页找到参数组。

<Image img={rds_config} alt="在哪里找到 RDS 中的参数组" size="lg" border/>

点击参数组链接后，您将进入该页面。右上角将会看到一个编辑按钮。

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

以下设置需要设为：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="Binlog 格式为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image img={binlog_row_metadata} alt="Binlog 行元数据为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt="Binlog 行图像为 FULL" size="lg" border/>

然后点击右上角的 `保存更改`。您可能需要重启实例以使更改生效 - 如果您在 RDS 实例的配置标签页中看到参数组链接旁的 `待重启`，这表明您需要重启实例。

<br/>
:::tip
如果您有 MySQL 集群，上述参数应在 [DB 集群](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到，而不是 DB 实例组。
:::

## 启用 GTID 模式 {#gtid-mode-rds}
全局事务标识符 (GTIDs) 是分配给 MySQL 中每个已提交事务的唯一 ID。它们简化了 binlog 复制，并使故障排除更为简单。

如果您的 MySQL 实例是 MySQL 5.7、8.0 或 8.4，我们建议启用 GTID 模式以便 MySQL ClickPipe 可以使用 GTID 复制。

要为您的 MySQL 实例启用 GTID 模式，请按照以下步骤操作：
1. 在 RDS 控制台中，点击您的 MySQL 实例。
2. 点击 `配置` 标签。
3. 点击参数组链接。
4. 点击右上角的 `编辑` 按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 点击右上角的 `保存更改`。
8. 重启您的实例以使更改生效。

<Image img={enable_gtid} alt="GTID 已启用" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe 还支持没有 GTID 模式的复制。然而，建议启用 GTID 模式，以获得更好的性能和更简单的故障排除。
:::


## 配置数据库用户 {#configure-database-user-rds}

以管理员用户身份连接到您的 RDS MySQL 实例，并执行以下命令：

1. 创建一个专门用于 ClickPipes 的用户：

```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例显示了 `mysql` 数据库的权限。对于您想要复制的每个数据库和主机，重复这些命令：

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

如果您想限制对 RDS 实例的流量，请将 [文档中的静态 NAT IPs](../../index.md#list-of-static-ips) 添加到 RDS 安全组的 `入站规则`。

<Image img={security_group_in_rds_mysql} alt="在哪里找到 RDS MySQL 的安全组？" size="lg" border/>

<Image img={edit_inbound_rules} alt="为上述安全组编辑入站规则" size="lg" border/>

### 通过 AWS PrivateLink 的私有访问 {#private-access-via-aws-privatelink}

要通过私有网络连接到您的 RDS 实例，可以使用 AWS PrivateLink。请遵循我们的 [AWS PrivateLink 对 ClickPipes 的设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 来设置连接。
