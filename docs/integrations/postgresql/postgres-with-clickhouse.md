---
sidebar_label: PostgreSQL Table Engine
sidebar_position: 20
keywords: [clickhouse, postgres, postgresql, connect, integrate]
---

# Connecting ClickHouse to PostgreSQL using the PostgreSQL table engine

The PostgreSQL table engine allows `SELECT` and `INSERT` operations on data stored on the remote Postgres server from ClickHouse.
This article is to illustrate basic methods of integration using one table.

***In the following procedures, the Postgres CLI (psql) and the ClickHouse CLI (clickhouse-client) are used. The PostgreSQL server is installed on linux. The following has minimum settings if the postgresql database is new test install***

## 1. In PostgreSQL
1.  In `postgresql.conf`, add the following entry if not set already to enable postgres to listen on the network interfaces:
```
listen_addresses = '*' 
```

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

7. Configure the Postgres to allow connections to the new database with the new user for replication:
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

## 2. In ClickHouse
1. log into the ClickHouse CLI
```
clickhouse-client --user default --password ClickHouse123!
```

2. Create database:
```sql
CREATE DATABASE db1_postgres;
```

3. Create the table with the PostgreSQL table engine:
```sql
CREATE TABLE db1_postgres.table1
(
    id UInt64,
    column1 String
) 
ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db1', 'table1', 'clickhouse_user', 'ClickHouse_123');
```
minimum options:

|parameter|Description                 |example              |
|---------|----------------------------|---------------------|
|host:port|hostname or IP and port     |postgres-host.domain.com:5432|
|database |postgres database name         |db1                  |
|user     |username to connect to postgres|clickhouse_user     |
|password |password to connect to postgres|ClickHouse_123       |

** For complete guide to the PostgreSQL database engine, refer to: **

https://clickhouse.com/docs/en/engines/table-engines/integrations/postgresql/


## 3 Testing the integration

1. In ClickHouse, view initial rows:
```sql
ch_env_2 :) SELECT * FROM db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```

2. In Postgres, add sample rows:
```sql
INSERT INTO table1 
  (id, column1) 
VALUES 
  (3, 'ghi'),
  (4, 'jkl');
```

4. In ClickHouse, view newly added rows:
```sql
ch_env_2 :) SELECT * FROM db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

5. In ClickHouse, add sample rows:
```sql
INSERT INTO db1_postgres.table1
  (id, column1)
VALUES
  (5, 'mno'),
  (6, 'pqr');
```

6. In Postgres, verify new rows:
```sql
db1=# SELECT * FROM table1;
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

## 4 Summary
This integration example demonstrated the basic integration between Postgres and ClickHouse using the PostrgeSQL table engine.
The table engine has more features such as specifying schemas, returning only a subset of columns and connecting to multiple replicas.
