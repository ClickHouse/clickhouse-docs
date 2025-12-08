---
slug: /cloud/billing/marketplace/aws-marketplace-payg
title: 'AWS Marketplace PAYG'
description: 'Subscribe to ClickHouse Cloud through the AWS Marketplace (PAYG).'
keywords: ['aws', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
---

import aws_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-1.png';
import aws_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-2.png';
import aws_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-3.png';
import aws_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-4.png';
import aws_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-5.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import Image from '@theme/IdealImage';

Get started with ClickHouse Cloud on the [AWS Marketplace](https://aws.amazon.com/marketplace) via a PAYG (Pay-as-you-go) Public Offer.

## Prerequisites {#prerequisites}

- An AWS account that is enabled with purchasing rights by your billing administrator.
- To purchase, you must be logged into the AWS marketplace with this account.
- To connect a ClickHouse organization to your subscription, you must be an admin of that organization.

:::note
One AWS account can only subscribe to one “ClickHouse Cloud - Pay As You Go” subscription which can only be linked to one ClickHouse organization.
:::

## Steps to sign up {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### Search for ClickHouse cloud - pay as you Go {#search-payg}

Go to the [AWS Marketplace](https://aws.amazon.com/marketplace) and search for “ClickHouse Cloud - Pay As You Go”.

<Image img={aws_marketplace_payg_1} alt="AWS Marketplace search for ClickHouse" border/>

### View purchase options {#purchase-options}

Click on the [listing](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu) and then on **View purchase options**.

<Image img={aws_marketplace_payg_2} alt="AWS Marketplace view purchase options" border/>

### Subscribe {#subscribe}

On the next screen, click subscribe.

:::note
**Purchase order (PO) number** is optional and can be ignored.
**There are two offers available on this listing.** If you choose the offer option for "ClickHouse Cloud - Pay As You Go Free Trial," you’ll be subscribing to a 30-day AWS-managed free trial. However, once the 30 days have passed, the listing subscription will end, and you’ll need to re-subscribe to the other "ClickHouse Cloud - Pay As You Go" offer option on this listing to continue using ClickHouse Pay As You Go.
:::

<Image img={aws_marketplace_payg_3} alt="AWS Marketplace subscribe" border/>

### Set up your account {#set-up-your-account}

Note that at this point, the setup is not complete and your ClickHouse Cloud organization is not being billed through the marketplace yet. You will now need to click on Set up your account on your marketplace subscription to redirect to ClickHouse Cloud to finish setup.

<Image img={aws_marketplace_payg_4} alt="Set up your account" border/>

Once you redirect to ClickHouse Cloud, you can either login with an existing account, or register with a new account. This step is very important so we can bind your ClickHouse Cloud organization to your AWS Marketplace billing.

:::note[New Clickhouse Cloud Users]
If you are a new ClickHouse Cloud user, follow the steps below.
:::

<details>
<summary><strong>Steps for new users</strong></summary>

If you are a new ClickHouse Cloud user, click Register at the bottom of the page. You will be prompted to create a new user and verify the email. After verifying your email, you can leave the ClickHouse Cloud login page and login using the new username at the https://console.clickhouse.cloud.

<Image img={aws_marketplace_payg_5} size="md" alt="Clickhouse Cloud sign-up"/>

:::note[New users]
You will also need to provide some basic information about your business. See the screenshots below.
:::

<Image img={aws_marketplace_payg_6} size="md" alt="Before you start"/>

<Image img={aws_marketplace_payg_7} size="md" alt="Before you star continued"/>

</details>

If you are an existing ClickHouse Cloud user, simply log in using your credentials.

### Add the marketplace subscription to an organization {#add-marketplace-subscription}

After successfully logging in, you can decide whether to create a new organization to bill to this marketplace subscription or choose an existing organization to bill to this subscription. 

<Image img={aws_marketplace_payg_8} size="md" alt="Add marketplace subscription" border/>

After completing this step your organization will be connected to this AWS subscription and all usage will be billed via your AWS account.

You can confirm from the organization's billing page in the ClickHouse UI that billing is indeed now linked to the AWS marketplace.

<Image img={aws_marketplace_payg_9} size="lg" alt="Confirm billing page" border/>

</VerticalStepper>

## Support {#support}

If you run into any issues, please do not hesitate to contact [our support team](https://clickhouse.com/support/program).
