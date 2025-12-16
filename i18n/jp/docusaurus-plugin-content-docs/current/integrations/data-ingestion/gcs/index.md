---
sidebar_label: 'Google Cloud Storage (GCS)'
sidebar_position: 4
slug: /integrations/gcs
description: 'Google Cloud Storage (GCS) をバックエンドにした MergeTree'
title: 'ClickHouse と Google Cloud Storage を統合する'
doc_type: 'guide'
keywords: ['Google Cloud Storage ClickHouse', 'GCS ClickHouse 統合', 'GCS バックエンド MergeTree', 'ClickHouse GCS ストレージ', 'Google Cloud ClickHouse']
---

import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';

# Google Cloud Storage を ClickHouse と統合する {#integrate-google-cloud-storage-with-clickhouse}

:::note
[Google Cloud](https://cloud.google.com) 上の ClickHouse Cloud を利用している場合、このページは対象外です。サービスはすでに [Google Cloud Storage](https://cloud.google.com/storage) を使用しているためです。GCS から `SELECT` または `INSERT` でデータを扱いたい場合は、[`gcs` テーブル関数](/sql-reference/table-functions/gcs) を参照してください。
:::

ClickHouse は、ストレージとコンピュートを分離したいユーザーにとって、GCS が魅力的なストレージソリューションであると認識しています。この要件を満たすために、MergeTree エンジンのストレージとして GCS を使用することをサポートしています。これにより、ユーザーは GCS のスケーラビリティとコスト面での利点に加え、MergeTree エンジンのデータ挿入およびクエリのパフォーマンスを活用できるようになります。

## GCS バックエンドの MergeTree {#gcs-backed-mergetree}

### ディスクの作成 {#creating-a-disk}

GCS バケットをディスクとして利用するには、まず `conf.d` 配下のファイルで ClickHouse の設定にディスクを定義する必要があります。GCS ディスク定義の例を以下に示します。この設定には、GCS の「disk」、キャッシュ、およびテーブルを GCS ディスク上に作成する際に DDL クエリで指定されるポリシーを構成するための複数のセクションが含まれます。それぞれについて以下で説明します。

#### Storage configuration &gt; disks &gt; gcs {#storage_configuration--disks--gcs}

この設定の該当部分はハイライトされているセクションであり、次の内容を指定します。

* バッチ削除は実行しないこと。GCS は現在バッチ削除をサポートしていないため、自動検出を無効化してエラーメッセージを抑制します。
* ディスクのタイプは、S3 API を利用しているため `s3` であること。
* GCS が提供するエンドポイント
* サービスアカウントの HMAC キーとシークレット
* ローカルディスク上のメタデータパス

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
            <!--highlight-start-->
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            <!--highlight-end-->
            </gcs>
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

#### ストレージ設定 &gt; disks &gt; cache {#storage_configuration--disks--cache}

次の例の設定では、ディスク `gcs` に対して 10Gi のメモリ キャッシュを有効化します。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
            <!--highlight-start-->
            <gcs_cache>
                <type>cache</type>
                <disk>gcs</disk>
                <path>/var/lib/clickhouse/disks/gcs_cache/</path>
                <max_size>10Gi</max_size>
            </gcs_cache>
            <!--highlight-end-->
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs_cache</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

#### Storage configuration &gt; policies &gt; gcs&#95;main {#storage_configuration--policies--gcs_main}

ストレージ構成ポリシーを使用すると、データを保存する場所を選択できます。以下でハイライトされているポリシーでは、ポリシー `gcs_main` を指定することで、ディスク `gcs` 上にデータを保存できます。たとえば、`CREATE TABLE ... SETTINGS storage_policy='gcs_main'` のように指定します。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
        </disks>
        <policies>
            <!--highlight-start-->
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
            <!--highlight-end-->
        </policies>
    </storage_configuration>
</clickhouse>
```

このディスク定義に関連するすべての設定項目の一覧は[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)にあります。

### テーブルの作成 {#creating-a-table}

書き込み権限のあるバケットを使用するようにディスクを設定してあると仮定すると、以下の例のようなテーブルを作成できるはずです。簡潔にするため、NYC タクシー データセットのカラムの一部のみを使用し、データを GCS をバックエンドとするテーブルに直接ストリーミングします。

```sql
CREATE TABLE trips_gcs
(
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
-- highlight-next-line
SETTINGS storage_policy='gcs_main'
```

```sql
INSERT INTO trips_gcs SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

ハードウェア構成によっては、後半の 100 万行の INSERT の実行に数分かかる場合があります。進行状況は `system.processes` テーブルで確認できます。行数は上限の 1,000 万行まで増やしてかまわないので、いくつかサンプルクエリを実行してみてください。

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### レプリケーションの処理 {#handling-replication}

GCS ディスクを用いたレプリケーションは、`ReplicatedMergeTree` テーブルエンジンを使用することで実現できます。詳細については、[GCS を使用して 2 つの GCP リージョン間で単一シャードをレプリケートする](#gcs-multi-region) ガイドを参照してください。

### さらに詳しく {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) は、Amazon Simple Storage Service (Amazon S3) などのサービスで動作する一部のツールおよびライブラリと相互運用性があります。

スレッドのチューニングに関する詳細は、[パフォーマンスの最適化](../s3/index.md#s3-optimizing-performance) を参照してください。

## Google Cloud Storage (GCS) を使用する {#gcs-multi-region}

:::tip
ClickHouse Cloud ではデフォルトでオブジェクトストレージが使用されるため、ClickHouse Cloud 上で実行している場合はこの手順に従う必要はありません。
:::

### デプロイメントを計画する {#plan-the-deployment}

このチュートリアルでは、Google Cloud 上で稼働し、Google Cloud Storage (GCS) を ClickHouse のストレージディスクの `type` として使用する、レプリケーション構成の ClickHouse デプロイメントについて説明します。

チュートリアルでは、Google Compute Engine の VM 上に ClickHouse サーバーノードをデプロイし、それぞれにストレージ用の GCS バケットを関連付けます。レプリケーションは、同様に VM としてデプロイされる一連の ClickHouse Keeper ノードによって調整されます。

高可用性構成のサンプル要件:
- 2 つの GCP リージョンに配置された 2 つの ClickHouse サーバーノード
- 2 つの ClickHouse サーバーノードと同じリージョンにデプロイされた 2 つの GCS バケット
- 3 つの ClickHouse Keeper ノード。うち 2 つは ClickHouse サーバーノードと同じリージョンにデプロイします。3 つ目は、最初の 2 つの Keeper ノードのいずれかと同じリージョン内ですが、異なるアベイラビリティゾーンに配置できます。

ClickHouse Keeper は動作に 2 ノードを必要とするため、高可用性を実現するには 3 ノードが必要です。

### 仮想マシンを準備する {#prepare-vms}

3 つのリージョンに 5 台の VM をデプロイします:

| Region | ClickHouse Server | Bucket            | ClickHouse Keeper |
|--------|-------------------|-------------------|-------------------|
| 1      | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2      | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`  |                   |                   | `keepernode3`       |

`*` これは、1 または 2 と同じリージョン内の別のアベイラビリティゾーンにすることができます。

#### ClickHouse をデプロイする {#deploy-clickhouse}

2 台のホストに ClickHouse をデプロイします。サンプル構成では、これらのホスト名は `chnode1`、`chnode2` です。

`chnode1` は 1 つの GCP リージョンに、`chnode2` は別のリージョンに配置します。このガイドでは、Compute Engine VM および GCS バケットのリージョンとして `us-east1` と `us-east4` を使用しています。

:::note
設定が完了するまで `clickhouse server` を起動しないでください。インストールのみ行います。
:::

ClickHouse サーバーノードでデプロイメント手順を実行する際は、[インストール手順](/getting-started/install/install.mdx) を参照してください。

#### ClickHouse Keeper をデプロイする {#deploy-clickhouse-keeper}

3 台のホストに ClickHouse Keeper をデプロイします。サンプル構成では、それぞれのホスト名は `keepernode1`、`keepernode2`、`keepernode3` です。`keepernode1` は `chnode1` と同じリージョン、`keepernode2` は `chnode2` と同じリージョン、`keepernode3` はいずれかのリージョン内ですが、そのリージョンの ClickHouse ノードとは異なるアベイラビリティゾーンにデプロイできます。

ClickHouse Keeper ノードでデプロイメント手順を実行する際は、[インストール手順](/getting-started/install/install.mdx) を参照してください。

### 2 つのバケットを作成する {#create-two-buckets}

2 つの ClickHouse サーバーは高可用性のため、異なるリージョンに配置されます。それぞれのサーバーは同じリージョン内に GCS バケットを持ちます。

**Cloud Storage > Buckets** で **CREATE BUCKET** を選択します。このチュートリアルでは、`us-east1` と `us-east4` に 1 つずつ、2 つのバケットを作成します。バケットは単一リージョン、標準ストレージクラス、非公開とします。プロンプトが表示されたら、パブリックアクセス防止を有効にします。フォルダは作成しないでください。フォルダは ClickHouse がストレージに書き込むときに作成されます。

バケットと HMAC キーを作成するためのステップバイステップの手順が必要な場合は、**Create GCS buckets and an HMAC key** を展開し、手順に従ってください:

<BucketDetails />

### ClickHouse Keeper を構成する {#configure-clickhouse-keeper}

すべての ClickHouse Keeper ノードは、`server_id` 行（以下の最初のハイライト行）を除いて同じ設定ファイルを使用します。ファイルを、使用する ClickHouse Keeper サーバーのホスト名に合わせて修正し、各サーバーで `server_id` を `raft_configuration` 内の適切な `server` エントリに一致するように設定します。この例では `server_id` が `3` に設定されているため、`raft_configuration` 内の対応する行をハイライトしています。

- ファイルを編集し、ホスト名を設定して、ClickHouse サーバーノードおよび Keeper ノードから名前解決できることを確認します
- ファイルを各 Keeper サーバー上の `/etc/clickhouse-keeper/keeper_config.xml` に配置します
- 各マシンで、そのマシンの `raft_configuration` 内でのエントリ番号に基づいて `server_id` を編集します

```xml title=/etc/clickhouse-keeper/keeper_config.xml
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
<!--highlight-next-line-->
        <server_id>3</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>keepernode1.us-east1-b.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2.us-east4-c.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3.us-east5-a.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

### Configure ClickHouse server {#configure-clickhouse-server}

:::note best practice
Some of the steps in this guide will ask you to place a configuration file in `/etc/clickhouse-server/config.d/`.  This is the default location on Linux systems for configuration override files.  When you put these files into that directory ClickHouse will merge the content with the default configuration.  By placing these files in the `config.d` directory you will avoid losing your configuration during an upgrade.
:::

#### Networking {#networking}
By default, ClickHouse listens on the loopback interface, in a replicated setup networking between machines is necessary.  Listen on all interfaces:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### Remote ClickHouse Keeper servers {#remote-clickhouse-keeper-servers}

Replication is coordinated by ClickHouse Keeper.  This configuration file identifies the ClickHouse Keeper nodes by hostname and port number.

- Edit the hostnames to match your Keeper hosts

```xml title=/etc/clickhouse-server/config.d/use-keeper.xml
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1.us-east1-b.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2.us-east4-c.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3.us-east5-a.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

#### Remote ClickHouse servers {#remote-clickhouse-servers}

This file configures the hostname and port of each ClickHouse server in the cluster.  The default configuration file contains sample cluster definitions, in order to show only the clusters that are completely configured the tag `replace="true"` is added to the `remote_servers` entry so that when this configuration is merged with the default it replaces the `remote_servers` section instead of adding to it.

- Edit the file with your hostnames, and make sure that they resolve from the ClickHouse server nodes

```xml title=/etc/clickhouse-server/config.d/remote-servers.xml
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.us-east1-b.c.clickhousegcs-374921.internal</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2.us-east4-c.c.clickhousegcs-374921.internal</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

#### Replica identification {#replica-identification}

This file configures settings related to the ClickHouse Keeper path.  Specifically the macros used to identify which replica the data is part of.  On one server the replica should be specified as `replica_1`, and on the other server `replica_2`.  The names can be changed, based on our example of one replica being stored in South Carolina and the other in Northern Virginia the values could be `carolina` and `virginia`; just make sure that they are different on each machine.

```xml title=/etc/clickhouse-server/config.d/macros.xml
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
<!--highlight-next-line-->
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```

#### Storage in GCS {#storage-in-gcs}

ClickHouse storage configuration includes `disks` and `policies`. The disk being configured below is named `gcs`, and is of `type` `s3`.  The type is s3 because ClickHouse accesses the GCS bucket as if it was an AWS S3 bucket.  Two copies of this configuration will be needed, one for each of the ClickHouse server nodes.

These substitutions should be made in the configuration below.

These substitutions differ between the two ClickHouse server nodes:
- `REPLICA 1 BUCKET` should be set to the name of the bucket in the same region as the server
- `REPLICA 1 FOLDER` should be changed to `replica_1` on one of the servers, and `replica_2` on the other

These substitutions are common across the two nodes:
- The `access_key_id` should be set to the HMAC Key generated earlier
- The `secret_access_key` should be set to HMAC Secret generated earlier

```xml title=/etc/clickhouse-server/config.d/storage.xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/レプリカ1バケット/レプリカ1フォルダ/</endpoint>
                <access_key_id>サービスアカウントHMACキー</access_key_id>
                <secret_access_key>サービスアカウントHMACシークレット</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
            <cache>
                <type>cache</type>
                <disk>gcs</disk>
                <path>/var/lib/clickhouse/disks/gcs_cache/</path>
                <max_size>10Gi</max_size>
            </cache>
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

### Start ClickHouse Keeper {#start-clickhouse-keeper}

Use the commands for your operating system, for example:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### Check ClickHouse Keeper status {#check-clickhouse-keeper-status}

Send commands to the ClickHouse Keeper with `netcat`.  For example, `mntr` returns the state of the ClickHouse Keeper cluster.  If you run the command on each of the Keeper nodes you will see that one is a leader, and the other two are followers:

```bash
echo mntr | nc localhost 9181
```
```response
zk_version      v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency  0
zk_max_latency  11
zk_min_latency  0
zk_packets_received     1783
zk_packets_sent 1783
# highlight-start {#highlight-start}
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader
# highlight-end {#highlight-end}
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615
# highlight-start {#highlight-start}
zk_followers    2
zk_synced_followers     2
# highlight-end {#highlight-end}
```

### Start ClickHouse server {#start-clickhouse-server}

On `chnode1` and `chnode` run:

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### Verification {#verification}

#### Verify disk configuration {#verify-disk-configuration}

`system.disks` should contain records for each disk:
- default
- gcs
- cache

```sql
SELECT *
FROM system.disks
FORMAT Vertical
```
```response
Row 1:
──────
name:             cache
path:             /var/lib/clickhouse/disks/gcs/
free_space:       18446744073709551615
total_space:      18446744073709551615
unreserved_space: 18446744073709551615
keep_free_space:  0
type:             s3
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        1
is_broken:        0
cache_path:       /var/lib/clickhouse/disks/gcs_cache/

Row 2:
──────
name:             default
path:             /var/lib/clickhouse/
free_space:       6555529216
total_space:      10331889664
unreserved_space: 6555529216
keep_free_space:  0
type:             local
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        0
is_broken:        0
cache_path:

Row 3:
──────
name:             gcs
path:             /var/lib/clickhouse/disks/gcs/
free_space:       18446744073709551615
total_space:      18446744073709551615
unreserved_space: 18446744073709551615
keep_free_space:  0
type:             s3
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        1
is_broken:        0
cache_path:
```
#### Verify that tables created on the cluster are created on both nodes {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
```
#### クラスタ上で作成されたテーブルが両ノードに作成されていることを確認する                                                                        {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
```
```

```

#### Verify that data can be inserted {#verify-that-data-can-be-inserted}

```

#### データを挿入できることを確認する {#verify-that-data-can-be-inserted}

```

#### Verify that the storage policy `gcs_main` is used for the table. {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
```

#### テーブルでストレージポリシー `gcs_main` が使用されていることを確認します。 {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}

```
```

```response
行 1:
──────
engine:                          ReplicatedMergeTree
data_paths:                      ['/var/lib/clickhouse/disks/gcs/store/631/6315b109-d639-4214-a1e7-afbd98f39727/']
metadata_path:                   /var/lib/clickhouse/store/e0f/e0f3e248-7996-44d4-853e-0384e153b740/trips.sql
storage_policy:                  gcs_main
formatReadableSize(total_bytes): 36.42 MiB

1行を取得しました。経過時間: 0.002秒
```

#### Google Cloud コンソールでの確認 {#verify-in-google-cloud-console}

バケットを確認すると、`storage.xml` 構成ファイルで指定した名前のフォルダが、各バケット内に作成されていることがわかります。フォルダを展開すると、多数のファイルがあり、これらがデータパーティションを表しています。

#### レプリカ 1 用バケット {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="Google Cloud Storage におけるレプリカ 1 のバケット。データパーティションを含むフォルダ構造が表示されている" />

#### レプリカ 2 用バケット {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="Google Cloud Storage におけるレプリカ 2 のバケット。データパーティションを含むフォルダ構造が表示されている" />
