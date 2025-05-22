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

这是一个关于如何配置你的 RDS MySQL 实例以通过 MySQL ClickPipe 复制其数据的逐步指南。
<br/>
:::info
我们还建议查看 MySQL 常见问题解答 [这里](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题解答页面正在持续更新中。
:::

## 启用二进制日志保留 {#enable-binlog-retention-rds}
二进制日志是一组日志文件，包含对 MySQL 服务器实例所做的数据修改信息，并且二进制日志文件是复制所必需的。必须遵循以下两个步骤：

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging-rds}
自动备份功能决定了 MySQL 的二进制日志是否打开。在 AWS 控制台中可以进行设置：

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

建议根据复制用例将备份保留设置为合理的长时间值。

### 2. 二进制日志保留小时数 {#binlog-retention-hours-rds}
Amazon RDS for MySQL 有不同的设置二进制日志保留时长的方法，即包含更改的二进制日志文件保留的时间。如果在二进制日志文件删除之前没有读取到某些更改，则复制将无法继续。二进制日志保留小时的默认值为 NULL，这意味着不保留二进制日志。

要指定在 DB 实例上保留二进制日志的小时数，可以使用 mysql.rds_set_configuration 函数，设置一个足够长的二进制日志保留期限，以便进行复制。推荐的最小值为 `24 hours`。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## 在参数组中配置二进制日志设置 {#binlog-parameter-group-rds}

可以在 RDS 控制台中点击你的 MySQL 实例时找到参数组，然后转到 `Configurations`（配置）标签。

<Image img={rds_config} alt="在 RDS 中查找参数组" size="lg" border/>

点击参数组链接后，会进入该页面。你会看到右上角的 "Edit"（编辑）按钮。

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

以下设置需要配置如下：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将 Binlog 格式设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`。

<Image img={binlog_row_metadata} alt="将 Binlog 行元数据设置为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`。

<Image img={binlog_row_image} alt="将 Binlog 行图像设置为 FULL" size="lg" border/>

然后点击右上角的 `Save Changes`（保存更改）。你可能需要重启实例以使更改生效 - 了解这一点的方法是在 RDS 实例的配置标签中看到参数组链接旁边写着 `Pending reboot`（待重启）。

<br/>
:::tip
如果你有一个 MySQL 集群，以上参数应该在 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到，而不是在 DB 实例组中。
:::

## 启用 GTID 模式 {#gtid-mode-rds}
全局事务标识符（GTID）是分配给每个已提交事务的唯一 ID。它们简化了二进制日志复制，并使故障排除更加简单。

如果你的 MySQL 实例是 MySQL 5.7、8.0 或 8.4，我们建议启用 GTID 模式，以便 MySQL ClickPipe 可以使用 GTID 复制。

要为你的 MySQL 实例启用 GTID 模式，请按照以下步骤操作：
1. 在 RDS 控制台中，点击你的 MySQL 实例。
2. 点击 `Configurations`（配置）标签。
3. 点击参数组链接。
4. 点击右上角的 `Edit`（编辑）按钮。
5. 将 `enforce_gtid_consistency` 设置为 `ON`。
6. 将 `gtid-mode` 设置为 `ON`。
7. 点击右上角的 `Save Changes`（保存更改）。
8. 重启你的实例以使更改生效。

<Image img={enable_gtid} alt="GTID 已启用" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe 也支持在没有 GTID 模式的情况下进行复制。然而，建议启用 GTID 模式以获得更好的性能和更简单的故障排除。
:::


## 配置数据库用户 {#configure-database-user-rds}

以管理员用户身份连接到你的 RDS MySQL 实例，并执行以下命令：

1. 创建一个专用用户用于 ClickPipes：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例显示了 `mysql` 数据库的权限。对于想要复制的每个数据库和主机，重复这些命令：

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

如果你想限制流量到你的 RDS 实例，请将 [文档中列出的静态 NAT IP](../../index.md#list-of-static-ips) 添加到你的 RDS 安全组的 `Inbound rules`（入站规则）中。

<Image img={security_group_in_rds_mysql} alt="在 RDS MySQL 中查找安全组的地方" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 的私有访问 {#private-access-via-aws-privatelink}

要通过专用网络连接到你的 RDS 实例，你可以使用 AWS PrivateLink。请遵循我们的 [AWS PrivateLink 设置指南以进行 ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) 来设置连接。
