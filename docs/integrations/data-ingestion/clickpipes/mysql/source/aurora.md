---
sidebar_label: 'Amazon Aurora MySQL'
description: 'Set up Amazon Aurora MySQL as a source for ClickPipes'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Aurora MySQL Source Setup Guide'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# Aurora MySQL Source Setup Guide

This is a step-by-step guide on how to configure your Aurora MySQL instance for replicating its data via the MySQL ClickPipe.

## Enable Binary Log Retention {#enable-binlog-retention}
The binary log is a set of log files that contain information about data modifications made to an MySQL server instance, and binary log files are required for replication. Both of the below steps must be followed:

### 1. Enable binary logging via automated backup
The automated backups feature determines whether binary logging is turned on or off for MySQL. It can be set in the AWS console:

<Image img={rds_backups} alt="Enabling automated backups in Aurora" size="lg" border/>

Setting backup retention to a reasonably long value depending on the replication use-case is advisable.

### 2. Binlog retention hours
The below procedure must be called to ensure availability of binary logs for replication.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```
If this configuration isn't set, Amazon RDS purges the binary logs as soon as possible, leading to gaps in the binary logs.

If not already configured, make sure to set these in the parameter group:
1. `binlog_format` to `ROW`
2. `binlog_row_metadata` to `FULL`
3. `binlog_row_image` to `FULL`
<br/>
:::tip
If you have a MySQL cluster, the above parameters would be found in a [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) parameter group and not the DB instance group.
:::

## Configure Database User {#configure-database-user}

Connect to your Aurora MySQL instance as an admin user and execute the following commands:

1. Create a dedicated user for ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. Grant schema permissions. The following example shows permissions for the `mysql` database. Repeat these commands for each database and host you want to replicate:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Grant replication permissions to the user.

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    ```

## Configure Network Access {#configure-network-access}

### IP-based Access Control {#ip-based-access-control}

If you want to restrict traffic to your Aurora instance, please add the [documented static NAT IPs](../../index.md#list-of-static-ips) to the `Inbound rules` of your Aurora security group.

<Image img={security_group_in_rds_mysql} alt="Where to find security group in Aurora MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Edit inbound rules for the above security group" size="lg" border/>

### Private Access via AWS PrivateLink {#private-access-via-aws-privatelink}

To connect to your Aurora instance through a private network, you can use AWS PrivateLink. Follow our [AWS PrivateLink setup guide for ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) to set up the connection.
