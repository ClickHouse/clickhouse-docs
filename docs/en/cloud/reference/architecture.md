---
sidebar_label: Architecture
slug: /en/cloud/reference/architecture
---

# ClickHouse Cloud Architecture

![ClickHouse Cloud architecture](@site/docs/en/cloud/reference/images/architecture.svg)

## Storage backed by object store
- Virtually unlimited storage
- No need to manually share data
- Significantly lower price point for storing data, especially data that is accessed less frequently

## Compute
- Automatic scaling and idling: No need to size up front, and no need to over-provision for peak use
- Automatic idling and resume: No need to have unused compute running while no one is using it
- Secure and HA by default

## Administration
- Setup, monitoring, backups, and billing are performed for you.
- Cost controls are enabled by default, and can be adjusted by you through the Cloud console.

## Service isolation

### Network isolation

All services are isolated at the network layer.

### Compute isolation

`Production` and `Developer` services are deployed in separate pods in their respective Kubernetes spaces, with network level isolation. `Dedicated` services are run in dedicated VMs with their own Kubernetes operators.

### Storage isolation

All services use a separate subpath of a shared bucket. Access to storage is controlled via AWS IAM, and each IAM role is unique per service. GCP services, in particular, have object storage isolation (all services have their own buckets). For `Production` and `Dedicated` services, [CMEK](/docs/en/cloud/manage/cmek) can be enabled to provide advanced data isolation at rest.
Note: CMEK is only supported for AWS services at this time.

## Concurrency Limits

There is no limit to the number of queries per second (QPS) in your ClickHouse Cloud service. There is, however, a limit of 1000 concurrent queries per replica. QPS is ultimately a function of your average query execution time and the number of replicas in your service.

A major benefit of ClickHouse Cloud compared to a self-managed ClickHouse instance or other databases/data warehouses is that you can easily increase concurrency by [adding more replicas (horizontal scaling)](/docs/en/manage/scaling#adding-more-replicas-horizontal-scaling).


