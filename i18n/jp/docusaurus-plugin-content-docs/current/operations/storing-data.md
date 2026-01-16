---
description: 'highlight-next-line のドキュメント'
sidebar_label: 'データ保存用の外部ディスク'
sidebar_position: 68
slug: /operations/storing-data
title: 'データ保存用の外部ディスク'
doc_type: 'guide'
---

ClickHouse で処理されるデータは通常、ClickHouse サーバーが動作している
マシンのローカルファイルシステムに保存されます。これには大容量ディスクが
必要となり、コストが高くなる場合があります。ローカルにデータを保存しないために、さまざまなストレージオプションがサポートされています:
1. [Amazon S3](https://aws.amazon.com/s3/) オブジェクトストレージ。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. サポート対象外: Hadoop Distributed File System ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

<br/>

:::note 
ClickHouse には外部テーブルエンジンのサポートもありますが、これはこのページで説明している外部ストレージオプションとは異なります。外部テーブルエンジンは、Parquet のような汎用的なファイル形式で保存されたデータを読み取ることができます。このページでは、ClickHouse の `MergeTree` ファミリーまたは `Log` ファミリーテーブル向けのストレージ設定について説明します。

1. `Amazon S3` ディスク上に保存されたデータを扱うには、[S3](/engines/table-engines/integrations/s3.md) テーブルエンジンを使用します。
2. Azure Blob Storage に保存されたデータを扱うには、[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) テーブルエンジンを使用します。
3. Hadoop Distributed File System（サポート対象外）上のデータを扱うには、[HDFS](/engines/table-engines/integrations/hdfs.md) テーブルエンジンを使用します。
:::

## 外部ストレージを構成する \{#configuring-external-storage\}

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) および [`Log`](/engines/table-engines/log-family/log.md)
ファミリーのテーブルエンジンは、`S3`、`AzureBlobStorage`、`HDFS`（サポート対象外）に対して、それぞれディスクタイプ `s3`、
`azure_blob_storage`、`hdfs`（サポート対象外）を使用してデータを保存できます。

ディスク構成には次が必要です:

1. `type` セクション（値は `s3`、`azure_blob_storage`、`hdfs`（サポート対象外）、`local_blob_storage`、`web` のいずれか）。
2. 対象となる外部ストレージタイプ固有の設定。

ClickHouse バージョン 24.1 以降では、新しい構成オプションを使用できます。
この場合は次を指定する必要があります:

1. `type` を `object_storage` に設定する。
2. `object_storage_type` を `s3`、`azure_blob_storage`（または `24.3` 以降では単に `azure`）、`hdfs`（サポート対象外）、`local_blob_storage`（または `24.3` 以降では単に `local`）、`web` のいずれかに設定する。

<br />

