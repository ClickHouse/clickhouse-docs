import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

## はじめに {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) は、Amazon Web Services の提供する人気のクラウドデータウェアハウスソリューションです。このガイドでは、Redshift インスタンスから ClickHouse へデータを移行するさまざまなアプローチを紹介します。3つのオプションを説明します:

<Image img={redshiftToClickhouse} size="md" alt="Redshift to ClickHouse Migration Options"/>

ClickHouse インスタンスの観点から、以下のいずれかを選択できます:

1. サードパーティの ETL/ELT ツールまたはサービスを使用して ClickHouse にデータを **[PUSH](#push-data-from-redshift-to-clickhouse)** する

2. ClickHouse JDBC Bridge を活用して Redshift からデータを **[PULL](#pull-data-from-redshift-to-clickhouse)** する

3. "Unload してから load" のロジックを使用して S3 オブジェクトストレージを使用した **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** を行う

:::note
このチュートリアルでは Redshift をデータソースとして使用しました。ただし、ここで紹介する移行アプローチは Redshift に限定されるものではなく、互換性のある任意のデータソースに対して同様の手順を導き出すことができます。
:::

## Redshift から ClickHouse へデータをプッシュする {#push-data-from-redshift-to-clickhouse}

プッシュシナリオでは、サードパーティのツールまたはサービス(カスタムコードまたは [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT))を活用して、ClickHouse インスタンスにデータを送信するという考え方です。例えば、[Airbyte](https://www.airbyte.com/) のようなソフトウェアを使用して、Redshift インスタンス(ソースとして)と ClickHouse(宛先として)の間でデータを移動できます([Airbyte の統合ガイド](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)を参照)

<Image img={push} size="md" alt="PUSH Redshift to ClickHouse"/>

### メリット {#pros}

* ETL/ELT ソフトウェアの既存のコネクタカタログを活用できます。
* データを同期状態に保つための組み込み機能(追加/上書き/増分ロジック)。
* データ変換シナリオを有効にします(例えば、[dbt の統合ガイド](/integrations/data-ingestion/etl-tools/dbt/index.md)を参照)。

### デメリット {#cons}

* ETL/ELT インフラストラクチャのセットアップと維持が必要です。
* アーキテクチャにサードパーティ要素を導入し、潜在的なスケーラビリティのボトルネックになる可能性があります。

## Redshift から ClickHouse へデータをプルする {#pull-data-from-redshift-to-clickhouse}

プルシナリオでは、ClickHouse JDBC Bridge を活用して、ClickHouse インスタンスから直接 Redshift クラスタに接続し、`INSERT INTO ... SELECT` クエリを実行するという考え方です:

<Image img={pull} size="md" alt="PULL from Redshift to ClickHouse"/>

### メリット {#pros-1}

* すべての JDBC 互換ツールに汎用的
* ClickHouse 内から複数の外部データソースをクエリできるエレガントなソリューション

### デメリット {#cons-1}

* ClickHouse JDBC Bridge インスタンスが必要であり、潜在的なスケーラビリティのボトルネックになる可能性があります

:::note
Redshift は PostgreSQL をベースにしていますが、ClickHouse では PostgreSQL バージョン 9 以降が必要であり、Redshift API はそれより前のバージョン(8.x)をベースにしているため、ClickHouse PostgreSQL テーブル関数またはテーブルエンジンを使用することはできません。
:::

### チュートリアル {#tutorial}

このオプションを使用するには、ClickHouse JDBC Bridge をセットアップする必要があります。ClickHouse JDBC Bridge は、JDBC 接続を処理し、ClickHouse インスタンスとデータソースの間のプロキシとして機能するスタンドアロンの Java アプリケーションです。このチュートリアルでは、[サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)を事前に投入した Redshift インスタンスを使用しました。

<VerticalStepper headerLevel="h4">

#### ClickHouse JDBC Bridge をデプロイする {#deploy-clickhouse-jdbc-bridge}

ClickHouse JDBC Bridge をデプロイします。詳細については、[外部データソース用 JDBC](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md) のユーザーガイドを参照してください

:::note
ClickHouse Cloud を使用している場合は、ClickHouse JDBC Bridge を別の環境で実行し、[remoteSecure](/sql-reference/table-functions/remote/) 関数を使用して ClickHouse Cloud に接続する必要があります
:::

#### Redshift データソースを設定する {#configure-your-redshift-datasource}

ClickHouse JDBC Bridge 用に Redshift データソースを設定します。例: `/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

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

#### ClickHouse から Redshift インスタンスをクエリする {#query-your-redshift-instance-from-clickhouse}

ClickHouse JDBC Bridge がデプロイされ実行されたら、ClickHouse から Redshift インスタンスをクエリできます

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

#### Redshift から ClickHouse へデータをインポートする {#import-data-from-redshift-to-clickhouse}

以下では、`INSERT INTO ... SELECT` ステートメントを使用してデータをインポートする方法を示します

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

## S3 を使用して Redshift から ClickHouse へデータをピボットする {#pivot-data-from-redshift-to-clickhouse-using-s3}

このシナリオでは、中間ピボットフォーマットで S3 にデータをエクスポートし、2番目のステップで S3 から ClickHouse にデータをロードします。

<Image img={pivot} size="md" alt="PIVOT from Redshift using S3"/>

### メリット {#pros-2}

* Redshift と ClickHouse の両方が強力な S3 統合機能を持っています。
* Redshift の `UNLOAD` コマンドや ClickHouse S3 テーブル関数/テーブルエンジンなどの既存機能を活用します。
* ClickHouse での並列読み取りと高スループット機能により、S3 との間でシームレスにスケールします。
* Apache Parquet のような洗練された圧縮フォーマットを活用できます。

### デメリット {#cons-2}

* プロセスが2ステップ(Redshift からアンロード、次に ClickHouse にロード)になります。

### チュートリアル {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### UNLOAD を使用して S3 バケットにデータをエクスポートする {#export-data-into-an-s3-bucket-using-unload}

Redshift の [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 機能を使用して、既存のプライベート S3 バケットにデータをエクスポートします:

<Image img={s3_1} size="md" alt="UNLOAD from Redshift to S3" background="white"/>

S3 内に生データを含むパートファイルが生成されます

<Image img={s3_2} size="md" alt="Data in S3" background="white"/>

#### ClickHouse でテーブルを作成する {#create-the-table-in-clickhouse}

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

あるいは、ClickHouse は `CREATE TABLE ... EMPTY AS SELECT` を使用してテーブル構造を推測できます:

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

これは、Parquet のようなデータ型に関する情報を含むフォーマットの場合に特によく機能します。

#### S3 ファイルを ClickHouse にロードする {#load-s3-files-into-clickhouse}

`INSERT INTO ... SELECT` ステートメントを使用して S3 ファイルを ClickHouse にロードします:

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
この例では CSV をピボットフォーマットとして使用しました。ただし、本番ワークロードでは、大規模な移行には Apache Parquet を最良のオプションとして推奨します。圧縮機能を備えており、転送時間を短縮しながらストレージコストを節約できます。(デフォルトでは、各行グループは SNAPPY を使用して圧縮されます)。ClickHouse は Parquet のカラム指向を活用して、データ取り込みを高速化します。
:::

</VerticalStepper>