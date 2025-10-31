---
sidebar_label: 'Amazon RDS Postgres'
description: 'Set up Amazon RDS Postgres as a source for ClickPipes'
slug: /integrations/clickpipes/postgres/source/rds
title: 'RDS Postgres Source Setup Guide'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# RDS Postgres source setup guide

## Supported Postgres versions {#supported-postgres-versions}

ClickPipes supports Postgres version 12 and later.

## Enable logical replication {#enable-logical-replication}

You can skip this section if your RDS instance already has the following settings configured:
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

These settings are typically pre-configured if you previously used another data replication tool.

```text
postgres=> SHOW rds.logical_replication ;
 rds.logical_replication
-------------------------
 on
(1 row)

postgres=> SHOW wal_sender_timeout ;
 wal_sender_timeout
--------------------
 0
(1 row)
```

If not already configured, follow these steps:

1. Create a new parameter group for your Postgres version with the required settings:
    - Set `rds.logical_replication` to 1
    - Set `wal_sender_timeout` to 0

<Image img={parameter_group_in_blade} alt="Where to find Parameter groups in RDS?" size="lg" border/>

<Image img={change_rds_logical_replication} alt="Changing rds.logical_replication" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="Changing wal_sender_timeout" size="lg" border/>

2. Apply the new parameter group to your RDS Postgres database

<Image img={modify_parameter_group} alt="Modifying RDS Postgres with new parameter group" size="lg" border/>

3. Reboot your RDS instance to apply the changes

<Image img={reboot_rds} alt="Reboot RDS Postgres" size="lg" border/>

## Configure database user {#configure-database-user}

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

## Configure network access {#configure-network-access}

### IP-based access control {#ip-based-access-control}

If you want to restrict traffic to your RDS instance, please add the [documented static NAT IPs](../../index.md#list-of-static-ips) to the `Inbound rules` of your RDS security group.

<Image img={security_group_in_rds_postgres} alt="Where to find security group in RDS Postgres?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Edit inbound rules for the above security group" size="lg" border/>

### Private Access via AWS PrivateLink {#private-access-via-aws-privatelink}

To connect to your RDS instance through a private network, you can use AWS PrivateLink. Follow our [AWS PrivateLink setup guide for ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) to set up the connection.

### Workarounds for RDS Proxy {#workarounds-for-rds-proxy}
RDS Proxy does not support logical replication connections. If you have dynamic IP addresses in RDS and cannot use DNS name or a lambda, here are some alternatives:

1. Using a cron job, resolve the RDS endpoint's IP periodically and update the NLB if it has changed.
2. Using RDS Event Notifications with EventBridge/SNS: Trigger updates automatically using AWS RDS event notifications
3. Stable EC2: Deploy an EC2 instance to act as a polling service or IP-based proxy
4. Automate IP address management using tools like Terraform or CloudFormation.

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your Postgres instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your Postgres instance as you will need them during the ClickPipe creation process.
