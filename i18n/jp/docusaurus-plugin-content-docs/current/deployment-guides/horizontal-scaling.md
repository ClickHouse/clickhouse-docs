---
slug: /architecture/horizontal-scaling
sidebar_label: スケーリングアウト
sidebar_position: 10
title: スケーリングアウト
---
import ReplicationShardingTerminology from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import scalingOut1 from '@site/static/images/deployment-guides/scaling-out-1.png';

## 説明 {#description}
この例のアーキテクチャは、拡張性を提供するために設計されています。 それは3つのノードを含みます：2つのClickHouseと調整（ClickHouse Keeper）サーバー、および第3のサーバーは、クオーラムを三つにするためだけのClickHouse Keeperを持っています。この例では、データベース、テーブル、および両方のノードのデータをクエリできる分散テーブルを作成します。

## レベル: 基本 {#level-basic}

<ReplicationShardingTerminology />

## 環境 {#environment}
### アーキテクチャ図 {#architecture-diagram}

<img src={scalingOut1} alt="2つのシャードと1つのレプリカのためのアーキテクチャ図" />

|ノード|説明|
|----|-----------|
|`chnode1`|データ + ClickHouse Keeper|
|`chnode2`|データ + ClickHouse Keeper|
|`chnode3`|ClickHouse Keeperのクオーラム用|

