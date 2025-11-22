---
description: 'highlight-next-line 用ドキュメント'
sidebar_label: 'データ保存用の外部ディスク'
sidebar_position: 68
slug: /operations/storing-data
title: 'データ保存用の外部ディスク'
doc_type: 'guide'
---

ClickHouse で処理されるデータは通常、ClickHouse サーバーが動作している
マシンのローカルファイルシステムに保存されます。これは大容量ディスクを
必要とし、高価になる場合があります。データをローカルに保存しないようにするために、
次のようなさまざまなストレージオプションがサポートされています。
1. [Amazon S3](https://aws.amazon.com/s3/) オブジェクトストレージ。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. サポート対象外: Hadoop Distributed File System（[HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)）

<br/>

:::note 
ClickHouse には外部テーブルエンジンのサポートもあります。これは、このページで説明している
外部ストレージオプションとは異なり、Parquet などの一般的なファイル形式で保存された
データを読み取ることができます。このページでは、ClickHouse の `MergeTree` ファミリー
または `Log` ファミリーのテーブル向けのストレージ設定について説明します。

1. `Amazon S3` ディスクに保存されたデータを扱うには、[S3](/engines/table-engines/integrations/s3.md) テーブルエンジンを使用します。
2. Azure Blob Storage に保存されたデータを扱うには、[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) テーブルエンジンを使用します。
3. Hadoop Distributed File System（サポート対象外）上のデータを扱うには、[HDFS](/engines/table-engines/integrations/hdfs.md) テーブルエンジンを使用します。
:::



## 外部ストレージの設定 {#configuring-external-storage}

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)および[`Log`](/engines/table-engines/log-family/log.md)
ファミリーのテーブルエンジンは、それぞれ`s3`、`azure_blob_storage`、`hdfs`(サポート対象外)のディスクタイプを使用して、`S3`、`AzureBlobStorage`、`HDFS`(サポート対象外)にデータを保存できます。

ディスク設定には以下が必要です:

1. `s3`、`azure_blob_storage`、`hdfs`(サポート対象外)、`local_blob_storage`、`web`のいずれかに等しい`type`セクション。
2. 特定の外部ストレージタイプの設定。

ClickHouseバージョン24.1以降では、新しい設定オプションを使用できます。
以下の指定が必要です:

1. `object_storage`に等しい`type`
2. `s3`、`azure_blob_storage`(`24.3`以降は単に`azure`)、`hdfs`(サポート対象外)、`local_blob_storage`(`24.3`以降は単に`local`)、`web`のいずれかに等しい`object_storage_type`。

<br />

