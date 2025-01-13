---
sidebar_label: Service Types
slug: /en/cloud/manage/service-types
title: Service Types
---

# Service Types

There are several service types available in ClickHouse Cloud. This page discusses which service type is right for your specific use case. It is possible to have different services in your ClickHouse Cloud organization, each of which has its own specified service type.

**Summary of service types:**

|                     | Basic                                             | Scale                                                                | Enterprise                                                                                   |
|:--------------------|:--------------------------------------------------|:---------------------------------------------------------------------|:---------------------------------------------------------------------------------------------|
| **Use case**        | For new ideas or starter projects.                | For production environments or data at scale.                        | For working with production environments, very large data at scale, or enterprise use cases. |
| **Storage**         | Up to 1TB                                         | Unlimited                                                            | Unlimited                                                                                    |
| **Memory**          | 8-12 GiB total memory                             | configurable memory                                                  | configurable memory                                                                          |
| **Compute**         | Burstable CPU                                     | Dedicated CPU                                                        | Custom hardware profiles (HighMemory and HighCPU)                                            |
| **Backups**         | Every 24h, retained for 1 day                     | Every 24h, retained for 1 day                                        | Every 24h, retained for 1 day                                                                |
| **Upgrades**        | Automatic                                         | Automatic                                                            | Schedulable                                                                                  |
| **SLA and support** | Expert support with 1 business day response time. | Expert support with 1 hour response time 24x7 for Severity 1 issues. | Enterprise support with 30 min response time for Severity 1 issues.                          |

## Basic

Basic tier services are designed for smaller workloads, new ideas or starter projects. They are the lowest-cost option in ClickHouse Cloud. Though at a lower price than our other service types, `Basic` services are still designed for high reliability across a single availability zone.

**Limitations**

Basic tier services do not support autoscaling. They are meant to be fixed in size and do not allow automatic and manual scaling. Users can upgrade to the Scale or Enterprise tier to scale their services

The underlying storage for Basic tier services may be throttled to prevent system overload. Workloads with continuous inserts will be limited to 4 inserts per second per node. Temporary bursts of inserts are allowed at higher rate.

[**Experimental**](/docs/en/beta-and-experimental-features#experimental-features) features are not allowed on ClickHouse Cloud as they can be unstable or cause services to function abnormally or crash. Some [**Beta**](/docs/en/beta-and-experimental-features) features are available on ClickHouse Cloud – **Beta** indicates that the feature is actively moving towards **General Availability ("GA")**.

:::note
Basic tier services are not supported for Azure.
:::

## Scale

Scale tier services are designed for production environments, working with data at scale or for professional use cases. They offer advanced features compared to the Basic tier service, including automatic vertical scaling, AWS Private Link support, and S3 role-based access.

Scale tier services automatically scale to handle workload and traffic variability. Scale tier services are the most common service type for most startup and enterprise use cases.

## Enterprise

Enterprise services are designed for enterprise workloads with strict isolation and latency requirements. They have highly customizable compute and memory configurations; these services are tailored exactly to your application’s needs.

Enterprise services are best for enterprises with workloads that support high-traffic customer-facing applications or that serve mission-critical internal usage.


## Upgrading to a different tier

You can always upgrade self-serve from Basic to Scale or from Scale to Enterprise.

:::note
Downgrading of tiers is not possible.
:::

---

If you have any questions about service types, please see the [pricing page](https://clickhouse.com/pricing) or contact support@clickhouse.com.
