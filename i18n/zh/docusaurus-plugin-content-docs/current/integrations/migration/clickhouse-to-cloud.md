import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';

# 从自管理的 ClickHouse 迁移到 ClickHouse Cloud

<Image img={self_managed_01} size='md' alt='从自管理的 ClickHouse 迁移' background='white' />

本指南将展示如何从自管理的 ClickHouse 服务器迁移到 ClickHouse Cloud，以及如何在 ClickHouse Cloud 服务之间迁移。 [`remoteSecure`](../../sql-reference/table-functions/remote.md) 函数用于 `SELECT` 和 `INSERT` 查询，以便访问远程 ClickHouse 服务器，这使得迁移表变得简单，只需编写带有嵌入 `SELECT` 的 `INSERT INTO` 查询即可。

## 从自管理的 ClickHouse 迁移到 ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='从自管理的 ClickHouse 迁移' background='white' />

:::note
无论您的源表是否分片和/或复制，在 ClickHouse Cloud 上您只需创建一个目标表（您可以省略该表的 Engine 参数，它将自动成为一个 ReplicatedMergeTree 表），ClickHouse Cloud 会自动处理垂直和水平扩展。您不需要考虑如何复制和分片表。
:::

在此示例中，自管理的 ClickHouse 服务器是 *源*，ClickHouse Cloud 服务是 *目标*。

### 概述 {#overview}

该过程如下：

1. 向源服务添加一个只读用户
1. 在目标服务上复制源表结构
1. 根据源的网络可用性，拉取源到目标的数据，或推送数据从源
1. 从目标的 IP 访问列表中移除源服务器（如果适用）
1. 从源服务中移除只读用户

### 从一个系统迁移表到另一个系统: {#migration-of-tables-from-one-system-to-another}
此示例将一个表从自管理的 ClickHouse 服务器迁移到 ClickHouse Cloud。

### 在源 ClickHouse 系统上（当前承载数据的系统） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- 添加一个可以读取源表的只读用户（本示例中的 `db.table`）
```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

- 复制表定义
```sql
select create_table_query
from system.tables
where database = 'db' and table = 'table'
```

### 在目标 ClickHouse Cloud 系统上: {#on-the-destination-clickhouse-cloud-system}

- 创建目标数据库：
```sql
CREATE DATABASE db
```

- 使用来自源的 CREATE TABLE 语句，创建目标表。

:::tip
在运行 CREATE 语句时，ENGINE 更改为 ReplicatedMergeTree 而不带任何参数。ClickHouse Cloud 始终复制表并提供正确的参数。但请保留 `ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL` 和 `SETTINGS` 子句。
:::

```sql
CREATE TABLE db.table ...
```

- 使用 `remoteSecure` 函数从自管理的源拉取数据

<Image img={self_managed_03} size='sm' alt='从自管理的 ClickHouse 迁移' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
如果源系统在外部网络不可用，则可以推送数据而不是拉取，因为 `remoteSecure` 函数对选择和插入都适用。请参见下一个选项。
:::

- 使用 `remoteSecure` 函数将数据推送到 ClickHouse Cloud 服务

<Image img={self_managed_04} size='sm' alt='从自管理的 ClickHouse 迁移' background='white' />

:::tip 将远程系统添加到您的 ClickHouse Cloud 服务的 IP 访问列表
为了让 `remoteSecure` 函数连接到您的 ClickHouse Cloud 服务，远程系统的 IP 地址必须在 IP 访问列表中被允许。有关更多信息，请展开 **管理您的 IP 访问列表**。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## 在 ClickHouse Cloud 服务之间迁移 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='从自管理的 ClickHouse 迁移' background='white' />

以下是一些在 ClickHouse Cloud 服务之间迁移数据的示例用途：
- 从恢复的备份中迁移数据
- 将数据从开发服务复制到临时服务（或从临时到生产）

在此示例中有两个 ClickHouse Cloud 服务，分别称为 *源* 和 *目标*。数据将从源拉取到目标。尽管您也可以选择推送，但这里展示了拉取，因为它使用的是只读用户。

<Image img={self_managed_06} size='lg' alt='从自管理的 ClickHouse 迁移' background='white' />

迁移过程有几个步骤：
1. 确定一个 ClickHouse Cloud 服务作为 *源*，另一个作为 *目标*
1. 向源服务添加一个只读用户
1. 在目标服务上复制源表结构
1. 临时允许源服务的 IP 访问
1. 从源复制数据到目标
1. 重新建立目标的 IP 访问列表
1. 从源服务中移除只读用户

#### 向源服务添加只读用户 {#add-a-read-only-user-to-the-source-service}

- 添加一个可以读取源表（本示例中的 `db.table`）的只读用户
```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

- 复制表定义
```sql
select create_table_query
from system.tables
where database = 'db' and table = 'table'
```

#### 在目标服务上复制表结构 {#duplicate-the-table-structure-on-the-destination-service}

在目标上创建数据库（如果尚未存在）：

- 创建目标数据库：
```sql
CREATE DATABASE db
```

- 使用来自源的 CREATE TABLE 语句，创建目标表。

  在目标上使用来自源的 `select create_table_query...` 的输出创建表：

```sql
CREATE TABLE db.table ...
```

#### 允许对源服务的远程访问 {#allow-remote-access-to-the-source-service}

为了从源拉取数据到目标，源服务必须允许连接。临时禁用源服务上的 "IP 访问列表" 功能。

:::tip
如果您将继续使用源 ClickHouse Cloud 服务，则在切换以允许来自任何地方的访问之前，将现有的 IP 访问列表导出为 JSON 文件；这将允许您在数据迁移后导入访问列表。
:::

修改允许列表，临时允许来自 **任何地方** 的访问。有关详细信息，请参见 [IP 访问列表](/cloud/security/setting-ip-filters) 文档。

#### 从源复制数据到目标 {#copy-the-data-from-source-to-destination}

- 使用 `remoteSecure` 函数从源 ClickHouse Cloud 服务拉取数据
  连接到目标。在目标 ClickHouse Cloud 服务上运行以下命令：

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

- 验证目标服务中的数据

#### 重新建立源的 IP 访问列表 {#re-establish-the-ip-access-list-on-the-source}

如果您之前导出了访问列表，则可以使用 **分享** 重新导入，或者手动重新添加您的条目到访问列表。

#### 移除只读的 `exporter` 用户 {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- 切换服务 IP 访问列表以限制访问
