---
title: 'Summary'
slug: /cloud/manage/jan-2025-faq/summary
keywords: ['new tiers', 'packaging', 'pricing faq', 'summary']
description: 'Summary of New ClickHouse Cloud Tiers'
---

The following FAQ summarizes common questions with respect to new tiers introduced in ClickHouse Cloud starting in January 2025.

## What has changed with ClickHouse Cloud tiers? \{#what-has-changed-with-clickhouse-cloud-tiers}

At ClickHouse, we are dedicated to adapting our products to meet the ever-changing requirements of our customers. Since its introduction in GA over the past two years, ClickHouse Cloud has evolved substantially, and we've gained invaluable insights into how our customers leverage our cloud offerings. 

We are introducing new features to optimize the sizing and cost-efficiency of ClickHouse Cloud services for your workloads. These include compute-compute separation, high-performance machine types, and single-replica services. We are also evolving automatic scaling and managed upgrades to execute in a more seamless and reactive fashion.

We are adding a new Enterprise tier to serve the needs of the most demanding customers and workloads, with focus on industry-specific security and compliance features, even more controls over underlying hardware and upgrades, and advanced disaster recovery features. 

You can read about these and other functional changes in this [blog](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings). 

## What action is required? \{#what-action-is-required}

To support these changes, we are restructuring our current tiers to more closely match how our evolving customer base is using our offerings, and you need to take action to select a new plan. 

Details and timelines for making these selections are described below. 

## How are tiers changing? \{#how-are-tiers-changing}

We are transitioning from a model that organizes paid tiers purely by "service types" which are delineated by both capacity and features (namely, these are Development, Production, and Dedicated tiers) to one that organizes paid tiers by feature availability. These new tiers are called Basic, Scale, and Enterprise and are described in more detail below. 

This change brings several key benefits:

* **Consistent Feature Access**: Features present in a tier will be available in that tier for all sizes of services, as well as in all tiers above it. For example, private networking, previously available only for Production service types, will now be accessible for all services starting with the Scale tier, so you can deploy it for services sized both for development and production workloads as you see fit.

* **Organizational-Level Features**: We can now provide features built at an organizational level with the appropriate plan, ensuring that customers receive the tools they need at the right level of service. For example, access to SSO (single-sign-on) and CMEK (customer-managed encryption keys) will be available at the Enterprise tier. 

* **Optimized Support Plans**: The new packaging structure also allows us to align support response times with paid tiers, which more effectively meet the needs of our diverse customer base. For example, we are now making named support engineers available to our Enterprise tier customers.

Below we provide an overview of the new tiers, describe how they relate to use cases, and outline key features. 

**Basic: A taste of ClickHouse**

* Basic tier is designed to offer a budget-friendly option for organizations with smaller data volumes and less demanding workloads. It allows you to run single-replica deployments with up to 12GB of memory and \< 1TB of storage and is ideal for small-scale use cases that do not require reliability guarantees.

**Scale: Enhanced SLAs and scalability**

* Scale tier is suitable for workloads that require enhanced SLAs, greater scalability, and advanced security measures.
* It offers unlimited compute and storage with any replication factor, access to compute-compute separation, and automatic vertical and horizontal scaling.
* Key features include:
  * Support for private networking, customized backup controls, multi-factor auth, and more
  * Compute-compute separation for optimized resource usage
  * Flexible scaling options (both vertical and horizontal) to meet changing demands

**Enterprise: Mission-critical deployments**

* Enterprise tier is the best place to run large-scale, mission-critical ClickHouse deployments. 
* It is best suited for organizations with stringent security and compliance needs, requiring the highest levels of performance and reliability.
* Key features include:
  * Industry-specific compliance certifications, such as HIPAA
  * Self-service access to SSO (Single Sign-On) and CMEK (Customer Managed Encryption Keys)
  * Scheduled upgrades to ensure minimal disruption
  * Support for custom configurations, including high-memory, high-CPU options, and private regions

New tiers are described in more detail on our [website](https://clickhouse.com/pricing).

## How is pricing changing? \{#how-is-pricing-changing}

In addition to evolving our paid tiers, we are making the following adjustments to our overall pricing structure and price points:

* **Storage**: Storage price per TB will be reduced and will no longer bundle backups in the storage cost. 
* **Backups**: Backups will be charged separately, with only one backup being mandatory.
* **Compute**: Compute costs will increase, varying by tier and region. This increase may be balanced by the introduction of compute-compute separation and single-replica services, which allow you to optimize compute usage by deploying and right-sizing services tailored to different workload types. 
* **Data Transfer**: We are introducing charges for data egress, specifically for data transfer over the internet and cross region. Based on our analysis, most customers will not see a substantial increase in their monthly bill based on this new dimension. 
* **ClickPipes**: Our managed ingest service, which was offered for free during the introductory period, will now incur charges based on compute and ingested data. Based on our analysis, most customers will not see a substantial increase in their monthly bill based on this new dimension. 

## When will these changes take effect? \{#when-will-these-changes-take-effect}

While changes are effective immediately for new customers, existing customers will have from 6 months to a year to transition to new plans. 

Detailed breakdown of effective dates is below:

* **New Customers**: The new plans will take effect on **January 27, 2025** for new customers of ClickHouse Cloud. 
* **Existing PAYG Customers**: Pay-as-you-go (PAYG) customers will have 6 months until **July 23, 2025** to migrate to new plans.
* **Existing Committed Spend Customers**: Customers with committed spend agreements can renegotiate their terms at the end of their current contract.
* **New usage dimensions** for Data Transfer and ClickPipes are effective for both PAYG and Committed Spend customers 8 weeks following this announcement on **March 24, 2025**. 

## What actions should you take? \{#what-actions-should-you-take}

If you are a **pay-as-you-go (PAYG) customer**, you can migrate to a new plan through the self-service options available in your ClickHouse Cloud console. 

If you are a **committed spend customer**, please reach out to your account representative to discuss your custom migration plan and timeline.

**Need assistance?**
We're here to support you through this transition. If you have any questions or need personalized help, please reach out to your account representative or contact our support team.
