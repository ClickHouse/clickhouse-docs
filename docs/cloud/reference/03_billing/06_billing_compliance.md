---
sidebar_label: 'ClickHouse Cloud billing compliance'
slug: /manage/clickhouse-cloud-billing-compliance
title: 'ClickHouse Cloud billing compliance'
description: 'Page describing ClickHouse Cloud billing compliance'
keywords: ['billing compliance', 'pay-as-you-go']
doc_type: 'guide'
---

import billing_compliance from '@site/static/images/cloud/manage/billing_compliance.png';
import Image from '@theme/IdealImage';

# ClickHouse Cloud billing compliance

## Billing compliance {#billing-compliance}

Your use of ClickHouse Cloud requires your organization to have an active and 
valid billing method configured. After your 30 day trial ends or your trial 
credits are depleted, whichever occurs first, you have the following billing 
options to continue using ClickHouse Cloud:

| Billing option                                       | Description                                                                             |
|------------------------------------------------------|-----------------------------------------------------------------------------------------|
| [Direct PAYG](#direct-payg)                          | Add a valid credit card to your organization to Pay-As-You-Go                           |
| [Marketplace PAYG](#cloud-marketplace-payg)          | Set up a Pay-As-You-Go subscription via a supported cloud marketplace provider          |
| [Committed spend contract](#committed-spend-contract) | Enter into a committed spend contract directly or through a supported cloud marketplace |

If your trial ends and no billing option has been configured for your organization,
all your services will be stopped. If a billing method still has not been 
configured after two weeks, all your data will be deleted.

ClickHouse charges for services at the organization level. If we are ever unable
to process a payment using your current billing method, you must update it to one
of the three options listed above to avoid service disruption. See below for more
details about payment compliance based on your chosen billing method.

### Pay-as-you-go billing with a credit card {#direct-payg}

You can pay for your ClickHouse Cloud usage monthly in arrears using a credit card.
To add a credit card, follow these [instructions](#add-credit-card).

Your monthly billing cycle for ClickHouse begins on the day the organization tier
(Basic, Scale, or Enterprise) is selected, and the first service is created within
the organization. 

The credit card on file normally will be charged at the end of your monthly 
billing cycle, but payment charges will be accelerated if the intracycle amount
due reaches $10,000 USD (more info on payment thresholds [here](/cloud/billing/payment-thresholds)).

The credit card on file must be valid, not expired, and have enough available 
credit to cover your invoice total. If, for any reason, we are unable to charge 
the full amount due, the following unpaid invoice restrictions will immediately
apply:

* You will only be able to scale up to 120 GiB per replica
* You will not be able to start your services if stopped
* You will not be able to start or create new services

We will attempt to process payment using the organization's configured billing 
method for up to 30 days. If payment is not successful after 14 days, all services
within the organization will be stopped. If payment is still not received by the 
end of this 30 day period and we have not granted an extension, all data and 
services associated with your organization will be deleted.

### Cloud marketplace pay-as-you-go billing {#cloud-marketplace-payg}

Pay-As-You-Go billing can also be configured to charge an organization through one of our supported cloud marketplaces 
(AWS, GCP, or Azure). To sign up for Marketplace PAYG billing, follow these 
[instructions](#marketplace-payg).

Similar to billing via Direct PAYG, your monthly billing cycle with ClickHouse 
under Marketplace PAYG begins on the day the organization tier (Basic, Scale, 
or Enterprise) is selected and the first service is created within the 
organization.

However, because of the requirements of the marketplaces, we report the charges 
for your Pay-As-You-Go usage on an hour-by-hour basis. Note that you will be 
invoiced according to the terms of your agreement with that marketplace - typically
on a calendar-month billing cycle. 

As an example, if you create your first organization service on January 18, your 
first billing usage cycle in ClickHouse Cloud will run from January 18 until the
end of the day on February 17. However, you may receive your first invoice from 
the cloud marketplace at the beginning of the month of February.

However, if your PAYG marketplace subscription is canceled or fails to renew 
automatically, billing will fall back to the credit card on file for the 
organization, if any. To add a credit card, please [contact support](/about-us/support)
for help. If a valid credit card has not been provided, the same unpaid invoice 
restrictions outlined above for [Direct PAYG](#direct-payg) will apply - this 
includes service suspension and eventual data deletion.

### Committed contract billing {#committed-spend-contract}

You may purchase credits for your organization through a committed contract by:

1. Contacting sales to buy credits directly, with payment options including ACH 
   or wire transfer. Payment terms will be set forth in the applicable order form.
2. Contacting sales to buy credits through a subscription on one of our supported
   cloud marketplaces (AWS, GCP, or Azure). Fees will be reported to the applicable
   marketplace upon acceptance of the private offer and thereafter in accordance 
   with the offer terms, but you will be invoiced according to the terms of your
   agreement with that marketplace. To pay through a marketplace, follow these
   [instructions](#marketplace-payg).

Credits applied to an organization (e.g. through committed contracts or refunds) are
available for your use for the term specified in the order form or accepted private 
offer.
Credits are consumed starting on the day credit was granted in billing periods 
based on the date the first organization tier (Basic, Scale, or Enterprise) is 
selected.

If an organization is **not** on a cloud marketplace committed contract and runs 
out of credits or the credits expire, the organization will automatically switch 
to Pay-As-You-Go (PAYG) billing. In this case, we will attempt to process payment 
using the credit card on file for the organization, if any.

If an organization **is** on a cloud marketplace committed contract and runs out
of credits, it will also automatically switch to PAYG billing via the same 
marketplace for the remainder of the subscription. However, if the subscription 
is not renewed and expires, we will then attempt to process payment using the 
credit card on file for the organization, if any.

In either scenario, if we are unable to charge the configured credit card, the 
unpaid invoice restrictions outlined above for [Pay-as-you-go (PAYG)](#direct-payg)
billing with a credit card will apply—this includes the suspension of services. 
For more details on moving from your committed contract to PAYG billing, please refer to the “Overconsumption” section in our [Terms and Conditions](https://clickhouse.com/legal/agreements/terms-of-service).
However, for committed contract customers, we will contact you regarding any 
unpaid invoices before initiating data deletion. Data is not automatically 
deleted after any period of time.

If you’d like to add additional credits before your existing ones expire or are 
depleted, please [contact us](https://clickhouse.com/company/contact).

### How to pay using a credit card {#add-credit-card}

Go to the Billing section in the ClickHouse Cloud UI and click the 'Add Credit Card'
button (shown below) to complete the setup. If you have any questions, please 
[contact support](/about-us/support) for help.

<Image img={billing_compliance} size="md" alt="How to add a credit card" />

## How to pay via marketplaces {#marketplace-payg}

If you want to pay through one of our supported marketplaces (AWS, GCP, or Azure),
you can follow the steps [here](/cloud/marketplace/marketplace-billing) for help. 
For any questions related specifically to cloud marketplace billing, please 
contact the cloud service provider directly.

Helpful links for resolving issues with marketplace billing:
* [AWS Billing FAQs](https://aws.amazon.com/aws-cost-management/aws-billing/faqs/)
* [GCP Billing FAQs](https://cloud.google.com/compute/docs/billing-questions)
* [Azure Billing FAQs](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-faq)
