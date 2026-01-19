---
sidebar_label: '使用 clickhouse-local'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: '使用 clickhouse-local 迁移到 ClickHouse'
description: '本指南介绍如何使用 clickhouse-local 迁移到 ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';

# 使用 clickhouse-local 迁移到 ClickHouse \{#migrating-to-clickhouse-using-clickhouse-local\}

<Image img={ch_local_01} size='lg' alt='迁移自管理 ClickHouse'/>

你可以使用 ClickHouse，或者更具体地说，[`clickhouse-local`](/operations/utilities/clickhouse-local.md) 作为 ETL 工具，将数据从当前的数据库系统迁移到 ClickHouse Cloud。前提是当前数据库系统要么有 ClickHouse 提供的相应
[集成引擎（integration engine）](/engines/table-engines/#integration-engines) 或 [表函数（table function）](/sql-reference/table-functions/)，要么有系统供应商提供的 JDBC 驱动或 ODBC 驱动可用。

我们有时称这种迁移方法为“枢纽（pivot）”方法，因为它使用一个中间的枢纽点或中转跳点，将数据从源数据库移动到目标数据库。例如，如果出于安全要求，在私有或内部网络中只允许向外发起连接，那么就可能需要通过 clickhouse-local 从源数据库拉取数据，然后再将数据推送到目标 ClickHouse 数据库，此时 clickhouse-local 就充当了这个枢纽点。

ClickHouse 为 [MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb) 和 [SQLite](/engines/table-engines/integrations/sqlite) 提供了集成引擎（integration engines）和表函数（table functions，运行时即时创建集成引擎）。对于所有其他流行的数据库系统，系统供应商通常会提供 JDBC 驱动或 ODBC 驱动。

## 什么是 clickhouse-local？ \{#what-is-clickhouse-local\}

<Image img={ch_local_02} size='lg' alt='迁移自管理 ClickHouse'  />

通常，ClickHouse 以集群形式运行，其中多个 ClickHouse 数据库引擎实例以分布式方式运行在不同服务器上。

在单台服务器上，ClickHouse 数据库引擎作为 `clickhouse-server` 程序的一部分运行。数据库访问（路径、用户、安全性等）通过服务器配置文件进行配置。

`clickhouse-local` 工具允许你在一个相互隔离的命令行工具环境中使用 ClickHouse 数据库引擎，对海量输入和输出进行极速 SQL 数据处理，而无需配置并启动 ClickHouse 服务器。

## 安装 clickhouse-local \{#installing-clickhouse-local\}

你需要一台用于运行 `clickhouse-local` 的主机，该主机必须能够通过网络同时访问你当前的源数据库系统以及目标 ClickHouse Cloud 服务。

在该主机上，根据操作系统下载适用于你电脑的 `clickhouse-local` 对应版本：

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. 在本机下载 `clickhouse-local` 的最简单方式是运行以下命令：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. 运行 `clickhouse-local`（它只会打印其版本信息）：
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. 在本机下载 `clickhouse-local` 的最简单方式是运行以下命令：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. 运行 `clickhouse-local`（它只会打印其版本信息）：
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info 重要
本指南中的示例使用的是在 Linux 上运行 `clickhouse-local` 的命令（`./clickhouse-local`）。
在 Mac 上运行 `clickhouse-local` 时，请使用 `./clickhouse local`。
:::

:::tip 将远程系统添加到 ClickHouse Cloud 服务的 IP 访问列表
为了让 `remoteSecure` 函数能够连接到你的 ClickHouse Cloud 服务，需要在 IP 访问列表中允许该远程系统的 IP 地址。展开本提示下方的 **管理你的 IP 访问列表** 获取更多信息。
:::

<AddARemoteSystem />

## 示例 1：使用 Integration 表引擎从 MySQL 迁移到 ClickHouse Cloud \{#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine\}

我们将使用 [integration 表引擎](/engines/table-engines/integrations/mysql/)（由 [mysql 表函数](/sql-reference/table-functions/mysql/) 动态创建）从源 MySQL 数据库读取数据，并使用 [remoteSecure 表函数](/sql-reference/table-functions/remote/) 将数据写入您在 ClickHouse Cloud 服务中的目标表。

<Image img={ch_local_03} size='lg' alt='迁移自管理的 ClickHouse'  />

### 在目标 ClickHouse Cloud 服务中：\{#on-the-destination-clickhouse-cloud-service\}

#### 创建目标端数据库： \{#create-the-destination-database\}

```sql
  CREATE DATABASE db
  ```

#### 创建一个与 MySQL 表具有相同 schema 的目标表： \{#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table\}

```sql
  CREATE TABLE db.table ...
  ```

:::note
ClickHouse Cloud 目标表与源 MySQL 表的表结构必须保持一致（列名及顺序必须相同，且列的数据类型必须兼容）。
:::

### 在 clickhouse-local 主机上： \{#on-the-clickhouse-local-host-machine\}

#### 使用迁移查询来运行 clickhouse-local： \{#run-clickhouse-local-with-the-migration-query\}

```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
在 `clickhouse-local` 主机本地不会存储任何数据。相反，数据会从源 MySQL 表中读取，然后立即写入 ClickHouse Cloud 服务上的目标表。
:::

## 示例 2：使用 JDBC Bridge 将 MySQL 迁移到 ClickHouse Cloud \{#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge\}

我们将使用 [JDBC 集成表引擎](/engines/table-engines/integrations/jdbc.md)（由 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 动态创建），配合 [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) 和 MySQL JDBC 驱动，从源 MySQL 数据库中读取数据，并使用 [remoteSecure 表函数](/sql-reference/table-functions/remote.md)
将数据写入 ClickHouse Cloud 服务中的目标表。

<Image img={ch_local_04} size='lg' alt='迁移自管理 ClickHouse'  />

### 在目标 ClickHouse Cloud 服务中： \{#on-the-destination-clickhouse-cloud-service-1\}

#### 创建目标数据库： \{#create-the-destination-database-1\}

```sql
  CREATE DATABASE db
  ```
