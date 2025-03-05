---
slug: /operations/storing-data
sidebar_position: 68
sidebar_label: "データ保存用の外部ディスク"
title: "データ保存用の外部ディスク"
---

ClickHouseで処理されたデータは、通常、ローカルファイルシステムに保存されます — ClickHouseサーバーと同じマシン上です。これには大容量のディスクが必要であり、コストがかかる可能性があります。それを避けるために、データをリモートに保存することができます。さまざまなストレージがサポートされています：
1. [Amazon S3](https://aws.amazon.com/s3/) オブジェクトストレージ。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. サポートされていない: Hadoop Distributed File System ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

:::note ClickHouseは、外部ストレージオプションとは異なる、外部テーブルエンジンもサポートしています。これにより、一般的なファイルフォーマット（Parquetなど）に保存されたデータを読むことができます。このページでは、ClickHouse `MergeTree` ファミリーまたは `Log` ファミリーのテーブルに対するストレージ構成を説明しています。
1. `Amazon S3` ディスクに保存されたデータを操作するには、 [S3](/engines/table-engines/integrations/s3.md) テーブルエンジンを使用します。
2. Azure Blob Storage に保存されたデータを操作するには、 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) テーブルエンジンを使用します。
3. サポートされていない: Hadoop Distributed File System のデータを操作するには — [HDFS](/engines/table-engines/integrations/hdfs.md) テーブルエンジンを使用します。
:::

## 外部ストレージの構成 {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) および [Log](/engines/table-engines/log-family/log.md) ファミリーのテーブルエンジンは、ディスクの種類としてそれぞれ `s3`、`azure_blob_storage`、`hdfs`（未サポート）を使用して、データを `S3`、`AzureBlobStorage`、`HDFS`（未サポート）に保存できます。

ディスク構成には以下が必要です：
1. `type` セクション、`s3`、`azure_blob_storage`、`hdfs`（未サポート）、`local_blob_storage`、`web` のいずれかに等しい。
2. 特定の外部ストレージタイプの構成。

