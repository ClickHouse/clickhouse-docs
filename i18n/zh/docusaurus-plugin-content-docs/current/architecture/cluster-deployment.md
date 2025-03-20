---
slug: /architecture/cluster-deployment
sidebar_label: 集群部署
sidebar_position: 100
title: 集群部署
---

本教程假设您已经设置了一个 [本地 ClickHouse 服务器](../getting-started/install.md)。

通过本教程，您将学习如何设置一个简单的 ClickHouse 集群。它将是小型的，但具备容错和可扩展性。然后我们将使用一个示例数据集填充数据，并执行一些演示查询。

## 集群部署 {#cluster-deployment}

这个 ClickHouse 集群将是一个同构集群。以下是步骤：

1.  在集群的所有机器上安装 ClickHouse 服务器。
2.  在配置文件中设置集群配置。
3.  在每个实例上创建本地表。
4.  创建一个 [分布式表](../engines/table-engines/special/distributed.md)。

一个 [分布式表](../engines/table-engines/special/distributed.md) 是对 ClickHouse 集群中本地表的一种“视图”。从分布式表中执行的 SELECT 查询将使用集群所有分片的资源。您可以为多个集群指定配置，并创建多个分布式表以提供不同集群的视图。

以下是一个包含三个分片、每个分片各有一个副本的集群的示例配置：

```xml
<remote_servers>
    <perftest_3shards_1replicas>
        <shard>
            <replica>
                <host>example-perftest01j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>example-perftest02j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>example-perftest03j.clickhouse.com</host>
                <port>9000</port>
            </replica>
        </shard>
    </perftest_3shards_1replicas>
</remote_servers>
```

为了进一步演示，让我们创建一个新的本地表，使用我们在单节点部署教程中为 `hits_v1` 使用的相同 `CREATE TABLE` 查询，但使用不同的表名：

```sql
CREATE TABLE tutorial.hits_local (...) ENGINE = MergeTree() ...
```

创建一个分布式表提供了对集群本地表的视图：

```sql
CREATE TABLE tutorial.hits_all AS tutorial.hits_local
ENGINE = Distributed(perftest_3shards_1replicas, tutorial, hits_local, rand());
```

一个常见的做法是在集群的所有机器上创建类似的分布式表。这允许在集群的任何机器上运行分布式查询。还有另一种选择是使用 [remote](../sql-reference/table-functions/remote.md) 表函数为给定的 SELECT 查询创建临时分布式表。

让我们向分布式表运行 [INSERT SELECT](../sql-reference/statements/insert-into.md)，以将表分发到多个服务器。

```sql
INSERT INTO tutorial.hits_all SELECT * FROM tutorial.hits_v1;
```

正如您所期望的，计算密集型查询如果利用 3 台服务器而不是一台，会运行 N 倍更快。

在这种情况下，我们使用一个包含 3 个分片的集群，每个分片包含一个副本。

为了在生产环境中提供弹性，我们建议每个分片包含 2-3 个副本，分布在多个可用区或数据中心（或至少机架）之间。请注意，ClickHouse 支持无限数量的副本。

以下是一个包含三个副本的单个分片集群的示例配置：

```xml
<remote_servers>
    ...
    <perftest_1shards_3replicas>
        <shard>
            <replica>
                <host>example-perftest01j.clickhouse.com</host>
                <port>9000</port>
             </replica>
             <replica>
                <host>example-perftest02j.clickhouse.com</host>
                <port>9000</port>
             </replica>
             <replica>
                <host>example-perftest03j.clickhouse.com</host>
                <port>9000</port>
             </replica>
        </shard>
    </perftest_1shards_3replicas>
</remote_servers>
```

要启用原生复制，需要 [ZooKeeper](http://zookeeper.apache.org/)。ClickHouse 负责所有副本的数据一致性，并在故障后自动运行恢复程序。建议在单独的服务器上部署 ZooKeeper 集群（该服务器上不应运行包括 ClickHouse 在内的其他进程）。

:::note 注意
ZooKeeper 不是严格要求：在某些简单情况下，您可以通过从应用程序代码将数据写入所有副本来复制数据。这种方法 **不** 推荐，因为在这种情况下，ClickHouse 无法保证所有副本的数据一致性。因此，这变成了您应用程序的责任。
:::

ZooKeeper 的位置在配置文件中指定：

```xml
<zookeeper>
    <node>
        <host>zoo01.clickhouse.com</host>
        <port>2181</port>
    </node>
    <node>
        <host>zoo02.clickhouse.com</host>
        <port>2181</port>
    </node>
    <node>
        <host>zoo03.clickhouse.com</host>
        <port>2181</port>
    </node>
</zookeeper>
```

此外，我们需要设置宏以识别创建表时使用的每个分片和副本：

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

如果在复制表创建时没有副本，将实例化一个新的首个副本。如果已经存在活动副本，新副本将从现有副本克隆数据。您可以选择先创建所有复制表，然后再向其中插入数据。另一种选择是创建一些副本，然后在数据插入后或期间添加其他副本。

```sql
CREATE TABLE tutorial.hits_replica (...)
ENGINE = ReplicatedMergeTree(
    '/clickhouse_perftest/tables/{shard}/hits',
    '{replica}'
)
...
```

这里我们使用 [ReplicatedMergeTree](../engines/table-engines/mergetree-family/replication.md) 表引擎。在参数中，我们指定了包含分片和副本标识符的 ZooKeeper 路径。

```sql
INSERT INTO tutorial.hits_replica SELECT * FROM tutorial.hits_local;
```

复制以多主模式运行。数据可以加载到任何副本中，然后系统会自动与其他实例同步。复制是异步的，因此在某一时刻，并非所有副本可能都包含最近插入的数据。至少应该有一个副本处于活动状态，以允许数据的摄入。其他副本将在重新激活后同步数据并修复一致性。请注意，这种方法在最近插入的数据丢失的可能性较低。
