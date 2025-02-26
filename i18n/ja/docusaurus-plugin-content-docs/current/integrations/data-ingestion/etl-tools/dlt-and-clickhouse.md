---
sidebar_label: dlt
keywords: [clickhouse, dlt, connect, integrate, etl, data integration]
description: ClickHouseへのデータロードにdlt統合を使用
---

# dltをClickHouseに接続する

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> は、さまざまな混沌としたデータソースから整然としたライブデータセットにデータをロードするためにPythonスクリプトに追加できるオープンソースのライブラリです。

## ClickHouseとのdltインストール方法 {#install-dlt-with-clickhouse}

### ClickHouse依存関係と共に`dlt`ライブラリをインストールする方法: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]" 
```

## セットアップガイド {#setup-guide}

### 1. dltプロジェクトの初期化 {#1-initialize-the-dlt-project}

新しい`dlt`プロジェクトを以下のように初期化します:
```bash
dlt init chess clickhouse
```

:::note
このコマンドにより、チェスをソースとして、ClickHouseを宛先として使用するパイプラインが初期化されます。
:::

上記のコマンドにより、`.dlt/secrets.toml`やClickHouseのための要求ファイルなど、いくつかのファイルとディレクトリが生成されます。要求ファイルに指定された必要な依存関係を、以下のコマンドでインストールできます:
```bash
pip install -r requirements.txt
```

または、`pip install dlt[clickhouse]`を使用することで、`dlt`ライブラリとClickHouseを宛先とするための必要な依存関係がインストールされます。

### 2. ClickHouseデータベースのセットアップ {#2-setup-clickhouse-database}

ClickHouseにデータをロードするには、ClickHouseデータベースを作成する必要があります。以下は一般的な手順です:

1. 既存のClickHouseデータベースを使用するか、新しいデータベースを作成することができます。

2. 新しいデータベースを作成するには、`clickhouse-client`コマンドラインツールまたはお好みのSQLクライアントを使用してClickHouseサーバーに接続します。

3. 以下のSQLコマンドを実行して、新しいデータベース、ユーザーを作成し、必要な権限を付与します:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 3. 認証情報を追加する {#3-add-credentials}

次に、`.dlt/secrets.toml`ファイルにClickHouseの認証情報を以下のように設定します:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 作成したデータベースの名前
username = "dlt"                         # ClickHouseのユーザー名、通常は「default」
password = "Dlt*12345789234567"          # ClickHouseのパスワード（必要な場合）
host = "localhost"                       # ClickHouseサーバーのホスト
port = 9000                              # ClickHouseのHTTPポート、デフォルトは9000
http_port = 8443                         # ClickHouseサーバーのHTTPインターフェースに接続するためのHTTPポート。デフォルトは8443。
secure = 1                               # HTTPSを使用する場合は1、それ以外は0。
dataset_table_separator = "___"          # データセットテーブル名のセパレーター。
```

:::note
HTTP_PORT
`http_port`パラメータは、ClickHouseサーバーのHTTPインターフェースに接続する際に使用するポート番号を指定します。これは、ネイティブTCPプロトコル用のデフォルトポート9000とは異なります。

外部ステージングを使用していない場合は、`http_port`を設定する必要があります（つまり、パイプラインでステージングパラメータを設定しない場合）。これは、組み込みのClickHouseローカルストレージステージングが<a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a>ライブラリを使用し、HTTPを介してClickHouseとの通信を行うためです。

ClickHouseサーバーが`http_port`で指定されたポートでHTTP接続を受け入れるように設定されていることを確認してください。たとえば、`http_port = 8443`を設定した場合、ClickHouseはポート8443でHTTPリクエストを待ち受ける必要があります。外部ステージングを使用している場合は、clickhouse-connectが使用されないため、`http_port`パラメータを省略できます。
:::

`clickhouse-driver`ライブラリで使用されるのと同様のデータベース接続文字列を渡すことができます。上記の認証情報は以下のようになります:

