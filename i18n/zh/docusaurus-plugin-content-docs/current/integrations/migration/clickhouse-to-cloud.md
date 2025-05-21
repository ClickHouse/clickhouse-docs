---
'sidebar_position': 10
'sidebar_label': '从 ClickHouse 到 ClickHouse Cloud'
'slug': '/cloud/migration/clickhouse-to-cloud'
'title': '在自管理 ClickHouse 和 ClickHouse Cloud 之间迁移'
'description': '描述如何在自管理 ClickHouse 和 ClickHouse Cloud 之间迁移的页面'
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# 从自管理 ClickHouse 迁移到 ClickHouse Cloud

<Image img={self_managed_01} size='md' alt='迁移自管理 ClickHouse' background='white' />

本指南将展示如何从自管理 ClickHouse 服务器迁移到 ClickHouse Cloud，以及如何在 ClickHouse Cloud 服务之间进行迁移。 [`remoteSecure`](../../sql-reference/table-functions/remote.md) 函数在 `SELECT` 和 `INSERT` 查询中用于允许访问远程 ClickHouse 服务器，从而使得迁移表变得像编写带有嵌入式 `SELECT` 的 `INSERT INTO` 查询一样简单。

## 从自管理 ClickHouse 迁移到 ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='sm' alt='迁移自管理 ClickHouse' background='white' />

:::note
无论你的源表是否分片和/或复制，在 ClickHouse Cloud 上只需创建一个目标表（可以省略此表的 Engine 参数，它将自动成为一个 ReplicatedMergeTree 表），ClickHouse Cloud 会自动处理垂直和水平扩展。 你无需考虑如何复制和分片表。
:::

在这个例子中，自管理 ClickHouse 服务器是 *源*，而 ClickHouse Cloud 服务是 *目标*。

### 概述 {#overview}

该过程为：

1. 向源服务添加只读用户
1. 在目标服务上重复源表结构
1. 根据源的网络可用性，将数据从源拉取到目标，或从源推送数据
1. 从目标的 IP 访问列表中移除源服务器（如果适用）
1. 从源服务中删除只读用户

### 从一个系统迁移表到另一个系统 {#migration-of-tables-from-one-system-to-another}
本例将一个表从自管理 ClickHouse 服务器迁移到 ClickHouse Cloud。

### 在源 ClickHouse 系统上（当前托管数据的系统） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- 添加一个只读用户，可以读取源表（本例中的 `db.table`）
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

### 在目标 ClickHouse Cloud 系统上 {#on-the-destination-clickhouse-cloud-system}

- 创建目标数据库：
```sql
CREATE DATABASE db
```

- 使用源的 CREATE TABLE 语句创建目标。

:::tip
在运行 CREATE 语句时，将 ENGINE 更改为 ReplicatedMergeTree，而不带任何参数。 ClickHouse Cloud 始终复制表并提供正确的参数。 但是保留 `ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL` 和 `SETTINGS` 子句。
:::

```sql
CREATE TABLE db.table ...
```

- 使用 `remoteSecure` 函数从自管理源中拉取数据

<Image img={self_managed_03} size='sm' alt='迁移自管理 ClickHouse' background='white' />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
如果源系统无法从外部网络访问，则可以推送数据而不是拉取数据，因为 `remoteSecure` 函数适用于选择和插入。 请参见下一个选项。
:::

- 使用 `remoteSecure` 函数将数据推送到 ClickHouse Cloud 服务

<Image img={self_managed_04} size='sm' alt='迁移自管理 ClickHouse' background='white' />

:::tip 添加远程系统到你的 ClickHouse Cloud 服务 IP 访问列表
为了让 `remoteSecure` 函数连接到你的 ClickHouse Cloud 服务，远程系统的 IP 地址需要被 IP 访问列表允许。 展开**管理你的 IP 访问列表**以获取更多信息。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## 在 ClickHouse Cloud 服务之间迁移 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt='迁移自管理 ClickHouse' background='white' />

一些在 ClickHouse Cloud 服务之间迁移数据的示例用法：
- 从恢复的备份中迁移数据
- 将数据从开发服务复制到暂存服务（或从暂存复制到生产）

在该示例中，有两个 ClickHouse Cloud 服务，将其分别称为 *源* 和 *目标*。 数据将从源拉取到目标。 尽管你可以选择推送，但此处以拉取的方式展示，因为它使用了只读用户。

<Image img={self_managed_06} size='lg' alt='迁移自管理 ClickHouse' background='white' />

迁移的步骤如下：
1. 确定一个 ClickHouse Cloud 服务为 *源*，另一个为 *目标*
1. 向源服务添加只读用户
1. 在目标服务上重复源表结构
1. 暂时允许对源服务的 IP 访问
1. 从源复制数据到目标
1. 在目标上重新建立 IP 访问列表
1. 从源服务中删除只读用户

#### 向源服务添加只读用户 {#add-a-read-only-user-to-the-source-service}

- 添加一个只读用户，可以读取源表（本例中的 `db.table`）
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

如果目标数据库尚未存在，请在目标中创建该数据库：

- 创建目标数据库：
```sql
  CREATE DATABASE db
```

- 使用源的 CREATE TABLE 语句创建目标。

  在目标中，使用源的 `select create_table_query...` 的输出创建表：

```sql
  CREATE TABLE db.table ...
```

#### 允许对源服务的远程访问 {#allow-remote-access-to-the-source-service}

为了将数据从源拉取到目标，源服务必须允许连接。 暂时禁用源服务上的“IP 访问列表”功能。

:::tip
如果你会继续使用源 ClickHouse Cloud 服务，请在切换到允许任何地方访问之前，将现有 IP 访问列表导出到 JSON 文件；这将使你在数据迁移后能够导入访问列表。
:::

修改允许列表，暂时从**任何地方**允许访问。 请参见[IP 访问列表](/cloud/security/setting-ip-filters) 文档以获取详细信息。

#### 从源复制数据到目标 {#copy-the-data-from-source-to-destination}

- 使用 `remoteSecure` 函数从源 ClickHouse Cloud 服务中拉取数据
  连接到目标。 在目标 ClickHouse Cloud 服务上运行此命令：

```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

- 验证目标服务中的数据

#### 在源上重新建立 IP 访问列表 {#re-establish-the-ip-access-list-on-the-source}

如果你之前导出了访问列表，则可以使用 **分享** 重新导入它，否则请将你的条目重新添加到访问列表中。

#### 删除只读 `exporter` 用户 {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- 切换服务 IP 访问列表以限制访问
