---
'sidebar_label': 'dbt'
'slug': '/integrations/dbt'
'sidebar_position': 1
'description': '用户可以使用 dbt 在 ClickHouse 中转换和建模他们的数据'
'title': '集成 dbt 和 ClickHouse'
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


# 集成 dbt 和 ClickHouse

<ClickHouseSupportedBadge/>

**dbt**（数据构建工具）使分析工程师能够通过简单编写 SELECT 语句在其数据仓库中转换数据。 dbt 处理将这些 SELECT 语句物化为数据库中的对象，形成表和视图 - 执行 [提取、加载和转换（ELT）](https://en.wikipedia.org/wiki/Extract,_load,_transform) 中的转化部分。用户可以创建由 SELECT 语句定义的模型。

在 dbt 中，这些模型可以相互引用并分层，以便构建更高层次的概念。连接模型所需的模板 SQL 会自动生成。此外，dbt 识别模型之间的依赖关系，并确保它们按照适当的顺序创建，使用有向无环图（DAG）。

dbt 通过一个 [ClickHouse 支持的插件](https://github.com/ClickHouse/dbt-clickhouse) 与 ClickHouse 兼容。我们描述连接 ClickHouse 的过程，并通过一个基于公开可用的 IMDB 数据集的简单示例进行说明。我们还强调当前连接器的一些局限性。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 概念 {#concepts}

dbt 引入了模型的概念。这被定义为一个 SQL 语句，可能连接多个表。一个模型可以以多种方式“物化”。物化表示模型 SELECT 查询的构建策略。物化背后的代码是模板 SQL，它将您的 SELECT 查询包装在语句中，以便创建一个新关系或更新现有关系。

dbt 提供 4 种类型的物化：

* **视图**（默认）：模型作为数据库中的视图构建。
* **表**：模型作为数据库中的表构建。
* **临时**：模型不直接在数据库中构建，而是作为公共表表达式被拉入依赖模型中。
* **增量**：模型最初作为表物化，在后续运行中，dbt 会在表中插入新行并更新更改的行。

额外的语法和子句定义了如果其基础数据发生更改，如何更新这些模型。 dbt 通常建议从视图物化开始，直到性能成为一个问题。表物化通过将模型查询的结果捕获为一个表来提供查询时间性能的提升，但以增加存储为代价。增量方法在此基础上进一步发展，允许随后对基础数据的更新被捕获到目标表中。

当前的插件支持 ClickHouse 的 **视图**、**表**、**临时** 和 **增量** 物化。该插件还支持 dbt [快照](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) 和 [种子](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)，我们将在本指南中进行探讨。

在以下指南中，我们假设您有一个可用的 ClickHouse 实例。

## dbt 和 ClickHouse 插件的设置 {#setup-of-dbt-and-the-clickhouse-plugin}

### dbt {#dbt}

我们假设在以下示例中使用 dbt CLI。用户也可以考虑 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview)，它提供基于 Web 的集成开发环境（IDE），允许用户编辑和运行项目。

dbt 提供了多种 CLI 安装选项。请按照 [这里](https://docs.getdbt.com/dbt-cli/install/overview) 中描述的说明进行操作。在此阶段仅安装 dbt-core。我们推荐使用 `pip`。

```bash
pip install dbt-core
```

**重要：以下在 python 3.9 下经过测试。**

### ClickHouse 插件 {#clickhouse-plugin}

安装 dbt ClickHouse 插件：

```bash
pip install dbt-clickhouse
```

### 准备 ClickHouse {#prepare-clickhouse}

dbt 在建模高度关系型数据时表现优秀。为了示范，我们提供了一个小的 IMDB 数据集，其关系模式如下。该数据集源自 [关系数据集存储库](https://relational.fit.cvut.cz/dataset/IMDb)。与常用的 dbt 模式相比，这非常简单，但代表了一个可管理的样本：

<Image img={dbt_01} size="lg" alt="IMDB 表模式" />

我们使用这些表的子集，如下所示。

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
表 `roles` 的列 `created_at` 默认为 `now()` 的值。我们稍后使用这个值来识别模型的增量更新 - 请参阅 [增量模型](#creating-an-incremental-materialization)。
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

这些执行可能会因您的带宽而有所不同，但每个操作仅需几秒钟即可完成。执行以下查询以计算每个演员的摘要，按出演电影数量排序，并确认数据成功加载：

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

在后续的指南中，我们将把这个查询转换成一个模型 - 在 ClickHouse中作为 dbt 视图和表进行物化。

## 连接到 ClickHouse {#connecting-to-clickhouse}

1. 创建一个 dbt 项目。在这种情况下，我们以 `imdb` 数据源命名。当提示时，选择 `clickhouse` 作为数据库源。

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

3. 此时，您需要所选择的文本编辑器。在下面的示例中，我们使用流行的 VS Code。打开 IMDB 目录，您应该会看到一系列 yml 和 sql 文件：

    <Image img={dbt_02} size="lg" alt="新 dbt 项目" />

4. 更新您的 `dbt_project.yml` 文件，以指定我们的第一个模型 - `actor_summary` 并设置配置文件为 `clickhouse_imdb`。

    <Image img={dbt_03} size="lg" alt="dbt 配置" />

    <Image img={dbt_04} size="lg" alt="dbt 配置" />

5. 接下来，我们需要向 dbt 提供 ClickHouse 实例的连接详细信息。将以下内容添加到您的 `~/.dbt/profiles.yml`。

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

    注意需要修改用户和密码。有额外的可用设置文档记录在 [这里](https://github.com/silentsokolov/dbt-clickhouse#example-profile)。

6. 从 IMDB 目录中，执行 `dbt debug` 命令，以确认 dbt 是否能够连接到 ClickHouse。

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

    确认响应包含 `Connection test: [OK connection ok]`，表示连接成功。


## 创建简单的视图物化 {#creating-a-simple-view-materialization}

在使用视图物化时，模型在每次运行时都会通过 ClickHouse 中的 `CREATE VIEW AS` 语句重建。这不需要额外的数据存储，但查询速度会比表物化慢。

1. 从 `imdb` 文件夹中，删除目录 `models/example`：

```bash
clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
```

2. 在 `models` 文件夹中的 `actors` 创建一个新文件。在这里，我们创建每个代表演员模型的文件：

```bash
clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
```

3. 在 `models/actors` 文件夹中创建文件 `schema.yml` 和 `actor_summary.sql`。

```bash
clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
```
    文件 `schema.yml` 定义了我们的表。这些表随后将在宏中可用。编辑 `models/actors/schema.yml`，使其包含以下内容：
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
    文件 `actors_summary.sql` 定义了我们实际的模型。请注意，在配置函数中，我们还请求将模型物化为 ClickHouse 中的视图。我们的表通过函数 `source` 从 `schema.yml` 文件中引用，例如 `source('imdb', 'movies')` 引用 `imdb` 数据库中的 `movies` 表。编辑 `models/actors/actors_summary.sql`，使其包含以下内容：
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
    请注意，我们在最终的 actor_summary 中包含了列 `updated_at`。我们稍后将其用于增量物化。

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

5. dbt 将按照请求将该模型表示为 ClickHouse 中的视图。现在我们可以直接查询此视图。该视图将在 `imdb_dbt` 数据库中创建 - 这由 `~/.dbt/profiles.yml` 文件中 `clickhouse_imdb` 配置文件下的 schema 参数确定。

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

    查询此视图时，我们可以使用更简洁的语法复制之前查询的结果：

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

在前面的示例中，我们的模型被物化为一个视图。虽然这可能对某些查询提供足够的性能，但更复杂的 SELECT 或频繁执行的查询可能更适合物化为表。这种物化对通过 BI 工具查询的模型非常有用，以确保用户有更快的体验。这实际导致查询结果被存储为新表，并具有相关的存储开销 - 有效地执行了 `INSERT TO SELECT`。请注意，表将在每次时重建，即它不是增量的。因此，大的结果集可能导致长时间的执行时间 - 请参阅 [dbt 限制](#limitations)。

1. 修改 `actors_summary.sql` 文件，使 `materialized` 参数设置为 `table`。请注意 `ORDER BY` 的定义，并且我们使用 `MergeTree` 表引擎：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
```

2. 从 `imdb` 目录执行命令 `dbt run`。此执行可能需要稍长时间 - 在大多数机器上约 10 秒。

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

3. 确认创建表 `imdb_dbt.actor_summary`：

```sql
SHOW CREATE TABLE imdb_dbt.actor_summary;
```

    您应看到具有适当数据类型的表：
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

4. 确认该表中的结果与之前的响应一致。请注意，现在模型作为表存在，响应时间显著改善：

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

    随意对该模型发出其他查询。例如，哪些演员有超过 5 次出演的高评分电影？

```sql
SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
```

## 创建增量物化 {#creating-an-incremental-materialization}

前面的示例创建了一个表来物化模型。此表将为每次 dbt 执行重建。这对于较大的结果集或复杂的转换可能不可行且极其昂贵。为了解决这个挑战并减少构建时间，dbt 提供增量物化。这允许 dbt 插入或更新自上次执行以来表中的记录，使其适合事件风格的数据。在后台，会创建一个临时表，其中包含所有更新记录，然后将所有未修改的记录和已更新的记录插入到新的目标表中。这对于大型结果集会导致与表模型相似的 [限制](#limitations)。

为了克服大型数据集的这些限制，插件支持 “inserts_only” 模式，其中所有更新都直接插入到目标表中，而无需创建临时表（下面会详细讨论）。

为了说明这个例子，我们将添加演员 “Clicky McClickHouse”，他将在 910 部电影中出现 - 确保他比 [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc) 出现的电影还要多。

1. 首先，我们修改我们的模型为增量类型。这一增加要求：

    1. **unique_key** - 为了确保插件能够唯一识别行，我们必须提供一个 unique_key - 在这种情况下，查询中的 `id` 字段就足够了。这确保我们在物化表中没有行重复。有关唯一性约束的更多详细信息，请参阅 [这里](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)。
    2. **增量过滤器** - 我们还需要告诉 dbt 如何在增量运行中识别哪些行已更改。这是通过提供增量表达式实现的。通常这涉及到事件数据的时间戳；因此我们使用 `updated_at` 时间戳字段。此列在插入行时默认为 `now()` 的值，允许识别新角色。此外，我们需要标识添加新演员的替代情况。使用 `{{this}}` 变量来表示现有物化表，给出表达式 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`。我们将其嵌入 `{% if is_incremental() %}` 条件中，以确保仅在增量运行时使用，而不在构建表时使用。有关增量模型过滤行的更多详细信息，请参见 [dbt 文档中的讨论](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)。

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

    注意到我们的模型将仅响应对 `roles` 和 `actors` 表的更新和添加。为了响应所有表，用户应考虑将此模型拆分为多个子模型 - 每个模型具有自己的增量标准。这些模型可以相互引用和连接。有关交叉引用模型的更多详细信息，请参见 [这里](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)。

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

3. 现在我们将向模型中添加数据，以说明增量更新。将演员 "Clicky McClickHouse" 添加到 `actors` 表中：

```sql
INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
```

4. 让 "Clicky" 出现在 910 部随机电影中：

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 910 OFFSET 10000;
```

5. 通过查询底层源表并跳过任何 dbt 模型，确认他确实是出镜次数最多的演员：

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

6. 执行 `dbt run` 并确认我们的模型已更新，并与上述结果匹配：

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

调整上述查询以适应执行的时间段。我们将结果检查留给用户，但强调插件用来执行增量更新的一般策略：

1. 插件创建一个临时表 `actor_sumary__dbt_tmp`。发生更改的行会被流入此表。
2. 创建一个新表 `actor_summary_new`。旧表中的行会从旧表流向新表，同时检查行 ID 不存在于临时表中。这有效地处理了更新和重复。
3. 从临时表中的结果将流入新的 `actor_summary` 表：
4. 最后，通过 `EXCHANGE TABLES` 语句以原子方式将新表与旧版本交换，旧表和临时表也会被丢弃。

这一过程如下所示：

<Image img={dbt_05} size="lg" alt="增量更新 dbt" />

该策略在非常大的模型上可能会遇到挑战。有关更多详细信息，请参阅 [限制](#limitations)。

### 附加策略（仅插入模式） {#append-strategy-inserts-only-mode}

为了克服增量模型中大数据集的限制，插件使用 dbt 配置参数 `incremental_strategy`。此参数可以设置为 `append` 的值。设置后，更新的行将直接插入目标表（即 `imdb_dbt.actor_summary`），并且不会创建临时表。
注意：仅附加模式要求您的数据为不可变或可以接受重复。如果您希望支持修改行的增量表模型，请不要使用此模式！

为了说明此模式，我们将添加另一个新演员，并使用 `incremental_strategy='append'` 重新执行 dbt run。

1. 在 actor_summary.sql 中配置仅附加模式：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
```

2. 让我们添加另一个著名演员 - Danny DeVito。

```sql
INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
```

3. 让我们让 Danny 在 920 部随机电影中出镜。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 920 OFFSET 10000;
```

4. 执行 dbt run 并确认 Danny 被添加到了演员摘要表中。

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

请注意，与插入 "Clicky" 相比，这次增量处理的速度更快。

再次检查 query_log 表显示了两次增量运行之间的差异：

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

在此运行中，所有的新行都直接添加到 `imdb_dbt.actor_summary` 表中，且没有涉及任何表创建。

### 删除+插入模式（实验性） {#deleteinsert-mode-experimental}

历史上 ClickHouse 仅有限支持更新和删除，以异步 [突变](https://clickhouse.tech/docs/en/sql-reference/statements/alter/index.md) 的形式实现。这些操作可能极其消耗 IO，并且通常应该避免。

ClickHouse 22.8 引入了 [轻量级删除](https://sql-reference/statements/delete.md)。这些目前是实验性的，但提供了一种更高效的删除数据的手段。

此模式可以通过 `incremental_strategy` 参数为模型配置，即：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

该策略直接在目标模型的表上操作，因此如果在操作期间出现问题，增量模型中的数据可能处于无效状态 - 不会进行原子更新。

总而言之，该方法：

1. 插件创建一个临时表 `actor_sumary__dbt_tmp`。发生更改的行会流入此表。
2. 对当前的 `actor_summary` 表发出 `DELETE`。通过 id 从 `actor_sumary__dbt_tmp` 删除行。
3. 使用 `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp` 将 `actor_sumary__dbt_tmp` 中的行插入 `actor_summary`。

此过程如下所示：

<Image img={dbt_06} size="lg" alt="轻量级删除增量" />

### insert_overwrite 模式（实验性） {#insert_overwrite-mode-experimental}

执行以下步骤：

1. 创建一个具有与增量模型关系相同结构的暂存（临时）表：`CREATE TABLE {staging} AS {target}`。
2. 仅将新记录（通过 SELECT 生成）插入到暂存表中。
3. 仅将新分区（存在于暂存表中的）替换到目标表中。

<br />

这种方法有以下优点：

* 与默认策略相比更快，因为它不会复制整个表。
* 比其他策略更安全，因为在 INSERT 操作完成成功之前不会修改原始表：在中间失败的情况下，原始表不会被修改。
* 实现了“分区不可变性”的数据工程最佳实践。这简化了增量和并行数据处理、回滚等。

<Image img={dbt_07} size="lg" alt="插入覆盖增量" />

## 创建快照 {#creating-a-snapshot}

dbt 快照允许记录随时间对可变模型的更改。这反过来允许在模型上进行时间点查询，分析师可以“回顾过去”模型的先前状态。这是通过 [类型-2 缓慢变化维](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) 实现的，其中从和到日期列记录行何时有效。该功能由 ClickHouse 插件支持，下面演示了这一点。

此示例假设您已完成 [创建增量表模型](#creating-an-incremental-materialization)。确保您的 actor_summary.sql 不设置 inserts_only=True。您的 models/actor_summary.sql 应如下所示：

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

2. 使用以下内容更新 actor_summary.sql 文件的内容：
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

关于该内容的几点观察：
* SELECT 查询定义了您希望随着时间快照过的结果。函数 ref 用于引用我们之前创建的 actor_summary 模型。
* 我们需要一个时间戳列来指示记录更改。我们可以在这里使用我们的 updated_at 列（请参见 [创建增量表模型](#creating-an-incremental-materialization)）。parameter strategy 指示我们使用时间戳来表示更新，parameter updated_at 指定要使用的列。如果模型中不存在此列，您也可以使用 [check strategy](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)。这在效率上大大减弱，并要求用户指定要比较的列的列表。 dbt 比较这些列的当前值和历史值，记录任何变化（或在相同情况下不进行任何操作）。

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

注意如何在目标架构中创建了 actor_summary_snapshot 表（由 target_schema 参数决定）。

4. 抽样这些数据，您将看到 dbt 包含了 dbt_valid_from 和 dbt_valid_to 列。后者值被设置为 null。后续运行会更新此值。

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

5. 让我们让我们最喜欢的演员 Clicky McClickHouse 在另外 10 部电影中出现。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
FROM system.numbers
LIMIT 10;
```

6. 从 `imdb` 目录重新运行 dbt run 命令。这将更新增量模型。一旦完成，运行 dbt snapshot 以捕捉更改。

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

7. 如果我们现在查询快照，请注意我们有 2 行 Clicky McClickHouse。我们之前的条目现在具有 dbt_valid_to 值。我们的新值以 dbt_valid_from 列中的相同值记录，并且具有 dbt_valid_to 值为 null。如果我们有新行，这些行也将附加到快照中。

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

dbt 提供从 CSV 文件加载数据的能力。此功能不适合用于加载数据库的大型导出，更适合用于通常用于代码表和 [字典](../../../../sql-reference/dictionaries/index.md) 的小文件，例如将国家代码映射到国家名称。为了简单示范，我们生成并上传一个使用 seed 功能的类型代码列表。

1. 我们从现有数据集中生成类型代码列表。从 dbt 目录中，使用 `clickhouse-client` 创建文件 `seeds/genre_codes.csv`：

```bash
clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
"SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
```

2. 执行 `dbt seed` 命令。这将在我们的 `imdb_dbt` 数据库中创建一个新表 `genre_codes`（如我们的模式配置所定义），表中包含来自 CSV 文件的行。

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

3. 确认这些行已加载：

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

当前的 ClickHouse 插件对于 dbt 有几个用户应注意的限制：

1. 该插件当前将模型物化为使用 `INSERT TO SELECT` 的表。这实际上意味着数据重复。非常大的数据集（PB）可能导致极长的运行时间，使某些模型不可行。旨在最小化任何查询返回的行数，利用 GROUP BY 进行优化。优先选择汇总数据的模型，而不是单纯执行转换同时保持源行计数的模型。
2. 使用分布式表表示模型时，用户必须手动在每个节点上创建底层的副本表。然后，可以在其上创建分布式表。该插件不管理集群创建。
3. 当 dbt 在数据库中创建关系（表/视图）时，通常会创建为： `{{ database }}.{{ schema }}.{{ table/view id }}`。ClickHouse 对 schema 的理解是有限的。因此，插件使用 `{{schema}}.{{ table/view id }}`，其中 `schema` 是 ClickHouse 数据库。

进一步信息

之前的指南仅触及 dbt 功能的表面。建议用户阅读优秀的 [dbt 文档](https://docs.getdbt.com/docs/introduction)。

关于插件的其他配置描述在 [这里](https://github.com/silentsokolov/dbt-clickhouse#model-configuration)。

## Fivetran {#fivetran}

`dbt-clickhouse` 连接器也可用于 [Fivetran 转换](https://fivetran.com/docs/transformations/dbt)，允许直接在 Fivetran 平台内使用 `dbt` 进行无缝集成和转换能力。
