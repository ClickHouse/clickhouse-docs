---
slug: /sql-reference/table-functions/remote
sidebar_position: 175
sidebar_label: remote
title: 'remote, remoteSecure'
description: '表函数 `remote` 允许按需访问远程服务器，即无需创建分布式表。表函数 `remoteSecure` 与 `remote` 相同，但通过安全连接进行。'
---


# remote, remoteSecure 表函数

表函数 `remote` 允许按需访问远程服务器，即无需创建一个[分布式](../../engines/table-engines/special/distributed.md)表。表函数 `remoteSecure` 与 `remote` 相同，但通过安全连接进行。

这两个函数可以在 `SELECT` 和 `INSERT` 查询中使用。

## 语法 {#syntax}

``` sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```

## 参数 {#parameters}

- `addresses_expr` — 远程服务器地址或生成多个远程服务器地址的表达式。格式: `host` 或 `host:port`。

    `host` 可以指定为服务器名称或 IPv4 或 IPv6 地址。IPv6 地址必须用方括号括起来。

    `port` 是远程服务器上的 TCP 端口。如果省略端口，将为表函数 `remote` 使用服务器配置文件中的[tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)（默认值为 9000），为表函数 `remoteSecure` 使用[tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure)（默认值为 9440）。

    对于 IPv6 地址，端口是必需的。

    如果仅指定参数 `addresses_expr`，则 `db` 和 `table` 默认为 `system.one`。

    类型: [String](../../sql-reference/data-types/string.md)。

- `db` — 数据库名称。类型: [String](../../sql-reference/data-types/string.md)。
- `table` — 表名称。类型: [String](../../sql-reference/data-types/string.md)。
- `user` — 用户名。如果未指定，使用 `default`。类型: [String](../../sql-reference/data-types/string.md)。
- `password` — 用户密码。如果未指定，则使用空密码。类型: [String](../../sql-reference/data-types/string.md)。
- `sharding_key` — 支持在节点之间分配数据的分片键。例如：`insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。类型: [UInt32](../../sql-reference/data-types/int-uint.md)。

参数也可以通过[命名集合](operations/named-collections.md)传递。

## 返回值 {#returned-value}

位于远程服务器上的表。

## 用法 {#usage}

由于表函数 `remote` 和 `remoteSecure` 为每个请求重新建立连接，因此建议使用 `Distributed` 表。此外，如果设置了主机名，则在处理不同副本时会解析名称，并且不会计入错误。在处理大量查询时，始终提前创建 `Distributed` 表，而不要使用 `remote` 表函数。

`remote` 表函数在以下情况下可能会很有用：

- 从一个系统向另一个系统的一次性数据迁移
- 访问特定服务器以进行数据比较、调试和测试，即临时连接。
- 研究目的的各种 ClickHouse 集群之间的查询。
- 手动进行的不频繁分布请求。
- 每次重新定义服务器集合的分布请求。

### 地址 {#addresses}

``` text
example01-01-1
example01-01-1:9440
example01-01-1:9000
localhost
127.0.0.1
[::]:9440
[::]:9000
[2a02:6b8:0:1111::11]:9000
```

多个地址可以用逗号分隔。在这种情况下，ClickHouse 将使用分布式处理，并将查询发送到所有指定地址（如具有不同数据的分片）。示例：

``` text
example01-01-1,example01-02-1
```

## 示例 {#examples}

### 从远程服务器选择数据: {#selecting-data-from-a-remote-server}

``` sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

或使用[命名集合](operations/named-collections.md)：

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### 插入数据到远程服务器上的表: {#inserting-data-into-a-table-on-a-remote-server}

``` sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### 从一个系统迁移表到另一个系统: {#migration-of-tables-from-one-system-to-another}

此示例使用来自示例数据集的一个表。数据库是 `imdb`，表是 `actors`。

#### 在源 ClickHouse 系统上 (当前托管数据的系统) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- 验证源数据库和表名称（`imdb.actors`）

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

- 从源获取 CREATE TABLE 语句：

```sql
  select create_table_query
  from system.tables
  where database = 'imdb' and table = 'actors'
  ```

  响应

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### 在目标 ClickHouse 系统上 {#on-the-destination-clickhouse-system}

- 创建目标数据库：

  ```sql
  CREATE DATABASE imdb
  ```

- 使用源中的 CREATE TABLE 语句，创建目标：

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### 回到源部署 {#back-on-the-source-deployment}

插入到远程系统上创建的新数据库和表中。您将需要主机、端口、用户名、密码、目标数据库和目标表。

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## 通配符 {#globs-in-addresses}

花括号 `{ }` 中的模式用于生成一组分片并指定副本。如果有多个花括号对，则生成对应集合的笛卡尔积。

支持以下模式类型。

- `{a,b,c}` - 代表任一替代字符串 `a`、`b` 或 `c`。在第一个分片地址中用 `a` 替换该模式，在第二个分片地址中用 `b` 替换，以此类推。例如，`example0{1,2}-1` 生成地址 `example01-1` 和 `example02-1`。
- `{N..M}` - 一系列数字。该模式生成从 `N` 到（且包括）`M` 的带有递增索引的分片地址。例如，`example0{1..2}-1` 生成 `example01-1` 和 `example02-1`。
- `{0n..0m}` - 带有前导零的数字范围。该模式保留索引中的前导零。例如，`example{01..03}-1` 生成 `example01-1`、`example02-1` 和 `example03-1`。
- `{a|b}` - 任何数量的用 `|` 分隔的变体。该模式指定副本。例如，`example01-{1|2}` 生成副本 `example01-1` 和 `example01-2`。

查询将发送到第一个健康的副本。然而，对于 `remote`，副本将按照目前在[load_balancing](../../operations/settings/settings.md#load_balancing)设置中设定的顺序进行迭代。
生成的地址数量受限于[table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses)设置。
