---
sidebar_label: 'Amazon RDS MariaDB'
description: 'Step-by-step guide on how to set up Amazon RDS MariaDB as a source for ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'RDS MariaDB source setup guide'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# RDS MariaDB source setup guide

This is a step-by-step guide on how to configure your RDS MariaDB instance for replicating its data via the MySQL ClickPipe.
<br/>
:::info
We also recommend going through the MySQL FAQs [here](/integrations/data-ingestion/clickpipes/mysql/faq.md). The FAQs page is being actively updated.
:::

## Enable binary log retention {#enable-binlog-retention-rds}
The binary log is a set of log files that contain information about data modifications made to a MySQL server instance. Binary log files are required for replication. Both of the steps below must be followed:

### 1. Enable binary logging via automated backup{#enable-binlog-logging-rds}

The automated backups feature determines whether binary logging is turned on or off for MySQL. It can be set in the AWS console:

<Image img={rds_backups} alt="Enabling automated backups in RDS" size="lg" border/>

Setting backup retention to a reasonably long value depending on the replication use-case is advisable.

### 2. Binlog retention hours{#binlog-retention-hours-rds}
Amazon RDS for MariaDB has a different method of setting binlog retention duration, which is the amount of time a binlog file containing changes is kept. If some changes are not read before the binlog file is removed, replication will be unable to continue. The default value of binlog retention hours is NULL, which means binary logs aren't retained.

To specify the number of hours to retain binary logs on a DB instance, use the mysql.rds_set_configuration function with a binlog retention period long enough for replication to occur. `24 hours` is the recommended minimum.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## Configure binlog settings in the parameter group {#binlog-parameter-group-rds}

The parameter group can be found when you click on your MariaDB instance in the RDS Console, and then navigate to the `Configurations` tab.

<Image img={rds_config} alt="Where to find parameter group in RDS" size="lg" border/>

Upon clicking on the parameter group link, you will be taken to the parameter group link page. You will see an Edit button in the top-right:

<Image img={edit_button} alt="Edit parameter group" size="lg" border/>

Settings `binlog_format`, `binlog_row_metadata` and `binlog_row_image` need to be set as follows:

1. `binlog_format` to `ROW`.

<Image img={binlog_format} alt="Binlog format to ROW" size="lg" border/>

2. `binlog_row_metadata` to `FULL`

<Image img={binlog_row_metadata} alt="Binlog row metadata to FULL" size="lg" border/>

3. `binlog_row_image` to `FULL`

<Image img={binlog_row_image} alt="Binlog row image to FULL" size="lg" border/>

Next, click on `Save Changes` in the top-right. You may need to reboot your instance for the changes to take effect. If you see `Pending reboot` next to the parameter group link in the Configurations tab of the RDS instance, this is a good indication that a reboot of your instance is needed.

<br/>
:::tip
If you have a MariaDB cluster, the above parameters would be found in a [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) parameter group and not the DB instance group.
:::

## Enabling GTID Mode {#gtid-mode-rds}
Global Transaction Identifiers (GTIDs) are unique IDs assigned to each committed transaction in MySQL/MariaDB. They simplify binlog replication and make troubleshooting more straightforward. MariaDB enables GTID mode by default, so no user action is needed to use it.

## Configure a database user {#configure-database-user-rds}

Connect to your RDS MariaDB instance as an admin user and execute the following commands:

1. Create a dedicated user for ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Grant schema permissions. The following example shows permissions for the `mysql` database. Repeat these commands for each database and host that you want to replicate:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Grant replication permissions to the user:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';

## Configure network access {#configure-network-access}

### IP-based access control {#ip-based-access-control}

If you want to restrict traffic to your RDS instance, please add the [documented static NAT IPs](../../index.md#list-of-static-ips) to the `Inbound rules` of your RDS security group.

<Image img={security_group_in_rds_mysql} alt="Where to find security group in RDS?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Edit inbound rules for the above security group" size="lg" border/>

### Private access via AWS PrivateLink {#private-access-via-aws-privatelink}

To connect to your RDS instance through a private network, you can use AWS PrivateLink. Follow our [AWS PrivateLink setup guide for ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) to set up the connection.
