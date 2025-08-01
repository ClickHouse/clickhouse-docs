---
slug: '/architecture/horizontal-scaling'
sidebar_label: 'スケーリングアウト'
sidebar_position: 10
title: 'スケーリングアウト'
description: 'スケーラビリティを提供するために設計された例のアーキテクチャについて説明するページ'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import scalingOut1 from '@site/static/images/deployment-guides/scaling-out-1.png';

## 説明 {#description}
この例のアーキテクチャは、スケーラビリティを提供するように設計されています。 それには、2つの統合されたClickHouseと調整（ClickHouse Keeper）サーバー、および3のクォーラムを完了するためのClickHouse Keeperのみの第三のサーバーが含まれています。この例では、データベース、テーブル、および両方のノードのデータをクエリできる分散テーブルを作成します。

## レベル: 基本 {#level-basic}

<ReplicationShardingTerminology />

## 環境 {#environment}
### アーキテクチャ図 {#architecture-diagram}

<Image img={scalingOut1} size='md' alt='2つのシャードと1つのレプリカのためのアーキテクチャ図' />

|Node|説明|
|----|-----------|
|`chnode1`|データ + ClickHouse Keeper|
|`chnode2`|データ + ClickHouse Keeper|
|`chnode3`|ClickHouse Keeperのクォーラム用|

:::note
本番環境では、ClickHouse Keeperが専用ホストで実行されることを強くお勧めします。この基本構成では、ClickHouse Serverプロセス内でKeeper機能が実行されます。ClickHouse Keeperをスタンドアロンでデプロイするための手順は、[インストールドキュメント](/getting-started/install/install.mdx)で入手できます。
:::

## インストール {#install}

[アーカイブタイプ](/getting-started/install/install.mdx)に関する手順に従って、3つのサーバーにClickHouseをインストールします（.deb、.rpm、.tar.gzなど）。この例では、ClickHouse ServerおよびClientのインストール手順をすべてのマシンで実行します。

## 設定ファイルの編集 {#editing-configuration-files}

<ConfigFileNote />

## chnode1 の設定 {#chnode1-configuration}

`chnode1`には5つの設定ファイルがあります。これらのファイルを1つのファイルにまとめることもできますが、ドキュメントの明確さのために別々に見る方が簡単かもしれません。設定ファイルを読み進めると、`chnode1`と`chnode2`の間でほとんどの設定が同じであることがわかります。違いは強調表示されます。

### ネットワークおよびログ設定 {#network-and-logging-configuration}

これらの値は希望に応じてカスタマイズできます。この例の構成では、1000Mでロールオーバーするデバッグログを提供します。ClickHouseはポート8123および9000のIPv4ネットワークでリッスンし、ポート9009をサーバー間通信に使用します。

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

### ClickHouse Keeper設定 {#clickhouse-keeper-configuration}

ClickHouse Keeperは、データレプリケーションおよび分散DDLクエリの実行のための調整システムを提供します。ClickHouse KeeperはApache ZooKeeperと互換性があります。この設定では、ポート9181でClickHouse Keeperを有効にします。強調表示された行は、このKeeperインスタンスの`server_id`が1であることを示しています。これは、3つのサーバー間で`enable-keeper.xml`ファイルのただ一つの違いです。`chnode2`は`server_id`が2に、`chnode3`は`server_id`が3に設定されます。RAFTの構成セクションはすべてのサーバーで同じであり、以下にハイライトされています。

:::note
何らかの理由でKeeperノードが置き換えられるか再構築される場合、既存の`server_id`を再利用しないでください。例えば、`server_id`が`2`のKeeperノードが再構築される場合、`4`以上の`server_id`を設定してください。
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

### マクロ設定 {#macros-configuration}

マクロ`shard`および`replica`は、分散DDLの複雑さを軽減します。構成された値は自動的にDDLクエリで置換され、DDLの簡素化を図ります。この設定のマクロは、各ノードのシャード番号およびレプリカ番号を指定します。この2つのシャード1つのレプリカの例では、レプリカマクロは`chnode1`と`chnode2`の両方で`replica_1`です。シャードマクロは`chnode1`で`1`、`chnode2`で`2`です。

