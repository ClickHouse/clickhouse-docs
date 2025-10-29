---
'description': 'Documentation for クラスター発見 in ClickHouse'
'sidebar_label': 'クラスター発見'
'slug': '/operations/cluster-discovery'
'title': 'クラスター発見'
'doc_type': 'guide'
---


# クラスター発見

## 概要 {#overview}

ClickHouseのクラスター発見機能は、ノードが明示的に構成ファイルに定義されることなく、自動的に発見して登録できるようにすることで、クラスターの構成を簡素化します。これは、各ノードを手動で定義することが煩雑になる場合に特に便利です。

:::note

クラスター発見は実験的な機能であり、将来のバージョンで変更または削除される可能性があります。
この機能を有効にするには、構成ファイルに`allow_experimental_cluster_discovery`設定を含めます。

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

従来、ClickHouseでは、クラスター内の各シャードとレプリカを構成に手動で指定する必要がありました。

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

### クラスター発見を使用する {#using-cluster-discovery}

クラスター発見を使用すると、各ノードを明示的に定義する代わりに、ZooKeeper内のパスを指定するだけで済みます。このパスに登録されたすべてのノードは自動的に発見され、クラスターに追加されます。

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

特定のノードにシャード番号を指定したい場合は、`<discovery>`セクション内に`<shard>`タグを含めることができます。

`node1`と`node2`の場合：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

`node3`と`node4`の場合：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### オブザーバーモード {#observer-mode}

オブザーバーモードで構成されたノードは、レプリカとして自分自身を登録しません。
アクティブな他のレプリカを観察し発見するだけで、積極的に参加することはありません。
オブザーバーモードを有効にするには、`<discovery>`セクション内に`<observer/>`タグを含めてください：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### クラスターの発見 {#discovery-of-clusters}

時には、クラスター内のホストだけでなく、クラスター自体を追加または削除する必要がある場合があります。複数のクラスターのルートパスを持つ`<multicluster_root_path>`ノードを使用できます。

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

この場合、別のホストが`/clickhouse/discovery/some_new_cluster`で自身を登録すると、`some_new_cluster`という名前のクラスターが追加されます。

両方の機能を同時に使用することができ、ホストはクラスター`my_cluster`に自身を登録し、他のクラスターを発見することができます：

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
- 同じ`remote_servers`サブツリー内で`<path>`と`<multicluster_root_path>`を両方使用することはできません。
- `<multicluster_root_path>`は`<observer/>`とのみ使用できます。
- Keeperからのパスの最後の部分がクラスター名として使用され、登録時にはXMLタグから名前が取られます。

## 使用例と制限事項 {#use-cases-and-limitations}

指定されたZooKeeperパスからノードが追加または削除されると、構成の変更やサーバーの再起動なしに自動的にクラスターから発見または削除されます。

ただし、変更はクラスターの構成にのみ影響を及ぼし、データや既存のデータベースおよびテーブルには影響しません。

以下に、ノード3つのクラスターの例を示します：

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

次に、新しいノードをクラスターに追加し、構成ファイルの`remote_servers`セクションに同じエントリを持つ新しいノードを起動します：

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

4番目のノードはクラスターに参加していますが、`event_table`テーブルはまだ最初の3つのノードにしか存在しません：

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event_table │
│ 92d3c04025e8 │ default  │ event_table │
│ 8e62b9cb17a1 │ default  │ event_table │
└──────────────┴──────────┴─────────────┘
```

すべてのノードにテーブルをレプリケートする必要がある場合は、クラスター発見の代わりに[Replicated](../engines/database-engines/replicated.md)データベースエンジンを使用することができます。
