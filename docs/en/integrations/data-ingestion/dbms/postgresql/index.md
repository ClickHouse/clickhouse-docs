---
sidebar_label: PostgreSQL
sidebar_position: 10
slug: /en/integrations/postgresql
keywords: [clickhouse, postgres, postgresql, connect, integrate, table, engine]
---

# Connecting ClickHouse to PostgreSQL

This page covers two options for integrating PostgreSQL with ClickHouse:

- using the `PostgreSQL` table engine, for reading from a PostgreSQL table
- using the `MaterializedPostgreSQL` database engine, for syncing a database in PostgreSQL with a database in ClickHouse

## Using the PostgreSQL Table Engine

The `PostgreSQL` table engine allows **SELECT** and **INSERT** operations on data stored on the remote PostgreSQL server from ClickHouse.
This article is to illustrate basic methods of integration using one table.

### 1. Setting up PostgreSQL
1.  In `postgresql.conf`, add the following entry to enable PostgreSQL to listen on the network interfaces:
  ```
  listen_addresses = '*'
  ```

2. Create a user to connect from ClickHouse. For demonstration purposes, this example grants full superuser rights.
  ```sql
  CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
  ```

3. Create a new database in PostgreSQL:
  ```sql
  CREATE DATABASE db_in_psg;
  ```

4. Create a new table:
  ```sql
  CREATE TABLE table1 (
      id         integer primary key,
      column1    varchar(10)
  );
  ```

5. Let's add a few rows for testing:
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def');
  ```

6. To configure PostgreSQL to allow connections to the new database with the new user for replication, add the following entry to the `pg_hba.conf` file. Update the address line with either the subnet or IP address of your PostgreSQL server:
  ```
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
  ```

7. Reload the `pg_hba.conf` configuration (adjust this command depending on your version):
  ```
  /usr/pgsql-12/bin/pg_ctl reload
  ```

8. Verify the new `clickhouse_user` can login:
  ```
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
  ```

:::note
If you are using this feaure in ClickHouse Cloud, you may need the to allow the ClickHouse Cloud IP addresses to access your PostgreSQL instance.
Check the ClickHouse [Cloud Endpoints API](/docs/en/cloud/security/cloud-endpoints-api.md) for egress traffic details.
:::

### 2. Define a Table in ClickHouse
1. Login to the `clickhouse-client`:
  ```
  clickhouse-client --user default --password ClickHouse123!
  ```

2. Let's create a new database:
  ```sql
  CREATE DATABASE db_in_ch;
  ```

3. Create a table that uses the `PostgreSQL`:
  ```sql
  CREATE TABLE db_in_ch.table1
  (
      id UInt64,
      column1 String
  )
  ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
  ```

  The minimum parameters needed are:

  |parameter|Description                 |example              |
  |---------|----------------------------|---------------------|
  |host:port|hostname or IP and port     |postgres-host.domain.com:5432|
  |database |PostgreSQL database name         |db_in_psg                  |
  |user     |username to connect to postgres|clickhouse_user     |
  |password |password to connect to postgres|ClickHouse_123       |

  :::note
  View the [PostgreSQL table engine](../../../../engines/table-engines/integrations/postgresql.md) doc page for a complete list of parameters.
  :::


### 3 Test the Integration

1. In ClickHouse, view initial rows:
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  The ClickHouse table should automatically be populated with the two rows that already existed in the table in PostgreSQL:
  ```response
  Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  └────┴─────────┘
  ```

2. Back in PostgreSQL, add a couple of rows to the table:
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (3, 'ghi'),
    (4, 'jkl');
  ```

4. Those two new rows should appear in your ClickHouse table:
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  The response should be:
  ```response
  Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘
  ```

5. Let's see what happens when you add rows to the ClickHouse table:
  ```sql
  INSERT INTO db_in_ch.table1
    (id, column1)
  VALUES
    (5, 'mno'),
    (6, 'pqr');
  ```

