---
sidebar_label: 'Amazon RDS MySQL'
description: 'Set up Amazon RDS MySQL as a source for ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds
title: 'RDS MySQL Source Setup Guide'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# RDS MySQL Source Setup Guide

This is a step-by-step guide on how to configure your RDS MySQL instance for replicating its data via the MySQL ClickPipe.

## Enable Binary Log Retention {#enable-binlog-retention}
The binary log is a set of log files that contain information about data modifications made to an MySQL server instance, and binary log files are required for replication. Both of the below steps must be followed:

### 1. Enable binary logging via automated backup
The automated backups feature determines whether binary logging is turned on or off for MySQL. It can be set in the AWS console:

<Image img={rds_backups} alt="Enabling automated backups in RDS" size="lg" border/>

Setting backup retention to a reasonably long value depending on the replication use-case is advisable.

### 2. Binlog retention hours
The default value of binlog retention hours is NULL. For RDS for MySQL, NULL means binary logs aren't retained.
To specify the number of hours to retain binary logs on a DB instance, use the mysql.rds_set_configuration with a period with enough time for replication to occur:

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

If not already configured, make sure to set these in the parameter group:
1. `binlog_expire_logs_seconds` to a value >= `86400`.
2. `binlog_row_metadata` to FULL - this is to support column exclusion in the ClickPipe.
3. `binlog_row_image` to FULL

## Configure Database User {#configure-database-user}

Connect to your RDS MySQL instance as an admin user and execute the following commands:

1. Create a dedicated user for ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. Grant database permissions. Repeat these commands for each database you want to replicate:

    ```sql
    GRANT USAGE ON `<database_name>`.* TO 'clickpipes_user'@'%';
    GRANT SELECT ON `<database_name>`.* TO 'clickpipes_user'@'%';
    ```

3. Grant replication permissions to the user.

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    ```

## Configure Network Access {#configure-network-access}

### IP-based Access Control {#ip-based-access-control}

If you want to restrict traffic to your RDS instance, please add the [documented static NAT IPs](../../index.md#list-of-static-ips) to the `Inbound rules` of your RDS security group.

<Image img={security_group_in_rds_mysql} alt="Where to find security group in RDS MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Edit inbound rules for the above security group" size="lg" border/>

### Private Access via AWS PrivateLink {#private-access-via-aws-privatelink}

To connect to your RDS instance through a private network, you can use AWS PrivateLink. Follow our [AWS PrivateLink setup guide for ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) to set up the connection.
