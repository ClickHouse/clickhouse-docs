---
title: Pricing and Packaging FAQ
slug: /en/cloud/billing/pricing_packaging_faq
keywords: [faq, pricing, packaging]
description: Use ClickHouse Cloud with multiple, separated node groups
---

The following FAQ addresses common questions with respect to the latest pricing and packaging for ClickHouse Cloud.

## Summary

Historically, ClickHouse pricing was specified at a service level. Services could either be development, production or dedicated.

<img src={require('./images/old_pricing.png').default}    
  className="image"
  alt="Old pricing"
  style={{width: '600px'}} />


The new pricing introduces an tier-based pricing that replaces the existing service-based pricing.


<img src={require('./images/new_pricing.png').default}    
  className="image"
  alt="Old pricing"
  style={{width: '600px'}} />

### Why did this pricing change, and why now?

Since ClickHouse Cloud's inception, our core mission has been to democratize high-performance analytics by making ClickHouse accessible to all users, regardless of their size, scale, or workload complexity.

Since our launch in December 2022, we've diligently gathered feedback and carefully calibrated our offerings to provide maximum value and flexibility to our diverse user base.
This new pricing model is the result of these efforts, strategically addressing key segments of our market with three distinct tiers:

**Basic Tier:** 

- Cost-effective option that supports single-replica services
- Ideal for departmental use cases with smaller data volumes that do not have hard reliability guarantees  

**Scale Tier:**

- Designed for workloads requiring enhanced SLAs (2+ replica services), scalability, and advanced security
- Offers support for features such as PrivateLink support, compute-compute separation, and flexible scaling options (scale up/down, in/out)

**Enterprise Tier:**

- Caters to large-scale, mission-critical deployments that have stringent security and compliance needs
- Supports custom configurations, i.e. High Memory, High CPU,..
- Provides the highest levels of performance and reliability guarantees
- Additionally, it offers compliance certifications - HIPAA

With this change, we are also introducing two new dimensions - data transfer (egress over the internet and cross-region) and Clickpipes.

**PAYG subscriptions need to upgrade before July 23, 2025.**

### Can new organizations launch services on the old (legacy) plan?

No, newly-created organizations will not have access to the old plan after the announcement.

### Can users migrate to the new pricing plan self-serve?

See below for guidance on self-serve migrations:


| Current Plan | New Plan                 | Self Serve Migration                                                                                                                           |
|--------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Development  | Basic                    | Supported if all services in the organization support are Development and the user accepts terms of running in a single replica configuration  |
| Development  | Scale (2 replicas+)      | :heavy_check_mark:                                                                                                                                     |
| Development  | Enterprise (2 replicas+) | :heavy_check_mark:                                                                                                                                          |
| Production   | Scale (3 replicas+)      | :heavy_check_mark:                                                                                                                                          |
| Production   | Enterprise (3 replicas+) | :heavy_check_mark:                                                                                                                                       |
| Dedicated   | Contact Support at support@clickhouse.com
                                                                                                                                       |

### What will be the default service tier for trials?

All trials will be defaulted to "Scale" (3 replicas), which mimics the current default of "Production" (3 replicas). The user has the option to overwrite the default and select "Basic", or "Enterprise" depending on the tier that best suits their needs. 

### Are there changes to the trial experience?

No, there are no changes to the trial. Users will continue to get $300 in trial credits for a 30-day trial.

### Can users start the trial on any of the three tiers?

Yes, trials have access to all three tiers - Basic, Scale, and Enterprise. The default recommended tier is Scale to ensure users have an optimal trial experience, but users can choose other tiers based on preference.

### Can users launch services in different tiers in the same Organization?

No, Organizations are restricted to a single-tier selection. Users can, however, create new organizations and select different tiers.

### Can users claim a trial one per organization?

No, trials are restricted to one per user across organizations (this is an existing restriction, and we are not changing that).

### Can users launch single replica services in all tiers?

Yes, single replica services are supported on all three tiers. Users can scale out, but are not permitted to scale into a single replica.

### What will the experience be for users who have registered an account with ClickHouse Cloud but have not yet started a trial?

