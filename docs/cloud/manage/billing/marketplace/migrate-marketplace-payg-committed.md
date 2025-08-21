---
slug: /cloud/billing/marketplace/migrate
title: 'Migrate billing from pay-as-you-go (PAYG) to a committed spend contract in a cloud marketplace'
description: 'Migrate from pay-as-you-go to committed spend contract.'
keywords: ['marketplace', 'billing', 'PAYG', 'pay-as-you-go', 'committed spend contract']
doc_type: overview
---

# Migrate billing from pay-as-you-go (PAYG) to a committed spend contract in a cloud marketplace {#migrate-payg-to-committed}

If your ClickHouse organization is currently billed through an active cloud marketplace pay-as-you-go (PAYG) subscription (or order) and you wish to migrate to billing via a committed spend contract through the same cloud marketplace, please accept your new offer and then follow the steps below based on your cloud service provider.

## Important Notes {#important-notes}

Please note that canceling your marketplace PAYG subscription does not delete your ClickHouse Cloud account - only the billing relationship via the marketplace. Once canceled, our system will stop billing for ClickHouse Cloud services through the marketplace. (Note: this process is not immediate and may take a few minutes to complete).

After your marketplace subscription is canceled, if your ClickHouse organization has a credit card on file, we will charge that card at the end of your billing cycle - unless a new marketplace subscription is attached beforehand.

If no credit card is configured after cancellation, you will have 14 days to add either a valid credit card or a new cloud marketplace subscription to your organization. If no payment method is configured within that period, your services will be suspended and your organization will be considered out of [billing compliance](/manage/clickhouse-cloud-billing-compliance).

Any usage accrued after the subscription is canceled will be billed to the next configured valid payment method - either a prepaid credit, a marketplace subscription, or credit card in that order.

For any questions or support with issues configuring your organization to a new marketplace subscription please reach out to ClickHouse [support](https://clickhouse.com/support/program) for help.

## AWS Marketplace {#aws-marketplace}

If you want to use the same AWS Account ID for migrating your PAYG subscription to a committed spend contract then our recommended method is to [contact sales](https://clickhouse.com/company/contact) to make this amendment. Doing so means no additional steps are needed and no disruption to your ClickHouse organization or services will occur.

If you want to use a different AWS Account ID for migrating your ClickHouse organization from a PAYG subscription to a committed spend contract then follow these steps:

### Steps to Cancel AWS PAYG Subscription {#cancel-aws-payg}

1. **Go to the [AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace)**
2. **Click on the "Manage Subscriptions" button**
3. **Navigate to "Your Subscriptions":**
   - Click on "Manage Subscriptions"
4. **Find ClickHouse Cloud in the list:**
   - Look and click on ClickHouse Cloud under "Your Subscriptions"
5. **Cancel the Subscription:**
   - Under "Agreement" click on the "Actions" dropdown or button next to the ClickHouse Cloud listing
   - Select "Cancel subscription"

> **Note:** For help cancelling your subscription (e.g. if the cancel subscription button is not available) please contact [AWS support](https://support.console.aws.amazon.com/support/home#/).

Next follow these [steps](/cloud/billing/marketplace/aws-marketplace-committed-contract) to configure your ClickHouse organization to the new AWS committed spend contract you accepted.

## GCP Marketplace {#gcp-marketplace}

### Steps to Cancel GCP PAYG Order {#cancel-gcp-payg}

1. **Go to your [Google Cloud Marketplace Console](https://console.cloud.google.com/marketplace):**
   - Make sure you are logged in to the correct GCP account and have selected the appropriate project
2. **Locate your ClickHouse order:**
   - In the left menu, click "Your Orders"
   - Find the correct ClickHouse order in the list of active orders
3. **Cancel the order:**
   - Find the three dots menu to the right of your order and follow the instructions to cancel the ClickHouse order

> **Note:** For help cancelling this order please contact [GCP support](https://cloud.google.com/support/docs/get-billing-support).

Next follow these [steps](/cloud/billing/marketplace/gcp-marketplace-committed-contract) to configure your ClickHouse organization to your new GCP committed spend contract.

## Azure Marketplace {#azure-marketplace}

### Steps to Cancel Azure PAYG Subscription {#cancel-azure-payg}

1. **Go to the [Microsoft Azure Portal](http://portal.azure.com)**
2. **Navigate to "Subscriptions"**
3. **Locate the active ClickHouse subscription you want to cancel**
4. **Cancel the Subscription:**
   - Click on the ClickHouse Cloud subscription to open the subscription details
   - Select the "Cancel subscription" button

> **Note:** For help cancelling this order please open a support ticket in your Azure Portal.

Next follow these [steps](/cloud/billing/marketplace/azure-marketplace-committed-contract) to configure your ClickHouse organization to your new Azure committed spend contract.

## Requirements for Linking to Committed Spend Contract {#linking-requirements}

> **Note:** In order to link your organization to a marketplace committed spend contract:
> - The user following the steps must be an admin user of the ClickHouse organization you are attaching the subscription to
> - All unpaid invoices on the organization must be paid (please reach out to ClickHouse [support](https://clickhouse.com/support/program) for any questions)