---
sidebar_label: 'Ingesting Data from Postgres to ClickHouse'
description: 'Seamlessly connect your Postgres to ClickHouse Cloud.'
slug: /integrations/clickpipes/postgres
title: 'Ingesting Data from Postgres to ClickHouse (using CDC)'
doc_type: 'guide'
integration_type: ['clickpipes']
integration_logo: '/static/images/integrations/logos/postgresql.svg'
integration_title: 'ClickPipes for PostgreSQL'
integration_tier: 'core'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_tile from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-tile.png'
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';

# Ingesting data from Postgres to ClickHouse (using CDC)

You can use ClickPipes to ingest data from your source Postgres database into ClickHouse Cloud. The source Postgres database can be hosted on-premises or in the cloud including Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase and others.

## Prerequisites {#prerequisites}

To get started, you first need to make sure that your Postgres database is set up correctly. Depending on your source Postgres instance, you may follow any of the following guides:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic), if you are using any other Postgres provider or using a self-hosted instance.

9. [TimescaleDB](./postgres/source/timescale), if you are using the TimescaleDB extension on a managed service or self-hosted instance.

:::warning

Postgres Proxies like PgBouncer, RDS Proxy, Supabase Pooler, etc., are not supported for CDC based replication. Please make sure to NOT use them for the ClickPipes setup and instead add connection details of the actual Postgres database.

:::

Once your source Postgres database is set up, you can continue creating your ClickPipe.

## Creating your ClickPipe {#creating-your-clickpipe}

Make sure you are logged in to your ClickHouse Cloud account. If you don't have an account yet, you can sign up [here](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)
1. In the ClickHouse Cloud console, navigate to your ClickHouse Cloud Service.

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. Select the `Data Sources` button on the left-side menu and click on "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. Select the `Postgres CDC` tile

   <Image img={postgres_tile} alt="Select Postgres" size="lg" border/>

### Adding your source Postgres database connection {#adding-your-source-postgres-database-connection}

4. Fill in the connection details for your source Postgres database which you configured in the prerequisites step.

   :::info

   Before you start adding your connection details make sure that you have whitelisted ClickPipes IP addresses in your firewall rules. You can find the list of ClickPipes IP addresses [here](../index.md#list-of-static-ips).
   For more information refer to the source Postgres setup guides linked at [the top of this page](#prerequisites).

   :::

   <Image img={postgres_connection_details} alt="Fill in connection details" size="lg" border/>

#### (Optional) Setting up AWS Private Link {#optional-setting-up-aws-private-link}

You can use AWS Private Link to connect to your source Postgres database if it is hosted on AWS. This is useful if you
want to keep your data transfer private.
You can follow the [setup guide to set up the connection](/integrations/clickpipes/aws-privatelink).

#### (Optional) Setting up SSH tunneling {#optional-setting-up-ssh-tunneling}

You can specify SSH tunneling details if your source Postgres database is not publicly accessible.

1. Enable the "Use SSH Tunnelling" toggle.
2. Fill in the SSH connection details.

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. To use Key-based authentication, click on "Revoke and generate key pair" to generate a new key pair and copy the generated public key to your SSH server under `~/.ssh/authorized_keys`.
4. Click on "Verify Connection" to verify the connection.

:::note

Make sure to whitelist [ClickPipes IP addresses](../clickpipes#list-of-static-ips) in your firewall rules for the SSH bastion host so that ClickPipes can establish the SSH tunnel.

:::

Once the connection details are filled in, click on "Next".

### Configuring the replication settings {#configuring-the-replication-settings}

5. Make sure to select the replication slot from the dropdown list you created in the prerequisites step.

   <Image img={select_replication_slot} alt="Select replication slot" size="lg" border/>

#### Advanced settings {#advanced-settings}

You can configure the Advanced settings if needed. A brief description of each setting is provided below:

- **Sync interval**: This is the interval at which ClickPipes will poll the source database for changes. This has implication on the destination ClickHouse service, for cost-sensitive users we recommend to keep this at a higher value (over `3600`).
- **Parallel threads for initial load**: This is the number of parallel workers that will be used to fetch the initial snapshot. This is useful when you have a large number of tables and you want to control the number of parallel workers used to fetch the initial snapshot. This setting is per-table.
- **Pull batch size**: The number of rows to fetch in a single batch. This is a best effort setting and may not be respected in all cases.
- **Snapshot number of rows per partition**: This is the number of rows that will be fetched in each partition during the initial snapshot. This is useful when you have a large number of rows in your tables and you want to control the number of rows fetched in each partition.
- **Snapshot number of tables in parallel**: This is the number of tables that will be fetched in parallel during the initial snapshot. This is useful when you have a large number of tables and you want to control the number of tables fetched in parallel.

### Configuring the tables {#configuring-the-tables}

6. Here you can select the destination database for your ClickPipe. You can either select an existing database or create a new one.

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

7. You can select the tables you want to replicate from the source Postgres database. While selecting the tables, you can also choose to rename the tables in the destination ClickHouse database as well as exclude specific columns.

   :::warning
   If you are defining an ordering key in ClickHouse differently than from the primary key in Postgres, don't forget to read all the [considerations](/integrations/clickpipes/postgres/ordering_keys) around it
   :::

### Review permissions and start the ClickPipe {#review-permissions-and-start-the-clickpipe}

8. Select the "Full access" role from the permissions dropdown and click "Complete Setup".

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## What's next? {#whats-next}

Once you've set up your ClickPipe to replicate data from PostgreSQL to ClickHouse Cloud, you can focus on how to query and model your data for optimal performance. See the [migration guide](/migrations/postgresql/overview) to assess which strategy best suits your requirements, as well as the [Deduplication strategies (using CDC)](/integrations/clickpipes/postgres/deduplication) and [Ordering Keys](/integrations/clickpipes/postgres/ordering_keys) pages for best practices on CDC workloads.

For common questions around PostgreSQL CDC and troubleshooting, see the [Postgres FAQs page](/integrations/clickpipes/postgres/faq).
