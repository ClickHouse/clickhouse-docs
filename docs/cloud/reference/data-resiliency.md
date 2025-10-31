---
slug: /cloud/data-resiliency
sidebar_label: 'Data resiliency'
title: 'Disaster recovery'
description: 'This guide provides an overview of disaster recovery.'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'data resiliency', 'disaster recovery']
---

import Image from '@theme/IdealImage';
import restore_backup from '@site/static/images/cloud/guides/restore_backup.png';

# Data resiliency {#clickhouse-cloud-data-resiliency}

This page covers the disaster recovery recommendations for ClickHouse Cloud, and guidance for customers to recover from an outage.
ClickHouse Cloud does not currently support automatic failover, or automatic syncing across multiple geographical regions.

:::tip
Customers should perform periodic backup restore testing to understand the specific RTO for their service size and configuration.
:::

## Definitions {#definitions}

It is helpful to cover some definitions first.

**RPO (Recovery Point Objective)**: The maximum acceptable data loss measured in time following a disruptive event. Example: An RPO of 30 mins means that in the event of a failure the DB should be restorable to data no older than 30 mins. This, of course, depends on how frequently backups are taken.

**RTO (Recovery Time Objective)**: The maximum allowable downtime before normal operations must resume following an outage. Example: An RTO of 30 mins means that in the event of a failure, the team is able to restore data and applications and get normal operations going within 30 mins.

**Database Backups and Snapshots**: Backups provide durable long-term storage with a separate copy of the data. Snapshots do not create an additional copy of the data, are usually faster, and provide better RPOs.

## Database backups {#database-backups}

Having a backup of your primary service is an effective way to utilize the backup and restore from it in the event of primary service downtime.
ClickHouse Cloud supports the following capabilities for backups.

1. **Default backups**

By default, ClickHouse Cloud takes a [backup](/cloud/manage/backups) of your service every 24 hours.
These backups are in the same region as the service, and happen in the ClickHouse CSP (cloud service provider) storage bucket.
In the event that the data in the primary service gets corrupted, the backup can be used to restore to a new service.

2. **External backups (in the customer's own storage bucket)**

Enterprise Tier customers can [export backups](/cloud/manage/backups/export-backups-to-own-cloud-account) to their object storage in their own account, in the same region, or in another region.
Cross-cloud backup export support is coming soon.
Applicable data transfer charges will apply for cross-region, and cross-cloud backups.

:::note
This feature is not currently available in PCI/ HIPAA services
:::

3. **Configurable backups**

Customers can [configure backups](/cloud/manage/backups/configurable-backups) to happen at a higher frequency, up to every 6 hours, to improve the RPO.
Customers can also configure longer retention.

The backups currently available for the service are listed on the “backups” page on the ClickHouse Cloud console.
This section also provides the success / failure status for each backup.

## Restoring from a Backup {#restoring-from-a-backup}

1. Default backups, in the ClickHouse Cloud bucket, can be restored to a new service in the same region.
2. External backups (in customer object storage) can be restored to a new service in the same or different region.

## Backup and restore duration guidance {#backup-and-restore-duration-guidance}

Backup and restore durations depend on several factors such as the size of the database as well as the schema and the number of tables in the database.

In our testing, we have seen smaller backups ~1 TB take up to 10-15 minutes or longer to back up.
Backups less than 20 TB usually complete within an hour, and backing up ~50 TB of data should take 2-3 hours.
Backups get economies of scale at larger sizes, and we have seen backups of up to 1 PB for some internal services complete in under 10 hours.

We recommend testing with your own database or sample data to get better estimates as the actual duration depends on several factors as outlined above.

Restore durations are similar to back up durations for similar size.
As mentioned above, we recommend testing with your own database to have an idea of how long it will take to restore the backup.

:::note
There is currently NO support for automatic failover between 2 ClickHouse Cloud instances whether in the same or different region.
There is currently NO automatic syncing of data between different ClickHouse Cloud services in the same or different regions .i.e. Active-Active replication
:::

## Recovery process {#recovery-process}

This section explains the various recovery options and the process that can be followed in each case.

### Primary service data corruption {#primary-service-data-corruption}

In this case, the data [can be restored](/cloud/manage/backups/overview#restore-a-backup) from the backup to another service in the same region.
The backup could be up to 24 hours old if using the default backup policy, or up to 6 hours old (if using configurable backups with 6 hours frequency).

#### Restoration steps {#restoration-steps}

To restore from an existing backup

<VerticalStepper headerLevel="list">

1. Go to the “Backups” section of the ClickHouse Cloud console.
2. Click on the three dots under “Actions” for the specific backup that you want to restore from.
3. Give the new service a specific name and restore from this backup

<Image img={restore_backup} size="md" alt="Restore from backup"/>

</VerticalStepper>

### Primary region downtime {#primary-region-downtime}

Customers in the Enterprise Tier can [export backups](/cloud/manage/backups/export-backups-to-own-cloud-account) to their own cloud provider bucket.
If you are concerned about regional failures, we recommend exporting backups to a different region.
Keep in mind that cross-region data transfer charges will apply.

If the primary region goes down, the backup in another region can be restored to a new service in a different region.

Once the backup has been restored to another service, you will need to ensure that any DNS, load balancer, or connection string configurations are updated to point to the new service.
This may involve:

- Updating environment variables or secrets
- Restarting application services to establish new connections

:::note
Backup / restore to an external bucket is currently not supported for services utilizing [Transparent Data Encryption (TDE)](/cloud/security/cmek#transparent-data-encryption-tde).
:::

## Additional options {#additional-options}

There are some additional options to consider.

1. **Dual-writing to separate clusters**

In this option, you can set up 2 separate clusters in different regions and dual-write to both.
This option inherently comes with a higher cost as it involves running multiple services but provides higher availability in case of one region being unavailable.

2. **Utilize CSP replication**

With this option, you would utilize the cloud service provider's native object storage replication to copy data over.
For instance, with BYOB you can export the backup to a bucket that you own in the primary region, and have that replicated over to another region using [AWS cross region replication](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html).