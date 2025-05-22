import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import aurora_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';

# Aurora MySQL 源设置指南

这是一个关于如何配置您的 Aurora MySQL 实例以通过 MySQL ClickPipe 复制其数据的逐步指南。
<br/>
:::info
我们还建议您查看 MySQL 常见问题解答 [在这里](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题解答页面会不断更新。
:::

## 启用二进制日志保留 {#enable-binlog-retention-aurora}
二进制日志是一组日志文件，包含对 MySQL 服务器实例进行的数据修改信息，二进制日志文件是复制所必需的。必须遵循以下两个步骤：

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging-aurora}
自动备份功能决定了 MySQL 的二进制日志是开启还是关闭。可以在 AWS 控制台中设置：

<Image img={rds_backups} alt="在 Aurora 中启用自动备份" size="lg" border/>

建议根据复制用例将备份保留设置为一个合理较长的值。

### 2. 二进制日志保留小时数 {#binlog-retention-hours-aurora}
必须调用以下过程以确保二进制日志在复制中可用：

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```
如果未设置此配置，Amazon RDS 会尽快清除二进制日志，从而导致二进制日志中出现间隙。

## 在参数组中配置 binlog 设置 {#binlog-parameter-group-aurora}

可以在 RDS 控制台中单击您的 MySQL 实例，然后转到 `Configurations` 标签页找到参数组。

<Image img={aurora_config} alt="在 RDS 中找到参数组的位置" size="lg" border/>

单击参数组链接后，您将进入该组的页面。您会在右上角看到一个编辑按钮。

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

以下设置需要设置如下：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="Binlog 格式设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`。

<Image img={binlog_row_metadata} alt="Binlog 行元数据" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`。

<Image img={binlog_row_image} alt="Binlog 行图像" size="lg" border/>

然后点击右上角的 `Save Changes`。您可能需要重启实例以使更改生效 - 一个知道是否需要重启的方法是如果您在 RDS 实例的配置标签中看到参数组链接旁边的 `Pending reboot`。
<br/>
:::tip
如果您有一个 MySQL 集群，以上参数应在 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到，而不是在数据库实例组中。
:::

## 启用 GTID 模式 {#gtid-mode-aurora}
全局事务标识符（GTID）是分配给 MySQL 中每个已提交事务的唯一 ID。它们简化了 binlog 复制，并使故障排除变得更加简单。

如果您的 MySQL 实例是 MySQL 5.7、8.0 或 8.4，建议启用 GTID 模式，以便 MySQL ClickPipe 可以使用 GTID 复制。

要为 MySQL 实例启用 GTID 模式，请按照以下步骤操作：
1. 在 RDS 控制台中，单击您的 MySQL 实例。
2. 单击 `Configurations` 标签页。
3. 单击参数组链接。
4. 单击右上角的 `Edit` 按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 单击右上角的 `Save Changes`。
8. 重启您的实例以使更改生效。

<Image img={enable_gtid} alt="GTID 已启用" size="lg" border/>

<br/>
:::info
MySQL ClickPipe 也支持无 GTID 模式的复制。然而，建议启用 GTID 模式以获得更好的性能和更简单的故障排除。
:::

## 配置数据库用户 {#configure-database-user-aurora}

以管理员用户身份连接到您的 Aurora MySQL 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例显示了 `mysql` 数据库的权限。对每个要复制的数据库和主机重复这些命令：

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

如果您想限制对 Aurora 实例的流量，请将 [文档中列出的静态 NAT IPs](../../index.md#list-of-static-ips) 添加到 Aurora 安全组的 `Inbound rules` 中，如下所示：

<Image img={security_group_in_rds_mysql} alt="在哪里找到 Aurora MySQL 中的安全组？" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 的私有访问 {#private-access-via-aws-privatelink}

要通过专用网络连接到您的 Aurora 实例，您可以使用 AWS PrivateLink。请按照我们的 [ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 设置连接。
