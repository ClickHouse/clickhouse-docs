---
description: '使用 Distributed 引擎的表本身不存储任何数据，但允许在多台服务器上进行分布式查询处理。读取操作会自动并行化。在读取时，如果远程服务器上存在表索引，则会使用这些索引。'
sidebar_label: 'Distributed'
sidebar_position: 10
slug: /engines/table-engines/special/distributed
title: 'Distributed 表引擎'
doc_type: 'reference'
---



# Distributed 表引擎

:::warning Cloud 中的 Distributed 引擎
要在 ClickHouse Cloud 中创建 Distributed 表引擎，可以使用 [`remote` 和 `remoteSecure`](../../../sql-reference/table-functions/remote) 表函数。
在 ClickHouse Cloud 中不能使用 `Distributed(...)` 语法。
:::

使用 Distributed 引擎的表本身不存储任何数据，但支持在多个服务器上进行分布式查询处理。
读取操作会自动并行化。在读取时，如果远程服务器上存在表索引，则会使用这些索引。



## 创建表 {#distributed-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### 从表创建 {#distributed-from-a-table}

当 `Distributed` 表指向当前服务器上的表时,可以采用该表的模式:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### Distributed 参数 {#distributed-parameters}

| 参数                 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster`                 | 服务器配置文件中的集群名称                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `database`                | 远程数据库的名称                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `table`                   | 远程表的名称                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `sharding_key`(可选) | 分片键。<br/> 在以下情况下需要指定 `sharding_key`: <ul><li>向分布式表执行 `INSERT` 操作时(因为表引擎需要 `sharding_key` 来确定如何拆分数据)。但是,如果启用了 `insert_distributed_one_random_shard` 设置,则 `INSERT` 操作不需要分片键。</li><li>与 `optimize_skip_unused_shards` 一起使用时,因为需要 `sharding_key` 来确定应该查询哪些分片</li></ul> |
| `policy_name`(可选)  | 策略名称,用于存储后台发送的临时文件                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

**另请参阅**

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) 示例

### Distributed 设置 {#distributed-settings}


| Setting                                    | Description                                                                                                                                                  | Default value |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `fsync_after_insert`                       | 在对 Distributed 进行后台插入后，对文件数据执行 `fsync`。保证操作系统已经将全部插入的数据同步到**发起节点**磁盘上的文件中。                                                                                   | `false`       |
| `fsync_directories`                        | 对目录执行 `fsync`。保证操作系统在与 Distributed 表后台插入相关的操作之后（插入之后、将数据发送到分片之后等）刷新了目录元数据。                                                                                   | `false`       |
| `skip_unavailable_shards`                  | 若为 true，ClickHouse 将静默跳过不可用分片。分片在以下情况会被标记为不可用：1）由于连接失败无法访问该分片；2）通过 DNS 无法解析该分片；3）该分片上不存在相应的表。                                                                | `false`       |
| `bytes_to_throw_insert`                    | 如果待后台 `INSERT` 的压缩字节数超过此值，则抛出异常。`0` 表示不抛出异常。                                                                                                                 | `0`           |
| `bytes_to_delay_insert`                    | 如果待后台 `INSERT` 的压缩字节数超过此值，则延迟执行查询。`0` 表示不延迟。                                                                                                                 | `0`           |
| `max_delay_to_insert`                      | 当有大量待后台发送的字节时，将数据插入 Distributed 表的最大延迟时间（以秒为单位）。                                                                                                             | `60`          |
| `background_insert_batch`                  | 与 [`distributed_background_insert_batch`](../../../operations/settings/settings.md#distributed_background_insert_batch) 相同                                   | `0`           |
| `background_insert_split_batch_on_failure` | 与 [`distributed_background_insert_split_batch_on_failure`](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) 相同 | `0`           |
| `background_insert_sleep_time_ms`          | 与 [`distributed_background_insert_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 相同                   | `0`           |
| `background_insert_max_sleep_time_ms`      | 与 [`distributed_background_insert_max_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 相同           | `0`           |
| `flush_on_detach`                          | 在 `DETACH` / `DROP` / 服务器关闭时将数据刷新到远程节点。                                                                                                                      | `true`        |

:::note
**持久性设置**（`fsync_...`）：

* 仅影响后台 `INSERT`（即 `distributed_foreground_insert=false`），即数据先存储在发起节点磁盘上，随后在后台发送到分片的场景。
* 可能会显著降低 `INSERT` 性能。
* 影响将分布式表目录中存储的数据写入**接收你插入请求的那个节点**上的磁盘文件。如果你需要保证数据写入到底层的 MergeTree 表，请参阅 `system.merge_tree_settings` 中的持久性设置（`...fsync...`）。

关于**插入限制设置**（`..._insert`），另请参阅：

* [`distributed_foreground_insert`](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
* [`prefer_localhost_replica`](/operations/settings/settings#prefer_localhost_replica) 设置
* `bytes_to_throw_insert` 会先于 `bytes_to_delay_insert` 处理，因此你不应将其设置为小于 `bytes_to_delay_insert` 的值
  :::

**示例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

数据将从 `logs` 集群中的所有服务器上读取，即从该集群中每台服务器上的 `default.hits` 表中读取。数据不仅会被读取，还会在远程服务器上进行部分处理（在可能的范围内）。例如，对于带有 `GROUP BY` 的查询，数据会在远程服务器上进行聚合，聚合函数的中间状态会被发送到请求服务器，然后在该服务器上继续进行聚合。

你可以使用返回字符串的常量表达式来代替数据库名。例如：`currentDatabase()`。


## 集群 {#distributed-clusters}

集群在[服务器配置文件](../../../operations/configuration-files.md)中配置:

```xml
<remote_servers>
    <logs>
        <!-- 用于分布式查询的集群间服务器密钥
             默认值:无密钥(不执行身份验证)

             如果设置,则分布式查询将在分片上进行验证,因此至少需要:
             - 该集群必须存在于分片上,
             - 该集群必须具有相同的密钥。

             此外(更重要的是),initial_user 将
             作为查询的当前用户。
        -->
        <!-- <secret></secret> -->

        <!-- 可选。是否允许此集群执行分布式 DDL 查询(ON CLUSTER 子句)。默认值:true(允许)。 -->
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->

        <shard>
            <!-- 可选。写入数据时的分片权重。默认值:1。 -->
            <weight>1</weight>
            <!-- 可选。分片名称。必须非空且在集群中的所有分片之间唯一。如果未指定,则为空。 -->
            <name>shard_01</name>
            <!-- 可选。是否仅将数据写入其中一个副本。默认值:false(将数据写入所有副本)。 -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- 可选。用于负载均衡的副本优先级(另请参阅 load_balancing 设置)。默认值:1(值越小优先级越高)。 -->
                <priority>1</priority>
                <host>example01-01-1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>example01-01-2</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <weight>2</weight>
            <name>shard_02</name>
            <internal_replication>false</internal_replication>
            <replica>
                <host>example01-02-1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>example01-02-2</host>
                <secure>1</secure>
                <port>9440</port>
            </replica>
        </shard>
    </logs>
</remote_servers>
```

这里定义了一个名为 `logs` 的集群,由两个分片组成,每个分片包含两个副本。分片是指包含不同数据部分的服务器(要读取所有数据,必须访问所有分片)。副本是数据复制服务器(要读取所有数据,可以访问任意一个副本上的数据)。

集群名称不得包含点号。

每个服务器需要指定参数 `host`、`port`,以及可选的 `user`、`password`、`secure`、`compression`、`bind_host`:


| Parameter     | Description                                                                                                                                                                                                                                                                                                                              | Default Value |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `host`        | 远程服务器的地址。可以使用域名或 IPv4、IPv6 地址。如果指定域名，服务器在启动时会发起 DNS 请求，并在服务器运行期间缓存结果。如果 DNS 请求失败，服务器将不会启动。如果更改了 DNS 记录，需要重启服务器。 | -            |
| `port`        | 用于消息通信的 TCP 端口（配置中的 `tcp_port`，通常设置为 9000）。不要与 `http_port` 混淆。                                                                                                                                                                                                 | -            |
| `user`        | 连接远程服务器使用的用户名。该用户必须具有连接到指定服务器的权限。访问权限在 `users.xml` 文件中配置。更多信息，参见 [访问权限](../../../guides/sre/user-management/index.md) 部分。                                                                    | `default`    |
| `password`    | 连接远程服务器使用的密码（不会被掩码）。                                                                                                                                                                                                                                                                             | ''           |
| `secure`      | 是否使用安全的 SSL/TLS 连接。通常还需要指定端口（默认安全端口为 `9440`）。服务器应监听 `<tcp_port_secure>9440</tcp_port_secure>`，并配置正确的证书。                                                                                            | `false`      |
| `compression` | 是否使用数据压缩。                                                                                                                                                                                                                                                                                                                    | `true`       |
| `bind_host`   | 从当前节点连接到远程服务器时使用的源地址。仅支持 IPv4 地址。适用于需要设置 ClickHouse 分布式查询所使用源 IP 地址的高级部署场景。                                                                                             | -            |

在指定副本时，读取时会为每个分片选择一个可用副本。可以配置负载均衡算法（即优先访问哪个副本）——参见 [load_balancing](../../../operations/settings/settings.md#load_balancing) 设置。如果无法与服务器建立连接，将会在较短的超时时间内尝试连接。如果连接失败，将选择下一个副本，对所有副本依次重试。如果对所有副本的连接尝试都失败，将以相同方式重复尝试多次。这有助于提高系统弹性，但并不能提供完全的容错能力：远程服务器可能会接受连接，但可能无法正常工作，或工作性能较差。

可以只指定一个分片（在这种情况下，查询处理应被视为 `remote`，而不是 `Distributed`），也可以指定任意数量的分片。在每个分片中，可以指定从一个到任意数量的副本。可以为每个分片指定不同数量的副本。

在配置中可以按需指定任意数量的集群。

要查看集群，请使用 `system.clusters` 表。

`Distributed` 引擎允许像操作本地服务器一样操作集群。但是，集群配置不能动态指定，必须在服务器配置文件中进行配置。通常，集群中的所有服务器会使用相同的集群配置（虽然这不是强制的）。配置文件中的集群配置会在运行时热更新，无需重启服务器。

如果每次都需要向一组事先未知的分片和副本发送查询，则不需要创建 `Distributed` 表——改用 `remote` 表函数。参见 [表函数](../../../sql-reference/table-functions/index.md) 部分。



## 写入数据 {#distributed-writing-data}

向集群写入数据有两种方法:

第一种方法是,您可以定义将哪些数据写入哪些服务器,并直接在每个分片上执行写入操作。换句话说,直接在 `Distributed` 表所指向的集群中的远程表上执行 `INSERT` 语句。这是最灵活的解决方案,因为您可以使用任何分片方案,即使是由于业务领域需求而产生的非常规方案。这也是最优的解决方案,因为数据可以完全独立地写入不同的分片。

第二种方法是,您可以在 `Distributed` 表上执行 `INSERT` 语句。在这种情况下,该表会自动将插入的数据分发到各个服务器。为了向 `Distributed` 表写入数据,必须配置 `sharding_key` 参数(除非只有一个分片)。

每个分片可以在配置文件中定义 `<weight>`。默认情况下,权重为 `1`。数据按照与分片权重成正比的数量分布到各个分片。所有分片权重相加求和,然后将每个分片的权重除以总和来确定每个分片的比例。例如,如果有两个分片,第一个分片的权重为 1,第二个分片的权重为 2,则第一个分片将接收三分之一(1 / 3)的插入行,第二个分片将接收三分之二(2 / 3)。

每个分片可以在配置文件中定义 `internal_replication` 参数。如果此参数设置为 `true`,写入操作会选择第一个健康的副本并向其写入数据。如果 `Distributed` 表底层的表是复制表(例如任何 `Replicated*MergeTree` 表引擎),请使用此选项。其中一个表副本将接收写入,并自动复制到其他副本。

如果 `internal_replication` 设置为 `false`(默认值),数据将写入所有副本。在这种情况下,`Distributed` 表自己复制数据。这不如使用复制表,因为不会检查副本的一致性,随着时间的推移,它们将包含略有不同的数据。

为了选择将数据行发送到哪个分片,会分析分片表达式,并取其除以分片总权重的余数。数据行被发送到对应于从 `prev_weights` 到 `prev_weights + weight` 的余数半开区间的分片,其中 `prev_weights` 是编号最小的分片的总权重,`weight` 是该分片的权重。例如,如果有两个分片,第一个分片的权重为 9,第二个分片的权重为 10,则余数在 \[0, 9) 范围内的行将发送到第一个分片,余数在 \[9, 19) 范围内的行将发送到第二个分片。

分片表达式可以是由常量和表列组成的任何返回整数的表达式。例如,您可以使用表达式 `rand()` 进行数据的随机分布,或使用 `UserID` 按用户 ID 除法的余数进行分布(这样单个用户的数据将驻留在单个分片上,从而简化按用户运行 `IN` 和 `JOIN` 操作)。如果某个列的分布不够均匀,可以将其包装在哈希函数中,例如 `intHash64(UserID)`。

简单的除法余数是一种有限的分片解决方案,并不总是适用。它适用于中等和大量数据(数十台服务器),但不适用于超大量数据(数百台或更多服务器)。在后一种情况下,应使用业务领域所需的分片方案,而不是使用 `Distributed` 表中的条目。

在以下情况下,您应该关注分片方案:


- 使用需要按特定键进行数据连接（`IN` 或 `JOIN`）的查询时，如果数据按该键进行了分片，就可以使用本地 `IN` 或 `JOIN`，而不是 `GLOBAL IN` 或 `GLOBAL JOIN`，效率会高得多。
- 在使用大量服务器（数百台或更多）并伴随大量小查询的场景下，例如针对单个客户（如网站、广告主或合作伙伴）数据的查询，为避免这些小查询影响整个集群，将单个客户的数据放在单个分片上是合理的选择。或者，可以设置双层分片：将整个集群划分成多个“层”，每一层可以包含多个分片。单个客户的数据位于单个层内，但可以按需向该层添加分片，并在这些分片之间随机分布数据。为每一层创建各自的 `Distributed` 表，并为全局查询创建一个共享的分布式表。

数据写入在后台进行。向表中插入数据时，数据块只会被写入本地文件系统。随后数据会在后台尽快发送到远程服务器。发送数据的周期由 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 和 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 设置控制。`Distributed` 引擎会分别发送每个包含插入数据的文件，但可以通过 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 设置来启用批量发送文件。该设置通过更好地利用本地服务器和网络资源来提升集群性能。可以通过检查表目录中等待发送的数据文件列表来确认数据是否已成功发送：`/var/lib/clickhouse/data/database/table/`。执行后台任务的线程数量可以通过 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置来配置。

如果服务器在对 `Distributed` 表执行 `INSERT` 之后不再存在或发生非正常重启（例如由于硬件故障），已插入的数据可能会丢失。如果在表目录中检测到损坏的数据部分，它会被移入 `broken` 子目录，并不再被使用。



## 读取数据 {#distributed-reading-data}

查询 `Distributed` 表时,`SELECT` 查询会发送到所有分片,无论数据在各分片上如何分布(可以完全随机分布)都能正常工作。添加新分片时,无需将旧数据迁移到新分片。您可以通过设置更高的权重将新数据写入新分片——数据分布会略有不均,但查询仍能正确高效地执行。

启用 `max_parallel_replicas` 选项后,查询处理会在单个分片内的所有副本间并行执行。更多信息请参阅 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 部分。

要了解分布式 `in` 和 `global in` 查询的处理方式,请参阅[此文档](/sql-reference/operators/in#distributed-subqueries)。


## 虚拟列 {#virtual-columns}

#### \_Shard_num {#\_shard_num}

`_shard_num` — 包含来自 `system.clusters` 表的 `shard_num` 值。类型：[UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
由于 [`remote`](../../../sql-reference/table-functions/remote.md) 和 [`cluster`](../../../sql-reference/table-functions/cluster.md) 表函数在内部会创建临时的 Distributed 表，因此 `_shard_num` 在这些函数中同样可用。
:::

**另请参阅**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns) 说明
- [`background_distributed_schedule_pool_size`](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置
- [`shardNum()`](../../../sql-reference/functions/other-functions.md#shardNum) 和 [`shardCount()`](../../../sql-reference/functions/other-functions.md#shardCount) 函数
