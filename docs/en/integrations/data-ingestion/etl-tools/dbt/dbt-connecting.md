---
sidebar_label: Connecting to ClickHouse
sidebar_position: 3
slug: /en/integrations/dbt/dbt-connecting
description: Connecting dbt to ClickHouse
---

# Connecting ClickHouse

1. Create a dbt project. In this case we name this after our imdb source. When prompted, select `clickhouse` as the database source.

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

2. `cd` into your project folder:

    ```bash
    cd imdb
    ```

3. At this point, you will need the text editor of your choice. In the examples below, we use the popular VSCode. Opening the IMDB directory, you should see a collection of yml and sql files:

    <img src={require('./images/dbt_02.png').default} class="image" alt="New dbt project" style={{width: '100%'}}/>

4. Update your `dbt_project.yml` file to specify our first model - `actor_summary` and set profile to `clickhouse_imdb`.

    <img src={require('./images/dbt_03.png').default} class="image" alt="dbt profile" style={{width: '100%'}}/>

    <img src={require('./images/dbt_04.png').default} class="image" alt="dbt profile" style={{width: '100%'}}/>

5. We next need to provide dbt with the connection details for our ClickHouse instance. Add the following to your `~/.dbt/profiles.yml`.

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

    Note the need to modify the user and password. There are additional available settings documented[ here](https://github.com/silentsokolov/dbt-clickhouse#example-profile).

6. From the IMDB directory, execute the `dbt debug` command to confirm whether dbt is able to connect to ClickHouse.

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

    Confirm the response includes `Connection test: [OK connection ok]` indicating a successful connection.
