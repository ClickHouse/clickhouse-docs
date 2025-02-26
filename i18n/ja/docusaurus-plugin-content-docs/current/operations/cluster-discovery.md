---
slug: /operations/cluster-discovery
sidebar_label: クラスターの発見
---
# クラスターの発見

## 概要 {#overview}

ClickHouseのクラスター発見機能は、ノードが設定ファイルに明示的に定義されることなく、 自動的に発見されて登録されることを可能にすることで、クラスターの構成を簡素化します。これは、各ノードの手動定義が煩雑になる場合に特に有益です。

:::note

クラスター発見は実験的な機能であり、将来のバージョンで変更または削除される可能性があります。
これを有効にするには、設定ファイルに `allow_experimental_cluster_discovery` 設定を含めてください：

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

従来のClickHouseでは、クラスター内の各シャードとレプリカを手動で設定する必要がありました：

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

### クラスター発見の使用 {#using-cluster-discovery}

クラスター発見を使用すると、各ノードを明示的に定義する代わりに、ZooKeeper内のパスを指定するだけです。このパスに登録されたすべてのノードは自動的に発見され、クラスターに追加されます。

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # オプションの構成パラメータ： -->

            <!-- ## クラスター内の他のすべてのノードにアクセスするための認証情報： -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### パスワードの代わりに、インタサーバーシークレットを使用できます： -->
            <!-- <secret>secret123</secret> -->

            <!-- ## 現在のノード用のシャード（下記参照）： -->
            <!-- <shard>1</shard> -->

            <!-- ## 観察者モード（下記参照）： -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

特定のノードのシャード番号を指定する必要がある場合は、`<discovery>` セクション内に `<shard>` タグを含めることができます：

`node1` と `node2` の場合：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

`node3` と `node4` の場合：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### 観察者モード {#observer-mode}

観察者モードで構成されたノードは、レプリカとして自らを登録しません。
それらは、能動的に参加することなく、クラスター内の他のアクティブなレプリカを観察し、発見するのみです。
観察者モードを有効にするには、`<discovery>` セクション内に `<observer/>` タグを含めてください：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

## ユースケースと制限事項 {#use-cases-and-limitations}

指定されたZooKeeperパスからノードが追加または削除されると、自動的にクラスターへの発見または削除が行われ、設定変更やサーバーの再起動は不要です。

ただし、変更はクラスター構成にのみ影響し、データや既存のデータベースおよびテーブルには影響を与えません。

次の例を考えてみましょう。3つのノードからなるクラスターがあります：

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

4番目のノードがクラスターに参加していますが、`event_table` テーブルは最初の3つのノードにのみ存在します：

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event_table │
│ 92d3c04025e8 │ default  │ event_table │
│ 8e62b9cb17a1 │ default  │ event_table │
└──────────────┴──────────┴─────────────┘
```

すべてのノードにテーブルをレプリケートする必要がある場合は、クラスター発見の代わりに [Replicated](../engines/database-engines/replicated.md) データベースエンジンを使用することができます。
