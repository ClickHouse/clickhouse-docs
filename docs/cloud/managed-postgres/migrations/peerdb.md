---
slug: /cloud/managed-postgres/migrations/peerdb
sidebar_label: 'PeerDB'
title: 'Migrate PostgreSQL data using PeerDB'
description: 'Learn how to migrate your PostgreSQL data to ClickHouse Managed Postgres using PeerDB'
keywords: ['postgres', 'postgresql', 'logical replication', 'migration', 'data transfer', 'managed postgres', 'peerdb']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import sourcePeer from '@site/static/images/managed-postgres/peerdb/source-peer.png';
import targetPeer from '@site/static/images/managed-postgres/peerdb/target-peer.png';
import peers from '@site/static/images/managed-postgres/peerdb/peers.png';
import createMirror from '@site/static/images/managed-postgres/peerdb/create-mirror.png';
import tablePicker from '@site/static/images/managed-postgres/peerdb/table-picker.png';
import initialLoad from '@site/static/images/managed-postgres/peerdb/initial-load.png';
import mirrors from '@site/static/images/managed-postgres/peerdb/mirrors.png';
import settings from '@site/static/images/managed-postgres/peerdb/settings.png';

# Migrate to Managed Postgres using PeerDB {#peerdb-migration}
This guide provides step-by-step instructions on how to migrate your PostgreSQL database to ClickHouse Managed Postgres using PeerDB.
<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-peerdb" />

