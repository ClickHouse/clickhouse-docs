---
'slug': '/architecture/replication'
'sidebar_label': '障害耐性のためのレプリケーション'
'sidebar_position': 10
'title': '障害耐性のためのレプリケーション'
'description': '5台のサーバーが構成された例のアーキテクチャについてのページ。2台はデータのコピーをホストするために使用され、残りのサーバーはデータのレプリケーションを調整するために使用されます。'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_keeper-config-files.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/architecture_1s_2r_3_nodes.png';


## 説明 {#description}
このアーキテクチャには、5台のサーバーが構成されています。2台はデータのコピーをホストするために使用され、他の3台はデータのレプリケーションをコーディネートするために使用されます。この例では、ReplicatedMergeTree テーブルエンジンを使用して、データノード間でレプリケートされるデータベースとテーブルを作成します。

## レベル: 基本 {#level-basic}

<ReplicationShardingTerminology />

## 環境 {#environment}
### アーキテクチャ図 {#architecture-diagram}

<Image img={ReplicationArchitecture} size="md" alt="ReplicatedMergeTreeを使用した1シャードと2レプリカのアーキテクチャ図" />

|ノード|説明|
|----|-----------|
|clickhouse-01|データ|
|clickhouse-02|データ|
|clickhouse-keeper-01|分散コーディネーション|
|clickhouse-keeper-02|分散コーディネーション|
|clickhouse-keeper-03|分散コーディネーション|

:::note
本番環境では、ClickHouse Keeper用の*専用*ホストの使用を強く推奨します。テスト環境では、ClickHouse ServerとClickHouse Keeperを同一のサーバー上で実行することが許容されます。他の基本的な例、[スケーリングアウト](/deployment-guides/horizontal-scaling.md)でもこの方法が使用されています。この例では、KeeperをClickHouse Serverから分離する推奨メソッドを示しています。Keeperサーバーはより小型で、ClickHouse Serversが非常に大きくなるまで、各Keeperサーバーに4GBのRAMが一般的に十分です。
:::

## インストール {#install}

`clickhouse-01`および`clickhouse-02`の2台のサーバーにClickHouse Serverとクライアントをインストールします。手順については、[アーカイブタイプに関する手順](/getting-started/install/install.mdx)を参照してください（.deb、.rpm、.tar.gzなど）。

`clickhouse-keeper-01`、`clickhouse-keeper-02`、`clickhouse-keeper-03`の3台のサーバーにClickHouse Keeperをインストールします。手順については、[アーカイブタイプに関する手順](/getting-started/install/install.mdx)を参照してください（.deb、.rpm、.tar.gzなど）。

## 設定ファイルの編集 {#editing-configuration-files}

<ConfigFileNote />

## clickhouse-01の設定 {#clickhouse-01-configuration}

clickhouse-01には5つの設定ファイルがあります。これらのファイルを1つのファイルにまとめることもできますが、ドキュメントの明確さを保つために、別々に見る方が簡単かもしれません。設定ファイルを読み進めると、clickhouse-01とclickhouse-02の間でほとんどの設定が同じであることがわかります。違いは強調表示されます。

### ネットワークとロギングの設定 {#network-and-logging-configuration}

これらの値は、お好みに応じてカスタマイズ可能です。この例の設定では、次のようになります：
- サイズ1000Mで3回ロールオーバーするデバッグログ
- `clickhouse-client`で接続したときに表示される名前は`cluster_1S_2R node 1`です。
- ClickHouseは、ポート8123および9000でIPV4ネットワーク上でリッスンします。

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

### マクロ設定 {#macros-configuration}

マクロ`shard`および`replica`は、分散DDLの複雑さを軽減します。設定された値はDDLクエリに自動的に置き換えられ、DDLを簡素化します。この設定のマクロは、各ノードのシャードとレプリカ番号を指定します。
この1シャード2レプリカの例では、レプリカマクロはclickhouse-01で`replica_1`、clickhouse-02で`replica_2`になります。シャードマクロは両方のclickhouse-01およびclickhouse-02で`1`です（シャードは1つしかありません）。

