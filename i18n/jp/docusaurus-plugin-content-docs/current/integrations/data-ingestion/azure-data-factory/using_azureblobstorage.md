sidebar_label: 'azureBlobStorage テーブル関数の使用'
slug: /integrations/azure-data-factory/table-function
description: 'ClickHouse の azureBlobStorage テーブル関数の使用'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: 'ClickHouse の azureBlobStorage テーブル関数を使用して Azure データを ClickHouse に取り込む'
```

import Image from '@theme/IdealImage';

import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# ClickHouse の azureBlobStorage テーブル関数の使用 {#using-azureBlobStorage-function}

これは、Azure Blob Storage または Azure Data Lake Storage から ClickHouse にデータをコピーする最も効率的で簡単な方法の一つです。このテーブル関数を使用すると、ClickHouse に Azure ストレージに直接接続して、オンデマンドでデータを読み取るよう指示できます。

データをソースから直接選択、挿入、およびフィルタリングできるテーブルのようなインターフェースを提供します。この関数は非常に最適化されており、`CSV`、`JSON`、`Parquet`、`Arrow`、`TSV`、`ORC`、`Avro` など、広く使用されている多くのファイル形式をサポートしています。完全なリストについては、["データ形式"](/interfaces/formats)を参照してください。

このセクションでは、Azure Blob Storage から ClickHouse にデータを転送するための簡単なスタートアップガイドと、この関数を効果的に使用するための重要な考慮事項について説明します。詳細および高度なオプションについては、公式ドキュメントを参照してください：
[`azureBlobStorage` テーブル関数 ドキュメントページ](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## Azure Blob Storage アクセスキーの取得 {#acquiring-azure-blob-storage-access-keys}

ClickHouse が Azure Blob Storage にアクセスできるようにするには、アクセスキーを含む接続文字列が必要です。

1. Azure ポータルで **ストレージアカウント** に移動します。

2. 左側のメニューから **セキュリティ + ネットワーキング** セクションの **アクセスキー** を選択します。
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. **key1** または **key2** のいずれかを選択し、**接続文字列** フィールドの横にある **表示** ボタンをクリックします。
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. 接続文字列をコピーします — これは azureBlobStorage テーブル関数のパラメータとして使用します。

## Azure Blob Storage からデータをクエリする {#querying-the-data-from-azure-blob-storage}

好みの ClickHouse クエリコンソールを開きます — これは ClickHouse Cloud のウェブインターフェース、ClickHouse CLI クライアント、またはクエリを実行する際に使用する他のツールでも構いません。接続文字列と ClickHouse クエリコンソールの準備が整ったら、Azure Blob Storage から直接データをクエリし始めることができます。

以下の例では、データコンテナ名 data-container に保存された JSON ファイル内のすべてのデータをクエリします：

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

そのデータをローカルの ClickHouse テーブル (例：my_table) にコピーしたい場合は、`INSERT INTO ... SELECT` ステートメントを使用できます：

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

これにより、中間 ETL ステップを必要とせずに、外部データを効率的に ClickHouse に取り込むことができます。

## 環境センサー データセットを使用した簡単な例 {#simple-example-using-the-environmental-sensors-dataset}

例として、環境センサー データセットから単一のファイルをダウンロードします。

1. [サンプルファイル](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)を
   [環境センサー データセット](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)からダウンロードします。

2. Azure ポータルで、まだ持っていない場合は新しいストレージアカウントを作成します。

:::warning
ストレージアカウント キーアクセスを有効にする がストレージアカウントで有効になっていることを確認してください。そうしないと、アカウントキーを使用してデータにアクセスできなくなります。
:::

3. ストレージアカウントに新しいコンテナを作成します。この例では、sensors と名付けます。
   既存のコンテナを使用している場合は、このステップをスキップできます。

4. 以前にダウンロードした `2019-06_bmp180.csv.zst` ファイルを
   コンテナにアップロードします。

5. 以前に説明した手順に従って、Azure Blob Storage 接続文字列を取得します。

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

7. テーブルにデータをロードするには、元のデータセットで使用されているスキーマの簡略版を作成します：
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
Azure Blob Storage のような外部ソースからクエリする際の構成オプションやスキーマ推論に関する詳細は、[入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference)を参照してください。
:::

8. これで、Azure Blob Storage から sensors テーブルにデータを挿入できます：
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

これで、sensors テーブルには Azure Blob Storage に保存された `2019-06_bmp180.csv.zst` ファイルからのデータが格納されました。

## 追加リソース {#additional-resources}

これは、azureBlobStorage 関数の使用に関する基本的な導入に過ぎません。より高度なオプションや構成の詳細については、公式ドキュメントを参照してください：

- [azureBlobStorage テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [入力および出力データのフォーマット](https://clickhouse.com/docs/sql-reference/formats)
- [入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference)
