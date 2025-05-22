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

**dbt**（数据构建工具）使分析工程师能够仅通过编写 SELECT 语句来转换他们的数据仓库中的数据。 dbt 处理将这些 SELECT 语句物化为数据库中的表和视图形式的对象 - 执行 [提取、加载和转换（ELT）](https://en.wikipedia.org/wiki/Extract,_load,_transform) 中的转换（T）。用户可以创建由 SELECT 语句定义的模型。

在 dbt 中，这些模型可以交叉引用和分层，以便构建更高级别的概念。连接模型所需的 SQL 模板代码将自动生成。此外，dbt 识别模型之间的依赖关系，并使用有向无环图（DAG）确保按适当顺序创建它们。

通过 [ClickHouse 支持的插件](https://github.com/ClickHouse/dbt-clickhouse)，dbt 与 ClickHouse 兼容。我们描述了通过一个基于公开可用的 IMDB 数据集的简单示例将 ClickHouse 连接到 dbt 的过程。我们还强调了当前连接器的一些限制。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 概念 {#concepts}

dbt 引入了模型的概念。这被定义为一个 SQL 语句，可能连接多个表。模型可以以多种方式“物化”。物化表示模型的 SELECT 查询的构建策略。物化背后的代码是模板 SQL，它将您的 SELECT 查询包装在一个语句中，以创建一个新的或更新现有的关系。

dbt 提供 4 种类型的物化：

* **视图**（默认）：模型作为数据库中的视图构建。
* **表**：模型作为数据库中的表构建。
* **短暂**：模型不直接在数据库中构建，而是作为公共表表达式被提取到依赖模型中。
* **增量**：模型最初作为表物化，并在后续运行中，dbt 向表中插入新行并更新更改的行。

其他语法和子句定义了如果其底层数据发生更改，这些模型应如何更新。一般来说，dbt 建议在性能成为问题之前先从视图物化开始。表物化通过将模型查询的结果捕获为表，提供查询时间性能改进，但增加了存储开销。增量方法在此基础上进一步允许捕获底层数据的后续更新到目标表中。

当前的 [插件](https://github.com/silentsokolov/dbt-clickhouse) 支持 **视图**，**表**，**短暂** 和 **增量** 物化。该插件还支持 dbt [快照](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) 和 [种子](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)，我们将在本指南中探讨这些功能。

在接下来的指南中，我们假设您有一个可用的 ClickHouse 实例。

## dbt 和 ClickHouse 插件的设置 {#setup-of-dbt-and-the-clickhouse-plugin}

### dbt {#dbt}

我们假设在接下来的示例中使用 dbt CLI。用户也可以考虑 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview)，它提供一个基于 Web 的集成开发环境（IDE），允许用户编辑和运行项目。

dbt 提供多种 CLI 安装选项。请按照 [此处](https://docs.getdbt.com/dbt-cli/install/overview) 描述的说明操作。此时仅安装 dbt-core。我们推荐使用 `pip`。

```bash
pip install dbt-core
```

**重要提示：以下内容在 python 3.9 下进行测试。**

### ClickHouse 插件 {#clickhouse-plugin}

安装 dbt ClickHouse 插件：

```bash
pip install dbt-clickhouse
```

### 准备 ClickHouse {#prepare-clickhouse}

dbt 在建模高度关系数据时表现优异。出于示例的目的，我们提供一个小的 IMDB 数据集，其关系模式如下。此数据集来自 [关系数据集存储库](https://relational.fit.cvut.cz/dataset/IMDb)。与 dbt 使用的常见模式相比，这是微不足道的，但代表了一个可管理的样本：

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
表 `roles` 的列 `created_at` 默认值为 `now()`。我们稍后使用此值来识别对我们的模型的增量更新 - 参见 [增量模型](#creating-an-incremental-materialization)。
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

这些命令的执行时间可能会因带宽不同而有所不同，但每个命令应仅需几秒钟即可完成。执行以下查询以计算每位演员的摘要，按电影出现次数降序排列，并确认数据已成功加载：

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

在后面的指南中，我们将把此查询转换为一个模型 - 在 ClickHouse 中将其物化为一个 dbt 视图和表。

## 连接到 ClickHouse {#connecting-to-clickhouse}

1. 创建一个 dbt 项目。在这种情况下，我们以我们的 `imdb` 源命名。当被提示时，选择 `clickhouse` 作为数据库源。

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

3. 此时，您将需要您选择的文本编辑器。在下面的示例中，我们使用流行的 VS Code。打开 IMDB 目录，您应该看到一组 yml 和 sql 文件：

    <Image img={dbt_02} size="lg" alt="新 dbt 项目" />

4. 更新您的 `dbt_project.yml` 文件，以指定我们的第一个模型 - `actor_summary` 并将配置文件设置为 `clickhouse_imdb`。

    <Image img={dbt_03} size="lg" alt="dbt 配置文件" />

    <Image img={dbt_04} size="lg" alt="dbt 配置文件" />

5. 接下来，我们需要提供 dbt 连接到我们的 ClickHouse 实例的连接详细信息。将以下内容添加到您的 `~/.dbt/profiles.yml` 中。

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

    请注意需要修改用户和密码。还有其他可用设置在 [此处](https://github.com/silentsokolov/dbt-clickhouse#example-profile) 有文档说明。

6. 在 IMDB 目录中，执行 `dbt debug` 命令，以确认 dbt 能否连接到 ClickHouse。

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

    确认响应包含 `Connection test: [OK connection ok]`，表明连接成功。

## 创建简单的视图物化 {#creating-a-simple-view-materialization}

使用视图物化时，每次运行时，模型都会通过 ClickHouse 中的 `CREATE VIEW AS` 语句作为视图重建。这不需要额外的数据存储，但查询的速度会比表物化慢。

1. 从 `imdb` 文件夹中，删除目录 `models/example`：

```bash
clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
```

2. 在 `models` 文件夹中的 `actors` 中创建一个新文件。这里我们创建的文件每个代表一个演员模型：

```bash
clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
```

3. 在 `models/actors` 文件夹中创建文件 `schema.yml` 和 `actor_summary.sql`。

```bash
clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
```
    文件 `schema.yml` 定义了我们的表。这些随后将在宏中可用。 编辑 `models/actors/schema.yml` 使其包含以下内容：
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
    文件 `actors_summary.sql` 定义了我们的实际模型。请注意，在配置函数中，我们还请求将模型在 ClickHouse 中物化为视图。我们的表通过函数 `source` 从 `schema.yml` 文件中引用，例如 `source('imdb', 'movies')` 指的是 `imdb` 数据库中的 `movies` 表。 编辑 `models/actors/actors_summary.sql` 使其包含以下内容：
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

4. 从 `imdb` 目录中执行命令 `dbt run`。

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

5. dbt 将按请求在 ClickHouse 中将模型表示为视图。现在我们可以直接查询此视图。该视图将被创建在 `imdb_dbt` 数据库中 - 这由 `~/.dbt/profiles.yml` 文件中 `clickhouse_imdb` 配置文件下的 schema 参数决定。

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

    查询此视图，我们可以通过更简单的语法重现早期查询的结果：

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

在前面的示例中，我们的模型作为视图物化。虽然这可能为某些查询提供足够的性能，但更复杂的 SELECT 或频繁执行的查询可能更适合物化为表。此物化对于将被 BI 工具查询的模型非常有用，以确保用户获得更快的体验。这实际上导致查询结果储存为新表，带来了相关的存储开销 - 有效地执行 `INSERT TO SELECT`。请注意，此表将每次重建，即它不是增量的。因此，大结果集可能导致长时间的执行时间 - 参见 [dbt 限制](#limitations)。

1. 修改文件 `actors_summary.sql`，以使 `materialized` 参数设置为 `table`。注意 `ORDER BY` 定义的方式，以及我们使用 `MergeTree` 表引擎的方式：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
```

2. 从 `imdb` 目录中执行命令 `dbt run`。此执行可能需要更长的时间 - 在大多数机器上大约 10 秒。

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

3. 确认表 `imdb_dbt.actor_summary` 的创建：

```sql
SHOW CREATE TABLE imdb_dbt.actor_summary;
```

    您应该能看到具有适当数据类型的表：
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

4. 确认该表的结果与之前的响应一致。请注意，由于模型现为表，响应时间明显提高：

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

    随意对该模型发出其他查询。例如，哪些演员拥有出现超过 5 次的最高排名电影？

```sql
SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
```


## 创建增量物化 {#creating-an-incremental-materialization}

前面的示例创建了一个表来物化模型。此表将在每次 dbt 执行时被重建。对于较大的结果集或复杂转换，这可能不可行且极其昂贵。为了解决这个挑战并减少构建时间，dbt 提供增量物化。这允许 dbt 在上次执行以来将记录插入或更新到表中，使其适合于事件类型的数据。在内部，一个临时表被创建，包含所有更新的记录，然后所有未更改的记录以及更新的记录被插入到新的目标表中。这对大型结果集造成类似的 [限制](#limitations)，与表模型的限制相同。

为了克服大型集的数据限制，插件支持“仅插入”模式，其中所有更新都被插入到目标表中，而不创建临时表（更多信息在下面）。

为了说明这个例子，我们将添加演员 "Clicky McClickHouse"，他将出现在惊人的 910 部电影中 - 确保他比 [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc) 出现的电影还要多。

1. 首先，我们将修改我们的模型使其为增量类型。此添加需要：

    1. **unique_key** - 为确保插件可以唯一标识行，我们必须提供一个 unique_key - 在这种情况下，查询中的 `id` 字段将足够。这确保我们在物化表中没有行重复。有关唯一性约束的更多详细信息，请参见 [此处](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional)。
    2. **增量过滤器** - 我们还需要告诉 dbt 如何在增量运行时识别更改的行。这是通过提供一个增量表达式来实现的。通常，这涉及事件数据的时间戳；因此我们使用 updated_at 时间戳字段。此列在插入行时默认值为 now()，便于识别新角色。此外，我们需要识别添加新演员的替代情况。使用变量 `{{this}}` 表示现有的物化表，这样我们就得到了表达式 `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`。我们将其嵌入在 `{% if is_incremental() %}` 条件下，确保仅在增量运行时使用，而不是在首次构建表时使用。有关增量模型过滤行的详细信息，请参见 [dbt 文档中的讨论](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run)。

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

    请注意，我们的模型将仅响应对 `roles` 和 `actors` 表的更新和添加。为了响应所有表，建议用户将此模型拆分为多个子模型 - 每个模型都有其自己的增量标准。这些模型又可以被引用和连接。有关跨模型引用的更多详细信息，请参阅 [此处](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)。

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

4. 让我们让 "Clicky" 在 910 部随机电影中出演：

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 910 OFFSET 10000;
```

5. 确认他确实现在是出演最多电影的演员，通过查询底层源表并绕过任何 dbt 模型：

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

6. 执行 `dbt run` 并确认我们的模型已更新，与上述结果匹配：

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

我们可以通过查询 ClickHouse 的查询日志来识别为实现上述增量更新而执行的语句。

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

根据执行的期间调整上述查询。我们将结果检查留给用户，但突出插件执行增量更新所使用的一般策略：

1. 插件创建一个临时表 `actor_sumary__dbt_tmp`。更改的行被流式传输到该表中。
2. 创建一个新表 `actor_summary_new`。旧表的行通过流式传输从旧表转移到新表，检查确保行 id 不存在于临时表中。这有效地处理了更新和重复。
3. 临时表的结果被流式传输到新的 `actor_summary` 表中。
4. 最后，通过 `EXCHANGE TABLES` 语句原子性地交换新表与旧版本。旧表和临时表被删除。

这一过程在下面可视化：

<Image img={dbt_05} size="lg" alt="增量更新 dbt" />

该策略在非常大的模型上可能会遇到挑战。有关详细信息，请参见 [限制](#limitations)。

### 附加策略（仅插入模式） {#append-strategy-inserts-only-mode}

为了克服增量模型中的大数据集限制，插件使用 dbt 配置参数 `incremental_strategy`。这可以设置为 `append` 的值。当设置时，更新的行直接插入到目标表（即 `imdb_dbt.actor_summary`）中，并且不创建临时表。
注意：仅附加模式要求您的数据是不可变的，或者可以接受重复。如果您想要支持修改行的增量表模型，请不要使用此模式！

为说明此模式，我们将添加另一个新演员，并使用 `incremental_strategy='append'` 重新执行 dbt run。

1. 在 actor_summary.sql 中配置仅附加模式：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
```

2. 让我们再添加一位著名演员 - 丹尼·德维托

```sql
INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
```

3. 让我们让丹尼在 920 部随机电影中出演。

```sql
INSERT INTO imdb.roles
SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
FROM imdb.movies
LIMIT 920 OFFSET 10000;
```

4. 执行 dbt run，并确认丹尼已被添加到 actor-summary 表中。

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

请注意相较于插入 "Clicky" 的增量更新速度有多快。

再次检查 query_log 表可以揭示两次增量运行之间的差异：

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

在此运行中，仅添加了新行到 `imdb_dbt.actor_summary` 表中，并且没有涉及表的创建。

### 删除+插入模式（实验性） {#deleteinsert-mode-experimental}

历史上，ClickHouse 对更新和删除的支持有限，形式为异步 [Mutations](/sql-reference/statements/alter/index.md)。这些操作可能极其 IO 密集，并且通常应避免。

ClickHouse 22.8 引入了 [轻量级删除](/sql-reference/statements/delete.md)。这些目前是实验性的，但提供了一种更高效的删除数据的方法。

该模式可以通过 `incremental_strategy` 参数为模型进行配置，即：

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

此策略直接作用于目标模型的表，因此，如果操作期间出现问题，增量模型中的数据可能处于无效状态 - 不提供原子性更新。

综上所述，此方法：

1. 插件创建一个临时表 `actor_sumary__dbt_tmp`。更改的行被流式传输到该表中。
2. 对当前的 `actor_summary` 表发出 `DELETE`。通过从 `actor_sumary__dbt_tmp` 根据 id 删除行来完成。
3. 使用 `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp` 将 `actor_sumary__dbt_tmp` 中的行插入到 `actor_summary`。

这一过程如下所示：

<Image img={dbt_06} size="lg" alt="轻量级删除增量" />

### 覆盖插入模式（实验性） {#insert_overwrite-mode-experimental}

执行以下步骤：

1. 创建一个与增量模型关系具有相同结构的暂存（临时）表：`CREATE TABLE {staging} AS {target}`。
2. 仅将新记录（通过 SELECT 生成）插入暂存表。
3. 将暂存表中存在的新分区仅替换到目标表中。

<br />

此方法具有以下优点：

* 比默认策略更快，因为它不复制整个表。
* 比其他策略更安全，因为它不会在 INSERT 操作成功完成之前修改原始表：在中间失败的情况下，原始表不会被修改。
* 它实现了数据工程最佳实践中的“分区不可变性”。这简化了增量和并行数据处理、回滚等。

<Image img={dbt_07} size="lg" alt="插入覆盖增量" />

## 创建快照 {#creating-a-snapshot}

dbt 快照允许记录对可变模型随着时间变化的记录。这反过来允许对模型进行按时间点查询，分析师可以“回顾过去”的模型之前状态。这是通过使用 [类型 2 的缓慢变化维度](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) 实现的，其中 from 和 to 日期列记录行何时有效。ClickHouse 插件支持此功能，下面展示了如何使用。

此示例假设您已经完成了 [创建增量表模型](#creating-an-incremental-materialization)。确保您的 actor_summary.sql 没有设置 inserts_only=True。您的 models/actor_summary.sql 应如下所示：

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

1. 在快照目录中创建文件 `actor_summary`。

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

关于此内容的一些观察：
* SELECT 查询定义了您希望随着时间快照记录的结果。函数 ref 用于引用我们之前创建的 actor_summary 模型。
* 我们需要一个时间戳列来指示记录变化。我们的 updated_at 列（见 [创建增量表模型](#creating-an-incremental-materialization)）可以在这里使用。参数 strategy 指示我们使用时间戳来标记更新，参数 updated_at 指定要使用的列。如果该列在您的模型中不存在，您还可以选择使用 [检查策略](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)。这显著效果不佳，且要求用户指定一列进行比较。 dbt 比较这些列的当前值和历史值，记录任何变化（如果相同，则不执行任何操作）。

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

请注意，已在快照数据库中创建了表 actor_summary_snapshot（由 target_schema 参数决定）。

4. 取样这些数据，您会看到 dbt 包含了列 dbt_valid_from 和 dbt_valid_to。后者的值被设置为 null。后续运行将会更新此值。

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

5. 让我们最喜欢的演员 Clicky McClickHouse 再在 10 部电影中出现。

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

7. 如果我们现在查询我们的快照，请注意我们有两行 Clicky McClickHouse。我们之前的条目现在有一个 dbt_valid_to 值。我们的新值在 dbt_valid_from 列中记录相同的值，并且 dbt_valid_to 值为 null。如果我们确实有新行，这些也将附加到快照中。

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

有关 dbt 快照的更多详细信息，请参见 [此处](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots)。

## 使用种子 {#using-seeds}

dbt 提供了从 CSV 文件加载数据的能力。该功能不适用于加载大型数据库导出，而是更设计用于代码表和 [字典](../../../../sql-reference/dictionaries/index.md)，例如，将国家代码映射到国家名称的小文件。作为一个简单的示例，我们生成并上传一个使用种子功能的流派代码列表。

1. 我们从现有数据集中生成流派代码列表。在 dbt 目录中，使用 `clickhouse-client` 创建文件 `seeds/genre_codes.csv`：

```bash
clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
"SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
```

2. 执行 `dbt seed` 命令。这将在我们的数据库 `imdb_dbt` 中创建一个新表 `genre_codes`（由我们的模式配置定义），并从 CSV 文件加载行。

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

当前 ClickHouse 插件对 dbt 存在几个限制，用户应注意：

1. 插件当前将模型物化为表，使用 `INSERT TO SELECT`。这有效意味着数据重复。非常大的数据集（PB）可能会导致极长的运行时间，使某些模型无法使用。旨在尽量减少任何查询返回的行数，尽量利用 GROUP BY。更喜欢汇总数据的模型，而不是仅执行转换的模型，同时保持源行计数。
2. 要使用分布式表表示模型，用户必须手动在每个节点上创建底层的复制表。分布式表可以基于这些表创建。插件不管理集群创建。
3. 当 dbt 在数据库中创建关系（表/视图）时，通常会按下述方式创建：`{{ database }}.{{ schema }}.{{ table/view id }}`。ClickHouse 没有模式的概念。因此，插件使用 `{{schema}}.{{ table/view id }}`，其中 `schema` 是 ClickHouse 数据库。

进一步的信息

上述指南仅触及 dbt 功能的表面。建议用户阅读优秀的 [dbt 文档](https://docs.getdbt.com/docs/introduction)。

插件的其他配置在 [此处](https://github.com/silentsokolov/dbt-clickhouse#model-configuration) 描述。

## Fivetran {#fivetran}

`dbt-clickhouse` 连接器也可以在 [Fivetran 转换](https://fivetran.com/docs/transformations/dbt) 中使用，允许在 Fivetran 平台内直接实现无缝集成和转换能力。

## 相关内容 {#related-content}

- 博客 & 网络研讨会: [ClickHouse 和 dbt - 社区的奉献](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
