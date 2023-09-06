---
sidebar_position: 1
sidebar_label: Automatic Scaling
slug: /en/manage/scaling
---

# Automatic Scaling

ClickHouse Cloud provides autoscaling for your services. The scaling of ClickHouse Cloud Production services can be adjusted by organization members with the **Admin** role on the service **Settings** page.

:::note
Autoscaling only applies to Production services. Development services do not support autoscaling. You may upgrade your service from Development to Production to enable autoscaling.
:::

<img alt="Scaling settings page" style={{width: '450px', marginLeft: 0}} src={require('./images/AutoScaling.png').default} />

## Adjusting total memory for your services (vertical scaling)

Depending on your queries and use case, your services may require more or less memory.

In the settings page, you can set the minimum and maximum **Total memory**. The compute allocated to your service scales linearly with its allocated memory.

Each replica in your service will be allocated the same memory and CPU resources.

:::tip A tip before setting total memory
Generally, the amount of **total memory** needed by your service cannot be determined until after a few days of monitoring your service with normal use.  We recommend waiting a few days before setting the minimum and maximum memory settings, and adjust as needed based on how your queries are performing.
:::

## Adding more replicas (horizontal scaling)

By default, Production services operate with 3 replica across 3 different availability zones. For applications that have higher concurrency or performance requirements, it is possible to horizontally scale your service by increasing the number of replicas for that service. If you would like to request more replicas for your service, please contact support@clickhouse.com.

## Automatic idling

In the settings page, you can choose whether or not to allow automatic idling of your service when it is inactive (i.e. when the service is not executing any user-submitted queries). Automatic idling reduces the cost for your service as you are not billed for compute resources when the service is paused.

:::danger When not to use automatic idling
Use automatic idling only if your use case can handle a delay before responding to queries, because when a service is paused, connections to the service will time out.  Automatic idling is ideal for services that are used infrequently and where a delay can be tolerated. It is not recommended for services that power customer-facing features that are used frequently.
:::
