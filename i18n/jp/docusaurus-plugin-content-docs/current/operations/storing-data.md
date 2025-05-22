---
'description': 'highlight-next-lineのドキュメント'
'sidebar_label': 'データを保存するための外部ディスク'
'sidebar_position': 68
'slug': '/operations/storing-data'
'title': 'External Disks for Storing Data'
---



データは、ClickHouseで処理されると通常、ClickHouseサーバーと同じマシンのローカルファイルシステムに保存されます。これは大容量のディスクを必要とし、十分に高価になる可能性があります。それを避けるために、リモートにデータを保存することができます。さまざまなストレージがサポートされています：
1. [Amazon S3](https://aws.amazon.com/s3/) オブジェクトストレージ。
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)。
3. サポートされていない: Hadoop分散ファイルシステム ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

:::note ClickHouseはまた、このページで説明されている外部ストレージオプションとは異なる外部テーブルエンジンをサポートしており、これにより一般的なファイルフォーマット（Parquetなど）で保存されたデータを読み取ることができますが、ここではClickHouse `MergeTree`ファミリまたは `Log`ファミリテーブルのストレージ構成を説明しています。
1. `Amazon S3` ディスクに保存されたデータで作業するには、[S3](/engines/table-engines/integrations/s3.md)テーブルエンジンを使用します。
2. Azure Blob Storageに保存されたデータで作業するには、[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md)テーブルエンジンを使用します。
3. サポートされていない: Hadoop分散ファイルシステムのデータで作業するには、[HDFS](/engines/table-engines/integrations/hdfs.md)テーブルエンジンを使用します。
:::
## 外部ストレージの設定 {#configuring-external-storage}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)および[Log](/engines/table-engines/log-family/log.md)ファミリのテーブルエンジンは、`S3`、`AzureBlobStorage`、`HDFS`（サポートされていません）にデータを保存できます。これはそれぞれ、`s3`、`azure_blob_storage`、`hdfs`（サポートされていません）タイプのディスクを使用します。

ディスク構成では次のことが求められます：
1. `type`セクションは `s3`、`azure_blob_storage`、`hdfs`（サポートされていません）、`local_blob_storage`、`web` のいずれかと等しくなければなりません。
2. 特定の外部ストレージタイプの設定。

