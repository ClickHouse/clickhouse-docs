---
sidebar_label: 'ガイド'
slug: /integrations/dbt/guides
sidebar_position: 2
description: 'ClickHouse で dbt を利用するためのガイド'
keywords: ['clickhouse', 'dbt', 'guides']
title: 'ガイド'
doc_type: 'guide'
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

# ガイド {#guides}

<ClickHouseSupportedBadge/>

このセクションでは、dbt と ClickHouse アダプターのセットアップ方法に加え、一般公開されている IMDB データセットを用いて dbt と ClickHouse を連携させる例を紹介します。この例では、次の手順を取り上げます。

1. dbt プロジェクトを作成し、ClickHouse アダプターをセットアップする。
2. モデルを定義する。
3. モデルを更新する。
4. インクリメンタルモデルを作成する。
5. スナップショットモデルを作成する。
6. マテリアライズドビューを使用する。

これらのガイドは、他の [ドキュメント](/integrations/dbt) や [機能と設定](/integrations/dbt/features-and-configurations) と併せて利用することを想定しています。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## セットアップ {#setup}

環境を準備するには、[dbt と ClickHouse アダプターのセットアップ](/integrations/dbt) セクションの手順に従ってください。

**重要: 以下は python 3.9 環境で検証されています。**

### ClickHouse の準備 {#prepare-clickhouse}

