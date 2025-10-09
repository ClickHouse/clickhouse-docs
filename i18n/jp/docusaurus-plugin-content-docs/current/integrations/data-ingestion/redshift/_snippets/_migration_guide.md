

import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

## Introduction {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) は、Amazon Web Services が提供する人気のあるクラウドデータウェアハウジングソリューションです。このガイドでは、Redshift インスタンスから ClickHouse へのデータ移行のさまざまなアプローチを紹介します。以下の三つのオプションをカバーします：

<Image img={redshiftToClickhouse} size="md" alt="Redshift to ClickHouse Migration Options" background="white"/>

ClickHouse インスタンスの観点から、次のいずれかを行うことができます：

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** サードパーティの ETL/ELT ツールまたはサービスを使用して ClickHouse にデータを送信する

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** ClickHouse JDBC ブリッジを利用して Redshift からデータを取得する

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** S3 オブジェクトストレージを使用して「アンロードしてからロードする」ロジックを用いる

:::note
このチュートリアルでは Redshift をデータソースとして使用しました。ただし、ここで示される移行方法は Redshift に限定されず、互換性のあるデータソースについても同様の手順が導き出せます。
:::

## Push Data from Redshift to ClickHouse {#push-data-from-redshift-to-clickhouse}

プッシュシナリオでは、サードパーティのツールまたはサービス（カスタムコードまたは [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）を利用して、データを ClickHouse インスタンスに送ることを目的としています。例えば、[Airbyte](https://www.airbyte.com/) のようなソフトウェアを使用して、Redshift インスタンス（ソース）から ClickHouse（宛先）にデータを移動させることができます（[Airbyte の統合ガイドを参照してください](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)）。

<Image img={push} size="md" alt="PUSH Redshift to ClickHouse" background="white"/>

### Pros {#pros}

* ETL/ELT ソフトウェアの既存のコネクタカタログを活用できる。
* データを同期するための組み込み機能（追加/上書き/インクリメントロジック）。
* データ変換シナリオを可能にする（例えば、[dbt の統合ガイドを参照してください](/integrations/data-ingestion/etl-tools/dbt/index.md)）。

### Cons {#cons}

* ユーザーは ETL/ELT インフラをセットアップおよび維持する必要がある。
* アーキテクチャにサードパーティの要素を導入するため、潜在的なスケーラビリティのボトleneckとなる可能性がある。

## Pull Data from Redshift to ClickHouse {#pull-data-from-redshift-to-clickhouse}

プルシナリオでは、ClickHouse JDBC ブリッジを利用して Redshift クラスターに直接接続し、`INSERT INTO ... SELECT` クエリを実行することを目的としています：

<Image img={pull} size="md" alt="PULL from Redshift to ClickHouse" background="white"/>

### Pros {#pros-1}

* すべての JDBC 互換ツールに対して一般的
* ClickHouse から複数の外部データソースをクエリするためのエレガントなソリューション

### Cons {#cons-1}

* ClickHouse JDBC ブリッジインスタンスが必要であり、これが潜在的なスケーラビリティのボトleneckとなる可能性がある

:::note
Redshift は PostgreSQL に基づいていますが、ClickHouse は PostgreSQL バージョン 9 以上を必要とするため、ClickHouse の PostgreSQL テーブル関数またはテーブルエンジンを使用することはできません。Redshift API は古いバージョン（8.x）に基づいています。
:::

### Tutorial {#tutorial}

このオプションを使用するには、ClickHouse JDBC ブリッジをセットアップする必要があります。ClickHouse JDBC ブリッジは、JDBC 接続を処理し、ClickHouse インスタンスとデータソースの間のプロキシとして機能するスタンドアロンの Java アプリケーションです。このチュートリアルでは、[サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)が用意された Redshift インスタンスを使用しました。

<VerticalStepper headerLevel="h4">

#### Deploy ClickHouse JDBC Bridge {#deploy-clickhouse-jdbc-bridge}

ClickHouse JDBC ブリッジを展開します。詳細については、[外部データソース向けJDBCのユーザーガイド](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)をご覧ください。

:::note
ClickHouse Cloud を使用している場合、ClickHouse JDBC ブリッジを別の環境で実行し、[remoteSecure](/sql-reference/table-functions/remote/) 関数を使用して ClickHouse Cloud に接続する必要があります。
:::

#### Configure your Redshift datasource {#configure-your-redshift-datasource}

ClickHouse JDBC ブリッジ用に Redshift データソースを設定します。例えば、`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

```json
{
 "redshift-server": {
   "aliases": [
     "redshift"
   ],
   "driverUrls": [
   "https://s3.amazonaws.com/redshift-downloads/drivers/jdbc/2.1.0.4/redshift-jdbc42-2.1.0.4.jar"
   ],
   "driverClassName": "com.amazon.redshift.jdbc.Driver",
   "jdbcUrl": "jdbc:redshift://redshift-cluster-1.ckubnplpz1uv.us-east-1.redshift.amazonaws.com:5439/dev",
   "username": "awsuser",
   "password": "<password>",
   "maximumPoolSize": 5
 }
}
```

#### Query your Redshift instance from ClickHouse {#query-your-redshift-instance-from-clickhouse}

ClickHouse JDBC ブリッジを展開して実行後、ClickHouse から Redshift インスタンスにクエリを開始することができます。

```sql
SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users limit 5')
```

```response
Query id: 1b7de211-c0f6-4117-86a2-276484f9f4c0

┌─username─┬─firstname─┬─lastname─┐
│ PGL08LJI │ Vladimir  │ Humphrey │
│ XDZ38RDD │ Barry     │ Roy      │
│ AEB55QTM │ Reagan    │ Hodge    │
│ OWY35QYB │ Tamekah   │ Juarez   │
│ MSD36KVR │ Mufutau   │ Watkins  │
└──────────┴───────────┴──────────┘

5 rows in set. Elapsed: 0.438 sec.
```

```sql
SELECT *
FROM jdbc('redshift', 'select count(*) from sales')
```

```response
Query id: 2d0f957c-8f4e-43b2-a66a-cc48cc96237b

┌──count─┐
│ 172456 │
└────────┘

1 rows in set. Elapsed: 0.304 sec.
```

#### Import Data from Redshift to ClickHouse {#import-data-from-redshift-to-clickhouse}

以下に、`INSERT INTO ... SELECT` ステートメントを使用してデータをインポートする例を示します。

```sql

# TABLE CREATION with 3 columns
CREATE TABLE users_imported
(
   `username` String,
   `firstname` String,
   `lastname` String
)
ENGINE = MergeTree
ORDER BY firstname
```

```response
Query id: c7c4c44b-cdb2-49cf-b319-4e569976ab05

Ok.

0 rows in set. Elapsed: 0.233 sec.
```

```sql
INSERT INTO users_imported (*) SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users')
```

```response
Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

Ok.

0 rows in set. Elapsed: 4.498 sec. Processed 49.99 thousand rows, 2.49 MB (11.11 thousand rows/s., 554.27 KB/s.)
```

</VerticalStepper>

## Pivot Data from Redshift to ClickHouse using S3 {#pivot-data-from-redshift-to-clickhouse-using-s3}

このシナリオでは、データを中間ピボット形式で S3 にエクスポートし、次のステップで S3 から ClickHouse にデータをロードします。

<Image img={pivot} size="md" alt="PIVOT from Redshift using S3" background="white"/>

### Pros {#pros-2}

* Redshift と ClickHouse の両方が強力な S3 統合機能を備えています。
* Redshift の `UNLOAD` コマンド及び ClickHouse S3 テーブル関数 / テーブルエンジンなど、既存の機能を活用します。
* ClickHouse の S3 への並行読み取りおよび高スループット機能によりスムーズにスケールします。
* Apache Parquet のような高度で圧縮されたフォーマットを活用できます。

### Cons {#cons-2}

* プロセスは二つのステップ（Redshift からアンロード後、ClickHouse にロード）があります。

### Tutorial {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### Export data into an S3 bucket using UNLOAD {#export-data-into-an-s3-bucket-using-unload}

Redshift の [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 機能を使用して、既存のプライベート S3 バケットにデータをエクスポートします：

<Image img={s3_1} size="md" alt="UNLOAD from Redshift to S3" background="white"/>

これにより、S3 に生データを含むパートファイルが生成されます。

<Image img={s3_2} size="md" alt="Data in S3" background="white"/>

#### Create the table in ClickHouse {#create-the-table-in-clickhouse}

ClickHouse にテーブルを作成します：

```sql
CREATE TABLE users
(
  username String,
  firstname String,
  lastname String
)
ENGINE = MergeTree
ORDER BY username
```

また、ClickHouse は `CREATE TABLE ... EMPTY AS SELECT` を使用してテーブル構造を推測することもできます：

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

これは、データがデータ型に関する情報を含むフォーマット（例えば、Parquet）の場合に特に良く機能します。

#### Load S3 files into ClickHouse {#load-s3-files-into-clickhouse}

`INSERT INTO ... SELECT` ステートメントを使用して S3 ファイルを ClickHouse にロードします：

```sql
INSERT INTO users SELECT *
FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

```response
Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

Ok.

0 rows in set. Elapsed: 0.545 sec. Processed 49.99 thousand rows, 2.34 MB (91.72 thousand rows/s., 4.30 MB/s.)
```

:::note
この例ではピボット形式として CSV を使用しました。ただし、本番のワークロードでは、圧縮があり、転送時間を短縮しつつストレージコストを削減できるため、大規模な移行に最適なオプションとして Apache Parquet を推奨します（デフォルトでは、各行グループは SNAPPY を使用して圧縮されています）。ClickHouse はまた、Parquet の列指向を活用してデータ取り込みを高速化します。
:::

</VerticalStepper>
