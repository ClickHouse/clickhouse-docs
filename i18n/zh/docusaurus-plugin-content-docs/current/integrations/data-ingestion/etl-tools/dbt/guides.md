---
sidebar_label: '指南'
slug: /integrations/dbt/guides
sidebar_position: 2
description: '使用 dbt 搭配 ClickHouse 的指南'
keywords: ['clickhouse', 'dbt', 'guides']
title: '指南'
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


# 指南

<ClickHouseSupportedBadge/>

本节提供了关于设置 dbt 和 ClickHouse 适配器的指南，以及一个使用公开可访问的 IMDb 数据集在 ClickHouse 中使用 dbt 的示例。该示例涵盖以下步骤：

1. 创建 dbt 项目并设置 ClickHouse 适配器。
2. 定义模型。
3. 更新模型。
4. 创建增量模型。
5. 创建快照模型。
6. 使用物化视图。

这些指南旨在与其余的[文档](/integrations/dbt)以及[功能和配置](/integrations/dbt/features-and-configurations)配合使用。

<TOCInline toc={toc}  maxHeadingLevel={2} />



## 设置 {#setup}

按照 [dbt 和 ClickHouse 适配器的设置](/integrations/dbt) 部分中的说明准备您的环境。

**重要提示:以下内容已在 Python 3.9 环境下测试通过。**

### 准备 ClickHouse {#prepare-clickhouse}

