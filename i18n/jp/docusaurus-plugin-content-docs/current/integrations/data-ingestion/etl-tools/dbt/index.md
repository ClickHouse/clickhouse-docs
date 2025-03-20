---
sidebar_label: dbt
slug: /integrations/dbt
sidebar_position: 1
description: ユーザーは dbt を使用して ClickHouse でデータを変換およびモデリングできます
---
import TOCInline from '@theme/TOCInline';
import dbt_01 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_01.png';
import dbt_02 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_02.png';
import dbt_03 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_03.png';
import dbt_04 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_04.png';
import dbt_05 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_05.png';
import dbt_06 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_06.png';
import dbt_07 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_07.png';

# dbt と ClickHouse の統合

**dbt** (data build tool) は、分析エンジニアがシンプルに SELECT ステートメントを記述することで、データウェアハウス内のデータを変換することを可能にします。 dbt は、これらの SELECT ステートメントをテーブルやビューの形でデータベース内のオブジェクトに物理化（マテリアライズ）することを処理し、[抽出・移動・変換（ELT）](https://en.wikipedia.org/wiki/Extract,_load,_transform) の T を実行します。ユーザーは SELECT ステートメントで定義されたモデルを作成できます。

dbt 内では、これらのモデルを相互参照し、レイヤー化することで、より高レベルの概念を構築できるようになります。モデルを接続するために必要なボイラープレート SQL は自動的に生成されます。さらに、dbt はモデル間の依存関係を特定し、それらを適切な順序で作成されるように、直接非循環グラフ（DAG）を使用します。

dbt は、[ClickHouse に対応したプラグイン](https://github.com/ClickHouse/dbt-clickhouse) を介して ClickHouse と互換性があります。私たちは、公開された IMDB データセットに基づく簡単な例を用いて、ClickHouse との接続プロセスを説明します。また、現在のコネクタのいくつかの制限事項も強調します。

<TOCInline toc={toc}  maxHeadingLevel={2} />
## 概念 {#concepts}

dbt はモデルの概念を導入します。これは、複数のテーブルを結合する可能性のある SQL ステートメントとして定義されます。モデルは、いくつかの方法で「マテリアライズ」することができます。マテリアライズは、モデルの SELECT クエリのためのビルド戦略を表します。マテリアライズの背後にあるコードは、SELECT クエリをラップするボイラープレート SQL です。これにより、新しいリレーションを作成したり、既存のリレーションを更新したりします。

dbt は 4 種類のマテリアライズを提供しています：

* **view** (デフォルト): モデルがデータベース内のビューとして構築されます。
* **table**: モデルがデータベース内のテーブルとして構築されます。
* **ephemeral**: モデルはデータベース内で直接構築されませんが、共通テーブル式として依存するモデルに引き込まれます。
* **incremental**: モデルは最初にテーブルとしてマテリアライズされ、その後の実行で新しい行が挿入され、変更された行がテーブル内で更新されます。

追加の構文および句は、基になるデータが変更された場合に、これらのモデルをどのように更新すべきかを定義します。dbt は一般的に、パフォーマンスが懸念事項になるまでビューのマテリアライズから始めることを推奨します。テーブル マテリアライズは、ストレージが増加する代わりに、モデルのクエリ結果をテーブルとしてキャプチャすることでクエリ時間のパフォーマンス向上を提供します。インクリメンタルアプローチは、これをさらに改善し、基になるデータのその後の更新をターゲットテーブルにキャプチャできるようにします。

[現在のプラグイン](https://github.com/silentsokolov/dbt-clickhouse) は、ClickHouse で **view**, **table**, **ephemeral**, **incremental** マテリアライズをサポートしています。このガイドで探る dbt の [スナップショット](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) や [シード](https://docs.getdbt.com/docs/building-a-dbt-project/seeds) もサポートしています。

以下のガイドを通して、ClickHouse インスタンスが利用可能であることを前提とします。
## dbt と ClickHouse プラグインのセットアップ {#setup-of-dbt-and-the-clickhouse-plugin}
### dbt {#dbt}

以下の例では dbt CLI の使用を前提としています。ユーザーは、プロジェクトを編集および実行するための Web ベースの統合開発環境（IDE）を提供する [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) も検討したいかもしれません。

dbt には CLI インストールのためのいくつかの選択肢があります。[こちら](https://docs.getdbt.com/dbt-cli/install/overview) に記載されている手順に従ってください。この段階では、dbt-core のみをインストールします。`pip` の使用をお勧めします。

```bash
pip install dbt-core
```

**重要: 以下は python 3.9 でテストされています。**
### ClickHouse プラグイン {#clickhouse-plugin}

dbt ClickHouse プラグインをインストールします：

```bash
pip install dbt-clickhouse
```
### ClickHouse の準備 {#prepare-clickhouse}

dbt は高度に関係性のあるデータのモデリングに優れています。例の目的のために、次の関係スキーマを持つ小さな IMDB データセットを提供します。このデータセットは [関係データセットリポジトリ](https://relational.fit.cvut.cz/dataset/IMDb) から取得したものです。これは dbt で一般的に使用されるスキーマと比べると簡素ですが、管理可能なサンプルを表しています：

<img src={dbt_01} class="image" alt="IMDB テーブルスキーマ" style={{width: '100%'}}/>

以下に示すテーブルのサブセットを使用します。

次のテーブルを作成します：

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
テーブル `roles` のカラム `created_at` はデフォルトで `now()` の値を持っています。これは後でモデルのインクリメンタル更新を確認するために使用します - [インクリメンタルモデル](#creating-an-incremental-materialization) を参照してください。
:::

`s3` 関数を使用して、公開エンドポイントからソースデータを読み込み、データを挿入します。次のコマンドを実行してテーブルにデータを入力します：

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

これらの実行には帯域幅に応じて若干の違いがあるかもしれませんが、各コマンドは数秒で完了するはずです。以下のクエリを実行して各俳優のサマリーを計算し、最も多くの映画に出演している順に並べ、データが正常に読み込まれたことを確認します：

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

後のガイドでは、このクエリをモデルに変換し、dbt のビューおよびテーブルとして ClickHouse にマテリアライズします。
## ClickHouse への接続 {#connecting-to-clickhouse}

1. dbt プロジェクトを作成します。このケースでは、`imdb` ソースに基づいた名前を付けます。プロンプトが表示されたら、データベースソースとして `clickhouse` を選択します。

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

2. `cd` コマンドを使ってプロジェクトフォルダへ移動します：

    ```bash
    cd imdb
    ```

3. この時点で、お好みのテキストエディタが必要になります。以下の例では、人気のある VS Code を使用します。IMDB ディレクトリを開くと、yml ファイルや sql ファイルのコレクションが表示されます：

    <img src={dbt_02} class="image" alt="新しい dbt プロジェクト" style={{width: '100%'}}/>

4. `dbt_project.yml` ファイルを更新し、最初のモデル `actor_summary` を指定し、プロファイルを `clickhouse_imdb` に設定します。

    <img src={dbt_03} class="image" alt="dbt プロファイル" style={{width: '100%'}}/>

    <img src={dbt_04} class="image" alt="dbt プロファイル" style={{width: '100%'}}/>

5. 次に、dbt に ClickHouse インスタンスへの接続情報を提供する必要があります。`~/.dbt/profiles.yml` に以下を追加します。

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

    ユーザーとパスワードを変更する必要があることに注意してください。利用できる他の設定については、[こちら](https://github.com/silentsokolov/dbt-clickhouse#example-profile)で文書化されています。

6. IMDB ディレクトリから `dbt debug` コマンドを実行して、dbt が ClickHouse に接続できるかどうかを確認します。

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

    応答に `Connection test: [OK connection ok]` が含まれていることを確認し、接続が成功したことを示します。
## シンプルなビューのマテリアライズを作成する {#creating-a-simple-view-materialization}

ビューのマテリアライズを使用する場合、モデルは毎回 `CREATE VIEW AS` ステートメントを介してビューとして再構築されます。これにより、データの追加ストレージは不要ですが、テーブルマテリアライズよりクエリが遅くなります。

1. `imdb` フォルダから、`models/example` ディレクトリを削除します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. `models` フォルダ内の `actors` に新しいファイルを作成します。ここでは、各俳優モデルを表すファイルを作成します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. `models/actors` フォルダ内に `schema.yml` と `actor_summary.sql` のファイルを作成します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```
    `schema.yml` ファイルは、私たちのテーブルを定義します。これらはマクロで使用できるようになります。 `models/actors/schema.yml` を編集して、次の内容を持つようにします：
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
    `actors_summary.sql` ファイルは実際のモデルを定義します。なお、config 関数ではモデルを ClickHouse にビューとしてマテリアライズするように求めています。テーブルは `schema.yml` ファイルから `source` 関数を介して参照されます。例: `source('imdb', 'movies')` は `imdb` データベース内の `movies` テーブルを参照します。 `models/actors/actors_summary.sql` を編集して次の内容を持つようにします：
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
    最終的な actor_summary では `updated_at` カラムを含めることに注意してください。これは後でインクリメンタルマテリアライズ用に使用します。

4. `imdb` ディレクトリから、`dbt run` コマンドを実行します。

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

5. dbt は要求通りにモデルを ClickHouse のビューとして表現します。これで、このビューを直接クエリできます。このビューは `~/.dbt/profiles.yml` の `clickhouse_imdb` プロファイルの下で、スキーマパラメータによって決定される `imdb_dbt` データベースに作成されています。

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
    |imdb_dbt          |  <---dbt によって作成されました!
    |information_schema|
    |system            |
    +------------------+
    ```

    このビューをクエリして、以前のクエリの結果を簡単な構文で再現できます：

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
## テーブルマテリアライズを作成する {#creating-a-table-materialization}

前の例では、モデルはビューとしてマテリアライズされました。これが一部のクエリに十分なパフォーマンスを提供するかもしれませんが、より複雑な SELECT や頻繁に実行されるクエリについては、テーブルとしてマテリアライズする方が良い場合があります。このマテリアライズは、BI ツールによってクエリされるモデルに対して有用で、ユーザーがより迅速な体験を得られることを保証します。これは、新しいテーブルとしてクエリ結果が保存されることを意味し、関連するストレージオーバーヘッドが発生します - 事実上、`INSERT TO SELECT` が実行されます。このテーブルは毎回再構築されるため、インクリメンタルではありません。大きな結果セットは長い実行時間を引き起こす可能性があるため、[dbtの制限](#limitations) を参照してください。

1. `actors_summary.sql` ファイルを修正し、`materialized` パラメータを `table` に設定します。`ORDER BY` の定義に注意し、`MergeTree` テーブルエンジンを使用することを確認してください：

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. `imdb` ディレクトリから `dbt run` コマンドを実行します。この実行には、長めの時間がかかる場合があります - 多くのマシンで約 10 秒です。

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

3. テーブル `imdb_dbt.actor_summary` の作成を確認します：

    ```sql
    SHOW CREATE TABLE imdb_dbt.actor_summary;
    ```

    適切なデータ型のテーブルが表示されるはずです：
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
    |SETTINGS index_granularity = 8192
    +----------------------------------------
    ```

4. このテーブルからの結果が以前の応答と一致していることを確認します。モデルがテーブルになったため、応答時間が改善されていることに気付くでしょう：

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

    このモデルに対して他のクエリを発行してみてください。例えば、5回以上出演している俳優のうち、映画の評点が最も高いのはどれでしょうか？

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```
## インクリメンタルマテリアライゼーションの作成 {#creating-an-incremental-materialization}

前の例では、モデルをマテリアライズするためのテーブルを作成しました。このテーブルは、各 dbt 実行ごとに再構築されます。これは、大規模な結果セットや複雑な変換に対して実行不可能で、非常にコストがかかる可能性があります。この課題に対処し、ビルド時間を短縮するために、dbt はインクリメンタルマテリアライゼーションを提供しています。これにより、dbt は前回の実行以来、テーブルにレコードを挿入または更新することができ、イベントスタイルのデータに適しています。内部では、すべての更新されたレコードを持つ一時テーブルが作成され、その後、すべての変更されていないレコードと更新されたレコードが新しいターゲットテーブルに挿入されます。これにより、テーブルモデルと同様の[制限](#limitations)が大規模な結果セットに対して生じます。

これらの制限を大規模セットに対して克服するために、プラグインは「inserts_only」モードをサポートしており、ここでは一時テーブルが作成されることなく、すべての更新がターゲットテーブルに挿入されます（詳細は以下に記載）。

この例を説明するために、390 本の映画に出演する素晴らしい俳優「Clicky McClickHouse」を追加します - 彼は [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc) よりも多くの映画に出演したことを保証します。

1. まず、モデルのタイプをインクリメンタルに変更します。この追加には次のものが必要です。

    1. **unique_key** - プラグインが行を一意に識別できるようにするためには、unique_key を提供する必要があります。この場合、クエリの `id` フィールドで十分です。これにより、マテリアライズされたテーブルに行の重複がないことが保証されます。一意性制約に関する詳細は、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional) を参照してください。
    2. **インクリメンタルフィルター** - dbt に、インクリメンタル実行時にどの行が変更されたかを識別する方法を指示する必要があります。これは、デルタ式を提供することで達成されます。通常は、イベントデータのタイムスタンプが含まれます。このため、私たちの `updated_at` タイムスタンプフィールドが必要です。このカラムは、行が挿入されたときのデフォルト値が now() であり、新しい役割を特定できるようにします。さらに、新しい俳優が追加される代替ケースを識別する必要があります。`{{this}}` 変数を使用して、既存のマテリアライズテーブルを示すと、これは表現 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})` を持ちます。これを `{% if is_incremental() %}` 条件内部に埋め込み、インクリメンタル実行時にのみ使用されるようにし、テーブルが最初に構築されたときには使用されないようにします。インクリメンタルモデルの行をフィルタリングする詳細については、[dbt ドキュメントのこの議論](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)を参照してください。

    ファイル `actor_summary.sql` を次のように更新します:

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

    -- このフィルターはインクリメンタル実行時にのみ適用されます
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

    我々のモデルは `roles` と `actors` テーブルへの更新と追加にのみ応答します。すべてのテーブルに応答するためには、ユーザーはこのモデルを複数のサブモデルに分割することを推奨します - 各サブモデルにはそれぞれのインクリメンタル基準があります。これらのモデルは、さらに相互参照され、接続されることができます。モデルの相互参照に関する詳細は、[こちら](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)を参照してください。

2. `dbt run` を実行し、結果のテーブルの結果を確認します:

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

3. 次に、インクリメンタルアップデートを示すために、モデルにデータを追加します。俳優「Clicky McClickHouse」を `actors` テーブルに追加します:

    ```sql
    INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
    ```

4. 「Clicky」を 910 本のランダムな映画に出演させましょう:

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
    FROM imdb.movies
    LIMIT 910 OFFSET 10000;
    ```

5. 彼が確かに最も多く出演している俳優であることを確認するために、基盤となるソーステーブルをクエリし、dbt モデルをバイパスします:

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

6. `dbt run` を実行し、私たちのモデルが更新され、上記の結果と一致することを確認します:

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

### 内部 {#internals}

上記のインクリメンタルアップデートを実現するために実行されたステートメントは、ClickHouse のクエリログをクエリすることで識別できます。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

上記のクエリを実行期間に調整してください。結果の検査はユーザーに任せますが、インクリメンタルアップデートを行うためにプラグインが使用した一般的な戦略を強調します:

1. プラグインは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行はこのテーブルにストリーミングされます。
2. 新しいテーブル `actor_summary_new` が作成されます。古いテーブルからの行は、行 id が一時テーブルに存在しないかどうかのチェックを行いながらストリーミングされます。これにより、更新と重複が適切に処理されます。
3. 一時テーブルからの結果が新しい `actor_summary` テーブルにストリーミングされます。
4. 最後に、新しいテーブルが古いバージョンと原子的に交換されます。古いテーブルと一時テーブルは次に削除されます。

以下にこのプロセスを視覚化しています:

<img src={dbt_05} class="image" alt="incremental updates dbt" style={{width: '100%'}}/>

この戦略は非常に大規模なモデルでは課題に直面する可能性があります。詳細については[制限事項](#limitations)を参照してください。

### 追加戦略（inserts-only モード） {#append-strategy-inserts-only-mode}

インクリメンタルモデルの大規模データセットの制限を克服するために、プラグインは dbt 設定パラメータ `incremental_strategy` を使用します。これを `append` 値に設定できます。設定すると、更新された行がターゲットテーブル（すなわち `imdb_dbt.actor_summary`）に直接挿入され、一時テーブルは作成されません。

注意: 追加のみモードでは、データが不変であるか、重複しても問題ない必要があります。変更された行をサポートするインクリメンタルテーブルモデルが必要な場合は、このモードを使用しないでください！

このモードを示すために、もう一人の新しい俳優を追加し、`incremental_strategy='append'` で dbt run を再実行します。

1. actor_summary.sql で追加のみモードを構成します:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. もう一人の有名な俳優 - ダニー・デヴィートを追加しましょう。

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeVito', 'M');
   ```

3. ダニーを 920 本のランダムな映画に出演させましょう。

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 920 OFFSET 10000;
   ```

4. dbt run を実行し、ダニーが actor-summary テーブルに追加されたことを確認します。

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
   |845467|Danny DeVito       |920       |1.4768987303293204|21    |670      |2022-04-26 16:22:06|
   |845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
   |45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
   +------+-------------------+----------+------------------+------+---------+-------------------+
   ```

「Clicky」の挿入と比較して、インクリメンタルの速度がいかに速いかに注目してください。

再度クエリログテーブルを確認すると、2 回のインクリメンタル実行の違いが明らかになります:

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
   -- このフィルターはインクリメンタル実行時にのみ適用されます
   where id > (select max(id) from imdb_dbt.actor_summary) or updated_at > (select max(updated_at) from imdb_dbt.actor_summary)
   ```

この実行では、新しい行のみが `imdb_dbt.actor_summary` テーブルに直接追加され、一時テーブルの作成はありません。

### 削除+挿入モード（実験的） {#deleteinsert-mode-experimental}

歴史的に、ClickHouseは、非同期の[変更](https://sql-reference/statements/alter/index.md)の形での更新と削除に対する限られたサポートを持っていました。これらは非常に I/O 集約型で、一般的には避けるべきです。

ClickHouse 22.8 は [軽量削除](https://sql-reference/statements/delete.md) を導入しました。これらは現在実験的ですが、データを削除するためのより高性能な手段を提供します。

このモードは、`incremental_strategy` パラメータを介してモデルに構成できます。すなわち、

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

この戦略はターゲットモデルのテーブルに直接作用するため、操作中に問題が発生すると、インクリメンタルモデルのデータが無効な状態になる可能性があります - 原子的な更新はありません。

要約すると、このアプローチは次の通りです:

1. プラグインは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行はこのテーブルにストリーミングされます。
2. 現在の `actor_summary` テーブルに対して `DELETE` が発行されます。行は `actor_sumary__dbt_tmp` から id によって削除されます。
3. `actor_sumary__dbt_tmp` から `actor_summary` に行が挿入されます。

このプロセスは、以下のように示されます:

<img src={dbt_06} class="image" alt="lightweight delete incremental" style={{width: '100%'}}/>

### 挿入上書きモード（実験的） {#insert_overwrite-mode-experimental}

次の手順を実行します:

1. インクリメンタルモデル関係と同じ構造を持つステージング（仮）テーブルを作成します: `CREATE TABLE {staging} AS {target}`。
2. ステージングテーブルに新しいレコードのみを挿入します（SELECT によって生成）。
3. ターゲットテーブルにステージングテーブルに存在する新しいパーティションのみを置き換えます。

<br />

このアプローチには次の利点があります:

* テーブル全体をコピーしないため、デフォルトの戦略よりも高速です。
* INSERT 操作が成功裏に完了するまで元のテーブルを変更しないため、他の戦略よりも安全です: 中間的な失敗があった場合、元のテーブルは変更されません。
* 「パーティションの不変性」を実装し、データエンジニアリングのベストプラクティスを従います。これにより、インクリメンタルで並行処理、ロールバックなどが簡素化されます。

<img src={dbt_07} class="image" alt="insert overwrite incremental" style={{width: '100%'}}/>

## スナップショットの作成 {#creating-a-snapshot}

dbt スナップショットは、時間の経過とともに可変モデルの変更を記録することを可能にします。これにより、アナリストがモデルの以前の状態を「振り返る」ことができるポイントインタイムクエリが可能になります。これは、行が有効であった時期を記録するfrom および to 日付のカラムを使用する[タイプ 2 ゆっくり進化する次元](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row)を使用することで実現されます。この機能は ClickHouse プラグインによってサポートされ、以下に示されます。

この例では、[インクリメンタルテーブルモデルの作成](#creating-an-incremental-materialization)を完了していることを前提とします。actor_summary.sql で insert_only=True に設定しないようにしてください。あなたの models/actor_summary.sql は次のようになります:

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

   -- このフィルターはインクリメンタル実行時にのみ適用されます
   where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

   {% endif %}
   ```

1. スナップショットディレクトリに `actor_summary` というファイルを作成します。

    ```bash
     touch snapshots/actor_summary.sql
    ```

2. actor_summary.sql ファイルの内容を次のように更新します:
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

この内容に関するいくつかの観察:
* SELECT クエリは、時間の経過とともにスナップショットを取得したい結果を定義します。ref 関数は、以前に作成した actor_summary モデルを参照するために使用されます。
* レコードの変更を示すためのタイムスタンプ列が必要です。私たちの `updated_at` 列（[インクリメンタルテーブルモデルの作成](#creating-an-incremental-materialization)を参照）をここで使用できます。パラメータ strategy は、更新を示すためにタイムスタンプを使用することを示し、パラメータ updated_at は使用する列を指定します。これがモデルに存在しない場合は、代わりに [チェック戦略](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) を使用できます。これは非常に非効率で、ユーザーが比較する列のリストを指定する必要があります。dbt はこれらの列の現在の値と履歴値を比較し、変更を記録します（または同じであれば何もしません）。

3. `dbt snapshot` コマンドを実行します。

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

注意してください、スナップショットデータベースに `actor_summary_snapshot` テーブルが作成されました（target_schema パラメータによって決定されます）。

4. このデータをサンプリングすると、dbt が列 `dbt_valid_from` および `dbt_valid_to` を含めていることがわかります。後者は null に設定されています。次回の実行でこれが更新されます。

    ```sql
    SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
    ```

    ```response
    +------+----------+------------+----------+-------------------+------------+
    |id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to|
    +------+----------+------------+----------+-------------------+------------+
    |845467|Danny     |DeVito      |920       |2022-05-25 19:33:32|NULL        |
    |845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|NULL        |
    |45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL        |
    |621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL        |
    |283127|Tom       |London      |549       |2022-05-25 19:31:47|NULL        |
    +------+----------+------------+----------+-------------------+------------+
    ```

5. 我々の好きな俳優 Clicky McClickHouse をさらに 10 本の映画に出演させます。

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. `imdb` ディレクトリから dbt run コマンドを再実行します。これによりインクリメンタルモデルが更新されます。この処理が完了したら、dbt snapshot を実行して変更をキャプチャします。

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

7. もしスナップショットをクエリすると、Clicky McClickHouse に対して 2 行があることに注意してください。以前のエントリには dbt_valid_to 値があり、最新の値は同じ値を dbt_valid_from 列に持ち、dbt_valid_to 値は null です。もし新しい行があれば、これらもスナップショットに追加されます。

    ```sql
    SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
    ```

    ```response
    +------+----------+------------+----------+-------------------+-------------------+
    |id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to       |
    +------+----------+------------+----------+-------------------+-------------------+
    |845467|Danny     |DeVito      |920       |2022-05-25 19:33:32|NULL               |
    |845466|Clicky    |McClickHouse|920       |2022-05-25 19:34:37|NULL               |
    |845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|2022-05-25 19:34:37|
    |45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL               |
    |621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL               |
    +------+----------+------------+----------+-------------------+-------------------+
    ```

dbt スナップショットに関する詳しい情報は[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)をご覧ください。
## Seeds の使用 {#using-seeds}

dbt は CSV ファイルからデータをロードする機能を提供します。この機能は、大規模なデータベースのエクスポートをロードするためには適しておらず、通常はコードテーブルや [辞書](../../../../sql-reference/dictionaries/index.md) に使用される小さなファイル向けに設計されています。例えば、国コードを国名にマッピングする場合です。簡単な例として、シード機能を使用してジャンルコードのリストを生成し、アップロードします。

1. 既存のデータセットからジャンルコードのリストを生成します。dbt ディレクトリから `clickhouse-client` を使用して、`seeds/genre_codes.csv` というファイルを作成します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. `dbt seed` コマンドを実行します。これにより、CSV ファイルの行を持つ新しいテーブル `genre_codes` が、当社のデータベース `imdb_dbt` に作成されます（スキーマ構成で定義された通りです）。

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
## 制限事項 {#limitations}

現在の ClickHouse プラグインには、ユーザーが認識すべきいくつかの制限があります：

1. プラグインは現在、モデルを `INSERT TO SELECT` を使用してテーブルとして物質化します。これは実質的にデータの重複を意味します。非常に大きなデータセット（PB）は、非常に長い実行時間を引き起こす可能性があり、一部のモデルが実行不可能になる場合があります。可能な限り `GROUP BY` を活用して、クエリによって返される行の数を最小限に抑えることを目指してください。行数を維持しながら変換を行うモデルよりも、データを要約するモデルを優先してください。
2. ディストリビュートテーブルを使用してモデルを表現するには、ユーザーは各ノードの基礎となるレプリケートテーブルを手動で作成する必要があります。その上にディストリビュートテーブルを作成できます。プラグインはクラスターの作成を管理しません。
3. dbt がデータベース内にリレーション（テーブル/ビュー）を作成する際、通常は `{{ database }}.{{ schema }}.{{ table/view id }}` という形式で作成します。ClickHouse にはスキーマの概念がありません。したがって、プラグインは `{{schema}}.{{ table/view id }}` を使用し、ここで `schema` は ClickHouse のデータベースです。

さらなる情報

以前のガイドは dbt 機能の表面に触れるだけでした。ユーザーには優れた [dbt ドキュメント](https://docs.getdbt.com/docs/introduction) を読むことをお勧めします。

プラグインの追加設定については、[こちら](https://github.com/silentsokolov/dbt-clickhouse#model-configuration) を参照してください。
## Fivetran {#fivetran}

`dbt-clickhouse` コネクタは、[Fivetran transformations](https://fivetran.com/docs/transformations/dbt) でも使用可能で、`dbt` を使用して Fivetran プラットフォーム内でシームレスな統合と変換機能を提供します。
## 関連コンテンツ {#related-content}

- ブログ & ウェビナー: [ClickHouse と dbt - コミュニティからの贈り物](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
