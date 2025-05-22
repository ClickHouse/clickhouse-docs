import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# RDS MariaDB 源设置指南

这是一个关于如何配置 RDS MariaDB 实例以通过 MySQL ClickPipe 复制数据的分步指南。
<br/>
:::info
我们还建议您查看 MySQL 常见问题解答 [here](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题解答页面正在积极更新中。
:::

## 启用二进制日志保留 {#enable-binlog-retention-rds}
二进制日志是一组日志文件，其中包含对 MySQL 服务器实例所做的数据修改的信息。二进制日志文件是复制所必需的。必须按照以下两个步骤进行操作：

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging-rds}

自动备份功能确定是否已为 MySQL 启用二进制日志。可以在 AWS 控制台中进行设置：

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

建议根据复制使用案例将备份保留时间设置为合理的较长值。

### 2. 二进制日志保留小时数 {#binlog-retention-hours-rds}
Amazon RDS for MariaDB 有一种不同的设置二进制日志保留持续时间的方法，即包含更改的 binlog 文件保留的时间。如果在 binlog 文件被删除之前没有读取某些更改，则复制将无法继续。二进制日志保留小时数的默认值为 NULL，这意味着不保留二进制日志。

要指定在 DB 实例上保留二进制日志的小时数，请使用 mysql.rds_set_configuration 函数，设定足够长的 binlog 保留期以进行复制。推荐的最小值为 `24 hours`。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## 在参数组中配置 binlog 设置 {#binlog-parameter-group-rds}

可以在 RDS 控制台中单击您的 MariaDB 实例，然后导航到 `Configurations` 选项卡找到参数组。

<Image img={rds_config} alt="在 RDS 中找到参数组的位置" size="lg" border/>

单击参数组链接后，将进入参数组链接页面。您将在右上角看到一个编辑按钮：

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

需要将 `binlog_format`、`binlog_row_metadata` 和 `binlog_row_image` 设置如下：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将二进制日志格式设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image img={binlog_row_metadata} alt="将二进制日志行元数据设置为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt="将二进制日志行图像设置为 FULL" size="lg" border/>

接下来，单击右上角的 `Save Changes`。您可能需要重新启动实例以使更改生效。如果在 RDS 实例的 Configurations 选项卡中看到参数组链接旁边的 `Pending reboot`，这表明需要重新启动您的实例。

<br/>
:::tip
如果您有一个 MariaDB 集群，上述参数将位于 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中，而不是 DB 实例组中。
:::

## 启用 GTID 模式 {#gtid-mode-rds}
全局事务标识符 (GTID) 是分配给 MySQL/MariaDB 中每个已提交事务的唯一 ID。它们简化了二进制日志复制并使故障排除更加简单。MariaDB 默认启用 GTID 模式，因此使用它不需要用户操作。

## 配置数据库用户 {#configure-database-user-rds}

以管理员用户身份连接到您的 RDS MariaDB 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例显示了 `mysql` 数据库的权限。对每个要复制的数据库和主机重复这些命令：

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. 授予该用户复制权限：
