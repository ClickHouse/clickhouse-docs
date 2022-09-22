---
sidebar_position: 10
sidebar_label: Self-managed ClickHouse to Clickhouse Cloud
---

# Migrating from Self-managed ClickHouse to Clickhouse Cloud

[`remoteSecure`](../../sql-reference/table-functions/remote.md) is a function that can be used in `SELECT` and `INSERT` queries and allows accessing remote servers without creating a [Distributed](../../engines/table-engines/special/distributed.md) table.  This provides a simple method for migrating tables to ClickHouse Cloud.

## Migration of tables from one system to another:
This example migrates one table from a self-managed ClickHouse server to ClickHouse Cloud.

### On the source ClickHouse system (the system that currently hosts the data)

- Add a read only user that can read the source table (`db.table` in this example)
  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

- Copy the table definition
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

### On the destination ClickHouse Cloud system:

- Create the destination database:
  ```sql
  CREATE DATABASE db
  ```

- Using the CREATE TABLE statement from the source, create the destination.

  :::tip
  Change the ENGINE to to ReplicatedMergeTree without any parameters when you run the CREATE statement.  ClickHouse Cloud always replicates tables and provides the correct parameters.
  :::

  ```sql
  CREATE TABLE db.table ...
  ```

- Use the `remoteSecure` function to pull the data from the self-managed source

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

  :::note
  If the source system is not available from outside networks then you can push the data rather than pulling it, as the `remoteSecure` function works for both selects and inserts.  See the next option.
  :::

- Use the `remoteSecure` function to push the data to the ClickHouse Cloud service

  ```sql
  INSERT INTO FUNCTION
  remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
  'default', 'PASS', rand()) SELECT * FROM db.table
  ```

  :::note
  The final parameter to the `remoteSecure` function call above is the sharding key, `rand()` will distribute the inserts across the shards.
  :::
