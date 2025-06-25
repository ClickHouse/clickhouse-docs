---
'description': '允许访问集群的所有分片（在 `remote_servers` 部分配置）而无需创建分布式表。'
'sidebar_label': 'cluster'
'sidebar_position': 30
'slug': '/sql-reference/table-functions/cluster'
'title': 'clusterAllReplicas'
---


# clusterAllReplicas 表函数

允许访问集群中所有分片（在 `remote_servers` 部分配置）而无需创建一个 [Distributed](../../engines/table-engines/special/distributed.md) 表。仅查询每个分片的一个副本。

`clusterAllReplicas` 函数 - 与 `cluster` 相同，但查询所有副本。集群中的每个副本被用作一个独立的分片/连接。

:::note
所有可用的集群都列在 [system.clusters](../../operations/system-tables/clusters.md) 表中。
:::

## 语法 {#syntax}

```sql
cluster(['cluster_name', db.table, sharding_key])
cluster(['cluster_name', db, table, sharding_key])
clusterAllReplicas(['cluster_name', db.table, sharding_key])
clusterAllReplicas(['cluster_name', db, table, sharding_key])
```
## 参数 {#arguments}

| 参数                         | 类型                                                                                                                                              |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`               | 用于构建远程和本地服务器的地址和连接参数的集群名称，如果未指定则设置为 `default`。                                                                  |
| `db.table` 或 `db`, `table` | 数据库和表的名称。                                                                                                                              |
| `sharding_key`               | 分片键。可选。如果集群有多个分片，则需要指定。                                                                                                   |

## 返回值 {#returned_value}

来自集群的数据集。

## 使用宏 {#using_macros}

`cluster_name` 可以包含宏 - 大括号中的替换。替换的值来自服务器配置文件的 [macros](../../operations/server-configuration-parameters/settings.md#macros) 部分。

示例：

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

## 用法和建议 {#usage_recommendations}

使用 `cluster` 和 `clusterAllReplicas` 表函数的效率低于创建 `Distributed` 表，因为在这种情况下，每个请求都会重新建立服务器连接。当处理大量查询时，请始终提前创建 `Distributed` 表，而不要使用 `cluster` 和 `clusterAllReplicas` 表函数。

`cluster` 和 `clusterAllReplicas` 表函数在以下情况下可能会很有用：

- 访问特定集群以进行数据比较、调试和测试。
- 针对各种 ClickHouse 集群和副本的研究查询。
- 手动进行的低频率分布式请求。

连接设置如 `host`、`port`、`user`、`password`、`compression`、`secure` 取自 `<remote_servers>` 配置部分。有关详细信息，请参见 [Distributed engine](../../engines/table-engines/special/distributed.md)。

## 相关 {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
