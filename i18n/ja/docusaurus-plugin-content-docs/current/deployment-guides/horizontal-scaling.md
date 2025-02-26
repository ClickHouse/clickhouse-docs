---
slug: /architecture/horizontal-scaling
sidebar_label: スケールアウト
sidebar_position: 10
title: スケールアウト
---
import ReplicationShardingTerminology from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';

## 説明 {#description}
この例のアーキテクチャは、スケーラビリティを提供することを目的として設計されています。 それには、2つの統合されたClickHouseとコーディネーション（ClickHouse Keeper）サーバー、および3の過半数を満たすためのClickHouse Keeperのみのサーバーが含まれています。この例では、データベース、テーブル、そして両方のノードのデータをクエリできる分散テーブルを作成します。

## レベル: 基本 {#level-basic}

<ReplicationShardingTerminology />

## 環境 {#environment}
### アーキテクチャダイアグラム {#architecture-diagram}
![2シャードと1レプリカのアーキテクチャダイアグラム](@site/i18n/ja/docusaurus-plugin-content-docs/current/deployment-guides/images/scaling-out-1.png)

|ノード|説明|
|----|-----------|
|`chnode1`|データ + ClickHouse Keeper|
|`chnode2`|データ + ClickHouse Keeper|
|`chnode3`|ClickHouse Keeperの過半数を満たすために使用|

