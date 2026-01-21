---
slug: /cloud/managed-postgres/quickstart
sidebar_label: 'Quickstart'
title: 'Quickstart'
description: 'Create your first Managed Postgres database and explore the instance dashboard'
keywords: ['managed postgres', 'quickstart', 'getting started', 'create database']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPg from '@site/static/images/managed-postgres/create-service.png';
import pgOverview from '@site/static/images/managed-postgres/overview.png';
import connectModal from '@site/static/images/managed-postgres/connect-modal.png';
import integrationLanding from '@site/static/images/managed-postgres/integration-landing.png';
import postgresAnalyticsForm from '@site/static/images/managed-postgres/postgres-analytics-form.png';
import tablePicker from '@site/static/images/managed-postgres/table-picker.png';
import getClickHouseHost from '@site/static/images/managed-postgres/get-clickhouse-host.png';
import analyticsList from '@site/static/images/managed-postgres/analytics-list.png';
import replicatedTables from '@site/static/images/managed-postgres/replicated-tables.png';
import createSampleData from '@site/static/images/managed-postgres/create-sample-data.png';

# Quickstart for Managed Postgres
This is a quickstart guide to help you create your first Managed Postgres service and integrate it with ClickHouse. Having an existing ClickHouse instance will help you explore the full capabilities of Managed Postgres.

<PrivatePreviewBadge/>

## Create a database {#create-postgres-database}

To create a new Managed Postgres service, click on the **New service** button in the service list of the Cloud Console. You should then be able to select Postgres as the database type.

<Image img={createPg} alt="Create a managed Postgres service" size="md" border/>

Enter a name for your database instance and click on **Create service**. You will be taken to the overview page.

<Image img={pgOverview} alt="Managed Postgres overview" size="md" border/>

Your Managed Postgres instance will be provisioned and ready for use in a few minutes.

## Setup integration with ClickHouse {#setup-integrate-clickhouse}
Now that we have tables and data in Postgres, let's replicate the tables to ClickHouse for analytics. We start by clicking on **ClickHouse integration** in the sidebar. First, to have some data in Postgres to move over, click on the dropdown in the button and click on **Create sample data in Postgres**. 
<Image img={createSampleData} alt="Managed Postgres sample data" size="md" border/>
You will see a success toast. This creates two tables, `users` and `events`, in the `public` schema with some sample data.

Then, you can click on **Replicate data in ClickHouse**.
<Image img={integrationLanding} alt="Managed Postgres integration empty" size="md" border/>
In the form that follows, you can enter a name for your integration and select an existing ClickHouse instance to replicate to. If you don't have a ClickHouse instance yet, you can create one by following the [Quickstart for ClickHouse Cloud](/cloud/clickhouse-cloud/quickstart) guide.
:::warning Important
Make sure the ClickHouse service you select is Running before proceeding.
:::
<Image img={postgresAnalyticsForm} alt="Managed Postgres integration form" size="md" border/>

Click on **Next**, to be taken to the table picker. Here all you need to do is:
- Select a ClickHouse database to replicate to.
- Expand the **public** schema and select the users and events table we created earlier.
- Click on **Replicate data to ClickHouse**.

<Image img={tablePicker} alt="Managed Postgres table picker" size="md" border/>

The replication process will start, and you will be taken to the integration overview page. Being the first integration, it can take 2-3 minutes to setup the initial infrastructure. In the meantime let's check out the new **pg_clickhouse** extension.

## pg_clickhouse extension {#pg-clickhouse-extension}
**pg_clickhouse** is a Postgres extension we built which enables you to query ClickHouse data from a Postgres interface. A full introduction can be found [here](integrations/pg_clickhouse#introduction). To use the extension, connect to your Managed Postgres instance using any Postgres-compatible client and run the following SQL commands:

```sql
CREATE EXTENSION pg_clickhouse;
```

Then, we create what is known as a foreign data wrapper (FDW) to connect to ClickHouse:

```sql
CREATE SERVER ch FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host '<clickhouse_cloud_host>', dbname 'default');
```
You can get the host for the above by going to your ClickHouse service, clicking on Connect in the sidebar, and choosing Native.

<Image img={getClickHouseHost} alt="Get ClickHouse host" size="md" border/>

Now, we map the Postgres user to the ClickHouse service's credentials:
```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER ch 
OPTIONS (user 'default', password '<clickhouse_password>');
```
It's time to import data! Add the `organization` schema, just import it all of the tables from the remote ClickHouse database into a Postgres schema:
```sql
CREATE SCHEMA organization;
IMPORT FOREIGN SCHEMA "default" FROM SERVER ch INTO organization;
```
Done! You can now see all the ClickHouse tables in your Postgres client:
```sql
postgres=# \det+ organization.*
```
## Analytics after integration
Let's check back in on the integration page. You should see that the initial replication is complete. You can click on the name of the integration to view more details on it.
<Image img={analyticsList} alt="Managed Postgres analytics list" size="md" border/>

If you click on the service name, you will be taken to the ClickHouse console where you can see the two tables we replicated.
<Image img={replicatedTables} alt="Managed Postgres replicated tables in ClickHouse" size="md" border/>
