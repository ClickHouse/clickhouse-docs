---
sidebar_label: Google Cloud Storage (GCS)
sidebar_position: 4
slug: /integrations/gcs
description: "Google Cloud Storage (GCS) バックの MergeTree"
---
import BucketDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';

# ClickHouse と Google Cloud Storage を統合する

:::note
ClickHouse Cloud を [Google Cloud](https://cloud.google.com) で使用している場合、このページは該当しません。なぜなら、あなたのサービスはすでに [Google Cloud Storage](https://cloud.google.com/storage) を利用しているからです。GCS からデータを `SELECT` または `INSERT` したい場合は、[`gcs` テーブル関数](/sql-reference/table-functions/gcs) を参照してください。
:::

ClickHouse は、GCS がストレージと計算を分離しようとするユーザーにとって魅力的なストレージ解決策であることを認識しています。これを実現するために、MergeTree エンジンのストレージとして GCS を使用するためのサポートが提供されています。これにより、ユーザーは GCS のスケーラビリティとコストの利点、および MergeTree エンジンの挿入およびクエリ性能を活用できるようになります。

## GCS バックの MergeTree {#gcs-backed-mergetree}

### ディスクの作成 {#creating-a-disk}

GCS バケットをディスクとして利用するには、まず ClickHouse の構成ファイル `conf.d` にそれを宣言する必要があります。以下に GCS ディスク宣言の例を示します。この構成には、GCS の「ディスク」、キャッシュ、および GCS ディスク上にテーブルを作成する際に DDL クエリで指定されるポリシーを構成するための複数のセクションが含まれています。これらは以下に説明されています。

#### storage_configuration > disks > gcs {#storage_configuration--disks--gcs}

構成のこの部分は、ハイライトされた部分に示されており、以下のことを指定しています：
- バッチ削除は行われません。GCS は現在バッチ削除をサポートしていないため、エラーメッセージを抑制するために自動検出は無効にされています。
- ディスクのタイプは `s3` です。これは S3 API を使用しているためです。
- GCS によって提供されるエンドポイント
- サービスアカウント HMAC キーとシークレット
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

以下にハイライトされた例の構成は、ディスク `gcs` に対して 10Gi のメモリキャッシュを有効にします。

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

ストレージ設定ポリシーは、データの保存先を選択することを可能にします。以下のハイライトされたポリシーは、ポリシー `gcs_main` を指定することにより、ディスク `gcs` にデータを保存できるようにします。例えば、`CREATE TABLE ... SETTINGS storage_policy='gcs_main'`。

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

このディスク宣言に関連する設定の完全なリストは [こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) にあります。

### テーブルの作成 {#creating-a-table}

ディスクが書き込みアクセスを持つバケットを使用するように構成されていると仮定すると、以下の例のようなテーブルを作成できるはずです。簡潔さのために、NYC タクシーのカラムのサブセットを使用し、GCS バックのテーブルに直接データをストリーミングします：

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
# highlight-next-line
SETTINGS storage_policy='gcs_main'
```

```sql
INSERT INTO trips_gcs SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

ハードウェアによっては、この 1m 行の挿入には数分かかる場合があります。進行状況は system.processes テーブルで確認できます。行数を最大 10m まで調整し、いくつかのサンプルクエリを試してみてください。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### レプリケーションの処理 {#handling-replication}

GCS ディスクでのレプリケーションは、`ReplicatedMergeTree` テーブルエンジンを使用して実行できます。詳細は [GCS を使用した 2 つの GCP リージョン間での単一シャードのレプリケーション](#gcs-multi-region) ガイドを参照してください。

### 詳細を学ぶ {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) は、Amazon Simple Storage Service (Amazon S3) などのサービスで動作するツールやライブラリと相互運用できます。

スレッドのチューニングに関する詳細は、[パフォーマンスの最適化](../s3/index.md#s3-optimizing-performance) を参照してください。

## Google Cloud Storage (GCS) の使用 {#gcs-multi-region}

:::tip
ClickHouse Cloud ではデフォルトでオブジェクトストレージが使用されており、ClickHouse Cloud で実行中の場合はこの手順に従う必要はありません。
:::

### デプロイメントの計画 {#plan-the-deployment}

このチュートリアルは、Google Cloud で稼働し、Google Cloud Storage (GCS) を ClickHouse のストレージディスク「タイプ」として使用するレプリケートされた ClickHouse デプロイメントを説明するために書かれています。

このチュートリアルでは、Google Cloud Engine VM に ClickHouse サーバーノードをデプロイし、各ノードにストレージ用の GCS バケットを関連付けます。レプリケーションは、VM としてデプロイされた一連の ClickHouse Keeper ノードによって調整されます。

高可用性のサンプル要件：
- 2 つの ClickHouse サーバーノード、2 つの GCP リージョンに配置
- 2 つの GCS バケット、2 つの ClickHouse サーバーノードと同じリージョンに配置
- 3 つの ClickHouse Keeper ノード、うち 2 つは ClickHouse サーバーノードと同じリージョンに配置。3 番目は最初の 2 つの Keeper ノードのいずれかと同じリージョンに配置できますが、異なる可用性ゾーンに配置する必要があります。

ClickHouse Keeper は 2 つのノードが必要なため、高可用性のためには 3 つのノードが必要です。

### VM の準備 {#prepare-vms}

3 つのリージョンに 5 つの VM をデプロイします：

| リージョン | ClickHouse サーバー | バケット            | ClickHouse Keeper |
|--------|-------------------|-------------------|-------------------|
| 1      | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2      | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`  |                   |                   | `keepernode3`       |

`*` これは 1 または 2 と同じリージョンの異なる可用性ゾーンにすることができます。

#### ClickHouse のデプロイ {#deploy-clickhouse}

2 つのホストに ClickHouse をデプロイします。サンプル構成では、これらは `chnode1` と `chnode2` という名前です。

`chnode1` を 1 つの GCP リージョンに配置し、`chnode2` を別の GCP リージョンに配置します。このガイドでは `us-east1` と `us-east4` がコンピュータエンジン VM のリージョンおよび GCS バケットのために使用されています。

:::note
`clickhouse server` を開始するのは、設定後にしてください。ただインストールしてください。
:::

ClickHouse サーバーノードでのデプロイ手順を実行している際は [インストール手順](/getting-started/install.md/#available-installation-options) を参照してください。

#### ClickHouse Keeper のデプロイ {#deploy-clickhouse-keeper}

3 つのホストに ClickHouse Keeper をデプロイします。サンプル構成では、これらは `keepernode1`, `keepernode2`, および `keepernode3` という名前です。 `keepernode1` は `chnode1` と同じリージョンに、`keepernode2` は `chnode2` と同じリージョンに、`keepernode3` はいずれかのリージョンに配置できますが、そのリージョン内の ClickHouse ノードとは異なる可用性ゾーンに配置する必要があります。

ClickHouse Keeper ノードでのデプロイ手順を実行している際は、[インストール手順](/getting-started/install.md/#install-standalone-clickhouse-keeper) を参照してください。

### 2 つのバケットを作成する {#create-two-buckets}

高可用性のため、2 つの ClickHouse サーバーは異なるリージョンに配置されます。それぞれのサーバーは同じリージョンに GCS バケットを持ちます。

**Cloud Storage > Buckets** で **CREATE BUCKET** を選択します。このチュートリアルでは、`us-east1` と `us-east4` の各リージョンに 1 つずつバケットを作成します。バケットはシングルリージョン、標準ストレージクラスで、公開ではありません。プロンプトが表示されたら、公共アクセス防止を有効にします。フォルダーを作成しないでください。ClickHouse がストレージに書き込むときに作成されます。

バケットと HMAC キーを作成するための手順が必要な場合は、**Create GCS buckets and an HMAC key** を展開し、一緒に進めてください。

<BucketDetails />

### ClickHouse Keeper の構成 {#configure-clickhouse-keeper}

すべての ClickHouse Keeper ノードは、`server_id` 行（以下の最初のハイライトされた行）を除いて同じ構成ファイルを持っています。ファイルを ClickHouse Keeper サーバーのホスト名で修正し、各サーバーの `server_id` を `raft_configuration` 内の適切な `server` エントリに一致させます。この例では `server_id` が `3` に設定されているため、`raft_configuration` 内の一致する行もハイライトしました。

- ホスト名でファイルを編集し、ClickHouse サーバーノードおよび Keeper ノードから解決できるようにします
- ファイルを配置場所にコピーします（各 Keeper サーバーの `/etc/clickhouse-keeper/keeper_config.xml`）
- 各マシンの `server_id` を、`raft_configuration` 内のエントリ番号に基づいて編集します

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
このガイドの一部の手順では、構成ファイルを `/etc/clickhouse-server/config.d/` に配置するように指示されます。これは、Linux システムでの構成オーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに配置すると、ClickHouse はコンテンツをデフォルトの構成とマージします。これにより、`config.d` ディレクトリにファイルを置くことで、アップグレード時に構成を失うのを避けることができます。
:::

#### ネットワーキング {#networking}
デフォルトでは、ClickHouse はループバックインターフェースでリッスンします。レプリケートされた設定では、マシン間のネットワーキングが必要です。すべてのインターフェースでリッスンします：

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### リモート ClickHouse Keeper サーバー {#remote-clickhouse-keeper-servers}

レプリケーションは ClickHouse Keeper によって調整されます。この構成ファイルは、ホスト名とポート番号で ClickHouse Keeper ノードを識別します。

- ホスト名を Keeper ホストに合わせて編集します

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

このファイルは、クラスタ内の各 ClickHouse サーバーのホスト名とポートを構成します。デフォルトの構成ファイルにはサンプルクラスタ定義が含まれており、完全に構成されたクラスタのみを表示するために、`remote_servers` エントリに `replace="true"` タグが追加され、デフォルトとマージされた際に `remote_servers` セクションが追加されずに置き換えられます。

- ホスト名でファイルを編集し、ClickHouse サーバーノードから解決できることを確認します

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

このファイルは、ClickHouse Keeper パスに関連する設定を構成します。具体的には、どのレプリカがデータの一部であるかを識別するために使用されるマクロです。1 台のサーバーでは、レプリカを `replica_1` と指定し、もう 1 台のサーバーでは `replica_2` とします。名前は変更できます。例えば、1 つのレプリカがサウスカロライナに保存され、もう 1 つがバージニア北部にある場合、値を `carolina` と `virginia` にすることができます。ただし、各マシンで異なることを確認してください。

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

#### GCS でのストレージ {#storage-in-gcs}

ClickHouse のストレージ構成には `disks` と `policies` が含まれます。以下で構成されているディスクは `gcs` と呼ばれ、`type` は `s3` です。これは ClickHouse が GCS バケットに AWS S3 バケットのようにアクセスするためです。この構成は 2 つの ClickHouse サーバーノード用に 2 回必要です。

以下の構成内で置き換えが必要です。

この置き換えは 2 つの ClickHouse サーバーノード間で異なります：
- `REPLICA 1 BUCKET` は、サーバーと同じリージョンのバケット名に設定する必要があります
- `REPLICA 1 FOLDER` は、1 つのサーバーでは `replica_1` とし、もう 1 つのサーバーでは `replica_2` に変更する必要があります

この置き換えは 2 つのノード間で共通です：
- `access_key_id` は、以前に生成した HMAC キーに設定する必要があります
- `secret_access_key` は、以前に生成した HMAC シークレットに設定する必要があります

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

#### ClickHouse Keeper のステータス確認 {#check-clickhouse-keeper-status}

`netcat` を使用して ClickHouse Keeper にコマンドを送信します。例えば、`mntr` コマンドは ClickHouse Keeper クラスターの状態を返します。各 Keeper ノードでコマンドを実行すると、1 つがリーダーであり、他の 2 つがフォロワーであることがわかります。

```bash
echo mntr | nc localhost 9181
```
```response
zk_version	v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency	0
zk_max_latency	11
zk_min_latency	0
zk_packets_received	1783
zk_packets_sent	1783
# highlight-start
zk_num_alive_connections	2
zk_outstanding_requests	0
zk_server_state	leader
# highlight-end
zk_znode_count	135
zk_watch_count	8
zk_ephemerals_count	3
zk_approximate_data_size	42533
zk_key_arena_size	28672
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	182
zk_max_file_descriptor_count	18446744073709551615
# highlight-start
zk_followers	2
zk_synced_followers	2
# highlight-end
```

### ClickHouse サーバーの起動 {#start-clickhouse-server}

`chnode1` と `chnode2` で以下を実行：

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### 検証 {#verification}

#### ディスク構成の検証 {#verify-disk-configuration}

`system.disks` には各ディスクのレコードが含まれている必要があります：
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

3 行が設定されました。経過時間: 0.002 秒。
```
#### クラスター上に作成されたテーブルが両方のノードで作成されていることを確認する {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
```sql
# highlight-next-line
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
# highlight-next-line
SETTINGS storage_policy='gcs_main'
```
```response
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.us-east4-c.c.gcsqa-375100.internal │ 9000 │      0 │       │                   1 │                1 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.us-east1-b.c.gcsqa-375100.internal │ 9000 │      0 │       │                   0 │                0 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 行が設定されました。経過時間: 0.641 秒。
```

#### データを挿入できることを確認する {#verify-that-data-can-be-inserted}

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

#### テーブルに `gcs_main` ストレージポリシーが使用されていることを確認する {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
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

1 行が設定されました。経過時間: 0.002 秒。
```

#### Google Cloud Console での検証 {#verify-in-google-cloud-console}

バケットを見ると、`storage.xml` 構成ファイルで使用されている名前のフォルダが各バケットに作成されていることが確認できます。フォルダを展開すると、データパーティションを表す多くのファイルがあることがわかります。
#### レプリカ 1 用のバケット {#bucket-for-replica-one}
![レプリカ 1 バケット](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-examine-bucket-1.png)
#### レプリカ 2 用のバケット {#bucket-for-replica-two}
![レプリカ 2 バケット](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/s3/images/GCS-examine-bucket-2.png)
