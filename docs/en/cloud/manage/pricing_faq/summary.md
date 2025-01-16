---
title: Summary
slug: /en/cloud/manage/pricing_faq/summary
keywords: [new pricing, faq, summary]
description: Summary of new ClickHouse Cloud Pricing
---

The following FAQ summarizes common questions with respect to the latest pricing and packaging for ClickHouse Cloud.

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

## Why did this pricing change, and why now?

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

## What are other changes to expect?

- **Backups:** All services now come with one backup, and backups are charged separately (i.e. No longer free). Users can leverage the configurable backup controls to manage additional backups.
- **Private Link/Private Service Connect:** Private connections are now supported for services on Scale and Enterprise tiers. You can set up a private link/private service connect for all services(including single replica services).
- **Enhanced Encryption:** This feature is now available only for Enterprise tier services (including for single replica services) in AWS and GCP. Services are encrypted by our key by default and can be rotated to their key to enable Customer Managed Encryption Keys (CMEK).
- **SSO (Single Sign On):** This feature is now offered only to Enterprise tier users and requires a support ticket to be enabled for an Organization. Users who have multiple Organizations should ensure all of their organizations are on the Enterprise tier to use SSO for each organization.

## Can new organizations launch services on the old (legacy) plan?

No, newly-created organizations will not have access to the old plan after the announcement.

## Can users migrate to the new pricing plan self-serve?

Yes, see below for guidance on self-serve migrations:

| Current Plan | New Plan                 | Self-Serve Migration                                                                                                                           |
|--------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Development  | Basic                    | Supported if all services in the organization support are Development and the user accepts terms of running in a single replica configuration  |
| Development  | Scale (2 replicas+)      | :heavy_check_mark:                                                                                                                                     |
| Development  | Enterprise (2 replicas+) | :heavy_check_mark:                                                                                                                                          |
| Production   | Scale (3 replicas+)      | :heavy_check_mark:                                                                                                                                          |
| Production   | Enterprise (3 replicas+) | :heavy_check_mark:                                                                                                                                       |
| Dedicated   | Contact Support at support@clickhouse.com
                                                                                                                                       |
## Are there changes to the trial experience?

No, there are no changes to the trial. Users will continue to get $300 in trial credits for a 30-day trial.

## Can users start the trial on any of the three tiers?

Yes, trials have access to all three tiers - Basic, Scale, and Enterprise. The default recommended tier is Scale to ensure users have an optimal trial experience, but users can choose other tiers based on preference.

## Can users launch services in different tiers in the same Organization?

No, Organizations are restricted to a single-tier selection.

## What will the experience be for users in trial running Development/Production services?

Users can upgrade during the trial and continue to use the trial credits to evaluate the new service tiers and the features it supports. However, if they choose to continue using the same Development and Production services, they can do so and upgrade to PAYG. They will still have to migrate before July 23, 2025.
