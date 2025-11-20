---
sidebar_label: 'データのロード'
title: 'BigQuery から ClickHouse へのデータのロード'
slug: /migrations/bigquery/loading-data
description: 'BigQuery から ClickHouse へデータをロードする方法'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
doc_type: 'guide'
---

_このガイドは ClickHouse Cloud および自己ホスト型 ClickHouse v23.5 以降に対応しています。_

このガイドでは、[BigQuery](https://cloud.google.com/bigquery) から ClickHouse へデータを移行する方法を説明します。

まずテーブルを [Google のオブジェクトストレージ (GCS)](https://cloud.google.com/storage) にエクスポートし、その後そのデータを [ClickHouse Cloud](https://clickhouse.com/cloud) にインポートします。これらの手順は、BigQuery から ClickHouse にエクスポートしたい各テーブルごとに繰り返す必要があります。



## ClickHouseへのデータエクスポートにはどのくらい時間がかかりますか？ {#how-long-will-exporting-data-to-clickhouse-take}

BigQueryからClickHouseへのデータエクスポートにかかる時間は、データセットのサイズによって異なります。参考として、このガイドを使用して[4TBの公開Ethereumデータセット](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics)をBigQueryからClickHouseにエクスポートする場合、約1時間かかります。

| テーブル                                                                                             | 行数          | エクスポートファイル数 | データサイズ | BigQueryエクスポート | スロット時間       | ClickHouseインポート |
| ------------------------------------------------------------------------------------------------- | ------------- | -------------- | --------- | --------------- | --------------- | ----------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)             | 16,569,489    | 73             | 14.53GB   | 23秒         | 37分          | 15.4秒         |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md) | 1,864,514,414 | 5169           | 957GB     | 1分38秒    | 1日8時間      | 18分5秒    |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)             | 6,325,819,306 | 17,985         | 2.896TB   | 5分46秒    | 5日19時間    | 34分55秒   |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)       | 57,225,837    | 350            | 45.35GB   | 16秒          | 1時間51分     | 39.4秒         |
| 合計                                                                                             | 82.6億  | 23,577         | 3.982TB   | 8分3秒     | \> 6日5時間 | 53分45秒   |

<VerticalStepper headerLevel="h2">


## テーブルデータをGCSにエクスポートする {#1-export-table-data-to-gcs}

このステップでは、[BigQuery SQLワークスペース](https://cloud.google.com/bigquery/docs/bigquery-web-ui)を利用してSQLコマンドを実行します。以下では、[`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements)ステートメントを使用して、`mytable`という名前のBigQueryテーブルをGCSバケットにエクスポートします。

```sql
DECLARE export_path STRING;
DECLARE n INT64;
DECLARE i INT64;
SET i = 0;

-- nをx億行に対応するように設定することを推奨します。例えば50億行の場合、n = 5
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

上記のクエリでは、BigQueryテーブルを[Parquetデータ形式](https://parquet.apache.org/)にエクスポートします。また、`uri`パラメータに`*`文字を含めています。これにより、エクスポートが1GBのデータを超える場合、出力が数値で増加するサフィックスを持つ複数のファイルに分割されます。

このアプローチには以下の利点があります:

- Googleは1日あたり最大50TBまでGCSへの無料エクスポートを許可しています。ユーザーはGCSストレージの料金のみを支払います。
- エクスポートは自動的に複数のファイルを生成し、各ファイルを最大1GBのテーブルデータに制限します。これによりインポートを並列化できるため、ClickHouseにとって有益です。
- Parquetは列指向形式として、本質的に圧縮されており、BigQueryのエクスポートとClickHouseのクエリが高速であるため、より優れたデータ交換形式となります


## GCSからClickHouseへのデータインポート {#2-importing-data-into-clickhouse-from-gcs}

エクスポートが完了したら、このデータをClickHouseテーブルにインポートできます。以下のコマンドを実行するには、[ClickHouse SQLコンソール](/integrations/sql-clients/sql-console)または[`clickhouse-client`](/interfaces/cli)を使用してください。

まず、ClickHouseで[テーブルを作成](/sql-reference/statements/create/table)する必要があります：

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

テーブル作成後、クラスタに複数のClickHouseレプリカがある場合は、インポートを高速化するために`parallel_distributed_insert_select`設定を有効にします。ClickHouseノードが1つしかない場合は、この手順をスキップできます：

```sql
SET parallel_distributed_insert_select = 1;
```

最後に、[`INSERT INTO SELECT`コマンド](/sql-reference/statements/insert-into#inserting-the-results-of-select)を使用して、GCSからClickHouseテーブルにデータを挿入できます。このコマンドは、`SELECT`クエリの結果に基づいてテーブルにデータを挿入します。

`INSERT`するデータを取得するには、[s3Cluster関数](/sql-reference/table-functions/s3Cluster)を使用してGCSバケットからデータを取得できます。これは、GCSが[Amazon S3](https://aws.amazon.com/s3/)と相互運用可能であるためです。ClickHouseノードが1つしかない場合は、`s3Cluster`関数の代わりに[s3テーブル関数](/sql-reference/table-functions/s3)を使用できます。

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

上記のクエリで使用される`ACCESS_ID`と`SECRET`は、GCSバケットに関連付けられた[HMACキー](https://cloud.google.com/storage/docs/authentication/hmackeys)です。

:::note null許容カラムをエクスポートする際は`ifNull`を使用してください
上記のクエリでは、[`ifNull`関数](/sql-reference/functions/functions-for-nulls#ifNull)を`some_text`カラムに使用して、デフォルト値でClickHouseテーブルにデータを挿入しています。ClickHouseのカラムを[`Nullable`](/sql-reference/data-types/nullable)にすることもできますが、パフォーマンスに悪影響を及ぼす可能性があるため推奨されません。

または、`SET input_format_null_as_default=1`を設定すると、欠損値やNULL値は、デフォルト値が指定されている場合、それぞれのカラムのデフォルト値に置き換えられます。
:::


## データエクスポートの成功確認 {#3-testing-successful-data-export}

データが正しく挿入されたかどうかを確認するには、新しいテーブルに対して`SELECT`クエリを実行します。

```sql
SELECT * FROM mytable LIMIT 10;
```

さらにBigQueryテーブルをエクスポートする場合は、追加するテーブルごとに上記の手順を繰り返してください。

</VerticalStepper>


## 参考資料とサポート {#further-reading-and-support}

本ガイドに加えて、[ClickHouseを使用してBigQueryを高速化する方法と増分インポートの処理方法](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)を紹介するブログ記事もご参照ください。

BigQueryからClickHouseへのデータ転送で問題が発生した場合は、support@clickhouse.comまでお気軽にお問い合わせください。
