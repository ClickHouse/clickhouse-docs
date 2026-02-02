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

# Migrate to Managed Postgres using PeerDB {#peerdb-migration}
This guide provides step-by-step instructions on how to migrate your PostgreSQL database to ClickHouse Managed Postgres using PeerDB.
<PrivatePreviewBadge />

## Prerequisites {#migration-peerdb-prerequisites}
- Access to your source PostgreSQL database.
- A ClickHouse Managed Postgres instance where you want to migrate your data.
- PeerDB installed on a machine. You can follow the installation instructions on the [PeerDB GitHub repository](https://github.com/PeerDB-io/peerdb?tab=readme-ov-file#get-started). You just need to clone the repository and run `docker-compose up`. For this guide, we will be using **PeerDB UI**, which will be accessible at `http://localhost:3000` once PeerDB is running.

## Create peers {#migration-peerdb-create-peers}
First, we need to create peers for both the source and target databases. A peer represents a connection to a database. In PeerDB UI, navigate to the "Peers" section by clicking on "Peers" in the sidebar. To create a new peer, click on the `+ New peer` button.

### Source peer creation {#migration-peerdb-source-peer}
Create a peer for your source PostgreSQL database by filling in the connection details such as host, port, database name, username, and password. Once you have filled in the details, click on the `Create peer` button to save the peer.
<Image img={sourcePeer} alt="Source Peer Creation" size="md" border />

:::info
Ensure that the source database is reachable from the machine where PeerDB is running. You may need to configure firewall rules or security group settings to allow connectivity.
:::

### Target peer creation {#migration-peerdb-target-peer}
Similarly, create a peer for your ClickHouse Managed Postgres instance by providing the necessary connection details. You can get the [connection details](../connection) for your instance from the ClickHouse Cloud console. After filling in the details, click on the `Create peer` button to save the target peer.
<Image img={targetPeer} alt="Target Peer Creation" size="md" border />

Now, you should see both the source and target peers listed in the "Peers" section.
<Image img={peers} alt="Peers List" size="md" border />

## Create a mirror {#migration-peerdb-create-mirror}
Next, we need to create a mirror to define the data migration process between the source and target peers. In PeerDB UI, navigate to the "Mirrors" section by clicking on "Mirrors" in the sidebar. To create a new mirror, click on the `+ New mirror` button.
<Image img={createMirror} alt="Create Mirror" size="md" border />
1. Give your mirror a name that describes the migration.
2. Select the source and target peers you created earlier from the dropdown menus.
3. You may choose to enable continuous replication if you want to keep the target database in sync with the source after the initial migration. Otherwise, under **Advanced settings**, you can enable **Initial copy only** to perform a one-time migration.
4. Select the tables you want to migrate. You can choose specific tables or select all tables from the source database.
<Image img={tablePicker} alt="Table Picker" size="md" border />
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

## Considerations after migration {#migration-peerdb-considerations}
- Note that we create the tables automatically in the target database based on the source schema. However, certain database objects like indexes, constraints, and triggers will not be migrated automatically. You would need to recreate these objects manually in the target database after the migration.
- If you enabled continuous replication, PeerDB will keep the target database in sync with the source as far as DML operations (INSERT, UPDATE, DELETE) are concerned. We also propagate ADD COLUMN operations, but other DDL changes (like DROP COLUMN, ALTER COLUMN) are not propagated automatically. More on schema changes support [here](../../../integrations/clickpipes/postgres/schema-changes.md)
- Make sure to test your application against the ClickHouse Managed Postgres instance to ensure everything is working as expected after the migration.
- Once you are satisfied with the migration and have switched your application to use ClickHouse Managed Postgres, you can delete the mirror and peers in PeerDB to clean up resources.

:::info
If you enabled continuous replication, PeerDB will create a **replication slot** on the source PostgreSQL database. Make sure to drop the replication slot manually from the source database after you are done with the migration to avoid unnecessary resource usage.
:::

## References {#migration-peerdb-references}
- [ClickHouse Managed Postgres Documentation](../overview)
- [PeerDB guide for CDC creation](https://docs.peerdb.io/mirror/cdc-pg-pg)
- [Postgres ClickPipe FAQ (holds true for PeerDB as well)](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)

## Next steps {#migration-pgdump-pg-restore-next-steps}
Congratulations! You have successfully migrated your PostgreSQL database to ClickHouse Managed Postgres using pg_dump and pg_restore. You are now all set to explore Managed Postgres features and its integration with ClickHouse. Here's a 10 minute quickstart to get you going:
- [Managed Postgres Quickstart Guide](../quickstart)
