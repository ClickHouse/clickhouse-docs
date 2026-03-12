---
title: 'Warehouses'
slug: /cloud/reference/warehouses
keywords: ['compute separation', 'cloud', 'architecture', 'compute-compute', 'warehouse', 'warehouses', 'hydra']
description: 'Compute-compute separation in ClickHouse Cloud'
doc_type: 'reference'
---

import compute_1 from '@site/static/images/cloud/reference/compute-compute-1.png';
import compute_2 from '@site/static/images/cloud/reference/compute-compute-2.png';
import compute_3 from '@site/static/images/cloud/reference/compute-compute-3.png';
import compute_4 from '@site/static/images/cloud/reference/compute-compute-4.png';
import compute_5 from '@site/static/images/cloud/reference/compute-compute-5.png';
import compute_7 from '@site/static/images/cloud/reference/compute-compute-7.png';
import compute_8 from '@site/static/images/cloud/reference/compute-compute-8.png';
import Image from '@theme/IdealImage';

# Warehouses

:::note
Compute-compute separation is available for Scale and Enterprise tiers.
:::

## What is compute-compute separation? {#what-is-compute-compute-separation}

ClickHouse Cloud has this concept called **services**. 

Each ClickHouse Cloud service includes:
- ClickHouse compute nodes (referred to as **replicas**) with dedicated CPU and memory clusters
- An endpoint (or multiple endpoints created via ClickHouse Cloud UI console) to connect to the service (for example, `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`) for local and third party app connections 
- An object storage folder where the service stores all the data and partially metadata:


<Image img={compute_1} size="md" alt="One Service in ClickHouse Cloud" />

<br />

_Fig. 1 - One Service in ClickHouse Cloud_

Rather than having just one service, you could create multiple services that have access to the same shared storage, allowing you to dedicate resources to specific workloads without having to duplicate data. This concept is called **compute-compute separation**. 

Compute-compute separation mean each service has its own set of replicas and endpoint, but use the same object storage folder and accesses the same tables, views, etc. This means you can choose the right size compute for your workload. Some of your workloads may be satisfied with only one small-size replica, and others may require full high-availability (HA) and hundreds of gigs of memory on multiple replicas. 

Compute-compute separation also allows you to separate read operations from write operations so they don't interfere with each other:

<Image img={compute_2} size="md" alt="Compute separation in ClickHouse Cloud" />

<br />

_Fig. 2 - compute separation in ClickHouse Cloud_


## What is a warehouse? {#what-is-a-warehouse}

In ClickHouse Cloud, a _warehouse_ is a set of services that share the same data.
Each warehouse has a primary service (this service was created first) and secondary service(s). For example, in the screenshot below you can see a warehouse "DWH Prod" with two services:

