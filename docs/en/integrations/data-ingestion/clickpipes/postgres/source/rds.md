---
sidebar_label: Amazon RDS Postgres
description: Set up Amazon RDS Postgres as a source for ClickPipes
slug: /en/integrations/clickpipes/postgres/source/rds
---

# RDS Postgres Source Setup Guide

## Supported Postgres versions

ClickPipes supports Postgres version 12 and later.

## Enable Logical Replication

You can skip this section if your RDS instance already has the following settings configured:
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

These settings are typically pre-configured if you previously used another data replication tool.

![Checking if logical replication is already enabled](images/setup/rds/logical_rep_already_configured.png)

If not already configured, follow these steps:

1. Create a new parameter group for your Postgres version with the required settings:
    - Set `rds.logical_replication` to 1
    - Set `wal_sender_timeout` to 0

    ![Where to find Parameter groups in RDS?](images/setup/rds/parameter_group_in_blade.png)

    ![Changing rds.logical_replication](images/setup/rds/change_rds_logical_replication.png)

    ![Changing wal_sender_timeout](images/setup/rds/change_wal_sender_timeout.png)

2. Apply the new parameter group to your RDS Postgres database

    ![Modifying RDS Postgres with new parameter group](images/setup/rds/modify_parameter_group.png)

3. Reboot your RDS instance to apply the changes

    ![Reboot RDS Postgres](images/setup/rds/reboot_rds.png)

## Configure Database User

Connect to your RDS Postgres instance as an admin user and execute the following commands:

1. Create a dedicated user for ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Grant schema permissions. The following example shows permissions for the `public` schema. Repeat these commands for each schema you want to replicate:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Grant replication privileges:

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. Create a publication for replication:

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```


## Configure Network Access

If you want to restrict traffic to your RDS instance, please add the [documented static NAT IPs](../../index.md#list-of-static-ips) to the `Inbound rules` of your RDS security group.

![Where to find security group in RDS Postgres?](images/setup/rds/security_group_in_rds_postgres.png)

![Edit inbound rules for the above security group](images/setup/rds/edit_inbound_rules.png)


## What's next?

You can now [create your ClickPipe](../index.md) and start ingesting data from your RDS Postgres instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your RDS Postgres instance as you will need them during the ClickPipe creation process.
