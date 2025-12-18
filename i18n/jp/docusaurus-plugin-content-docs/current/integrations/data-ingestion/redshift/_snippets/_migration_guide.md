import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

## はじめに {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) は、Amazon Web Services が提供するクラウド型データウェアハウスソリューションとして広く利用されています。本ガイドでは、Redshift インスタンスから ClickHouse へデータを移行する複数のアプローチを紹介します。ここでは次の 3 つのオプションを取り上げます。

<Image img={redshiftToClickhouse} size="md" alt="Redshift から ClickHouse への移行オプション"/>

ClickHouse インスタンス側の観点からは、次のいずれかを選択できます。

1. サードパーティの ETL/ELT ツールまたはサービスを使用して、ClickHouse へデータを **[PUSH](#push-data-from-redshift-to-clickhouse)** する

2. ClickHouse JDBC Bridge を利用して、Redshift からデータを **[PULL](#pull-data-from-redshift-to-clickhouse)** する

3. S3 オブジェクトストレージを利用し、「アンロードしてからロードする（unload-then-load）」というロジックで **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** する

:::note
このチュートリアルでは、データソースとして Redshift を使用しています。ただし、ここで紹介する移行アプローチは Redshift に限定されるものではなく、互換性のある任意のデータソースに対しても、同様の手順を応用できます。
:::

## Redshift から ClickHouse へデータをプッシュする {#push-data-from-redshift-to-clickhouse}

プッシュシナリオでは、サードパーティのツールやサービス（カスタムコード、または [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）を利用して、ClickHouse インスタンスにデータを送信します。たとえば、[Airbyte](https://www.airbyte.com/) のようなソフトウェアを使用して、Redshift インスタンス（ソース）から ClickHouse（宛先）へデータを移動できます（[Airbyte との連携ガイド](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)も参照してください）。

<Image img={push} size="md" alt="Redshift から ClickHouse への PUSH"/>

### 利点 {#pros}

* 既存の ETL/ELT ソフトウェアのコネクタカタログを活用できる。
* データの同期を維持するための機能（追記／上書き／増分ロジック）が組み込まれている。
* データ変換シナリオを実現できる（例として、[dbt 連携ガイド](/integrations/data-ingestion/etl-tools/dbt/index.md) を参照）。

### 欠点 {#cons}

* ETL/ELT 基盤を構築し、運用・保守する必要があります。
* アーキテクチャにサードパーティコンポーネントが追加され、スケーラビリティのボトルネックとなる可能性があります。

## Redshift から ClickHouse へのプル型データ取得 {#pull-data-from-redshift-to-clickhouse}

プル型シナリオでは、ClickHouse インスタンスから Redshift クラスターに直接接続するために ClickHouse JDBC Bridge を利用し、`INSERT INTO ... SELECT` クエリを実行します。

<Image img={pull} size="md" alt="Redshift から ClickHouse への PULL"/>

### 利点 {#pros-1}

* すべての JDBC 互換ツールで汎用的に利用できる
* ClickHouse 内から複数の外部データソースに対してクエリを実行できる、洗練されたソリューション

### デメリット {#cons-1}

* スケーラビリティのボトルネックとなり得る ClickHouse JDBC Bridge インスタンスが必要になります

:::note
Redshift は PostgreSQL ベースですが、ClickHouse の PostgreSQL テーブル関数やテーブルエンジンは利用できません。これは、ClickHouse では PostgreSQL バージョン 9 以上が必要である一方、Redshift の API はそれ以前のバージョン (8.x) に基づいているためです。
:::

### チュートリアル {#tutorial}

このオプションを使用するには、ClickHouse JDBC Bridge をセットアップする必要があります。ClickHouse JDBC Bridge は、JDBC 接続を処理し、ClickHouse インスタンスとデータソース間のプロキシとして動作するスタンドアロンの Java アプリケーションです。このチュートリアルでは、あらかじめデータが投入されている Redshift インスタンスと、その [サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html) を使用します。

<VerticalStepper headerLevel="h4">

#### ClickHouse JDBC Bridge をデプロイする {#deploy-clickhouse-jdbc-bridge}

ClickHouse JDBC Bridge をデプロイします。詳細については、[外部データソース向け JDBC](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md) に関するユーザーガイドを参照してください。

:::note
ClickHouse Cloud を使用している場合は、ClickHouse JDBC Bridge を別の環境で実行し、[remoteSecure](/sql-reference/table-functions/remote/) 関数を使用して ClickHouse Cloud に接続する必要があります。
:::

#### Redshift データソースを設定する {#configure-your-redshift-datasource}

ClickHouse JDBC Bridge 用に Redshift データソースを設定します。たとえば、`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json` のようにします。

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

#### ClickHouse から Redshift インスタンスにクエリを実行する {#query-your-redshift-instance-from-clickhouse}

ClickHouse JDBC Bridge がデプロイされ稼働したら、ClickHouse から Redshift インスタンスに対してクエリを実行できるようになります。

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

#### Redshift から ClickHouse にデータをインポートする {#import-data-from-redshift-to-clickhouse}

以下では、`INSERT INTO ... SELECT` ステートメントを使用したデータのインポート方法を示します。

```sql
# 3 つのカラムを持つテーブルの作成 {#table-creation-with-3-columns}
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

## S3 を使用して Redshift から ClickHouse へデータをピボットする {#pivot-data-from-redshift-to-clickhouse-using-s3}

このシナリオでは、ピボット用の中間フォーマットでデータを S3 にエクスポートし、次の段階で S3 から ClickHouse にデータをロードします。

<Image img={pivot} size="md" alt="S3 を使用した Redshift からの PIVOT"/>

### 利点 {#pros-2}

* Redshift と ClickHouse はどちらも強力な S3 連携機能を備えています。
* Redshift の `UNLOAD` コマンドや ClickHouse の S3 テーブル関数/テーブルエンジンなど、既存の機能を活用できます。
* ClickHouse による S3 から/への並列読み取りと高スループットにより、シームレスにスケールします。
* Apache Parquet のような高機能な圧縮フォーマットを活用できます。

### デメリット {#cons-2}

* プロセスが2段階になる（Redshiftからアンロードし、その後ClickHouseへロードする必要がある）。

### チュートリアル {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### UNLOAD を使用してデータを S3 バケットにエクスポートする {#export-data-into-an-s3-bucket-using-unload}

Redshift の [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 機能を使用して、データを既存のプライベート S3 バケットにエクスポートします。

<Image img={s3_1} size="md" alt="Redshift から S3 への UNLOAD" background="white"/>

これにより、S3 内に生データを含むパートファイルが生成されます。

<Image img={s3_2} size="md" alt="S3 内のデータ" background="white"/>

#### ClickHouse にテーブルを作成する {#create-the-table-in-clickhouse}

ClickHouse でテーブルを作成します:

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

または、ClickHouse に `CREATE TABLE ... EMPTY AS SELECT` を使用してテーブル構造を推論させることもできます。

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

これは、Parquet のようにデータ型に関する情報を含む形式でデータが保存されている場合に特に有効です。

#### S3 ファイルを ClickHouse にロードする {#load-s3-files-into-clickhouse}

`INSERT INTO ... SELECT` ステートメントを使用して、S3 ファイルを ClickHouse にロードします。

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
この例では、データ形式として CSV を使用しています。ただし、本番ワークロードにおける大規模なマイグレーションでは、圧縮機能があり、ストレージコストの削減と転送時間の短縮の両方が見込めるため、Apache Parquet を最適な選択肢として推奨します（デフォルトでは、各 row group（行グループ）は SNAPPY で圧縮されます）。ClickHouse はまた、Parquet のカラム指向構造を活用してデータのインジェストを高速化します。
:::

</VerticalStepper>