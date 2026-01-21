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

# Quickstart for Managed Postgres
This is a quickstart guide to help you create your first Managed Postgres service and integrate it with ClickHouse. Having an existing ClickHouse instance will help you explore the full capabilities of Managed Postgres.

<PrivatePreviewBadge/>

## Create a database {#create-postgres-database}

To create a new Managed Postgres service, click on the **New service** button in the service list of the Cloud Console. You should then be able to select Postgres as the database type.

<Image img={createPg} alt="Create a managed Postgres service" size="md" border/>

Enter a name for your database instance and click on **Create service**. You will be taken to the overview page.

<Image img={pgOverview} alt="Managed Postgres overview" size="md" border/>

Your Managed Postgres instance will be provisioned and ready for use in a few minutes.

## Connect and have some data ready {#connect-and-data}
In the sidebar on the left, you will see a [**Connect** button](/cloud/managed-postgres/connection). Click on it to view your connection details and connection strings in multiple formats.

<Image img={connectModal} alt="Managed Postgres connect modal" size="md" border/>

You can copy the connection string in your preferred format and use it to connect to your database using any Postgres-compatible client such as `psql`, DBeaver, or any application  library.

To get started quickly, you can use the following SQL commands to create two sample tables and insert some data:

```sql
CREATE TABLE events (
   event_id SERIAL PRIMARY KEY,
   event_name VARCHAR(255) NOT NULL,
   event_type VARCHAR(100),
   event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   event_data JSONB,
   user_id INT,
   user_ip INET,
   is_active BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
   user_id SERIAL PRIMARY KEY,
   name VARCHAR(100),
   country VARCHAR(50),
   platform VARCHAR(50)
);
```

Let's insert into the events table:
```sql
INSERT INTO events (event_name, event_type, event_timestamp, event_data, user_id, user_ip)
SELECT
   'Event ' || gs::text AS event_name,
   CASE
       WHEN random() < 0.5 THEN 'click'          -- 50% chance
       WHEN random() < 0.75 THEN 'view'          -- 25% chance
       WHEN random() < 0.9 THEN 'purchase'       -- 15% chance
       WHEN random() < 0.98 THEN 'signup'        -- 8% chance
       ELSE 'logout'                             -- 2% chance
   END AS event_type,
   NOW() - INTERVAL '1 day' * (gs % 365) AS event_timestamp,
   jsonb_build_object('key', 'value' || gs::text, 'additional_info', 'info_' || (gs % 100)::text) AS event_data,
   GREATEST(1, LEAST(1000, FLOOR(POWER(random(), 2) * 1000) + 1)) AS user_id,
   ('192.168.1.' || ((gs % 254) + 1))::inet AS user_ip
FROM
   generate_series(1, 1000000) gs;
```

And then insert into the users table:
```sql
INSERT INTO
    users (
        NAME,
        country,
        platform
    )
SELECT
    first_names [first_idx] || ' ' || last_names [last_idx] AS NAME,
    CASE
        WHEN random() < 0.25 THEN 'India'
        WHEN random() < 0.5 THEN 'USA'
        WHEN random() < 0.7 THEN 'Germany'
        WHEN random() < 0.85 THEN 'China'
        ELSE 'Other'
    END AS country,
    CASE
        WHEN random() < 0.2 THEN 'iOS'
        WHEN random() < 0.4 THEN 'Android'
        WHEN random() < 0.6 THEN 'Web'
        WHEN random() < 0.75 THEN 'Windows'
        WHEN random() < 0.9 THEN 'MacOS'
        ELSE 'Linux'
    END AS platform
FROM
    generate_series(1, 1000) AS seq
    CROSS JOIN lateral (
        SELECT
            array ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack',                 'Liam', 'Olivia', 'Noah', 'Emma', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Amelia',                 'Aarav', 'Riya', 'Arjun', 'Ananya', 'Wei', 'Li', 'Huan', 'Mei', 'Hans', 'Klaus', 'Greta', 'Sofia'] AS first_names,
            array ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Taylor',                 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Lee', 'Perez',                 'Sharma', 'Patel', 'Gupta', 'Reddy', 'Zhang', 'Wang', 'Chen', 'Liu', 'Schmidt', 'Müller', 'Weber', 'Fischer'] AS last_names,
            1 + (seq % 32) AS first_idx,
            1 + ((seq / 32) :: int % 32) AS last_idx
    ) AS names;
```

## Setup integration with ClickHouse {#setup-integrate-clickhouse}
Now that we have tables and data in Postgres, let's replicate the tables to ClickHouse for analytics. We start by clicking on **ClickHouse integration** in the sidebar. Then you can click on **Replicate data in ClickHouse**.
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
## Analytics after integration {#analytics-after-integration}
Let's check back in on the integration page. You should see that the initial replication is complete. You can click on the name of the integration to view more details on it.
<Image img={analyticsList} alt="Managed Postgres analytics list" size="md" border/>

If you click on the service name, you will be taken to the ClickHouse console where you can see the two tables we replicated.
<Image img={replicatedTables} alt="Managed Postgres replicated tables in ClickHouse" size="md" border/>
