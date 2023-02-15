---
sidebar_label: Incremental Materializations
sidebar_position: 6
slug: /en/integrations/dbt/dbt-incremental-model
description: Table materializations with dbt and ClickHouse
---

# Creating an Incremental Materialization

The previous example created a table to materialize the model. This table will be reconstructed for each dbt execution. This may be infeasible and extremely costly for larger result sets or complex transformations. To address this challenge and reduce the build time, dbt offers Incremental materializations. This allows dbt to insert or update records into a table since the last execution, making it appropriate for event-style data. Under the hood a temporary table is created with all the updated records and then all the untouched records as well as the updated records are inserted into a new target table. This results in similar [limitations](./dbt-limitations) for large result sets as for the table model.

To overcome these limitations for large sets, the plugin supports ‘inserts_only‘ mode, where all the updates are inserted into the target table without creating a temporary table (more about it below).

To illustrate this example, we will add the actor "Clicky McClickHouse", who will appear in an incredible 910 movies - ensuring he has appeared in more films than even [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc).

1. First, we modify our model to be of type incremental. This addition requires:

    1. **unique_key** - To ensure the plugin can uniquely identify rows, we must provide a unique_key - in this case, the `id` field from our query will suffice. This ensures we will have no row duplicates in our materialized table. For more details on uniqueness constraints, see[ here](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional).
    2. **Incremental filter** - We also need to tell dbt how it should identify which rows have changed on an incremental run. This is achieved by providing a delta expression. Typically this involves a timestamp for event data; hence our updated_at timestamp field. This column, which defaults to the value of now() when rows are inserted, allows new roles to be identified. Additionally, we need to identify the alternative case where new actors are added. Using the {{this}} variable, to denote the existing materialized table, this gives us the expression `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`. We embed this inside the `{% if is_incremental() %}` condition, ensuring it is only used on incremental runs and not when the table is first constructed. For more details on filtering rows for incremental models, see [this discussion in the dbt docs](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run).

    Update the file `actor_summary.sql` as follows:

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

    Note that our model will only respond to updates and additions to the `roles` and `actors` tables. To respond to all tables, users would be encouraged to split this model into multiple sub-models - each with their own incremental criteria. These models can in turn be referenced and connected. For further details on cross-referencing models see [here](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).

2. Execute a `dbt run` and confirm the results of the resulting table:

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

3. We will now add data to our model to illustrate an incremental update. Add our actor  "Clicky McClickHouse" to the `actors` table:

    ```sql
    INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
    ```

4. Let's have Clicky star in 910 random movies:

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
    FROM imdb.movies
    LIMIT 910 OFFSET 10000;
    ```

5. Confirm he is indeed now the actor with the most appearances by querying the underlying source table and bypassing any dbt models:

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

6. Execute a `dbt run` and confirm our model has been updated and matches the above results:

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
## Internals

We can identify the statements executed to achieve the above incremental update by querying ClickHouse’s query log.

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

Adjust the above query to the period of execution. We leave result inspection to the user but highlight the general strategy used by the plugin to perform incremental updates:


1. The plugin creates a temporary table `actor_sumary__dbt_tmp`. Rows that have changed are streamed into this table.
2. A new table, `actor_summary_new,` is created. The rows from the old table are, in turn, streamed from the old to new, with a check to make sure row ids do not exist in the temporary table. This effectively handles updates and duplicates.
3. The results from the temporary table are streamed into the new `actor_summary` table:
4. Finally, the new table is exchanged atomically with the old version via an `EXCHANGE TABLES` statement. The old and temporary tables are in turn dropped.

This is visualized below:

<img src={require('./images/dbt_05.png').default} class="image" alt="incremental updates dbt" style={{width: '100%'}}/>

This strategy may encounter challenges on very large models. For further details see [Limitations](./dbt-limitations).

## Append Strategy (inserts-only mode)

To overcome the limitations of large datasets in incremental models, the plugin uses the dbt configuration parameter `incremental_strategy`. This can be set to the value `append`. When set, updated rows are inserted directly into the target table (a.k.a `imdb_dbt.actor_summary`) and no temporary table is created.
Note: Append only mode requires your data to be immutable or for duplicates to be acceptable. If you want an incremental table model that supports altered rows don’t use this mode!

To illustrate this mode, we will add another new actor and re-execute dbt run with `incremental_strategy='append'`.

1. Configure append only mode in actor_summary.sql:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```
   
2. Let’s add another famous actor - Danny DeBito

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. Let's star Danny in 920 random movies.

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 920 OFFSET 10000;
   ```

4. Execute a dbt run and confirm that Danny was added to the actor-summary table

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

Note how much faster that incremental was compared to the insertion of Clicky.

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

In this run, only the new rows are added straight to imdb_dbt.actor_summary table and there is no table creation involved.

## Delete+Insert mode (Experimental)

Historically ClickHouse has had only limited support for updates and deletes, in the form of asynchronous [Mutations](https://clickhouse.com/docs/en/sql-reference/statements/alter/).  These can be extremely IO-intensive and should generally [be avoided](https://clickhouse.com/docs/en/sql-reference/statements/alter/).

ClickHouse 22.8 introduced [Lightweight deletes](https://clickhouse.com/docs/en/sql-reference/statements/delete/). These are currently experimental but offer a more performant means of deleting data.


This mode can be configured for a model via the `incremental_strategy` parameter i.e.

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

This strategy operates directly on the target model's table, so if there is an issue during the operation, the data in the incremental model is likely to be in an invalid state -  there is no atomic update.

In summary, this approach:

1. The plugin creates a temporary table `actor_sumary__dbt_tmp`. Rows that have changed are streamed into this table.
2. A `DELETE` is issued against the current `actor_summary` table. Rows are deleted by id from `actor_sumary__dbt_tmp`
3. The rows from `actor_sumary__dbt_tmp` are inserted into `actor_summary` using an `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`.

This process is shown below:

<img src={require('./images/dbt_06.png').default} class="image" alt="lightweight delete incremental" style={{width: '100%'}}/>
