---
title: 'Migrating to New Plans'
slug: /cloud/manage/jan-2025-faq/plan-migrations
keywords: ['migration', 'new tiers', 'pricing', 'cost', 'estimation']
description: 'Migrating to new plans, tiers, pricing, how to decide and estimate costs'
---

## Choosing new plans {#choosing-new-plans}

### Can new organizations launch services on the old (legacy) plan? {#can-new-organizations-launch-services-on-the-old-legacy-plan}

No, newly created organizations will not have access to the old plan after the announcement.

### Can users migrate to the new pricing plan self-serve? {#can-users-migrate-to-the-new-pricing-plan-self-serve}

Yes, see below for guidance on self-serve migrations:

| Current Plan | New Plan                 | Self-Serve Migration                                                                                                                           |
|--------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Development  | Basic                    | Supported if all services in the organization support are Development                                                                          |
| Development  | Scale (2 replicas+)      | :white_check_mark:                                                                                                                                     |
| Development  | Enterprise (2 replicas+) | :white_check_mark:                                                                                                                                          |
| Production   | Scale (3 replicas+)      | :white_check_mark:                                                                                                                                          |
| Production   | Enterprise (3 replicas+) | :white_check_mark:                                                                                                                                       |
| Dedicated   | Contact [support](https://clickhouse.com/support/program) |

### What will the experience be for users in trial running Development and Production services? {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

Users can upgrade during the trial and continue to use the trial credits to evaluate the new service tiers and the features it supports. However, if they choose to continue using the same Development and Production services, they can do so and upgrade to PAYG. They will still have to migrate before July 23, 2025.

### Can users upgrade their tiers {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

Can users upgrade their tiers, for example, Basic → Scale, Scale → Enterprise, etc.
Yes, users can upgrade self-serve, and the pricing will reflect the tier selection after upgrade.

### Can users move from a higher to a lower-cost tier {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

For example, Enterprise → Scale, Scale → Basic, Enterprise → Basic self-serve?
Yes, but users will need to remove all premium features and may be guided to scale their multi-replica services into a single replica.

### Can users with only development services in the organization migrate to the Basic tier? {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

Yes, this would be permitted. Users will be given a recommendation based on their past use and can select Basic `1x8GiB` or `1x12GiB`.

### Can users with a development and production service in the same organization move to the basic tier? {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

No, if a user has both Development and Production services in the same organization, they can self-serve and migrate only to the Scale or Enterprise tier. If they want to migrate to Basic, they should delete all existing Production services.

### Are there any changes related to the Scaling behavior with the new tiers? {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

We are introducing a new vertical scaling mechanism for compute replicas, which we call "Make Before Break" (MBB). This approach adds one or more replicas of the new size before removing the old replicas, preventing any loss of capacity during scaling operations. By eliminating the gap between removing existing replicas and adding new ones, MBB creates a more seamless and less disruptive scaling process. It is especially beneficial in scale-up scenarios, where high resource utilization triggers the need for additional capacity, since removing replicas prematurely would only exacerbate the resource constraints.

Please note that as part of this change, historical system table data will be retained for up to a maximum of 30 days as part of scaling events. In addition, any system table data older than December 19, 2024, for services on AWS or GCP and older than January 14, 2025, for services on Azure will not be retained as part of the migration to the new organization tiers.

## Estimating costs {#estimating-costs}

### How will users be guided during migration, understanding what tier best fits their needs? {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

The console will prompt you with recommended options for each service based on historical use if you have a service. New users can review the capabilities and features listed in detail and decide on the tier that best suits their needs.

### How do users size and estimate the cost of "warehouses" in the new pricing? {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

Please refer to the pricing calculator on the [Pricing](https://clickhouse.com/pricing) page, which will help estimate the cost based on your workload size and tier selection.

## Undertaking the migration {#undertaking-the-migration}

### What are service version pre-requisites to undertaking the migration? {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

Your service has to be on version 24.8 or later and already migrated to SharedMergeTree.

### What is the migration experience for users of the current Development and Production services? Do users need to plan for a maintenance window where the service is unavailable? {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

Migrations of Development and Production services to the new pricing tiers may trigger a rolling restart. To migrate a Dedicated service, please contact [support](https://clickhouse.com/support/program).

### What other actions should a user take after the migration? {#what-other-actions-should-a-user-take-after-the-migration}

API access patterns will be different.

Users that use our OpenAPI to create new services will be required to remove the `tier` field in the service creation `POST` request.

The `tier` field has been removed from the service object as we no longer have service tiers.
This will affect the objects returned by the `POST`, `GET`, and `PATCH` service requests. Therefore, any code that consumes these APIs may need to be adjusted to handle these changes.

The number of replicas each service will be created with defaults to 3 for the Scale and Enterprise tiers, while it defaults to 1 for the Basic tier.
For the Scale and the Enterprise tiers it is possible to adjust it by passing a `numReplicas` field in the service creation request.
The value of the `numReplicas` field must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1.

### What changes should the users make if using the existing Terraform provider for automation? {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

Once an organization has been migrated to one of the new plans, users will be required to use our Terraform provider version 2.0.0 or above.

The new Terraform provider is required to handle changes in the `tier` attribute of the service.

After the migration, the `tier` field is no longer accepted, and references to it should be removed.

Users will also be able to specify the `num_replicas` field as a property of the service resource.

The number of replicas each service will be created with defaults to 3 for the Scale and Enterprise tiers, while it defaults to 1 for the Basic tier.
For the Scale and the Enterprise tiers, it is possible to adjust it by passing a `numReplicas` field in the service creation request.
The value of the `num_replicas` filed must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1.

### Will users have to make any changes to the database access? {#will-users-have-to-make-any-changes-to-the-database-access}

No, the database username/password will work the same as before.

### Will users have to reconfigure private networking features? {#will-users-have-to-reconfigure-private-networking-features}

No, users can use their existing private networking (Private Link, PSC, etc..) configuration after moving their Production service to Scale or Enterprise.
