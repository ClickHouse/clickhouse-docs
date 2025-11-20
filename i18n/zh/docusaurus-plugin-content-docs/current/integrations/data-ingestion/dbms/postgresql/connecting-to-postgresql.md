---
slug: /integrations/postgresql/connecting-to-postgresql
title: '连接 PostgreSQL'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: '介绍将 PostgreSQL 与 ClickHouse 进行连接的多种方式的页面'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 将 ClickHouse 连接到 PostgreSQL

本页介绍以下将 PostgreSQL 与 ClickHouse 集成的方式：

- 使用 `PostgreSQL` 表引擎，从 PostgreSQL 表中读取数据
- 使用实验性的 `MaterializedPostgreSQL` 数据库引擎，在 PostgreSQL 和 ClickHouse 之间同步数据库

:::tip
我们推荐使用 [ClickPipes](/integrations/clickpipes/postgres)，这是一项由 PeerDB 提供支持的 ClickHouse Cloud 托管集成服务。
或者，可以使用 [PeerDB](https://github.com/PeerDB-io/peerdb)，这是专为将 PostgreSQL 数据库的变更数据复制到自托管 ClickHouse 和 ClickHouse Cloud 而设计的开源 CDC 工具。
:::



## 使用 PostgreSQL 表引擎 {#using-the-postgresql-table-engine}

`PostgreSQL` 表引擎允许从 ClickHouse 对存储在远程 PostgreSQL 服务器上的数据执行 **SELECT** 和 **INSERT** 操作。
本文将演示使用单表进行集成的基本方法。

### 1. 设置 PostgreSQL {#1-setting-up-postgresql}

1.  在 `postgresql.conf` 中添加以下条目,使 PostgreSQL 监听网络接口:

```text
listen_addresses = '*'
```

2. 创建一个用户以便从 ClickHouse 连接。出于演示目的,本示例授予完整的超级用户权限。

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

3. 在 PostgreSQL 中创建一个新数据库:

```sql
CREATE DATABASE db_in_psg;
```

4. 创建一个新表:

```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

5. 添加几行数据用于测试:

```sql
INSERT INTO table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def');
```

6. 要配置 PostgreSQL 以允许新用户连接到新数据库进行复制,请在 `pg_hba.conf` 文件中添加以下条目。使用您的 PostgreSQL 服务器的子网或 IP 地址更新地址行:

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_in_psg             clickhouse_user 192.168.1.0/24          password
```

7. 重新加载 `pg_hba.conf` 配置(根据您的版本调整此命令):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

8. 验证新的 `clickhouse_user` 可以登录:

```text
psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
```

:::note
如果您在 ClickHouse Cloud 中使用此功能,可能需要允许 ClickHouse Cloud IP 地址访问您的 PostgreSQL 实例。
请查看 ClickHouse [Cloud Endpoints API](/cloud/get-started/query-endpoints) 了解出站流量详情。
:::

### 2. 在 ClickHouse 中定义表 {#2-define-a-table-in-clickhouse}

1. 登录到 `clickhouse-client`:

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 创建一个新数据库:

```sql
CREATE DATABASE db_in_ch;
```

3. 创建一个使用 `PostgreSQL` 引擎的表:

```sql
CREATE TABLE db_in_ch.table1
(
    id UInt64,
    column1 String
)
ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
```

所需的最少参数为:

| 参数 | 描述                     | 示例                       |
| --------- | ------------------------------- | ----------------------------- |
| host:port | 主机名或 IP 和端口         | postgres-host.domain.com:5432 |
| database  | PostgreSQL 数据库名称        | db_in_psg                     |
| user      | 连接到 PostgreSQL 的用户名 | clickhouse_user               |
| password  | 连接到 PostgreSQL 的密码 | ClickHouse_123                |

:::note
查看 [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql) 文档页面以获取完整的参数列表。
:::

### 3. 测试集成 {#3-test-the-integration}

1. 在 ClickHouse 中查看初始行:

```sql
SELECT * FROM db_in_ch.table1
```

ClickHouse 表应该自动填充 PostgreSQL 表中已存在的两行数据:

```response
Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```

2. 返回 PostgreSQL,向表中添加几行数据:

```sql
INSERT INTO table1
  (id, column1)
VALUES
  (3, 'ghi'),
  (4, 'jkl');
```

4. 这两行新数据应该出现在您的 ClickHouse 表中:

```sql
SELECT * FROM db_in_ch.table1
```


响应应为：

```response
Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

5. 接下来看看向 ClickHouse 表中添加行时会发生什么：

```sql
INSERT INTO db_in_ch.table1
  (id, column1)
VALUES
  (5, 'mno'),
  (6, 'pqr');
```

6. 在 ClickHouse 中新增的行应当出现在 PostgreSQL 的表中：

```sql
db_in_psg=# SELECT * FROM table1;
id | column1
----+---------
  1 | abc
  2 | def
  3 | ghi
  4 | jkl
  5 | mno
  6 | pqr
(6 rows)
```

本示例演示了如何使用 `PostrgeSQL` 表引擎在 PostgreSQL 与 ClickHouse 之间进行基础集成。
请查阅 [PostgreSQL 表引擎文档页面](/engines/table-engines/integrations/postgresql)，了解更多功能，例如指定 schema、仅返回部分列以及连接到多个副本。另请参阅博客：[ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)。


## 使用 MaterializedPostgreSQL 数据库引擎 {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQL 数据库引擎利用 PostgreSQL 的复制功能来创建数据库副本,可以包含全部或部分架构和表。
本文将演示使用单个数据库、单个架构和单张表进行集成的基本方法。

**_以下步骤中将使用 PostgreSQL CLI (psql) 和 ClickHouse CLI (clickhouse-client)。PostgreSQL 服务器安装在 Linux 上。如果 PostgreSQL 数据库是全新的测试安装,以下为最低配置要求_**

### 1. 在 PostgreSQL 中 {#1-in-postgresql}

1.  在 `postgresql.conf` 中,设置最低监听级别、复制 WAL 级别和复制槽:

添加以下配置项:

```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```

_\*ClickHouse 至少需要 `logical` WAL 级别和至少 `2` 个复制槽_

2. 使用管理员账户创建用于 ClickHouse 连接的用户:

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

_\*为演示目的,此处授予了完整的超级用户权限。_

3. 创建新数据库:

```sql
CREATE DATABASE db1;
```

4. 在 `psql` 中连接到新数据库:

```text
\connect db1
```

5. 创建新表:

```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

6. 插入初始数据:

```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. 配置 PostgreSQL 允许新用户连接到新数据库以进行复制。以下是需要添加到 `pg_hba.conf` 文件的最低配置项:


```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```

_\*出于演示目的,此处使用明文密码身份验证方法。请根据 PostgreSQL 文档使用子网或服务器地址更新地址行_

8. 重新加载 `pg_hba.conf` 配置,使用类似以下命令(根据您的版本进行调整):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 使用新的 `clickhouse_user` 测试登录:

```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. 在 ClickHouse 中 {#2-in-clickhouse}

1. 登录到 ClickHouse CLI

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 为数据库引擎启用 PostgreSQL 实验性功能:

```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. 创建要复制的新数据库并定义初始表:

```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```

最小选项:

| 参数      | 描述                               | 示例                                           |
| --------- | ---------------------------------- | ---------------------------------------------- |
| host:port | 主机名或 IP 地址和端口             | postgres-host.domain.com:5432                  |
| database  | PostgreSQL 数据库名称              | db1                                            |
| user      | 连接 PostgreSQL 的用户名           | clickhouse_user                                |
| password  | 连接 PostgreSQL 的密码             | ClickHouse_123                                 |
| settings  | 引擎的附加设置                     | materialized_postgresql_tables_list = 'table1' |

:::info
有关 PostgreSQL 数据库引擎的完整指南,请参阅 https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings
:::

4. 验证初始表中是否有数据:

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: df2381ac-4e30-4535-b22e-8be3894aaafc

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 3. 测试基本复制 {#3-test-basic-replication}

1. 在 PostgreSQL 中添加新行:

```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. 在 ClickHouse 中验证新行是否可见:

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: b0729816-3917-44d3-8d1a-fed912fb59ce

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  4 │ jkl     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 4. 总结 {#4-summary}

本集成指南重点介绍了如何复制包含表的数据库的简单示例,但还有更高级的选项,包括复制整个数据库或向现有复制添加新表和模式。虽然此复制不支持 DDL 命令,但可以配置引擎以检测变更并在发生结构变更时重新加载表。

:::info
有关高级选项的更多可用功能,请参阅[参考文档](/engines/database-engines/materialized-postgresql)。
:::
