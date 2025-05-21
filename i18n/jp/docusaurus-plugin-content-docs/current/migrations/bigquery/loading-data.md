---
sidebar_label: 'データの読み込み'
title: 'BigQueryからClickHouseへのデータの読み込み'
slug: /migrations/bigquery/loading-data
description: 'BigQueryからClickHouseにデータを読み込む方法'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
---

_このガイドはClickHouse CloudおよびセルフマネージドのClickHouse v23.5 +に対応しています。_

このガイドでは、[BigQuery](https://cloud.google.com/bigquery)からClickHouseへのデータの移行方法を示します。

まず、テーブルを[Googleのオブジェクトストア(GCS)](https://cloud.google.com/storage)にエクスポートし、そのデータを[ClickHouse Cloud](https://clickhouse.com/cloud)にインポートします。これらの手順は、BigQueryからClickHouseにエクスポートしたい各テーブルについて繰り返す必要があります。

## ClickHouseへのデータエクスポートにかかる時間はどれくらいですか？ {#how-long-will-exporting-data-to-clickhouse-take}

BigQueryからClickHouseへのデータエクスポートは、データセットのサイズに依存します。比較のために、ガイドに従って[4TBの公開Ethereumデータセット](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics)をBigQueryからClickHouseにエクスポートするのに約1時間かかります。

| テーブル                                                                                                       | 行数           | エクスポートされたファイル数 | データサイズ | BigQueryエクスポート | スロット時間        | ClickHouseインポート |
| ----------------------------------------------------------------------------------------------------------- | -------------- | ------------------------- | --------- | -------------- | --------------- | ------------------ |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)                       | 16,569,489     | 73                        | 14.53GB   | 23秒          | 37分           | 15.4秒            |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md)           | 1,864,514,414  | 5169                      | 957GB     | 1分38秒       | 1日8時間       | 18分5秒           |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)                       | 6,325,819,306  | 17,985                   | 2.896TB   | 5分46秒       | 5日19時間      | 34分55秒          |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)                 | 57,225,837     | 350                       | 45.35GB   | 16秒          | 1時間51分      | 39.4秒            |
| 合計                                                                                                       | 82.6億         | 23,577                   | 3.982TB   | 8分3秒       | > 6日5時間     | 53分45秒          |

## 1. テーブルデータをGCSにエクスポートする {#1-export-table-data-to-gcs}

このステップでは、[BigQuery SQLワークスペース](https://cloud.google.com/bigquery/docs/bigquery-web-ui)を利用してSQLコマンドを実行します。以下では、`mytable`という名前のBigQueryテーブルをGCSバケットにエクスポートしています。このために[`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements)ステートメントを使用します。

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- nをx億行に対応させることを推奨します。つまり、50億行の場合、n = 5
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

上記のクエリでは、BigQueryテーブルを[Parquetデータ形式](https://parquet.apache.org/)にエクスポートしています。また、`uri`パラメータに`*`文字を含めています。これにより、エクスポートデータが1GBを超える場合に、複数のファイルにシャーディングされ、数値が増加するサフィックスが付加されます。

このアプローチにはいくつかの利点があります：

- GoogleはGCSに対して、1日あたり最大50TBを無料でエクスポートできます。ユーザーはGCSストレージのみに支払いを行います。
- エクスポートは自動的に複数のファイルを生成し、それぞれを最大1GBのテーブルデータに制限します。これは、ClickHouseにとって有益であり、インポートを並列化できるようになります。
- Parquetは列指向の形式であり、本質的に圧縮されていて、BigQueryがエクスポートし、ClickHouseがクエリを実行するのに速いため、より良いインターチェンジ形式を表します。

## 2. GCSからClickHouseにデータをインポートする {#2-importing-data-into-clickhouse-from-gcs}

エクスポートが完了したら、このデータをClickHouseテーブルにインポートできます。以下のコマンドを実行するには、[ClickHouse SQLコンソール](/integrations/sql-clients/sql-console)または[`clickhouse-client`](/interfaces/cli)を使用することができます。

まず、ClickHouseに[テーブルを作成する](/sql-reference/statements/create/table)必要があります：

```sql
-- BigQueryテーブルにSTRUCT型のカラムが含まれている場合、この設定を有効にして
-- そのカラムをClickHouseのNested型カラムにマッピングする必要があります
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
        `timestamp` DateTime64(6),
        `some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

テーブルを作成した後、クラスター内に複数のClickHouseレプリカがある場合は、エクスポートを加速するために設定`parallel_distributed_insert_select`を有効にしてください。ClickHouseノードが1つしかない場合は、このステップをスキップできます：

```sql
SET parallel_distributed_insert_select = 1;
```

最終的に、[`INSERT INTO SELECT`コマンド](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用して、GCSからClickHouseテーブルにデータを挿入できます。このコマンドは、`SELECT`クエリの結果に基づいてテーブルにデータを挿入します。

`INSERT`するデータを取得するために、[s3Cluster関数](/sql-reference/table-functions/s3Cluster)を使用して、GCSバケットからデータを取得できます。GCSは[Amazon S3](https://aws.amazon.com/s3/)との相互運用性があります。ClickHouseノードが1つしかない場合は、`s3Cluster`関数の代わりに[s3テーブル関数](/sql-reference/table-functions/s3)を使用できます。

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

:::note Nullableカラムをエクスポートする際は`ifNull`を使用
上記のクエリでは、`some_text`カラムにデフォルト値を持つデータをClickHouseテーブルに挿入するため、[`ifNull`関数](/sql-reference/functions/functions-for-nulls#ifnull)を使用しています。ClickHouseのカラムを[`Nullable`](/sql-reference/data-types/nullable)にすることもできますが、パフォーマンスに悪影響を与える可能性があるため推奨されません。

代わりに、`SET input_format_null_as_default=1`を使用すると、欠落しているまたはNULLの値は、指定されたデフォルト値に置き換えられます。
:::

## 3. データエクスポートの成功をテストする {#3-testing-successful-data-export}

データが正しく挿入されたかをテストするには、新しいテーブルで単に`SELECT`クエリを実行してください：

```sql
SELECT * FROM mytable limit 10;
```

他のBigQueryテーブルをエクスポートするには、追加のテーブルごとに上記の手順を繰り返してください。

## さらなる情報とサポート {#further-reading-and-support}

このガイドに加えて、[ClickHouseを使用してBigQueryのパフォーマンスを向上させる方法とインクリメンタルインポートの処理方法を示すブログ記事](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)も読むことをお勧めします。

BigQueryからClickHouseへのデータ転送に問題がある場合は、support@clickhouse.comまでお気軽にご連絡ください。
