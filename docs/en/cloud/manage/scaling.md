---
sidebar_position: 1
sidebar_label: Automatic Scaling
slug: /en/manage/scaling
---

# Automatic Scaling
Scaling is the ability to adjust available resources to meet client demands. Services can be scaled manually by calling an API programmatically, or changing settings on the UI to adjust system resources. Alternatively, services can be **autoscaled** to meet application demands, which is how ClickHouse Cloud scales services.

:::note
Scaling is only applicable to Production tier services. Development tier services do not scale. You can **upgrade** a service from Development tier to Production in order to scale it.
:::

## How autoscaling works in ClickHouse Cloud
ClickHouse Cloud scales services based on CPU and memory usage. We constantly monitor the historical usage of a service over a lookback window. If the usage falls above or below certain thresholds, we scale the service appropriately to match the demand. The **larger** of the CPU or memory recommendation is picked, and CPU and memory allocated to the service are scaled in lockstep.

### Vertical and Horizontal Scaling
By default, ClickHouse Cloud Production services operate with 3 replicas across 3 different availability zones. Production services can be scaled both vertically (by switching to larger replicas), or horizontally (by adding replicas of the same size). Vertical scaling typically helps with queries that need a large amount of memory for long running inserts / reads, and horizontal scaling can help with parallelization to support concurrent queries.

In the current implementation, vertical autoscaling works well with slow incremental growth in memory and CPU needs, and we are working on improving it to better handle workload bursts. Also, autoscaling currently only scales a service vertically. In order to horizontally scale your service, please contact support@clickhouse.com.

### Configuring vertical auto scaling
The scaling of ClickHouse Cloud Production services can be adjusted by organization members with the **Admin** role.  To configure vertical autoscaling, go to the **Settings** tab on your service details page and adjust the minimum and maximum memory, alongwith CPU settings as shown below.

<img alt="Scaling settings page" style={{width: '450px', marginLeft: 0}} src={require('./images/AutoScaling.png').default} />

Set the **Maximum memory** for your replicas at a higher value than the **Minimum memory**. The service will then scale as needed within those bounds. These settings are also available during the initial service creation flow. Each replica in your service will be allocated the same memory and CPU resources.

You can also choose to set these values the same, essentially pinning the service to a specific configuration. Doing so will immediately force scaling to happen to the desired size you picked. It’s important to note that this will disable any auto scaling on the cluster, and your service will not be protected against increases in CPU or memory usage beyond these settings.

## Automatic Idling
In the settings page, you can also choose whether or not to allow automatic idling of your service when it is inactive as shown in the image above (i.e. when the service is not executing any user-submitted queries).  Automatic idling reduces the cost for your service as you are not billed for compute resources when the service is paused.

:::danger When not to use automatic idling
Use automatic idling only if your use case can handle a delay before responding to queries, because when a service is paused, connections to the service will time out. Automatic idling is ideal for services that are used infrequently and where a delay can be tolerated. It is not recommended for services that power customer-facing features that are used frequently.
:::

## Handling bursty workloads
If you have an upcoming expected spike in your workload, you can use the
[ClickHouse Cloud API](/docs/en/cloud/manage/api/services-api-reference.md) to preemptively scale up your service to handle the spike and scale it down once the demand subsides. To understand the current service size and the number of replicas, you can run the query below:

```
SELECT *
FROM clusterAllReplicas('default', view(
    SELECT
        hostname() AS server,
        getSetting('max_threads') as cpu_cores,
         formatReadableSize(getSetting('max_memory_usage')) as memory
    FROM system.one
))
ORDER BY server ASC
SETTINGS skip_unavailable_shards = 1
```
