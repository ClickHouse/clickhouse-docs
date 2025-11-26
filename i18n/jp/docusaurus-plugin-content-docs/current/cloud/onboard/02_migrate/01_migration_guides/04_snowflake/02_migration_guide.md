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

> 本ガイドでは、SnowflakeからClickHouseへデータを移行する方法について説明します。

SnowflakeとClickHouse間でデータを移行するには、転送用の中間ストレージとしてS3などのオブジェクトストアを使用する必要があります。移行プロセスでは、Snowflakeの`COPY INTO`コマンドとClickHouseの`INSERT INTO SELECT`コマンドを使用します。

<VerticalStepper headerLevel="h2">


## Snowflake からデータをエクスポートする

<Image img={migrate_snowflake_clickhouse} size="md" alt="Snowflake から ClickHouse への移行" />

上の図に示されているように、Snowflake からデータをエクスポートするには外部ステージを利用する必要があります。

次のスキーマを持つ Snowflake テーブルをエクスポートするとします。

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

このテーブルのデータを ClickHouse データベースに移行するには、まずこのデータを外部ステージにコピーする必要があります。データをコピーする際の中間フォーマットとしては、Parquet の利用を推奨します。Parquet であれば、型情報を共有でき、精度を保持できるうえ、圧縮効率も高く、分析で一般的なネスト構造もネイティブにサポートしているためです。

以下の例では、Parquet と必要なファイルオプションを表現するために、Snowflake 上で名前付きファイルフォーマットを作成します。次に、コピーされたデータセットを格納するバケットを指定します。最後に、そのデータセットをバケットにコピーします。

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- コピー先のS3バケットを指定する外部ステージを作成する
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- すべてのファイルに "mydataset" プレフィックスを適用し、最大ファイルサイズを150MBに指定する
-- カラム名を取得するには `header=true` パラメータが必須
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

約 5TB のデータセットで最大ファイルサイズが 150MB、かつ同じ AWS `us-east-1` リージョン内にある 2X-Large Snowflake ウェアハウスを使用する場合、S3 バケットへのデータのコピーには約 30 分かかります。


## ClickHouse へのインポート

データが中間オブジェクトストレージにステージングされたら、以下のように [s3 テーブル関数](/sql-reference/table-functions/s3) などの ClickHouse の関数を使用して、テーブルにデータを挿入できます。

この例では AWS S3 向けの [s3 テーブル関数](/sql-reference/table-functions/s3) を使用していますが、Google Cloud Storage には [gcs テーブル関数](/sql-reference/table-functions/gcs)、Azure Blob Storage には [azureBlobStorage テーブル関数](/sql-reference/table-functions/azureBlobStorage) を使用できます。

対象となるテーブルのスキーマを次のように想定します：

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

次に、`INSERT INTO SELECT` コマンドを使用して、S3 上のデータを ClickHouse のテーブルに挿入します。

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
SETTINGS input_format_null_as_default = 1, -- 値がnullの場合、カラムにデフォルト値を挿入
input_format_parquet_case_insensitive_column_matching = 1 -- ソースデータとターゲットテーブル間のカラムマッチングで大文字小文字を区別しない
```

:::note ネストした列構造に関する注意
元の Snowflake テーブルスキーマ内の `VARIANT` 列と `OBJECT` 列は、デフォルトでは JSON 文字列として出力されます。そのため、ClickHouse に挿入する際には、これらをキャストする必要があります。

`some_file` のようなネストした構造は、Snowflake によるコピー処理の際に JSON 文字列へと変換されます。このデータをインポートするには、上記の [JSONExtract 関数](/sql-reference/functions/json-functions#JSONExtract) を使用して、ClickHouse への挿入時にこれらの構造を Tuple 型に変換する必要があります。
:::


## データエクスポートの成功を検証する {#3-testing-successful-data-export}

データが正しく挿入されたかどうかを検証するには、新しいテーブルに対して`SELECT`クエリを実行します。

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
