---
sidebar_label: CSP Marketplace
slug: /en/cloud/marketplace
title: CSP Marketplace
---

## Sign up for ClickHouse Cloud connected to your Cloud Service Provider (CSP) - AWS/GCP/Azure - billing account

### AWS 

- Log into the AWS console using your AWS account. This is the account you intend to subscribe to the ClickHouse Cloud service.
- Navigate to [ClickHouse Cloud on AWS marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) product listing
- Click "View purchase options"
- In the "Contract Options" section of the page, enter any number in the Units field. This will not affect the price your pay as the price for these units for the public offering is $0. These units are usually used when accepting a private offer from ClickHouse Cloud.
- Click "Create contract", and "Pay now" on the subsequent screen
- Click "Set up your account"
- You will be redirected to the AWS marketplace ClickHouse Cloud login page. Please, complete your sign-in / sign-up at this page so we can bind your ClickHouse Cloud organization to AWS billing:
  - If you are a new ClickHouse Cloud user, click "Register" at the bottom of the page. You will be prompted to create a new user and verify the email. After verifying your email, you can leave the ClickHouse Cloud login page and login using the new username at  https://clickhouse.cloud
  - If you are an existing ClickHouse Cloud user, simply log in using your credentials
- After successful log in, a new ClickHouse Cloud organization will be created. This organization will be connected to your AWS billing account.
- NOTE: If you are an existing ClickHouse Cloud user and you would like your current usage to be billed via the marketplace please follow steps outlined below in ("I am an existing ClickHouse Cloud user and I want my existing services to be billed via marketplace").

### GCP 
- Log into the GCP console using your GCP account and your preferred project
- Navigate to the [ClickHouse Cloud at GCP marketplace](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)
- Click “Subscribe”
- Select a billing account that you want to use for billing
- Accept the additional terms and check the checkboxes
- Click “Subscribe”
- Click “Sign in with ClickHouse”
- You will be redirected to the special GCP marketplace ClickHouse Cloud login page. Please, complete your sign-in / sign-up at this page so we can bind your ClickHouse Cloud organization to GCP billing:
  - If you are a new CH Cloud user, click "Register" at the bottom of the page. You will be prompted to create a new user and verify the email. After verifying your email, you can leave the ClickHouse Cloud login page and login using the new username at the https://clickhouse.cloud.
  - If you are an existing CH Cloud user, simply log in using your credentials.
- After successful log in, a new ClickHouse Cloud organization will be created. This organization will be connected to your GCP billing account.


### Azure (coming soon)

## FAQs

### How can I verify if my organization is connected to CSP marketplace billing?

In ClickHouse Cloud console, navigate to **Admin** -> **Billing**. You should see the name of the marketplace and the link in the **Payment details section**

### I am an existing ClickHouse Cloud user. What will happen if I subscribe to ClickHouse Cloud via AWS marketplace?

A separate organization connected to the marketplace will be created. Your existing services and organizations will remain and they will not be connected to the marketplace billing.

You can switch between organizations in the top right corner of the ClickHouse Cloud console.

### I am an existing ClickHouse Cloud user and I want my existing services to be billed via marketplace.

Please follow the steps outlined above to subscribe and sign up via the marketplace. A new organization will be created for you. After this, contact [ClickHouse Cloud support](https://clickhouse.cloud/support) and share the organization ID for the old organization (the one which has existing services and workloads), and the new org (that you created via the marketplace). You will also need to share the email for a user that has the admin role on both orgs.  ClickHouse Cloud support team will then be able to connect your existing services to the new org so that your usage starts getting billed via the marketplace.

### I subscribed as a marketplace user and now I want to unsubscribe from ClickHouse Cloud.

Note that you can simply stop using ClickHouse Cloud and delete all existing ClickHouse Cloud services. Even though the subscription will still be active, you will not be paying anything as ClickHouse Cloud doesn't have any recurring fees.

If you want to unsubscribe, please navigate to the Cloud Provider console and cancel the subscription renewal there. Once the subscription ends, all existing services will be stopped and you will be prompted to add a credit card. If no card is added, after two weeks all existing services will be deleted.

### I subscribed to ClickHouse Cloud as a marketplace user, then I unsubscribed, but now I want to subscribe back.

In that case please subscribe to the ClickHouse Cloud as usual (see "Sign up for ClickHouse Cloud connected to your Cloud Service Provider (CSP) - AWS/GCP/Azure - billing account"). Note that:
- For AWS marketplace a new ClickHouse Cloud organization will be created and connected to the marketplace
- For GCP marketplace your old organization will be re-activated
If you have any troubles with re-activating you marketpalce org, please contact ClickHouse Cloud Support.


### How can I access my invoice for my marketplace subscription to the ClickHouse Cloud service?

- [AWS billing Console](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP Marketplace orders (select the billing account that you used for subscribtion)](https://console.cloud.google.com/marketplace/orders)

### Why do the dates on the Usage statements not match my Marketplace Invoice?

Marketplace billing follows the calendar month cycle.  For example, for usage between December 1st and January 1st, an invoice will be generated between January 3rd and January 5th

ClickHouse Cloud usage statements follow a different billing cycle where usage is metered and reported over 30 days starting from the day of sign up

The usage and invoice dates will differ if these dates are not the same. Since usage statements track usage by day for a given service, users can rely on statements to see the breakdown of costs.

### Where can I find general billing information

Please see the [billing](/docs/en/cloud/manage/billing.md) documentation.
