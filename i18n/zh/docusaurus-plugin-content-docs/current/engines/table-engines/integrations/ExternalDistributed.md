---
slug: /engines/table-engines/integrations/ExternalDistributed
sidebar_position: 55
sidebar_label: ExternalDistributed
title: ExternalDistributed
description: "The `ExternalDistributed` engine allows to perform `SELECT` queries on data that is stored on a remote servers MySQL or PostgreSQL. Accepts MySQL or PostgreSQL engines as an argument so sharding is possible."
---

`ExternalDistributed`引擎允许对存储在远程服务器 MySQL 或 PostgreSQL 中的数据执行 `SELECT` 查询。接受 [MySQL](../../../engines/table-engines/integrations/mysql.md) 或 [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md) 引擎作为参数，因此可以进行分片。

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

有关 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述，请参见。

表结构可以与原始表结构有所不同：

- 列名应与原始表中的相同，但可以仅使用这些列中的部分列，并且顺序可以是任意的。
- 列类型可以与原始表中的不同。ClickHouse 会尝试将值 [cast](/sql-reference/functions/type-conversion-functions#cast) 为 ClickHouse 数据类型。

**引擎参数**

- `engine` — 表引擎 `MySQL` 或 `PostgreSQL`。
- `host:port` — MySQL 或 PostgreSQL 服务器地址。
- `database` — 远程数据库名称。
- `table` — 远程表名称。
- `user` — 用户名。
- `password` — 用户密码。

## 实现细节 {#implementation-details}

支持多个副本，必须通过 `|` 列出，并且分片必须通过 `,` 列出。例如：

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

在指定副本时，在读取时会为每个分片选择可用的副本之一。如果连接失败，则选择下一个副本，如此类推。如果所有副本的连接尝试均失败，则会重复尝试多次。

您可以为每个分片指定任意数量的分片和任意数量的副本。

**另请参见**

- [MySQL 表引擎](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQL 表引擎](../../../engines/table-engines/integrations/postgresql.md)
- [分布式表引擎](../../../engines/table-engines/special/distributed.md)