```bash
# tomlファイルの先頭にこれを維持してください。セクションが始まる前に。
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

## 書き込みディスポジション {#write-disposition}

すべての [書き込みディスポジション](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)
がサポートされています。

dltライブラリの書き込みディスポジションは、データが宛先にどのように書き込まれるべきかを定義します。書き込みディスポジションには3つのタイプがあります:

**置換**: このディスポジションは、リソースのデータで宛先のデータを置換します。すべてのクラスとオブジェクトを削除し、データを読み込む前にスキーマを再作成します。詳細については、<a href="https://dlthub.com/docs/general-usage/full-loading">こちら</a>をご覧ください。

**マージ**: この書き込みディスポジションは、リソースのデータを宛先のデータとマージします。`merge`ディスポジションの場合は、リソースのために`primary_key`を指定する必要があります。詳細については、<a href="https://dlthub.com/docs/general-usage/incremental-loading">こちら</a>をご覧ください。

**追加**: これはデフォルトのディスポジションです。既存のデータにデータを追加し、`primary_key`フィールドを無視します。

## データのロード {#data-loading}

データは、データソースに応じて最も効率的な方法でClickHouseにロードされます:

- ローカルファイルの場合、`clickhouse-connect`ライブラリを使用して、`INSERT`コマンドでファイルを直接ClickHouseテーブルにロードします。
- `S3`、`Google Cloud Storage`、または`Azure Blob Storage`のようなリモートストレージ内のファイルの場合、ClickHouseのテーブル関数（s3、gcs、azureBlobStorageなど）を使用してファイルを読み込み、テーブルにデータを挿入します。

## データセット {#datasets}

`Clickhouse`は、1つのデータベース内で複数のデータセットをサポートしていませんが、`dlt`は複数の理由からデータセットに依存しています。`Clickhouse`が`dlt`と連携するために、`dlt`がClickHouseデータベースに生成するテーブルは、データセット名で接頭辞が付けられ、設定可能な`dataset_table_separator`で区切られます。さらに、データを含まない特別なセンチネルテーブルが作成され、`dlt`はどの仮想データセットがすでにClickHouse宛先に存在しているかを認識できます。

## サポートされているファイル形式 {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a>は、直接読み込みとステージングの両方で推奨される形式です。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a>は、直接読み込みとステージングの両方でサポートされています。

`clickhouse`宛先には、デフォルトのSQL宛先とのいくつかの特定の偏差があります:

1. `Clickhouse`は実験的な`object`データ型を持っていますが、予測しにくいことがわかったため、dltのClickhouse宛先は複雑なデータ型をテキストカラムに読み込みます。この機能が必要な場合は、Slackコミュニティにお問い合わせください。追加を検討します。
2. `Clickhouse`は`time`データ型をサポートしていません。時間は`text`カラムに読み込まれます。
3. `Clickhouse`は`binary`データ型をサポートしていません。その代わり、バイナリデータは`text`カラムに読み込まれます。`jsonl`から読み込む場合、バイナリデータはbase64文字列になり、parquetから読み込む場合、`binary`オブジェクトは`text`に変換されます。
5. `Clickhouse`は、NULLでないポピュレートされたテーブルに列を追加することを許可します。
6. `Clickhouse`は、floatまたはdoubleデータ型を使用する際、特定の条件下で丸め誤差が発生する場合があります。丸め誤差を避けることができない場合は、decimalデータ型を使用するようにしてください。例えば、`jsonl`でローダーファイル形式を設定して、値12.7001をdouble列に読み込むと、予測通り丸め誤差が生じます。

## サポートされているカラムヒント {#supported-column-hints}

ClickHouseは以下の<a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">カラムヒント</a>をサポートしています:

- `primary_key` - カラムを主キーの一部としてマークします。複数のカラムがこのヒントを持つことで、複合主キーを作成できます。

## テーブルエンジン {#table-engine}

デフォルトでは、ClickHouseでテーブルは`ReplicatedMergeTree`テーブルエンジンを使用して作成されます。別のテーブルエンジンを指定するには、ClickHouseアダプターで`table_engine_type`を使用します:

```bash
from dlt.destinations.adapters import clickhouse_adapter


@dlt.resource()
def my_resource():
  ...


clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

サポートされている値は以下の通りです:

- `merge_tree` - `MergeTree`エンジンを使用してテーブルを作成します
- `replicated_merge_tree`（デフォルト） - `ReplicatedMergeTree`エンジンを使用してテーブルを作成します

## ステージングサポート {#staging-support}

ClickHouseは、Amazon S3、Google Cloud Storage、およびAzure Blob Storageをファイルステージングの宛先としてサポートしています。

`dlt`はParquetまたはjsonlファイルをステージング場所にアップロードし、ClickHouseテーブル関数を使用して、ステージされたファイルからデータを直接ロードします。

ステージング宛先の認証情報を設定する方法については、ファイルシステムのドキュメントをご参照ください:

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

ステージングを有効にしてパイプラインを実行するには:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # これを追加してステージングを有効にします
  dataset_name='chess_data'
)
```

### Google Cloud Storageをステージングエリアとして使用する {#using-google-cloud-storage-as-a-staging-area}

dltは、ClickHouseにデータをロードする際にGoogle Cloud Storage (GCS)をステージングエリアとして使用することをサポートしています。これは、ClickHouseの<a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCSテーブル関数</a>によって自動的に処理されます。

ClickHouseのGCSテーブル関数は、HMACキーを使用した認証のみをサポートしています。これを有効にするために、GCSはAmazon S3 APIをエミュレートするS3互換モードを提供します。ClickHouseはこれを利用して、S3統合を介してGCSバケットにアクセスします。

dltでHMAC認証を使用してGCSステージングを設定するには:

1. GCSサービスアカウントのHMACキーを作成するために、<a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloudガイド</a>に従ってください。

2. dltプロジェクトのClickHouse宛先設定の`config.toml`に、HMACキーおよび`client_email`、`project_id`、`private_key`を設定します:

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

注: HMACキーに加えて、`client_email`、`project_id`、`private_key`を提供する必要があります。[destination.filesystem.credentials]の下にサービスアカウントとしてです。これは、GCSステージングサポートが一時的な回避策として実装されており、まだ最適化されていないためです。

dltはこれらの認証情報をClickHouseに渡し、ClickHouseが認証とGCSアクセスを処理します。

将来的には、ClickHouseのdlt宛先についてGCSステージングのセットアップを簡素化し改善するための作業が進行中です。適切なGCSステージングサポートは次のGitHubの問題で追跡されています:

- ファイルシステム宛先が<a href="https://github.com/dlt-hub/dlt/issues/1272">gcsで動作</a>する必要があります（S3互換モード）。
- Google Cloud Storageステージングエリア<a href="https://github.com/dlt-hub/dlt/issues/1181">サポート</a>。

### dbtサポート {#dbt-support}

<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a>との統合は、一般的にdbt-clickhouseを介してサポートされています。

### `dlt`状態の同期 {#syncing-of-dlt-state}

この宛先は、<a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a>の状態同期を完全にサポートしています。
