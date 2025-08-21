---
sidebar_label: 'Amazon Aurora MySQL'
description: 'Step-by-step guide on how to set up Amazon Aurora MySQL as a source for ClickPipes'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Aurora MySQL source setup guide'
doc_type: overview
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import aurora_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/aurora_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';

# Aurora MySQL source setup guide

This step-by-step guide shows you how to configure Amazon Aurora MySQL to replicate data into ClickHouse Cloud using the [MySQL ClickPipe](../index.md). For common questions around MySQL CDC, see the [MySQL FAQs page](/integrations/data-ingestion/clickpipes/mysql/faq.md).

## Enable binary log retention {#enable-binlog-retention-aurora}

The binary log is a set of log files that contain information about data modifications made to a MySQL server instance, and binary log files are required for replication. To configure binary log retention in Aurora MySQL, you must [enable binary logging](#enable-binlog-logging) and [increase the binlog retention interval](#binlog-retention-interval).

### 1. Enable binary logging via automated backup {#enable-binlog-logging}

The automated backups feature determines whether binary logging is turned on or off for MySQL. Automated backups can be configured for your instance in the RDS Console by navigating to **Modify** > **Additional configuration** > **Backup** and selecting the **Enable automated backups** checkbox (if not selected already).

<Image img={rds_backups} alt="Enabling automated backups in Aurora" size="lg" border/>

We recommend setting the **Backup retention period** to a reasonably long value, depending on the replication use case.

### 2. Increase the binlog retention interval {#binlog-retention-interval}

:::warning
If ClickPipes tries to resume replication and the required binlog files have been purged due to the configured binlog retention value, the ClickPipe will enter an errored state and a resync is required.
:::

By default, Aurora MySQL purges the binary log as soon as possible (i.e., _lazy purging_). We recommend increasing the binlog retention interval to at least **72 hours** to ensure availability of binary log files for replication under failure scenarios. To set an interval for binary log retention ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), use the [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) procedure:

[//]: # "NOTE Most CDC providers recommend the maximum retention period for Aurora RDS (7 days/168 hours). Since this has an impact on disk usage, we conservatively recommend a mininum of 3 days/72 hours."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

If this configuration isn't set or is set to a low interval, it can lead to gaps in the binary logs, compromising ClickPipes' ability to resume replication. 

## Configure binlog settings {#binlog-settings}

The parameter group can be found when you click on your MySQL instance in the RDS Console, and then navigate to the **Configuration** tab.

:::tip
If you have a MySQL cluster, the parameters below can be found in the [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) parameter group instead of the DB instance group.
:::

<Image img={aurora_config} alt="Where to find parameter group in Aurora" size="lg" border/>

<br/>
Click the parameter group link, which will take you to its dedicated page. You should see an **Edit** button in the top right.

<Image img={edit_button} alt="Edit parameter group" size="lg" border/>

<br/>
The following parameters need to be set as follows:

1. `binlog_format` to `ROW`.

<Image img={binlog_format} alt="Binlog format to ROW" size="lg" border/>

2. `binlog_row_metadata` to `FULL`.

<Image img={binlog_row_metadata} alt="Binlog row metadata" size="lg" border/>

3. `binlog_row_image` to `FULL`.

<Image img={binlog_row_image} alt="Binlog row image" size="lg" border/>

<br/>
Then, click on **Save Changes** in the top right corner. You may need to reboot your instance for the changes to take effect — a way of knowing this is if you see `Pending reboot` next to the parameter group link in the **Configuration** tab of the Aurora instance.

## Enable GTID mode (recommended) {#gtid-mode}

:::tip
The MySQL ClickPipe also supports replication without GTID mode. However, enabling GTID mode is recommended for better performance and easier troubleshooting.
:::

[Global Transaction Identifiers (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) are unique IDs assigned to each committed transaction in MySQL. They simplify binlog replication and make troubleshooting more straightforward. We **recommend** enabling GTID mode, so that the MySQL ClickPipe can use GTID-based replication.

GTID-based replication is supported for Amazon Aurora MySQL v2 (MySQL 5.7) and v3 (MySQL 8.0), as well as Aurora Serverless v2. To enable GTID mode for your Aurora MySQL instance, follow these steps:

1. In the RDS Console, click on your MySQL instance.
2. Click on the **Configuration** tab.
3. Click on the parameter group link.
4. Click on the **Edit** button in the top right corner.
5. Set `enforce_gtid_consistency` to `ON`.
6. Set `gtid-mode` to `ON`.
7. Click on **Save Changes** in the top right corner.
8. Reboot your instance for the changes to take effect.

<Image img={enable_gtid} alt="GTID enabled" size="lg" border/>

## Configure a database user {#configure-database-user}

Connect to your Aurora MySQL instance as an admin user and execute the following commands:

1. Create a dedicated user for ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. Grant schema permissions. The following example shows permissions for the `mysql` database. Repeat these commands for each database and host you want to replicate:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Grant replication permissions to the user:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## Configure network access {#configure-network-access}

### IP-based access control {#ip-based-access-control}

To restrict traffic to your Aurora MySQL instance, add the [documented static NAT IPs](../../index.md#list-of-static-ips) to the **Inbound rules** of your Aurora security group.

<Image img={security_group_in_rds_mysql} alt="Where to find security group in Aurora MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Edit inbound rules for the above security group" size="lg" border/>

### Private access via AWS PrivateLink {#private-access-via-aws-privatelink}

To connect to your Aurora MySQL instance through a private network, you can use AWS PrivateLink. Follow the [AWS PrivateLink setup guide for ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) to set up the connection.

## What's next? {#whats-next}

Now that your Amazon Aurora MySQL instance is configured for binlog replication and securely connecting to ClickHouse Cloud, you can [create your first MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). For common questions around MySQL CDC, see the [MySQL FAQs page](/integrations/data-ingestion/clickpipes/mysql/faq.md).