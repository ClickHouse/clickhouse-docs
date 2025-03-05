---
slug: /operations/storing-data
sidebar_position: 68
sidebar_label: "データを保存するための外部ディスク"
title: "データを保存するための外部ディスク"
---

ClickHouseで処理されたデータは、通常、ClickHouseサーバーと同じマシンのローカルファイルシステムに保存されます。これには大容量のディスクが必要であり、コストがかなり高くなる可能性があります。そのため、データをリモートで保存することができます。サポートされているさまざまなストレージがあります：
1. [Amazon S3](https://aws.amazon.com/s3/) オブジェクトストレージ。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. サポートされていない: Hadoop分散ファイルシステム ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

:::note ClickHouseは、外部ストレージオプションとは異なる外部テーブルエンジンもサポートしています。これらは、一般的なファイル形式（例えばParquet）で保存されたデータの読み込みを可能にしますが、このページでは、ClickHouseの `MergeTree` 系または `Log` 系テーブルのストレージ構成について説明しています。
1. `Amazon S3`ディスクに保存されたデータで作業するには、[S3](/engines/table-engines/integrations/s3.md) テーブルエンジンを使用します。
2. Azure Blob Storageに保存されたデータで作業するには、[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) テーブルエンジンを使用します。
3. サポートされていない: Hadoop分散ファイルシステムでデータを操作するためには、[HDFS](/engines/table-engines/integrations/hdfs.md) テーブルエンジンを使用します。
:::
## 外部ストレージの構成 {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) および [Log](/engines/table-engines/log-family/log.md) 系テーブルエンジンは、ディスクタイプ `s3`、 `azure_blob_storage`、 `hdfs`（未サポート）を使用して、データを `S3`、 `AzureBlobStorage`、 `HDFS`（未サポート）に保存することができます。

ディスク構成には以下が必要です：
1. `type` セクションに `s3`、 `azure_blob_storage`、 `hdfs`（未サポート）、 `local_blob_storage`、 `web` のいずれかを設定します。
2. 特定の外部ストレージタイプの構成。

24.1以降のclickhouseバージョンでは、新しい構成オプションを使用できるようになりました。
設定が必要です：
1. `type`に `object_storage` を設定します。
2. `object_storage_type`に `s3`、 `azure_blob_storage`（または `24.3` からは `azure`）、 `hdfs`（未サポート）、 `local_blob_storage`（または `24.3` からは `local`）、 `web` のいずれかを設定します。
オプションとして、`metadata_type`を指定できます（デフォルトは `local` です）。また、 `plain`、 `web`、 `24.4` からは `plain_rewritable` にも設定できます。
`plain` メタデータタイプの使用は [plain storage section](/operations/storing-data.md/#storing-data-on-webserver) に記載されています。`web` メタデータタイプは `web` オブジェクトストレージタイプでのみ使用できます。`local` メタデータタイプはメタデータファイルをローカルに保存します（各メタデータファイルにはオブジェクトストレージ内のファイルへのマッピングとそれに関する追加のメタ情報が含まれます）。

例えば、構成オプション
``` xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

は（`24.1`からの構成に等しい）：
``` xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

構成
``` xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

は
``` xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

完全なストレージ構成の例は次のようになります：
``` xml
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

24.1以降のclickhouseバージョンでは、次のようにも表示できます：
``` xml
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

特定の種類のストレージをすべての `MergeTree` テーブルのデフォルトオプションにするには、構成ファイルに次のセクションを追加します：
``` xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

特定のテーブルだけに特定のストレージポリシーを構成したい場合、テーブルを作成する際に設定で定義できます：

``` sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

`storage_policy` の代わりに `disk` を使用することもできます。この場合、構成ファイルに `storage_policy` セクションを持つ必要はなく、`disk` セクションだけで済みます。

``` sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```
## 動的構成 {#dynamic-configuration}

事前定義されたディスクなしでストレージ構成を指定することも可能で、構成ファイルではなく `CREATE`/`ATTACH` クエリの設定で構成できます。

次の例は、上記の動的ディスク構成を基にしており、URLで保存されたテーブルからデータをキャッシュするためにローカルディスクを使用する方法を示しています。

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
  # highlight-start
  SETTINGS disk = disk(
    type=web,
    endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
  );
  # highlight-end
```

次の例では、外部ストレージにキャッシュを追加します。

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
  # highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
  # highlight-end
```

以下の設定では、`type=web` のディスクが `type=cache` のディスクの内側にネストされています。

:::note
この例では `type=web` を使用していますが、任意のディスクタイプを動的として構成できます。ローカルディスクを使用する場合、ローカルディスクは `custom_local_disks_base_directory` サーバー設定パラメータ内にある必要があり、デフォルトはありませんので、ローカルディスクを使用する場合は、それも設定してください。
:::

構成ベースの設定とSQLで定義された設定を組み合わせることも可能です：

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
  # highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
  # highlight-end
```

ここで、`web` はサーバー設定ファイルからのものです：

``` xml
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

必要なパラメータ：

- `endpoint` — S3エンドポイントURL（`path`または`virtual hosted` [styles](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)）。エンドポイントURLには、バケットとデータを保存するためのルートパスを含める必要があります。
- `access_key_id` — S3アクセスキーID。
- `secret_access_key` — S3秘密アクセスキー。

オプションのパラメータ：

- `region` — S3リージョン名。
- `support_batch_delete` — バッチ削除がサポートされているかどうかを確認。この設定を `false` にすると、Google Cloud Storage（GCS）を使用する際、GCSはバッチ削除をサポートしていないため、エラーメッセージを防止できます。
- `use_environment_credentials` — 環境変数 AWS_ACCESS_KEY_ID および AWS_SECRET_ACCESS_KEY から AWS資格情報を読み取ります。AWS_SESSION_TOKENが存在する場合はそれも読み取ります。デフォルトの値は `false` です。
- `use_insecure_imds_request` — `true` に設定すると、S3クライアントはAmazon EC2メタデータから資格情報を取得する際に非安全なIMDSリクエストを使用します。デフォルトの値は `false` です。
- `expiration_window_seconds` — 有効期限ベースの資格情報が期限切れかどうかを確認するための猶予期間。オプションでデフォルト値は `120` です。
- `proxy` — S3エンドポイントのプロキシ構成。 `proxy` ブロック内の各 `uri` 要素は、プロキシURLを含む必要があります。
- `connect_timeout_ms` — ソケット接続のタイムアウト（ミリ秒）。デフォルト値は `10 seconds` です。
- `request_timeout_ms` — リクエストのタイムアウト（ミリ秒）。デフォルト値は `5 seconds` です。
- `retry_attempts` — リクエストが失敗した場合の再試行回数。デフォルト値は `10` です。
- `single_read_retries` — 読み取り中の接続ドロップ時の再試行回数。デフォルト値は `4` です。
- `min_bytes_for_seek` — シーク操作をシーケンシャル読み取りの代わりに使用するための最小バイト数。デフォルト値は `1 Mb` です。
- `metadata_path` — S3のメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は `/var/lib/clickhouse/disks/<disk_name>/` です。
- `skip_access_check` — `true` の場合、ディスクスタートアップ時にディスクアクセス検査は行われません。デフォルト値は `false` です。
- `header` — 指定されたHTTPヘッダーを指定されたエンドポイントへのリクエストに追加します。オプションとして、複数回指定できます。
- `server_side_encryption_customer_key_base64` — 指定された場合、SSE-C暗号化を使用してS3オブジェクトにアクセスするために必要なヘッダーが設定されます。
- `server_side_encryption_kms_key_id` - 指定された場合、[SSE-KMS暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)を使用してS3オブジェクトにアクセスするために必要なヘッダーが設定されます。空の文字列が指定された場合、AWSが管理するS3キーが使用されます。オプションです。
- `server_side_encryption_kms_encryption_context` - `server_side_encryption_kms_key_id` と共に指定された場合、SSE-KMS用の与えられた暗号化コンテキストヘッダーが設定されます。オプションです。
- `server_side_encryption_kms_bucket_key_enabled` - `server_side_encryption_kms_key_id` との併用が指定された場合、SSE-KMSのためのS3バケットキーを有効にするヘッダーが設定されます。オプションで、`true` または `false` に設定できます。デフォルト値は何も設定されていません（バケットレベルの設定に一致します）。
- `s3_max_put_rps` — スロットリング前の最大PUTリクエスト/秒のレート。デフォルト値は `0`（無制限）です。
- `s3_max_put_burst` — リクエスト/秒制限に達するまでに同時に発行できるリクエストの最大数。デフォルト値（`0`）は `s3_max_put_rps` と等しいです。
- `s3_max_get_rps` — スロットリング前の最大GETリクエスト/秒のレート。デフォルト値は `0`（無制限）です。
- `s3_max_get_burst` — リクエスト/秒制限に達するまでに同時に発行できるリクエストの最大数。デフォルト値（`0`）は `s3_max_get_rps` と等しいです。
- `read_resource` — 読み取りリクエストの [スケジューリング](/operations/workload-scheduling.md)に使用されるリソース名。デフォルト値は空文字列です（このディスクではIOスケジューリングは有効ではありません）。
- `write_resource` — 書き込みリクエストの [スケジューリング](/operations/workload-scheduling.md)に使用されるリソース名。デフォルト値は空文字列です（このディスクではIOスケジューリングは有効ではありません）。
- `key_template` — オブジェクトキーが生成されるフォーマットを定義します。デフォルトでは、Clickhouseは `endpoint` オプションから `root path` を取得し、ランダムに生成されたサフィックスを追加します。そのサフィックスは3つのランダムシンボルを持つディレクトリおよび29のランダムシンボルを持つファイル名です。このオプションでは、オブジェクトキーの生成方法を完全に制御できます。いくつかの使用シナリオでは、オブジェクトキーの接頭辞や中にランダムなシンボルを持つことが必要です。例えば：`[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}`のように。値は [`re2`](https://github.com/google/re2/wiki/Syntax) で解析されます。サポートされている構文のサブセットのみがサポートされています。どのようなフォーマットがサポートされているかを確認してからこのオプションを使用してください。`key_template` の値によってキーを生成できない場合、ディスクは初期化されません。`storage_metadata_write_full_object_key` フィーチャーフラグを有効にする必要があります。`endpoint` オプションで `root path` を宣言することは禁止されます。オプション `key_compatibility_prefix` を定義する必要があります。
- `key_compatibility_prefix` — `key_template` オプションを使用する場合に必要なオプションです。メタデータファイルに保存されたオブジェクトキーを読み取るためには、`VERSION_FULL_OBJECT_KEY` よりも低いメタデータバージョンのオブジェクトキーがここに設定される必要があります。

:::note
Google Cloud Storage（GCS）も、`s3` タイプを使用してサポートされています。 [GCS backed MergeTree](/integrations/gcs).
:::
### プレーンストレージの使用 {#plain-storage}

`22.10` では新しいディスクタイプ `s3_plain` が導入され、書き込み専用ストレージを提供します。構成パラメータは `s3` ディスクタイプと同じです。
`s3` ディスクタイプとは異なり、ランダム生成されたバイナリ名の代わりに、通常のファイル名を使用します（ClickHouseがローカルディスクにファイルを保存するのと同様）し、ローカルにメタデータを保存しません。データは `s3` から派生します。

このディスクタイプでは、既存のデータに対するマージを実行できず、新しいデータの挿入もできないため、テーブルの静的バージョンを保持できます。
このディスクタイプの使用例は、`BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` を使用してバックアップを作成することです。その後、`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')` または `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'` を使用します。

構成：
``` xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1` 以降、任意のオブジェクトストレージディスク（ `s3`、 `azure`、 `hdfs` (未サポート)、 `local`）を `plain` メタデータタイプを使用して構成できます。

構成：
``` xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>azure</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```
### S3プレーン書き換え可能ストレージの使用 {#s3-plain-rewritable-storage}
新しいディスクタイプ `s3_plain_rewritable` が `24.4` で導入されました。
`s3_plain` ディスクタイプに類似しており、メタデータファイルの追加ストレージは不要で、代わりにS3にメタデータが保存されます。
`s3_plain` ディスクタイプとは異なり、 `s3_plain_rewritable` ではマージを実行でき、新しいデータをINSERTすることができます。
[Mutations](/sql-reference/statements/alter#mutations) とテーブルのレプリケーションはサポートされていません。

このディスクタイプの使用例は、非レプリケートの `MergeTree` テーブルです。 `s3` ディスクタイプは非レプリケートのMergeTreeテーブルに適していますが、テーブルにローカルメタデータが不要で、限られた操作セットを受け入れる準備ができている場合は、 `s3_plain_rewritable` ディスクタイプを選択できます。これは、例えばシステムテーブルには便利です。

構成：
``` xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

は次のように等しいです：
``` xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

`24.5` 以降、任意のオブジェクトストレージディスク（ `s3`、 `azure`、 `local`）を `plain_rewritable` メタデータタイプを使用して構成できます。
### Azure Blob Storageの使用 {#azure-blob-storage}

`MergeTree` 系テーブルエンジンは、ディスクタイプ `azure_blob_storage` を使用して、[Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) にデータを保存できます。

構成マークアップ：
``` xml
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
* `storage_account_url` - **必須**、Azure Blob StorageアカウントURL、例えば `http://account.blob.core.windows.net` あるいは `http://azurite1:10000/devstoreaccount1`。
* `container_name` - 対象コンテナ名、デフォルトは `default-container`。
* `container_already_exists` - `false` に設定すると、ストレージアカウントに新しいコンテナ `container_name` が作成されます。`true` に設定すると、ディスクはコンテナに直接接続され、未設定のままでは、ディスクはアカウントに接続し、`container_name` が存在するか確認し、存在しない場合は作成します。

認証パラメータ（ディスクは利用可能なすべての方法 **および** マネージドアイデンティティ資格情報を試みます）：
* `connection_string` - 文字列接続を使用して認証します。
* `account_name` と `account_key` - 共有キーを使用して認証します。

制限パラメータ（主に内部使用）：
* `s3_max_single_part_upload_size` - Blob Storageへの単一ブロックアップロードのサイズを制限します。
* `min_bytes_for_seek` - シーク可能な領域のサイズを制限します。
* `max_single_read_retries` - Blob Storageからデータのチャンクを読み取るための試行回数を制限します。
* `max_single_download_retries` - Blob Storageから読み取り可能なバッファをダウンロードする試行回数を制限します。
* `thread_pool_size` - `IDiskRemote` がインスタンス化されるスレッド数を制限します。
* `s3_max_inflight_parts_for_one_file` - 一つのオブジェクトに対して同時に実行できるPUTリクエストの数を制限します。

その他のパラメータ：
* `metadata_path` - Blob Storage用のメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は `/var/lib/clickhouse/disks/<disk_name>/` です。
* `skip_access_check` — `true` の場合、ディスクのスタートアップ時にディスクアクセスチェックは行われません。デフォルト値は `false` です。
* `read_resource` — このディスクへの読み取りリクエストの [スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空文字列です（このディスクではIOスケジューリングは有効ではありません）。
* `write_resource` — 書き込みリクエストの [スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空文字列です（このディスクではIOスケジューリングは有効ではありません）。
* `metadata_keep_free_space_bytes` - メタデータディスクのために予約されるフリースペースの量。

動作する構成の例は、統合テストディレクトリで見つけることができます（例えば、[test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) や [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)）。

:::note ゼロコピー複製は本番環境向けではありません
ゼロコピー複製は、ClickHouseバージョン22.8以降ではデフォルトで無効になっています。この機能は本番使用に推奨されていません。
:::
## HDFSストレージの使用（未サポート） {#using-hdfs-storage-unsupported}

このサンプル構成では：
- ディスクは `hdfs`（未サポート）タイプです
- データは `hdfs://hdfs1:9000/clickhouse/` にホストされています。

なお、HDFSは未サポートであるため、使用時に問題が発生する可能性があります。問題が発生した場合は、修正を含むプルリクエストを自由に行ってください。

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

HDFSがコーナーケースで正常に機能しない場合があることを覚えておいてください。
### データの暗号化の使用 {#encrypted-virtual-file-system}

[S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) または [HDFS](#using-hdfs-storage-unsupported)（未サポート）外部ディスク、またはローカルディスクに保存されたデータを暗号化できます。この暗号化モードをオンにするには、構成ファイルに `encrypted` タイプのディスクを定義し、データが保存されるディスクを選択する必要があります。 `encrypted` ディスクは、書き込まれたすべてのファイルを自動的に暗号化し、`encrypted` ディスクからファイルを読み取ると自動的に復号化されます。したがって、`encrypted` ディスクでは通常のディスクと同様に作業できます。

ディスク構成の例：

``` xml
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

たとえば、ClickHouseがテーブルからファイル `store/all_1_1_0/data.bin` にデータを書き込む際、実際にはこのファイルは物理ディスク上のパス `/path1/store/all_1_1_0/data.bin` に書き込まれます。

同じファイルを `disk2` に書き込むと、暗号化モードで実際には物理ディスク上のパス `/path1/path2/store/all_1_1_0/data.bin` に書き込まれます。

必要なパラメータ：

- `type` — `encrypted`。そうでなければ、暗号化ディスクは作成されません。
- `disk` — データ保存のためのディスクの種類。
- `key` — 暗号化および復号化のためのキー。タイプ: [Uint64](/sql-reference/data-types/int-uint.md)。キーを16進数形式でエンコードするために `key_hex` パラメータを使用できます。
    複数のキーを使用する場合、`id` 属性を指定できます（以下の例参照）。

オプションのパラメータ：

- `path` — データが保存されるディスク上の場所のパス。指定しない場合、データはルートディレクトリに保存されます。
- `current_key_id` — 暗号化に使用されるキー。すべての指定されたキーは復号化に使用でき、以前に暗号化されたデータへのアクセスを維持しながら別のキーに切り替えることができます。
- `algorithm` — [アルゴリズム](/sql-reference/statements/create/table#encryption-codecs)による暗号化。可能な値: `AES_128_CTR`、`AES_192_CTR`、`AES_256_CTR`。デフォルト値: `AES_128_CTR`。キーの長さはアルゴリズムに依存します：`AES_128_CTR` — 16バイト、 `AES_192_CTR` — 24バイト、 `AES_256_CTR` — 32バイト。

ディスク構成の例：

``` xml
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

バージョン22.3以降、ストレージ構成においてローカルキャッシュをディスクに設定することが可能です。
バージョン22.3から22.7までは、キャッシュは`s3`ディスクタイプのみに対応しています。バージョン22.8以降は、S3、Azure、ローカル、暗号化ディスクなど、あらゆるディスクタイプでキャッシュがサポートされています。
バージョン23.5以降は、キャッシュはリモートディスクタイプ（S3、Azure、HDFS（未サポート））のみに対応しています。
キャッシュは`LRU`キャッシュポリシーを使用します。

バージョン22.8以降の構成例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3の設定 ...
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

バージョン22.8未満の構成例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3の設定 ...
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

これらの設定はディスク構成セクションで定義する必要があります。

- `path` - キャッシュのディレクトリへのパス。デフォルト: なし、この設定は必須です。

- `max_size` - キャッシュの最大サイズ（バイトまたは読みやすい形式で、例:`ki, Mi, Gi`など）。例:`10Gi`（この形式は`22.10`バージョン以降で動作します）。制限に達すると、キャッシュファイルはキャッシュ排出ポリシーに従って追い出されます。デフォルト: なし、この設定は必須です。

- `cache_on_write_operations` - `write-through`キャッシュを有効にすることを許可します（すべての書き込み操作のデータをキャッシュします：`INSERT`クエリ、バックグラウンドマージ）。デフォルト: `false`。`write-through`キャッシュは、設定`enable_filesystem_cache_on_write_operations`を使用してクエリごとに無効にできます（キャッシュは、キャッシュ構成設定とそれに対応するクエリ設定の両方が有効な場合にのみ行われます）。

- `enable_filesystem_query_cache_limit` - 各クエリ内でダウンロードされるキャッシュのサイズを制限することを許可します（ユーザー設定`max_query_cache_size`に依存します）。デフォルト: `false`。

- `enable_cache_hits_threshold` - 一部のデータがキャッシュされる前に何回読み込まれる必要があるかを定義する数値。デフォルト: `false`。この閾値は`cache_hits_threshold`によって定義できます。デフォルト: `0`、例: データは最初の読み取り試行でキャッシュされます。

- `enable_bypass_cache_with_threshold` - 要求された読み取り範囲が閾値を超えた場合、キャッシュを完全にスキップできます。デフォルト: `false`。この閾値は`bypass_cache_threshold`によって定義できます。デフォルト: `268435456`（`256Mi`）。

- `max_file_segment_size` - 単一のキャッシュファイルの最大サイズ（バイトまたは読みやすい形式で、例: `ki, Mi, Gi`など）。デフォルト: `8388608`（`8Mi`）。

- `max_elements` - キャッシュファイルの数の制限。デフォルト: `10000000`。

- `load_metadata_threads` - 起動時にキャッシュメタデータをロードするために使用されるスレッドの数。デフォルト: `16`。

ファイルキャッシュ **クエリ/プロファイル設定**:

これらの設定の一部は、デフォルトまたはディスク構成設定で有効なキャッシュ機能をクエリまたはプロファイルごとに無効にします。たとえば、ディスク構成でキャッシュを有効にしても、クエリ/プロファイル設定`enable_filesystem_cache`を`false`に設定すると無効になります。また、ディスク構成で`cache_on_write_operations`を`true`に設定すると、「write-though」キャッシュが有効になります。しかし、特定のクエリに対してこの一般設定を無効にする必要がある場合は、設定`enable_filesystem_cache_on_write_operations`を`false`に設定すると、特定のクエリ/プロファイルに対する書き込み操作キャッシュが無効になります。

- `enable_filesystem_cache` - ストレージポリシーが`cache`ディスクタイプで構成されている場合でも、クエリごとにキャッシュを無効にできます。デフォルト: `true`。

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - キャッシュが存在する場合のみクエリでキャッシュを使用します。そうでない場合、クエリデータはローカルキャッシュストレージに書き込まれません。デフォルト: `false`。

- `enable_filesystem_cache_on_write_operations` - `write-through`キャッシュを有効にします。この設定は、キャッシュ構成で`cache_on_write_operations`設定が有効な場合にのみ機能します。デフォルト: `false`。クラウドのデフォルト値: `true`。

- `enable_filesystem_cache_log` - `system.filesystem_cache_log`テーブルへのログ記録を有効にします。クエリごとのキャッシュ使用量の詳細なビューを提供します。特定のクエリに対してオンにすることができ、プロファイル内で有効にすることもできます。デフォルト: `false`。

- `max_query_cache_size` - ローカルキャッシュストレージに書き込むことができるキャッシュサイズの制限。キャッシュ構成で`enable_filesystem_query_cache_limit`が有効である必要があります。デフォルト: `false`。

- `skip_download_if_exceeds_query_cache` - 設定`max_query_cache_size`の動作を変更することを許可します。デフォルト: `true`。この設定がオンの場合、クエリ中にキャッシュダウンロード制限が達成されると、それ以上のキャッシュはキャッシュストレージにダウンロードされません。この設定がオフの場合、クエリ中にキャッシュダウンロード制限が達成されると、キャッシュは依然として書き込まれますが、以前にダウンロードされたデータ（現在のクエリ内）を追い出すコストが発生します。たとえば、2番目の動作は「最近使用された」動作を維持しながらクエリキャッシュ制限を保持することを許可します。

**警告**
キャッシュの構成設定およびキャッシュクエリ設定は最新のClickHouseバージョンに対応しており、以前のバージョンでは何かがサポートされていない場合があります。

キャッシュ **システムテーブル**:

- `system.filesystem_cache` - 現在のキャッシュの状態を示すシステムテーブル。

- `system.filesystem_cache_log` - クエリごとの詳細なキャッシュ使用量を示すシステムテーブル。`enable_filesystem_cache_log`設定が`true`である必要があります。

キャッシュ **コマンド**:

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER`は`<cache_name>`が提供されていない場合のみサポートされています。

- `SHOW FILESYSTEM CACHES` -- サーバー上で構成されたファイルシステムキャッシュのリストを表示します。 (バージョン &lt;= `22.8` の場合、コマンドは `SHOW CACHES` と呼ばれます。)

```sql
SHOW FILESYSTEM CACHES
```

結果:

```text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - 特定のキャッシュに対するキャッシュ構成と一般的統計を表示します。キャッシュ名は`SHOW FILESYSTEM CACHES`コマンドから取得できます。 (バージョン &lt;= `22.8` の場合、コマンドは `DESCRIBE CACHE` と呼ばれます。)

```sql
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

キャッシュの現在のメトリクス:

- `FilesystemCacheSize`

- `FilesystemCacheElements`

キャッシュの非同期メトリクス:

- `FilesystemCacheBytes`

- `FilesystemCacheFiles`

キャッシュプロファイルイベント:

- `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes,`

- `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds`

- `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`

- `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`

### 静的Webストレージの使用（読み取り専用） {#web-storage}

これは読み取り専用のディスクです。データは読み取るだけで、決して変更されることはありません。このディスクに新しいテーブルをロードするには、`ATTACH TABLE`クエリを使用します（下記の例を参照）。ローカルディスクは実際には使用されず、各`SELECT`クエリは必要なデータを取得するための`http`リクエストとなります。テーブルデータのすべての変更は例外を引き起こします。すなわち、次の種類のクエリは許可されていません: [CREATE TABLE](/sql-reference/statements/create/table.md)、[ALTER TABLE](/sql-reference/statements/alter/index.md)、[RENAME TABLE](/sql-reference/statements/rename.md/#misc_operations-rename_table)、[DETACH TABLE](/sql-reference/statements/detach.md)、[TRUNCATE TABLE](/sql-reference/statements/truncate.md)。
Webストレージは読み取り専用目的で使用できます。サンプルデータのホスティングやデータの移行などの例があります。
ツール`clickhouse-static-files-uploader`があり、特定のテーブル用のデータディレクトリを準備します（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。必要なテーブルごとにファイルのディレクトリが取得できます。これらのファイルは、たとえば、静的ファイルを持つWebサーバーにアップロードできます。この準備が完了したら、`DiskWeb`を介してこのテーブルを任意のClickHouseサーバーにロードできます。

以下はこのサンプル構成です：
- ディスクは`web`タイプです。
- データは`http://nginx:80/test1/`にホストされています。
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
Webデータセットが定期的に使用されない場合は、クエリ内でストレージを一時的に構成することもできます。設定ファイルを編集する必要はありません。
:::

:::tip
【デモデータセット】(https://github.com/ClickHouse/web-tables-demo)がGitHubでホストされています。Webストレージ用のテーブルを自分で準備するには、ツール[clickhouse-static-files-uploader](/operations/storing-data.md/#storing-data-on-webserver)を参照してください。
:::

この`ATTACH TABLE`クエリでは、提供された`UUID`がデータのディレクトリ名と一致し、エンドポイントは生のGitHubコンテンツのURLです。

```sql

# highlight-next-line
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
  # highlight-start
  SETTINGS disk = disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      );
  # highlight-end
```

準備が整ったテストケースです。設定にこの構成を追加する必要があります：

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

必要なパラメータ：

- `type` — `web`。さもなければ、ディスクは作成されません。
- `endpoint` — パス形式のエンドポイントURL。エンドポイントURLには、アップロードされたデータを保存するためのルートパスが含まれている必要があります。

オプションのパラメータ：

- `min_bytes_for_seek` — シーク操作を使用するための最小バイト数。デフォルト値: `1` Mb。
- `remote_fs_read_backoff_threashold` — リモートディスクからデータを読み取る試行中の最大待機時間。デフォルト値: `10000`秒。
- `remote_fs_read_backoff_max_tries` — バックオフを伴う最大試行回数。デフォルト値: `5`。

`DB:Exception Unreachable URL`という例外でクエリが失敗した場合は、設定を調整してみてください: [http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings.md/#keep-alive-timeout)。

アップロード用のファイルを取得するには、次のように実行します。
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path`はクエリ`SELECT data_paths FROM system.tables WHERE name = 'table_name'`で見つかります）。

ファイルを`endpoint`でロードする際、`<endpoint>/store/`パスにアップロードする必要がありますが、設定ファイルにはエンドポイントのみを含める必要があります。

サーバーがテーブルを起動中にディスク読み込み時にURLにアクセスできなかった場合、すべてのエラーがキャッチされます。この場合にエラーが発生した場合、テーブルは再ロード（再び表示）できます。`DETACH TABLE table_name` -> `ATTACH TABLE table_name`を介して行います。サーバー起動時にメタデータが正常にロードされた場合、テーブルはすぐに使用可能になります。

単一のHTTP読み込み中の最大試行回数を制限するには、[http_max_single_read_retries](/operations/settings/settings.md/#http-max-single-read-retries)設定を使用します。

### ゼロコピー複製（本番には未対応） {#zero-copy}

ゼロコピー複製は、`S3`および`HDFS`（未サポート）ディスクで可能ですが、推奨されません。ゼロコピー複製とは、データが複数の機械にリモートで保存されていて同期が必要な場合、メタデータ（データ部分へのパス）のみが複製され、データ自体は複製されないことを意味します。

:::note ゼロコピー複製は本番には未対応
ゼロコピー複製はClickHouseバージョン22.8以降、デフォルトで無効になっています。この機能は本番環境での使用は推奨されません。
:::
