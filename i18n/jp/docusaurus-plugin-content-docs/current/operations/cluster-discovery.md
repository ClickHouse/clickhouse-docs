---
description: 'ClickHouse におけるクラスター検出のドキュメント'
sidebar_label: 'クラスター検出'
slug: '/operations/cluster-discovery'
title: 'クラスター検出'
---




# クラスター検出

## 概要 {#overview}

ClickHouseのクラスター検出機能は、ノードが自動的に自分自身を発見し登録できるようにすることで、クラスターの構成を簡素化します。これにより、構成ファイルに明示的に定義する必要がなくなり、各ノードの手動定義が煩雑になる場合に特に有益です。

:::note

クラスター検出は実験的な機能であり、将来のバージョンで変更または削除される可能性があります。
これを有効にするには、構成ファイルに `allow_experimental_cluster_discovery` 設定を含めてください：

```xml
<clickhouse>
    <!-- ... -->
    <allow_experimental_cluster_discovery>1</allow_experimental_cluster_discovery>
    <!-- ... -->
</clickhouse>
```
:::

## リモートサーバーの構成 {#remote-servers-configuration}

### 従来の手動構成 {#traditional-manual-configuration}

従来、ClickHouseでは、クラスター内の各シャードおよびレプリカを構成に手動で指定する必要がありました：

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

### クラスター検出の使用 {#using-cluster-discovery}

クラスター検出を使用すると、各ノードを明示的に定義するのではなく、ZooKeeper内のパスを指定するだけで済みます。このパスの下に登録されているすべてのノードは、自動的に発見され、クラスターに追加されます。

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # オプションの構成パラメーター: -->

            <!-- ## クラスター内の他のすべてのノードにアクセスするための認証資格情報: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### パスワードの代わりにインタサーバーシークレットを使用することもできます: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## 現在のノードのシャード (下記参照): -->
            <!-- <shard>1</shard> -->

            <!-- ## 観察者モード (下記参照): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

特定のノードにシャード番号を指定したい場合は、`<discovery>` セクション内に `<shard>` タグを含めることができます：

`node1` および `node2` の場合：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

`node3` および `node4` の場合：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### 観察者モード {#observer-mode}


観察者モードで構成されたノードは、自分自身をレプリカとして登録しません。
彼らは、アクティブなレプリカを観察し発見するだけで、積極的に参加しません。
観察者モードを有効にするには、`<discovery>` セクション内に `<observer/>` タグを含めます：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```


### クラスターの発見 {#discovery-of-clusters}

時には、クラスター内のホストだけでなく、クラスター自体を追加および削除する必要がある場合があります。複数のクラスター用にルートパスを持つ `<multicluster_root_path>` ノードを使用できます：

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

この場合、他のホストが `/clickhouse/discovery/some_new_cluster` で自分を登録すると、`some_new_cluster` という名前のクラスターが追加されます。

これらの機能を同時に使用することもでき、ホストはクラスター `my_cluster` に自分を登録し、他のクラスターを発見することができます：

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

制限事項：
- 同じ `remote_servers` サブツリー内で `<path>` と `<multicluster_root_path>` の両方を使用することはできません。
- `<multicluster_root_path>` は `<observer/>` とだけ使用できます。
- Keeperからのパスの最後の部分はクラスタ名として使用され、登録中はXMLタグから名前が取得されます。



## 使用例と制限事項 {#use-cases-and-limitations}

指定されたZooKeeperパスからノードが追加または削除されると、それらは自動的に発見されたり、クラスタから削除されたりします。構成の変更やサーバーの再起動は必要ありません。

ただし、変更はクラスター構成のみに影響し、データや既存のデータベースおよびテーブルには影響しません。

次の例を考えてみましょう。3ノードのクラスターが組織されています：

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

その後、クラスターに新しいノードを追加し、構成ファイルの `remote_servers` セクションに同じエントリを持つ新しいノードを起動します：

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

4番目のノードはクラスターに参加していますが、テーブル `event_table` は依然として最初の3つのノードにのみ存在します：

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event_table │
│ 92d3c04025e8 │ default  │ event_table │
│ 8e62b9cb17a1 │ default  │ event_table │
└──────────────┴──────────┴─────────────┘
```

すべてのノードにテーブルを複製する必要がある場合は、クラスター検出の代わりに [Replicated](../engines/database-engines/replicated.md) データベースエンジンを使用できます。
