---
sidebar_label: 'ClickPipes for MySQL'
description: 'Describes how to seamlessly connect your MySQL to ClickHouse Cloud.'
slug: /integrations/clickpipes/mysql
title: 'Ingesting Data from MySQL to ClickHouse (using CDC)'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';

# Ingesting data from MySQL to ClickHouse using CDC

<BetaBadge/>

:::info
Currently, ingesting data from MySQL to ClickHouse Cloud via ClickPipes is in Private Preview.
:::


You can use ClickPipes to ingest data from your source MySQL database into ClickHouse Cloud. The source MySQL database can be hosted on-premises or in the cloud.

## Prerequisites {#prerequisites}

To get started, you first need to make sure that your MySQL database is set up correctly. Depending on your source MySQL instance, you may follow any of the following guides:

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

5. [Generic MySQL](./mysql/source/generic)

4. [Amazon RDS MariaDB](./mysql/source/rds_maria)

5. [Generic MariaDB](./mysql/source/generic_maria)

Once your source MySQL database is set up, you can continue creating your ClickPipe.

## Create your ClickPipe {#creating-your-clickpipe}

Make sure you are logged in to your ClickHouse Cloud account. If you don't have an account yet, you can sign up [here](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)
1. In the ClickHouse Cloud Console, navigate to your ClickHouse Cloud Service.

<Image img={cp_service} alt="ClickPipes service" size="lg" border/>

2. Select the `Data Sources` button on the left-side menu and click on "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. Select the `MySQL CDC` tile

<Image img={mysql_tile} alt="Select MySQL" size="lg" border/>

### Add your source MySQL database connection {#adding-your-source-mysql-database-connection}

4. Fill in the connection details for your source MySQL database which you configured in the prerequisites step.

   :::info

   Before you start adding your connection details make sure that you have whitelisted ClickPipes IP addresses in your firewall rules. On the following page you can find a [list of ClickPipes IP addresses](../index.md#list-of-static-ips).
   For more information refer to the source MySQL setup guides linked at [the top of this page](#prerequisites).

   :::

   <Image img={mysql_connection_details} alt="Fill in connection details" size="lg" border/>

#### (Optional) Set up SSH Tunneling {#optional-setting-up-ssh-tunneling}

You can specify SSH tunneling details if your source MySQL database is not publicly accessible.


1. Enable the "Use SSH Tunnelling" toggle.
2. Fill in the SSH connection details.

   <Image img={ssh_tunnel} alt="SSH tunneling" size="lg" border/>

3. To use Key-based authentication, click on "Revoke and generate key pair" to generate a new key pair and copy the generated public key to your SSH server under `~/.ssh/authorized_keys`.
4. Click on "Verify Connection" to verify the connection.

:::note

Make sure to whitelist [ClickPipes IP addresses](../clickpipes#list-of-static-ips) in your firewall rules for the SSH bastion host so that ClickPipes can establish the SSH tunnel.

:::

Once the connection details are filled in, click on "Next".

#### Configure advanced settings {#advanced-settings}

You can configure the advanced settings if needed. A brief description of each setting is provided below:

- **Sync interval**: This is the interval at which ClickPipes will poll the source database for changes. This has an implication on the destination ClickHouse service, for cost-sensitive users we recommend to keep this at a higher value (over `3600`).
- **Parallel threads for initial load**: This is the number of parallel workers that will be used to fetch the initial snapshot. This is useful when you have a large number of tables and you want to control the number of parallel workers used to fetch the initial snapshot. This setting is per-table.
- **Pull batch size**: The number of rows to fetch in a single batch. This is a best effort setting and may not be respected in all cases.
- **Snapshot number of rows per partition**: This is the number of rows that will be fetched in each partition during the initial snapshot. This is useful when you have a large number of rows in your tables and you want to control the number of rows fetched in each partition.
- **Snapshot number of tables in parallel**: This is the number of tables that will be fetched in parallel during the initial snapshot. This is useful when you have a large number of tables and you want to control the number of tables fetched in parallel.


### Configure the tables {#configuring-the-tables}

5. Here you can select the destination database for your ClickPipe. You can either select an existing database or create a new one.

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. You can select the tables you want to replicate from the source MySQL database. While selecting the tables, you can also choose to rename the tables in the destination ClickHouse database as well as exclude specific columns.

### Review permissions and start the ClickPipe {#review-permissions-and-start-the-clickpipe}

7. Select the "Full access" role from the permissions dropdown and click "Complete Setup".

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

Finally, please refer to the ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq) page for more information about common issues and how to resolve them.
