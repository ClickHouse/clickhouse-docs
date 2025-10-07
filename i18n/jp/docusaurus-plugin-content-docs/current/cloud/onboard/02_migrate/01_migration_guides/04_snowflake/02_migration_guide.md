---
'sidebar_label': '移行ガイド'
'slug': '/migrations/snowflake'
'description': 'SnowflakeからClickHouseへの移行'
'keywords':
- 'Snowflake'
'title': 'SnowflakeからClickHouseへの移行'
'show_related_blogs': false
'doc_type': 'guide'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# SnowflakeからClickHouseへの移行

> このガイドでは、SnowflakeからClickHouseにデータを移行する方法を説明します。

SnowflakeとClickHouseの間でデータを移行するには、S3などのオブジェクトストレージを中間ストレージとして使用する必要があります。移行プロセスでは、Snowflakeの`COPY INTO`コマンドとClickHouseの`INSERT INTO SELECT`を使用します。

<VerticalStepper headerLevel="h2">

## Snowflakeからデータをエクスポート {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="SnowflakeからClickHouseへの移行"/>

Snowflakeからデータをエクスポートするには、上記の図に示されているように外部ステージを使用する必要があります。

次のスキーマを持つSnowflakeテーブルをエクスポートしたいとしましょう。

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

このテーブルのデータをClickHouseデータベースに移動するには、まずこのデータを外部ステージにコピーする必要があります。データをコピーする際には、型情報を共有し、精度を保持し、圧縮性能が高く、分析に一般的なネスト構造をネイティブにサポートするため、間接フォーマットとしてParquetを推奨します。

以下の例では、Parquetを表す名前付きファイルフォーマットをSnowflakeで作成し、希望するファイルオプションを指定します。次に、コピーしたデータセットが格納されるバケットを指定します。最後に、データセットをバケットにコピーします。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Create the external stage that specifies the S3 bucket to copy into
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Apply "mydataset" prefix to all files and specify a max file size of 150mb
-- The `header=true` parameter is required to get column names
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

約5TBのデータセットで最大ファイルサイズが150MB、AWSの`us-east-1`リージョンにある2X-LargeのSnowflakeウェアハウスを使用している場合、データをS3バケットにコピーするには約30分かかります。

## ClickHouseへのインポート {#2-importing-to-clickhouse}

データが中間オブジェクトストレージに準備されたら、ClickHouseの関数や[ s3テーブル関数 ](/sql-reference/table-functions/s3)を使用して、データをテーブルに挿入できます。以下に示します。

この例では、AWS S3のために[ s3テーブル関数 ](/sql-reference/table-functions/s3)を使用していますが、Google Cloud Storageには[ gcsテーブル関数 ](/sql-reference/table-functions/gcs)を、Azure Blob Storageには[ azureBlobStorageテーブル関数 ](/sql-reference/table-functions/azureBlobStorage)を使用できます。

次のテーブルのターゲットスキーマを仮定します。

```sql
CREATE TABLE default.mydataset
(
  `timestamp` DateTime64(6),
  `some_text` String,
  `some_file` Tuple(filename String, version String),
  `complex_data` Tuple(name String, description String),
)
ENGINE = MergeTree
ORDER BY (timestamp)
```

次に、`INSERT INTO SELECT`コマンドを使用して、S3からClickHouseテーブルにデータを挿入します。

```sql
INSERT INTO mydataset
SELECT
  timestamp,
  some_text,
  JSONExtract(
    ifNull(some_file, '{}'),
    'Tuple(filename String, version String)'
  ) AS some_file,
  JSONExtract(
    ifNull(complex_data, '{}'),
    'Tuple(filename String, description String)'
  ) AS complex_data,
FROM s3('https://mybucket.s3.amazonaws.com/mydataset/mydataset*.parquet')
SETTINGS input_format_null_as_default = 1, -- Ensure columns are inserted as default if values are null
input_format_parquet_case_insensitive_column_matching = 1 -- Column matching between source data and target table should be case insensitive
```

:::note ネストされたカラム構造に関する注意
元のSnowflakeテーブルスキーマの`VARIANT`および`OBJECT`カラムはデフォルトでJSON文字列として出力され、これをClickHouseに挿入する際にキャストする必要があります。

`some_file`のようなネスト構造は、コピー時にSnowflakeによってJSON文字列に変換されます。このデータをインポートするには、[ JSONExtract関数 ](/sql-reference/functions/json-functions#JSONExtract)を使用して、ClickHouseに挿入する際にこれらの構造をタプルに変換する必要があります。
:::

## データエクスポートの成功をテストする {#3-testing-successful-data-export}

データが正しく挿入されたかどうかをテストするには、新しいテーブルで`SELECT`クエリを実行します。

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
