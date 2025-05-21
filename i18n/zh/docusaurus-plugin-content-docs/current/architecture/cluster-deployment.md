---
'slug': '/architecture/cluster-deployment'
'sidebar_label': '集群部署'
'sidebar_position': 100
'title': '集群部署'
'description': '通过本教程，您将学习如何设置一个简单的 ClickHouse 集群。'
---



这个教程假定你已经设置好了一个 [本地 ClickHouse 服务器](../getting-started/install/install.mdx)。

通过学习这个教程，你将了解到如何设置一个简单的 ClickHouse 集群。这个集群将会很小，但具有容错性和可扩展性。接着，我们将使用一个示例数据集来填充数据并执行一些演示查询。

## 集群部署 {#cluster-deployment}

这个 ClickHouse 集群将是一个同质集群。以下是步骤：

1.  在集群的所有机器上安装 ClickHouse 服务器
2.  在配置文件中设置集群配置
3.  在每个实例上创建本地表
4.  创建一个 [分布式表](../engines/table-engines/special/distributed.md)

一个 [分布式表](../engines/table-engines/special/distributed.md) 是对 ClickHouse 集群中本地表的一种“视图”。来自分布式表的 SELECT 查询使用集群所有分片的资源执行。你可以为多个集群指定配置并创建多个分布式表，以提供不同集群的视图。

以下是一个示例配置，适用于有三个分片的集群，每个分片各有一个副本：

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

为了进一步演示，让我们创建一个新的本地表，使用与单节点部署教程中 `hits_v1` 相同的 `CREATE TABLE` 查询，但表名不同：

```sql
CREATE TABLE tutorial.hits_local (...) ENGINE = MergeTree() ...
```

创建一个分布式表可以提供对集群本地表的视图：

```sql
CREATE TABLE tutorial.hits_all AS tutorial.hits_local
ENGINE = Distributed(perftest_3shards_1replicas, tutorial, hits_local, rand());
```

一个常见的做法是在集群的所有机器上创建相似的分布式表。这允许在集群的任何机器上运行分布式查询。还有一个替代选项是为给定的 SELECT 查询使用 [remote](../sql-reference/table-functions/remote.md) 表函数创建临时分布式表。

让我们运行 [INSERT SELECT](../sql-reference/statements/insert-into.md) 将数据插入分布式表，以便将表分散到多个服务器。

```sql
INSERT INTO tutorial.hits_all SELECT * FROM tutorial.hits_v1;
```

如你所料，计算密集型查询如果利用 3 台服务器而不是一台，将运行 N 倍更快。

在这种情况下，我们使用一个包含 3 个分片的集群，每个分片包含一个副本。

为了在生产环境中提供弹性，我们建议每个分片包含 2-3 个副本，分布在多个可用区或数据中心（或至少机架）。请注意，ClickHouse 支持无限数量的副本。

以下是一个示例配置，适用于一个包含三个副本的分片集群：

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

为了启用原生复制，需要 [ZooKeeper](http://zookeeper.apache.org/)。ClickHouse 会自动处理所有副本的数据一致性，并在发生故障后自动运行恢复程序。建议将 ZooKeeper 集群部署在单独的服务器上（不运行任何其他包含 ClickHouse 的进程）。

:::note 注意
ZooKeeper 不是严格的要求：在某些简单情况下，你可以通过从应用程序代码中将数据写入所有副本来复制数据。这种方法**不**推荐，因为在这种情况下，ClickHouse 将无法保证所有副本的数据一致性。因此，这将成为你应用程序的责任。
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

此外，我们需要设置宏来识别每个分片和副本，这些宏在表创建时会用到：

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

如果在复制表创建时没有副本，将实例化一个新的首个副本。如果已经有活动的副本，新副本将克隆现有副本的数据。你可以先创建所有复制表，然后再插入数据。另一个选项是在插入数据期间或之后创建一些副本并添加其他副本。

```sql
CREATE TABLE tutorial.hits_replica (...)
ENGINE = ReplicatedMergeTree(
    '/clickhouse_perftest/tables/{shard}/hits',
    '{replica}'
)
...
```

在这里，我们使用 [ReplicatedMergeTree](../engines/table-engines/mergetree-family/replication.md) 表引擎。在参数中，我们指定包含分片和副本标识符的 ZooKeeper 路径。

```sql
INSERT INTO tutorial.hits_replica SELECT * FROM tutorial.hits_local;
```

复制以多主模式运行。数据可以加载到任何副本中，然后系统会自动与其他实例同步。复制是异步的，因此在某一时刻，并非所有副本都可能包含最近插入的数据。至少应该有一个副本处于活动状态以允许数据摄取。其他副本将在再次变为活动状态时同步数据并修复一致性。请注意，这种方法允许最近插入数据丢失的可能性较低。
