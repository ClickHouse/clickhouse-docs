---
title: Compute-Compute Separation
slug: /en/cloud/reference/compute-compute-separation
keywords: [compute separation, cloud, architecture, compute-compute]
description: Use ClickHouse Cloud with multiple, separated node groups
---

# Compute-Compute Separation (Private Preview)

## What is Compute-Compute Separation?

Each ClickHouse Cloud service includes:
- A group of ClickHouse nodes (or replicas) - 2 nodes for a **Development** tier service and 3 nodes for a **Production** tier service
- An endpoint (or multiple endpoints created via ClickHouse Cloud UI console), which is a service URL that you use to connect to the service (for example, `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)
- An object storage folder where the service stores all the data and partially metadata:

<br />

<img src={require('./images/compute-compute-1.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '200px'}}
/>

<br />

_Fig. 1 - current service in ClickHouse Cloud_

Compute-compute separation allows users to create multiple compute node groups, each with its own endpoint, that are using the same object storage folder, and thus, with the same tables, views, etc.

Each compute node group will have its own endpoint so you can choose which set of replicas to use for your workloads. Some of your workloads may be satisfied with only one small-size replica, and others may require full high-availability (HA) and hundreds of gigs of memory. Compute-compute separation also allows you to separate read operations from write operations so they don't interfere with each other:

<br />

<img src={require('./images/compute-compute-2.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '500px'}}
/>

<br />

_Fig. 2 - compute  ClickHouse Cloud_

In this private preview program, you will have the ability to create extra services that share the same data with your existing services, or create a completely new setup with multiple services sharing the same data.

## Access controls

### Database credentials

Because all services that work with the same object storage share the same set of tables, they also share access controls to those other services. This means that all database users that are created in Service 1 will also be able to use Service 2 with the same permissions (grants for tables, views, etc), and vice versa. Users will use another endpoint for each service but will use the same username and password. In other words, _users are shared across services that work with the same storage:_

<br />

<img src={require('./images/compute-compute-3.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '500px'}}
/>

<br />

_Fig. 3 - user Alice was created in Service 1, but she can use the same credentials to access all services that share same data_

### Network access control

It is often useful to restrict specific services from being used by other applications or ad-hoc users. This can be done by using network restrictions, similar to how it is configured currently for regular services (navigate to **Settings** in the service tab in the specific service in ClickHouse Cloud console).

You can apply IP filtering setting to each service separately, which means you can control which application can access which service. This allows you to restrict users from using specific services:

<br />

<img src={require('./images/compute-compute-4.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '400px'}}
/>

<br />

### Read vs read-write

Sometimes it is useful to restrict write access to a specific service and allow writes only by a subset of services that work with the same storage. This can be done when creating the second and nth services (the first service should always be read-write):

<br />

<img src={require('./images/compute-compute-5.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '400px'}}
/>

<br />


## Scaling
Each service connected to the same data set (set of tables, views, etc) can be adjusted to your workloads in terms of:
- Number of nodes (replicas)
- Size of nodes (replicas)
- If the service should scale automatically
- If the service should be idled on inactivity (cannot be applied to the first service in the group - please see the **Limitations** section)

## Limitations

Because this compute-compute separation is currently in private preview, there are some limitations to using this feature. Most of these limitations will be removed once the feature is released to GA (general availability):

1. **Only AWS services supported (limitation will be removed in GA).** GCP and Azure services will support compute-compute separation in GA. If you need compute-compute separation for GCP or Azure services, please contact support.

2. **Services are created manually by the ClickHouse team (limitation will be removed in GA).** Once you are ready to create a service that will access the same data as an existing service, please notify the support team. The ClickHouse team will create such a service and you will see the new service in the cloud console.

Once the feature is released in GA, you will be able to create such services with using the cloud console. During the private preview, cloud console support will be limited, but secondary services will be marked as sub-services:

<br />

<img src={require('./images/compute-compute-6.png').default}
    alt='NEEDS ALT'
    class='image'
    style={{width: '600px'}}
/>

<br />


3. **The original service should be recently created or migrated.** Unfortunately, not all existing services can share their storage with other services. During the last year, we released a few features that the service will need to support (like the Shared Merge Tree engine), so unupdated services will mostly not be able to share their data with other services. This does not depend on ClickHouse version.

    The good news is that we can migrate the old service to the new engine so it can support creating additional services. Reach out to support and we will let you know if your desired service needs to be migrated.

4. **The original service should always be up and should not be idled (limitation will be removed some time after GA).** During the private preview and some time after GA, the first service (usually the existing service that you want to extend by adding other services) needs to be always up and should have the idling setting disabled. If the first service becomes idled or stopped, there is a risk that some changes from the second service will not be represented after the service wakes up (especially `CREATE`/`DROP` databases). By participating in the private preview program, you agree not to idle or stop the original service during the private preview.

5. **Sometimes workloads cannot be isolated.** Though the goal is to give you an option to isolate database workloads from each other, there can be corner cases where one workload in one service will affect another service sharing the same data. These are quite rare situations that are mostly connected to OLTP-like workloads.

6. **All read-write services are doing background merge operations.** When inserting data to ClickHouse, the database at first inserts the data to some staging partitions, and then performs merges in the background. These merges can consume memory and CPU resources. When two read-write services share the same storage, they both are performing background operations. That means that there can be a situation where there is an `INSERT` query in Service 1, but the merge operation is completed by Service 2. Note that read-only services will not complete background merges.

7. **Inserts in one read-write service can prevent another read-write service from idling if idling is enabled.** Because of the previous point, a second service perform background merge operations for the first service. These background operations can prevent the second service from going to sleep when idling. Once the background operations are finished, the service will be idled. Read-only services are not affected and will be idled without delay.

8. **CREATE/RENAME/DROP DATABASE queries could be blocked by idled/stopped services by default (limitation will be removed in GA).** These queries can hang. To bypass this, you  can run database management queries with `settings distributed_ddl_task_timeout=0` at the session or per query level. For example:

```sql
create database db_test_ddl_single_query_setting
settings distributed_ddl_task_timeout=0
```

9. **When performing a DELETE or UPDATE query, all services should be running (not stopped and not idled) (limitation will be removed before GA).** This is because currently [mutations](https://clickhouse.com/docs/en/guides/developer/mutations) are only possible when all relicas are running. Otherwise the database will return an error:

```
Code: 341. DB::Exception: Mutation is not finished because some replicas are inactive right now
```
## Pricing

Extra services created during the private preview are billed as usual. Compute prices are the same for all services connected to the same storage. Storage is billed only once - it is included in the first (original) service.

## What will happen after the private preview program ends

Once the private preview program ends and the compute-compute separation feature is released in GA, your newly created service(s) will be deleted. The original service with all the data will stay in place. At the same time, you will be able to recreate the new service(s) using the cloud console.
