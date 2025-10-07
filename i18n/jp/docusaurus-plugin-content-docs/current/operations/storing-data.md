---
'description': 'Documentation for highlight-next-line'
'sidebar_label': 'データを保存するための外部ディスク'
'sidebar_position': 68
'slug': '/operations/storing-data'
'title': 'データを保存するための外部ディスク'
'doc_type': 'guide'
---

Data processed in ClickHouseは通常、ClickHouseサーバーが実行されているマシンのローカルファイルシステムに保存されます。これには大容量のディスクが必要で、コストがかかる場合があります。データをローカルに保存するのを避けるために、さまざまなストレージオプションがサポートされています：
1. [Amazon S3](https://aws.amazon.com/s3/) オブジェクトストレージ。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. サポートされていません：Hadoop分散ファイルシステム（[HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)）

<br/>

:::note 
ClickHouseは、ページに記載されている外部ストレージオプションとは異なる外部テーブルエンジンもサポートしています。それらは、一般的なファイル形式（Parquetなど）で保存されたデータを読み取ることを可能にします。このページでは、ClickHouse `MergeTree`ファミリまたは`Log`ファミリのテーブルのストレージ構成について説明しています。

1. `Amazon S3`ディスクに保存されたデータを操作するには、[S3](/engines/table-engines/integrations/s3.md)テーブルエンジンを使用します。
2. Azure Blob Storageに保存されたデータを操作するには、[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md)テーブルエンジンを使用します。
3. Hadoop分散ファイルシステム（サポートされていません）内のデータを操作するには、[HDFS](/engines/table-engines/integrations/hdfs.md)テーブルエンジンを使用します。
:::
## 外部ストレージの構成 {#configuring-external-storage}

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)と[`Log`](/engines/table-engines/log-family/log.md) 
ファミリのテーブルエンジンは、それぞれ`s3`、`azure_blob_storage`、`hdfs`（サポートされていません）のタイプのディスクを使用して`S3`、`AzureBlobStorage`、`HDFS`（サポートされていません）にデータを保存できます。

ディスク構成には以下が必要です：

1. `s3`、`azure_blob_storage`、`hdfs`（サポートされていません）、`local_blob_storage`、または`web`のいずれかに等しい`type`セクション。
2. 特定の外部ストレージタイプの構成。

24.1のclickhouseバージョンから、新しい構成オプションを使用することが可能になりました。
以下を指定する必要があります：

1. `object_storage`に等しい`type`
2. `s3`、`azure_blob_storage`（または`24.3`からは単に`azure`）、`hdfs`（サポートされていません）、`local_blob_storage`（または`24.3`からは単に`local`）、`web`のいずれかに等しい`object_storage_type`。

<br/>

