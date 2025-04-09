---
sidebar_label: 'dbt'
slug: /integrations/dbt
sidebar_position: 1
description: '用户可以使用 dbt 在 ClickHouse 中转换和建模他们的数据'
---
import TOCInline from '@theme/TOCInline';
import dbt_01 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_01.png';
import dbt_02 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_02.png';
import dbt_03 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_03.png';
import dbt_04 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_04.png';
import dbt_05 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_05.png';
import dbt_06 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_06.png';
import dbt_07 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_07.png';

# 集成 dbt 和 ClickHouse

**dbt** （数据构建工具）使数据分析工程师能够通过简单编写选择语句来在其数据仓库中转换数据。 dbt 负责将这些选择语句物化为数据库中的对象，以表和视图的形式存在 - 执行 [提取加载和转换 (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) 中的 T。用户可以创建由 SELECT 语句定义的模型。

在 dbt 中，这些模型可以相互引用，并分层构建更高层次的概念。连接模型所需的模板 SQL 会自动生成。此外，dbt 识别模型之间的依赖关系，并使用有向无环图（DAG）确保它们按适当顺序创建。

通过 [ClickHouse 支持的插件](https://github.com/ClickHouse/dbt-clickhouse)，dbt 与 ClickHouse 兼容。我们用一个基于公开的 IMDB 数据集的简单示例描述连接 ClickHouse 的过程。同时，我们还强调当前连接器的一些限制。

<TOCInline toc={toc}  maxHeadingLevel={2} />
## 概念 {#concepts}

dbt 引入了模型的概念。这被定义为一个 SQL 语句，可能连接多个表。模型可以以多种方式“物化”。物化表示模型选择查询的构建策略。物化背后的代码是模板 SQL，它将您的 SELECT 查询包装在一个语句中，以创建一个新的或更新现有的关系。

dbt 提供 4 种类型的物化：

* **视图**（默认）：模型以数据库中的视图构建。
* **表**：模型以数据库中的表构建。
* **暂时**：模型不是直接在数据库中构建，而是以公共表表达式的形式拉入依赖模型。
* **增量**：模型最初物化为表，在后续运行中，dbt 在表中插入新行并更新已更改的行。

附加的语法和子句定义了如果底层数据发生更改，这些模型应如何更新。一般来说，dbt 建议在性能成为问题之前从视图物化开始。表物化通过将模型查询的结果捕获为表提供查询时间性能提升，但以增加存储为代价。增量方法在此基础上进一步构建，以便在底层数据后续更新时能被捕获到目标表中。

目前的 [插件](https://github.com/silentsokolov/dbt-clickhouse) 支持 ClickHouse 的 **视图**、**表**、**暂时** 和 **增量** 物化。插件还支持 dbt 的 [快照](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) 和 [种子](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)，我们将在本指南中探讨这些内容。

在接下来的指南中，我们假设您可以使用 ClickHouse 实例。
## dbt 和 ClickHouse 插件的设置 {#setup-of-dbt-and-the-clickhouse-plugin}
### dbt {#dbt}

我们假设在以下示例中使用 dbt CLI。用户也可以考虑 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview)，该服务提供基于网络的集成开发环境（IDE），允许用户编辑和运行项目。

dbt 提供了一些 CLI 安装的选项。请按照[此处](https://docs.getdbt.com/dbt-cli/install/overview)描述的说明进行操作。在此阶段仅安装 dbt-core。我们建议使用 `pip`。

```bash
pip install dbt-core
```

**重要：以下内容测试于 python 3.9。**
### ClickHouse 插件 {#clickhouse-plugin}

安装 dbt ClickHouse 插件：

```bash
pip install dbt-clickhouse
```
### 准备 ClickHouse {#prepare-clickhouse}

dbt 在建模高度关系型数据时表现出色。为了示范，我们提供一个小型的 IMDB 数据集，具有以下关系模式。该数据集来源于 [关系型数据集库](https://relational.fit.cvut.cz/dataset/IMDb)。与使用 dbt 的常见模式相比，这很简单，但代表了一个可管理的样本：

<img src={dbt_01} class="image" alt="IMDB 表模式" style={{width: '100%'}}/>

我们使用这些表的一个子集，如下所示。

创建以下表：

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
表 `roles` 的列 `created_at` 默认值为 `now()`。我们稍后将使用此列来识别模型的增量更新 - 请参阅 [增量模型](#creating-an-incremental-materialization)。
:::

我们使用 `s3` 函数从公共端点读取源数据以插入数据。运行以下命令以填充表：

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

这些操作的执行时间可能因带宽而异，但每个操作应仅需几秒钟即可完成。执行以下查询以计算每位演员的摘要，按电影出现次数降序排列，并确认数据已成功加载：

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

响应应如下所示：

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

在后续指南中，我们将把此查询转换为模型 - 以 dbt 视图和表的形式在 ClickHouse 中物化。
## 连接到 ClickHouse {#connecting-to-clickhouse}

1. 创建 dbt 项目。在这种情况下，我们以我们的 `imdb` 源命名。当提示时，选择 `clickhouse` 作为数据库源。

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

2. `cd` 进入您的项目文件夹：

    ```bash
    cd imdb
    ```

3. 在此时，您将需要您选择的文本编辑器。在下面的示例中，我们使用流行的 VS Code。打开 IMDB 目录，您应该会看到一组 yml 和 sql 文件：

    <img src={dbt_02} class="image" alt="新 dbt 项目" style={{width: '100%'}}/>

4. 更新您的 `dbt_project.yml` 文件，以指定我们的第一个模型 - `actor_summary` 并将配置设置为 `clickhouse_imdb`。

    <img src={dbt_03} class="image" alt="dbt 配置" style={{width: '100%'}}/>

    <img src={dbt_04} class="image" alt="dbt 配置" style={{width: '100%'}}/>

5. 接下来，我们需要提供 dbt 连接我们的 ClickHouse 实例的详细信息。将以下内容添加到您的 `~/.dbt/profiles.yml` 中。

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

    注意需要修改用户和密码。还有其他可用设置可以在[此处](https://github.com/silentsokolov/dbt-clickhouse#example-profile)找到。
   
6. 从 IMDB 目录，执行 `dbt debug` 命令以确认 dbt 是否能够连接到 ClickHouse。

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

    确认响应中包含 `Connection test: [OK connection ok]`，表明连接成功。
## 创建简单的视图物化 {#creating-a-simple-view-materialization}

在使用视图物化时，模型在每次运行时通过 `CREATE VIEW AS` 语句在 ClickHouse 中重建。这不需要额外的数据存储，但相较于表物化，查询速度会更慢。

1. 在 `imdb` 文件夹内，删除目录 `models/example`：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. 在 `models` 文件夹内的 `actors` 中创建一个新的文件。在这里，我们为每个演员模型创建文件：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. 在 `models/actors` 文件夹中创建 `schema.yml` 和 `actor_summary.sql` 文件。

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```

    文件 `schema.yml` 定义了我们的表。这些后来将可在宏中使用。编辑 `models/actors/schema.yml` 以包含以下内容：
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

    `actors_summary.sql` 定义了我们的实际模型。在配置函数中，我们还请求将模型在 ClickHouse 中物化为视图。我们的表通过 `source` 函数从 `schema.yml` 文件中引用，例如 `source('imdb', 'movies')` 是指 `imdb` 数据库中的 `movies` 表。编辑 `models/actors/actors_summary.sql` 以包含以下内容：
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

    注意我们在最终的 actor_summary 中包含了列 `updated_at`。我们稍后将为增量物化使用此列。

4. 从 `imdb` 目录执行命令 `dbt run`。

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

5. dbt 会将模型呈现为 ClickHouse 中的视图，如请求的那样。我们现在可以直接查询该视图。该视图将在 `imdb_dbt` 数据库中创建 - 这由文件 `~/.dbt/profiles.yml` 中 `clickhouse_imdb` 配置下的 schema 参数决定。

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
    |imdb_dbt          |  <---由 dbt 创建!
    |information_schema|
    |system            |
    +------------------+
    ```

    查询该视图时，我们可以用更简单的语法重现之前查询的结果：

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
## 创建表物化 {#creating-a-table-materialization}

在上一个示例中，我们将模型物化为视图。虽然这可能对某些查询提供足够的性能，但更复杂的 SELECT 或频繁执行的查询可能更适合物化为表。这种物化对于将被 BI 工具查询的模型非常有用，以确保用户拥有更快的体验。实际上，这会导致查询结果作为一个新表存储，伴随着相关的存储开销 - 实际上，执行了 `INSERT TO SELECT`。请注意，这个表每次都会重建，即它不是增量的。大结果集可能会导致较长的执行时间 - 请参见 [dbt 限制](#limitations)。

1. 修改文件 `actors_summary.sql`，将 `materialized` 参数设置为 `table`。注意 `ORDER BY` 的定义，以及我们使用 `MergeTree` 表引擎：

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. 从 `imdb` 目录执行命令 `dbt run`。此执行可能需要稍长的时间 - 大约在大多数机器上需要 10 秒。

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

3. 确认表 `imdb_dbt.actor_summary` 是否已创建：

    ```sql
    SHOW CREATE TABLE imdb_dbt.actor_summary;
    ```

    您应该会看到具有适当数据类型的表：
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

4. 确认此表的结果与之前的响应一致。注意，由于模型现在是表，响应时间有了明显提升：

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

    随意针对该模型发出其他查询。例如，哪些演员拥有超过 5 次出现的高评分电影？

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```

## 创建增量物化视图 {#creating-an-incremental-materialization}

前面的例子创建了一个表来物化模型。这个表将在每次 dbt 执行时重建。对于较大的结果集或复杂的转换，这可能是不切实际且非常昂贵的。为了解决这一挑战并减少构建时间，dbt 提供了增量物化功能。这允许 dbt 从上一次执行以来将记录插入或更新到表中，使其适合事件风格的数据。在内部，创建了一个临时表以包含所有更新的记录，然后将所有未修改的记录以及更新的记录插入到一个新的目标表中。这导致大结果集与表模型类似的[限制](#limitations)。

为了克服这些针对大数据集的限制，该插件支持“inserts_only”模式，在该模式下，所有更新直接插入目标表，而无需创建临时表（下面会详细介绍）。

为说明这个例子，我们将添加演员“Clicky McClickHouse”，他将出现在令人惊讶的910部电影中——确保他出现在比[Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc) 更多的影片中。

1. 首先，我们将我们的模型修改为增量类型。该添加要求：

    1. **unique_key** - 为确保插件能够唯一识别行，我们必须提供一个 unique_key - 在这种情况下，查询中的 `id` 字段就足够了。这确保我们的物化表中不会有行的重复。有关唯一性约束的更多细节，请见[这里](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)。
    2. **增量过滤器** - 我们还需要告知 dbt 应如何识别在增量运行中哪些行已更改。这是通过提供 delta 表达式来实现的。通常这涉及事件数据的时间戳；因此，我们使用更新的时间戳字段 `updated_at`。当插入行时，该列的默认值为 now()，使新角色得以识别。此外，我们需要识别添加新演员的另一种情况。使用 `{{this}}` 变量来表示现有的物化表，得到的表达式为 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`。我们将其嵌入到 `{% if is_incremental() %}` 条件中，确保它仅在增量运行时使用，而不是在首次构建表时使用。有关增量模型的行过滤的更多详细信息，请参见[dbt 文档中的此讨论](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)。

    按如下方式更新文件 `actor_summary.sql`：

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
    
    -- 该过滤器将仅在增量运行时应用
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

    请注意，我们的模型将仅响应对 `roles` 和 `actors` 表的更新和新增。要响应所有表，建议用户将该模型拆分为多个子模型 - 每个子模型具有自己增量标准。这些模型可以相互引用和连接。有关交叉引用模型的进一步细节，请参见[这里](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)。

2. 执行 `dbt run` 并确认结果表的结果：

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

3. 现在我们将向模型添加数据以说明增量更新。将我们的演员“Clicky McClickHouse”添加到 `actors` 表：

    ```sql
    INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
    ```

4. 让我们让“Clicky”在910部随机电影中出演：

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
    FROM imdb.movies
    LIMIT 910 OFFSET 10000;
    ```

5. 确认他确实是出现次数最多的演员，通过查询底层源表并绕过任何 dbt 模型：

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

6. 执行 `dbt run` 并确认我们的模型已被更新并与上述结果匹配：

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
### 内部实现 {#internals}

我们可以通过查询 ClickHouse 的查询日志来识别为实现上述增量更新而执行的语句。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

调整以上查询以适应执行时间范围。我们将结果检查留给用户，但强调该插件用于执行增量更新的一般策略：

1. 插件创建一个临时表 `actor_sumary__dbt_tmp`。已更改的行流入此表。
2. 创建一个新表 `actor_summary_new`。旧表的行则通过从旧表流向新表，确保行 ID 不存在于临时表中，从而有效处理更新和重复。
3. 从临时表中获取的结果流入新的 `actor_summary` 表。
4. 最后，通过 `EXCHANGE TABLES` 语句原子地替换新表与旧版本。旧表和临时表被依次删除。

如下图所示：

<img src={dbt_05} class="image" alt="增量更新 dbt" style={{width: '100%'}}/>

此策略在非常大的模型上可能会遇到挑战。有关更多详细信息，请参见[限制](#limitations)。
### 附加策略（只插入模式） {#append-strategy-inserts-only-mode}

为了克服增量模型中大数据集的限制，该插件使用 dbt 配置参数 `incremental_strategy`。可以将其设置为值 `append`。设置后，更新的行将直接插入目标表（即 `imdb_dbt.actor_summary`），并且不会创建临时表。
注意：仅附加模式要求您的数据是不可变的，或者可以接受重复。如果您想要一个支持更改行的增量表模型，则不要使用此模式！

为说明这种模式，我们将添加另一位新演员并使用 `incremental_strategy='append'` 重新执行 dbt run。

1. 在 actor_summary.sql 中配置仅附加模式：

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. 让我们添加另一位著名演员 - 丹尼·德维托

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. 让我们让丹尼在920部随机电影中出演。

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 920 OFFSET 10000;
   ```

4. 执行一个 dbt run 并确认丹尼已被添加到演员摘要表 

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

注意，与 “Clicky” 的插入相比，这次的增量更新速度快了很多。

再次检查 query_log 表显示两个增量运行之间的差异：

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
   -- 该过滤器将仅在增量运行时应用
   where id > (select max(id) from imdb_dbt.actor_summary) or updated_at > (select max(updated_at) from imdb_dbt.actor_summary)
   ```

在这次运行中，只有新行被直接添加到 `imdb_dbt.actor_summary` 表中，没有涉及表的创建。
### 删除+插入模式（实验性） {#deleteinsert-mode-experimental}

历史上，ClickHouse 对更新和删除的支持有限，形式为异步的[Mutations](/sql-reference/statements/alter/index.md)。这些操作可能非常耗费 IO，通常应尽量避免。

ClickHouse 22.8 引入了[轻量级删除](/sql-reference/statements/delete.md)。这些操作目前是实验性的，但提供了一种性能更好的数据删除方式。

此模式可以通过 `incremental_strategy` 参数为模型配置，例如：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

该策略直接操作目标模型的表，因此如果在操作过程中出现问题，增量模型中的数据可能处于无效状态——没有原子的更新。

总之，该方法：

1. 插件创建一个临时表 `actor_sumary__dbt_tmp`。已更改的行流入此表。
2. 针对当前 `actor_summary` 表发出 `DELETE`。通过行 id 从 `actor_sumary__dbt_tmp` 中删除行。
3. 从 `actor_sumary__dbt_tmp` 中插入行到 `actor_summary`，使用 `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`。

此过程如下图所示：

<img src={dbt_06} class="image" alt="轻量级删除增量" style={{width: '100%'}}/>
### 插入覆盖模式（实验性） {#insert_overwrite-mode-experimental}

执行以下步骤：

1. 创建一个与增量模型关系具有相同结构的暂存（临时）表：`CREATE TABLE {staging} AS {target}`。
2. 仅将新记录（通过 SELECT 生成）插入暂存表。
3. 替换目标表中的新分区（在暂存表中存在的分区）。

<br />

这种方法具有以下优点：

* 它比默认策略更快，因为它不复制整个表。
* 它比其他策略更安全，因为在 INSERT 操作成功完成之前不会修改原始表：在中间失败的情况下，原始表未被修改。
* 它实现了“分区不可变性”的数据工程最佳实践，简化了增量和并行数据处理、回滚等。

<img src={dbt_07} class="image" alt="插入覆盖增量" style={{width: '100%'}}/>
## 创建快照 {#creating-a-snapshot}

dbt 快照允许记录对可变模型随时间的变化。这反过来允许对模型进行时间点查询，分析师可以“回顾”模型的前一个状态。这是通过[类型 2 缓慢变化维度](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row)来实现的，其中 from 和 to 日期列记录了一行有效的时间。这一功能得到了 ClickHouse 插件的支持，并在下面演示。

该示例假定您已完成[创建增量表模型](#creating-an-incremental-materialization)。确保您的 actor_summary.sql 没有将 inserts_only 设置为 True。您的 models/actor_summary.sql 应如下所示：

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

   -- 该过滤器将仅在增量运行时应用
   where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})
   
   {% endif %}
   ```

1. 在快照目录中创建一个文件 `actor_summary`。

    ```bash
     touch snapshots/actor_summary.sql
    ```

2. 使用以下内容更新 actor_summary.sql 文件：
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

有关此内容的一些观察：
* 选择查询定义了您希望随时间快照的结果。使用 ref 函数引用我们之前创建的 actor_summary 模型。
* 我们需要一个时间戳列来指示记录的变化。我们的 updated_at 列（请参见[创建增量表模型](#creating-an-incremental-materialization)）可以在此处使用。参数 strategy 指示我们使用时间戳来表示更新，参数 updated_at 指定要使用的列。如果您的模型中没有此列，您可以替代性地使用[检查策略](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)。这显著低效，并且要求用户指定要比较的列列表。 dbt 比较这些列的当前值和历史值，记录任何变化（如果相同，则不做任何操作）。

3. 运行命令 `dbt snapshot`。

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

请注意，已在快照数据库中创建了一个 actor_summary_snapshot 表（由 target_schema 参数确定）。

4. 取样此数据，您将看到 dbt 包含了列 dbt_valid_from 和 dbt_valid_to。这些列的后一个值设置为 null。随后的运行将更新此值。

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

5. 让我们最喜欢的演员 Clicky McClickHouse 再出演另外10部电影。

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. 从 imdb 目录重新运行 dbt run 命令。此操作将更新增量模型。完成后，运行 dbt snapshot 以捕获更改。

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

7. 如果我们现在查询快照，请注意 Clicky McClickHouse 现在有 2 行。我们之前的条目现在有一个 dbt_valid_to 值。我们的新值在 dbt_valid_from 列中记录了相同的值，并且 dbt_valid_to 值为 null。如果我们确实有新行，这些行也会附加到快照中。

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

有关 dbt 快照的更多详细信息，请参见[此处](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)。
```

## 使用种子 {#using-seeds}

dbt 提供从 CSV 文件加载数据的功能。此功能不适合加载大型数据库导出，更多的是为通常用于代码表和 [字典](../../../../sql-reference/dictionaries/index.md) 的小文件设计，例如将国家代码映射到国家名称。作为一个简单的示例，我们生成功能并上传一个流派代码列表。

1. 我们从现有数据集中生成一个流派代码列表。从 dbt 目录中，使用 `clickhouse-client` 创建一个文件 `seeds/genre_codes.csv`：

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. 执行 `dbt seed` 命令。这个命令将在我们的数据库 `imdb_dbt` 中创建一个新表 `genre_codes`（按照我们的模式配置定义）并使用来自 CSV 文件的行填充它。

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

3. 确认这些数据已被加载：

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

## 限制 {#limitations}

当前的 ClickHouse dbt 插件有几个用户应注意的限制：

1. 该插件当前通过 `INSERT TO SELECT` 的方式将模型物化为表。这实际上意味着数据重复。非常大的数据集（PB）可能导致极长的运行时间，使某些模型不可行。尽量减少任何查询返回的行数，尽可能使用 GROUP BY。优先选择汇总数据的模型，而不是那些简单执行转换而保持源行数的模型。
2. 要使用分布式表表示模型，用户必须手动在每个节点上创建基础复制表。然后，可以在这些表之上创建分布式表。插件不管理集群创建。
3. 当 dbt 在数据库中创建关系（表/视图）时，它通常以 `{{ database }}.{{ schema }}.{{ table/view id }}` 的形式创建。ClickHouse 没有模式的概念。因此，插件使用 `{{schema}}.{{ table/view id }}`，其中 `schema` 是 ClickHouse 数据库。

进一步信息

之前的指南仅触及 dbt 功能的表面。建议用户阅读优秀的 [dbt 文档](https://docs.getdbt.com/docs/introduction)。

插件的额外配置描述在 [这里](https://github.com/silentsokolov/dbt-clickhouse#model-configuration)。

## Fivetran {#fivetran}

`dbt-clickhouse` 连接器也可用于 [Fivetran 转换](https://fivetran.com/docs/transformations/dbt)，允许在 Fivetran 平台内直接使用 `dbt` 进行无缝集成和转换能力。

## 相关内容 {#related-content}

- 博客 & 网络研讨会: [ClickHouse 和 dbt - 来自社区的礼物](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
