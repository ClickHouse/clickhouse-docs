---
title: Features and Tier Mapping
slug: /en/cloud/manage/pricing_faq/features
keywords: [new pricing, faq, features, tiers]
description: Description of new pricing tiers and features
---

## Features and Tier Mapping

### What are the considerations for the Basic tier?

The basic tier is meant for small workloads - users want to deploy a small analytics application that does not require high availability or work on a prototype. This tier is not suitable for workloads that need scale, reliability (DR/HA), and data durability. The tier supports single replica services of fixed size 1x8GiB or 1x12GiB. Please refer to the docs and[ support policy](https://clickhouse.com/support/program) for more information.

### Can users on the Basic tier access Private Link and Private Service Connect?

No, Users will need to upgrade to Scale or Enterprise to access this feature.

### Can users on the Basic and Scale tiers set up SSO for the organization?

No, users will need to upgrade to the Enterprise tier to access this feature.

### Can users launch single replica services in all tiers?

Yes, single replica services are supported on all three tiers. Users can scale out, but are not permitted to scale into a single replica.

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
