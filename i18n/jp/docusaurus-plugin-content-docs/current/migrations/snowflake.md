---
sidebar_label: Snowflake
sidebar_position: 20
slug: /migrations/snowflake
description: Snowflake から ClickHouse への移行
keywords: [migrate, migration, migrating, data, etl, elt, snowflake]
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';


# Snowflake から ClickHouse への移行

このガイドでは、Snowflake から ClickHouse にデータを移行する方法を示します。

Snowflake と ClickHouse の間でデータを移行するには、S3 などのオブジェクトストアを中間ストレージとして使用する必要があります。移行プロセスは、Snowflake の `COPY INTO` コマンドと ClickHouse の `INSERT INTO SELECT` に依存しています。

## 1. Snowflake からのデータのエクスポート {#1-exporting-data-from-snowflake}

<img src={migrate_snowflake_clickhouse} class="image" alt="Snowflake から ClickHouse への移行" style={{width: '600px', marginBottom: '20px', textAlign: 'left'}} />

Snowflake からデータをエクスポートするには、上記の図に示すように外部ステージを使用する必要があります。

例えば、次のスキーマを持つ Snowflake テーブルをエクスポートしたいとしましょう。

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

このテーブルのデータを ClickHouse データベースに移動するには、まずこのデータを外部ステージにコピーする必要があります。データをコピーする際には、型情報を共有し、精度を保持し、圧縮効率が良く、分析で一般的なネスト構造をネイティブにサポートしているため、Parquet を中間形式として推奨します。

以下の例では、Snowflake で Parquet を表現する名前付きファイルフォーマットを作成し、希望するファイルオプションを指定します。次に、コピーしたデータセットを含むバケットを指定します。最後に、データセットをバケットにコピーします。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- コピー先の S3 バケットを指定する外部ステージを作成または置き換え
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- すべてのファイルに "mydataset" プレフィックスを適用し、最大ファイルサイズを 150MB に指定
-- `header=true` パラメータはカラム名を取得するために必要
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

約 5TB のデータセットで最大ファイルサイズが 150MB の場合、同じ AWS `us-east-1` リージョンにある 2X-Large Snowflake ウェアハウスを使用すると、S3 バケットにデータをコピーするのに約 30 分かかります。

## 2. ClickHouse へのインポート {#2-importing-to-clickhouse}

データが中間オブジェクトストレージに格納されたら、次のように [s3 テーブル関数](/sql-reference/table-functions/s3) などの ClickHouse 関数を使用してデータをテーブルに挿入できます。

この例では、AWS S3 用の [s3 テーブル関数](/sql-reference/table-functions/s3) を使用していますが、Google Cloud Storage 用には [gcs テーブル関数](/sql-reference/table-functions/gcs) を、Azure Blob Storage 用には [azureBlobStorage テーブル関数](/sql-reference/table-functions/azureBlobStorage) を使用できます。

以下のテーブルのターゲットスキーマを仮定します。

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

次に、`INSERT INTO SELECT` コマンドを使用して、S3 から ClickHouse テーブルにデータを挿入します。

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
	) AS complex_data
FROM s3('https://mybucket.s3.amazonaws.com/mydataset/mydataset*.parquet')
SETTINGS input_format_null_as_default = 1, -- 値が null の場合、列はデフォルトとして挿入される
input_format_parquet_case_insensitive_column_matching = 1 -- ソースデータとターゲットテーブル間でのカラムマッチングは大文字と小文字を区別しない
```

:::note ネストされたカラム構造に関する注意
元の Snowflake テーブルスキーマの `VARIANT` および `OBJECT` カラムは、デフォルトで JSON 文字列として出力されるため、ClickHouse に挿入する際にキャストする必要があります。

`some_file` のようなネスト構造は、Snowflake によってコピー時に JSON 文字列に変換されます。このデータをインポートするためには、ClickHouse での挿入時にこれらの構造を Tuple に変換する必要があり、上記の [JSONExtract 関数](/sql-reference/functions/json-functions#jsonextractjson-indices_or_keys-return_type) を使用します。
:::

## 3. データエクスポートの成功確認 {#3-testing-successful-data-export}

データが正しく挿入されたかどうかを確認するには、新しいテーブルで単に `SELECT` クエリを実行します。

```sql
SELECT * FROM mydataset limit 10;
```

## さらに学ぶための資料とサポート {#further-reading-and-support}

このガイドに加えて、[Snowflake と ClickHouse の比較についてのブログ記事](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide)を読むことをお勧めします。

Snowflake から ClickHouse へのデータ転送に問題がある場合は、support@clickhouse.com までお気軽にご連絡ください。