## Prerequisites {#migration-peerdb-prerequisites}
- Access to your source PostgreSQL database.
- A ClickHouse Managed Postgres instance where you want to migrate your data.
- PeerDB installed on a machine. You can follow the installation instructions on the [PeerDB GitHub repository](https://github.com/PeerDB-io/peerdb?tab=readme-ov-file#get-started). You just need to clone the repository and run `docker-compose up`. For this guide, we will be using **PeerDB UI**, which will be accessible at `http://localhost:3000` once PeerDB is running.

## Considerations before migration {#migration-peerdb-considerations-before}
Before starting your migration, keep the following in mind:

- **Database objects**: PeerDB will create tables automatically in the target database based on the source schema. However, certain database objects like indexes, constraints, and triggers won't be migrated automatically. You'll need to recreate these objects manually in the target database after the migration.
- **DDL changes**: If you enable continuous replication, PeerDB will keep the target database in sync with the source for DML operations (INSERT, UPDATE, DELETE) and will propagate ADD COLUMN operations. However, other DDL changes (like DROP COLUMN, ALTER COLUMN) aren't propagated automatically. More on schema changes support [here](/integrations/clickpipes/postgres/schema-changes)
- **Network connectivity**: Ensure that both the source and target databases are reachable from the machine where PeerDB is running. You may need to configure firewall rules or security group settings to allow connectivity.

## Create peers {#migration-peerdb-create-peers}
First, we need to create peers for both the source and target databases. A peer represents a connection to a database. In PeerDB UI, navigate to the "Peers" section by clicking on "Peers" in the sidebar. To create a new peer, click on the `+ New peer` button.

### Source peer creation {#migration-peerdb-source-peer}
Create a peer for your source PostgreSQL database by filling in the connection details such as host, port, database name, username, and password. Once you have filled in the details, click on the `Create peer` button to save the peer.
<Image img={sourcePeer} alt="Source Peer Creation" size="md" border />

### Target peer creation {#migration-peerdb-target-peer}
Similarly, create a peer for your ClickHouse Managed Postgres instance by providing the necessary connection details. You can get the [connection details](../connection) for your instance from the ClickHouse Cloud console. After filling in the details, click on the `Create peer` button to save the target peer.
<Image img={targetPeer} alt="Target Peer Creation" size="md" border />

Now, you should see both the source and target peers listed in the "Peers" section.
<Image img={peers} alt="Peers List" size="md" border />

### Obtain source schema dump {#migration-peerdb-source-schema-dump}
To mirror the setup of the source database in the target database, we need to obtain a schema dump of the source database. You can use `pg_dump` to create a schema-only dump of your source PostgreSQL database:
```shell
pg_dump -d 'postgresql://<user>:<password>@<host>:<port>/<database>'  -s > source_schema.sql
```

Before applying this to the target database, we need to remove UNIQUE constraints and indexes from the dump file so that PeerDB ingestion to target tables is not blocked by these constraints. These can be removed using:
```shell
# Preview
grep -n "CONSTRAINT.*UNIQUE" <dump_file_path>
grep -n "CREATE UNIQUE INDEX" <dump_file_path>
grep -n -E "(CONSTRAINT.*UNIQUE|CREATE UNIQUE INDEX)" <dump_file_path>

# Remove
sed -i.bak -E '/CREATE UNIQUE INDEX/,/;/d; /(CONSTRAINT.*UNIQUE|ADD CONSTRAINT.*UNIQUE)/d' <dump_file_path>
```

### Apply schema dump to target database {#migration-peerdb-apply-schema-dump}
After cleaning up the schema dump file, you can apply it to your target ClickHouse Managed Postgres database by [connecting](../connection) via `psql` and running the schema dump file:
```shell
psql -h <target_host> -p <target_port> -U <target_username> -d <target_database> -f source_schema.sql
```

Here on the target side, we do not want PeerDB ingestion to be blocked by foreign key constraints. For this, we can alter the target role (used above in the target peer) to have `session_replication_role` set to `replica`:
```sql
ALTER ROLE <target_role> SET session_replication_role = replica;
```

## Create a mirror {#migration-peerdb-create-mirror}
Next, we need to create a mirror to define the data migration process between the source and target peers. In PeerDB UI, navigate to the "Mirrors" section by clicking on "Mirrors" in the sidebar. To create a new mirror, click on the `+ New mirror` button.
<Image img={createMirror} alt="Create Mirror" size="md" border />
1. Give your mirror a name that describes the migration.
2. Select the source and target peers you created earlier from the dropdown menus.
3. Make sure that:
- Soft delete is OFF.
- Expand `Advanced settings`. Make sure that the **Postgres type system is enabled** and **PeerDB columns are disabled**.
<Image img={settings} alt="Mirror Settings" size="md" border />
4. Select the tables you want to migrate. You can choose specific tables or select all tables from the source database.
<Image img={tablePicker} alt="Table Picker" size="md" border />

:::info Selecting tables
Make sure the destination table names are the same as the source table names in the target database, as we have migrated the schema as is in the earlier step.
:::

5. Once you have configured the mirror settings, click on the `Create mirror` button.

You should see your newly created mirror in the "Mirrors" section.
<Image img={mirrors} alt="Mirrors List" size="md" border />

## Wait for the initial load {#migration-peerdb-initial-load}
After creating the mirror, PeerDB will start the initial data load from the source to the target database. You can click on the mirror and click on the **Initial load** tab to monitor the progress of the initial data migration.
<Image img={initialLoad} alt="Initial Load Progress" size="md" border />
Once the initial load is complete, you should see a status indicating that the migration is finished.

## Monitoring initial load and replication {#migration-peerdb-monitoring}
If you click on the source peer, you can see a list of running commands which PeerDB is running. For instance:
1. Initially we run a COUNT query to estimate the number of rows in each table.
2. Then we run a partitioning query using NTILE to break down large tables into smaller chunks for efficient data transfer.
3. We then do FETCH commands to pull data from the source database and then PeerDB syncs them to the target database.

## Post-migration tasks {#migration-peerdb-considerations}
After the migration is complete:

- **Recreate database objects**: Remember to manually recreate indexes, constraints, and triggers in the target database, as these aren't migrated automatically.
- **Test your application**: Make sure to test your application against the ClickHouse Managed Postgres instance to ensure everything is working as expected.
- **Clean up resources**: Once you're satisfied with the migration and have switched your application to use ClickHouse Managed Postgres, you can delete the mirror and peers in PeerDB to clean up resources.

:::info Replication slots
If you enabled continuous replication, PeerDB will create a **replication slot** on the source PostgreSQL database. Make sure to drop the replication slot manually from the source database after you're done with the migration to avoid unnecessary resource usage.
:::

## References {#migration-peerdb-references}
- [ClickHouse Managed Postgres Documentation](../)
- [PeerDB guide for CDC creation](https://docs.peerdb.io/mirror/cdc-pg-pg)
- [Postgres ClickPipe FAQ (holds true for PeerDB as well)](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)

## Next steps {#migration-pgdump-pg-restore-next-steps}
Congratulations! You have successfully migrated your PostgreSQL database to ClickHouse Managed Postgres using pg_dump and pg_restore. You're now all set to explore Managed Postgres features and its integration with ClickHouse. Here's a 10 minute quickstart to get you going:
- [Managed Postgres Quickstart Guide](../quickstart)