:::note
本番環境では、ClickHouse Keeperが専用ホストで実行されることを強く推奨します。この基本構成は、ClickHouse Serverプロセス内でKeeper機能を実行します。ClickHouse Keeperをスタンドアロンでデプロイするための手順は、[インストールドキュメント](/getting-started/install.md/#install-standalone-clickhouse-keeper)で入手できます。
:::

## インストール {#install}

3つのサーバーにClickHouseをインストールします。これは、[アーカイブタイプに対する手順](/getting-started/install.md/#available-installation-options)に従います（.deb、.rpm、.tar.gzなど）。この例では、すべてのマシンでClickHouse ServerとClientのインストール手順に従います。

## 構成ファイルの編集 {#editing-configuration-files}

<ConfigFileNote />

## chnode1の構成 {#chnode1-configuration}

`chnode1`には5つの構成ファイルがあります。これらのファイルを1つのファイルに統合することもできますが、ドキュメントの明確さのために、別々に見る方が簡単かもしれません。構成ファイルを読み進めると、`chnode1`と`chnode2`の間でほとんどの構成が同じであることがわかります。違いは強調表示されます。

### ネットワークとログ設定 {#network-and-logging-configuration}

これらの値は自由にカスタマイズできます。この例の構成では、1000Mで3回ロールオーバーするデバッグログを提供します。ClickHouseは、IPv4ネットワークでポート8123および9000でリッスンし、ポート9009をサーバー間通信に使用します。

```xml title="chnode1上のnetwork-and-logging.xml" 
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

### ClickHouse Keeper設定 {#clickhouse-keeper-configuration}

ClickHouse Keeperは、データレプリケーションと分散DDLクエリ実行のためのコーディネーションシステムを提供します。ClickHouse Keeperは、Apache ZooKeeperと互換性があります。この構成は、ポート9181でClickHouse Keeperを有効にします。強調表示された行は、このKeeperインスタンスの`server_id`が1であることを指定します。これは、3つのサーバーの`enable-keeper.xml`ファイルでの唯一の違いです。`chnode2`では`server_id`が`2`に設定され、`chnode3`では`server_id`が`3`に設定されます。raftの構成セクションはすべてのサーバーで同じであり、`server_id`とraft構成内の`server`インスタンスとの関係を示すために以下に強調表示されています。

:::note
Keeperノードが何らかの理由で交換または再構築される場合、既存の`server_id`を再利用しないでください。たとえば、`server_id`が`2`のKeeperノードが再構築される場合、`4`以上のserver_idを付与してください。
:::

```xml title="chnode1上のenable-keeper.xml"
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

### マクロ構成 {#macros-configuration}

マクロ`shard`および`replica`は、分散DDLの複雑さを軽減します。構成された値はDDLクエリに自動的に置き換えられ、DDLが簡素化されます。この構成のマクロは、各ノードのシャードおよびレプリカ番号を指定します。  
この2シャード1レプリカの例では、レプリカマクロは`replica_1`で、`chnode1`と`chnode2`の両方に存在します。シャードマクロは`chnode1`で`1`、`chnode2`で`2`です。

```xml title="chnode1上のmacros.xml"
<clickhouse>
  <macros>
 # highlight-next-line
    <shard>1</shard>
    <replica>replica_1</replica>
  </macros>
</clickhouse>
```

### レプリケーションとシャーディングの設定 {#replication-and-sharding-configuration}

一番上から：
- XMLの`remote_servers`セクションは、環境内の各クラスターを指定します。属性`replace=true`は、デフォルトのClickHouse構成にあるサンプル`remote_servers`を、このファイルで指定された`remote_servers`構成に置き換えます。この属性がなければ、このファイルのリモートサーバーはデフォルトのサンプルリストに追加されます。  
- この例では、`cluster_2S_1R`という1つのクラスターがあります。
- クラスター名`cluster_2S_1R`の秘密が作成され、その値は`mysecretphrase`です。この秘密は、環境内のすべてのリモートサーバーで共有され、正しいサーバーが一緒に参加することを保証します。
- クラスター`cluster_2S_1R`には2つのシャードがあり、それぞれのシャードには1つのレプリカがあります。このドキュメントの冒頭にあるアーキテクチャダイアグラムを見て、以下のXMLの2つの`shard`定義と比較してください。各シャード定義には1つのレプリカがあります。その特定のシャードのためのレプリカです。そのレプリカのホストとポートが指定されています。この構成での最初のシャードのレプリカは`chnode1`に保存され、2番目のシャードのレプリカは`chnode2`に保存されています。
- シャードの内部レプリケーションはtrueに設定されています。各シャードには、構成ファイル内で`internal_replication`パラメーターを定義できます。このパラメーターがtrueに設定されている場合、書き込み操作は最初の正常なレプリカを選択し、そこにデータを書き込みます。

```xml title="chnode1上のremote-servers.xml"
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

### Keeperの使用を構成する {#configuring-the-use-of-keeper}

上記のいくつかのファイルでClickHouse Keeperが構成されていました。この構成ファイル`use-keeper.xml`は、ClickHouse Serverがレプリケーションと分散DDLのコーディネーションにClickHouse Keeperを使用するように構成しています。このファイルは、ClickHouse Serverがノード`chnode1` - `chnode3`でポート9181でKeeperを使用するべきことを指定しており、このファイルは`chnode1`と`chnode2`で同じです。

```xml title="chnode1上のuse-keeper.xml"
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

## chnode2の構成 {#chnode2-configuration}

`chnode1`と`chnode2`の構成が非常に似ているため、ここでは違いだけが指摘されます。

### ネットワークとログ設定 {#network-and-logging-configuration-1}

```xml title="chnode2上のnetwork-and-logging.xml" 
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

### ClickHouse Keeper設定 {#clickhouse-keeper-configuration-1}

このファイルには、`chnode1`と`chnode2`の間の2つの違いのうち1つが含まれています。Keeperの構成では、`server_id`が`2`に設定されています。

```xml title="chnode2上のenable-keeper.xml"
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

### マクロ構成 {#macros-configuration-1}

マクロ構成には、`chnode1`と`chnode2`の間の違いの1つがあります。`shard`はこのノードで`2`に設定されています。

```xml title="chnode2上のmacros.xml"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>
```

### レプリケーションとシャーディングの設定 {#replication-and-sharding-configuration-1}

```xml title="chnode2上のremote-servers.xml"
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

### Keeperの使用を構成する {#configuring-the-use-of-keeper-1}

```xml title="chnode2上のuse-keeper.xml"
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

## chnode3の構成 {#chnode3-configuration}

`chnode3`はデータを保存せず、ClickHouse Keeperが過半数を提供するためにのみ使用されるため、`chnode3`には2つの構成ファイルのみがあります。1つはネットワークとログを設定するためのもので、もう1つはClickHouse Keeperを構成するためのものです。

### ネットワークとログ設定 {#network-and-logging-configuration-2}

```xml title="chnode3上のnetwork-and-logging.xml" 
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

### ClickHouse Keeper設定 {#clickhouse-keeper-configuration-2}

```xml title="chnode3上のenable-keeper.xml"
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

1. `chnode1`に接続して、上記で構成したクラスター`cluster_2S_1R`が存在することを確認します。

```sql title="クエリ"
SHOW CLUSTERS
```

```response title="レスポンス"
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘
```

2. クラスターにデータベースを作成します。

```sql title="クエリ"
CREATE DATABASE db1 ON CLUSTER cluster_2S_1R
```

```response title="レスポンス"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. クラスターにMergeTreeテーブルエンジンを持つテーブルを作成します。
:::note
マクロに基づいて自動的に定義されるため、テーブルエンジンのパラメータを指定する必要はありません。
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
```response title="レスポンス"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1 │ 9000 │      0 │       │                   1 │                0 │
│ chnode2 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4. `chnode1`に接続して行を挿入します。

```sql title="クエリ"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

5. `chnode2`に接続して行を挿入します。

```sql title="クエリ"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

6. いずれかのノード（`chnode1`または`chnode2`）に接続し、そのノード上のテーブルに挿入された行だけが表示されることを確認します。
たとえば、`chnode2`では：

```sql title="クエリ"
SELECT * FROM db1.table1;
```

```response title="レスポンス"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

7. 両方のノードの両方のシャードをクエリするための分散テーブルを作成します。
（この例では、`rand()`関数がシャーディングキーとして設定されているため、各挿入がランダムに分散します。）

```sql title="クエリ"
CREATE TABLE db1.table1_dist ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_2S_1R', 'db1', 'table1', rand())
```

```response title="レスポンス"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

8. いずれかの`chnode1`または`chnode2`に接続し、分散テーブルをクエリして、両方の行が表示されることを確認します。

```sql title="クエリ"
SELECT * FROM db1.table1_dist;
```

```response title="レスポンス"
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
