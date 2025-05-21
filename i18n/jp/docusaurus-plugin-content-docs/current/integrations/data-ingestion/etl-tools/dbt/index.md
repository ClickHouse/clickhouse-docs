---
sidebar_label: 'dbt'
slug: /integrations/dbt
sidebar_position: 1
description: 'ユーザーは dbt を使用して ClickHouse でデータを変換し、モデル化できます'
title: 'dbt と ClickHouse の統合'
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

# dbt と ClickHouse の統合

<ClickHouseSupportedBadge/>

**dbt** (data build tool) は、アナリティクスエンジニアが単純に SELECT ステートメントを記述することによりデータウェアハウス内のデータを変換できるようにします。 dbt は、これらの SELECT ステートメントをデータベース内のテーブルやビューといったオブジェクトに具現化する作業を行います - [抽出・ロード・変換 (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) の「変換 (T)」を実行します。 ユーザーは、SELECT ステートメントで定義されたモデルを作成できます。

dbt 内では、これらのモデルを参照し合ったり、レイヤー化して高レベルの概念を構築することができます。 モデルを接続するためのボイラープレート SQL が自動的に生成されます。 さらに、dbt はモデル間の依存関係を特定し、有向非巡回グラフ (DAG) を使用して、適切な順序で作成されることを保証します。

Dbt は [ClickHouse 対応プラグイン](https://github.com/ClickHouse/dbt-clickhouse) を通じて ClickHouse と互換性があります。 我々は、公開されている IMDB データセットに基づいた簡単な例を使用して ClickHouse への接続プロセスを説明します。 また、現在のコネクタのいくつかの制限についても触れます。

<TOCInline toc={toc}  maxHeadingLevel={2} />
## 概念 {#concepts}

dbt はモデルの概念を導入しています。 これは、複数のテーブルを結合する可能性がある SQL ステートメントとして定義されます。 モデルは、さまざまな方法で「具現化」できます。 具現化は、モデルの SELECT クエリのビルド戦略を表します。 具現化の背後にあるコードは、SELECT クエリをラップするボイラープレート SQL であり、新しいリレーションを作成するか、既存のリレーションを更新するためにステートメントを構築します。

dbt は 4 種類の具現化を提供します：

* **view** (デフォルト): モデルはデータベースのビューとして構築されます。
* **table**: モデルはデータベースのテーブルとして構築されます。
* **ephemeral**: モデルはデータベースに直接構築されるのではなく、共通テーブル式として依存モデルに取り込まれます。
* **incremental**: モデルは最初にテーブルとして具現化され、以降の実行時に新しい行を挿入し、変更された行をテーブル内で更新します。

追加の構文や条件は、基礎にあるデータが変更された場合にこれらのモデルがどのように更新されるべきかを定義します。 dbt は、パフォーマンスの懸念が生じるまで、通常はビュー具現化から始めることを推奨します。 テーブル具現化は、モデルのクエリの結果をテーブルとしてキャッチすることにより、クエリ時間のパフォーマンスを向上させますが、ストレージの増加を犠牲にします。 インクリメンタルアプローチはさらにこれを基に、基礎にあるデータのその後の更新をターゲットテーブルにキャプチャできるようにします。

[現在のプラグイン](https://github.com/silentsokolov/dbt-clickhouse) は、**view**, **table**, **ephemeral**, **incremental** 具現化をサポートしています。 このプラグインは、dbt の [スナップショット](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) や [シード](https://docs.getdbt.com/docs/building-a-dbt-project/seeds) もサポートしており、私たちはこのガイドでそれらを探ります。

以下のガイドでは、クリックハウスのインスタンスが利用可能であると仮定します。
## dbt と ClickHouse プラグインのセットアップ {#setup-of-dbt-and-the-clickhouse-plugin}
### dbt {#dbt}

以下の例では dbt CLI を使用することを仮定します。ユーザーは、プロジェクトの編集および実行を許可するウェブベースの統合開発環境 (IDE) 提供する [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) を検討することもできます。

dbt の CLI インストールにはいくつかのオプションがあります。以下の手順を [ここ](https://docs.getdbt.com/dbt-cli/install/overview) の指示に従ってください。 この段階では dbt-core のみをインストールしてください。 `pip` の使用をお勧めします。

```bash
pip install dbt-core
```

**重要: 次に示す内容は python 3.9 の下でテストされています。**
### ClickHouse プラグイン {#clickhouse-plugin}

dbt ClickHouse プラグインをインストールします：

```bash
pip install dbt-clickhouse
```
### ClickHouse の準備 {#prepare-clickhouse}

dbt は、高度にリレーショナルなデータのモデリングに優れています。 実例として、次のリレーショナルスキーマを持つ小さな IMDB データセットを提供します。 このデータセットは [リレーショナルデータセットリポジトリ](https://relational.fit.cvut.cz/dataset/IMDb) から派生します。 これは dbt で通常使用されるスキーマに比べると小規模ですが、管理可能なサンプルを示しています：

<Image img={dbt_01} size="lg" alt="IMDB テーブルスキーマ" />

これらのテーブルのサブセットを使用します。以下のテーブルを作成します：

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
テーブル `roles` のカラム `created_at` はデフォルトで `now()` という値を持ちます。後でインクリメンタル更新を特定するために使用します - [インクリメンタルモデル](#creating-an-incremental-materialization)を参照してください。
:::

`S3` 関数を使用して、パブリックエンドポイントからソースデータを読み取り、データを挿入します。 次のコマンドを実行してテーブルにデータを入力します：

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

実行時間は帯域幅に依存しますが、各コマンドは数秒で完了するはずです。次のクエリを実行して、各俳優の概要を計算し、もっとも映画に登場した順に並べて、データが正常にロードされたことを確認してください：

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

レスポンスは次のようになるべきです：

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

後のガイドでは、このクエリをモデルに変換し、ClickHouse に dbt ビューおよびテーブルとして具現化します。
## ClickHouse への接続 {#connecting-to-clickhouse}

1. dbt プロジェクトを作成します。この場合、`imdb` ソースに名前を付けます。プロンプトが表示されたら、データベースソースとして `clickhouse` を選択します。

    ```bash
    clickhouse-user@clickhouse:~$ dbt init imdb

    16:52:40  dbt=1.1.0 で実行中
    どのデータベースを使用しますか？
    [1] clickhouse

    (必要なものが表示されない場合は、https://docs.getdbt.com/docs/available-adapters を参照してください)

    番号を入力してください: 1
    16:53:21  clickhouse のサンプルプロファイルが見つかりません。
    16:53:21
    新しい dbt プロジェクト "imdb" が作成されました！

    プロファイルファイル profiles.yml の構成方法については、以下の dbt ドキュメントを参照ください：

    https://docs.getdbt.com/docs/configure-your-profile
    ```

2. プロジェクトフォルダに `cd` します：

    ```bash
    cd imdb
    ```

3. この時点で、好みのテキストエディタが必要です。以下の例では、人気のある VS Code を使用します。IMDB ディレクトリを開くと、yml および sql ファイルが一式表示されます：

    <Image img={dbt_02} size="lg" alt="新しい dbt プロジェクト" />

4. 最初のモデル - `actor_summary` を指定し、プロファイルを `clickhouse_imdb` に設定して、`dbt_project.yml` ファイルを更新します。

    <Image img={dbt_03} size="lg" alt="dbt プロファイル" />

    <Image img={dbt_04} size="lg" alt="dbt プロファイル" />

5. 次に、dbt に ClickHouse インスタンスの接続詳細を提供する必要があります。次の内容を `~/.dbt/profiles.yml` に追加します。

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

    ユーザーとパスワードを変更する必要があることに注意してください。その他の設定については、[ここ](https://github.com/silentsokolov/dbt-clickhouse#example-profile)でドキュメント化されています。

6. IMDB ディレクトリから `dbt debug` コマンドを実行し、dbt が ClickHouse に接続できるか確認します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt debug
    17:33:53  dbt=1.1.0  で実行中
    dbt バージョン: 1.1.0
    python バージョン: 3.10.1
    python パス: /home/dale/.pyenv/versions/3.10.1/bin/python3.10
    os 情報: Linux-5.13.0-10039-tuxedo-x86_64-with-glibc2.31
    profiles.yml ファイルを使用中 /home/dale/.dbt/profiles.yml
    dbt_project.yml ファイルを使用中 /opt/dbt/imdb/dbt_project.yml

    構成:
    profiles.yml ファイル [OK found and valid]
    dbt_project.yml ファイル [OK found and valid]

    必要な依存関係:
    - git [OK found]

    接続:
    host: localhost
    port: 8123
    user: default
    schema: imdb_dbt
    secure: False
    verify: False
    接続テスト: [OK connection ok]

    すべてのチェックに合格しました！
    ```

    レスポンスに `接続テスト: [OK connection ok]` が含まれていることを確認し、接続が成功したことを示します。
## シンプルなビューの具現化の作成 {#creating-a-simple-view-materialization}

ビュー具現化を使用する場合、モデルは毎回 `CREATE VIEW AS` ステートメントを介して再構築されます。 これはデータの追加ストレージを必要とせず、テーブル具現化よりもクエリに時間がかかります。

1. `imdb` フォルダから `models/example` ディレクトリを削除します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. `models` フォルダの `actors` 内に新しいファイルを作成します。ここでは、各俳優モデルを表すファイルを作成します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. `models/actors` フォルダに `schema.yml` および `actor_summary.sql` というファイルを作成します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```

    `schema.yml` ファイルは、テーブルを定義します。 これらはマクロで使用可能になります。 `models/actors/schema.yml` を次の内容に編集します：

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

    `actors_summary.sql` は実際のモデルを定義します。 設定関数で、モデルを ClickHouse のビューとして具現化するように要求しています。 テーブルは、`source` 関数を介して `schema.yml` ファイルから参照されます。 例えば、`source('imdb', 'movies')` は `imdb` データベース内の `movies` テーブルを指します。 `models/actors/actors_summary.sql` を次の内容に編集します：

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

    最終的な `actor_summary` にカラム `updated_at` が含まれていることに注意してください。 後でインクリメンタル具現化に使用します。

4. `imdb` ディレクトリから `dbt run` コマンドを実行します。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:05:35  dbt=1.1.0  で実行中
    15:05:35  1 モデル、0 テスト、1 スナップショット、0 分析、181 マクロ、0 操作、0 シードファイル、6 ソース、0 エクスポージャ、0 メトリックスが見つかりました
    15:05:35
    15:05:36  同時処理: 1 スレッド (target='dev')
    15:05:36
    15:05:36  1 of 1 ビュー モデル imdb_dbt.actor_summaryを開始しています.................................. [RUN]
    15:05:37  1 of 1 OK ビュー モデル imdb_dbt.actor_summaryを作成しました............................. [OK in 1.00s]
    15:05:37
    15:05:37  1 ビュー モデルの実行を完了しました 1.97s で。
    15:05:37
    15:05:37  正常に完了しました
    15:05:37
    15:05:37  完了。 PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

5. dbt は要求された通り、モデルを ClickHouse のビューとして表現します。 これで、このビューに直接クエリを発行できます。 このビューは、`~/.dbt/profiles.yml` の `clickhouse_imdb` プロファイルのスキーマパラメータによって決定される `imdb_dbt` データベース内に作成されます。

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

    このビューをクエリすることで、以前のクエリの結果を簡単な構文で再現できます：

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

前の例では、モデルはビューとして具現化されました。これは、いくつかのクエリに対して十分なパフォーマンスを提供する場合がありますが、より複雑な SELECT や頻繁に実行されるクエリはテーブルとして具現化される方が良いかもしれません。この具現化は、BI ツールによってクエリされるモデルに役立つことがあり、ユーザーがより迅速に体験できるようにします。これは実際には、クエリ結果を新しいテーブルとして保存することを引き起こし、関連するストレージオーバーヘッドが発生します。 つまり、`INSERT TO SELECT` が実行されます。 このテーブルは毎回再構築されるため、インクリメンタルではありません。 大きな結果セットでは、長い実行時間が発生する可能性があります - [dbt の制限](#limitations)を参照してください。

1. `actors_summary.sql` ファイルを修正して `materialized` パラメータが `table` に設定されていることを確認します。 `ORDER BY` がどのように定義されているか注意し、`MergeTree` テーブルエンジンを使用していることにも留意してください：

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. `imdb` ディレクトリから `dbt run` コマンドを実行します。 この実行には、通常約10秒かかる場合があります。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:13:27  dbt=1.1.0  で実行中
    15:13:27  1 モデル, 0 テスト, 1 スナップショット, 0 分析, 181 マクロ, 0 操作, 0 シードファイル, 6 ソース, 0 エクスポージャ, 0 メトリックスが見つかりました
    15:13:27
    15:13:28  同時処理: 1 スレッド (target='dev')
    15:13:28
    15:13:28  1 of 1 START テーブル モデル imdb_dbt.actor_summary................................. [RUN]
    15:13:37  1 of 1 OK テーブル モデル imdb_dbt.actor_summaryを作成しました............................ [OK in 9.22s]
    15:13:37
    15:13:37  1 テーブル モデルの実行を完了しました 10.20s で。
    15:13:37
    15:13:37  正常に完了しました
    15:13:37
    15:13:37  完了。 PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

3. テーブル `imdb_dbt.actor_summary` の作成を確認します：

    ```sql
    SHOW CREATE TABLE imdb_dbt.actor_summary;
    ```

    次のように、適切なデータ型のテーブルが表示されるはずです：
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

4. このテーブルからの結果が以前のレスポンスと一貫していることを確認します。 モデルがテーブルになったので、応答時間が顕著に改善されていることに注意してください：

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

    このモデルに対して他のクエリを発行しても構いません。たとえば、登場回数が5回以上の最高評価映画を持っている俳優は誰ですか？

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank DESC LIMIT 10;
    ```

## インクリメンタルマテリアライゼーションの作成 {#creating-an-incremental-materialization}

前の例では、モデルをマテリアライズするためのテーブルが作成されました。このテーブルは、各 dbt 実行時に再構築されます。これは大きな結果セットや複雑な変換には現実的でなく、非常にコストがかかる場合があります。この課題に対処し、ビルド時間を短縮するために、dbt はインクリメンタルマテリアライゼーションを提供します。これにより、dbt は最後の実行からの変更分のレコードをテーブルに挿入または更新でき、イベントスタイルのデータに適しています。内部では、一時テーブルが作成され、更新されたすべてのレコードが格納され、触れられていないレコードと更新されたレコードが新しいターゲットテーブルに挿入されます。これにより、テーブルモデルと同様に、大きな結果セットに対して似たような[制限](#limitations)が生じます。

大規模なセットに対するこれらの制限を克服するために、プラグインは 'inserts_only' モードをサポートしています。ここでは、すべての更新が一時テーブルを作成せずにターゲットテーブルに挿入されます（詳細については以下を参照）。

この例を示すために、910本の映画に登場する驚くべき俳優「Clicky McClickHouse」を追加します - 彼が [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc) より多くの映画に出演していることを保証します。

1. まず、モデルをインクリメンタルタイプに変更します。この追加には次のものが必要です：

    1. **unique_key** - プラグインが行を一意に識別できるようにするために、unique_key を提供する必要があります。この場合、クエリからの `id` フィールドが適切です。これにより、マテリアライズされたテーブル内に行の重複が発生しないことが保証されます。ユニーク制約の詳細については、[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)を参照してください。
    2. **インクリメンタルフィルター** - dbt に、インクリメンタル実行時にどの行が変更されたかを特定する方法を指示する必要があります。これはデルタ表現を提供することで達成されます。通常、これはイベントデータのタイムスタンプに関連しており、したがって `updated_at` タイムスタンプフィールドが使用されます。このカラムは、行が挿入される際に今の値（now()）をデフォルトとし、新しいロールを特定することを可能にします。さらに、新しい俳優が追加される場合の代替ケースを特定する必要があります。既存のマテリアライズテーブルを示すために `{{this}}` 変数を使用すると、この表現 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})` が得られます。これを `{% if is_incremental() %}` 条件に埋め込み、インクリメンタル実行時のみ使用され、テーブルが最初に構築されるときには使用されないようにします。インクリメンタルモデル用の行をフィルタリングする詳細については、[dbt ドキュメントのこの議論](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)を参照してください。

    `actor_summary.sql` ファイルを次のように更新します：

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id') }}
    with actor_summary as (
        SELECT id,
            any(actor_name) as name,
            uniqExact(movie_id) as num_movies,
            avg(rank) as avg_rank,
            uniqExact(genre) as genres,
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

    -- このフィルタはインクリメンタル実行時にのみ適用されます
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

    モデルは `roles` および `actors` テーブルの更新および追加にのみ応答します。すべてのテーブルに応答するには、ユーザーはこのモデルを複数のサブモデルに分割し、それぞれに独自のインクリメンタル基準を設定することをお勧めします。これらのモデルは互いに参照および接続することができます。モデルの相互参照に関する詳細は[こちら](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)を参照してください。

2. `dbt run` を実行して、結果のテーブルの結果を確認します：

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

3. モデルにデータを追加してインクリメンタル更新を示します。「Clicky McClickHouse」俳優を `actors` テーブルに追加します：

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

5. 実際に彼が最も多くの出演をしている俳優であることを確認するために、基盤となるソーステーブルにクエリを実行し、dbt モデルをバイパスします：

    ```sql
    SELECT id,
        any(actor_name) as name,
        uniqExact(movie_id) as num_movies,
        avg(rank) as avg_rank,
        uniqExact(genre) as unique_genres,
        uniqExact(director_name) as uniq_directors,
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

6. `dbt run` を実行して、モデルが更新され、上記の結果に一致することを確認します：

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

上記のインクリメンタル更新を達成するために実行されたステートメントを確認するには、ClickHouse のクエリログを照会します。

```sql
SELECT event_time, query FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

上記のクエリを実行期間に調整してください。結果の検査はユーザーに任せますが、インクリメンタル更新を実行するためにプラグインが使用する一般的な戦略を強調します：

1. プラグインは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行がこのテーブルにストリームされます。
2. 新しいテーブル `actor_summary_new` が作成されます。古いテーブルからの行は、古いから新しいにストリームされ、行 ID が一時テーブルに存在しないことを確認するチェックが行われます。これにより、更新と重複が効果的に処理されます。
3. 一時テーブルからの結果が新しい `actor_summary` テーブルにストリームされます。
4. 最後に、新しいテーブルが旧バージョンと原子的に交換され、そのためには `EXCHANGE TABLES` ステートメントが使用されます。古いテーブルと一時テーブルも削除されます。

これを以下に可視化します：

<Image img={dbt_05} size="lg" alt="incremental updates dbt" />

この戦略は非常に大きなモデルでは課題に直面する可能性があります。詳細については[制限](#limitations)を参照してください。

### 追加戦略（inserts-only モード） {#append-strategy-inserts-only-mode}

インクリメンタルモデルにおける大規模データセットの制約を克服するために、プラグインは dbt 設定パラメータ `incremental_strategy` を使用します。これを `append` に設定できます。設定されると、更新された行はターゲットテーブル（すなわち `imdb_dbt.actor_summary`）に直接挿入され、一時テーブルは作成されません。
注意：追加のみモードでは、データが不変であるか、重複が許容される必要があります。変更された行をサポートするインクリメンタルテーブルモデルが必要な場合、このモードを使用しないでください！

このモードを示すために、別の新しい俳優を追加し、`incremental_strategy='append'` で dbt run を再実行します。

1. `actor_summary.sql` で追加のみモードを設定します：

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. もう一人の有名な俳優 - Danny DeBito を追加します：

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. Danny を920本のランダムな映画に出演させます。

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 920 OFFSET 10000;
   ```

4. dbt run を実行して、Danny が actor-summary テーブルに追加されたことを確認します：

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

注意しなければならないのは、「Clicky」の挿入と比較して、このインクリメンタル更新がどれだけ早かったかということです。

再度、query_log テーブルを確認して、2つのインクリメンタル実行の違いを明らかにします：

   ```sql
   insert into imdb_dbt.actor_summary ("id", "name", "num_movies", "avg_rank", "genres", "directors", "updated_at")
   with actor_summary as (
      SELECT id,
         any(actor_name) as name,
         uniqExact(movie_id) as num_movies,
         avg(rank) as avg_rank,
         uniqExact(genre) as genres,
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
   -- このフィルタはインクリメンタル実行時にのみ適用されます
   where id > (select max(id) from imdb_dbt.actor_summary) or updated_at > (select max(updated_at) from imdb_dbt.actor_summary)
   ```

この実行では、`imdb_dbt.actor_summary` テーブルに新しい行のみが追加され、テーブル作成は関与しません。

### 削除 + 挿入モード（実験的） {#deleteinsert-mode-experimental}

これまで、ClickHouse は非同期[変異](https://clickhouse.com/docs/ja/en/sql-reference/statements/alter/index.md)の形での更新と削除に対して限られたサポートしかありませんでした。これらは非常に I/O 集中的であり、通常は避けるべきです。

ClickHouse 22.8 では、[軽量削除](https://clickhouse.com/docs/ja/en/sql-reference/statements/delete.md)が導入されました。これは現在実験的ですが、データを削除するためのよりパフォーマンスの良い手段を提供します。

このモードは、モデルを `incremental_strategy` パラメータで設定できます。例えば：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

この戦略はターゲットモデルのテーブルに直接作業しますので、操作中に問題が発生した場合、インクリメンタルモデル内のデータは無効な状態になる可能性があります - 原子的な更新はありません。

要約すると、このアプローチは以下のように機能します：

1. プラグインは一時テーブル `actor_sumary__dbt_tmp` を作成します。変更された行がこのテーブルにストリームされます。
2. 現在の `actor_summary` テーブルに対して `DELETE` が発行されます。行は `actor_sumary__dbt_tmp` から id で削除されます。
3. `actor_sumary__dbt_tmp` からの行が `actor_summary` に挿入されます（`INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp` を使用）。

このプロセスは以下に示します：

<Image img={dbt_06} size="lg" alt="lightweight delete incremental" />

### insert_overwrite モード（実験的） {#insert_overwrite-mode-experimental}

以下のステップを実行します：

1. インクリメンタルモデル関係と同じ構造を持つステージング（一時）テーブルを作成：`CREATE TABLE {staging} AS {target}`。
2. ステージングテーブルに新しいレコードのみを挿入（SELECT で生成）します。
3. ステージングテーブルに存在する新しいパーティションのみをターゲットテーブルに置き換えます。

<br />

このアプローチには以下の利点があります：

* テーブル全体をコピーしないため、デフォルト戦略よりも速くなります。
* INSERT 操作が成功裏に完了するまで元のテーブルを修正しないため、他の戦略よりも安全です。中間的な失敗があった場合、元のテーブルは修正されません。
* パーティションの不変性のデータエンジニアリングのベストプラクティスを実装しています。これにより、インクリメンタルおよび並列データ処理、ロールバックなどが簡素化されます。

<Image img={dbt_07} size="lg" alt="insert overwrite incremental" />

## スナップショットの作成 {#creating-a-snapshot}

dbt のスナップショットを使用すると、可変モデルの変更を時間の経過とともに記録できます。これにより、分析者がモデルの前の状態を「振り返る」ことができるポイントインタイムクエリが可能になります。これは、行が有効であった時期を記録する from および to 日付カラムを持つ[タイプ 2 の徐々に変化する次元](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row)を使用して実現されています。この機能は ClickHouse プラグインによってサポートされており、以下に示します。

この例では、[インクリメンタルテーブルモデルの作成](#creating-an-incremental-materialization)を完了していると仮定します。`actor_summary.sql` が `inserts_only=True` を設定していないことを確認してください。モデル / actor_summary.sql は次のようになります：

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id') }}

   with actor_summary as (
       SELECT id,
           any(actor_name) as name,
           uniqExact(movie_id) as num_movies,
           avg(rank) as avg_rank,
           uniqExact(genre) as genres,
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

   -- このフィルタはインクリメンタル実行時にのみ適用されます
   where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

   {% endif %}
   ```

1. スナップショットディレクトリに `actor_summary` ファイルを作成します。

    ```bash
     touch snapshots/actor_summary.sql
    ```

2. actor_summary.sql ファイルの内容を次のように更新します：
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

この内容に関するいくつかの観察：
* select クエリは、時間の経過に伴ってスナップショットを取りたい結果を定義します。ref 関数は、以前に作成された actor_summary モデルを参照するために使用されます。
* レコードの変更を示すためのタイムスタンプカラムが必要です。`updated_at` カラム（[インクリメンタルテーブルモデルの作成](#creating-an-incremental-materialization)を参照してください）をここで使用できます。パラメーターの戦略は、更新を示すためにタイムスタンプを使用し、updated_at パラメーターは使用するカラムを指定します。このモデルに存在しない場合は、代わりに[チェック戦略](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)を使用できます。これは非常に効率が悪く、ユーザーが比較するカラムのリストを指定する必要があります。dbt は、これらのカラムの現在と履歴の値を比較し、変更がある場合（同一の場合は何もしない）、変更を記録します。

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

注意：スナップショットデータベースに actor_summary_snapshot テーブルが作成されます（これは target_schema パラメータによって決まります）。

4. このデータをサンプリングすると、dbt が dbt_valid_from と dbt_valid_to カラムを含めていることがわかります。後者の値は null に設定されています。次回の実行でこれが更新されます。

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

5. お気に入りの俳優 Clicky McClickHouse をさらに10本の映画に出演させます。

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. `imdb` ディレクトリから `dbt run` コマンドを再実行します。これにより、インクリメンタルモデルが更新されます。このプロセスが完了したら、dbt スナップショットを実行して変更をキャッチします。

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

7. スナップショットをクエリすると、Clicky McClickHouse の行が2つ存在することに気付くでしょう。以前のエントリには dbt_valid_to 値が設定されています。新しい値は同じ値が dbt_valid_from 列に記録され、dbt_valid_to 値は null です。もし新しい行があれば、これらもスナップショットに追加されます。

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

dbt スナップショットに関する詳細は[こちら](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)を参照してください。
```

## Seedsの使用 {#using-seeds}

dbtはCSVファイルからデータを読み込む機能を提供します。この機能は、大規模なデータベースのエクスポートには適しておらず、通常コードテーブルや [辞書](../../../../sql-reference/dictionaries/index.md) に使用される小さなファイル向けに設計されています。例えば、国コードを国名にマッピングすることなどです。簡単な例として、seed機能を使用してジャンルコードのリストを生成し、アップロードします。

1. 既存のデータセットからジャンルコードのリストを生成します。dbtディレクトリから、`clickhouse-client` を使用して `seeds/genre_codes.csv` というファイルを作成します：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. `dbt seed` コマンドを実行します。これにより、CSVファイルからの行を持つ新しいテーブル `genre_codes` がデータベース `imdb_dbt`（スキーマ設定で定義されたもの）に作成されます。

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
3. データが正常に読み込まれたことを確認します：

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

現在のClickHouseプラグインには、ユーザーが注意すべきいくつかの制限があります：

1. プラグインは、モデルを`INSERT TO SELECT`を使用してテーブルとしてマテリアライズします。これは実質的にデータの重複を意味します。非常に大きなデータセット（PB）は、非常に長い実行時間を引き起こし、一部のモデルが実行不可能となる可能性があります。クエリによって返される行数を最小限に抑えることを目指し、可能であればGROUP BYを利用してください。行数を維持しつつ単に変換を行うモデルよりも、データを要約するモデルを好んでください。
2. 分散テーブルを使用してモデルを表すには、ユーザーは各ノード上で基になるレプリケートテーブルを手動で作成する必要があります。これに基づいて分散テーブルを作成できます。プラグインはクラスターの作成を管理しません。
3. dbtがデータベース内にリレーション（テーブル/ビュー）を作成する際、通常次のように作成します：`{{ database }}.{{ schema }}.{{ table/view id }}`。ClickHouseにはスキーマの概念がないため、プラグインは`{{schema}}.{{ table/view id }}`を使用します。ここで`schema`はClickHouseのデータベースです。

さらなる情報

前のガイドではdbt機能の表面にしか触れていません。ユーザーは優れた [dbtドキュメント](https://docs.getdbt.com/docs/introduction) を読むことをお勧めします。

プラグインの追加設定については [こちら](https://github.com/silentsokolov/dbt-clickhouse#model-configuration) に記載されています。
## Fivetran {#fivetran}

`dbt-clickhouse` コネクタは [Fivetran transformations](https://fivetran.com/docs/transformations/dbt) での使用も可能で、Fivetranプラットフォーム内でのシームレスな統合と変換機能を提供します。
## 関連コンテンツ {#related-content}

- ブログ & ウェビナー: [ClickHouseとdbt - コミュニティからの贈り物](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
