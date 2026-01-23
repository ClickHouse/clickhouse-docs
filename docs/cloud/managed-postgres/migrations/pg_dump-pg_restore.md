---
slug: /cloud/managed-postgres/migrations/pg_dump-pg_restore
sidebar_label: 'pg_dump and pg_restore'
title: 'Migrate PostgreSQL data using pg_dump and pg_restore'
description: 'Learn how to migrate your PostgreSQL data to ClickHouse Managed Postgres using pg_dump and pg_restore'
keywords: ['postgres', 'postgresql', 'pg_dump', 'pg_restore', 'migration', 'data transfer', 'managed postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPgForMigrate from '@site/static/images/managed-postgres/pg_dump_restore/create-pg-for-migration.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';
import dumpCommand from '@site/static/images/managed-postgres/pg_dump_restore/dump-command.png';
import restoreCommand from '@site/static/images/managed-postgres/pg_dump_restore/restore-command.png';
import targetSetup from '@site/static/images/managed-postgres/pg_dump_restore/target-setup.png';

# Migrate to Managed Postgres using pg_dump and pg_restore
This guide provides step-by-step instructions on how to migrate your PostgreSQL database to ClickHouse Managed Postgres using the `pg_dump` and `pg_restore` utilities.

<PrivatePreviewBadge />

## Prerequisites
- Access to your source PostgreSQL database.
- `pg_dump` and `pg_restore` installed on your local machine. These are typically included with PostgreSQL installations. If not, you can download them from the [PostgreSQL official website](https://www.postgresql.org/download/).

## The setup
To go through the steps, let's use a sample RDS Postgres database as the source database. Something like this:
<Image img={sourceSetup} alt="Source PostgreSQL Database Setup" size="xl" border />

Here's what we're working with:
- Two tables - `events` and `users`. `events` has a million rows, and `users` has a thousand rows.
- `events` has an index.
- A view on top of the `events` table.
- Couple of sequences

## Create a dump of the source database
Now let's use `pg_dump` to create a dump file of the above objects. It's a simple command:
```shell
pg_dump \
  -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
  --format directory \
  -f rds-dump
```
Here:
- Replace `<user>`, `<password>`, `<host>`, `<port>`, and `<database>` with your source database credentials. Most Postgres providers give you a connection string that you can use directly.
- `--format directory` specifies that we want the dump in a directory format, which is suitable for `pg_restore`.
- `-f rds-dump` specifies the output directory for the dump files. Note that this directory will be created automatically and should not exist beforehand.
- You can also parallelize the dump process by adding the `--jobs` flag followed by the number of parallel jobs you want to run. For more details, refer to the [pg_dump documentation](https://www.postgresql.org/docs/current/app-pgdump.html).


:::tip
You can test this process once to get a sense of how long it takes and the size of the dump file.
:::

Here's what running this command looks like:
<Image img={dumpCommand} alt="pg_dump Command Execution" size="xl" border />

## Migrate the dump to ClickHouse Managed Postgres
Now that we have the dump file, we can restore it to our ClickHouse Managed Postgres instance using `pg_restore`. 

### Create a Managed Postgres instance
First, ensure you have a Managed Postgres instance set up, preferably in the same region as the source. You can follow the quick guide [here](../quickstart#create-postgres-database). Here's what we are going to spin up for this guide:
<Image img={createPgForMigrate} alt="Create ClickHouse Managed Postgres Instance" size="md" border />

### Restore the dump
Now, heading back to our local machine, we can use the `pg_restore` command to restore the dump to our Managed Postgres instance:
```shell
pg_restore \
  -d 'postgresql://<user>:<password>@<pg_clickhouse_host>:5432/<database>' \
  --verbose \
  rds-dump
```
You can get the connection string for your Managed Postgres instance from the ClickHouse Cloud console, explained very simply [here](../connection).

Here too there are a couple of flags to note:
- `--verbose` provides detailed output during the restore process.
- You can also use the `--jobs` flag here to parallelize the restore process. For more details, refer to the [pg_restore documentation](https://www.postgresql.org/docs/current/app-pgrestore.html).

In our case, it looks like this:
<Image img={restoreCommand} alt="pg_restore Command Execution" size="xl" border />

## Verify the migration
Once the restore process is complete, you can connect to your Managed Postgres instance and verify that all your data and objects have been migrated successfully. You can use any PostgreSQL client to connect and run queries.
Here's what our Managed Postgres setup looks like after the migration:
<Image img={targetSetup} alt="Target Managed Postgres Database Setup" size="xl" border />
We see that we have all our tables, indexes, views, and sequences intact, along with the data.

## Caveats
- Ensure that the PostgreSQL versions of the source and target databases are compatible.
Using a pg_dump version older than the source server may lead to missing features or restore issues. Ideally, use the same or newer major version of pg_dump than the source database.
- Large databases may take a significant amount of time to dump and restore.
Plan accordingly to minimize downtime, and consider using parallel dumps/restores (--jobs) where supported.
- Note that pg_dump / pg_restore do not replicate all database-related objects or runtime state.
These include roles and role memberships, replication slots, server-level configuration (e.g. postgresql.conf, pg_hba.conf), tablespaces, and runtime statistics.

## Next steps
Congratulations! You have successfully migrated your PostgreSQL database to ClickHouse Managed Postgres using pg_dump and pg_restore. You are now all set to explore Managed Postgres features and its integration with ClickHouse. Here's a 10 minute quickstart to get you going:
- [Managed Postgres Quickstart Guide](../quickstart)