---
sidebar_label: 'Amazon Aurora Postgres'
description: 'Set up Amazon Aurora Postgres as a source for ClickPipes'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgres Source Setup Guide'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWS database', 'logical replication setup']
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

# Aurora Postgres source setup guide

## Supported Postgres versions {#supported-postgres-versions}

ClickPipes supports Aurora PostgreSQL-Compatible Edition version 12 and later.

## Enable logical replication {#enable-logical-replication}

You can skip this section if your Aurora instance already has the following settings configured:
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

1. Create a new parameter group for your Aurora PostgreSQL version with the required settings:
    - Set `rds.logical_replication` to 1
    - Set `wal_sender_timeout` to 0

<Image img={parameter_group_in_blade} alt="Where to find Parameter groups in Aurora" size="lg" border/>

<Image img={change_rds_logical_replication} alt="Changing rds.logical_replication" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="Changing wal_sender_timeout" size="lg" border/>

2. Apply the new parameter group to your Aurora PostgreSQL cluster

<Image img={modify_parameter_group} alt="Modifying Aurora PostgreSQL with new parameter group" size="lg" border/>

3. Reboot your Aurora cluster to apply the changes

<Image img={reboot_rds} alt="Reboot Aurora PostgreSQL" size="lg" border/>

## Configure database user {#configure-database-user}

Connect to your Aurora PostgreSQL writer instance as an admin user and execute the following commands:

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

If you want to restrict traffic to your Aurora cluster, please add the [documented static NAT IPs](../../index.md#list-of-static-ips) to the `Inbound rules` of your Aurora security group.

<Image img={security_group_in_rds_postgres} alt="Where to find security group in Aurora PostgreSQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Edit inbound rules for the above security group" size="lg" border/>

### Private access via AWS PrivateLink {#private-access-via-aws-privatelink}

To connect to your Aurora cluster through a private network, you can use AWS PrivateLink. Follow our [AWS PrivateLink setup guide for ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) to set up the connection.

### Aurora-specific considerations {#aurora-specific-considerations}

When setting up ClickPipes with Aurora PostgreSQL, keep these considerations in mind:

1. **Connection Endpoint**: Always connect to the writer endpoint of your Aurora cluster, as logical replication requires write access to create replication slots and must connect to the primary instance.

2. **Failover Handling**: In the event of a failover, Aurora will automatically promote a reader to be the new writer. ClickPipes will detect the disconnection and attempt to reconnect to the writer endpoint, which will now point to the new primary instance.

3. **Global Database**: If you're using Aurora Global Database, you should connect to the primary region's writer endpoint, as cross-region replication already handles data movement between regions.

4. **Storage Considerations**: Aurora's storage layer is shared across all instances in a cluster, which can provide better performance for logical replication compared to standard RDS.

### Dealing with dynamic cluster endpoints {#dealing-with-dynamic-cluster-endpoints}

While Aurora provides stable endpoints that automatically route to the appropriate instance, here are some additional approaches for ensuring consistent connectivity:

1. For high-availability setups, configure your application to use the Aurora writer endpoint, which automatically points to the current primary instance.

2. If using cross-region replication, consider setting up separate ClickPipes for each region to reduce latency and improve fault tolerance.

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your Aurora PostgreSQL cluster into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your Aurora PostgreSQL cluster as you will need them during the ClickPipe creation process.
