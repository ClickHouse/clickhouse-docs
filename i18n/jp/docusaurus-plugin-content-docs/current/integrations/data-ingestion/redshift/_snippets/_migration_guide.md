import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';



## はじめに {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/)は、Amazon Web Servicesが提供する人気のクラウドデータウェアハウスソリューションです。本ガイドでは、RedshiftインスタンスからClickHouseへデータを移行するための複数のアプローチを紹介します。以下の3つのオプションについて説明します:

<Image
  img={redshiftToClickhouse}
  size='md'
  alt='RedshiftからClickHouseへの移行オプション'
  background='white'
/>

ClickHouseインスタンスの観点から、以下のいずれかの方法を選択できます:

1. サードパーティのETL/ELTツールまたはサービスを使用してClickHouseにデータを**[プッシュ](#push-data-from-redshift-to-clickhouse)**する

2. ClickHouse JDBC Bridgeを活用してRedshiftからデータを**[プル](#pull-data-from-redshift-to-clickhouse)**する

3. S3オブジェクトストレージを使用し、「アンロード後ロード」ロジックでデータを**[ピボット](#pivot-data-from-redshift-to-clickhouse-using-s3)**する

:::note
本チュートリアルではRedshiftをデータソースとして使用していますが、ここで紹介する移行アプローチはRedshift専用ではなく、互換性のある任意のデータソースに対して同様の手順を適用できます。
:::


## RedshiftからClickHouseへのデータプッシュ {#push-data-from-redshift-to-clickhouse}

プッシュシナリオでは、サードパーティのツールまたはサービス(カスタムコードまたは[ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT))を利用して、ClickHouseインスタンスにデータを送信します。例えば、[Airbyte](https://www.airbyte.com/)のようなソフトウェアを使用して、Redshiftインスタンス(ソース)とClickHouse(デスティネーション)間でデータを移動できます([Airbyteの統合ガイドを参照](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md))。

<Image
  img={push}
  size='md'
  alt='RedshiftからClickHouseへのプッシュ'
  background='white'
/>

### メリット {#pros}

- ETL/ELTソフトウェアの既存のコネクタカタログを活用できます。
- データを同期状態に保つための組み込み機能(追加/上書き/増分ロジック)を備えています。
- データ変換シナリオを実現できます(例:[dbtの統合ガイド](/integrations/data-ingestion/etl-tools/dbt/index.md)を参照)。

### デメリット {#cons}

- ユーザーはETL/ELTインフラストラクチャのセットアップと保守が必要です。
- アーキテクチャにサードパーティ要素が導入されるため、スケーラビリティのボトルネックになる可能性があります。


## RedshiftからClickHouseへのデータプル {#pull-data-from-redshift-to-clickhouse}

プルシナリオでは、ClickHouse JDBC Bridgeを利用してClickHouseインスタンスからRedshiftクラスタに直接接続し、`INSERT INTO ... SELECT`クエリを実行します。

<Image
  img={pull}
  size='md'
  alt='RedshiftからClickHouseへのプル'
  background='white'
/>

### メリット {#pros-1}

- すべてのJDBC互換ツールに汎用的に対応
- ClickHouse内から複数の外部データソースをクエリできるエレガントなソリューション

### デメリット {#cons-1}

- ClickHouse JDBC Bridgeインスタンスが必要であり、スケーラビリティのボトルネックになる可能性がある

:::note
RedshiftはPostgreSQLをベースにしていますが、ClickHouseはPostgreSQLバージョン9以上を必要とし、Redshift APIはそれ以前のバージョン(8.x)に基づいているため、ClickHouseのPostgreSQLテーブル関数やテーブルエンジンを使用することはできません。
:::

### チュートリアル {#tutorial}

このオプションを使用するには、ClickHouse JDBC Bridgeをセットアップする必要があります。ClickHouse JDBC Bridgeは、JDBC接続を処理し、ClickHouseインスタンスとデータソース間のプロキシとして機能するスタンドアロンのJavaアプリケーションです。このチュートリアルでは、[サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)が事前に投入されたRedshiftインスタンスを使用しました。

<VerticalStepper headerLevel="h4">

#### ClickHouse JDBC Bridgeのデプロイ {#deploy-clickhouse-jdbc-bridge}

ClickHouse JDBC Bridgeをデプロイします。詳細については、[外部データソース向けJDBC](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)のユーザーガイドを参照してください。

:::note
ClickHouse Cloudを使用している場合は、ClickHouse JDBC Bridgeを別の環境で実行し、[remoteSecure](/sql-reference/table-functions/remote/)関数を使用してClickHouse Cloudに接続する必要があります。
:::

#### Redshiftデータソースの設定 {#configure-your-redshift-datasource}

ClickHouse JDBC Bridge用にRedshiftデータソースを設定します。例:`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json`

```json
{
  "redshift-server": {
    "aliases": ["redshift"],
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

#### ClickHouseからRedshiftインスタンスへのクエリ {#query-your-redshift-instance-from-clickhouse}

ClickHouse JDBC Bridgeがデプロイされ実行されると、ClickHouseからRedshiftインスタンスへのクエリを開始できます。

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

#### RedshiftからClickHouseへのデータインポート {#import-data-from-redshift-to-clickhouse}

以下では、`INSERT INTO ... SELECT`ステートメントを使用したデータインポートを示します。


```sql
# 3列のテーブル作成
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


## S3を使用してRedshiftからClickHouseへデータを移行する {#pivot-data-from-redshift-to-clickhouse-using-s3}

このシナリオでは、中間形式でデータをS3にエクスポートし、次のステップでS3からClickHouseにデータをロードします。

<Image
  img={pivot}
  size='md'
  alt='S3を使用したRedshiftからのピボット'
  background='white'
/>

### 利点 {#pros-2}

- RedshiftとClickHouseの両方が強力なS3統合機能を備えています。
- Redshiftの`UNLOAD`コマンドやClickHouseのS3テーブル関数/テーブルエンジンなどの既存機能を活用できます。
- ClickHouseのS3に対する並列読み取りと高スループット機能により、シームレスにスケールします。
- Apache Parquetのような高度な圧縮形式を活用できます。

### 欠点 {#cons-2}

- プロセスが2段階必要です(Redshiftからアンロードし、その後ClickHouseにロード)。

### チュートリアル {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### UNLOADを使用してS3バケットにデータをエクスポートする {#export-data-into-an-s3-bucket-using-unload}

Redshiftの[UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html)機能を使用して、既存のプライベートS3バケットにデータをエクスポートします:

<Image
  img={s3_1}
  size='md'
  alt='RedshiftからS3へのUNLOAD'
  background='white'
/>

S3内に生データを含むパートファイルが生成されます

<Image img={s3_2} size='md' alt='S3内のデータ' background='white' />

#### ClickHouseでテーブルを作成する {#create-the-table-in-clickhouse}

ClickHouseでテーブルを作成します:

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

または、ClickHouseは`CREATE TABLE ... EMPTY AS SELECT`を使用してテーブル構造を推測できます:

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

これは、Parquetのようなデータ型情報を含む形式でデータが保存されている場合に特に有効です。

#### S3ファイルをClickHouseにロードする {#load-s3-files-into-clickhouse}

`INSERT INTO ... SELECT`文を使用してS3ファイルをClickHouseにロードします:

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
この例では中間形式としてCSVを使用しました。ただし、本番環境のワークロードでは、大規模な移行にはApache Parquetを最適な選択肢として推奨します。Parquetは圧縮機能を備えており、転送時間を短縮しながらストレージコストを削減できます(デフォルトでは、各行グループはSNAPPYを使用して圧縮されます)。ClickHouseはParquetのカラム指向性も活用してデータ取り込みを高速化します。
:::

</VerticalStepper>
