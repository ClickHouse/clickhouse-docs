---
sidebar_label: 'データのロード'
title: 'BigQueryからClickHouseへのデータのロード'
slug: '/migrations/bigquery/loading-data'
description: 'BigQueryからClickHouseへのデータをロードする方法'
keywords:
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
---



```mdx
_このガイドは、ClickHouse CloudおよびセルフホステッドのClickHouse v23.5+に対応しています。_

このガイドでは、[BigQuery](https://cloud.google.com/bigquery)からClickHouseへのデータ移行方法を説明します。

まず、テーブルを[Googleのオブジェクトストレージ (GCS)](https://cloud.google.com/storage)にエクスポートし、その後、そのデータを[ClickHouse Cloud](https://clickhouse.com/cloud)にインポートします。これらの手順は、BigQueryからClickHouseにエクスポートしたい各テーブルについて繰り返す必要があります。

## ClickHouseへのデータエクスポートにはどのくらいの時間がかかりますか？ {#how-long-will-exporting-data-to-clickhouse-take}

BigQueryからClickHouseにデータをエクスポートするのは、データセットのサイズに依存します。比較のために、このガイドを使用して[4TBの公開Ethereumデータセット](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics)をBigQueryからClickHouseにエクスポートするのに約1時間かかります。

| テーブル                                                                                           | 行数           | エクスポートファイル数 | データサイズ | BigQueryエクスポート | スロット時間        | ClickHouseインポート |
| ------------------------------------------------------------------------------------------------- | -------------- | --------------------- | ------------ | ------------------- | ------------------ | --------------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)          | 16,569,489     | 73                    | 14.53GB      | 23秒                | 37分                | 15.4秒                |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414  | 5169                  | 957GB        | 1分38秒             | 1日8時間            | 18分5秒              |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)          | 6,325,819,306  | 17,985                | 2.896TB      | 5分46秒             | 5日19時間          | 34分55秒             |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)      | 57,225,837     | 350                   | 45.35GB      | 16秒                | 1時間51分          | 39.4秒               |
| 合計                                                                                               | 82.6億行       | 23,577                | 3.982TB      | 8分3秒              | > 6日5時間         | 53分45秒             |

## 1. テーブルデータをGCSにエクスポートする {#1-export-table-data-to-gcs}

このステップでは、[BigQuery SQLワークスペース](https://cloud.google.com/bigquery/docs/bigquery-web-ui)を利用して、SQLコマンドを実行します。以下に、BigQueryテーブル`mytable`をGCSバケットにエクスポートするために[`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements)ステートメントを使用します。

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- nをx億行に対応するように設定することを推奨します。例えば、50億行の場合、n = 5
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

上記のクエリでは、BigQueryテーブルを[Parquetデータ形式](https://parquet.apache.org/)にエクスポートします。また、`uri`パラメータには`*`文字が含まれています。これは、エクスポートが1GBのデータを超える場合に、出力が数値的に増加するサフィックスを持つ複数のファイルにシャーディングされるようにします。

このアプローチには多くの利点があります：

- Googleは、GCSに1日あたり最大50TBを無料でエクスポートすることを許可しています。ユーザーはGCSストレージのみに料金を支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大1GBのテーブルデータに制限します。これはClickHouseにとって有益で、インポートを並行化できます。
- Parquetは列指向形式であり、本質的に圧縮されているため、BigQueryがエクスポートし、ClickHouseがクエリを実行する際により早く処理できる優れたインターチェンジ形式です。

## 2. GCSからClickHouseにデータをインポートする {#2-importing-data-into-clickhouse-from-gcs}

エクスポートが完了したら、このデータをClickHouseのテーブルにインポートできます。[ClickHouse SQLコンソール](/integrations/sql-clients/sql-console)または[`clickhouse-client`](/interfaces/cli)を使用して、以下のコマンドを実行します。

まず、ClickHouseにテーブルを[作成する](/sql-reference/statements/create/table)必要があります：

```sql
-- BigQueryテーブルにSTRUCT型のカラムが含まれている場合、そのカラムをClickHouseのNested型のカラムにマッピングするためにこの設定を有効にする必要があります
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
        `timestamp` DateTime64(6),
        `some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);

テーブルを作成した後、クラスターに複数のClickHouseレプリカがある場合、エクスポートの速度を上げるために`parallel_distributed_insert_select`設定を有効にします。一つのClickHouseノードしかない場合は、このステップはスキップできます：

```sql
SET parallel_distributed_insert_select = 1;

最後に、[`INSERT INTO SELECT`コマンド](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用して、GCSからClickHouseテーブルにデータを挿入できます。このコマンドは、`SELECT`クエリの結果に基づいてテーブルにデータを挿入します。

挿入するためにデータを取得するには、[s3Cluster関数](/sql-reference/table-functions/s3Cluster)を使用して、GCSバケットからデータを取得します。GCSは[Amazon S3](https://aws.amazon.com/s3/)と相互運用可能です。もし一つのClickHouseノードしかない場合は、`s3Cluster`関数の代わりに[s3テーブル関数](/sql-reference/table-functions/s3)を使用できます。

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

上記のクエリで使用されている`ACCESS_ID`と`SECRET`は、GCSバケットに関連付けられた[HMACキー](https://cloud.google.com/storage/docs/authentication/hmackeys)です。

:::note NULLABLEカラムをエクスポートする際は`ifNull`を使用してください
上記のクエリでは、`some_text`カラムに`ifNull`関数を使用して、デフォルト値でClickHouseテーブルにデータを挿入しています。ClickHouseのカラムを[`Nullable`](/sql-reference/data-types/nullable)にすることも可能ですが、パフォーマンスに悪影響を与える可能性があるためお勧めしません。

代わりに`SET input_format_null_as_default=1`を使用すると、欠落しているまたはNULL値は、各カラムのデフォルト値で置き換えられます（デフォルト値が指定されている場合）。
:::

## 3. データエクスポートの成功をテストする {#3-testing-successful-data-export}

データが正しく挿入されたかどうかを確認するには、新しいテーブルで`SELECT`クエリを単に実行します：

```sql
SELECT * FROM mytable limit 10;

さらにBigQueryテーブルをエクスポートするには、上記の手順を繰り返してください。

## さらなる読書とサポート {#further-reading-and-support}

このガイドに加えて、[ClickHouseを使用してBigQueryを加速する方法とインクリメンタルインポートを処理する方法を示すブログ投稿](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)も読むことをお勧めします。

BigQueryからClickHouseへのデータ転送に問題がある場合は、support@clickhouse.comまでお気軽にお問い合わせください。