24.1のClickHouseバージョンからは、新しい構成オプションを使用できるようになりました。
それには、次のことを指定する必要があります：
1. `type`は`object_storage`と等しくなければなりません。
2. `object_storage_type`は、`s3`、`azure_blob_storage`（または`24.3`からは単に`azure`）、`hdfs`（サポートされていません）、`local_blob_storage`（または`24.3`からは単に`local`）、`web`のいずれかと等しくなければなりません。
オプションとして`metadata_type`を指定できます（デフォルトでは`local`ですが）、`plain`、`web`、および`24.4`からは`plain_rewritable`に設定することもできます。
`plain`メタデータタイプの使用は[plain storage section](/operations/storing-data#plain-storage)で説明されており、`web`メタデータタイプは`web`オブジェクトストレージタイプでのみ使用できます。`local`メタデータタイプは、メタデータファイルをローカルに保存します（各メタデータファイルはオブジェクトストレージ内のファイルへのマッピングとそれに関する追加のメタ情報を含みます）。

例えば、構成オプション
```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

は（`24.1`からの）次の構成に等しいです：
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

は次の内容に等しいです：
```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

フルストレージ構成の例は次のようになります：
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

24.1のClickHouseバージョンからは、次のように設定できることもあります：
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

特定の種類のストレージをすべての`MergeTree`テーブルのデフォルトオプションにするには、構成ファイルに次のセクションを追加します：
```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

特定のストレージポリシーを特定のテーブルにのみ構成したい場合は、テーブルを作成する際に設定に定義できます：

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

事前に定義されたディスクなしで構成ファイルにストレージ構成を指定することも可能ですが、これは`CREATE`/`ATTACH`クエリの設定で構成できます。

以下の例のクエリは、上記の動的ディスク構成に基づいており、URLに保存されたテーブルからデータをキャッシュするためにローカルディスクを使用する方法を示しています。

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

以下の設定では、`type=web`のディスクが`type=cache`のディスク内にネストされていることに注意してください。

:::note
例では`type=web`を使用していますが、動的に構成できるディスクタイプは、ローカルディスクを含めて任意のディスクタイプです。ローカルディスクは、ディスクをサーバー構成パラメーター `custom_local_disks_base_directory`の中に配置するように、パス引数が必要です。デフォルトはありませんので、ローカルディスクを使用する際にはそれを設定する必要があります。
:::

構成ベースの構成とSQL定義の構成を組み合わせることも可能です：

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

ここで、`web`はサーバー構成ファイルからのものです：

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

必要なパラメータ：

- `endpoint` — S3エンドポイントURLで、`path`または`virtual hosted` [スタイル](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html)です。エンドポイントURLには、バケットとデータを保存するためのルートパスが含まれている必要があります。
- `access_key_id` — S3アクセのキーID。
- `secret_access_key` — S3シークレットアクセスキー。

オプションのパラメータ：

- `region` — S3リージョン名。
- `support_batch_delete` — バッチ削除がサポートされているかどうかを確認します。Google Cloud Storage (GCS)を使う場合は`false`に設定してください。GCSはバッチ削除をサポートしていないため、チェックを無効にすることでログにエラーメッセージが表示されるのを防ぎます。
- `use_environment_credentials` — 環境変数 AWS_ACCESS_KEY_ID および AWS_SECRET_ACCESS_KEY から AWS 認証情報を読み取ります。もし存在すれば、AWS_SESSION_TOKENも読み取ります。デフォルト値は`false`です。
- `use_insecure_imds_request` — `true`に設定されている場合、S3クライアントはAmazon EC2メタデータからクレデンシャルを取得する際に、不安定なIMDSリクエストを使用します。デフォルト値は`false`です。
- `expiration_window_seconds` — 有効期限ベースの認証情報が期限切れかどうかを確認するための猶予期間。オプションで、デフォルト値は`120`です。
- `proxy` — S3エンドポイントのプロキシ設定。`proxy`ブロック内の各`uri`要素は、プロキシURLを含む必要があります。
- `connect_timeout_ms` — ソケット接続タイムアウト（ミリ秒）。デフォルト値は`10秒`です。
- `request_timeout_ms` — リクエストタイムアウト（ミリ秒）。デフォルト値は`5秒`です。
- `retry_attempts` — リクエストが失敗した際のリトライ試行回数。デフォルト値は`10`です。
- `single_read_retries` — 読み取り中に接続が切断された時のリトライ試行回数。デフォルト値は`4`です。
- `min_bytes_for_seek` — 逐次読み取りの代わりにシーク操作を使用するための最小バイト数。デフォルト値は`1 Mb`です。
- `metadata_path` — S3用のメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は`/var/lib/clickhouse/disks/<disk_name>/`です。
- `skip_access_check` — `true`の場合、ディスク起動時にディスクアクセスチェックは実行されません。デフォルト値は`false`です。
- `header` — 指定されたHTTPヘッダーを与えられたエンドポイントへのリクエストに追加します。オプションで、複数回指定することができます。
- `server_side_encryption_customer_key_base64` — 指定された場合、SSE-C暗号化されたS3オブジェクトにアクセスするために必要なヘッダーが設定されます。
- `server_side_encryption_kms_key_id` — 指定された場合、[SSE-KMS暗号化](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)されたS3オブジェクトにアクセスするために必要なヘッダーが設定されます。空の文字列が指定された場合、AWSが管理するS3キーが使用されます。オプションです。
- `server_side_encryption_kms_encryption_context` — 指定された場合、`server_side_encryption_kms_key_id`と共に、SSE-KMSの暗号化コンテキストヘッダーが設定されます。オプションです。
- `server_side_encryption_kms_bucket_key_enabled` — 指定された場合、`server_side_encryption_kms_key_id`と共に、SSE-KMS用のS3バケットキーを有効にするためのヘッダーが設定されます。オプションで、`true`または`false`に設定でき、デフォルトは何も設定されていません（バケットレベルの設定に一致します）。
- `s3_max_put_rps` — スロットルをかける前の最大PUTリクエスト毎秒レート。デフォルト値は`0`（無制限）です。
- `s3_max_put_burst` — リクエスト毎秒の制限に達する前に同時に発行できるリクエストの最大数。デフォルト（`0`の値）は`s3_max_put_rps`と等しいです。
- `s3_max_get_rps` — スロットルをかける前の最大GETリクエスト毎秒レート。デフォルト値は`0`（無制限）です。
- `s3_max_get_burst` — リクエスト毎秒の制限に達する前に同時に発行できるリクエストの最大数。デフォルト（`0`の値）は`s3_max_get_rps`と等しいです。
- `read_resource` — このディスクへの読み取りリクエストの[スケジューリング](/operations/workload-scheduling.md)に使用されるリソース名。デフォルト値は空の文字列（このディスクではIOスケジューリングは有効になっていません）。
- `write_resource` — このディスクへの書き込みリクエストの[スケジューリング](/operations/workload-scheduling.md)に使用されるリソース名。デフォルト値は空の文字列（このディスクではIOスケジューリングは有効になっていません）。
- `key_template` — オブジェクトキーが生成される形式を定義します。デフォルトでは、ClickHouseは`endpoint`オプションから`root path`を取得し、ランダムに生成されたサフィックスを追加します。そのサフィックスは3つのランダムシンボルのディレクトリと29のランダムシンボルのファイル名です。このオプションを使用すれば、オブジェクトキーが生成される方法を完全に制御できます。一部の使用シナリオでは、接頭辞やオブジェクトキーの中にランダムシンボルを持つ必要があります。たとえば、`[a-z]{3}-prefix-random/constant-part/random-middle-[a-z]{3}/random-suffix-[a-z]{29}`のような形式です。この値は[`re2`](https://github.com/google/re2/wiki/Syntax)で解析されます。構文のサブセットのみがサポートされています。このオプションを使用する前に、必要な形式がサポートされているかどうか確認してください。ClickHouseが`key_template`の値からキーを生成できない場合、ディスクは初期化されません。[storage_metadata_write_full_object_key](/operations/storing-data#s3-storage)の機能フラグが有効である必要があります。これにより、`endpoint`オプションで`root path`の宣言が禁止されます。`key_compatibility_prefix`オプションの定義が必要です。
- `key_compatibility_prefix` — このオプションは`key_template`オプションを使う場合に必要です。メタデータファイルに保存されたオブジェクトキーを読み取るために、メタデータバージョンが`VERSION_FULL_OBJECT_KEY`未満であるものを、この`endpoint`オプションの以前の`root path`をここに設定する必要があります。

:::note
Google Cloud Storage (GCS)も、`s3`タイプを使用してサポートされています。詳細は[GCS backed MergeTree](/integrations/gcs)をご覧ください。
:::
### プレーンストレージの使用 {#plain-storage}

`22.10`では、新しいディスクタイプ`s3_plain`が導入され、ワンタイム書き込みストレージを提供します。構成パラメータは`s3`ディスクタイプと同じです。
`s3`ディスクタイプとは異なり、それはデータをそのまま保存します。つまり、ランダムに生成されたブロブ名の代わりに、通常のファイル名を使用し（ClickHouseがローカルディスクにファイルを保存するのと同じ方法）、ローカルにメタデータを保存しません。たとえば、メタデータはS3上のデータから導出されます。

このディスクタイプを使用すると、テーブルの静的バージョンを保持できるため、既存のデータでマージを実行できず、新しいデータの挿入もできません。
このディスクタイプの使用例は、`BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')`を介してバックアップを作成することです。その後、`RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`を実行したり、`ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`を使用することができます。

構成：
```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1`からは、`plain`メタデータタイプを使用して任意のオブジェクトストレージディスク（`s3`、`azure`、`hdfs`（サポートされていません）、`local`）を構成することが可能です。

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
### S3プレーンリライト可能ストレージの使用 {#s3-plain-rewritable-storage}

新しいディスクタイプ`s3_plain_rewritable`が`24.4`で導入されました。
`s3_plain`ディスクタイプと同様に、メタデータファイルのための追加のストレージは必要とせず、メタデータはS3に保存されます。
`s3_plain`ディスクタイプとは異なり、`s3_plain_rewritable`はマージを実行し、INSERT操作をサポートします。
[変異](https://sql-reference/statements/alter#mutations)やテーブルのレプリケーションはサポートされていません。

このディスクタイプの使用例は、レプリケートされていない`MergeTree`テーブルです。`s3`ディスクタイプは非レプリケートのMergeTreeテーブルに適していますが、テーブルのローカルメタデータが不要で、限られた操作セットを受け入れることができる場合には、`s3_plain_rewritable`ディスクタイプを選択できます。これは、たとえばシステムテーブルに役立つかもしれません。

構成：
```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

は次の内容に等しいです：
```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

`24.5`からは、`plain_rewritable`メタデータタイプを使用して任意のオブジェクトストレージディスク（`s3`、`azure`、`local`）を構成することが可能です。
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

接続パラメータ：
* `storage_account_url` - **必須**、Azure Blob StorageアカウントのURL、例えば`http://account.blob.core.windows.net`または`http://azurite1:10000/devstoreaccount1`。
* `container_name` - 対象のコンテナ名。デフォルトは`default-container`です。
* `container_already_exists` - `false`に設定されている場合、新しいコンテナ`container_name`がストレージアカウントに作成されます。`true`に設定されている場合、ディスクはコンテナに直接接続され、設定されていない場合は、ディスクはアカウントに接続され、コンテナ`container_name`が存在するか確認し、存在しない場合は作成します。

認証パラメータ（ディスクはすべての利用可能な方法 **および** 管理されたアイデンティティ認証情報を試みます）：
* `connection_string` - 接続文字列を使用した認証。
* `account_name`と`account_key` - 共有キーを使用した認証。

制限パラメータ（主に内部使用のため）：
* `s3_max_single_part_upload_size` - Blobストレージへの単一ブロックアップロードのサイズを制限します。
* `min_bytes_for_seek` - シーク可能な領域のサイズを制限します。
* `max_single_read_retries` - Blobストレージからデータチャンクを読み込むための試行回数を制限します。
* `max_single_download_retries` - Blobストレージから可読バッファをダウンロードするための試行回数を制限します。
* `thread_pool_size` - `IDiskRemote`がインスタンス化されるスレッドの数を制限します。
* `s3_max_inflight_parts_for_one_file` - 一つのオブジェクトに対して同時に実行できるPUTリクエストの数を制限します。

その他のパラメータ：
* `metadata_path` - Blobストレージ用のメタデータファイルを保存するためのローカルFS上のパス。デフォルト値は`/var/lib/clickhouse/disks/<disk_name>/`です。
* `skip_access_check` — `true`の場合、ディスク起動時にディスクアクセスチェックは実行されません。デフォルト値は`false`です。
* `read_resource` — このディスクへの読み取りリクエストの[スケジューリング](/operations/workload-scheduling.md)に使用されるリソース名。デフォルト値は空の文字列（このディスクではIOスケジューリングは有効になっていません）。
* `write_resource` — このディスクへの書き込みリクエストの[スケジューリング](/operations/workload-scheduling.md)に使用されるリソース名。デフォルト値は空の文字列（このディスクではIOスケジューリングは有効になっていません）。
* `metadata_keep_free_space_bytes` - メタデータディスクに予約されるべき空きスペースの量。

動作する構成の例は統合テストディレクトリにあります（例えば、[test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) または [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)参照）。

:::note ゼロコピーのレプリケーションは本番用ではありません
ゼロコピーのレプリケーションは、ClickHouseバージョン22.8以降でデフォルトで無効です。この機能は、本番用途での使用を推奨しません。
:::
## HDFSストレージの使用（サポートされていません） {#using-hdfs-storage-unsupported}

このサンプル構成では、
- ディスクは`hdfs`（サポートされていません）タイプです
- データは`hdfs://hdfs1:9000/clickhouse/`にホストされています

HDFSはサポートされていないため、使用時に問題が発生する可能性があります。問題が発生した場合は、修正を行うためにプルリクエストを気軽に作成してください。

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

HDFSは、コーナーケースが存在する場合には機能しない可能性があることに注意してください。
### データ暗号化の使用 {#encrypted-virtual-file-system}

[オブジェクトストレージに保存されたデータを暗号化できます](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)または[HDFS](#using-hdfs-storage-unsupported)（サポートされていません）外部ディスクまたはローカルディスクに保存されたデータを暗号化できます。暗号化モードをオンにするには、構成ファイルでタイプ`encrypted`のディスクを定義し、データが保存されるディスクを選択する必要があります。`encrypted`ディスクは、書き込まれたファイルをすべて自動的に暗号化し、暗号化されたディスクからファイルを読み取ると自動的に復号されます。したがって、`encrypted`ディスクを通常のディスクのように操作できます。

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

たとえば、ClickHouseが`store/all_1_1_0/data.bin`というファイルにテーブルからデータを書き込むと、実際にはこのファイルは物理ディスクの`/path1/store/all_1_1_0/data.bin`パスに書き込まれます。

同じファイルを`disk2`に書き込むと、実際にはそのファイルは暗号化モードで物理ディスクの`/path1/path2/store/all_1_1_0/data.bin`パスに書き込まれます。

必要なパラメータ：

- `type` — `encrypted`。そうでなければ、暗号化ディスクは作成されません。
- `disk` — データ保存のためのディスクタイプ。
- `key` — 暗号化と復号化に使用するキー。タイプ: [Uint64](/sql-reference/data-types/int-uint.md)。キーを16進数形式でエンコードするために`key_hex`パラメータを使用できます。
    いくつかのキーを`id`属性を使って指定することができます（以下の例を参照）。

オプションのパラメータ：

- `path` — データが保存される位置のディスク上のパス。指定されていない場合、データはルートディレクトリに保存されます。
- `current_key_id` — 暗号化に使用されるキー。指定されたすべてのキーは復号に使用でき、アクセスできるデータを保持しながら常に別のキーに切り替えることができます。
- `algorithm` — [アルゴリズム](/sql-reference/statements/create/table#encryption-codecs)による暗号化。可能な値: `AES_128_CTR`、`AES_192_CTR`または`AES_256_CTR`。デフォルト値: `AES_128_CTR`。キーの長さはアルゴリズムによります：`AES_128_CTR` — 16バイト、`AES_192_CTR` — 24バイト、`AES_256_CTR` — 32バイト。

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
### Using local cache {#using-local-cache}

バージョン 22.3 以降、ストレージ構成でディスクに対するローカルキャッシュを構成することが可能です。バージョン 22.3 から 22.7 では、キャッシュは `s3` ディスクタイプのみに対応しています。バージョン >= 22.8 では、キャッシュは任意のディスクタイプ（S3、Azure、ローカル、暗号化など）でサポートされています。バージョン >= 23.5 では、キャッシュはリモートディスクタイプ（S3、Azure、HDFS）でのみサポートされています（未サポート）。キャッシュは `LRU` キャッシュポリシーを使用します。

バージョン 22.8 以降の構成例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 構成 ...
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

バージョン 22.8 未満の構成例：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 構成 ...
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

ファイルキャッシュの **ディスク構成設定**：

これらの設定はディスク構成セクションで定義する必要があります。

- `path` - キャッシュのディレクトリへのパス。デフォルト：なし。この設定は必須です。

- `max_size` - キャッシュの最大サイズ（バイト単位または可読形式、例：`ki, Mi, Gi` など）。例 `10Gi` （この形式は `22.10` バージョン以降で動作します）。制限に達した場合、キャッシュファイルはキャッシュ排除ポリシーに従って排除されます。デフォルト：なし。この設定は必須です。

- `cache_on_write_operations` - `write-through` キャッシュをオンにすることを許可します（`INSERT` クエリ、バックグラウンドマージによるすべての書き込み操作でデータをキャッシュします）。デフォルト：`false`。`write-through` キャッシュは、設定 `enable_filesystem_cache_on_write_operations` を使用してクエリごとに無効にできます（キャッシュは、キャッシュ構成設定と対応するクエリ設定の両方が有効な場合にのみ行われます）。

- `enable_filesystem_query_cache_limit` - 各クエリ内でダウンロードされるキャッシュのサイズを制限することを許可します（ユーザー設定 `max_query_cache_size` に依存します）。デフォルト：`false`。

- `enable_cache_hits_threshold` - あるデータをキャッシュする前に、何回読まれる必要があるかを定義する数値。デフォルト：`false`。このしきい値は `cache_hits_threshold` で定義できます。デフォルト：`0` （データは最初の読み取りアタックでキャッシュされます）。

- `enable_bypass_cache_with_threshold` - 要求された読み取り範囲がしきい値を超えた場合に、キャッシュを完全にスキップできるようにします。デフォルト：`false`。このしきい値は `bypass_cache_threashold` で定義できます。デフォルト：`268435456` （`256Mi`）。

- `max_file_segment_size` - 単一キャッシュファイルの最大サイズ（バイト単位または可読形式 [`ki, Mi, Gi` など]、例 `10Gi`）。デフォルト：`8388608` （`8Mi`）。

- `max_elements` - キャッシュファイルの数の制限。デフォルト：`10000000`。

- `load_metadata_threads` - 起動時にキャッシュメタデータを読み込むために使用されるスレッドの数。デフォルト：`16`。

ファイルキャッシュの **クエリ/プロファイル設定**：

これらの設定のいくつかは、ディスク構成設定でデフォルトで有効になっているキャッシュ機能をクエリ/プロファイルごとに無効にします。たとえば、ディスク構成でキャッシュを有効にし、クエリ/プロファイル設定 `enable_filesystem_cache` を `false` に設定して無効にすることができます。また、ディスク構成で `cache_on_write_operations` を `true` に設定すると、「write-through」キャッシュが有効になります。しかし、特定のクエリに対してこの一般的な設定を無効にする必要がある場合、`enable_filesystem_cache_on_write_operations` を `false` に設定すると、その特定のクエリ/プロファイルの書き込み操作キャッシュが無効になります。

- `enable_filesystem_cache` - ストレージポリシーが `cache` ディスクタイプで構成されていても、クエリごとにキャッシュを無効にすることを許可します。デフォルト：`true`。

- `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` - キャッシュが既に存在する場合のみ、クエリでキャッシュを使用できるようにします。そうでない場合、クエリデータはローカルキャッシュストレージに書き込まれません。デフォルト：`false`。

- `enable_filesystem_cache_on_write_operations` - `write-through` キャッシュをオンにします。この設定はキャッシュ構成の `cache_on_write_operations` 設定がオンになっている場合にのみ機能します。デフォルト：`false`。クラウドのデフォルト値：`true`。

- `enable_filesystem_cache_log` - `system.filesystem_cache_log` テーブルへのログ記録をオンにします。クエリごとのキャッシュ使用の詳細なビューを提供します。特定のクエリでオンにすることも、プロファイルで有効にすることもできます。デフォルト：`false`。

- `max_query_cache_size` - ローカルキャッシュストレージに書き込むことができるキャッシュサイズの制限。キャッシュ構成で `enable_filesystem_query_cache_limit` が有効でなければなりません。デフォルト：`false`。

- `skip_download_if_exceeds_query_cache` - `max_query_cache_size` 設定の動作を変更できるようにします。デフォルト：`true`。この設定がオンの場合、クエリ中にキャッシュダウンロード制限に達すると、これ以上のキャッシュはキャッシュストレージにダウンロードされません。この設定がオフの場合、クエリ中にキャッシュダウンロード制限に達すると、キャッシュは以前にダウンロードされたデータを排除するコストで書き込まれます（現在のクエリ内で）。たとえば、これにより「最近使用された」動作を保持しながらクエリキャッシュ制限を維持できます。

**警告**
キャッシュ構成設定とキャッシュクエリ設定は最新の ClickHouse バージョンに対応しています。以前のバージョンでは、いくつかの機能がサポートされていない場合があります。

キャッシュ **システムテーブル**：

- `system.filesystem_cache` - 現在のキャッシュの状態を示すシステムテーブルです。

- `system.filesystem_cache_log` - クエリごとの詳細なキャッシュ使用状況を示すシステムテーブルです。設定 `enable_filesystem_cache_log` が `true` である必要があります。

キャッシュ **コマンド**：

- `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `<cache_name>` が提供されていないときのみ `ON CLUSTER` がサポートされます。

- `SHOW FILESYSTEM CACHES` -- サーバーに構成されているファイルシステムキャッシュのリストを表示します。（バージョン &lt;= `22.8` では、コマンドは `SHOW CACHES` と呼ばれます）

```sql
SHOW FILESYSTEM CACHES
```

結果：

```text
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

- `DESCRIBE FILESYSTEM CACHE '<cache_name>'` - 特定のキャッシュの構成およびいくつかの一般統計を表示します。キャッシュ名は `SHOW FILESYSTEM CACHES` コマンドから取得できます。（バージョン &lt;= `22.8` では、コマンドは `DESCRIBE CACHE` と呼ばれます）

```sql
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

キャッシュの現在のメトリクス：

- `FilesystemCacheSize`

- `FilesystemCacheElements`

キャッシュの非同期メトリクス：

- `FilesystemCacheBytes`

- `FilesystemCacheFiles`

キャッシュのプロファイルイベント：

- `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes,`

- `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds`

- `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`

- `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`

### Using static Web storage (read-only) {#web-storage}

これは読み取り専用のディスクです。そのデータは読み取られるだけで、決して変更されることはありません。このディスクに新しいテーブルは `ATTACH TABLE` クエリを介してロードされます（以下の例を参照）。ローカルディスクは実際には使用されず、各 `SELECT` クエリは、必要なデータを取得するための `http` リクエストになります。テーブルデータのすべての修正は例外を引き起こします。つまり、次のタイプのクエリは許可されていません：[CREATE TABLE](/sql-reference/statements/create/table.md)、[ALTER TABLE](/sql-reference/statements/alter/index.md)、[RENAME TABLE](/sql-reference/statements/rename#rename-table)、[DETACH TABLE](/sql-reference/statements/detach.md) および [TRUNCATE TABLE](/sql-reference/statements/truncate.md)。 Web ストレージは読み取り専用の目的で使用できます。たとえば、サンプルデータをホスティングしたり、データを移行するために使用されます。 `clickhouse-static-files-uploader` ツールがあり、特定のテーブルのためにデータディレクトリを準備します（`SELECT data_paths FROM system.tables WHERE name = 'table_name'`）。必要な各テーブルに対して、ファイルのディレクトリを取得します。これらのファイルは、たとえば、静的ファイルを持つ Web サーバーにアップロードできます。この準備の後、`DiskWeb` を介して任意の ClickHouse サーバーにこのテーブルをロードできます。

このサンプル構成では：
- ディスクのタイプは `web`
- データは `http://nginx:80/test1/` にホストされています。
- ローカルストレージにキャッシュが使用されます。

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
ウェブデータセットが通常使用されないと予想される場合、クエリ内で一時的にストレージを構成することもできます。詳細は [動的構成](#dynamic-configuration) を参照し、構成ファイルの編集をスキップしてください。
:::

:::tip
[デモデータセット](https://github.com/ClickHouse/web-tables-demo)が GitHub にホストされています。ウェブストレージ用の独自のテーブルを準備するには、ツール [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader) を参照してください。
:::

この `ATTACH TABLE` クエリでは、提供された `UUID` がデータのディレクトリ名と一致し、エンドポイントは GitHub の生データの URL です。

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

準備されたテストケースです。この構成を config に追加する必要があります：

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

そして、このクエリを実行します：

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

- `type` — `web`。さもなければディスクは作成されません。
- `endpoint` — `path` 形式のエンドポイント URL。エンドポイント URL には、データを保存するルートパスが含まれている必要があります。アップロードされた場所です。

オプションのパラメータ：

- `min_bytes_for_seek` — 逐次読み取りではなく、シーク操作を使用するための最小バイト数。デフォルト値：`1` Mb。
- `remote_fs_read_backoff_threashold` — リモートディスクのデータを読み取る際の最大待機時間。デフォルト値：`10000` 秒。
- `remote_fs_read_backoff_max_tries` — バックオフを伴う最大読み取り試行回数。デフォルト値：`5`。

クエリが `DB:Exception Unreachable URL` という例外で失敗した場合、設定を調整してみることができます：[http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout)、[http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout)、[keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout)。

アップロード用のファイルを取得するには、次のコマンドを実行します：
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>` （`--metadata-path` は `SELECT data_paths FROM system.tables WHERE name = 'table_name'` クエリで見つけることができます）。

`endpoint` によってファイルを読み込む場合、それらは `<endpoint>/store/` パスに読み込む必要がありますが、構成にはエンドポイントのみを含める必要があります。

サーバがテーブルを起動する際にディスクの読み込み時に URL にアクセスできない場合、すべてのエラーが捕捉されます。この場合にエラーが発生した場合、テーブルは再読み込み（表示されるようになります）することができます：`DETACH TABLE table_name` -> `ATTACH TABLE table_name`。サーバの起動時にメタデータが正常に読み込まれた場合、テーブルはすぐに利用可能になります。

[http_max_single_read_retries](/operations/storing-data#web-storage) 設定を使用して、単一の HTTP 読み込み中の最大再試行回数を制限します。

### Zero-copy Replication (not ready for production) {#zero-copy}

ゼロコピー複製は可能ですが、推奨されません。`S3` および `HDFS`（未サポート）ディスクに関してです。ゼロコピー複製とは、データがいくつかのマシンにリモートで保存され、同期する必要がある場合、データ自体ではなくメタデータ（データパーツへのパス）が複製されることを意味します。

:::note ゼロコピー複製は本番環境向けではない
ゼロコピー複製は、ClickHouse バージョン 22.8 以降、デフォルトで無効になっています。この機能は本番環境での使用は推奨されていません。
:::