All new trials, including those that have registered and do not have a service, will be able to select a tier (Basic, Scale, or Enterprise) and launch service with features based on the organization tier selected.

### What will the experience be for users in trial running Development/Production services?

Users can upgrade during the trial and continue to use the trial credits to evaluate the new service tiers and the features it supports. However, if they choose to continue using the same Development and Production services, they can do so and upgrade to PAYG. They will still have to migrate before July 23, 2025.

### Can users on trial running Development/Production services continue using them by adding a CC and signing up for a PAYG subscription?

Yes, users in a trial running Development/Production services will be able to continue using them at the end of the trial by adding a CC. 

## Scaling and Upgrades

### Can users upgrade their tiers, i.e. Basic → Scale, Scale → Enterprise, etc?

Yes, users can upgrade self-serve and the pricing will reflect the tier selection after upgrade.

### Can users move from a higher to a lower-cost tier, e.g., Enterprise → Scale, Scale → Basic, Enterprise → Basic self-serve?

No, we do not permit downgrading tiers.

### Can users scale in their service?

Scaling in will be restricted to 2+ replicas. Once scaled out, users will not be permitted to scale down to a single replica, as this may result in instability and potential data loss.

### Can users with a Development and Production service in the same Organization move to the Basic Tier?

No, if a user has both Development and Production services in the same organization, they can self-serve and migrate only to the Scale or Enterprise tier.

### What scaling controls - manual and autoscaling are supported for Basic tier services?

Basic tier services are meant to be fixed in size and do not allow automatic and manual scaling. Users can upgrade to the Scale or Enterprise tier to scale their services.

### What scaling controls are supported for Scale tier services?

Currently, ClickHouse Cloud supports vertical autoscaling and self-serve horizontal scaling for Scale tier services. 

### What scaling controls are supported for Enterprise tier services?

- **Horizontal scaling:** Self-serve horizontal scaling will be available on the Enterprise tier.  The maximum number of allowed replicas will be 20. If you need a higher number of replicas, please reach out to our support team.
- **Vertical scaling:**
    - Standard profiles will support vertical auto-scaling.
    - Custom profiles (highMemory and highCPU), will not support vertical autoscaling or self-serve vertical scaling for now. If you need to scale these services vertically, please reach out to our support team.

### Can users with only Development services in the organization migrate to the Basic tier?

Yes, this would be permitted. Users will be given a recommendation based on their past use and can select Basic `1x8GiB` or `1x12GiB`.

### Can users who have Development and Production services in the organization migrate to the Basic tier?

No, users can migrate only to a Scale or Enterprise tier if an organization has both Development and Production services. If they want to migrate to Basic, they should delete all existing Production services.

## Policy Changes

### What are other changes to expect?

- **Backups:** All services now come with one backup, and backups are charged separately (i.e. No longer free). Users can leverage the configurable backup controls to manage additional backups.
- **Private Link/Private Service Connect:** Private connections are now supported for services on Scale and Enterprise tiers. You can set up a private link/private service connect for all services(including single replica services).
- **Enhanced Encryption:** This feature is now available only for Enterprise tier services (including for single replica services) in AWS and GCP. Services are encrypted by our key by default and can be rotated to their key to enable Customer Managed Encryption Keys (CMEK).
- **SSO (Single Sign On):** This feature is now offered only to Enterprise tier users and requires a support ticket to be enabled for an Organization. Users who have multiple Organizations should ensure all of their organizations are on the Enterprise tier to use SSO for each organization.

### Can users on a committed spend agreement with ClickHouse continue to launch services on the old plan?

Yes, users will be able to launch Development and Production services until the end date of their contract, and renewals will reflect the new pricing plan. 

### How will the price changes affect committed spend contracts?

Committed spend contracts will stay on the old plan until the contract ends or when they exhaust their credits. However, if they choose to migrate before one of these events, they can do so by working with their sales representative.

### What happens if users exhaust their credits before the end of the contract and go to PAYG? 

If committed spend contracts exhaust credits before their renewal date, we bill them at the current rates until renewal (as per current policy).

### Can users on a PAYG monthly plan continue to launch services on the old plan? 

