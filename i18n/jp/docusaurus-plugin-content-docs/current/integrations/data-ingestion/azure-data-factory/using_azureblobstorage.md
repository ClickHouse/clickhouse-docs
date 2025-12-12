---
sidebar_label: 'azureBlobStorage テーブル関数の使用'
slug: /integrations/azure-data-factory/table-function
description: 'ClickHouse の azureBlobStorage テーブル関数の使用'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: 'ClickHouse の azureBlobStorage テーブル関数を使用して Azure のデータを ClickHouse に取り込む'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';

# ClickHouse の azureBlobStorage テーブル関数の使用 {#using-azureBlobStorage-function}

これは、Azure Blob Storage または Azure Data Lake Storage から ClickHouse へ
データをコピーするための、最も効率的かつシンプルな方法の 1 つです。このテーブル
関数を使用すると、ClickHouse に Azure ストレージへ直接接続し、
オンデマンドでデータを読み取らせることができます。

テーブルのようなインターフェースを提供し、ソースから直接データを
`SELECT`、`INSERT`、フィルタリングできるようにします。この関数は高度に最適化されており、
`CSV`、`JSON`、`Parquet`、`Arrow`、`TSV`、`ORC`、`Avro` など、広く使用されている多くの
ファイル形式をサポートしています。完全な一覧については ["Data formats"](/interfaces/formats)
を参照してください。

このセクションでは、Azure Blob Storage から ClickHouse へデータを転送するための
シンプルな入門ガイドと、この関数を効果的に使用するための
重要な考慮事項を説明します。詳細および高度なオプションについては、
公式ドキュメントである
[`azureBlobStorage` テーブル関数のドキュメントページ](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
を参照してください。

## Azure Blob Storage のアクセスキーの取得 {#acquiring-azure-blob-storage-access-keys}

ClickHouse が Azure Blob Storage にアクセスできるようにするには、アクセスキー付きの接続文字列が必要です。

1. Azure ポータルで、**Storage Account** に移動します。

2. 左側のメニューで、**Security + networking** セクション内の **Access keys** を選択します。
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. **key1** または **key2** のいずれかを選択し、**Connection string** フィールドの横にある **Show** ボタンをクリックします。
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. 接続文字列をコピーします。この接続文字列を azureBlobStorage テーブル関数のパラメータとして使用します。

## Azure Blob Storage 上のデータをクエリする {#querying-the-data-from-azure-blob-storage}

お使いの ClickHouse クエリコンソールを開きます。これは ClickHouse Cloud
の Web インターフェイス、ClickHouse CLI クライアント、またはクエリを
実行するために使用しているその他のツールのいずれでもかまいません。接続文字列と
ClickHouse クエリコンソールの両方を準備できたら、Azure Blob Storage 上の
データに対して直接クエリを実行できます。

次の例では、`data-container` という名前のコンテナ内にある JSON ファイルに保存された
すべてのデータをクエリします。

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

そのデータをローカルの ClickHouse テーブル（たとえば my&#95;table）にコピーしたい場合は、
`INSERT INTO ... SELECT` 文を使用できます。

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

これにより、中間の ETL ステップを挟むことなく、外部データを効率的に ClickHouse に取り込めます。

## Environmental Sensors データセットを使った簡単な例 {#simple-example-using-the-environmental-sensors-dataset}

例として、Environmental Sensors データセットから 1 つのファイルをダウンロードします。

1. [Environmental Sensors データセット](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors) から
   [サンプルファイル](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst) をダウンロードします。

2. Azure Portal で、まだストレージアカウントを持っていない場合は新しいストレージアカウントを作成します。

:::warning
ストレージアカウントで **Allow storage account key access** が有効になっていることを確認してください。有効になっていない場合、アカウントキーを使用してデータにアクセスできません。
:::

3. ストレージアカウント内に新しいコンテナを作成します。この例では、コンテナ名を sensors とします。
   既存のコンテナを使用する場合は、この手順をスキップできます。

4. 先ほどダウンロードした `2019-06_bmp180.csv.zst` ファイルをコンテナにアップロードします。

5. 前述の手順に従って、Azure Blob Storage の接続文字列を取得します。

これですべての準備が整ったので、Azure Blob Storage からデータを直接クエリを実行できます。

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

7. テーブルにデータを読み込むには、元のデータセットで使用されている
   スキーマの簡略版を作成します:
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
Azure Blob Storage のような外部ソースに対してクエリを実行する際の構成オプションや
スキーマ推論の詳細については、[入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference)
を参照してください。
:::

8. 次に、Azure Blob Storage から sensors テーブルにデータを挿入します:
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

`sensors` テーブルには、Azure Blob Storage に保存されている `2019-06_bmp180.csv.zst`
ファイルのデータが取り込まれました。

## 追加リソース {#additional-resources}

ここでは `azureBlobStorage` 関数の基本的な使い方のみを紹介しました。より高度なオプションや設定の詳細については、以下の公式ドキュメントを参照してください：

- [`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [入力データおよび出力データのフォーマット](https://clickhouse.com/docs/sql-reference/formats)
- [入力データからの自動スキーマ推論](https://clickhouse.com/docs/interfaces/schema-inference)
