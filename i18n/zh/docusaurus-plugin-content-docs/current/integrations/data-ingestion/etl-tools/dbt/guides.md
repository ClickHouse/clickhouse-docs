---
'sidebar_label': '指南'
'slug': '/integrations/dbt/guides'
'sidebar_position': 2
'description': '使用 dbt 与 ClickHouse 的指南'
'keywords':
- 'clickhouse'
- 'dbt'
- 'guides'
'title': '指南'
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


# 指南

<ClickHouseSupportedBadge/>

本部分提供关于设置 dbt 和 ClickHouse 适配器的指南，以及使用 dbt 和 ClickHouse 的示例。示例涵盖以下内容：

1. 创建一个 dbt 项目并设置 ClickHouse 适配器。
2. 定义一个模型。
3. 更新模型。
4. 创建增量模型。
5. 创建快照模型。
6. 使用物化视图。

这些指南旨在与其余的 [文档](/integrations/dbt) 和 [功能与配置](/integrations/dbt/features-and-configurations) 一起使用。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 设置 {#setup}

请按照 [dbt 和 ClickHouse 适配器的设置](/integrations/dbt) 部分中的说明准备您的环境。

**重要：以下内容在 Python 3.9 下经过测试。**

### 准备 ClickHouse {#prepare-clickhouse}

dbt 在建模高度关系型数据时表现出色。为了示例目的，我们提供一个小的 IMDB 数据集，具有以下关系模式。该数据集源自 [关系数据集库](https://relational.fit.cvut.cz/dataset/IMDb)。相对于 dbt 常用的模式，这个数据集是微不足道的，但代表了一个可管理的样本：

<Image img={dbt_01} size="lg" alt="IMDB 表模式" />

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
表 `roles` 的列 `created_at` 默认值为 `now()`。我们稍后将用此来识别增量更新 - 见 [增量模型](#creating-an-incremental-materialization)。
:::

我们使用 `s3` 函数从公共端点读取源数据以插入数据。执行以下命令以填充表：

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

这些命令的运行时间可能因带宽而异，但每个命令完成仅需几秒钟。执行以下查询以计算每位演员的总结，并按电影出场次数排序，以确认数据已成功加载：

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

在后续的指南中，我们将把这个查询转换为一个模型 - 在 ClickHouse 中将其物化为一个 dbt 视图和表。

## 连接到 ClickHouse {#connecting-to-clickhouse}

1. 创建一个 dbt 项目。在本例中，我们以 `imdb` 数据源命名。当提示时，选择 `clickhouse` 作为数据库源。

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

2. `cd` 到您的项目文件夹：

```bash
cd imdb
```

3. 此时，您需要选择您喜欢的文本编辑器。在下面的示例中，我们使用了流行的 VS Code。打开 IMDB 目录，您应该会看到一系列 yml 和 sql 文件：

    <Image img={dbt_02} size="lg" alt="新 dbt 项目" />

4. 更新您的 `dbt_project.yml` 文件以指定我们的第一个模型 - `actor_summary` 并将配置文件设置为 `clickhouse_imdb`。

    <Image img={dbt_03} size="lg" alt="dbt 配置文件" />

    <Image img={dbt_04} size="lg" alt="dbt 配置文件" />

5. 接下来，我们需要为 dbt 提供我们 ClickHouse 实例的连接详细信息。将以下内容添加到您的 `~/.dbt/profiles.yml` 中。

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

    请注意需要修改用户和密码。还有其他可用设置的文档[在这里](https://github.com/silentsokolov/dbt-clickhouse#example-profile)。

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

    确认响应包含 `Connection test: [OK connection ok]`，表示成功连接。

## 创建简单的视图物化 {#creating-a-simple-view-materialization}

使用视图物化时，模型会在每次运行时通过 ClickHouse 的 `CREATE VIEW AS` 语句重建为一个视图。这不需要额外的数据存储，但查询速度比表物化慢。

1. 从 `imdb` 文件夹，删除目录 `models/example`：

```bash
clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
```

2. 在 `models` 文件夹的 `actors` 中创建一个新文件。这里我们创建的文件分别代表每个演员模型：

```bash
clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
```

3. 在 `models/actors` 文件夹中创建文件 `schema.yml` 和 `actor_summary.sql`。

```bash
clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
```
    文件 `schema.yml` 定义我们的表。因此，这些表将在宏中可用。编辑
    `models/actors/schema.yml` 使其包含以下内容：
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
    文件 `actors_summary.sql` 定义我们的实际模型。请注意，在配置函数中，我们还请求将模型物化为 ClickHouse 中的视图。我们的表通过函数 `source` 从 `schema.yml` 中引用，例如 `source('imdb', 'movies')` 参考 `imdb` 数据库中的 `movies` 表。编辑 `models/actors/actors_summary.sql` 使其包含以下内容：
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
    请注意我们在最终的 actor_summary 中包含列 `updated_at`。我们稍后将其用于增量物化。

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

5. dbt 会按照请求将模型表示为 ClickHouse 中的视图。我们现在可以直接查询此视图。此视图将在 `imdb_dbt` 数据库中创建 - 这是由文件 `~/.dbt/profiles.yml` 中 `clickhouse_imdb` 配置文件的 schema 参数决定的。

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

    查询此视图，我们可以使用更简单的语法复现我们之前查询的结果：

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

在前一个示例中，我们的模型物化为一个视图。虽然这可能对某些查询提供足够的性能，但更复杂的 SELECT 或频繁执行的查询可能更适合物化为表。这种物化对于将被 BI 工具查询的模型非常有用，以确保用户获得更快的体验。这实际上使查询结果存储为新表，并随之产生存储开销 - 本质上，执行 `INSERT TO SELECT`。请注意，此表将在每次执行时重构，即不是增量的。因此，大结果集可能导致长时间执行 - 见 [dbt 限制](/integrations/dbt#limitations)。

1. 修改文件 `actors_summary.sql` 使 `materialized` 参数设置为 `table`。注意 `ORDER BY` 是如何定义的，并注意我们使用 `MergeTree` 表引擎：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
```

2. 从 `imdb` 目录执行命令 `dbt run`。这次执行可能会花费更长的时间 - 大多数机器上大约 10 秒。

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

3. 确认表 `imdb_dbt.actor_summary` 创建成功：

```sql
SHOW CREATE TABLE imdb_dbt.actor_summary;
```

    您应该看到带有适当数据类型的表：
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

4. 确认该表的结果与先前的响应一致。请注意，现在模型为表后响应时间明显改善：

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

    随意对该模型发出其他查询。例如，哪些演员的最高评分电影出演次数超过 5 次？

```sql
SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
```

## 创建增量物化 {#creating-an-incremental-materialization}

在前一个示例中创建了一个表来物化模型。该表将在每次 dbt 执行时重构。这在处理更大结果集或复杂变换时可能是不可行且极具成本的。为了解决这个问题并减少构建时间，dbt 提供了增量物化。这允许 dbt 自上次执行以来向表中插入或更新记录，使其适合事件样式数据。在后台，创建了一个临时表，包含所有更新的记录，然后将所有未更改的记录以及更新的记录插入到新的目标表中。这对于大型结果集与表模型的[限制](/integrations/dbt#limitations)是类似的。

为了克服大型数据集的这些限制，适配器支持 'inserts_only' 模式，在该模式中，所有更新都会直接插入目标表，而无需创建临时表（稍后会详细介绍）。

为了说明这个例子，我们将添加演员 "Clicky McClickHouse"，他将在令人难以置信的 910 部电影中出现 - 确保他出现的电影数量超过了 [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc)。

1. 首先，我们将修改我们的模型为增量类型。此添加要求：

    1. **unique_key** - 为确保适配器可以唯一识别行，我们必须提供 unique_key - 在这种情况下，查询中的 `id` 字段就足够了。这确保我们在物化表中没有行重复。有关唯一性约束的更多详细信息，请参见[这里](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)。
    2. **增量过滤器** - 我们还需要告诉 dbt 如何在增量运行中识别哪些行已更改。通过提供一个 delta 表达式来实现。通常这涉及到事件数据的时间戳；因此，我们使用了更新的时间戳字段 `updated_at`。该列的默认值在插入行时为 `now()`，允许新角色被识别。此外，我们需要识别另一种情况，即新演员被添加。使用变量 `{{this}}`，表示现有的物化表，给我们表达式 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`。我们将其嵌入到 `{% if is_incremental() %}` 条件内，确保它仅在增量运行时使用，而不是在表首次构建时。有关增量模型中行过滤的更多详细信息，请参见 [dbt 文档中的此讨论](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)。

    更新文件 `actor_summary.sql` 如下：

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

    请注意，我们的模型将仅响应对 `roles` 和 `actors` 表的更新和添加。要响应所有表，用户可以鼓励将此模型拆分为多个子模型 - 每个子模型都有自己的增量标准。这些模型又可以相互引用和连接。有关交叉引用模型的更多详细信息，请参见 [这里](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)。

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

3. 现在我们将向模型添加数据以说明增量更新。将我们的演员 "Clicky McClickHouse" 添加到 `actors` 表中：

```sql
INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
```

4. 让 "Clicky" 出演 910 部随机电影：

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 910 OFFSET 10000;
```

5. 确认他确实是现在出场次数最多的演员，通过查询基础源表并绕过任何 dbt 模型：

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

6. 执行 `dbt run` 并确认我们的模型已更新并与上面的结果匹配：

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

### 内部信息 {#internals}

我们可以通过查询 ClickHouse 的查询日志来识别执行以上增量更新的语句。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

调整上述查询以匹配执行期间。我们将结果检查留给用户，但强调适配器用于执行增量更新的总体策略：

1. 适配器创建一个临时表 `actor_sumary__dbt_tmp`。已更改的行被流入这个表。
2. 创建一个新表 `actor_summary_new`。旧表的行被流式传输到新表，同时检查确保行 ID 不存在于临时表中。这有效地处理了更新和重复。
3. 从临时表的结果被流入新的 `actor_summary` 表：
4. 最后，新表通过 `EXCHANGE TABLES` 语句与旧版本原子交换。旧表和临时表依次被丢弃。

这一过程如下图所示：

<Image img={dbt_05} size="lg" alt="增量更新 dbt" />

这种策略在非常大的模型上可能会遇到挑战。有关更多详细信息，请参见 [限制](/integrations/dbt#limitations)。

### 附加策略（仅插入模式） {#append-strategy-inserts-only-mode}

为克服增量模型中大数据集的限制，适配器使用 dbt 配置参数 `incremental_strategy`。这可以设置为值 `append`。设置后，更新的行直接插入目标表（即 `imdb_dbt.actor_summary`），并且不创建临时表。
注意：仅附加模式要求您的数据必须是不可变的，或者允许重复。如果您想要一个支持修改行的增量表模型，请不要使用此模式！

为了说明这种模式，我们将添加另一位新演员并重新执行 dbt run，设置 `incremental_strategy='append'`。

1. 在 actor_summary.sql 中配置仅附加模式：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
```

2. 让我们再添加一位著名演员 - Danny DeBito

```sql
INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
```

3. 让我们让 Danny 在 920 部随机电影中主演。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 920 OFFSET 10000;
```

4. 执行 dbt run 并确认 Danny 已添加到演员总结表中

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

注意，与 "Clicky" 的插入相比，这次增量的速度更快。

再次检查 query_log 表揭示了这两次增量运行之间的差异：

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

在这次运行中，仅将新行直接添加到 `imdb_dbt.actor_summary` 表中，并且没有涉及表的创建。

### 删除和插入模式（实验性） {#deleteinsert-mode-experimental}

历史上，ClickHouse 仅对更新和删除提供有限的支持，以异步 [Mutations](/sql-reference/statements/alter/index.md) 形式存在。这些操作可能非常消耗 IO，通常应避免。

ClickHouse 22.8 引入了 [轻量级删除](/sql-reference/statements/delete.md)，而 ClickHouse 25.7 引入了 [轻量级更新](/sql-reference/statements/update)。随着这些功能的引入，来自单个更新查询的修改，即使是异步物化，也会使用户感觉是立即生效的。

可以通过 `incremental_strategy` 参数为模型配置此模式，即：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

此策略直接作用于目标模型的表，因此如果操作过程中出现问题，增量模型中的数据可能处于无效状态 - 没有原子更新。

总结来说，这种方法：

1. 适配器创建一个临时表 `actor_sumary__dbt_tmp`。已更改的行会流入这个表。
2. 针对当前 `actor_summary` 表发出 `DELETE`。通过 id 从 `actor_sumary__dbt_tmp` 中删除行。
3. 从 `actor_sumary__dbt_tmp` 中使用 `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp` 向 `actor_summary` 插入行。

该过程如下图所示：

<Image img={dbt_06} size="lg" alt="轻量级删除增量" />

### insert_overwrite 模式（实验性） {#insert_overwrite-mode-experimental}
执行以下步骤：

1. 创建一个与增量模型关系结构相同的暂存（临时）表：`CREATE TABLE {staging} AS {target}`。
2. 仅将新记录（由 SELECT 生成）插入暂存表。
3. 将仅存在于暂存表中的新分区替换到目标表中。

<br />

这种方法具有以下优点：

* 它比默认策略更快，因为它不会复制整个表。
* 它比其他策略更安全，因为在 INSERT 操作完成成功之前不会修改原始表：在中间失败的情况下，原始表不会被修改。
* 它实现了“分区不可变性”的数据工程最佳实践。这简化了增量和并行数据处理、回滚等。

<Image img={dbt_07} size="lg" alt="插入覆盖增量" />

## 创建快照 {#creating-a-snapshot}

dbt 快照允许记录对可变模型在一段时间内的更改。这进而允许在模型上进行时间点查询，分析师可以“回顾过去”模型的先前状态。这个功能是通过 [类型-2 缓慢变化维度](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) 实现的，其中有效日期列记录行何时有效。此功能受 ClickHouse 适配器的支持，下面演示。

此示例假设您已完成 [创建增量表模型](#creating-an-incremental-materialization)。确保您的 actor_summary.sql 没有设置 inserts_only=True。您的 models/actor_summary.sql 应如下所示：

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

关于此内容的一些观察：
* select 查询定义了您希望随着时间快照的结果。函数 ref 用于引用我们之前创建的 actor_summary 模型。
* 我们需要一个时间戳列来指示记录更改。我们可以在此处使用更新的时间戳列（见 [创建增量表模型](#creating-an-incremental-materialization)）。策略参数指示我们使用时间戳来表示更新，updated_at 参数指定要使用的列。如果该列不存在于您的模型中，您可以选择使用 [check 策略](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)。这是显著低效的，并需要用户指定要比较的列列表。 dbt 比较这些列的当前值和历史值，记录任何更改（或在相同的情况下不进行任何操作）。

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

请注意，已在快照数据库中创建了一个名为 actor_summary_snapshot 的表（由 target_schema 参数确定）。

4. 取样这个数据，您将看到 dbt 包含了列 dbt_valid_from 和 dbt_valid_to。后者的值设置为 null。后续运行将会更新这一点。

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

5. 让我们最喜欢的演员 Clicky McClickHouse 再出现在 10 部电影中。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
FROM system.numbers
LIMIT 10;
```

6. 从 `imdb` 目录重新运行 dbt run 命令。这将更新增量模型。一旦完成，运行 dbt snapshot 以捕获更改。

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

7. 如果我们现在查询我们的快照，请注意我们有 2 行 Clicky McClickHouse。我们的前一条记录现在有了 dbt_valid_to 值。我们的新值在 dbt_valid_from 列中记录相同的值，并且 dbt_valid_to 值为 null。如果我们确实有新行，这些也将附加到快照中。

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

有关 dbt 快照的更多详细信息，请参见 [这里](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)。

## 使用种子 {#using-seeds}

dbt 提供了从 CSV 文件加载数据的能力。此功能不适合加载大型数据库导出，更适合通常用于代码表和 [字典](../../../../sql-reference/dictionaries/index.md)的小文件，例如将国家代码映射到国家名称。以一个简单的例子，我们使用种子功能生成并上传一个流派代码列表。

1. 我们从已有的数据集中生成流派代码列表。从 dbt 目录中，使用 `clickhouse-client` 创建文件 `seeds/genre_codes.csv`：

```bash
clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
"SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
```

2. 执行 `dbt seed` 命令。这将根据我们的 CSV 文件创建一个在数据库 `imdb_dbt` 中的新表 `genre_codes`（由我们的 schema 配置定义）。

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
3. 确认这些已被加载：

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
