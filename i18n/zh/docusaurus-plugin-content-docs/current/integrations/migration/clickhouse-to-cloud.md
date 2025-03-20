---
sidebar_position: 10
sidebar_label: ClickHouse 到 ClickHouse Cloud
slug: /cloud/migration/clickhouse-to-cloud
---
import AddARemoteSystem from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# 从自管理的 ClickHouse 迁移到 ClickHouse Cloud

<img src={self_managed_01} class="image" alt="迁移自管理的 ClickHouse" style={{width: '80%', padding: '30px'}} />

本指南将展示如何从自管理的 ClickHouse 服务器迁移到 ClickHouse Cloud，以及如何在 ClickHouse Cloud 服务之间迁移。 [`remoteSecure`](../../sql-reference/table-functions/remote.md) 函数在 `SELECT` 和 `INSERT` 查询中使用，以允许访问远程 ClickHouse 服务器，这使得迁移表就像编写嵌入式 `SELECT` 的 `INSERT INTO` 查询一样简单。

## 从自管理的 ClickHouse 迁移到 ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<img src={self_managed_02} class="image" alt="迁移自管理的 ClickHouse" style={{width: '30%', padding: '30px'}} />

:::note
无论您的源表是否为分片和/或副本，在 ClickHouse Cloud 上，您只需创建一个目标表（此表的 Engine 参数可以省略，它会自动成为 ReplicatedMergeTree 表），并且 ClickHouse Cloud 将自动处理垂直和水平扩展。您无需考虑如何复制和分片表。
:::

在本示例中，自管理的 ClickHouse 服务器是 *源*，ClickHouse Cloud 服务是 *目标*。

### 概览 {#overview}

过程如下：

1. 向源服务添加一个只读用户
1. 在目标服务上复制源表结构
1. 从源提取数据到目标，或根据源的网络可用性将数据从源推送
1. 如果适用，将源服务器从目标的 IP 访问列表中移除
1. 从源服务中删除只读用户


### 从一个系统迁移表到另一个系统: {#migration-of-tables-from-one-system-to-another}
此示例将一个表从自管理的 ClickHouse 服务器迁移到 ClickHouse Cloud。

### 在源 ClickHouse 系统上（当前托管数据的系统） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- 添加一个可以读取源表（在此示例中为 `db.table`）的只读用户
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

- 使用源的 CREATE TABLE 语句创建目标表。

:::tip
运行 CREATE 语句时将 ENGINE 更改为 ReplicatedMergeTree，无需任何参数。ClickHouse Cloud 总是复制表并提供正确的参数。不过要保留 `ORDER BY`，`PRIMARY KEY`，`PARTITION BY`，`SAMPLE BY`，`TTL` 和 `SETTINGS` 子句。
:::

```sql
CREATE TABLE db.table ...
```

- 使用 `remoteSecure` 函数从自管理源提取数据

<img src={self_managed_03} class="image" alt="迁移自管理的 ClickHouse" style={{width: '30%', padding: '30px'}} />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
如果源系统无法从外部网络访问，则您可以推送数据而不是提取，因为 `remoteSecure` 函数对选择和插入都有效。请参见下一个选项。
:::

- 使用 `remoteSecure` 函数将数据推送到 ClickHouse Cloud 服务

<img src={self_managed_04} class="image" alt="迁移自管理的 ClickHouse" style={{width: '30%', padding: '30px'}} />

:::tip 添加远程系统到您的 ClickHouse Cloud 服务的 IP 访问列表
为使 `remoteSecure` 函数连接到您的 ClickHouse Cloud 服务，远程系统的 IP 地址需要被 IP 访问列表允许。在此提示下展开 **管理您的 IP 访问列表** 以获取更多信息。
:::

  <AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## 在 ClickHouse Cloud 服务之间迁移 {#migrating-between-clickhouse-cloud-services}

<img src={self_managed_05} class="image" alt="迁移自管理的 ClickHouse" style={{width: '80%', padding: '30px'}} />

一些在 ClickHouse Cloud 服务之间迁移数据的示例用例：
- 从恢复的备份迁移数据
- 从开发服务向暂存服务（或从暂存到生产）复制数据

在此示例中，有两个 ClickHouse Cloud 服务，它们将被称为 *源* 和 *目标*。数据将从源提取到目标。虽然您也可以进行推送，这里展示的是提取，因为它使用了只读用户。

<img src={self_managed_06} class="image" alt="迁移自管理的 ClickHouse" style={{width: '80%', padding: '30px'}} />

迁移有几个步骤：
1. 确定一个 ClickHouse Cloud 服务作为 *源*，另一个作为 *目标*
1. 向源服务添加一个只读用户
1. 在目标服务上复制源表结构
1. 暂时允许对源服务的 IP 访问
1. 从源复制数据到目标
1. 重新建立目标的 IP 访问列表
1. 从源服务中移除只读用户


#### 向源服务添加只读用户 {#add-a-read-only-user-to-the-source-service}

- 添加可以读取源表（在此示例中为 `db.table`）的只读用户
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

在目标上创建数据库，如果尚未创建：

- 创建目标数据库：
  ```sql
  CREATE DATABASE db
  ```

- 使用源的 CREATE TABLE 语句创建目标。

  在目标上使用源的 `select create_table_query...` 的输出创建表：

  ```sql
  CREATE TABLE db.table ...
  ```

#### 允许远程访问源服务 {#allow-remote-access-to-the-source-service}

为了从源提取数据到目标，源服务必须允许连接。暂时禁用源服务上的 "IP 访问列表" 功能。

:::tip
如果您将继续使用源 ClickHouse Cloud 服务，则在允许任何地方访问之前先将现有的 IP 访问列表导出为 JSON 文件；这样在数据迁移后，您可以导入访问列表。
:::

修改允许列表，并暂时允许来自 **任何地方** 的访问。有关详细信息，请参见 [IP 访问列表](/cloud/security/setting-ip-filters) 文档。

#### 从源复制数据到目标 {#copy-the-data-from-source-to-destination}

- 使用 `remoteSecure` 函数从源 ClickHouse Cloud 服务提取数据
  连接到目标。 在目标 ClickHouse Cloud 服务上运行以下命令：

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 验证目标服务中的数据

#### 重新建立源上的 IP 访问列表 {#re-establish-the-ip-access-list-on-the-source}

如果您之前导出了访问列表，则可以使用 **共享** 重新导入它，否则请重新添加您的条目到访问列表中。

#### 移除只读 `exporter` 用户 {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- 切换服务的 IP 访问列表以限制访问
