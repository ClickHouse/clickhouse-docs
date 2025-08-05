---
sidebar_label: 'Snowflake'
sidebar_position: 20
slug: '/migrations/snowflake'
description: 'Snowflake から ClickHouse への移行'
keywords:
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'snowflake'
title: 'Snowflake から ClickHouse への移行'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# SnowflakeからClickHouseへの移行

このガイドでは、SnowflakeからClickHouseにデータを移行する方法を示します。

SnowflakeとClickHouseの間でデータを移行するには、S3のようなオブジェクトストレージを転送のための中間ストレージとして使用する必要があります。移行プロセスはまた、Snowflakeの`COPY INTO`コマンドとClickHouseの`INSERT INTO SELECT`を使うことに依存しています。

## 1. Snowflakeからのデータのエクスポート {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="SnowflakeからClickHouseに移行"/>

Snowflakeからデータをエクスポートするには、上記の図に示されているように外部ステージを使用する必要があります。

次のスキーマを持つSnowflakeのテーブルをエクスポートしたいとしましょう：

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;

このテーブルのデータをClickHouseデータベースに移動するためには、まずこのデータを外部ステージにコピーする必要があります。データをコピーする際には、型情報を共有でき、精度を保持し、圧縮が良く、分析で一般的なネストされた構造をネイティブにサポートしているため、間の形式としてParquetを推奨します。

以下の例では、SnowflakeにおいてParquetを表す名前付きファイルフォーマットを作成し、希望するファイルオプションを指定します。次に、コピーしたデータセットを含むバケットを指定します。最後に、データセットをバケットにコピーします。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- コピー先のS3バケットを指定した外部ステージを作成
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- すべてのファイルに"mydataset"のプレフィックスを適用し、最大ファイルサイズを150MBに指定
-- `header=true`パラメータはカラム名を取得するために必要
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;

約5TBのデータセットで最大ファイルサイズが150MBの場合、同じAWSの`us-east-1`リージョンにある2X-LargeのSnowflakeウェアハウスを使用していると、データをS3バケットにコピーするのに約30分かかります。

## 2. ClickHouseへのインポート {#2-importing-to-clickhouse}

データが中間のオブジェクトストレージにステージされていると、[s3テーブル関数](/sql-reference/table-functions/s3)などのClickHouse関数を使用して、下記のようにテーブルにデータを挿入できます。

この例では、AWS S3用の[s3テーブル関数](/sql-reference/table-functions/s3)を使用していますが、Google Cloud Storageには[gcsテーブル関数](/sql-reference/table-functions/gcs)を、Azure Blob Storageには[azureBlobStorageテーブル関数](/sql-reference/table-functions/azureBlobStorage)を使用できます。

次のテーブルターゲットスキーマを仮定します：

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

次に、`INSERT INTO SELECT`コマンドを使用して、S3からClickHouseのテーブルにデータを挿入できます：

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
SETTINGS input_format_null_as_default = 1, -- 値がnullの場合、カラムはデフォルトとして挿入されることを保証
input_format_parquet_case_insensitive_column_matching = 1 -- ソースデータとターゲットテーブル間でのカラムマッチングは大文字小文字を区別しない

:::note ネストされたカラム構造に関する注意
元のSnowflakeテーブルスキーマの`VARIANT`および`OBJECT`カラムは、デフォルトでJSON文字列として出力されるため、ClickHouseに挿入する際にはこれをキャストする必要があります。

`sone_file`のようなネストされた構造は、Snowflakeによってコピー時にJSON文字列に変換されます。このデータをインポートするには、同期時にこれらの構造をタプルに変換する必要があります。上記のように、[JSONExtract関数](/sql-reference/functions/json-functions#jsonextract)を使用します。
:::

## 3. データエクスポートの成功を確認する {#3-testing-successful-data-export}

データが正しく挿入されたかどうかを確認するには、新しいテーブルに対して単純に`SELECT`クエリを実行します：

```sql
SELECT * FROM mydataset limit 10;

## さらなるリーディングとサポート {#further-reading-and-support}

このガイドに加えて、[SnowflakeとClickHouseを比較する](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide)というブログ記事を読むことをお勧めします。

SnowflakeからClickHouseへのデータ転送に問題がある場合は、support@clickhouse.comまでお気軽にお問い合わせください。
