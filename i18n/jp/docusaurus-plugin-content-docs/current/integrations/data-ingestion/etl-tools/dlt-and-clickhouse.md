---
sidebar_label: dlt
keywords: [clickhouse, dlt, connect, integrate, etl, data integration]
description: ClickHouseへのデータをdlt統合を使用してロードします
---


# dltをClickHouseに接続する

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a>は、さまざまなデータソースからデータを整然としたライブデータセットにロードするためにPythonスクリプトに追加できるオープンソースライブラリです。

## ClickHouseと共にdltをインストールする {#install-dlt-with-clickhouse}

### ClickHouseの依存関係を持つ`dlt`ライブラリをインストールするには: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]" 
```

## セットアップガイド {#setup-guide}

### 1. dltプロジェクトを初期化する {#1-initialize-the-dlt-project}

新しい`dlt`プロジェクトを初期化するには、以下のコマンドを使用します:
```bash
dlt init chess clickhouse
```

:::note
このコマンドは、chessをソースとして、ClickHouseを宛先としてパイプラインを初期化します。
:::

上記のコマンドは、`.dlt/secrets.toml`やClickHouse用の要件ファイルなど、いくつかのファイルやディレクトリを生成します。要件ファイルに指定された必要な依存関係は、以下のコマンドを実行することでインストールできます:
```bash
pip install -r requirements.txt
```

または、`pip install dlt[clickhouse]`を使用して、`dlt`ライブラリとClickHouseを宛先として使用するための必要な依存関係をインストールします。

### 2. ClickHouseデータベースのセットアップ {#2-setup-clickhouse-database}

ClickHouseにデータをロードするには、ClickHouseデータベースを作成する必要があります。以下は、行うべきおおまかな手順です:

1. 既存のClickHouseデータベースを使用するか、新しいデータベースを作成できます。

2. 新しいデータベースを作成するには、`clickhouse-client`コマンドラインツールまたは好みのSQLクライアントを使用してClickHouseサーバーに接続します。

3. 新しいデータベース、ユーザーを作成し、必要な権限を付与するために、以下のSQLコマンドを実行します:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 3. 認証情報を追加する {#3-add-credentials}

次に、`.dlt/secrets.toml`ファイルにClickHouseの認証情報を設定します。以下のように設定してください:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 作成したデータベース名
username = "dlt"                         # ClickHouseユーザー名、通常は"default"
password = "Dlt*12345789234567"          # ClickHouseパスワード（ある場合）
host = "localhost"                       # ClickHouseサーバーホスト
port = 9000                              # ClickHouse HTTPポート、デフォルトは9000
http_port = 8443                         # ClickHouseサーバーのHTTPインターフェースに接続するためのHTTPポート。デフォルトは8443。
secure = 1                               # HTTPSを使用する場合は1、それ以外は0。
dataset_table_separator = "___"          # データセットからのデータセットテーブル名の区切り。
```

:::note
HTTP_PORT
`http_port`パラメータは、ClickHouseサーバーのHTTPインターフェースに接続する際に使用するポート番号を指定します。これは、ネイティブTCPプロトコルに使用されるデフォルトポート9000とは異なります。

外部ステージングを使用しない場合（すなわち、パイプラインでステージングパラメータを設定しない場合）は、`http_port`を設定する必要があります。これは、組み込みのClickHouseローカルストレージステージングが、HTTPを介してClickHouseと通信する<a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a>ライブラリを使用しているためです。

`http_port`で指定されたポートでHTTP接続を受け入れるようにClickHouseサーバーが設定されていることを確認してください。たとえば、`http_port = 8443`を設定した場合、ClickHouseはポート8443でHTTPリクエストをリッスンしている必要があります。外部ステージングを使用している場合は、clickhouse-connectが使用されないため、`http_port`パラメータを省略できます。
:::

データベース接続文字列は、`clickhouse-driver`ライブラリで使用されるものに似た形式で渡すことができます。上記の認証情報は次のようになります:

```bash

# tomlファイルの先頭に維持し、セクションが始まる前に配置します。
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

## 書き込みディスポジション {#write-disposition}

すべての[書き込みディスポジション](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)がサポートされています。

dltライブラリの書き込みディスポジションは、データを宛先に書き込む方法を定義します。書き込みディスポジションには3つのタイプがあります:

**置換**: このディスポジションは、リソースからのデータで宛先のデータを置き換えます。すべてのクラスとオブジェクトが削除され、データをロードする前にスキーマが再作成されます。詳細については<a href="https://dlthub.com/docs/general-usage/full-loading">こちら</a>をご覧ください。

**マージ**: この書き込みディスポジションは、リソースのデータと宛先のデータをマージします。`merge`ディスポジションの場合、リソースの`primary_key`を指定する必要があります。詳細については<a href="https://dlthub.com/docs/general-usage/incremental-loading">こちら</a>をご覧ください。

**追加**: これはデフォルトのディスポジションです。宛先の既存データにデータを追加し、`primary_key`フィールドは無視されます。

## データのロード {#data-loading}
データは、データソースに応じた最も効率的な方法を使用してClickHouseにロードされます:

- ローカルファイルの場合、`clickhouse-connect`ライブラリを使用して、`INSERT`コマンドでファイルをClickHouseテーブルに直接ロードします。
- `S3`、`Google Cloud Storage`、または`Azure Blob Storage`のようなリモートストレージのファイルに対しては、ClickHouseテーブル関数（s3、gcs、およびazureBlobStorageなど）を使用してファイルを読み込み、データをテーブルに挿入します。

## データセット {#datasets}

`Clickhouse`は、1つのデータベース内で複数のデータセットをサポートしていませんが、`dlt`はさまざまな理由からデータセットに依存しています。`Clickhouse`が`dlt`と連携するようにするために、`Clickhouse`データベース内の`dlt`によって生成されたテーブルの名前には、データセット名が接頭辞として追加され、設定可能な`dataset_table_separator`で区切られます。さらに、データを含まない特別なセンチネルテーブルが作成され、`dlt`がClickhouse宛先にすでに存在する仮想データセットを認識できるようになります。

## サポートされているファイル形式 {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a>は、直接ロードとステージングの両方に推奨される形式です。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a>は、直接ロードとステージングの両方をサポートしています。

`clickhouse`宛先には、デフォルトのSQL宛先からのいくつかの特定の逸脱があります:

1. `Clickhouse`には実験的な`object`データ型がありますが、それは少し予測不可能であることがわかったため、dltのClickhouse宛先は複雑なデータ型をテキストカラムにロードします。この機能が必要な場合は、Slackコミュニティにお問い合わせいただければ、追加を検討します。
2. `Clickhouse`は`time`データ型をサポートしていません。時間は`text`カラムにロードされます。
3. `Clickhouse`は`binary`データ型をサポートしていません。その代わりに、バイナリデータは`text`カラムにロードされます。`jsonl`からロードする際、バイナリデータはbase64文字列になり、`parquet`からロードする際、`binary`オブジェクトは`text`に変換されます。
5. `Clickhouse`は、NULLでない列を含んだテーブルに新しいカラムを追加することを許可します。
6. `Clickhouse`は、floatまたはdoubleデータ型を使用する際に特定の条件で丸め誤差を生じる可能性があります。丸め誤差を許容できない場合は、decimalデータ型を使用してください。たとえば、jsonl形式のローダーファイルを使用してdoubleカラムに値12.7001をロードすると、予測可能に丸め誤差が発生します。

## サポートされているカラムヒント {#supported-column-hints}
ClickHouseは、以下の<a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">カラムヒント</a>をサポートしています:

- `primary_key` - カラムを主キーの一部としてマークします。複数のカラムがこのヒントを持つことにより、複合主キーを作成できます。

## テーブルエンジン {#table-engine}
デフォルトでは、テーブルはClickHouseの`ReplicatedMergeTree`テーブルエンジンを使用して作成されます。クリックハウスアダプタで`table_engine_type`を使用して代替のテーブルエンジンを指定できます:

```bash
from dlt.destinations.adapters import clickhouse_adapter


@dlt.resource()
def my_resource():
  ...


clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

サポートされている値は次のとおりです:

- `merge_tree` - `MergeTree`エンジンを使用してテーブルを作成します
- `replicated_merge_tree`（デフォルト） - `ReplicatedMergeTree`エンジンを使用してテーブルを作成します

## ステージングサポート {#staging-support}

ClickHouseは、Amazon S3、Google Cloud Storage、およびAzure Blob Storageをファイルステージング先としてサポートしています。

`dlt`はParquetまたはjsonlファイルをステージング場所にアップロードし、ClickHouseテーブル関数を使用してステージされたファイルからデータを直接ロードします。

ステージング先の認証情報を構成する方法については、ファイルシステムのドキュメントを参照してください:

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

ステージングを有効にしたパイプラインを実行するには:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # ステージングを有効にするために追加
  dataset_name='chess_data'
)
```

### Google Cloud Storageをステージングエリアとして使用 {#using-google-cloud-storage-as-a-staging-area}
dltは、ClickHouseにデータをロードする際にGoogle Cloud Storage (GCS)をステージングエリアとして使用することをサポートしています。これはClickHouseの<a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCSテーブル関数</a>によって自動的に処理されます。

ClickHouseのGCSテーブル関数は、HMAC（ハッシュベースのメッセージ認証コード）キーを使用した認証のみをサポートしています。これを有効にするために、GCSはAmazon S3 APIをエミュレートするS3互換モードを提供しています。ClickHouseはこれを利用して、S3統合を介してGCSバケットにアクセスできるようにします。

dltでHMAC認証を使用したGCSステージングを設定するには:

1. GCSサービスアカウントのHMACキーを作成するには、<a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloudガイド</a>に従ってください。

2. dltプロジェクトのClickHouse宛先設定の`config.toml`に、HMACキーおよび`client_email`、`project_id`、`private_key`をサービスアカウント用に設定します:

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

注意: HMACキー（`gcp_access_key_id`および`gcp_secret_access_key`）に加えて、`client_email`、`project_id`、`private_key`をサービスアカウント用に`[destination.filesystem.credentials]`の下で提供する必要があります。これは、GCSステージングサポートが一時的な回避策として実装されており、まだ最適化されていないためです。

dltはこれらの認証情報をClickHouseに渡し、ClickHouseが認証およびGCSアクセスを処理します。

今後、ClickHouse dlt宛先のGCSステージング設定を簡素化し改善するための作業が進行中です。GCSステージングサポートは、これらのGitHubのイシューで追跡されています:

- ファイルシステム宛先<a href="https://github.com/dlt-hub/dlt/issues/1272">をgcsのs3互換モードで動作させる</a>
- Google Cloud Storageステージングエリア<a href="https://github.com/dlt-hub/dlt/issues/1181">サポート</a>

### dbtサポート {#dbt-support}
<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a>との統合は、dbt-clickhouseを介して一般的にサポートされています。

### `dlt`の状態の同期 {#syncing-of-dlt-state}
この宛先は、<a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a>状態の同期を完全にサポートしています。
