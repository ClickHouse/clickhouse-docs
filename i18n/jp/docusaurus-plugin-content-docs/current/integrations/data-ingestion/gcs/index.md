---
sidebar_label: 'Google Cloud Storage (GCS)'
sidebar_position: 4
slug: /integrations/gcs
description: 'Google Cloud Storage (GCS) ベースの MergeTree'
title: 'ClickHouse と Google Cloud Storage を統合する'
doc_type: 'guide'
keywords: ['Google Cloud Storage ClickHouse', 'GCS ClickHouse integration', 'GCS backed MergeTree', 'ClickHouse GCS storage', 'Google Cloud ClickHouse']
---

import BucketDetails from '@site/docs/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# ClickHouse と Google Cloud Storage の統合

:::note
[Google Cloud](https://cloud.google.com) 上の ClickHouse Cloud を利用している場合、サービスではすでに [Google Cloud Storage](https://cloud.google.com/storage) が使用されているため、このページの内容は対象外です。GCS からデータを `SELECT` または `INSERT` したい場合は、[`gcs` テーブル関数](/sql-reference/table-functions/gcs) を参照してください。
:::

ClickHouse では、ストレージとコンピュートを分離したいユーザーにとって、GCS が魅力的なストレージソリューションであると考えています。これを実現するために、MergeTree エンジンのストレージとして GCS を利用できるようサポートしています。これにより、ユーザーは GCS のスケーラビリティとコスト面での利点に加え、MergeTree エンジンの挿入およびクエリ性能を活用できます。



## GCSバックエンドのMergeTree {#gcs-backed-mergetree}

### ディスクの作成 {#creating-a-disk}

GCSバケットをディスクとして利用するには、まず`conf.d`配下のファイル内のClickHouse設定で宣言する必要があります。以下にGCSディスク宣言の例を示します。この設定には、GCS「ディスク」、キャッシュ、およびGCSディスク上にテーブルを作成する際にDDLクエリで指定するポリシーを構成するための複数のセクションが含まれています。これらについては以下で説明します。

#### ストレージ設定 > disks > gcs {#storage_configuration--disks--gcs}

設定のこの部分はハイライトされたセクションに示されており、以下を指定しています:

- バッチ削除は実行されません。GCSは現在バッチ削除をサポートしていないため、エラーメッセージを抑制するために自動検出が無効化されています。
- S3 APIを使用しているため、ディスクのタイプは`s3`です。
- GCSによって提供されるエンドポイント
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

#### ストレージ設定 > disks > cache {#storage_configuration--disks--cache}

以下にハイライトされた設定例では、ディスク`gcs`に対して10Giのメモリキャッシュを有効化しています。

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

#### ストレージ設定 > policies > gcs_main {#storage_configuration--policies--gcs_main}

ストレージ設定ポリシーでは、データの保存場所を選択できます。以下にハイライトされたポリシーは、ポリシー`gcs_main`を指定することで、ディスク`gcs`にデータを保存できるようにします。例:`CREATE TABLE ... SETTINGS storage_policy='gcs_main'`

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

書き込みアクセス権を持つバケットを使用するようにディスクを設定済みであれば、以下の例のようなテーブルを作成できます。簡潔にするため、NYCタクシーデータの列のサブセットを使用し、GCSを基盤とするテーブルに直接データをストリーミングします：

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

ハードウェアによっては、この100万行の挿入には数分かかる場合があります。進行状況はsystem.processesテーブルで確認できます。行数を最大1000万まで調整して、サンプルクエリを試してみてください。

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### レプリケーションの処理 {#handling-replication}

GCSディスクでのレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用することで実現できます。詳細については、[GCSを使用して2つのGCPリージョン間で単一シャードをレプリケートする](#gcs-multi-region)ガイドを参照してください。

### 詳細情報 {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview)は、Amazon Simple Storage Service（Amazon S3）などのサービスと連携するツールやライブラリと相互運用可能です。

スレッドのチューニングに関する詳細情報については、[パフォーマンスの最適化](../s3/index.md#s3-optimizing-performance)を参照してください。


## Google Cloud Storage (GCS) の使用 {#gcs-multi-region}

:::tip
ClickHouse Cloudではオブジェクトストレージがデフォルトで使用されるため、ClickHouse Cloudで実行している場合、この手順に従う必要はありません。
:::

### デプロイメントの計画 {#plan-the-deployment}

このチュートリアルでは、Google Cloud上で実行され、Google Cloud Storage (GCS) をClickHouseストレージディスクの「タイプ」として使用する、レプリケーション構成のClickHouseデプロイメントについて説明します。

このチュートリアルでは、Google Compute EngineのVM上にClickHouseサーバーノードをデプロイし、それぞれにストレージ用のGCSバケットを関連付けます。レプリケーションは、同様にVMとしてデプロイされるClickHouse Keeperノードのセットによって調整されます。

高可用性のためのサンプル要件:

- 2つのGCPリージョンに配置された2つのClickHouseサーバーノード
- 2つのClickHouseサーバーノードと同じリージョンにデプロイされた2つのGCSバケット
- 3つのClickHouse Keeperノード。そのうち2つはClickHouseサーバーノードと同じリージョンにデプロイされます。3つ目は最初の2つのKeeperノードのいずれかと同じリージョンに配置できますが、異なるアベイラビリティゾーンに配置する必要があります。

ClickHouse Keeperは機能するために2つのノードが必要であるため、高可用性を実現するには3つのノードが必要です。

### 仮想マシンの準備 {#prepare-vms}

3つのリージョンに5つのVMをデプロイします:

| リージョン | ClickHouse Server | Bucket              | ClickHouse Keeper |
| ------ | ----------------- | ------------------- | ----------------- |
| 1      | `chnode1`         | `bucket_regionname` | `keepernode1`     |
| 2      | `chnode2`         | `bucket_regionname` | `keepernode2`     |
| 3 `*`  |                   |                     | `keepernode3`     |

`*` これは1または2と同じリージョン内の異なるアベイラビリティゾーンに配置できます。

#### ClickHouseのデプロイ {#deploy-clickhouse}

2つのホストにClickHouseをデプロイします。サンプル構成では、これらは`chnode1`、`chnode2`という名前です。

`chnode1`を1つのGCPリージョンに、`chnode2`を別のリージョンに配置します。このガイドでは、Compute EngineのVMとGCSバケットに`us-east1`と`us-east4`を使用します。

:::note
設定が完了するまで`clickhouse server`を起動しないでください。インストールのみを行ってください。
:::

ClickHouseサーバーノードでデプロイメント手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。

#### ClickHouse Keeperのデプロイ {#deploy-clickhouse-keeper}

3つのホストにClickHouse Keeperをデプロイします。サンプル構成では、これらは`keepernode1`、`keepernode2`、`keepernode3`という名前です。`keepernode1`は`chnode1`と同じリージョンに、`keepernode2`は`chnode2`と同じリージョンに、`keepernode3`はいずれかのリージョンにデプロイできますが、そのリージョン内のClickHouseノードとは異なるアベイラビリティゾーンに配置する必要があります。

ClickHouse Keeperノードでデプロイメント手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。

### 2つのバケットの作成 {#create-two-buckets}

2つのClickHouseサーバーは高可用性のために異なるリージョンに配置されます。それぞれ同じリージョンにGCSバケットを持ちます。

**Cloud Storage > Buckets**で**CREATE BUCKET**を選択します。このチュートリアルでは、`us-east1`と`us-east4`にそれぞれ1つずつ、合計2つのバケットを作成します。バケットは単一リージョン、標準ストレージクラスで、非公開とします。プロンプトが表示されたら、パブリックアクセス防止を有効にします。フォルダは作成しないでください。ClickHouseがストレージに書き込む際に自動的に作成されます。

バケットとHMACキーを作成するための詳細な手順が必要な場合は、**GCSバケットとHMACキーの作成**を展開して手順に従ってください:

<BucketDetails />

### ClickHouse Keeperの設定 {#configure-clickhouse-keeper}

すべてのClickHouse Keeperノードは、`server_id`行(以下の最初の強調表示行)を除いて同じ設定ファイルを使用します。ClickHouse Keeperサーバーのホスト名でファイルを変更し、各サーバーで`server_id`を`raft_configuration`内の適切な`server`エントリと一致するように設定します。この例では`server_id`が`3`に設定されているため、`raft_configuration`内の対応する行を強調表示しています。

- ホスト名でファイルを編集し、ClickHouseサーバーノードとKeeperノードから名前解決できることを確認します
- ファイルを適切な場所(各Keeperサーバーの`/etc/clickhouse-keeper/keeper_config.xml`)にコピーします
- `raft_configuration`内のエントリ番号に基づいて、各マシンで`server_id`を編集します


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

:::note ベストプラクティス
このガイドの一部の手順では、設定ファイルを `/etc/clickhouse-server/config.d/` に配置するよう求められます。これは Linux システムにおける設定オーバーライドファイルのデフォルトの場所です。このディレクトリにファイルを配置すると、ClickHouse はその内容をデフォルト設定とマージします。`config.d` ディレクトリにこれらのファイルを配置することで、アップグレード時に設定が失われることを防ぐことができます。
:::

#### ネットワーク設定 {#networking}

デフォルトでは、ClickHouse はループバックインターフェースでリッスンしますが、レプリケーション構成では、マシン間のネットワーク通信が必要です。すべてのインターフェースでリッスンするには以下のように設定します:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### リモート ClickHouse Keeper サーバー {#remote-clickhouse-keeper-servers}

レプリケーションは ClickHouse Keeper によって調整されます。この設定ファイルでは、ホスト名とポート番号によって ClickHouse Keeper ノードを識別します。

- ホスト名を使用している Keeper ホストに合わせて編集してください

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

このファイルは、クラスター内の各 ClickHouse サーバーのホスト名とポートを設定します。デフォルトの設定ファイルにはサンプルのクラスター定義が含まれていますが、完全に設定されたクラスターのみを表示するために、`remote_servers` エントリに `replace="true"` タグが追加されています。これにより、この設定がデフォルトとマージされる際に、`remote_servers` セクションに追加されるのではなく置き換えられます。

- ファイル内のホスト名を編集し、ClickHouse サーバーノードから名前解決できることを確認してください


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

このファイルは、ClickHouse Keeperパスに関連する設定を構成します。具体的には、データがどのレプリカに属するかを識別するために使用されるマクロです。一方のサーバーではレプリカを`replica_1`として指定し、もう一方のサーバーでは`replica_2`として指定する必要があります。名前は変更可能で、例えば一方のレプリカがサウスカロライナに、もう一方がノースバージニアに保存されている場合、値を`carolina`と`virginia`にすることもできます。ただし、各マシンで異なる名前にする必要があります。

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

ClickHouseのストレージ設定には`disks`と`policies`が含まれます。以下で設定されるディスクは`gcs`という名前で、`type`は`s3`です。ClickHouseはGCSバケットをAWS S3バケットであるかのようにアクセスするため、タイプはs3となります。この設定のコピーが2つ必要で、各ClickHouseサーバーノードに1つずつ配置します。

以下の設定で次の置換を行う必要があります。

以下の置換は2つのClickHouseサーバーノード間で異なります:

- `REPLICA 1 BUCKET`はサーバーと同じリージョンにあるバケットの名前に設定する必要があります
- `REPLICA 1 FOLDER`は一方のサーバーでは`replica_1`に、もう一方では`replica_2`に変更する必要があります

以下の置換は2つのノードで共通です:

- `access_key_id`は先ほど生成したHMAC Keyに設定する必要があります
- `secret_access_key`は先ほど生成したHMAC Secretに設定する必要があります

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

お使いのオペレーティングシステムに応じたコマンドを使用してください。例:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### ClickHouse Keeperのステータス確認 {#check-clickhouse-keeper-status}

`netcat`を使用してClickHouse Keeperにコマンドを送信します。例えば、`mntr`はClickHouse Keeperクラスタの状態を返します。各Keeperノードでこのコマンドを実行すると、1つがリーダーで、他の2つがフォロワーであることがわかります:


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

`chnode1`と`chnode`で以下を実行します:

```bash
sudo service clickhouse-server start
```

```bash
sudo service clickhouse-server status
```

### 検証 {#verification}

#### ディスク構成の検証 {#verify-disk-configuration}

`system.disks`には各ディスクのレコードが含まれている必要があります:

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


3 rows in set. Elapsed: 0.002 sec.

````
#### クラスター上に作成されたテーブルが両方のノードに作成されていることを確認する {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
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
````

```response
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.us-east4-c.c.gcsqa-375100.internal │ 9000 │      0 │       │                   1 │                1 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.us-east1-b.c.gcsqa-375100.internal │ 9000 │      0 │       │                   0 │                0 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 0.641 sec.
```

#### データが挿入できることを確認する {#verify-that-data-can-be-inserted}

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

#### テーブルにストレージポリシー `gcs_main` が使用されていることを確認する {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}

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

#### Google Cloudコンソールで確認する {#verify-in-google-cloud-console}

バケットを確認すると、`storage.xml` 設定ファイルで使用された名前のフォルダが各バケットに作成されていることがわかります。フォルダを展開すると、データパーティションを表す多数のファイルが表示されます。

#### レプリカ1のバケット {#bucket-for-replica-one}

<Image
  img={GCS_examine_bucket_1}
  size='lg'
  border
  alt='Google Cloud Storageのレプリカ1バケット。データパーティションを含むフォルダ構造を表示'
/>

#### レプリカ2のバケット {#bucket-for-replica-two}

<Image
  img={GCS_examine_bucket_2}
  size='lg'
  border
  alt='Google Cloud Storageのレプリカ2バケット。データパーティションを含むフォルダ構造を表示'
/>
