---
sidebar_label: 'Overview'
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: 'Overview'
keywords: ['backups', 'cloud backups', 'restore']
description: 'Provides an overview of backups in ClickHouse Cloud'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';

# Backups

Database backups provide a safety net by ensuring that if data is lost for any unforeseen reason, the service can be restored to a previous state from the last successful backup. This minimizes downtime and prevents business critical data from being permanently lost. This guide covers how backups work in ClickHouse Cloud, what options you have to configure backups for your service, and how to restore from a backup.

## How backups work in ClickHouse Cloud {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud backups are a combination of "full" and "incremental" backups that constitute a backup chain. The chain starts with a full backup, and incremental backups are then taken over the next several scheduled time periods to create a sequence of backups. Once a backup chain reaches a certain length, a new chain is started. This entire chain of backups can then be utilized to restore data to a new service if needed. Once all backups included in a specific chain are past the retention time frame set for the service (more on retention below), the chain is discarded.

In the screenshot below, the solid line squares show full backups and the dotted line squares show incremental backups. The solid line rectangle around the squares denotes the retention period and the backups that are visible to the end user, which can be used for a backup restore. In the scenario below, backups are being taken every 24 hours and are retained for 2 days.

On Day 1, a full backup is taken to start the backup chain. On Day 2, an incremental backup is taken, and we now have a full and incremental backup available to restore from. By Day 7, we have one full backup and six incremental backups in the chain, with the most recent two incremental backups visible to the user. On Day 8, we take a new full backup, and on Day 9, once we have two backups in the new chain, the previous chain is discarded.

<Image img={backup_chain} size="md" alt="Backup chain example in ClickHouse Cloud" />

*Example backup scenario in Clickhouse Cloud*

## Default backup policy {#default-backup-policy}

In the Basic, Scale, and Enterprise tiers, backups are metered and billed separately from storage. All services will default to one backup with the ability to configure more, starting with the Scale tier, via the Settings tab of the Cloud console.

## Backup status list {#backup-status-list}

Your service will be backed up based on the set schedule, whether it is the default daily schedule or a [custom schedule](./configurable-backups.md) picked by you. All available backups can be viewed from the **Backups** tab of the service. From here, you can see the status of the backup, the duration, as well as the size of the backup. You can also restore a specific backup using the **Actions** column.

<Image img={backup_status_list} size="md" alt="List of backup statuses in ClickHouse Cloud" border/>

## Understanding backup cost {#understanding-backup-cost}

Per the default policy, ClickHouse Cloud mandates a backup every day, with a 24 hour retention.  Choosing a schedule that requires retaining more data, or causes more frequent backups can cause additional storage charges for backups.

To understand the backup cost, you can view the backup cost per service from the usage screen (as shown below). Once you have backups running for a few days with a customized schedule, you can get an idea of the cost and extrapolate to get the monthly cost for backups.

<Image img={backup_usage} size="md" alt="Backup usage chart in ClickHouse Cloud" border/>


Estimating the total cost for your backups requires you to set a schedule. We are also working on updating our [pricing calculator](https://clickhouse.com/pricing), so you can get a monthly cost estimate before setting a schedule. You will need to provide the following inputs in order to estimate the cost:
- Size of the full and incremental backups
- Desired frequency
- Desired retention
- Cloud provider and region

:::note
Keep in mind that the estimated cost for backups will change as the size of the data in the service grows over time.
:::


## Restore a backup {#restore-a-backup}

Backups are restored to a new ClickHouse Cloud service, not to the existing service from which the backup was taken.

After clicking on the **Restore** backup icon, you can specify the service name of the new service that will be created, and then restore this backup:

<Image img={backup_restore} size="md" alt="Restoring a backup in ClickHouse Cloud" />

The new service will show in the services list as `Provisioning` until it is ready:

<Image img={backup_service_provisioning} size="md" alt="Provisioning service in progress" border/>

## Working with your restored service {#working-with-your-restored-service}

After a backup has been restored, you will now have two similar services: the **original service** that needed to be restored, and a new **restored service** that has been restored from a backup of the original.

Once the backup restore is complete, you should do one of the following:
- Use the new restored service and remove the original service.
- Migrate data from the new restored service back to the original service and remove the new restored service.

### Use the **new restored service** {#use-the-new-restored-service}

To use the new service, perform these steps:

1. Verify that the new service has the IP Access List entries required for your use case.
1. Verify that the new service contains the data that you need.
1. Remove the original service.

### Migrate data from the **newly restored service** back to the **original service** {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

Suppose you cannot work with the newly restored service for some reason, for example, if you still have users or applications that connect to the existing service. You may decide to migrate the newly restored data into the original service. The migration can be accomplished by following these steps:

**Allow remote access to the newly restored service**

The new service should be restored from a backup with the same IP Allow List as the original service. This is required as connections will not be allowed to other ClickHouse Cloud services unless you had allowed access from **Anywhere**. Modify the allow list and allow access from **Anywhere** temporarily. See the [IP Access List](/cloud/security/setting-ip-filters) docs for details.

**On the newly restored ClickHouse service (the system that hosts the restored data)**

:::note
You will need to reset the password for the new service in order to access it. You can do that from the service list **Settings** tab.
:::

Add a read only user that can read the source table (`db.table` in this example):

  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

Copy the table definition:

  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'db' AND table = 'table'
  ```

**On the destination ClickHouse Cloud system (the one that had the damaged table):**

Create the destination database:
  ```sql
  CREATE DATABASE db
  ```

Using the `CREATE TABLE` statement from the source, create the destination:

:::tip
Change the `ENGINE` to `ReplicatedMergeTree` without any parameters when you run the `CREATE` statement. ClickHouse Cloud always replicates tables and provides the correct parameters.
:::

  ```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
  ```

Use the `remoteSecure` function to pull the data from the newly restored ClickHouse Cloud service into your original service:

  ```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

After you have successfully inserted the data into your original service, make sure to verify the data in the service. You should also delete the new  service once the data is verified.

## Undeleting or undropping tables {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

The `UNDROP` command is not supported in ClickHouse Cloud. If you accidentally `DROP` a table, the best course of action is to restore your last backup and recreate the table from the backup.

To prevent users from accidentally dropping tables, you can use [`GRANT` statements](/sql-reference/statements/grant) to revoke permissions for the [`DROP TABLE` command](/sql-reference/statements/drop#drop-table) for a specific user or role.

:::note
To prevent accidental deletion of data, please note that by default it is not possible to drop tables >`1TB` in size in ClickHouse Cloud.
Should you wish to drop tables greater than this threshold you can use setting `max_table_size_to_drop` to do so:

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2097152 -- increases the limit to 2TB
```
:::

## Configurable backups {#configurable-backups}

If you want to set up a backups schedule different from the default backup schedule, take a look at [Configurable Backups](./configurable-backups.md).

## Export backups to your own cloud account {#export-backups-to-your-own-cloud-account}

For users wanting to export backups to their own cloud account, see [here](./export-backups-to-own-cloud-account.md).
