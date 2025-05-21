---
'sidebar_label': 'Amazon RDS MariaDB'
'description': 'Step-by-step guide on how to set up Amazon RDS MariaDB as a source
  for ClickPipes'
'slug': '/integrations/clickpipes/mysql/source/rds_maria'
'title': 'RDS MariaDB source setup guide'
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

这是关于如何配置你的 RDS MariaDB 实例以通过 MySQL ClickPipe 复制其数据的逐步指南。
<br/>
:::info
我们还建议你查看 MySQL 常见问题解答 [这里](/integrations/data-ingestion/clickpipes/mysql/faq.md)。常见问题解答页面正在积极更新中。
:::

## 启用二进制日志保留 {#enable-binlog-retention-rds}
二进制日志是一组包含对 MySQL 服务器实例所做的数据修改信息的日志文件。二进制日志文件是复制所必需的。以下两个步骤必须遵循：

### 1. 通过自动备份启用二进制日志 {#enable-binlog-logging-rds}

自动备份功能决定了 MySQL 的二进制日志是开启还是关闭。可以在 AWS 控制台中设置：

<Image img={rds_backups} alt="在 RDS 中启用自动备份" size="lg" border/>

根据复制使用情况，将备份保留设置为合理较长的值是可取的。

### 2. Binlog 保留时长 {#binlog-retention-hours-rds}
Amazon RDS for MariaDB 采用不同的方法设置 binlog 保留时长，即包含更改的 binlog 文件保留的时间。如果在 binlog 文件被删除之前没有读取某些更改，复制将无法继续。binlog 保留时长的默认值为 NULL，这意味着不保留二进制日志。

要指定在 DB 实例上保留二进制日志的小时数，请使用 mysql.rds_set_configuration 函数，并设置一个足够长的 binlog 保留时间，以便进行复制。推荐的最小值为 `24 hours`。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## 在参数组中配置 binlog 设置 {#binlog-parameter-group-rds}

可以在 RDS 控制台中点击你的 MariaDB 实例，然后导航到 `Configurations` 选项卡来找到参数组。

<Image img={rds_config} alt="在 RDS 中找到参数组的位置" size="lg" border/>

点击参数组链接后，你将会进入参数组链接页面。在右上角会看到一个编辑按钮：

<Image img={edit_button} alt="编辑参数组" size="lg" border/>

需要将 `binlog_format`、`binlog_row_metadata` 和 `binlog_row_image` 设置如下：

1. 将 `binlog_format` 设置为 `ROW`。

<Image img={binlog_format} alt="将二进制日志格式设置为 ROW" size="lg" border/>

2. 将 `binlog_row_metadata` 设置为 `FULL`

<Image img={binlog_row_metadata} alt="将二进制日志行元数据设置为 FULL" size="lg" border/>

3. 将 `binlog_row_image` 设置为 `FULL`

<Image img={binlog_row_image} alt="将二进制日志行图像设置为 FULL" size="lg" border/>

接下来，在右上角点击 `Save Changes`。你可能需要重启你的实例以使更改生效。如果在 RDS 实例的 Configurations 选项卡中的参数组链接旁边看到 `Pending reboot`，这则是一个需要重启实例的良好指示。

<br/>
:::tip
如果你有一个 MariaDB 集群，上述参数将在 [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) 参数组中找到，而不是在 DB 实例组中。
:::

## 启用 GTID 模式 {#gtid-mode-rds}
全局事务标识符 (GTIDs) 是分配给每个已提交事务的唯一 ID。它们简化了 binlog 复制并使故障排除变得更加简单。MariaDB 默认启用 GTID 模式，因此无需用户采取任何操作即可使用它。

## 配置数据库用户 {#configure-database-user-rds}

以管理员用户身份连接到你的 RDS MariaDB 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. 授予模式权限。以下示例显示了 `mysql` 数据库的权限。对于你希望复制的每个数据库和主机，重复这些命令：

```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. 授予用户复制权限：
