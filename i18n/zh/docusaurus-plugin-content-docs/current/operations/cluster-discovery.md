---
description: 'ClickHouse 集群发现文档'
sidebar_label: '集群发现'
slug: /operations/cluster-discovery
title: '集群发现'
doc_type: 'guide'
---

# 发现集群 {#cluster-discovery}

## 概述 {#overview}

ClickHouse 的集群发现（Cluster Discovery）功能通过允许节点在无需在配置文件中显式定义的情况下自动发现并注册自身，从而简化了集群配置。当需要手动定义每个节点变得繁琐时，这一功能尤其有用。

:::note

集群发现是实验性功能，在未来版本中可能会被更改或移除。
要启用它，请在配置文件中加入 `allow_experimental_cluster_discovery` 设置：

```xml
<clickhouse>
    <!-- ... -->
    <allow_experimental_cluster_discovery>1</allow_experimental_cluster_discovery>
    <!-- ... -->
</clickhouse>
```

:::

## 远程服务器配置 {#remote-servers-configuration}

### 传统的手动配置方式 {#traditional-manual-configuration}

在过去，ClickHouse 集群中的每个分片和副本都需要在配置中手动指定：

```xml
<remote_servers>
    <cluster_name>
        <shard>
            <replica>
                <host>node1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>node2</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>node3</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>node4</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_name>
</remote_servers>

```

### 使用集群发现 {#using-cluster-discovery}

通过集群发现（Cluster Discovery），你无需显式定义每个节点，只需在 ZooKeeper 中指定一个路径。注册到该路径下的所有节点都会被自动发现并加入集群。

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # Optional configuration parameters: -->

            <!-- ## Authentication credentials to access all other nodes in cluster: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### Alternatively to password, interserver secret may be used: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## Shard for current node (see below): -->
            <!-- <shard>1</shard> -->

            <!-- ## Observer mode (see below): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

若要为某个特定节点指定分片编号，可以在 `<discovery>` 部分中添加 `<shard>` 标签：

对于 `node1` 和 `node2`：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

针对 `node3` 和 `node4`：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### 观察者模式 {#observer-mode}

以观察者模式配置的节点不会将自身注册为副本。
它们只会在集群中观察并发现其他活动副本，而不会主动参与。
要启用观察者模式，请在 `<discovery>` 配置段中添加 `<observer/>` 标签：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### 集群发现 {#discovery-of-clusters}

有时你可能不仅需要在集群中添加或删除主机，还需要添加或删除整个集群本身。你可以使用 `<multicluster_root_path>` 节点，将其作为多个集群的根路径：

```xml
<remote_servers>
    <some_unused_name>
        <discovery>
            <multicluster_root_path>/clickhouse/discovery</multicluster_root_path>
            <observer/>
        </discovery>
    </some_unused_name>
</remote_servers>
```

在这种情况下，当其他主机使用路径 `/clickhouse/discovery/some_new_cluster` 注册自身时，将会添加一个名为 `some_new_cluster` 的集群。

你可以同时使用这两种功能：该主机既可以在集群 `my_cluster` 中注册自身，又可以发现任何其他集群：

```xml
<remote_servers>
    <my_cluster>
        <discovery>
            <path>/clickhouse/discovery/my_cluster</path>
        </discovery>
    </my_cluster>
    <some_unused_name>
        <discovery>
            <multicluster_root_path>/clickhouse/discovery</multicluster_root_path>
            <observer/>
        </discovery>
    </some_unused_name>
</remote_servers>
```

限制：

* 在同一个 `remote_servers` 子树中不能同时使用 `<path>` 和 `<multicluster_root_path>`。
* `<multicluster_root_path>` 只能与 `<observer/>` 搭配使用。
* 来自 Keeper 的路径最后一段会被用作集群名称，而在注册时，名称是从 XML 标签中获取的。

## 使用场景和限制 {#use-cases-and-limitations}

当在指定的 ZooKeeper 路径下添加或移除节点时，这些节点会在无需修改配置或重启服务器的情况下被自动发现或从集群中移除。

但需要注意，更改只会影响集群配置，不会影响数据或现有的数据库与表。

考虑以下示例：该集群包含 3 个节点：

```xml
<remote_servers>
    <default>
        <discovery>
            <path>/clickhouse/discovery/default_cluster</path>
        </discovery>
    </default>
</remote_servers>
```

```sql
SELECT * EXCEPT (default_database, errors_count, slowdowns_count, estimated_recovery_time, database_shard_name, database_replica_name)
FROM system.clusters WHERE cluster = 'default';

┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

```sql
CREATE TABLE event_table ON CLUSTER default (event_time DateTime, value String)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/event_table', '{replica}')
ORDER BY event_time PARTITION BY toYYYYMM(event_time);

INSERT INTO event_table ...
```

然后，我们向集群中添加一个新节点，即启动一个其配置文件中 `remote_servers` 部分包含相同条目的节点：

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

第四个节点已参与集群，但 `event_table` 表仍然只存在于前三个节点上：

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event_table │
│ 92d3c04025e8 │ default  │ event_table │
│ 8e62b9cb17a1 │ default  │ event_table │
└──────────────┴──────────┴─────────────┘
```

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event&#95;table │
│ 92d3c04025e8 │ default  │ event&#95;table │
│ 8e62b9cb17a1 │ default  │ event&#95;table │
└──────────────┴──────────┴─────────────┘

```

如果需要在所有节点上复制表,可以使用 [Replicated](../engines/database-engines/replicated.md) 数据库引擎来替代集群发现功能。
```
