---
'sidebar_label': 'azureBlobStorageテーブル関数の使用'
'slug': '/integrations/azure-data-factory/table-function'
'description': 'ClickHouseのazureBlobStorageテーブル関数を使用'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'azureBlobStorage'
'title': 'ClickHouseのazureBlobStorageテーブル関数を使用してAzureデータをClickHouseに取り込む'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# ClickHouseのazureBlobStorageテーブル関数の使用 {#using-azureBlobStorage-function}

これは、Azure Blob StorageやAzure Data Lake StorageからClickHouseにデータをコピーする最も効率的で簡単な方法の1つです。このテーブル関数を使用すると、ClickHouseにAzureストレージに直接接続して、オンデマンドでデータを読み取るよう指示できます。

これは、ソースから直接データを選択、挿入、フィルタリングできるテーブルのようなインターフェイスを提供します。この関数は非常に最適化されており、`CSV`, `JSON`, `Parquet`, `Arrow`, `TSV`, `ORC`, `Avro`など、広く使用されている多くのファイル形式をサポートしています。完全なリストについては、["データ形式"](/interfaces/formats)を参照してください。

このセクションでは、Azure Blob StorageからClickHouseへのデータ転送のための簡単なスタートアップガイドと、この関数を効果的に使用するための重要な考慮事項について説明します。詳細や高度なオプションについては、公式ドキュメントを参照してください：
[`azureBlobStorage` テーブル関数のドキュメントページ](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## Azure Blob Storageアクセスキーの取得 {#acquiring-azure-blob-storage-access-keys}

ClickHouseがAzure Blob Storageにアクセスできるようにするには、アクセスキーを含む接続文字列が必要です。

1. Azureポータルで、**ストレージアカウント**に移動します。

2. 左側のメニューで、**セキュリティ + ネットワーキング**セクションの下にある**アクセスキー**を選択します。
   <Image img={azureDataStoreSettings} size="lg" alt="Azure データストア設定" border/>

3. **key1**または**key2**のいずれかを選択し、**接続文字列**フィールドの横にある**表示**ボタンをクリックします。
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure データストアアクセスキー" border/>

4. 接続文字列をコピーします。これをazureBlobStorageテーブル関数のパラメータとして使用します。

## Azure Blob Storageからのデータクエリ {#querying-the-data-from-azure-blob-storage}

お好みのClickHouseクエリコンソールを開きます。これにはClickHouse CloudのWebインターフェイス、ClickHouse CLIクライアント、またはその他のクエリを実行するために使用するツールを含めることができます。接続文字列とClickHouseクエリコンソールの準備ができたら、Azure Blob Storageからデータを直接クエリできます。

次の例では、data-containerという名前のコンテナ内のJSONファイルに保存されているすべてのデータをクエリします：

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

そのデータをローカルのClickHouseテーブル（例：my_table）にコピーしたい場合は、`INSERT INTO ... SELECT`ステートメントを使用できます：

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

これにより、中間ETLステップを必要とせずに外部データをClickHouseに効率的に取り込むことができます。

## 環境センサーデータセットを使用したシンプルな例 {#simple-example-using-the-environmental-sensors-dataset}

例として、環境センサーのデータセットから単一のファイルをダウンロードします。

1. [サンプルファイル](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)を[環境センサーデータセット](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)からダウンロードします。

2. Azureポータルで、新しいストレージアカウントを作成します。すでにある場合はこのステップをスキップできます。

:::warning
ストレージアカウントキーアクセスを**許可**することがストレージアカウントで有効にされていることを確認してください。そうしないと、アカウントキーを使用してデータにアクセスできません。
:::

3. ストレージアカウント内に新しいコンテナを作成します。この例では、sensorsと名付けます。既存のコンテナを使用する場合はこのステップをスキップできます。

4. 前にダウンロードした`2019-06_bmp180.csv.zst`ファイルをコンテナにアップロードします。

5. 以前に説明した手順に従って、Azure Blob Storageの接続文字列を取得します。

すべての準備が整ったので、Azure Blob Storageから直接データをクエリできます：

```sql
SELECT *
FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>', 
    'sensors',
    '2019-06_bmp180.csv.zst', 
    'CSVWithNames')
LIMIT 10
SETTINGS format_csv_delimiter = ';'
```

7. データをテーブルにロードするには、元のデータセットで使用されているスキーマの簡略版を作成します：
```sql
CREATE TABLE sensors
(
    sensor_id UInt16,
    lat Float32,
    lon Float32,
    timestamp DateTime,
    temperature Float32
)
ENGINE = MergeTree
ORDER BY (timestamp, sensor_id);
```

:::info
Azure Blob Storageのような外部ソースをクエリするときの構成オプションとスキーマ推論についての詳細は、[入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference)を参照してください。
:::

8. それでは、Azure Blob Storageからsensorsテーブルにデータを挿入します：
```sql
INSERT INTO sensors
SELECT sensor_id, lat, lon, timestamp, temperature
FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>', 
    'sensors',
    '2019-06_bmp180.csv.zst', 
    'CSVWithNames')
SETTINGS format_csv_delimiter = ';'
```

これで、sensorsテーブルはAzure Blob Storageに保存されている`2019-06_bmp180.csv.zst`ファイルからのデータで満たされています。

## 追加リソース {#additional-resources}

これは、azureBlobStorage関数の使用に関する基本的な紹介に過ぎません。より高度なオプションや構成の詳細については、公式ドキュメントを参照してください：

- [azureBlobStorageテーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [入力および出力データの形式](https://clickhouse.com/docs/sql-reference/formats)
- [入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference)
