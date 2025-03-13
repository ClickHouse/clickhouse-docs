---
slug: /sql-reference/table-functions/cluster
sidebar_position: 30
sidebar_label: cluster
title: 'clusterAllReplicas'
description: '允许在不创建分布式表的情况下访问集群的所有分片（在 `remote_servers` 部分配置）。'
---


# clusterAllReplicas 表函数

允许在不创建 [分布式](../../engines/table-engines/special/distributed.md) 表的情况下访问集群的所有分片（在 `remote_servers` 部分配置）。仅查询每个分片的一个副本。

`clusterAllReplicas` 函数 — 与 `cluster` 相同，但查询所有副本。集群中的每个副本作为单独的分片/连接使用。

:::note
所有可用的集群在 [system.clusters](../../operations/system-tables/clusters.md) 表中列出。
:::

**语法**

``` sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
**参数**

- `cluster_name` – 用于构建远程和本地服务器的地址和连接参数集的集群名称，未指定时默认为 `default`。
- `db.table` 或 `db`, `table` - 数据库和表的名称。
- `sharding_key` - 一个分片键。可选。如果集群有多个分片，则需要指定。

**返回值**

来自集群的数据集。

**使用宏**

`cluster_name` 可以包含宏 — 用大括号括起来的替换。替换的值来自服务器配置文件的 [macros](../../operations/server-configuration-parameters/settings.md#macros) 部分。

示例：

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

**用法和建议**

使用 `cluster` 和 `clusterAllReplicas` 表函数的效率低于创建 `分布式` 表，因为在这种情况下，每个请求都会重新建立服务器连接。当处理大量查询时，请务必提前创建 `分布式` 表，而不要使用 `cluster` 和 `clusterAllReplicas` 表函数。

`cluster` 和 `clusterAllReplicas` 表函数在以下情况下可能会很有用：

- 访问特定集群进行数据比较、调试和测试。
- 针对研究目的对各个 ClickHouse 集群和副本的查询。
- 不常见的分布式请求，这些请求是手动发出的。

连接设置如 `host`、`port`、`user`、`password`、`compression`、`secure` 均取自 `<remote_servers>` 配置部分。详见 [分布式引擎](../../engines/table-engines/special/distributed.md)。

**另见**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
