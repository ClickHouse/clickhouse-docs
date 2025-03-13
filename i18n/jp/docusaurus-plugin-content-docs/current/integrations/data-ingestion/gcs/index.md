---
sidebar_label: Google Cloud Storage (GCS)
sidebar_position: 4
slug: /integrations/gcs
description: "Google Cloud Storage (GCS) に基づく MergeTree"
---
import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# ClickHouse と Google Cloud Storage の統合

:::note
ClickHouse Cloud を [Google Cloud](https://cloud.google.com) 上で使用している場合、このページは適用されません。すでにサービスが [Google Cloud Storage](https://cloud.google.com/storage) を使用しています。GCS からデータを `SELECT` または `INSERT` したい場合は、[`gcs` テーブル関数](/sql-reference/table-functions/gcs) を参照してください。
:::

ClickHouse は、GCS がストレージとコンピュートを分離することを求めるユーザーにとって魅力的なストレージソリューションであることを認識しています。この実現を助けるために、GCS を MergeTree エンジンのストレージとして使用するサポートが提供されています。これにより、ユーザーは GCS のスケーラビリティとコストの利点、ならびに MergeTree エンジンの挿入およびクエリ性能を活用できます。

## GCS に基づく MergeTree {#gcs-backed-mergetree}

### ディスクの作成 {#creating-a-disk}

GCS バケットをディスクとして利用するためには、まず ClickHouse の `conf.d` フォルダー内の設定ファイルにそれを宣言する必要があります。以下に示すのは GCS ディスク宣言の例です。この設定には、GCS "ディスク"、キャッシュ、およびテーブルが GCS ディスクに作成される際に DDL クエリで指定されるポリシーを構成するための複数のセクションが含まれています。それぞれについて以下に説明します。

#### storage_configuration > disks > gcs {#storage_configuration--disks--gcs}

この設定の一部はハイライトされたセクションに示されており、以下の内容を指定しています。
- バッチ削除は実行されません。GCS は現在バッチ削除をサポートしていないため、自動検出はエラーメッセージを抑制するために無効にされています。
- ディスクのタイプは `s3` です。なぜなら、S3 API が使用されているからです。
- GCS によって提供されたエンドポイント
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

以下に示すハイライトされた例の設定では、ディスク `gcs` に対して 10Gi のメモリキャッシュが有効になります。

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

ストレージ構成ポリシーにより、データの保存先を選択できます。以下にハイライトされたポリシーは、`gcs` ディスクにデータを保存することを許可するポリシー `gcs_main` を指定しています。例えば、`CREATE TABLE ... SETTINGS storage_policy='gcs_main'` という形で使用します。

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

このディスク宣言に関連する設定の完全なリストは、[ここ](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で見つけることができます。

### テーブルの作成 {#creating-a-table}

書き込みアクセス権を持つバケットを使用するようにディスクを構成した場合、以下の例のようにテーブルを作成できるはずです。簡潔さのために、NYC タクシーのカラムのサブセットを使用し、データを GCS に基づくテーブルに直接ストリーミングします：

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

ハードウェアによっては、この 100 万行のインサートは数分かかる場合があります。進行状況は、system.processes テーブルを通じて確認できます。行数を 1000 万まで調整して、サンプルクエリをいくつか試してみてください。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### レプリケーションの取り扱い {#handling-replication}

GCS ディスクを使用したレプリケーションは、`ReplicatedMergeTree` テーブルエンジンを使用して実行することができます。[GCS を使用した 2 つの GCP リージョン間での単一シャードの複製](#gcs-multi-region)ガイドを参照してください。

### 詳細を学ぶ {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) は、Amazon Simple Storage Service (Amazon S3) などのサービスで機能する一部のツールやライブラリと相互運用可能です。

スレッドの調整に関する詳細は、[パフォーマンスの最適化](../s3/index.md#s3-optimizing-performance)を参照してください。

## Google Cloud Storage (GCS) の使用 {#gcs-multi-region}

:::tip
ClickHouse Cloud ではデフォルトでオブジェクトストレージが使用されています。ClickHouse Cloud で実行している場合は、この手順に従う必要はありません。
:::

### デプロイの計画 {#plan-the-deployment}

このチュートリアルは、Google Cloud でレプリケーションされた ClickHouse デプロイメントを説明するために書かれており、Google Cloud Storage (GCS) を ClickHouse のストレージディスク "タイプ" として使用します。

このチュートリアルでは、Google Cloud Engine の VM に ClickHouse サーバーノードをデプロイし、それぞれにストレージ用の GCS バケットが関連付けられます。レプリケーションは、VM としてデプロイされた ClickHouse Keeper ノードのセットによって調整されます。

高可用性のためのサンプル要件：
- 2 つの ClickHouse サーバーノード、2 つの GCP リージョンで
- 2 つの GCS バケット、2 つの ClickHouse サーバーノードと同じリージョンに配置
- 3 つの ClickHouse Keeper ノード、そのうちの 2 つは ClickHouse サーバーノードと同じリージョンに配置します。3 番目のノードは、最初の 2 つの Keeper ノードのいずれかと同じリージョンに配置できますが、異なるアベイラビリティゾーンに配置する必要があります。

ClickHouse Keeper は 2 つのノードが必要なため、高可用性のために 3 つのノードが必要です。

### VM の準備 {#prepare-vms}

3 つのリージョンに 5 つの VM をデプロイします：

| リージョン | ClickHouse サーバー | バケット            | ClickHouse Keeper |
|------------|---------------------|---------------------|-------------------|
| 1          | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2          | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`      |                     |                     | `keepernode3`       |

`*` これは、1 または 2 と同じリージョンの異なるアベイラビリティゾーンにすることができます。

#### ClickHouse のデプロイ {#deploy-clickhouse}

サンプル構成では `chnode1` と `chnode2` という名前が付けられた 2 つのホストに ClickHouse をデプロイします。

`chnode1` を 1 つの GCP リージョンに、`chnode2` を別のリージョンに配置します。このガイドでは、計算エンジンの VM と GCS バケットに `us-east1` および `us-east4` を使用しています。

:::note
設定が完了するまで `clickhouse server` を起動しないでください。インストールだけを行ってください。
:::

ClickHouse サーバーノードでのデプロイ手順を実行する際は、[インストール手順](/getting-started/install.md/#available-installation-options)を参照してください。

#### ClickHouse Keeper のデプロイ {#deploy-clickhouse-keeper}

3 つのホストに クリックハウスキーパーをデプロイし、サンプル構成では `keepernode1`、`keepernode2`、`keepernode3` と名付けます。`keepernode1` は `chnode1` と同じリージョンにデプロイし、`keepernode2` を `chnode2` と一緒に配置し、`keepernode3` はどちらかのリージョンに配置できますが、そのリージョンの ClickHouse ノードとは異なるアベイラビリティゾーンに配置する必要があります。

ClickHouse Keeper ノードのデプロイ手順を実行する際は、[インストール手順](/getting-started/install.md/#install-standalone-clickhouse-keeper)を参照してください。

### 2 つのバケットを作成 {#create-two-buckets}

2 つの ClickHouse サーバーは、異なるリージョンに配置されて高可用性を実現します。各サーバーには同じリージョンに GCS バケットがあります。

**Cloud Storage > Buckets** で **CREATE BUCKET** を選択します。このチュートリアルでは、`us-east1` と `us-east4` のそれぞれに 2 つのバケットが作成されます。バケットは単一リージョン、標準ストレージクラスで、非公開として作成します。プロンプトが表示されたら、パブリックアクセス防止を有効にします。フォルダを作成しないでください。ClickHouse がストレージに書き込むときに作成されます。

バケットを作成し、HMAC キーを生成するための手順を詳しく知りたい場合は、**Create GCS buckets and an HMAC key** を展開して手順に従ってください：

<BucketDetails />

### ClickHouse Keeper の設定 {#configure-clickhouse-keeper}

すべての ClickHouse Keeper ノードは、`server_id` 行（以下の最初にハイライトされた行）を除いて同じ設定ファイルを持っています。ファイルを ClickHouse Keeper サーバーのホスト名で修正し、各サーバーで `server_id` を `raft_configuration` の適切な `server` エントリと一致させるように設定します。この例では `server_id` が `3` に設定されているため、`raft_configuration` 内の一致する行もハイライトしています。

- ホスト名でファイルを編集し、ClickHouse サーバーノードと Keeper ノードから解決できることを確認してください。
- 各 Keeper サーバーの上にファイルをコピーします（ `/etc/clickhouse-keeper/keeper_config.xml`）。
- `raft_configuration` のエントリ番号に基づいて、各マシンの `server_id` を編集します。

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

### ClickHouse サーバーの設定 {#configure-clickhouse-server}

:::note best practice
このガイドの一部の手順では、`/etc/clickhouse-server/config.d/` に設定ファイルを置くことを促されています。これは、Linux システムでの設定オーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに配置すると、ClickHouse はデフォルトの設定と内容をマージします。これにより、アップグレード中に設定が失われることを避けることができます。
:::

#### ネットワーキング {#networking}
デフォルトでは、ClickHouse はループバックインターフェースでリッスンしますが、レプリケートされたセットアップではマシン間のネットワーキングが必要です。すべてのインターフェースでリッスンします：

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### リモート ClickHouse Keeper サーバー {#remote-clickhouse-keeper-servers}

レプリケーションは ClickHouse Keeper によって調整されます。この設定ファイルは、ホスト名とポート番号で ClickHouse Keeper ノードを識別します。

- ホスト名を Keeper ホストに一致させて編集します。

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

このファイルは、クラスター内の各 ClickHouse サーバーのホスト名とポートを設定します。デフォルトの設定ファイルにはサンプルのクラスター定義が含まれていますが、完全に構成されたクラスターのみを表示するために、`remote_servers` エントリに `replace="true"` タグが追加されており、この設定がデフォルトとマージされたときに `remote_servers` セクションを追加するのではなく、置き換えます。

- ファイルをホスト名で編集し、ClickHouse サーバーノードから解決できることを確認してください。

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

このファイルは、ClickHouse Keeper パスに関連する設定を構成します。具体的には、データがどのレプリカに属しているかを識別するために使用されるマクロです。1 台のサーバーではレプリカが `replica_1` と指定され、もう 1 台のサーバーでは `replica_2` と指定されるべきです。名前は変更可能で、例えば一方のレプリカがサウスカロライナに保存され、もう一方がノースバージニアに保存されると仮定すると、値は `carolina` と `virginia` にすることができます。ただし、各マシンで異なることを確認してください。

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

ClickHouse のストレージ構成には `disks` と `policies` が含まれます。以下で構成されているディスクは `gcs` という名前で、`type` は `s3` です。このタイプは、ClickHouse が GCS バケットにアクセスする際に AWS S3 バケットのように扱うためです。この構成は、各 ClickHouse サーバーノード用に 2 回必要になります。

以下の構成の中でこれらの置換を行う必要があります。

これらの置換は 2 つの ClickHouse サーバーノード間で異なります：
- `REPLICA 1 BUCKET` は、サーバーと同じリージョンにあるバケットの名前に設定する必要があります。
- `REPLICA 1 FOLDER` は、1 台のサーバーでは `replica_1` に、もう 1 台では `replica_2` に変更する必要があります。

これらの置換はどちらのノードでも共通です：
- `access_key_id` は、前述の HMAC キーに設定します。
- `secret_access_key` は、前述の HMAC シークレットに設定します。

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

### ClickHouse Keeper の開始 {#start-clickhouse-keeper}

お使いのオペレーティングシステムに応じたコマンドを使用します。例えば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### ClickHouse Keeper のステータスを確認 {#check-clickhouse-keeper-status}

`netcat` を使用して ClickHouse Keeper にコマンドを送信します。例えば、`mntr` は ClickHouse Keeper クラスターの状態を返します。このコマンドを各 Keeper ノードで実行すると、1 つがリーダーで、他の 2 つがフォロワーであることが確認できます。

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

`chnode1` と `chnode2` で以下を実行します：
```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### 検証 {#verification}

#### ディスク構成の確認 {#verify-disk-configuration}

`system.disks` には、各ディスクに関するレコードが含まれているはずです：
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
#### クラスターで作成されたテーブルが両方のノードに作成されていることを確認 {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
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

#### テーブルに使用されているストレージポリシー `gcs_main` を確認 {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
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

バケットを見てみると、ストレージ設定ファイルで使用された名前のフォルダが各バケットに作成されているのがわかります。フォルダを展開すると、多くのファイルがデータパーティションを表しているのがわかります。
#### レプリカ1 用のバケット {#bucket-for-replica-one}

<img src={GCS_examine_bucket_1} alt="Google Cloud Storage におけるレプリカ 1 のバケット" />

#### レプリカ2 用のバケット {#bucket-for-replica-two}

<img src={GCS_examine_bucket_2} alt="Google Cloud Storage におけるレプリカ 2 のバケット" />
