---
sidebar_label: データの読み込み
title: BigQueryからClickHouseへのデータの読み込み
slug: /migrations/bigquery/loading-data
description: BigQueryからClickHouseへのデータの読み込み方法
keywords: [移行, マイグレーション, データ, ETL, ELT, BigQuery]
---

_このガイドは、ClickHouse Cloudおよびセルフホスト型ClickHouse v23.5+に対応しています。_

このガイドでは、[BigQuery](https://cloud.google.com/bigquery)からClickHouseにデータを移行する方法を示します。

まず、テーブルを[Googleのオブジェクトストレージ (GCS)](https://cloud.google.com/storage)にエクスポートし、そのデータを[ClickHouse Cloud](https://clickhouse.com/cloud)にインポートします。これらの手順は、BigQueryからClickHouseにエクスポートしたい各テーブルについて繰り返す必要があります。

## ClickHouseへのデータエクスポートにかかる時間はどれくらいですか？ {#how-long-will-exporting-data-to-clickhouse-take}

BigQueryからClickHouseへのデータエクスポートは、データセットのサイズに依存します。比較として、以下のガイドを使用して、[4TBの公開Ethereumデータセット](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics)をBigQueryからClickHouseにエクスポートするのに約1時間かかります。

| テーブル                                                                                             | 行数          | エクスポートしたファイル数 | データサイズ | BigQueryエクスポート | スロット時間       | ClickHouseインポート |
| ------------------------------------------------------------------------------------------------- | ------------- | -------------- | --------- | --------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73             | 14.53GB   | 23秒           | 37分            | 15.4秒           |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB     | 1分38秒        | 1日8時間        | 18分5秒          |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985         | 2.896TB   | 5分46秒        | 5日19時間      | 34分55秒         |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350            | 45.35GB   | 16秒           | 1時間51分      | 39.4秒           |
| 合計                                                                                              | 82.6億行     | 23,577         | 3.982TB   | 8分3秒         | > 6日5時間     | 53分45秒         |

## 1. テーブルデータをGCSにエクスポート {#1-export-table-data-to-gcs}

このステップでは、[BigQuery SQLワークスペース](https://cloud.google.com/bigquery/docs/bigquery-web-ui)を使用してSQLコマンドを実行します。以下に、`mytable`というBigQueryのテーブルをGCSバケットにエクスポートするための[`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements)文を示します。

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- nはx億行に対応するように設定することを推奨します。例：50億行の場合、n=5
SET n = 100;

WHILE i < n DO
  SET export_path = CONCAT('gs://mybucket/mytable/', i,'-*.parquet');
  EXPORT DATA
    OPTIONS (
      uri = export_path,
      format = 'PARQUET',
      overwrite = true
    )
  AS (
    SELECT * FROM mytable WHERE export_id = i
  );
  SET i = i + 1;
END WHILE;
```

上記のクエリでは、BigQueryのテーブルを[Parquetデータ形式](https://parquet.apache.org/)にエクスポートしています。また、`uri`パラメータに`*`文字を含めることで、エクスポートが1GBを超えた場合でも複数のファイルにシャード化され、数値が増加するサフィックスが付与されます。

このアプローチにはいくつかの利点があります：

- Googleは、1日に最大50TBを無料でGCSにエクスポートすることを許可しています。ユーザーはGCSストレージの料金のみを支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大1GBのテーブルデータに制限します。これは、ClickHouseにとってはインポートを並列化できるため有益です。
- Parquetは列指向形式であり、本質的に圧縮されているため、BigQueryからのエクスポートやClickHouseからのクエリに対して高速です。

## 2. GCSからClickHouseへのデータのインポート {#2-importing-data-into-clickhouse-from-gcs}

エクスポートが完了したら、このデータをClickHouseのテーブルにインポートできます。以下のコマンドを実行するために[ClickHouse SQLコンソール](/integrations/sql-clients/sql-console)または[`clickhouse-client`](/interfaces/cli)を使用できます。

まず、ClickHouseで[テーブルを作成](/sql-reference/statements/create/table)する必要があります：

```sql
-- BigQueryテーブルにSTRUCT型のカラムが含まれている場合、この設定を有効にして
-- そのカラムをClickHouseのNested型カラムにマップする必要があります
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
	`timestamp` DateTime64(6),
	`some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

テーブルを作成した後、クラスター内に複数のClickHouseレプリカがある場合は、エクスポートを高速化するために`parallel_distributed_insert_select`設定を有効にします。ClickHouseノードが1つだけの場合は、このステップをスキップできます：

```sql
SET parallel_distributed_insert_select = 1;
```

最後に、[`INSERT INTO SELECT`コマンド](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用して、GCSからClickHouseのテーブルにデータを挿入します。このコマンドは、`SELECT`クエリの結果に基づいてテーブルにデータを挿入します。

挿入するデータを取得するために、GCSが[Amazon S3](https://aws.amazon.com/s3/)と互換性があるため、[s3Cluster関数](/sql-reference/table-functions/s3Cluster)を使用してGCSバケットからデータを取得できます。ClickHouseノードが1つだけのため、`s3Cluster`関数の代わりに[s3テーブル関数](/sql-reference/table-functions/s3)を使用できます。

```sql
INSERT INTO mytable
SELECT
    timestamp,
    ifNull(some_text, '') as some_text
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/mybucket/mytable/*.parquet.gz',
    '<ACCESS_ID>',
    '<SECRET>'
);
```

上記のクエリで使用される`ACCESS_ID`と`SECRET`は、GCSバケットに関連付けられた[HMACキー](https://cloud.google.com/storage/docs/authentication/hmackeys)です。

:::note Nullableカラムをエクスポートする際には`ifNull`を使用
上記のクエリでは、`some_text`カラムのデータをClickHouseテーブルにデフォルト値で挿入するために[`ifNull`関数](/sql-reference/functions/functions-for-nulls#ifnull)を使用しています。ClickHouseのカラムを[`Nullable`](/sql-reference/data-types/nullable)にすることもできますが、これはパフォーマンスに悪影響を与える可能性があるため推奨されません。

代わりに、`SET input_format_null_as_default=1`を使用すると、欠落しているまたはNULLの値は、指定されているデフォルト値で各カラムのデフォルト値に置き換えられます。
:::

## 3. データエクスポートの成功をテストする {#3-testing-successful-data-export}

データが正しく挿入されたかどうかをテストするには、新しいテーブルで`SELECT`クエリを実行するだけです：

```sql
SELECT * FROM mytable limit 10;
```

さらにBigQueryテーブルをエクスポートするには、追加のテーブルごとに上記の手順を繰り返すだけです。

## さらなる読み物とサポート {#further-reading-and-support}

このガイドに加えて、[ClickHouseを使用してBigQueryを高速化する方法とインクリメンタルインポートの処理方法](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)を示すブログ投稿を読むことも推奨します。

BigQueryからClickHouseへのデータ転送に問題がある場合は、support@clickhouse.comまでお気軽にお問い合わせください。
