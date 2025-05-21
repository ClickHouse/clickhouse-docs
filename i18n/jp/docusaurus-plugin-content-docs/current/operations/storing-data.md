---
description: 'ドキュメンテーション for highlight-next-line'
sidebar_label: 'データ保存のための外部ディスク'
sidebar_position: 68
slug: /operations/storing-data
title: 'データ保存のための外部ディスク'
---

ClickHouseで処理されたデータは通常、ローカルファイルシステムに保存されます。つまり、ClickHouseサーバーと同じマシン上に保存されることを意味します。それには、大容量のディスクが必要であり、コストが高くつく可能性があります。それを回避するために、データをリモートに保存することができます。さまざまなストレージがサポートされています：
1. [Amazon S3](https://aws.amazon.com/s3/) オブジェクトストレージ。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. サポートされていない: Hadoop Distributed File System ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

:::note ClickHouseはまた、外部ストレージオプションとは異なる外部テーブルエンジンをサポートしており、いくつかの一般的なファイル形式（Parquetなど）で保存されたデータを読み取ることができる一方で、このページではClickHouseの `MergeTree` ファミリーまたは `Log` ファミリーのテーブルに対するストレージ構成について説明しています。
1. `Amazon S3` ディスクに保存されたデータを操作するには、[S3](/engines/table-engines/integrations/s3.md) テーブルエンジンを使用します。
2. Azure Blob Storageに保存されたデータを操作するには、[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) テーブルエンジンを使用します。
3. サポートされていない: Hadoop Distributed File System内のデータを操作するには、[HDFS](/engines/table-engines/integrations/hdfs.md) テーブルエンジンを使用します。
:::
## 外部ストレージの構成 {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) および [Log](/engines/table-engines/log-family/log.md) ファミリーのテーブルエンジンは、`S3`、`AzureBlobStorage`、`HDFS`（サポートされていません）をそれぞれ `s3`、`azure_blob_storage`、`hdfs`（サポートされていません）というタイプのディスクを使用して保存できます。

ディスクの構成には以下が必要です：
1. `type` セクションで、`s3`、`azure_blob_storage`、`hdfs`（サポートされていません）、`local_blob_storage`、`web` のいずれかに設定します。
2. 特定の外部ストレージタイプの構成。

24.1のClickHouseバージョン以降、新しい構成オプションを使用することが可能になりました。
次のことを指定する必要があります：
1. `type` は `object_storage` と等しく。
2. `object_storage_type` は `s3`、`azure_blob_storage`（または `24.3` 以降の単に `azure`）、`hdfs`（サポートされていません）、`local_blob_storage`（または `24.3` 以降の単に `local`）、`web` のいずれかと等しくなります。
オプションとして、`metadata_type` を指定可能（デフォルトでは `local`）ですが、`plain`、`web`、および `24.4` 以降からは `plain_rewritable` に設定することもできます。
`plain` メタデータタイプの使用は [plain storage section](/operations/storing-data#plain-storage) で説明されており、`web` メタデータタイプは `web` オブジェクトストレージタイプでのみ使用でき、`local` メタデータタイプはローカルにメタデータファイルを保存します（各メタデータファイルはオブジェクトストレージ内のファイルへのマッピングとそれらに関する追加のメタ情報を含みます）。

例えば、構成オプションは
```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

は、`24.1` 以降の構成に等しいです：
```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

構成
```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

は次のように等しいです：
```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

完全なストレージ構成の例は次のようになります：
```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
                <use_environment_credentials>1</use_environment_credentials>
            </s3>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>
</clickhouse>
```

24.1のClickHouseバージョン以降、次のようにもできます：
```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>object_storage</type>
                <object_storage_type>s3</object_storage_type>
                <metadata_type>local</metadata_type>
                <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
                <use_environment_credentials>1</use_environment_credentials>
            </s3>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>
</clickhouse>
```

特定のタイプのストレージをすべての `MergeTree` テーブルのデフォルトオプションにするには、構成ファイルに次のセクションを追加します：
```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

特定のストレージポリシーを特定のテーブルのみに構成したい場合、テーブル作成時に設定に定義できます：

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

`storage_policy` の代わりに `disk` を使用することもできます。この場合、構成ファイルに `storage_policy` セクションを持つ必要はなく、`disk` セクションだけで十分です。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```
## 動的構成 {#dynamic-configuration}

構成ファイルであらかじめ定義されたディスクなしでストレージ構成を指定することも可能ですが、`CREATE` / `ATTACH` クエリの設定で構成できます。

以下のクエリの例は、上記の動的ディスク構成に基づき、URLに保存されたテーブルからデータをキャッシュするためにローカルディスクを使用する方法を示します。

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=web,
    endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
  );
  -- highlight-end
```

次の例は、外部ストレージにキャッシュを追加します。

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
  -- highlight-end
```

以下の設定では、`type=web` のディスクが `type=cache` のディスク内にネストされていることに注意してください。

:::note
この例は `type=web` を使用していますが、任意のディスクタイプを動的に構成することができます。ローカルディスクも同様です。ローカルディスクはサーバー構成パラメータ `custom_local_disks_base_directory` にパス引数が必要で、デフォルトが存在しないため、それも設定する必要があります。
:::

構成ベースの構成とSQL定義の構成の組み合わせも可能です：

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
  -- highlight-end
```

ここで、`web` はサーバー構成ファイルからのものです：

```xml
<storage_configuration>
    <disks>
        <web>
            <type>web</type>
            <endpoint>'https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'</endpoint>
        </web>
    </disks>
</storage_configuration>
```
### S3ストレージの利用 {#s3-storage}

必要なパラメータ：

- `endpoint` — S3エンドポイントURL、`path` または `virtual hosted` [スタイル](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)。エンドポイントURLには、バケットとデータを保存するルートパスを含める必要があります。
- `access_key_id` — S3アクセスキーID。
- `secret_access_key` — S3秘密アクセスキー。

オプションのパラメータ：

- `region` — S3リージョン名。
- `support_batch_delete` — バッチ削除がサポートされているかどうかを確認します。Google Cloud Storage (GCS) を使用する場合、この値は `false` に設定してください。GCSはバッチ削除をサポートしておらず、チェックを無効にすることでログにエラーメッセージが表示されるのを防ぎます。
- `use_environment_credentials` — 環境変数 AWS_ACCESS_KEY_ID および AWS_SECRET_ACCESS_KEY および AWS_SESSION_TOKEN が存在する場合、それらからAWS資格情報を読み取ります。デフォルト値は `false` です。
- `use_insecure_imds_request` — `true` に設定すると、S3クライアントはAmazon EC2メタデータから資格情報を取得する際に安全でないIMDSリクエストを使用します。デフォルト値は `false` です。
- `expiration_window_seconds` — 有効期限に基づく資格情報が期限切れかどうかを確認するための猶予期間です。オプションで、デフォルト値は `120` です。
- `proxy` — S3エンドポイントのプロキシ構成。`proxy` ブロック内の各 `uri` 要素にはプロキシURLを含める必要があります。
- `connect_timeout_ms` — ミリ秒単位のソケット接続タイムアウト。デフォルト値は `10秒` です。
- `request_timeout_ms` — ミリ秒単位のリクエストタイムアウト。デフォルト値は `5秒` です。
- `retry_attempts` — リクエストが失敗した場合の再試行回数。デフォルト値は `10` です。
- `single_read_retries` — 読み取り中の接続切断時の再試行回数。デフォルト値は `4` です。
- `min_bytes_for_seek` — シーケンシャル読み取りの代わりにシーク操作を使用するための最小バイト数。デフォルト値は `1 Mb` です。
- `metadata_path` — S3のメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は `/var/lib/clickhouse/disks/<disk_name>/` です。
- `skip_access_check` — `true` に設定すると、ディスク起動時にディスクアクセスチェックが実行されません。デフォルト値は `false` です。
- `header` — 指定されたHTTPヘッダーを、指定されたエンドポイントへのリクエストに追加します。オプションで、複数回指定できます。
- `server_side_encryption_customer_key_base64` — 指定した場合、SSE-C暗号化を持つS3オブジェクトにアクセスするために必要なヘッダーが設定されます。
- `server_side_encryption_kms_key_id` - 指定した場合、[SSE-KMS暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)を持つS3オブジェクトにアクセスするために必要なヘッダーが設定されます。空の文字列が指定された場合は、AWS管理のS3キーが使用されます。オプションです。
- `server_side_encryption_kms_encryption_context` - `server_side_encryption_kms_key_id` との併用が指定された場合、SSE-KMS用の指定された暗号化コンテキストヘッダーが設定されます。オプションです。
- `server_side_encryption_kms_bucket_key_enabled` - `server_side_encryption_kms_key_id` との併用が指定された場合、SSE-KMSのためのS3バケットキーを有効にするヘッダーが設定されます。オプションで、`true` または `false` に設定でき、デフォルトでは何も設定されません（バケットレベル設定と一致します）。
- `s3_max_put_rps` — スロットルをかける前の最大PUTリクエスト数の制限。デフォルト値は `0`（制限なし）です。
- `s3_max_put_burst` — リクエスト毎秒の制限に達する前に同時に発行できる最大リクエスト数。デフォルト値として (`0` 値) は `s3_max_put_rps` に等しくなります。
- `s3_max_get_rps` — スロットルをかける前の最大GETリクエスト数の制限。デフォルト値は `0`（制限なし）です。
- `s3_max_get_burst` — リクエスト毎秒の制限に達する前に同時に発行できる最大リクエスト数。デフォルト値として (`0` 値) は `s3_max_get_rps` に等しくなります。
- `read_resource` — このディスクへのリードリクエストの[スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空文字列（IOスケジューリングはこのディスクには有効化されていません）。
- `write_resource` — このディスクへの書き込みリクエストの[スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空文字列（IOスケジューリングはこのディスクには有効化されていません）。
- `key_template` — オブジェクトキーが生成される形式を定義します。デフォルトで、Clickhouseは `endpoint` オプションから `root path` を取得し、ランダムに生成されたサフィックスを追加します。そのサフィックスは、3つのランダムな記号を持つディレクトリと、29のランダムな記号を持つファイル名です。このオプションを使用すると、オブジェクトキーがどのように生成されるかを完全に制御できます。一部の使用シナリオでは、プレフィックスやオブジェクトキーの中にランダムな記号を持つ必要があります。例えば: `[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}`。値は [`re2`](https://github.com/google/re2/wiki/Syntax) で解析されます。構文の一部のみがサポートされています。このオプションを使用する前に、好ましい形式がサポートされているか確認してください。`key_template` の値によってキーを生成できない場合、ディスクは初期化されません。それには、機能フラグ [storage_metadata_write_full_object_key](/operations/storing-data#s3-storage) が有効である必要があります。このフラグは、`endpoint` オプションに `root path` を宣言することを禁止します。`key_compatibility_prefix` オプションの定義が必要です。
- `key_compatibility_prefix` — このオプションは `key_template` が使用される場合に必要です。メタデータファイルに保存されたオブジェクトキーが `VERSION_FULL_OBJECT_KEY` よりも低いメタデータバージョンである場合には、`endpoint` オプションの前の `root path` をこれに設定する必要があります。

:::note
Google Cloud Storage (GCS) も、`s3` タイプを使用してサポートされています。 [GCSバックエンドのMergeTree](/integrations/gcs) を参照してください。
:::
### プレーンストレージの利用 {#plain-storage}

`22.10` では、書き込み専用ストレージを提供する新しいディスクタイプ `s3_plain` が導入されました。構成パラメータは `s3` ディスクタイプと同じです。
`s3` ディスクタイプとは異なり、データをそのまま保存します。つまり、ランダム生成されたblob名の代わりに通常のファイル名を使用し（Clickhouseがローカルディスクにファイルを保存するのと同じ方法）ローカルにメタデータを保存しません。メタデータは `s3` 内のデータから導き出されます。

このディスクタイプはテーブルの静的バージョンを保持することを許可します。既存のデータに対してマージを実行できず、新しいデータを挿入することもできません。
このディスクタイプの使用ケースは、`BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` を介してバックアップを作成することです。その後、`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')` を行うことができます。あるいは `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'` を使用してもかまいません。

構成：
```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1` 以降、任意のオブジェクトストレージディスク（`s3`、`azure`、`hdfs`（サポートされていません）、`local`）を `plain` メタデータタイプを使用して構成することが可能です。

構成：
```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>azure</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```
### S3プレーン書き換え可能ストレージの利用 {#s3-plain-rewritable-storage}

`24.4` で新しいディスクタイプ `s3_plain_rewritable` が導入されました。
`s3_plain` ディスクタイプと似ており、メタデータファイル用の追加ストレージは必要ありません。代わりに、メタデータはS3に保存されます。
`s3_plain` ディスクタイプとは異なり、`s3_plain_rewritable` ではマージの実行が可能で、INSERT操作もサポートされています。
[マテリアル](/sql-reference/statements/alter#mutations) とテーブルのレプリケーションはサポートされていません。

このディスクタイプの使用ケースは、非レプリケートの `MergeTree` テーブルです。`s3` ディスクタイプは非レプリケートのMergeTreeテーブルに適していますが、テーブルのローカルメタデータが不要で、限られた操作を受け入れることができる場合には `s3_plain_rewritable` ディスクタイプを選ぶことができます。これは、システムテーブルにとって便利です。

構成：
```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

は次のように等しいです：
```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

`24.5` 以降、任意のオブジェクトストレージディスク（`s3`、`azure`、`local`）を `plain_rewritable` メタデータタイプを使用して構成することが可能です。
### Azure Blob Storageの利用 {#azure-blob-storage}

`MergeTree` ファミリーのテーブルエンジンは、`azure_blob_storage` タイプのディスクを使用して [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) にデータを保存することができます。

構成マークアップ：
```xml
<storage_configuration>
    ...
    <disks>
        <blob_storage_disk>
            <type>azure_blob_storage</type>
            <storage_account_url>http://account.blob.core.windows.net</storage_account_url>
            <container_name>container</container_name>
            <account_name>account</account_name>
            <account_key>pass123</account_key>
            <metadata_path>/var/lib/clickhouse/disks/blob_storage_disk/</metadata_path>
            <cache_path>/var/lib/clickhouse/disks/blob_storage_disk/cache/</cache_path>
            <skip_access_check>false</skip_access_check>
        </blob_storage_disk>
    </disks>
    ...
</storage_configuration>
```

接続パラメータ：
* `storage_account_url` - **必須**、Azure Blob StorageアカウントのURL、`http://account.blob.core.windows.net` または `http://azurite1:10000/devstoreaccount1` の形式。
* `container_name` - 目的のコンテナ名、デフォルトは `default-container` です。
* `container_already_exists` - `false` に設定すると、ストレージアカウント内に新しいコンテナ `container_name` が作成され、`true` に設定すると、ディスクはコンテナに直接接続され、設定されていない場合は、ディスクはアカウントに接続して `container_name` が存在するか確認し、存在しない場合は作成します。

認証パラメータ（ディスクはすべての利用可能な方法 **および** マネージドID資格情報を試みます）：
* `connection_string` - 接続文字列を使用した認証。
* `account_name` および `account_key` - 共有キーを使用した認証。

制限パラメータ（主に内部使用のため）：
* `s3_max_single_part_upload_size` - Blob Storageへの単一ブロックアップロードのサイズを制限します。
* `min_bytes_for_seek` - シーク可能な領域のサイズを制限します。
* `max_single_read_retries` - Blob Storageからデータチャンクを読み取る試行回数を制限します。
* `max_single_download_retries` - Blob Storageから読み取り可能なバッファをダウンロードする試行回数を制限します。
* `thread_pool_size` - `IDiskRemote` がインスタンス化されるスレッド数を制限します。
* `s3_max_inflight_parts_for_one_file` - 1つのオブジェクトに対して同時に実行できるPUTリクエストの数を制限します。

その他のパラメータ：
* `metadata_path` - Blob Storageのメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は `/var/lib/clickhouse/disks/<disk_name>/` です。
* `skip_access_check` - `true` に設定すると、ディスク起動時にディスクアクセスチェックが実行されません。デフォルト値は `false` です。
* `read_resource` — このディスクへのリードリクエストの[スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空文字列（IOスケジューリングはこのディスクには有効化されていません）。
* `write_resource` — このディスクへの書き込みリクエストの[スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空文字列（IOスケジューリングはこのディスクには有効化されていません）。
* `metadata_keep_free_space_bytes` - 予約するメタデータディスクの空き容量の量。

動作する構成の例は統合テストディレクトリに見つけることができます（例： [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) または [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)）。

:::note ゼロコピー複製は本番環境に適していません
ゼロコピー複製はClickHouseバージョン22.8以降でデフォルトで無効です。この機能は本番使用には推奨されません。
:::
## HDFSストレージの利用（サポートなし） {#using-hdfs-storage-unsupported}

このサンプル構成では：
- ディスクは `hdfs` タイプ（サポートされていません）
- データは `hdfs://hdfs1:9000/clickhouse/` にホストされています。

HDFSはサポートされていないため、使用時に問題が発生する可能性があります。問題が発生した場合、修正のためにプルリクエストを提出してください。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <hdfs>
                <type>hdfs</type>
                <endpoint>hdfs://hdfs1:9000/clickhouse/</endpoint>
                <skip_access_check>true</skip_access_check>
            </hdfs>
            <hdd>
                <type>local</type>
                <path>/</path>
            </hdd>
        </disks>
        <policies>
            <hdfs>
                <volumes>
                    <main>
                        <disk>hdfs</disk>
                    </main>
                    <external>
                        <disk>hdd</disk>
                    </external>
                </volumes>
            </hdfs>
        </policies>
    </storage_configuration>
</clickhouse>
```

HDFSは角ケースで機能しないことがありますのでご注意ください。
### データの暗号化の利用 {#encrypted-virtual-file-system}

[S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)または[HDFS](#using-hdfs-storage-unsupported)（サポートされていません）、あるいはローカルディスクに保存されるデータを暗号化することができます。暗号化モードをオンにするには、構成ファイルでタイプ `encrypted` のディスクを定義し、データが保存されるディスクを選択する必要があります。`encrypted` ディスクは、書き込まれたすべてのファイルをその場で暗号化し、暗号化されたディスクからファイルを読み取るときに、自動的に復号化します。したがって、`encrypted` ディスクを通常のディスクとして使用できます。

ディスク構成の例：

```xml
<disks>
  <disk1>
    <type>local</type>
    <path>/path1/</path>
  </disk1>
  <disk2>
    <type>encrypted</type>
    <disk>disk1</disk>
    <path>path2/</path>
    <key>_16_ascii_chars_</key>
  </disk2>
</disks>
```

例えば、ClickHouseがテーブルからファイル `store/all_1_1_0/data.bin` にデータを書き込む場合、そのファイルは物理的にディスク上の `/path1/store/all_1_1_0/data.bin` に書き込まれます。

同じファイルを `disk2` に書き込むと、実際には `/path1/path2/store/all_1_1_0/data.bin` のパスで暗号化モードで書き込まれます。

必要なパラメータ：

- `type` — `encrypted`。これがないと、暗号化ディスクは作成されません。
- `disk` — データ保存のためのディスクのタイプ。
- `key` — 暗号化および復号化のためのキー。タイプ: [Uint64](/sql-reference/data-types/int-uint.md)。キーを16進数形式でエンコードするために `key_hex` パラメータを使用できます。
    複数のキーを指定することができ、`id` 属性を使用できます（下記の例を参照）。

オプションのパラメータ：

- `path` — データが保存されるディスク上の場所へのパス。指定しない場合、データはルートディレクトリに保存されます。
- `current_key_id` — 暗号化に使用されるキー。指定されたすべてのキーは復号化にも使用でき、いつでも別のキーに切り替えて、以前に暗号化されたデータへのアクセスを維持できます。
- `algorithm` — [アルゴリズム](/sql-reference/statements/create/table#encryption-codecs)の暗号化。可能な値: `AES_128_CTR`、`AES_192_CTR` または `AES_256_CTR`。デフォルト値: `AES_128_CTR`。キーの長さはアルゴリズムに依存します: `AES_128_CTR` — 16バイト、`AES_192_CTR` — 24バイト、`AES_256_CTR` — 32バイト。

ディスク構成の例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <disk_s3>
                <type>s3</type>
                <endpoint>...
            </disk_s3>
            <disk_s3_encrypted>
                <type>encrypted</type>
                <disk>disk_s3</disk>
                <algorithm>AES_128_CTR</algorithm>
                <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
                <key_hex id="1">ffeeddccbbaa99887766554433221100</key_hex>
                <current_key_id>1</current_key_id>
            </disk_s3_encrypted>
        </disks>
    </storage_configuration>
</clickhouse>
```
### ローカルキャッシュの使用 {#using-local-cache}

バージョン22.3以降、ストレージ構成でディスクに対するローカルキャッシュを設定することが可能です。バージョン22.3から22.7では、キャッシュは`s3`ディスクタイプのみでサポートされています。バージョン22.8以降では、すべてのディスクタイプ(S3、Azure、ローカル、暗号化など)でキャッシュがサポートされます。バージョン23.5以降では、キャッシュはリモートディスクタイプ(S3、Azure、HDFS)のみにサポートされます(不サポートのため)。キャッシュは`LRU`キャッシュポリシーを使用します。

バージョン22.8以降の構成例:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3構成...
            </s3>
            <cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/s3_cache/</path>
                <max_size>10Gi</max_size>
            </cache>
        </disks>
        <policies>
            <s3_cache>
                <volumes>
                    <main>
                        <disk>cache</disk>
                    </main>
                </volumes>
            </s3_cache>
        </policies>
    </storage_configuration>
```

バージョン22.8より前の構成例:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3構成...
                <data_cache_enabled>1</data_cache_enabled>
                <data_cache_max_size>10737418240</data_cache_max_size>
            </s3>
        </disks>
        <policies>
            <s3_cache>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_cache>
        </policies>
    </storage_configuration>
```

ファイルキャッシュ **ディスク構成設定**:

これらの設定は、ディスク構成セクションで定義する必要があります。

- `path` - キャッシュのディレクトリへのパス。デフォルト: なし。この設定は必須です。

- `max_size` - キャッシュの最大サイズ(バイトまたは可読形式、例: `ki、Mi、Gi`など)。例: `10Gi` (この形式はバージョン`22.10`以降で動作します)。制限に達すると、キャッシュファイルはキャッシュ排除ポリシーに従って排除されます。デフォルト: なし。この設定は必須です。

- `cache_on_write_operations` - `write-through`キャッシュを有効にすることができます(書き込み操作のいずれかでデータをキャッシュする: `INSERT`クエリ、バックグラウンドマージ)。デフォルト: `false`。`write-through`キャッシュは、設定`enable_filesystem_cache_on_write_operations`を使用してクエリごとに無効にすることができます(両方のキャッシュ構成設定とそれに対応するクエリ設定が有効な場合のみデータがキャッシュされます)。

- `enable_filesystem_query_cache_limit` - 各クエリ内でダウンロードされるキャッシュのサイズを制限できます(`max_query_cache_size`のユーザー設定に依存します)。デフォルト: `false`。

- `enable_cache_hits_threshold` - キャッシュされる前に何回データを読み込む必要があるかを定義する数値。デフォルト: `false`。この閾値は`cache_hits_threshold`で定義できます。デフォルト: `0`(データは最初に読み込まれたときにキャッシュされます)。

- `enable_bypass_cache_with_threshold` - 要求された読み取り範囲が閾値を超えた場合にキャッシュを完全にスキップできます。デフォルト: `false`。この閾値は`bypass_cache_threshold`で定義できます。デフォルト: `268435456`(`256Mi`)。

- `max_file_segment_size` - 単一キャッシュファイルの最大サイズ(バイトまたは可読形式(`ki、Mi、Gi`など)、例: `10Gi`)。デフォルト: `8388608`(`8Mi`)。

- `max_elements` - キャッシュファイルの数の制限。デフォルト: `10000000`。

- `load_metadata_threads` - 開始時にキャッシュメタデータを読み込むために使用されるスレッドの数。デフォルト: `16`。

ファイルキャッシュ **クエリ/プロファイル設定**:

これらの設定の一部は、デフォルトで有効またはディスク構成設定で有効になっているキャッシュ機能をクエリ/プロファイルごとに無効にします。たとえば、ディスク構成でキャッシュを有効にし、クエリ/プロファイル設定`enable_filesystem_cache`を`false`に設定して無効にすることができます。また、ディスク構成で`cache_on_write_operations`を`true`に設定すると「write-through」キャッシュが有効になります。しかし、特定のクエリに対してこの一般設定を無効にしたい場合は、設定`enable_filesystem_cache_on_write_operations`を`false`に設定することで特定のクエリ/プロファイルの書き込み操作キャッシュが無効になります。

- `enable_filesystem_cache` - ストレージポリシーが`cache`ディスクタイプで構成されている場合でも、クエリごとにキャッシュを無効にできます。デフォルト: `true`。

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - 開始時にキャッシュがすでに存在する場合のみクエリでキャッシュを使用し、そうでない場合はクエリデータがローカルキャッシュストレージに書き込まれません。デフォルト: `false`。

- `enable_filesystem_cache_on_write_operations` - `write-through`キャッシュを有効にします。この設定は、キャッシュ構成で`cache_on_write_operations`設定がオンになっている場合のみ機能します。デフォルト: `false`。クラウドデフォルト値: `true`。

- `enable_filesystem_cache_log` - `system.filesystem_cache_log`テーブルへのロギングをオンにします。クエリごとのキャッシュ使用状況の詳細を表示します。特定のクエリまたはプロファイルで有効にすることができます。デフォルト: `false`。

- `max_query_cache_size` - ローカルキャッシュストレージに書き込まれるキャッシュサイズの制限。キャッシュ構成で`enable_filesystem_query_cache_limit`が有効にする必要があります。デフォルト: `false`。

- `skip_download_if_exceeds_query_cache` - 設定`max_query_cache_size`の動作を変更できます。デフォルト: `true`。この設定がオンの場合、クエリ中にキャッシュダウンロード上限に達すると、それ以上のキャッシュはキャッシュストレージにダウンロードされません。この設定がオフの場合、クエリ中にキャッシュダウンロード上限に達しても、以前にダウンロードされたデータを排除するコストでキャッシュが書き込まれます。この二次動作により、`最近使用`の動作が保存されたままクエリキャッシュの制限を維持できます。

**警告**
キャッシュ構成設定とキャッシュクエリ設定は最新のClickHouseバージョンに対応しており、以前のバージョンではサポートされていない場合があります。

キャッシュ **システムテーブル**:

- `system.filesystem_cache` - 現在のキャッシュの状態を示すシステムテーブル。

- `system.filesystem_cache_log` - 各クエリごとのキャッシュ使用状況を詳細に示すシステムテーブル。`enable_filesystem_cache_log`設定を`true`にする必要があります。

キャッシュ **コマンド**:

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER`は`<cache_name>`が提供されていない場合にのみサポートされます。

- `SHOW FILESYSTEM CACHES` -- サーバーで構成されたファイルシステムキャッシュのリストを表示します。(バージョン&lt;= `22.8`ではコマンド名が`SHOW CACHES`です。)

```sql
SHOW FILESYSTEM CACHES
```

結果:

```text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - 特定のキャッシュのキャッシュ構成および一般統計を表示します。キャッシュ名は`SHOW FILESYSTEM CACHES`コマンドから取得できます。(バージョン&lt;= `22.8`ではコマンド名が`DESCRIBE CACHE`です。)

```sql
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

キャッシュの現在のメトリック:

- `FilesystemCacheSize`

- `FilesystemCacheElements`

キャッシュの非同期メトリック:

- `FilesystemCacheBytes`

- `FilesystemCacheFiles`

キャッシュプロファイルイベント:

- `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes,`

- `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds`

- `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`

- `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`

### 静的Webストレージの使用 (読み取り専用) {#web-storage}

これは読み取り専用ディスクです。そのデータは読み取ることしかできず、決して修正されません。このディスクに新しいテーブルは`ATTACH TABLE`クエリを介してロードされます(以下の例参照)。ローカルディスクは実際には使用されず、各`SELECT`クエリは必要なデータを取得するために`http`リクエストを生成します。テーブルデータのすべての修正は例外を結果し、次のタイプのクエリは許可されません: [CREATE TABLE](/sql-reference/statements/create/table.md)、[ALTER TABLE](/sql-reference/statements/alter/index.md)、[RENAME TABLE](/sql-reference/statements/rename#rename-table)、[DETACH TABLE](/sql-reference/statements/detach.md)および[TRUNCATE TABLE](/sql-reference/statements/truncate.md)。Webストレージは読み取り専用目的に使用できます。例としては、サンプルデータのホスティングやデータの移行があります。`clickhouse-static-files-uploader`ツールがあり、これは特定のテーブルのデータディレクトリを準備します(`SELECT data_paths FROM system.tables WHERE name = 'table_name'`)。必要な各テーブルに対して、ファイルのディレクトリを取得できます。これらのファイルは、例えば静的ファイルのWebサーバーにアップロードできます。この準備の後、`DiskWeb`経由でこのテーブルを任意のClickHouseサーバーにロードできます。

このサンプル構成では:
- ディスクのタイプは`web`
- データは`http://nginx:80/test1/`でホストされています
- ローカルストレージにキャッシュが使用されています

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <web>
                <type>web</type>
                <endpoint>http://nginx:80/test1/</endpoint>
            </web>
            <cached_web>
                <type>cache</type>
                <disk>web</disk>
                <path>cached_web_cache/</path>
                <max_size>100000000</max_size>
            </cached_web>
        </disks>
        <policies>
            <web>
                <volumes>
                    <main>
                        <disk>web</disk>
                    </main>
                </volumes>
            </web>
            <cached_web>
                <volumes>
                    <main>
                        <disk>cached_web</disk>
                    </main>
                </volumes>
            </cached_web>
        </policies>
    </storage_configuration>
</clickhouse>
```

:::tip
Webデータセットが定期的に使用されない場合、クエリ内で一時的にストレージを設定することも可能です。詳細は[動的設定](#dynamic-configuration)を参照し、構成ファイルの編集をスキップしてください。
:::

:::tip
[デモデータセット](https://github.com/ClickHouse/web-tables-demo)がGitHubにホストされています。Webストレージ用に独自のテーブルを準備するには、ツール[clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)を参照してください。
:::

この`ATTACH TABLE`クエリでは、提供された`UUID`はデータのディレクトリ名と一致し、エンドポイントは生のGitHubコンテンツのURLです。

```sql
-- highlight-next-line
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      );
  -- highlight-end
```

準備されたテストケース。次の構成をconfigに追加する必要があります:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <web>
                <type>web</type>
                <endpoint>https://clickhouse-datasets.s3.yandex.net/disk-with-static-files-tests/test-hits/</endpoint>
            </web>
        </disks>
        <policies>
            <web>
                <volumes>
                    <main>
                        <disk>web</disk>
                    </main>
                </volumes>
            </web>
        </policies>
    </storage_configuration>
</clickhouse>
```

次に、このクエリを実行します:

```sql
ATTACH TABLE test_hits UUID '1ae36516-d62d-4218-9ae3-6516d62da218'
(
    WatchID UInt64,
    JavaEnable UInt8,
    Title String,
    GoodEvent Int16,
    EventTime DateTime,
    EventDate Date,
    CounterID UInt32,
    ClientIP UInt32,
    ClientIP6 FixedString(16),
    RegionID UInt32,
    UserID UInt64,
    CounterClass Int8,
    OS UInt8,
    UserAgent UInt8,
    URL String,
    Referer String,
    URLDomain String,
    RefererDomain String,
    Refresh UInt8,
    IsRobot UInt8,
    RefererCategories Array(UInt16),
    URLCategories Array(UInt16),
    URLRegions Array(UInt32),
    RefererRegions Array(UInt32),
    ResolutionWidth UInt16,
    ResolutionHeight UInt16,
    ResolutionDepth UInt8,
    FlashMajor UInt8,
    FlashMinor UInt8,
    FlashMinor2 String,
    NetMajor UInt8,
    NetMinor UInt8,
    UserAgentMajor UInt16,
    UserAgentMinor FixedString(2),
    CookieEnable UInt8,
    JavascriptEnable UInt8,
    IsMobile UInt8,
    MobilePhone UInt8,
    MobilePhoneModel String,
    Params String,
    IPNetworkID UInt32,
    TraficSourceID Int8,
    SearchEngineID UInt16,
    SearchPhrase String,
    AdvEngineID UInt8,
    IsArtifical UInt8,
    WindowClientWidth UInt16,
    WindowClientHeight UInt16,
    ClientTimeZone Int16,
    ClientEventTime DateTime,
    SilverlightVersion1 UInt8,
    SilverlightVersion2 UInt8,
    SilverlightVersion3 UInt32,
    SilverlightVersion4 UInt16,
    PageCharset String,
    CodeVersion UInt32,
    IsLink UInt8,
    IsDownload UInt8,
    IsNotBounce UInt8,
    FUniqID UInt64,
    HID UInt32,
    IsOldCounter UInt8,
    IsEvent UInt8,
    IsParameter UInt8,
    DontCountHits UInt8,
    WithHash UInt8,
    HitColor FixedString(1),
    UTCEventTime DateTime,
    Age UInt8,
    Sex UInt8,
    Income UInt8,
    Interests UInt16,
    Robotness UInt8,
    GeneralInterests Array(UInt16),
    RemoteIP UInt32,
    RemoteIP6 FixedString(16),
    WindowName Int32,
    OpenerName Int32,
    HistoryLength Int16,
    BrowserLanguage FixedString(2),
    BrowserCountry FixedString(2),
    SocialNetwork String,
    SocialAction String,
    HTTPError UInt16,
    SendTiming Int32,
    DNSTiming Int32,
    ConnectTiming Int32,
    ResponseStartTiming Int32,
    ResponseEndTiming Int32,
    FetchTiming Int32,
    RedirectTiming Int32,
    DOMInteractiveTiming Int32,
    DOMContentLoadedTiming Int32,
    DOMCompleteTiming Int32,
    LoadEventStartTiming Int32,
    LoadEventEndTiming Int32,
    NSToDOMContentLoadedTiming Int32,
    FirstPaintTiming Int32,
    RedirectCount Int8,
    SocialSourceNetworkID UInt8,
    SocialSourcePage String,
    ParamPrice Int64,
    ParamOrderID String,
    ParamCurrency FixedString(3),
    ParamCurrencyID UInt16,
    GoalsReached Array(UInt32),
    OpenstatServiceName String,
    OpenstatCampaignID String,
    OpenstatAdID String,
    OpenstatSourceID String,
    UTMSource String,
    UTMMedium String,
    UTMCampaign String,
    UTMContent String,
    UTMTerm String,
    FromTag String,
    HasGCLID UInt8,
    RefererHash UInt64,
    URLHash UInt64,
    CLID UInt32,
    YCLID UInt64,
    ShareService String,
    ShareURL String,
    ShareTitle String,
    ParsedParams Nested(
        Key1 String,
        Key2 String,
        Key3 String,
        Key4 String,
        Key5 String,
        ValueDouble Float64),
    IslandID FixedString(16),
    RequestNum UInt32,
    RequestTry UInt8
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID)
SETTINGS storage_policy='web';
```

必要なパラメータ:

- `type` — `web`。そうでないと、ディスクは作成されません。
- `endpoint` — データを保存するためのルートパスを含むURL形式のエンドポイント。エンドポイントURLは、データがアップロードされた場所を指す必要があります。

オプションのパラメータ:

- `min_bytes_for_seek` — シーキング操作を使用するのに必要な最小バイト数。デフォルト値: `1` Mb。
- `remote_fs_read_backoff_threshold` — リモートディスクのデータを読み取ろうとする際の最大待機時間。デフォルト値: `10000`秒。
- `remote_fs_read_backoff_max_tries` — バックオフで読み取る最大回数。デフォルト値: `5`。

クエリが例外`DB:Exception Unreachable URL`で失敗した場合、設定を調整することを試みてください: [http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

アップロードのためのファイルを取得するには次を実行します:
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path`はクエリ`SELECT data_paths FROM system.tables WHERE name = 'table_name'`で見つけることができます）。

エンドポイントからファイルを読み込む際は、`<endpoint>/store/`パスに読み込む必要がありますが、構成には`endpoint`のみを含めます。

サーバーがテーブルを起動中にディスク読み込み時にURLにアクセスできない場合、すべてのエラーがキャッチされます。この場合、エラーがあった場合、テーブルを再ロード(可視化する)には`DETACH TABLE table_name` -> `ATTACH TABLE table_name`を使用できます。サーバー起動時にメタデータが正常にロードされた場合、テーブルは直ちに利用可能になります。

単一のHTTP読み取り中の再試行の最大回数を制限するために、[http_max_single_read_retries](/operations/storing-data#web-storage)設定を使用します。

### ゼロコピー複製 (プロダクション向けではありません) {#zero-copy}

ゼロコピー複製は可能ですが、推奨されていません。`S3`および`HDFS` (不サポート)ディスクに対して。ゼロコピー複製とは、データが複数のマシンにリモートで保存され、同期が必要な場合は、データ自体ではなくメタデータ(データパーツへのパス)のみが複製されることを意味します。

:::note ゼロコピー複製はプロダクション向けではありません。
ゼロコピー複製はデフォルトでClickHouseバージョン22.8以降に無効になっています。この機能はプロダクションでの使用には推奨されません。
:::