dbt はリレーショナル性の高いデータのモデリングに優れています。例として、次のようなリレーショナルスキーマを持つ小さな IMDB データセットを用意しています。このデータセットは [relational dataset repository](https://relational.fit.cvut.cz/dataset/IMDb) に由来します。これは dbt で一般的に使われるスキーマと比べると単純ですが、扱いやすいサンプルになっています。

<Image img={dbt_01} size="lg" alt="IMDB テーブルスキーマ" />

ここでは、これらのテーブルの一部のみを使用します。

次のテーブルを作成します。

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
テーブル `roles` のカラム `created_at` には、デフォルト値として `now()` が設定されています。後でこのカラムを使用してモデルへの増分更新を特定します。詳しくは [Incremental Models](#creating-an-incremental-materialization) を参照してください。
:::

`s3` 関数を使用して、パブリックエンドポイントからソースデータを読み込み、データを挿入します。次のコマンドを実行してテーブルにデータを投入します。

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

これらの実行時間はネットワーク帯域によって多少異なりますが、いずれも数秒で完了するはずです。各俳優ごとのサマリーを算出し、出演本数の多い順に並べるとともに、データが正常に読み込まれていることを確認するために、次のクエリを実行してください。

```sql
SELECT id,
       any(actor_name)          AS name,
       uniqExact(movie_id)    AS num_movies,
       avg(rank)                AS avg_rank,
       uniqExact(genre)         AS unique_genres,
       uniqExact(director_name) AS uniq_directors,
       max(created_at)          AS updated_at
FROM (
         SELECT imdb.actors.id  AS id,
                concat(imdb.actors.first_name, ' ', imdb.actors.last_name)  AS actor_name,
                imdb.movies.id AS movie_id,
                imdb.movies.rank AS rank,
                genre,
                concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
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

レスポンスは次のようになります：

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

後続のガイドでは、このクエリをモデル化し、ClickHouse 上で dbt のビューおよびテーブルとしてマテリアライズします。

## ClickHouse への接続 {#connecting-to-clickhouse}

1. dbt プロジェクトを作成します。ここでは、`imdb` ソースにちなんでこの名前を付けます。プロンプトが表示されたら、データベースとして `clickhouse` を選択します。

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

2. `cd` を使ってプロジェクトフォルダに移動します。

    ```bash
    cd imdb
    ```

3. ここで、お好みのテキストエディタが必要になります。以下の例では、広く利用されている VS Code を使用します。IMDB ディレクトリを開くと、複数の yml および sql ファイルが表示されるはずです。

    <Image img={dbt_02} size="lg" alt="新しい dbt プロジェクト" />

4. `dbt_project.yml` ファイルを更新して、最初のモデル `actor_summary` を指定し、プロファイルを `clickhouse_imdb` に設定します。

    <Image img={dbt_03} size="lg" alt="dbt プロファイル" />

    <Image img={dbt_04} size="lg" alt="dbt プロファイル" />

5. 次に、ClickHouse インスタンスへの接続情報を dbt に提供する必要があります。以下を `~/.dbt/profiles.yml` に追加します。

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

    `user` と `password` を変更する必要がある点に注意してください。利用可能な追加設定は[こちら](https://github.com/silentsokolov/dbt-clickhouse#example-profile)に記載されています。

6. IMDB ディレクトリから、`dbt debug` コマンドを実行し、dbt が ClickHouse に接続できるかどうかを確認します。

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

    レスポンスに `Connection test: [OK connection ok]` が含まれていることを確認してください。これは接続が成功していることを示しています。

## シンプルなビュー・マテリアライゼーションの作成 {#creating-a-simple-view-materialization}

ビュー・マテリアライゼーションを使用する場合、モデルは ClickHouse の `CREATE VIEW AS` ステートメントを通じて、実行のたびにビューとして再構築されます。これは追加のデータストレージは必要ありませんが、テーブル・マテリアライゼーションに比べてクエリの実行は遅くなります。

1. `imdb` フォルダから、ディレクトリ `models/example` を削除します:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. `models` フォルダ内に `actors` ディレクトリを作成します。ここには、それぞれがアクター・モデルを表すファイルを作成していきます:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. `models/actors` フォルダに `schema.yml` と `actor_summary.sql` ファイルを作成します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```
    `schema.yml` ファイルは、使用するテーブルを定義します。これらは後でマクロ内で利用できるようになります。
    `models/actors/schema.yml` を編集し、次の内容を記述します:
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
    `actors_summary.sql` は実際のモデルを定義します。`config` 関数では、ClickHouse 上でモデルをビューとしてマテリアライズするように指定している点にも注目してください。テーブルは `schema.yml` ファイルから `source` 関数を通じて参照されます。例えば、`source('imdb', 'movies')` は `imdb` データベース内の `movies` テーブルを参照します。`models/actors/actors_summary.sql` を編集し、次の内容を記述します:
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
    最終的な `actor_summary` に `updated_at` カラムを含めている点に注意してください。これは後でインクリメンタル・マテリアライゼーションで使用します。

4. `imdb` ディレクトリからコマンド `dbt run` を実行します。

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

5. 指定どおり、dbt は ClickHouse 上でこのモデルをビューとして作成します。これで、このビューを直接クエリできるようになりました。このビューは `imdb_dbt` データベース内に作成されます。どのデータベースに作成されるかは、`clickhouse_imdb` プロファイル配下のファイル `~/.dbt/profiles.yml` 内にある schema パラメータによって決まります。

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
    |imdb_dbt          |  <---created by dbt!
    |information_schema|
    |system            |
    +------------------+
    ```

   このビューに対してクエリを実行することで、より簡潔な構文で先ほどのクエリ結果を再現できます:

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

前の例では、モデルはビューとしてマテリアライズされていました。これは一部のクエリには十分なパフォーマンスを提供しますが、より複雑な SELECT や頻繁に実行されるクエリは、テーブルとしてマテリアライズした方がよい場合があります。このマテリアライゼーションは、BI ツールからクエリされるモデルに対して有用であり、ユーザーがより高速な応答を得られるようにします。これにより、クエリ結果が新しいテーブルとして保存されることになり、その分のストレージオーバーヘッドが発生します。実質的には `INSERT TO SELECT` が実行されます。このテーブルは毎回再作成される点に注意してください。つまりインクリメンタルではありません。そのため結果セットが大きい場合、実行時間が長くなる可能性があります。詳細は [dbt の制限事項](/integrations/dbt#limitations) を参照してください。

1. ファイル `actors_summary.sql` を変更し、`materialized` パラメータを `table` に設定します。`ORDER BY` がどのように定義されているか、また `MergeTree` テーブルエンジンを使用している点に注目してください:

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. `imdb` ディレクトリからコマンド `dbt run` を実行します。この実行には少し時間がかかる場合があり、多くのマシンでは約 10 秒程度です。

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

3. テーブル `imdb_dbt.actor_summary` が作成されたことを確認します:

    ```sql
    SHOW CREATE TABLE imdb_dbt.actor_summary;
    ```

    適切なデータ型でテーブルが作成されていることを確認できるはずです:
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

4. このテーブルからの結果が、以前の結果と整合していることを確認します。モデルがテーブルになったことで、レスポンス時間が大きく改善している点に注目してください:

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

このモデルに対して、他のクエリも自由に実行してください。たとえば、5 本以上の映画に出演していて、その出演作の中で最も評価の高い作品を持つ俳優は誰かを問い合わせることができます。

```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```

## インクリメンタルマテリアライゼーションの作成 {#creating-an-incremental-materialization}

前の例では、モデルをマテリアライズするためのテーブルを作成しました。このテーブルは、dbt の各実行ごとに再構築されます。これは、結果セットが大きい場合や複雑な変換を行う場合には、実行不可能または非常にコストが高くなる可能性があります。この課題に対処し、ビルド時間を短縮するために、dbt はインクリメンタルマテリアライゼーションを提供しています。これにより、dbt は前回の実行以降にテーブルへレコードを挿入または更新するだけで済むようになり、イベントスタイルのデータに適した方式となります。内部的には、更新されたすべてのレコードを含む一時テーブルが作成され、その後、変更されていないレコードと更新されたレコードの両方が新しいターゲットテーブルに挿入されます。その結果、大きな結果セットに対する制約は、テーブルモデルの場合と同様の[制限事項](/integrations/dbt#limitations)となります。

大きなデータセットに対するこれらの制限を解消するために、アダプターは「inserts_only」モードをサポートしています。このモードでは、一時テーブルを作成せずに、すべての更新をターゲットテーブルへの挿入として扱います（詳細は後述します）。

この例を説明するために、「Clicky McClickHouse」という俳優を追加します。彼は驚異の 910 本の映画に出演しており、[Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc) よりも多くの作品に出演していることになります。

1. まず、モデルをインクリメンタルタイプに変更します。この変更には次の指定が必要です。

    1. **unique_key** - アダプターが行を一意に識別できるようにするため、`unique_key` を指定する必要があります。この例では、クエリの `id` フィールドで十分です。これにより、マテリアライズされたテーブル内に行の重複が発生しないことが保証されます。一意性制約の詳細については、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)を参照してください。
    2. **インクリメンタルフィルタ** - インクリメンタル実行時に、どの行が変更されたかを dbt にどのように判定させるかを指定する必要があります。これはデルタ式を指定することで実現します。通常、イベントデータではタイムスタンプを使用するため、`updated_at` タイムスタンプフィールドを利用します。このカラムは、行が挿入されるときにデフォルトで `now()` の値が設定されるため、新しい行を識別できます。加えて、新しい俳優が追加されるケースも識別する必要があります。既存のマテリアライズされたテーブルを表す `{{this}}` 変数を使用すると、式は `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})` となります。これを `{% if is_incremental() %}` 条件の中に埋め込み、テーブルが最初に作成されるときではなく、インクリメンタル実行時にのみ使用されるようにします。インクリメンタルモデルでの行のフィルタリングの詳細については、[dbt ドキュメントでのこの解説](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)を参照してください。

    `actor_summary.sql` ファイルを次のように更新します：

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

    -- this filter will only be applied on an incremental run
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

`roles` テーブルと `actors` テーブルに対する更新や追加にのみ、このモデルが反応する点に注意してください。すべてのテーブルの変更に対応させるには、このモデルを複数のサブモデルに分割し、それぞれに独自のインクリメンタル条件を設定することを推奨します。これらのモデルは相互に参照し、接続できます。モデル間の相互参照の詳細については[こちら](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)を参照してください。

2. `dbt run` を実行し、生成されたテーブルの結果を確認します:

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

3. ここではインクリメンタル更新を説明するために、モデルにデータを追加します。`actors` テーブルに俳優「Clicky McClickHouse」を追加します:

```sql
INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
```

4. 次に「Clicky」をランダムな 910 本の映画に出演させます:

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 910 OFFSET 10000;
```

