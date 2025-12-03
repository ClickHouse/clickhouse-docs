---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: '在自管理 ClickHouse 与 ClickHouse Cloud 之间迁移'
description: '介绍如何在自管理 ClickHouse 与 ClickHouse Cloud 之间执行迁移的页面'
doc_type: 'guide'
keywords: ['迁移', 'ClickHouse Cloud', 'OSS', '将自管理迁移到 Cloud']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';

# 在自管理 ClickHouse 与 ClickHouse Cloud 之间迁移 {#migrating-between-self-managed-clickhouse-and-clickhouse-cloud}

<Image img={self_managed_01} size='lg' alt="迁移自管理 ClickHouse"/>

本指南将说明如何从自管理 ClickHouse 服务器迁移到 ClickHouse Cloud，以及如何在不同的 ClickHouse Cloud 服务之间进行迁移。[`remoteSecure`](/sql-reference/table-functions/remote) 函数可在 `SELECT` 和 `INSERT` 查询中使用，以访问远程 ClickHouse 服务器，从而使迁移表变得像编写一条包含内联 `SELECT` 的 `INSERT INTO` 查询一样简单。

## 从自管理 ClickHouse 迁移到 ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size='lg' alt='迁移自管理 ClickHouse'  />

:::note
无论源表是否进行了分片和/或复制，在 ClickHouse Cloud 中，你只需创建一个目标表（可以省略该表的 Engine 参数，它会自动成为一个 ReplicatedMergeTree 表），
ClickHouse Cloud 会自动处理纵向和横向扩展。你无需操心如何对表进行复制和分片。
:::

在本示例中，自管理 ClickHouse 服务器是*源端*，而 ClickHouse Cloud 服务是*目标端*。

### 概览 {#overview}

整体流程如下：

1. 在源服务中添加一个只读用户
1. 在目标服务中创建与源表相同的表结构
1. 根据源服务的网络连通性，从目标服务拉取源数据，或从源服务向目标服务推送数据
1. 将源服务器从目标服务的 IP 访问列表中移除（如适用）
1. 从源服务中移除该只读用户

### 将表从一个系统迁移到另一个系统：{#migration-of-tables-from-one-system-to-another}

本示例将单个表从自管理 ClickHouse 服务器迁移到 ClickHouse Cloud。

### 在源 ClickHouse 系统上（当前承载数据的系统） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

* 添加一个只读用户，用于读取源表（本例中的 `db.table`）

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

* 复制该表的定义

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### 在目标 ClickHouse Cloud 系统上： {#on-the-destination-clickhouse-cloud-system}

* 创建目标数据库：

```sql
CREATE DATABASE db
```

* 使用源表中的 CREATE TABLE 语句来创建目标表。

:::tip
在运行 CREATE 语句时，将 ENGINE 更改为不带任何参数的 ReplicatedMergeTree。ClickHouse Cloud 会自动为表创建副本并填充正确的参数。但需要保留 `ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL` 和 `SETTINGS` 子句。
:::

```sql
CREATE TABLE db.table ...
```

* 使用 `remoteSecure` 函数从自管理源拉取数据

<Image img={self_managed_03} size="lg" alt="迁移自管理 ClickHouse" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
如果源系统无法从外部网络访问，则可以选择推送数据而非拉取数据，因为 `remoteSecure` 函数既适用于 select 也适用于 insert。请参阅下一个选项。
:::

* 使用 `remoteSecure` 函数将数据推送到 ClickHouse Cloud 服务

<Image img={self_managed_04} size="lg" alt="迁移自管理的 ClickHouse" />

:::tip 将远程系统添加到 ClickHouse Cloud 服务的 IP 访问列表中
要使 `remoteSecure` 函数能够连接到 ClickHouse Cloud 服务，需要在 IP 访问列表中放行该远程系统的 IP 地址。展开此提示下方的 **Manage your IP Access List** 以了解更多信息。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## 在 ClickHouse Cloud 服务之间迁移 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size='lg' alt="Migrating Self-managed ClickHouse"  />

在 ClickHouse Cloud 服务之间迁移数据的一些示例场景：

- 从恢复的备份中迁移数据
- 将数据从开发服务复制到预发布服务（或从预发布复制到生产）

在此示例中，有两个 ClickHouse Cloud 服务，它们分别称为 *源* 和 *目标*。数据将从源服务拉取到目标服务。虽然你也可以选择推送方式，但这里展示的是拉取方式，因为它使用只读用户。

<Image img={self_managed_06} size='lg' alt="Migrating Self-managed ClickHouse"  />

迁移过程包含以下几个步骤：

1. 确定一个 ClickHouse Cloud 服务作为 *源*，另一个作为 *目标*
1. 在源服务上添加一个只读用户
1. 在目标服务上创建与源服务相同的表结构
1. 临时允许从目标服务的 IP 访问源服务
1. 将数据从源服务复制到目标服务
1. 在目标服务上重新设置 IP 访问列表
1. 从源服务中移除只读用户

#### 向源服务添加只读用户 {#add-a-read-only-user-to-the-source-service}

- 添加一个只读用户，用于读取源表（本例中为 `db.table`）
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

在目标服务上，如果数据库尚不存在，请先创建：

- 创建目标数据库：
  ```sql
  CREATE DATABASE db
  ```

- 使用源端的 `CREATE TABLE` 语句，在目标服务上创建目标表。

  在目标服务上使用源端执行 `select create_table_query...` 的输出创建表：

  ```sql
  CREATE TABLE db.table ...
  ```

#### 允许远程访问源服务 {#allow-remote-access-to-the-source-service}

为了将数据从源端拉取到目标端，必须允许对源服务的连接。请在源服务上暂时禁用“IP Access List”功能。

:::tip
如果您计划继续使用源 ClickHouse Cloud 服务，那么在切换为允许从任意位置访问之前，请先将现有的 IP 访问列表导出为 JSON 文件；这样在数据迁移完成后，您就可以重新导入该访问列表。
:::

修改允许列表，临时将访问权限设置为允许从 **Anywhere** 访问。详情参见 [IP 访问列表](/cloud/security/setting-ip-filters) 文档。

#### 将数据从源复制到目标 {#copy-the-data-from-source-to-destination}

- 使用 `remoteSecure` 函数从源 ClickHouse Cloud 服务中拉取数据  
  连接到目标。在目标 ClickHouse Cloud 服务上运行以下命令：

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 在目标服务中验证数据

#### 在源端重新设置 IP 访问列表 {#re-establish-the-ip-access-list-on-the-source}

如果你之前导出了访问列表，则可以使用 **Share** 将其重新导入；否则，请将你的条目重新添加到访问列表中。

#### 删除只读的 `exporter` 用户 {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

* 修改服务 IP 访问列表以限制访问
