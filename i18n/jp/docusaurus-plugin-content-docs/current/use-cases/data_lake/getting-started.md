---
title: 'オープンテーブル形式の利用開始'
sidebar_label: '利用開始'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: null
pagination_next: use-cases/data_lake/guides/querying-directly
description: 'ClickHouse を使用して、オープンテーブル形式でデータをクエリし、高速化し、書き戻すための実践的な入門ガイドです。'
keywords: ['データレイク', 'レイクハウス', '利用開始', 'iceberg', 'delta lake', 'hudi', 'paimon']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import iceberg_query_direct from '@site/static/images/datalake/iceberg-query-direct.png';
import iceberg_query_engine from '@site/static/images/datalake/iceberg-query-engine.png';
import iceberg_query from '@site/static/images/datalake/iceberg-query.png';
import clickhouse_query from '@site/static/images/datalake/clickhouse-query.png';

# データレイクの利用開始 \{#data-lake-getting-started\}

:::note[TL;DR]
データレイクテーブルへのクエリ、MergeTree による高速化、結果の Iceberg への書き戻しを、実践的なガイドです。すべての手順で公開データセットを使用し、Cloud と OSS の両方で動作します。
:::

このガイドのスクリーンショットは、[ClickHouse Cloud](https://console.clickhouse.cloud) の SQL コンソールから取得したものです。すべてのクエリは、Cloud とセルフマネージド環境の両方で動作します。

<VerticalStepper headerLevel="h2">
  ## Icebergデータを直接クエリする \{#query-directly\}

  最も手軽に始める方法は、[`icebergS3()`](/sql-reference/table-functions/iceberg) テーブル関数を使用することです。S3 上の Iceberg テーブルを指定するだけで、セットアップ不要でクエリをすぐに実行できます。

  スキーマを確認する:

  ```sql
  DESCRIBE icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  ```

  クエリを実行します:

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={iceberg_query_direct} alt="Iceberg クエリ" />

  ClickHouse は Iceberg のメタデータを S3 から直接読み取り、スキーマを自動的に推論します。同じアプローチは [`deltaLake()`](/sql-reference/table-functions/deltalake)、[`hudi()`](/sql-reference/table-functions/hudi)、[`paimon()`](/sql-reference/table-functions/paimon) にも適用できます。

  **詳細情報:** [オープンテーブルフォーマットへの直接クエリ](/use-cases/data-lake/getting-started/querying-directly)では、4つのフォーマットすべて、分散読み取り用のクラスターバリアント、ストレージバックエンドオプション (S3、Azure、HDFS、ローカル) について説明しています。

  ## 永続テーブルエンジンの作成 \{#table-engine\}

  繰り返しアクセスする場合は、Icebergテーブルエンジンを使用してテーブルを作成しておくと、毎回パスを指定する必要がなくなります。データはS3に保持され、複製は発生しません：

  ```sql
  CREATE TABLE hits_iceberg
      ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  ```

  他の ClickHouse テーブルと同様にクエリを実行できます：

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_iceberg
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={iceberg_query_engine} alt="Icebergのクエリ" />

  テーブルエンジンは、データキャッシュ、メタデータキャッシュ、スキーマ進化、およびタイムトラベルをサポートしています。テーブルエンジンの機能の詳細については[直接クエリする](/use-cases/data-lake/getting-started/querying-directly)ガイドを、全機能の比較については[サポートマトリックス](/use-cases/data-lake/support-matrix)を参照してください。

  ## カタログへの接続 \{#connect-catalog\}

  多くの組織では、テーブルのメタデータとデータディスカバリーを一元管理するために、データカタログを通じてIcebergテーブルを管理しています。ClickHouseは、[`DataLakeCatalog`](/engines/database-engines/datalakecatalog)データベースエンジンを使用してカタログへの接続をサポートしており、すべてのカタログテーブルをClickHouseデータベースとして公開します。これはよりスケーラブルなアプローチであり、新しいIcebergテーブルが作成された場合でも、追加の作業なしに常にClickHouseからアクセスできます。

  以下は [AWS Glue](/use-cases/data-lake/glue-catalog) への接続例です：

  ```sql
  CREATE DATABASE my_lake
  ENGINE = DataLakeCatalog
  SETTINGS
      catalog_type = 'glue',
      region = '<your-region>',
      aws_access_key_id = '<your-access-key>',
      aws_secret_access_key = '<your-secret-key>'
  ```

  各カタログタイプには固有の接続設定が必要です。サポートされているカタログの完全なリストと設定オプションについては、[カタログガイド](/use-cases/data-lake/reference)を参照してください。

  テーブルの参照とクエリの実行:

  ```sql
  SHOW TABLES FROM my_lake;
  ```

  ```sql
  SELECT count(*) FROM my_lake.`<database>.<table>`
  ```

  :::note
  ClickHouseはネイティブで複数のネームスペースをサポートしていないため、`<database>.<table>`はバッククォートで囲む必要があります。
  :::

  **詳細情報:** [データカタログへの接続](/use-cases/data-lake/getting-started/connecting-catalogs)では、DeltaおよびIcebergの例を使用したUnity Catalogの完全なセットアップ手順を説明しています。

  ## クエリを実行する \{#issue-query\}

  上記のいずれの方法 (テーブル関数、テーブルエンジン、またはカタログ) を使用した場合でも、同じ ClickHouse SQL をすべてに対して使用できます。

  ```sql
  -- Table function
  SELECT url, count() AS cnt
  FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  GROUP BY url ORDER BY cnt DESC LIMIT 5

  -- Table engine
  SELECT url, count() AS cnt
  FROM hits_iceberg
  GROUP BY url ORDER BY cnt DESC LIMIT 5

  -- Catalog
  SELECT url, count() AS cnt
  FROM my_lake.`<database>.<table>`
  GROUP BY url ORDER BY cnt DESC LIMIT 5
  ```

  クエリの構文は同一で、変わるのは `FROM` 句のみです。ClickHouse のすべての SQL 関数、結合、集計は、データソースに関わらず同じように動作します。

  ## サブセットをClickHouseに読み込む \{#load-data\}

  Icebergに直接クエリを実行するのは手軽ですが、パフォーマンスはネットワークスループットとファイルレイアウトに依存します。分析ワークロードには、ネイティブのMergeTreeテーブルにデータをロードすることを推奨します。

  まず、ベースラインを取得するために、Icebergテーブルに対してフィルタリングクエリを実行します。

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_iceberg
  WHERE counterid = 38
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  このクエリは、Icebergが`counterid`フィルターを認識しないため、S3内のデータセット全体をスキャンします。完了まで数秒かかることを想定してください。

  <Image img={iceberg_query} alt="Icebergクエリ" />

  次に、MergeTreeテーブルを作成してデータをロードします：

  ```sql
  CREATE TABLE hits_clickhouse
  (
      url String,
      eventtime DateTime,
      counterid UInt32
  )
  ENGINE = MergeTree()
  ORDER BY (counterid, eventtime);
  ```

  ```sql
  INSERT INTO hits_clickhouse
  SELECT url, eventtime, counterid
  FROM hits_iceberg
  ```

  MergeTreeテーブルに対して同じクエリを再実行します：

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_clickhouse
  WHERE counterid = 38
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={clickhouse_query} alt="ClickHouse クエリ" />

  `counterid` は `ORDER BY` キーの最初のカラムであるため、ClickHouse のスパース主索引は関連するグラニュールに直接スキップします — 1億行すべてをスキャンする代わりに、`counterid = 38` の行のみを読み取ります。その結果、処理速度が大幅に向上します。

  [分析の高速化](/use-cases/data-lake/getting-started/accelerating-analytics)ガイドでは、`LowCardinality`型、全文インデックス、最適化された順序付けキーを活用してさらに踏み込んだ内容を扱っており、2億8,300万行のデータセットで**約40倍のパフォーマンス向上**を実証しています。

  **詳細情報:** [MergeTreeによる分析の高速化](/use-cases/data-lake/getting-started/accelerating-analytics)では、スキーマの最適化、全文索引、および改善前後の包括的なパフォーマンス比較について説明しています。

  ## Icebergへの書き込み \{#write-back\}

  ClickHouseはIcebergテーブルへのデータの書き戻しも可能で、リバースETLワークフローを実現します。集計結果やサブセットを他のツール (Spark、Trino、DuckDBなど) が利用できる形式で公開することができます。

  出力用のIcebergテーブルを作成します：

  ```sql
  CREATE TABLE output_iceberg
  (
      url String,
      cnt UInt64
  )
  ENGINE = IcebergS3('https://your-bucket.s3.amazonaws.com/output/', 'access_key', 'secret_key')
  ```

  集計結果の書き込み:

  ```sql
  SET allow_experimental_insert_into_iceberg = 1;

  INSERT INTO output_iceberg
  SELECT
      url,
      count() AS cnt
  FROM hits_clickhouse
  GROUP BY url
  ORDER BY cnt DESC
  ```

  作成されたIcebergテーブルは、Iceberg互換の任意のエンジンから読み取ることができます。

  **詳細情報:** [オープンテーブルフォーマットへのデータ書き込み](/use-cases/data-lake/getting-started/writing-data)では、UK Price Paid データセットを使用した生データおよび集計結果の書き込みについて説明しています。ClickHouse の型を Iceberg にマッピングする際のスキーマの考慮事項についても取り上げています。
</VerticalStepper>

## 次のステップ \{#next-steps\}

ここまででワークフロー全体を確認できたので、各項目をさらに詳しく見ていきましょう。

* [直接クエリする](/use-cases/data-lake/getting-started/querying-directly) — 4 つの形式すべて、クラスター構成のバリエーション、テーブルエンジン、キャッシュ
* [カタログに接続する](/use-cases/data-lake/getting-started/connecting-catalogs) — Delta と Iceberg を使用した Unity Catalog の完全なウォークスルー
* [分析を高速化する](/use-cases/data-lake/getting-started/accelerating-analytics) — スキーマ最適化、索引、約 40 倍高速化のデモ
* [データレイクに書き込む](/use-cases/data-lake/getting-started/writing-data) — 生データの書き込み、集約データの書き込み、型マッピング
* [サポートマトリクス](/use-cases/data-lake/support-matrix) — 各形式とストレージバックエンドにおける機能比較