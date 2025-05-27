---
'sidebar_label': 'Amazon RDS MariaDB'
'description': '逐步指南，介绍如何将 Amazon RDS MariaDB 设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mysql/source/rds_maria'
'title': 'RDS MariaDB 源设置指南'
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


# RDS MariaDB 源设置指南

这是一个逐步指南，介绍如何配置您的 RDS MariaDB 实例以通过 MySQL ClickPipe 复制其数据。
<br/>
:::info
我们还建议查看 MySQL 常见问题解答 [here](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题解答页面正在积极更新。
:::

## 启用二进制日志保留 {#enable-binlog-retention-rds}
二进制日志是一组日志文件，包含对 MySQL 服务器实例所做的数据修改信息。二进制日志文件是复制所必需的。必须遵循以下两个步骤：

### 1. 通过自动备份启用二进制日志{#enable-binlog-logging-rds}

自动备份功能决定 MySQL 的二进制日志是否开启。可以在 AWS 控制台中进行设置：

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

建议根据复制使用案例将备份保留时间设置为合理的较长值。

### 2. Binlog 保留时间（小时）{#binlog-retention-hours-rds}
Amazon RDS for MariaDB 有不同的方法来设置 binlog 保留时间，即包含更改的 binlog 文件保持的时间。如果在 binlog 文件被删除之前未读取某些更改，复制将无法继续。binlog 保留时间的默认值是 NULL，这意味着不保留二进制日志。

要指定在 DB 实例上保留二进制日志的小时数，请使用 mysql.rds_set_configuration 函数，设置一个足够长的 binlog 保留时间以进行复制。`24小时`是推荐的最小值。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## 在参数组中配置 binlog 设置 {#binlog-parameter-group-rds}

参数组可以通过点击 RDS 控制台中的 MariaDB 实例，然后导航到 `Configurations` 选项卡找到。

<Image img={rds_config} alt="在 RDS 中找到参数组的位置" size="lg" border/>

点击参数组链接后，您将进入参数组链接页面。您会在右上角看到一个编辑按钮：

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

设置 `binlog_format`、`binlog_row_metadata` 和 `binlog_row_image` 需要如下配置：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将 Binlog 格式设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image img={binlog_row_metadata} alt="将 Binlog 行元数据设置为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt="将 Binlog 行图像设置为 FULL" size="lg" border/>

接下来，点击右上角的 `Save Changes`。您可能需要重新启动您的实例以使更改生效。如果您在 RDS 实例的 Configurations 选项卡中的参数组链接旁看到 `Pending reboot`，这表明需要重新启动您的实例。

<br/>
:::tip
如果您有一个 MariaDB 集群，以上参数将在 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到，而不是 DB 实例组中。
:::

## 启用 GTID 模式 {#gtid-mode-rds}
全局事务标识符 (GTIDs) 是分配给每个已提交事务的唯一 ID，这些事务在 MySQL/MariaDB 中。这些标识符简化了 binlog 复制，并使故障排除更简单。MariaDB 默认启用 GTID 模式，因此无需用户操作即可使用。

## 配置数据库用户 {#configure-database-user-rds}

以管理员用户身份连接到您的 RDS MariaDB 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例展示了对 `mysql` 数据库的权限。对于您希望复制的每个数据库和主机，重复这些命令：

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. 授予用户复制权限：
