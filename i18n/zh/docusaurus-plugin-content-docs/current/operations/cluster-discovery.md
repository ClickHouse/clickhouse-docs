---
description: 'ClickHouse 集群发现功能文档'
sidebar_label: '集群发现'
slug: /operations/cluster-discovery
title: '集群发现'
doc_type: 'guide'
---



# 集群发现



## 概述 {#overview}

ClickHouse 的集群发现功能通过允许节点自动发现并注册自身来简化集群配置,无需在配置文件中显式定义。当手动定义每个节点变得繁琐时,此功能尤其有用。

:::note

集群发现是一项实验性功能,可能会在未来版本中更改或移除。
要启用该功能,请在配置文件中包含 `allow_experimental_cluster_discovery` 设置:

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

传统上,在 ClickHouse 中,集群中的每个分片和副本都需要在配置中手动指定:

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

使用集群发现功能,无需显式定义每个节点,只需在 ZooKeeper 中指定一个路径即可。所有在 ZooKeeper 中此路径下注册的节点都将被自动发现并添加到集群中。

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # 可选配置参数: -->

            <!-- ## 访问集群中所有其他节点的身份验证凭据: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### 作为密码的替代方案,可以使用服务器间密钥: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## 当前节点的分片(见下文): -->
            <!-- <shard>1</shard> -->

            <!-- ## 观察者模式(见下文): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

如果要为特定节点指定分片编号,可以在 `<discovery>` 部分中包含 `<shard>` 标签:

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

配置为观察者模式的节点不会将自己注册为副本。
它们仅观察和发现集群中的其他活动副本,而不主动参与。
要启用观察者模式,请在 `<discovery>` 部分中包含 `<observer/>` 标签:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### 集群发现 {#discovery-of-clusters}

有时您可能需要添加和删除的不仅是集群中的主机,还包括集群本身。您可以使用 `<multicluster_root_path>` 节点为多个集群指定根路径:

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

在这种情况下,当其他主机使用路径 `/clickhouse/discovery/some_new_cluster` 注册自己时,将添加名为 `some_new_cluster` 的集群。

您可以同时使用这两个功能,主机可以在集群 `my_cluster` 中注册自己并发现任何其他集群:

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

限制:

- 不能在同一个 `remote_servers` 子树中同时使用 `<path>` 和 `<multicluster_root_path>`。
- `<multicluster_root_path>` 只能与 `<observer/>` 一起使用。
- 来自 Keeper 的路径的最后一部分用作集群名称,而在注册期间名称取自 XML 标签。


## 使用场景和限制 {#use-cases-and-limitations}

当从指定的 ZooKeeper 路径中添加或移除节点时,这些节点会自动被发现或从集群中移除,无需更改配置或重启服务器。

但是,这些变更仅影响集群配置,不会影响数据或现有的数据库和表。

考虑以下包含 3 个节点的集群示例:

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

然后,我们向集群添加一个新节点,在配置文件的 `remote_servers` 部分使用相同的条目启动新节点:

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

第四个节点已加入集群,但表 `event_table` 仍然只存在于前三个节点上:

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

```


┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event&#95;table │
│ 92d3c04025e8 │ default  │ event&#95;table │
│ 8e62b9cb17a1 │ default  │ event&#95;table │
└──────────────┴──────────┴─────────────┘

```

如果需要在所有节点上复制表,您可以使用 [Replicated](../engines/database-engines/replicated.md) 数据库引擎来替代集群发现功能。
```
