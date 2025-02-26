---
slug: /architecture/replication
sidebar_label: フォールトトレランスのためのレプリケーション
sidebar_position: 10
title: フォールトトレランスのためのレプリケーション
---
import ReplicationShardingTerminology from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_keeper-config-files.md';

## 説明 {#description}
このアーキテクチャでは、5台のサーバーが構成されています。2台はデータのコピーをホストするために使用され、残りの3台はデータのレプリケーションを調整するために使用されます。この例では、データベースとテーブルを作成し、ReplicatedMergeTreeテーブルエンジンを使用して両方のデータノードでレプリケートします。

## レベル: 基本 {#level-basic}

<ReplicationShardingTerminology />

## 環境 {#environment}
### アーキテクチャ図 {#architecture-diagram}
![ReplicatedMergeTreeを用いた1シャードと2レプリカのアーキテクチャ図](@site/i18n/ja/docusaurus-plugin-content-docs/current/deployment-guides/images/Architecture.1S_2R_ReplicatedMergeTree_5-nodes.3.CH.Keeper.nodes.2.CH.nodes.png)

|ノード|説明|
|-----|----|
|clickhouse-01|データ|
|clickhouse-02|データ|
|clickhouse-keeper-01|分散調整|
|clickhouse-keeper-02|分散調整|
|clickhouse-keeper-03|分散調整|

:::note
本番環境では、ClickHouse Keeper用に*専用*ホストを使用することを強く推奨します。テスト環境では、ClickHouseサーバーとClickHouse Keeperを同じサーバー上で実行することは許容されます。もう一つの基本的な例である[スケーリングアウト](/deployment-guides/horizontal-scaling.md)でもこの方法が使用されています。この例では、KeeperをClickHouseサーバーから分離する推奨方法を示しています。Keeperサーバーはより小型でも良く、ClickHouseサーバーが非常に大きくなるまで、各Keeperサーバーには通常4GBのRAMで十分です。
:::

## インストール {#install}

