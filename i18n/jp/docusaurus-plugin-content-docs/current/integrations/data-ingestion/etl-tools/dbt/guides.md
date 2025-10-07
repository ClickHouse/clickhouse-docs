---
'sidebar_label': 'ガイド'
'slug': '/integrations/dbt/guides'
'sidebar_position': 2
'description': 'ClickHouseと一緒に使用するためのdbtガイド'
'keywords':
- 'clickhouse'
- 'dbt'
- 'guides'
'title': 'ガイド'
'doc_type': 'guide'
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


# ガイド

<ClickHouseSupportedBadge/>

このセクションでは、dbtとClickHouseアダプタの設定に関するガイドや、dbtをClickHouseと共に使用する例について説明します。例は以下の内容を含みます。

1. dbtプロジェクトの作成とClickHouseアダプタの設定。
2. モデルの定義。
3. モデルの更新。
4. 増分モデルの作成。
5. スナップショットモデルの作成。
6. マテリアライズドビューの使用。

これらのガイドは、[ドキュメント](/integrations/dbt)および[機能と設定](/integrations/dbt/features-and-configurations)と併せて使用することを意図しています。

<TOCInline toc={toc} maxHeadingLevel={2} />

## セットアップ {#setup}

[dbtとClickHouseアダプタのセットアップ](/integrations/dbt)セクションの指示に従って、環境を準備してください。

**重要: 以下はpython 3.9でテストされています。**

### ClickHouseの準備 {#prepare-clickhouse}

