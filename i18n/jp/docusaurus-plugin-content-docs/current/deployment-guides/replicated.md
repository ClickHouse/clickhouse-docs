---
slug: /architecture/replication
sidebar_label: フォールトトレランスのためのレプリケーション
sidebar_position: 10
title: フォールトトレランスのためのレプリケーション
---

import ReplicationShardingTerminology from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_keeper-config-files.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/architecture_1s_2r_3_nodes.png';

## 説明 {#description}
このアーキテクチャでは、5台のサーバーが構成されています。2台はデータのコピーをホストするために使用されます。残りの3台はデータのレプリケーションを調整するために使用されます。この例では、ReplicatedMergeTreeテーブルエンジンを使用して、両方のデータノード間でレプリケートされるデータベースとテーブルを作成します。

## レベル: 基本 {#level-basic}

<ReplicationShardingTerminology />

## 環境 {#environment}
### アーキテクチャ図 {#architecture-diagram}

<img src={ReplicationArchitecture} alt="ReplicatedMergeTreeを使用した1シャードと2レプリカのアーキテクチャ図" />

|ノード|説明|
|----|-----------|
|clickhouse-01|データ|
|clickhouse-02|データ|
|clickhouse-keeper-01|分散コーディネーション|
|clickhouse-keeper-02|分散コーディネーション|
|clickhouse-keeper-03|分散コーディネーション|

:::note
本番環境では、ClickHouse Keeperに*専用*ホストを使用することを強く推奨します。テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバーで組み合わせて実行することは許容されます。他の基本的な例である[スケーリングアウト](/deployment-guides/horizontal-scaling.md)でもこの方法が使用されています。この例では、KeeperとClickHouse Serverを分離することを推奨する方法を示します。Keeperサーバーは小型のものでも問題なく、一般的に各Keeperサーバーには4GBのRAMで十分です。
:::

## インストール {#install}

