---
title: 'Description of New Tiers'
slug: /cloud/manage/jan-2025-faq/new-tiers
keywords: ['new tiers', 'features', 'pricing', 'description']
description: 'Description of new tiers and features'
---

## Summary of key changes {#summary-of-key-changes}

### What key changes to expect with regard to features to tier mapping? {#what-key-changes-to-expect-with-regard-to-features-to-tier-mapping}

- **Private Link/Private Service Connect:** Private connections are now supported across all service types on Scale and Enterprise tiers (including single-replica services). This means you can now have Private Link for both your production (large scale) and development (small scale) environments.
- **Backups:** All services now come with one backup by default and additional backups are charged separately. Users can leverage the configurable backup controls to manage additional backups. This means that services with lesser backup requirements do not need to pay a higher bundled price. Please see more details in the Backup FAQ.
- **Enhanced Encryption:** This feature is available in Enterprise tier services, including for single replica services, in AWS and GCP. Services are encrypted by our key by default and can be rotated to their key to enable Customer Managed Encryption Keys (CMEK).
- **Single Sign On (SSO):** This feature is offered in Enterprise tier and requires a support ticket to be enabled for an Organization. Users who have multiple Organizations should ensure all of their organizations are on the Enterprise tier to use SSO for each organization.

## Basic tier {#basic-tier}

### What are the considerations for the Basic tier? {#what-are-the-considerations-for-the-basic-tier}

The basic tier is meant for small workloads - users want to deploy a small analytics application that does not require high availability or work on a prototype. This tier is not suitable for workloads that need scale, reliability (DR/HA), and data durability. The tier supports single replica services of fixed size 1x8GiB or 1x12GiB. Please refer to the docs and [support policy](https://clickhouse.com/support/program) for more information.

### Can users on the Basic tier access Private Link and Private Service Connect? {#can-users-on-the-basic-tier-access-private-link-and-private-service-connect}

No, Users will need to upgrade to Scale or Enterprise to access this feature.

### Can users on the Basic and Scale tiers set up SSO for the organization? {#can-users-on-the-basic-and-scale-tiers-set-up-sso-for-the-organization}

No, users will need to upgrade to the Enterprise tier to access this feature.

### Can users launch single replica services in all tiers? {#can-users-launch-single-replica-services-in-all-tiers}

Yes, single replica services are supported on all three tiers. Users can scale out, but are not permitted to scale into a single replica.

### Can users scale up/down and add more replicas on the Basic tier? {#can-users-scale-updown-and-add-more-replicas-on-the-basic-tier}

No, services on this tier are meant to support workloads that are small and fixed size (single replica `1x8GiB` or `1x12GiB`). The size of the single replica is fixed upon service creation and cannot be adjusted or scaled after service creation. If users need to scale up/down or add replicas, they will be prompted to upgrade to Scale or Enterprise tiers.

## Scale tier {#scale-tier}

### Which tiers on the new plans (Basic/Scale/Enterprise) support compute-compute separation? {#which-tiers-on-the-new-plans-basicscaleenterprise-support-compute-compute-separation}

Only Scale and Enterprise tiers support compute-compute separation. Please also note that this capability requires running at least a 2+ replica parent service.

### Can users on the legacy plans (Production/Development) access compute-compute separation? {#can-users-on-the-legacy-plans-productiondevelopment-access-compute-compute-separation}

Compute-compute separation is not supported on existing Development and Production services, except for users who already participated in the Private Preview and Beta. If you have additional questions, please contact [support](https://clickhouse.com/support/program).

## Enterprise tier {#enterprise-tier}

### What different hardware profiles are supported for the Enterprise tier? {#what-different-hardware-profiles-are-supported-for-the-enterprise-tier}

The enterprise tier will support standard profiles (1:4 vCPU:memory ratio), as well as `highMem (1:8 ratio)` and `highCPU (1:2 ratio)` **custom profiles,** offering users more flexibility to select the configuration that best suits their needs. The Enterprise Tier will use shared compute resources deployed alongside the Basic and Scale tiers.

### What are the features exclusively offered on the Enterprise tier? {#what-are-the-features-exclusively-offered-on-the-enterprise-tier}

- **Custom profiles:** Options for instance type selection standard profiles (1:4 vCPU: memory ratio) and `highMem (1:8 ratio)` and `highCPU (1:2 ratio)` custom profiles.
- **Enterprise-grade security:**
    - **Single Sign On (SSO**)
    - **Enhanced Encryption:** For AWS and GCP services. Services are encrypted by our key by default and can be rotated to their key to enable Customer Managed Encryption Keys (CMEK).
- **Scheduled upgrades:** Users can select the day of the week/time window for upgrades, both database and cloud releases.
- **HIPAA Compliance:** The customer must sign a Business Associate Agreement (BAA) through Legal before we enable HIPAA-compliant regions for them.
- **Private Regions:** It is not self-serve enabled and will need users to route requests through Sales sales@clickhouse.com.
- **Export Backups** to the customer's cloud account.
