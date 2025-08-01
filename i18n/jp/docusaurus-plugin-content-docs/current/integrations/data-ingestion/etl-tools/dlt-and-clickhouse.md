---
sidebar_label: 'dlt'
keywords:
- 'clickhouse'
- 'dlt'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
description: 'Load data into ClickHouse using dlt integration'
title: 'Connect dlt to ClickHouse'
slug: '/integrations/data-ingestion/etl-tools/dlt-and-clickhouse'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connect dlt to ClickHouse

<CommunityMaintainedBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> はオープンソースのライブラリで、Python スクリプトに追加して、さまざまな場合に乱雑なデータソースからデータを、構造化されたライブデータセットにロードすることができます。

## Install dlt with ClickHouse {#install-dlt-with-clickhouse}

### To Install the `dlt` library with ClickHouse dependencies: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]"
```

## Setup Guide {#setup-guide}

### 1. Initialize the dlt Project {#1-initialize-the-dlt-project}

新しい `dlt` プロジェクトを初期化するには、以下のようにします：
```bash
dlt init chess clickhouse
```


:::note
このコマンドは、チェスをソースとして、ClickHouseを宛先としてパイプラインを初期化します。
:::

上記のコマンドは、`.dlt/secrets.toml` や ClickHouse のための要件ファイルを含むいくつかのファイルとディレクトリを生成します。以下のように要件ファイルで指定されている必要な依存関係をインストールできます：
```bash
pip install -r requirements.txt
```

または `pip install dlt[clickhouse]` を使うことで、`dlt` ライブラリと ClickHouse を宛先として使用するために必要な依存関係をインストールできます。

### 2. Setup ClickHouse Database {#2-setup-clickhouse-database}

ClickHouse にデータをロードするには、ClickHouse データベースを作成する必要があります。以下に、実施すべき大まかな手順を示します：

1. 既存の ClickHouse データベースを使用するか、新しいものを作成します。

2. 新しいデータベースを作成するには、`clickhouse-client` コマンドラインツールまたはお好みの SQL クライアントを使用して ClickHouse サーバーに接続します。

3. 新しいデータベース、ユーザーを作成し、必要な権限を付与するために、以下の SQL コマンドを実行します：

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```


### 3. Add Credentials {#3-add-credentials}

次に、`.dlt/secrets.toml` ファイルに ClickHouse の資格情報を設定します：

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 作成したデータベース名
username = "dlt"                         # ClickHouse ユーザー名、デフォルトは通常 "default"
password = "Dlt*12345789234567"          # ClickHouse のパスワード（あれば）
host = "localhost"                       # ClickHouse サーバーのホスト
port = 9000                              # ClickHouse HTTP ポート、デフォルトは 9000
http_port = 8443                         # ClickHouse サーバーの HTTP インターフェースに接続するための HTTP ポート。デフォルトは 8443。
secure = 1                               # HTTPS を使用する場合は 1 に設定し、そうでない場合は 0。
dataset_table_separator = "___"          # データセット名とデータセットテーブル名のセパレーター。
```


:::note
HTTP_PORT
`http_port` パラメータは、ClickHouse サーバーの HTTP インターフェースに接続する際に使用するポート番号を指定します。これは、ネイティブ TCP プロトコルに使用されるデフォルトポート 9000 とは異なります。

外部ステージングを使用しない場合（つまり、パイプラインでステージングパラメータを設定しない場合）、`http_port` を設定する必要があります。これは、組み込みの ClickHouse ローカルストレージステージングが <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a> ライブラリを使用し、ClickHouse と HTTP 経由で通信するためです。

ClickHouse サーバーが、`http_port` で指定したポートで HTTP 接続を受け入れるように構成されていることを確認してください。たとえば、`http_port = 8443` を設定した場合、ClickHouse はポート 8443 で HTTP リクエストを待機している必要があります。外部ステージングを使用している場合は、clickhouse-connect が使用されないため、`http_port` パラメータを省略できます。
:::

`clickhouse-driver` ライブラリで使用するのと同様のデータベース接続文字列を渡すことができます。上記の資格情報は次のように見えます：

```bash

