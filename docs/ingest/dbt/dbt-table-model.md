---
sidebar_label: Table Materializations
sidebar_position: 5
slug: /en/integrations/dbt/dbt-table-model
description: Table materializations with dbt and ClickHouse
---

## Creating a Table Materialization

In the previous example, our model was materialized as a view. While this might offer sufficient performance for some queries, more complex SELECTs or frequently executed queries may be better materialized as a table.  This materialization is useful for models that will be queried by BI tools to ensure users have a faster experience. This effectively causes the query results to be stored as a new table, with the associated storage overheads - effectively, an `INSERT TO SELECT` is executed. Note that this table will be reconstructed each time i.e., it is not incremental. Large result sets may therefore result in long execution times - see [dbt Limitations](./dbt-limitations).

1. Modify the file `actors_summary.sql` such that the `materialized` parameter is set to `table`. Notice how `ORDER BY` is defined, and notice we use the `MergeTree` table engine:

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. From the `imdb` directory execute the command `dbt run`. This execution may take a little longer to execute - around 10s on most machines.

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

3. Confirm the creation of the table `imdb_dbt.actor_summary`:

    ```sql
    SHOW CREATE TABLE imdb_dbt.actor_summary;
    ```

    You should the table with the appropriate data types:
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

4. Confirm the results from this table are consistent with previous responses. Notice an appreciable improvement in the response time now that the model is a table:

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

    Feel free to issue other queries against this model. For example, which actors have the highest ranking movies with more than 5 appearances?

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```
