---
slug: /integrations/postgresql/connecting-to-postgresql
title: '连接 PostgreSQL'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: '本文介绍将 PostgreSQL 连接到 ClickHouse 的多种方法。'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# 将 ClickHouse 连接到 PostgreSQL \\{#connecting-clickhouse-to-postgresql\\}

本页介绍以下几种将 PostgreSQL 与 ClickHouse 集成的方式：

* 使用 `PostgreSQL` 表引擎，从 PostgreSQL 表中读取数据
* 使用试验性的 `MaterializedPostgreSQL` 数据库引擎，将 PostgreSQL 中的数据库与 ClickHouse 中的数据库进行同步

:::tip
我们推荐使用由 PeerDB 提供支持的 [ClickPipes](/integrations/clickpipes/postgres)，这是一项 ClickHouse Cloud 的托管集成服务。
或者，你也可以使用 [PeerDB](https://github.com/PeerDB-io/peerdb)，它是一个专门为将 PostgreSQL 数据库复制到自托管 ClickHouse 和 ClickHouse Cloud 而设计的开源 CDC 工具。
:::

## 使用 PostgreSQL 表引擎 \\{#using-the-postgresql-table-engine\\}

`PostgreSQL` 表引擎允许 ClickHouse 对存储在远程 PostgreSQL 服务器上的数据执行 **SELECT** 和 **INSERT** 操作。
本文将通过单个表来演示基本的集成方法。

### 1. 设置 PostgreSQL \\{#1-setting-up-postgresql\\}

1. 在 `postgresql.conf` 中添加以下条目，以便让 PostgreSQL 监听网络接口：

```text
  listen_addresses = '*'
  ```

2. 创建一个供 ClickHouse 连接使用的用户。出于演示目的，本示例授予完整的超级用户权限。

```sql
  CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
  ```

3. 在 PostgreSQL 中创建新数据库：

```sql
  CREATE DATABASE db_in_psg;
  ```

4. 创建新表：

```sql
  CREATE TABLE table1 (
      id         integer primary key,
      column1    varchar(10)
  );
  ```

5. 让我们添加几行测试数据：

```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def');
  ```

6. 要配置 PostgreSQL 以允许使用新用户连接到新数据库进行复制，请在 `pg_hba.conf` 文件中添加以下条目。将其中的地址行更新为 PostgreSQL 服务器所在的子网或 IP 地址：

```text
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
  ```

7. 重新加载 `pg_hba.conf` 配置（根据您的版本调整此命令）：

```text
  /usr/pgsql-12/bin/pg_ctl reload
  ```

8. 验证新的 `clickhouse_user` 是否能登录：

```text
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
  ```

:::note
如果您在 ClickHouse Cloud 中使用此功能，可能需要将 ClickHouse Cloud 的 IP 地址加入允许列表，以便访问您的 PostgreSQL 实例。
有关出站流量的详细信息，请查看 ClickHouse 的 [Cloud Endpoints API](/cloud/get-started/query-endpoints)。
:::

### 2. 在 ClickHouse 中定义一张表 \\{#2-define-a-table-in-clickhouse\\}

1. 登录 `clickhouse-client`：

```bash
  clickhouse-client --user default --password ClickHouse123!
  ```

2. 创建一个新数据库：

```sql
  CREATE DATABASE db_in_ch;
  ```

3. 创建一个使用 `PostgreSQL` 的表：

```sql
  CREATE TABLE db_in_ch.table1
  (
      id UInt64,
      column1 String
  )
  ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
  ```

至少需要以下参数：

| parameter | Description          | example                       |
| --------- | -------------------- | ----------------------------- |
| host:port | 主机名或 IP 和端口          | postgres-host.domain.com:5432 |
| database  | PostgreSQL 数据库名称     | db&#95;in&#95;psg             |
| user      | 用于连接 PostgreSQL 的用户名 | clickhouse&#95;user           |
| password  | 用于连接 PostgreSQL 的密码  | ClickHouse&#95;123            |

:::note
查看 [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql) 文档页面以获取完整的参数列表。
:::

### 3 测试集成 \\{#3-test-the-integration\\}

1. 在 ClickHouse 中查看初始数据行：

```sql
  SELECT * FROM db_in_ch.table1
  ```

ClickHouse 表会自动填充上此前在 PostgreSQL 表中已存在的两行记录：

```response
  Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  └────┴─────────┘
  ```

2. 回到 PostgreSQL，向表中再添加几行记录：

```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (3, 'ghi'),
    (4, 'jkl');
  ```

4. 这两条新记录现在应该已经出现在您的 ClickHouse 表中：

```sql
  SELECT * FROM db_in_ch.table1
  ```

响应应如下：

```response
  Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘
  ```

5. 我们来看看向 ClickHouse 表中插入数据时会发生什么：

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

本示例演示了使用 `PostrgeSQL` 表引擎在 PostgreSQL 和 ClickHouse 之间进行基础集成。

请参阅 [PostgreSQL 表引擎的文档页面](/engines/table-engines/integrations/postgresql)，了解更多功能，例如指定 schema、仅返回部分列以及连接到多个副本。另请参阅博客文章：[ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)。

## 使用 MaterializedPostgreSQL 数据库引擎 \\{#using-the-materializedpostgresql-database-engine\\}

<CloudNotSupportedBadge />

<ExperimentalBadge />

PostgreSQL 数据库引擎利用 PostgreSQL 的复制功能来创建该数据库的副本，副本中可以包含全部或部分 schema 和表。
本文通过一个数据库、一个 schema 和一张表来演示基本的集成方法。

***在以下步骤中，将使用 PostgreSQL 命令行客户端 (`psql`) 和 ClickHouse 命令行客户端 (`clickhouse-client`)。PostgreSQL 服务器安装在 Linux 上。下面给出的配置是针对全新测试安装的 PostgreSQL 数据库的最小配置。***

### 1. 在 PostgreSQL 中 \\{#1-in-postgresql\\}

1. 在 `postgresql.conf` 中，设置基本的监听参数、WAL 复制级别以及复制槽：

添加如下条目：

```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```

**ClickHouse 至少需要 `logical` 的 wal 级别，并且至少需要 `2` 个复制槽**

2. 使用管理员账户创建一个供 ClickHouse 连接使用的用户：

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

**出于演示目的，已授予完整的超级用户权限。*

3. 创建新数据库：

```sql
CREATE DATABASE db1;
```

4. 在 `psql` 中连接到新数据库：

```text
\connect db1
```

5. 创建新表：

```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

6. 添加初始数据行：

```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. 配置 PostgreSQL，允许使用新用户连接到新数据库以进行复制。下面是在 `pg_hba.conf` 文件中需要添加的最小必要条目：

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```

**出于演示目的，此处使用明文密码身份验证方式。请按照 PostgreSQL 文档，将地址行更新为相应的子网或服务器地址*

8. 使用类似下面的命令重新加载 `pg_hba.conf` 配置（根据你的版本进行调整）：

```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 使用新的 `clickhouse_user` 账户测试登录：

```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. 在 ClickHouse 中 \\{#2-in-clickhouse\\}

1. 登录到 ClickHouse CLI

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 为数据库引擎启用 PostgreSQL 实验性功能：

```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. 创建将要复制的新数据库并定义初始表：

```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```

最小必需选项：

| parameter | Description         | example                                                            |
| --------- | ------------------- | ------------------------------------------------------------------ |
| host:port | 主机名或 IP 和端口         | postgres-host.domain.com:5432                                      |
| database  | PostgreSQL 数据库名称    | db1                                                                |
| user      | 连接到 PostgreSQL 的用户名 | clickhouse&#95;user                                                |
| password  | 连接到 PostgreSQL 的密码  | ClickHouse&#95;123                                                 |
| settings  | 引擎的额外设置             | materialized&#95;postgresql&#95;tables&#95;list = &#39;table1&#39; |

:::info
有关 PostgreSQL 数据库引擎的完整指南，请参阅 [https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings](https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings)
:::

4. 验证初始表中是否有数据：

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

### 3. 测试基本复制 \\{#2-in-clickhouse\\}

1. 在 PostgreSQL 中添加新行：

```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. 在 ClickHouse 中确认新增的行是否可见：

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

### 4. 总结 \\{#3-test-basic-replication\\}

本集成指南重点通过一个简单示例说明如何复制一个包含单个表的数据库，不过也有更高级的选项，例如复制整个数据库，或在现有复制基础上新增表和模式（schema）。虽然此复制方式不支持 DDL 命令，但可以将引擎配置为在发生结构性变更时检测更改并重新加载表。

:::info
有关高级选项可用的更多功能，请参阅[参考文档](/engines/database-engines/materialized-postgresql)。
:::
