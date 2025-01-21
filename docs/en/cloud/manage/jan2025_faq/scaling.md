---
title: Scaling
slug: /en/cloud/manage/jan-2025-faq/scaling
keywords: [new pricing, faq, scaling]
description: Scaling behavior in new pricing tiers
---

ClickHouse Cloud allows scaling in both directions - vertical (increasing replica size) and horizontal (adding more replicas).

## What scaling options will be available for each tier?

The scaling behavior per tier is as follows:

* **Basic**: Basic tier supports only single replica services. These services are meant to be fixed in size and do not allow vertical or horizontal scaling. Users can upgrade to the Scale or Enterprise tier to scale their services.
* **Scale**: Scale tier supports single and multi-replica services. Scaling will be permitted for Multi-replica services. 
    * Services can vertically scale to the maximum replica size supported for a CSP/region AFTER they have scaled to a multi-replica setup; only 2+ replicas can be vertically scaled.
    * Manual horizontal scaling will be available. 
* **Enterprise**: Enterprise tier supports single and multi-replica services, and scaling will be permitted for Multi-replica services 
    * Services can vertically scale to maximum replica sizes supported for a CSP/region.
        * Standard profiles (1:4 CPU to memory ratio) will support vertical auto-scaling
        * Custom profiles (`highMemory` and `highCPU`) can be scaled vertically through a support ticket.
    * Manual horizontal scaling will be available.

:::note
Services can scale horizontally to a maximum of 20 replicas. If you need additional replicas, please contact our support team.
:::

## Can users scale in their service?

Scaling in will be restricted to 2+ replicas. Once scaled out, users will not be permitted to scale down to a single replica, as this may result in instability and potential data loss.

## Are there any changes related to the Scaling behavior with the new tiers?
We are introducing a new mechanism for vertical scaling of compute replicas, a concept we call “make before break” (or MBB). With this new approach, we add replica(s) of a new size before removing the old one(s) during the scaling operation. This results in more seamless scaling operations that are less disruptive to running workloads, because no capacity is lost during scaling. It is especially important during scale-up events as it is triggered by high resource utilization and removing replicas will make it worse.

*Please note that as part of this change, historical system table data will be retained for up to a maximum of 30 days as part of scaling events. In addition, any system table data older than December 19, 2024 for services on AWS or GCP, and older than January 14, 2025 for services on Azure will not be retained as part of the migration to the new organization tiers.*
