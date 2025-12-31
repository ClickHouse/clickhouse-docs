---
sidebar_label: 'Neon Postgres'
description: 'Set up Neon Postgres instance as a source for ClickPipes'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgres Source Setup Guide'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';

# Neon Postgres source setup guide

This is a guide on how to setup Neon Postgres, which you can use for replication in ClickPipes.
Make sure you're signed in to your [Neon console](https://console.neon.tech/app/projects) for this setup.

## Creating a user with permissions {#creating-a-user-with-permissions}

Connect to your Neon instance as an admin user and execute the following commands:

1. Create a dedicated user for ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Grant the dedicated user permissions on the schema(s) you want to replicate.
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

   The example above shows permissions for the `public` schema. Repeat the sequence of commands for each schema you want to replicate using ClickPipes.

3. Grant the dedicated user permissions to manage replication:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Create a [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) with the tables you want to replicate. We strongly recommend only including the tables you need in the publication to avoid performance overhead.

   :::warning
   Any table included in the publication must either have a **primary key** defined _or_ have its **replica identity** configured to `FULL`. See the [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) for guidance on scoping.
   :::

   - To create a publication for specific tables:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - To create a publication for all tables in a specific schema:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   The `clickpipes` publication will contain the set of change events generated from the specified tables, and will later be used to ingest the replication stream.

## Enable logical replication {#enable-logical-replication}
In Neon, you can enable logical replication through the UI. This is necessary for ClickPipes's CDC to replicate data.
Head over to the **Settings** tab and then to the **Logical Replication** section.

<Image size="lg" img={neon_enable_replication} alt="Enable logical replication" border/>

Click on **Enable** to be all set here. You should see the below success message once you enable it.

<Image size="lg" img={neon_enabled_replication} alt="Logical replication enabled" border/>

Let's verify the below settings in your Neon Postgres instance:
```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## IP whitelisting (for Neon enterprise plan) {#ip-whitelisting-for-neon-enterprise-plan}
If you have Neon Enterprise plan, you can whitelist the [ClickPipes IPs](../../index.md#list-of-static-ips) to allow replication from ClickPipes to your Neon Postgres instance.
To do this you can click on the **Settings** tab and go to the **IP Allow** section.

<Image size="lg" img={neon_ip_allow} alt="Allow IPs screen" border/>

## Copy connection details {#copy-connection-details}
Now that we have the user, publication ready and replication enabled, we can copy the connection details to create a new ClickPipe.
Head over to the **Dashboard** and at the text box where it shows the connection string,
change the view to **Parameters Only**. We will need these parameters for our next step.

<Image size="lg" img={neon_conn_details} alt="Connection details" border/>

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your Postgres instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your Postgres instance as you will need them during the ClickPipe creation process.
