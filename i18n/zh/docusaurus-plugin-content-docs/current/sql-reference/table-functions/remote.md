---
'description': '表函数 `remote` 允许动态访问远程服务器，即无需创建分布式表。表函数 `remoteSecure` 与 `remote` 相同，但通过安全连接进行。'
'sidebar_label': 'remote'
'sidebar_position': 175
'slug': '/sql-reference/table-functions/remote'
'title': 'remote, remoteSecure'
---


# remote, remoteSecure 表函数

表函数 `remote` 允许动态访问远程服务器，即在不创建 [Distributed](../../engines/table-engines/special/distributed.md) 表的情况下。表函数 `remoteSecure` 与 `remote` 相同，但通过安全连接进行访问。

这两个函数可以在 `SELECT` 和 `INSERT` 查询中使用。

## 语法 {#syntax}

```sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```

## 参数 {#parameters}

| 参数             | 描述                                                                                                                                                                                                                                                                                                                                                        |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `addresses_expr` | 远程服务器地址或生成多个远程服务器地址的表达式。格式： `host` 或 `host:port`。<br/><br/>    `host` 可以指定为服务器名称或 IPv4 或 IPv6 地址。IPv6 地址必须用方括号括起来。<br/><br/>    `port` 是远程服务器上的 TCP 端口。如果省略端口，则会使用表函数 `remote` 的服务器配置文件中的 [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)（默认为 9000）和表函数 `remoteSecure` 的 [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure)（默认为 9440）。<br/><br/>    对于 IPv6 地址，端口是必需的。<br/><br/>    如果仅指定参数 `addresses_expr`，`db` 和 `table` 默认将使用 `system.one`。<br/><br/>    类型：[String](../../sql-reference/data-types/string.md)。 |
| `db`             | 数据库名称。类型：[String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                             |
| `table`          | 表名。类型：[String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                                                               |
| `user`           | 用户名。如果未指定，则使用 `default`。类型：[String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                                         |
| `password`       | 用户密码。如果未指定，则使用空密码。类型：[String](../../sql-reference/data-types/string.md)。                                                                                                                                                                                                                                             |
| `sharding_key`   | 用于支持跨节点分发数据的分片键。例如：`insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`。类型：[UInt32](../../sql-reference/data-types/int-uint.md)。                                                                                                                                                 |

参数也可以通过 [命名集合](operations/named-collections.md) 传递。

## 返回值 {#returned-value}

位于远程服务器上的表。

## 用法 {#usage}

由于表函数 `remote` 和 `remoteSecure` 在每次请求时都会重新建立连接，因此建议使用 `Distributed` 表。如果设置了主机名，则会进行名称解析，并且在与各种副本交互时不会计算错误。当处理大量查询时，始终提前创建 `Distributed` 表，而不是使用 `remote` 表函数。

`remote` 表函数在以下情况下非常有用：

- 从一个系统迁移数据到另一个系统一次性操作
- 访问特定服务器进行数据比较、调试和测试，即临时连接。
- 进行研究目的的各种 ClickHouse 集群之间的查询。
- 手动进行的不频繁的分布式请求。
- 每次重新定义服务器集合的分布式请求。

### 地址 {#addresses}

```text
example01-01-1
example01-01-1:9440
example01-01-1:9000
localhost
127.0.0.1
[::]:9440
[::]:9000
[2a02:6b8:0:1111::11]:9000
```

多个地址可以用逗号分隔。在这种情况下，ClickHouse 将使用分布式处理，并将查询发送到所有指定的地址（就像有不同数据的分片）。示例：

```text
example01-01-1,example01-02-1
```

## 示例 {#examples}

### 从远程服务器选择数据: {#selecting-data-from-a-remote-server}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

或者使用 [命名集合](operations/named-collections.md)：

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### 向远程服务器上的表插入数据: {#inserting-data-into-a-table-on-a-remote-server}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### 从一个系统迁移表到另一个系统: {#migration-of-tables-from-one-system-to-another}

此示例使用来自示例数据集的一张表。 数据库为 `imdb`，表名为 `actors`。

#### 在源 ClickHouse 系统上（当前托管数据的系统） {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

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

- 使用源中的 CREATE TABLE 语句创建目标：

```sql
CREATE TABLE imdb.actors (`id` UInt32,
                          `first_name` String,
                          `last_name` String,
                          `gender` FixedString(1))
                ENGINE = MergeTree
                ORDER BY (id, first_name, last_name, gender);
```

#### 回到源部署 {#back-on-the-source-deployment}

插入到在远程系统上创建的新数据库和表中。您需要主机名、端口、用户名、密码、目标数据库和目标表。

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## 通配符 {#globs-in-addresses}

大括号 `{ }` 中的模式用于生成一组分片并指定副本。如果有多个成对的大括号，则生成相应集合的笛卡尔积。

支持以下模式类型。

- `{a,b,c}` - 表示任意一个替代字符串 `a`、`b` 或 `c`。该模式在第一个分片地址中替换为 `a`，在第二个分片地址中替换为 `b`，依此类推。例如，`example0{1,2}-1` 生成地址 `example01-1` 和 `example02-1`。
- `{N..M}` - 一系列数字。此模式生成从 `N` 到（包括）`M` 的分片地址，索引递增。例如，`example0{1..2}-1` 生成 `example01-1` 和 `example02-1`。
- `{0n..0m}` - 带有前导零的数字范围。此模式在索引中保留前导零。例如，`example{01..03}-1` 生成 `example01-1`、`example02-1` 和 `example03-1`。
- `{a|b}` - 由 `|` 分隔的任意数量的变体。该模式指定副本。例如，`example01-{1|2}` 生成副本 `example01-1` 和 `example01-2`。

查询将发送到第一健康副本。然而，对于 `remote`，副本按当前在 [load_balancing](../../operations/settings/settings.md#load_balancing) 设置中设置的顺序进行迭代。
生成的地址数量受到 [table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses) 设置的限制。
