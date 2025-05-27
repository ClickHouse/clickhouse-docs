---
'sidebar_label': 'azureBlobStorageテーブル関数の使用'
'slug': '/integrations/azure-data-factory/table-function'
'description': 'ClickHouseのazureBlobStorageテーブル関数の使用'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'azureBlobStorage'
'title': 'ClickHouseのazureBlobStorageテーブル関数を使用してAzureデータをClickHouseに取り込む'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# Using ClickHouse's azureBlobStorage table function {#using-azureBlobStorage-function}

これは、Azure Blob Storage または Azure Data Lake Storage から ClickHouse にデータをコピーする最も効率的かつ簡単な方法の一つです。このテーブル関数を使用すると、ClickHouse に Azure ストレージに直接接続し、データをオンデマンドで読み取るよう指示できます。

これは、データをソースから直接選択、挿入、フィルタリングできるテーブルのようなインターフェイスを提供します。この関数は高度に最適化されており、`CSV`、`JSON`、`Parquet`、`Arrow`、`TSV`、`ORC`、`Avro` など、多くの一般的に使用されるファイル形式をサポートしています。完全なリストについては ["Data formats"](/interfaces/formats) を参照してください。

このセクションでは、Azure Blob Storage から ClickHouse へのデータ転送に関する簡単なスタートアップガイドと、この関数を効果的に使用するための重要な考慮事項を説明します。詳細および高度なオプションについては、公式ドキュメントを参照してください：
[`azureBlobStorage` Table Function documentation page](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## Acquiring Azure Blob Storage Access Keys {#acquiring-azure-blob-storage-access-keys}

ClickHouse が Azure Blob Storage にアクセスできるようにするには、アクセスキーを含む接続文字列が必要です。

1. Azure ポータルで、**ストレージアカウント**に移動します。

2. 左側のメニューで、**セキュリティ + ネットワーキング**セクションの下にある **アクセスキー** を選択します。
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. **key1** または **key2** のいずれかを選択し、**接続文字列**フィールドの横にある **表示** ボタンをクリックします。
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. 接続文字列をコピーします。この接続文字列は、azureBlobStorage テーブル関数のパラメータとして使用します。

## Querying the data from Azure Blob Storage {#querying-the-data-from-azure-blob-storage}

お好みの ClickHouse クエリコンソールを開きます。このクエリコンソールは、ClickHouse Cloud の Web インターフェイス、ClickHouse CLI クライアント、またはクエリを実行するために使用する他のツールのいずれでもかまいません。接続文字列と ClickHouse クエリコンソールの準備が整ったら、Azure Blob Storage からデータを直接クエリできます。

以下の例では、data-container という名前のコンテナに保存されている JSON ファイル内のすべてのデータをクエリします：

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

そのデータをローカルの ClickHouse テーブル（例：my_table）にコピーしたい場合は、`INSERT INTO ... SELECT` ステートメントを使用できます：

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

これにより、中間的な ETL ステップを必要とせずに、外部データを効率的に ClickHouse に取り込むことができます。

## A simple example using the Environmental Sensors Dataset {#simple-example-using-the-environmental-sensors-dataset}

例として、Environmental Sensors Dataset から単一のファイルをダウンロードします。

1. [サンプルファイル](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)を [Environmental Sensors Dataset](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors) からダウンロードします。

2. Azure ポータルで、まだ持っていない場合は新しいストレージアカウントを作成します。

:::warning
ストレージアカウントのキーアクセスを許可する設定が有効になっていることを確認してください。そうしないと、アカウントキーを使用してデータにアクセスできません。
:::

3. ストレージアカウント内に新しいコンテナを作成します。この例では、コンテナの名前を sensors とします。
   既存のコンテナを使用している場合、このステップはスキップできます。

4. 前にダウンロードした `2019-06_bmp180.csv.zst` ファイルをコンテナにアップロードします。

5. 前述の手順に従って Azure Blob Storage の接続文字列を取得します。

すべての設定が完了したので、Azure Blob Storage から直接データをクエリできます：

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

7. テーブルにデータをロードするため、元のデータセットで使用されているスキーマの簡略版を作成します：
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
Azure Blob Storage のような外部ソースをクエリするときの構成オプションやスキーマ推論に関する詳細情報は、[入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference) を参照してください。
:::

8. それでは、Azure Blob Storage から sensors テーブルにデータを挿入します：
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

これで、sensors テーブルには Azure Blob Storage に保存されている `2019-06_bmp180.csv.zst` ファイルからのデータが満たされました。

## Additional Resources {#additional-resources}

これは、azureBlobStorage 関数を使用するための基本的な導入に過ぎません。より高度なオプションや設定の詳細については、公式ドキュメントを参照してください：

- [azureBlobStorage Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [Formats for Input and Output Data](https://clickhouse.com/docs/sql-reference/formats)
- [Automatic schema inference from input data](https://clickhouse.com/docs/interfaces/schema-inference)
