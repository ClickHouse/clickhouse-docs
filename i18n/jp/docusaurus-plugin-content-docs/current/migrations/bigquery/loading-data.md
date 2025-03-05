---
sidebar_label: データのロード
title: BigQuery から ClickHouse へのデータのロード
slug: /migrations/bigquery/loading-data
description: BigQuery から ClickHouse へのデータのロード方法
keywords: [migrate, migration, migrating, data, etl, elt, BigQuery]
---

_このガイドは ClickHouse Cloud とセルフマネージド ClickHouse v23.5+ に対応しています。_

このガイドでは、[BigQuery](https://cloud.google.com/bigquery) から ClickHouse へのデータ移行方法を説明します。

まず、テーブルを [Google のオブジェクトストレージ (GCS)](https://cloud.google.com/storage) にエクスポートし、そのデータを [ClickHouse Cloud](https://clickhouse.com/cloud) にインポートします。これらの手順は、BigQuery から ClickHouse にエクスポートしたい各テーブルごとに繰り返す必要があります。

## ClickHouse へのデータエクスポートにかかる時間はどれくらいですか？ {#how-long-will-exporting-data-to-clickhouse-take}

BigQuery から ClickHouse へのデータエクスポートは、データセットのサイズに依存します。比較として、今回のガイドを使用して [4TB の公開 Ethereum データセット](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) を BigQuery から ClickHouse にエクスポートするのに約1時間かかります。

| テーブル                                                                                         | 行数          | エクスポートされたファイル | データサイズ  | BigQuery エクスポート | スロット時間       | ClickHouse インポート |
| ------------------------------------------------------------------------------------------------- | ------------- | -------------- | --------- | --------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73             | 14.53GB   | 23秒           | 37分           | 15.4秒           |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB     | 1分38秒        | 1日 8時間      | 18分5秒          |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985         | 2.896TB   | 5分46秒        | 5日 19時間     | 34分55秒        |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350            | 45.35GB   | 16秒           | 1時間51分      | 39.4秒           |
| 合計                                                                                             | 82.6 億      | 23,577         | 3.982TB   | 8分3秒         | > 6日 5時間   | 53分45秒         |

## 1. テーブルデータを GCS にエクスポートする {#1-export-table-data-to-gcs}

このステップでは、[BigQuery SQL ワークスペース](https://cloud.google.com/bigquery/docs/bigquery-web-ui) を利用して SQL コマンドを実行します。以下に、BigQuery テーブル `mytable` を GCS バケットにエクスポートする方法を示します。[`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) ステートメントを使用します。

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- n を x 億行に対応させることをお勧めします。つまり、50 億行の場合、n = 5
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

上記のクエリでは、BigQuery テーブルを [Parquet データフォーマット](https://parquet.apache.org/) にエクスポートします。また、`uri` パラメータに `*` 文字が含まれています。これにより、エクスポートが 1GB を超えた場合に出力が複数のファイルにシャードされ、数値が増加するサフィックスが付きます。

このアプローチにはいくつかの利点があります。

- Google では、GCS に対して最大 50TB を毎日無料でエクスポートすることができます。ユーザーは GCS ストレージのみに支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大 1GB のテーブルデータに制限します。これは ClickHouse にとって有益で、インポートを並列化することを可能にします。
- Parquet は列指向フォーマットであり、本質的に圧縮されているため、BigQuery のエクスポートおよび ClickHouse のクエリ用のより良い相互運用フォーマットを提供します。

## 2. GCS から ClickHouse にデータをインポートする {#2-importing-data-into-clickhouse-from-gcs}

エクスポートが完了すると、このデータを ClickHouse テーブルにインポートできます。[ClickHouse SQL コンソール](/integrations/sql-clients/sql-console) または [`clickhouse-client`](/interfaces/cli) を使用して以下のコマンドを実行できます。

まず、ClickHouse にテーブルを [作成する](/sql-reference/statements/create/table) 必要があります。

```sql
-- BigQuery テーブルに STRUCT 型のカラムが含まれている場合は、この設定を有効にして
-- そのカラムを ClickHouse の Nested 型のカラムにマッピングする必要があります
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
	`timestamp` DateTime64(6),
	`some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

テーブルを作成した後、クラスター内に複数の ClickHouse レプリカがある場合は、エクスポートを高速化するために設定 `parallel_distributed_insert_select` を有効にします。ClickHouse ノードが1つだけの場合は、このステップをスキップできます。

```sql
SET parallel_distributed_insert_select = 1;
```

最後に、[`INSERT INTO SELECT` コマンド](/sql-reference/statements/insert-into#inserting-the-results-of-select) を使用して、GCS から ClickHouse テーブルにデータを挿入できます。このコマンドは、`SELECT` クエリの結果に基づいてテーブルにデータを挿入します。

挿入するデータを取得するために、GCS バケットからデータを取得するために [s3Cluster 関数](/sql-reference/table-functions/s3Cluster) を使用できます。これは、GCS が [Amazon S3](https://aws.amazon.com/s3/) と相互運用可能であるためです。ClickHouse ノードが1つだけの場合は、`s3Cluster` 関数の代わりに [s3 テーブル関数](/sql-reference/table-functions/s3) を使用できます。

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

上記のクエリで使用される `ACCESS_ID` と `SECRET` は、GCS バケットに関連付けられた [HMAC キー](https://cloud.google.com/storage/docs/authentication/hmackeys) です。

:::note Nullable カラムをエクスポートする際は `ifNull` を使用
上記のクエリでは、`some_text` カラムに対して [`ifNull` 関数](/sql-reference/functions/functions-for-nulls#ifnull) を使用して、デフォルト値で ClickHouse テーブルにデータを挿入しています。また、ClickHouse でカラムを [`Nullable`](/sql-reference/data-types/nullable) にすることもできますが、パフォーマンスに悪影響を与える可能性があるためお勧めできません。

また、`SET input_format_null_as_default=1` を実行すると、指定されたデフォルト値がある場合、欠落しているまたは NULL の値がそれぞれのカラムのデフォルト値に置き換えられます。
:::

## 3. データエクスポートの成功をテストする {#3-testing-successful-data-export}

データが正しく挿入されたかをテストするには、新しいテーブルで単純に `SELECT` クエリを実行します。

```sql
SELECT * FROM mytable limit 10;
```

さらに BigQuery テーブルをエクスポートするには、上記の手順を各追加のテーブルに対して再実行してください。

## さらなる情報とサポート {#further-reading-and-support}

このガイドに加えて、[ClickHouse を使用して BigQuery の速度を向上させ、増分インポートを処理する方法](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)を示すブログ投稿を読むこともお勧めします。

BigQuery から ClickHouse にデータを転送する際に問題がある場合は、support@clickhouse.com までお気軽にお問い合わせください。
