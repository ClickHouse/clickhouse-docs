---
sidebar_label: 'Timescale'
description: 'Set up Postgres with the TimescaleDB extension as a source for ClickPipes'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'Postgres with TimescaleDB source setup guide'
keywords: ['TimescaleDB']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';

# Postgres with TimescaleDB source setup guide

<BetaBadge/>

## Background {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) is an open-source Postgres extension developed by Timescale Inc 
that aims to boost the performance of analytics queries without having to move away from Postgres. This is achieved by 
creating "hypertables" which are managed by the extension and support automatic partitioning into "chunks". 
Hypertables also support transparent compression and hybrid row-columnar storage (known as "hypercore"), although these
features require a version of the extension that has a proprietary license.

Timescale Inc also offers two managed services for TimescaleDB: 
- `Managed Service for Timescale`
- `Timescale Cloud`. 

There are third-party vendors offering managed services that allow you to use the TimescaleDB extension, but due to 
 licensing, these vendors only support the open-source version of the extension.

Timescale hypertables behave differently from regular Postgres tables in several ways. This poses some complications 
to the process of replicating them, which is why the ability to replicate Timescale hypertables should be considered as 
**best effort**.

## Supported Postgres versions {#supported-postgres-versions}

ClickPipes supports Postgres version 12 and later.

## Enable logical replication {#enable-logical-replication}

The steps to be follow depend on how your Postgres instance with TimescaleDB is deployed. 

- If you're using a managed service and your provider is listed in the sidebar, please follow the guide for that provider.
- If you're deploying TimescaleDB yourself, follow the generic guide. 

For other managed services, please raise a support ticket with your provider to help in enabling logical replication if 
it isn't already.

:::info
Timescale Cloud does not support enabling logical replication, which is needed for Postgres pipes in CDC mode.
As a result, users of Timescale Cloud can only perform a one-time load of their data (`Initial Load Only`) with the
Postgres ClickPipe.
:::

## Configuration {#configuration}

Timescale hypertables don't store any data inserted into them. Instead, the data is stored in multiple corresponding 
"chunk" tables which are in the `_timescaledb_internal` schema. For running queries on the hypertables, this is not an
issue. But during logical replication, instead of detecting changes in the hypertable we detect them in the chunk table
instead. The Postgres ClickPipe has logic to automatically remap changes from the chunk tables to the parent hypertable,
but this requires additional steps.

:::info
If you'd like to only perform a one-time load of your data (`Initial Load Only`), please skip steps 2 onward.
:::

1. Create a dedicated user for ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Grant schema-level, read-only access to the user you created in the previous step. The following example shows permissions for the `public` schema. Repeat these commands for each schema containing tables you want to replicate:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Grant replication privileges to the user:

    ```sql
    GRANT rds_replication TO clickpipes_user;
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

3. Grant replication permissions to the user created earlier.

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

After these steps, you should be able to proceed with [creating a ClickPipe](../index.md).

## Configure network access {#configure-network-access}

If you want to restrict traffic to your Timescale instance, please allowlist the [documented static NAT IPs](../../index.md#list-of-static-ips).
Instructions to do this will vary across providers, please consult the sidebar if your provider is listed or raise a 
ticket with them.
