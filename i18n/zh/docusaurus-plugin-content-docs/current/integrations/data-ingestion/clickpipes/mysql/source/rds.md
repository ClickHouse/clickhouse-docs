---
'sidebar_label': 'Amazon RDS MySQL'
'description': '逐步指南，介绍如何将 Amazon RDS MySQL 设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mysql/source/rds'
'title': 'RDS MySQL 源设置指南'
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


# RDS MySQL 数据源设置指南

这是一个逐步指南，介绍如何配置您的 RDS MySQL 实例，以通过 MySQL ClickPipe 复制其数据。
<br/>
:::info
我们还建议您查看 MySQL 常见问题解答 [这里](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题解答页面正在积极更新中。
:::

## 启用二进制日志保留 {#enable-binlog-retention-rds}
二进制日志是一组日志文件，包含对 MySQL 服务器实例进行的数据修改信息，二进制日志文件是复制所必需的。必须遵循以下两个步骤：

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging-rds}
自动备份功能决定是否为 MySQL 开启二进制日志。可以在 AWS 控制台中设置：

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

根据复制使用案例，建议将备份保留期限设置为合理的长时间值。

### 2. 二进制日志保留小时数 {#binlog-retention-hours-rds}
Amazon RDS for MySQL 使用不同的方法来设置 binlog 保留时间，即包含更改的 binlog 文件被保留的时间。如果某些更改在 binlog 文件被删除之前未被读取，则复制将无法继续。binlog 保留小时数的默认值为 NULL，这意味着不保留二进制日志。

要指定在 DB 实例上保留二进制日志的小时数，请使用 mysql.rds_set_configuration 函数，设置一个足够长的 binlog 保留期限以进行复制。推荐的最小值为 `24 小时`。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## 在参数组中配置 binlog 设置 {#binlog-parameter-group-rds}

参数组可以在 RDS 控制台中单击您的 MySQL 实例，然后转到 `Configurations` 标签找到。

<Image img={rds_config} alt="在 RDS 中找到参数组的位置" size="lg" border/>

单击参数组链接后，您将进入该参数组的页面。您会在右上方看到一个编辑按钮。

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

需要按如下设置以下参数：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将二进制日志格式设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image img={binlog_row_metadata} alt="将二进制日志行元数据设置为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt="将二进制日志行图像设置为 FULL" size="lg" border/>

然后单击右上方的 `Save Changes`。您可能需要重启实例以使更改生效 - 判断这一点的方法是，如果您在 RDS 实例的配置选项卡中看到参数组链接旁边有 `Pending reboot`。

<br/>
:::tip
如果您有 MySQL 集群，上述参数将位于 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中，而不是 DB 实例组中。
:::

## 启用 GTID 模式 {#gtid-mode-rds}
全球事务标识符 (GTID) 是分配给 MySQL 中每个已提交事务的唯一 ID。它们简化了 binlog 复制，并使故障排除更加简单。

如果您的 MySQL 实例是 MySQL 5.7、8.0 或 8.4，我们建议启用 GTID 模式，以便 MySQL ClickPipe 可以使用 GTID 复制。

要为您的 MySQL 实例启用 GTID 模式，请按照以下步骤操作：
1. 在 RDS 控制台中，单击您的 MySQL 实例。
2. 单击 `Configurations` 标签。
3. 单击参数组链接。
4. 单击右上角的 `Edit` 按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 单击右上角的 `Save Changes`。
8. 重启您的实例以使更改生效。

<Image img={enable_gtid} alt="启用了 GTID" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe 也支持在不启用 GTID 模式的情况下进行复制。然而，建议启用 GTID 模式以获得更好的性能和更简单的故障排除。
:::


## 配置数据库用户 {#configure-database-user-rds}

以管理员用户身份连接到您的 RDS MySQL 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例显示了 `mysql` 数据库的权限。对于每个您想要复制的数据库和主机，重复这些命令：

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

如果您想要限制对您的 RDS 实例的流量，请将 [记录的静态 NAT IPs](../../index.md#list-of-static-ips) 添加到您 RDS 安全组的 `Inbound rules`。

<Image img={security_group_in_rds_mysql} alt="在 RDS MySQL 中找到安全组的位置？" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 的私有访问 {#private-access-via-aws-privatelink}

要通过私有网络连接到 RDS 实例，您可以使用 AWS PrivateLink。请遵循我们的 [AWS PrivateLink ClickPipes 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 来设置连接。
