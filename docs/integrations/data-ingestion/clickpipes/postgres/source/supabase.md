---
sidebar_label: 'Supabase Postgres'
description: 'Set up Supabase instance as a source for ClickPipes'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase Source Setup Guide'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';

# Supabase source setup guide

This is a guide on how to setup Supabase Postgres for usage in ClickPipes.

:::note

ClickPipes supports Supabase via IPv6 natively for seamless replication.

:::

## Creating a user with permissions and replication slot {#creating-a-user-with-permissions-and-replication-slot}

Connect to your Supabase instance as an admin user and execute the following commands:

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

## Increase `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

:::warning

This step will restart your Supabase database and may cause a brief downtime.

You can increase the `max_slot_wal_keep_size` parameter for your Supabase database to a higher value (at least 100GB or `102400`) by following the [Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)

For better recommendation of this value you can contact the ClickPipes team.

:::

## Connection details to use for Supabase {#connection-details-to-use-for-supabase}

Head over to your Supabase Project's `Project Settings` -> `Database` (under `Configuration`).

**Important**: Disable `Display connection pooler` on this page and head over to the `Connection parameters` section and note/copy the parameters.

<Image img={supabase_connection_details} size="lg" border alt="Locate Supabase Connection Details" border/>

:::info

The connection pooler is not supported for CDC based replication, hence it needs to be disabled.

:::

## Note on RLS {#note-on-rls}
The ClickPipes Postgres user must not be restricted by RLS policies, as it can lead to missing data. You can disable RLS policies for the user by running the below command:
```sql
ALTER USER clickpipes_user BYPASSRLS;
```

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your Postgres instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your Postgres instance as you will need them during the ClickPipe creation process.
