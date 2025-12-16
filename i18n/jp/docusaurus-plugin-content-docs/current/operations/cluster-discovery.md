---
description: 'ClickHouse のクラスターディスカバリに関するドキュメント'
sidebar_label: 'クラスターディスカバリ'
slug: /operations/cluster-discovery
title: 'クラスターディスカバリ'
doc_type: 'ガイド'
---

# クラスターディスカバリ {#cluster-discovery}

## 概要 {#overview}

ClickHouse の Cluster Discovery 機能は、ノードを設定ファイル内で明示的に定義しなくても、自動的に検出して登録できるようにすることで、クラスタの構成を簡素化します。これは、各ノードを手動で定義することが負担になる場合に特に有用です。

:::note

Cluster Discovery は実験的な機能であり、将来のバージョンで変更または削除される可能性があります。
この機能を有効にするには、設定ファイルに `allow_experimental_cluster_discovery` 設定項目を追加してください。

```xml
<clickhouse>
    <!-- ... -->
    <allow_experimental_cluster_discovery>1</allow_experimental_cluster_discovery>
    <!-- ... -->
</clickhouse>
```

:::

## リモートサーバーの設定 {#remote-servers-configuration}

### 従来の手動設定 {#traditional-manual-configuration}

従来は ClickHouse では、クラスタ内の各シャードおよびレプリカを設定ファイルで手動指定する必要がありました。

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

### クラスター検出を使用する {#using-cluster-discovery}

Cluster Discovery を使用すると、各ノードを明示的に定義する代わりに、ZooKeeper 内のパスを 1 つ指定するだけで済みます。ZooKeeper のそのパス配下に登録されたすべてのノードは、自動的に検出されてクラスターに追加されます。

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

特定のノードに対してシャード番号を指定したい場合は、`<discovery>` セクション内に `<shard>` タグを記述できます。

`node1` および `node2` の場合:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

`node3` および `node4` の場合:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### オブザーバーモード {#observer-mode}

オブザーバーモードで構成されたノードは、自身をレプリカとして登録しません。
これらのノードはクラスター内の他のアクティブなレプリカを監視・検出するだけで、能動的には参加しません。
オブザーバーモードを有効にするには、`<discovery>` セクション内に `<observer/>` タグを追加します。

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### クラスターの検出 {#discovery-of-clusters}

場合によっては、クラスター内のホストだけでなく、クラスター自体を追加・削除する必要が生じることがあります。複数のクラスターのルートパスを指定するために `<multicluster_root_path>` ノードを使用できます。

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

この場合、別のホストがパス `/clickhouse/discovery/some_new_cluster` で自分自身を登録すると、名前が `some_new_cluster` のクラスタが追加されます。

両方の機能を同時に使用できます。ホストはクラスタ `my_cluster` に自分自身を登録しつつ、他の任意のクラスタを検出することもできます。

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

制限事項:

* 同じ `remote_servers` サブツリー内で `<path>` と `<multicluster_root_path>` を同時に使用することはできません。
* `<multicluster_root_path>` と併用できるのは `<observer/>` のみです。
* Keeper で指定されたパスの最後の部分がクラスタ名として使用されますが、登録時には XML タグに記載された名前が使用されます。

## ユースケースと制限事項 {#use-cases-and-limitations}

指定された ZooKeeper パスにノードが追加または削除されると、構成変更やサーバーの再起動を行うことなく、それらのノードはクラスターに自動的に認識されて参加するか、クラスターから削除されます。

ただし、変更の対象はクラスター構成のみであり、データや既存のデータベースおよびテーブルには影響しません。

3 ノードのクラスターを用いた次の例を考えます。

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

次に、クラスターに新しいノードを追加します。設定ファイルの `remote_servers` セクションに同じエントリを含めて、新しいノードを起動します。

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

4 番目のノードはクラスターに参加していますが、テーブル `event_table` は依然として最初の 3 つのノードにしか存在していません。

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock
```

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event&#95;table │
│ 92d3c04025e8 │ default  │ event&#95;table │
│ 8e62b9cb17a1 │ default  │ event&#95;table │
└──────────────┴──────────┴─────────────┘

```

すべてのノードでテーブルをレプリケートする必要がある場合は、クラスタディスカバリの代替として[Replicated](../engines/database-engines/replicated.md)データベースエンジンを使用することができます。
```
