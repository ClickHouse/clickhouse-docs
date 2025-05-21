---
slug: /architecture/horizontal-scaling
sidebar_label: 'スケーリングアウト'
sidebar_position: 10
title: 'スケーリングアウト'
description: 'スケーラビリティを提供するように設計されたアーキテクチャの例を説明するページ'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import scalingOut1 from '@site/static/images/deployment-guides/scaling-out-1.png';

## 説明 {#description}
この例のアーキテクチャはスケーラビリティを提供することを目的としています。 それは、2つの統合された ClickHouse サーバー（ClickHouse Keeper を含む）と、クォーラムの3を完成させるための単独の ClickHouse Keeper サーバー、合計で3つのノードを含んでいます。この例を使って、データを両方のノードでクエリできるデータベース、テーブル、分散テーブルを作成します。

## レベル: 基本 {#level-basic}

<ReplicationShardingTerminology />

## 環境 {#environment}
### アーキテクチャ図 {#architecture-diagram}

<Image img={scalingOut1} size='md' alt='2つのシャードと1つのレプリカのアーキテクチャ図' />

|ノード|説明|
|----|-----------|
|`chnode1`|データ + ClickHouse Keeper|
|`chnode2`|データ + ClickHouse Keeper|
|`chnode3`|ClickHouse Keeper のクォーラム用|

:::note
運用環境では、ClickHouse Keeper が専用のホストで実行されることを強くお勧めします。この基本設定は、ClickHouse サーバープロセス内で Keeper の機能を実行します。ClickHouse Keeper をスタンドアロンで展開するための手順は、[インストール手順](/getting-started/install/install.mdx)で入手できます。
:::

## インストール {#install}

3台のサーバーに ClickHouse をインストールします。 [アーカイタイプに応じた手順](/getting-started/install/install.mdx)（.deb、.rpm、.tar.gz など）に従ってください。この例では、すべてのマシンにおいて ClickHouse サーバーとクライアントのインストール手順に従います。

## 設定ファイルの編集 {#editing-configuration-files}

<ConfigFileNote />

## chnode1 の設定 {#chnode1-configuration}

`chnode1` には、5つの設定ファイルがあります。これらのファイルを1つのファイルに統合することもできますが、文書の明確さのために、個別に見る方が簡単かもしれません。設定ファイルを読み進めると、`chnode1` と `chnode2` の間でほとんどの設定が同じであることがわかります。違いは強調表示されます。

### ネットワークおよびロギング設定 {#network-and-logging-configuration}

これらの値は、お好みに応じてカスタマイズできます。この例の設定では、1000M のデバッグログが3回ロールオーバーします。ClickHouse は、ポート8123 および9000 の IPv4 ネットワークでリッスンし、ポート9009 をサーバー間通信に使用します。

```xml title="network-and-logging.xml on chnode1"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### ClickHouse Keeper 設定 {#clickhouse-keeper-configuration}

ClickHouse Keeper はデータのレプリケーションと分散 DDL クエリ実行のための調整システムを提供します。ClickHouse Keeper は Apache ZooKeeper と互換性があります。この設定は、ポート9181で ClickHouse Keeper を有効にします。強調表示された行は、このインスタンスの Keeper が `server_id` 1 であることを指定しています。これは、3つのサーバー間の `enable-keeper.xml` ファイルでの唯一の違いです。 `chnode2` は `server_id` が `2` に設定され、`chnode3` は `server_id` が `3` に設定されます。ラフト設定セクションは、3つのサーバーで同様であり、以下に強調表示されている「server_id」とラフト設定内の「server」インスタンスとの関係を示しています。

:::note
何らかの理由で Keeper ノードが置き換えられたり再構築されたりする場合は、既存の `server_id` を再利用しないでください。たとえば、`server_id` 2 の Keeper ノードが再構築される場合は、`4` 以上の server_id を付けてください。
:::

```xml title="enable-keeper.xml on chnode1"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
    # highlight-start
        <server>
            <id>1</id>
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
    # highlight-end
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

### マクロ設定 {#macros-configuration}

マクロ `shard` と `replica` は、分散 DDL の複雑さを軽減します。設定された値は、DDL クエリに自動的に置換され、DDL が簡素化されます。この設定のマクロは、各ノードのシャードとレプリカ番号を指定します。この 2 シャード 1 レプリカの例では、`replica_1` マクロは、レプリカが1つだけなので、`chnode1` と `chnode2` の両方で使用されます。シャードマクロは `chnode1` で `1` に、`chnode2` で `2` に設定されています。

```xml title="macros.xml on chnode1"
<clickhouse>
  <macros>
 # highlight-next-line
    <shard>1</shard>
    <replica>replica_1</replica>
  </macros>
</clickhouse>
```

### レプリケーションおよびシャーディング設定 {#replication-and-sharding-configuration}

最初から説明すると：
- XML の `remote_servers` セクションは、環境内の各クラスタを指定します。属性 `replace=true` は、このファイルで指定された `remote_servers` 設定で、デフォルトの ClickHouse 設定内のサンプル `remote_servers` を置き換えます。この属性がない場合、このファイルのリモートサーバーは、デフォルトのサンプルのリストに追加されます。
- この例では、`cluster_2S_1R` という名前のクラスタが1つあります。
- 値 `mysecretphrase` のクラスタ用の秘密が作成されます。この秘密は、正しいサーバーが一緒に参加することを保証するために、環境内のすべてのリモートサーバーで共有されます。
- クラスタ `cluster_2S_1R` には2つのシャードがあり、それぞれのシャードに1つのレプリカがあります。この文書の冒頭のアーキテクチャ図を確認し、以下の XML の2つの `shard` 定義と比較してください。それぞれのシャード定義に1つのレプリカがあります。レプリカはその特定のシャードのためのものです。そのレプリカのホストとポートが指定されています。設定の最初のシャード用のレプリカは `chnode1` に保存され、設定の2番目のシャード用のレプリカは `chnode2` に保存されます。
- シャードの内部レプリケーションが有効に設定されています。各シャードには、設定ファイル内で `internal_replication` パラメータを定義できます。このパラメータが `true` に設定されている場合、書き込み操作は最初の正常なレプリカを選択し、データを書き込みます。

