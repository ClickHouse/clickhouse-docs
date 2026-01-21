---
slug: /cloud/managed-postgres/quickstart
sidebar_label: 'Quickstart'
title: 'Quickstart'
description: 'Create your first Managed Postgres database and explore the instance dashboard'
keywords: ['managed postgres', 'quickstart', 'getting started', 'create database']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge/>

## Create a database {#create-database}

To create a new Managed Postgres database, navigate to the PostgreSQL option in the Cloud Console sidebar.

{/* TODO(kaushik-ubi): Screenshot of Cloud Console sidebar with PostgreSQL option highlighted
    Path: /static/images/cloud/managed-postgres/console-sidebar.png */}

Click **New PostgreSQL database** to open the configuration page. Enter a name for your database server and select an instance type based on your workload requirements. A secure password will be automatically generated for you.

{/* TODO(kaushik-ubi): Screenshot of create database form
    Path: /static/images/cloud/managed-postgres/create-database.png */}

After selecting your instance type, click **Create**. Your Managed Postgres instance will be provisioned and ready for use in a few minutes.

## Instance overview {#instance-overview}

The instance overview page provides a comprehensive view of your PostgreSQL instance's current state, including status and health indicators, instance type and resource configuration, location and availability zone details, high availability setup, and real-time CPU and disk usage metrics.

{/* TODO(kaushik-ubi): Screenshot of instance overview dashboard
    Path: /static/images/cloud/managed-postgres/instance-overview.png */}

From this page, you can access [connection details](/cloud/managed-postgres/connection), configure [high availability](/cloud/managed-postgres/high-availability) options, manage [read replicas](/cloud/managed-postgres/read-replicas), and monitor your database's performance over time.

## Availability {#availability}

Managed Postgres is currently available on AWS in 10 regions with over 50 NVMe-backed configurations, ranging from 2 vCPUs with 8 GB RAM and 118 GB storage to 96 vCPUs with 768 GB RAM and 60 TB storage. Support for GCP and Azure is planned.

The service includes built-in [PgBouncer](/cloud/managed-postgres/connection#pgbouncer) for connection pooling, major version upgrades, and all standard managed service features.
