---
slug: /cloud/managed-postgres/upgrades
sidebar_label: 'Upgrades'
title: 'Upgrades'
description: 'How PostgreSQL version upgrades work in ClickHouse Managed Postgres'
keywords: ['managed postgres upgrades', 'postgres version', 'minor upgrade', 'major upgrade', 'maintenance window']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="upgrades" />

Managed Postgres handles PostgreSQL version upgrades to keep your instances secure and up to date. Both minor and major version upgrades are supported with minimal disruption.

## Minor version upgrades {#minor-version-upgrades}

Minor version upgrades (e.g., 16.4 to 16.5) include bug fixes and security patches. These are performed via failover and typically result in only a brief disconnect, often lasting just a few seconds.

For instances with [standbys](/cloud/managed-postgres/high-availability) enabled, the upgrade is applied to the standby first, followed by a failover to minimize downtime.

## Major version upgrades {#major-version-upgrades}

Major version upgrades (e.g., 16.x to 17.x) also involve only a few seconds of downtime, following a similar failover-based approach.

## Maintenance windows {#maintenance-windows}

Managed Postgres supports maintenance windows so that upgrades and other maintenance operations can be scheduled at a time that's least disruptive to your workload. UI support for configuring maintenance windows is coming soon. In the meantime, contact [support](https://clickhouse.com/support/program) to set up a maintenance window for your instance.
