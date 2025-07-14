---
title: 'Billing'
slug: /cloud/manage/jan-2025-faq/billing
keywords: ['new pricing', 'billing']
description: 'Billing details for new pricing tiers'
---

## Billing {#billing}

### Are there any changes to how usage is metered and charged? {#are-there-any-changes-to-how-usage-is-metered-and-charged}

The per-dimension unit cost for compute and storage has changed, and there are two additional dimensions to account for data transfer and ClickPipes usage.

Some notable changes:

- Storage price per TB will be reduced, and storage cost will no longer include backups (we will charge for them separately and will make only one backup required). Storage costs are the same across tiers and vary by region and cloud service provider.
- Compute costs will vary by tier, region, and cloud service provider.
- The new pricing dimension for data transfer is applicable for data egress across regions and on the public internet only.
- New pricing dimension for ClickPipes usage.

### What happens to users with existing committed spend contracts? {#what-happens-to-users-with-existing-committed-spend-contracts}

Users with active committed spend contracts will not be affected by the new per-dimension unit cost prices for compute and storage until their contract expires. However, the new pricing dimensions for data transfer and ClickPipes will be applicable starting March 24, 2025. Most customers will not see a significant increase in their monthly bill from these new dimensions.

### Can users on a committed spend agreement with ClickHouse continue to launch services on the old plan? {#can-users-on-a-committed-spend-agreement-with-clickhouse-continue-to-launch-services-on-the-old-plan}

Yes, users will be able to launch Development and Production services until the end date of their contract, and renewals will reflect the new pricing plan.

If you need to modify your contract or have questions about how these changes might affect you in the future, please contact our support team or your sales representative.

### What happens if users exhaust their credits before the end of the contract and go to PAYG? {#what-happens-if-users-exhaust-their-credits-before-the-end-of-the-contract-and-go-to-payg}

If committed spend contracts exhaust credits before their renewal date, we bill them at the current rates until renewal (as per current policy).

### What happens to users on the monthly PAYG? {#what-happens-to-users-on-the-monthly-payg}

Users on a monthly PAYG plan will continue to be billed using the old pricing plan for the Development and Production services. They have until July 23, 2025, to migrate to the new plan self-serve, or they will all be migrated to the Scale configuration on this day and billed based on the new plan.

### Where can I reference legacy plans? {#where-can-i-reference-legacy-plans}

Legacy plans are available for reference [here](https://clickhouse.com/pricing?legacy=true).

## Marketplaces {#marketplaces}

### Are there changes to how users are charged via the CSP marketplaces? {#are-there-changes-to-how-users-are-charged-via-the-csp-marketplaces}

Users who sign up to ClickHouse Cloud via a CSP Marketplace incur usage in terms of CHCs (ClickHouse Cloud Credits). This behavior has not changed. However, the underlying composition of the credit usage will align with the pricing and packaging changes outlined here and include charges for any data transfer usage and ClickPipes once those are live.
