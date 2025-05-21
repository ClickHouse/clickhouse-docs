---
slug: /architecture/replication
sidebar_label: 'フォールトトレランスのためのレプリケーション'
sidebar_position: 10
title: 'フォールトトレランスのためのレプリケーション'
description: '五台のサーバーが構成されているアーキテクチャの例を説明するページです。二つのサーバーはデータのコピーをホストするために使用され、残りのサーバーはデータのレプリケーションを調整するために使用されます。'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/_snippets/_keeper-config-files.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/architecture_1s_2r_3_nodes.png';

## 説明 {#description}
このアーキテクチャには五台のサーバーが構成されています。二台はデータのコピーをホストするために使用され、残りの三台のサーバーはデータのレプリケーションを調整するために使用されます。この例を使って、ReplicatedMergeTreeテーブルエンジンを使用して両方のデータノードにレプリケートされるデータベースとテーブルを作成します。

## レベル: 基本 {#level-basic}

<ReplicationShardingTerminology />

## 環境 {#environment}
### アーキテクチャダイアグラム {#architecture-diagram}

<Image img={ReplicationArchitecture} size="md" alt="ReplicatedMergeTreeを使用した1シャード2レプリカのアーキテクチャダイアグラム" />

|ノード|説明|
|----|-----------|
|clickhouse-01|データ|
|clickhouse-02|データ|
|clickhouse-keeper-01|分散コーディネーション|
|clickhouse-keeper-02|分散コーディネーション|
|clickhouse-keeper-03|分散コーディネーション|

:::note
本番環境では、ClickHouse Keeperのために*専用*ホストを使用することを強く推奨します。テスト環境では、ClickHouse ServerとClickHouse Keeperを同じサーバー上で実行することは許容されます。もう一つの基本的な例である、[スケールアウト](/deployment-guides/horizontal-scaling.md)はこの方法を使用しています。この例では、KeeperをClickHouse Serverから分離することが推奨される方法を提示します。Keeperサーバーは小型で済み、ClickHouse Serverが非常に大きくなるまでは各Keeperサーバーに4GBのRAMが一般的に十分です。
:::

## インストール {#install}

二台のサーバー`clickhouse-01`と`clickhouse-02`にClickHouseサーバーとクライアントをインストールします。インストール方法については、[お使いのアーカイバタイプの手順](/getting-started/install/install.mdx)（.deb、.rpm、.tar.gzなど）を参照してください。

三台のサーバー`clickhouse-keeper-01`、`clickhouse-keeper-02`、`clickhouse-keeper-03`にClickHouse Keeperをインストールします。インストール方法については、[お使いのアーカイバタイプの手順](/getting-started/install/install.mdx)（.deb、.rpm、.tar.gzなど）を参照してください。

## 設定ファイルの編集 {#editing-configuration-files}

<ConfigFileNote />

## clickhouse-01の設定 {#clickhouse-01-configuration}

clickhouse-01には五つの設定ファイルがあります。これらのファイルを一つのファイルに統合することもできますが、ドキュメントの明瞭さのためには、別々に見る方が簡単かもしれません。設定ファイルを読み進めると、clickhouse-01とclickhouse-02の間でほとんどの設定が同じであることがわかります。違いは強調表示されます。

### ネットワークおよびロギング設定 {#network-and-logging-configuration}

これらの値はお好みに応じてカスタマイズできます。この例の設定では次のことが行われます：
- 1000Mで三回ロールオーバーするデバッグログ
- `clickhouse-client`で接続した際に表示される名前は`cluster_1S_2R node 1`です
- ClickHouseはポート8123と9000でIPV4ネットワーク上で待機します。

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

マクロ`shard`と`replica`は分散DDLの複雑さを軽減します。設定した値はDDLクエリに自動的に置き換えられ、DDLを簡素化します。この設定のマクロは各ノードのシャードとレプリカ番号を指定します。この1シャード2レプリカの例では、レプリカマクロはclickhouse-01で`replica_1`、clickhouse-02で`replica_2`です。シャードマクロはclickhouse-01とclickhouse-02の両方で`1`です。

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

### レプリケーションとシャーディング設定 {#replication-and-sharding-configuration}

上から始めましょう：
- XMLのremote_serversセクションは環境中の各クラスタを指定します。属性`replace=true`は、このファイルで指定されたremote_server設定でデフォルトのClickHouse設定にあるサンプルremote_serversを置き換えます。この属性がない場合、このファイルのremote serversはデフォルトのサンプルリストに追加されます。
- この例では、`cluster_1S_2R`という名前のクラスタが一つあります。
- クラスタ`cluster_1S_2R`には`mysecretphrase`という値の秘密が作成されます。この秘密は、環境内のすべてのremote servers間で共有され、正しいサーバーが結合されることを保証します。
- クラスタ`cluster_1S_2R`には1つのシャードと2つのレプリカがあります。このドキュメントの最初の方にあるアーキテクチャダイアグラムを見て、以下のXML内の`shard`定義と比較してください。シャード定義には2つのレプリカがあります。各レプリカのホストとポートが指定されています。1つのレプリカは`clickhouse-01`に、他のレプリカは`clickhouse-02`に保存されています。
- シャードの内部レプリケーションはtrueに設定されています。各シャードには、設定ファイル内にinternal_replicationパラメータを定義できます。このパラメータがtrueに設定されている場合、書き込み操作は最初の正常なレプリカを選び、データを書き込みます。

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