:::note
本番環境では、ClickHouse Keeperが専用ホストで実行されることを強くお勧めします。この基本構成では、Keeper機能がClickHouse Serverプロセス内で実行されます。 ClickHouse Keeperをスタンドアロンでデプロイするための手順は、[インストールドキュメント](/getting-started/install.md/#install-standalone-clickhouse-keeper)にあります。
:::

## インストール {#install}

[アーカイブタイプに関する手順](/getting-started/install.md/#available-installation-options)に従って、3つのサーバーにClickhouseをインストールします（.deb、.rpm、.tar.gzなど）。この例では、すべての3台のマシンでClickHouse ServerおよびClientのインストール手順に従います。

## 設定ファイルの編集 {#editing-configuration-files}

<ConfigFileNote />

## chnode1の設定 {#chnode1-configuration}

`chnode1`には5つの設定ファイルがあります。これらのファイルを1つのファイルに統合することもできますが、ドキュメントの明確さのために、個別に見る方が簡単かもしれません。設定ファイルを読み進めると、`chnode1`と`chnode2`のほとんどの設定が同じであることがわかります; 違いは強調されます。

### ネットワークおよびロギング設定 {#network-and-logging-configuration}

これらの値は必要に応じてカスタマイズできます。この例の設定は、1000Mで3回ロールオーバーするデバッグログを提供します。ClickHouseはポート8123と9000でIPv4ネットワークをリッスンし、ポート9009をサーバー間通信に使用します。

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

### ClickHouse Keeper の設定 {#clickhouse-keeper-configuration}

ClickHouse Keeperはデータレプリケーションと分散DDLクエリ実行の調整システムを提供します。 ClickHouse KeeperはApache ZooKeeperと互換性があります。この設定は、ポート9181でClickHouse Keeperを有効にします。強調された行は、このKeeperインスタンスの`server_id`が1であることを示しています。これは、3台のサーバーで唯一の違いです。 `chnode2`には`server_id`が2に設定され、`chnode3`には`server_id`が3に設定されます。 raft設定セクションはすべての3台のサーバーで同じであり、`server_id`とraft設定内の`server`インスタンスの関係を示すために強調されています。

:::note
何らかの理由でKeeperノードが交換または再構築される場合、既存の`server_id`を再利用しないでください。 たとえば、`server_id`が`2`のKeeperノードが再構築された場合、`4`以上の`server_id`を付与してください。
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

### マクロの設定 {#macros-configuration}

マクロ`shard`と`replica`は分散DDLの複雑さを軽減します。設定された値は、DDLクエリ内で自動的に置き換えられ、DDLを簡単にします。この設定のマクロは、各ノードのシャードとレプリカ番号を指定します。
この2シャード1レプリカの例では、レプリカマクロは`replica_1`で、両方の`chnode1`と`chnode2`に設定されています。シャードマクロは`chnode1`が`1`で、`chnode2`が`2`です。

```xml title="macros.xml on chnode1"
<clickhouse>
  <macros>
 # highlight-next-line
    <shard>1</shard>
    <replica>replica_1</replica>
  </macros>
</clickhouse>
```

### レプリケーションおよびシャーディングの設定 {#replication-and-sharding-configuration}

上から始めましょう：
- XMLの`remote_servers`セクションは、環境内の各クラスタを指定します。属性`replace=true`は、デフォルトのClickHouse構成のサンプル`remote_servers`をこのファイルで指定された`remote_servers`構成に置き換えます。この属性がないと、このファイル内のリモートサーバーはデフォルトのサンプルリストに追加されます。
- この例では、`cluster_2S_1R`という名前のクラスタが1つあります。
- クラスタ`cluster_2S_1R`には、値`mysecretphrase`のための秘密が作成されます。この秘密は、正しいサーバーが一緒に参加できるように、環境内のすべてのリモートサーバーで共有されます。
- クラスタ`cluster_2S_1R`には2つのシャードがあり、それぞれのシャードには1つのレプリカがあります。このドキュメントの冒頭にあるアーキテクチャ図を見て、それを以下のXMLの2つの`shard`定義と比較してください。各シャードの定義には1つのレプリカがあります。そのレプリカはその特定のシャードのためのものです。そのレプリカのホストとポートが指定されています。設定内の最初のシャードのレプリカは`chnode1`に保存され、設定内の2番目のシャードのレプリカは`chnode2`に保存されます。
- シャードの内部レプリケーションはtrueに設定されています。各シャードには、設定ファイル内で`internal_replication`パラメータを定義できます。このパラメータがtrueに設定されている場合、書き込み操作は最初の正常なレプリカを選択し、データを書き込みます。

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

### Keeperの使用の設定 {#configuring-the-use-of-keeper}

上記のいくつかのファイルでClickHouse Keeperが設定されていました。この設定ファイル`use-keeper.xml`は、ClickHouse Serverがレプリケーションと分散DDLの調整にClickHouse Keeperを使用するように設定しています。このファイルでは、ClickHouse Serverがノード`chnode1`から`chnode3`でポート9181のKeeperを使用する必要があることを指定し、このファイルは`chnode1`と`chnode2`で同じです。

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

## chnode2の設定 {#chnode2-configuration}

`chnode1`と`chnode2`の設定は非常に似ているため、ここでは違いのみを指摘します。

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

### ClickHouse Keeper の設定 {#clickhouse-keeper-configuration-1}

このファイルには`chnode1`と`chnode2`の間の2つの違いの1つがあります。Keeper設定の中で、`server_id`が2に設定されています。

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

### マクロの設定 {#macros-configuration-1}

マクロの設定には`chnode1`と`chnode2`の間の違いの1つがあります。`shard`がこのノードで`2`に設定されています。

```xml title="macros.xml on chnode2"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>
```

### レプリケーションおよびシャーディングの設定 {#replication-and-sharding-configuration-1}

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

### Keeperの使用の設定 {#configuring-the-use-of-keeper-1}

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

## chnode3の設定 {#chnode3-configuration}

`chnode3`はデータを保存せず、ClickHouse Keeperがクオーラムの3番目のノードを提供するためだけに使われるため、`chnode3`はネットワークおよびロギングを設定するための設定ファイルが2つだけあります。

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

### ClickHouse Keeper の設定 {#clickhouse-keeper-configuration-2}

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

1. `chnode1`に接続し、上記で設定されたクラスタ`cluster_2S_1R`が存在することを確認します。

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

3. クラスタ上にMergeTreeテーブルエンジンを持つテーブルを作成します。
:::note
テーブルエンジンのパラメータは自動的にマクロに基づいて定義されるため、指定する必要はありません。
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

4. `chnode1`に接続し、行を挿入します。

```sql title="クエリ"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

5. `chnode2`に接続し、行を挿入します。

```sql title="クエリ"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

6. 任意のノード、`chnode1`または`chnode2`に接続すると、そのノードのテーブルに挿入された行のみが表示されます。
たとえば、`chnode2`で

```sql title="クエリ"
SELECT * FROM db1.table1;
```

```response title="応答"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

7. 両方のノードの両方のシャードをクエリするための分散テーブルを作成します。
（この例では、`rand()`関数がシャーディングキーとして設定されているため、各挿入をランダムに分散させます）

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

8. `chnode1`または`chnode2`のいずれかに接続し、分散テーブルをクエリして両方の行を確認します。

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
