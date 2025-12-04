---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', '接続', '統合', 'etl', 'データ統合']
description: 'dlt 連携を使用して ClickHouse にデータをロードする'
title: 'dlt を ClickHouse に接続する'
slug: /integrations/data-ingestion/etl-tools/dlt-and-clickhouse
doc_type: 'guide'
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# dlt を ClickHouse に接続する {#connect-dlt-to-clickhouse}

<PartnerBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> は、Python スクリプトに組み込むことで、さまざまな（しばしば扱いづらい）データソースから、よく構造化されたライブデータセットへデータをロードできるオープンソースライブラリです。

## ClickHouse と併せて dlt をインストールする {#install-dlt-with-clickhouse}

### ClickHouse の依存関係付きで `dlt` ライブラリをインストールするには: {#to-install-the-dlt-library-with-clickhouse-dependencies}

```bash
pip install "dlt[clickhouse]"
```

## セットアップガイド {#setup-guide}

<VerticalStepper headerLevel="h3">

### dltプロジェクトの初期化 {#1-initialize-the-dlt-project}

まず、以下のコマンドで新しい`dlt`プロジェクトを初期化します。

```bash
dlt init chess clickhouse
```

:::note
このコマンドは、chessをソースとし、ClickHouseをデスティネーションとするパイプラインを初期化します。
:::

上記のコマンドを実行すると、`.dlt/secrets.toml`やClickHouse用のrequirementsファイルを含む複数のファイルとディレクトリが生成されます。requirementsファイルに指定された必要な依存関係は、以下のように実行してインストールできます。

```bash
pip install -r requirements.txt
```

または`pip install dlt[clickhouse]`を使用することで、`dlt`ライブラリとClickHouseをデスティネーションとして使用するために必要な依存関係をインストールできます。

### ClickHouseデータベースのセットアップ {#2-setup-clickhouse-database}

ClickHouseにデータをロードするには、ClickHouseデータベースを作成する必要があります。以下は実行すべき手順の概要です。

1. 既存のClickHouseデータベースを使用するか、新しいデータベースを作成します。

2. 新しいデータベースを作成するには、`clickhouse-client`コマンドラインツールまたは任意のSQLクライアントを使用してClickHouseサーバーに接続します。

