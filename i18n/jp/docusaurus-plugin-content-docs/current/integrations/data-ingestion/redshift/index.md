---
sidebar_label: Redshift
slug: /integrations/redshift
description: RedshiftからClickHouseへのデータ移行
---

import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';


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

[Amazon Redshift](https://aws.amazon.com/redshift/) は、Amazon Web Services の一部である人気のクラウドデータウェアハウジングソリューションです。このガイドでは、RedshiftインスタンスからClickHouseへのデータ移行の異なるアプローチを紹介します。以下の3つの選択肢を扱います。

<img src={redshiftToClickhouse} class="image" alt="RedshiftからClickHouseへの移行オプション"/>

ClickHouseインスタンスの視点からは、以下のいずれかを行うことができます：

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** データをClickHouseにプッシュする、サードパーティのETL/ELTツールまたはサービスを使用して

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** ClickHouse JDBCブリッジを利用してRedshiftからデータをプルする

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** S3オブジェクトストレージを使用した「アンロードしてからロードする」ロジックを利用する

:::note
このチュートリアルではRedshiftをデータソースとして使用しました。ただし、ここで示す移行アプローチはRedshiftに特有のものではなく、互換性のある任意のデータソースに対して同様の手順を適用できます。
:::


## RedshiftからClickHouseへのデータプッシュ {#push-data-from-redshift-to-clickhouse}

プッシュシナリオでは、サードパーティのツールまたはサービス（カスタムコードまたは[ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）を活用して、データをClickHouseインスタンスに送信するアイデアです。たとえば、[Airbyte](https://www.airbyte.com/)というソフトウェアを使用して、Redshiftインスタンス（ソース）とClickHouse（宛先）間でデータを移動できます（[Airbyteの統合ガイドを参照](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)）。


<img src={push} class="image" alt="RedshiftからClickHouseへのPUSH"/>

### メリット {#pros}

* ETL/ELTソフトウェアの既存のコネクタカタログを利用できる。
* データの同期を保つための組み込み機能（追加/上書き/増分ロジック）。
* データ変換のシナリオを有効にする（たとえば、[dbtの統合ガイドを参照](/integrations/data-ingestion/etl-tools/dbt/index.md)）。

### デメリット {#cons}

* ユーザーはETL/ELTインフラを設定および維持する必要がある。
* アーキテクチャにサードパーティの要素を導入するため、スケーラビリティのボトルネックになる可能性がある。


## RedshiftからClickHouseへのデータプル {#pull-data-from-redshift-to-clickhouse}

プルシナリオでは、ClickHouse JDBCブリッジを利用して、ClickHouseインスタンスから直接Redshiftクラスタに接続し、`INSERT INTO ... SELECT`クエリを実行するアイデアです：


<img src={pull} class="image" alt="RedshiftからClickHouseへのPULL"/>

### メリット {#pros-1}

* すべてのJDBC互換ツールに対して一般的である
* ClickHouse内から複数の外部データソースをクエリするためのエレガントなソリューション

### デメリット {#cons-1}

* スケーラビリティのボトルネックになる可能性があるClickHouse JDBCブリッジインスタンスが必要


:::note
RedshiftはPostgreSQLに基づいていますが、ClickHouseのPostgreSQLテーブル関数やテーブルエンジンを使用することはできません。ClickHouseはPostgreSQLのバージョン9以上を必要とし、Redshift APIは以前のバージョン（8.x）に基づいているためです。
:::

### チュートリアル {#tutorial}

このオプションを使用するには、ClickHouse JDBCブリッジを設定する必要があります。ClickHouse JDBCブリッジは、JDBC接続を処理し、ClickHouseインスタンスとデータソースの間のプロキシとして機能するスタンドアロンのJavaアプリケーションです。このチュートリアルでは、[サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)を持つ事前にポピュレートされたRedshiftインスタンスを使用しました。

1. ClickHouse JDBCブリッジをデプロイします。詳細は、[外部データソース用JDBCのユーザーガイド](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)を参照してください。

:::note
ClickHouse Cloudを使用している場合、ClickHouse JDBCブリッジを別の環境で実行し、[remoteSecure](/sql-reference/table-functions/remote/)関数を使用してClickHouse Cloudに接続する必要があります。
:::

2. ClickHouse JDBCブリッジ用のRedshiftデータソースを構成します。たとえば、`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

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

3. ClickHouse JDBCブリッジがデプロイされ、動作している場合、ClickHouseからRedshiftインスタンスをクエリすることができます。

  ```sql
  SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users limit 5')
  ```

  ```response
  クエリID: 1b7de211-c0f6-4117-86a2-276484f9f4c0

  ┌─username─┬─firstname─┬─lastname─┐
  │ PGL08LJI │ Vladimir  │ Humphrey │
  │ XDZ38RDD │ Barry     │ Roy      │
  │ AEB55QTM │ Reagan    │ Hodge    │
  │ OWY35QYB │ Tamekah   │ Juarez   │
  │ MSD36KVR │ Mufutau   │ Watkins  │
  └──────────┴───────────┴──────────┘

  5 行がセットにあります。経過時間: 0.438 秒。
  ```

  ```sql
  SELECT *
  FROM jdbc('redshift', 'select count(*) from sales')
  ```

  ```response
  クエリID: 2d0f957c-8f4e-43b2-a66a-cc48cc96237b

  ┌──count─┐
  │ 172456 │
  └────────┘

  1 行がセットにあります。経過時間: 0.304 秒。
  ```


4. 次に、`INSERT INTO ... SELECT`ステートメントを使用してデータをインポートする方法を示します。

  ```sql
  # 3カラムのテーブル作成
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
  クエリID: c7c4c44b-cdb2-49cf-b319-4e569976ab05

  Ok.

  0 行がセットにあります。経過時間: 0.233 秒。
  ```

  ```sql
  # データインポート
  INSERT INTO users_imported (*) SELECT *
  FROM jdbc('redshift', 'select username, firstname, lastname from users')
  ```

  ```response
  クエリID: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

  Ok.

  0 行がセットにあります。経過時間: 4.498 秒。処理された49.99千行、2.49 MB（11.11千行/s., 554.27 KB/s）
  ```

## S3を使用したRedshiftからClickHouseへのデータピボット {#pivot-data-from-redshift-to-clickhouse-using-s3}

このシナリオでは、S3に中間ピボット形式でデータをエクスポートし、次のステップでS3からClickHouseにデータをロードします。

<img src={pivot} class="image" alt="S3を使用したRedshiftからのPIVOT"/>

### メリット {#pros-2}

* RedshiftとClickHouseの両方が強力なS3統合機能を持っています。
* Redshiftの`UNLOAD`コマンドとClickHouseのS3テーブル関数/テーブルエンジンなどの既存機能を活用できます。
* ClickHouseにおけるS3との間での並列読み取りと高スループット機能により、シームレスにスケール可能です。
* Apache Parquetのような高度で圧縮されたフォーマットを利用できます。

### デメリット {#cons-2}

* プロセスに2つのステップがあります（Redshiftからのアンロード後、ClickHouseへのロード）。

### チュートリアル {#tutorial-1}

1. Redshiftの[UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html)機能を使用して、既存のプライベートS3バケットにデータをエクスポートします：

    <img src={s3_1} class="image" alt="RedshiftからS3へのUNLOAD"/>

    これにより、生データを含む部分ファイルがS3に生成されます。

    <img src={s3_2} class="image" alt="S3のデータ"/>

2. ClickHouseでテーブルを作成します：

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

    あるいは、ClickHouseは`CREATE TABLE ... EMPTY AS SELECT`を使用してテーブル構造を自動推論できる場合もあります：

    ```sql
    CREATE TABLE users
    ENGINE = MergeTree ORDER BY username
    EMPTY AS
    SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    これは、データがデータ型に関する情報を含む形式（パーケットなど）である場合に特に有効です。

3. `INSERT INTO ... SELECT`ステートメントを使用してS3ファイルをClickHouseにロードします：
    ```sql
    INSERT INTO users SELECT *
    FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    ```response
    クエリID: 2e7e219a-6124-461c-8d75-e4f5002c8557

    Ok.

    0 行がセットにあります。経過時間: 0.545 秒。処理された49.99千行、2.34 MB（91.72千行/s., 4.30 MB/s）
    ```

:::note
この例ではCSVをピボット形式として使用しました。ただし、プロダクションワークロードではApache Parquetを大規模な移行に最適なオプションとしてお勧めします。Parquetは圧縮を行い、ストレージコストを削減しつつ転送時間を短縮できます（デフォルトでは、それぞれの行グループはSNAPPYを使用して圧縮されます）。ClickHouseもParquetの列指向を利用してデータ取り込みを加速しています。
:::
