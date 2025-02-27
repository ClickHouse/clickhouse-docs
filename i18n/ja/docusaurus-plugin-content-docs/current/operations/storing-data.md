---
slug: /operations/storing-data
sidebar_position: 68
sidebar_label: "データの保存に関する外部ディスク"
title: "データの保存に関する外部ディスク"
---

ClickHouseで処理されたデータは、通常、ローカルファイルシステムに保存されます — ClickHouseサーバーと同じマシン上にです。これは大容量のディスクを必要とし、そのコストが高くなる可能性があります。これを回避するために、データをリモートで保存することができます。さまざまなストレージがサポートされています：
1. [Amazon S3](https://aws.amazon.com/s3/) オブジェクトストレージ。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. サポートされていない: Hadoop分散ファイルシステム ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))。

:::note ClickHouseはまた、外部ストレージオプションとは異なる外部テーブルエンジンのサポートも提供しています。外部ストレージオプションは、一般的なファイルフォーマット（例: Parquet）で保存されたデータを読み取ることを可能にしますが、このページではClickHouseの`MergeTree`ファミリーまたは`Log`ファミリーのテーブル向けのストレージ設定について説明しています。
1. `Amazon S3`ディスクに保存されたデータで作業するには、[S3](/engines/table-engines/integrations/s3.md)テーブルエンジンを使用します。
2. Azure Blob Storageに保存されたデータと作業するには、[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md)テーブルエンジンを使用します。
3. サポートされていない: Hadoop分散ファイルシステムにおけるデータ操作には、[HDFS](/engines/table-engines/integrations/hdfs.md)テーブルエンジンを使用します。
:::

## 外部ストレージの設定 {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)および[Log](/engines/table-engines/log-family/log.md)ファミリーのテーブルエンジンは、ディスクタイプ` s3`、` azure_blob_storage`、` hdfs`（サポートされていない）を使用して、データをそれぞれ` S3`、` AzureBlobStorage`、` HDFS`（サポートされていない）に保存することができます。

ディスク設定には以下が必要です：
1. `type`セクションは`s3`、`azure_blob_storage`、`hdfs`（サポートされていない）、`local_blob_storage`、`web`のいずれかに等しい必要があります。
2. 特定の外部ストレージタイプの設定。

24.1以降のClickHouseバージョンでは、新しい設定オプションを使用することが可能です。
次の指定が必要です：
1. `type`は`object_storage`に等しい。
2. `object_storage_type`は`s3`、`azure_blob_storage`（または`24.3`より前に持ってきたら単に`azure`）、`hdfs`（サポートされていない）、`local_blob_storage`（または`24.3`より前に持ってきたら単に`local`）、`web`のいずれかに等しい。
オプションで、`metadata_type`を指定することもできます（デフォルトは`local`です）。しかし、`plain`、`web`、および`24.4`以降では`plain_rewritable`にも設定できます。
`plain`メタデータタイプの使用は[plain storage section](/operations/storing-data.md/#storing-data-on-webserver)で説明されています。`web`メタデータタイプは`web`オブジェクトストレージタイプでのみ使用できます。`local`メタデータタイプは、メタデータファイルをローカルに保存します（各メタデータファイルはオブジェクトストレージ内のファイルのマッピングとその追加メタ情報を含みます）。

例: 設定オプション
``` xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

これは以下の設定に等しい（`24.1`から）：
``` xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

設定
``` xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

は以下に等しいです：
``` xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

フルストレージ設定の例は次のようになります：
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

24.1以降のClickHouseバージョンでは、次のようにも見えることがあります：
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

特定の種類のストレージをすべての`MergeTree`テーブルのデフォルトオプションにするには、設定ファイルに次のセクションを追加します：
``` xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

特定のストレージポリシーを特定のテーブルのみに設定したい場合は、テーブル作成時に設定で定義できます：

``` sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

`storage_policy`の代わりに`disk`を使用することもできます。この場合、設定ファイルに`storage_policy`セクションを持つ必要はなく、`disk`セクションのみで十分です。

``` sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```

## 動的設定 {#dynamic-configuration}

あらかじめ定義されたディスクなしでストレージ設定を指定することも可能ですが、設定ファイル内の`CREATE`/`ATTACH`クエリ設定で設定できます。

次の例クエリは、上記の動的ディスク設定に基づいて構築されており、URLに保存されたテーブルからデータをキャッシュするためにローカルディスクを使用する方法を示しています。

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

以下の設定では、`type=web`のディスクが`type=cache`のディスク内にネストされることに注意してください。

:::note
この例では`type=web`を使用していますが、動的に設定可能なディスクタイプとしては、ローカルディスクも含めて任意のディスクタイプが使用できます。ローカルディスクの場合、パス引数はサーバー設定パラメータ`custom_local_disks_base_directory`内にある必要があり、デフォルトがないため、ローカルディスクを使用する際はそれも設定してください。
:::

設定ベースの設定とSQL定義の設定の組み合わせも可能です：

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

ここで`web`はサーバー設定ファイルからのものです：

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

必須パラメータ：

- `endpoint` — `パス`または`仮想ホスト`スタイルのS3エンドポイントURL [styles](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)。エンドポイントURLは、バケットとデータを保存するルートパスを含む必要があります。
- `access_key_id` — S3アクセスキーID。
- `secret_access_key` — S3シークレットアクセスキー。

オプションのパラメータ：

- `region` — S3リージョン名。
- `support_batch_delete` — バッチ削除がサポートされているかどうかのチェックを制御します。Google Cloud Storage（GCS）を使用する場合、GCSはバッチ削除をサポートしていないため、この値を`false`に設定すると、チェックが行われず、ログにエラーメッセージが表示されません。
- `use_environment_credentials` — 環境変数AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEY、およびAWS_SESSION_TOKENからAWS資格情報を読み取ります。存在しない場合はデフォルト値`false`です。
- `use_insecure_imds_request` — `true`に設定すると、S3クライアントはAmazon EC2メタデータから資格情報を取得する際に不安全なIMDSリクエストを使用します。デフォルト値は`false`です。
- `expiration_window_seconds` — 有効期限ベースの資格情報が期限切れであるかどうかのチェックの猶予期間。オプション、デフォルト値は`120`です。
- `proxy` — S3エンドポイントのプロキシ設定。各`uri`要素はプロキシURLを含む必要があります。
- `connect_timeout_ms` — ソケット接続タイムアウト（ミリ秒）。デフォルト値は`10秒`です。
- `request_timeout_ms` — リクエストタイムアウト（ミリ秒）。デフォルト値は`5秒`です。
- `retry_attempts` — リクエスト失敗時のリトライ試行回数。デフォルト値は`10`です。
- `single_read_retries` — 読み取り中の接続ドロップ時のリトライ試行回数。デフォルト値は`4`です。
- `min_bytes_for_seek` — シーケンシャル読み取りの代わりにシーク操作に使用する最小バイト数。デフォルト値は`1 Mb`です。
- `metadata_path` — S3のメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は`/var/lib/clickhouse/disks/<disk_name>/`です。
- `skip_access_check` — trueの場合、ディスク起動時にディスクアクセスチェックが行われません。デフォルト値は`false`です。
- `header` — 指定したHTTPヘッダーを特定のエンドポイントへのリクエストに追加します。オプションで、複数回指定できます。
- `server_side_encryption_customer_key_base64` — 指定された場合、S3オブジェクトへのSSE-C暗号化アクセスに必要なヘッダーが設定されます。
- `server_side_encryption_kms_key_id` - 指定された場合、S3オブジェクトへの[SSE-KMS暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)に必要なヘッダーが設定されます。空文字列が指定された場合、AWSが管理するS3キーが使用されます。オプションです。
- `server_side_encryption_kms_encryption_context` - `server_side_encryption_kms_key_id`とともに指定される場合、SSE-KMS用の指定された暗号化コンテキストヘッダーが設定されます。オプションです。
- `server_side_encryption_kms_bucket_key_enabled` - `server_side_encryption_kms_key_id`とともに指定される場合、SSE-KMS用のS3バケットキーを有効にするためのヘッダーが設定されます。オプションで、`true`または`false`に設定でき、デフォルトは何も設定しない（バケットレベルの設定に一致）です。
- `s3_max_put_rps` — スロットリング前の最大PUTリクエスト毎秒率。デフォルト値は`0`（無制限）です。
- `s3_max_put_burst` — リクエスト毎秒制限に達する前に同時に発行できる最大リクエスト数。デフォルト（`0`値）の場合、`s3_max_put_rps`と等しいです。
- `s3_max_get_rps` — スロットリング前の最大GETリクエスト毎秒率。デフォルト値は`0`（無制限）です。
- `s3_max_get_burst` — リクエスト毎秒制限に達する前に同時に発行できる最大リクエスト数。デフォルト（`0`値）の場合、`s3_max_get_rps`と等しいです。
- `read_resource` — このディスクへの[スケジュール](/operations/workload-scheduling.md)での読み取りリクエストに使うリソース名。デフォルト値は空文字列（このディスクに対してはIOスケジューリングが有効ではない）。
- `write_resource` — このディスクへの[スケジュール](/operations/workload-scheduling.md)での書き込みリクエストに使うリソース名。デフォルト値は空文字列（このディスクに対してはIOスケジューリングが有効ではない）。
- `key_template` — オブジェクトキーが生成される形式を定義します。デフォルトでは、Clickhouseは`endpoint`オプションから`root path`を取り、ランダムに生成されたサフィックスを追加します。そのサフィックスは3つのランダムな記号を持つディレクトリと29個のランダムな記号を持つファイル名です。このオプションを使用すると、オブジェクトキーがどのように生成されるか完全に制御できます。一部の使用シナリオでは、プレフィックスやオブジェクトキーの中間にランダムな記号を持つことが必要です。例えば：`[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}`のように。値は[`re2`](https://github.com/google/re2/wiki/Syntax)で解析されます。この構文のサブセットのみがサポートされています。そのオプションを使用する前に、好みの形式がサポートされているか確認してください。`key_template`の値によってキーを生成できない場合、ディスクは初期化されません。この機能を有効にするためには、[storage_metadata_write_full_object_key](/operations/settings/settings#storage_metadata_write_full_object_key) フィーチャーフラグを有効にする必要があります。このオプションでは`endpoint`オプションに`root path`を宣言することが禁止されています。オプション`key_compatibility_prefix`の定義が必要です。
- `key_compatibility_prefix` — オプション`key_template`を使用する際に必要です。メタデータファイルに格納されたオブジェクトキーを読み取れるようにするために、以前の`VERSION_FULL_OBJECT_KEY`よりもメタデータバージョンが低い上で保存されたオブジェクトキーを読み取れるようにするため、`endpoint`オプションからの`root path`をここに設定する必要があります。

:::note
Google Cloud Storage (GCS)も、`s3`タイプを使用することでサポートされています。 [GCSバックアップMergeTree](/integrations/gcs)を参照。
:::

### プレインストレージの使用 {#plain-storage}

`22.10`では、書き込み専用ストレージを提供する新しいディスクタイプ`s3_plain`が導入されました。設定パラメータは`s3`ディスクタイプと同じです。
`s3`ディスクタイプとは異なり、データはそのまま保存されます。例えば、ランダムに生成されたブロブ名の代わりに、通常のファイル名（Clickhouseがローカルディスクにファイルを保存するのと同じ方法）を使用し、ローカルにメタデータを保存せず、データが`s3`から派生します。

このディスクタイプはテーブルの静的バージョンを保持することを可能にし、既存のデータに対してマージ操作を実行することを許可せず、新しいデータの挿入を許可しません。
このディスクタイプの使用例は、`BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')`を介してバックアップを作成することです。その後、`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`を実行することができます。

設定：
``` xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1`以降、`plain`メタデータタイプを使用して任意のオブジェクトストレージディスク（`s3`、`azure`、`hdfs`（サポートされていない）、`local`）を構成することが可能です。

設定：
``` xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>azure</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

### S3プレイン書き換えストレージの使用 {#s3-plain-rewritable-storage}
`24.4`では新しいディスクタイプ`s3_plain_rewritable`が導入されました。
`s3_plain`ディスクタイプと同様に、メタデータファイルに追加ストレージを必要とせず、代わりにメタデータはS3に保存されます。
`s3_plain`ディスクタイプとは異なり、`s3_plain_rewritable`はマージ操作を実行でき、INSERT操作をサポートします。
[変更](/sql-reference/statements/alter#mutations)やテーブルのレプリケーションはサポートされていません。

このディスクタイプの使用例は、非レプリケートの`MergeTree`テーブルです。`s3`ディスクタイプは非レプリケートのMergeTreeテーブルに適していますが、テーブルのローカルメタデータが不要で、限られた操作セットを受け入れる場合は、`s3_plain_rewritable`ディスクタイプを選択することができます。これは例えば、システムテーブルに役立ちます。

設定：
``` xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

は以下に等しいです：
``` xml
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

`MergeTree`ファミリーのテーブルエンジンは、`azure_blob_storage`タイプのディスクを使用して[Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)にデータを保存できます。

設定マークアップ：
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
* `storage_account_url` - **必須**、Azure Blob StorageアカウントURLとして`http://account.blob.core.windows.net`または`http://azurite1:10000/devstoreaccount1`の形式。
* `container_name` - 対象のコンテナ名で、デフォルトは`default-container`です。
* `container_already_exists` - `false`に設定すると、ストレージアカウント内に新しい`container_name`コンテナが作成され、`true`の場合は、ディスクがコンテナに直接接続され、未設定の場合はディスクがアカウントに接続し、`container_name`が存在するかチェックして、存在しない場合は作成します。

認証パラメータ（ディスクはすべての利用可能な方法**および**マネージドアイデンティティ資格情報を試みます）：
* `connection_string` - 接続文字列を使用した認証。
* `account_name`と`account_key` - 共有キーを使用した認証。

制限パラメータ（主に内部使用のため）：
* `s3_max_single_part_upload_size` - Blob Storageへの単一ブロックアップロードのサイズ制限。
* `min_bytes_for_seek` - シーク可能領域のサイズ制限。
* `max_single_read_retries` - Blob Storageからデータを読み取る試行回数の制限。
* `max_single_download_retries` - Blob Storageから読み取り可能なバッファをダウンロードする試行回数の制限。
* `thread_pool_size` - `IDiskRemote`が初期化されるスレッドの数の制限。
* `s3_max_inflight_parts_for_one_file` - 一つのオブジェクトに対して同時に実行できるputリクエストの数の制限。

その他のパラメータ：
* `metadata_path` - Blob Storageのメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は`/var/lib/clickhouse/disks/<disk_name>/`です。
* `skip_access_check` — trueの場合、ディスク起動時にディスクアクセスチェックが行われません。デフォルト値は`false`です。
* `read_resource` — このディスクへの[スケジュール](/operations/workload-scheduling.md)での読み取りリクエストに使うリソース名。デフォルト値は空文字列（このディスクに対してはIOスケジューリングが有効ではない）。
* `write_resource` — このディスクへの[スケジュール](/operations/workload-scheduling.md)での書き込みリクエストに使うリソース名。デフォルト値は空文字列（このディスクに対してはIOスケジューリングが有効ではない）。
* `metadata_keep_free_space_bytes` — メタデータディスクの予約された空きスペースの量。

動作する構成の例は統合テストディレクトリにあります（例: [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml)または[test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)を参照）。

:::note ゼロコピー複製は本番用ではありません
ClickHouseバージョン22.8以降では、ゼロコピー複製はデフォルトで無効です。この機能は本番環境での使用は推奨されません。
:::

## HDFSストレージの使用（サポートされていない） {#using-hdfs-storage-unsupported}

このサンプル設定では：
- ディスクは`hdfs`（サポートされていない）タイプです。
- データは`hdfs://hdfs1:9000/clickhouse/`にホストされています。

HDFSはサポートされていないため、使用時に問題が発生する可能性があります。問題が発生した場合は、修正のためのプルリクエストを自由に行ってください。

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

HDFSは隅のケースで動作しない可能性があることを考慮してください。

### データ暗号化の使用 {#encrypted-virtual-file-system}

[S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)、または[HDFS](#using-hdfs-storage-unsupported)（サポートされていない）外部ディスク、またはローカルディスクに保存されているデータを暗号化することができます。暗号化モードをオンにするには、設定ファイルにタイプ`encrypted`のディスクを定義し、データが保存されるディスクを選択する必要があります。`encrypted`ディスクは、書き込まれたファイルを自動的に暗号化し、暗号化されたディスクからファイルを読み取るときにそれらを自動的に復号化します。したがって、`encrypted`ディスクを通常のディスクと同じように操作できます。

ディスク設定の例：

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

例えば、ClickHouseがテーブルのデータを`store/all_1_1_0/data.bin`というファイルに`disk1`に書き込むと、そのファイルは物理ディスクの`/path1/store/all_1_1_0/data.bin`パスに実際に書き込まれます。

同じファイルを`disk2`に書き込む際には、暗号化モードで`/path1/path2/store/all_1_1_0/data.bin`の物理ディスクに実際に書き込まれます。

必須パラメータ：

- `type` — `encrypted`。そうでない場合、暗号化ディスクは作成されません。
- `disk` — データ保存用のディスクのタイプ。
- `key` — 暗号化および復号化用のキー。型: [Uint64](/sql-reference/data-types/int-uint.md)。キーを16進形でエンコードするために`key_hex`パラメータを使用できます。
    複数のキーを指定するには、`id`属性を使用できます（例を参照）。

オプションパラメータ：

- `path` — データが保存されるディスク上の場所へのパス。指定されていない場合、データはルートディレクトリに保存されます。
- `current_key_id` — 暗号化に使用されるキー。指定されたすべてのキーは復号化に使用でき、以前の暗号化データへのアクセスを維持しながら、他のキーに切り替えることができます。
- `algorithm` — [暗号化アルゴリズム](/sql-reference/statements/create/table.md/#create-query-encryption-codecs)。可能な値: `AES_128_CTR`、`AES_192_CTR`、`AES_256_CTR`。デフォルト値: `AES_128_CTR`。アルゴリズムによってキーの長さは異なります: `AES_128_CTR` — 16バイト、`AES_192_CTR` — 24バイト、`AES_256_CTR` — 32バイト。

ディスク設定の例：

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

バージョン22.3以降、ストレージ構成内のディスクに対してローカルキャッシュを構成することが可能です。
バージョン22.3 - 22.7では、キャッシュは`s3`ディスクタイプのみにサポートされています。バージョン>= 22.8では、キャッシュは任意のディスクタイプ: S3、Azure、ローカル、暗号化、などに対してサポートされます。
バージョン>= 23.5では、キャッシュはリモートディスクタイプのみ: S3、Azure、HDFS（サポートされていない）に対してサポートされます。
キャッシュは`LRU`キャッシュポリシーを使用します。

バージョン>= 22.8の構成例：

``` xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3設定 ...
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

バージョン22.8より前の構成例：

``` xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3設定 ...
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

ファイルキャッシュディスク設定：

これらの設定はディスク設定セクションで定義する必要があります。

- `path` - キャッシュディレクトリへのパス。デフォルト: なし。この設定は必須です。
- `max_size` - キャッシュの最大サイズ（バイトまたは可読形式で）、例えば`ki`、`Mi`、`Gi`など、例：`10Gi`（この形式は`22.10`バージョン以降から機能します）。制限に達すると、キャッシュファイルはキャッシュ排除ポリシーに従って排出されます。この設定は必須です。
- `cache_on_write_operations` - `write-through`キャッシュを有効にするための設定（データを任意の書き込み操作: `INSERT`クエリ、バックグラウンドマージでキャッシュします）。デフォルト: `false`。`write-through`キャッシュは、クエリごとに設定`enable_filesystem_cache_on_write_operations`を使用して無効にできます（キャッシュは、キャッシュ設定と対応するクエリ設定の両方が有効な場合のみ行われます）。
- `enable_filesystem_query_cache_limit` - クエリ内でダウンロードされるキャッシュのサイズを制限することを許可します（ユーザー設定 `max_query_cache_size` に依存）。デフォルト: `false`。

- `enable_cache_hits_threshold` - あるデータがキャッシュされる前に何回も読み込まれる必要があるかを定義する数値。デフォルト: `false`。このしきい値は `cache_hits_threshold` で定義できます。デフォルト: `0`、例えば、データは最初の読み込みでキャッシュされます。

- `enable_bypass_cache_with_threshold` - 要求された読み取り範囲がしきい値を超える場合、キャッシュを完全にスキップできるようにします。デフォルト: `false`。このしきい値は `bypass_cache_threshold` で定義できます。デフォルト: `268435456` (`256Mi`)。

- `max_file_segment_size` - 単一のキャッシュファイルの最大サイズ（バイト単位または読みやすい形式 `ki, Mi, Gi など`、例 `10Gi`）。デフォルト: `8388608` (`8Mi`)。

- `max_elements` - キャッシュファイルの数の上限。デフォルト: `10000000`。

- `load_metadata_threads` - 起動時にキャッシュメタデータをロードするために使用されるスレッドの数。デフォルト: `16`。

ファイルキャッシュ **クエリ/プロファイル設定**:

これらの設定の一部は、デフォルトまたはディスク構成設定で有効にされているキャッシュ機能をクエリ/プロファイルごとに無効にします。たとえば、ディスク構成でキャッシュを有効にし、クエリ/プロファイル設定で `enable_filesystem_cache` を `false` に設定することで、無効にできます。また、ディスク構成で `cache_on_write_operations` を `true` に設定することは、「書き込み通過」キャッシュが有効であることを意味します。しかし、特定のクエリでこの一般設定を無効にしたい場合、`enable_filesystem_cache_on_write_operations` を `false` に設定すると、特定のクエリ/プロファイルに対して書き込み操作キャッシュが無効になります。

- `enable_filesystem_cache` - ストレージポリシーが `cache` ディスクタイプで構成されていても、クエリごとにキャッシュを無効にすることを許可します。デフォルト: `true`。

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - クエリでキャッシュが既に存在する場合のみキャッシュを使用し、それ以外の場合はクエリデータがローカルキャッシュストレージに書き込まれないようにします。デフォルト: `false`。

- `enable_filesystem_cache_on_write_operations` - `書き込み通過` キャッシュを有効にします。この設定は、キャッシュ構成で `cache_on_write_operations` 設定が有効な場合のみ機能します。デフォルト: `false`。クラウドのデフォルト値: `true`。

- `enable_filesystem_cache_log` - `system.filesystem_cache_log` テーブルへのログ記録を有効にします。クエリごとのキャッシュ使用状況の詳細を表示します。特定のクエリに対してオンにすることができるか、プロファイルで有効にできます。デフォルト: `false`。

- `max_query_cache_size` - ローカルキャッシュストレージに書き込むことができるキャッシュサイズの上限。キャッシュ構成で `enable_filesystem_query_cache_limit` が有効である必要があります。デフォルト: `false`。

- `skip_download_if_exceeds_query_cache` - `max_query_cache_size` の動作を変更することを許可します。デフォルト: `true`。この設定がオンになっていて、クエリ中にキャッシュダウンロード制限に達した場合、これ以上キャッシュがキャッシュストレージにダウンロードされません。この設定がオフになっている場合、クエリ中にキャッシュダウンロード制限に達しても、キャッシュは以前にダウンロードされたデータを削除するコストで書き込まれ続けます。たとえば、第二の動作は `最も最近使用した` 動作を保持しつつ、クエリキャッシュ制限を維持させます。

**警告**
キャッシュ構成設定およびキャッシュクエリ設定は最新の ClickHouse バージョンに対応しており、古いバージョンではサポートされていない可能性があります。

キャッシュ **システムテーブル**:

- `system.filesystem_cache` - 現在のキャッシュの状態を示すシステムテーブル。

- `system.filesystem_cache_log` - クエリごとの詳細なキャッシュ使用状況を示すシステムテーブル。`enable_filesystem_cache_log` 設定が `true` に設定されている必要があります。

キャッシュ **コマンド**:

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` は `<cache_name>` が提供されていない場合のみサポートされています。

- `SHOW FILESYSTEM CACHES` -- サーバーで構成されたファイルシステムキャッシュのリストを表示します。（バージョン &lt;= `22.8` の場合、このコマンドは `SHOW CACHES` と呼ばれます）

```sql
SHOW FILESYSTEM CACHES
```

結果:

``` text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - 特定のキャッシュに対するキャッシュ構成および一般的な統計を表示します。キャッシュ名は `SHOW FILESYSTEM CACHES` コマンドから取得できます。（バージョン &lt;= `22.8` の場合、このコマンドは `DESCRIBE CACHE` と呼ばれます）

```sql
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

``` text
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

### 静的 Web ストレージの使用 (読み取り専用) {#web-storage}

これは読み取り専用のディスクです。そのデータは読み取るだけで、決して変更されません。このディスクに新しいテーブルをロードするには `ATTACH TABLE` クエリを使用します（以下の例を参照）。ローカルディスクは実際には使用されず、各 `SELECT` クエリは必要なデータを取得するために `http` リクエストを発生させます。テーブルデータのすべての変更は例外を引き起こすことになります。すなわち、次の種類のクエリは許可されません: [CREATE TABLE](/sql-reference/statements/create/table.md)、 [ALTER TABLE](/sql-reference/statements/alter/index.md)、 [RENAME TABLE](/sql-reference/statements/rename.md/#misc_operations-rename_table)、 [DETACH TABLE](/sql-reference/statements/detach.md)、および [TRUNCATE TABLE](/sql-reference/statements/truncate.md)。
Web ストレージは読み取り専用目的で使用できます。例として、サンプルデータのホスティングやデータの移行に利用されます。
ツール `clickhouse-static-files-uploader` は、指定されたテーブルのデータディレクトリを準備します（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。必要な各テーブルについて、そのファイルのディレクトリを取得できます。これらのファイルは、静的ファイルを持つ Web サーバーにアップロードできます。この準備が完了した後、`DiskWeb` を通じて任意の ClickHouse サーバーにこのテーブルをロードできます。

このサンプル構成では:
- ディスクタイプは `web`
- データは `http://nginx:80/test1/` にホストされている
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
Web データセットが定期的に使用されないと予想される場合、クエリ内で一時的にストレージを構成することも可能です。 [動的構成](#dynamic-configuration)を参照し、構成ファイルの編集をスキップします。
:::

:::tip
GitHub に [デモデータセット](https://github.com/ClickHouse/web-tables-demo) がホストされています。 Web ストレージのために独自のテーブルを準備するには、[clickhouse-static-files-uploader](/operations/storing-data.md/#storing-data-on-webserver) ツールを参照してください。
:::

この `ATTACH TABLE` クエリでは、提供された `UUID` がデータのディレクトリ名と一致しており、エンドポイントは生成された GitHub コンテンツの URL です。

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

テストケースの準備が整いました。この構成を config に追加する必要があります:

``` xml
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

必須パラメータ:

- `type` — `web`。さもなくばディスクは作成されません。
- `endpoint` — パス形式のエンドポイント URL。エンドポイント URL はデータが保存される場所へのルートパスを含む必要があります。

オプションのパラメータ:

- `min_bytes_for_seek` — 逐次読み取りの代わりにシーク操作を使用するための最小バイト数。デフォルト値: `1` Mb。
- `remote_fs_read_backoff_threshold` — リモートディスクからデータを読み取る際の最大待機時間。デフォルト値: `10000` 秒。
- `remote_fs_read_backoff_max_tries` — バックオフでの読み取り試行の最大回数。デフォルト値: `5`。

クエリが `DB:Exception Unreachable URL` という例外で失敗する場合、設定を調整してみることができます: [http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、 [http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、 [keep_alive_timeout](/operations/server-configuration-parameters/settings.md/#keep-alive-timeout)。

アップロード用のファイルを取得するには次のコマンドを実行します:
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>`（`--metadata-path` は `SELECT data_paths FROM system.tables WHERE name = 'table_name'` のクエリで確認できます）。

ファイルを `endpoint` 経由で読み込む場合、それらは `<endpoint>/store/` パスにロードする必要がありますが、設定には `endpoint` のみが含まれている必要があります。

サーバーがテーブルを起動時に読み込む際にディスクが利用できない URL があると、すべてのエラーがキャッチされます。この場合、エラーが発生した場合、テーブルは再ロード（可視化）されます: `DETACH TABLE table_name` -> `ATTACH TABLE table_name`。サーバー起動時にメタデータが正常にロードされた場合、テーブルは直ちに利用可能です。

単一の HTTP 読み取り中の最大試行回数を制限するには、 [http_max_single_read_retries](/operations/settings/settings.md/#http-max-single-read-retries) 設定を使用します。

### ゼロコピー複製（本番では未対応） {#zero-copy}

ゼロコピー複製は可能ですが推奨されていません。`S3` および `HDFS`（サポート外）ディスクでのゼロコピー複製は、データが複数のマシンにリモートで保存され、同期が必要な場合、メタデータ（データパーツへのパス）のみが複製され、データそのものは複製されないことを意味します。

:::note ゼロコピー複製は本番環境では未対応
ゼロコピー複製は、ClickHouse バージョン 22.8 以降、デフォルトで無効になっています。この機能は本番環境での使用は推奨されません。
:::