```xml title="remote-servers.xml on chnode1"
<clickhouse>
  <remote_servers replace="true">
    <cluster_2S_1R>
    <secret>mysecretphrase</secret>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode2</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
  </remote_servers>
</clickhouse>
```

### Keeper の使用設定 {#configuring-the-use-of-keeper}

上記のいくつかのファイルでは ClickHouse Keeper が設定されています。この設定ファイル `use-keeper.xml` は、ClickHouse サーバーがレプリケーションと分散 DDL の調整に ClickHouse Keeper を使用するよう設定しています。このファイルは、ClickHouse サーバーが `chnode1` から `chnode3` でポート9181 の Keeper を使用することを指定しており、`chnode1` と `chnode2` で同様のファイルとなります。

```xml title="use-keeper.xml on chnode1"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>chnode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>chnode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>chnode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## chnode2 の設定 {#chnode2-configuration}

設定は `chnode1` と `chnode2` で非常に似ているため、ここでは違いのみを指摘します。

### ネットワークおよびロギング設定 {#network-and-logging-configuration-1}

```xml title="network-and-logging.xml on chnode2"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### ClickHouse Keeper 設定 {#clickhouse-keeper-configuration-1}

このファイルには、`chnode1` と `chnode2` の間の2つの違いの1つが含まれています。Keeper 設定で `server_id` が `2` に設定されています。

```xml title="enable-keeper.xml on chnode2"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
    <server_id>2</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <server>
            <id>1</id>
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
        # highlight-start
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        # highlight-end
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

### マクロ設定 {#macros-configuration-1}

マクロ設定には、`chnode1` と `chnode2` の間の違いの1つがあります。`shard` はこのノードで `2` に設定されています。

```xml title="macros.xml on chnode2"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>
```

### レプリケーションおよびシャーディング設定 {#replication-and-sharding-configuration-1}

```xml title="remote-servers.xml on chnode2"
<clickhouse>
  <remote_servers replace="true">
    <cluster_2S_1R>
    <secret>mysecretphrase</secret>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1</host>
                <port>9000</port>
            </replica>
        </shard>
            <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode2</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
  </remote_servers>
</clickhouse>
```

### Keeper の使用設定 {#configuring-the-use-of-keeper-1}

```xml title="use-keeper.xml on chnode2"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>chnode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>chnode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>chnode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## chnode3 の設定 {#chnode3-configuration}

`chnode3` はデータを格納せず、ClickHouse Keeper のクォーラムにおける第3ノードを提供するだけなので、`chnode3` にはネットワークとロギング設定用の2つの設定ファイルのみがあります。 

### ネットワークおよびロギング設定 {#network-and-logging-configuration-2}

```xml title="network-and-logging.xml on chnode3"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### ClickHouse Keeper 設定 {#clickhouse-keeper-configuration-2}

```xml title="enable-keeper.xml on chnode3"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
    <server_id>3</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <server>
            <id>1</id>
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        # highlight-start
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
        # highlight-end
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

## テスト {#testing}

1. `chnode1` に接続し、上記で設定されたクラスタ `cluster_2S_1R` が存在することを確認します。

```sql title="クエリ"
SHOW CLUSTERS
```

```response title="応答"
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘
```

2. クラスタにデータベースを作成します。

```sql title="クエリ"
CREATE DATABASE db1 ON CLUSTER cluster_2S_1R
```

```response title="応答"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. クラスタ上に MergeTree テーブルエンジンを持つテーブルを作成します。
:::note
テーブルエンジンにパラメータを指定する必要はありません; これらはマクロに基づいて自動的に定義されます。
:::

```sql title="クエリ"
CREATE TABLE db1.table1 ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
```
```response title="応答"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1 │ 9000 │      0 │       │                   1 │                0 │
│ chnode2 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4. `chnode1` に接続し、行を挿入します。

```sql title="クエリ"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

5. `chnode2` に接続し、行を挿入します。

```sql title="クエリ"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

6. 任意のノード (`chnode1` または `chnode2`) に接続すると、そのノードのテーブルに挿入された行のみが表示されます。
例えば、`chnode2` で:

```sql title="クエリ"
SELECT * FROM db1.table1;
```

```response title="応答"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

7. 両方のノードで両方のシャードをクエリするための分散テーブルを作成します。
（この例では、`rand()` 関数がシャーディングキーとして設定されており、各挿入をランダムに分散させます）

```sql title="クエリ"
CREATE TABLE db1.table1_dist ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_2S_1R', 'db1', 'table1', rand())
```

```response title="応答"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

8. `chnode1` または `chnode2` に接続し、分散テーブルをクエリして両方の行を確認します。

```sql title="クエリ"
SELECT * FROM db1.table1_dist;
```

```response title="応答"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```


## 詳細情報 {#more-information-about}

- [分散テーブルエンジン](/engines/table-engines/special/distributed.md)
- [ClickHouse Keeper](/guides/sre/keeper/index.md)
