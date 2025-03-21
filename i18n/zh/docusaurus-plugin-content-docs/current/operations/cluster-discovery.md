---
slug: /operations/cluster-discovery
sidebar_label: 集群发现
---

# 集群发现

## 概述 {#overview}

ClickHouse 的集群发现功能通过允许节点自动发现并注册自己，而不需要在配置文件中显式定义，从而简化了集群配置。在需要手动定义每个节点变得繁琐的情况下，这尤其有利。

:::note

集群发现是一个实验性功能，未来版本中可能会更改或删除。
要启用此功能，请在配置文件中包含 `allow_experimental_cluster_discovery` 设置：

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

传统上，在 ClickHouse 中，集群中的每个分片和副本都需要在配置中手动指定：

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

通过集群发现，不需要显式定义每个节点，只需在 ZooKeeper 中指定一个路径。所有在此路径下注册的节点将被自动发现并添加到集群中。

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # 可选配置参数: -->

            <!-- ## 访问集群中所有其他节点的身份验证凭据: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### 可替代密码使用的互相服务器密钥: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## 当前节点的分片 (见下): -->
            <!-- <shard>1</shard> -->

            <!-- ## 观察者模式 (见下): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

如果您想为特定节点指定分片编号，可以在 `<discovery>` 部分中包含 `<shard>` 标签：

对于 `node1` 和 `node2`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

对于 `node3` 和 `node4`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### 观察者模式 {#observer-mode}

在观察者模式中配置的节点不会将自己注册为副本。
它们仅观察并发现集群中其他活动副本而不主动参与。
要启用观察者模式，请在 `<discovery>` 部分中包含 `<observer/>` 标签：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```


## 用例和限制 {#use-cases-and-limitations}

随着节点从指定的 ZooKeeper 路径中添加或移除，它们将被自动发现或从集群中移除，而无需进行配置更改或服务器重启。

但是，变更仅影响集群配置，不影响数据或现有的数据库和表。

考虑以下示例，其中集群由 3 个节点组成：

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

然后，我们向集群添加一个新节点，在配置文件的 `remote_servers` 部分中以相同的条目启动新节点：

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

第四个节点正在参与集群，但 `event_table` 表仍然仅存在于前三个节点上：

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event_table │
│ 92d3c04025e8 │ default  │ event_table │
│ 8e62b9cb17a1 │ default  │ event_table │
└──────────────┴──────────┴─────────────┘
```

如果您需要在所有节点上复制表，可以使用 [Replicated](../engines/database-engines/replicated.md) 数据库引擎替代集群发现。
