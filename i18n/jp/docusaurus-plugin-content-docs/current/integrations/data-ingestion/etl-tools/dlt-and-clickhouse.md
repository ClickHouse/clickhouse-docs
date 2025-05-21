---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', 'connect', 'integrate', 'etl', 'data integration']
description: 'ClickHouseにdlt統合を使用してデータをロードする'
title: 'dltをClickHouseに接続する'
slug: /integrations/data-ingestion/etl-tools/dlt-and-clickhouse
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# dltをClickHouseに接続する

<CommunityMaintainedBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a>は、さまざまなしばしば混沌としたデータソースから、よく構造化されたライブデータセットにデータをロードするためにPythonスクリプトに追加できるオープンソースライブラリです。

## ClickHouseでdltをインストールする {#install-dlt-with-clickhouse}

### ClickHouse依存関係を持つ`dlt`ライブラリをインストールするには: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]"
```

## セットアップガイド {#setup-guide}

### 1. dltプロジェクトを初期化する {#1-initialize-the-dlt-project}

次のように新しい`dlt`プロジェクトを初期化します:
```bash
dlt init chess clickhouse
```


:::note
このコマンドは、chessをソースとして、ClickHouseを宛先としてパイプラインを初期化します。
:::

上記のコマンドは、`.dlt/secrets.toml`やClickHouseのためのrequirementsファイルを含むいくつかのファイルとディレクトリを生成します。requirementsファイルに指定された必要な依存関係は、次のように実行することでインストールできます:
```bash
pip install -r requirements.txt
```

または、`pip install dlt[clickhouse]`を使用して、`dlt`ライブラリとClickHouseを宛先として使用するために必要な依存関係をインストールします。

### 2. ClickHouseデータベースをセットアップする {#2-setup-clickhouse-database}

ClickHouseにデータをロードするには、ClickHouseデータベースを作成する必要があります。以下は、実行すべき粗いアウトラインです:

1. 既存のClickHouseデータベースを使用するか、新しいデータベースを作成します。

2. 新しいデータベースを作成するには、`clickhouse-client`コマンドラインツールまたは任意のSQLクライアントを使用してClickHouseサーバーに接続します。

3. 次のSQLコマンドを実行して、新しいデータベース、ユーザーを作成し、必要な権限を付与します:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```


### 3. 資格情報を追加する {#3-add-credentials}

次に、`.dlt/secrets.toml`ファイルにClickHouseの資格情報を次のように設定します:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 作成したデータベース名
username = "dlt"                         # ClickHouseのユーザー名、通常は"default"
password = "Dlt*12345789234567"          # ClickHouseのパスワード（ある場合）
host = "localhost"                       # ClickHouseサーバーホスト
port = 9000                              # ClickHouseのHTTPポート、デフォルトは9000
http_port = 8443                         # ClickHouseサーバーのHTTPインターフェイスに接続するためのHTTPポート。デフォルトは8443。
secure = 1                               # HTTPSを使用する場合は1、そうでない場合は0。
dataset_table_separator = "___"          # データセットからのデータセットテーブル名のセパレーター。
```


:::note
HTTP_PORT
`http_port`パラメータは、ClickHouseサーバーのHTTPインターフェイスに接続する際に使用するポート番号を指定します。これは、ネイティブTCPプロトコルに使用されるデフォルトポート9000とは異なります。

外部ステージングを使用していない場合（つまり、パイプラインでステージングパラメータを設定していない場合）は、`http_port`を設定する必要があります。これは、組み込みのClickHouseローカルストレージステージングが、ClickHouseとHTTP経由で通信する`<a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a>`ライブラリを使用するためです。

ClickHouseサーバーが`http_port`で指定されたポートでHTTP接続を受け入れるように設定されていることを確認してください。たとえば、`http_port = 8443`を設定した場合、ClickHouseはポート8443でHTTPリクエストをリッスンしている必要があります。外部ステージングを使用している場合は、`http_port`パラメータを省略できます。なぜなら、この場合はclickhouse-connectは使用されないからです。
:::

`clickhouse-driver`ライブラリで使用される接続文字列と同様のフォーマットでデータベース接続文字列を渡すことができます。上記の資格情報は次のようになります:

```bash

