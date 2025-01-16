---
title: Changing Pricing Tiers
slug: /en/cloud/manage/pricing_faq/tiers
keywords: [new pricing, tiers, migration, cost, estimation]
description: New pricing tiers, how to migrate and cost estimation
---

## Changing Pricing Tiers

### Can users upgrade their tiers, i.e. Basic → Scale, Scale → Enterprise, etc?

Yes, users can upgrade self-serve and the pricing will reflect the tier selection after upgrade.

### Can users move from a higher to a lower-cost tier, e.g., Enterprise → Scale, Scale → Basic, Enterprise → Basic self-serve?

No, we do not permit downgrading tiers.

### Can users with a Development and Production service in the same Organization move to the Basic Tier?

No, if a user has both Development and Production services in the same organization, they can self-serve and migrate only to the Scale or Enterprise tier.

### Can users with only Development services in the organization migrate to the Basic tier?

Yes, this would be permitted. Users will be given a recommendation based on their past use and can select Basic `1x8GiB` or `1x12GiB`.

### Can users who have Development and Production services in the organization migrate to the Basic tier?

No, users can migrate only to a Scale or Enterprise tier if an organization has both Development and Production services. If they want to migrate to Basic, they should delete all existing Production services.

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

## Cost and Estimation

### How will users be guided during migration, understanding what tier best fits their needs?

The console will prompt you with recommended options for each service based on historical use if you have a service. New users can review the capabilities and features listed in detail and decide on the tier that best suits their needs. 

### How do users size and estimate the cost of "warehouses" in the new pricing?

Please refer to the pricing calculator that will help estimate the cost based on your workload size and tier selection.


