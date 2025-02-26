---
sidebar_label: dbt
slug: /integrations/dbt
sidebar_position: 1
description: Users can transform and model their data in ClickHouse using dbt
---
import TOCInline from '@theme/TOCInline';

# dbtとClickHouseの統合

**dbt** (データビルドツール) は、分析エンジニアがデータウェアハウス内のデータを単純にSELECT文を書くことで変換できるようにします。dbtはこれらのSELECT文をテーブルやビューという形でデータベース内のオブジェクトに具現化する役割を担い、[抽出・ロード・変換 (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform)のTを実行します。ユーザーはSELECT文によって定義されたモデルを作成できます。

dbt内では、これらのモデルが相互参照され、層状に構成されることで、より高次の概念を構築できるようになります。モデルを接続するために必要なボイラープレートSQLは自動的に生成され、さらにdbtはモデル間の依存関係を特定し、向き先が循環しないグラフ (DAG) を使用して適切な順序で作成されることを保証します。

dbtは[ClickHouseをサポートするプラグイン](https://github.com/ClickHouse/dbt-clickhouse)を介してClickHouseと互換性があります。ここでは、ClickHouseを公開のIMDBデータセットを用いたシンプルな例で接続する方法について説明します。また、現在のコネクタの制限事項の一部をハイライトします。

<TOCInline toc={toc} maxHeadingLevel={2} />

## 概念 {#concepts}

dbtは「モデル」という概念を導入します。これは多くのテーブルを結合する可能性のあるSQL文として定義されます。モデルは様々な方法で「具現化」されます。具現化は、モデルのSELECTクエリのビルド戦略を表します。具現化の背後にあるコードは、SELECTクエリをラップするボイラープレートSQLであり、新しい関係を作成または既存の関係を更新するための文を生成します。

dbtは以下の4種類の具現化を提供します：

* **view** (デフォルト): モデルがデータベース内のビューとして構築されます。
* **table**: モデルがデータベース内のテーブルとして構築されます。
* **ephemeral**: モデルはデータベースに直接構築されるのではなく、依存するモデルに共通テーブル式として引き込まれます。
* **incremental**: モデルは最初にテーブルとして具現化され、以降の実行では、dbtが新しい行を挿入し、変更された行をテーブル内で更新します。

追加の構文や句が、基となるデータが変更された場合にこれらのモデルがどのように更新されるべきかを定義します。dbtは一般的に、パフォーマンスが懸念されるまでビュー具現化から始めることを推奨しています。テーブル具現化は、モデルのクエリの結果をテーブルとしてキャプチャすることでクエリ時間のパフォーマンスを向上させますが、ストレージが増加します。増分アプローチはこれをさらに拡張し、基となるデータの後続の更新をターゲットテーブルにキャプチャできるようにします。

ClickHouse用の[現在のプラグイン](https://github.com/silentsokolov/dbt-clickhouse)は、**view**、**table**、**ephemeral**、および**incremental**具現化をサポートしています。このガイドでは、dbt[スナップショット](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)と[シード](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)も取り上げます。

以下のガイドでは、ClickHouseのインスタンスが利用可能であると仮定します。


## dbtとClickHouseプラグインのセットアップ {#setup-of-dbt-and-the-clickhouse-plugin}

### dbt {#dbt}

以下の例ではdbt CLIの使用を仮定します。また、ユーザーはプロジェクトを編集・実行できるWebベースの統合開発環境 (IDE) を提供する[dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview)の利用も考えるかもしれません。

dbtはCLIインストールのためのいくつかのオプションを提供しています。ここに記載された指示に従ってください[こちら](https://docs.getdbt.com/dbt-cli/install/overview)。この段階では、dbt-coreのみをインストールします。`pip`の使用を推奨します。

```bash
pip install dbt-core
```

**重要: 次はPython 3.9でテストされています。**

### ClickHouseプラグイン {#clickhouse-plugin}

dbt ClickHouseプラグインをインストールします：

```bash
pip install dbt-clickhouse
```

### ClickHouseの準備 {#prepare-clickhouse}

dbtは高度に関係するデータをモデル化する際に優れています。例として、以下の関係スキーマを持つ小さなIMDBデータセットを提供します。このデータセットは[関係データセットリポジトリ](https://relational.fit.cvut.cz/dataset/IMDb)に由来しています。これはdbtで一般的に使用されるスキーマに比べて単純ですが、扱いやすいサンプルを表します：

<img src={require('./images/dbt_01.png').default} class="image" alt="IMDBテーブルスキーマ" style={{width: '100%'}}/>

以下のテーブルのサブセットを使用します。

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
テーブル`roles`のカラム`created_at`はデフォルトで`now()`の値を取ります。これは後に、[増分モデル](#creating-an-incremental-materialization)でモデルの増分更新を識別するために使用します。
:::

`s3`関数を使用して、公共のエンドポイントからソースデータを読み込み、データを挿入します。次のコマンドを実行してテーブルをポピュレートします：

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

これらの実行時間は帯域幅によって異なるかもしれませんが、完了するまで数秒しかかからないはずです。各俳優の映画出演数で順序をつけたサマリーを計算し、データが正常にロードされたことを確認するために次のクエリを実行します：

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

応答は次のようになるはずです：

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

後のガイドでは、このクエリをモデルに変換し、ClickHouse内でdbtビューおよびテーブルとして具現化します。


## ClickHouseへの接続 {#connecting-to-clickhouse}

1. dbtプロジェクトを作成します。この場合、ソースである`imdb`を用いて名前を付けます。プロンプトが表示された場合は、データベースソースとして`clickhouse`を選択します。

    ```bash
    clickhouse-user@clickhouse:~$ dbt init imdb

    16:52:40  Running with dbt=1.1.0
    どのデータベースを使用しますか？
    [1] clickhouse

    (希望のものが見当たらない場合は？ https://docs.getdbt.com/docs/available-adapters)

    番号を入力してください: 1
    16:53:21  clickhouse用のサンプルプロファイルが見つかりません。
    16:53:21
    新しいdbtプロジェクト "imdb" が作成されました！

    profiles.ymlファイルの設定に関する詳細については、dbtドキュメントをご覧ください：

    https://docs.getdbt.com/docs/configure-your-profile
    ```

2. プロジェクトフォルダに`cd`します：

    ```bash
    cd imdb
    ```

3. この時点で好みのテキストエディタが必要です。以下の例では、人気のあるVS Codeを使用します。IMDBディレクトリを開くと、ymlおよびsqlファイルのコレクションが表示されます：

    <img src={require('./images/dbt_02.png').default} class="image" alt="新しいdbtプロジェクト" style={{width: '100%'}}/>

4. `dbt_project.yml`ファイルを更新して、最初のモデル`actor_summary`を指定し、プロファイルを`clickhouse_imdb`に設定します。

    <img src={require('./images/dbt_03.png').default} class="image" alt="dbtプロファイル" style={{width: '100%'}}/>

    <img src={require('./images/dbt_04.png').default} class="image" alt="dbtプロファイル" style={{width: '100%'}}/>

5. 次に、dbtにClickHouseインスタンスへの接続詳細を提供する必要があります。`~/.dbt/profiles.yml`に以下を追加します。

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

    ユーザー名とパスワードを変更する必要があることに注意してください。追加の設定については、[こちら](https://github.com/silentsokolov/dbt-clickhouse#example-profile)に記載されています。

6. IMDBディレクトリから、`dbt debug`コマンドを実行してdbtがClickHouseに接続できるかどうかを確認します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt debug
    17:33:53  Running with dbt=1.1.0
    dbtバージョン: 1.1.0
    pythonバージョン: 3.10.1
    pythonパス: /home/dale/.pyenv/versions/3.10.1/bin/python3.10
    os情報: Linux-5.13.0-10039-tuxedo-x86_64-with-glibc2.31
    profiles.ymlファイルを使用中 /home/dale/.dbt/profiles.yml
    dbt_project.ymlファイルを使用中 /opt/dbt/imdb/dbt_project.yml

    設定状況：
    profiles.ymlファイル [OK, 発見されて有効]
    dbt_project.ymlファイル [OK, 発見されて有効]

    必要な依存関係：
    - git [OK, 発見]

    接続：
    host: localhost
    port: 8123
    user: default
    schema: imdb_dbt
    secure: False
    verify: False
    接続テスト: [OK, 接続正常]

    全てのチェックが合格しました！
    ```

    応答に`接続テスト: [OK, 接続正常]`が含まれていることを確認し、接続が成功したことを伝えます。


## シンプルなビュー具現化の作成 {#creating-a-simple-view-materialization}

ビュー具現化を使用する場合、モデルは毎回ClickHouseで`CREATE VIEW AS`文を介してビューとして再構築されます。これにより、データの追加ストレージが不要になりますが、テーブル具現化よりもクエリの速度は遅くなります。

1. `imdb`フォルダから`models/example`ディレクトリを削除します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. `models`フォルダ内の`actors`に新しいファイルを作成します。ここで、各ファイルが俳優モデルを表します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. `models/actors`フォルダ内に`schema.yml`と`actor_summary.sql`という名前のファイルを作成します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```

    ファイル`schema.yml`はテーブルを定義します。これらは後でマクロで使用可能になります。`models/actors/schema.yml`を次の内容に編集します：
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

    `actors_summary.sql`は実際のモデルを定義します。設定関数では、ClickHouseでモデルをビューとして具現化するようにもリクエストしています。テーブルは`schema.yml`ファイルから`source`関数を介して参照されます。例えば、`source('imdb', 'movies')`は`imdb`データベース内の`movies`テーブルを指します。`models/actors/actors_summary.sql`を次の内容に編集します：
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
    最終的な`actor_summary`に`updated_at`カラムを含めていることに注目してください。これは後に、増分具現化に利用します。

4. `imdb`ディレクトリから`dbt run`コマンドを実行します。

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

5. dbtは要求通りモデルをClickHouseのビューとして表現します。これでこのビューを直接クエリできるようになりました。このビューは`~/.dbt/profiles.yml`内の`clickhouse_imdb`プロファイルに基づいて、`imdb_dbt`データベース内に作成されます。

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
    |imdb_dbt          |  <--- dbtによって作成された！
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

## テーブル具現化の作成 {#creating-a-table-materialization}

前の例では、モデルがビューとして具現化されました。これがいくつかのクエリに対して十分なパフォーマンスを提供するかもしれませんが、より複雑なSELECTや頻繁に実行されるクエリはテーブルとして具現化する方が良いかもしれません。この具現化は、BIツールによってクエリされるモデルにとって便利で、ユーザーにより迅速な体験を提供します。これにより、クエリ結果が新しいテーブルとして保存され、関連するストレージオーバーヘッドが伴います - 実質的に`INSERT TO SELECT`が実行されます。このテーブルは、そのたびに再構築されるため、増分ではありません。大きな結果セットは長い実行時間をもたらす可能性があります - [dbtの制限](#limitations)を参照してください。

1. `actors_summary.sql`ファイルを修正して、`materialized`パラメータを`table`に設定します。`ORDER BY`がどのように定義されているかに注目し、`MergeTree`テーブルエンジンを使用していることを確認してください：

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. `imdb`ディレクトリから`dbt run`コマンドを実行します。この実行には、少し時間がかかる場合があります - 多くのマシンで約10秒です。

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

    適切なデータ型を持つテーブルを確認するはずです：
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

4. このテーブルの結果が前の応答と一致することを確認します。モデルがテーブルになったことで応答時間が顕著に改善されることに注意してください：

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

    このモデルに対して他のクエリを実行してみてください。たとえば、何人の俳優が5回以上出演した映画の中で最高のランキングを持っていますか？

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank DESC LIMIT 10;
    ```


## 増分具現化の作成 {#creating-an-incremental-materialization}

前の例では、モデルを具現化するためにテーブルを作成しました。このテーブルは、各dbt実行のたびに再構築されます。これは、大きな結果セットや複雑な変換にとって、不可能で極めてコストがかかる場合があります。この課題に対処し、ビルド時間を削減するために、dbtは増分具現化を提供します。これにより、dbtは前回の実行以降にテーブルにレコードを挿入または更新することができ、イベントスタイルのデータに適しています。内部的には、すべての更新されたレコードを持つ一時テーブルが作成され、更新されていないレコードと更新されたレコードが新しいターゲットテーブルに挿入されます。これは、テーブルモデルと同様の[制限](#limitations)があるため、大きな結果セットに対する制限を持ちます。

大きなセットに対してこれらの制限を克服するために、プラグインは一時テーブルを作成することなくすべての更新をターゲットテーブルに挿入する「inserts_only」モードをサポートしています（詳細は後述します）。

この例を示すために、「Clicky McClickHouse」という俳優を追加します。彼はなんと910本もの映画に出演し、[Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc)よりも多くの映画に出演することになります。

1. まず、モデルを増分型に修正します。この追加には以下が必要です：

    1. **unique_key** - プラグインが行を一意に識別できるように、unique_keyを提供する必要があります。この場合、クエリからの`id`フィールドで十分です。これにより、具現化されたテーブル内に行の重複がなくなります。ユニーク性制約の詳細については、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)を参照ください。
    2. **増分フィルター** - 増分実行時にどの行が変更されたかをdbtに指示する必要があります。これは、デルタ式を提供することで実現します。通常、これにはイベントデータのタイムスタンプが含まれます。したがって、`updated_at`タイムスタンプフィールドを使用します。この列は、行が挿入される際にデフォルトで`now()`の値を持ち、新しい役割を識別できるようにします。さらに、新しい俳優が追加された場合の代替ケースを特定する必要があります。既存の具現化テーブルを示す`{{this}}`変数を使用すると、`where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`という式が得られます。これを`{% if is_incremental() %}`条件の中に埋め込み、増分実行時のみ使用されるようにします。増分モデルの行をフィルタリングする方法についての詳細は、[dbtドキュメントでのこの議論](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)を参照してください。

    `actor_summary.sql`ファイルを次のように更新します：

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

    -- このフィルターは、増分実行時のみ適用されます
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

    モデルは`roles`および`actors`テーブルへの更新と追加にのみ応答することに注意してください。すべてのテーブルに応答するには、このモデルを複数のサブモデルに分割することが推奨されます。各モデルには独自の増分基準が含まれ、それらのモデルを参照して接続できます。モデル間の参照についての詳細は、[こちら](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)を参照ください。

2. `dbt run`を実行し、結果のテーブルの結果を確認してください：

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

3. モデルにデータを追加して増分更新を示します。「Clicky McClickHouse」を`actors`テーブルに追加します：

    ```sql
    INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
    ```

4. 「Clicky」が910本の映画に出演することにしましょう：

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
    FROM imdb.movies;
```
```sql
LIMIT 910 OFFSET 10000;
```

5. 彼が実際に最も出演回数の多い俳優であるかを確認するために、基盤となるソーステーブルをクエリし、任意の dbt モデルをバイパスします:

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

6. `dbt run` を実行し、私たちのモデルが更新され、上記の結果と一致しているか確認します:

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
### Internals {#internals}

上記の増分更新を達成するために実行されたステートメントを ClickHouse のクエリログをクエリすることで特定できます。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

上記のクエリを実行期間に調整します。結果の検査はユーザーにお任せしますが、増分更新を行うためにプラグインが使用する一般的な戦略を強調します：

1. プラグインは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行がこのテーブルにストリーミングされます。
2. 新しいテーブル `actor_summary_new` が作成されます。古いテーブルからの行は、今度は古いテーブルから新しいテーブルにストリーミングされ、一時テーブルに行 ID が存在しないことを確認します。これにより、更新と重複が効果的に処理されます。
3. 一時テーブルからの結果が新しい `actor_summary` テーブルにストリーミングされます。
4. 最後に、新しいテーブルが古いバージョンと原子的に交換されます。古いテーブルと一時テーブルはその後削除されます。

この様子は以下のように視覚化されます：

<img src={require('./images/dbt_05.png').default} class="image" alt="incremental updates dbt" style={{width: '100%'}}/>

この戦略は非常に大きなモデルでの課題に直面する可能性があります。詳細については [Limitations](#limitations) を参照してください。

### Append Strategy (inserts-only mode) {#append-strategy-inserts-only-mode}

増分モデルにおける大規模データセットの限界を克服するために、プラグインは dbt 設定パラメータ `incremental_strategy` を使用します。これを `append` の値に設定することで、更新された行が対象テーブル（a.k.a `imdb_dbt.actor_summary`）に直接挿入され、一時テーブルは作成されません。
注意: Append のみのモードでは、データが不変であるか重複が許容されている必要があります。変更された行をサポートする増分テーブルモデルが必要な場合は、このモードを使用しないでください！

このモードを示すために、別の新しい俳優を追加し、`incremental_strategy='append'` で dbt run を再実行します。

1. actor_summary.sql で append のみのモードを設定します:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. もう一人の有名な俳優、ダニー・デビトを追加します。

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
   |845467|Danny DeBito       |920       |1.4768987303293204|21    |670      |2022-04-26 16:22:06|
   |845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
   |45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
   +------+-------------------+----------+------------------+------+---------+-------------------+
   ```

Note how much faster that incremental was compared to the insertion of "Clicky".

Checking again the query_log table reveals the differences between the 2 incremental runs:

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
   -- this filter will only be applied on an incremental run
   where id > (select max(id) from imdb_dbt.actor_summary) or updated_at > (select max(updated_at) from imdb_dbt.actor_summary)
   ```

この実行では、新しい行のみが直接 `imdb_dbt.actor_summary` テーブルに追加され、テーブルの作成は含まれません。

### Delete+Insert mode (Experimental) {#deleteinsert-mode-experimental}

歴史的に ClickHouse は、非同期 [Mutations](/sql-reference/statements/alter/index.md) の形で削除および更新のサポートが限られていました。これらは非常に IO 集中型であり、一般的には避けるべきです。

ClickHouse 22.8 では [Lightweight deletes](/sql-reference/statements/delete.md) が導入されました。これらは現在実験的ですが、データを削除するよりパフォーマンスの高い手段を提供します。

このモードは、モデル用に `incremental_strategy` パラメータを介して設定できます。すなわち、

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

この戦略は、対象モデルのテーブルに直接作用するため、操作中に問題が発生すると、増分モデルのデータが無効な状態になる可能性があります - 原子的更新はありません。

要約すると、このアプローチは次のように進行します：

1. プラグインは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行がこのテーブルにストリーミングされます。
2. 現在の `actor_summary` テーブルに対して `DELETE` が発行されます。行は一時テーブル `actor_sumary__dbt_tmp` から ID によって削除されます。
3. `actor_sumary__dbt_tmp` の行が `actor_summary` に挿入されます。

このプロセスは以下に示されます：

<img src={require('./images/dbt_06.png').default} class="image" alt="lightweight delete incremental" style={{width: '100%'}}/>

### insert_overwrite mode (Experimental) {#insert_overwrite-mode-experimental}
次の手順を実行します：

1. 増分モデル関係と同じ構造のステージング（一時）テーブルを作成します: `CREATE TABLE {staging} AS {target}`。
2. ステージングテーブルに新しいレコード（SELECT によって生成された）を挿入します。
3. 対象テーブルに対してステージングテーブルの新しいパーティションのみを置き換えます。

<br />

このアプローチには以下の利点があります：

* 完成したテーブル全体をコピーしないため、デフォルト戦略よりも速いです。
* INSERT 操作が正常に完了するまで元のテーブルを変更しないため、他の戦略よりも安全です: 中間的な障害が発生した場合でも元のテーブルは変更されません。
* "partitions immutability" データエンジニアリングのベストプラクティスを実装しています。これにより、増分および並行データ処理、ロールバックなどが簡素化されます。

<img src={require('./images/dbt_07.png').default} class="image" alt="insert overwrite incremental" style={{width: '100%'}}/>

## Creating a Snapshot {#creating-a-snapshot}

dbt スナップショットを使用すると、変更の記録が可能になります。これにより、アナリストはモデルの過去の状態を「振り返る」ことができるポイント・イン・タイムクエリが可能になります。この処理は、行が有効だった時期を記録するための From と To の日付列を使用した [type-2 Slowly Changing Dimensions](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) によって実現されます。この機能は ClickHouse プラグインによってサポートされており、以下に示します。

この例では、[Creating an Incremental Table Model](#creating-an-incremental-materialization) を完了していると仮定します。actor_summary.sql で inserts_only=True を設定しないようにしましょう。models/actor_summary.sql は以下のようになります：

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

-- このフィルターは増分実行時にのみ適用されます
where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

{% endif %}
```

1. スナップショットディレクトリに `actor_summary` ファイルを作成します。

```bash
 touch snapshots/actor_summary.sql
```

2. actor_summary.sql ファイルの内容を以下のように更新します：
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

この内容に関するいくつかの観察事項：
* select クエリは、時間の経過に伴うスナップショットを取りたい結果を定義します。関数 ref は、以前に作成した actor_summary モデルを参照するために使用されます。
* レコードの変更を示すためにタイムスタンプ列が必要です。前述の updated_at 列（[Creating an Incremental Table Model](#creating-an-incremental-materialization) を参照）をここで使用できます。パラメータ strategy は、更新を示すためにタイムスタンプを使用することを示しており、parameter updated_at は使用する列を指定します。これがモデルに存在しない場合は、[check strategy](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) を代わりに使用できます。これはかなり非効率的であり、ユーザーが比較する列のリストを指定する必要があります。dbt はこれらの列の現在の値と過去の値を比較し、変更を記録します（または同じであれば何もしません）。

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

actor_summary_snapshot というテーブルがスナップショットデータベースに作成されたことに注意してください（target_schema パラメータで決定）。

4. このデータをサンプリングすると、dbt が dbt_valid_from と dbt_valid_to 列を含めていることが確認できます。後者は null に設定されています。次回以降の実行でこれが更新されます。

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

5. お気に入りの俳優 Clicky McClickHouse を他の10本の映画に出演させます。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
FROM system.numbers
LIMIT 10;
```

6. imdb ディレクトリから dbt run コマンドを再実行します。これにより、増分モデルが更新されます。これが完了したら、変更をキャプチャするために dbt snapshot を実行します。

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

7. スナップショットをクエリすると、Clicky McClickHouse の行が 2 行になっていることに注意してください。以前のエントリには dbt_valid_to 値があり、新しい値は dbt_valid_from 列に同じ値で記録され、dbt_valid_to 値は null です。新しい行があれば、これらもスナップショットに追加されます。

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

dbt スナップショットの詳細については、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots) を参照してください。

## Using Seeds {#using-seeds}

dbt は CSV ファイルからデータをロードする機能を提供します。この機能は、大規模なデータベースのエクスポートをロードするのには適しておらず、通常、コードテーブルや [dictionary](../../../../sql-reference/dictionaries/index.md) 用の小ファイルに設計されています。たとえば、国コードを国名にマッピングする場合です。簡単な例として、シード機能を使用してジャンルコードのリストを生成し、アップロードします。

1. 既存のデータセットからジャンルコードのリストを生成します。dbt ディレクトリから `clickhouse-client` を使用して、ファイル `seeds/genre_codes.csv` を作成します：

```bash
clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
"SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
```

2. `dbt seed` コマンドを実行します。これにより、CSV ファイルからの行を持つ新しいテーブル `genre_codes` がデータベース `imdb_dbt` に作成されます（スキーマ設定で定義されています）。

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
+-------+----+
```

## Limitations {#limitations}

現在の ClickHouse プラグインには、ユーザーが注意すべきいくつかの制限があります：

1. プラグインは現在、モデルをテーブルとして `INSERT TO SELECT` を使用してマテリアライズします。これは実質的にデータの重複を意味します。非常に大きなデータセット（PB）は、非常に長い実行時間を引き起こす可能性があり、一部のモデルは実行不可能になる可能性があります。クエリによって返される行数を最小限に抑えることを目指し、可能な限り GROUP BY を利用してください。データを単に変換するモデルよりも、データを要約するモデルを選択してください。
2. 分散テーブルをモデルとして表現するには、ユーザーが各ノードに基盤となるレプリケートテーブルを手動で作成する必要があります。分散テーブルは、これらの上に作成できます。プラグインはクラスター作成を管理しません。
3. dbt がデータベース内にリレーション（テーブル/ビュー）を作成する際、通常は `{{ database }}.{{ schema }}.{{ table/view id }}` という形式で作成します。ClickHouse にはスキーマの概念がありません。したがって、プラグインは `{{schema}}.{{ table/view id }}` を使用します。ここで `schema` は ClickHouse データベースを示します。

さらなる情報

以前のガイドは dbt 機能の表面をわずかに触れるものです。ユーザーは素晴らしい [dbt ドキュメント](https://docs.getdbt.com/docs/introduction) を読むことをお勧めします。

プラグインの追加設定については、[こちら](https://github.com/silentsokolov/dbt-clickhouse#model-configuration) に記載されています。

## Fivetran {#fivetran}

`dbt-clickhouse` コネクタは、[Fivetran transformations](https://fivetran.com/docs/transformations/dbt) でも使用可能で、Fivetran プラットフォーム内で `dbt` を使用してシームレスな統合と変換機能を実現します。

## Related Content {#related-content}

- Blog & Webinar: [ClickHouse and dbt - A Gift from the Community](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