5. 元のソーステーブルをクエリし、dbt モデルを経由せずに、彼が実際に最も多く出演している俳優になっていることを確認します:

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

6. `dbt run` を実行し、モデルが更新され、上記の結果と一致していることを確認します:

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

### 内部動作 {#internals}

上記の増分更新を実現するために実行されたステートメントは、ClickHouse のクエリログを参照することで確認できます。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

上記のクエリを、実行対象の期間に合わせて調整してください。結果の確認は読者に委ねますが、アダプターがインクリメンタル更新を行う際に用いる一般的な戦略を次に示します。

1. アダプターは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行はこのテーブルにストリーミングされます。
2. 新しいテーブル `actor_summary_new` が作成されます。旧テーブルから新テーブルへ行が順にストリーミングされ、その際、一時テーブルに行 ID が存在しないことをチェックします。これにより更新および重複が効果的に処理されます。
3. 一時テーブルの結果が新しい `actor_summary` テーブルにストリーミングされます。
4. 最後に、新しいテーブルが `EXCHANGE TABLES` ステートメントを介して旧バージョンとアトミックに入れ替えられます。その後、旧テーブルと一時テーブルは削除されます。

この処理フローは以下のように表現できます。

<Image img={dbt_05} size="lg" alt="dbt によるインクリメンタル更新" />