Yes, existing PAYG users can continue to launch services (Development and Production services) in the same organization until July 23, 2025. If users do not make a migration selection before, services will be automatically migrated to the scale tier.

## Features and Tier Mapping

### What are the considerations for the Basic tier?

The basic tier is meant for small workloads - users want to deploy a small analytics application that does not require high availability or work on a prototype. This tier is not suitable for workloads that need scale, reliability (DR/HA), and data durability. The tier supports single replica services of fixed size 1x8GiB or 1x12GiB. Please refer to the docs and[ support policy](https://clickhouse.com/support/program) for more information.

### Can users on the Basic tier access Private Link and Private Service Connect?

No, Users will need to upgrade to Scale or Enterprise to access this feature.

### Can users on the Basic and Scale tiers set up SSO for the organization?

No, users will need to upgrade to the Enterprise tier to access this feature.

### Can users scale up/down and add more replicas on the Basic tier?

No, services on this tier are meant to support workloads that are small and fixed size (single replica `1x8GiB` or `1x12GiB`). If users need to scale up/down or add replicas, they will be prompted to upgrade to Scale or Enterprise tiers.

### Can users on the legacy pricing plan access compute-compute separation, i.e., Production/Development?

The feature is not supported for Development services. Users running Production services will have access to the feature selectively. Users will need to log a support ticket, which Sales/Product will review and enable on a case-by-case basis.

### Which tiers on the new pricing plan support compute-compute separation, i.e., Basic/Scale/Enterprise?

Only Scale and Enterprise tiers support compute-compute separation, and the service needs to run on 2+ replicas.

## Enterprise Tier Offering

### What different hardware profiles are supported for the Enterprise tier?

The enterprise tier will support standard profiles (1:4 vCPU:memory ratio), as well as highMem (1:8 ratio) and highCPU (1:2 ratio) **custom profiles,** offering users more flexibility to select the configuration that best suits their needs. The Enterprise Tier will use shared compute resources deployed alongside the Basic and Scale tiers. 

### What are the features exclusively offered on the Enterprise tier?

- **Custom profiles:** Options for instance type selection standard profiles (1:4 vCPU: memory ratio) and highMem (1:8 ratio) and highCPU (1:2 ratio) custom profiles.
- **Enterprise-grade security:**
    - **Single Sign On(SSO**)
    - **Enhanced Encryption:** For AWS and GCP services. Services are encrypted by our key by default and can be rotated to their key to enable Customer Managed Encryption Keys (CMEK).
- **Scheduled upgrades:** Users can select the day of the week/time window for upgrades, both database and cloud releases.  
- **HIPAA Compliance:** The customer must sign a Business Associate Agreement (BAA) through Legal before we enable HIPAA-compliant regions for them.
- **Private Regions:** It is not self-serve enabled and will need users to route requests through Sales.
- **Export Backups** to the customer’s account.

## Billing

### Are there any changes to how usage is metered and charged?

The per-dimension unit cost for compute and storage has changed, and there are two additional dimensions to account for data transfer and ClickPipes usage.

Some notable changes:

- Storage cost will no longer include backups (we will charge for them separately and will make only one backup required). As a result, storage will be lower than it is today. Storage costs are the same across tiers and vary by region and cloud service provider. 
- Compute costs will vary by tier, region, and cloud service provider.
- The new pricing dimension for data transfer is applicable for data egress across regions and on the public internet only. 
- New pricing dimension for ClickPipes usage. 

### How does the billing system handle scenarios when users migrate from one plan to another (legacy to new) during a trial?

For users on trial, they can self-serve to migrate to their plan of choice, and the trial credits used after the change will reflect the new pricing plan.

### What happens to users with existing committed spend contracts?

Users with active committed spend contracts will not be affected by the new pricing changes until their contract expires. The existing terms and pricing will remain in effect for the duration of the contract.

If you need to modify your contract or have questions about how these changes might affect you in the future, please contact our support team or your sales representative.

### What happens to users on the monthly PAYG?

Users on a monthly PAYG plan will continue to be billed using the old pricing plan for the Development and Production services. They have until July 23, 2025, to migrate to the new plan self-serve, or they will all be migrated to the Scale configuration on this day and billed based on the new plan.

## Data Transfer Pricing

:::note
Data transfer and Clickpipes pricing will not apply to legacy plans, i.e. Development and Production, till 24 March.
:::

### How are users charged for data transfer, and will this vary across organization tiers and regions?

- Users will pay for data transfer along two dimensions — public internet egress and inter-region egress. There are no charges for intra-region data transfer or Private Link/Private Service Connect use and data transfer. However, we reserve the right to implement additional data transfer pricing dimensions if we see usage patterns that impact our ability to charge users appropriately.
- Data transfer pricing will vary by Cloud Service Provider (CSP) and region.
- Data transfer pricing will **not** vary between organizational tiers.
- Public egress pricing is based only on the origin region. Inter-region (or cross-region) pricing depends on both the origin and destination regions.

The table below shows how data transfer charges for egress vary across public internet or cross-region by cloud provider and region.

**AWS**

<table style={{ textAlign: 'center' }}>
    <thead >
        <tr>
            <th>Cloud Provider</th>
            <th>Region</th>
            <th>Public Internet Egress</th>
            <th>Same region</th>
            <th>Cross-region</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>`AWS`</td>
            <td>`ap-northeast-1`</td>
            <td>`$0.1440`</td>
            <td>`$0.0000`</td>
            <td>`$0.1152`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-south-1`</td>
            <td>`$0.1384`</td>
            <td>`$0.0000`</td>
            <td>`$0.1104`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-southeast-1`</td>
            <td>`$0.1512`</td>
            <td>`$0.0000`</td>
            <td>`$0.1152`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-southeast-2`</td>
            <td>`$0.1440`</td>
            <td>`$0.0000`</td>
            <td>`$0.1248`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-central-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-west-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-west-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-east-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-east-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-west-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
    </tbody>
</table>

**GCP**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">Cloud Provider</th>
        <th rowSpan="2">Origin Region</th>
        <th rowSpan="2">Public Internet Egress</th>
        <th colSpan="5">Destination region</th>
    </tr>
    <tr>
        <th>Same region</th>
        <th>North America</th>
        <th>Europe</th>
        <th>Asia, Oceania</th>
        <th>Middle East, South America, Africa</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`GCP`</td>
        <td>`us-central1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360`</td>
        <td>`$0.0720`</td>
        <td>`$0.1200`</td>
        <td>`$0.1620`</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`us-east1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360`</td>
        <td>`$0.0720`</td>
        <td>`$0.1200`</td>
        <td>`$0.1620`</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`europe-west4`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0720`</td>
        <td>`$0.0360`</td>
        <td>`$0.1200`</td>
        <td>`$0.1620`</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`asia-southeast1`</td>
        <td>`$0.1440`</td>
        <td>`$0.0000`</td>
        <td>`$0.1200`</td>
        <td>`$0.1200`</td>
        <td>`$0.1200`</td>
        <td>`$0.1620`</td>
    </tr>
    </tbody>
</table>

**Azure**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">Cloud Provider</th>
        <th rowSpan="2">Origin Region</th>
        <th rowSpan="2">Public Internet Egress</th>
        <th colSpan="5">Destination region</th>
    </tr>
    <tr>
        <th>Same region</th>
        <th>North America</th>
        <th>Europe</th>
        <th>Asia, Oceania</th>
        <th>Middle East, South America, Africa</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`Azure`</td>
        <td>`eastus2`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`westus3`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`germanywestcentral`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0660`</td>
        <td>`$0.0300`</td>
        <td>`$0.0660`</td>
        <td>`$0.0660`</td>
    </tr>
    </tbody>
</table>

### Will data transfer pricing be tiered as usage increases?

Data transfer prices will **not** be tiered as usage increases. Note that the pricing varies by region and cloud service provider.

## Backup Policy and Pricing

### What is the backup policy, and what backups, if any, are included?

All services will default to one backup with the new Pricing tiers. Users who need additional backups can do so by configuring additional backups under the settings tab of the Cloud Console. No free backups are included in the new pricing.

### What happens to current configurations that users have set up separate from default backups?

Customer specific backup configurations will carry over.  Users can change these as they see fit in the new tiers.

### Are backups charged differently across tiers?

The cost of backups is the same across all tiers.

## ClickPipes Pricing

### Why are we introducing a pricing model for ClickPipes now?

To offer a reliable, large-scale, data ingestion service we decided to initially launch ClickPipes for free. The idea was to gather feedback, refine features, and ensure it meets user needs. As the platform has grown and effectively stood the test of time by moving trillions of rows, introducing a pricing model allows us to continue improving the service, maintaining the infrastructure, and providing dedicated support and new connectors.

### What does the ClickPipes pricing structure look like?

It consists of two dimensions:

* **Compute**: Price per unit per hour. Compute represents the cost of running the ClickPipes replicas, whether they actively ingest data or not. It applies to all ClickPipes types.
* **Ingested data**: per GB pricing. The ingested data rate applies to all streaming ClickPipes (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, Warpstream, and Azure Event Hubs) for the data transferred via the replica pods.

### What are the ClickPipes public prices?

- Compute: `$0.20` per unit per hour
- Ingested data: `$0.04` per GB

### How does it look in an illustrative example?

For example, ingesting 1 TB of data over 24 hours using the Kafka connector using a single replica (0.5 compute unit) will cost:

`0.5 x 0.20 x 24 + 0.04 x 1000 = $42.4`

For object storage connectors (S3 and GCS), only the ClickPipes compute cost is incurred since the ClickPipes pod is not processing data but only orchestrating the transfer, which is operated by the underlying ClickHouse service: 

`0.5 x 0.20 x 24 = $2.4`

### When does the new pricing model take effect?

The new pricing model will take effect for all organizations created after **January 23rd, 2025**.

### What happens to current users?

Existing users will have a **60-day grace period** during which the ClickPipes service will continue to be offered for free. Billing will automatically start for ClickPipes for existing users on **March 24th, 2025.**

## Migration

### What is the migration experience for users of the current Development and Production services? Do users need to plan for a maintenance window where the service is unavailable?

Migrations of Development and Production services to the new pricing tiers may trigger a server restart. To migrate to Dedicated services, please contact support.

### What other actions should a user take after the migration?

API access patterns will be different.

### What changes should the users make if using the existing Terraform provider for automation?

TBD

### Will users have to make any changes to the database access?

No, the database username/password will work the same as before.

### Will users have to reconfigure Private Link?

No, users can use their existing Private Link configuration after moving their Production service to Scale or Enterprise.

## Scaling

The scaling behavior per tier is as follows:

* **Basic**: Single replica services only.
    * No scaling in either direction.
* **Scale**: Scaling will be permitted for Multi-replica services.
    * Services can vertically scale to the maximum replica size supported for a CSP/region **after** they have scaled to a multi-replica setup; only 2+ replicas can be vertically scaled.
    * Self-serve horizontal scaling will be available. 
* **Enterpris**: Scaling will be permitted for Multi-replica services.
    * Services can vertically scale to maximum replica sizes supported for a CSP/region.
        * Standard profiles will support vertical auto-scaling.
        * Custom profiles will need support to scale them vertically.
    * Self-serve horizontal scaling will be available.

:::note
Services can scale horizontally to a maximum of 20 replicas. If you need additional replicas, please contact our support team.
:::

## Marketplaces

### Are there changes to how users are charged via the CSP marketplaces?

Users who sign up to ClickHouse Cloud via a CSP Marketplace incur usage in terms of CHCs (ClickHouse Cloud Credits). This behavior has not changed. However, the underlying composition of the credit usage will align with the pricing and packaging changes outlined here and include charges for any data transfer usage and ClickPipes once those are live.

## Cost and Estimation

### How will users be guided during migration, understanding what tier best fits their needs?

The console will prompt you with recommended options for each service based on historical use if you have a service. New users can review the capabilities and features listed in detail and decide on the tier that best suits their needs. 

### How do users size and estimate the cost of "warehouses" in the new pricing?

Please refer to the pricing calculator that will help estimate the cost based on your workload size and tier selection.
