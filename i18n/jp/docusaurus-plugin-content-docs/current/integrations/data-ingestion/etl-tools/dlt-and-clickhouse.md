---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', 'connect', 'integrate', 'etl', 'data integration']
description: 'dlt 連携を利用して ClickHouse にデータをロードする'
title: 'dlt と ClickHouse を接続する'
slug: /integrations/data-ingestion/etl-tools/dlt-and-clickhouse
doc_type: 'guide'
---

import PartnerBadge from '@theme/badges/PartnerBadge';


# dlt を ClickHouse に接続する

<PartnerBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> は、さまざまな、しかも往々にして扱いづらいデータソースから、よく構造化されたライブデータセットへデータをロードするために、Python スクリプトに追加できるオープンソースライブラリです。



## ClickHouseを使用したdltのインストール {#install-dlt-with-clickhouse}

### ClickHouse依存関係を含む`dlt`ライブラリのインストール方法: {#to-install-the-dlt-library-with-clickhouse-dependencies}

```bash
pip install "dlt[clickhouse]"
```


## セットアップガイド {#setup-guide}

<VerticalStepper headerLevel="h3">

### dltプロジェクトの初期化 {#1-initialize-the-dlt-project}

まず、以下のコマンドで新しい`dlt`プロジェクトを初期化します:

```bash
dlt init chess clickhouse
```

:::note
このコマンドは、chessをソースとし、ClickHouseをデスティネーションとしてパイプラインを初期化します。
:::

上記のコマンドを実行すると、`.dlt/secrets.toml`やClickHouse用のrequirementsファイルを含む、複数のファイルとディレクトリが生成されます。requirementsファイルに指定された必要な依存関係は、以下のように実行してインストールできます:

```bash
pip install -r requirements.txt
```

または`pip install dlt[clickhouse]`を使用することもできます。これにより、`dlt`ライブラリとClickHouseをデスティネーションとして使用するために必要な依存関係がインストールされます。

### ClickHouseデータベースのセットアップ {#2-setup-clickhouse-database}

ClickHouseにデータをロードするには、ClickHouseデータベースを作成する必要があります。以下は実行すべき手順の概要です:

1. 既存のClickHouseデータベースを使用するか、新しいデータベースを作成できます。

2. 新しいデータベースを作成するには、`clickhouse-client`コマンドラインツールまたは任意のSQLクライアントを使用してClickHouseサーバーに接続します。

