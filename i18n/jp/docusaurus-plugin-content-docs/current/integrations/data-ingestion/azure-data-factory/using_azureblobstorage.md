---
sidebar_label: 'azureBlobStorage テーブル関数の利用'
slug: /integrations/azure-data-factory/table-function
description: 'ClickHouse の azureBlobStorage テーブル関数の利用'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: 'Azure データを ClickHouse に取り込む ClickHouse の azureBlobStorage テーブル関数の利用'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# ClickHouseのazureBlobStorageテーブル関数の使用 {#using-azureBlobStorage-function}

これは、Azure Blob StorageまたはAzure Data Lake StorageからClickHouseにデータをコピーする最も効率的かつ簡単な方法の一つです。このテーブル関数を使用することで、ClickHouseがAzureストレージに直接接続し、必要に応じてデータを読み取るように指示できます。

この関数は、ソースから直接データの選択、挿入、フィルタリングを可能にするテーブルライクなインターフェースを提供します。高度に最適化されており、`CSV`、`JSON`、`Parquet`、`Arrow`、`TSV`、`ORC`、`Avro`など、広く使用されている多数のファイル形式をサポートしています。完全なリストについては、["データ形式"](/interfaces/formats)を参照してください。

このセクションでは、Azure Blob StorageからClickHouseへデータを転送するための基本的な手順と、この関数を効果的に使用するための重要な考慮事項について説明します。詳細および高度なオプションについては、公式ドキュメントを参照してください:
[`azureBlobStorage`テーブル関数ドキュメントページ](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)


## Azure Blob Storageアクセスキーの取得 {#acquiring-azure-blob-storage-access-keys}

ClickHouseからAzure Blob Storageにアクセスするには、アクセスキーを含む接続文字列が必要です。

1. Azureポータルで、**ストレージアカウント**に移動します。

2. 左側のメニューで、**セキュリティ + ネットワーク**セクションの**アクセスキー**を選択します。

   <Image
     img={azureDataStoreSettings}
     size='lg'
     alt='Azure Data Storeの設定'
     border
   />

3. **key1**または**key2**のいずれかを選択し、**接続文字列**フィールドの横にある**表示**ボタンをクリックします。

   <Image
     img={azureDataStoreAccessKeys}
     size='lg'
     alt='Azure Data Storeアクセスキー'
     border
   />

4. 接続文字列をコピーします。これはazureBlobStorageテーブル関数のパラメータとして使用します。


## Azure Blob Storageからのデータクエリ {#querying-the-data-from-azure-blob-storage}

お好みのClickHouseクエリコンソールを開きます。ClickHouse CloudのWebインターフェース、ClickHouse CLIクライアント、またはクエリ実行に使用するその他のツールが利用できます。接続文字列とClickHouseクエリコンソールの準備が整ったら、Azure Blob Storageから直接データをクエリできます。

次の例では、`data-container`という名前のコンテナ内に配置されたJSONファイルに格納されているすべてのデータをクエリします。

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

そのデータをローカルのClickHouseテーブル（例：`my_table`）にコピーする場合は、`INSERT INTO ... SELECT`文を使用できます。

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

これにより、中間的なETL処理を必要とせずに、外部データを効率的にClickHouseに取り込むことができます。


## Environmental sensorsデータセットを使用したシンプルな例 {#simple-example-using-the-environmental-sensors-dataset}

例として、Environmental Sensorsデータセットから1つのファイルをダウンロードします。

1. [Environmental Sensors Dataset](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)から[サンプルファイル](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)をダウンロードします

2. Azure Portalで、ストレージアカウントをまだ持っていない場合は新しく作成します。

:::warning
ストレージアカウントで**Allow storage account key access**が有効になっていることを確認してください。有効になっていない場合、アカウントキーを使用してデータにアクセスできません。
:::

3. ストレージアカウントに新しいコンテナを作成します。この例では、sensorsという名前を付けます。
   既存のコンテナを使用している場合は、この手順をスキップできます。

4. 先ほどダウンロードした`2019-06_bmp180.csv.zst`ファイルをコンテナにアップロードします。

5. 前述の手順に従って、Azure Blob Storageの接続文字列を取得します。

すべての設定が完了したので、Azure Blob Storageから直接データをクエリできます:

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

7. データをテーブルにロードするには、元のデータセットで使用されているスキーマの簡略版を作成します:
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
Azure Blob Storageのような外部ソースをクエリする際の設定オプションとスキーマ推論の詳細については、[入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference)を参照してください
:::

8. 次に、Azure Blob Storageからsensorsテーブルにデータを挿入します:
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

これで、sensorsテーブルにAzure Blob Storageに保存されている`2019-06_bmp180.csv.zst`ファイルのデータが格納されました。


## 追加リソース {#additional-resources}

これはazureBlobStorage関数を使用するための基本的な入門です。より高度なオプションや設定の詳細については、公式ドキュメントを参照してください。

- [azureBlobStorageテーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [入出力データのフォーマット](https://clickhouse.com/docs/sql-reference/formats)
- [入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference)
