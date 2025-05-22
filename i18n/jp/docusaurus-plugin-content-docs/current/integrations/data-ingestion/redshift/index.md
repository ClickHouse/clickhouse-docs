---
'sidebar_label': 'Redshift'
'slug': '/integrations/redshift'
'description': 'Redshift から ClickHouse へのデータ移行'
'title': 'Redshift から ClickHouse へのデータ移行'
---

import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';


# Redshift から ClickHouse へのデータ移行

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

- ブログ: [分析ワークロードの最適化: Redshift と ClickHouse の比較](https://clickhouse.com/blog/redshift-vs-clickhouse-comparison)

## 概要 {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) は、Amazon Web Services の一部である人気のクラウドデータウェアハウジングソリューションです。このガイドでは、Redshift インスタンスから ClickHouse へのデータ移行のためのさまざまなアプローチを紹介します。以下の三つのオプションをカバーします：

<Image img={redshiftToClickhouse} size="lg" alt="Redshift to ClickHouse Migration Options" background="white"/>

ClickHouse インスタンスの観点からは、次のいずれかを行うことができます：

1. **[PUSH](#push-data-from-redshift-to-clickhouse)** サードパーティの ETL/ELT ツールまたはサービスを使用して ClickHouse にデータを送信する

2. **[PULL](#pull-data-from-redshift-to-clickhouse)** ClickHouse JDBC ブリッジを活用して Redshift からデータを取得する

3. **[PIVOT](#pivot-data-from-redshift-to-clickhouse-using-s3)** S3 オブジェクトストレージを使用して「アンロード後にロード」ロジックを使用する

:::note
このチュートリアルでは Redshift をデータソースとして使用しました。ただし、ここで説明する移行アプローチは Redshift に限定されるものではなく、互換性のあるデータソースに対して同様の手順を導き出すことができます。
:::


## Redshift から ClickHouse へのデータプッシュ {#push-data-from-redshift-to-clickhouse}

プッシュシナリオでは、サードパーティのツールまたはサービス（カスタムコードまたは [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT) ソフトウェア）を活用して、データを ClickHouse インスタンスに送信することを目的としています。例えば、[Airbyte](https://www.airbyte.com/) のようなソフトウェアを使用して、Redshift インスタンス（ソース）と ClickHouse（デスティネーション）間でデータを移動することができます（[Airbyte の統合ガイドを参照してください](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)）。

<Image img={push} size="lg" alt="PUSH Redshift to ClickHouse" background="white"/>

### 利点 {#pros}

* ETL/ELT ソフトウェアのコネクタの既存カタログを活用できる。
* データを同期するための組み込み機能（追加/上書き/インクリメントロジック）。
* データ変換シナリオを可能にする（例えば、[dbt の統合ガイドを参照](/integrations/data-ingestion/etl-tools/dbt/index.md)）。

### 欠点 {#cons}

* ユーザーは ETL/ELT インフラを設定および維持する必要がある。
* アーキテクチャにサードパーティの要素を導入し、潜在的なスケーラビリティのボトルネックになる可能性がある。


## Redshift から ClickHouse へのデータプル {#pull-data-from-redshift-to-clickhouse}

プルシナリオでは、ClickHouse JDBC ブリッジを活用して、ClickHouse インスタンスから直接 Redshift クラスターに接続し、`INSERT INTO ... SELECT` クエリを実行します：

<Image img={pull} size="lg" alt="PULL from Redshift to ClickHouse" background="white"/>

### 利点 {#pros-1}

* すべての JDBC 互換ツールに一般的
* ClickHouse 内から複数の外部データソースをクエリするための洗練されたソリューション

### 欠点 {#cons-1}

* スケーラビリティのボトルネックになる可能性のある ClickHouse JDBC ブリッジインスタンスを必要とする


:::note
Redshift は PostgreSQL に基づいていますが、ClickHouse PostgreSQL テーブル関数やテーブルエンジンを使用することはできません。なぜなら、ClickHouse は PostgreSQL バージョン 9 以上を要求し、Redshift API は古いバージョン（8.x）に基づいているからです。
:::

### チュートリアル {#tutorial}

このオプションを使用するには、ClickHouse JDBC ブリッジを設定する必要があります。ClickHouse JDBC ブリッジは、JDBC 接続を処理し、ClickHouse インスタンスとデータソースの間のプロキシとして機能するスタンドアロンの Java アプリケーションです。このチュートリアルでは、[サンプルデータベース](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)を持つ事前に設定された Redshift インスタンスを使用しました。

1. ClickHouse JDBC ブリッジを展開します。詳細については、[外部データソース用の JDBC のユーザーガイド](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)を参照してください。

:::note
ClickHouse Cloud を使用している場合は、別の環境で ClickHouse JDBC ブリッジを実行し、[remoteSecure](/sql-reference/table-functions/remote/) 関数を使用して ClickHouse Cloud に接続する必要があります。
:::

2. ClickHouse JDBC ブリッジの Redshift データソースを構成します。例えば、`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

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

3. ClickHouse JDBC ブリッジが展開されて実行されている場合、ClickHouse から Redshift インスタンスをクエリし始めることができます。

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


4. 次に、`INSERT INTO ... SELECT` ステートメントを使用してデータをインポートします。

  ```sql
  # 3 カラムの TABLE CREATION
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

## S3 を使用して Redshift から ClickHouse へのデータピボット {#pivot-data-from-redshift-to-clickhouse-using-s3}

このシナリオでは、データを中間ピボット形式で S3 にエクスポートし、次のステップで S3 から ClickHouse にデータをロードします。

<Image img={pivot} size="lg" alt="PIVOT from Redshift using S3" background="white"/>

### 利点 {#pros-2}

* Redshift と ClickHouse の両方が強力な S3 統合機能を持っている。
* Redshift の `UNLOAD` コマンドや ClickHouse S3 テーブル関数 / テーブルエンジンの既存機能を利用。
* ClickHouse の S3 への並列読み取りと高スループット機能によりシームレスにスケールできます。
* Apache Parquet のような洗練された圧縮フォーマットを活用できる。

### 欠点 {#cons-2}

* プロセスに 2 ステップ（Redshift からアンロードして ClickHouse へロード）が必要です。

### チュートリアル {#tutorial-1}

1. Redshift の [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 機能を使用して、既存のプライベート S3 バケットにデータをエクスポートします：

    <Image img={s3_1} size="md" alt="UNLOAD from Redshift to S3" background="white"/>

    これにより、S3 に生データを含むパートファイルが生成されます。

    <Image img={s3_2} size="md" alt="Data in S3" background="white"/>

2. ClickHouse にテーブルを作成します：

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

    または、ClickHouse は `CREATE TABLE ... EMPTY AS SELECT` を使用してテーブル構造を推測することができます：

    ```sql
    CREATE TABLE users
    ENGINE = MergeTree ORDER BY username
    EMPTY AS
    SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
    ```

    これは特にデータがデータ型に関する情報を含むフォーマット（例: Parquet）である場合に効果的です。

3. S3 ファイルを ClickHouse にロードします。`INSERT INTO ... SELECT` ステートメントを使用します：
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
この例では、CSV をピボットフォーマットとして使用しました。ただし、生産ワークロードでは、圧縮とストレージコストを削減しつつトランスファー時間を短縮できるため、大規模な移行には Apache Parquet を最良の選択肢としてお勧めします。（デフォルトでは、各行グループは SNAPPY を使用して圧縮されています。）ClickHouse は Parquet の列指向性を活用してデータの取り込みを加速します。
:::
