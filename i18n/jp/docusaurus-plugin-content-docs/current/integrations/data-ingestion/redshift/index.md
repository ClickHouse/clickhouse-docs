---
sidebar_label: 'Redshift'
slug: /integrations/redshift
description: 'RedshiftからClickHouseへのデータ移行'
title: 'RedshiftからClickHouseへのデータ移行'
---

import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';


# RedshiftからClickHouseへのデータ移行

## 関連コンテンツ {#related-content}

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/SyhZmS5ZZaA"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

- ブログ: [分析ワークロードの最適化: RedshiftとClickHouseの比較](https://clickhouse.com/blog/redshift-vs-clickhouse-comparison)

## はじめに {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) は、Amazon Web Servicesの提供する人気のあるクラウドデータウェアハウジングソリューションです。このガイドでは、RedshiftインスタンスからClickHouseへのデータ移行のさまざまなアプローチを提示します。以下の3つのオプションについて説明します。

<Image img={redshiftToClickhouse} size="lg" alt="RedshiftからClickHouseへの移行オプション" background="white"/>

ClickHouseインスタンスの観点からは、次のいずれかの方法を選択できます：

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** データをサードパーティのETL/ELTツールやサービスを使用してClickHouseに送信する

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** ClickHouse JDBCブリッジを利用してRedshiftからデータを取得する

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** "Unload then load" ロジックを使用してS3オブジェクトストレージを使用する

:::note
このチュートリアルでは、Redshiftをデータソースとして使用しました。ただし、ここで示されている移行アプローチはRedshiftに特有ではなく、互換性のあるデータソースに対しても同様の手順を適用できます。
:::


## RedshiftからClickHouseへデータをPUSHする {#push-data-from-redshift-to-clickhouse}

PUSHのシナリオでは、サードパーティツールまたはサービス（カスタムコードまたは[ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）を利用してデータをClickHouseインスタンスに送信することを考えます。たとえば、[Airbyte](https://www.airbyte.com/)のようなソフトウェアを使用して、Redshiftインスタンス（ソース）とClickHouse（宛先）間でデータを移動することができます（[Airbyteの統合ガイドを参照](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)）。

<Image img={push} size="lg" alt="RedshiftからClickHouseへのPUSH" background="white"/>

### 利点 {#pros}

* ETL/ELTソフトウェアの既存のコネクタカタログを利用できます。
* データの同期を維持するための組み込み機能（追加/上書き/増分ロジック）があります。
* データ変換シナリオを可能にします（例えば、[dbtの統合ガイドを参照](/integrations/data-ingestion/etl-tools/dbt/index.md)）。

### 欠点 {#cons}

* ユーザーはETL/ELTインフラをセットアップおよび維持する必要があります。
* アーキテクチャにサードパーティの要素を追加すると、潜在的なスケーラビリティのボトルネックになる可能性があります。


## RedshiftからClickHouseへデータをPULLする {#pull-data-from-redshift-to-clickhouse}

PULLのシナリオでは、ClickHouse JDBCブリッジを利用して、ClickHouseインスタンスからRedshiftクラスターに直接接続し、`INSERT INTO ... SELECT` クエリを実行することを考えます：

<Image img={pull} size="lg" alt="RedshiftからClickHouseへのPULL" background="white"/>

### 利点 {#pros-1}

* すべてのJDBC互換ツールに対応
* ClickHouse内から複数の外部データソースをクエリするためのエレガントなソリューション

### 欠点 {#cons-1}

* ClickHouse JDBCブリッジインスタンスが必要で、これが潜在的なスケーラビリティのボトルネックになる可能性があります


:::note
RedshiftはPostgreSQLを基にしていますが、ClickHouseのPostgreSQLテーブル関数またはテーブルエンジンを使用することはできません。なぜなら、ClickHouseはPostgreSQLバージョン9以上を必要とし、Redshift APIは以前のバージョン（8.x）に基づいているからです。
:::

### チュートリアル {#tutorial}

このオプションを使用するには、ClickHouse JDBCブリッジをセットアップする必要があります。ClickHouse JDBCブリッジは、JDBC接続を処理し、ClickHouseインスタンスとデータソースとの間のプロキシとして機能するスタンドアロンのJavaアプリケーションです。このチュートリアルでは、[サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)を持つ事前に構成されたRedshiftインスタンスを使用しました。

1. ClickHouse JDBCブリッジをデプロイします。詳細については、[外部データソースのためのJDBCに関するユーザーガイド](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)を参照してください。

:::note
ClickHouse Cloudを使用している場合、ClickHouse JDBCブリッジを別の環境で実行し、[remoteSecure](/sql-reference/table-functions/remote/)機能を使用してClickHouse Cloudに接続する必要があります。
:::

2. RedshiftデータソースをClickHouse JDBCブリッジに設定します。たとえば、`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

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

3. ClickHouse JDBCブリッジをデプロイして実行している場合、ClickHouseからRedshiftインスタンスをクエリし始めることができます

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

4. 次に、`INSERT INTO ... SELECT` ステートメントを使用してデータをインポートする方法を示します。

  ```sql
  # 3カラムのあるテーブル作成
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
  # データのインポート
  INSERT INTO users_imported (*) SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users')
  ```

  ```response
  Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

  Ok.

  0 rows in set. Elapsed: 4.498 sec. Processed 49.99 thousand rows, 2.49 MB (11.11 thousand rows/s., 554.27 KB/s.)
  ```

## S3を使用してRedshiftからClickHouseへデータをPIVOTする {#pivot-data-from-redshift-to-clickhouse-using-s3}

このシナリオでは、S3に中間ピボット形式でデータをエクスポートし、次のステップで、そのデータをS3からClickHouseに読み込みます。

<Image img={pivot} size="lg" alt="S3を使用してRedshiftからPIVOT" background="white"/>

### 利点 {#pros-2}

* RedshiftとClickHouseの両方に強力なS3統合機能があります。
* Redshiftの`UNLOAD`コマンドやClickHouseのS3テーブル関数/テーブルエンジンなど、既存の機能を活用します。
* ClickHouseからS3への並列読み込みと高スループット機能により、シームレスにスケールします。
* Apache Parquetのような高度で圧縮されたフォーマットを利用できます。

### 欠点 {#cons-2}

* プロセスに2つのステップが必要（RedshiftからのアンロードとClickHouseへのロード）。

### チュートリアル {#tutorial-1}

1. Redshiftの[UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html)機能を使用して、既存のプライベートS3バケットにデータをエクスポートします：

    <Image img={s3_1} size="md" alt="S3へのRedshiftからのUNLOAD" background="white"/>

    これにより、S3に生データを含むパーツファイルが生成されます。

    <Image img={s3_2} size="md" alt="S3内のデータ" background="white"/>

2. ClickHouseにテーブルを作成します：

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

    または、ClickHouseは`CREATE TABLE ... EMPTY AS SELECT`を使用してテーブル構造を推測しようとすることができます：

    ```sql
    CREATE TABLE users
    ENGINE = MergeTree ORDER BY username
    EMPTY AS
    SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    データがデータ型に関する情報を含むフォーマット（Parquetなど）にある場合、特によく機能します。

3. S3のファイルを`INSERT INTO ... SELECT` ステートメントを使用してClickHouseに読み込みます：
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
この例ではピボットフォーマットとしてCSVを使用しました。ただし、製品ワークロードの場合、大規模な移行に最適なオプションとしてApache Parquetを推奨します。なぜなら、圧縮機能があり、ストレージコストを削減しつつ転送時間を短縮できます（デフォルトで、各行グループはSNAPPYを使用して圧縮されます）。ClickHouseはまた、Parquetの列指向を活用してデータの取り込みを加速します。
:::