`clickhouse-01` と `clickhouse-02` の2台のサーバーにClickHouseサーバーとクライアントを[アーカイブタイプに応じた手順](/getting-started/install.md/#available-installation-options)に従ってインストールします（.deb, .rpm, .tar.gzなど）。 

`clickhouse-keeper-01`、`clickhouse-keeper-02`、`clickhouse-keeper-03`の3台のサーバーにClickHouse Keeperを、[アーカイブタイプに応じた手順](/getting-started/install.md/#install-standalone-clickhouse-keeper)に従ってインストールします（.deb, .rpm, .tar.gzなど）。

## 設定ファイルの編集 {#editing-configuration-files}

<ConfigFileNote />

## clickhouse-01の設定 {#clickhouse-01-configuration}

clickhouse-01には5つの設定ファイルがあります。これらのファイルを単一のファイルにまとめることもできますが、ドキュメントの明確さのためにそれぞれを別々に見る方が簡単かもしれません。設定ファイルを読むと、clickhouse-01とclickhouse-02の間でほとんどの設定が同じであることがわかります。その違いは強調表示されます。

### ネットワークとロギングの設定 {#network-and-logging-configuration}

これらの値は、お好みでカスタマイズできます。この例の設定では次のようになります：
- 1000Mで3回ロールオーバーするデバッグログ
- `clickhouse-client`で接続した際に表示される名前は `cluster_1S_2R node 1`
- ClickHouseはIPV4ネットワークのポート8123および9000でリッスンします。

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

### マクロの設定 {#macros-configuration}

マクロ `shard` と `replica` は、分散DDLの複雑さを軽減します。設定された値はDDLクエリ内で自動的に置換され、DDLが簡素化されます。この設定のマクロは、各ノードのシャードとレプリカ番号を指定します。  
この1シャード2レプリカの例では、clickhouse-01のレプリカマクロは `replica_1` で、clickhouse-02のレプリカマクロは `replica_2` です。シャードマクロは、シャードが1つしかないため、clickhouse-01とclickhouse-02の両方で `1` になります。

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

### レプリケーションおよびシャーディングの設定 {#replication-and-sharding-configuration}

上から順に：
- XMLのremote_serversセクションは、環境内の各クラスターを指定します。属性 `replace=true` は、デフォルトのClickHouse構成内のサンプルremote_serversを、このファイル内で指定したremote_server構成に置き換えます。この属性がない場合、このファイル内のリモートサーバーは、デフォルトのサンプルリストに追加されます。  
- この例では、`cluster_1S_2R`という名前のクラスターが1つあります。
- このクラスターのために、`mysecretphrase`という値を持つシークレットが作成されます。このシークレットは、正しいサーバーが一緒に参加することを保証するために、環境内のすべてのリモートサーバーで共有されます。
- クラスター `cluster_1S_2R` には1つのシャードと2つのレプリカがあります。このドキュメントの前の方にあるアーキテクチャ図を見て、以下のXML内の `shard` 定義と比較してください。シャード定義には2つのレプリカが含まれています。各レプリカのホストとポートが指定されています。1つのレプリカは `clickhouse-01` に、もう1つのレプリカは `clickhouse-02` に格納されます。
- シャードの内部レプリケーションはtrueに設定されています。各シャードには、configファイル内にinternal_replicationパラメータを定義できます。このパラメータがtrueに設定されている場合、書き込み操作は最初の健康なレプリカを選択して、データを書き込みます。

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

### Keeperの利用設定 {#configuring-the-use-of-keeper}

この設定ファイル `use-keeper.xml` は、ClickHouse Serverがレプリケーションの調整と分散DDLのためにClickHouse Keeperを使用するように構成しています。このファイルでは、ClickHouse Serverがノード `clickhouse-keeper-01 - 03` でポート9181のKeeperを使用するように指定されており、ファイルは `clickhouse-01` と `clickhouse-02` で同じです。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-01"
<clickhouse>
    <zookeeper>
        <!-- ZKノードの位置 -->
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

clickhouse-01とclickhouse-02の設定は非常に似ているため、ここでは違いのみを指摘します。

### ネットワークとロギングの設定 {#network-and-logging-configuration-1}

このファイルは、 `display_name` を除いてclickhouse-01とclickhouse-02の両方で同じです。

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

### マクロの設定 {#macros-configuration-1}

マクロの設定は、clickhouse-01とclickhouse-02の間で異なります。このノードでは、`replica` が `02` に設定されています。

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

### レプリケーションおよびシャーディングの設定 {#replication-and-sharding-configuration-1}

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
```

### Keeperの利用設定 {#configuring-the-use-of-keeper-1}

このファイルは、clickhouse-01とclickhouse-02の両方で同じです。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-02"
<clickhouse>
    <zookeeper>
        <!-- ZKノードの位置 -->
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

ClickHouse Keeperはデータレプリケーションと分散DDLクエリ実行のための調整システムを提供します。ClickHouse KeeperはApache ZooKeeperと互換性があります。この設定はClickHouse Keeperをポート9181で有効にします。強調表示された行は、このインスタンスのKeeperに `server_id` が1であることを指定しています。これは、3台のサーバー間で `enable-keeper.xml` ファイルの唯一の違いです。`clickhouse-keeper-02` は `server_id` を `2` に、`clickhouse-keeper-03` は `server_id` を `3` に設定します。RAFT構成セクションはすべてのサーバーで同じで、`server_id` とRAFT構成内の `server` インスタンス間の関係を示すために強調表示されています。

:::note
Keeperノードが何らかの理由で置き換えられたり、再構築された場合は、既存の `server_id` を再利用しないでください。たとえば、`server_id` が `2` のKeeperノードが再構築される場合は、`server_id` を `4` 以上に設定してください。
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

`clickhouse-keeper-01` と `clickhouse-keeper-02` の間には1行の違いしかありません。このノードでは `server_id` が `2` に設定されています。

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

`clickhouse-keeper-01` と `clickhouse-keeper-03` の間には1行の違いしかありません。このノードでは `server_id` が `3` に設定されています。

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

ReplicatedMergeTreeとClickHouse Keeperを体験するために、以下のコマンドを実行できます。これにより、次のことが発生します：
- 上記で構成されたクラスター上にデータベースを作成する
- ReplicatedMergeTreeテーブルエンジンを使用してデータベース上にテーブルを作成する
- 1つのノードにデータを挿入し、別のノードでクエリを実行する
- 1つのClickHouseサーバーノードを停止する
- 動作しているノードにさらにデータを挿入する
- 停止したノードを再起動する
- 再起動したノードでクエリを実行したときにデータが利用可能か確認する

### ClickHouse Keeperが実行中であることを確認する {#verify-that-clickhouse-keeper-is-running}

`mntr` コマンドを使用して、ClickHouse Keeperが実行中であることと、3つのKeeperノードの関係に関する状態情報を取得します。この例で使用されている構成には、3つのノードが協力しています。ノードはリーダーを選出し、残りのノードはフォロワーになります。`mntr` コマンドはパフォーマンスに関する情報や特定のノードがフォロワーであるかリーダーであるかに関する情報を提供します。

:::tip
`mntr` コマンドをKeeperに送信するには `netcat` をインストールする必要があるかもしれません。ダウンロード情報は[nmap.org](https://nmap.org/ncat/)のページを参照してください。
:::

```bash title="clickhouse-keeper-01、clickhouse-keeper-02、clickhouse-keeper-03でシェルから実行"
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

### ClickHouseクラスターの機能を確認する {#verify-clickhouse-cluster-functionality}

ノード `clickhouse-01` に `clickhouse client` で接続し、別のシェルでノード `clickhouse-02` に `clickhouse client` で接続します。

1. 上記で構成されたクラスター上にデータベースを作成します

```sql title="ノード clickhouse-01 または clickhouse-02 のいずれかで実行"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. ReplicatedMergeTreeテーブルエンジンを使用してデータベース上にテーブルを作成します
```sql title="ノード clickhouse-01 または clickhouse-02 のいずれかで実行"
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
```sql title="ノード clickhouse-01 で実行"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. ノード `clickhouse-02` でテーブルをクエリします
```sql title="ノード clickhouse-02 で実行"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

5. 別のノードにデータを挿入し、ノード `clickhouse-01` でクエリします
```sql title="ノード clickhouse-02 で実行"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

```sql title="ノード clickhouse-01 で実行"
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
ノードを停止するには、ノードを開始するために使用したのと同様のオペレーティングシステムのコマンドを実行します。もし `systemctl start` コマンドを使用してノードを起動した場合は、 `systemctl stop` を使用して停止します。

7. 動作しているノードにさらにデータを挿入します
```sql title="動作しているノードで実行"
INSERT INTO db1.table1 (id, column1) VALUES (3, 'ghi');
```

データを選択します：
```sql title="動作しているノードで実行"
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

8. 停止したノードを再起動し、そのノードでも選択します

```sql title="再起動したノードで実行"
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
