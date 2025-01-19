---
title: Billing
slug: /en/cloud/manage/jan-2025-faq/billing
keywords: [new pricing, billing]
description: Billing details for new pricing tiers
---

## Billing

### Are there any changes to how usage is metered and charged?

The per-dimension unit cost for compute and storage has changed, and there are two additional dimensions to account for data transfer and ClickPipes usage.

Some notable changes:

- Storage cost will no longer include backups (we will charge for them separately and will make only one backup required). As a result, storage will be lower than it is today. Storage costs are the same across tiers and vary by region and cloud service provider. 
- Compute costs will vary by tier, region, and cloud service provider.
- The new pricing dimension for data transfer is applicable for data egress across regions and on the public internet only. 
- New pricing dimension for ClickPipes usage. 

### What happens to users with existing committed spend contracts?

Users with active committed spend contracts will not be affected by the new pricing changes until their contract expires. The existing terms and pricing will remain in effect for the duration of the contract.

### Can users on a committed spend agreement with ClickHouse continue to launch services on the old plan?

Yes, users will be able to launch Development and Production services until the end date of their contract, and renewals will reflect the new pricing plan.

If you need to modify your contract or have questions about how these changes might affect you in the future, please contact our support team or your sales representative.

### What happens if users exhaust their credits before the end of the contract and go to PAYG? 

If committed spend contracts exhaust credits before their renewal date, we bill them at the current rates until renewal (as per current policy).

### What happens to users on the monthly PAYG?

Users on a monthly PAYG plan will continue to be billed using the old pricing plan for the Development and Production services. They have until July 23, 2025, to migrate to the new plan self-serve, or they will all be migrated to the Scale configuration on this day and billed based on the new plan.

## Marketplaces

### Are there changes to how users are charged via the CSP marketplaces?

Users who sign up to ClickHouse Cloud via a CSP Marketplace incur usage in terms of CHCs (ClickHouse Cloud Credits). This behavior has not changed. However, the underlying composition of the credit usage will align with the pricing and packaging changes outlined here and include charges for any data transfer usage and ClickPipes once those are live.
