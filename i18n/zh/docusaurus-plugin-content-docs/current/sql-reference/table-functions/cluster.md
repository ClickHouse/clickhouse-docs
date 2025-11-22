---
description: '允许在不创建 Distributed 表的情况下访问集群中 `remote_servers` 配置节中定义的所有分片。'
sidebar_label: 'cluster'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
doc_type: 'reference'
---



# clusterAllReplicas 表函数

无需创建 [Distributed](../../engines/table-engines/special/distributed.md) 表即可访问集群中在 `remote_servers` 配置部分定义的所有分片，并且每个分片只查询一个副本。

`clusterAllReplicas` 函数 — 与 `cluster` 相同，但会查询所有副本。集群中的每个副本都会作为单独的分片/连接使用。

:::note
所有可用集群都列在 [system.clusters](../../operations/system-tables/clusters.md) 表中。
:::



## 语法 {#syntax}


```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```

## 参数 {#arguments}

| 参数                   | 类型                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`              | 集群名称,用于构建远程和本地服务器的地址集合及连接参数。如果未指定,则设置为 `default`。 |
| `db.table` 或 `db`, `table` | 数据库名称和表名称。                                                                                                                   |
| `sharding_key`              | 分片键。可选参数。当集群包含多个分片时需要指定。                                                           |


## 返回值 {#returned_value}

来自集群的数据集。


## 使用宏 {#using_macros}

`cluster_name` 可以包含宏——即用花括号括起来的替换内容。替换值取自服务器配置文件的 [macros](../../operations/server-configuration-parameters/settings.md#macros) 部分。

示例：

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```


## 使用方法和建议 {#usage_recommendations}

使用 `cluster` 和 `clusterAllReplicas` 表函数的效率低于创建 `Distributed` 表,因为在这种情况下,每次请求都会重新建立服务器连接。在处理大量查询时,请务必提前创建 `Distributed` 表,而不要使用 `cluster` 和 `clusterAllReplicas` 表函数。

`cluster` 和 `clusterAllReplicas` 表函数在以下情况下可能有用:

- 访问特定集群进行数据比较、调试和测试。
- 出于研究目的查询各种 ClickHouse 集群和副本。
- 手动执行的低频分布式请求。

连接设置(如 `host`、`port`、`user`、`password`、`compression`、`secure`)从 `<remote_servers>` 配置部分获取。详情请参阅 [Distributed 引擎](../../engines/table-engines/special/distributed.md)。


## 相关内容 {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