オプションで`metadata_type`を指定できます(デフォルトは`local`)が、`plain`、`web`、および`24.4`以降では`plain_rewritable`に設定することもできます。
`plain`メタデータタイプの使用方法は[プレーンストレージセクション](/operations/storing-data#plain-storage)に記載されています。`web`メタデータタイプは`web`オブジェクトストレージタイプでのみ使用でき、`local`メタデータタイプはメタデータファイルをローカルに保存します(各メタデータファイルには、オブジェクトストレージ内のファイルへのマッピングとそれらに関する追加のメタ情報が含まれます)。

例:

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

は、以下の設定と同等です(バージョン`24.1`以降):

```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

以下の設定:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

は、以下と同等です:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

完全なストレージ設定の例は次のようになります:

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

バージョン24.1以降では、次のようにすることもできます:


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

特定の種類のストレージを、すべての `MergeTree` テーブルでのデフォルトオプションとするには、
次のセクションを設定ファイルに追加します。

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

特定のテーブルに対して特定のストレージポリシーを設定したい場合は、
テーブル作成時に `SETTINGS` で指定できます。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

`storage_policy` の代わりに `disk` を使用することもできます。この場合、設定ファイルに `storage_policy` セクションを含める必要はなく、`disk` セクションだけで十分です。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```


## 動的設定 {#dynamic-configuration}

設定ファイルで事前定義されたディスクを使用せずに、`CREATE`/`ATTACH`クエリの設定でストレージ設定を指定することも可能です。

以下のクエリ例は、上記の動的ディスク設定を基に、URLに保存されたテーブルのデータをローカルディスクでキャッシュする方法を示しています。

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

以下の例では、外部ストレージにキャッシュを追加しています。

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

以下で強調表示されている設定では、`type=web`のディスクが`type=cache`のディスク内にネストされている点に注意してください。

:::note
この例では`type=web`を使用していますが、ローカルディスクを含む任意のディスクタイプを動的に設定できます。ローカルディスクを使用する場合、パス引数はサーバー設定パラメータ`custom_local_disks_base_directory`内に配置する必要があります。このパラメータにはデフォルト値がないため、ローカルディスクを使用する際には必ず設定してください。
:::

設定ファイルベースの構成とSQLで定義された構成を組み合わせることも可能です:

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

ここで`web`はサーバー設定ファイルから取得されます:


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

### S3ストレージの使用 {#s3-storage}

#### 必須パラメータ {#required-parameters-s3}

| パラメータ           | 説明                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `endpoint`          | `path`または`virtual hosted`[スタイル](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)のS3エンドポイントURL。データストレージ用のバケットとルートパスを含める必要があります。 |
| `access_key_id`     | 認証に使用するS3アクセスキーID。                                                                                                                                              |
| `secret_access_key` | 認証に使用するS3シークレットアクセスキー。                                                                                                                                          |

#### オプションパラメータ {#optional-parameters-s3}


| パラメータ                                       | 説明                                                                                                                                                                                                                                   | デフォルト値                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `region`                                        | S3リージョン名。                                                                                                                                                                                                                               | -                                        |
| `support_batch_delete`                          | バッチ削除のサポート確認を制御します。Google Cloud Storage (GCS) を使用する場合は `false` に設定してください。GCS はバッチ削除をサポートしていません。                                                                                                | `true`                                   |
| `use_environment_credentials`                   | 環境変数 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN` が存在する場合、それらから AWS 認証情報を読み取ります。                                                                                                        | `false`                                  |
| `use_insecure_imds_request`                     | `true` の場合、Amazon EC2 メタデータから認証情報を取得する際に安全でない IMDS リクエストを使用します。                                                                                                                                                    | `false`                                  |
| `expiration_window_seconds`                     | 有効期限ベースの認証情報が期限切れかどうかを確認する際の猶予期間(秒単位)。                                                                                                                                                          | `120`                                    |
| `proxy`                                         | S3 エンドポイントのプロキシ設定。`proxy` ブロック内の各 `uri` 要素にはプロキシ URL を含める必要があります。                                                                                                                                      | -                                        |
| `connect_timeout_ms`                            | ソケット接続タイムアウト(ミリ秒単位)。                                                                                                                                                                                                       | `10000` (10秒)                     |
| `request_timeout_ms`                            | リクエストタイムアウト(ミリ秒単位)。                                                                                                                                                                                                              | `5000` (5秒)                       |
| `retry_attempts`                                | 失敗したリクエストの再試行回数。                                                                                                                                                                                                 | `10`                                     |
| `single_read_retries`                           | 読み取り中の接続切断に対する再試行回数。                                                                                                                                                                                    | `4`                                      |
| `min_bytes_for_seek`                            | シーケンシャル読み取りの代わりにシーク操作を使用する最小バイト数。                                                                                                                                                                     | `1 MB`                                   |
| `metadata_path`                                 | S3 メタデータファイルを保存するローカルファイルシステムのパス。                                                                                                                                                                                             | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | `true` の場合、起動時のディスクアクセスチェックをスキップします。                                                                                                                                                                                           | `false`                                  |
| `header`                                        | リクエストに指定された HTTP ヘッダーを追加します。複数回指定可能です。                                                                                                                                                                      | -                                        |
| `server_side_encryption_customer_key_base64`    | SSE-C 暗号化された S3 オブジェクトにアクセスするために必要なヘッダー。                                                                                                                                                                                              | -                                        |
| `server_side_encryption_kms_key_id`             | [SSE-KMS 暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)された S3 オブジェクトにアクセスするために必要なヘッダー。空文字列の場合は AWS 管理の S3 キーを使用します。                                                     | -                                        |
| `server_side_encryption_kms_encryption_context` | SSE-KMS の暗号化コンテキストヘッダー(`server_side_encryption_kms_key_id` と併用)。                                                                                                                                                        | -                                        |
| `server_side_encryption_kms_bucket_key_enabled` | SSE-KMS の S3 バケットキーを有効化します(`server_side_encryption_kms_key_id` と併用)。                                                                                                                                                           | バケットレベルの設定に準拠             |
| `s3_max_put_rps`                                | スロットリング前の1秒あたりの最大 PUT リクエスト数。                                                                                                                                                                                            | `0` (無制限)                          |
| `s3_max_put_burst`                              | RPS 制限に達する前の最大同時 PUT リクエスト数。                                                                                                                                                                                     | `s3_max_put_rps` と同じ                 |
| `s3_max_get_rps`                                | スロットリング前の1秒あたりの最大 GET リクエスト数。                                                                                                                                                                                            | `0` (無制限)                          |
| `s3_max_get_burst`                              | RPS 制限に達する前の最大同時 GET リクエスト数。                                                                                                                                                                                     | `s3_max_get_rps` と同じ                 |
| `read_resource`                                 | 読み取りリクエストの[スケジューリング](/operations/workload-scheduling.md)用リソース名。                                                                                                                                                             | 空文字列(無効)                  |
| `write_resource`                                | 書き込みリクエストの[スケジューリング](/operations/workload-scheduling.md)用リソース名。                                                                                                                                                            | 空文字列(無効)                  |
| `key_template`                                  | [re2](https://github.com/google/re2/wiki/Syntax) 構文を使用してオブジェクトキー生成形式を定義します。`storage_metadata_write_full_object_key` フラグが必要です。`endpoint` の `root path` とは互換性がありません。`key_compatibility_prefix` が必要です。 | -                                        |
| `key_compatibility_prefix`                      | `key_template` と併用する必要があります。古いメタデータバージョンを読み取るための `endpoint` の以前の `root path` を指定します。                                                                                                                         | -                                        |
| `read_only`                                     | ディスクからの読み取りのみを許可します。                                                                                                                                                                                                          | -                                        |

:::note
Google Cloud Storage (GCS) も `s3` タイプを使用してサポートされています。[GCS backed MergeTree](/integrations/gcs) を参照してください。
:::

### プレーンストレージの使用 {#plain-storage}


`22.10`では、書き込み1回のストレージを提供する新しいディスクタイプ`s3_plain`が導入されました。
設定パラメータは`s3`ディスクタイプと同じです。
`s3`ディスクタイプとは異なり、データをそのまま保存します。つまり、
ランダムに生成されたblob名を使用する代わりに、通常のファイル名を使用し
(ClickHouseがローカルディスクにファイルを保存するのと同じ方法)、メタデータを
ローカルに保存しません。例えば、`s3`上のデータから派生したものです。

このディスクタイプは、既存データに対するマージの実行を許可せず、新しい
データの挿入も許可しないため、テーブルの静的バージョンを保持できます。
このディスクタイプのユースケースとして、`BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')`を介して
バックアップを作成することが挙げられます。その後、
`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`を実行するか、
`ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`を使用できます。

設定:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1`以降、`plain`メタデータタイプを使用して、任意のオブジェクトストレージディスク(`s3`、`azure`、`hdfs`(サポート対象外)、`local`)を設定できます。

設定:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>azure</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

### S3 Plain Rewritableストレージの使用 {#s3-plain-rewritable-storage}

`24.4`では、新しいディスクタイプ`s3_plain_rewritable`が導入されました。
`s3_plain`ディスクタイプと同様に、メタデータファイル用の追加ストレージを
必要としません。代わりに、メタデータはS3に保存されます。
`s3_plain`ディスクタイプとは異なり、`s3_plain_rewritable`はマージの実行を
許可し、`INSERT`操作をサポートします。
[ミューテーション](/sql-reference/statements/alter#mutations)とテーブルのレプリケーションはサポートされていません。

このディスクタイプのユースケースは、非レプリケート`MergeTree`テーブル向けです。
`s3`ディスクタイプは非レプリケート`MergeTree`テーブルに適していますが、
テーブルのローカルメタデータが不要で、限定された操作セットを受け入れる場合は、
`s3_plain_rewritable`ディスクタイプを選択できます。これは、
例えばシステムテーブルに有用です。

設定:

```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

は次と同等です

```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

`24.5`以降、`plain_rewritable`メタデータタイプを使用して、任意のオブジェクトストレージディスク
(`s3`、`azure`、`local`)を設定できます。

### Azure Blob Storageの使用 {#azure-blob-storage}

`MergeTree`ファミリーのテーブルエンジンは、`azure_blob_storage`タイプのディスクを使用して、
[Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)にデータを保存できます。

設定マークアップ:


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

#### 接続パラメータ {#azure-blob-storage-connection-parameters}

| パラメータ                        | 説明                                                                                                                                                                                      | デフォルト値       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| `storage_account_url` (必須) | Azure Blob StorageアカウントのURL。例: `http://account.blob.core.windows.net` または `http://azurite1:10000/devstoreaccount1`。                                                                    | -                   |
| `container_name`                 | ターゲットコンテナ名。                                                                                                                                                                           | `default-container` |
| `container_already_exists`       | コンテナ作成動作を制御: <br/>- `false`: 新しいコンテナを作成 <br/>- `true`: 既存のコンテナに直接接続 <br/>- 未設定: コンテナの存在を確認し、必要に応じて作成 | -                   |

認証パラメータ(ディスクは利用可能なすべての方法**および**マネージドIDクレデンシャルを試行します):

| パラメータ           | 説明                                                     |
| ------------------- | --------------------------------------------------------------- |
| `connection_string` | 接続文字列を使用した認証用。                   |
| `account_name`      | 共有キーを使用した認証用(`account_key`と併用)。  |
| `account_key`       | 共有キーを使用した認証用(`account_name`と併用)。 |

#### 制限パラメータ {#azure-blob-storage-limit-parameters}

| パラメータ                            | 説明                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `s3_max_single_part_upload_size`     | Blob Storageへの単一ブロックアップロードの最大サイズ。                      |
| `min_bytes_for_seek`                 | シーク可能な領域の最小サイズ。                                          |
| `max_single_read_retries`            | Blob Storageからデータチャンクを読み取る最大試行回数。       |
| `max_single_download_retries`        | Blob Storageから読み取り可能なバッファをダウンロードする最大試行回数。 |
| `thread_pool_size`                   | `IDiskRemote`インスタンス化の最大スレッド数。                  |
| `s3_max_inflight_parts_for_one_file` | 単一オブジェクトに対する同時putリクエストの最大数。              |

#### その他のパラメータ {#azure-blob-storage-other-parameters}

| パラメータ                        | 説明                                                                        | デフォルト値                            |
| -------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| `metadata_path`                  | Blob Storageのメタデータファイルを保存するローカルファイルシステムパス。                    | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`              | `true`の場合、起動時のディスクアクセスチェックをスキップします。                                | `false`                                  |
| `read_resource`                  | 読み取りリクエストの[スケジューリング](/operations/workload-scheduling.md)用リソース名。  | 空文字列(無効)                  |
| `write_resource`                 | 書き込みリクエストの[スケジューリング](/operations/workload-scheduling.md)用リソース名。 | 空文字列(無効)                  |
| `metadata_keep_free_space_bytes` | 予約するメタデータディスクの空き容量。                                     | -                                        |

動作する設定例は、統合テストディレクトリで確認できます([test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml)または[test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)を参照)。

:::note ゼロコピーレプリケーションは本番環境に対応していません
ゼロコピーレプリケーションは、ClickHouseバージョン22.8以降ではデフォルトで無効になっています。この機能は本番環境での使用を推奨しません。
:::


## HDFSストレージの使用（サポート対象外） {#using-hdfs-storage-unsupported}

このサンプル設定では：

- ディスクのタイプは`hdfs`（サポート対象外）
- データは`hdfs://hdfs1:9000/clickhouse/`にホストされています

なお、HDFSはサポート対象外であるため、使用時に問題が発生する可能性があります。問題が発生した場合は、修正のプルリクエストをお気軽にお送りください。

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

HDFSはエッジケースでは動作しない可能性があることに留意してください。

### データ暗号化の使用 {#encrypted-virtual-file-system}

[S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)、[HDFS](#using-hdfs-storage-unsupported)（サポート対象外）の外部ディスク、またはローカルディスクに保存されたデータを暗号化できます。暗号化モードを有効にするには、設定ファイルでタイプが`encrypted`のディスクを定義し、データを保存するディスクを選択する必要があります。`encrypted`ディスクは、書き込まれるすべてのファイルをリアルタイムで暗号化し、`encrypted`ディスクからファイルを読み取る際には自動的に復号化します。そのため、`encrypted`ディスクは通常のディスクと同様に使用できます。

ディスク設定の例：

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

例えば、ClickHouseがあるテーブルから`disk1`へファイル`store/all_1_1_0/data.bin`にデータを書き込む場合、実際にはこのファイルは物理ディスク上のパス`/path1/store/all_1_1_0/data.bin`に書き込まれます。

同じファイルを`disk2`に書き込む場合、実際には暗号化モードで物理ディスク上のパス`/path1/path2/store/all_1_1_0/data.bin`に書き込まれます。

### 必須パラメータ {#required-parameters-encrypted-disk}

| パラメータ | 型     | 説明                                                                                                                                         |
| ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | String | 暗号化ディスクを作成するには`encrypted`に設定する必要があります。                                                                            |
| `disk`     | String | 基盤となるストレージに使用するディスクのタイプ。                                                                                             |
| `key`      | Uint64 | 暗号化と復号化のための鍵。`key_hex`を使用して16進数で指定できます。`id`属性を使用して複数の鍵を指定できます。                                |

### オプションパラメータ {#optional-parameters-encrypted-disk}

| パラメータ       | 型     | デフォルト     | 説明                                                                                                                                        |
| ---------------- | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`           | String | ルートディレクトリ | データが保存されるディスク上の場所。                                                                                                        |
| `current_key_id` | String | -              | 暗号化に使用される鍵ID。指定されたすべての鍵を復号化に使用できます。                                                                        |
| `algorithm`      | Enum   | `AES_128_CTR`  | 暗号化アルゴリズム。オプション：<br/>- `AES_128_CTR`（16バイト鍵）<br/>- `AES_192_CTR`（24バイト鍵）<br/>- `AES_256_CTR`（32バイト鍵） |

ディスク設定の例：


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

バージョン22.3以降、ストレージ構成でディスク上にローカルキャッシュを設定できます。
バージョン22.3から22.7では、キャッシュは`s3`ディスクタイプのみサポートされています。バージョン22.8以降では、S3、Azure、Local、Encryptedなど、すべてのディスクタイプでキャッシュがサポートされています。
バージョン23.5以降では、キャッシュはリモートディスクタイプ(S3、Azure、HDFS(サポート対象外))のみサポートされています。
キャッシュは`LRU`キャッシュポリシーを使用します。

バージョン22.8以降の構成例:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3構成 ...
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
        <policies>
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
                ... s3構成 ...
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
        <policies>
    </storage_configuration>
```

ファイルキャッシュの**ディスク構成設定**:

これらの設定は、ディスク構成セクションで定義する必要があります。


| パラメータ                            | 型      | デフォルト | 説明                                                                                                                                                                                         |
|---------------------------------------|---------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                                | String  | -          | **必須**。キャッシュを保存するディレクトリへのパス。                                                                                                                                         |
| `max_size`                            | Size    | -          | **必須**。キャッシュの最大サイズ（バイト数または読みやすい形式。例: `10Gi`）。上限に達した場合、LRU ポリシーでファイルが削除されます。`ki`、`Mi`、`Gi` 形式をサポートします（v22.10 以降）。 |
| `cache_on_write_operations`           | Boolean | `false`    | `INSERT` クエリおよびバックグラウンドマージに対してライトスルーキャッシュを有効にします。クエリ単位で `enable_filesystem_cache_on_write_operations` によって上書きできます。                 |
| `enable_filesystem_query_cache_limit` | Boolean | `false`    | `max_query_cache_size` に基づくクエリ単位のキャッシュサイズ制限を有効にします。                                                                                                             |
| `enable_cache_hits_threshold`         | Boolean | `false`    | 有効にすると、データが複数回読み出された場合にのみキャッシュされます。                                                                                                                       |
| `cache_hits_threshold`                | Integer | `0`        | データをキャッシュするまでに必要な読み出し回数（`enable_cache_hits_threshold` が有効である必要があります）。                                                                                 |
| `enable_bypass_cache_with_threshold`  | Boolean | `false`    | 大きな読み取り範囲に対してキャッシュをスキップします。                                                                                                                                       |
| `bypass_cache_threshold`              | Size    | `256Mi`    | キャッシュバイパスをトリガーする読み取り範囲サイズ（`enable_bypass_cache_with_threshold` が有効である必要があります）。                                                                      |
| `max_file_segment_size`               | Size    | `8Mi`      | 単一のキャッシュファイルの最大サイズ（バイト数または読みやすい形式）。                                                                                                                       |
| `max_elements`                        | Integer | `10000000` | キャッシュファイルの最大数。                                                                                                                                                                 |
| `load_metadata_threads`               | Integer | `16`       | 起動時にキャッシュメタデータを読み込むためのスレッド数。                                                                                                                                     |

> **注記**: Size の値は `ki`、`Mi`、`Gi` などの単位をサポートします（例: `10Gi`）。



## ファイルキャッシュのクエリ/プロファイル設定 {#file-cache-query-profile-settings}

| 設定                                                                 | 型    | デフォルト                 | 説明                                                                                                                                                                    |
| ----------------------------------------------------------------------- | ------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable_filesystem_cache`                                               | Boolean | `true`                  | `cache`ディスクタイプを使用している場合でも、クエリごとのキャッシュ使用を有効化/無効化します。                                                                                   |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache`           | Boolean | `false`                 | 有効にすると、データが存在する場合のみキャッシュを使用します。新しいデータはキャッシュされません。                                                                                        |
| `enable_filesystem_cache_on_write_operations`                           | Boolean | `false` (Cloud: `true`) | ライトスルーキャッシュを有効化します。キャッシュ設定で`cache_on_write_operations`が必要です。                                                                             |
| `enable_filesystem_cache_log`                                           | Boolean | `false`                 | `system.filesystem_cache_log`への詳細なキャッシュ使用ログを有効化します。                                                                                         |
| `filesystem_cache_allow_background_download`                            | Boolean | `true`                  | 部分的にダウンロードされたセグメントをバックグラウンドで完了することを許可します。無効にすると、現在のクエリ/セッションのダウンロードがフォアグラウンドで保持されます。              |
| `max_query_cache_size`                                                  | Size    | `false`                 | クエリごとの最大キャッシュサイズ。キャッシュ設定で`enable_filesystem_query_cache_limit`が必要です。                                                                  |
| `filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit` | Boolean | `true`                  | `max_query_cache_size`に達した際の動作を制御します: <br/>- `true`: 新しいデータのダウンロードを停止 <br/>- `false`: 新しいデータ用のスペースを確保するために古いデータを削除 |

:::warning
キャッシュ設定とキャッシュクエリ設定は最新のClickHouseバージョンに対応しており、
以前のバージョンでは一部の機能がサポートされていない可能性があります。
:::

#### キャッシュシステムテーブル {#cache-system-tables-file-cache}

| テーブル名                    | 説明                                         | 要件                                  |
| ----------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `system.filesystem_cache`     | ファイルシステムキャッシュの現在の状態を表示します。 | なし                                          |
| `system.filesystem_cache_log` | クエリごとの詳細なキャッシュ使用統計を提供します。 | `enable_filesystem_cache_log = true`が必要 |

#### キャッシュコマンド {#cache-commands-file-cache}

##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` {#system-drop-filesystem-cache-on-cluster}

このコマンドは`<cache_name>`が指定されていない場合のみサポートされます

##### `SHOW FILESYSTEM CACHES` {#show-filesystem-caches}

サーバーに設定されているファイルシステムキャッシュのリストを表示します。
(バージョン`22.8`以前では、このコマンドは`SHOW CACHES`という名前です)

```sql title="クエリ"
SHOW FILESYSTEM CACHES
```

```text title="レスポンス"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'` {#describe-filesystem-cache}

特定のキャッシュのキャッシュ設定と一般的な統計情報を表示します。
キャッシュ名は`SHOW FILESYSTEM CACHES`コマンドから取得できます。(バージョン`22.8`以前では、このコマンドは`DESCRIBE CACHE`という名前です)

```sql title="クエリ"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="レスポンス"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```


| キャッシュの現在のメトリクス     | キャッシュの非同期メトリクス | キャッシュのプロファイルイベント                                                                      |
| ------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| `FilesystemCacheSize`     | `FilesystemCacheBytes`     | `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes`               |
| `FilesystemCacheElements` | `FilesystemCacheFiles`     | `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds` |
|                           |                            | `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`               |
|                           |                            | `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`             |

### 静的Webストレージの使用（読み取り専用） {#web-storage}

これは読み取り専用ディスクです。データは読み取りのみが可能で、変更されることはありません。新しいテーブルは`ATTACH TABLE`クエリを介してこのディスクに読み込まれます（以下の例を参照）。ローカルディスクは実際には使用されず、各`SELECT`クエリは必要なデータを取得するために`http`リクエストを実行します。テーブルデータのすべての変更は例外となります。つまり、以下のタイプのクエリは許可されていません：[`CREATE TABLE`](/sql-reference/statements/create/table.md)、
[`ALTER TABLE`](/sql-reference/statements/alter/index.md)、[`RENAME TABLE`](/sql-reference/statements/rename#rename-table)、
[`DETACH TABLE`](/sql-reference/statements/detach.md)、[`TRUNCATE TABLE`](/sql-reference/statements/truncate.md)。
Webストレージは読み取り専用の用途に使用できます。使用例としては、サンプルデータのホスティングやデータの移行があります。`clickhouse-static-files-uploader`というツールがあり、指定されたテーブルのデータディレクトリを準備します（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。必要な各テーブルについて、ファイルのディレクトリが取得されます。これらのファイルは、例えば静的ファイルを提供するWebサーバーにアップロードできます。この準備の後、`DiskWeb`を介してこのテーブルを任意のClickHouseサーバーに読み込むことができます。

このサンプル設定では：

- ディスクのタイプは`web`です
- データは`http://nginx:80/test1/`でホストされています
- ローカルストレージ上のキャッシュが使用されます

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
Webデータセットが定期的に使用されることが想定されていない場合、ストレージはクエリ内で一時的に設定することもできます。[動的設定](#dynamic-configuration)を参照し、設定ファイルの編集をスキップしてください。

[デモデータセット](https://github.com/ClickHouse/web-tables-demo)はGitHubでホストされています。Webストレージ用に独自のテーブルを準備するには、[clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)ツールを参照してください。
:::

この`ATTACH TABLE`クエリでは、提供される`UUID`がデータのディレクトリ名と一致し、エンドポイントはGitHubの生コンテンツのURLです。


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

あらかじめ用意されたテストケースです。次の設定を `config` に追加してください:

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

次に、次のクエリを実行します：


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

#### 必須パラメータ {#static-web-storage-required-parameters}

| パラメータ  | 説明                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `type`     | `web`を指定します。それ以外の場合、ディスクは作成されません。                                                                         |
| `endpoint` | `path`形式のエンドポイントURL。エンドポイントURLには、データがアップロードされた保存先のルートパスを含める必要があります。 |

#### オプションパラメータ {#optional-parameters-web}


| パラメータ                           | 説明                                                                  | デフォルト値   |
| ----------------------------------- | ---------------------------------------------------------------------------- | --------------- |
| `min_bytes_for_seek`                | シーケンシャル読み取りの代わりにシーク操作を使用する最小バイト数 | `1` MB          |
| `remote_fs_read_backoff_threashold` | リモートディスクからデータを読み取る際の最大待機時間               | `10000` 秒 |
| `remote_fs_read_backoff_max_tries`  | バックオフを伴う読み取りの最大試行回数                          | `5`             |

クエリが例外 `DB:Exception Unreachable URL` で失敗した場合は、次の設定を調整してください：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

アップロード用のファイルを取得するには、次のコマンドを実行します：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path` はクエリ `SELECT data_paths FROM system.tables WHERE name = 'table_name'` で確認できます）。

`endpoint` でファイルを読み込む場合、ファイルは `<endpoint>/store/` パスに配置する必要がありますが、設定には `endpoint` のみを含める必要があります。

サーバー起動時にテーブルを読み込む際にURLに到達できない場合、すべてのエラーが捕捉されます。この場合にエラーが発生した場合、テーブルは `DETACH TABLE table_name` -> `ATTACH TABLE table_name` を実行することで再読み込み（表示可能に）できます。サーバー起動時にメタデータが正常に読み込まれた場合、テーブルは直ちに利用可能になります。

単一のHTTP読み取り中の最大再試行回数を制限するには、[http_max_single_read_retries](/operations/storing-data#web-storage) 設定を使用してください。

### ゼロコピーレプリケーション（本番環境未対応） {#zero-copy}

ゼロコピーレプリケーションは `S3` および `HDFS`（サポート対象外）ディスクで可能ですが、推奨されません。ゼロコピーレプリケーションとは、データが複数のマシンにリモートで保存され、同期が必要な場合に、データ自体ではなくメタデータ（データパーツへのパス）のみがレプリケートされることを意味します。

:::note ゼロコピーレプリケーションは本番環境未対応
ゼロコピーレプリケーションは、ClickHouseバージョン22.8以降ではデフォルトで無効になっています。この機能は本番環境での使用は推奨されません。
:::