3. 以下のSQLコマンドを実行して、新しいデータベースとユーザーを作成し、必要な権限を付与します。

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 認証情報の追加 {#3-add-credentials}

次に、以下のように`.dlt/secrets.toml`ファイルにClickHouseの認証情報を設定します。

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 作成したデータベース名
username = "dlt"                         # ClickHouseユーザー名、デフォルトは通常「default」
password = "Dlt*12345789234567"          # ClickHouseパスワード（設定されている場合）
host = "localhost"                       # ClickHouseサーバーホスト
port = 9000                              # ClickHouseネイティブポート、デフォルトは9000
http_port = 8443                         # ClickHouseサーバーのHTTPインターフェースに接続するためのHTTPポート。デフォルトは8443。
secure = 1                               # HTTPSを使用する場合は1、それ以外は0に設定

[destination.clickhouse]
dataset_table_separator = "___"          # データセットからデータセットテーブル名を区切るセパレーター
```

:::note HTTP_PORT
`http_port`パラメーターは、ClickHouseサーバーのHTTPインターフェースに接続する際に使用するポート番号を指定します。これは、ネイティブTCPプロトコルに使用されるデフォルトポート9000とは異なります。

外部ステージングを使用していない場合（つまり、パイプラインでstagingパラメーターを設定していない場合）は、`http_port`を設定する必要があります。これは、組み込みのClickHouseローカルストレージステージングが<a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse-connect</a>ライブラリを使用しており、このライブラリがHTTP経由でClickHouseと通信するためです。

ClickHouseサーバーが`http_port`で指定されたポートでHTTP接続を受け入れるように設定されていることを確認してください。例えば、`http_port = 8443`と設定した場合、ClickHouseはポート8443でHTTPリクエストをリッスンしている必要があります。外部ステージングを使用している場合は、clickhouse-connectが使用されないため、`http_port`パラメーターを省略できます。
:::

`clickhouse-driver`ライブラリで使用されるものと同様のデータベース接続文字列を渡すこともできます。上記の認証情報は次のようになります。

```bash
# tomlファイルの先頭、セクション開始前に記述してください。 {#keep-it-at-the-top-of-your-toml-file-before-any-section-starts}
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

</VerticalStepper>

## 書き込みディスポジション {#write-disposition}

すべての[書き込みディスポジション](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)
がサポートされています。

dlt ライブラリの書き込みディスポジションは、データを宛先にどのように書き込むかを定義します。書き込みディスポジションには次の 3 種類があります。

**Replace**: リソースからのデータで宛先のデータを置き換えます。すべてのクラスとオブジェクトを削除し、データをロードする前にスキーマを再作成します。詳しくは<a href="https://dlthub.com/docs/general-usage/full-loading">こちら</a>を参照してください。

**Merge**: リソースからのデータを宛先のデータとマージします。`merge` ディスポジションを使用する場合は、リソースに対して `primary_key` を指定する必要があります。詳しくは<a href="https://dlthub.com/docs/general-usage/incremental-loading">こちら</a>を参照してください。

**Append**: これはデフォルトのディスポジションです。`primary_key` フィールドを無視し、宛先にすでに存在するデータに対してデータを追記します。

## データロード {#data-loading}
データは、データソースに応じて最も効率的な方法で ClickHouse にロードします。

- ローカルファイルの場合、`clickhouse-connect` ライブラリを使用し、`INSERT` コマンドでファイルを ClickHouse のテーブルに直接ロードします。
- `S3`、`Google Cloud Storage`、`Azure Blob Storage` などのリモートストレージ上のファイルの場合、ClickHouse の s3、gcs、azureBlobStorage などのテーブル関数を使用してファイルを読み込み、テーブルにデータを挿入します。

## データセット {#datasets}

`Clickhouse` は 1 つのデータベース内で複数のデータセットをサポートしていませんが、`dlt` はさまざまな理由からデータセットに依存しています。`Clickhouse` を `dlt` と連携させるために、`Clickhouse` データベース内で `dlt` によって生成されるテーブル名には、設定可能な `dataset_table_separator` で区切られたデータセット名が接頭辞として付与されます。さらに、データを含まない特別なセンチネルテーブルが作成され、`dlt` が `Clickhouse` のデスティネーションに既に存在する仮想データセットを認識できるようにします。

## サポートされているファイル形式 {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> は、直接ロードとステージングの両方で推奨される形式です。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> は、直接ロードとステージングの両方でサポートされています。

`clickhouse` 宛先には、デフォルトの SQL 宛先とはいくつか異なる点があります。

1. `Clickhouse` には実験的な `object` データ型がありますが、挙動がやや予測しづらいため、dlt clickhouse 宛先では複合データ型は `text` カラムにロードされます。この機能が必要な場合は、Slack コミュニティまでご連絡いただければ、追加を検討します。
2. `Clickhouse` は `time` データ型をサポートしていません。`time` は `text` カラムにロードされます。
3. `Clickhouse` は `binary` データ型をサポートしていません。その代わり、バイナリデータは `text` カラムにロードされます。`jsonl` からロードする場合、バイナリデータは base64 文字列となり、parquet からロードする場合は、`binary` オブジェクトは `text` に変換されます。
5. `Clickhouse` は、既にデータが存在するテーブルに対して、NOT NULL のカラムを追加することを許可します。
6. `Clickhouse` は、`float` または `double` データ型を使用した場合、特定の条件下で丸め誤差を生じることがあります。丸め誤差が許容できない場合は、必ず `decimal` データ型を使用してください。たとえば、ローダーのファイル形式を `jsonl` に設定した状態で値 12.7001 を `double` カラムにロードすると、必ず丸め誤差が発生します。

## サポートされているカラムヒント {#supported-column-hints}
ClickHouse は、以下の<a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">カラムヒント</a>をサポートしています。

- `primary_key` - カラムがプライマリキーの一部であることを示します。複数のカラムにこのヒントを指定して、複合プライマリキーを作成できます。

## テーブルエンジン {#table-engine}

デフォルトでは、ClickHouse ではテーブルは `ReplicatedMergeTree` テーブルエンジンを使用して作成されます。ClickHouse アダプターで `table_engine_type` を使用することで、別のテーブルエンジンを指定できます。

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

サポートされている値は次のとおりです。

* `merge_tree` - `MergeTree` エンジンを使用してテーブルを作成します
* `replicated_merge_tree` (デフォルト) - `ReplicatedMergeTree` エンジンを使用してテーブルを作成します

## ステージングサポート {#staging-support}

ClickHouse は、ファイルのステージング先として Amazon S3、Google Cloud Storage、Azure Blob Storage をサポートしています。

`dlt` は Parquet または JSONL ファイルをステージング用のロケーションにアップロードし、ClickHouse のテーブル関数を使用して、ステージングされたファイルから直接データをロードします。

ステージング先の認証情報の設定方法については、ファイルシステムに関するドキュメントを参照してください。

* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

ステージングを有効にしてパイプラインを実行するには、次のようにします。

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # ステージングを有効にするにはこれを追加
  dataset_name='chess_data'
)
```

### ステージング領域として Google Cloud Storage を使用する {#using-google-cloud-storage-as-a-staging-area}

dlt では、データを ClickHouse にロードする際のステージング領域として Google Cloud Storage (GCS) を使用できます。これは、dlt が内部的に利用している ClickHouse の <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS テーブル関数</a> によって自動的に処理されます。

ClickHouse の GCS テーブル関数は、Hash-based Message Authentication Code (HMAC) キーを用いた認証のみをサポートします。これを有効にするために、GCS は Amazon S3 API をエミュレートする S3 互換モードを提供しています。ClickHouse はこの機能を利用して、S3 との連携機能を通じて GCS バケットへアクセスできるようにしています。

dlt で HMAC 認証を用いた GCS ステージングを設定するには:

1. <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud ガイド</a> に従って、GCS サービスアカウント用の HMAC キーを作成します。

2. `config.toml` の dlt プロジェクトの ClickHouse 宛先設定内で、サービスアカウントの `client_email`、`project_id`、`private_key` とあわせて HMAC キーを設定します。

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

注意: HMAC キー `bashgcp_access_key_id` と `gcp_secret_access_key` に加えて、サービスアカウント用の `client_email`、`project_id`、`private_key` を `[destination.filesystem.credentials]` セクション内で指定する必要があります。これは、GCS ステージングのサポートが現在、一時的なワークアラウンドとして実装されており、まだ最適化されていないためです。

dlt はこれらの認証情報を ClickHouse に渡し、認証および GCS へのアクセスは ClickHouse が処理します。

将来的に、ClickHouse dlt destination 向けの GCS ステージング設定を簡素化し改善するための作業が進行中です。正式な GCS ステージングサポートは、次の GitHub issue でトラッキングされています:

* filesystem destination を S3 互換モードで GCS と<a href="https://github.com/dlt-hub/dlt/issues/1272">連携できるようにする</a>
* Google Cloud Storage ステージングエリアの<a href="https://github.com/dlt-hub/dlt/issues/1181">サポート</a>

### dbt サポート {#dbt-support}

<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> との連携は、一般に dbt-clickhouse を通じてサポートされています。

### `dlt` state の同期 {#syncing-of-dlt-state}

この destination は、<a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> state の同期を完全にサポートしています。