```xml title="macros.xml on chnode1"
<clickhouse>
  <macros>
 # highlight-next-line
    <shard>1</shard>
    <replica>replica_1</replica>
  </macros>
</clickhouse>

### レプリケーションおよびシャーディング設定 {#replication-and-sharding-configuration}

上から順に:
- XMLの`remote_servers`セクションは、環境内の各クラスタを指定します。属性`replace=true`は、デフォルトのClickHouse構成内のサンプル`remote_servers`をこのファイルに指定された`remote_servers`構成で置き換えます。この属性がない場合、このファイル内のリモートサーバーはデフォルトのサンプルのリストに追加されます。
- この例では、`cluster_2S_1R`という名前のクラスタがあります。
- クラスタ`cluster_2S_1R`のために、値`mysecretphrase`を持つシークレットが作成されます。このシークレットは、正しいサーバーが一緒に結合されることを確実にするために、環境内のすべてのリモートサーバーで共有されます。
- クラスタ`cluster_2S_1R`は2つのシャードを持ち、それぞれのシャードは1つのレプリカを持っています。このドキュメントの最初にあるアーキテクチャ図を見て、それをXML内の2つの`shard`定義と比較してください。各シャード定義には1つのレプリカが存在します。その特定のシャードのためのレプリカです。そのレプリカのホストとポートが指定されています。この構成内の最初のシャードのレプリカは`chnode1`にストレージされ、2つ目のシャードのレプリカは`chnode2`にストレージされます。
- シャードごとの内部レプリケーションは真に設定されています。各シャードは、設定ファイル内で`internal_replication`パラメーターを定義できます。このパラメーターが真に設定されている場合、書き込み操作は最初の健全なレプリカを選択し、そのレプリカにデータを書き込みます。

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

### Keeperの使用設定 {#configuring-the-use-of-keeper}

上述のいくつかのファイルでClickHouse Keeperが構成されました。この設定ファイル`use-keeper.xml`は、ClickHouse Serverがレプリケーションと分散DDLの調整のためにClickHouse Keeperを使用するように設定しています。このファイルは、ClickHouse Serverがポート9181でノード`chnode1`から`chnode3`でKeeperを使用することを指定しており、`chnode1`および`chnode2`で同じファイルです。

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

## chnode2 の設定 {#chnode2-configuration}

`chnode1`と`chnode2`は非常に似た設定であるため、ここでは異なる部分のみを指摘します。

### ネットワークおよびログ設定 {#network-and-logging-configuration-1}

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

### ClickHouse Keeper設定 {#clickhouse-keeper-configuration-1}

このファイルは、`chnode1`と`chnode2`の間の2つの違いの1つを含んでいます。Keeper設定で`server_id`が2に設定されています。

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

### マクロ設定 {#macros-configuration-1}

マクロ設定は`chnode1`と`chnode2`間の違いの1つを持っています。このノードの`shard`は2に設定されています。

```xml title="macros.xml on chnode2"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>

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

### Keeperの使用設定 {#configuring-the-use-of-keeper-1}

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

## chnode3 の設定 {#chnode3-configuration}

`chnode3`はデータを保存せず、クォーラム内の第3のノードを提供するためにのみ使用されるため、`chnode3`には、ネットワークおよびログ設定用の1つとClickHouse Keeper用の1つの2つの構成ファイルしかありません。

### ネットワークおよびログ設定 {#network-and-logging-configuration-2}

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

### ClickHouse Keeper設定 {#clickhouse-keeper-configuration-2}

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

## テスト {#testing}

1. `chnode1`に接続し、上記で構成されたクラスタ`cluster_2S_1R`が存在することを確認します。

```sql title="Query"
SHOW CLUSTERS

```response title="Response"
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘

2. クラスタでデータベースを作成します。

```sql title="Query"
CREATE DATABASE db1 ON CLUSTER cluster_2S_1R

```response title="Response"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

3. クラスタにMergeTreeテーブルエンジンを持つテーブルを作成します。
:::note
テーブルエンジンのパラメータを指定する必要はありません。これらは自動的にマクロに基づいて定義されます。
:::

```sql title="Query"
CREATE TABLE db1.table1 ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id

```response title="Response"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1 │ 9000 │      0 │       │                   1 │                0 │
│ chnode2 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

4. `chnode1`に接続して行を挿入します。

```sql title="Query"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');

5. `chnode2`に接続して行を挿入します。

```sql title="Query"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');

6. どちらかのノード、`chnode1`または`chnode2`に接続すると、そのノードのテーブルに挿入された行のみが表示されます。
例えば、`chnode2`でのクエリ:

```sql title="Query"
SELECT * FROM db1.table1;

```response title="Response"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

7. 両方のノードの両方のシャードをクエリするための分散テーブルを作成します。
（この例では、`rand()`関数がシャーディングキーとして設定されており、各挿入をランダムに分配します。）

```sql title="Query"
CREATE TABLE db1.table1_dist ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_2S_1R', 'db1', 'table1', rand())

```response title="Response"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

8. `chnode1`または`chnode2`のいずれかに接続し、分散テーブルをクエリして両方の行を表示します。

```sql title="Query"
SELECT * FROM db1.table1_dist;

```reponse title="Response"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘

## 詳細情報: {#more-information-about}

- [分散テーブルエンジン](/engines/table-engines/special/distributed.md)
- [ClickHouse Keeper](/guides/sre/keeper/index.md)
