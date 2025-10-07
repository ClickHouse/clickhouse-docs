---
'sidebar_label': 'dlt'
'keywords':
- 'clickhouse'
- 'dlt'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
'description': 'dlt統合を使ってClickhouseにデータをロードする'
'title': 'dltをClickHouseに接続'
'slug': '/integrations/data-ingestion/etl-tools/dlt-and-clickhouse'
'doc_type': 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# dltをClickHouseに接続する

<CommunityMaintainedBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> は、様々な乱雑なデータソースから、よく構造化されたライブデータセットにデータをロードするためにPythonスクリプトに追加できるオープンソースライブラリです。

## ClickHouseでdltをインストール {#install-dlt-with-clickhouse}

### `dlt`ライブラリをClickHouse依存関係とともにインストールする方法: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]"
```

## セットアップガイド {#setup-guide}

### 1. dltプロジェクトの初期化 {#1-initialize-the-dlt-project}

以下のように、新しい`dlt`プロジェクトを初期化します:
```bash
dlt init chess clickhouse
```

:::note
このコマンドは、ソースとしてチェスを、宛先としてClickHouseを使用して、パイプラインを初期化します。
:::

上記のコマンドは、`.dlt/secrets.toml`やClickHouseのための要件ファイルを含むいくつかのファイルとディレクトリを生成します。要件ファイルに指定された必要な依存関係を次のようにして実行することでインストールできます:
```bash
pip install -r requirements.txt
```

または、`pip install dlt[clickhouse]`を使用して、`dlt`ライブラリとClickHouse宛先用の必要な依存関係をインストールします。

### 2. ClickHouseデータベースのセットアップ {#2-setup-clickhouse-database}

ClickHouseにデータをロードするには、ClickHouseデータベースを作成する必要があります。以下はそのための大まかな手順です:

1. 既存のClickHouseデータベースを使用するか、新しいデータベースを作成できます。

2. 新しいデータベースを作成するには、`clickhouse-client`コマンドラインツールまたは選択したSQLクライアントを使用してClickHouseサーバーに接続します。

3. 新しいデータベース、ユーザーを作成し、必要な権限を付与するために次のSQLコマンドを実行します:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 3. 認証情報の追加 {#3-add-credentials}

次に、`.dlt/secrets.toml`ファイルにClickHouseの認証情報を以下のように設定します:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # The database name you created
username = "dlt"                         # ClickHouse username, default is usually "default"
password = "Dlt*12345789234567"          # ClickHouse password if any
host = "localhost"                       # ClickHouse server host
port = 9000                              # ClickHouse HTTP port, default is 9000
http_port = 8443                         # HTTP Port to connect to ClickHouse server's HTTP interface. Defaults to 8443.
secure = 1                               # Set to 1 if using HTTPS, else 0.

[destination.clickhouse]
dataset_table_separator = "___"          # Separator for dataset table names from dataset.
```

:::note
HTTP_PORT
`http_port`パラメータは、ClickHouseサーバーのHTTPインターフェースに接続する際に使用するポート番号を指定します。これは、ネイティブTCPプロトコルに使用されるデフォルトのポート9000とは異なります。

外部ステージングを使用しない場合（すなわち、パイプラインでステージングパラメータを設定しない場合）には、`http_port`を設定する必要があります。これは、組み込みのClickHouseローカルストレージステージングが、HTTPを介してClickHouseと通信する<a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a>ライブラリを使用しているためです。

指定されたポートでHTTP接続を受け入れるようにClickHouseサーバーが構成されていることを確認してください。例えば、`http_port = 8443`を設定した場合、ClickHouseはポート8443でHTTPリクエストを待っている必要があります。外部ステージングを使用している場合は、clickhouse-connectが使用されないため、`http_port`パラメータを省略できます。
:::

`clickhouse-driver`ライブラリが使用するのと似たデータベース接続文字列を渡すことができます。上記の認証情報は次のようになります:

