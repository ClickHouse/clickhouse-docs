---
sidebar_label: CSP Marketplace
slug: /en/cloud/marketplace
title: CSP Marketplace
---

## How can I start using ClickHouse Cloud connected to my AWS/GCP/Azure account billing?

### AWS (GCP and AZURE coming soon)

- Log into the AWS console using your AWS account
- Navigate to the [ClickHouse Cloud at aws marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)
- Click "View purchase options"
- In the "Contract Options" section of the page, enter any number in the Units field. This will not affect the price your pay as the price for these units for the public offering is $0. These units are usually used when accepting a private offer from ClickHouse Cloud.
- Click "Create contract"
- Click "Set up your account".
- You will be redirected to the special aws marketplace ClickHouse Cloud login page. Please, complete your sign-in / sign-up at this page so we can bind your ClickHouse Cloud organization to AWS billing:
  - If you are a new CH Cloud user, click "Register" at the bottom of the page. You will be prompted to create a new user and verify the email. After verifying your email, you can leave the ClickHouse Cloud login page and login using the new username at the https://clickhouse.cloud.
  - If you are an existing CH Cloud user, simply log in using your credentials.
- After successful log in, a new ClickHouse Cloud organization will be created. This organization will be connected to your AWS billing account.

## How can I understand that my organization is connected to the aws marketplace billing?

In ClickHouse Cloud console, navigate to **Admin** -> **Billing**. You should see the name of the marketplace and the link in the **Payment details section**

## I am an existing ClickHouse Cloud user. What will happen if I subscribe to the CH Cloud via aws marketplace?

A separate organization connected to the marketplace will be created. Your existing services and organizations will remain and they will not be connected to the marketplace billing.

You can switch between organizations in the top right corner of the ClickHouse Cloud console.

## I am an existing ClickHouse Cloud user and I want my existing services to be billed via marketplace.

Please contact [ClickHouse Cloud support](https://clickhouse.cloud/support) in this case.

## I subscribed as a marketplace user and now I want to unsubscribe from the ClickHouse Cloud.

Note that you can simply stop using ClickHouse Cloud and delete all existing ClickHouse Cloud services. Even though the subscription will still be active, you will not be paying anything as ClickHouse Cloud doesn't have any recurring fees.

If you want to unsubscribe, please navigate to the Cloud Provider console and cancel the subscription renewal there. Once the subscription ends, all existing services will be stopped and you will be prompted to add a credit card. If no card was added, after two weeks all existing services will be deleted.

## Previously I subscribed to ClickHouse Cloud as a marketplace user, then I unsubscribed, but now I want to subscribe back.

In that case please subscribe to the ClickHouse Cloud as usual (see "How can I start using ClickHouse Cloud connected to my AWS/GCP/Azure account billing?"). Note that a new ClickHouse Cloud organization will be created and connected to the marketplace.

## How do I access my invoice for my AWS marketplace subscription to the ClickHouse Cloud service?

All marketplace subscriptions will be billed and invoiced by AWS. You can download the invoice from the AWS Billing Dashboard.

### Why do the dates on the Usage statements not match my AWS Marketplace Invoice?

AWS Marketplace billing follows the calendar month cycle.  For example, for usage between December 1st and January 1st, an invoice will be generated between January 3rd and January 5th

ClickHouse Cloud usage statements follow a different billing cycle where usage is metered and reported over 30 days starting from the day of sign up

The usage and invoice dates will differ if these dates are not the same. Since usage statements track usage by day for a given service, users can rely on statements to see the breakdown of costs.

## Where can I find general billing information

Please see the [billing](/docs/en/cloud/manage/billing.md) documentation.