```xml title="/etc/clickhouse-server/config.d/macros.xml on clickhouse-01"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>01</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>

### レプリケーションとシャーディングの設定 {#replication-and-sharding-configuration}

最初から：
- XML内の`remote_servers`セクションは、環境内の各クラスターを指定します。属性`replace=true`は、デフォルトのClickHouse設定内のサンプル`remote_servers`を、このファイルで指定された`remote_server`構成に置き換えます。この属性なしでは、このファイルのリモートサーバーはデフォルトのサンプルリストに追加されます。
- この例には、`cluster_1S_2R`という名前のクラスターがあります。
- クラスター`cluster_1S_2R`には、値`mysecretphrase`のための秘密が作成されます。この秘密は、環境内のすべてのリモートサーバー間で共有され、正しいサーバーが一緒に参加していることを確認します。
- クラスター`cluster_1S_2R`には1つのシャードと2つのレプリカがあります。このドキュメントの最初にあるアーキテクチャ図を見て、以下のXMLでの`shard`定義と比較してみてください。シャード定義には2つのレプリカが含まれています。各レプリカのホストとポートが指定されています。1つのレプリカは`clickhouse-01`に保存され、もう1つのレプリカは`clickhouse-02`に保存されます。
- シャードの内部レプリケーションはtrueに設定されています。各シャードは、設定ファイルに`internal_replication`パラメータを定義できます。このパラメータがtrueに設定されている場合、書き込み操作は最初の正常なレプリカを選択し、データを書き込みます。

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

### Keeperの使用設定 {#configuring-the-use-of-keeper}

この設定ファイル`use-keeper.xml`は、ClickHouse Serverがレプリケーションと分散DDLのコーディネーションのためにClickHouse Keeperを使用するように設定されています。このファイルは、ClickHouse Serverがノードclickhouse-keeper-01 - 03のポート9181でKeeperを使用するべきであることを指定しており、ファイルは`clickhouse-01`および`clickhouse-02`で同じです。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-01"
<clickhouse>
    <zookeeper>
        <!-- ZKノードの場所 -->
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

## clickhouse-02の設定 {#clickhouse-02-configuration}

設定はclickhouse-01とclickhouse-02で非常に似ているため、ここでは違いのみ指摘します。

### ネットワークとロギングの設定 {#network-and-logging-configuration-1}

このファイルは、`display_name`の例外を除いて、clickhouse-01とclickhouse-02の両方で同じです。

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

### マクロ設定 {#macros-configuration-1}

マクロ設定は、clickhouse-01とclickhouse-02で異なります。このノードでは`replica`が`02`に設定されています。

```xml title="/etc/clickhouse-server/config.d/macros.xml on clickhouse-02"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>02</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>

### レプリケーションとシャーディングの設定 {#replication-and-sharding-configuration-1}

このファイルは、clickhouse-01とclickhouse-02の両方で同じです。

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

### Keeperの使用設定 {#configuring-the-use-of-keeper-1}

このファイルは、clickhouse-01とclickhouse-02で同じです。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-02"
<clickhouse>
    <zookeeper>
        <!-- ZKノードの場所 -->
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

## clickhouse-keeper-01の設定 {#clickhouse-keeper-01-configuration}

<KeeperConfigFileNote />

ClickHouse Keeperは、データのレプリケーションと分散DDLクエリの実行のためのコーディネーションシステムを提供します。ClickHouse KeeperはApache ZooKeeperと互換性があります。この設定は、ClickHouse Keeperをポート9181で有効にします。強調表示された行は、このKeeperインスタンスの`server_id`が1であることを指定しています。この`enable-keeper.xml`ファイルの唯一の違いは、3台のサーバー間で`server_id`の設定です。`clickhouse-keeper-02`は`server_id`が`2`に設定され、`clickhouse-keeper-03`は`server_id`が`3`に設定されます。raft構成セクションは3台のサーバーで同じであり、以下に強調表示されています。

:::note
何らかの理由でKeeperノードが置き換えられるか再構築される場合は、既存の`server_id`を再利用しないでください。たとえば、`server_id`が`2`のKeeperノードを再構築する場合は、`4`またはそれ以上のserver_idを付与してください。
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

## clickhouse-keeper-02の設定 {#clickhouse-keeper-02-configuration}

`clickhouse-keeper-01`と`clickhouse-keeper-02`の間には一行の違いしかありません。このノードでは`server_id`が`2`に設定されています。

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

## clickhouse-keeper-03の設定 {#clickhouse-keeper-03-configuration}

`clickhouse-keeper-01`と`clickhouse-keeper-03`の間には一行の違いしかありません。このノードでは`server_id`が`3`に設定されています。

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

