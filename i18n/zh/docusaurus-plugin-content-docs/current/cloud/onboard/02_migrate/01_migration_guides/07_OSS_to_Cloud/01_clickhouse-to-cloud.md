---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: '在自托管 ClickHouse 与 ClickHouse Cloud 之间迁移'
description: '介绍如何在自托管 ClickHouse 与 ClickHouse Cloud 之间相互迁移的页面'
doc_type: 'guide'
keywords: ['migration', 'ClickHouse Cloud', 'OSS', 'Migrate self-managed to Cloud']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';


# 在自管 ClickHouse 与 ClickHouse Cloud 之间迁移

<Image img={self_managed_01} size='md' alt='迁移自管 ClickHouse' background='white' />

本指南将演示如何将自管 ClickHouse 服务器迁移到 ClickHouse Cloud，以及如何在不同 ClickHouse Cloud 服务之间进行迁移。[`remoteSecure`](/sql-reference/table-functions/remote) 函数可以在 `SELECT` 和 `INSERT` 查询中使用，以访问远程 ClickHouse 服务器，从而使表迁移变得非常简单：只需编写一个包含内联 `SELECT` 的 `INSERT INTO` 查询即可。



## 从自托管 ClickHouse 迁移到 ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image
  img={self_managed_02}
  size='sm'
  alt='迁移自托管 ClickHouse'
  background='white'
/>

:::note
无论源表是否分片和/或复制,在 ClickHouse Cloud 上您只需创建目标表(可以省略该表的 Engine 参数,它将自动成为 ReplicatedMergeTree 表),
ClickHouse Cloud 将自动处理垂直和水平扩展。您无需考虑如何复制和分片表。
:::

在此示例中,自托管 ClickHouse 服务器是_源_,ClickHouse Cloud 服务是_目标_。

### 概述 {#overview}

流程如下:

1. 在源服务上添加只读用户
1. 在目标服务上复制源表结构
1. 根据源的网络可用性,从源拉取数据到目标,或从源推送数据
1. 从目标的 IP 访问列表中移除源服务器(如适用)
1. 从源服务中移除只读用户

### 从一个系统迁移表到另一个系统: {#migration-of-tables-from-one-system-to-another}

此示例将一个表从自托管 ClickHouse 服务器迁移到 ClickHouse Cloud。

### 在源 ClickHouse 系统上(当前托管数据的系统) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- 添加一个可以读取源表的只读用户(本例中为 `db.table`)

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
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

### 在目标 ClickHouse Cloud 系统上: {#on-the-destination-clickhouse-cloud-system}

- 创建目标数据库:

```sql
CREATE DATABASE db
```

- 使用源的 CREATE TABLE 语句创建目标表。

:::tip
运行 CREATE 语句时,将 ENGINE 更改为不带任何参数的 ReplicatedMergeTree。ClickHouse Cloud 始终复制表并提供正确的参数。但要保留 `ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL` 和 `SETTINGS` 子句。
:::

```sql
CREATE TABLE db.table ...
```

- 使用 `remoteSecure` 函数从自托管源拉取数据

<Image
  img={self_managed_03}
  size='sm'
  alt='迁移自托管 ClickHouse'
  background='white'
/>

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

:::note
如果源系统无法从外部网络访问,则可以推送数据而不是拉取数据,因为 `remoteSecure` 函数同时支持查询和插入操作。请参阅下一个选项。
:::

- 使用 `remoteSecure` 函数将数据推送到 ClickHouse Cloud 服务

<Image
  img={self_managed_04}
  size='sm'
  alt='迁移自托管 ClickHouse'
  background='white'
/>

:::tip 将远程系统添加到您的 ClickHouse Cloud 服务 IP 访问列表
为了让 `remoteSecure` 函数连接到您的 ClickHouse Cloud 服务,远程系统的 IP 地址需要被 IP 访问列表允许。展开此提示下方的**管理您的 IP 访问列表**以获取更多信息。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```


## 在 ClickHouse Cloud 服务之间迁移数据 {#migrating-between-clickhouse-cloud-services}

<Image
  img={self_managed_05}
  size='lg'
  alt='Migrating Self-managed ClickHouse'
  background='white'
/>

在 ClickHouse Cloud 服务之间迁移数据的一些示例场景:

- 从已恢复的备份中迁移数据
- 从开发环境复制数据到预发布环境(或从预发布环境到生产环境)

在本示例中有两个 ClickHouse Cloud 服务,分别称为_源服务_和_目标服务_。数据将从源服务拉取到目标服务。虽然您也可以采用推送方式,但这里演示的是拉取方式,因为它使用只读用户。

<Image
  img={self_managed_06}
  size='lg'
  alt='Migrating Self-managed ClickHouse'
  background='white'
/>

迁移过程包含以下几个步骤:

1. 确定一个 ClickHouse Cloud 服务作为_源服务_,另一个作为_目标服务_
1. 在源服务上添加只读用户
1. 在目标服务上复制源表结构
1. 临时允许对源服务的 IP 访问
1. 从源服务复制数据到目标服务
1. 在源服务上重新建立 IP 访问列表
1. 从源服务中删除只读用户

#### 在源服务上添加只读用户 {#add-a-read-only-user-to-the-source-service}

- 添加一个可以读取源表的只读用户(本例中为 `db.table`)

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

在目标服务上创建数据库(如果尚不存在):

- 创建目标数据库:

  ```sql
  CREATE DATABASE db
  ```

- 使用源服务的 CREATE TABLE 语句创建目标表。

  在目标服务上使用源服务的 `select create_table_query...` 输出创建表:

  ```sql
  CREATE TABLE db.table ...
  ```

#### 允许对源服务的远程访问 {#allow-remote-access-to-the-source-service}

为了从源服务拉取数据到目标服务,源服务必须允许连接。临时禁用源服务上的"IP 访问列表"功能。

:::tip
如果您将继续使用源 ClickHouse Cloud 服务,则在切换为允许从任何位置访问之前,请将现有的 IP 访问列表导出到 JSON 文件;这样您可以在数据迁移完成后重新导入访问列表。
:::

修改允许列表并临时允许从**任何位置**访问。详情请参阅 [IP 访问列表](/cloud/security/setting-ip-filters) 文档。

#### 从源服务复制数据到目标服务 {#copy-the-data-from-source-to-destination}

- 使用 `remoteSecure` 函数从源 ClickHouse Cloud 服务拉取数据
  连接到目标服务。在目标 ClickHouse Cloud 服务上运行此命令:

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- 验证目标服务中的数据

#### 在源服务上重新建立 IP 访问列表 {#re-establish-the-ip-access-list-on-the-source}

如果您之前导出了访问列表,则可以使用**共享**功能重新导入,否则请手动重新添加访问列表条目。

#### 删除只读 `exporter` 用户 {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

- 切换服务 IP 访问列表以限制访问
