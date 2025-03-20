---
sidebar_label: Azure Flexible Server for Postgres
description: Set up Azure Flexible Server for Postgres as a source for ClickPipes
slug: /en/integrations/clickpipes/postgres/source/azure-flexible-server-postgres
---

# Azure Flexible Server for Postgres Source Setup Guide

ClickPipes supports Postgres version 12 and later.

## Enable Logical Replication

**You don't need** to follow the below steps if `wal_level` is set to `logical`. This setting should mostly be pre-configured if you are migrating from another data replication tool.

1. Click on the **Server parameters** section

   ![Server Parameters](images/setup/azure-flexible-server-postgres/server_parameters.png)

2. Edit the `wal_level` to `logical`

   ![Change wal_level to logical](images/setup/azure-flexible-server-postgres/wal_level.png)
3. This change would require a server restart. So restart when requested.

   ![Restart server](images/setup/azure-flexible-server-postgres/restart.png)


## Creating ClickPipes User and Granting permissions

Connect to your Azure Flexible Server Postgres through the admin user and run the below commands:

1. Create a Postgres user for exclusively ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Provide read-only access to the schema from which you are replicating tables to the `clickpipes_user`. Below example shows setting up permissions for the `public` schema. If you want to grant access to multiple schemas, you can run these three commands for each schema.

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

5. Set `wal_sender_timeout` to 0 for `clickpipes_user`

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```


## Add ClickPipes IPs to Firewall

Please follow the below steps to add [ClickPipes IPs](../../index.md#list-of-static-ips) to your network.

1. Go to the **Networking** tab and add the [ClickPipes IPs](../../index.md#list-of-static-ips) to the Firewall
   of your Azure Flexible Server Postgres OR the Jump Server/Bastion if you are using SSH tunneling.

   ![Add ClickPipes IPs to Firewall](images/setup/azure-flexible-server-postgres/firewall.png)


## What's next?

You can now [create your ClickPipe](../index.md) and start ingesting data from your Postgres instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your Postgres instance as you will need them during the ClickPipe creation process.
