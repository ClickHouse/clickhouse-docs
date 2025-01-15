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

- Cost-effective option that supports single-replica deployments.
- Ideal for departmental use cases with smaller data volumes that do not have hard reliability guarantees.

:::note
Basic tier services are meant to be fixed in size and do not allow scaling, both automatic and manual. 
Users can upgrade to the Scale or Enterprise tier to scale their services.
:::

## Scale

Designed for workloads requiring enhanced SLAs (2+ replica deployments), scalability, and advanced security.

- Offers support for features such as: 
  - [PrivateLink support](../security/private-link-overview.md).
  - [Compute-compute separation](../reference/warehouses#what-is-compute-compute-separation).
  - [Flexible scaling](../manage/scaling.md) options (scale up/down, in/out).

## Enterprise

Caters to large-scale, mission critical deployments that have stringent security and compliance needs.

- Everything in Scale, **plus**
- Flexible scaling: standard profiles (1:4 vCPU:memory ratio), as well as highMem (1:8 ratio) and highCPU (1:2 ratio) custom profiles.
- Provides the highest levels of performance and reliability guarantees.
- Supports enterprise-grade security:
  - Single Sign On(SSO)
  - Enhanced Encryption: For AWS and GCP services. Services are encrypted by our key by default and can be rotated to their key to enable Customer Managed Encryption Keys (CMEK).
- Allows Scheduled upgrades: Users can select the day of the week/time window for upgrades, both database and cloud releases.  
- Offers [HIPAA](../security/compliance-overview.md/#hipaa) Compliance.
- Exports Backups to the user's account.

## Upgrading to a different tier

You can always upgrade self-serve from Basic to Scale or from Scale to Enterprise.

:::note
Downgrading of tiers is not possible.
:::

---

If you have any questions about service types, please see the [pricing page](https://clickhouse.com/pricing) or contact support@clickhouse.com.