# toml ファイルの先頭に維持し、セクションが始まる前に配置します。
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```


## Write Disposition {#write-disposition}

すべての [write dispositions](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition) がサポートされています。

dlt ライブラリの書き込みディスポジションは、データを宛先にどのように書き込むかを定義します。書き込みディスポジションには、3 つのタイプがあります：

**Replace**: このディスポジションは、リソースのデータで宛先のデータを置き換えます。すべてのクラスとオブジェクトを削除し、データをロードする前にスキーマを再作成します。詳細については <a href="https://dlthub.com/docs/general-usage/full-loading">こちら</a>で学ぶことができます。

**Merge**: この書き込みディスポジションは、リソースのデータと宛先のデータをマージします。`merge` ディスポジションでは、リソースに対して `primary_key` を指定する必要があります。詳細については <a href="https://dlthub.com/docs/general-usage/incremental-loading">こちら</a>をご覧ください。

**Append**: これはデフォルトのディスポジションです。既存のデータにデータを追加し、`primary_key` フィールドを無視します。

## Data Loading {#data-loading}
データは、データソースに応じて最も効率的な方法で ClickHouse にロードされます：

- ローカルファイルの場合、`clickhouse-connect` ライブラリを使用して、`INSERT` コマンドを使用してファイルを ClickHouse テーブルに直接ロードします。
- `S3`、`Google Cloud Storage`、または `Azure Blob Storage` のようなリモートストレージのファイルに対しては、ClickHouse テーブル関数（s3、gcs、azureBlobStorage）を使用してファイルを読み取り、データをテーブルに挿入します。

## Datasets {#datasets}

`Clickhouse` は 1 つのデータベース内に複数のデータセットをサポートしていませんが、`dlt` はさまざまな理由からデータセットに依存しています。`Clickhouse` と `dlt` を連携させるために、`dlt` が `Clickhouse` データベースに生成するテーブルの名前にはデータセット名がプレフィックスとして付加され、設定可能な `dataset_table_separator` で区切られます。さらに、データを含まない特別なセンチネルテーブルが作成され、`dlt` が `Clickhouse` 宛先に既に存在する仮想データセットを認識できるようになります。

## Supported File Formats {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> は、直接ロードおよびステージングの両方で推奨されるフォーマットです。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> も、直接ロードおよびステージングの両方でサポートされています。

`clickhouse` 宛先には、デフォルトの SQL 宛先からいくつか特有の逸脱があります：

1. `Clickhouse` には実験的な `object` データ型がありますが、少し予測不可能であることがわかったため、dlt Clickhouse 宛先は複雑なデータ型をテキストカラムにロードします。この機能が必要な場合は、Slack コミュニティに連絡ください。追加を検討します。
2. `Clickhouse` は `time` データ型をサポートしていません。時間は `text` カラムにロードされます。
3.  `Clickhouse` は `binary` データ型をサポートしていません。その代わり、バイナリデータは `text` カラムにロードされます。`jsonl` からロードする場合、バイナリデータは base64 文字列になり、parquet からロードする場合、`binary` オブジェクトは `text` に変換されます。
5. `Clickhouse` は null でない列を既存のテーブルに追加することを受け入れます。
6. `Clickhouse` は float または double データ型を使用する際に特定の条件下で丸め誤差が発生する可能性があります。丸め誤差が許容できない場合は、decimal データ型を使用してください。たとえば、`jsonl` でローダーファイル形式を設定して double カラムに値 12.7001 をロードすると、予測可能な丸め誤差が発生します。

## Supported Column Hints {#supported-column-hints}
ClickHouse は以下の <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">カラムヒント</a> をサポートしています：

- `primary_key` - カラムを主キーの一部としてマークします。複数のカラムがこのヒントを持つことで複合主キーを作成できます。

## Table Engine {#table-engine}
デフォルトでは、ClickHouse でのテーブルは `ReplicatedMergeTree` テーブルエンジンを使用して作成されます。クリックハウスアダプターを使用して代替のテーブルエンジンを指定できます：

```bash
from dlt.destinations.adapters import clickhouse_adapter


@dlt.resource()
def my_resource():
  ...


clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

サポートされる値は：

- `merge_tree` - `MergeTree` エンジンを使用してテーブルを作成します
- `replicated_merge_tree` (デフォルト) - `ReplicatedMergeTree` エンジンを使用してテーブルを作成します

## Staging Support {#staging-support}

ClickHouse はファイルステージング宛先として Amazon S3、Google Cloud Storage、および Azure Blob Storage をサポートしています。

`dlt` は Parquet または jsonl ファイルをステージングロケーションにアップロードし、ClickHouse テーブル関数を使用して、ステージされたファイルから直接データをロードします。

ステージング宛先の資格情報を構成する方法については、ファイルシステムのドキュメントを参照してください：

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

ステージングを有効にしてパイプラインを実行するには：

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # これを追加してステージングを有効化します
  dataset_name='chess_data'
)
```

### Using Google Cloud Storage as a Staging Area {#using-google-cloud-storage-as-a-staging-area}
dlt は、ClickHouse にデータをロードする際に Google Cloud Storage (GCS) をステージングエリアとして使用することをサポートしています。これは、ClickHouse の <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS テーブル関数</a> が裏で dlt によって自動的に処理されます。

clickhouse の GCS テーブル関数は、ハッシュベースメッセージ認証コード (HMAC) キーを使用した認証のみをサポートします。これを有効にするために、GCS は Amazon S3 API をエミュレートする S3 互換モードを提供しています。ClickHouse はこれを活用して、S3 統合を介して GCS バケットにアクセスします。

dlt で HMAC 認証を使用して GCS ステージングをセットアップするには：

1. GCS サービスアカウントの HMAC キーを作成するには、<a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud ガイド</a>に従ってください。

2. dlt プロジェクトの ClickHouse 宛先設定の `config.toml` で、HMAC キーと共に `client_email`、`project_id`、`private_key` を設定します：

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

注意: HMAC キーに加え、`bashgcp_access_key_id` と `gcp_secret_access_key` の他に、`client_email`、`project_id`、`private_key` を `[destination.filesystem.credentials]` に提供する必要があります。これは、GCS ステージングサポートが現在、一時的な作業アラウンドとして実装されており、最適化されていないからです。

dlt はこれらの資格情報を ClickHouse に渡し、認証と GCS アクセスを処理します。

将来的には、ClickHouse dlt 宛先の GCS ステージング設定を簡素化し、改善するための作業が進行中です。正式な GCS ステージングサポートは、これらの GitHub イシューで追跡されています：

- ファイルシステム宛先を <a href="https://github.com/dlt-hub/dlt/issues/1272"> GCS と連携できるようにする</a> S3 互換モード
- Google Cloud Storage ステージングエリア <a href="https://github.com/dlt-hub/dlt/issues/1181">サポート</a>

### dbt Support {#dbt-support}
<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> との統合は、一般的に dbt-clickhouse を介してサポートされています。

### Syncing of `dlt` state {#syncing-of-dlt-state}
この宛先は、<a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> 状態の同期を完全にサポートしています。