オプションで`metadata_type`を指定することができます（デフォルトは`local`です）が、`plain`、`web`、および`24.4`からは`plain_rewritable`にも設定できます。
`plain`メタデータタイプの使用は、[plain storage section](/operations/storing-data#plain-storage)で説明されており、`web`メタデータタイプは`web`オブジェクトストレージタイプとのみ使用できます。`local`メタデータタイプはメタデータファイルをローカルに保存します（各メタデータファイルにはオブジェクトストレージ内のファイルへのマッピングとそれに関する追加のメタ情報が含まれます）。

例えば：

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

は以下の構成に等しいです（バージョン`24.1`から）：

```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

以下の構成：

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

バージョン24.1から、次のようにも見えることがあります：

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

すべての`MergeTree`テーブルのデフォルトオプションとして特定のストレージタイプを設定するには、構成ファイルに次のセクションを追加します：

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

特定のテーブルに対して特定のストレージポリシーを構成したい場合は、テーブル作成時に設定で定義できます：

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

`storage_policy`の代わりに`disk`を使用することもできます。この場合、構成ファイルに`storage_policy`セクションを持つ必要はなく、`disk`セクションだけで十分です。

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```
## 動的構成 {#dynamic-configuration}

定義済みのディスクを構成ファイルに指定せずにストレージ構成を指定する可能性もありますが、`CREATE`/`ATTACH`クエリの設定で構成できます。

次の例クエリは、上記の動的ディスク構成に基づいており、URLに保存されたテーブルからデータをキャッシュするためにローカルディスクを使用する方法を示します。

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

以下の例は、外部ストレージにキャッシュを追加します。

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

下の設定に注意してください。`type=web`のディスクは`type=cache`のディスクの中にネストされています。

:::note
例では`type=web`を使用していますが、ローカルディスクを含む任意のディスクタイプを動的に構成できます。ローカルディスクには、`custom_local_disks_base_directory`サーバー構成パラメータの内部に置くためにパス引数が必要です。これはデフォルトがないため、ローカルディスクを使用する場合はそれも設定してください。
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

ここで`web`はサーバー構成ファイルのものです：

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
#### 必要なパラメータ {#required-parameters-s3}

| パラメータ           | 説明                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `endpoint`          | `path`または`virtual hosted`スタイルのS3エンドポイントURL[styles](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)。バケットとデータストレージのルートパスを含める必要があります。 |
| `access_key_id`     | 認証に使用されるS3アクセスキーID。                                                                                                                                              |
| `secret_access_key` | 認証に使用されるS3シークレットアクセスキー。                                                                                                                                          |
#### オプションのパラメータ {#optional-parameters-s3}

| パラメータ                                       | 説明                                                                                                                                                                                                                                   | デフォルト値                            |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `region`                                        | S3リージョン名。                                                                                                                                                                                                                               | -                                        |
| `support_batch_delete`                          | バッチ削除のサポートを確認するかどうかを制御します。Google Cloud Storage（GCS）を使用する場合は、GCSはバッチ削除をサポートしていないため、`false`に設定します。                                                                                                | `true`                                   |
| `use_environment_credentials`                   | 環境変数からAWS資格情報を読み取ります：`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`が存在する場合。                                                                                                        | `false`                                  |
| `use_insecure_imds_request`                     | `true`の場合、Amazon EC2メタデータから資格情報を取得する際に不正secure IMDSリクエストを使用します。                                                                                                                                                    | `false`                                  |
| `expiration_window_seconds`                     | 有効期限ベースの資格情報が期限切れたかどうかを確認するための猶予期間（秒単位）。                                                                                                                                                          | `120`                                    |
| `proxy`                                         | S3エンドポイントのプロキシ構成。`proxy`ブロック内の各`uri`要素はプロキシURLを含む必要があります。                                                                                                                                      | -                                        |
| `connect_timeout_ms`                            | ミリ秒単位のソケット接続タイムアウト。                                                                                                                                                                                                       | `10000`（10秒）                     |
| `request_timeout_ms`                            | ミリ秒単位のリクエストタイムアウト。                                                                                                                                                                                                              | `5000`（5秒）                       |
| `retry_attempts`                                | 失敗したリクエストのための再試行回数。                                                                                                                                                                                                 | `10`                                     |
| `single_read_retries`                           | 読み取り中の接続の中断に対する再試行回数。                                                                                                                                                                                    | `4`                                      |
| `min_bytes_for_seek`                            | 逐次読み取りの代わりにシーク操作に使用する最小バイト数。                                                                                                                                                                     | `1 MB`                                   |
| `metadata_path`                                 | S3メタデータファイルを保存するためのローカルファイルシステムパス。                                                                                                                                                                                             | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | `true`の場合、起動時のディスクアクセスチェックをスキップします。                                                                                                                                                                                           | `false`                                  |
| `header`                                        | リクエストに指定されたHTTPヘッダーを追加します。複数回指定できます。                                                                                                                                                                      | -                                        |
| `server_side_encryption_customer_key_base64`    | SSE-C暗号化されたS3オブジェクトにアクセスするための必須ヘッダー。                                                                                                                                                                              | -                                        |
| `server_side_encryption_kms_key_id`             | [SSE-KMS暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)されたS3オブジェクトにアクセスするための必須ヘッダー。空の文字列はAWS管理のS3キーを使用します。                                                     | -                                        |
| `server_side_encryption_kms_encryption_context` | SSE-KMS用の暗号化コンテキストヘッダー（`server_side_encryption_kms_key_id`と共に使用）。                                                                                                                                                        | -                                        |
| `server_side_encryption_kms_bucket_key_enabled` | SSE-KMS用のS3バケットキーを有効にします（`server_side_encryption_kms_key_id`と共に使用）。                                                                                                                                                           | バケットレベル設定に一致              |
| `s3_max_put_rps`                                | スロットリングを行う前の最大PUTリクエスト数/秒。                                                                                                                                                                                            | `0`（無制限）                          |
| `s3_max_put_burst`                              | RPS制限に達する前の最大同時PUTリクエスト数。                                                                                                                                                                                     | `s3_max_put_rps`と同じ                 |
| `s3_max_get_rps`                                | スロットリングを行う前の最大GETリクエスト数/秒。                                                                                                                                                                                            | `0`（無制限）                          |
| `s3_max_get_burst`                              | RPS制限に達する前の最大同時GETリクエスト数。                                                                                                                                                                                     | `s3_max_get_rps`と同じ                 |
| `read_resource`                                 | [スケジューリング](/operations/workload-scheduling.md)に関する読み取りリクエストのリソース名。                                                                                                                                                             | 空の文字列（無効）                  |
| `write_resource`                                | [スケジューリング](/operations/workload-scheduling.md)に関する書き込みリクエストのリソース名。                                                                                                                                                            | 空の文字列（無効）                  |
| `key_template`                                  | [re2](https://github.com/google/re2/wiki/Syntax)構文を使用してオブジェクトキー生成形式を定義します。`storage_metadata_write_full_object_key`フラグが必要です。`endpoint`の`root path`とは互換性がありません。`key_compatibility_prefix`が必要です。 | -                                        |
| `key_compatibility_prefix`                      | `key_template`と共に必要です。古いメタデータバージョンを読み取るための`endpoint`の以前の`root path`を指定します。                                                                                                                         | -                                        |
| `read_only`                                      | ディスクからの読み取りのみを許可します。                                                                                                                                                                                                          | -                                        |
:::note
Google Cloud Storage（GCS）も`type s3`を使用してサポートされています。詳しくは、[GCSバックエンドMergeTree](/integrations/gcs)をご覧ください。
:::
### プレインストレージの使用 {#plain-storage}

`22.10`では、書き込み専用ストレージを提供する新しいディスクタイプ`s3_plain`が導入されました。
その構成パラメータは`s3`ディスクタイプと同じです。
`s3`ディスクタイプとは異なり、データはそのまま保存されます。言い換えれば、
ランダムに生成されたblob名の代わりに通常のファイル名を使用し
（ClickHouseがローカルディスクにファイルを保存するのと同じ方法）、ローカルにメタデータを保存しません。例えば、これは`s3`のデータから派生しています。

このディスクタイプを使用することで、静的なテーブルのバージョンを保持することができ、既存のデータに対してマージを実行することや新しいデータの挿入を許可しません。このディスクタイプの使用例は、`BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')`を介してバックアップを作成することです。その後、`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`を行うことができます。または、`ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`を使用することもできます。

構成：

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1`以降、`plain`メタデータタイプを使用して任意のオブジェクトストレージディスク（`s3`、`azure`、`hdfs`（サポートされていません）、`local`）を構成することが可能です。

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
### S3プレイン書き換え可能ストレージの使用 {#s3-plain-rewritable-storage}

新しいディスクタイプ`s3_plain_rewritable`が`24.4`に導入されました。
`s3_plain`ディスクタイプと同様に、メタデータファイルのための追加のストレージは必要ありません。代わりに、メタデータはS3に保存されます。
`s3_plain`ディスクタイプとは異なり、`s3_plain_rewritable`はマージの実行を許可し、`INSERT`操作をサポートします。
[Mutations](/sql-reference/statements/alter#mutations)とテーブルのレプリケーションはサポートされていません。

このディスクタイプの使用例は、非レプリケートの`MergeTree`テーブルです。`s3`ディスクタイプは非レプリケートの`MergeTree`テーブルに適していますが、テーブルのローカルメタデータが不要で、限定された操作セットを受け入れることができるのであれば、`s3_plain_rewritable`ディスクタイプを選択することができます。たとえば、システムテーブルに便利かもしれません。

構成：

```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

は次のように等しいです

```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

`24.5`以降、任意のオブジェクトストレージディスク（`s3`、`azure`、`local`）を`plain_rewritable`メタデータタイプを使用して構成することが可能です。
### Azure Blob Storageの使用 {#azure-blob-storage}

`MergeTree`ファミリのテーブルエンジンは、`azure_blob_storage`タイプのディスクを使用して[Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)にデータを保存できます。

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
#### 接続パラメータ {#azure-blob-storage-connection-parameters}

| パラメータ                        | 説明                                                                                                                                                                                      | デフォルト値       |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `storage_account_url` (必須) | Azure Blob StorageアカウントURL。例：`http://account.blob.core.windows.net` または `http://azurite1:10000/devstoreaccount1`。                                                                    | -                   |
| `container_name`                 | 目標のコンテナ名。                                                                                                                                                                           | `default-container` |
| `container_already_exists`       | コンテナの作成動作を制御します：<br/>- `false`：新しいコンテナを作成<br/>- `true`：既存のコンテナに直接接続<br/>- unset：コンテナの存在を確認し、必要に応じて作成 | -                   |

認証パラメータ（ディスクはすべての利用可能な方法 **と** マネージドアイデンティティ資格情報を試みます）：

| パラメータ           | 説明                                                     |
|---------------------|-----------------------------------------------------------------|
| `connection_string` | 接続文字列を使用した認証用。                   |
| `account_name`      | 共有キーを使用した認証のためのアカウント名（`account_key`と共に使用）。  |
| `account_key`       | 共有キーを使用した認証のためのアカウントキー（`account_name`と共に使用）。 |
#### 制限パラメータ {#azure-blob-storage-limit-parameters}

| パラメータ                            | 説明                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| `s3_max_single_part_upload_size`     | Blobストレージへのシングルブロックアップロードの最大サイズ。                      |
| `min_bytes_for_seek`                 | シーク可能領域の最小サイズ。                                          |
| `max_single_read_retries`            | Blobストレージからデータチャンクを読み取るための最大試行回数。       |
| `max_single_download_retries`        | Blobストレージから読み取り可能なバッファをダウンロードするための最大試行回数。 |
| `thread_pool_size`                   | `IDiskRemote`インスタンス化のための最大スレッド数。                  |
| `s3_max_inflight_parts_for_one_file` | シングルオブジェクトの最大同時PUTリクエスト数。              |
#### その他のパラメータ {#azure-blob-storage-other-parameters}

| パラメータ                        | 説明                                                                        | デフォルト値                            |
|----------------------------------|------------------------------------------------------------------------------------|------------------------------------------|
| `metadata_path`                  | Blobストレージのメタデータファイルを保存するためのローカルファイルシステムパス。                    | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`              | `true`の場合、起動時のディスクアクセスチェックをスキップします。                                | `false`                                  |
| `read_resource`                  | [スケジューリング](/operations/workload-scheduling.md)における読み取りリクエストのリソース名。  | 空の文字列（無効）                  |
| `write_resource`                 | [スケジューリング](/operations/workload-scheduling.md)における書き込みリクエストのリソース名。 | 空の文字列（無効）                  |
| `metadata_keep_free_space_bytes` | 予備のメタデータディスクスペースの量。                                     | -                                        |

作業する構成の例については、統合テストディレクトリにあります（例：[test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml)または[test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)）。

:::note ゼロコピー複製は本番環境には未準備です
ゼロコピー複製は、ClickHouseバージョン22.8以降、デフォルトで無効になっています。この機能は本番使用には推奨されません。
:::
## HDFSストレージの使用（サポートされていません） {#using-hdfs-storage-unsupported}

このサンプル構成では：
- ディスクのタイプは`hdfs`（サポートされていません）
- データは`hdfs://hdfs1:9000/clickhouse/`にホストされています。

ちなみに、HDFSはサポートされていないため、使用中に問題が発生する可能性があります。問題が発生した場合は、修正を行うためにプルリクエストを自由に提出してください。

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

HDFSは隅々で正常に動作しない可能性があることに注意してください。
### データ暗号化の使用 {#encrypted-virtual-file-system}

[S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)や[HDFS](#using-hdfs-storage-unsupported)（サポートされていません）の外部ディスク、またはローカルディスクに保存されたデータを暗号化することができます。暗号化モードをオンにするには、構成ファイルで`encrypted`タイプのディスクを定義し、データが保存されるディスクを選択する必要があります。`encrypted`ディスクは、書き込まれたすべてのファイルを自動で暗号化し、`encrypted`ディスクからファイルを読み取ると自動的に復号化されます。そのため、通常のディスクと同様に`encrypted`ディスクで作業ができます。

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

例えば、ClickHouseがあるテーブルからデータを`store/all_1_1_0/data.bin`ファイルに`disk1`に書き込むと、実際にはこのファイルは物理ディスクのパス`/path1/store/all_1_1_0/data.bin`に書き込まれます。

同じファイルを`disk2`に書き込むと、実際には暗号化モードで物理ディスクのパス`/path1/path2/store/all_1_1_0/data.bin`に書き込まれます。
### 必要なパラメータ {#required-parameters-encrypted-disk}

| パラメータ  | タイプ   | 説明                                                                                                                                  |
|------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `type`     | 文字列 | 暗号化ディスクを作成するには`encrypted`に設定する必要があります。                                                                                      |
| `disk`     | 文字列 | 基礎となるストレージに使用するディスクのタイプ。                                                                                                  |
| `key`      | Uint64 | 暗号化と復号化のためのキー。`key_hex`を使用して16進数で指定できます。複数のキーは`id`属性を使用して指定できます。 |
### オプションのパラメータ {#optional-parameters-encrypted-disk}

| パラメータ        | タイプ   | デフォルト        | 説明                                                                                                                             |
|------------------|--------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `path`           | 文字列 | ルートディレクトリ | データが保存されるディスク上の場所。                                                                                          |
| `current_key_id` | 文字列 | -              | 暗号化に使用されるキーID。指定されたすべてのキーは復号化に使用できます。                                                          |
| `algorithm`      | 列挙   | `AES_128_CTR`  | 暗号化アルゴリズム。オプション：<br/>- `AES_128_CTR`（16バイトキー） <br/>- `AES_192_CTR`（24バイトキー） <br/>- `AES_256_CTR`（32バイトキー） | 

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

バージョン22.3以降、ストレージ構成においてディスク上のローカルキャッシュを設定することが可能です。バージョン22.3から22.7においては、`s3`ディスクタイプのみでキャッシュがサポートされています。バージョン22.8以降は、S3、Azure、ローカル、暗号化など、任意のディスクタイプでキャッシュがサポートされています。バージョン23.5以降は、リモートディスクタイプ（S3、Azure、HDFS（未サポート））にのみキャッシュがサポートされています。キャッシュは`LRU`キャッシュポリシーを使用します。

バージョン22.8以降の構成例：

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

バージョン22.8以前の構成例：

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

ファイルキャッシュ **ディスク構成設定**：

これらの設定は、ディスク構成セクションで定義する必要があります。

| パラメーター                             | 型      | デフォルト    | 説明                                                                                                                                                                                    |
|------------------------------------------|---------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                                   | 文字列  | -            | **必須**。キャッシュが保存されるディレクトリへのパス。                                                                                                                                  |
| `max_size`                               | サイズ  | -            | **必須**。バイトまたは読み取り可能な形式（例：`10Gi`）での最大キャッシュサイズ。制限に達した場合、LRUポリシーを使用してファイルが追放されます。`ki`、`Mi`、`Gi`フォーマットをサポートします（v22.10以降）。               |
| `cache_on_write_operations`              | ブール値 | `false`      | `INSERT`クエリおよびバックグラウンドマージ用の書き込みスルーキャッシュを有効にします。クエリごとに`enable_filesystem_cache_on_write_operations`で上書きできます。                                              |
| `enable_filesystem_query_cache_limit`    | ブール値 | `false`      | `max_query_cache_size`に基づいたクエリごとのキャッシュサイズ制限を有効にします。                                                                                                        |
| `enable_cache_hits_threshold`            | ブール値 | `false`      | 有効にすると、データが何度も読み込まれてからキャッシュされます。                                                                                                                                  |
| `cache_hits_threshold`                   | 整数値   | `0`          | データがキャッシュされる前に必要な読み取り回数（`enable_cache_hits_threshold`が必要）。                                                                                                  |
| `enable_bypass_cache_with_threshold`     | ブール値 | `false`      | 大きな読み取り範囲のためにキャッシュをスキップします。                                                                                                                                   |
| `bypass_cache_threshold`                 | サイズ   | `256Mi`      | キャッシュバイパスを引き起こす読み取り範囲のサイズ（`enable_bypass_cache_with_threshold`が必要）。                                                                                       |
| `max_file_segment_size`                  | サイズ   | `8Mi`        | バイトまたは読み取り可能な形式での単一キャッシュファイルの最大サイズ。                                                                                                                        |
| `max_elements`                           | 整数値   | `10000000`   | 最大キャッシュファイル数。                                                                                                                                                               |
| `load_metadata_threads`                  | 整数値   | `16`         | 起動時にキャッシュメタデータを読み込むためのスレッド数。                                                                                                                                       |

> **注意**: サイズ値は`ki`、`Mi`、`Gi`などの単位をサポートします（例：`10Gi`）。
## ファイルキャッシュ クエリ/プロファイル設定 {#file-cache-query-profile-settings}

| 設定                                                         | 型      | デフォルト                 | 説明                                                                                                                                                    |
|-------------------------------------------------------------|---------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enable_filesystem_cache`                                   | ブール値 | `true`                    | クエリごとのキャッシュ利用を有効/無効にします。`cache`ディスクタイプを使用している場合でも有効です。                                                                                                     |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` | ブール値 | `false`                   | 有効にすると、データが存在する場合にのみキャッシュを使用します。新しいデータはキャッシュされません。                                                                                                       |
| `enable_filesystem_cache_on_write_operations`               | ブール値 | `false` (Cloud: `true`)   | 書き込みスルーキャッシュを有効にします。キャッシュ構成で`cache_on_write_operations`が必要です。                                                                                            |
| `enable_filesystem_cache_log`                               | ブール値 | `false`                   | `system.filesystem_cache_log`への詳細なキャッシュ使用ロギングを有効にします。                                                                                                                         |
| `max_query_cache_size`                                     | サイズ   | `false`                   | クエリごとの最大キャッシュサイズ。キャッシュ構成で`enable_filesystem_query_cache_limit`が必要です。                                                                                                        |
| `skip_download_if_exceeds_query_cache`                     | ブール値 | `true`                    | `max_query_cache_size`に達したときの挙動を制御します： <br/>- `true`: 新しいデータのダウンロードを停止 <br/>- `false`: 新しいデータのために古いデータを追放します。                          |

:::warning
キャッシュ構成設定とキャッシュクエリ設定は、最新のClickHouseバージョンに対応しており、以前のバージョンではサポートされていないものがあります。
:::
#### キャッシュシステムテーブル {#cache-system-tables-file-cache}

| テーブル名                  | 説明                                                   | 要件                                           |
|-----------------------------|-------------------------------------------------------|------------------------------------------------|
| `system.filesystem_cache`   | ファイルシステムキャッシュの現在の状態を表示します。   | なし                                           |
| `system.filesystem_cache_log` | クエリごとの詳細なキャッシュ使用統計を提供します。   | `enable_filesystem_cache_log = true`が必要です。|
#### キャッシュコマンド {#cache-commands-file-cache}
##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` {#system-drop-filesystem-cache-on-cluster}

このコマンドは、`<cache_name>`が提供されていない場合にのみサポートされています。
##### `SHOW FILESYSTEM CACHES` {#show-filesystem-caches}

サーバーに構成されたファイルシステムキャッシュのリストを表示します。 
（バージョン22.8以下では、このコマンドは`SHOW CACHES`と呼ばれています。）

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```
##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'` {#describe-filesystem-cache}

特定のキャッシュのキャッシュ構成といくつかの一般的な統計を表示します。 
キャッシュ名は`SHOW FILESYSTEM CACHES`コマンドから取得できます。（バージョン22.8以下では、このコマンドは`DESCRIBE CACHE`と呼ばれています。）

```sql title="Query"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="Response"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

| キャッシュの現在のメトリクス    | キャッシュの非同期メトリクス         | キャッシュプロファイルイベント                                                                |
|-----------------------------|--------------------------|-----------------------------------------------------------------------------------------------|
| `FilesystemCacheSize`      | `FilesystemCacheBytes`   | `CachedReadBufferReadFromSourceBytes`、`CachedReadBufferReadFromCacheBytes`                   |
| `FilesystemCacheElements`   | `FilesystemCacheFiles`   | `CachedReadBufferReadFromSourceMicroseconds`、`CachedReadBufferReadFromCacheMicroseconds`       |
|                             |                          | `CachedReadBufferCacheWriteBytes`、`CachedReadBufferCacheWriteMicroseconds`                    |
|                             |                          | `CachedWriteBufferCacheWriteBytes`、`CachedWriteBufferCacheWriteMicroseconds`                  |
### 静的Webストレージの使用（読み取り専用） {#web-storage}

これは読み取り専用のディスクです。そのデータは読み取られるだけで、決して変更されることはありません。新しいテーブルは`ATTACH TABLE`クエリを介してこのディスクにロードされます（以下の例を参照）。実際にはローカルディスクは使用されず、各`SELECT`クエリは、必要なデータを取得するための`http`リクエストを生成します。テーブルデータのすべての変更は例外が発生し、次のタイプのクエリは許可されません：[`CREATE TABLE`](/sql-reference/statements/create/table.md)、[`ALTER TABLE`](/sql-reference/statements/alter/index.md)、[`RENAME TABLE`](/sql-reference/statements/rename#rename-table)、[`DETACH TABLE`](/sql-reference/statements/detach.md)および[`TRUNCATE TABLE`](/sql-reference/statements/truncate.md)。Webストレージは読み取り専用目的で使用できます。サンプルデータをホスティングするためや、データを移行するための使用例があります。ツール`clickhouse-static-files-uploader`は、特定のテーブルのデータディレクトリを準備します（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。必要なテーブルごとにファイルのディレクトリを取得します。これらのファイルは、例えば、静的ファイルを持つWebサーバーにアップロードできます。この準備が完了したら、このテーブルを任意のClickHouseサーバーに`DiskWeb`を介してロードできます。

このサンプル構成では：
- ディスクのタイプは`web`です。
- データは`http://nginx:80/test1/`でホストされています。
- ローカルストレージにキャッシュが使用されています。

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
ストレージはクエリ内で一時的に構成することもできます。ウェブデータセットが定期的に使用されることが期待されない場合、[動的構成](#dynamic-configuration)を参照し、構成ファイルの編集をスキップします。

サンプルデータセットは[GitHub](https://github.com/ClickHouse/web-tables-demo)にホストされています。ウェブストレージに自身のテーブルを準備するには、ツール[clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)を参照してください。
:::

この`ATTACH TABLE`クエリでは、提供された`UUID`がデータのディレクトリ名と一致し、エンドポイントはGitHubの生のコンテンツのURLです。

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

準備されたテストケースです。この構成をconfigに追加する必要があります：

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

その後、このクエリを実行します：

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
#### 必須パラメーター {#static-web-storage-required-parameters}

| パラメーター  | 説明                                                                                                                  |
|---------------|---------------------------------------------------------------------------------------------------------------------|
| `type`        | `web`。そうでない場合、ディスクは作成されません。                                                                       |
| `endpoint`    | `path`形式のエンドポイントURL。エンドポイントURLはデータを保存するルートパスを含む必要があります。                             |
#### オプションのパラメーター {#optional-parameters-web}

| パラメーター                           | 説明                                                                  | デフォルト値   |
|---------------------------------------|----------------------------------------------------------------------|-----------------|
| `min_bytes_for_seek`                  | シーケンシャルリードではなくシーク操作を使用するための最小バイト数           | `1` MB          |
| `remote_fs_read_backoff_threashold`   | リモートディスクのデータを読む際の最大待機時間                             | `10000` 秒     |
| `remote_fs_read_backoff_max_tries`     | バックオフを伴ったリードを行う最大試行回数                               | `5`             |

クエリが`DB:Exception Unreachable URL`という例外で失敗した場合、設定を調整することを検討してください：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

アップロード用のファイルを取得するには、次のコマンドを実行します：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>` （`--metadata-path`はクエリ`SELECT data_paths FROM system.tables WHERE name = 'table_name'`にあります）。

`endpoint`からファイルを読み込む場合、それらは`<endpoint>/store/`パスに読み込む必要がありますが、構成には`endpoint`のみを含める必要があります。

サーバーがテーブルを起動時に読み込んでいるときにURLがディスクロードできない場合、すべてのエラーがキャッチされます。この場合、エラーがあった場合はテーブルを再ロード（表示可能になる）するには`DETACH TABLE table_name` -> `ATTACH TABLE table_name`を実行します。メタデータがサーバーの起動時に正常に読み込まれた場合、テーブルはすぐに利用可能です。

単一のHTTP読み込み中の最大再試行回数を制限するには、設定[http_max_single_read_retries](/operations/storing-data#web-storage)を使用します。
### ゼロコピー複製（生産用には準備が整っていない） {#zero-copy}

ゼロコピー複製は可能ですが、推奨されません。`S3`および`HDFS`（未サポート）ディスクでのゼロコピー複製は、リモートに保存されたデータを複数のマシン間で同期する必要がある場合、メタデータ（データパーツへのパス）のみが複製され、データ自体は複製されません。

:::note ゼロコピー複製は生産用には準備が整っていない
ゼロコピー複製は、ClickHouseバージョン22.8以降でデフォルトで無効になっています。この機能は生産用の使用には推奨されません。
:::
