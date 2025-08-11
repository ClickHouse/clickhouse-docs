---
sidebar_label: 'Using clickhouse-local'
sidebar_position: 20
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'Migrating to ClickHouse using clickhouse-local'
description: 'Guide showing how to migrate to ClickHouse using clickhouse-local'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';

# Migrating to ClickHouse using clickhouse-local

<Image img={ch_local_01} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

You can use ClickHouse, or to be more specific,[`clickhouse-local`](/operations/utilities/clickhouse-local.md)
as an ETL tool for migrating data from your current database system to ClickHouse Cloud, as long as for your current database system there is either a
ClickHouse-provided [integration engine](/engines/table-engines/#integration-engines)  or [table function](/sql-reference/table-functions/), respectively,
or a vendor provided JDBC driver or ODBC driver available.

We sometimes call this migration method a "pivot" method, because it uses an intermediate pivot point or hop to move the data from the source database to the destination database. For example, this method may be required if only outbound connections are allowed from within a private or internal network due to security requirements, and therefore you need to pull the data from the source database with clickhouse-local, then push the data into a destination ClickHouse database, with clickhouse-local acting as the pivot point.

ClickHouse provides integration engines and table functions (that create integration engines on-the-fly) for [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) and [SQLite](/engines/table-engines/integrations/sqlite).
For all other popular database systems, there is JDBC driver or ODBC driver available from the vendor of the system.

## What is clickhouse-local? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='Migrating Self-managed ClickHouse' background='white' />

Typically, ClickHouse is run in the form of a cluster, where several instances of the ClickHouse database engine are running in a distributed fashion on different servers.

On a single server, the ClickHouse database engine is run as part of the `clickhouse-server` program. Database access (paths, users, security, ...) is configured with a server configuration file.

The `clickhouse-local` tool allows you to use the ClickHouse database engine isolated in a command-line utility fashion for blazing-fast SQL data processing on an ample amount of inputs and outputs, without having to configure and start a ClickHouse server.

## Installing clickhouse-local {#installing-clickhouse-local}

You need a host machine for `clickhouse-local` that has network access to both your current source database system and your ClickHouse Cloud target service.

On that host machine, download the appropriate build of `clickhouse-local` based on your computer's operating system:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. The simplest way to download `clickhouse-local` locally is to run the following command:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. Run `clickhouse-local` (it will just print its version):
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. The simplest way to download `clickhouse-local` locally is to run the following command:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. Run `clickhouse-local` (it will just print its version):
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info Important
The examples throughout this guide use the Linux commands for running `clickhouse-local` (`./clickhouse-local`).
To run `clickhouse-local` on a Mac, use `./clickhouse local`.
:::

:::tip Add the remote system to your ClickHouse Cloud service IP Access List
In order for the `remoteSecure` function to connect to your ClickHouse Cloud service, the IP address of the remote system needs to be allowed by the IP Access List.  Expand **Manage your IP Access List** below this tip for more information.
:::

  <AddARemoteSystem />

## Example 1: Migrating from MySQL to ClickHouse Cloud with an Integration engine {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

We will use the [integration table engine](/engines/table-engines/integrations/mysql/) (created on-the-fly by the [mysql table function](/sql-reference/table-functions/mysql/)) for reading data from the source MySQL database and we will use the [remoteSecure table function](/sql-reference/table-functions/remote/)
for writing the data into a destination table on your ClickHouse cloud service.

<Image img={ch_local_03} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

### On the destination ClickHouse Cloud service: {#on-the-destination-clickhouse-cloud-service}

#### Create the destination database: {#create-the-destination-database}

  ```sql
  CREATE DATABASE db
  ```

#### Create a destination table that has a schema equivalent to the MySQL table: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
The schema of the ClickHouse Cloud destination table and schema of the source MySQL table must be aligned (the column names and order must be the same, and the column data types must be compatible).
:::

### On the clickhouse-local host machine: {#on-the-clickhouse-local-host-machine}

#### Run clickhouse-local with the migration query: {#run-clickhouse-local-with-the-migration-query}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
No data is stored locally on the `clickhouse-local` host machine. Instead, the data is read from the source MySQL table
  and then immediately written to the destination table on the ClickHouse Cloud service.
:::

## Example 2: Migrating from MySQL to ClickHouse Cloud with the JDBC bridge {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

We will use the [JDBC integration table engine](/engines/table-engines/integrations/jdbc.md) (created on-the-fly by the [jdbc table function](/sql-reference/table-functions/jdbc.md)) together with the [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) and the MySQL JDBC driver for reading data from the source MySQL database and we will use the [remoteSecure table function](/sql-reference/table-functions/remote.md)
for writing the data into a destination table on your ClickHouse cloud service.

<Image img={ch_local_04} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

### On the destination ClickHouse Cloud service: {#on-the-destination-clickhouse-cloud-service-1}

#### Create the destination database: {#create-the-destination-database-1}
  ```sql
  CREATE DATABASE db
  ```
