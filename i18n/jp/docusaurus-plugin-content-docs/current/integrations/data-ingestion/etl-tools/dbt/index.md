---
'sidebar_label': 'dbt'
'slug': '/integrations/dbt'
'sidebar_position': 1
'description': 'ユーザーはdbtを使用してClickHouseでデータを変換およびモデル化することができます'
'title': 'dbt と ClickHouse の統合'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dbt_01 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_01.png';
import dbt_02 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_02.png';
import dbt_03 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_03.png';
import dbt_04 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_04.png';
import dbt_05 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_05.png';
import dbt_06 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_06.png';
import dbt_07 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_07.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# dbtとClickHouseの統合

<ClickHouseSupportedBadge/>

**dbt** (data build tool) は、分析エンジニアがデータウェアハウス内のデータを単純にSELECT文を記述することで変換できるようにします。dbtはこれらのSELECT文をデータベース内のテーブルやビューの形でオブジェクトにマテリアライズする作業を行い、[Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform)のTを実行します。ユーザーはSELECT文で定義されたモデルを作成できます。

dbt内では、これらのモデルは相互参照され、層状に構成されることで、より高レベルな概念を構築できるようになります。モデルを接続するために必要なボイラープレートSQLは自動的に生成されます。さらに、dbtはモデル間の依存関係を特定し、有向非循環グラフ（DAG）を使用してそれらが適切な順序で作成されることを保証します。

