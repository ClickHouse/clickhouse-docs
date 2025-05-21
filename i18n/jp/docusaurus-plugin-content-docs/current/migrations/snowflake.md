---
sidebar_label: 'Snowflake'
sidebar_position: 20
slug: /migrations/snowflake
description: 'Snowflake から ClickHouse への移行'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'snowflake']
title: 'Snowflake から ClickHouse への移行'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# Snowflake から ClickHouse への移行

このガイドでは、Snowflake から ClickHouse にデータを移行する方法を示します。

Snowflake と ClickHouse の間でデータを移行するには、S3 などのオブジェクトストアを中間ストレージとして使用する必要があります。移行プロセスでは、Snowflake の `COPY INTO` コマンドと ClickHouse の `INSERT INTO SELECT` を使用します。

## 1. Snowflake からのデータのエクスポート {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="Snowflake から ClickHouse への移行"/>

Snowflake からデータをエクスポートするには、上記の図に示すように、外部ステージを使用する必要があります。

Snowflake の次のスキーマを持つテーブルをエクスポートしたいとしましょう：

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

このテーブルのデータを ClickHouse データベースに移動するには、まずこのデータを外部ステージにコピーする必要があります。データをコピーする際には、型情報を共有でき、精度を保ち、圧縮効率が良く、分析で一般的なネスト構造をネイティブにサポートするため、間接形式として Parquet を推奨します。

以下の例では、Parquet と希望のファイルオプションを表すファイル形式を Snowflake で作成します。次に、コピーするデータセットを含むバケットを指定します。最後に、データセットをバケットにコピーします。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- コピー先の S3 バケットを指定する外部ステージを作成
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- すべてのファイルに "mydataset" プレフィックスを適用し、最大ファイルサイズを 150MB に指定
-- `header=true` パラメータはカラム名を取得するために必要
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

約 5TB のデータセットで最大ファイルサイズが 150MB の場合、同じ AWS `us-east-1` リージョンにある 2X-Large Snowflake ウェアハウスを使用すると、データを S3 バケットにコピーするのに約 30 分かかります。

## 2. ClickHouse へのインポート {#2-importing-to-clickhouse}

データが中間オブジェクトストレージにおいて準備されたら、[s3 テーブル関数](/sql-reference/table-functions/s3) などの ClickHouse 関数を使用して、データをテーブルに挿入できます。

この例は AWS S3 用の[s3 テーブル関数](/sql-reference/table-functions/s3)を使用していますが、Google Cloud Storage 用には [gcs テーブル関数](/sql-reference/table-functions/gcs) を、Azure Blob Storage 用には [azureBlobStorage テーブル関数](/sql-reference/table-functions/azureBlobStorage) を使用できます。

次のようなターゲットスキーマのテーブルを仮定します：

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

その後、`INSERT INTO SELECT` コマンドを使用して、S3 から ClickHouse テーブルにデータを挿入できます：

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
SETTINGS input_format_null_as_default = 1, -- 値が null の場合、カラムはデフォルト値として挿入される
input_format_parquet_case_insensitive_column_matching = 1 -- ソースデータとターゲットテーブル間のカラムマッチングは大文字小文字を区別しない必要がある
```

:::note ネストされたカラム構造に関する注意
元の Snowflake テーブルスキーマの `VARIANT` および `OBJECT` カラムは、デフォルトで JSON 文字列として出力されるため、ClickHouse に挿入する際にこれらをキャストする必要があります。

`some_file` のようなネスト構造は、コピー時に Snowflake によって JSON 文字列に変換されます。このデータをインポートするには、ClickHouse への挿入時にこれらの構造をタプルに変換する必要があります。これは上記のように [JSONExtract 関数](/sql-reference/functions/json-functions#jsonextract) を使用して行います。
:::

## 3. データエクスポートの成功をテストする {#3-testing-successful-data-export}

データが正しく挿入されたかどうかをテストするには、新しいテーブルに対して単に `SELECT` クエリを実行します：

```sql
SELECT * FROM mydataset limit 10;
```

## さらに読む・サポート {#further-reading-and-support}

このガイドに加えて、[Snowflake と ClickHouse の比較](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide) に関するブログ記事も読むことをお勧めします。

Snowflake から ClickHouse へのデータ転送に問題がある場合は、support@clickhouse.com までお気軽にご連絡ください。