この戦略は、非常に大きなモデルでは問題が発生する可能性があります。詳細については [Limitations](/integrations/dbt#limitations) を参照してください。

### Append Strategy（挿入のみモード） {#append-strategy-inserts-only-mode}

インクリメンタルモデルにおける大規模データセットの制約を回避するために、アダプターは dbt の設定パラメータ `incremental_strategy` を使用します。これは `append` に設定できます。これを設定すると、更新された行はターゲットテーブル（`imdb_dbt.actor_summary`）に直接挿入され、一時テーブルは作成されません。
注意: Append only モードでは、データが不変であるか、重複を許容できる必要があります。更新された行をサポートするインクリメンタルテーブルモデルが必要な場合、このモードは使用しないでください。

このモードを説明するために、新たに別の俳優を追加し、`incremental_strategy='append'` を指定して `dbt run` を再実行します。

1. actor&#95;summary.sql で append only モードを設定します:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. もう一人有名な俳優 Danny DeBito を追加します。

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. Danny を 920 本のランダムな映画に出演させます。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 920 OFFSET 10000;
```

4. `dbt run` を実行し、Danny が actor-summary テーブルに追加されたことを確認します

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

このインクリメンタル実行が、「Clicky」を挿入したときと比べてどれだけ高速だったかに注目してください。

再度 `query_log` テーブルを確認すると、2 回のインクリメンタル実行の違いが分かります。

```sql
INSERT INTO imdb_dbt.actor_summary ("id", "name", "num_movies", "avg_rank", "genres", "directors", "updated_at")
WITH actor_summary AS (
   SELECT id,
      any(actor_name) AS name,
      uniqExact(movie_id)    AS num_movies,
      avg(rank)                AS avg_rank,
      uniqExact(genre)         AS genres,
      uniqExact(director_name) AS directors,
      max(created_at) AS updated_at
   FROM (
      SELECT imdb.actors.id AS id,
         concat(imdb.actors.first_name, ' ', imdb.actors.last_name) AS actor_name,
         imdb.movies.id AS movie_id,
         imdb.movies.rank AS rank,
         genre,
         concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
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

SELECT *
FROM actor_summary
-- this filter will only be applied on an incremental run
WHERE id > (SELECT max(id) FROM imdb_dbt.actor_summary) OR updated_at > (SELECT max(updated_at) FROM imdb_dbt.actor_summary)
   ```

この実行では、新しい行だけが直接 `imdb_dbt.actor_summary` テーブルに追加され、テーブルの作成は行われません。

### 削除および挿入モード（実験的） {#deleteinsert-mode-experimental}

歴史的には、ClickHouse は非同期の [Mutations](/sql-reference/statements/alter/index.md) としてのみ、更新および削除を限定的にサポートしていました。これらは非常に I/O 負荷が高く、一般的には避けるべきです。

ClickHouse 22.8 で [lightweight deletes](/sql-reference/statements/delete.md)、ClickHouse 25.7 で [lightweight updates](/sql-reference/statements/update) が導入されました。これらの機能の導入により、単一の更新クエリによる変更は、たとえ非同期にマテリアライズされる場合でも、ユーザーの視点からは即座に反映されるようになりました。

このモードは、`incremental_strategy` パラメータによってモデルに対して設定できます。例えば、

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

This strategy operates directly on the target model&#39;s table, so if there is an issue during the operation, the data in the incremental model is likely to be in an invalid state - there is no atomic update.

In summary, this approach:

1. The adapter creates a temporary table `actor_sumary__dbt_tmp`. Rows that have changed are streamed into this table.
2. A `DELETE` is issued against the current `actor_summary` table. Rows are deleted by id from `actor_sumary__dbt_tmp`
3. The rows from `actor_sumary__dbt_tmp` are inserted into `actor_summary` using an `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`.

This process is shown below:

<Image img={dbt_06} size="lg" alt="軽量な delete インクリメンタル" />

### insert&#95;overwrite mode (experimental) {#insert_overwrite-mode-experimental}

Performs the following steps:

1. Create a staging (temporary) table with the same structure as the incremental model relation: `CREATE TABLE {staging} AS {target}`.
2. Insert only new records (produced by SELECT) into the staging table.
3. Replace only new partitions (present in the staging table) into the target table.

<br />

This approach has the following advantages:

* It is faster than the default strategy because it doesn&#39;t copy the entire table.
* It is safer than other strategies because it doesn&#39;t modify the original table until the INSERT operation completes successfully: in case of intermediate failure, the original table is not modified.
* It implements &quot;partitions immutability&quot; data engineering best practice. Which simplifies incremental and parallel data processing, rollbacks, etc.

<Image img={dbt_07} size="lg" alt="insert overwrite インクリメンタル" />

## スナップショットの作成 {#creating-a-snapshot}

dbt のスナップショット機能を使用すると、更新可能なモデルに対する変更を時間の経過とともに記録できます。これにより、アナリストはモデルに対して任意時点のクエリを実行し、モデルの過去の状態を「遡って」確認できるようになります。これは、行が有効であった期間を記録する from 日付列および to 日付列を持つ [タイプ 2 のゆっくり変化する次元 (Slowly Changing Dimensions)](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) を使用して実現されます。この機能は ClickHouse アダプターでサポートされており、以下に示します。

この例では、[増分テーブルモデルの作成](#creating-an-incremental-materialization) を完了していることを前提とします。actor&#95;summary.sql で inserts&#95;only=True を設定していないことを確認してください。models/actor&#95;summary.sql は次のようになっている必要があります。

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

   -- this filter will only be applied on an incremental run
   where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

   {% endif %}
   ```

1. snapshots ディレクトリ内に `actor_summary` ファイルを作成します。

   ```bash
     touch snapshots/actor_summary.sql
    ```

2. `actor_summary.sql` ファイルの内容を、次の内容に更新します:
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

この内容について、いくつか補足します:

* `select` クエリは、時間の経過とともにスナップショットを取得したい結果セットを定義します。`ref` 関数は、先ほど作成した `actor_summary` モデルを参照するために使用されます。
* レコードの変更を示すために、タイムスタンプ列が必要です。ここでは updated&#95;at 列（[インクリメンタルテーブルモデルの作成](#creating-an-incremental-materialization) を参照）を使用できます。`strategy` パラメータは、更新を示すためにタイムスタンプを使用することを指定し、`updated_at` パラメータで使用する列を指定します。モデルにこの列が存在しない場合は、代わりに [check strategy](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) を使用できます。これは著しく非効率的であり、比較対象とする列のリストをユーザーが指定する必要があります。dbt はこれらの列の現在の値と履歴の値を比較し、変更があれば記録します（同一であれば何もしません）。

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

snapshots データベース内に target&#95;schema パラメータで指定されたテーブル actor&#95;summary&#95;snapshot が作成されていることに注目してください。

4. このデータをサンプリングすると、dbt によって dbt&#95;valid&#95;from と dbt&#95;valid&#95;to というカラムが含まれていることが分かります。後者には null が設定されています。以降の実行でこの値が更新されます。

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

5. お気に入りの俳優 Clicky McClickHouse を、さらに 10 本の映画に出演させます。

   ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. `imdb` ディレクトリから `dbt run` コマンドを再実行します。これによりインクリメンタルモデルが更新されます。完了したら、変更をキャプチャするために dbt snapshot を実行します。

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

clickhouse-user@clickhouse:~/imdb$ dbt snapshot
13:46:26  dbt=1.1.0 で実行中
13:46:26  1 個の model、0 個の tests、1 個の snapshot、0 個の analyses、181 個の macros、0 個の operations、0 個の seed files、3 個の sources、0 個の exposures、0 個の metrics を検出しました
13:46:26
13:46:27  同時実行: 1 スレッド (target=&#39;dev&#39;)
13:46:27
13:46:27  1 of 1 START snapshot snapshots.actor&#95;summary&#95;snapshot...................... [RUN]
13:46:31  1 of 1 OK snapshotted snapshots.actor&#95;summary&#95;snapshot...................... [OK in 4.05s]
13:46:31
13:46:31  1 個の snapshot の実行が 5.02s で完了
13:46:31
13:46:31  正常に完了しました
13:46:31
13:46:31  完了。PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1

```sql
    SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
    ```sql
 SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
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

dbt スナップショットの詳細については、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)を参照してください。

## シードの使用 {#using-seeds}

dbt には、CSV ファイルからデータをロードする機能があります。この機能はデータベースの大規模なエクスポートをロードする用途には適しておらず、コードテーブルや[ディクショナリ](../../../../sql-reference/dictionaries/index.md)で一般的に使用される小さなファイル向けに設計されています。たとえば、国コードを国名にマッピングする用途などです。簡単な例として、シード機能を使用してジャンルコードの一覧を生成し、アップロードします。

1. 既存のデータセットからジャンルコードの一覧を生成します。dbt ディレクトリから、`clickhouse-client` を使用してファイル `seeds/genre_codes.csv` を作成します:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. `dbt seed` コマンドを実行します。これにより、スキーマ設定で定義されたとおりに、CSV ファイルの行を含む新しいテーブル `genre_codes` がデータベース `imdb_dbt` 内に作成されます。

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

3. データがロードされたことを確認します:

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

## さらに詳しい情報 {#further-information}

これまでのガイドでは、dbt の機能のごく一部にしか触れていません。詳しくは、非常に優れた [公式 dbt ドキュメント](https://docs.getdbt.com/docs/introduction) を参照してください。
