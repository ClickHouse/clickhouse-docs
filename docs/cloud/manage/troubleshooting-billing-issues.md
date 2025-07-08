---
sidebar_label: 'ClickHouse Cloud billing compliance'
slug: /manage/troubleshooting-billing-issues
title: 'ClickHouse Cloud billing compliance'
description: 'Page describing ClickHouse Cloud billing compliance'
keywords: ['billing compliance', 'pay-as-you-go']
---

import billing_compliance from '@site/static/images/cloud/manage/billing_compliance.png';
import Image from '@theme/IdealImage';

# ClickHouse Cloud billing compliance

## Billing compliance {#billing-compliance}

Your use of ClickHouse Cloud requires your organization to have an active and 
valid billing method configured. After your 30 day trial ends or your trial 
credits are depleted, you have the following billing options to continue using
ClickHouse Cloud:
1. Add a valid credit card to your organization to Pay-As-You-Go (PAYG)
2. Set up a Pay-As-You-Go subscription via a supported cloud marketplace provider (AWS, GCP, or Azure)
3. Reach out to sales to negotiate a committed spend contract
   directly or through a cloud marketplace committed contract. 

If your trial has ended and no credit card or additional credits have been added,
all services will be stopped. If no action is taken within two weeks, all data 
will be deleted.

If you choose to use the first Pay-As-You-Go option with a credit card, go to the
Billing section in the ClickHouse Cloud UI and click the 'Add Credit Card' button
(shown below) to complete the setup. If you have any questions please 
[contact support](/about-us/support) for help.

<Image img={billing_compliance} alt="Billing Compliance" size="md"/>

If you want to pay through one of our supported marketplaces (AWS, GCP, or Azure),
you can follow the steps [here](https://clickhouse.com/docs/cloud/marketplace/marketplace-billing)
for help. For any questions related specifically to cloud marketplace billing,
please contact the cloud service provider directly.

Helpful links for resolving issues with marketplace billing:
- [AWS Billing FAQs](https://aws.amazon.com/aws-cost-management/aws-billing/faqs/)
- [GCP Billing FAQs](https://cloud.google.com/compute/docs/billing-questions)
- [Azure Billing FAQs](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-faq)

ClickHouse charges for services at the organization level. If we are ever unable
to process a payment using your current billing method, you must update it to one
of the three options listed above to avoid service disruption and remain compliant.
See below for more details about payment compliance based on your chosen billing 
method.

## Pay-as-you-go (PAYG) billing with a credit card {#payg-billing}

A credit card is considered compliant if it is valid, not expired, and has a 
sufficient credit limit and available funds based on your invoice total.

If, for any reason, we are unable to charge the credit card associated with your 
organization, the following unpaid invoice restrictions will immediately apply:

- You will only be able to scale up to 120 GiB per replica
- You will not be able to start your services if stopped
- You will not be able to start or create new services

We will attempt to process payment using the organization's configured billing 
method for up to 30 days. If payment is not successful after 14 days, all services
within the organization will be stopped. In accordance with our [terms and conditions](https://clickhouse.com/legal/agreements/terms-of-service),
you have 30 days from the date the invoice becomes overdue to initiate a payment 
dispute. If payment is still not received by the end of this 30 day period, 
all data and services associated with your organization will be deleted.

## Cloud marketplace pay-as-you-go (PAYG) billing {#cloud-marketplace-payg}

Pay-As-You-Go billing can also be configured to charge an organization through 
one of our supported cloud marketplaces (AWS, GCP, or Azure). However, if the 
marketplace subscription is canceled or fails to renew automatically, billing will
fall back to the credit card configured for the organization. If a valid credit 
card is not configured, the same unpaid invoice restrictions outlined above for 
Pay-As-You-Go (PAYG) with a credit card billing will apply - this includes 
service suspension and eventual data deletion.

## How does our PAYG marketplace billing schedule work? {#payg-marketplace-billing-schedule}

If you subscribe to ClickHouse through a cloud marketplace, your Pay-As-You-Go 
sage will be invoiced according to the terms of your agreement with that 
marketplace - typically on a calendar-month billing cycle.

## How does our direct billing schedule work? {#direct-billing-schedule}

For customers using Pay-As-You-Go with a credit card, the monthly billing cycle 
begins on the day the first tier (Basic, Scale, or Enterprise) is selected and 
the service is created within the organization.

## How are credits consumed that are applied to an organization? {#credits-consumed}

Credits applied to an organization (e.g. through committed contracts or refunds)
are consumed starting on the day credit was granted in billing periods based on 
the date the first tier (Basic, Scale, or Enterprise) is selected.

For all pay-as-you-go billing we will bill immediately if the amount due within 
a billing period is equal to $10,000 USD (more info on payment thresholds [here](https://clickhouse.com/docs/cloud/billing/payment-thresholds)).

## Committed contract billing {#committed-contract-billing}

You have the option to purchase credits for your organization through a committed
contract by:
1. Contacting sales to buy credits directly, with payment options including ACH 
   or wire transfer.
2. Contacting sales to buy credits through a subscription on one of our supported
   cloud marketplaces (AWS, GCP, or Azure) 

<br/>

If an organization is **not** on a cloud marketplace committed contract and runs
out of credits or the credits expire, the organization will automatically switch 
to Pay-As-You-Go (PAYG) billing. In this case, we will attempt to process payment
using the credit card configured for the organization.

If an organization **is** on a cloud marketplace committed contract and runs out
of credits, it will also automatically switch to PAYG billing via the same 
marketplace for the remainder of the subscription. However, if the subscription 
is not renewed and expires, we will then attempt to process payment using the 
credit card on file for the organization.

In either scenario, if we are unable to charge the configured credit card, the 
unpaid invoice restrictions outlined above for Pay-as-you-go (PAYG) billing with 
a credit card will apply—this includes the suspension of services. However, for 
committed contract customers, we will take all necessary steps to reconcile any 
unpaid invoices before initiating data deletion. There will be no automatic data 
deletion after 30 days.

If you’d like to add additional credits before your existing ones expire or are 
depleted, please contact us at [sales@clickhouse.com](sales@clickhouse.com).
