---
description: '允许在不创建 Distributed 表的情况下访问集群中在 `remote_servers` 配置段中配置的所有分片。'
sidebar_label: 'cluster'
sidebar_position: 30
slug: /sql-reference/table-functions/cluster
title: 'clusterAllReplicas'
doc_type: 'reference'
---

# clusterAllReplicas 表函数 \\{#clusterallreplicas-table-function\\}

允许在无需创建 [Distributed](../../engines/table-engines/special/distributed.md) 表的情况下，访问集群在 `remote_servers` 配置段中定义的所有分片。查询时，每个分片仅会访问一个副本。

`clusterAllReplicas` 函数与 `cluster` 函数类似，但会查询所有副本。集群中的每个副本都会作为独立的分片/连接使用。

:::note
所有可用的集群都列在 [system.clusters](../../operations/system-tables/clusters.md) 表中。
:::

## 语法 \\{#syntax\\}

```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```

## 参数 \\{#arguments\\}

| 参数                          | 类型                                                   |
| --------------------------- | ---------------------------------------------------- |
| `cluster_name`              | 集群名称，用于构建到远程和本地服务器的一组地址和连接参数，如果未显式指定，则默认为 `default`。 |
| `db.table` or `db`, `table` | 数据库和表的名称。                                            |
| `sharding_key`              | 分片键。可选项。如果集群包含多个分片，则必须指定。                            |

## 返回值 \\{#returned_value\\}

来自各集群的数据集。

## 使用宏 \\{#using_macros\\}

`cluster_name` 可以包含宏——用花括号括起的替换占位符。替换后的值取自服务器配置文件中的 [macros](../../operations/server-configuration-parameters/settings.md#macros) 部分。

示例：

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

## 使用方式和建议 \\{#usage_recommendations\\}

使用 `cluster` 和 `clusterAllReplicas` 表函数的效率低于创建 `Distributed` 表，因为在这种情况下，每个请求都会重新建立与服务器的连接。在处理大量查询时，请务必预先创建 `Distributed` 表，而不要使用 `cluster` 和 `clusterAllReplicas` 表函数。

`cluster` 和 `clusterAllReplicas` 表函数在以下场景中会比较有用：

- 访问特定集群以进行数据对比、调试和测试。
- 出于研究目的，对多个 ClickHouse 集群和副本执行查询。
- 不常见且由人工发起的分布式请求。

`host`、`port`、`user`、`password`、`compression`、`secure` 等连接设置从 `<remote_servers>` 配置节中获取。详情参见 [Distributed 引擎](../../engines/table-engines/special/distributed.md)。

## 相关内容 \\{#related\\}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