3. 以下のSQLコマンドを実行して、新しいデータベースとユーザーを作成し、必要な権限を付与します:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 認証情報の追加 {#3-add-credentials}

次に、以下のように`.dlt/secrets.toml`ファイルにClickHouseの認証情報を設定します:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 作成したデータベース名
username = "dlt"                         # ClickHouseのユーザー名、デフォルトは通常"default"
password = "Dlt*12345789234567"          # ClickHouseのパスワード(ある場合)
host = "localhost"                       # ClickHouseサーバーのホスト
port = 9000                              # ClickHouseのネイティブTCPポート、デフォルトは9000
http_port = 8443                         # ClickHouseサーバーのHTTPインターフェースに接続するためのHTTPポート。デフォルトは8443。
secure = 1                               # HTTPSを使用する場合は1、それ以外は0に設定

[destination.clickhouse]
dataset_table_separator = "___"          # データセットテーブル名の区切り文字
```

:::note HTTP_PORT
`http_port`パラメータは、ClickHouseサーバーのHTTPインターフェースに接続する際に使用するポート番号を指定します。これは、ネイティブTCPプロトコルに使用されるデフォルトポート9000とは異なります。

外部ステージングを使用していない場合(つまり、パイプラインでstagingパラメータを設定していない場合)は、`http_port`を設定する必要があります。これは、組み込みのClickHouseローカルストレージステージングが<a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse-connect</a>ライブラリを使用しており、このライブラリがHTTP経由でClickHouseと通信するためです。

ClickHouseサーバーが`http_port`で指定されたポートでHTTP接続を受け入れるように設定されていることを確認してください。例えば、`http_port = 8443`と設定した場合、ClickHouseはポート8443でHTTPリクエストをリッスンしている必要があります。外部ステージングを使用している場合は、clickhouse-connectが使用されないため、`http_port`パラメータを省略できます。
:::

`clickhouse-driver`ライブラリで使用されるものと同様のデータベース接続文字列を渡すこともできます。上記の認証情報は次のようになります:


```bash
# tomlファイルの先頭、セクションが始まる前に記述してください。
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

</VerticalStepper>


## 書き込みディスポジション {#write-disposition}

すべての[書き込みディスポジション](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)がサポートされています。

dltライブラリの書き込みディスポジションは、データを宛先にどのように書き込むかを定義します。書き込みディスポジションには3つのタイプがあります:

**Replace**: このディスポジションは、宛先のデータをリソースからのデータで置き換えます。データをロードする前に、すべてのクラスとオブジェクトを削除し、スキーマを再作成します。詳細については<a href="https://dlthub.com/docs/general-usage/full-loading">こちら</a>をご覧ください。

**Merge**: この書き込みディスポジションは、リソースからのデータを宛先のデータとマージします。`merge`ディスポジションを使用する場合は、リソースに`primary_key`を指定する必要があります。詳細については<a href="https://dlthub.com/docs/general-usage/incremental-loading">こちら</a>をご覧ください。

**Append**: これはデフォルトのディスポジションです。`primary_key`フィールドを無視して、宛先の既存データにデータを追加します。


## データ読み込み {#data-loading}

データソースに応じて最も効率的な方法でClickHouseにデータを読み込みます:

- ローカルファイルの場合、`clickhouse-connect`ライブラリを使用し、`INSERT`コマンドでClickHouseテーブルに直接ファイルを読み込みます。
- `S3`、`Google Cloud Storage`、`Azure Blob Storage`などのリモートストレージ内のファイルの場合、s3、gcs、azureBlobStorageなどのClickHouseテーブル関数を使用してファイルを読み取り、テーブルにデータを挿入します。


## データセット {#datasets}

`ClickHouse`は1つのデータベース内で複数のデータセットをサポートしていませんが、`dlt`は複数の理由によりデータセットに依存しています。`ClickHouse`を`dlt`と連携させるために、`ClickHouse`データベース内で`dlt`が生成するテーブルには、設定可能な`dataset_table_separator`で区切られたデータセット名がプレフィックスとして付与されます。さらに、データを含まない特別なセンチネルテーブルが作成され、`dlt`が`ClickHouse`の宛先にどの仮想データセットが既に存在するかを認識できるようにします。


## サポートされているファイル形式 {#supported-file-formats}

- <a href='https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl'>jsonl</a>
  は、直接ロードとステージングの両方で推奨される形式です。
- <a href='https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet'>
    parquet
  </a>
  は、直接ロードとステージングの両方でサポートされています。

`clickhouse`デスティネーションには、デフォルトのSQLデスティネーションからいくつかの特定の相違点があります:

1. `Clickhouse`には実験的な`object`データ型がありますが、動作がやや不安定であることが判明しているため、dlt clickhouseデスティネーションは複合データ型をテキストカラムにロードします。この機能が必要な場合は、Slackコミュニティにご連絡いただければ、追加を検討いたします。
2. `Clickhouse`は`time`データ型をサポートしていません。時刻は`text`カラムにロードされます。
3. `Clickhouse`は`binary`データ型をサポートしていません。代わりに、バイナリデータは`text`カラムにロードされます。`jsonl`からロードする場合、バイナリデータはbase64文字列となり、parquetからロードする場合、`binary`オブジェクトは`text`に変換されます。
4. `Clickhouse`は、データが格納されているテーブルにNOT NULLカラムを追加することを許可します。
5. `Clickhouse`は、floatまたはdoubleデータ型を使用する際、特定の条件下で丸め誤差が発生する可能性があります。丸め誤差が許容できない場合は、必ずdecimalデータ型を使用してください。例えば、ローダーファイル形式を`jsonl`に設定してdoubleカラムに値12.7001をロードすると、予測可能な丸め誤差が発生します。


## サポートされているカラムヒント {#supported-column-hints}

ClickHouseは以下の<a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">カラムヒント</a>をサポートしています:

- `primary_key` - カラムをプライマリキーの一部としてマークします。複数のカラムにこのヒントを指定することで、複合プライマリキーを作成できます。


## テーブルエンジン {#table-engine}

デフォルトでは、ClickHouseのテーブルは`ReplicatedMergeTree`テーブルエンジンを使用して作成されます。clickhouseアダプターの`table_engine_type`を使用することで、別のテーブルエンジンを指定できます:

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

サポートされている値:

- `merge_tree` - `MergeTree`エンジンを使用してテーブルを作成
- `replicated_merge_tree` (デフォルト) - `ReplicatedMergeTree`エンジンを使用してテーブルを作成


## ステージングのサポート {#staging-support}

ClickHouseは、ファイルステージング先としてAmazon S3、Google Cloud Storage、Azure Blob Storageをサポートしています。

`dlt`は、ParquetまたはJSONLファイルをステージングロケーションにアップロードし、ClickHouseのテーブル関数を使用してステージングされたファイルから直接データをロードします。

ステージング先の認証情報を設定する方法については、filesystemのドキュメントを参照してください:

- <a href='https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3'>
    Amazon S3
  </a>
- <a href='https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage'>
    Google Cloud Storage
  </a>
- <a href='https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage'>
    Azure Blob Storage
  </a>

ステージングを有効にしてパイプラインを実行するには:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # ステージングを有効にするにはこれを追加
  dataset_name='chess_data'
)
```

### ステージング領域としてGoogle Cloud Storageを使用する {#using-google-cloud-storage-as-a-staging-area}

dltは、ClickHouseへのデータロード時にGoogle Cloud Storage(GCS)をステージング領域として使用することをサポートしています。これは、dltが内部で使用するClickHouseの<a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCSテーブル関数</a>によって自動的に処理されます。

ClickHouseのGCSテーブル関数は、ハッシュベースメッセージ認証コード(HMAC)キーを使用した認証のみをサポートしています。これを有効にするため、GCSはAmazon S3 APIをエミュレートするS3互換モードを提供しています。ClickHouseはこれを利用して、S3統合を介してGCSバケットへのアクセスを可能にしています。

dltでHMAC認証を使用したGCSステージングを設定するには:

1. <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloudガイド</a>に従って、GCSサービスアカウント用のHMACキーを作成します。

2. dltプロジェクトのClickHouse宛先設定の`config.toml`で、HMACキーとサービスアカウントの`client_email`、`project_id`、`private_key`を設定します:

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

注意: HMACキー(`gcp_access_key_id`と`gcp_secret_access_key`)に加えて、`[destination.filesystem.credentials]`の下にサービスアカウントの`client_email`、`project_id`、`private_key`を提供する必要があります。これは、GCSステージングのサポートが現在一時的な回避策として実装されており、まだ最適化されていないためです。

dltはこれらの認証情報をClickHouseに渡し、ClickHouseが認証とGCSアクセスを処理します。

ClickHouse dlt宛先のGCSステージング設定を簡素化および改善するための作業が現在進行中です。適切なGCSステージングのサポートは、以下のGitHub issueで追跡されています:

- filesystem宛先をS3互換モードのGCSで<a href="https://github.com/dlt-hub/dlt/issues/1272">動作</a>させる
- Google Cloud Storageステージング領域の<a href="https://github.com/dlt-hub/dlt/issues/1181">サポート</a>

### dbtのサポート {#dbt-support}

<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a>との統合は、dbt-clickhouseを介して一般的にサポートされています。

### `dlt`状態の同期 {#syncing-of-dlt-state}

この宛先は、<a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a>状態同期を完全にサポートしています。
