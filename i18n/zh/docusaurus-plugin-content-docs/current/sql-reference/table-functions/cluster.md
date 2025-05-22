
# clusterAllReplicas 表函数

允许访问集群中所有分片（在 `remote_servers` 部分配置的分片），而无需创建一个 [Distributed](../../engines/table-engines/special/distributed.md) 表。只查询每个分片的一个副本。

`clusterAllReplicas` 函数与 `cluster` 相同，但查询所有副本。集群中的每个副本作为独立的分片/连接使用。

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

| 参数                          | 类型                                                                                                                                                            |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                | 用于构建连接远程和本地服务器的地址和连接参数集的集群名称，如果未指定，则设置为 `default`。                                                                              |
| `db.table` 或 `db`，`table` | 数据库和表的名称。                                                                                                                                               |
| `sharding_key`                | 分片密钥。可选。如果集群有多个分片，则需要指定。                                                                                                               |

## 返回值 {#returned_value}

来自集群的数据集。

## 使用宏 {#using_macros}

`cluster_name` 可以包含宏—用大括号中的替换符号进行替换。替换的值取自服务器配置文件的 [macros](../../operations/server-configuration-parameters/settings.md#macros) 部分。

示例：

```sql
SELECT * FROM cluster('{cluster}', default.example_table);
```

## 用法和建议 {#usage_recommendations}

使用 `cluster` 和 `clusterAllReplicas` 表函数的效率低于创建 `Distributed` 表，因为在这种情况下，每个请求都需要重新建立服务器连接。当处理大量查询时，请始终预先创建 `Distributed` 表，并且不要使用 `cluster` 和 `clusterAllReplicas` 表函数。

`cluster` 和 `clusterAllReplicas` 表函数在以下情况下可能有用：

- 访问特定集群进行数据比较、调试和测试。
- 针对研究目的对各种 ClickHouse 集群和副本的查询。
- 手动进行的不频繁的分布式请求。

连接设置，如 `host`、`port`、`user`、`password`、`compression`、`secure` 来源于 `<remote_servers>` 配置部分。有关详细信息，请参见 [Distributed engine](../../engines/table-engines/special/distributed.md)。

## 相关 {#related}

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [load_balancing](../../operations/settings/settings.md#load_balancing)
