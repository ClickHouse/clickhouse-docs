---
sidebar_label: 'Google Cloud Storage (GCS)'
sidebar_position: 4
slug: /integrations/gcs
description: 'Google Cloud Storage (GCS) に基づく MergeTree'
title: 'ClickHouse と Google Cloud Storage を統合する'
---

import BucketDetails from '@site/docs/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# ClickHouse と Google Cloud Storage を統合する

:::note
ClickHouse Cloud を [Google Cloud](https://cloud.google.com) で使用している場合、このページは適用されません。あなたのサービスはすでに [Google Cloud Storage](https://cloud.google.com/storage) を使用しています。GCS からデータを `SELECT` または `INSERT` しようとしている場合は、[`gcs` テーブル関数](/sql-reference/table-functions/gcs) を参照してください。
:::

ClickHouse は、GCS がストレージと計算を分離したいユーザーにとって魅力的なストレージソリューションであることを認識しています。これを実現するために、GCS を MergeTree エンジンのストレージとして使用するためのサポートを提供しています。これにより、ユーザーは GCS のスケーラビリティとコストメリット、および MergeTree エンジンの挿入とクエリのパフォーマンスを活用できるようになります。

## GCS に基づく MergeTree {#gcs-backed-mergetree}

### ディスクの作成 {#creating-a-disk}

GCS バケットをディスクとして利用するには、まず ClickHouse 設定ファイルの `conf.d` 内に宣言する必要があります。以下に GCS ディスクの宣言の例を示します。この設定には、GCS「ディスク」の設定、キャッシュ、テーブルを GCS ディスクに作成する際に DDL クエリで指定されるポリシーを設定する複数のセクションが含まれています。これらの詳細は以下に記載されています。

#### storage_configuration > disks > gcs {#storage_configuration--disks--gcs}

この設定の部分はハイライトされたセクションに示されており、以下を指定しています：
- バッチ削除は実行しない。GCS は現在バッチ削除をサポートしていないため、エラーメッセージを抑制するために自動検出を無効にしています。
- ディスクのタイプは `s3` で、S3 API が使用されているためです。
- GCS により提供されたエンドポイント
- サービス アカウント HMAC キーとシークレット
- ローカルディスク上のメタデータパス

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
#### storage_configuration > disks > cache {#storage_configuration--disks--cache}

以下にハイライトされたサンプル設定は、ディスク `gcs` に 10Gi のメモリキャッシュを有効にするものです。

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
#### storage_configuration > policies > gcs_main {#storage_configuration--policies--gcs_main}

ストレージ構成ポリシーにより、データが保存される場所を選択できます。以下にハイライトされたポリシーは、ポリシー `gcs_main` を指定することにより、データがディスク `gcs` に保存されることを可能にします。例えば、`CREATE TABLE ... SETTINGS storage_policy='gcs_main'` のように使用します。

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

このディスク宣言に関連する設定の完全なリストは、[こちら](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。

### テーブルの作成 {#creating-a-table}

ディスクが書き込みアクセスを持つバケットを使用するように構成されていると仮定すると、以下の例のようなテーブルを作成できるはずです。簡潔さを考慮して、NYC タクシーのカラムのサブセットを使用し、データを GCS に基づくテーブルに対して直接ストリームします：

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

ハードウェアによっては、この 1 ミリオン行の挿入は数分かかる場合があります。進捗状況は system.processes テーブルを介して確認できます。行数を最大 10 万まで調整し、サンプルクエリを実行してみてください。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### レプリケーションの取り扱い {#handling-replication}

GCS ディスクによるレプリケーションは、`ReplicatedMergeTree` テーブルエンジンを使用することで実現できます。詳細については、[GCS を使用して 2 つの GCP リージョンにわたって単一シャードをレプリケートする](#gcs-multi-region) ガイドを参照してください。

### 詳細を学ぶ {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) は、Amazon Simple Storage Service (Amazon S3) などのサービスと連携して機能するツールやライブラリと相互運用性があります。

スレッドのチューニングに関する詳細については、[パフォーマンスの最適化](../s3/index.md#s3-optimizing-performance)を参照してください。

## Google Cloud Storage (GCS) の使用 {#gcs-multi-region}

:::tip
デフォルトで ClickHouse Cloud ではオブジェクトストレージが使用されます。ClickHouse Cloud で実行している場合は、この手順に従う必要はありません。
:::

### 配備の計画 {#plan-the-deployment}

このチュートリアルは、Google Cloud で実行されるレプリケートされた ClickHouse デプロイメントを記述し、ClickHouse ストレージディスク「タイプ」として Google Cloud Storage (GCS) を使用するものです。

チュートリアルでは、Google Cloud Engine VM に ClickHouse サーバーノードをデプロイし、各ノードにストレージ用の GCS バケットを関連付けます。レプリケーションは、同じく VM としてデプロイされた一連の ClickHouse Keeper ノードによって調整されます。

高可用性に対するサンプル要件：
- 2 つの GCP リージョンに 2 つの ClickHouse サーバーノード
- 2 つの GCS バケット、2 つの ClickHouse サーバーノードと同じリージョンに展開
- 3 つの ClickHouse Keeper ノード、そのうち 2 つは ClickHouse サーバーノードと同じリージョンに展開。3 つ目は最初の 2 つの Keeper ノードのうちの 1 つと同じリージョンでも構いませんが、異なる可用性ゾーンに配置される必要があります。

ClickHouse Keeper を機能させるには 2 つのノードが必要なため、高可用性には 3 つのノードが必要です。

### VM の準備 {#prepare-vms}

3 つのリージョンに 5 つの VM を展開します：

| リージョン | ClickHouse サーバー | バケット             | ClickHouse Keeper |
|------|-------------------|-------------------|-------------------|
| 1    | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2    | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`  |                   |                   | `keepernode3`       |

`*` これは 1 または 2 と同じリージョンの異なる可用性ゾーンになります。

#### ClickHouse のデプロイ {#deploy-clickhouse}

サンプル構成の中で、ClickHouse を 2 つのホストに展開し、`chnode1` と `chnode2` と名付けます。

`chnode1` を 1 つの GCP リージョンに配置し、`chnode2` を 2 番目に配置します。このガイドでは、コンピューティングエンジン VM および GCS バケットに `us-east1` と `us-east4` が使用されます。

:::note
構成されるまで `clickhouse server` を起動しないでください。インストールするだけです。
:::

ClickHouse サーバーノード上での展開手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。

#### ClickHouse Keeper のデプロイ {#deploy-clickhouse-keeper}

ClickHouse Keeper を 3 つのホストに展開し、サンプル構成ではそれぞれ `keepernode1`、`keepernode2`、`keepernode3` と名付けます。 `keepernode1` は `chnode1` と同じリージョンにデプロイでき、`keepernode2` は `chnode2` と同じリージョンにデプロイできます。`keepernode3` は異なる可用性ゾーンに配置される必要がありますが、どちらか一方のリージョンに配置されても構いません。

ClickHouse Keeper のノードに対する展開手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。

### 2 つのバケットの作成 {#create-two-buckets}

2 つの ClickHouse サーバーは、高可用性のために異なるリージョンに配置されます。それぞれのサーバーには、同じリージョンに GCS バケットがあります。

**Cloud Storage > Buckets** で **CREATE BUCKET** を選択します。このチュートリアルでは、`us-east1` と `us-east4` 各リージョンに 2 つのバケットを作成します。バケットは単一リージョン、標準ストレージクラスで、パブリックではありません。案内があれば、パブリックアクセス防止を有効にします。フォルダは作成しないでください。書き込み時に ClickHouse が作成します。

バケットと HMAC キーの作成手順が必要な場合は、**Create GCS buckets and an HMAC key** を展開し、手順に従ってください：

<BucketDetails />

### ClickHouse Keeper の構成 {#configure-clickhouse-keeper}

すべての ClickHouse Keeper ノードは、`server_id` 行（ハイライトされた行）のみが異なる同じ構成ファイルを持っています。ファイルを編集して ClickHouse Keeper サーバーのホスト名を設定し、各サーバーで `server_id` を適切な `server` エントリと一致させます。この例では `server_id` が `3` に設定されているため、`raft_configuration` で一致する行をハイライトしています。

- ファイルをホスト名で編集し、ClickHouse サーバーノードと Keeper ノードから解決できることを確認します。
- ファイルを配置します（各 Keeper サーバーの `/etc/clickhouse-keeper/keeper_config.xml`）。
- 各マシンで `raft_configuration` 内のインデックスに基づいて `server_id` を編集します。

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

### ClickHouse サーバーの構成 {#configure-clickhouse-server}

:::note best practice
このガイドの一部の手順では、構成ファイルを `/etc/clickhouse-server/config.d/` に配置するように求められます。これは、Linux システムの設定オーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに配置すると、ClickHouse はデフォルト構成と内容をマージします。このため、`config.d` ディレクトリにこれらのファイルを配置することにより、アップグレード中に構成が失われるのを防ぐことができます。
:::

#### ネットワーキング {#networking}
デフォルトでは、ClickHouse はループバックインターフェースでリッスンしています。レプリケートされたセットアップでは、マシン間のネットワークが必要です。すべてのインターフェースでリッスンします：

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### リモート ClickHouse Keeper サーバー {#remote-clickhouse-keeper-servers}

レプリケーションは ClickHouse Keeper によって調整されます。この構成ファイルは、ホスト名とポート番号で ClickHouse Keeper ノードを識別します。

- ホスト名を Keeper ホストに合わせて編集します。

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

#### リモート ClickHouse サーバー {#remote-clickhouse-servers}

このファイルは、クラスター内の各 ClickHouse サーバーのホスト名とポートを構成します。デフォルトの構成ファイルにはサンプルクラスターの定義が含まれており、完全に構成されたクラスターのみに表示されるように、`remote_servers` エントリに `replace="true"` タグが追加されています。これにより、デフォルトとマージされたときに `remote_servers` セクションが追加されるのではなく、置き換えられます。

- ファイルをホスト名で編集し、ClickHouse サーバーノードから解決できることを確認します。

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

#### レプリカの識別 {#replica-identification}

このファイルは、ClickHouse Keeper パスに関連する設定を構成します。具体的には、データがどのレプリカに属しているかを識別するために使用されるマクロを含みます。1 つのサーバーではレプリカを `replica_1` として指定し、別のサーバーでは `replica_2` とします。名前は変更可能ですが、例としてレプリカがサウスカロライナにストアされ、もう一方がノースバージニアにある場合、値は `carolina` と `virginia` に設定できます。各マシンで異なるようにしてください。

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

#### GCS におけるストレージ {#storage-in-gcs}

ClickHouse のストレージ構成には `disks` と `policies` が含まれます。以下に構成されているディスクは `gcs` と名付けられ、`type` は `s3` です。タイプは s3 である理由は、ClickHouse が GCS バケットに AWS S3 バケットとしてアクセスするためです。この構成は、ClickHouse サーバーノードごとに 2 つのコピーが必要です。

以下の構成内で替える必要がある点は次のとおりです：

2 つの ClickHouse サーバーノード間で異なる部分：
- `REPLICA 1 BUCKET` はサーバーと同じリージョンにあるバケットの名前に設定される必要があります。
- `REPLICA 1 FOLDER` は、1 つのサーバーで `replica_1` に変更し、もう一つで `replica_2` に変更する必要があります。

次の部分は双方のノード間で共通です：
- `access_key_id` は前に生成された HMAC キーに設定します。
- `secret_access_key` は前に生成された HMAC シークレットに設定します。

```xml title=/etc/clickhouse-server/config.d/storage.xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/REPLICA 1 BUCKET/REPLICA 1 FOLDER/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
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

### ClickHouse Keeper の起動 {#start-clickhouse-keeper}

オペレーティングシステムのコマンドを使用してください。例えば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### ClickHouse Keeper の状態確認 {#check-clickhouse-keeper-status}

`netcat` を使用して ClickHouse Keeper にコマンドを送信します。例えば、`mntr` は ClickHouse Keeper クラスターの状態を返します。各 Keeper ノードでコマンドを実行すると、1 つはリーダーになり、他の 2 つはフォロワーになるのがわかります。

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

# highlight-start
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader

# highlight-end
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end
```

### ClickHouse サーバーの起動 {#start-clickhouse-server}

`chnode1` と `chnode2` で次のコマンドを実行します：

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### 検証 {#verification}

#### ディスク構成の検証 {#verify-disk-configuration}

`system.disks` には各ディスクのレコードが含まれます：
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

3 rows in set. Elapsed: 0.002 sec.
```
#### クラスターに作成されたテーブルが両方のノードに作成されたことの確認 {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
```sql
-- highlight-next-line
create table trips on cluster 'cluster_1S_2R' (
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
 `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
ENGINE = ReplicatedMergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
-- highlight-next-line
SETTINGS storage_policy='gcs_main'
```
```response
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.us-east4-c.c.gcsqa-375100.internal │ 9000 │      0 │       │                   1 │                1 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.us-east1-b.c.gcsqa-375100.internal │ 9000 │      0 │       │                   0 │                0 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 0.641 sec.
```

#### データが挿入できることの確認 {#verify-that-data-can-be-inserted}

```sql
INSERT INTO trips SELECT
    trip_id,
    pickup_date,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    tip_amount,
    total_amount,
    payment_type
FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames')
LIMIT 1000000
```

#### ストレージポリシー `gcs_main` がテーブルに使用されていることの確認 {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
```sql
SELECT
    engine,
    data_paths,
    metadata_path,
    storage_policy,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'trips'
FORMAT Vertical
```
```response
Row 1:
──────
engine:                          ReplicatedMergeTree
data_paths:                      ['/var/lib/clickhouse/disks/gcs/store/631/6315b109-d639-4214-a1e7-afbd98f39727/']
metadata_path:                   /var/lib/clickhouse/store/e0f/e0f3e248-7996-44d4-853e-0384e153b740/trips.sql
storage_policy:                  gcs_main
formatReadableSize(total_bytes): 36.42 MiB

1 row in set. Elapsed: 0.002 sec.
```

#### Google Cloud Console での確認 {#verify-in-google-cloud-console}

バケットを確認すると、`storage.xml` 構成ファイルで使用された名前のフォルダが各バケット内に作成されることがわかります。フォルダを展開すると、データパーティションを表す多くのファイルが見つかります。
#### レプリカ1のためのバケット {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="レプリカ1バケットの Google Cloud Storage におけるデータパーティションのフォルダ構造" />

#### レプリカ2のためのバケット {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="レプリカ2バケットの Google Cloud Storage におけるデータパーティションのフォルダ構造" />