24.1のClickHouseバージョン以降、新しい構成オプションを使用することが可能です。
指定する必要があるのは次のとおりです：
1. `type` が `object_storage` に等しい
2. `object_storage_type`、`s3`、`azure_blob_storage`（または、`24.3`からは単に `azure`）、`hdfs`（未サポート）、`local_blob_storage`（または、`24.3`からは単に `local`）、`web` のいずれかに等しい。
オプションとして、`metadata_type` を指定できます（これはデフォルトで `local` に等しい）、ただし `plain`、`web`、及び `24.4` 以降は `plain_rewritable` に設定することも可能です。
`plain` メタデータタイプの使用は [plain storage section](/operations/storing-data#plain-storage) で説明されています。`web` メタデータタイプは `web` オブジェクトストレージタイプのみで使用できます。`local` メタデータタイプは、メタデータファイルをローカルに保存します（各メタデータファイルにはオブジェクトストレージ内のファイルに対するマッピングと、その追加のメタ情報が含まれています）。

例えば、構成オプション
``` xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

は、以下の構成（`24.1`から）と等しいです：
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

は以下と等しいです：
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

24.1のClickHouseバージョン以降、次のようになります：
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

特定の種類のストレージをすべての `MergeTree` テーブルのデフォルトオプションにするには、構成ファイルに以下のセクションを追加します：
``` xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

特定のテーブルにのみ特定のストレージポリシーを構成したい場合は、テーブル作成時に設定で定義できます：

``` sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

`storage_policy` の代わりに `disk` を使用することもできます。この場合、構成ファイルに `storage_policy` セクションを持つ必要はなく、`disk` セクションだけで十分です。

``` sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```
## 動的構成 {#dynamic-configuration}

事前に定義されたディスクではなく、構成ファイル内でストレージ構成を指定することも可能ですが、`CREATE` / `ATTACH` クエリの設定で構成を行うことができます。

以下のクエリは上記の動的ディスク構成を基にしており、URLに保存されたテーブルからデータをキャッシュするためにローカルディスクを使用する方法を示しています。

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

以下に強調された設定に注意してください。この`type=web` のディスクが、`type=cache` のディスク内にネストされています。

:::note
この例では `type=web` を使用していますが、任意のディスクタイプを動的に構成することができます。ローカルディスクも同様です。ローカルディスクには、サーバー設定パラメータ `custom_local_disks_base_directory` 内のパス引数が必要であり、デフォルトがないため、ローカルディスクを使用する際はそれも設定してください。
:::

構成ベースの設定とSQL定義の構成の組み合わせも可能です：

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

ここで、`web` はサーバー構成ファイルからのものです：

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

必要なパラメーター：

- `endpoint` — `path` または `virtual hosted` スタイルの S3 エンドポイント URL ([styles](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html))。エンドポイントURLには、バケットとデータを保存するためのルートパスが含まれている必要があります。
- `access_key_id` — S3 アクセスキーID。
- `secret_access_key` — S3 シークレットアクセスキー。

オプションのパラメーター：

- `region` — S3 のリージョン名。
- `support_batch_delete` — バッチ削除がサポートされているかどうかを確認するための制御を行います。Google Cloud Storage (GCS) を使用する場合は、GCS がバッチ削除をサポートしていないため、`false` に設定してください。これによりログ内のエラーメッセージが防止されます。
- `use_environment_credentials` — 環境変数 AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEY、および AWS_SESSION_TOKEN から AWS 認証情報を読み込みます。デフォルト値は `false` です。
- `use_insecure_imds_request` — `true` に設定すると、S3 クライアントが Amazon EC2 メタデータから認証情報を取得する際に、安全でない IMDS リクエストを使用します。デフォルト値は `false` です。
- `expiration_window_seconds` — 有効期限ベースの資格情報が失効しているかを確認するための猶予期間。オプションで、デフォルト値は `120` です。
- `proxy` — S3 エンドポイントのプロキシ構成。`proxy` ブロック内の各 `uri` 要素はプロキシURLを含まなければなりません。
- `connect_timeout_ms` — ミリ秒単位のソケット接続タイムアウト。デフォルト値は `10 seconds` です。
- `request_timeout_ms` — ミリ秒単位のリクエストタイムアウト。デフォルト値は `5 seconds` です。
- `retry_attempts` — リクエスト失敗時の再試行回数。デフォルト値は `10` です。
- `single_read_retries` — 読み取り中に接続が切断された場合の再試行回数。デフォルト値は `4` です。
- `min_bytes_for_seek` — シーケンシャルリードの代わりにシーク操作を使用するための最小バイト数。デフォルト値は `1 Mb` です。
- `metadata_path` — S3 のメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は `/var/lib/clickhouse/disks/<disk_name>/` です。
- `skip_access_check` — `true` の場合、ディスク起動時にディスクアクセスチェックは実行されません。デフォルト値は `false` です。
- `header` — 指定されたHTTPヘッダーをリクエストに追加します。オプションとして、複数回指定できます。
- `server_side_encryption_customer_key_base64` — 指定された場合、SSE-C 暗号化された S3 オブジェクトにアクセスするために必要なヘッダーが設定されます。
- `server_side_encryption_kms_key_id` - 指定された場合、SSE-KMS 暗号化された S3 オブジェクトにアクセスするために必要なヘッダーが設定されます ([UsingKMSEncryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html))。空の文字列が指定されると、AWS 管理の S3 キーが使用されます。オプションです。
- `server_side_encryption_kms_encryption_context` - `server_side_encryption_kms_key_id` と一緒に指定された場合、SSE-KMS 用の暗号化コンテキストヘッダーが設定されます。オプションです。
- `server_side_encryption_kms_bucket_key_enabled` - `server_side_encryption_kms_key_id` と一緒に指定された場合、SSE-KMS のための S3 バケットキーを有効にするヘッダーが設定されます。オプションで、`true` または `false` にできます。デフォルトは何も指定されず（バケットレベルの設定に一致します）。
- `s3_max_put_rps` — スロットルがかかる前の最大PUTリクエスト毎秒速度。デフォルト値は `0`（制限なし）です。
- `s3_max_put_burst` — リクエスト毎秒制限に達する前に同時に発行できる最大リクエスト数。デフォルト値（`0` 値）は `s3_max_put_rps` と等しいです。
- `s3_max_get_rps` — スロットルがかかる前の最大GETリクエスト毎秒速度。デフォルト値は `0`（制限なし）です。
- `s3_max_get_burst` — リクエスト毎秒制限に達する前に同時に発行できる最大リクエスト数。デフォルト値（`0` 値）は `s3_max_get_rps` と等しいです。
- `read_resource` — このディスクへの読み取りリクエストの [スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空の文字列（このディスクに対してIOスケジューリングは有効になっていません）。
- `write_resource` — このディスクへの書き込みリクエストの [スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空の文字列（このディスクに対してIOスケジューリングは有効になっていません）。
- `key_template` — オブジェクトキーが生成される形式を定義します。デフォルトでは、ClickHouseは`endpoint`の`root path`を取り、それにランダム生成されたサフィックスを追加します。そのサフィックスは3つのランダムシンボルを持つディレクトリと29のランダムシンボルを持つファイル名です。このオプションにより、オブジェクトキーの生成方法に関する完全な制御が可能になります。一部の使用シナリオでは、プレフィックスやオブジェクトキーの真ん中にランダムシンボルが必要です。例えば: `[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}`。値は [`re2`](https://github.com/google/re2/wiki/Syntax) で解析されます。構文の一部のみがサポートされています。このオプションを使用する前に、希望する形式がサポートされているか確認してください。ClickHouseが`key_template`の値に基づいてキーを生成できない場合、ディスクは初期化されません。これは、`storage_metadata_write_full_object_key` 機能フラグを有効にする必要があります。この機能は、`endpoint`オプションにおける`root path`の宣言を禁止します。`key_compatibility_prefix`オプションの定義が必要です。
- `key_compatibility_prefix` — `key_template`オプションが使用されている場合、これは必要なオプションです。このオプションは、`VERSION_FULL_OBJECT_KEY`未満のメタデータバージョンでメタデータファイルに保存されたオブジェクトキーを読み取るために必要です。以前の`root path`はここで`endpoint`オプションから設定する必要があります。

:::note
Google Cloud Storage (GCS) も、タイプ `s3` を使用してサポートされています。 [GCS backed MergeTree](/integrations/gcs) を参照してください。
:::
### プレインストレージの使用 {#plain-storage}

`22.10` では、`s3_plain` という新しいディスクタイプが導入され、書き込み専用のストレージが提供されます。構成パラメータは `s3` ディスクタイプと同じです。
`s3` ディスクタイプとは異なり、データをそのまま保存します。つまり、ランダム生成されたブロブ名の代わりに通常のファイル名を使用し（ClickHouseがローカルディスクにファイルを保存するのと同様）、ローカルにメタデータを保存しません。すなわち、S3のデータから派生します。

このディスクタイプを使用すると、既存のデータに対してマージを実行できず、 新しいデータの挿入もできないため、テーブルの静的バージョンを維持できます。
このディスクタイプの使用例は、バックアップを作成することです。バックアップは `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')` を通じて実行できます。その後、`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`を実行するか、`ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`を使用します。

構成：
``` xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1`から、任意のオブジェクトストレージディスク（`s3`、`azure`、`hdfs`（未サポート）、`local`）を `plain` メタデータタイプを使って構成することができます。

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
### S3プレイン書き換え可能ストレージの使用 {#s3-plain-rewritable-storage}
`24.4` にて新しいディスクタイプ `s3_plain_rewritable` が導入されました。
`s3_plain` ディスクタイプと同様に、メタデータファイルに追加のストレージを必要とせず、メタデータはS3に保存されます。
`s3_plain` ディスクタイプとは異なり、`s3_plain_rewritable` ではマージを実行でき、INSERT 操作もサポートしています。
[Mutations](/sql-reference/statements/alter#mutations) および テーブルの複製はサポートされていません。

このディスクタイプの使用例は、複製されていない `MergeTree` テーブルです。`s3` ディスクタイプは複製されていない MergeTree テーブルに適していますが、テーブルにローカルメタデータが不要で、限られた操作セットを受け入れることができるのであれば、`s3_plain_rewritable` ディスクタイプを選択できます。これは、システムテーブルに対して役立ちます。

構成：
``` xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

これは以下に等しいです：
``` xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

`24.5`から、任意のオブジェクトストレージディスク（`s3`、`azure`、`local`）を `plain_rewritable` メタデータタイプで構成することができます。
### Azure Blob Storageの使用 {#azure-blob-storage}

`MergeTree` ファミリーのテーブルエンジンは、`azure_blob_storage` タイプのディスクを使用して [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) にデータを保存できます。

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
* `storage_account_url` - **必須**、Azure Blob Storage アカウント URL、 `http://account.blob.core.windows.net` または `http://azurite1:10000/devstoreaccount1` のように。
* `container_name` - 対象コンテナ名、デフォルトは `default-container`。
* `container_already_exists` - `false` に設定された場合、新しいコンテナ `container_name` がストレージアカウントに作成されます。 `true` に設定された場合、ディスクはコンテナに直接接続し、設定されていない場合、ディスクはアカウントに接続し、`container_name` が存在するかどうかを確認し、存在しない場合は作成します。

認証パラメータ（ディスクはすべての利用可能な方法 **と** 管理された ID 資格情報を試みます）：
* `connection_string` - 接続文字列を使用して認証する際に使用します。
* `account_name` および `account_key` - 共有キーを使用して認証する際に使用します。

制限パラメーター（主に内部使用）：
* `s3_max_single_part_upload_size` - Blob Storageへの単一ブロックアップロードのサイズを制限します。
* `min_bytes_for_seek` - シーク可能な領域のサイズを制限します。
* `max_single_read_retries` - Blob Storageからデータのチャンクを読み取る試行回数を制限します。
* `max_single_download_retries` - Blob Storageから読み取り可能なバッファをダウンロードする試行回数を制限します。
* `thread_pool_size` - `IDiskRemote`が初期化される際のスレッド数を制限します。
* `s3_max_inflight_parts_for_one_file` - 1つのオブジェクトに対して同時に実行できるPUTリクエストの数を制限します。

その他のパラメーター：
* `metadata_path` - Blob Storageのメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は `/var/lib/clickhouse/disks/<disk_name>/` です。
* `skip_access_check` - `true` の場合、ディスク起動時のディスクアクセスチェックは実行されません。デフォルト値は `false` です。
* `read_resource` — このディスクへの読み取りリクエストの [スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空の文字列（このディスクに対してIOスケジューリングは有効になっていません）。
* `write_resource` — このディスクへの書き込みリクエストの [スケジューリング](/operations/workload-scheduling.md) に使用されるリソース名。デフォルト値は空の文字列（このディスクに対してIOスケジューリングは有効になっていません）。
* `metadata_keep_free_space_bytes` - メタデータディスクのために予約すべき空きスペースの量。

動作する構成の例は統合テストディレクトリにあります（例: [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) や [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml) を参照してください）。

:::note ゼロコピー複製は本番環境には適していません
ゼロコピー複製は、ClickHouse version 22.8以降、デフォルトで無効になっています。この機能は、本番環境での使用は推奨されていません。
:::
## HDFSストレージの使用（未サポート） {#using-hdfs-storage-unsupported}

このサンプル構成では：
- ディスクは `hdfs`（未サポート）タイプです。
- データは `hdfs://hdfs1:9000/clickhouse/` にホストされています。

なお、HDFSは未サポートであるため、使用時に問題が発生する可能性があります。何か問題が発生した場合は、修正のためのプルリクエストを自由に作成してください。

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

HDFSは、コーナーケースでは動作しない可能性があることを考慮してください。
### データ暗号化の使用 {#encrypted-virtual-file-system}

保存されたデータを暗号化することができます [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 、または、 [HDFS](#using-hdfs-storage-unsupported)（未サポート）、またはローカルディスクです。暗号化モードを有効にするには、構成ファイルに `encrypted` タイプのディスクを定義し、データが保存されるディスクを選択する必要があります。`encrypted` ディスクは、書き込まれたすべてのファイルをオンザフライで暗号化し、`encrypted` ディスクからファイルを読み取るときにそれらを自動的に復号化します。したがって、`encrypted` ディスクを通常のディスクのように操作できます。

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

例えば、ClickHouseがテーブルからファイル `store/all_1_1_0/data.bin` にデータを書き込むと、実際にはこのファイルは物理ディスク `/path1/store/all_1_1_0/data.bin` に書き込まれます。

同じファイルを `disk2` に書き込む場合、これは実際には物理ディスクのパス `/path1/path2/store/all_1_1_0/data.bin` に暗号化モードで書き込まれます。

必要なパラメーター：

- `type` — `encrypted`。そうでなければ暗号化ディスクは作成されません。
- `disk` — データ保存用のディスクのタイプ。
- `key` — 暗号化と復号化のためのキー。型: [Uint64](/sql-reference/data-types/int-uint.md)。16進数形式でキーをエンコードするために `key_hex` パラメーターを使用できます。
    複数のキーを使用する場合は、`id` 属性を使用して指定できます（以下の例を参照）。

オプションのパラメーター：

- `path` — データが保存されるディスク上の場所へのパス。指定しない場合、データはルートディレクトリに保存されます。
- `current_key_id` — 暗号化に使用するキー。指定されたすべてのキーは復号化に使用でき、以前の暗号化データへのアクセスを保持しながら、他のキーに切り替えることができます。
- `algorithm` — 暗号化のための [Algorithm](/sql-reference/statements/create/table#encryption-codecs) 。可能な値: `AES_128_CTR`、`AES_192_CTR` または `AES_256_CTR`。デフォルト値: `AES_128_CTR`。キーの長さはアルゴリズムによって異なります: `AES_128_CTR` — 16バイト, `AES_192_CTR` — 24バイト、 `AES_256_CTR` — 32バイト。

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

バージョン22.3以降、ストレージ設定でディスク上にローカルキャッシュを構成することが可能です。
バージョン22.3 - 22.7では、キャッシュは`s3`ディスクタイプのみでサポートされています。バージョン>= 22.8では、キャッシュはすべてのディスクタイプに対してサポートされます：S3、Azure、ローカル、暗号化など。
バージョン>= 23.5では、キャッシュはリモートディスクタイプにのみサポートされています：S3、Azure、HDFS（サポート外）。
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
</clickhouse>
```

バージョン22.8以前の構成例：

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
</clickhouse>
```

ファイルキャッシュ **ディスク設定**：

これらの設定はディスク設定セクションで定義する必要があります。

- `path` - キャッシュディレクトリのパス。デフォルト：なし。この設定は必須です。

- `max_size` - キャッシュの最大サイズ（バイトまたは可読形式、例：`ki、Mi、Gi`など）、例`10Gi`（この形式は`22.10`バージョン以降で機能します）。制限に達すると、キャッシュファイルはキャッシュ追放ポリシーに従って排除されます。デフォルト：なし、この設定は必須です。

- `cache_on_write_operations` - `書き込みスルー`キャッシュをオンにすることを許可します（あらゆる書き込み操作におけるデータのキャッシュ：`INSERT`クエリ、バックグラウンドマージ）。デフォルト：`false`。`書き込みスルー`キャッシュは、設定`enable_filesystem_cache_on_write_operations`を使用してクエリごとに無効にできます（キャッシュは、キャッシュ設定と対応するクエリ設定の両方が有効になっている場合にのみキャッシュされます）。

- `enable_filesystem_query_cache_limit` - 各クエリ内でダウンロードされるキャッシュのサイズを制限できるようにします（ユーザー設定`max_query_cache_size`に依存します）。デフォルト：`false`。

- `enable_cache_hits_threshold` - キャッシュされる前にデータが何回読み込まれる必要があるかを定義する数値。デフォルト：`false`。このしきい値は`cache_hits_threshold`によって定義できます。デフォルト：`0`、例：データは最初の読み込み試行でキャッシュされます。

- `enable_bypass_cache_with_threshold` - 要求された読み取り範囲がしきい値を超えた場合にキャッシュを完全にスキップできるようにします。デフォルト：`false`。このしきい値は`bypass_cache_threashold`によって定義できます。デフォルト：`268435456`（`256Mi`）。

- `max_file_segment_size` - 単一のキャッシュファイルの最大サイズ（バイトまたは可読形式：`ki、Mi、Gi`など、例`10Gi`）。デフォルト：`8388608`（`8Mi`）。

- `max_elements` - キャッシュファイルの数の制限。デフォルト：`10000000`。

- `load_metadata_threads` - 起動時にキャッシュメタデータを読み込むために使用されるスレッドの数。デフォルト：`16`。

ファイルキャッシュ **クエリ/プロファイル設定**：

これらの設定の一部は、デフォルトまたはディスク構成設定で有効になっているキャッシュ機能をクエリ/プロファイル単位で無効にします。たとえば、ディスク構成でキャッシュを有効にし、クエリ/プロファイル設定`enable_filesystem_cache`を`false`にすることで無効にできます。また、ディスク構成で`cache_on_write_operations`を`true`に設定すると、「書き込みスルー」キャッシュが有効になります。しかし、特定のクエリに対してこの一般設定を無効にする必要がある場合は、設定`enable_filesystem_cache_on_write_operations`を`false`に設定すると、特定のクエリ/プロファイルに対する書き込み操作のキャッシュが無効になります。

- `enable_filesystem_cache` - ストレージポリシーが`cache`ディスクタイプで構成されていても、クエリごとにキャッシュを無効にすることを許可します。デフォルト：`true`。

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - クエリでキャッシュが既に存在する場合にのみキャッシュを使用することを許可します。そうでない場合、クエリデータはローカルキャッシュストレージに書き込まれません。デフォルト：`false`。

- `enable_filesystem_cache_on_write_operations` - `書き込みスルー`キャッシュをオンにします。この設定は、キャッシュ設定の`cache_on_write_operations`がオンになっている場合にのみ機能します。デフォルト：`false`。クラウドデフォルト値：`true`。

- `enable_filesystem_cache_log` - `system.filesystem_cache_log`テーブルへのログ記録をオンにします。クエリごとのキャッシュ使用の詳細を表示します。特定のクエリのためにオンにすることも、プロファイルで有効にすることもできます。デフォルト：`false`。

- `max_query_cache_size` - ローカルキャッシュストレージに書き込むことができるキャッシュサイズの制限。キャッシュ設定で`enable_filesystem_query_cache_limit`が有効になっている必要があります。デフォルト：`false`。

- `skip_download_if_exceeds_query_cache` - 設定`max_query_cache_size`の動作を変更することを許可します。デフォルト：`true`。この設定がオンになっている場合、クエリ中にキャッシュダウンロード制限に達した際には、これ以上キャッシュがキャッシュストレージにダウンロードされません。この設定がオフになっている場合、クエリ中にダウンロード制限に達しても、以前にダウンロードしたデータ（現在のクエリ内で）を排除することでキャッシュが引き続き書き込まれます。例：この二次の動作は、クエリキャッシュ制限を保持しながら「最近使用した」動作を維持することを許可します。

**警告**
キャッシュ設定とキャッシュクエリ設定は最新のClickHouseバージョンに対応しています。以前のバージョンではサポートされていない機能があるかもしれません。

キャッシュ **システムテーブル**：

- `system.filesystem_cache` - 現在のキャッシュ状態を示すシステムテーブル。

- `system.filesystem_cache_log` - クエリごとのキャッシュ使用状況の詳細を示すシステムテーブル。`enable_filesystem_cache_log`設定が`true`でなければなりません。

キャッシュ **コマンド**：

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `<cache_name>`が提供されていない場合のみ`ON CLUSTER`がサポートされます。

- `SHOW FILESYSTEM CACHES` -- サーバーで構成されたファイルシステムキャッシュのリストを表示します。（バージョン `<=22.8` の場合、このコマンドは`SHOW CACHES`と呼ばれます）

```sql
SHOW FILESYSTEM CACHES
```

結果：

```text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - 特定のキャッシュの設定と一般的な統計を表示します。キャッシュ名は`SHOW FILESYSTEM CACHES`コマンドから取得できます。（バージョン `<=22.8`の場合、このコマンドは`DESCRIBE CACHE`と呼ばれます）

```sql
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

キャッシュの現在のメトリック：

- `FilesystemCacheSize`

- `FilesystemCacheElements`

キャッシュの非同期メトリック：

- `FilesystemCacheBytes`

- `FilesystemCacheFiles`

キャッシュプロファイルイベント：

- `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes,`

- `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds`

- `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`

- `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`

### 静的Webストレージの使用（読み取り専用） {#web-storage}

これは読み取り専用のディスクです。そのデータは読み取られるだけで、決して修正されることはありません。このディスクに新しいテーブルが`ATTACH TABLE`クエリを介して読み込まれます（以下の例参照）。ローカルディスクは実際には使用されず、各`SELECT`クエリは必要なデータを取得するための`http`リクエストとなります。テーブルデータのすべての変更は例外を引き起こし、次のタイプのクエリは許可されません：[CREATE TABLE](/sql-reference/statements/create/table.md), [ALTER TABLE](/sql-reference/statements/alter/index.md), [RENAME TABLE](/sql-reference/statements/rename#rename-table), [DETACH TABLE](/sql-reference/statements/detach.md)および[TRUNCATE TABLE](/sql-reference/statements/truncate.md)。
Webストレージは読み取り専用の目的で使用できます。例としては、サンプルデータをホストする場合や、データを移行する場合です。
`clickhouse-static-files-uploader`というツールがあり、特定のテーブルのためのデータディレクトリを準備します（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。必要な各テーブルについて、ファイルのディレクトリを取得します。これらのファイルは、たとえば、静的ファイルを持つWebサーバーにアップロードできます。この準備が完了したら、`DiskWeb`を介してこのテーブルを任意のClickHouseサーバーに読み込むことができます。

このサンプル構成では：
- ディスクは`web`タイプです。
- データは`http://nginx:80/test1/`にホストされています。
- ローカルストレージでキャッシュが使用されます。

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
Webデータセットが定期的に使用されない場合、クエリ内でストレージを一時的に構成することもできます。 [動的設定](#dynamic-configuration)を参照し、設定ファイルの編集をスキップします。
:::

:::tip
[デモデータセット](https://github.com/ClickHouse/web-tables-demo)がGitHubにホストされています。Webストレージ用に自分のテーブルを準備するには、ツール[clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)を参照してください。
:::

この`ATTACH TABLE`クエリでは、提供された`UUID`がデータのディレクトリ名と一致し、エンドポイントが生のGitHubコンテンツのURLです。

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

準備が整ったテストケースです。これを設定ファイルに追加する必要があります：

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

次に、このクエリを実行します：

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

- `type` — `web`。そうでなければ、ディスクは作成されません。
- `endpoint` — パス形式のエンドポイントURL。エンドポイントURLは、データが保存されているルートパスを含める必要があります。

オプションのパラメータ：

- `min_bytes_for_seek` — シーク操作を使用するための最小バイト数。デフォルト値：`1` Mb。
- `remote_fs_read_backoff_threashold` — リモートディスクのデータを読み込む際の最大待機時間。デフォルト値：`10000`秒。
- `remote_fs_read_backoff_max_tries` — バックオフでの読み取り試行の最大回数。デフォルト値：`5`。

クエリが`DB:Exception Unreachable URL`という例外で失敗した場合、設定を調整してみてください：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

アップロード用のファイルを取得するには、次のコマンドを実行します：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path`はクエリ`SELECT data_paths FROM system.tables WHERE name = 'table_name'`で見つけられます）。

`endpoint`によってファイルを読み込む際、`<endpoint>/store/`パスに読み込む必要がありますが、設定には`endpoint`のみを含める必要があります。

サーバーがテーブルを開始する際にディスクの読み込み中にURLに到達できない場合、すべてのエラーがキャッチされます。この場合、エラーが発生した場合は、テーブルを再読み込み（表示されるようになる）するために`DETACH TABLE table_name` -> `ATTACH TABLE table_name`を実行できます。サーバー起動時にメタデータが正常に読み込まれた場合、テーブルはすぐに利用可能になります。

単一のHTTP読み取り中の最大試行回数を制限するために[http_max_single_read_retries](/operations/storing-data#web-storage)設定を使用してください。

### ゼロコピー複製（運用準備完了前） {#zero-copy}

ゼロコピー複製は可能ですが、推奨されない`S3`および`HDFS`（サポート外）のディスクで行うことができます。ゼロコピー複製とは、データが複数の機械にリモートで保存され、同期する必要がある場合、データ本体ではなく、メタデータ（データパーツへのパス）のみが複製されることを意味します。

:::note ゼロコピー複製は運用準備が整っていません
ゼロコピー複製は、ClickHouseバージョン22.8以上ではデフォルトで無効です。この機能は運用環境での使用は推奨されていません。
:::
