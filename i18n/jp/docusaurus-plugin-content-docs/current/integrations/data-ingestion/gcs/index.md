---
'sidebar_label': 'Google Cloud Storage (GCS)'
'sidebar_position': 4
'slug': '/integrations/gcs'
'description': 'Google Cloud Storage (GCS) バック MergeTree'
'title': 'Google Cloud Storage と ClickHouse の統合'
'doc_type': 'guide'
---

import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# Google Cloud StorageをClickHouseと統合する

:::note
[Google Cloud](https://cloud.google.com)上でClickHouse Cloudを使用している場合、このページは適用されません。サービスはすでに[Google Cloud Storage](https://cloud.google.com/storage)を使用しています。GCSからデータを`SELECT`または`INSERT`しようとしている場合は、[`gcs`テーブル関数](/sql-reference/table-functions/gcs)をご覧ください。
:::

ClickHouseは、GCSがストレージと計算を分離したいユーザーにとって魅力的なストレージソリューションであることを認識しています。この目的を達成するために、MergeTreeエンジンのストレージとしてGCSを使用するためのサポートが提供されています。これにより、ユーザーはGCSのスケーラビリティとコストの利点、及びMergeTreeエンジンの挿入とクエリ性能を活用できるようになります。

## GCSバックのMergeTree {#gcs-backed-mergetree}

### ディスクの作成 {#creating-a-disk}

GCSバケットをディスクとして利用するには、まずClickHouseの設定ファイルの`conf.d`ディレクトリ内に宣言する必要があります。以下にGCSディスク宣言の例を示します。この設定には、GCS「ディスク」、キャッシュ、およびGCSディスク上にテーブルを作成する際にDDLクエリで指定されるポリシーを設定するための複数のセクションが含まれています。これらのそれぞれについては以下に説明します。

#### ストレージ設定 > ディスク > gcs {#storage_configuration--disks--gcs}

この設定の一部はハイライトされたセクションに示されており、次のことを指定しています：
- バッチ削除は行わないこと。現在、GCSはバッチ削除をサポートしていないため、自動検出は無効にしてエラーメッセージを抑制します。
- ディスクのタイプは`s3`です。S3 APIが使用されています。
- GCSによって提供されたエンドポイント
- サービスアカウントのHMACキーとシークレット
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
#### ストレージ設定 > ディスク > キャッシュ {#storage_configuration--disks--cache}

以下のハイライトされた例の設定は、ディスク`gcs`のために10Giのメモリキャッシュを有効にします。

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
#### ストレージ設定 > ポリシー > gcs_main {#storage_configuration--policies--gcs_main}

ストレージ設定ポリシーにより、データが格納される場所を選択できます。以下にハイライトされたポリシーは、ポリシー`gcs_main`を指定することでデータをディスク`gcs`に格納できることを示しています。例えば、`CREATE TABLE ... SETTINGS storage_policy='gcs_main'`。

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

このディスク宣言に関連する設定の完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)にあります。

### テーブルの作成 {#creating-a-table}

書き込みアクセスを持つバケットを使用するようにディスクが設定されていると仮定すると、以下の例のようなテーブルを作成できるはずです。簡潔さを目的として、NYCタクシーカラムのサブセットを使用し、データをGCSバックのテーブルに直接ストリーミングします：

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

ハードウェアによっては、この後者の1m行の挿入を実行するのに数分かかる場合があります。進捗状況はsystem.processesテーブルで確認できます。行数を10mの制限まで調整し、いくつかのサンプルクエリを試してみてください。

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### レプリケーションの処理 {#handling-replication}

GCSディスクによるレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用して実施できます。詳細については、[GCSを使用して2つのGCPリージョン間で単一シャードをレプリケートする](#gcs-multi-region)ガイドを参照してください。

### さらに学ぶ {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview)は、Amazon Simple Storage Service（Amazon S3）などのサービスで動作するツールやライブラリと相互運用可能です。

スレッドの調整に関する詳細は、[パフォーマンスの最適化](../s3/index.md#s3-optimizing-performance)を参照してください。

## Google Cloud Storage (GCS)の使用 {#gcs-multi-region}

:::tip
ClickHouse Cloudではオブジェクトストレージがデフォルトで使用されているため、ClickHouse Cloudで実行する場合はこの手順に従う必要はありません。
:::

### デプロイメントの計画 {#plan-the-deployment}

このチュートリアルは、Google Cloudで実行されるレプリケートされたClickHouseデプロイメントを定義し、ClickHouseストレージディスク「タイプ」としてGoogle Cloud Storage (GCS)を使用する方法を説明するために書かれています。

チュートリアルでは、Google Cloud Engine VMにClickHouseサーバーノードをデプロイし、それぞれにストレージ用のGCSバケットを関連付けます。レプリケーションは、VMとしてデプロイされた一連のClickHouse Keeperノードによって調整されます。

高可用性のためのサンプル要件：
- 2つのClickHouseサーバーノード、2つのGCPリージョンに
- 2つのGCSバケット、2つのClickHouseサーバーノードと同じリージョンに配置
- 3つのClickHouse Keeperノード、2つはClickHouseサーバーノードと同じリージョンに配置。3つ目は最初の2つのKeeperノードのうちの1つと同じリージョンですが、異なる可用性ゾーンに配置できる。

ClickHouse Keeperは、機能するために2つのノードを必要とします。したがって、高可用性には3つのノードが必要です。

### 仮想マシンの準備 {#prepare-vms}

3つの地域に5つのVMをデプロイします：

| リージョン | ClickHouseサーバー | バケット            | ClickHouse Keeper |
|------------|---------------------|---------------------|-------------------|
| 1          | `chnode1`            | `bucket_regionname` | `keepernode1`      |
| 2          | `chnode2`            | `bucket_regionname` | `keepernode2`      |
| 3 `*`      |                     |                     | `keepernode3`      |

`*` これは、1または2と同じリージョンの異なる可用性ゾーンである可能性があります。

#### ClickHouseのデプロイ {#deploy-clickhouse}

サンプル設定では、`chnode1`と`chnode2`という名前の2つのホストでClickHouseをデプロイします。

`chnode1`を1つのGCPリージョンに、`chnode2`を別のリージョンに配置します。このガイドでは、コンピュートエンジンのVMとGCSバケットのために`us-east1`と`us-east4`を使用します。

:::note
設定が完了するまで`clickhouse server`を開始しないでください。インストールするだけです。
:::

ClickHouseサーバーノードのデプロイ手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。

#### ClickHouse Keeperのデプロイ {#deploy-clickhouse-keeper}

サンプル設定では、`keepernode1`、`keepernode2`、`keepernode3`という名前の3つのホストでClickHouse Keeperをデプロイします。`keepernode1`は`chnode1`と同じリージョンに、`keepernode2`は`chnode2`に、`keepernode3`はどちらかのリージョンに配置できますが、そのリージョンのClickHouseノードとは異なる可用性ゾーンである必要があります。

ClickHouse Keeperノードでデプロイ手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。

### 2つのバケットの作成 {#create-two-buckets}

2つのClickHouseサーバーは高可用性のために異なるリージョンに配置されます。それぞれが同じリージョンにGCSバケットを持ちます。

**Cloud Storage > Buckets**で**CREATE BUCKET**を選択します。このチュートリアルでは、`us-east1`と`us-east4`にそれぞれ1つのバケットが作成されます。バケットは単一リージョンの標準ストレージクラスであり、公開されていません。プロンプトが表示されたら、公開アクセス防止を有効にします。フォルダは作成しないでください。ClickHouseがストレージに書き込むときに作成されます。

バケットとHMACキーを作成するための手順が必要な場合は、**GCSバケットとHMACキーの作成**のセクションを展開し、一緒に進めてください：

<BucketDetails />

### ClickHouse Keeperの構成 {#configure-clickhouse-keeper}

すべてのClickHouse Keeperノードは、`server_id`行（以下の最初のハイライトされた行）を除いて、同じ構成ファイルを持っています。ClickHouse Keeperサーバーのホスト名でファイルを修正し、それぞれのサーバーで`server_id`を`raft_configuration`内の適切な`server`エントリに一致させるように設定します。この例では`server_id`が`3`に設定されているため、`raft_configuration`内で一致する行がハイライトされています。

- ホスト名を修正し、ClickHouseサーバーノードとKeeperノードから解決できることを確認します。
- `/etc/clickhouse-keeper/keeper_config.xml`にファイルをコピーします（各Keeperサーバーで）。
- 各マシンの`server_id`を`raft_configuration`内のエントリ番号に基づいて編集します。

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

### ClickHouseサーバーの構成 {#configure-clickhouse-server}

:::note best practice
このガイドの一部の手順では、設定ファイルを`/etc/clickhouse-server/config.d/`に配置するように指示されます。これは、Linuxシステムでの設定オーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに配置すると、ClickHouseはデフォルトの設定と内容をマージします。この`config.d`ディレクトリにファイルを配置することで、アップグレード中に設定を失うのを防ぐことができます。
:::

#### ネットワーキング {#networking}
デフォルトではClickHouseはループバックインターフェースでリッスンしますが、レプリケートされたセットアップではマシン間のネットワークが必要です。すべてのインターフェースでリッスンします：

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### リモートClickHouse Keeperサーバー {#remote-clickhouse-keeper-servers}

レプリケーションはClickHouse Keeperによって調整されます。この構成ファイルでは、ホスト名とポート番号によってClickHouse Keeperノードを特定します。

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

このファイルはクラスター内の各ClickHouseサーバーのホスト名とポートを構成します。デフォルトの構成ファイルにはサンプルのクラスター定義が含まれており、完全に構成されたクラスターのみを表示するために、`remote_servers`エントリに`replace="true"`タグを追加して、デフォルトの設定とマージされたときに`remote_servers`セクションを追加するのではなく置き換えます。

- ホスト名でファイルを編集し、ClickHouseサーバーノードから解決できることを確認します。

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

このファイルはClickHouse Keeperパスに関連する設定を構成します。具体的には、データがどのレプリカの一部であるかを特定するために使用されるマクロです。一方のサーバーではレプリカを`replica_1`として指定し、もう一方のサーバーでは`replica_2`として指定します。名前は変更可能ですが、1つのレプリカがサウスカロライナにあり、もう1つがノースバージニアにある今回の例に基づくと、値は`carolina`と`virginia`にできることを確認してください。ただし、各マシンで異なる必要があります。

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

#### GCSにおけるストレージ {#storage-in-gcs}

ClickHouseのストレージ構成は`disks`と`policies`を含みます。以下で構成中のディスクは`gcs`と呼ばれ、`type`は`s3`です。このタイプは、ClickHouseがGCSバケットにAWS S3バケットのようにアクセスするためです。この設定は、各ClickHouseサーバーノード用に2つのコピーが必要です。

以下の構成内でこれらの置換を行う必要があります。

これらの置換は、2つのClickHouseサーバーノード間で異なります：
- `REPLICA 1 BUCKET`はサーバーと同じリージョンのバケットの名前に設定する必要があります。
- `REPLICA 1 FOLDER`は一方のサーバーでは`replica_1`に、他方では`replica_2`に変更する必要があります。

これらの置換は、両方のノード間で共通です：
- `access_key_id`は、以前に生成されたHMACキーに設定する必要があります。
- `secret_access_key`は、以前に生成されたHMACシークレットに設定する必要があります。

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

オペレーティングシステムに応じたコマンドを使用します。例えば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### ClickHouse Keeperのステータスの確認 {#check-clickhouse-keeper-status}

`netcat`を使ってClickHouse Keeperにコマンドを送信します。例えば、`mntr`はClickHouse Keeperクラスターの状態を返します。各Keeperノードでこのコマンドを実行すると、1つがリーダーで、他の2つがフォロワーであることがわかります：

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

`chnode1`と`chnode`で次のコマンドを実行します：

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### 検証 {#verification}

#### ディスク設定の検証 {#verify-disk-configuration}

`system.disks`は各ディスクのレコードを含む必要があります：
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
#### クラスターで作成されたテーブルが両方のノードで作成されていることの確認 {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
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

#### テーブルに対してストレージポリシー`gcs_main`が使用されていることの検証 {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
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

#### Google Cloudコンソールでの確認 {#verify-in-google-cloud-console}

バケットを見てみると、`storage.xml`設定ファイルで使用された名前のフォルダが各バケットに作成されていることがわかります。フォルダを展開すると、データパーティションを表す多くのファイルが表示されます。
#### レプリカ1のバケット {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="Google Cloud Storageのレプリカ1バケット、データパーティションを持つフォルダ構造を表示" />

#### レプリカ2のバケット {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="Google Cloud Storageのレプリカ2バケット、データパーティションを持つフォルダ構造を表示" />