```bash

# keep it at the top of your toml file, before any section starts.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

## 書き込みの方法 {#write-disposition}

すべての[書き込み方法](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)がサポートされています。

dltライブラリの書き込み方法は、データを宛先にどのように書き込むかを定義します。書き込み方法には次の3種類があります：

**Replace**: この方法は、リソースからのデータで宛先のデータを置き換えます。すべてのクラスとオブジェクトを削除し、データをロードする前にスキーマを再作成します。詳細については<a href="https://dlthub.com/docs/general-usage/full-loading">こちら</a>をご覧ください。

**Merge**: この書き込み方法は、リソースのデータと宛先のデータをマージします。`merge`方法では、リソースの`primary_key`を指定する必要があります。詳細については<a href="https://dlthub.com/docs/general-usage/incremental-loading">こちら</a>をご覧ください。

**Append**: これはデフォルトの方法です。データは、宛先の既存データに追加され、`primary_key`フィールドは無視されます。

## データのロード {#data-loading}
データは、データソースに応じて最も効率的な方法を使用してClickHouseにロードされます：

- ローカルファイルに関しては、`clickhouse-connect`ライブラリを使用して、`INSERT`コマンドを使用してClickHouseテーブルにファイルを直接ロードします。
- リモートストレージ（`S3`、`Google Cloud Storage`、`Azure Blob Storage`など）のファイルでは、ClickHouseテーブル関数（s3、gcs、azureBlobStorageなど）が使用され、ファイルを読み込み、データをテーブルに挿入します。

## データセット {#datasets}

`Clickhouse`は1つのデータベースに複数のデータセットをサポートしていませんが、`dlt`は様々な理由からデータセットに依存しています。`Clickhouse`を`dlt`と共に機能させるために、`Clickhouse`データベース内に`dlt`によって生成されたテーブルは、データセット名で接頭辞が付けられ、設定可能な`dataset_table_separator`によって区切られます。さらに、データを含まない特別なセンチネルテーブルが作成され、`dlt`が`Clickhouse`宛先に既に存在する仮想データセットを認識できるようになります。

## サポートされているファイル形式 {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a>は、直接のロードとステージングの両方において推奨される形式です。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a>は、直接のロードとステージングの両方をサポートしています。

`clickhouse`宛先には、デフォルトのSQL宛先からいくつかの特定の偏差があります：

1. `Clickhouse`には実験的な`object`データ型がありますが、若干予測不可能であることが明らかになったため、dlt Clickhouse宛先では複雑なデータ型をテキスト列としてロードします。この機能が必要な場合は、私たちのSlackコミュニティに連絡し、追加を検討します。
2. `Clickhouse`は`time`データ型をサポートしていません。時間は`text`列にロードされます。
3. `Clickhouse`は`binary`データ型をサポートしていません。そのため、バイナリデータは`text`列にロードされます。`jsonl`からのロードでは、バイナリデータはbase64文字列になります。parquetからロードするとき、`binary`オブジェクトは`text`に変換されます。
5. `Clickhouse`は、nullでない populatedなテーブルにカラムを追加することを許可しています。
6. `Clickhouse`は、floatまたはdoubleデータ型を使用している場合、特定の条件下で丸めエラーを生成する可能性があります。丸めエラーが許容できない場合は、decimalデータ型を使用してください。例えば、`jsonl`にて12.7001の値をdouble列にロードすると、予測可能な丸めエラーが発生します。

## サポートされているカラムヒント {#supported-column-hints}
ClickHouseは次の<a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">カラムヒント</a>をサポートしています：

- `primary_key` - カラムを主キーの一部としてマークします。複数のカラムがこのヒントを持つことで、複合主キーを作成できます。

## テーブルエンジン {#table-engine}
デフォルトでは、ClickHouseでは`ReplicatedMergeTree`テーブルエンジンを使用してテーブルが作成されます。clickhouseアダプタを使用して、代替のテーブルエンジンを`table_engine_type`で指定できます：

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

サポートされている値は次のとおりです：

- `merge_tree` - `MergeTree`エンジンを使用してテーブルを作成します。
- `replicated_merge_tree` （デフォルト） - `ReplicatedMergeTree`エンジンを使用してテーブルを作成します。

## ステージングサポート {#staging-support}

ClickHouseは、Amazon S3、Google Cloud Storage、Azure Blob Storageをファイルのステージング宛先としてサポートしています。

`dlt`は、Parquetまたはjsonlファイルをステージング場所にアップロードし、ClickHouseテーブル関数を使用して、ステージングされたファイルから直接データをロードします。

ステージング宛先の認証情報を構成する方法については、ファイルシステムのドキュメントを参照してください：

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

ステージングが有効な状態でパイプラインを実行するには：

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```

### Google Cloud Storageをステージングエリアとして使用する {#using-google-cloud-storage-as-a-staging-area}
dltは、ClickHouseにデータをロードする際にGoogle Cloud Storage（GCS）をステージングエリアとして使用することをサポートしています。これは、ClickHouseの<a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCSテーブル関数</a>によって自動的に処理され、dltが内部で使用します。

clickhouseのGCSテーブル関数は、ハッシュベースのメッセージ認証コード（HMAC）キーを使用した認証のみをサポートしています。これを有効にするために、GCSはAmazon S3 APIをエミュレートするS3互換モードを提供しています。ClickHouseは、これを利用してGCSバケットにS3統合を通じてアクセスします。

dltでHMAC認証を使用したGCSステージングを設定するには：

1. <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloudガイド</a>に従って、GCSサービスアカウントのHMACキーを作成します。

2. dltプロジェクトのClickHouse宛先設定で、HMACキーとともに`client_email`、`project_id`、`private_key`を設定します`config.toml`に：

```bash
[destination.filesystem]
bucket_url = "gs://dlt-ci"

[destination.filesystem.credentials]
project_id = "a-cool-project"
client_email = "my-service-account@a-cool-project.iam.gserviceaccount.com"
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkaslkdjflasjnkdcopauihj...wEiEx7y+mx\nNffxQBqVVej2n/D93xY99pM=\n-----END PRIVATE KEY-----\n"

[destination.clickhouse.credentials]
database = "dlt"
username = "dlt"
password = "Dlt*12345789234567"
host = "localhost"
port = 9440
secure = 1
gcp_access_key_id = "JFJ$$*f2058024835jFffsadf"
gcp_secret_access_key = "DFJdwslf2hf57)%$02jaflsedjfasoi"
```

注意：HMACキー`bashgcp_access_key_id`と`gcp_secret_access_key`に加え、サービスアカウントの`client_email`、`project_id`、`private_key`を`[destination.filesystem.credentials]`の下に提供する必要があります。これは、GCSステージングサポートが一時的な回避策として実装されており、まだ最適化されていないためです。

dltはこれらの認証情報をClickHouseに渡し、認証とGCSアクセスを処理させます。

将来的にClickHouse dlt宛先のGCSステージングのセットアップを簡素化し改善するための作業が進行中です。適切なGCSステージングサポートは、以下のGitHub課題で追跡されています：

- ファイルシステム宛先<a href="https://github.com/dlt-hub/dlt/issues/1272">が機能</a>するようにgcsのS3互換モードで
- Google Cloud Storageステージングエリア<a href="https://github.com/dlt-hub/dlt/issues/1181">のサポート</a>

### Dbtサポート {#dbt-support}
<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a>との統合は、dbt-clickhouseを介して一般的にサポートされています。

### `dlt`状態の同期 {#syncing-of-dlt-state}
この宛先は、<a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a>状態の同期を完全にサポートしています。
