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
import aws_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-10.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import aws_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-12.png';
import Image from '@theme/IdealImage';

Get started with ClickHouse Cloud on the [AWS Marketplace](https://aws.amazon.com/marketplace) via a PAYG (Pay-as-you-go) Public Offer.

## Prerequisites {#prerequisites}

- An AWS account that is enabled with purchasing rights by your billing administrator.
- To purchase, you must be logged into the AWS marketplace with this account.

## Steps to sign up {#steps-to-sign-up}

1. Go to the [AWS Marketplace](https://aws.amazon.com/marketplace) and search for ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_1} size="md" alt="AWS Marketplace home page" border/>

<br />

2. Click on the [listing](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) and then on **View purchase options**.

<br />

<Image img={aws_marketplace_payg_2} size="md" alt="AWS Marketplace search for ClickHouse" border/>

<br />

3. On the next screen, configure the contract:
- **Length of contract** - PAYG contracts run month to month.
- **Renewal settings** - You can set the contract to auto-renew or not.
Note that we strongly recommend keeping your subscription set to auto-renew every month. However, if you don't enable auto renewal, your organization is automatically put into a grace period at the end of the billing cycle and then decommissioned.

- **Contract options** - You can input any number (or just 1) into this text box. This will not affect the price you pay as the price for these units for the public offer is $0. These units are usually used when accepting a private offer from ClickHouse Cloud.

- **Purchase order** - This is optional and you can ignore this.

<br />

<Image img={aws_marketplace_payg_3} size="md" alt="AWS Marketplace configure contract" border/>

<br />

After filling out the above information, click on **Create Contract**. You can confirm that the contract price displayed is zero dollars which essentially means that you have no payment due and will incur charges based on usage.

<br />

<Image img={aws_marketplace_payg_4} size="md" alt="AWS Marketplace confirm contract" border/>

<br />

4. Once you click **Create Contract**, you will see a modal to confirm and pay ($0 due).

5. Once you click **Pay now**, you will see a confirmation that you are now subscribed to the AWS Marketplace offering for ClickHouse Cloud.

<br />

<Image img={aws_marketplace_payg_5} size="md" alt="AWS Marketplace payment confirmation" border/>

<br />

6. Note that at this point, the setup is not complete yet. You will need to redirect to ClickHouse Cloud by clicking on **Set up your account** and signing up on ClickHouse Cloud.

7. Once you redirect to ClickHouse Cloud, you can either login with an existing account, or register with a new account. This step is very important so we can bind your ClickHouse Cloud organization to the AWS Marketplace billing.

<br />

<Image img={aws_marketplace_payg_6} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

If you are a new ClickHouse Cloud user, click **Register** at the bottom of the page. You will be prompted to create a new user and verify the email. After verifying your email, you can leave the ClickHouse Cloud login page and login using the new username at the [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

<br />

<Image img={aws_marketplace_payg_7} size="md" alt="ClickHouse Cloud sign up page" border/>

<br />

Note that if you are a new user, you will also need to provide some basic information about your business. See the screenshots below.

<br />

<Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

<br />

<br />

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

If you are an existing ClickHouse Cloud user, simply log in using your credentials.

8. After successfully logging in, a new ClickHouse Cloud organization will be created. This organization will be connected to your AWS billing account and all usage will be billed via your AWS account.

9. Once you login, you can confirm that your billing is in fact tied to the AWS Marketplace and start setting up your ClickHouse Cloud resources.

<br />

<Image img={aws_marketplace_payg_10} size="md" alt="ClickHouse Cloud view AWS Marketplace billing" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

10. You should receive an email confirming the sign up:

<br />

<Image img={aws_marketplace_payg_12} size="md" alt="AWS Marketplace confirmation email" border/>

<br />

If you run into any issues, please do not hesitate to contact [our support team](https://clickhouse.com/support/program).
