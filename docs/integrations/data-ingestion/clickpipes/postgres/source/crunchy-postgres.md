---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'Set up Crunchy Bridge Postgres as a source for ClickPipes'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgres Source Setup Guide'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'logical replication', 'data ingestion']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';

# Crunchy Bridge Postgres source setup guide

ClickPipes supports Postgres version 12 and later.

## Enable logical replication {#enable-logical-replication}

Crunchy Bridge comes with logical replication enabled by [default](https://docs.crunchybridge.com/how-to/logical-replication). Ensure that the settings below are configured correctly. If not, adjust them accordingly.

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## Creating ClickPipes user and granting permissions {#creating-clickpipes-user-and-granting-permissions}

Connect to your Crunchy Bridge Postgres through the `postgres` user and run the below commands:

1. Create a Postgres user exclusively for ClickPipes.

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Grant read-only access to the schema from which you are replicating tables to `clickpipes_user`. Below example shows granting permissions for the `public` schema. If you want to grant access to multiple schemas, you can run these three commands for each schema.

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Grant replication access to this user:

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. Create publication that you'll be using for creating the MIRROR (replication) in future.

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## Safe list ClickPipes IPs {#safe-list-clickpipes-ips}

Safelist [ClickPipes IPs](../../index.md#list-of-static-ips) by adding the Firewall Rules in Crunchy Bridge.

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Where to find Firewall Rules in Crunchy Bridge?" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="Add the Firewall Rules for ClickPipes" border/>

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your Postgres instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your Postgres instance as you will need them during the ClickPipe creation process.
