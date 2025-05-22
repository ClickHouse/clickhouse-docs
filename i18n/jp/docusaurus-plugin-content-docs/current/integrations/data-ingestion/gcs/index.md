---
'sidebar_label': 'Google Cloud Storage (GCS)'
'sidebar_position': 4
'slug': '/integrations/gcs'
'description': 'Google Cloud Storage (GCS) Backed MergeTree'
'title': 'Integrate Google Cloud Storage with ClickHouse'
---

import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';



# Google Cloud StorageをClickHouseと統合する

:::note
ClickHouse Cloudを[Google Cloud](https://cloud.google.com)で使用している場合、このページは適用されません。サービスはすでに[Google Cloud Storage](https://cloud.google.com/storage)を使用しているためです。GCSからデータを`SELECT`または`INSERT`しようとしている場合は、[`gcs`テーブル関数](/sql-reference/table-functions/gcs)を参照してください。
:::

ClickHouseは、GCSがストレージと計算を分離したいユーザーにとって魅力的なストレージソリューションであることを認識しています。この実現を助けるため、MergeTreeエンジンのストレージとしてGCSを使用するためのサポートが提供されています。これにより、ユーザーはGCSのスケーラビリティとコスト利点、さらにMergeTreeエンジンの挿入とクエリパフォーマンスを活用できます。

## GCSバックのMergeTree {#gcs-backed-mergetree}

### ディスクの作成 {#creating-a-disk}

GCSバケットをディスクとして利用するには、まずClickHouseの設定ファイル内で`conf.d`の下にそれを宣言する必要があります。以下に、GCSディスク宣言の例を示します。この設定には、GCS「ディスク」、キャッシュ、およびテーブルがGCSディスク上に作成される際にDDLクエリで指定されるポリシーを設定するための複数のセクションが含まれています。これらは以下に説明されています。

#### storage_configuration > disks > gcs {#storage_configuration--disks--gcs}

設定のこの部分は強調表示されており、以下を指定します：
- バッチ削除を実行しない。GCSは現在バッチ削除をサポートしていないため、自動検出はエラーメッセージを抑制するために無効にされています。
- ディスクのタイプは`s3`です。これはS3 APIが使用されているためです。
- GCSから提供されるエンドポイント
- サービスアカウントHMACキーとシークレット
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

以下に強調表示された例設定では、ディスク`gcs`のために10Giのメモリキャッシュを有効にします。

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

ストレージ設定ポリシーでは、データがどこに保存されるかを選択できます。以下に強調表示されたポリシーは、ポリシー`gcs_main`を指定することによりデータをディスク`gcs`に保存できるようにします。たとえば、`CREATE TABLE ... SETTINGS storage_policy='gcs_main'`です。

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

このディスク宣言に関連する設定の完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。

### テーブルの作成 {#creating-a-table}

書き込みアクセスを持つバケットを使用するようにディスクを設定していることを前提に、以下の例のようにテーブルを作成できるはずです。簡潔さのために、NYCのタクシーのカラムのサブセットを使用し、データを直接GCSバックのテーブルにストリームします。

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

ハードウェアによっては、この1百万行の挿入には数分かかる場合があります。進捗はsystem.processesテーブルで確認できます。行数を10mの上限まで調整し、サンプルクエリを試してみてください。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### レプリケーションの処理 {#handling-replication}

GCSディスクとのレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用して実現できます。[GCSを使用して2つのGCPリージョンで単一のシャードをレプリケートする](#gcs-multi-region)ガイドで詳細を参照してください。

### さらに学ぶ {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview)は、Amazon Simple Storage Service (Amazon S3)などのサービスと連携するいくつかのツールやライブラリと相互運用可能です。

スレッドの調整に関する詳細情報は、[パフォーマンスの最適化](../s3/index.md#s3-optimizing-performance)を参照してください。

## Google Cloud Storage (GCS)の使用 {#gcs-multi-region}

:::tip
ClickHouse Cloudではデフォルトでオブジェクトストレージが使用されるため、ClickHouse Cloudを実行している場合はこの手順に従う必要はありません。
:::

### デプロイメントの計画 {#plan-the-deployment}

このチュートリアルは、Google Cloudで実行されるレプリケートされたClickHouseデプロイメントを説明し、ClickHouseストレージディスク「タイプ」としてGoogle Cloud Storage (GCS)を使用することを目的とします。

チュートリアルでは、ストレージ用のGCSバケットが各Google Cloud Engine VMに関連付けられたClickHouseサーバーノードをデプロイします。レプリケーションは、VMとしてデプロイされた一連のClickHouse Keeperノードによって調整されます。

高可用性のためのサンプル要件：
- 2つのGCPリージョンに2つのClickHouseサーバーノード
- 2つのClickHouseサーバーノードと同じリージョンにデプロイされた2つのGCSバケット
- 3つのClickHouse Keeperノード、そのうち2つはClickHouseサーバーノードと同じリージョンにデプロイされています。3つ目は、最初の2つのKeeperノードのいずれかと同じリージョンにありますが、異なる可用性ゾーンにあります。

ClickHouse Keeperは機能するために2つのノードが必要であるため、高可用性のために3つのノードが必要です。

### VMの準備 {#prepare-vms}

3つのリージョンに5つのVMをデプロイします：

| リージョン | ClickHouseサーバー | バケット            | ClickHouse Keeper |
|------------|-------------------|---------------------|-------------------|
| 1          | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2          | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`      |                   |                     | `keepernode3`       |

`*` これは1または2と同じリージョン内の異なる可用性ゾーンであることができます。

#### ClickHouseのデプロイ {#deploy-clickhouse}

2つのホストにClickHouseをデプロイします。このサンプル設定では、これらは`chnode1`、`chnode2`と名付けられています。

`chnode1`を1つのGCPリージョンに配置し、`chnode2`を別のリージョンに配置します。このガイドでは、計算エンジンVM用に`us-east1`と`us-east4`を使用し、同じくGCSバケット用にも使用します。

:::note
`clickhouse server`を設定が完了するまで起動しないでください。インストールするだけです。
:::

ClickHouseサーバーノードでのデプロイ手順については、[インストール手順](/getting-started/install/install.mdx)を参照してください。

#### ClickHouse Keeperのデプロイ {#deploy-clickhouse-keeper}

3つのホストにClickHouse Keeperをデプロイします。このサンプル設定では、これらは`keepernode1`、`keepernode2`、`keepernode3`と名付けられています。`keepernode1`は`chnode1`と同じリージョンにデプロイでき、`keepernode2`は`chnode2`と一緒にデプロイし、`keepernode3`はどちらのリージョンにもデプロイできますが、そのリージョンのClickHouseノードとは異なる可用性ゾーンに配置してください。

ClickHouse Keeperノードでのデプロイ手順については、[インストール手順](/getting-started/install/install.mdx)を参照してください。

### 2つのバケットを作成 {#create-two-buckets}

2つのClickHouseサーバーは高可用性のために異なるリージョンに配置されます。各サーバーには同じリージョン内にGCSバケットがあります。

**Cloud Storage > Buckets**で**CREATE BUCKET**を選択します。このチュートリアルでは、`us-east1`と`us-east4`のそれぞれに1つのバケットを作成します。バケットは単一リージョンの標準ストレージクラスであり、公開されません。プロンプトが表示されたら、公開アクセス防止を有効にします。フォルダーを作成しないでください。ClickHouseがストレージに書き込むときに作成されます。

バケットとHMACキーを作成するためのステップバイステップの手順が必要な場合は、**Create GCS buckets and an HMAC key**を展開し、手順に従ってください：

<BucketDetails />

### ClickHouse Keeperの設定 {#configure-clickhouse-keeper}

すべてのClickHouse Keeperノードは、`server_id`行（以下の最初の強調表示された行）を除いて同じ設定ファイルを持っています。ClickHouse Keeperサーバーのホスト名でファイルを修正し、各サーバーで`server_id`を`raft_configuration`の適切な`server`エントリに一致させるように設定します。この例では`server_id`が`3`に設定されているため、`raft_configuration`で一致する行を強調表示しています。

- ホスト名でファイルを編集し、ClickHouseサーバーノードとKeeperノードから解決できることを確認してください。
- ファイルを適切な場所にコピーします（各Keeperサーバーで`/etc/clickhouse-keeper/keeper_config.xml`）。
- 各マシンの`server_id`を変更します。これは`raft_configuration`内のエントリ番号に基づいています。

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

### ClickHouseサーバーの設定 {#configure-clickhouse-server}

:::note best practice
このガイドのいくつかの手順では、`/etc/clickhouse-server/config.d/`に設定ファイルを配置するように指示することがあります。これはLinuxシステムでの設定オーバーライドファイルのデフォルト位置です。これらのファイルをそのディレクトリに置くことで、ClickHouseは内容をデフォルトの設定と統合します。これにより、`config.d`ディレクトリにこれらのファイルを置くことで、アップグレード中に設定が失われるのを防げます。
:::

#### ネットワーキング {#networking}
デフォルトでは、ClickHouseはループバックインターフェースでリッスンしますが、レプリケーション環境では、マシン間のネットワーキングが必要です。すべてのインターフェースでリッスンします：

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### リモートClickHouse Keeperサーバー {#remote-clickhouse-keeper-servers}

レプリケーションはClickHouse Keeperによって調整されます。この設定ファイルでは、ホスト名とポート番号によってClickHouse Keeperノードを特定します。

- ホスト名をKeeperホストに合わせて編集します。


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

#### リモートClickHouseサーバー {#remote-clickhouse-servers}

このファイルは、クラスタ内の各ClickHouseサーバーのホスト名とポートを設定します。デフォルトの設定ファイルにはサンプルクラスタ定義が含まれています。完全に設定されたクラスタのみを示すために、`remote_servers`エントリに`replace="true"`タグを追加して、この設定がデフォルトの内容と統合される際に`remote_servers`セクションを追加するのではなく置き換えます。

- 自分のホスト名でファイルを編集し、ClickHouseサーバーノードから解決できることを確認してください。

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

このファイルは、ClickHouse Keeperパスに関連する設定を構成します。データがどのレプリカの一部であるかを特定するために使用されるマクロを具体的に示します。1台のサーバーではレプリカを`replica_1`として指定し、他方のサーバーでは`replica_2`として指定すべきです。名前は、例として、1つのレプリカがサウスカロライナにあり、もう1つがノースバージニアに保存される場合、値は`carolina`と`virginia`にすることができます。ただし、各マシンで異なることを確認してください。

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

#### GCSでのストレージ {#storage-in-gcs}

ClickHouseのストレージ設定には`disks`と`policies`が含まれます。以下で設定されているディスクは`gcs`と名付けられ、`type`は`s3`です。このタイプは、ClickHouseがGCSバケットにAWS S3バケットのようにアクセスするためです。この設定の2つのコピーが必要で、各ClickHouseサーバーノード用に1つずつ用意します。

設定内の以下の置換を行う必要があります。

この置換は2つのClickHouseサーバーノードで異なります：
- `REPLICA 1 BUCKET`は、サーバーと同じリージョンのバケットの名前に設定されるべきです。
- `REPLICA 1 FOLDER`は、1台のサーバーで`replica_1`に、もう1台のサーバーで`replica_2`に変更されるべきです。

これらの置換は、2つのノード間で共通です：
- `access_key_id`は、前に生成されたHMACキーに設定されるべきです。
- `secret_access_key`は、前に生成されたHMACシークレットに設定されるべきです。

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

### ClickHouse Keeperの起動 {#start-clickhouse-keeper}

オペレーティングシステムに応じたコマンドを使用してください。例えば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### ClickHouse Keeperのステータスを確認 {#check-clickhouse-keeper-status}

ClickHouse Keeperにコマンドを`netcat`で送信します。例えば、`mntr`はClickHouse Keeperクラスタの状態を返します。各Keeperノードでこのコマンドを実行すると、一つはリーダーであり、他の二つはフォロワーであることがわかります。

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

### ClickHouseサーバーの起動 {#start-clickhouse-server}

`chnode1`と`chnode2`で実行します：

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### 検証 {#verification}

#### ディスク設定を確認 {#verify-disk-configuration}

`system.disks`には、各ディスクのレコードが含まれているはずです：
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
#### クラスタ上に作成されたテーブルが両方のノードに作成されていることを確認 {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
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

#### データが挿入できることを確認 {#verify-that-data-can-be-inserted}

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

#### ストレージポリシー`gcs_main`がテーブルに使用されていることを確認 {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
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

#### Google Cloud Consoleでの確認 {#verify-in-google-cloud-console}

バケットを確認すると、`storage.xml`設定ファイルで使用された名前のフォルダーが各バケットに作成されているのがわかります。フォルダーを展開すると、データパーティションを表す多くのファイルが表示されます。
#### レプリカ1のバケット {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="Google Cloud Storageにおけるデータパーティションのフォルダー構造を示すレプリカ1のバケット" />

#### レプリカ2のバケット {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="Google Cloud Storageにおけるデータパーティションのフォルダー構造を示すレプリカ2のバケット" />
