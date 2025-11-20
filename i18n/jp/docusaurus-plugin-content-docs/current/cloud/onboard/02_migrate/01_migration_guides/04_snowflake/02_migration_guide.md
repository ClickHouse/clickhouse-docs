---
sidebar_label: '移行ガイド'
slug: /migrations/snowflake
description: 'Snowflake から ClickHouse への移行'
keywords: ['Snowflake']
title: 'Snowflake から ClickHouse への移行'
show_related_blogs: false
doc_type: 'guide'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# SnowflakeからClickHouseへの移行

> このガイドでは、SnowflakeからClickHouseへデータを移行する方法を説明します。

SnowflakeとClickHouse間でデータを移行する際は、転送用の中間ストレージとして
S3などのオブジェクトストアを使用する必要があります。移行プロセスでは、
Snowflakeの`COPY INTO`コマンドとClickHouseの`INSERT INTO SELECT`
コマンドを利用します。

<VerticalStepper headerLevel="h2">


## Snowflakeからデータをエクスポートする {#1-exporting-data-from-snowflake}

<Image
  img={migrate_snowflake_clickhouse}
  size='md'
  alt='SnowflakeからClickHouseへの移行'
/>

Snowflakeからデータをエクスポートするには、上図に示すように外部ステージの使用が必要です。

次のスキーマを持つSnowflakeテーブルをエクスポートする場合を考えてみましょう:

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

このテーブルのデータをClickHouseデータベースに移行するには、まずこのデータを外部ステージにコピーする必要があります。データをコピーする際は、型情報の共有が可能で、精度を保持し、圧縮効率が高く、分析で一般的に使用されるネスト構造をネイティブにサポートするParquetを中間フォーマットとして推奨します。

以下の例では、SnowflakeでParquetと必要なファイルオプションを表す名前付きファイルフォーマットを作成します。次に、コピーしたデータセットを格納するバケットを指定します。最後に、データセットをバケットにコピーします。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- コピー先のS3バケットを指定する外部ステージを作成
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- すべてのファイルに"mydataset"プレフィックスを適用し、最大ファイルサイズを150MBに指定
-- カラム名を取得するには`header=true`パラメータが必要
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

約5TBのデータセットで最大ファイルサイズが150MB、同じAWS `us-east-1`リージョンに配置された2X-Large Snowflakeウェアハウスを使用する場合、S3バケットへのデータコピーには約30分かかります。


## ClickHouseへのインポート {#2-importing-to-clickhouse}

データが中間オブジェクトストレージにステージングされると、[s3テーブル関数](/sql-reference/table-functions/s3)などのClickHouse関数を使用して、以下のようにテーブルにデータを挿入できます。

この例ではAWS S3用の[s3テーブル関数](/sql-reference/table-functions/s3)を使用していますが、Google Cloud Storage用には[gcsテーブル関数](/sql-reference/table-functions/gcs)を、Azure Blob Storage用には[azureBlobStorageテーブル関数](/sql-reference/table-functions/azureBlobStorage)を使用できます。

以下のターゲットテーブルスキーマを想定します:

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

次に、`INSERT INTO SELECT`コマンドを使用して、S3からClickHouseテーブルにデータを挿入できます:

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
SETTINGS input_format_null_as_default = 1, -- 値がnullの場合、カラムをデフォルト値として挿入
input_format_parquet_case_insensitive_column_matching = 1 -- ソースデータとターゲットテーブル間のカラムマッチングで大文字小文字を区別しない
```

:::note ネストされたカラム構造に関する注意
元のSnowflakeテーブルスキーマの`VARIANT`および`OBJECT`カラムは、デフォルトでJSON文字列として出力されるため、ClickHouseに挿入する際にキャストする必要があります。

`some_file`などのネスト構造は、Snowflakeによるコピー時にJSON文字列に変換されます。このデータをインポートする際は、上記のように[JSONExtract関数](/sql-reference/functions/json-functions#JSONExtract)を使用して、ClickHouseでの挿入時にこれらの構造をタプルに変換する必要があります。
:::


## データエクスポートの成功を確認する {#3-testing-successful-data-export}

データが正しく挿入されたかどうかを確認するには、新しいテーブルに対して`SELECT`クエリを実行します:

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
