---
'sidebar_label': 'Amazon RDS MariaDB'
'description': '逐步指南，介绍如何将 Amazon RDS MariaDB 设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mysql/source/rds_maria'
'title': 'RDS MariaDB 源设置指南'
'doc_type': 'guide'
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

这是一个关于如何配置您的 RDS MariaDB 实例以通过 MySQL ClickPipe 复制其数据的逐步指南。
<br/>
:::info
我们还建议您查看 MySQL 常见问题解答 [这里](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题解答页面正在积极更新中。
:::

## 启用二进制日志保留 {#enable-binlog-retention-rds}
二进制日志是一组包含对 MySQL 服务器实例所做的数据修改信息的日志文件。复制需要二进制日志文件。必须遵循以下两个步骤：

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging-rds}

自动备份功能决定是否为 MySQL 打开或关闭二进制日志。可以在 AWS 控制台中设置：

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

建议根据复制用例将备份保留时间设置为合理较长的值。

### 2. Binlog 保留小时数 {#binlog-retention-hours-rds}
Amazon RDS for MariaDB 具有不同的设置 binlog 保留时长的方法，即包含更改的 binlog 文件保留的时间。如果在 binlog 文件被删除之前未读取某些更改，复制将无法继续。binlog 保留小时数的默认值为 NULL，这意味着二进制日志不被保留。

要指定在数据库实例上保留二进制日志的小时数，请使用 mysql.rds_set_configuration 函数，并设置足够长的 binlog 保留周期以进行复制。推荐的最小值是 `24 小时`。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## 在参数组中配置 binlog 设置 {#binlog-parameter-group-rds}

可以在 RDS 控制台中单击您的 MariaDB 实例，然后导航到 `Configurations` 选项卡找到参数组。

<Image img={rds_config} alt="在 RDS 中找到参数组的位置" size="lg" border/>

点击参数组链接后，您将进入参数组链接页面。在右上角您会看到一个“编辑”按钮：

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

需要将 `binlog_format`、`binlog_row_metadata` 和 `binlog_row_image` 设置如下：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将 Binlog 格式设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`。

<Image img={binlog_row_metadata} alt="将 Binlog 行元数据设置为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`。

<Image img={binlog_row_image} alt="将 Binlog 行图像设置为 FULL" size="lg" border/>

接下来，点击右上角的 `Save Changes`。您可能需要重启实例以使更改生效。如果在 RDS 实例的 Configurations 选项卡中看到参数组链接旁边有 `Pending reboot`，这表明您的实例需要重启。

<br/>
:::tip
如果您有 MariaDB 集群，上述参数将在 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到，而不是 DB 实例组。
:::

## 启用 GTID 模式 {#gtid-mode-rds}
全局事务标识符（GTID）是分配给每个已提交事务的唯一 ID。它们简化了 binlog 复制，并使故障排除更加简单。MariaDB 默认启用 GTID 模式，因此无需用户采取任何操作即可使用它。

## 配置数据库用户 {#configure-database-user-rds}

以管理员用户连接到您的 RDS MariaDB 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予架构权限。以下示例显示了对 `mysql` 数据库的权限。对每个要复制的数据库和主机重复这些命令：

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. 授予用户复制权限：
