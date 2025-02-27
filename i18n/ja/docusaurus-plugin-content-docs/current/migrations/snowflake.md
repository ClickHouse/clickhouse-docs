---
sidebar_label: Snowflake
sidebar_position: 20
slug: /migrations/snowflake
description: SnowflakeからClickHouseへの移行
keywords: [移行, マイグレーション, データ, ETL, ELT, Snowflake]
---

# SnowflakeからClickHouseへの移行

このガイドでは、SnowflakeからClickHouseへのデータ移行方法を示します。

SnowflakeとClickHouse間でデータを移行するには、S3などのオブジェクトストレージを中間ストレージとして使用する必要があります。移行プロセスでは、Snowflakeの`COPY INTO`コマンドとClickHouseの`INSERT INTO SELECT`コマンドを使用します。

## 1. Snowflakeからのデータエクスポート {#1-exporting-data-from-snowflake}

<img src={require('./images/migrate_snowflake_clickhouse.png').default} class="image" alt="SnowflakeからClickHouseへの移行" style={{width: '600px', marginBottom: '20px', textAlign: 'left'}}/>

Snowflakeからデータをエクスポートするには、上記の図に示す外部ステージを使用する必要があります。

以下のスキーマを持つSnowflakeのテーブルをエクスポートするとしましょう：

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

このテーブルのデータをClickHouseデータベースに移動するためには、まずこのデータを外部ステージにコピーする必要があります。データをコピーする際は、型情報を共有し、精度を保持し、圧縮効率が良く、分析に一般的なネスト構造をネイティブにサポートするため、Parquetを中間フォーマットとして推奨します。

以下の例では、Parquetを表す名前付きファイルフォーマットをSnowflakeで作成し、希望するファイルオプションを指定します。次に、コピーしたデータセットを含むバケットを指定します。最後に、データセットをバケットにコピーします。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- コピー先のS3バケットを指定した外部ステージを作成
CREATE OR REPLACE STAGE external_stage 
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- すべてのファイルに「mydataset」プレフィックスを適用し、最大ファイルサイズを150MBに指定
-- `header=true` パラメータはカラム名を取得するために必要です
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

最大ファイルサイズ150MBのデータで約5TBのデータセットを使用し、同じAWS `us-east-1`リージョンにある2X-LargeのSnowflakeウェアハウスを利用する場合、S3バケットへのデータコピーには約30分かかります。

## 2. ClickHouseへのインポート {#2-importing-to-clickhouse}

データが中間オブジェクトストレージにステージングされたら、[s3テーブル関数](/sql-reference/table-functions/s3)などのClickHouseの関数を使用して、データをテーブルに挿入できます。以下に示す例では、AWS S3の[s3テーブル関数](/sql-reference/table-functions/s3)を使用していますが、Google Cloud Storage用の[gcsテーブル関数](/sql-reference/table-functions/gcs)や、Azure Blob Storage用の[azureBlobStorageテーブル関数](/sql-reference/table-functions/azureBlobStorage)も使用できます。

以下のテーブルのターゲットスキーマがあると仮定します：

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

次に、`INSERT INTO SELECT`コマンドを使用してS3からClickHouseのテーブルにデータを挿入します：

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
SETTINGS input_format_null_as_default = 1, -- 値がnullの場合はカラムがデフォルトとして挿入されることを確実にする
input_format_parquet_case_insensitive_column_matching = 1 -- ソースデータとターゲットテーブル間のカラムマッチングは大文字小文字を区別しない
```

:::note ネストされたカラム構造に関する注意
元のSnowflakeテーブルスキーマの`VARIANT`および`OBJECT`カラムはデフォルトでJSON文字列として出力され、ClickHouseに挿入する際にこれらをキャストする必要があります。

`some_file`のようなネスト構造は、Snowflakeによってコピー時にJSON文字列に変換されます。このデータをインポートするには、上記のように[JSONExtract関数](/sql-reference/functions/json-functions#jsonextractjson-indices_or_keys-return_type)を使用して、挿入時にこれらの構造をタプルに変換する必要があります。
:::

## 3. データエクスポートの成功をテスト {#3-testing-successful-data-export}

データが正しく挿入されたかどうかをテストするには、新しいテーブルで単に`SELECT`クエリを実行します：

```sql
SELECT * FROM mydataset limit 10;
```

## さらなる読むこととサポート {#further-reading-and-support}

このガイドに加えて、SnowflakeとClickHouseを比較した私たちのブログ記事[SnowflakeとClickHouseの比較](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide)を読むことをお勧めします。

もしSnowflakeからClickHouseへのデータ転送に問題がある場合は、お気軽にsupport@clickhouse.comまでご連絡ください。
