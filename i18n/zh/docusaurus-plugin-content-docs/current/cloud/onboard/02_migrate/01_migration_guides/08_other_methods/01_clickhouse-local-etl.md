---
sidebar_label: '使用 clickhouse-local'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: '使用 clickhouse-local 迁移到 ClickHouse'
description: '使用 clickhouse-local 迁移到 ClickHouse 的指南'
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

<Image img={ch_local_01} size='sm' alt='迁移自管 ClickHouse 实例' background='white' />

你可以使用 ClickHouse，更具体地说是 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)，
作为 ETL 工具，将数据从当前的数据库系统迁移到 ClickHouse Cloud，只要你的当前数据库系统要么有 ClickHouse 提供的 [集成引擎（integration engine）](/engines/table-engines/#integration-engines) 或 [表函数（table function）](/sql-reference/table-functions/)，
要么有厂商提供的 JDBC 驱动或 ODBC 驱动可用即可。

我们有时将这种迁移方法称为“pivot”方法，因为它通过一个中间 pivot 点（跳板）来把数据从源数据库迁移到目标数据库。比如，如果出于安全要求，在私有或内部网络中只允许向外的出站连接，那么你可能必须使用 clickhouse-local 从源数据库拉取数据，然后再将数据推送到目标 ClickHouse 数据库，此时 clickhouse-local 就充当了这个 pivot 点。

ClickHouse 为 [MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb) 和 [SQLite](/engines/table-engines/integrations/sqlite) 提供了集成引擎和表函数（可按需动态创建集成引擎）。
对于所有其他主流数据库系统，系统厂商通常都会提供可用的 JDBC 或 ODBC 驱动。



## 什么是 clickhouse-local？ {#what-is-clickhouse-local}

<Image
  img={ch_local_02}
  size='lg'
  alt='迁移自管理的 ClickHouse'
  background='white'
/>

通常，ClickHouse 以集群形式运行，即多个 ClickHouse 数据库引擎实例以分布式方式在不同服务器上运行。

在单服务器环境中，ClickHouse 数据库引擎作为 `clickhouse-server` 程序的一部分运行。数据库访问控制（路径、用户、安全性等）通过服务器配置文件进行配置。

`clickhouse-local` 工具允许您以独立的命令行工具方式使用 ClickHouse 数据库引擎，对大量输入和输出数据进行高速 SQL 处理，无需配置和启动 ClickHouse 服务器。


## 安装 clickhouse-local {#installing-clickhouse-local}

您需要一台主机来运行 `clickhouse-local`,该主机需要能够通过网络访问您当前的源数据库系统和 ClickHouse Cloud 目标服务。

在该主机上,根据您计算机的操作系统下载相应的 `clickhouse-local` 构建版本:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. 在本地下载 `clickhouse-local` 最简单的方法是运行以下命令:

```bash
curl https://clickhouse.com/ | sh
```

1. 运行 `clickhouse-local`(它将仅打印其版本):

```bash
./clickhouse-local
```

</TabItem>
<TabItem value="mac" label="macOS">

1. 在本地下载 `clickhouse-local` 最简单的方法是运行以下命令:

```bash
curl https://clickhouse.com/ | sh
```

1. 运行 `clickhouse-local`(它将仅打印其版本):

```bash
./clickhouse local
```

</TabItem>
</Tabs>

:::info 重要提示
本指南中的示例使用 Linux 命令来运行 `clickhouse-local`(`./clickhouse-local`)。
要在 Mac 上运行 `clickhouse-local`,请使用 `./clickhouse local`。
:::

:::tip 将远程系统添加到您的 ClickHouse Cloud 服务 IP 访问列表
为了让 `remoteSecure` 函数能够连接到您的 ClickHouse Cloud 服务,远程系统的 IP 地址需要在 IP 访问列表中被允许。展开此提示下方的**管理您的 IP 访问列表**以获取更多信息。
:::

<AddARemoteSystem />


## 示例 1:使用集成引擎从 MySQL 迁移到 ClickHouse Cloud {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

我们将使用[集成表引擎](/engines/table-engines/integrations/mysql/)(由 [mysql 表函数](/sql-reference/table-functions/mysql/)动态创建)从源 MySQL 数据库读取数据,并使用 [remoteSecure 表函数](/sql-reference/table-functions/remote/)将数据写入您的 ClickHouse Cloud 服务上的目标表。

<Image
  img={ch_local_03}
  size='sm'
  alt='迁移自管理 ClickHouse'
  background='white'
/>

### 在目标 ClickHouse Cloud 服务上:{#on-the-destination-clickhouse-cloud-service}

#### 创建目标数据库:{#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### 创建与 MySQL 表结构等效的目标表:{#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse Cloud 目标表的结构和源 MySQL 表的结构必须保持一致(列名和顺序必须相同,列数据类型必须兼容)。
:::

### 在 clickhouse-local 主机上:{#on-the-clickhouse-local-host-machine}

#### 使用迁移查询运行 clickhouse-local:{#run-clickhouse-local-with-the-migration-query}

```sql
./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
`clickhouse-local` 主机上不会本地存储任何数据。数据从源 MySQL 表读取后会立即写入 ClickHouse Cloud 服务上的目标表。
:::


## 示例 2:使用 JDBC 桥接器从 MySQL 迁移到 ClickHouse Cloud {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

我们将使用 [JDBC 集成表引擎](/engines/table-engines/integrations/jdbc.md)(由 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 动态创建)结合 [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) 和 MySQL JDBC 驱动程序从源 MySQL 数据库读取数据,并使用 [remoteSecure 表函数](/sql-reference/table-functions/remote.md)将数据写入您的 ClickHouse Cloud 服务上的目标表。

<Image
  img={ch_local_04}
  size='sm'
  alt='迁移自管理 ClickHouse'
  background='white'
/>

### 在目标 ClickHouse Cloud 服务上:{#on-the-destination-clickhouse-cloud-service-1}

#### 创建目标数据库:{#create-the-destination-database-1}

```sql
CREATE DATABASE db
```
