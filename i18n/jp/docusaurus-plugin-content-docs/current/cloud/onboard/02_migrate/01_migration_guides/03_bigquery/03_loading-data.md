---
'sidebar_label': 'データの読み込み'
'title': 'BigQueryからClickHouseへのデータの読み込み'
'slug': '/migrations/bigquery/loading-data'
'description': 'BigQueryからClickHouseへデータを読み込む方法'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
'doc_type': 'guide'
---

_このガイドは、ClickHouse Cloudおよびセルフホステッド ClickHouse v23.5+ に対応しています。_

このガイドでは、[BigQuery](https://cloud.google.com/bigquery) から ClickHouse へのデータ移行方法について説明します。

最初に、テーブルを [Google のオブジェクトストレージ (GCS)](https://cloud.google.com/storage) にエクスポートし、その後そのデータを [ClickHouse Cloud](https://clickhouse.com/cloud) にインポートします。これらの手順は、BigQuery から ClickHouse にエクスポートしたい各テーブルごとに繰り返す必要があります。

## ClickHouse へのデータエクスポートにかかる時間はどれくらいですか？ {#how-long-will-exporting-data-to-clickhouse-take}

BigQuery から ClickHouse へのデータエクスポートは、データセットのサイズに依存します。比較として、このガイドを使用して、[4TB のパブリック Ethereum データセット](https://cloud.google.com/blog/products/data-analytics/ethereum-bigquery-public-dataset-smart-contract-analytics) を BigQuery から ClickHouse にエクスポートするのに約 1 時間かかります。

| テーブル                                                                                                 | 行数           | エクスポートファイル数 | データサイズ | BigQuery エクスポート | スロット時間       | ClickHouse インポート |
| ------------------------------------------------------------------------------------------------------- | -------------- | --------------------- | ------------ | -------------------- | ------------------ | -------------------- |
| [blocks](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/blocks.md)                  | 16,569,489     | 73                    | 14.53GB      | 23 秒               | 37 分              | 15.4 秒              |
| [transactions](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/transactions.md)      | 1,864,514,414  | 5169                  | 957GB        | 1 分 38 秒          | 1 日 8 時間        | 18 分 5 秒          |
| [traces](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/traces.md)                  | 6,325,819,306  | 17,985                | 2.896TB      | 5 分 46 秒          | 5 日 19 時間       | 34 分 55 秒         |
| [contracts](https://github.com/ClickHouse/examples/blob/main/ethereum/schemas/contracts.md)            | 57,225,837     | 350                   | 45.35GB      | 16 秒               | 1 時間 51 分       | 39.4 秒              |
| 合計                                                                                                   | 82.6 億       | 23,577                | 3.982TB      | 8 分 3 秒           | &gt; 6 日 5 時間  | 53 分 45 秒         |

<VerticalStepper headerLevel="h2">

## テーブルデータを GCS にエクスポートする {#1-export-table-data-to-gcs}

このステップでは、[BigQuery SQL ワークスペース](https://cloud.google.com/bigquery/docs/bigquery-web-ui) を使用して SQL コマンドを実行します。以下では、BigQuery のテーブル `mytable` を GCS バケットにエクスポートするために [`EXPORT DATA`](https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements) ステートメントを使用します。

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

上記のクエリでは、BigQuery のテーブルを [Parquet データ形式](https://parquet.apache.org/) にエクスポートしています。また、`uri` パラメータには `*` 文字があります。これにより、1GB のデータを超えるエクスポートの場合、出力が複数のファイルにシャーディングされ、数値が増加するサフィックスが付与されます。

このアプローチには多くの利点があります：

- Google は、1 日あたり最大 50TB を GCS に無料でエクスポートできることを許可しています。ユーザーは GCS ストレージの料金のみを支払います。
- エクスポートでは自動的に複数のファイルが作成され、それぞれのテーブルデータの最大サイズは 1GB に制限されています。これは、ClickHouse にとって有利であり、インポートを並列化できます。
- Parquet は列指向のフォーマットであり、本質的に圧縮されており、BigQuery がエクスポートし、ClickHouse がクエリを実行する際に速くなるため、より優れた交換フォーマットです。

## GCS から ClickHouse へのデータインポート {#2-importing-data-into-clickhouse-from-gcs}

エクスポートが完了したら、このデータを ClickHouse テーブルにインポートできます。以下のコマンドを実行するには、[ClickHouse SQL コンソール](/integrations/sql-clients/sql-console) または [`clickhouse-client`](/interfaces/cli) を使用できます。

最初に [テーブルを作成](/sql-reference/statements/create/table) する必要があります：

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

テーブルを作成したら、クラスターに複数の ClickHouse レプリカがある場合は、エクスポートを高速化するために `parallel_distributed_insert_select` 設定を有効にします。ClickHouse ノードが 1 つだけの場合は、このステップをスキップできます：

```sql
SET parallel_distributed_insert_select = 1;
```

最後に、[`INSERT INTO SELECT` コマンド](/sql-reference/statements/insert-into#inserting-the-results-of-select) を使用して GCS から ClickHouse テーブルにデータを挿入できます。これは、`SELECT` クエリの結果に基づいてテーブルにデータを挿入します。

データを `INSERT` するために、GCS バケットからデータを取得するために [s3Cluster 関数](/sql-reference/table-functions/s3Cluster) を使用できます。これは、GCS が [Amazon S3](https://aws.amazon.com/s3/) と相互運用可能であるためです。ClickHouse ノードが 1 つだけある場合は、`s3Cluster` 関数の代わりに [s3 テーブル関数](/sql-reference/table-functions/s3) を使用できます。

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

上記のクエリで使用される `ACCESS_ID` と `SECRET` は、あなたの GCS バケットに関連付けられた [HMAC キー](https://cloud.google.com/storage/docs/authentication/hmackeys) です。

:::note NULLABLE カラムをエクスポートする際に `ifNull` を使用する
上記のクエリでは、`ifNull` 関数を使用して、`some_text` カラムにデフォルト値で ClickHouse テーブルにデータを挿入しています。また、ClickHouse におけるカラムを [`Nullable`](/sql-reference/data-types/nullable) にすることもできますが、パフォーマンスに悪影響を及ぼす可能性があるため推奨されません。

代わりに、`SET input_format_null_as_default=1` を設定すると、欠損または NULL の値は、それぞれのカラムのデフォルト値に置き換えられます（デフォルトが指定されている場合）。
:::

## データエクスポートの成功を試験する {#3-testing-successful-data-export}

データが正しく挿入されたかどうかをテストするには、新しいテーブルに対して `SELECT` クエリを実行してください：

```sql
SELECT * FROM mytable LIMIT 10;
```

さらに BigQuery テーブルをエクスポートするには、追加のテーブルごとに上記の手順を繰り返すだけです。

</VerticalStepper>

## さらなる情報とサポート {#further-reading-and-support}

このガイドに加えて、[ClickHouse を使用して BigQuery の速度を上げ、インクリメンタルインポートを処理する方法](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries)に関するブログ投稿も読むことをお勧めします。

BigQuery から ClickHouse へのデータ転送に関して問題がある場合は、support@clickhouse.com までお気軽にお問い合わせください。