- Primary service `DWH Prod`
- Secondary service `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="Warehouse example with primary and secondary services" background='white' />

<br />

_Fig. 3 - Warehouse example_

All services in a warehouse share the same:

- Region (for example, us-east1)
- Cloud service provider (AWS, GCP or Azure)
- ClickHouse database version
- ClickHouse Keeper (for managing replicas)

## Access controls {#access-controls}

### Database credentials {#database-credentials}

Because all in a warehouse share the same set of tables, they also share access controls across services. This means that all database users that are created in Service 1 will also be able to use Service 2 with the same permissions (grants for tables, views, etc), and vice versa. You will use another endpoint for each service but will use the same username and password. In other words, _users are shared across services that work with the same storage:_

<Image img={compute_3} size="md" alt="User access across services sharing same data" />

<br />

_Fig. 4 - user Alice was created in Service 1, but she can use the same credentials to access all services that share same data_

### Network access control {#network-access-control}

A way to restrict access to specific services is to use network restrictions, similar to how it is configured currently for standalone services (navigate to **Settings** in the service tab in the specific service in ClickHouse Cloud console). This is useful to limit usage to services by other applications or ad-hoc users.

You can apply IP filtering setting to each service separately, which means you can control which application can access which service. This allows you to restrict users from using specific services:

<Image img={compute_4} size="md" alt="Network access control settings"/>

<br />

_Fig. 5 - Alice is restricted to access Service 2 because of the network settings_

ClickHouse roles and grants can also be applied here to control access to the data when users are connecting as an individual (as opposed to the _default_ user). 

### Read vs read-write {#read-vs-read-write}

Services can be either **read-write** or **read=only**. Writing in this case refers to being able to write to ClickHouse. Both service types can write to external apps. Sometimes it is useful to restrict write access to a specific service and allow writes to Clickhouse only by a subset of services in a warehouse. This can be done when creating the second and nth services (the first service will always be read-write):

<Image img={compute_5} size="lg" alt="Read-write and Read-only services in a warehouse"/>

<br />

_Fig. 6 - Read-write and Read-only services in a warehouse_

:::note
1. Read-only services currently supports user management operations (create, drop, etc).
2. Refreshable materialized views run **only** on read-write (RW) services in a warehouse. 
:::

## Scaling {#scaling}

Each service in a warehouse can be adjusted to your workload in terms of:
- Number of nodes (replicas). The primary service (the service that was created first in the warehouse) should have 2 or more nodes. Each secondary service can have 1 or more nodes.
- Size of nodes (replicas)
- If the service should scale automatically (horizontally and vertically)
- If the service should be idled on inactivity

## Changes in behavior {#changes-in-behavior}
Once compute-compute is enabled for a service (at least one secondary service was created), the `clusterAllReplicas()` function call with the `default` cluster name will access replicas from the service where it was called. 
If there are two services are in the same warehouse, and `clusterAllReplicas(default, system, processes)` is called from service 1, only processes running on service 1 will be shown. 
You can still call `clusterAllReplicas('all_groups.default', system, processes)` to reach all replicas in the warehouse. 


:::note
Child single services can scale vertically unlike single parent services.
:::


## Limitations {#limitations}

### Workload Isolation Limitations

 Some workloads can't be isolated to specific services; there are edge cases where one workload in one service will affect another service in the warehouse. These include:

-  **All read-write services handle background merge operations by default.** When inserting data to ClickHouse, the database at first inserts the data to some staging partitions, and then performs merges in the background. These merges can consume memory and CPU resources. When two read-write services share the same storage, they both are performing background operations. That means that there can be a situation where there is an `INSERT` query in Service 1, but the merge operation is completed by Service 2. 
Note that read-only services don't execute background merges, thus they don't spend their resources on this operation. Our support has the ability to turn off merges on a service.

- **All read-write services are performing S3Queue table engine insert operations.** When creating a S3Queue table on a read/write service, all other read/write services on the warehouse may perform reading data from S3 and writing data to the database.

- **Inserts on one read-write service can prevent another read-write service from idling if idling is enabled.** There are situations where
 one service performs background merge operations for another service. Those background operations can prevent the second service from idling. Once the background operations are finished, the service will idled. Read-only services aren't affected.

### Helpful Callouts {#callouts}

- **CREATE/RENAME/DROP DATABASE queries could be blocked by idled/stopped services by default.** If these queries are executed when the service is idled or stopped, these queries can hang. To bypass this, you  can run database management queries with `settings distributed_ddl_task_timeout=0` at the session or per query level.

For example:

```sql
CREATE DATABASE db_test_ddl_single_query_setting
SETTINGS distributed_ddl_task_timeout=0
```
If you manually stop a service you will need to start it up again in order for queries to be executed. 

- **Currently there is a soft limit of 5 services per warehouse.** Contact the support team if you need more than 5 services in a single warehouse.

- **Primary services cannot have only one replica** While secondary services can have one replica, the primary service must have at least 2. 

- **Primary service idling** Today, the default behavior is that the primary service cannot auto-idling. It is disabled once the secondary service is created. To enable this, contact support to enable parent service idling. Parent service auto-idling will be enabled by default in Q2 2026 (existing services will have access to the feature, new services will have it enabled by default). 

## Pricing {#pricing}

Compute prices are the same for all services in a warehouse (primary and secondary). Storage is billed only once - it is included in the first (original) service.

Please refer to the pricing calculator on the [pricing](https://clickhouse.com/pricing) page, which will help estimate the cost based on your workload size and tier selection. The Usage Breakdown table will show you the breakdown of compute costs across services. 

## Backups {#backups}

- As all services in a single warehouse share the same storage, backups are made only on the primary (initial) service. By this, the data for all services in a warehouse is backed up.
- If you restore a backup from a primary service of a warehouse, it will be restored to a completely new service, not connected to the existing warehouse. You can then add more services to the new service immediately after the restore is finished.

## How to set up a warehouse {#setup-warehouses}

### Creating a warehouse {#creating-a-warehouse}

To create a warehouse, you need to create a second service that will share the data with an existing service. This can be done by clicking the plus sign on any of the existing services:

<Image img={compute_7} size="md" alt="Creating a new service in a warehouse" border background='white' />

<br />

_Fig. 7 - Click the plus sign to create a new service in a warehouse_

On the service creation screen, the original service will be selected in the dropdown as the source for the data of the new service. Once created, these two services will form a warehouse.

### Renaming a warehouse {#renaming-a-warehouse}

There are two ways to rename a warehouse:

- You can select "Sort by warehouse" on the services page in the top right corner, and then click the pencil icon near the warehouse name
- You can click the warehouse name on any of the services and rename the warehouse there

### Deleting a warehouse {#deleting-a-warehouse}

Deleting a warehouse means deleting all the compute services and the data (tables, views, users, etc.). This action can't be undone.
You can only delete a warehouse by deleting the first service created. To do this:

1. Delete all the services that were created in addition to the service that was created first;
2. Delete the first service (warning: all warehouse's data will be deleted on this step).
