---
description: '`ExternalDistributed` 引擎允许对存储在远程 MySQL 或 PostgreSQL 服务器上的数据执行 `SELECT` 查询。它接受 MySQL 或 PostgreSQL 引擎作为参数，因此支持分片。'
sidebar_label: 'ExternalDistributed'
sidebar_position: 55
slug: /engines/table-engines/integrations/ExternalDistributed
title: 'ExternalDistributed 表引擎'
doc_type: 'reference'
---

# ExternalDistributed 表引擎 \\{#externaldistributed-table-engine\\}

`ExternalDistributed` 引擎允许对存储在远程服务器上 MySQL 或 PostgreSQL 实例中的数据执行 `SELECT` 查询。它接受 [MySQL](../../../engines/table-engines/integrations/mysql.md) 或 [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md) 引擎作为参数，从而支持分片。

## 创建表 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

在 [CREATE TABLE](/sql-reference/statements/create/table) 查询中查看该语句的详细说明。

表结构可以与原始表结构不同：

* 列名应与原始表中的列名相同，但你可以只使用其中一部分列，并按任意顺序排列。
* 列类型可以与原始表中的类型不同。ClickHouse 会尝试将值[转换](/sql-reference/functions/type-conversion-functions#CAST)为 ClickHouse 数据类型。

**引擎参数**

* `engine` — 表引擎 `MySQL` 或 `PostgreSQL`。
* `host:port` — MySQL 或 PostgreSQL 服务器地址。
* `database` — 远程数据库名称。
* `table` — 远程表名称。
* `user` — 用户名。
* `password` — 用户密码。


## 实现细节 \{#implementation-details\}

支持多个副本：多个副本之间必须使用 `|` 分隔，多个分片之间必须使用 `,` 分隔。例如：

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

在为分片指定副本后，读取时会为每个分片从可用副本中选择一个副本。如果连接失败，则选择下一个副本，依此类推遍历所有副本。如果对所有副本的连接尝试都失败，则会以相同方式重复尝试多次。

可以为任意数量的分片指定任意数量的副本。

**另请参阅**

* [MySQL 表引擎](../../../engines/table-engines/integrations/mysql.md)
* [PostgreSQL 表引擎](../../../engines/table-engines/integrations/postgresql.md)
* [Distributed 表引擎](../../../engines/table-engines/special/distributed.md)