2台のサーバー`clickhouse-01`と`clickhouse-02`にClickHouseサーバーとクライアントをインストールします。[アーカイブタイプのインストレーション手順](/getting-started/install.md/#available-installation-options)に従って（.deb、.rpm、.tar.gzなど）。

`clickhouse-keeper-01`、`clickhouse-keeper-02`、`clickhouse-keeper-03`の3台のサーバーにClickHouse Keeperをインストールします。[アーカイブタイプのインストレーション手順](/getting-started/install.md/#install-standalone-clickhouse-keeper)に従って（.deb、.rpm、.tar.gzなど）。

## 設定ファイルの編集 {#editing-configuration-files}

<ConfigFileNote />

## clickhouse-01の設定 {#clickhouse-01-configuration}

clickhouse-01には5つの設定ファイルがあります。これらのファイルを1つのファイルにまとめることもできますが、ドキュメントの明瞭さのために、別々に見る方が簡単かもしれません。設定ファイルを通して読み進めると、ほとんどの設定がclickhouse-01とclickhouse-02で同じであることがわかります。違いは強調されます。

### ネットワークとログ設定 {#network-and-logging-configuration}

これらの値は、必要に応じてカスタマイズできます。この例の設定は以下の通りです：
- 1000Mで3回ロールオーバーするデバッグログ
- `clickhouse-client`で接続したときに表示される名前は`cluster_1S_2R node 1`
- ClickHouseはIPV4ネットワーク上でポート8123と9000でリッスンします。

```xml title="/etc/clickhouse-server/config.d/network-and-logging.xml on clickhouse-01"
<clickhouse>
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <display_name>cluster_1S_2R node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### マクロ設定 {#macros-configuration}

マクロ`shard`と`replica`は、分散DDLの複雑さを減らします。設定された値はDDLクエリ内で自動的に置き換えられ、DDLが簡素化されます。この設定のマクロは、各ノードのシャードとレプリカ番号を指定しています。
この1シャード2レプリカの例では、レプリカマクロはclickhouse-01で`replica_1`、clickhouse-02で`replica_2`です。シャードマクロは、シャードが1つしかないため、両方のclickhouse-01とclickhouse-02で`1`です。

```xml title="/etc/clickhouse-server/config.d/macros.xml on clickhouse-01"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>01</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>
```

### レプリケーションとシャーディングの設定 {#replication-and-sharding-configuration}

上から始めます：
- XMLのremote_serversセクションは、環境内の各クラスタを指定します。属性`replace=true`は、このファイル内で指定されたremote_serverの設定で、デフォルトのClickHouse設定のサンプルremote_serversを置き換えます。この属性がない場合、このファイルのremote_serverはデフォルトのサンプルリストに追加されます。
- この例では、`cluster_1S_2R`という名前のクラスタが1つあります。
- クラスタ`cluster_1S_2R`のために、値`mysecretphrase`の秘密が作成されます。この秘密は、環境内のすべてのremote_serverで共有され、正しいサーバーが結合されることを確実にします。
- クラスタ`cluster_1S_2R`は1つのシャードと2つのレプリカを持ちます。この文書の初めにあるアーキテクチャ図を見て、以下のXML内の`shard`定義と比較してください。シャード定義には2つのレプリカが含まれています。各レプリカのホストとポートが指定されています。1つのレプリカは`clickhouse-01`に、もう1つのレプリカは`clickhouse-02`に保存されます。
- シャードの内部レプリケーションはtrueに設定されています。各シャードには、構成ファイル内にinternal_replicationパラメータを定義できます。このパラメータがtrueに設定されている場合、書き込み操作は最初の健全なレプリカを選択し、データを書き込みます。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml on clickhouse-01"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <secret>mysecretphrase</secret>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

### Keeperの使用設定 {#configuring-the-use-of-keeper}

この設定ファイル`use-keeper.xml`は、ClickHouse Serverがレプリケーションと分散DDLの調整にClickHouse Keeperを使用するように設定しています。このファイルは、ClickHouse Serverがポート9181でノードclickhouse-keeper-01からclickhouse-keeper-03のKeeperを使用するべきであることを指定しています。このファイルは、`clickhouse-01`と`clickhouse-02`で同じです。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-01"
<clickhouse>
    <zookeeper>
        <!-- ZKノードはどこにありますか -->
        <node>
            <host>clickhouse-keeper-01</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-02</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-03</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## clickhouse-02の設定 {#clickhouse-02-configuration}

設定はclickhouse-01とclickhouse-02で非常に似ているため、ここでは違いのみをポイントアウトします。

### ネットワークとログ設定 {#network-and-logging-configuration-1}

このファイルは、`display_name`以外はclickhouse-01とclickhouse-02で同じです。

```xml title="/etc/clickhouse-server/config.d/network-and-logging.xml on clickhouse-02"
<clickhouse>
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <!-- highlight-next-line -->
    <display_name>cluster_1S_2R node 2</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### マクロ設定 {#macros-configuration-1}

マクロ設定はclickhouse-01とclickhouse-02で異なります。このノードでは`replica`が`02`に設定されています。

```xml title="/etc/clickhouse-server/config.d/macros.xml on clickhouse-02"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>02</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>
```

### レプリケーションとシャーディングの設定 {#replication-and-sharding-configuration-1}

このファイルは、clickhouse-01とclickhouse-02で同じです。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml on clickhouse-02"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <secret>mysecretphrase</secret>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

### Keeperの使用設定 {#configuring-the-use-of-keeper-1}

このファイルは、clickhouse-01とclickhouse-02で同じです。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-02"
<clickhouse>
    <zookeeper>
        <!-- ZKノードはどこにありますか -->
        <node>
            <host>clickhouse-keeper-01</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-02</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-03</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## clickhouse-keeper-01の設定 {#clickhouse-keeper-01-configuration}

<KeeperConfigFileNote />

ClickHouse Keeperは、データのレプリケーションと分散DDLクエリの実行のための調整システムを提供します。ClickHouse KeeperはApache ZooKeeperと互換性があります。この設定により、ポート9181でClickHouse Keeperが有効になります。強調された行は、このインスタンスのKeeperの`server_id`が1であることを指定します。これは、3台のサーバー間で`enable-keeper.xml`ファイルでの唯一の違いです。`clickhouse-keeper-02`には`server_id`が`2`に設定され、`clickhouse-keeper-03`には`server_id`が`3`に設定されています。Raft構成セクションは、3台のサーバーで同じであり、`server_id`とRaft構成内の`server`インスタンスとの関係を示すために強調表示されています。

:::note
何らかの理由でKeeperノードが置き換えられたり再構築された場合は、既存の`server_id`を再利用しないでください。たとえば、`server_id`が`2`のKeeperノードを再構築する場合は、`4`以上の`server_id`を与えてください。
:::

```xml title="/etc/clickhouse-keeper/keeper_config.xml on clickhouse-keeper-01"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>trace</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <!-- highlight-start -->
            <server>
                <id>1</id>
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## clickhouse-keeper-02の設定 {#clickhouse-keeper-02-configuration}

`clickhouse-keeper-01`と`clickhouse-keeper-02`の違いは1行だけです。このノードでは`server_id`が`2`に設定されています。

```xml title="/etc/clickhouse-keeper/keeper_config.xml on clickhouse-keeper-02"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
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
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-start -->
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## clickhouse-keeper-03の設定 {#clickhouse-keeper-03-configuration}

`clickhouse-keeper-01`と`clickhouse-keeper-03`の違いは1行だけです。このノードでは`server_id`が`3`に設定されています。

```xml title="/etc/clickhouse-keeper/keeper_config.xml on clickhouse-keeper-03"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
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
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-start -->
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## テスト {#testing}

ReplicatedMergeTreeとClickHouse Keeperを経験するために、以下のコマンドを実行すると、次のことが行われます：
- 上記の構成されたクラスタにデータベースを作成します
- ReplicatedMergeTreeテーブルエンジンを使用してデータベースにテーブルを作成します
- 1つのノードにデータを挿入し、別のノードでクエリを実行します
- 1つのClickHouseサーバーノードを停止します
- 実行中のノードにさらにデータを挿入します
- 停止していたノードを再起動します
- 再起動したノードでクエリを実行して、データが利用可能であることを確認します

### ClickHouse Keeperが実行中であることを確認する {#verify-that-clickhouse-keeper-is-running}

`mntr`コマンドは、ClickHouse Keeperが実行中であることを確認し、3つのKeeperノードの関係に関するステート情報を取得するために使用されます。この例で使用される設定では、3つのノードが協力して作業します。ノードはリーダーを選出し、残りのノードはフォロワーになります。`mntr`コマンドは、パフォーマンスに関連する情報と、特定のノードがフォロワーかリーダーであるかを提供します。

:::tip
`mntr`コマンドをKeeperに送信するために`netcat`をインストールする必要があるかもしれません。ダウンロード情報については[nmap.org](https://nmap.org/ncat/)ページを参照してください。
:::

```bash title="clickhouse-keeper-01, clickhouse-keeper-02, and clickhouse-keeper-03で実行"
echo mntr | nc localhost 9181
```
```response title="フォロワーからの応答"
zk_version	v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency	0
zk_max_latency	0
zk_min_latency	0
zk_packets_received	0
zk_packets_sent	0
zk_num_alive_connections	0
zk_outstanding_requests	0

# highlight-next-line
zk_server_state	follower
zk_znode_count	6
zk_watch_count	0
zk_ephemerals_count	0
zk_approximate_data_size	1271
zk_key_arena_size	4096
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	46
zk_max_file_descriptor_count	18446744073709551615
```

```response title="リーダーからの応答"
zk_version	v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency	0
zk_max_latency	0
zk_min_latency	0
zk_packets_received	0
zk_packets_sent	0
zk_num_alive_connections	0
zk_outstanding_requests	0

# highlight-next-line
zk_server_state	leader
zk_znode_count	6
zk_watch_count	0
zk_ephemerals_count	0
zk_approximate_data_size	1271
zk_key_arena_size	4096
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	48
zk_max_file_descriptor_count	18446744073709551615

# highlight-start
zk_followers	2
zk_synced_followers	2

# highlight-end
```

### ClickHouseクラスタの機能を確認する {#verify-clickhouse-cluster-functionality}

1つのシェルで`clickhouse client`を使用してノード`clickhouse-01`に接続し、別のシェルでノード`clickhouse-02`に接続します。

1. 上記の構成されたクラスタにデータベースを作成します

```sql title="クリックハウス クリックハウス-01またはクリックハウス-02のノードで実行"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. ReplicatedMergeTreeテーブルエンジンを使用してデータベースにテーブルを作成します
```sql title="クリックハウス クリックハウス-01またはクリックハウス-02のノードで実行"
CREATE TABLE db1.table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. 1つのノードにデータを挿入し、別のノードでクエリを実行します
```sql title="ノードclickhouse-01で実行"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. ノード`clickhouse-02`でテーブルをクエリします
```sql title="ノードclickhouse-02で実行"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

5. 他のノードにデータを挿入し、ノード`clickhouse-01`でクエリします
```sql title="ノードclickhouse-02で実行"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

```sql title="ノードclickhouse-01で実行"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

6. 1つのClickHouseサーバーノードを停止します
ノードを開始するために使用したのと同様のオペレーティングシステムコマンドを実行して、1つのClickHouseサーバーノードを停止します。`systemctl start`を使用してノードを開始した場合は、`systemctl stop`を使用して停止します。

7. 実行中のノードにさらにデータを挿入します
```sql title="実行中のノードで実行"
INSERT INTO db1.table1 (id, column1) VALUES (3, 'ghi');
```

データを選択します：
```sql title="実行中のノードで実行"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
```

8. 停止していたノードを再起動し、そこからも選択します

```sql title="再起動されたノードで実行"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
```
