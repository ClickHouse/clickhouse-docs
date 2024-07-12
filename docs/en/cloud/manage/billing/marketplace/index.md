---
slug: /en/cloud/marketplace
title: Marketplace Billing
description: Subscribe to ClickHouse Cloud through the AWS, GCP, and Azure marketplace.
keywords: [aws, azure, gcp, google cloud, marketplace, billing]
---

You can subscribe to ClickHouse Cloud through the AWS, GCP, and Azure marketplaces. This allows you to pay for ClickHouse Cloud through your existing cloud provider billing.

You can either use pay-as-you-go (PAYG) or commit to a contract with ClickHouse Cloud through the marketplace. The billing will be handled by the cloud provider, and you will receive a single invoice for all your cloud services.

- [AWS Marketplace PAYG](/en/cloud/billing/marketplace/aws-marketplace-payg)
- [AWS Marketplace Committed Contract](/en/cloud/billing/marketplace/aws-marketplace-committed-contract)
- [GCP Marketplace PAYG](/en/cloud/billing/marketplace/gcp-marketplace-payg)
- [GCP Marketplace Committed Contract](/en/cloud/billing/marketplace/gcp-marketplace-committed-contract)
- [Azure Marketplace PAYG](/en/cloud/billing/marketplace/azure-marketplace-payg)
- [Azure Marketplace Committed Contract](/en/cloud/billing/marketplace/azure-marketplace-committed-contract)

## FAQs

**How can I understand that my organization is connected to marketplace billing?​**

In the ClickHouse Cloud console, navigate to **Billing**. You should see the name of the marketplace and the link in the **Payment details** section.

**I am an existing ClickHouse Cloud user. What will happen if I subscribe to ClickHouse Cloud via AWS marketplace?​**

A separate organization connected to the marketplace will be created. Your existing services and organizations will remain and they will not be connected to the marketplace billing.

You can switch between organizations from the bottom left menu of the ClickHouse Cloud console.

**I am an existing ClickHouse Cloud user. What should I do if I want my existing services to be billed via marketplace?​**

Please contact [ClickHouse Cloud support](https://clickhouse.com/support/program) in this case. You will need to subscribe to ClickHouse Cloud via the marketplace and we can switch organization linkage to resources so that billing happens via the marketplace.

**I subscribed to ClickHouse Cloud as a marketplace user. How can I unsubscribe?​**

Note that you can simply stop using ClickHouse Cloud and delete all existing ClickHouse Cloud services. Even though the subscription will still be active, you will not be paying anything as ClickHouse Cloud doesn't have any recurring fees.

If you want to unsubscribe, please navigate to the Cloud Provider console and cancel the subscription renewal there. Once the subscription ends, all existing services will be stopped and you will be prompted to add a credit card. If no card was added, after two weeks all existing services will be deleted.

**I subscribed to ClickHouse Cloud as a marketplace user, and then unsubscribed. Now I want to subscribe back, what is the process?​**

In that case please subscribe to the ClickHouse Cloud as usual (see sections on subscribing to ClickHouse Cloud via the marketplace).

- For AWS marketplace a new ClickHouse Cloud organization will be created and connected to the marketplace.
- For the GCP marketplace your old organization will be reactivated.

If you have any trouble with reactivating your marketplace org, please contact [ClickHouse Cloud Support](https://clickhouse.com/support/program).

**How do I access my invoice for my marketplace subscription to the ClickHouse Cloud service?​**

- [AWS billing Console](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP Marketplace orders](https://console.cloud.google.com/marketplace/orders) (select the billing account that you used for subscription)

**Why do the dates on the Usage statements not match my Marketplace Invoice?​**

Marketplace billing follows the calendar month cycle. For example, for usage between December 1st and January 1st, an invoice will be generated between January 3rd and January 5th.

ClickHouse Cloud usage statements follow a different billing cycle where usage is metered and reported over 30 days starting from the day of sign up.

The usage and invoice dates will differ if these dates are not the same. Since usage statements track usage by day for a given service, users can rely on statements to see the breakdown of costs.

**Where can I find general billing information​?**

Please see the [Billing overview page](http://localhost:3000/docs/en/manage/billing).