# tomlファイルの一番上に保持し、どのセクションも始まる前にします。
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```


## 書き込みディスポジション {#write-disposition}

すべての[書き込みディスポジション](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)がサポートされています。

dltライブラリの書き込みディスポジションは、データを宛先にどのように書き込むべきかを定義します。書き込みディスポジションには3つのタイプがあります:

**置換**: このディスポジションは、リソースからのデータで宛先のデータを置き換えます。すべてのクラスとオブジェクトを削除し、データをロードする前にスキーマを再作成します。詳細については、<a href="https://dlthub.com/docs/general-usage/full-loading">こちら</a>をご覧ください。

**マージ**: この書き込みディスポジションは、リソースからのデータを宛先のデータとマージします。`merge`ディスポジションの場合、リソースに対して`primary_key`を指定する必要があります。詳細については、<a href="https://dlthub.com/docs/general-usage/incremental-loading">こちら</a>をご覧ください。

**追加**: これがデフォルトのディスポジションです。宛先の既存のデータにデータを追加し、`primary_key`フィールドを無視します。

## データロード {#data-loading}
データは、データソースに応じて最も効率的な方法でClickHouseにロードされます:

- ローカルファイルの場合、`clickhouse-connect`ライブラリを使用して、`INSERT`コマンドでファイルをClickHouseテーブルに直接ロードします。
- `S3`、`Google Cloud Storage`、または`Azure Blob Storage`のようなリモートストレージのファイルの場合、ClickHouseテーブル関数（s3、gcs、azureBlobStorageなど）を使用してファイルを読み取り、データをテーブルに挿入します。

## データセット {#datasets}

`Clickhouse`は1つのデータベース内で複数のデータセットをサポートしていませんが、`dlt`は複数の理由によりデータセットに依存しています。`Clickhouse`を`dlt`で動作させるために、`Clickhouse`データベース内で`dlt`によって生成されたテーブルは、データセット名が接頭辞として付けられ、設定可能な`dataset_table_separator`で区切られます。さらに、特別なセンチネルテーブルが作成され、データを含まない状態で、`dlt`がすでにClickhouseに存在する仮想データセットを認識できるようになります。

## サポートされているファイル形式 {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a>は、直接ロードとステージングの両方に推奨される形式です。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a>は、直接ロードとステージングの両方に対応しています。

`clickhouse`宛先には、デフォルトのSQL宛先からのいくつかの具体的な逸脱があります:

1. `Clickhouse`には実験的な`object`データ型がありますが、予測が難しいため、dltのClickhouse宛先では複雑なデータ型がテキストカラムにロードされます。この機能が必要な場合は、Slackコミュニティにお問い合わせください。追加を検討します。
2. `Clickhouse`は`time`データ型をサポートしていません。時間は`text`カラムにロードされます。
3. `Clickhouse`は`binary`データ型をサポートしていません。代わりに、バイナリデータは`text`カラムにロードされます。`jsonl`からロードする際、バイナリデータはbase64文字列となり、parquetからロードする際、`binary`オブジェクトは`text`に変換されます。
5. `Clickhouse`は、nullでないカラムを持つ populated tableへカラムを追加することを許可しています。
6. `Clickhouse`はfloatまたはdoubleデータ型を使用する条件下で丸め誤差を生じることがあります。丸め誤差を避けたい場合は、decimalデータ型を使用してください。たとえば、ローダーのファイル形式が`jsonl`に設定されている場合、doubleカラムに12.7001の値をロードすると、予測可能な丸め誤差が生じます。

## サポートされているカラムヒント {#supported-column-hints}
ClickHouseは次の<a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">カラムヒント</a>をサポートしています:

- `primary_key` - カラムを主キーの一部としてマークします。複数のカラムがこのヒントを持つことで、複合主キーを作成できます。

## テーブルエンジン {#table-engine}
デフォルトでは、ClickHouseの`ReplicatedMergeTree`テーブルエンジンを使用してテーブルが作成されます。clickhouseアダプタを使って、代替のテーブルエンジンを指定することができます:

```bash
from dlt.destinations.adapters import clickhouse_adapter


@dlt.resource()
def my_resource():
  ...


clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

サポートされている値は次のとおりです:

- `merge_tree` - `MergeTree`エンジンを使用してテーブルを作成します
- `replicated_merge_tree` (デフォルト) - `ReplicatedMergeTree`エンジンを使用してテーブルを作成します

## ステージングサポート {#staging-support}

ClickHouseは、ファイルステージングの宛先としてAmazon S3、Google Cloud Storage、Azure Blob Storageをサポートしています。

`dlt`はParquetまたはjsonlファイルをステージング場所にアップロードし、ClickHouseテーブル関数を使用して、ステージファイルから直接データをロードします。

ステージング宛先の資格情報を設定する方法については、ファイルシステムのドキュメントを参照してください:

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

ステージングを有効にしたパイプラインを実行するには:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # これを追加してステージングを有効にします
  dataset_name='chess_data'
)
```

### Google Cloud Storageをステージングエリアとして使用する {#using-google-cloud-storage-as-a-staging-area}
dltはClickHouseにデータをロードする際にGoogle Cloud Storage (GCS)をステージングエリアとして使用することをサポートしています。これは、ClickHouseの<a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCSテーブル関数</a>によって自動的に処理されます。

ClickHouseのGCSテーブル関数は、Hash-based Message Authentication Code (HMAC)キーを使用した認証のみをサポートします。これを有効にするために、GCSはAmazon S3 APIをエミュレートするS3互換モードを提供します。ClickHouseはこれを利用して、S3統合を通じてGCSバケットにアクセスできるようにします。

dltでHMAC認証を使用したGCSステージングを設定するには:

1. <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloudガイド</a>に従って、GCSサービスアカウント用のHMACキーを作成します。

2. dltプロジェクトのClickHouse宛先設定の`config.toml`ファイルに、HMACキーに加え、`client_email`、`project_id`、およびサービスアカウント用の`private_key`を設定します:

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

注意: HMACキー`bashgcp_access_key_id`と`gcp_secret_access_key`に加え、サービスアカウントの`client_email`、`project_id`、および`private_key`を`[destination.filesystem.credentials]`の下に提供する必要があります。これは、GCSステージングサポートが現在は一時的な回避策として実装されており、まだ最適化されていないためです。

dltはこれらの資格情報をClickHouseに渡し、認証およびGCSアクセスを処理します。

今後、ClickHouseのdlt宛先のGCSステージング設定を簡素化し、改善するための作業が進行中です。適切なGCSステージングサポートは、次のGitHubの問題で追跡されています:

- ファイルシステムの宛先が<a href="https://github.com/dlt-hub/dlt/issues/1272">gcsと連携するように</a>
- Google Cloud Storageステージングエリア<a href="https://github.com/dlt-hub/dlt/issues/1181">のサポート</a>

### dbtサポート {#dbt-support}
<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a>との統合は、一般的にdbt-clickhouseを介してサポートされています。

### `dlt`の状態の同期 {#syncing-of-dlt-state}
この宛先は、<a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a>の状態同期を完全にサポートします。