dbt 在对高度关联的数据进行建模时表现出色。为了演示目的,我们提供了一个小型 IMDB 数据集,其关系模式如下所示。该数据集来源于[关系数据集存储库](https://relational.fit.cvut.cz/dataset/IMDb)。相对于 dbt 常用的模式,这个数据集较为简单,但它是一个易于管理的示例:

<Image img={dbt_01} size='lg' alt='IMDB 表模式' />

我们使用这些表的一个子集,如图所示。

创建以下表:

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
表 `roles` 的 `created_at` 列默认值为 `now()`。我们稍后将使用此列来识别模型的增量更新 - 请参阅[增量模型](#creating-an-incremental-materialization)。
:::

我们使用 `s3` 函数从公共端点读取源数据并插入数据。运行以下命令来填充表:

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

这些命令的执行时间可能因您的带宽而异,但每个命令应该只需要几秒钟即可完成。执行以下查询来计算每个演员的汇总信息,按电影出演次数排序,并确认数据已成功加载:


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

返回结果应如下所示：

```response
+------+------------+----------+------------------+-------------+--------------+-------------------+
|id    |姓名        |电影数量  |平均评分          |独特类型数   |独特导演数    |更新时间           |
+------+------------+----------+------------------+-------------+--------------+-------------------+
|45332 |Mel Blanc   |832       |6.175853582979779 |18           |84            |2022-04-26 14:01:45|
|621468|Bess Flowers|659       |5.57727638854796  |19           |293           |2022-04-26 14:01:46|
|372839|Lee Phelps  |527       |5.032976449684617 |18           |261           |2022-04-26 14:01:46|
|283127|Tom London  |525       |2.8721716524875673|17           |203           |2022-04-26 14:01:46|
|356804|Bud Osborne |515       |2.0389507108727773|15           |149           |2022-04-26 14:01:46|
+------+------------+----------+------------------+-------------+--------------+-------------------+
```

在后续指南中，我们会将此查询转换为一个模型——在 ClickHouse 中将其物化为一个 dbt 视图和数据表。


## 连接到 ClickHouse {#connecting-to-clickhouse}

1. 创建一个 dbt 项目。在本例中,我们以 `imdb` 数据源命名该项目。当出现提示时,选择 `clickhouse` 作为数据库源。

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

2. 使用 `cd` 命令进入项目文件夹:

   ```bash
   cd imdb
   ```

3. 此时,您需要选择一个文本编辑器。在下面的示例中,我们使用流行的 VS Code。打开 IMDB 目录后,您应该会看到一系列 yml 和 sql 文件:

   <Image img={dbt_02} size='lg' alt='New dbt project' />

4. 更新 `dbt_project.yml` 文件以指定我们的第一个模型 - `actor_summary`,并将 profile 设置为 `clickhouse_imdb`。

   <Image img={dbt_03} size='lg' alt='dbt profile' />

   <Image img={dbt_04} size='lg' alt='dbt profile' />

5. 接下来,我们需要向 dbt 提供 ClickHouse 实例的连接详细信息。将以下内容添加到 `~/.dbt/profiles.yml` 文件中。

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
         password: ""
         secure: False
   ```

   注意需要修改用户名和密码。其他可用设置记录在[此处](https://github.com/silentsokolov/dbt-clickhouse#example-profile)。

6. 从 IMDB 目录中执行 `dbt debug` 命令,以确认 dbt 是否能够连接到 ClickHouse。

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

   确认响应中包含 `Connection test: [OK connection ok]`,表示连接成功。


## 创建简单的视图物化 {#creating-a-simple-view-materialization}

使用视图物化时,模型在每次运行时都会通过 ClickHouse 中的 `CREATE VIEW AS` 语句重建为视图。这不需要额外的数据存储空间,但查询速度会比表物化慢。

1. 从 `imdb` 文件夹中删除 `models/example` 目录:

   ```bash
   clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
   ```

2. 在 `models` 文件夹中创建一个新的 `actors` 文件夹。在这里我们创建的文件分别代表一个演员模型:

   ```bash
   clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
   ```

3. 在 `models/actors` 文件夹中创建 `schema.yml` 和 `actor_summary.sql` 文件。

   ```bash
   clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
   clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
   ```

   文件 `schema.yml` 定义了我们的表。这些表随后可在宏中使用。编辑
   `models/actors/schema.yml` 使其包含以下内容:

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

   文件 `actors_summary.sql` 定义了我们的实际模型。注意在配置函数中,我们还要求该模型在 ClickHouse 中物化为视图。我们的表通过 `source` 函数从 `schema.yml` 文件中引用,例如 `source('imdb', 'movies')` 引用 `imdb` 数据库中的 `movies` 表。编辑 `models/actors/actors_summary.sql` 使其包含以下内容:

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

   注意我们在最终的 actor_summary 中包含了 `updated_at` 列。我们稍后将其用于增量物化。

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

5. 按我们的配置，dbt 会在 ClickHouse 中将该模型创建为一个视图。现在我们可以直接查询这个视图。该视图会被创建在 `imdb_dbt` 数据库中——其所属的 schema 由 `~/.dbt/profiles.yml` 文件中 `clickhouse_imdb` 配置下的 schema 参数决定。

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
   |imdb_dbt          |  <--- 由 dbt 创建！
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

在前面的示例中,我们的模型被物化为视图。虽然这对某些查询可能提供足够的性能,但对于更复杂的 SELECT 语句或频繁执行的查询,物化为表可能是更好的选择。这种物化方式对于将被 BI 工具查询的模型非常有用,可以确保用户获得更快的体验。这实际上会将查询结果存储为新表,并带来相应的存储开销 - 实际上执行的是 `INSERT TO SELECT` 操作。请注意,该表每次都会被重建,即它不是增量更新的。因此,大型结果集可能导致较长的执行时间 - 请参阅 [dbt 限制](/integrations/dbt#limitations)。

1. 修改文件 `actors_summary.sql`,将 `materialized` 参数设置为 `table`。注意 `ORDER BY` 的定义方式,以及我们使用了 `MergeTree` 表引擎:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
   ```

2. 从 `imdb` 目录执行命令 `dbt run`。此执行可能需要稍长的时间 - 在大多数机器上约 10 秒。

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

3. 确认表 `imdb_dbt.actor_summary` 已创建:

   ```sql
   SHOW CREATE TABLE imdb_dbt.actor_summary;
   ```

   您应该看到具有相应数据类型的表:

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

4. 确认此表的结果与之前的响应一致。注意现在模型是表后,响应时间有明显改善:

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


您也可以基于该模型自由执行其他查询。例如：哪些演员参演的电影数量超过 5 部，且其电影评分最高？

```sql
SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
```


## 创建增量物化 {#creating-an-incremental-materialization}

前面的示例创建了一个表来物化模型。该表将在每次 dbt 执行时重新构建。对于较大的结果集或复杂的转换,这可能不可行且成本极高。为了应对这一挑战并减少构建时间,dbt 提供了增量物化功能。这允许 dbt 自上次执行以来向表中插入或更新记录,使其适用于事件类型的数据。在底层实现中,会创建一个包含所有更新记录的临时表,然后将所有未修改的记录以及更新的记录插入到新的目标表中。这导致对于大型结果集存在与表模型类似的[限制](/integrations/dbt#limitations)。

为了克服大型数据集的这些限制,适配器支持 'inserts_only' 模式,在该模式下所有更新都直接插入到目标表中,而无需创建临时表(下文将详细介绍)。

为了说明这个示例,我们将添加演员 "Clicky McClickHouse",他将出现在令人难以置信的 910 部电影中——确保他出演的电影数量甚至超过了 [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc)。

1. 首先,我们将模型修改为增量类型。此修改需要:
   1. **unique_key** - 为了确保适配器能够唯一标识行,我们必须提供一个 unique_key——在本例中,查询中的 `id` 字段就足够了。这确保我们的物化表中不会有重复的行。有关唯一性约束的更多详细信息,请参见[此处](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)。
   2. **增量过滤器** - 我们还需要告诉 dbt 如何识别在增量运行中哪些行发生了变化。这通过提供增量表达式来实现。通常这涉及事件数据的时间戳;因此我们使用 updated_at 时间戳字段。该列在插入行时默认为 now() 的值,允许识别新记录。此外,我们还需要识别添加新演员的情况。使用 `{{this}}` 变量来表示现有的物化表,这给我们提供了表达式 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`。我们将其嵌入到 `{% if is_incremental() %}` 条件中,确保它仅在增量运行时使用,而不是在首次构建表时使用。有关为增量模型过滤行的更多详细信息,请参见 [dbt 文档中的此讨论](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)。

   按如下方式更新文件 `actor_summary.sql`:


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

    -- 此过滤器仅在增量运行时生效
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
```

请注意，我们的模型只会处理对 `roles` 和 `actors` 表的更新和新增。若要覆盖所有表，建议用户将该模型拆分为多个子模型——每个子模型都有各自的增量条件。随后，这些模型可以被引用并相互关联。有关模型交叉引用的更多详细信息，请参见[此处](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)。

2. 执行一次 `dbt run` 并确认生成结果表的内容：

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
    |id    |姓名        |电影数量  |平均评分          |类型  |导演     |更新时间           |
    +------+------------+----------+------------------+------+---------+-------------------+
    |45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
    |621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
    |372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
    |283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
    |356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
    +------+------------+----------+------------------+------+---------+-------------------+
```

3. 现在我们将向模型中添加数据以演示增量更新。将我们的演员 “Clicky McClickHouse” 添加到 `actors` 表中：

   ```sql
   INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
   ```

4. 让 “Clicky” 参演 910 部随机选取的电影：

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 910 OFFSET 10000;
   ```

5. 通过查询底层源表并绕过所有 dbt 模型，确认他确实已经成为出演次数最多的演员：

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

6. 执行一次 `dbt run`，并确认我们的模型已更新且与上述结果一致：


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

### 内部机制 {#internals}

我们可以通过查询 ClickHouse 的查询日志来识别执行上述增量更新的语句。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

根据实际执行时间段调整上述查询。我们将结果检查留给用户,但在此重点说明适配器执行增量更新所使用的一般策略:

1. 适配器创建一个临时表 `actor_sumary__dbt_tmp`。已更改的行会流式传输到此表中。
2. 创建一个新表 `actor_summary_new`。旧表中的行依次从旧表流式传输到新表,同时检查以确保行 ID 不存在于临时表中。这样可以有效处理更新和重复项。
3. 临时表中的结果流式传输到新的 `actor_summary` 表中:
4. 最后,通过 `EXCHANGE TABLES` 语句将新表与旧版本进行原子交换。旧表和临时表随后被删除。

下图展示了这一过程:

<Image img={dbt_05} size='lg' alt='incremental updates dbt' />

此策略在处理非常大的模型时可能会遇到挑战。有关更多详细信息,请参阅[限制](/integrations/dbt#limitations)。

### 追加策略(仅插入模式) {#append-strategy-inserts-only-mode}

为了克服增量模型中大型数据集的限制,适配器使用 dbt 配置参数 `incremental_strategy`。可以将其设置为值 `append`。设置后,更新的行将直接插入到目标表(即 `imdb_dbt.actor_summary`)中,不会创建临时表。
注意:仅追加模式要求您的数据是不可变的,或者可以接受重复项。如果您需要一个支持修改行的增量表模型,请不要使用此模式!

为了说明此模式,我们将添加另一个新演员,并使用 `incremental_strategy='append'` 重新执行 dbt run。

1. 在 actor_summary.sql 中配置仅追加模式:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. 让我们添加另一位著名演员 - Danny DeBito

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. 让我们让 Danny 出演 920 部随机电影。


```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 920 OFFSET 10000;
```

4. 执行 dbt run 并确认 Danny 已添加到 actor-summary 表

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

注意此次增量操作相比插入 "Clicky" 时快了很多。

再次检查 query_log 表可以看出这两次增量运行之间的差异:

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
-- 此过滤器仅在增量运行时应用
WHERE id > (SELECT max(id) FROM imdb_dbt.actor_summary) OR updated_at > (SELECT max(updated_at) FROM imdb_dbt.actor_summary)
```

在此次运行中,仅将新行直接添加到 `imdb_dbt.actor_summary` 表,不涉及表创建操作。

### 删除和插入模式(实验性功能) {#deleteinsert-mode-experimental}


历史上,ClickHouse 仅通过异步 [Mutations](/sql-reference/statements/alter/index.md) 的形式对更新和删除提供有限支持。这些操作可能会极其消耗 IO 资源,通常应避免使用。

ClickHouse 22.8 引入了[轻量级删除](/sql-reference/statements/delete.md),ClickHouse 25.7 引入了[轻量级更新](/sql-reference/statements/update)。随着这些功能的引入,单个更新查询的修改即使在异步物化时,从用户角度来看也会立即生效。

可以通过 `incremental_strategy` 参数为模型配置此模式,例如:

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

此策略直接在目标模型的表上操作,因此如果操作过程中出现问题,增量模型中的数据可能会处于无效状态——不存在原子更新。

总结来说,此方法执行以下步骤:

1. 适配器创建临时表 `actor_sumary__dbt_tmp`。已更改的行会流式传输到此表中。
2. 对当前的 `actor_summary` 表执行 `DELETE` 操作。根据 `actor_sumary__dbt_tmp` 中的 id 删除相应的行。
3. 使用 `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp` 将 `actor_sumary__dbt_tmp` 中的行插入到 `actor_summary` 中。

此过程如下所示:

<Image img={dbt_06} size='lg' alt='lightweight delete incremental' />

### insert_overwrite 模式(实验性) {#insert_overwrite-mode-experimental}

执行以下步骤:

1. 创建与增量模型关系结构相同的暂存(临时)表:`CREATE TABLE {staging} AS {target}`。
2. 仅将新记录(由 SELECT 生成)插入到暂存表中。
3. 仅将新分区(存在于暂存表中的分区)替换到目标表中。

<br />

此方法具有以下优势:

- 速度更快,因为无需复制整个表。
- 更加安全,因为在 INSERT 操作成功完成之前不会修改原始表:如果中间发生故障,原始表不会被修改。
- 实现了"分区不可变性"数据工程最佳实践,简化了增量和并行数据处理、回滚等操作。

<Image img={dbt_07} size='lg' alt='insert overwrite incremental' />


## 创建快照 {#creating-a-snapshot}

dbt 快照功能允许记录可变模型随时间的变化。这使得可以对模型进行时间点查询,分析人员可以"回溯时间"查看模型的历史状态。这是通过使用[类型 2 缓慢变化维度](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row)实现的,其中起始和结束日期列记录行的有效时间范围。ClickHouse 适配器支持此功能,下面将进行演示。

此示例假设您已完成[创建增量表模型](#creating-an-incremental-materialization)。请确保您的 actor_summary.sql 未设置 inserts_only=True。您的 models/actor_summary.sql 应如下所示:

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

-- 此过滤器仅在增量运行时应用
where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

{% endif %}
```

1. 在 snapshots 目录中创建文件 `actor_summary`。

   ```bash
    touch snapshots/actor_summary.sql
   ```

2. 使用以下内容更新 actor_summary.sql 文件:

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

关于此内容的几点说明:

- select 查询定义了您希望随时间快照的结果。函数 ref 用于引用我们之前创建的 actor_summary 模型。
- 我们需要一个时间戳列来指示记录变化。这里可以使用我们的 updated_at 列(参见[创建增量表模型](#creating-an-incremental-materialization))。参数 strategy 表示我们使用时间戳来标识更新,参数 updated_at 指定要使用的列。如果您的模型中不存在此列,您可以选择使用 [check 策略](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)。这种方式效率要低得多,并且需要用户指定要比较的列列表。dbt 会比较这些列的当前值和历史值,记录任何变化(如果相同则不执行任何操作)。

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

请注意，在 snapshots 数据库中已经创建了一个名为 actor&#95;summary&#95;snapshot 的表（由 target&#95;schema 参数确定）。

4. 抽样查看这些数据，你会发现 dbt 已经包含了列 dbt&#95;valid&#95;from 和 dbt&#95;valid&#95;to。后者的值被设置为 null，后续的运行将会更新这一列。

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

5. 让我们最喜欢的演员 Clicky McClickHouse 再出现在另外 10 部电影中。

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
   FROM system.numbers
   LIMIT 10;
   ```

6. 从 `imdb` 目录重新运行 dbt run 命令。这将更新增量模型。完成后，运行 dbt snapshot 命令来捕获这些更改。

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
   ```


clickhouse-user@clickhouse:~/imdb$ dbt snapshot
13:46:26  使用 dbt=1.1.0 运行
13:46:26  找到 1 个模型，0 个测试，1 个快照，0 个分析，181 个宏，0 个操作，0 个种子文件，3 个数据源，0 个 exposure，0 个度量
13:46:26
13:46:27  并发度：1 个线程 (target=&#39;dev&#39;)
13:46:27
13:46:27  1 of 1 START snapshot snapshots.actor&#95;summary&#95;snapshot...................... [RUN]
13:46:31  1 of 1 OK snapshotted snapshots.actor&#95;summary&#95;snapshot...................... [OK in 4.05s]
13:46:31
13:46:31  在 5.02 秒内完成运行 1 个快照。
13:46:31
13:46:31  已成功完成
13:46:31
13:46:31  完成。PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1

````

7. 现在查询快照,可以看到 Clicky McClickHouse 有 2 条记录。之前的条目现在有了 dbt_valid_to 值。新值的 dbt_valid_from 列记录了相同的时间值,而 dbt_valid_to 值为 null。如果有新行,这些行也会追加到快照中。

 ```sql
 SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
````

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

如需了解 dbt 快照的更多详情，请参见[此处](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)。


## 使用种子数据 {#using-seeds}

dbt 提供了从 CSV 文件加载数据的功能。此功能不适用于加载大型数据库导出,而是专为小型文件设计,通常用于代码表和[字典](../../../../sql-reference/dictionaries/index.md),例如将国家代码映射到国家名称。下面通过一个简单示例,演示如何使用种子数据功能生成并上传类型代码列表。

1. 从现有数据集生成类型代码列表。在 dbt 目录中,使用 `clickhouse-client` 创建文件 `seeds/genre_codes.csv`:

   ```bash
   clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
   "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
   LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
   ```

2. 执行 `dbt seed` 命令。这将在数据库 `imdb_dbt` 中创建一个新表 `genre_codes`(由模式配置定义),并将 CSV 文件中的数据行加载到该表中。

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

3. 确认数据已成功加载:

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


## 更多信息 {#further-information}

前面的指南仅介绍了 dbt 功能的基础内容。建议用户阅读详尽的 [dbt 文档](https://docs.getdbt.com/docs/introduction)。
