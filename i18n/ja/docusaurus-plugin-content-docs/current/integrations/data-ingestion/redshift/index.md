---
sidebar_label: Redshift
slug: /integrations/redshift
description: RedshiftからClickHouseへのデータ移行
---

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

[Amazon Redshift](https://aws.amazon.com/redshift/) は、Amazon Web Servicesの一部である人気のあるクラウドデータウェアハウジングソリューションです。このガイドでは、RedshiftインスタンスからClickHouseにデータを移行するためのさまざまなアプローチを紹介します。以下の3つのオプションについて説明します：

<img src={require('./images/redshift-to-clickhouse.png').default} class="image" alt="RedshiftからClickHouseへの移行オプション"/>

ClickHouseインスタンスの観点から、以下のいずれかを選択できます：

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** データをサードパーティのETL/ELTツールまたはサービスを使用してClickHouseに送信します。

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** ClickHouse JDBCブリッジを活用してRedshiftからデータを取得します。

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** S3オブジェクトストレージを使用して「アンロードしてロード」するロジックを適用します。

:::note
このチュートリアルでは、Redshiftをデータソースとして使用しました。ただし、ここで紹介する移行アプローチはRedshiftに特有のものでなく、互換性のあるデータソースについても同様の手順が適用できます。
:::

## RedshiftからClickHouseにデータをプッシュ {#push-data-from-redshift-to-clickhouse}

プッシュシナリオでは、サードパーティのツールまたはサービス（カスタムコードまたは[ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）を活用して、データをClickHouseインスタンスに送信することを目指します。例えば、[Airbyte](https://www.airbyte.com/)のようなソフトウェアを使用して、Redshiftインスタンス（ソース）とClickHouse（デスティネーション）間でデータを移動できます（[Airbyteの統合ガイドを参照](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)）。

<img src={require('./images/push.png').default} class="image" alt="RedshiftからClickHouseへのPUSH"/>

### 利点 {#pros}

* ETL/ELTソフトウェアの既存のコネクタカタログを活用できます。
* データを同期させるためのビルトイン機能（追加/上書き/インクリメントロジック）があります。
* データ変換シナリオを有効にします（例えば、[dbtの統合ガイドを参照](/integrations/data-ingestion/etl-tools/dbt/index.md)）。

### 欠点 {#cons}

* ユーザーはETL/ELTインフラストラクチャをセットアップおよび維持する必要があります。
* アーキテクチャにサードパーティの要素を導入し、潜在的なスケーラビリティのボトルネックになる可能性があります。

## RedshiftからClickHouseにデータをプル {#pull-data-from-redshift-to-clickhouse}

プルシナリオでは、ClickHouse JDBCブリッジを活用して、ClickHouseインスタンスから直接Redshiftクラスターに接続し、`INSERT INTO ... SELECT`クエリを実行します：

<img src={require('./images/pull.png').default} class="image" alt="RedshiftからClickHouseへのPULL"/>

### 利点 {#pros-1}

* すべてのJDBC互換ツールに一般的です。
* ClickHouse内から複数の外部データソースをクエリするためのエレガントなソリューションです。

### 欠点 {#cons-1}

* スケーラビリティのボトルネックになる可能性があるClickHouse JDBCブリッジインスタンスが必要です。

:::note
RedshiftはPostgreSQLに基づいていますが、ClickHouseはPostgreSQLバージョン9以上を必要とし、Redshift APIは以前のバージョン（8.x）に基づいているため、ClickHouse PostgreSQLテーブル関数またはテーブルエンジンを使用することはできません。
:::

### チュートリアル {#tutorial}

このオプションを使用するには、ClickHouse JDBCブリッジをセットアップする必要があります。ClickHouse JDBCブリッジは、JDBC接続を処理し、ClickHouseインスタンスとデータソース間のプロキシとして機能するスタンドアロンのJavaアプリケーションです。このチュートリアルでは、[サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)を持つ、あらかじめデータが用意されたRedshiftインスタンスを使用しました。

1. ClickHouse JDBCブリッジをデプロイします。詳細については、[外部データソースのJDBCガイド](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)を参照してください。

:::note
ClickHouse Cloudを使用している場合は、ClickHouse JDBCブリッジを別の環境で実行し、[remoteSecure](/sql-reference/table-functions/remote/)関数を使用してClickHouse Cloudに接続する必要があります。
:::

2. ClickHouse JDBCブリッジ用にRedshiftデータソースを構成します。例えば、`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json`：

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

3. ClickHouse JDBCブリッジがデプロイされ、実行中になったら、ClickHouseからRedshiftインスタンスをクエリし始めることができます。

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

  5 行の結果。経過時間: 0.438 秒。
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

  1 行の結果。経過時間: 0.304 秒。
  ```

4. 次に、`INSERT INTO ... SELECT`ステートメントを使用してデータをインポートする方法を示します。

  ```sql
  # 3つのカラムを持つテーブルの作成
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

  0 行の結果。経過時間: 0.233 秒。
  ```

  ```sql
  # データのインポート
  INSERT INTO users_imported (*) SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users')
  ```

  ```response
  Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

  Ok.

  0 行の結果。経過時間: 4.498 秒。処理した行数: 49.99千行、サイズ: 2.49 MB (11.11千行/s., 554.27 KB/s.)
  ```

## S3を使用してRedshiftからClickHouseにデータをピボット {#pivot-data-from-redshift-to-clickhouse-using-s3}

このシナリオでは、中間ピボット形式でデータをS3にエクスポートし、次のステップでS3からClickHouseにデータをロードします。

<img src={require('./images/pivot.png').default} class="image" alt="S3を使ったRedshiftからのピボット"/>

### 利点 {#pros-2}

* RedshiftとClickHouseの両方が強力なS3統合機能を持っています。
* Redshiftの`UNLOAD`コマンドやClickHouseのS3テーブル関数/テーブルエンジンなどの既存の機能を活用します。
* ClickHouse内でのS3からの並行読み取りと高いスループット能力のおかげでシームレスにスケールします。
* Apache Parquetのような洗練された圧縮形式を利用できます。

### 欠点 {#cons-2}

* プロセスの2つのステップ（RedshiftからアンロードしてClickHouseにロード）があります。

### チュートリアル {#tutorial-1}

1. Redshiftの[UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html)機能を使用して、既存のプライベートS3バケットにデータをエクスポートします：

    <img src={require('./images/s3-1.png').default} class="image" alt="S3へのRedshiftからのUNLOAD"/>

    これにより、S3に生データを含むパートファイルが生成されます。

    <img src={require('./images/s3-2.png').default} class="image" alt="S3のデータ"/>

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

    あるいは、`CREATE TABLE ... EMPTY AS SELECT`を使用してClickHouseがテーブル構造を推測することもできます：

    ```sql
    CREATE TABLE users
    ENGINE = MergeTree ORDER BY username
    EMPTY AS
    SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    これは、データがデータ型に関する情報を含む形式（Parquetなど）の場合に特に効果的です。

3. S3ファイルをClickHouseに`INSERT INTO ... SELECT`ステートメントを使用してロードします：
    ```sql
    INSERT INTO users SELECT *
    FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    ```response
    Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

    Ok.

    0 行の結果。経過時間: 0.545 秒。処理した行数: 49.99千行、サイズ: 2.34 MB (91.72千行/s., 4.30 MB/s.)
    ```

:::note
この例ではCSVをピボット形式として使用しました。ただし、本番のワークロードには、Apache Parquetが大型の移行に最適なオプションとして推奨されます。これは、圧縮が施され、ストレージコストを削減しつつ転送時間を短縮することができます。（デフォルトでは、各行グループはSNAPPYを使用して圧縮されます）。ClickHouseは、データ取り込みを高速化するためにParquetの列指向を活用しています。
:::