## テスト {#testing}

ReplicatedMergeTreeとClickHouse Keeperを体験するために、以下のコマンドを実行して次のようにします：
- 上記で構成されたクラスターにデータベースを作成します
- ReplicatedMergeTreeテーブルエンジンを使用してデータベースにテーブルを作成します
- 1つのノードにデータを挿入し、別のノードで照会します
- 1つのClickHouseサーバーノードを停止します
- 動作中のノードにさらにデータを挿入します
- 停止したノードを再起動します
- 再起動したノードでデータが利用可能であることを確認します

### ClickHouse Keeperが実行中であることを確認する {#verify-that-clickhouse-keeper-is-running}

`mntr`コマンドは、ClickHouse Keeperが実行中であることを確認し、3つのKeeperノードの関係に関する状態情報を取得するために使用されます。この例で使用される設定では、3つのノードが協力して作業しています。ノードはリーダーを選出し、残りのノードはフォロワーになります。`mntr`コマンドは、パフォーマンスに関連する情報や、特定のノードがフォロワーかリーダーであるかどうかを提供します。

:::tip
`mntr`コマンドをKeeperに送信するためには、`netcat`をインストールする必要があるかもしれません。ダウンロード情報は[nmap.org](https://nmap.org/ncat/)のページを参照してください。
:::

```bash title="clickhouse-keeper-01、clickhouse-keeper-02、およびclickhouse-keeper-03のシェルから実行"
echo mntr | nc localhost 9181

```response title="フォロワーからの応答"
zk_version      v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     0
zk_packets_sent 0
zk_num_alive_connections        0
zk_outstanding_requests 0

# highlight-next-line
zk_server_state follower
zk_znode_count  6
zk_watch_count  0
zk_ephemerals_count     0
zk_approximate_data_size        1271
zk_key_arena_size       4096
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   46
zk_max_file_descriptor_count    18446744073709551615

```response title="リーダーからの応答"
zk_version      v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     0
zk_packets_sent 0
zk_num_alive_connections        0
zk_outstanding_requests 0

# highlight-next-line
zk_server_state leader
zk_znode_count  6
zk_watch_count  0
zk_ephemerals_count     0
zk_approximate_data_size        1271
zk_key_arena_size       4096
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   48
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end

### ClickHouseクラスターの機能を確認する {#verify-clickhouse-cluster-functionality}

1つのシェルで`clickhouse client`を使用してノード`clickhouse-01`に接続し、別のシェルでノード`clickhouse-02`に接続します。

1. 上記で構成したクラスターにデータベースを作成します

```sql title="ノードclickhouse-01またはclickhouse-02で実行"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R

```response
┌─host──────────┬─port─┬─状態─┬─エラー─┬─残りのホスト数─┬─アクティブなホスト数─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2. ReplicatedMergeTreeテーブルエンジンを使用してデータベースにテーブルを作成します
```sql title="ノードclickhouse-01またはclickhouse-02で実行"
CREATE TABLE db1.table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id

```response
┌─host──────────┬─port─┬─状態─┬─エラー─┬─残りのホスト数─┬─アクティブなホスト数─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

3. 1つのノードにデータを挿入し、別のノードで照会します
```sql title="ノードclickhouse-01で実行"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');

4. ノード`clickhouse-02`でテーブルを照会します
```sql title="ノードclickhouse-02で実行"
SELECT *
FROM db1.table1

```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘

5. 別のノードにデータを挿入し、ノード`clickhouse-01`で照会します
```sql title="ノードclickhouse-02で実行"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');

```sql title="ノードclickhouse-01で実行"
SELECT *
FROM db1.table1

```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

6. 1つのClickHouseサーバーノードを停止します
ノードを起動するのに使用したのと同様のオペレーティングシステムコマンドを実行して、1つのClickHouseサーバーノードを停止します。`systemctl start`を使用してノードを起動した場合は、`systemctl stop`を使用して停止します。

7. 動作中のノードにさらにデータを挿入します
```sql title="動作中のノードで実行"
INSERT INTO db1.table1 (id, column1) VALUES (3, 'ghi');

データを選択します：
```sql title="動作中のノードで実行"
SELECT *
FROM db1.table1

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

8. 停止したノードを再起動し、そこからも選択します

```sql title="再起動したノードで実行"
SELECT *
FROM db1.table1

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
