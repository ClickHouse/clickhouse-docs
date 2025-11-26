---
sidebar_label: '使用 clickhouse-local'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: '使用 clickhouse-local 迁移到 ClickHouse'
description: '介绍如何使用 clickhouse-local 迁移到 ClickHouse 的指南'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';


# 使用 clickhouse-local 迁移到 ClickHouse

<Image img={ch_local_01} size='sm' alt='迁移自管 ClickHouse' background='white' />

你可以使用 ClickHouse，更具体地说是 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)，
作为 ETL 工具，将数据从当前的数据库系统迁移到 ClickHouse Cloud。前提是你的当前数据库系统要么有
ClickHouse 提供的 [integration engine](/engines/table-engines/#integration-engines) 或 [table function](/sql-reference/table-functions/)，
要么有厂商提供的 JDBC 驱动或 ODBC 驱动可用。

我们有时将这种迁移方法称为“pivot 方式”，因为它利用一个中间跳点（pivot）将数据从源数据库迁移到目标数据库。例如，如果出于安全要求，在私有或内部网络中只允许向外的出站连接，则可能需要使用 clickhouse-local 从源数据库拉取数据，然后再将数据推送到目标 ClickHouse 数据库，此时 clickhouse-local 就充当了这个中间跳点。

ClickHouse 为 [MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb) 和 [SQLite](/engines/table-engines/integrations/sqlite) 提供了 integration engine 和 table function（可按需动态创建 integration engine）。
对于所有其他常见的数据库系统，系统厂商通常会提供可用的 JDBC 驱动或 ODBC 驱动。



## 什么是 clickhouse-local？ {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='迁移自管型 ClickHouse' background='white' />

通常，ClickHouse 以集群形式运行，即在不同服务器上以分布式方式运行多个 ClickHouse 数据库引擎实例。

在单台服务器上，ClickHouse 数据库引擎作为 `clickhouse-server` 程序的一部分运行。数据库访问（路径、用户、安全性等）通过服务器配置文件进行配置。

`clickhouse-local` 工具允许你在命令行中以独立工具的形式、在隔离环境中使用 ClickHouse 数据库引擎，对多种输入和输出执行极速 SQL 数据处理，而无需配置和启动 ClickHouse 服务器。



## 安装 clickhouse-local {#installing-clickhouse-local}

你需要一台用于运行 `clickhouse-local` 的主机，这台主机必须能够通过网络同时访问你当前的源数据库系统以及目标 ClickHouse Cloud 服务。

在该主机上，根据操作系统下载相应构建版本的 `clickhouse-local`：

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. 本地下载 `clickhouse-local` 的最简单方法是运行以下命令：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. 运行 `clickhouse-local`（它只会打印其版本信息）：
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. 本地下载 `clickhouse-local` 的最简单方法是运行以下命令：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. 运行 `clickhouse-local`（它只会打印其版本信息）：
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info Important
本指南中的示例使用的是在 Linux 上运行 `clickhouse-local` 的命令（`./clickhouse-local`）。
要在 Mac 上运行 `clickhouse-local`，请使用 `./clickhouse local`。
:::

:::tip 将远程系统添加到 ClickHouse Cloud 服务的 IP 访问列表中
为了使 `remoteSecure` 函数能够连接到你的 ClickHouse Cloud 服务，需要在 IP 访问列表中允许该远程系统的 IP 地址。要了解更多信息，请展开此提示下方的 **Manage your IP Access List**。
:::

  <AddARemoteSystem />



## 示例 1：使用集成引擎从 MySQL 迁移到 ClickHouse Cloud

我们将使用 [integration 表引擎](/engines/table-engines/integrations/mysql/)（由 [mysql 表函数](/sql-reference/table-functions/mysql/) 动态创建）从源 MySQL 数据库读取数据，并使用 [remoteSecure 表函数](/sql-reference/table-functions/remote/) 将数据写入您在 ClickHouse Cloud 服务上的目标表中。

<Image img={ch_local_03} size="sm" alt="迁移自托管 ClickHouse" background="white" />

### 在目标 ClickHouse Cloud 服务上：

#### 创建目标数据库：

```sql
CREATE DATABASE db
```

#### 创建一个目标表，使其表结构与 MySQL 表相同：

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse Cloud 目标表的表结构必须与源 MySQL 表的表结构保持一致（列名和列顺序必须相同，且列的数据类型必须兼容）。
:::

### 在运行 clickhouse-local 的主机上：

#### 使用迁移查询语句运行 clickhouse-local：

```sql
./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
`clickhouse-local` 主机上不会本地存储任何数据。相反，数据会从源 MySQL 表中读取，
并立即写入 ClickHouse Cloud 服务中的目标表。
:::


## 示例 2：使用 JDBC bridge 将 MySQL 迁移到 ClickHouse Cloud

我们将使用 [JDBC 集成表引擎](/engines/table-engines/integrations/jdbc.md)（由 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 动态创建），配合 [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) 和 MySQL JDBC 驱动，从源 MySQL 数据库读取数据，并使用 [remoteSecure 表函数](/sql-reference/table-functions/remote.md)
将数据写入 ClickHouse Cloud 服务中的目标表。

<Image img={ch_local_04} size="sm" alt="迁移自托管 ClickHouse" background="white" />

### 在目标 ClickHouse Cloud 服务上：

#### 创建目标数据库：

```sql
CREATE DATABASE db
```
