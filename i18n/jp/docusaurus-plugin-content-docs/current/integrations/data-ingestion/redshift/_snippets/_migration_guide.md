import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';



## はじめに {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) は、Amazon Web Services が提供する広く利用されているクラウド型データウェアハウスソリューションです。このガイドでは、Redshift インスタンスから ClickHouse へデータを移行するための複数のアプローチを紹介します。ここでは次の 3 つの選択肢を取り上げます。

<Image img={redshiftToClickhouse} size="md" alt="Redshift から ClickHouse への移行オプション" background="white"/>

ClickHouse インスタンス側の観点からは、次のいずれかの方法を取ることができます。

1. サードパーティの ETL/ELT ツールまたはサービスを使用して、**[PUSH](#push-data-from-redshift-to-clickhouse)** 方式で ClickHouse にデータを送信する

2. ClickHouse JDBC Bridge を利用して、**[PULL](#pull-data-from-redshift-to-clickhouse)** 方式で Redshift からデータを取得する

3. S3 オブジェクトストレージを使用して、**[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** 方式の「アンロードしてからロードする」ロジックでデータを移行する

:::note
このチュートリアルでは、データソースとして Redshift を使用しています。ただし、ここで紹介する移行アプローチは Redshift 専用ではなく、互換性のある任意のデータソースにも同様の手順を適用できます。
:::



## Redshift から ClickHouse へデータをプッシュする {#push-data-from-redshift-to-clickhouse}

プッシュシナリオでは、サードパーティのツールやサービス（カスタムコードまたは [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）を活用して、データを ClickHouse インスタンスに送信します。たとえば、[Airbyte](https://www.airbyte.com/) のようなソフトウェアを使用して、Redshift インスタンス（ソース）から ClickHouse（宛先）へデータを移動できます（[Airbyte 向けの連携ガイド](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)を参照してください）。

<Image img={push} size="md" alt="PUSH Redshift to ClickHouse" background="white"/>

### 利点 {#pros}

* ETL/ELT ソフトウェアが提供する既存のコネクタカタログを活用できます。
* データを同期状態に保つための機能（追加 / 上書き / インクリメンタル処理ロジック）が組み込まれています。
* データ変換シナリオを実現できます（例として、[dbt 向けの連携ガイド](/integrations/data-ingestion/etl-tools/dbt/index.md)を参照してください）。

### 欠点 {#cons}

* ユーザーは ETL/ELT インフラストラクチャをセットアップして維持する必要があります。
* アーキテクチャにサードパーティ要素を導入することで、潜在的なスケーラビリティのボトルネックになり得ます。



## RedshiftからClickHouseへのデータプル {#pull-data-from-redshift-to-clickhouse}

プルシナリオでは、ClickHouse JDBC Bridgeを活用してClickHouseインスタンスからRedshiftクラスタに直接接続し、`INSERT INTO ... SELECT`クエリを実行します。

<Image
  img={pull}
  size='md'
  alt='RedshiftからClickHouseへのプル'
  background='white'
/>

### 利点 {#pros-1}

- すべてのJDBC互換ツールに汎用的に対応
- ClickHouse内から複数の外部データソースをクエリできるエレガントなソリューション

### 欠点 {#cons-1}

- ClickHouse JDBC Bridgeインスタンスが必要であり、スケーラビリティのボトルネックになる可能性がある

:::note
RedshiftはPostgreSQLをベースにしていますが、ClickHouseはPostgreSQLバージョン9以上を必要とし、Redshift APIはそれ以前のバージョン(8.x)に基づいているため、ClickHouseのPostgreSQLテーブル関数またはテーブルエンジンを使用することはできません。
:::

### チュートリアル {#tutorial}

このオプションを使用するには、ClickHouse JDBC Bridgeをセットアップする必要があります。ClickHouse JDBC Bridgeは、JDBC接続を処理し、ClickHouseインスタンスとデータソース間のプロキシとして機能するスタンドアロンのJavaアプリケーションです。このチュートリアルでは、[サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)が事前に投入されたRedshiftインスタンスを使用しました。

<VerticalStepper headerLevel="h4">

#### ClickHouse JDBC Bridgeのデプロイ {#deploy-clickhouse-jdbc-bridge}

ClickHouse JDBC Bridgeをデプロイします。詳細については、[外部データソース用JDBC](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)のユーザーガイドを参照してください。

:::note
ClickHouse Cloudを使用している場合は、ClickHouse JDBC Bridgeを別の環境で実行し、[remoteSecure](/sql-reference/table-functions/remote/)関数を使用してClickHouse Cloudに接続する必要があります。
:::

#### Redshiftデータソースの設定 {#configure-your-redshift-datasource}

ClickHouse JDBC Bridge用にRedshiftデータソースを設定します。例：`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json`

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
# 3列でテーブルを作成
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

このシナリオでは、中間のピボット形式でデータを S3 にエクスポートし、2 段階目で S3 から ClickHouse にデータをロードします。

<Image img={pivot} size="md" alt="S3 を使用した Redshift からの PIVOT" background="white"/>

### 利点 {#pros-2}

* Redshift と ClickHouse の両方が強力な S3 連携機能を備えています。
* Redshift の `UNLOAD` コマンドや ClickHouse の S3 テーブル関数 / テーブルエンジンなど、既存の機能を活用できます。
* ClickHouse と S3 間の並列読み取りおよび高スループット機能により、シームレスにスケールします。
* Apache Parquet のような高度かつ圧縮された形式を活用できます。

### 欠点 {#cons-2}

* 処理が 2 段階（Redshift からのアンロード、その後 ClickHouse へのロード）になります。

### チュートリアル {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### UNLOAD を使用してデータを S3 バケットにエクスポートする {#export-data-into-an-s3-bucket-using-unload}

Redshift の [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 機能を使用して、データを既存のプライベート S3 バケットにエクスポートします。

<Image img={s3_1} size="md" alt="Redshift から S3 への UNLOAD" background="white"/>

これにより、S3 内に生データを含むパートファイルが生成されます。

<Image img={s3_2} size="md" alt="S3 内のデータ" background="white"/>

#### ClickHouse にテーブルを作成する {#create-the-table-in-clickhouse}

ClickHouse にテーブルを作成します。

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

あるいは、ClickHouse は `CREATE TABLE ... EMPTY AS SELECT` を使用してテーブル構造を推測することもできます。

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

この方法は、Parquet のようにデータ型に関する情報を含む形式でデータが存在する場合に特に有効です。

#### S3 ファイルを ClickHouse にロードする {#load-s3-files-into-clickhouse}

`INSERT INTO ... SELECT` 文を使用して、S3 ファイルを ClickHouse にロードします。

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
この例ではピボット形式として CSV を使用しています。しかし、本番ワークロードでは、大規模な移行では Apache Parquet を最適な選択肢として推奨します。圧縮機能を備えており、ストレージコストを削減しつつ転送時間も短縮できるためです。（デフォルトでは、各ロウグループは SNAPPY で圧縮されます。）ClickHouse はまた、Parquet の列指向を活用してデータのインジェスト処理を高速化します。
:::

</VerticalStepper>