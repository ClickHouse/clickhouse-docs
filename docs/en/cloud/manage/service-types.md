---
sidebar_label: Service Types
slug: /en/cloud/manage/service-types
title: Service Types
---

# Service Types

There are several service types available in ClickHouse Cloud. This page discusses which service type is right for your specific use case. It is possible to have different services in your ClickHouse Cloud organization, each of which has its own specified service type.

**Summary of service types:**

|  | Development | Production | Dedicated |
|:---------|:-----|:---------|:---------|
|**Use case**|Small workloads, prototypes|Medium-sized workloads, customer-facing applications|Applications with strict latency and isolation requirements that need extensive customization|
|**Storage**|Up to 1TB|Unlimited|Unlimited|
|**Memory**|16 GiB|24GiB+|Unlimited|
|**Compute**|Burstable CPU|Dedicated CPU|Custom compute options|
|**Backups**|Every 24h, retained for 1 day|Every 24h, retained for 2 days|Custom backup retention|
|**Upgrades**|Automatic|Automatic|Schedulable|
|**SLA and support**|24-hour response time|1-hour response time|Custom SLAs, assigned lead support engineer|

## Development

`Development` services are designed for smaller workloads and starter projects. They are the lowest-cost option in ClickHouse Cloud. Though at a lower price than our other service types, `Development` services are still designed for high reliability and are replicated across two availability zones.

`Development` services do not support autoscaling. `Development` services are best for internal projects and prototypes, and for developers just trying out ClickHouse.

## Production

`Production` services are designed for customer-facing applications and medium-sized workloads. They offer advanced features compared to `Development` services, including automatic scaling, AWS Private Link support, and S3 role-based access.

`Production` services automatically scale to handle workload and traffic variability. `Production` services are the most common service type for most startup and enterprise use cases.

## Dedicated

`Dedicated` services are designed for enterprise workloads with strict isolation and latency requirements. They have highly customizable compute and memory configurations; these services are tailored exactly to your application’s needs.

`Dedicated` services are best for enterprises with workloads that support high-traffic customer-facing applications or that serve mission-critical internal usage.

---

If you have any questions about service types, please see the [pricing page](https://clickhouse.com/pricing) or contact support@clickhouse.com.
