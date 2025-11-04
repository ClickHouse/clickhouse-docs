---
'description': 'ClickHouse 中集群发现的 Documentation'
'sidebar_label': '集群发现'
'slug': '/operations/cluster-discovery'
'title': '集群发现'
'doc_type': 'guide'
---


# 集群发现

## 概述 {#overview}

ClickHouse 的集群发现功能通过允许节点自动发现并注册自己，简化了集群配置，而无需在配置文件中显式定义。这在手动定义每个节点变得繁琐的情况下特别有用。

:::note

集群发现是一个实验性功能，可能会在未来版本中更改或删除。
要启用它，请在配置文件中包含 `allow_experimental_cluster_discovery` 设置：

```xml
<clickhouse>
    <!-- ... -->
    <allow_experimental_cluster_discovery>1</allow_experimental_cluster_discovery>
    <!-- ... -->
</clickhouse>
```
:::

## 远程服务器配置 {#remote-servers-configuration}

### 传统手动配置 {#traditional-manual-configuration}

在 ClickHouse 中，传统上需要手动在配置中指定集群中的每个分片和副本：

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

通过集群发现，你只需在 ZooKeeper 中指定一个路径，而无需显式定义每个节点。所有在 ZooKeeper 中该路径下注册的节点将被自动发现并添加到集群中。

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

如果你想为特定节点指定一个分片号，可以在 `<discovery>` 部分中包含 `<shard>` 标签：

对于 `node1` 和 `node2`：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

对于 `node3` 和 `node4`：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### 观察者模式 {#observer-mode}

在观察者模式下配置的节点不会将自己注册为副本。
它们将仅观察并发现集群中其他活动的副本，而不积极参与。
要启用观察者模式，请在 `<discovery>` 部分中包含 `<observer/>` 标签：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### 集群发现 {#discovery-of-clusters}

有时你可能需要添加和删除的不仅仅是集群中的主机，还有集群本身。你可以使用 `<multicluster_root_path>` 节点和多个集群的根路径：

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

在这种情况下，当其他主机使用路径 `/clickhouse/discovery/some_new_cluster` 注册时，将添加一个名为 `some_new_cluster` 的集群。

你可以同时使用这两个功能，主机可以在集群 `my_cluster` 中注册自己并发现其他任何集群：

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
- 你不能在同一 `remote_servers` 子树中同时使用 `<path>` 和 `<multicluster_root_path>`。
- `<multicluster_root_path>` 只能与 `<observer/>` 一起使用。
- Keeper 的路径最后一部分用作集群名称，而注册时名称是从 XML 标签中获取的。

## 用例和限制 {#use-cases-and-limitations}

随着节点从指定的 ZooKeeper 路径添加或删除，它们会被自动发现或从集群中删除，而无需进行配置更改或服务器重启。

然而，变化只影响集群配置，而不影响数据或现有的数据库和表。

考虑以下一个由 3 个节点组成的集群示例：

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

然后，我们向集群添加一个新节点，启动一个在配置文件中与 `remote_servers` 部分相同项的新节点：

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

第四个节点参与了集群，但表 `event_table` 仍然只存在于前三个节点上：

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event_table │
│ 92d3c04025e8 │ default  │ event_table │
│ 8e62b9cb17a1 │ default  │ event_table │
└──────────────┴──────────┴─────────────┘
```

如果你需要在所有节点上复制表，可以使用 [Replicated](../engines/database-engines/replicated.md) 数据库引擎替代集群发现。
