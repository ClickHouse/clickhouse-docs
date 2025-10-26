---
'sidebar_label': '使用 clickhouse-local'
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
'title': '迁移到 ClickHouse 使用 clickhouse-local'
'description': '指南展示如何使用 clickhouse-local 迁移到 ClickHouse'
'doc_type': 'guide'
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


# 使用 clickhouse-local 迁移到 ClickHouse

<Image img={ch_local_01} size='sm' alt='迁移自管理的 ClickHouse' background='white' />

您可以使用 ClickHouse，更具体地说是 [`clickhouse-local`](/operations/utilities/clickhouse-local.md) 作为 ETL 工具，将数据从您当前的数据库系统迁移到 ClickHouse Cloud，只要您的当前数据库系统有 ClickHouse 提供的 [集成引擎](/engines/table-engines/#integration-engines) 或 [表函数](/sql-reference/table-functions/)，或者有供应商提供的 JDBC 驱动程序或 ODBC 驱动程序可用。

我们有时将这种迁移方法称为“支点”方法，因为它使用一个中间支点或跳跃，将数据从源数据库迁移到目标数据库。例如，如果由于安全要求，仅允许从私有或内部网络进行外部连接，则可能需要这种方法，因此您需要使用 clickhouse-local 从源数据库拉取数据，然后将数据推送到目标 ClickHouse 数据库，而 clickhouse-local 充当支点。

ClickHouse 为 [MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb) 和 [SQLite](/engines/table-engines/integrations/sqlite) 提供集成引擎和表函数（动态创建集成引擎）。对于所有其他流行的数据库系统，供应商提供了 JDBC 驱动程序或 ODBC 驱动程序。

## 什么是 clickhouse-local? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='迁移自管理的 ClickHouse' background='white' />

通常，ClickHouse 以集群的形式运行，其中多个 ClickHouse 数据库引擎的实例在不同的服务器上分布式运行。

在单台服务器上，ClickHouse 数据库引擎作为 `clickhouse-server` 程序的一部分运行。数据库访问（路径、用户、安全性等）通过服务器配置文件进行配置。

`clickhouse-local` 工具使您能够以命令行实用程序的方式，隔离使用 ClickHouse 数据库引擎，进行快速 SQL 数据处理，而无需配置和启动 ClickHouse 服务器。

## 安装 clickhouse-local {#installing-clickhouse-local}

您需要一个用于 `clickhouse-local` 的主机，该主机可以访问当前的源数据库系统和您的 ClickHouse Cloud 目标服务。

在该主机上，下载适合您的计算机操作系统的 `clickhouse-local` 的适当版本：

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. 下载 `clickhouse-local` 的最简单方法是运行以下命令：
```bash
curl https://clickhouse.com/ | sh
```

1. 运行 `clickhouse-local`（它将仅打印其版本）：
```bash
./clickhouse-local
```

</TabItem>
<TabItem value="mac" label="macOS">

1. 下载 `clickhouse-local` 的最简单方法是运行以下命令：
```bash
curl https://clickhouse.com/ | sh
```

1. 运行 `clickhouse-local`（它将仅打印其版本）：
```bash
./clickhouse local
```

</TabItem>
</Tabs>

:::info 重要
本指南中的示例使用 Linux 命令运行 `clickhouse-local` （`./clickhouse-local`）。
要在 Mac 上运行 `clickhouse-local`，请使用 `./clickhouse local`。
:::

:::tip 将远程系统添加到您的 ClickHouse Cloud 服务 IP 访问列表
为了使 `remoteSecure` 函数能够连接到您的 ClickHouse Cloud 服务，远程系统的 IP 地址必须被 IP 访问列表允许。有关更多信息，请展开此提示下的 **管理您的 IP 访问列表**。
:::

<AddARemoteSystem />

## 示例 1: 使用集成引擎将 MySQL 迁移到 ClickHouse Cloud {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

我们将使用 [集成表引擎](/engines/table-engines/integrations/mysql/) （通过 [mysql 表函数](/sql-reference/table-functions/mysql/) 动态创建）从源 MySQL 数据库读取数据，并将使用 [remoteSecure 表函数](/sql-reference/table-functions/remote/) 将数据写入 ClickHouse cloud 服务的目标表中。

<Image img={ch_local_03} size='sm' alt='迁移自管理的 ClickHouse' background='white' />

### 在目标 ClickHouse Cloud 服务上: {#on-the-destination-clickhouse-cloud-service}

#### 创建目标数据库: {#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### 创建一个与 MySQL 表模式相等的目标表: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse Cloud 的目标表模式与源 MySQL 表的模式必须对齐（列名和顺序必须相同，列数据类型必须兼容）。
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
在 `clickhouse-local` 主机上没有存储任何数据。相反，数据是从源 MySQL 表读取的，然后立即写入 ClickHouse Cloud 服务上的目标表。
:::

## 示例 2: 使用 JDBC 桥将 MySQL 迁移到 ClickHouse Cloud {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

我们将使用 [JDBC 集成表引擎](/engines/table-engines/integrations/jdbc.md) （通过 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 动态创建），结合 [ClickHouse JDBC 桥](https://github.com/ClickHouse/clickhouse-jdbc-bridge) 和 MySQL JDBC 驱动程序，从源 MySQL 数据库读取数据，并将使用 [remoteSecure 表函数](/sql-reference/table-functions/remote.md) 将数据写入 ClickHouse cloud 服务的目标表中。

<Image img={ch_local_04} size='sm' alt='迁移自管理的 ClickHouse' background='white' />

### 在目标 ClickHouse Cloud 服务上: {#on-the-destination-clickhouse-cloud-service-1}

#### 创建目标数据库: {#create-the-destination-database-1}
```sql
CREATE DATABASE db
```
