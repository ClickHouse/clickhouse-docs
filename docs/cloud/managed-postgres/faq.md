---
slug: /cloud/managed-postgres/faq
sidebar_label: 'FAQ'
title: 'Managed Postgres FAQ'
description: 'Frequently asked questions about ClickHouse Managed Postgres'
keywords: ['managed postgres faq', 'postgres questions', 'metrics', 'extensions', 'migration', 'terraform']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="faq" />

## Monitoring and metrics {#monitoring-and-metrics}

### How can I access metrics for my Managed Postgres instance? {#metrics-access}

You can monitor CPU, memory, IOPS, and storage usage directly from the ClickHouse Cloud console in the **Monitoring** tab of your Managed Postgres instance.

:::note
Query Performance Insights for detailed query analysis is coming soon.
:::

## Backup and recovery {#backup-and-recovery}

### What backup options are available? {#backup-options}

Managed Postgres includes automatic daily backups with continuous WAL archiving, enabling point-in-time recovery to any moment within a 7-day retention window. Backups are stored in S3.

For complete details on backup frequency, retention, and how to perform point-in-time recovery, see the [Backup and restore](/cloud/managed-postgres/backup-and-restore) documentation.

## Infrastructure and automation {#infrastructure-and-automation}

### Is Terraform support available for Managed Postgres? {#terraform-support}

Terraform support for Managed Postgres isn't currently available. We recommend using the ClickHouse Cloud console to create and manage your instances.

## Extensions and configuration {#extensions-and-configuration}

### What extensions are supported? {#extensions-supported}

Managed Postgres includes 100+ PostgreSQL extensions, including popular ones like PostGIS, pgvector, pg_cron, and many more. For the complete list of available extensions and installation instructions, see the [Extensions](/cloud/managed-postgres/extensions) documentation.

### Can I customize PostgreSQL configuration parameters? {#config-customization}

Yes, you can modify PostgreSQL and PgBouncer configuration parameters through the **Settings** tab in the console. For details on available parameters and how to change them, see the [Settings](/cloud/managed-postgres/settings) documentation.

:::tip
If you need a parameter that isn't currently available, contact [support](https://clickhouse.com/support/program) to request it.
:::

## Database capabilities {#database-capabilities}

### Can I create multiple databases and schemas? {#multiple-databases-schemas}

Yes. Managed Postgres provides full native PostgreSQL functionality, including support for multiple databases and schemas within a single instance. You can create and manage databases and schemas using standard PostgreSQL commands.

### Is role-based access control (RBAC) supported? {#rbac-support}

You have full superuser access to your Managed Postgres instance, which allows you to create roles and manage permissions using standard PostgreSQL commands.

:::note
Enhanced RBAC features with console integration are planned for this year.
:::

## Upgrades {#upgrades}

### How are PostgreSQL version upgrades handled? {#version-upgrades}

Both minor and major version upgrades are performed via failover and typically result in only a few seconds of downtime. You can configure a maintenance window to control when upgrades are applied. For complete details, see the [Upgrades](/cloud/managed-postgres/upgrades) documentation.

## Migration {#migration}

### What tools are available for migrating to Managed Postgres? {#migration-tools}

Managed Postgres supports several migration approaches:

- **pg_dump and pg_restore**: For smaller databases or one-time migrations. See the [pg_dump and pg_restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) guide.
- **Logical replication**: For larger databases requiring minimal downtime. See the [Logical replication](/cloud/managed-postgres/migrations/logical-replication) guide.
- **PeerDB**: For CDC-based replication from other Postgres sources. See the [PeerDB migration](/cloud/managed-postgres/migrations/peerdb) guide.

:::note
A fully managed migration experience is coming soon.
:::
