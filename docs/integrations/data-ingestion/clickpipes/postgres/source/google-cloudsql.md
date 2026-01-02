---
sidebar_label: 'Google Cloud SQL'
description: 'Set up Google Cloud SQL Postgres instance as a source for ClickPipes'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Google Cloud SQL Postgres Source Setup Guide'
doc_type: 'guide'
keywords: ['google cloud sql', 'postgres', 'clickpipes', 'logical decoding', 'firewall']
---

import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';
import Image from '@theme/IdealImage';

# Google Cloud SQL Postgres source setup guide

:::info

If you use one of the supported providers (in the sidebar), please refer to the specific guide for that provider.

:::

## Supported Postgres versions {#supported-postgres-versions}

Anything on or after Postgres 12

## Enable logical replication {#enable-logical-replication}

**You don't need** to follow the below steps if the settings `cloudsql. logical_decoding` is on and `wal_sender_timeout` is 0. These settings should mostly be pre-configured if you are migrating from another data replication tool.

1. Click on **Edit** button on the Overview page.

<Image img={edit_button} alt="Edit Button in Cloud SQL Postgres" size="lg" border/>

2. Go to Flags and change `cloudsql.logical_decoding` to on and `wal_sender_timeout` to 0. These changes will need restarting your Postgres server.

<Image img={cloudsql_logical_decoding1} alt="Change cloudsql.logical_decoding to on" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="Changed cloudsql.logical_decoding and wal_sender_timeout" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="Restart Server" size="lg" border/>

## Creating ClickPipes user and granting permissions {#creating-clickpipes-user-and-granting-permissions}

Connect to your Cloud SQL Postgres through the admin user and run the below commands:

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

[//]: # (TODO Add SSH Tunneling)

## Add ClickPipes IPs to Firewall {#add-clickpipes-ips-to-firewall}

Please follow the below steps to add ClickPipes IPs to your network.

:::note

If your are using SSH Tunneling, then you need to add the [ClickPipes IPs](../../index.md#list-of-static-ips) to the firewall rules of the Jump Server/Bastion.

:::

1. Go to **Connections** section

<Image img={connections} alt="Connections Section in Cloud SQL" size="lg" border/>

2. Go to the Networking subsection

<Image img={connections_networking} alt="Networking Subsection in Cloud SQL" size="lg" border/>

3. Add the [public IPs of ClickPipes](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="Add ClickPipes Networks to Firewall" size="lg" border/>
<Image img={firewall2} alt="ClickPipes Networks Added to Firewall" size="lg" border/>

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your Postgres instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your Postgres instance as you will need them during the ClickPipe creation process.
