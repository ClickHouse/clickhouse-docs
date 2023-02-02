---
sidebar_label: Setup
sidebar_position: 2
slug: /en/integrations/dbt/dbt-setup
description: Setup of dbt and the ClickHouse plugin
---

# Installation

## dbt

We assume the use of the dbt CLI for the following examples. Users may also wish to consider[ dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview), which offers a web-based Integrated Development Environment (IDE) allowing users to edit and run projects.

dbt offers a number of options for CLI installation. Follow the instructions described[ here](https://docs.getdbt.com/dbt-cli/install/overview). At this stage install dbt-core only. We recommend the use of `pip`.

```bash
pip install dbt-core
```

**Important: The following is tested under python 3.9.**

## ClickHouse plugin

Install the dbt ClickHouse plugin:

```bash
pip install dbt-clickhouse
```

# Prepare ClickHouse

dbt excels when modeling highly relational data. For the purposes of example, we provide a small IMDB dataset with the following relational schema. This dataset originates from the[ relational dataset repository](https://relational.fit.cvut.cz/dataset/IMDb). This is trivial relative to common schemas used with dbt but represents a manageable sample:


<img src={require('./images/dbt_01.png').default} class="image" alt="IMDB table schema" style={{width: '100%'}}/>

We use a subset of these tables as shown.

Create the following tables:


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
    created_at DateTime DEFAULT now(),
    actor_id   UInt32,
    movie_id   UInt32,
    role       String
) ENGINE = MergeTree ORDER BY (actor_id, movie_id);
```

:::note
The column `created_at` for the table `roles`, which defaults to a value of `now()`. We use this later to identify incremental updates to our models - see [Incremental Models](./dbt-incremental-model).
:::

We use the `s3` function to read the source data from public endpoints to insert data. Run the following commands to populate the tables:

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

The execution of these may vary depending on your bandwidth, but each should only take a few seconds to complete. Execute the following query to compute a summary of each actor, ordered by the most movie appearances, and to confirm the data was loaded successfully:

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

The response should look like:

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

In the later guides, we will convert this query into a model - materializing it in ClickHouse as a dbt view and table.
