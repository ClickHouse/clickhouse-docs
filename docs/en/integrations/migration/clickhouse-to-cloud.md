---
sidebar_position: 10
sidebar_label: ClickHouse to Clickhouse Cloud
slug: /en/integrations/migration/clickhouse-to-cloud
---
import AddARemoteSystem from '@site/docs/en/_snippets/_add_remote_ip_access_list_detail.md';

# Migrating between ClickHouse and Clickhouse Cloud

[`remoteSecure`](../../sql-reference/table-functions/remote.md) is a function that can be used in `SELECT` and `INSERT` queries and allows accessing remote ClickHouse servers.  This makes migrating tables as simple as writing an `INSERT INTO` query with an embedded `SELECT`.  This guide will show how to migrate from a self-managed ClickHouse server to ClickHouse Cloud, and how to migrate between ClickHouse Cloud services.

## Migrating from Self-managed ClickHouse to Clickhouse Cloud


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

  :::tip Add the remote system to your ClickHouse Cloud service IP Access List
  In oreder for the `remoteSecure` function to connect to your ClickHouse Cloud service the IP Address of the remote system will need to be allowed by the IP Access List.  Expand **Manage your IP Access List** below this tip for more information.
  :::

  <AddARemoteSystem />

  ```sql
  INSERT INTO FUNCTION
  remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table',
  'default', 'PASS', rand()) SELECT * FROM db.table
  ```

  :::note
  The final parameter to the `remoteSecure` function call above is the sharding key, `rand()` will distribute the inserts across the shards.
  :::

## Migrating between ClickHouse Cloud services

### Migrate data from the **new restored service** back to the **original service**

Suppose you cannot work with the newly restored service for any reason; for example, if you have users or applications that connect to the existing service, you may decide to migrate the newly restored data into the original service.  The migration can be accomplished by following these steps:

#### Allow remote access to the newly restored service

The new service is restored from backup with the same IP Allow List as the original service, this means that connections will not be allowed from other ClickHouse Cloud services unless you had allowed access from everywhere.  Modify the allow list and allow access from **Anywhere** temporarily.  See the [IP Access List](/docs/en/manage/security/ip-access-list.md) docs for details.

#### On the newly restored ClickHouse service (the system that hosts the restored data)

:::note
You will need to reset the password for the new service in order to access it, you can do that from the service list.
:::

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

#### On the destination ClickHouse Cloud system (the one that had the damaged table):

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
  # highlight-next-line
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
  ```

- Use the `remoteSecure` function to pull the data from the newly restored ClickHouse Cloud service

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- Verify the data in the service
- Switch the service IP Access List to limit access


