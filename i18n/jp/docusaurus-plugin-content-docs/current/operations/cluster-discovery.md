---
description: 'ClickHouse におけるクラスタ検出に関するドキュメント'
sidebar_label: 'クラスタ検出'
slug: /operations/cluster-discovery
title: 'クラスタ検出'
doc_type: 'guide'
---



# クラスタディスカバリ



## 概要 {#overview}

ClickHouseのクラスタディスカバリ機能は、設定ファイルに明示的な定義を行うことなく、ノードが自動的に検出および登録を行えるようにすることで、クラスタ設定を簡素化します。各ノードを手動で定義することが煩雑になる場合に特に有用です。

:::note

クラスタディスカバリは実験的機能であり、将来のバージョンで変更または削除される可能性があります。
この機能を有効にするには、設定ファイルに`allow_experimental_cluster_discovery`設定を含めてください:

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

従来、ClickHouseでは、クラスタ内の各シャードとレプリカを設定ファイルに手動で指定する必要がありました:

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

### クラスタディスカバリーの使用 {#using-cluster-discovery}

クラスタディスカバリーを使用すると、各ノードを明示的に定義する代わりに、ZooKeeper内のパスを指定するだけで済みます。このパス配下にZooKeeperに登録されたすべてのノードは、自動的に検出されクラスタに追加されます。

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # オプションの設定パラメータ: -->

            <!-- ## クラスタ内の他のすべてのノードにアクセスするための認証情報: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### パスワードの代わりに、サーバー間シークレットを使用することもできます: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## 現在のノードのシャード(以下を参照): -->
            <!-- <shard>1</shard> -->

            <!-- ## オブザーバーモード(以下を参照): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

特定のノードにシャード番号を指定する場合は、`<discovery>`セクション内に`<shard>`タグを含めることができます:

`node1`と`node2`の場合:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

`node3`と`node4`の場合:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### オブザーバーモード {#observer-mode}

オブザーバーモードで設定されたノードは、レプリカとして自身を登録しません。
これらのノードは、積極的に参加することなく、クラスタ内の他のアクティブなレプリカを観察し検出するのみです。
オブザーバーモードを有効にするには、`<discovery>`セクション内に`<observer/>`タグを含めます:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### クラスタのディスカバリー {#discovery-of-clusters}

クラスタ内のホストだけでなく、クラスタ自体を追加および削除する必要がある場合があります。複数のクラスタのルートパスを持つ`<multicluster_root_path>`ノードを使用できます:

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

この場合、他のホストがパス`/clickhouse/discovery/some_new_cluster`で自身を登録すると、`some_new_cluster`という名前のクラスタが追加されます。

両方の機能を同時に使用できます。ホストは`my_cluster`クラスタに自身を登録し、他のクラスタを検出することができます:

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

- 同じ`remote_servers`サブツリー内で`<path>`と`<multicluster_root_path>`の両方を使用することはできません。
- `<multicluster_root_path>`は`<observer/>`と共にのみ使用できます。
- Keeperからのパスの最後の部分がクラスタ名として使用されますが、登録時にはXMLタグから名前が取得されます。


## ユースケースと制限事項 {#use-cases-and-limitations}

指定されたZooKeeperパスに対してノードが追加または削除されると、設定変更やサーバーの再起動なしに、クラスターから自動的に検出または削除されます。

ただし、変更はクラスター設定のみに影響し、データや既存のデータベース、テーブルには影響しません。

以下の3ノードクラスターの例を考えてみましょう:

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

次に、設定ファイルの`remote_servers`セクションに同じエントリを持つ新しいノードを起動し、クラスターに追加します:

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

4番目のノードはクラスターに参加していますが、テーブル`event_table`は最初の3つのノードにのみ存在します:

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

```


┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event&#95;table │
│ 92d3c04025e8 │ default  │ event&#95;table │
│ 8e62b9cb17a1 │ default  │ event&#95;table │
└──────────────┴──────────┴─────────────┘

```

すべてのノードでテーブルをレプリケートする必要がある場合は、クラスタディスカバリの代替として[Replicated](../engines/database-engines/replicated.md)データベースエンジンを使用できます。
```
