---
slug: /cloud/managed-postgres/migrations/logical-replication
sidebar_label: 'Logical replication'
title: 'Migrate PostgreSQL data using logical replication'
description: 'Learn how to migrate your PostgreSQL data to ClickHouse Managed Postgres using logical replication'
keywords: ['postgres', 'postgresql', 'logical replication', 'migration', 'data transfer', 'managed postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import sourceReplicationSetup from '@site/static/images/managed-postgres/logical_replication/source-setup.png';
import targetInitialSetup from '@site/static/images/managed-postgres/logical_replication/target-initial-setup.png';
import migrationResult from '@site/static/images/managed-postgres/logical_replication/migration-result.png';
import sourceSetup from '@site/static/images/managed-postgres/pg_dump_restore/source-setup.png';

# Migrate to Managed Postgres using logical replication {#logical-replication-migration}
This guide provides step-by-step instructions on how to migrate your PostgreSQL database to ClickHouse Managed Postgres using Postgres native logical replication.

<PrivatePreviewBadge />

## Prerequisites {#migration-logical-replication-prerequisites}
- Access to your source PostgreSQL database.
- `psql`,`pg_dump` and `pg_restore` installed on your local machine. This is for creating empty tables in your target database. These are typically included with PostgreSQL installations. If not, you can download them from the [PostgreSQL official website](https://www.postgresql.org/download/).
- Your source database must be reachable from ClickHouse Managed Postgres. Ensure that any necessary firewall rules or security group settings allow for this connectivity.

## The setup {#migration-logical-replication-setup}
For logical replication to work, we need to ensure that the source database is set up correctly. Here are the key requirements:
- The source database must have `wal_level` set to `logical`.
- The source database must have `max_replication_slots` set to at least `1`.
- For RDS (which this guide uses as an example), you need to ensure that your parameter group has `rds.logical_replication` set to `1`.
- The source database user must have the `REPLICATION` privilege. In the case of RDS, you would run:
    ```sql
    GRANT rds_replication TO <your-username>;
    ```

Make sure your source database is set up like this:
<Image img={sourceReplicationSetup} alt="Source PostgreSQL Replication Setup" size="md" border />

## Schema-only dump of the source database {#migration-logical-replication-schema-dump}
Before setting up logical replication, we need to create the schema in the target ClickHouse Managed Postgres database. We can do this by creating a schema-only dump of the source database using `pg_dump`:
```shell
pg_dump \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    -s \
    --format directory \
    -f rds-dump
```

Here:
- Replace `<user>`, `<password>`, `<host>`, `<port>`, and `<database>` with your source database credentials.
- `-s` specifies that we want a schema-only dump.
- `--format directory` specifies that we want the dump in a directory format, which is suitable for `pg_restore`.
- `-f rds-dump` specifies the output directory for the dump files. Note that this directory will be created automatically and should not exist beforehand.

In our case, we have two tables - `events` and `users`. `events` has a million rows, and `users` has a thousand rows.
<Image img={sourceSetup} alt="Source PostgreSQL Tables Setup" size="xl" border />

## Restore the schema to ClickHouse Managed Postgres {#migration-logical-replication-restore-schema}
Now that we have the schema dump, we can restore it to our ClickHouse Managed Postgres instance using `pg_restore`:
```shell
pg_restore \
    -d 'postgresql://<user>:<password>@<host>:<port>/<database>' \
    --verbose \
    rds-dump
```
Here:
- Replace `<user>`, `<password>`, `<host>`, `<port>`, and `<database>` with your target ClickHouse Managed Postgres database credentials.
- `--verbose` provides detailed output during the restore process.
This command will create all the tables, indexes, views, and other schema objects in the target database without any data.

In our case, after running this command, we have our two tables and they're empty:
<Image img={targetInitialSetup} alt="Target ClickHouse Managed Postgres Initial Setup" size="xl" border />

## Set up logical replication {#migration-logical-replication-setup-replication}
With the schema in place, we can now set up logical replication from the source database to the target ClickHouse Managed Postgres database. This involves creating a publication on the source database and a subscription on the target database.

### Create a publication on the source database {#migration-logical-replication-create-publication}
Connect to your source PostgreSQL database and create a publication that includes the tables you want to replicate.
```sql
CREATE PUBLICATION <pub_name> FOR TABLE table1, table2...;
```
:::info
Creating a publication FOR ALL TABLES can incur network overhead if there are many tables. It's recommended to specify only the tables you want to replicate.
:::

### Create a subscription on the target ClickHouse Managed Postgres database {#migration-logical-replication-create-subscription}
Next, connect to your target ClickHouse Managed Postgres database and create a subscription that connects to the publication on the source database.
```sql
CREATE SUBSCRIPTION demo_rds_subscription
CONNECTION 'postgresql://<user>:<password>@<host>:<port>/<database>'
PUBLICATION <pub_name_you_entered_above>;
```

This will automatically create a replication slot on the source database and start replicating data from the specified tables to the target database. Depending on the size of your data, this process may take some time.

In our case, after setting up the subscription, the data flowed in:
<Image img={migrationResult} alt="Migration Result after Logical Replication" size="xl" border />

New rows inserted into the source database will now be replicated to the target ClickHouse Managed Postgres database in near real-time.

## Caveats and considerations {#migration-logical-replication-caveats}
- Logical replication only replicates data changes (INSERT, UPDATE, DELETE). Schema changes (like ALTER TABLE) need to be handled separately.
- Ensure that the network connection between the source and target databases is stable to avoid replication interruptions.
- Monitor the replication lag to ensure that the target database is keeping up with the source database. Setting a suitable value for `max_slot_wal_keep_size` on the source database can help manage a growing replication slot and prevent it from consuming too much disk space.
- Depending on your use case, you might want to set up monitoring and alerting for the replication process.

## Next steps {#migration-pgdump-pg-restore-next-steps}
Congratulations! You have successfully migrated your PostgreSQL database to ClickHouse Managed Postgres using pg_dump and pg_restore. You are now all set to explore Managed Postgres features and its integration with ClickHouse. Here's a 10 minute quickstart to get you going:
- [Managed Postgres Quickstart Guide](../quickstart)