この設定ファイル`use-keeper.xml`は、レプリケーションと分散DDLのコーディネーションのためにClickHouse ServerがClickHouse Keeperを使用するように設定されています。このファイルは、ClickHouse Serverがノードclickhouse-keeper-01 - 03でポート9181を使用することを指定しています。このファイルは`clickhouse-01`と`clickhouse-02`で同じです。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-01"
<clickhouse>
    <zookeeper>
        <!-- ZKノードはどこにあるか -->
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

設定はclickhouse-01とclickhouse-02で非常に似ているため、ここでは違いだけを指摘します。

### ネットワークおよびロギング設定 {#network-and-logging-configuration-1}

このファイルはclickhouse-01とclickhouse-02の両方で同じですが、`display_name`を除いてのことです。

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

マクロ設定はclickhouse-01とclickhouse-02の間で異なります。ここでは`replica`が`02`に設定されています。

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

### レプリケーションとシャーディング設定 {#replication-and-sharding-configuration-1}

このファイルはclickhouse-01とclickhouse-02の両方で同じです。

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

このファイルはclickhouse-01とclickhouse-02の両方で同じです。

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml on clickhouse-02"
<clickhouse>
    <zookeeper>
        <!-- ZKノードはどこにあるか -->
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

ClickHouse Keeperはデータレプリケーションと分散DDLクエリ実行のためのコーディネーションシステムを提供します。ClickHouse KeeperはApache ZooKeeperと互換性があります。この設定はClickHouse Keeperをポート9181で有効にします。強調表示された行は、このKeeperのインスタンスの`server_id`が1であることを示しています。この`enable-keeper.xml`ファイルにおける三つのサーバーでの唯一の違いです。`clickhouse-keeper-02`は`server_id`が`2`に設定され、`clickhouse-keeper-03`は`server_id`が`3`に設定されます。raft設定セクションはすべてのサーバーで同じであり、以下に示すように`server_id`とraft設定内の`server`インスタンスとの関係を示します。

:::note
Keeperノードが何らかの理由で置き換えられるか再構築された場合、既存の`server_id`を再利用しないでください。たとえば、`server_id`が`2`のKeeperノードが再構築される場合、`4`以上の`server_id`を与えてください。
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

`clickhouse-keeper-01`と`clickhouse-keeper-02`の間の違いは一つの行だけです。このノードの`server_id`は`2`に設定されています。

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

`clickhouse-keeper-01`と`clickhouse-keeper-03`の間には一つの行の違いがあります。このノードの`server_id`は`3`に設定されています。

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

ReplicatedMergeTreeとClickHouse Keeperを体験するために、次のコマンドを実行できます。これにより、以下のことが実行されます：
- 上記に構成されたクラスタ上にデータベースを作成します
- ReplicatedMergeTreeテーブルエンジンを使用してデータベース上にテーブルを作成します
- 一つのノードでデータを挿入し、他のノードでクエリを実行します
- 一つのClickHouseサーバーノードを停止します
- 実行中のノードでさらにデータを挿入します
- 停止したノードを再起動します
- 再起動したノードでクエリを実行したときにデータが利用可能であることを確認します

### ClickHouse Keeperが実行中であることを確認する {#verify-that-clickhouse-keeper-is-running}

`mntr`コマンドはClickHouse Keeperが実行中であり、三つのKeeperノード間の関係に関する状態情報を得るために使用されます。この例で使用される設定では、三つのノードが連携して動作します。ノードはリーダーを選出し、残りのノードはフォロワーとなります。`mntr`コマンドは性能に関連する情報や、特定のノードがフォロワーなのかリーダーなのかを提供します。

:::tip
`mntr`コマンドをKeeperに送信するために`netcat`をインストールする必要があるかもしれません。ダウンロード情報については、[nmap.org](https://nmap.org/ncat/)のページを見てください。
:::

```bash title="clickhouse-keeper-01、clickhouse-keeper-02、およびclickhouse-keeper-03上のシェルから実行"
echo mntr | nc localhost 9181
```
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
```

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
```

### ClickHouseクラスタの機能を確認する {#verify-clickhouse-cluster-functionality}

一つのシェルでノード`clickhouse-01`に`clickhouse client`で接続し、別のシェルでノード`clickhouse-02`に`clickhouse client`で接続します。

1. 上記に構成されたクラスタ上にデータベースを作成します

```sql title="ノードclickhouse-01またはclickhouse-02のいずれかで実行"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. ReplicatedMergeTreeテーブルエンジンを使用してデータベース上にテーブルを作成します
```sql title="ノードclickhouse-01またはclickhouse-02のいずれかで実行"
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
3. 一つのノードでデータを挿入し、他のノードでクエリを実行します
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

5. 他のノードでデータを挿入し、ノード`clickhouse-01`でクエリを実行します
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

6. 一つのClickHouseサーバーノードを停止します
ノードを開始するために使用したのと同様のオペレーティングシステムコマンドを実行して、いずれかのClickHouseサーバーノードを停止します。ノードを開始する際に`systemctl start`を使った場合は、`systemctl stop`を使って停止します。

7. 実行中のノードでさらにデータを挿入します
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

8. 停止したノードを再起動し、そこからも選択します

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
