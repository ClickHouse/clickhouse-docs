---
sidebar_label: Snapshots
sidebar_position: 7
slug: /en/integrations/dbt/dbt-snapshot
description: Snapshot tables with dbt and ClickHouse
---

# Creating a Snapshot

dbt snapshots allow a record to be made of changes to a mutable model over time. This in turn allows point-in-time queries on models, where analysts can “look back in time” at the previous state of a model. This is achieved using [type-2 Slowly Changing Dimensions](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) where from and to date columns record when a row was valid. This functionality is supported by the ClickHouse plugin and is demonstrated below.

This example assumes you have completed [Creating an Incremental Table Model](./dbt-incremental-model). Make sure your actor_summary.sql doesn't set inserts_only=True. Your models/actor_summary.sql should look like this:

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

1. Create a file `actor_summary` in the snapshots directory.

    ```bash
     touch snapshots/actor_summary.sql
    ```

2. Update the contents of the actor_summary.sql file with the following content:
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

A few observations regarding this content:
* The select query defines the results you wish to snapshot over time. The function ref is used to reference our previously created actor_summary model.
* We require a timestamp column to indicate record changes. Our updated_at column (see [Creating an Incremental Table Model](./dbt-incremental-model)) can be used here. The parameter strategy indicates our use of a timestamp to denote updates, with the parameter updated_at specifying the column to use. If this is not present in your model you can alternatively use the [check strategy](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy). This is significantly more inefficient and requires the user to specify a list of columns to compare.  dbt compares the current and historical values of these columns, recording any changes (or doing nothing if identical).

3. Run the command `dbt snapshot`.

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

Note how a table actor_summary_snapshot has been created in the snapshots db (determined by the target_schema parameter).

4. Sampling this data you will see how dbt has included the columns dbt_valid_from and dbt_valid_to. The latter has values set to null. Subsequent runs will update this.

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

5. Make our favorite actor Clicky McClickHouse appear in another 10 films.

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. Re-run the dbt run command from the imdb directory. This will update the incremental model. Once this is complete, run the dbt snapshot to capture the changes.

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

7. If we now query our snapshot, notice we have 2 rows for Clicky McClickHouse. Our previous entry now has a dbt_valid_to value. Our new value is recorded with the same value in the dbt_valid_from column, and a dbt_valid_to value of null. If we did have new rows, these would also be appended to the snapshot.

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
   
For further details on dbt snapshots see [here](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots).