任意で `metadata_type` を指定できます（デフォルトは `local`）が、`plain`、`web`、さらに `24.4` 以降では `plain_rewritable` に設定することもできます。
`plain` メタデータタイプの使用方法は [plain storage セクション](/operations/storing-data#plain-storage) で説明されています。`web` メタデータタイプは `web` オブジェクトストレージタイプでのみ使用でき、`local` メタデータタイプはメタデータファイルをローカルに保存します（各メタデータファイルには、オブジェクトストレージ内のファイルへのマッピングと、それらに関する追加のメタ情報が含まれます）。

例:

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

は、次の設定（バージョン `24.1` 以降）に相当します。

```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

次の設定は以下のとおりです。

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

は次の値と等しい：

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

ストレージ構成の完全な例は次のとおりです。

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

バージョン 24.1 以降では、次のような形にもなります：

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

すべての `MergeTree` テーブルで特定の種類のストレージをデフォルトとして使用するには、
設定ファイルに次のセクションを追加します。

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

特定のテーブルに対して特定のストレージポリシーを設定したい場合は、
テーブルを作成する際に `settings` で指定できます。

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

## 動的設定 \{#dynamic-configuration\}

ディスクを構成ファイルで事前定義しなくても、`CREATE` / `ATTACH` クエリの設定でストレージ設定を指定することもできます。

次のクエリ例は、上記の動的ディスク設定を基にしており、URL でホストされているテーブルのデータをローカルディスクにキャッシュする方法を示しています。

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

以下の例では、外部ストレージにキャッシュを追加します。

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

以下で強調されている設定では、`type=web` のディスクが
`type=cache` のディスクの中にネストされている点に注意してください。

:::note
この例では `type=web` を使用していますが、ローカルディスクを含め、任意のディスクタイプを動的ディスクとして構成できます。ローカルディスクでは、サーバー設定パラメータ `custom_local_disks_base_directory` で指定されたディレクトリ配下のパスを、パス引数として指定する必要があります。このパラメータにはデフォルト値がないため、ローカルディスクを使用する場合は合わせて設定してください。
:::

設定ファイルベースの設定と SQL で定義された設定を組み合わせて使用することもできます。

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

ここで `web` はサーバー設定ファイルで定義された値です。

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

### S3 ストレージの使用 \{#s3-storage\}

#### 必須パラメータ \{#required-parameters-s3\}

| Parameter           | Description                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `endpoint`          | `path` または `virtual hosted` [スタイル](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html) の S3 エンドポイント URL。データ格納用のバケットおよびルートパスを含める必要があります。 |
| `access_key_id`     | 認証に使用される S3 アクセスキー ID。                                                                                                                                   |
| `secret_access_key` | 認証に使用される S3 シークレットアクセスキー。                                                                                                                                |

#### オプションパラメータ \{#optional-parameters-s3\}

| Parameter                                       | Description                                                                                                                                                                                                                                   | Default Value                            |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `region`                                        | S3 のリージョン名。                                                                                                                                                                                                                           | -                                        |
| `support_batch_delete`                          | バッチ削除のサポートをチェックするかどうかを制御します。Google Cloud Storage (GCS) を使用する場合は、GCS はバッチ削除をサポートしないため `false` に設定します。                                                                              | `true`                                   |
| `use_environment_credentials`                   | 存在する場合、環境変数 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN` から AWS クレデンシャルを読み取ります。                                                                                                               | `false`                                  |
| `use_insecure_imds_request`                     | `true` の場合、Amazon EC2 メタデータからクレデンシャルを取得する際に、非セキュアな IMDS リクエストを使用します。                                                                                                                              | `false`                                  |
| `expiration_window_seconds`                     | 有効期限付きクレデンシャルが失効しているかどうかを確認するための猶予期間（秒）。                                                                                                                                                               | `120`                                    |
| `proxy`                                         | S3 エンドポイント用のプロキシ設定。`proxy` ブロック内の各 `uri` 要素にはプロキシ URL を指定する必要があります。                                                                                                                               | -                                        |
| `connect_timeout_ms`                            | ソケット接続のタイムアウト（ミリ秒）。                                                                                                                                                                                                       | `10000` (10 seconds)                     |
| `request_timeout_ms`                            | リクエストのタイムアウト（ミリ秒）。                                                                                                                                                                                                         | `5000` (5 seconds)                       |
| `retry_attempts`                                | 失敗したリクエストに対する再試行回数。                                                                                                                                                                                                       | `10`                                     |
| `single_read_retries`                           | 読み取り中の接続断に対する再試行回数。                                                                                                                                                                                                       | `4`                                      |
| `min_bytes_for_seek`                            | シーケンシャルリードではなく seek 操作を使用するための最小バイト数。                                                                                                                                                                         | `1 MB`                                   |
| `metadata_path`                                 | S3 メタデータファイルを保存するローカルファイルシステム上のパス。                                                                                                                                                                            | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | `true` の場合、起動時のディスクアクセスチェックをスキップします。                                                                                                                                                                            | `false`                                  |
| `header`                                        | リクエストに指定した HTTP ヘッダーを追加します。複数回指定できます。                                                                                                                                                                         | -                                        |
| `server_side_encryption_customer_key_base64`    | SSE-C で暗号化された S3 オブジェクトにアクセスするために必要なヘッダー。                                                                                                                                                                     | -                                        |
| `server_side_encryption_kms_key_id`             | [SSE-KMS 暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) を使用した S3 オブジェクトにアクセスするために必要なヘッダー。空文字列の場合は AWS 管理の S3 キーが使用されます。                           | -                                        |
| `server_side_encryption_kms_encryption_context` | SSE-KMS 用の暗号化コンテキストヘッダー（`server_side_encryption_kms_key_id` と併用）。                                                                                                                                                       | -                                        |
| `server_side_encryption_kms_bucket_key_enabled` | SSE-KMS 用に S3 バケットキーを有効化します（`server_side_encryption_kms_key_id` と併用）。                                                                                                                                                   | バケットレベルの設定に一致              |
| `s3_max_put_rps`                                | スロットリングが行われる前の 1 秒あたりの最大 PUT リクエスト数。                                                                                                                                                                             | `0` (unlimited)                          |
| `s3_max_put_burst`                              | RPS 制限に到達する前に許可される同時 PUT リクエストの最大数。                                                                                                                                                                                | `s3_max_put_rps` と同じ                  |
| `s3_max_get_rps`                                | スロットリングが行われる前の 1 秒あたりの最大 GET リクエスト数。                                                                                                                                                                             | `0` (unlimited)                          |
| `s3_max_get_burst`                              | RPS 制限に到達する前に許可される同時 GET リクエストの最大数。                                                                                                                                                                                | `s3_max_get_rps` と同じ                  |
| `read_resource`                                 | 読み取りリクエスト用の [scheduling](/operations/workload-scheduling.md) リソース名。                                                                                                                                                         | 空文字列（無効）                         |
| `write_resource`                                | 書き込みリクエスト用の [scheduling](/operations/workload-scheduling.md) リソース名。                                                                                                                                                         | 空文字列（無効）                         |
| `key_template`                                  | [re2](https://github.com/google/re2/wiki/Syntax) 構文を使用してオブジェクトキーの生成フォーマットを定義します。`storage_metadata_write_full_object_key` フラグが必要です。`endpoint` の `root path` とは非互換です。`key_compatibility_prefix` が必要です。 | -                                        |
| `key_compatibility_prefix`                      | `key_template` と併用する必須設定。古いメタデータバージョンを読み取るために、以前 `endpoint` で使用していた `root path` を指定します。                                                                                                        | -                                        |
| `read_only`                                      | ディスクからの読み取りのみを許可します。                                                                                                                                                                                                     | -                                        |
:::note
Google Cloud Storage (GCS) も `s3` タイプとしてサポートされています。詳細は [GCS backed MergeTree](/integrations/gcs) を参照してください。
:::

### プレーンストレージの使用 \{#plain-storage\}

`22.10` で新しいディスクタイプ `s3_plain` が導入されました。これは一度だけ書き込めるストレージを提供します。
このディスクタイプの設定パラメータは、`s3` ディスクタイプの場合と同じです。
`s3` ディスクタイプと異なり、データをそのまま保存します。言い換えると、
ランダムに生成された BLOB 名を使う代わりに通常のファイル名を使用し
（ClickHouse がローカルディスク上にファイルを保存するのと同じ方式）、
ローカルには一切メタデータを保存しません。例えば、メタデータは `s3` 上のデータから導出されます。

このディスクタイプでは、既存データに対してマージを実行できず、新規データの挿入もできないため、
テーブルの静的なバージョンを保持できます。
このディスクタイプのユースケースとしては、その上にバックアップを作成することが挙げられます。
これは `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` を実行することで行えます。
その後、`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`
を実行するか、`ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`
を使用できます。

設定:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1` 以降では、任意のオブジェクトストレージディスク（`s3`、`azure`、`hdfs`（非サポート）、`local`）を
`plain` メタデータタイプを使用して設定できます。

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

### S3 Plain Rewritable Storage の使用 \{#s3-plain-rewritable-storage\}

新しいディスクタイプ `s3_plain_rewritable` は `24.4` で導入されました。
`s3_plain` ディスクタイプと同様に、メタデータファイル用の追加ストレージは必要ありません。
メタデータは代わりに S3 に保存されます。
`s3_plain` ディスクタイプと異なり、`s3_plain_rewritable` ではマージの実行が可能で、
`INSERT` 操作をサポートします。
[Mutations](/sql-reference/statements/alter#mutations) とテーブルのレプリケーションには対応していません。

このディスクタイプの主な利用例は、非レプリケートの `MergeTree` テーブルです。
`s3` ディスクタイプも非レプリケートの `MergeTree` テーブルに適していますが、
テーブルのローカルメタデータが不要で、利用できる操作が制限されても問題ない場合は、
`s3_plain_rewritable` ディスクタイプを選択できます。
これは、たとえば system テーブルに対して有用な場合があります。

設定:

```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

に等しい

```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

`24.5` 以降、`plain_rewritable` メタデータタイプを使用して、任意のオブジェクトストレージディスク
（`s3`、`azure`、`local`）を設定できるようになりました。

### Azure Blob Storage の使用 \{#azure-blob-storage\}

`MergeTree` ファミリのテーブルエンジンは、`azure_blob_storage` タイプのディスクを使用して
データを [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) に保存できます。

設定例:

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

#### 接続パラメータ \{#azure-blob-storage-connection-parameters\}

| Parameter                        | Description                                                                                                           | Default Value       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `storage_account_url` (Required) | Azure Blob Storage アカウントの URL。例: `http://account.blob.core.windows.net` または `http://azurite1:10000/devstoreaccount1`。 | -                   |
| `container_name`                 | 対象となるコンテナ名。                                                                                                           | `default-container` |
| `container_already_exists`       | コンテナ作成時の挙動を制御します: <br />- `false`: 新しいコンテナを作成する <br />- `true`: 既存のコンテナに直接接続する <br />- 未設定: コンテナの存在を確認し、存在しない場合は作成する  | -                   |

認証パラメータ（ディスクは利用可能なすべての方法 **および** Managed Identity Credential を順に試行します）:

| Parameter           | Description                       |
| ------------------- | --------------------------------- |
| `connection_string` | 接続文字列を使用した認証に利用します。               |
| `account_name`      | 共有キー認証（`account_key` と併用）に利用します。  |
| `account_key`       | 共有キー認証（`account_name` と併用）に利用します。 |

#### 制限パラメータ \{#azure-blob-storage-limit-parameters\}

| Parameter                            | Description                               |
| ------------------------------------ | ----------------------------------------- |
| `s3_max_single_part_upload_size`     | Blob Storage への単一ブロックアップロードの最大サイズ。        |
| `min_bytes_for_seek`                 | シーク可能領域の最小サイズ。                            |
| `max_single_read_retries`            | Blob Storage からデータチャンクを読み取る試行回数の上限。       |
| `max_single_download_retries`        | Blob Storage から読み取り用バッファをダウンロードする試行回数の上限。 |
| `thread_pool_size`                   | `IDiskRemote` のインスタンス化に使用されるスレッド数の上限。     |
| `s3_max_inflight_parts_for_one_file` | 1 つのオブジェクトに対する同時 put リクエスト数の上限。           |

#### その他のパラメータ \{#azure-blob-storage-other-parameters\}

| Parameter                        | Description                                                      | Default Value                            |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| `metadata_path`                  | Blob Storage 用のメタデータファイルを保存するローカルファイルシステム上のパス。                   | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`              | `true` の場合、起動時のディスクアクセスチェックをスキップします。                             | `false`                                  |
| `read_resource`                  | [スケジューリング](/operations/workload-scheduling.md) における読み取り要求のリソース名。 | 空文字列（無効）                                 |
| `write_resource`                 | [スケジューリング](/operations/workload-scheduling.md) における書き込み要求のリソース名。 | 空文字列（無効）                                 |
| `metadata_keep_free_space_bytes` | メタデータディスクに予約しておく空き容量（バイト数）。                                      | -                                        |

動作する構成の例は integration tests ディレクトリ内で確認できます（例: [test&#95;merge&#95;tree&#95;azure&#95;blob&#95;storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) や [test&#95;azure&#95;blob&#95;storage&#95;zero&#95;copy&#95;replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml) など）。

:::note Zero-copy レプリケーションは本番環境利用の準備が整っていません
Zero-copy レプリケーションは ClickHouse バージョン 22.8 以降ではデフォルトで無効です。この機能の本番環境での利用は推奨されません。
:::

## HDFS ストレージの使用（サポート対象外） \{#using-hdfs-storage-unsupported\}

このサンプル構成では：

* ディスクのタイプは `hdfs`（サポート対象外）です
* データは `hdfs://hdfs1:9000/clickhouse/` にホストされています

なお、HDFS はサポート対象外であるため、使用時に問題が発生する可能性があります。問題が発生した場合は、その修正を含む Pull Request の送信を歓迎します。

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

HDFS は一部のコーナーケースでは動作しない場合があることに注意してください。

### データ暗号化の使用 \{#encrypted-virtual-file-system\}

[S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) や [HDFS](#using-hdfs-storage-unsupported)（非サポート）の外部ディスク、あるいはローカルディスクに保存されるデータを暗号化できます。暗号化モードを有効にするには、設定ファイル内で `encrypted` 型のディスクを定義し、データを保存するディスクを選択する必要があります。`encrypted` ディスクは、書き込まれるすべてのファイルをリアルタイムに暗号化し、`encrypted` ディスクからファイルを読み取るときには自動的に復号します。そのため、通常のディスクと同様に `encrypted` ディスクを扱うことができます。

ディスク設定の例:

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

例えば、ClickHouse があるテーブルのデータをファイル `store/all_1_1_0/data.bin` として `disk1` に書き込む場合、実際にはこのファイルは物理ディスク上のパス `/path1/store/all_1_1_0/data.bin` に書き込まれます。

同じファイルを `disk2` に書き込む場合は、実際には暗号化モードで物理ディスク上のパス `/path1/path2/store/all_1_1_0/data.bin` に書き込まれます。

### 必須パラメータ \{#required-parameters-encrypted-disk\}

| Parameter | Type   | Description                                                             |
| --------- | ------ | ----------------------------------------------------------------------- |
| `type`    | String | 暗号化ディスクを作成するには `encrypted` を指定する必要があります。                                |
| `disk`    | String | 基盤となるストレージとして使用するディスクの種類。                                               |
| `key`     | Uint64 | 暗号化および復号に使用するキー。`key_hex` を使用して 16 進数で指定できます。複数のキーは `id` 属性を使用して指定できます。 |

### オプションパラメータ \{#optional-parameters-encrypted-disk\}

| Parameter        | Type   | Default        | Description                                                                                                         |
| ---------------- | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `path`           | String | Root directory | データが保存されるディスク上の場所。                                                                                                  |
| `current_key_id` | String | -              | 暗号化に使用されるキー ID。指定されたすべてのキーは復号に使用できます。                                                                               |
| `algorithm`      | Enum   | `AES_128_CTR`  | 暗号化アルゴリズム。オプション: <br />- `AES_128_CTR` (16 バイトキー) <br />- `AES_192_CTR` (24 バイトキー) <br />- `AES_256_CTR` (32 バイトキー) |

ディスク設定の例:

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

### ローカルキャッシュの使用 \{#using-local-cache\}

バージョン 22.3 以降では、ストレージ設定でディスクに対してローカルキャッシュを設定できます。
バージョン 22.3 ～ 22.7 では、キャッシュは `s3` ディスクタイプでのみサポートされます。バージョン &gt;= 22.8 では、キャッシュは任意のディスクタイプ (S3、Azure、Local、Encrypted など) でサポートされます。
バージョン &gt;= 23.5 では、キャッシュはリモートディスクタイプ (S3、Azure、HDFS (非サポート)) に対してのみサポートされます。
キャッシュは `LRU` キャッシュポリシーで管理されます。

22.8 以降のバージョンにおける設定例:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 configuration ...
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

22.8 より前のバージョン向けの設定例:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 configuration ...
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

ファイルキャッシュの**ディスク構成設定**：

これらの設定は、ディスク構成セクション内で定義する必要があります。

| Parameter                             | Type    | Default    | Description                                                                                                                                                                                  |
|---------------------------------------|---------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                                | String  | -          | **必須**。キャッシュを保存するディレクトリへのパス。                                                                                                                                      |
| `max_size`                            | Size    | -          | **必須**。キャッシュの最大サイズ（バイト数または可読形式。例: `10Gi`）。上限に達すると、LRU ポリシーでファイルが削除されます。`ki`、`Mi`、`Gi` 形式をサポートします（v22.10 以降）。 |
| `cache_on_write_operations`           | Boolean | `false`    | `INSERT` クエリおよびバックグラウンドマージに対してライトスルーキャッシュを有効にします。クエリ単位で `enable_filesystem_cache_on_write_operations` により上書きできます。             |
| `enable_filesystem_query_cache_limit` | Boolean | `false`    | `max_query_cache_size` に基づくクエリ単位のキャッシュサイズ上限を有効にします。                                                                                                             |
| `enable_cache_hits_threshold`         | Boolean | `false`    | 有効化すると、データが複数回読み取られた後にのみキャッシュされます。                                                                                                                        |
| `cache_hits_threshold`                | Integer | `0`        | データをキャッシュするまでに必要な読み取り回数（`enable_cache_hits_threshold` が有効である必要があります）。                                                                                |
| `enable_bypass_cache_with_threshold`  | Boolean | `false`    | 大きな読み取り範囲の場合にキャッシュをバイパスします。                                                                                                                                     |
| `bypass_cache_threshold`              | Size    | `256Mi`    | キャッシュのバイパスをトリガーする読み取り範囲サイズ（`enable_bypass_cache_with_threshold` が有効である必要があります）。                                                                  |
| `max_file_segment_size`               | Size    | `8Mi`      | 1 つのキャッシュファイルの最大サイズ（バイト数または可読形式）。                                                                                                                             |
| `max_elements`                        | Integer | `10000000` | キャッシュファイルの最大数。                                                                                                                                                                 |
| `load_metadata_threads`               | Integer | `16`       | 起動時にキャッシュメタデータを読み込むスレッド数。                                                                                                                                            |

> **Note**: サイズ指定値は `ki`、`Mi`、`Gi` などの単位をサポートします（例: `10Gi`）。

## ファイルキャッシュのクエリ／プロファイル設定 \{#file-cache-query-profile-settings\}

| Setting                                                                 | Type    | Default                 | Description                                                                                                      |
| ----------------------------------------------------------------------- | ------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `enable_filesystem_cache`                                               | Boolean | `true`                  | `cache` ディスクタイプを使用している場合でも、クエリごとにキャッシュの使用を有効／無効にします。                                                             |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache`           | Boolean | `false`                 | 有効にすると、データが存在するときにのみキャッシュを使用します。新しいデータはキャッシュされません。                                                               |
| `enable_filesystem_cache_on_write_operations`                           | Boolean | `false` (Cloud: `true`) | ライトスルー型キャッシュを有効にします。キャッシュ構成で `cache_on_write_operations` を有効にする必要があります。                                          |
| `enable_filesystem_cache_log`                                           | Boolean | `false`                 | `system.filesystem_cache_log` への詳細なキャッシュ利用状況のログ出力を有効にします。                                                        |
| `filesystem_cache_allow_background_download`                            | Boolean | `true`                  | 部分的にダウンロードされたセグメントをバックグラウンドで完了させることを許可します。現在のクエリ／セッションではダウンロードをフォアグラウンドで行わせたい場合は無効にします。                          |
| `max_query_cache_size`                                                  | Size    | `false`                 | クエリごとの最大キャッシュサイズです。キャッシュ構成で `enable_filesystem_query_cache_limit` を有効にする必要があります。                                 |
| `filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit` | Boolean | `true`                  | `max_query_cache_size` に達したときの動作を制御します: <br />- `true`: 新しいデータのダウンロードを停止する <br />- `false`: 新しいデータのために古いデータを削除する |

:::warning
キャッシュ構成設定およびキャッシュ関連のクエリ設定は最新の ClickHouse バージョンに対応しています。
以前のバージョンでは一部がサポートされていない場合があります。
:::

#### キャッシュのシステムテーブル \{#cache-system-tables-file-cache\}

| Table Name                    | Description                | Requirements                               |
| ----------------------------- | -------------------------- | ------------------------------------------ |
| `system.filesystem_cache`     | ファイルシステムキャッシュの現在の状態を表示します。 | なし                                         |
| `system.filesystem_cache_log` | クエリごとの詳細なキャッシュ利用統計を提供します。  | `enable_filesystem_cache_log = true` が必要です |

#### キャッシュコマンド \{#cache-commands-file-cache\}

##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` \{#system-drop-filesystem-cache-on-cluster\}

このコマンドは `<cache_name>` が指定されていない場合にのみサポートされています。

##### `SHOW FILESYSTEM CACHES` \{#show-filesystem-caches\}

サーバー上で構成されているファイルシステムキャッシュの一覧を表示します。
（バージョン `22.8` 以下では、このコマンド名は `SHOW CACHES` です）

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'` \{#describe-filesystem-cache\}

特定のキャッシュについて、キャッシュ設定といくつかの基本的な統計情報を表示します。
キャッシュ名は `SHOW FILESYSTEM CACHES` コマンドから取得できます（バージョン `22.8` 以下では、コマンド名は `DESCRIBE CACHE` です）。

```sql title="Query"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="Response"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

| キャッシュ現在メトリクス              | キャッシュ非同期メトリクス          | キャッシュプロファイルイベント                                                                           |
| ------------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| `FilesystemCacheSize`     | `FilesystemCacheBytes` | `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes`               |
| `FilesystemCacheElements` | `FilesystemCacheFiles` | `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds` |
|                           |                        | `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`               |
|                           |                        | `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`             |

### 静的 Web ストレージの使用（読み取り専用） \{#web-storage\}

これは読み取り専用ディスクです。データは読み出されるだけで、一切変更されません。新しいテーブルは
`ATTACH TABLE` クエリ（以下の例を参照）を介してこのディスクにロードされます。ローカルディスクは
実際には使用されず、各 `SELECT` クエリは必要なデータを取得するために `http` リクエストを発行します。
テーブルデータを変更しようとするとすべて例外がスローされます。つまり、次の種類のクエリは許可されません:
[`CREATE TABLE`](/sql-reference/statements/create/table.md),
[`ALTER TABLE`](/sql-reference/statements/alter/index.md), [`RENAME TABLE`](/sql-reference/statements/rename#rename-table),
[`DETACH TABLE`](/sql-reference/statements/detach.md) および [`TRUNCATE TABLE`](/sql-reference/statements/truncate.md)。
Web ストレージは読み取り専用用途に使用できます。典型的な用途の例としては、サンプルデータのホスティングや、
データの移行があります。`clickhouse-static-files-uploader` というツールがあり、
指定したテーブル用のデータディレクトリを準備します
（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。
必要な各テーブルごとに、ファイルが格納されたディレクトリを 1 つ取得できます。これらのファイルを、
たとえば静的ファイルを配信する Web サーバーにアップロードできます。この準備が完了したら、
`DiskWeb` を介して任意の ClickHouse サーバーにこのテーブルをロードできます。

このサンプル設定では:

* ディスクのタイプは `web`
* データは `http://nginx:80/test1/` でホストされている
* ローカルストレージ上のキャッシュが使用される

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
Web データセットを日常的に使用しない想定であれば、ストレージはクエリ内で一時的に構成することもできます。[動的設定](#dynamic-configuration) を参照し、
設定ファイルの編集は省略できます。

[デモデータセット](https://github.com/ClickHouse/web-tables-demo) が GitHub 上でホストされています。独自のテーブルを Web ストレージ用に準備するには、ツール [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader) を使用してください。
:::

この `ATTACH TABLE` クエリでは、指定された `UUID` がデータのディレクトリ名と一致し、エンドポイントには GitHub の Raw コンテンツの URL を指定します。

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

すぐに試せるテストケースです。この設定を `config` に追加する必要があります：

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

次のクエリを実行します。

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

#### 必須パラメータ \{#static-web-storage-required-parameters\}

| パラメータ      | 説明                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| `type`     | `web`。それ以外の値の場合、ディスクは作成されません。                                              |
| `endpoint` | `path` 形式のエンドポイント URL。エンドポイント URL には、アップロードされたデータを保存するためのルートパスを含める必要があります。 |

#### オプションパラメータ \{#optional-parameters-web\}

| Parameter                           | Description                                                                  | Default Value   |
|-------------------------------------|------------------------------------------------------------------------------|-----------------|
| `min_bytes_for_seek`                | シーケンシャル読み取りではなくシーク操作を使用するための最小バイト数                           | `1` MB          |
| `remote_fs_read_backoff_threashold` | リモートディスクからデータを読み取ろうとする際に待機する最大時間                            | `10000` seconds |
| `remote_fs_read_backoff_max_tries`  | バックオフしながら読み取りを試行する最大回数                                         | `5`             |

クエリが例外 `DB:Exception Unreachable URL` で失敗する場合は、次の設定値の調整を試してください: [http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

アップロード用のファイルを取得するには次を実行します:
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path` はクエリ `SELECT data_paths FROM system.tables WHERE name = 'table_name'` で確認できます）。

`endpoint` 経由でファイルをロードする場合、ファイルは `<endpoint>/store/` パスに配置する必要がありますが、設定には `endpoint` のみを含める必要があります。

サーバー起動時にテーブルをロードする際、ディスクのロード時に URL に到達できない場合でも、すべてのエラーは捕捉されます。この場合にエラーが発生していた場合は、`DETACH TABLE table_name` -> `ATTACH TABLE table_name` によってテーブルを再ロード（再度利用可能に）できます。サーバー起動時にメタデータが正常にロードされていれば、テーブルは直ちに利用可能です。

単一の HTTP 読み取り中のリトライ回数の上限を制限するには、[http_max_single_read_retries](/operations/storing-data#web-storage) 設定を使用します。

### Zero-copy Replication（本番利用には未対応） \{#zero-copy\}

Zero-copy replication は、`S3` および `HDFS`（非サポート）のディスクで利用可能ですが、推奨されません。Zero-copy replication とは、データが複数マシン上のリモートに保存されており同期が必要な場合に、データ自体ではなくメタデータ（データパーツへのパス）のみをレプリケートすることを意味します。

:::note Zero-copy replication は本番利用には未対応です
Zero-copy replication は ClickHouse バージョン 22.8 以降ではデフォルトで無効化されています。この機能は本番環境での利用は推奨されません。
:::
