---
description: 'ClickHouseにおけるクラスタ発見のドキュメント'
sidebar_label: 'クラスタ発見'
slug: /operations/cluster-discovery
title: 'クラスタ発見'
---


# クラスタ発見

## 概要 {#overview}

ClickHouseのクラスタ発見機能は、ノードが自動的に発見されて登録されることを可能にし、クラスタの構成を簡素化します。これにより、構成ファイルでの明示的な定義が不要になるため、各ノードの手動定義が煩雑になる場合に特に便利です。

:::note

クラスタ発見は実験的な機能であり、将来のバージョンで変更または削除される可能性があります。
有効にするには、構成ファイルに `allow_experimental_cluster_discovery` 設定を追加してください：

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

従来、ClickHouseでは、クラスタ内の各シャードとレプリカを手動で構成する必要がありました：

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

### クラスタ発見の使用 {#using-cluster-discovery}

クラスタ発見を使用することで、各ノードを明示的に定義するのではなく、ZooKeeper内でパスを指定するだけで済みます。このパスに登録されたすべてのノードは、自動的に発見され、クラスタに追加されます。

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # オプションの構成パラメータ: -->

            <!-- ## クラスタ内の他のノードにアクセスするための認証情報: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### パスワードの代わりにインタサーバー秘密を使用することもできます: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## 現在のノードのシャード（下記参照）: -->
            <!-- <shard>1</shard> -->

            <!-- ## オブザーバーモード（下記参照）: -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

特定のノードのシャード番号を指定したい場合は、`<discovery>`セクション内に`<shard>`タグを含めることができます：

`node1` および `node2`の場合：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

`node3` および `node4`の場合：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### オブザーバーモード {#observer-mode}

オブザーバーモードで構成されたノードは、レプリカとして自分自身を登録しません。
彼らは、アクティブなレプリカを発見して観察するのみで、積極的に参加することはありません。
オブザーバーモードを有効にするには、`<discovery>`セクションに`<observer/>`タグを含めてください：

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### クラスタの発見 {#discovery-of-clusters}

時には、クラスタ内のホストだけでなく、クラスタ自体を追加または削除する必要があります。いくつかのクラスタ用のルートパスを持つ`<multicluster_root_path>`ノードを使用できます：

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

この場合、他のホストが`/clickhouse/discovery/some_new_cluster`のパスで登録されると、`some_new_cluster`という名前のクラスタが追加されます。

両方の機能を同時に使用することができ、ホストは`my_cluster`に登録し、他のクラスタを発見することができます：

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
- 同じ`remote_servers`サブツリー内で`<path>`と`<multicluster_root_path>`の両方を使用することはできません。
- `<multicluster_root_path>`は`<observer/>`と共にのみ使用できます。
- Keeperからのパスの最後の部分はクラスタ名として使用され、登録時にその名前はXMLタグから取得されます。

## ユースケースと制限事項 {#use-cases-and-limitations}

指定されたZooKeeperパスからノードが追加または削除されると、自動的にクラスタから発見または削除され、構成変更やサーバー再起動は不要です。

ただし、変更はクラスタの構成にのみ影響し、データや既存のデータベースやテーブルには影響しません。

次の例を考えてみましょう。クラスタには3つのノードがあります：

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

次に、クラスタに新しいノードを追加し、構成ファイルの`remote_servers`セクションに同じエントリを持つ新しいノードを起動します：

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

第四のノードはクラスタに参加していますが、`event_table`テーブルは依然として最初の3つのノードにのみ存在します：

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event_table │
│ 92d3c04025e8 │ default  │ event_table │
│ 8e62b9cb17a1 │ default  │ event_table │
└──────────────┴──────────┴─────────────┘
```

すべてのノードでテーブルを複製したい場合は、クラスタ発見の代わりに [Replicated](../engines/database-engines/replicated.md) データベースエンジンを使用することができます。