dbtは高度にリレーショナルなデータをモデル化する際に優れた性能を発揮します。例の目的のために、以下のリレーショナルスキーマを持つ小さなIMDBデータセットを提供します。このデータセットは[リレーショナルデータセットリポジトリ](https://relational.fit.cvut.cz/dataset/IMDb)から取得したものです。このデータは、dbtで一般的に使用されるスキーマと比較すると単純ですが、扱いやすいサンプルを表しています。

<Image img={dbt_01} size="lg" alt="IMDBテーブルスキーマ" />

次のテーブルのサブセットを使用します。

以下のテーブルを作成します。

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
テーブル`roles`のカラム`created_at`は、デフォルトで`now()`の値を持ちます。後でこれを使用して、モデルへの増分更新を特定します - [増分モデル](#creating-an-incremental-materialization)を参照してください。
:::

`s3`関数を使用して、パブリックエンドポイントからソースデータを読み込み、データを挿入します。次のコマンドを実行してテーブルをポピュレートします。

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

これらの実行は帯域幅によって異なる場合がありますが、それぞれ数秒で完了するはずです。次のクエリを実行して、各アクターの概要を計算し、もっとも映画に出演している順に並べ、データが正常に読み込まれたことを確認します。

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

応答は次のようになります。

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

後のガイドでは、このクエリをモデルに変換し、dbtビューおよびテーブルとしてClickHouseにマテリアライズします。

## ClickHouseへの接続 {#connecting-to-clickhouse}

1. dbtプロジェクトを作成します。この場合、これを`imdb`ソースの名前にします。プロンプトが表示されたら、データベースソースとして`clickhouse`を選択します。

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

2. プロジェクトフォルダに`cd`します。

```bash
cd imdb
```

3. この時点で、お好みのテキストエディタが必要です。以下の例では、一般的なVS Codeを使用します。IMDBディレクトリを開くと、一連のymlおよびsqlファイルが表示されるはずです。

    <Image img={dbt_02} size="lg" alt="新しいdbtプロジェクト" />

4. `dbt_project.yml`ファイルを更新して、最初のモデル`actor_summary`を指定し、プロファイルを`clickhouse_imdb`に設定します。

    <Image img={dbt_03} size="lg" alt="dbtプロファイル" />

    <Image img={dbt_04} size="lg" alt="dbtプロファイル" />

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

    ユーザー名とパスワードを変更する必要があることに注意してください。追加の設定については[こちら](https://github.com/silentsokolov/dbt-clickhouse#example-profile)に記載されています。

6. IMDBディレクトリから、`dbt debug`コマンドを実行して、dbtがClickHouseに接続できるか確認します。

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

## 簡単なビューのマテリアライゼーションを作成 {#creating-a-simple-view-materialization}

ビューのマテリアライゼーションを使用する場合、モデルは毎回実行時にビューとして再構築されます。これはClickHouseの`CREATE VIEW AS`ステートメントを介して行われます。これにより、データの追加ストレージは不要ですが、テーブルマテリアライゼーションよりもクエリ速度が遅くなります。

1. `imdb`フォルダから、ディレクトリ`models/example`を削除します。

```bash
clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
```

2. `models`フォルダ内の`actors`で新しいファイルを作成します。ここでは、各アクターのモデルを表すファイルを作成します。

```bash
clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
```

3. `models/actors`フォルダに`schema.yml`と`actor_summary.sql`のファイルを作成します。

```bash
clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
```
    `schema.yml`ファイルは、私たちのテーブルを定義します。これにより、マクロ内での使用が可能になります。`models/actors/schema.yml`を次の内容に編集します。
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
    `actors_summary.sql`は、実際のモデルを定義します。構成関数では、モデルがClickHouseでビューとしてマテリアライズされることも要求します。テーブルは、関数`source`を通じて`schema.yml`ファイルから参照されます。たとえば、`source('imdb', 'movies')`は`imdb`データベースの`movies`テーブルを参照します。`models/actors/actors_summary.sql`を次の内容に編集します。
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
    最終的なactor_summaryにカラム`updated_at`を含めていることに注意してください。これは後で増分マテリアライゼーションのために使用します。

4. `imdb`ディレクトリからコマンド`dbt run`を実行します。

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

5. dbtは要求通りにClickHouseにモデルをビューとして表現します。これで、このビューを直接クエリすることができます。このビューは`imdb_dbt`データベースに作成されます - これは`~/.dbt/profiles.yml`の`clickhouse_imdb`プロファイルのスキーマパラメータによって決まります。

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

    このビューをクエリすることにより、以前のクエリの結果をよりシンプルな構文で再現することができます。

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

## テーブルマテリアライゼーションを作成 {#creating-a-table-materialization}

前の例では、モデルはビューとしてマテリアライズされました。これは、一部のクエリには十分なパフォーマンスを提供する場合がありますが、より複雑なSELECTや頻繁に実行されるクエリはテーブルとしてマテリアライズするほうが適しているかもしれません。このマテリアライゼーションは、BIツールによってクエリが実行されるモデルに対して有用で、ユーザーがより迅速な体験を得られるようにします。これは、クエリの結果を新しいテーブルとして保存することを効果的に引き起こします。ここでの関連するストレージオーバーヘッドは、実際には`INSERT TO SELECT`が実行されます。このテーブルは毎回再構築されるため、増分的ではありません。大規模な結果セットは、実行時間が長くなる可能性があります - [dbtの制限](/integrations/dbt#limitations)を参照してください。

1. `actors_summary.sql`ファイルを修正し、`materialized`パラメータを`table`に設定します。`ORDER BY`が定義されていることに注意してください。また、`MergeTree`テーブルエンジンを使用していることにも注意してください。

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
```

2. `imdb`ディレクトリから`dbt run`コマンドを実行します。この実行は少し時間がかかる可能性があり、ほとんどのマシンで約10秒かかります。

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

3. テーブル`imdb_dbt.actor_summary`の作成を確認します。

```sql
SHOW CREATE TABLE imdb_dbt.actor_summary;
```

    適切なデータ型を持つテーブルを確認してください：
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

4. このテーブルの結果が以前のレスポンスと一致することを確認してください。モデルがテーブルになったため、応答時間がかなり改善されたことに注意してください。

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

    このモデルに対して他のクエリを発行することも自由です。たとえば、映画に5回以上出現する俳優は誰ですか？

```sql
SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
```

## 増分マテリアライゼーションの作成 {#creating-an-incremental-materialization}

前の例では、モデルを素材化するためにテーブルを作成しました。このテーブルは、各dbtの実行のために再構成されます。大規模な結果セットや複雑な変換のために、これは実現不可能で非常にコストがかかる場合があります。この課題に対処し、ビルド時間を短縮するために、dbtは増分マテリアライゼーションを提供します。これにより、dbtは前回の実行以降にテーブルにレコードを挿入または更新することができ、イベントスタイルのデータに適しています。実際には、変更されたすべてのレコードを含む一時テーブルが作成され、新たに追加されたレコードと未変更のレコードが新しいターゲットテーブルに挿入されます。これにより、大規模な結果セットに対する[制限](/integrations/dbt#limitations)が、テーブルモデルと同様に生じます。

大規模な集合の制限を克服するために、アダプタは「inserts_only」モードをサポートし、すべての更新が一時テーブルを作成せずにターゲットテーブルに挿入されます（以下について詳しく説明します）。

この例を示すために、アクター「Clicky McClickHouse」を追加します。彼は驚くべき910本の映画に出演することになります - 彼が[Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc)よりも多くの映画に出演したことを保証します。

1. まず、モデルの型を増分に変更します。この追加には以下が必要です。

    1. **unique_key** - アダプタが行を一意に識別できるように、unique_keyを提供する必要があります。この場合、クエリからの`id`フィールドで十分です。これにより、マテリアライズテーブル内に行の重複がなくなります。ユニーク制約の詳細については、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)を参照してください。
    2. **Incremental filter** - 増分実行でどの行が変更されたかをdbtがどのように識別するかを指示する必要もあります。これはデルタ式を提供することによって実現されます。通常、これはイベントデータのタイムスタンプを含みます。したがって、私たちの`updated_at`タイムスタンプフィールドがここで使用されます。このカラムは、行が挿入されるときにデフォルトで`now()`の値を持ち、新しい役割を特定できるようになります。また、新しいアクターが追加される場合を識別する必要があります。既存のマテリアライズテーブルを示すために`{{this}}`変数を使用し、式を`where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`とします。これを`{% if is_incremental() %}`条件の内部に埋め込み、増分実行時のみ使用され、テーブルが最初に構築される際には使用されないことを保証します。増分モデルの行をフィルタリングする詳細については、[こちらのdbtのドキュメントの議論](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)を参照してください。

    `actor_summary.sql`ファイルを次のように更新します。

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

    モデルは`roles`および`actors`テーブルの更新と追加にのみ反応します。すべてのテーブルに反応するには、ユーザーはこのモデルを複数のサブモデルに分割することが推奨されます。それぞれが独自の増分基準を持つものです。これらのモデルはさらに参照され、接続できます。モデルのクロスリファレンスに関する詳細は[こちら](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)を参照してください。

2. `dbt run`を実行して結果テーブルの結果を確認します。

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

3. 増分更新を示すために、モデルにデータを追加します。アクター「Clicky McClickHouse」を`actors`テーブルに追加します。

```sql
INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
```

4. 「Clicky」を910本のランダムな映画に主演させましょう。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 910 OFFSET 10000;
```

5. 彼が確かに最も多く出演している俳優であることを確認するために、基となるソーステーブルをクエリし、dbtモデルをスキップします。

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

6. `dbt run`を実行し、私たちのモデルが更新され、上記の結果と一致していることを確認します。

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

### 内部構造 {#internals}

前述の増分更新を達成するために実行されたステートメントを、ClickHouseのクエリログをクエリして特定できます。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

上記のクエリの実行期間を調整してください。結果を確認するのはユーザーに任せますが、増分更新を実行するためにアダプタが使用する一般的な戦略を強調します。

1. アダプタは、一時テーブル`actor_sumary__dbt_tmp`を作成します。変更があった行は、このテーブルにストリームされます。
2. 新しいテーブル`actor_summary_new`が作成されます。古いテーブルからの行が旧テーブルから新テーブルにストリームされ、一時テーブルに行idが存在しないことを確認します。これにより、更新と重複を効果的に処理します。
3. 一時テーブルからの結果が新しい`actor_summary`テーブルにストリームされます。
4. 最後に、`EXCHANGE TABLES`ステートメントを介して新しいテーブルが古いバージョンと原子的に交換され、古いテーブルと一時テーブルは削除されます。

これは以下のように視覚化されます。

<Image img={dbt_05} size="lg" alt="増分更新dbt" />

この戦略は非常に大規模なモデルで挑戦に遭遇する可能性があります。詳細については[制限](/integrations/dbt#limitations)を参照してください。

### 追加戦略 (inserts-only mode) {#append-strategy-inserts-only-mode}

増分モデルにおける大規模データセットの制限を克服するために、アダプタはdbt設定パラメータ`incremental_strategy`を使用します。これは`append`の値に設定できます。これが設定されると、更新された行はターゲットテーブル（`imdb_dbt.actor_summary`）に直接挿入され、一時テーブルは作成されません。

注意: 追加のみのモードでは、データが不変であるか、重複が許容される必要があります。変更された行をサポートする増分テーブルモデルが必要な場合は、このモードを使用しないでください！

このモードを示すために、別の新しい俳優を追加し、`incremental_strategy='append'`でdbt runを再実行します。

1. actor_summary.sqlで追加のみのモードを設定します。

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
```

2. もう一人の有名な俳優 - ダニー・デビートを追加しましょう。

```sql
INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
```

3. ダニーを920本のランダムな映画に主演させましょう。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 920 OFFSET 10000;
```

4. dbt runを実行し、ダニーがactor-summaryテーブルに追加されたことを確認します。

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

この増分が「Clicky」の挿入と比較してどれほど早かったかに注目してください。

再度クエリログテーブルを確認すると、2つの増分実行の違いが明らかになります。

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

この実行では、新しい行のみが`imdb_dbt.actor_summary`テーブルに直接追加され、テーブルの作成は関与しません。

### 削除および挿入モード (experimental) {#deleteinsert-mode-experimental}

歴史的に、ClickHouseは非同期[ミューテーション](/sql-reference/statements/alter/index.md)の形でのみ、更新と削除の制限されたサポートを提供してきました。これらは極めてIO集約的であり、一般的に回避すべきです。

ClickHouse 22.8では[軽量削除](/sql-reference/statements/delete.md)が導入され、ClickHouse 25.7では[軽量更新](/sql-reference/statements/update)が導入されました。これらの機能の導入により、単一の更新クエリからの変更は、ユーザーの視点からは即座に発生します。

このモードは、`incremental_strategy`パラメータを介してモデルに設定できます。

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

この戦略は直接ターゲットモデルのテーブルで動作するため、操作中に問題が発生した場合、増分モデルのデータは無効な状態になる可能性があります - 原子的な更新はありません。

要約すると、このアプローチでは：

1. アダプタは一時テーブル`actor_sumary__dbt_tmp`を作成します。変更があった行は、このテーブルにストリームされます。
2. 現在の`actor_summary`テーブルに対して`DELETE`が発行されます。行は`actor_sumary__dbt_tmp`からidで削除されます。
3. `actor_sumary__dbt_tmp`から`actor_summary`に行が挿入され、`INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`が実行されます。

このプロセスは以下に示されます。

<Image img={dbt_06} size="lg" alt="軽量削除増分" />

### insert_overwriteモード (experimental) {#insert_overwrite-mode-experimental}

以下の手順を実行します。

1. 増分モデルリレーションと同じ構造のステージング（テンポラリ）テーブルを作成します： `CREATE TABLE {staging} AS {target}`。
2. 新しいレコード（SELECTによって生成された）をステージングテーブルに挿入します。
3. ターゲットテーブルに新しいパーティションのみを置き換えます（ステージングテーブルに存在）。

<br />

このアプローチには次の利点があります。

* テーブル全体をコピーしないため、デフォルトの戦略よりも速くなります。
* INSERT操作が成功裏に完了するまで元のテーブルを変更しないため、他の戦略よりも安全です：中間的な失敗があった場合、元のテーブルは変更されません。
* これはデータエンジニアリングのベストプラクティスである「パーティションの不変性」を実装します。これにより、増分および並列データ処理、ロールバックなどが簡素化されます。

<Image img={dbt_07} size="lg" alt="挿入の上書き増分" />

## スナップショットの作成 {#creating-a-snapshot}

dbtスナップショットは、時間とともに可変モデルへの変更の記録を可能にします。これにより、モデルの時点でのクエリを実行できるようになり、アナリストはモデルの以前の状態を「遡って」見ることができるようになります。これは、行が有効な時期を記録する「タイプ2の徐々に変化する次元」を使用して達成されます。この機能はClickHouseアダプタによってサポートされ、以下に示されています。

この例では、[増分テーブルモデルの作成](#creating-an-incremental-materialization)を完了していると仮定します。actor_summary.sqlが`inserts_only=True`を設定していないことを確認してください。your models/actor_summary.sqlは次のようになります。

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

1. スナップショットディレクトリにファイル`actor_summary`を作成します。

```bash
touch snapshots/actor_summary.sql
```

2. actor_summary.sqlファイルの内容を以下の内容で更新します：
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

このコンテンツに関するいくつかの観察：
* selectクエリは、時間の経過とともにスナップショットを取得したい結果を定義します。関数refは、以前に作成したactor_summaryモデルを参照するために使用されます。
* レコードの変更を示すために、タイムスタンプのカラムが必要です。`updated_at`カラム（[増分テーブルモデルの作成](#creating-an-incremental-materialization)を参照）をここで使用できます。パラメータstrategyは、更新を示すためにタイムスタンプを使用することを示し、パラメータupdated_atは使用するカラムを指定します。モデルにこれが存在しない場合は、[チェック戦略](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)を代わりに使用することができます。これは大幅に効率が悪く、ユーザーは比較するカラムのリストを指定する必要があります。dbtはこれらのカラムの現在の値と履歴の値を比較し、変更があった場合に記録します（または同一の場合は何もしません）。

3. コマンド`dbt snapshot`を実行します。

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

スナップショットデータベース（target_schemaパラメータによって決定される）に`actor_summary_snapshot`テーブルが作成されたことに注意してください。

4. このデータをサンプリングすると、dbtがカラム`dbt_valid_from`と`dbt_valid_to`を含んでいることがわかります。後者はnullに設定されています。次回の実行ではこれが更新されます。

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

5. 私たちの好きな俳優Clicky McClickHouseをさらに10本の映画に出演させましょう。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
FROM system.numbers
LIMIT 10;
```

6. `imdb`ディレクトリからdbt runコマンドを再実行します。これにより、増分モデルが更新されます。この処理が完了したら、変更をキャプチャするためにdbtスナップショットを実行します。

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

7. 今、私たちのスナップショットをクエリすると、Clicky McClickHouseの行が2つあることに気付くでしょう。以前のエントリにはdbt_valid_toの値があります。新しい値は、dbt_valid_fromカラムに同じ値が記録され、dbt_valid_toの値がnullになります。新しい行があった場合、それらもスナップショットに追加されます。

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

dbtスナップショットの詳細については[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)を参照してください。

## シードの使用 {#using-seeds}

dbtはCSVファイルからデータを読み込む機能を提供します。この機能は、大きなデータベースのエクスポートを読み込むためには適しておらず、通常、コードテーブルや[辞書](../../../../sql-reference/dictionaries/index.md)に使用される小さなファイルにより設計されています。たとえば、国コードから国名へのマッピングなどです。簡単な例として、シード機能を使用してジャンルコードのリストを生成し、その後アップロードします。

1. 既存のデータセットからジャンルコードのリストを生成します。dbtディレクトリから`clickhouse-client`を使用して、`seeds/genre_codes.csv`というファイルを作成します。

```bash
clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
"SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
```

2. `dbt seed`コマンドを実行します。これにより、csvファイルからの行を持つ新しいテーブル`genre_codes`が、データベース`imdb_dbt`（スキーマ設定によって定義されます）に作成されます。

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

3. これらが読み込まれたことを確認します。

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
