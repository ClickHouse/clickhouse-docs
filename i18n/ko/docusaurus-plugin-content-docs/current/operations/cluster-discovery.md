---
description: 'ClickHouse 클러스터 디스커버리에 대한 문서'
sidebar_label: '클러스터 디스커버리'
slug: /operations/cluster-discovery
title: '클러스터 디스커버리'
doc_type: 'guide'
---

# 클러스터 디스커버리 \{#cluster-discovery\}

## 개요 \{#overview\}

ClickHouse의 Cluster Discovery 기능은 노드를 설정 파일에서 명시적으로 정의할 필요 없이, 각 노드가 자동으로 서로를 발견하고 자체적으로 등록하도록 하여 클러스터 구성을 단순화합니다. 이는 각 노드를 수동으로 정의하는 작업이 번거로워지는 경우에 특히 유용합니다.

:::note

Cluster Discovery는 실험적 기능이며, 향후 버전에서 변경되거나 제거될 수 있습니다.
이 기능을 활성화하려면 설정 파일에 `allow_experimental_cluster_discovery` 설정을 포함하십시오:

```xml
<clickhouse>
    <!-- ... -->
    <allow_experimental_cluster_discovery>1</allow_experimental_cluster_discovery>
    <!-- ... -->
</clickhouse>
```

:::

## 원격 서버 구성 \{#remote-servers-configuration\}

### 전통적인 수동 구성 \{#traditional-manual-configuration\}

기존에는 ClickHouse에서 클러스터의 각 세그먼트와 레플리카를 구성 파일에 수동으로 정의해야 했습니다:

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

### 클러스터 디스커버리 사용 \{#using-cluster-discovery\}

Cluster Discovery 기능을 사용하면 각 노드를 명시적으로 정의하는 대신 ZooKeeper에서 경로만 지정하면 됩니다. ZooKeeper에서 이 경로 아래에 등록되는 모든 노드는 자동으로 감지되어 클러스터에 추가됩니다.

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

특정 노드에 대해 세그먼트 번호를 지정하려면 `<discovery>` 섹션 안에 `<shard>` 태그를 포함합니다:

`node1` 및 `node2`의 경우:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

`node3` 및 `node4`용:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### Observer 모드 \{#observer-mode\}

Observer 모드로 구성된 노드는 자신을 레플리카로 등록하지 않습니다.
클러스터에서 다른 활성 레플리카를 관찰하고 발견만 할 뿐, 직접적으로 참여하지 않습니다.
Observer 모드를 활성화하려면 `<discovery>` 섹션 내부에 `<observer/>` 태그를 포함하십시오:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### 클러스터 검색 \{#discovery-of-clusters\}

클러스터 내의 호스트뿐 아니라 클러스터 자체를 추가하거나 제거해야 하는 경우가 있습니다. 이때 여러 클러스터의 루트 경로를 지정할 수 있는 `<multicluster_root_path>` 노드를 사용할 수 있습니다:

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

이 경우 다른 호스트가 경로 `/clickhouse/discovery/some_new_cluster`에 자신을 등록하면 `some_new_cluster`라는 이름을 가진 클러스터가 추가됩니다.

두 기능은 동시에 사용할 수 있으며, 호스트는 클러스터 `my_cluster`에 자신을 등록하고 다른 클러스터들도 발견할 수 있습니다:

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

제한 사항:

* 동일한 `remote_servers` 하위 트리에서 `<path>`와 `<multicluster_root_path>`를 동시에 사용할 수 없습니다.
* `<multicluster_root_path>`는 `<observer/>`와 함께 사용하는 경우에만 허용됩니다.
* Keeper에서 가져온 경로의 마지막 부분이 클러스터 이름으로 사용되며, 클러스터를 등록할 때는 XML 태그에서 이름을 가져옵니다.

## 사용 사례 및 제한 사항 \{#use-cases-and-limitations\}

지정된 ZooKeeper 경로에 노드가 추가되거나 제거되면, 설정 변경이나 서버 재시작 없이도 클러스터에서 자동으로 인식되거나 제거됩니다.

하지만 이러한 변경 사항은 클러스터 구성에만 영향을 주며, 데이터나 기존 데이터베이스 및 테이블에는 영향을 주지 않습니다.

다음은 3개의 노드로 구성된 클러스터 예시입니다.

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

그런 다음 구성 파일의 `remote_servers` 섹션에 동일한 항목을 지정하여 클러스터에 추가할 새 노드를 시작합니다.

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

네 번째 노드는 클러스터에 참여하고 있지만 `event_table` 테이블은 여전히 앞의 세 노드에만 존재합니다:

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock
```

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event&#95;table │
│ 92d3c04025e8 │ default  │ event&#95;table │
│ 8e62b9cb17a1 │ default  │ event&#95;table │
└──────────────┴──────────┴─────────────┘

```

If you need to have tables replicated on all the nodes, you may use the [Replicated](../engines/database-engines/replicated.md) database engine in alternative to cluster discovery.
```