dbtは[ClickHouseサポートプラグイン](https://github.com/ClickHouse/dbt-clickhouse)を通じてClickHouseと互換性があります。公開されているIMDBデータセットに基づく簡単な例を使用して、ClickHouseとの接続プロセスを説明します。また、現在のコネクタのいくつかの制限についても説明します。

<TOCInline toc={toc}  maxHeadingLevel={2} />
## 概念 {#concepts}

dbtはモデルの概念を導入します。これは、複数のテーブルを結合する可能性のあるSQL文として定義されます。モデルはさまざまな方法で「マテリアライズ」できます。マテリアライゼーションは、モデルのSELECTクエリのビルド戦略を表します。マテリアライゼーションの背後にあるコードは、SELECTクエリをラップするボイラープレートSQLです。これにより、新しいリレーションを作成または既存のリレーションを更新します。

dbtは4種類のマテリアライゼーションを提供します：

* **view** (デフォルト): モデルはデータベース内のビューとして構築されます。
* **table**: モデルはデータベース内のテーブルとして構築されます。
* **ephemeral**: モデルはデータベース内に直接構築されず、依存するモデルに共通テーブル式として取り込まれます。
* **incremental**: モデルは最初にテーブルとしてマテリアライズされ、次回の実行ではdbtが新しい行を挿入し、テーブル内の変更された行を更新します。

これらのモデルが基になるデータが変更された場合の更新方法を定義する追加の構文と句があります。dbtは、パフォーマンスが問題になるまでviewマテリアライゼーションから始めることを一般的に推奨します。tableマテリアライゼーションは、モデルのクエリの結果をテーブルとしてキャプチャすることにより、クエリのパフォーマンスを改善しますが、ストレージが増加するコストが伴います。incrementalアプローチは、この概念をさらに発展させて、基になるデータに対する後続の更新をターゲットテーブルにキャプチャできるようにします。

[ 現在のプラグイン](https://github.com/silentsokolov/dbt-clickhouse)は、**view**、**table**、**ephemeral**および**incremental**マテリアライゼーションをサポートしています。また、dbtの[snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)と[seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)もサポートしており、これらについてもこのガイドで探求します。

以下のガイドでは、ClickHouseのインスタンスが利用可能であることを前提とします。
## dbtとClickHouseプラグインのセットアップ {#setup-of-dbt-and-the-clickhouse-plugin}
### dbt {#dbt}

以下の例ではdbt CLIの使用を前提としています。ユーザーは[dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview)も考慮するかもしれません。これにより、ユーザーはプロジェクトを編集したり実行するためのWebベースの統合開発環境（IDE）が提供されます。

dbtはCLIインストールのためのいくつかのオプションを提供します。以下の[ここ](https://docs.getdbt.com/dbt-cli/install/overview)に記載されている手順に従ってください。この段階では、dbt-coreのみをインストールします。`pip`の使用を推奨します。

```bash
pip install dbt-core
```

**重要: 以下の手順は、Python 3.9でテストされています。**
### ClickHouseプラグイン {#clickhouse-plugin}

dbt ClickHouseプラグインをインストールします：

```bash
pip install dbt-clickhouse
```
### ClickHouseの準備 {#prepare-clickhouse}

dbtは高度にリレーショナルなデータのモデリングに優れています。例の目的のために、次のリレーショナルスキーマを持つ小さなIMDBデータセットを提供します。このデータセットは[relational dataset repository](https://relational.fit.cvut.cz/dataset/IMDb)から派生しています。これはdbtで使用される一般的なスキーマと比較して簡単なものですが、管理可能なサンプルを表しています：

<Image img={dbt_01} size="lg" alt="IMDB table schema" />

これらのテーブルのサブセットを使用します。次のテーブルを作成してください：

```sql
CREATE DATABASE imdb;

CREATE TABLE imdb.actors
(
    id         UInt32,
    first_name String,
    last_name  String,
    gender     FixedString(1)
) ENGINE = MergeTree ORDER BY (id, first_name, last_name, gender);

CREATE TABLE imdb.directors
(
    id         UInt32,
    first_name String,
    last_name  String
) ENGINE = MergeTree ORDER BY (id, first_name, last_name);

CREATE TABLE imdb.genres
(
    movie_id UInt32,
    genre    String
) ENGINE = MergeTree ORDER BY (movie_id, genre);

CREATE TABLE imdb.movie_directors
(
    director_id UInt32,
    movie_id    UInt64
) ENGINE = MergeTree ORDER BY (director_id, movie_id);

CREATE TABLE imdb.movies
(
    id   UInt32,
    name String,
    year UInt32,
    rank Float32 DEFAULT 0
) ENGINE = MergeTree ORDER BY (id, name, year);

CREATE TABLE imdb.roles
(
    actor_id   UInt32,
    movie_id   UInt32,
    role       String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree ORDER BY (actor_id, movie_id);
```

:::note
テーブル`roles`のカラム`created_at`は、デフォルトで`now()`の値になります。後で、増分更新を特定するために使用します - [Incremental Models](#creating-an-incremental-materialization)を参照してください。
:::

`s3`関数を使用して、公開エンドポイントからソースデータを読み取り、データを挿入します。以下のコマンドを実行してテーブルにデータを入力します：

```sql
INSERT INTO imdb.actors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_actors.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.directors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_directors.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.genres
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies_genres.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.movie_directors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies_directors.tsv.gz',
        'TSVWithNames');

INSERT INTO imdb.movies
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.roles(actor_id, movie_id, role)
SELECT actor_id, movie_id, role
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_roles.tsv.gz',
'TSVWithNames');
```

これらの実行には帯域幅によって異なる場合がありますが、各実行は数秒で完了するはずです。次のクエリを実行して、各俳優の概要を計算し、最も映画に出演した順に並び替えて、データが正常にロードされていることを確認します：

```sql
SELECT id,
       any(actor_name)          as name,
       uniqExact(movie_id)    as num_movies,
       avg(rank)                as avg_rank,
       uniqExact(genre)         as unique_genres,
       uniqExact(director_name) as uniq_directors,
       max(created_at)          as updated_at
FROM (
         SELECT imdb.actors.id  as id,
                concat(imdb.actors.first_name, ' ', imdb.actors.last_name)  as actor_name,
                imdb.movies.id as movie_id,
                imdb.movies.rank as rank,
                genre,
                concat(imdb.directors.first_name, ' ', imdb.directors.last_name) as director_name,
                created_at
         FROM imdb.actors
                  JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
                  LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
                  LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
                  LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
                  LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
         )
GROUP BY id
ORDER BY num_movies DESC
LIMIT 5;
```

応答は次のようになります：

```response
+------+------------+----------+------------------+-------------+--------------+-------------------+
|id    |name        |num_movies|avg_rank          |unique_genres|uniq_directors|updated_at         |
+------+------------+----------+------------------+-------------+--------------+-------------------+
|45332 |Mel Blanc   |832       |6.175853582979779 |18           |84            |2022-04-26 14:01:45|
|621468|Bess Flowers|659       |5.57727638854796  |19           |293           |2022-04-26 14:01:46|
|372839|Lee Phelps  |527       |5.032976449684617 |18           |261           |2022-04-26 14:01:46|
|283127|Tom London  |525       |2.8721716524875673|17           |203           |2022-04-26 14:01:46|
|356804|Bud Osborne |515       |2.0389507108727773|15           |149           |2022-04-26 14:01:46|
+------+------------+----------+------------------+-------------+--------------+-------------------+
```

後のガイドでは、このクエリをモデルに変換し、ClickHouseでdbtビューおよびテーブルとしてマテリアライズします。
## ClickHouseへの接続 {#connecting-to-clickhouse}

1. dbtプロジェクトを作成します。この場合、ソースである`imdb`にちなんで名前を付けます。プロンプトが表示されたら、データベースソースとして`clickhouse`を選択します。

    ```bash
    clickhouse-user@clickhouse:~$ dbt init imdb

    16:52:40  Running with dbt=1.1.0
    Which database would you like to use?
    [1] clickhouse

    (Don't see the one you want? https://docs.getdbt.com/docs/available-adapters)

    Enter a number: 1
    16:53:21  No sample profile found for clickhouse.
    16:53:21
    Your new dbt project "imdb" was created!

    For more information on how to configure the profiles.yml file,
    please consult the dbt documentation here:

    https://docs.getdbt.com/docs/configure-your-profile
    ```

2. プロジェクトフォルダに`cd`します：

    ```bash
    cd imdb
    ```

3. この時点で、好みのテキストエディタが必要です。以下の例では人気のあるVS Codeを使用します。IMDBディレクトリを開くと、一連のymlおよびsqlファイルが表示されるはずです：

    <Image img={dbt_02} size="lg" alt="New dbt project" />

4. `dbt_project.yml`ファイルを更新して、最初のモデル- `actor_summary`を指定し、プロファイルを`clickhouse_imdb`に設定します。

    <Image img={dbt_03} size="lg" alt="dbt profile" />

    <Image img={dbt_04} size="lg" alt="dbt profile" />

5. 次に、dbtにClickHouseインスタンスの接続詳細を提供する必要があります。次の内容を`~/.dbt/profiles.yml`に追加します。

    ```yml
    clickhouse_imdb:
      target: dev
      outputs:
        dev:
          type: clickhouse
          schema: imdb_dbt
          host: localhost
          port: 8123
          user: default
          password: ''
          secure: False
    ```

    ユーザーとパスワードを修正する必要があることに注意してください。追加の設定は[こちら](https://github.com/silentsokolov/dbt-clickhouse#example-profile)に文書化されています。

6. IMDBディレクトリから`dbt debug`コマンドを実行して、dbtがClickHouseに接続できるかどうかを確認します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt debug
    17:33:53  Running with dbt=1.1.0
    dbt version: 1.1.0
    python version: 3.10.1
    python path: /home/dale/.pyenv/versions/3.10.1/bin/python3.10
    os info: Linux-5.13.0-10039-tuxedo-x86_64-with-glibc2.31
    Using profiles.yml file at /home/dale/.dbt/profiles.yml
    Using dbt_project.yml file at /opt/dbt/imdb/dbt_project.yml

    Configuration:
    profiles.yml file [OK found and valid]
    dbt_project.yml file [OK found and valid]

    Required dependencies:
    - git [OK found]

    Connection:
    host: localhost
    port: 8123
    user: default
    schema: imdb_dbt
    secure: False
    verify: False
    Connection test: [OK connection ok]

    All checks passed!
    ```

    応答に`Connection test: [OK connection ok]`が含まれていることを確認し、接続が成功したことを示します。
## 簡単なビューのマテリアライゼーションの作成 {#creating-a-simple-view-materialization}

ビューのマテリアライゼーションを使用すると、モデルは毎回の実行でビューとして再構築されます。これはClickHouseでの`CREATE VIEW AS`文を通じて行われます。これにより、データの追加ストレージは必要ありませんが、テーブルマテリアライゼーションよりもクエリが遅くなります。

1. `imdb`フォルダから`models/example`ディレクトリを削除します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. `models`フォルダ内の`actors`に新しいファイルを作成します。ここでは、それぞれの俳優モデルを表すファイルを作成します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. `models/actors`フォルダに`schema.yml`および`actor_summary.sql`のファイルを作成します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```
    ファイル`schema.yml`は、私たちのテーブルを定義します。これらは後でマクロで使用可能になります。`models/actors/schema.yml`を編集して次の内容を含めます：
    ```yml
    version: 2

    sources:
    - name: imdb
      tables:
      - name: directors
      - name: actors
      - name: roles
      - name: movies
      - name: genres
      - name: movie_directors
    ```
    `actors_summary.sql`は実際のモデルを定義します。設定関数の中で、モデルがClickHouseのビューとしてマテリアライズされるようリクエストも行います。我々のテーブルは、`source`関数を介して`schema.yml`ファイルから参照されます。例えば、`source('imdb', 'movies')`は`imdb`データベース内の`movies`テーブルを指します。`models/actors/actors_summary.sql`を編集して次の内容を含めます：
    ```sql
    {{ config(materialized='view') }}

    with actor_summary as (
    SELECT id,
        any(actor_name) as name,
        uniqExact(movie_id)    as num_movies,
        avg(rank)                as avg_rank,
        uniqExact(genre)         as genres,
        uniqExact(director_name) as directors,
        max(created_at) as updated_at
    FROM (
            SELECT {{ source('imdb', 'actors') }}.id as id,
                    concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
                    {{ source('imdb', 'movies') }}.id as movie_id,
                    {{ source('imdb', 'movies') }}.rank as rank,
                    genre,
                    concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
                    created_at
            FROM {{ source('imdb', 'actors') }}
                        JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
                        LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
                        LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
                        LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
                        LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
            )
    GROUP BY id
    )

    select *
    from actor_summary
    ```
    最終的なactor_summaryに`updated_at`カラムを含めていることに注意してください。これは後で増分マテリアライゼーションに使用します。

4. `imdb`ディレクトリから、`dbt run`コマンドを実行します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:05:35  Running with dbt=1.1.0
    15:05:35  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
    15:05:35
    15:05:36  Concurrency: 1 threads (target='dev')
    15:05:36
    15:05:36  1 of 1 START view model imdb_dbt.actor_summary.................................. [RUN]
    15:05:37  1 of 1 OK created view model imdb_dbt.actor_summary............................. [OK in 1.00s]
    15:05:37
    15:05:37  Finished running 1 view model in 1.97s.
    15:05:37
    15:05:37  Completed successfully
    15:05:37
    15:05:37  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

5. dbtはリクエストされた通りにモデルをClickHouseのビューとして表示します。これで、このビューを直接クエリできます。このビューは`~/.dbt/profiles.yml`の`clickhouse_imdb`プロファイルのスキーマパラメータにより決定される`imdb_dbt`データベースに作成されます。

    ```sql
    SHOW DATABASES;
    ```

    ```response
    +------------------+
    |name              |
    +------------------+
    |INFORMATION_SCHEMA|
    |default           |
    |imdb              |
    |imdb_dbt          |  <---dbtにより作成されました！
    |information_schema|
    |system            |
    +------------------+
    ```

    このビューをクエリすると、以前のクエリの結果をより簡潔な構文で再現できます：

    ```sql
    SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
    ```

    ```response
    +------+------------+----------+------------------+------+---------+-------------------+
    |id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+------------+----------+------------------+------+---------+-------------------+
    |45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
    |621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
    |372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
    |283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
    |356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
    +------+------------+----------+------------------+------+---------+-------------------+
    ```
## テーブルマテリアライゼーションの作成 {#creating-a-table-materialization}

前の例では、モデルはビューとしてマテリアライズされました。このため、特定のクエリに対して十分なパフォーマンスを提供することがありますが、より複雑なSELECTや頻繁に実行されるクエリはテーブルとしてマテリアライズする方が良い場合があります。このマテリアライゼーションは、BIツールによってクエリされるモデルに役立ち、ユーザーに迅速な体験を提供します。これにより、クエリの結果が新しいテーブルとして保存され、関連するストレージのオーバーヘッドが発生します - 実際には`INSERT TO SELECT`が実行されます。このテーブルは毎回再構築されるため、増分ではないことに注意してください。大規模な結果セットは長い実行時間を引き起こす可能性があります - [dbt Limitations](#limitations)を参照してください。

1. `actors_summary.sql`ファイルを修正して、`materialized`パラメータを`table`に設定します。`ORDER BY`の定義方法と、`MergeTree`テーブルエンジンを使用していることに注意してください：

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. `imdb`ディレクトリから`dbt run`コマンドを実行します。この実行は少し長くかかる可能性があります - ほとんどのマシンで約10秒です。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:13:27  Running with dbt=1.1.0
    15:13:27  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
    15:13:27
    15:13:28  Concurrency: 1 threads (target='dev')
    15:13:28
    15:13:28  1 of 1 START table model imdb_dbt.actor_summary................................. [RUN]
    15:13:37  1 of 1 OK created table model imdb_dbt.actor_summary............................ [OK in 9.22s]
    15:13:37
    15:13:37  Finished running 1 table model in 10.20s.
    15:13:37
    15:13:37  Completed successfully
    15:13:37
    15:13:37  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

3. テーブル`imdb_dbt.actor_summary`の作成を確認します：

    ```sql
    SHOW CREATE TABLE imdb_dbt.actor_summary;
    ```

    適切なデータ型を持つテーブルが表示されるはずです：
    ```response
    +----------------------------------------
    |statement
    +----------------------------------------
    |CREATE TABLE imdb_dbt.actor_summary
    |(
    |`id` UInt32,
    |`first_name` String,
    |`last_name` String,
    |`num_movies` UInt64,
    |`updated_at` DateTime
    |)
    |ENGINE = MergeTree
    |ORDER BY (id, first_name, last_name)
    +----------------------------------------
    ```

4. このテーブルの結果が以前の応答と一貫していることを確認してください。モデルがテーブルになったことで応答時間が顕著に改善されていることに注意してください：

    ```sql
    SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
    ```

    ```response
    +------+------------+----------+------------------+------+---------+-------------------+
    |id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+------------+----------+------------------+------+---------+-------------------+
    |45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
    |621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
    |372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
    |283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
    |356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
    +------+------------+----------+------------------+------+---------+-------------------+
    ```

    このモデルに対して他のクエリを実行してもかまいません。例えば、5回以上出演した俳優の中で最高評価の映画を持つのは誰でしょうか？

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```
## インクリメンタルマテリアライゼーションの作成 {#creating-an-incremental-materialization}

前の例ではモデルをマテリアライズするためのテーブルを作成しました。このテーブルは、各dbt実行のたびに再構築されます。これは、大規模な結果セットや複雑な変換には実現不可能で、非常に高コストになる可能性があります。この課題に対処し、ビルド時間を短縮するために、dbtはインクリメンタルマテリアライゼーションを提供しています。これにより、dbtは前回の実行以降にテーブルにレコードを挿入または更新できるため、イベントスタイルのデータに適しています。裏では、一時テーブルが作成され、すべての更新されたレコードが格納され、その後、触れられていないレコードと更新されたレコードが新しいターゲットテーブルに挿入されます。これにより、テーブルモデルと同様の[制限](#limitations)が大規模な結果セットに対して発生します。

大規模なセットに対するこれらの制限を克服するために、プラグインは 'inserts_only' モードをサポートしており、すべての更新が一時テーブルを作成せずにターゲットテーブルに挿入されます（詳細は下記）。

この例を示すために、910本の映画に出演した「Clicky McClickHouse」という俳優を追加します。彼は[メル・ブランク](https://en.wikipedia.org/wiki/Mel_Blanc)よりも多くの映画に出演することを保証します。

1. まず、モデルのタイプをインクリメンタルに変更します。この追加には以下が必要です：

    1. **unique_key** - プラグインが行を一意に特定できるように、unique_keyを提供する必要があります。この場合、クエリからの `id` フィールドで十分です。これにより、マテリアライズされたテーブルに行の重複が発生しないことが保証されます。ユニーク制約の詳細については、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)を参照してください。
    2. **インクリメンタルフィルター** - また、dbtがインクリメンタル実行でどの行が変更されたかを特定する方法を伝える必要があります。これは、デルタ式を提供することで達成されます。通常、これはイベントデータのタイムスタンプを含むため、更新日時として `updated_at` タイムスタンプフィールドを使用します。行が挿入される際のデフォルト値は now() であり、新しい行を特定できます。加えて、新しい俳優が追加される場合の代替ケースを特定する必要があります。`{{this}}` 変数を使用して、既存のマテリアライズテーブルを示すと、式 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})` が得られます。この式は `{% if is_incremental() %}` 条件内に埋め込み、インクリメンタル実行時のみ使用され、テーブルが最初に構築されるときには使用されないようにします。インクリメンタルモデルの行をフィルタリングする詳細については、[dbtDocsのこの議論](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)を参照してください。

    `actor_summary.sql` ファイルを以下のように更新します：

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id') }}
    with actor_summary as (
        SELECT id,
            any(actor_name) as name,
            uniqExact(movie_id)    as num_movies,
            avg(rank)                as avg_rank,
            uniqExact(genre)         as genres,
            uniqExact(director_name) as directors,
            max(created_at) as updated_at
        FROM (
            SELECT {{ source('imdb', 'actors') }}.id as id,
                concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
                {{ source('imdb', 'movies') }}.id as movie_id,
                {{ source('imdb', 'movies') }}.rank as rank,
                genre,
                concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
                created_at
        FROM {{ source('imdb', 'actors') }}
            JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
            LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
            LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
            LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
            LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
        )
        GROUP BY id
    )
    select *
    from actor_summary

    {% if is_incremental() %}

    -- このフィルターはインクリメンタル実行時のみに適用されます
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

    私たちのモデルは、`roles` および `actors` テーブルへの更新と追加にのみ反応します。すべてのテーブルに反応するためには、ユーザーはこのモデルを複数のサブモデルに分割することを推奨します - 各サブモデルには独自のインクリメンタル基準があります。これらのモデルは、参照および接続されることができます。モデルの相互参照の詳細については、[こちら](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)を参照してください。

2. `dbt run` を実行し、結果テーブルの結果を確認します：

    ```response
    clickhouse-user@clickhouse:~/imdb$  dbt run
    15:33:34  Running with dbt=1.1.0
    15:33:34  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
    15:33:34
    15:33:35  Concurrency: 1 threads (target='dev')
    15:33:35
    15:33:35  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
    15:33:41  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 6.33s]
    15:33:41
    15:33:41  Finished running 1 incremental model in 7.30s.
    15:33:41
    15:33:41  Completed successfully
    15:33:41
    15:33:41  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

    ```sql
    SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
    ```

    ```response
    +------+------------+----------+------------------+------+---------+-------------------+
    |id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+------------+----------+------------------+------+---------+-------------------+
    |45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
    |621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
    |372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
    |283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
    |356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
    +------+------------+----------+------------------+------+---------+-------------------+
    ```

3. インクリメンタル更新を示すために、モデルにデータを追加します。「Clicky McClickHouse」を `actors` テーブルに追加します：

    ```sql
    INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
    ```

4. 「Clicky」を910本のランダムな映画に出演させましょう：

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
    FROM imdb.movies
    LIMIT 910 OFFSET 10000;
    ```

5. 実際に最も多くの出演を果たした俳優であることを確認するために、基礎となるソーステーブルをクエリして、dbtモデルをバイパスします：

    ```sql
    SELECT id,
        any(actor_name)          as name,
        uniqExact(movie_id)    as num_movies,
        avg(rank)                as avg_rank,
        uniqExact(genre)         as unique_genres,
        uniqExact(director_name) as uniq_directors,
        max(created_at)          as updated_at
    FROM (
            SELECT imdb.actors.id                                                   as id,
                    concat(imdb.actors.first_name, ' ', imdb.actors.last_name)       as actor_name,
                    imdb.movies.id as movie_id,
                    imdb.movies.rank                                                 as rank,
                    genre,
                    concat(imdb.directors.first_name, ' ', imdb.directors.last_name) as director_name,
                    created_at
            FROM imdb.actors
                    JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
                    LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
                    LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
                    LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
                    LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
            )
    GROUP BY id
    ORDER BY num_movies DESC
    LIMIT 2;
    ```

    ```response
    +------+-------------------+----------+------------------+------+---------+-------------------+
    |id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+-------------------+----------+------------------+------+---------+-------------------+
    |845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
    |45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
    +------+-------------------+----------+------------------+------+---------+-------------------+
    ```

6. `dbt run` を実行し、モデルが更新されて上記の結果と一致することを確認します：

    ```response
    clickhouse-user@clickhouse:~/imdb$  dbt run
    16:12:16  Running with dbt=1.1.0
    16:12:16  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
    16:12:16
    16:12:17  Concurrency: 1 threads (target='dev')
    16:12:17
    16:12:17  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
    16:12:24  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 6.82s]
    16:12:24
    16:12:24  Finished running 1 incremental model in 7.79s.
    16:12:24
    16:12:24  Completed successfully
    16:12:24
    16:12:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

    ```sql
    SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 2;
    ```

    ```response
    +------+-------------------+----------+------------------+------+---------+-------------------+
    |id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+-------------------+----------+------------------+------+---------+-------------------+
    |845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
    |45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
    +------+-------------------+----------+------------------+------+---------+-------------------+
    ```

### 内部実装 {#internals}

上記のインクリメンタル更新を実現するために実行されたステートメントは、ClickHouseのクエリログをクエリすることで特定できます。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

上記のクエリは、実行期間に応じて調整してください。結果の検査はユーザーに任せますが、インクリメンタル更新を実行するためにプラグインで使用される一般的な戦略を強調します：

1. プラグインは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行がこのテーブルにストリーミングされます。
2. 新しいテーブル `actor_summary_new` が作成されます。古いテーブルの行は、新しいテーブルに新旧の行がストリーミングされ、行IDが一時テーブルに存在しないことを確認します。これにより、更新と重複を効率的に処理できます。
3. 一時テーブルの結果が新しい `actor_summary` テーブルにストリーミングされます。
4. 最後に、新しいテーブルは `EXCHANGE TABLES` ステートメントを介して古いバージョンと原子的に交換されます。古いテーブルと一時テーブルはそれぞれ削除されます。

以下のように図示できます：

<Image img={dbt_05} size="lg" alt="incremental updates dbt" />

この戦略は非常に大規模なモデルでは課題に直面する可能性があります。詳細については[制限](#limitations)を参照してください。

### アペンド戦略（inserts-only モード） {#append-strategy-inserts-only-mode}

インクリメンタルモデルにおける大規模データセットの制限を克服するために、プラグインはdbt設定パラメータ `incremental_strategy` を使用します。これは値 `append` に設定できます。設定されると、更新された行がターゲットテーブル（すなわち `imdb_dbt.actor_summary`）に直接挿入され、一時テーブルは作成されません。
注意：アペンド専用モードではデータが不変であるか、重複が許可されている必要があります。更新された行をサポートするインクリメンタルテーブルモデルが必要な場合は、このモードを使用しないでください！

このモードを示すために、別の新しい俳優を追加し、 `incremental_strategy='append'` でdbt runを再実行します。

1. `actor_summary.sql`でアペンド専用モードを構成します：

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. もう一人の有名な俳優 - ダニー・デヴィートを追加しましょう。

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. ダニーを920本のランダムな映画に出演させましょう。

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 920 OFFSET 10000;
   ```

4. `dbt run` を実行し、ダニーが俳優サマリーテーブルに追加されたことを確認します。

   ```response
   clickhouse-user@clickhouse:~/imdb$ dbt run
   16:12:16  Running with dbt=1.1.0
   16:12:16  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 186 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
   16:12:16
   16:12:17  Concurrency: 1 threads (target='dev')
   16:12:17
   16:12:17  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
   16:12:24  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 0.17s]
   16:12:24
   16:12:24  Finished running 1 incremental model in 0.19s.
   16:12:24
   16:12:24  Completed successfully
   16:12:24
   16:12:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
   ```

   ```sql
   SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 3;
   ```

   ```response
   +------+-------------------+----------+------------------+------+---------+-------------------+
   |id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
   +------+-------------------+----------+------------------+------+---------+-------------------+
   |845467|Danny DeBito       |920       |1.4768987303293204|21    |670      |2022-04-26 16:22:06|
   |845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
   |45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
   +------+-------------------+----------+------------------+------+---------+-------------------+
   ```

前の「Clicky」の挿入と比べて、インクリメンタルがどれほど速かったかに注意してください。

再度クエリログテーブルを確認すると、2回のインクリメンタル実行の違いが明らかになります：

   ```sql
   insert into imdb_dbt.actor_summary ("id", "name", "num_movies", "avg_rank", "genres", "directors", "updated_at")
   with actor_summary as (
      SELECT id,
         any(actor_name) as name,
         uniqExact(movie_id)    as num_movies,
         avg(rank)                as avg_rank,
         uniqExact(genre)         as genres,
         uniqExact(director_name) as directors,
         max(created_at) as updated_at
      FROM (
         SELECT imdb.actors.id as id,
            concat(imdb.actors.first_name, ' ', imdb.actors.last_name) as actor_name,
            imdb.movies.id as movie_id,
            imdb.movies.rank as rank,
            genre,
            concat(imdb.directors.first_name, ' ', imdb.directors.last_name) as director_name,
            created_at
         FROM imdb.actors
            JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
            LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
            LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
            LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
            LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
      )
      GROUP BY id
   )

   select *
   from actor_summary
   -- このフィルターはインクリメンタル実行時のみに適用されます
   where id > (select max(id) from imdb_dbt.actor_summary) or updated_at > (select max(updated_at) from imdb_dbt.actor_summary)
   ```

この実行では、新しい行のみが直接 `imdb_dbt.actor_summary` テーブルに追加され、一時テーブルの作成は含まれません。

### 削除+挿入モード（実験的） {#deleteinsert-mode-experimental}

歴史的に、ClickHouseは非同期[ミューテーション](/sql-reference/statements/alter/index.md)という形でのみ、更新および削除のサポートが限られています。これらは非常にI/O集約的であり、一般的には避けるべきです。

ClickHouse 22.8は[軽量削除](/sql-reference/statements/delete.md)を導入しました。これらは現在実験的ですが、データを削除するためのよりパフォーマンスの良い手段を提供します。

このモードは、`incremental_strategy` パラメータを介してモデルに設定できます：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

この戦略はターゲットモデルのテーブルで直接操作を行うため、操作中に問題が発生した場合、インクリメンタルモデルのデータは無効な状態になる可能性があります - 原子的な更新はありません。

要約すると、このアプローチは：

1. プラグインは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行がこのテーブルにストリーミングされます。
2. 現在の `actor_summary` テーブルに対して `DELETE` が発行されます。 `actor_sumary__dbt_tmp` からIDで行が削除されます。
3. `actor_sumary__dbt_tmp` から `actor_summary` に行が挿入されます。

このプロセスは以下のように示されます：

<Image img={dbt_06} size="lg" alt="lightweight delete incremental" />

### insert_overwrite モード（実験的） {#insert_overwrite-mode-experimental}

次のステップを実行します：

1. インクリメンタルモデル関係と同じ構造のステージング（仮想）テーブルを作成：`CREATE TABLE {staging} AS {target}`。
2. 新しいレコードのみ（SELECTによって生成された）をステージングテーブルに挿入。
3. 以前の新しいパーティション（ステージングテーブルに存在する）をターゲットテーブルに置き換えます。

<br />

このアプローチには以下の利点があります：

* 全テーブルをコピーする必要がないため、デフォルトの戦略よりも高速です。
* INSERT操作が正常に完了するまで元のテーブルを変更しないため、他の戦略よりも安全です：中間的な失敗があった場合、元のテーブルは変更されません。
* データ工学のベストプラクティスである「パーティションの不変性」を実装します。これにより、インクリメンタルかつ並行なデータ処理、ロールバックなどが簡易化されます。

<Image img={dbt_07} size="lg" alt="insert overwrite incremental" />

## スナップショットの作成 {#creating-a-snapshot}

dbtスナップショットを使用すると、時間の経過に伴う可変モデルへの変更の記録を作成できます。これにより、分析者がモデルの以前の状態を「振り返る」ことができるポイントインタイムクエリが可能になります。これは、行が有効であった期間を記録するために、開始日および終了日の列を使用する[タイプ2ゆっくり変化する次元](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row)を使用することにより実現されます。この機能はClickHouseプラグインによってサポートされており、以下に示します。

この例は、[インクリメンタルテーブルモデルの作成](#creating-an-incremental-materialization)を完了したと仮定しています。あなたの `actor_summary.sql` に `inserts_only=True` が設定されていないことを確認してください。あなたの `models/actor_summary.sql` は以下のように見える必要があります：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id') }}

with actor_summary as (
    SELECT id,
        any(actor_name) as name,
        uniqExact(movie_id)    as num_movies,
        avg(rank)                as avg_rank,
        uniqExact(genre)         as genres,
        uniqExact(director_name) as directors,
        max(created_at) as updated_at
    FROM (
        SELECT {{ source('imdb', 'actors') }}.id as id,
            concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
            {{ source('imdb', 'movies') }}.id as movie_id,
            {{ source('imdb', 'movies') }}.rank as rank,
            genre,
            concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
            created_at
    FROM {{ source('imdb', 'actors') }}
        JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
        LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
        LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
    )
    GROUP BY id
)
select *
from actor_summary

{% if is_incremental() %}

-- このフィルターはインクリメンタル実行時のみに適用されます
where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

{% endif %}
```

1. スナップショットディレクトリに `actor_summary` ファイルを作成します。

    ```bash
     touch snapshots/actor_summary.sql
    ```

2. `actor_summary.sql` ファイルの内容を以下の内容で更新します：
    ```sql
    {% snapshot actor_summary_snapshot %}

    {{
    config(
    target_schema='snapshots',
    unique_key='id',
    strategy='timestamp',
    updated_at='updated_at',
    )
    }}

    select * from {{ref('actor_summary')}}

    {% endsnapshot %}
    ```

この内容に関するいくつかの観察ポイント：
* selectクエリは、時間の経過に伴ってスナップショットを取得したい結果を定義します。関数 ref は、以前に作成した actor_summary モデルを参照するために使用されます。
* レコードの変更を示すために、タイムスタンプ列が必要です。ここでは、私たちの `updated_at` 列（[インクリメンタルテーブルモデルの作成](#creating-an-incremental-materialization)を参照）は、ここで使用されます。パラメータ strategy は、更新を示すためにタイムスタンプを使用することを示し、updated_at パラメータは使用する列を指定します。モデルにこれが存在しない場合、代わりに[チェック戦略](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)を使用できます。これは非常に非効率的で、ユーザーが比較する列のリストを指定する必要があります。dbtは、これらの列の現在および履歴の値を比較し、変更があれば記録し（同一である場合は何もしません）。

3. コマンド `dbt snapshot` を実行します。

    ```response
    clickhouse-user@clickhouse:~/imdb$ dbt snapshot
    13:26:23  Running with dbt=1.1.0
    13:26:23  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
    13:26:23
    13:26:25  Concurrency: 1 threads (target='dev')
    13:26:25
    13:26:25  1 of 1 START snapshot snapshots.actor_summary_snapshot...................... [RUN]
    13:26:25  1 of 1 OK snapshotted snapshots.actor_summary_snapshot...................... [OK in 0.79s]
    13:26:25
    13:26:25  Finished running 1 snapshot in 2.11s.
    13:26:25
    13:26:25  Completed successfully
    13:26:25
    13:26:25  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

注意してください、snapshotsデータベースに actor_summary_snapshot テーブルが作成されたことが確認できます（これは target_schema パラメータによって決まります）。

4. このデータをサンプリングすると、dbtが `dbt_valid_from` および `dbt_valid_to` 列を含めていることがわかります。後者は null に設定されています。次回の実行でこれが更新されます。

    ```sql
    SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
    ```

    ```response
    +------+----------+------------+----------+-------------------+------------+
    |id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to|
    +------+----------+------------+----------+-------------------+------------+
    |845467|Danny     |DeBito      |920       |2022-05-25 19:33:32|NULL        |
    |845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|NULL        |
    |45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL        |
    |621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL        |
    |283127|Tom       |London      |549       |2022-05-25 19:31:47|NULL        |
    +------+----------+------------+----------+-------------------+------------+
    ```

5. 大好きな俳優 Clicky McClickHouse をさらに10本の映画に出演させます。

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. `imdb` ディレクトリから dbt run コマンドを再実行します。これにより、インクリメンタルモデルが更新されます。これが完了したら、変更をキャプチャするために dbt snapshot を実行します。

    ```response
    clickhouse-user@clickhouse:~/imdb$ dbt run
    13:46:14  Running with dbt=1.1.0
    13:46:14  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
    13:46:14
    13:46:15  Concurrency: 1 threads (target='dev')
    13:46:15
    13:46:15  1 of 1 START incremental model imdb_dbt.actor_summary....................... [RUN]
    13:46:18  1 of 1 OK created incremental model imdb_dbt.actor_summary.................. [OK in 2.76s]
    13:46:18
    13:46:18  Finished running 1 incremental model in 3.73s.
    13:46:18
    13:46:18  Completed successfully
    13:46:18
    13:46:18  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1

    clickhouse-user@clickhouse:~/imdb$ dbt snapshot
    13:46:26  Running with dbt=1.1.0
    13:46:26  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
    13:46:26
    13:46:27  Concurrency: 1 threads (target='dev')
    13:46:27
    13:46:27  1 of 1 START snapshot snapshots.actor_summary_snapshot...................... [RUN]
    13:46:31  1 of 1 OK snapshotted snapshots.actor_summary_snapshot...................... [OK in 4.05s]
    13:46:31
    13:46:31  Finished running 1 snapshot in 5.02s.
    13:46:31
    13:46:31  Completed successfully
    13:46:31
    13:46:31  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
   ```

7. スナップショットをクエリすると、Clicky McClickHouseの2行目があることに注意してください。以前のエントリには `dbt_valid_to` 値があります。新しい値は `dbt_valid_from` 列に同じ値が記録され、`dbt_valid_to` 値はnullです。新しい行があれば、これらもスナップショットに追加されます。

    ```sql
    SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
    ```

    ```response
    +------+----------+------------+----------+-------------------+-------------------+
    |id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to       |
    +------+----------+------------+----------+-------------------+-------------------+
    |845467|Danny     |DeBito      |920       |2022-05-25 19:33:32|NULL               |
    |845466|Clicky    |McClickHouse|920       |2022-05-25 19:34:37|NULL               |
    |845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|2022-05-25 19:34:37|
    |45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL               |
    |621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL               |
    +------+----------+------------+----------+-------------------+-------------------+
    ```

dbtスナップショットの詳細については、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)を参照してください。
## Using Seeds {#using-seeds}

dbtはCSVファイルからデータをロードする機能を提供します。この機能は、データベースの大きなエクスポートをロードするのには適しておらず、コードテーブルや [dictionaries](../../../../sql-reference/dictionaries/index.md) に通常使用される小さなファイル向けに設計されています。例えば、国コードを国名にマッピングすることが挙げられます。ここでは、シード機能を使用してジャンルコードのリストを生成し、アップロードする簡単な例を示します。

1. 既存のデータセットからジャンルコードのリストを生成します。dbtディレクトリから、`clickhouse-client`を使用してファイル`seeds/genre_codes.csv`を作成します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. `dbt seed`コマンドを実行します。これにより、CSVファイルの行を持つ新しいテーブル `genre_codes` がデータベース `imdb_dbt` に作成されます（スキーマ構成によって定義されます）。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt seed
    17:03:23  Running with dbt=1.1.0
    17:03:23  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 1 seed file, 6 sources, 0 exposures, 0 metrics
    17:03:23
    17:03:24  Concurrency: 1 threads (target='dev')
    17:03:24
    17:03:24  1 of 1 START seed file imdb_dbt.genre_codes..................................... [RUN]
    17:03:24  1 of 1 OK loaded seed file imdb_dbt.genre_codes................................. [INSERT 21 in 0.65s]
    17:03:24
    17:03:24  Finished running 1 seed in 1.62s.
    17:03:24
    17:03:24  Completed successfully
    17:03:24
    17:03:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```
3. これらがロードされたことを確認します：

    ```sql
    SELECT * FROM imdb_dbt.genre_codes LIMIT 10;
    ```

    ```response
    +-------+----+
    |genre  |code|
    +-------+----+
    |Drama  |DRA |
    |Romance|ROM |
    |Short  |SHO |
    |Mystery|MYS |
    |Adult  |ADU |
    |Family |FAM |

    |Action |ACT |
    |Sci-Fi |SCI |
    |Horror |HOR |
    |War    |WAR |
    +-------+----+=
    ```
## Limitations {#limitations}

現在のClickHouseプラグインは、ユーザーが認識しておくべきいくつかの制限があります：

1. プラグインは現在、モデルをテーブルとして `INSERT TO SELECT`を使用してマテリアライズします。これは効果的にデータの重複を意味します。非常に大きなデータセット（PB）の場合、極端に長い実行時間が発生する可能性があり、一部のモデルが実行不可能になることがあります。可能な限りGROUP BYを利用して、任意のクエリから返される行数を最小限に抑えることを目指してください。ソースの行数を維持しつつ単にトランスフォームを行うモデルよりも、データを要約するモデルを優先します。
2. モデルを表すために分散テーブルを使用するには、ユーザーは手動で各ノードに基底のレプリケーテッドテーブルを作成する必要があります。その上に分散テーブルを作成することができます。プラグインはクラスターの作成を管理しません。
3. dbtがデータベースに関係（テーブル/ビュー）を作成すると、通常は次の形式で作成されます： `{{ database }}.{{ schema }}.{{ table/view id }}`。ClickHouseにはスキーマの概念がありません。したがって、プラグインは `{{schema}}.{{ table/view id }}` を使用します。ここで、`schema`はClickHouseデータベースです。

### Further Information

前のガイドは、dbt機能の表面を少し触れるだけです。ユーザーは優れた [dbt documentation](https://docs.getdbt.com/docs/introduction) を読むことをお勧めします。

プラグインの追加設定については [here](https://github.com/silentsokolov/dbt-clickhouse#model-configuration) に記載されています。

## Fivetran {#fivetran}

`dbt-clickhouse`コネクタは、 [Fivetran transformations](https://fivetran.com/docs/transformations/dbt) で使用することも可能で、`dbt`を使用してFivetranプラットフォーム内でシームレスな統合と変換機能を提供します。

## Related Content {#related-content}

- Blog & Webinar: [ClickHouse and dbt - A Gift from the Community](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
