---
sidebar_label: 'データの読み込み'
title: 'BigQuery から ClickHouse へのデータ読み込み'
slug: /migrations/bigquery/loading-data
description: 'BigQuery から ClickHouse へのデータの読み込み方法'
keywords: ['移行', 'マイグレーション', '移行中', 'データ', 'etl', 'elt', 'BigQuery']
doc_type: 'guide'
---

_このガイドは ClickHouse Cloud およびセルフホスト型 ClickHouse v23.5+ に対応しています。_

このガイドでは、[BigQuery](https://cloud.google.com/bigquery) から ClickHouse にデータを移行する方法を説明します。

まずテーブルを [Google のオブジェクトストレージ (GCS)](https://cloud.google.com/storage) にエクスポートし、その後そのデータを [ClickHouse Cloud](https://clickhouse.com/cloud) にインポートします。これらの手順は、BigQuery から ClickHouse に移行したい各テーブルごとに繰り返す必要があります。

## ClickHouse へのデータエクスポートにはどのくらい時間がかかりますか？ \{#how-long-will-exporting-data-to-clickhouse-take\}

BigQuery から ClickHouse へのデータエクスポートにかかる時間は、データセットのサイズによって異なります。参考として、このガイドを使用した場合、[4TB のパブリック Ethereum データセット](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics)を BigQuery から ClickHouse にエクスポートするのに、約 1 時間かかります。

| テーブル                                                                                             | 行数          | エクスポートされたファイル数 | データサイズ | BigQuery エクスポート | スロット時間       | ClickHouse インポート |
| ------------------------------------------------------------------------------------------------- | ------------- | -------------- | --------- | --------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73             | 14.53GB   | 23 secs         | 37 min          | 15.4 secs         |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB     | 1 min 38 sec    | 1 day 8hrs      | 18 mins 5 secs    |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985         | 2.896TB   | 5 min 46 sec    | 5 days 19 hr    | 34 mins 55 secs   |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350            | 45.35GB   | 16 sec          | 1 hr 51 min     | 39.4 secs         |
| 合計                                                                                             | 8.26 billion  | 23,577         | 3.982TB   | 8 min 3 sec     | \> 6 days 5 hrs | 53 mins 45 secs   |

<VerticalStepper headerLevel="h2">

## テーブルデータを GCS にエクスポートする \{#1-export-table-data-to-gcs\}

この手順では、[BigQuery SQL ワークスペース](https://cloud.google.com/bigquery/docs/bigquery-web-ui) を使用して SQL 文を実行します。ここでは、[`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) ステートメントを使用して、`mytable` という BigQuery テーブルを GCS のバケットにエクスポートします。

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- We recommend setting n to correspond to x billion rows. So 5 billion rows, n = 5
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

上記のクエリでは、BigQuery テーブルを [Parquet データ形式](https://parquet.apache.org/) にエクスポートしています。また、`uri` パラメータには `*` 文字を含めています。これにより、エクスポートするデータが 1GB を超える場合に、出力が複数ファイルに分割され、それぞれに数値の接尾辞が連番で付与されます。

この方法には、いくつかの利点があります。

* Google は、1 日あたり最大 50TB までを無料で GCS にエクスポートできるようにしています。ユーザーは GCS ストレージ分のみを支払うだけで済みます。
* エクスポートは自動的に複数のファイルを生成し、それぞれを最大 1GB のテーブルデータに制限します。これは、インポートを並列化できるため ClickHouse にとって有利です。
* 列指向フォーマットである Parquet は、標準で圧縮されており、BigQuery によるエクスポートおよび ClickHouse によるクエリが高速であるため、より優れたデータ交換形式です。

## GCS から ClickHouse へのデータインポート \{#2-importing-data-into-clickhouse-from-gcs\}

エクスポートが完了したら、このデータを ClickHouse のテーブルにインポートできます。以下のコマンドを実行するには、[ClickHouse SQL console](/integrations/sql-clients/sql-console) か [`clickhouse-client`](/interfaces/cli) を使用できます。

まず ClickHouse で[テーブルを作成](/sql-reference/statements/create/table)しておく必要があります。

```sql
-- If your BigQuery table contains a column of type STRUCT, you must enable this setting
-- to map that column to a ClickHouse column of type Nested
SET input_format_parquet_import_nested = 1;

CREATE TABLE default.mytable
(
        `timestamp` DateTime64(6),
        `some_text` String
)
ENGINE = MergeTree
ORDER BY (timestamp);
```

テーブルを作成したら、クラスタ内に複数の ClickHouse レプリカがある場合は、エクスポート処理を高速化するために `parallel_distributed_insert_select` 設定を有効にしてください。ClickHouse ノードが 1 つだけの場合は、この手順はスキップして構いません。

```sql
SET parallel_distributed_insert_select = 1;
```

最後に、[`INSERT INTO SELECT` コマンド](/sql-reference/statements/insert-into#inserting-the-results-of-select) を使用して、GCS から ClickHouse テーブルにデータを挿入します。このコマンドは、`SELECT` クエリの結果に基づいてテーブルにデータを挿入します。

`INSERT` するデータを取得するには、[s3Cluster 関数](/sql-reference/table-functions/s3Cluster) を使用して GCS バケットからデータを読み取ります。GCS は [Amazon S3](https://aws.amazon.com/s3/) と相互運用可能なため、これが利用できます。ClickHouse ノードが 1 台だけの場合は、`s3Cluster` 関数の代わりに [s3 テーブル関数](/sql-reference/table-functions/s3) を使用できます。

```sql
INSERT INTO mytable
SELECT
    timestamp,
    ifNull(some_text, '') AS some_text
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/mybucket/mytable/*.parquet.gz',
    '<ACCESS_ID>',
    '<SECRET>'
);
```

上記のクエリで使用されている `ACCESS_ID` と `SECRET` は、GCS バケットに関連付けられた [HMAC キー](https://cloud.google.com/storage/docs/authentication/hmackeys) です。

:::note NULL を取り得るカラムをエクスポートする場合は `ifNull` を使用する
上記のクエリでは、ClickHouse テーブルにデフォルト値付きでデータを挿入するために、`some_text` カラムに対して [`ifNull` 関数](/sql-reference/functions/functions-for-nulls#ifNull) を使用しています。ClickHouse 側のカラムを [`Nullable`](/sql-reference/data-types/nullable) にすることもできますが、パフォーマンスに悪影響を与える可能性があるため推奨されません。

別の方法として、`SET input_format_null_as_default=1` を設定すると、対応するカラムにデフォルト値が指定されている場合、欠損値や NULL 値はそれぞれのカラムのデフォルト値で置き換えられます。
:::

## データ エクスポートの成功を確認する \{#3-testing-successful-data-export\}

データが正しく挿入されたかを確認するには、新しいテーブルに対して `SELECT` クエリを実行してみてください。

```sql
SELECT * FROM mytable LIMIT 10;
```

追加の BigQuery テーブルをエクスポートするには、各テーブルごとに上記の手順を繰り返します。

</VerticalStepper>

## 参考資料とサポート \{#further-reading-and-support\}

このガイドに加えて、[ClickHouse を使って BigQuery を高速化する方法と、インクリメンタルインポートを処理する方法](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries) を解説したブログ記事もあわせてご覧いただくことをおすすめします。

BigQuery から ClickHouse へのデータ転送に問題が発生した場合は、support@clickhouse.com までお気軽にお問い合わせください。
