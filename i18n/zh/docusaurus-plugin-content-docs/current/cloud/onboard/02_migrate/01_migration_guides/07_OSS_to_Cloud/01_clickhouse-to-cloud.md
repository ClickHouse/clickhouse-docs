---
sidebar_label: 'ClickHouse OSS'
slug: /cloud/migration/clickhouse-to-cloud
title: '在自托管 ClickHouse 与 ClickHouse Cloud 之间迁移'
description: '介绍如何在自托管 ClickHouse 与 ClickHouse Cloud 之间迁移的页面'
doc_type: 'guide'
keywords: ['迁移', 'ClickHouse Cloud', 'OSS', '将自托管迁移到 Cloud']
---

import Image from '@theme/IdealImage';
import AddARemoteSystem from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import self_managed_01 from '@site/static/images/integrations/migration/self-managed-01.png';
import self_managed_02 from '@site/static/images/integrations/migration/self-managed-02.png';
import self_managed_03 from '@site/static/images/integrations/migration/self-managed-03.png';
import self_managed_04 from '@site/static/images/integrations/migration/self-managed-04.png';
import self_managed_05 from '@site/static/images/integrations/migration/self-managed-05.png';
import self_managed_06 from '@site/static/images/integrations/migration/self-managed-06.png';

# 在自托管 ClickHouse 与 ClickHouse Cloud 之间迁移 {#migrating-between-self-managed-clickhouse-and-clickhouse-cloud}

<Image img={self_managed_01} size="md" alt="迁移自托管 ClickHouse" background="white" />

本指南将说明如何将自托管 ClickHouse 服务器迁移到 ClickHouse Cloud，以及如何在不同的 ClickHouse Cloud 服务之间进行迁移。[`remoteSecure`](/sql-reference/table-functions/remote) 函数在 `SELECT` 和 `INSERT` 查询中使用，以便访问远程 ClickHouse 服务器，这使得迁移数据表变得非常简单，只需编写一个嵌套 `SELECT` 的 `INSERT INTO` 查询即可完成。

## 从自托管 ClickHouse 迁移到 ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud}

<Image img={self_managed_02} size="sm" alt="Migrating Self-managed ClickHouse" background="white" />

:::note
无论源表是否进行了分片和/或复制，在 ClickHouse Cloud 中只需创建一个目标表（可以省略该表的 Engine 参数，系统会自动将其创建为 ReplicatedMergeTree 表），
ClickHouse Cloud 会自动处理纵向和横向扩展。无需再考虑如何对表进行复制和分片。
:::

在本示例中，自托管 ClickHouse 服务器是*源端*，ClickHouse Cloud 服务是*目标端*。

### 概览 {#overview}

流程如下：

1. 在源服务中添加一个只读用户
2. 在目标服务中复制源表结构
3. 根据源端的网络可达性，从源端拉取数据到目标端，或由源端向目标端推送数据
4. 从目标端的 IP 访问列表中移除源服务器（如适用）
5. 从源服务中删除该只读用户

### 在两个系统之间迁移表： {#migration-of-tables-from-one-system-to-another}

本示例会将一个表从自托管 ClickHouse 服务器迁移到 ClickHouse Cloud。

### 在源 ClickHouse 系统上（当前托管数据的系统） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

* 添加一个可以读取源表（本例中为 `db.table`）的只读用户

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY '在此填写密码'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

* 复制表定义

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

* 使用源端的 CREATE TABLE 语句，在目标端创建表。

:::tip
在运行 CREATE 语句时，将 ENGINE 修改为不带任何参数的 ReplicatedMergeTree。ClickHouse Cloud 始终会对表进行复制并提供正确的参数设置。但请保留 `ORDER BY`、`PRIMARY KEY`、`PARTITION BY`、`SAMPLE BY`、`TTL` 和 `SETTINGS` 子句。
:::

```sql
CREATE TABLE db.table ...
```

* 使用 `remoteSecure` 函数从自托管源拉取数据

<Image img={self_managed_03} size="sm" alt="迁移自托管 ClickHouse" background="white" />

```sql
INSERT INTO db.table SELECT * FROM
remoteSecure('源主机名', db, table, 'exporter', '密码')
```

