---
sidebar_label: Snowflake
sidebar_position: 20
slug: /migrations/snowflake
description: Snowflake から ClickHouse への移行
keywords: [移行, 移動, データ, etl, elt, snowflake]
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';


# Snowflake から ClickHouse への移行

このガイドでは、Snowflake から ClickHouse へのデータ移行方法を示します。

Snowflake と ClickHouse の間でデータを移動するには、S3 などのオブジェクトストレージを中間ストレージとして利用する必要があります。移行プロセスは、Snowflake の `COPY INTO` コマンドと ClickHouse の `INSERT INTO SELECT` コマンドを使用します。

## 1. Snowflake からのデータのエクスポート {#1-exporting-data-from-snowflake}

<img src={migrate_snowflake_clickhouse} class="image" alt="Snowflake から ClickHouse への移行" style={{width: '600px', marginBottom: '20px', textAlign: 'left'}} />

Snowflake からデータをエクスポートするには、外部ステージを使用する必要があります。上記の図のように。

Snowflake テーブルの以下のスキーマをエクスポートしたいとしましょう。

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

このテーブルのデータを ClickHouse データベースに移動するには、まずこのデータを外部ステージにコピーする必要があります。データをコピーする際は、型情報が共有できるため、精度が保持され、圧縮にも適しており、分析によく使われるネスト構造をネイティブにサポートする Parquet を中間形式として推奨します。

以下の例では、Parquet を表現し、希望のファイルオプションを設定するために、Snowflake に名前の付いたファイル形式を作成します。次に、コピーしたデータセットを含むバケットを指定します。最後に、データセットをバケットにコピーします。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- コピー先の S3 バケットを指定する外部ステージを作成
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- すべてのファイルに "mydataset" プレフィックスを適用し、最大ファイルサイズを 150MB に設定
-- `header=true` パラメータはカラム名を取得するために必要です
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

約 5TB のデータセットを持つ場合、最大ファイルサイズを 150MB とし、同じ AWS `us-east-1` リージョンにある 2X-Large Snowflake ウェアハウスを使用すると、データを S3 バケットにコピーするのに約 30 分かかります。

## 2. ClickHouse へのインポート {#2-importing-to-clickhouse}

データが中間のオブジェクトストレージに配置されたら、ClickHouse の関数、例えば [s3 テーブル関数](/sql-reference/table-functions/s3) を使用して、データをテーブルに挿入できます。

この例では、AWS S3 用の [s3 テーブル関数](/sql-reference/table-functions/s3) を使用していますが、Google Cloud Storage 用の [gcs テーブル関数](/sql-reference/table-functions/gcs) や Azure Blob Storage 用の [azureBlobStorage テーブル関数](/sql-reference/table-functions/azureBlobStorage) も使用できます。

以下のようなテーブルのターゲットスキーマを仮定します。

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

次に、`INSERT INTO SELECT` コマンドを使用して、S3 から ClickHouse テーブルにデータを挿入できます。

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
SETTINGS input_format_null_as_default = 1, -- 値が null の場合、カラムはデフォルトとして挿入されます
input_format_parquet_case_insensitive_column_matching = 1 -- ソースデータとターゲットテーブル間のカラムマッチングはケースを区別しません
```

:::note ネストしたカラム構造に関する注意
元の Snowflake テーブルスキーマの `VARIANT` および `OBJECT` カラムは、デフォルトで JSON 文字列として出力されるため、ClickHouse に挿入する際にキャストする必要があります。

`some_file` のようなネスト構造は、Snowflake でコピー時に JSON 文字列に変換されます。このデータをインポートするには、ClickHouse で挿入時にこれらの構造を Tuple に変換する必要があります。上記のように [JSONExtract 関数](/sql-reference/functions/json-functions#jsonextract) を使用します。
:::

## 3. データエクスポートの成功を確認する {#3-testing-successful-data-export}

データが正しく挿入されたかどうかを確認するには、単純に新しいテーブルで `SELECT` クエリを実行します。

```sql
SELECT * FROM mydataset limit 10;
```

## さらなる読み物とサポート {#further-reading-and-support}

このガイドに加えて、Snowflake と ClickHouse を比較したブログ記事 [clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide) を読むことをお勧めします。

Snowflake から ClickHouse へのデータ移行に問題が発生した場合は、お気軽に support@clickhouse.com までお問い合わせください。
