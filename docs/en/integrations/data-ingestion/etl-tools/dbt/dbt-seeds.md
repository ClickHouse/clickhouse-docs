---
sidebar_label: Seeds
sidebar_position: 8
slug: /en/integrations/dbt/dbt-seeds
description: Using seeds with the dbt ClickHouse plugin
---

# Using Seeds

dbt provides the ability to load data from CSV files. This capability is not suited to loading large exports of a database and is more designed for small files typically used for code tables and [dictionaries](https://clickhouse.com/docs/en/sql-reference/dictionaries/), e.g. mapping country codes to country names. For a simple example, we generate and then upload a list of genre codes using the seed functionality.

1. We generate a list of genre codes from our existing dataset. From the dbt directory, use the `clickhouse-client` to create a file `seeds/genre_codes.csv`:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. Execute the `dbt seed` command. This will create a new table `genre_codes` in our database `imdb_dbt` (as defined by our schema configuration) with the rows from our csv file.

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
3. Confirm these have been loaded:

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
