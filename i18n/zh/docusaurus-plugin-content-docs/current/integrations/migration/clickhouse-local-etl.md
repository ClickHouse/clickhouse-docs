---
'sidebar_label': '使用 clickhouse-local'
'sidebar_position': 20
'keywords':
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'clickhouse-local'
- 'clickhouse-client'
'slug': '/cloud/migration/clickhouse-local'
'title': '使用 clickhouse-local 迁移到 ClickHouse'
'description': '演示如何使用 clickhouse-local 迁移到 ClickHouse'
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

<Image img={ch_local_01} size='sm' alt='迁移自管理的 ClickHouse' background='white' />

您可以使用 ClickHouse，或更具体地说，[`clickhouse-local`](/operations/utilities/clickhouse-local.md) 作为 ETL 工具，将数据从您当前的数据库系统迁移到 ClickHouse Cloud，只要您的当前数据库系统有 ClickHouse 提供的 [集成引擎](/engines/table-engines/#integration-engines) 或 [表函数](/sql-reference/table-functions/)，或者有供应商提供的 JDBC 驱动程序或 ODBC 驱动程序可用。

我们有时将这种迁移方法称为“枢轴”方法，因为它使用中间枢轴点或跳跃将数据从源数据库移动到目标数据库。例如，如果由于安全要求，仅允许从私有或内部网络进行出站连接，则可能需要此方法，因此您需要使用 clickhouse-local 从源数据库中提取数据，然后将数据推送到目标 ClickHouse 数据库，clickhouse-local 充当枢轴点。

ClickHouse 提供了集成引擎和表函数（动态创建集成引擎）用于 [MySQL](/engines/table-engines/integrations/mysql/)，[PostgreSQL](/engines/table-engines/integrations/postgresql)，[MongoDB](/engines/table-engines/integrations/mongodb) 和 [SQLite](/engines/table-engines/integrations/sqlite)。对于所有其他流行的数据库系统，供应商都有 JDBC 驱动程序或 ODBC 驱动程序可用。

## 什么是 clickhouse-local? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='迁移自管理的 ClickHouse' background='white' />

通常，ClickHouse 以集群的形式运行，其中多个 ClickHouse 数据库引擎实例在不同的服务器上以分布式方式运行。

在单个服务器上，ClickHouse 数据库引擎作为 `clickhouse-server` 程序的一部分运行。数据库访问（路径、用户、安全性等）通过服务器配置文件进行配置。

`clickhouse-local` 工具允许您以命令行实用程序的方式隔离使用 ClickHouse 数据库引擎，进行快速的 SQL 数据处理，适用于大量输入和输出，而无需配置和启动 ClickHouse 服务器。

## 安装 clickhouse-local {#installing-clickhouse-local}

您需要一台具有对当前源数据库系统和 ClickHouse Cloud 目标服务的网络访问的 `clickhouse-local` 主机。

在该主机上，下载适合您计算机操作系统的 `clickhouse-local` 版本：

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. 下载 `clickhouse-local` 的最简单方法是运行以下命令：
```bash
  curl https://clickhouse.com/ | sh
```

1. 运行 `clickhouse-local`（它会打印出其版本）：
```bash
  ./clickhouse-local
```

</TabItem>
<TabItem value="mac" label="macOS">

1. 下载 `clickhouse-local` 的最简单方法是运行以下命令：
```bash
  curl https://clickhouse.com/ | sh
```

1. 运行 `clickhouse-local`（它会打印出其版本）：
```bash
  ./clickhouse local
```

</TabItem>
</Tabs>

:::info 重要
本指南中的示例使用 Linux 命令运行 `clickhouse-local`（`./clickhouse-local`）。
要在 Mac 上运行 `clickhouse-local`，请使用 `./clickhouse local`。
:::


:::tip 将远程系统添加到您的 ClickHouse Cloud 服务 IP 访问列表
为了让 `remoteSecure` 函数能够连接到您的 ClickHouse Cloud 服务，远程系统的 IP 地址需要在 IP 访问列表中被允许。有关更多信息，请展开此提示下的**管理您的 IP 访问列表**。
:::

<AddARemoteSystem />

## 示例 1：使用集成引擎从 MySQL 迁移到 ClickHouse Cloud {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

我们将使用 [集成表引擎](/engines/table-engines/integrations/mysql/)（由 [mysql 表函数](/sql-reference/table-functions/mysql/) 动态创建）从源 MySQL 数据库读取数据，我们将使用 [remoteSecure 表函数](/sql-reference/table-functions/remote/) 将数据写入您在 ClickHouse Cloud 服务上的目标表。

<Image img={ch_local_03} size='sm' alt='迁移自管理的 ClickHouse' background='white' />

### 在目标 ClickHouse Cloud 服务上: {#on-the-destination-clickhouse-cloud-service}

#### 创建目标数据库: {#create-the-destination-database}

```sql
  CREATE DATABASE db
```

#### 创建一个目标表，其架构与 MySQL 表等效: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
  CREATE TABLE db.table ...
```

:::note
ClickHouse Cloud 目标表的架构与源 MySQL 表的架构必须对齐（列名称和顺序必须相同，且列数据类型必须兼容）。
:::

### 在 clickhouse-local 主机上: {#on-the-clickhouse-local-host-machine}

#### 使用迁移查询运行 clickhouse-local: {#run-clickhouse-local-with-the-migration-query}

```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
在 `clickhouse-local` 主机上不会存储任何数据。相反，数据将从源 MySQL 表中读取，
然后立即写入到 ClickHouse Cloud 服务上的目标表。
:::


## 示例 2：使用 JDBC 桥从 MySQL 迁移到 ClickHouse Cloud {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

我们将使用 [JDBC 集成表引擎](/engines/table-engines/integrations/jdbc.md)（由 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 动态创建），结合 [ClickHouse JDBC 桥](https://github.com/ClickHouse/clickhouse-jdbc-bridge) 和 MySQL JDBC 驱动程序，从源 MySQL 数据库读取数据，我们将使用 [remoteSecure 表函数](/sql-reference/table-functions/remote.md)
将数据写入您在 ClickHouse Cloud 服务上的目标表。

<Image img={ch_local_04} size='sm' alt='迁移自管理的 ClickHouse' background='white' />

### 在目标 ClickHouse Cloud 服务上: {#on-the-destination-clickhouse-cloud-service-1}

#### 创建目标数据库: {#create-the-destination-database-1}
```sql
  CREATE DATABASE db
```
