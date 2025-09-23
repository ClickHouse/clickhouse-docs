---
slug: /cloud/disaster-recovery
sidebar_label: 'Disaster recovery'
title: 'Disaster recovery'
description: 'This guide provides an overview of disaster recovery.'
doc_type: 'guide'
---

# ClickHouse Cloud Disaster Recovery {#clickhouse-cloud-disaster-recovery}

This page covers the disaster recovery recommendations for ClickHouse Cloud, and guidance for customers to recover from an outage. ClickHouse Cloud does not currently support automatic failover, or automatic syncing across multiple geographical regions.

## Definitions {#definitions}

It is helpful to cover some definitions first.

**RPO (Recovery Point Objective)**: The maximum acceptable data loss measured in time following a disruptive event. Example: An RPO of 30 mins means that in the event of a failure the DB should be restorable to data no older than 30 mins. This, of course, depends on how frequently backups are taken.

**RTO (Recovery Time Objective)**: The maximum allowable downtime before normal operations must resume following an outage. Example: An RTO of 30 mins means that in the event of a failure, the team is able to restore data and applications and get normal operations going within 30 mins.

**Database Backups and Snapshots**: Backups provide durable long-term storage with a separate copy of the data. Snapshots do not create an additional copy of the data, are usually faster, and provide better RPOs.

## Database Backups {#database-backups}

Having a backup of your primary service is an effective way to utilize the backup and restore from it in the event of primary service downtime. ClickHouse Cloud supports the following capabilities for backups.

**Default backups**: By default, ClickHouse Cloud takes a backup of your service every 24 hours. These backups are in the same region as the service, and happen in the ClickHouse CSP (cloud service provider) storage bucket. In the event that the data in the primary service gets corrupted, the backup can be used to restore to a new service.

**External backups (in customer's own storage bucket)**: Enterprise Tier customers can export backups to their object storage in their own account, in the same region, or in another region. Cross-cloud backup export support is coming soon. Applicable data transfer charges will apply for cross-region, and cross-cloud backups.

**Configurable backups**: Customers can configure backups to happen at a higher frequency, up to every 6 hours, to improve the RPO. Customers can also configure longer retention.

## Restoring from a Backup {#restoring-from-a-backup}

- Default backups, in the ClickHouse Cloud bucket, can be restored to a new service in the same region.
- External backups (in customer object storage) can be restored to a new service in the same or different region.

> **NOTE**: There is currently NO support for automatic failover between 2 ClickHouse Cloud instances whether in the same or different region.

> **NOTE**: There is currently NO automatic syncing of data between different ClickHouse Cloud services in the same or different regions .i.e. Active-Active replication

## Recovery Process {#recovery-process}

This section explains the various recovery options and the process that can be followed in each case.

### Primary Service Data Corruption {#primary-service-data-corruption}

In this case the data can be restored from the backup to another service in the same region. The backup could be up to 24 hours old if using the default backup policy, or up to 6 hours old (if using configurable backups with 6 hours frequency).

### Primary Region Downtime {#primary-region-downtime}

Customers in the Enterprise Tier can export backups to their own cloud provider bucket. If you are concerned about regional failures, we recommend exporting backups to a different region. Keep in mind that cross-region data transfer charges will apply.

If the primary region goes down, the backup in another region can be restored to a new service in a different region.

Once the backup has been restored to another service, you will need to ensure that any DNS, load balancer, or connection string configurations are updated to point to the new service. This may involve:

- Updating environment variables or secrets
- Restarting application services to establish new connections

> **NOTE**: Backup / restore to an external bucket is currently not supported for services utilizing Transparent Data Encryption (TDE).

## Additional Options {#additional-options}

There are some additional options to consider.

**Dual-writing to separate clusters**: In this option, you can set up 2 separate clusters in different regions and dual-write to both. This option of course comes with a higher cost as it involves running multiple clusters but provides higher availability in case of one region being unavailable.

**Utilize CSP replication**: With this option you would utilize the cloud service provider's native object storage replication to copy data over. For instance, with BYOB you can export the backup to a bucket that you own in the primary region, and have that replicated over to another region using AWS cross region replication.