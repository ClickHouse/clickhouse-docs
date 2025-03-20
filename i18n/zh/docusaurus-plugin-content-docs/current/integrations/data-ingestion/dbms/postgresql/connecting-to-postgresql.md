---
slug: /integrations/postgresql/connecting-to-postgresql
title: 连接到 PostgreSQL
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 将 ClickHouse 连接到 PostgreSQL

本页面涵盖了将 PostgreSQL 与 ClickHouse 集成的以下选项：

- 使用 [ClickPipes](/integrations/clickpipes/postgres)，为 ClickHouse Cloud 提供的自管理集成服务 - 目前处于私有预览阶段。请 [在此注册](https://clickpipes.peerdb.io/)
- 使用 `PeerDB by ClickHouse`，一个专门为 PostgreSQL 数据库复制到自托管的 ClickHouse 和 ClickHouse Cloud 而设计的 CDC 工具
  - PeerDB 现在可以在 ClickHouse Cloud 原生使用 - 通过我们的 [新 ClickPipe 连接器](/integrations/clickpipes/postgres) 实现闪电般快速的 Postgres 到 ClickHouse CDC - 目前处于私有预览阶段。请 [在此注册](https://clickpipes.peerdb.io/)
- 使用 `PostgreSQL` 表引擎，从 PostgreSQL 表中读取数据
- 使用实验性的 `MaterializedPostgreSQL` 数据库引擎，将 PostgreSQL 中的数据库与 ClickHouse 中的数据库同步

## 使用 ClickPipes（由 PeerDB 提供支持） {#using-clickpipes-powered-by-peerdb}

PeerDB 现在可以在 ClickHouse Cloud 原生使用 - 通过我们的 [新 ClickPipe 连接器](/integrations/clickpipes/postgres) 实现闪电般快速的 Postgres 到 ClickHouse CDC - 目前处于私有预览阶段。请 [在此注册](https://clickpipes.peerdb.io/)

## 使用 PostgreSQL 表引擎 {#using-the-postgresql-table-engine}

`PostgreSQL` 表引擎允许对存储在远程 PostgreSQL 服务器上的数据进行 **SELECT** 和 **INSERT** 操作。
本文将说明使用一个表的基本集成方法。

### 1. 设置 PostgreSQL {#1-setting-up-postgresql}
1. 在 `postgresql.conf` 中添加以下条目，以启用 PostgreSQL 在网络接口上进行侦听：
  ```text
  listen_addresses = '*'
  ```

2. 创建一个用户以便从 ClickHouse 连接。为了演示目的，此示例授予完全超级用户权限。
  ```sql
  CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
  ```

3. 在 PostgreSQL 中创建一个新的数据库：
  ```sql
  CREATE DATABASE db_in_psg;
  ```

4. 创建一个新表：
  ```sql
  CREATE TABLE table1 (
      id         integer 主键,
      column1    varchar(10)
  );
  ```

5. 为测试添加几行数据：
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def');
  ```

6. 配置 PostgreSQL 以允许新用户连接到新数据库进行复制，在 `pg_hba.conf` 文件中添加以下条目。用您 PostgreSQL 服务器的子网或 IP 地址更新地址行：
  ```text
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
  ```

7. 重新加载 `pg_hba.conf` 配置（根据您的版本调整此命令）：
  ```text
  /usr/pgsql-12/bin/pg_ctl reload
  ```

8. 验证新的 `clickhouse_user` 可以登录：
  ```text
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
  ```

:::note
如果您在 ClickHouse Cloud 中使用此功能，您可能需要允许 ClickHouse Cloud 的 IP 地址访问您的 PostgreSQL 实例。
请查看 ClickHouse [Cloud 端点 API](/cloud/get-started/query-endpoints) 以获取出站流量的详细信息。
:::

### 2. 在 ClickHouse 中定义一个表 {#2-define-a-table-in-clickhouse}
1. 登录到 `clickhouse-client`：
  ```bash
  clickhouse-client --user default --password ClickHouse123!
  ```

2. 创建一个新的数据库：
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

  所需的最小参数为：

  |parameter|Description                 |example              |
  |---------|----------------------------|---------------------|
  |host:port|hostname 或 IP 和端口      |postgres-host.domain.com:5432|
  |database |PostgreSQL 数据库名称        |db_in_psg                  |
  |user     |用于连接 PostgreSQL 的用户名|clickhouse_user     |
  |password |用于连接 PostgreSQL 的密码  |ClickHouse_123       |

  :::note
  查看 [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql) 文档页面以获取完整的参数列表。
  :::

### 3 测试集成 {#3-test-the-integration}

1. 在 ClickHouse 中查看初始行：
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  ClickHouse 表应自动填充 PostgreSQL 表中已存在的两行：
  ```response
  Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  └────┴─────────┘
  ```

2. 返回 PostgreSQL，在表中添加几行数据：
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (3, 'ghi'),
    (4, 'jkl');
  ```

4. 这两行新数据应出现在您的 ClickHouse 表中：
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  返回结果应为：
  ```response
  Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘
  ```

5. 让我们看看在 ClickHouse 表中添加行时发生了什么：
  ```sql
  INSERT INTO db_in_ch.table1
    (id, column1)
  VALUES
    (5, 'mno'),
    (6, 'pqr');
  ```

6. 在 ClickHouse 中添加的行应出现在 PostgreSQL 的表中：
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

本示例演示了使用 `PostgreSQL` 表引擎在 PostgreSQL 和 ClickHouse 之间的基本集成。
请查看 [PostgreSQL 表引擎的文档页面](/engines/table-engines/integrations/postgresql) 了解更多功能，例如指定架构、仅返回部分列，以及连接到多个副本。还可以查看 [ClickHouse 和 PostgreSQL - 数据天堂中的绝配 - 第一部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres) 博客。

## 使用 MaterializedPostgreSQL 数据库引擎 {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQL 数据库引擎利用 PostgreSQL 的复制功能创建一个数据库的副本，包含所有或部分架构和表。
本文将说明使用一个数据库、一个架构和一个表的基本集成方法。

***在后面的流程中，使用 PostgreSQL CLI (psql) 和 ClickHouse CLI (clickhouse-client)。PostgreSQL 服务器安装在 Linux 上。如果 PostgreSQL 数据库是新的测试安装，以下是最小设置***

### 1. 在 PostgreSQL 中 {#1-in-postgresql}
1. 在 `postgresql.conf` 中设置最小侦听级别、复制 wal 级别和复制槽：

添加以下条目：
```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouse 需要最小的 `logical` wal 级别和最少 `2` 个复制槽_

2. 使用管理员帐户创建一个用户以便从 ClickHouse 连接：
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```
_*为了演示目的，授予了完全超级用户权限。_

3. 创建一个新数据库：
```sql
CREATE DATABASE db1;
```

4. 在 `psql` 中连接到新数据库：
```text
\connect db1
```

5. 创建一个新表：
```sql
CREATE TABLE table1 (
    id         integer 主键,
    column1    varchar(10)
);
```

6. 添加初始行：
```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. 配置 PostgreSQL 以允许新用户连接到新数据库进行复制。以下是添加到 `pg_hba.conf` 文件的最小条目：

```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*为了演示目的，这里使用纯文本密码认证方法。根据 PostgreSQL 文档更新地址行，使用子网或服务器地址。_

8. 使用如下命令重新加载 `pg_hba.conf` 配置（根据您的版本进行调整）：
```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 测试新的 `clickhouse_user` 登录：
```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. 在 ClickHouse 中 {#2-in-clickhouse}
1. 登录到 ClickHouse CLI：
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 为数据库引擎启用 PostgreSQL 实验性功能：
```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. 创建新数据库以进行复制，并定义初始表：
```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```
最小选项：

|parameter|Description                 |example              |
|---------|----------------------------|---------------------|
|host:port|hostname 或 IP 和端口      |postgres-host.domain.com:5432|
|database |PostgreSQL 数据库名称        |db1                  |
|user     |用于连接 PostgreSQL 的用户名|clickhouse_user     |
|password |用于连接 PostgreSQL 的密码  |ClickHouse_123       |
|settings |数据库引擎的其他设置       | materialized_postgresql_tables_list = 'table1'|

:::info
有关 PostgreSQL 数据库引擎的完整指南，请参阅 https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings
:::

4. 验证初始表具有数据：

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
1. 在 PostgreSQL 中，添加新行：
```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. 在 ClickHouse 中，验证新行是否可见：
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
本集成指南集中于如何复制一个带有表的数据库的简单示例，然而，存在更多的高级选项，包括复制整个数据库或向现有复制中添加新表和架构。虽然此复制不支持 DDL 命令，但可以设置引擎以检测更改并在进行结构更改时重新加载表。

:::info
有关高级选项可用的更多功能，请参见 [参考文档](/engines/database-engines/materialized-postgresql).
:::


## 相关内容 {#related-content}
- 博客：[ClickHouse 和 PostgreSQL - 数据天堂中的绝配 - 第一部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- 博客：[ClickHouse 和 PostgreSQL - 数据天堂中的绝配 - 第二部分](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