6. The rows added in ClickHouse should appear in the table in PostgreSQL:
  ```sql
  db_in_psg=# SELECT * FROM table1;
  id | column1
  ----+---------
    1 | abc
    2 | def
    3 | ghi
    4 | jkl
    5 | mno
    6 | pqr
  (6 rows)
  ```

This example demonstrated the basic integration between PostgreSQL and ClickHouse using the `PostrgeSQL` table engine.
Check out the [doc page for the PostgreSQL table engine](/docs/en/engines/table-engines/integrations/postgresql.md) for more features, such as specifying schemas, returning only a subset of columns, and connecting to multiple replicas. Also check out the [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres) blog.

## Using the MaterializedPostgreSQL database engine

The PostgreSQL database engine uses the PostgreSQL replication features to create a replica of the database with all or a subset of schemas and tables.
This article is to illustrate basic methods of integration using one database, one schema and one table.

***In the following procedures, the PostgreSQL CLI (psql) and the ClickHouse CLI (clickhouse-client) are used. The PostgreSQL server is installed on linux. The following has minimum settings if the postgresql database is new test install***

### 1. In PostgreSQL
1.  In `postgresql.conf`, set minimum listen levels, replication wal level and replication slots:

add the following entries:
```
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouse needs minimum of `logical` wal level and minimum `2` replication slots_

2. Using an admin account, create a user to connect from ClickHouse:
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```
_*for demonstration purposes, full superuser rights have been granted._


3. create a new database:
```sql
CREATE DATABASE db1;
```

4. connect to the new database in `psql`:
```
\connect db1
```

5. create a new table:
```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

6. add initial rows:
```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. Configure the PostgreSQLto allow connections to the new database with the new user for replication:
below is the minimum entry to add to the `pg_hba.conf` file:
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*for demonstration purposes, this is using clear text password authentication method. update the address line with either the subnet or the address of the server per PostgreSQL documentation_

8. reload the `pg_hba.conf` configuration with something like this (adjust for your version):
```
/usr/pgsql-12/bin/pg_ctl reload
```

9. Test the login with new `clickhouse_user`:
```
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. In ClickHouse
1. log into the ClickHouse CLI
```
clickhouse-client --user default --password ClickHouse123!
```

2. Enable the PosgreSQL experimental feature for the database engine:
```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. Create the new database to be replicated and define the intitial table:
```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```
minimum options:

|parameter|Description                 |example              |
|---------|----------------------------|---------------------|
|host:port|hostname or IP and port     |postgres-host.domain.com:5432|
|database |PostgreSQL database name         |db1                  |
|user     |username to connect to postgres|clickhouse_user     |
|password |password to connect to postgres|ClickHouse_123       |
|settings |additional settings for the engine| materialized_postgresql_tables_list = 'table1'|

:::info
For complete guide to the PostgreSQL database engine, refer to https://clickhouse.com/docs/en/engines/database-engines/materialized-postgresql/#settings
:::

4. Verify the initial table has data:

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: df2381ac-4e30-4535-b22e-8be3894aaafc

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 3. Test basic replication
1. In PostgreSQL, add new rows:
```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. In ClickHouse, verify the new rows are visible:
```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: b0729816-3917-44d3-8d1a-fed912fb59ce

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  4 │ jkl     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 4. Summary
This integration guide focused on a simple example on how to replicate a database with a table, however, there exist more advanced options which include replicating the whole database or adding new tables and schemas to the existing replications. Although DDL commands are not supported for this replication, the engine can be set to detect changes and reload the tables when there are structural changes made.

:::info
For more features available for advanced options, please see the reference documentation: <https://clickhouse.com/docs/en/engines/database-engines/materialized-postgresql/>
:::


## Related content
- Blog: [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Blog: [ClickHouse and PostgreSQL - a Match Made in Data Heaven - part 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