:::note
如果源系统无法从外部网络访问，则可以选择推送数据而不是拉取数据，因为 `remoteSecure` 函数同时适用于 select 和 insert 操作。请参阅下一个选项。
:::

* 使用 `remoteSecure` 函数将数据推送到 ClickHouse Cloud 服务

<Image img={self_managed_04} size="sm" alt="迁移自托管版 ClickHouse" background="white" />

:::tip 将远程系统添加到 ClickHouse Cloud 服务的 IP 访问列表
为了使 `remoteSecure` 函数能够连接到 ClickHouse Cloud 服务，需要在 IP 访问列表中允许该远程系统的 IP 地址。展开本提示下方的 **管理 IP 访问列表** 以了解更多信息。
:::

<AddARemoteSystem />

```sql
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
'default', 'PASS') SELECT * FROM db.table
```

## 在 ClickHouse Cloud 服务之间迁移 {#migrating-between-clickhouse-cloud-services}

<Image img={self_managed_05} size="lg" alt="迁移自托管 ClickHouse" background="white" />

在 ClickHouse Cloud 服务之间迁移数据的一些示例场景：

* 从恢复的备份中迁移数据
* 将数据从开发服务复制到预发布服务（或从预发布复制到生产环境）

在本示例中，有两个 ClickHouse Cloud 服务，我们将其分别称为 *源（source）* 和 *目标（destination）*。数据将从源服务拉取到目标服务。虽然也可以选择推送数据，但这里展示的是拉取方式，因为它使用只读用户。

<Image img={self_managed_06} size="lg" alt="迁移自托管 ClickHouse" background="white" />

迁移过程包含以下几个步骤：

1. 确定一个 ClickHouse Cloud 服务作为 *源*，另一个作为 *目标*
2. 在源服务中添加一个只读用户
3. 在目标服务中复制源表的结构
4. 临时允许从外部访问源服务的 IP
5. 将数据从源服务复制到目标服务
6. 在目标服务上重新建立 IP 访问列表
7. 从源服务中移除只读用户

#### 在源服务中添加只读用户 {#add-a-read-only-user-to-the-source-service}

* 添加一个只读用户，用于读取源表（本示例中为 `db.table`）：

  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

* 复制表定义：
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### 在目标服务上复制表结构 {#duplicate-the-table-structure-on-the-destination-service}

在目标服务上，如果数据库尚不存在，则先创建数据库：

* 创建目标数据库：
  ```sql
  CREATE DATABASE db
  ```

* 使用源服务中的 CREATE TABLE 语句在目标服务上创建表。

  在目标服务中，使用源服务中 `select create_table_query...` 的输出创建表：

  ```sql
  CREATE TABLE db.table ...
  ```

#### 允许对源服务的远程访问 {#allow-remote-access-to-the-source-service}

为了将数据从源服务拉取到目标服务，源服务必须允许来自外部的连接。请在源服务上临时禁用“IP Access List（IP 访问列表）”功能。

:::tip
如果您将继续使用该源 ClickHouse Cloud 服务，那么在切换为允许从任意地址访问之前，请先将现有 IP 访问列表导出为一个 JSON 文件；在数据迁移完成后，您可以重新导入该访问列表。
:::

修改访问列表，并临时将访问范围设置为 **Anywhere（任意地址）**。详细信息请参阅 [IP Access List](/cloud/security/setting-ip-filters) 文档。

#### 将数据从源服务复制到目标服务 {#copy-the-data-from-source-to-destination}

* 使用 `remoteSecure` 函数从源 ClickHouse Cloud 服务拉取数据。
  连接到目标服务，并在目标 ClickHouse Cloud 服务上运行以下命令：

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

* 在目标服务中验证数据

#### 在源服务上重新建立 IP 访问列表 {#re-establish-the-ip-access-list-on-the-source}

如果之前导出了访问列表，则可以通过 **Share** 进行重新导入；否则，请重新将各条访问记录添加到访问列表中。

#### 移除只读的 `exporter` 用户 {#remove-the-read-only-exporter-user}

```sql
DROP USER exporter
```

* 修改服务 IP 访问列表以限制访问
