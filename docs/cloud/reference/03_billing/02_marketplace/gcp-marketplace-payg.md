---
slug: /cloud/billing/marketplace/gcp-marketplace-payg
title: 'GCP Marketplace PAYG'
description: 'Subscribe to ClickHouse Cloud through the GCP Marketplace (PAYG).'
keywords: ['gcp', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
---

import gcp_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-1.png';
import gcp_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-2.png';
import gcp_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-3.png';
import gcp_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-4.png';
import aws_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-6.png';
import aws_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-7.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import gcp_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-5.png';
import aws_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-11.png';
import gcp_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/gcp-marketplace-payg-6.png';
import Image from '@theme/IdealImage';

Get started with ClickHouse Cloud on the [GCP Marketplace](https://console.cloud.google.com/marketplace) via a PAYG (Pay-as-you-go) Public Offer.

## Prerequisites {#prerequisites}

- A GCP project that is enabled with purchasing rights by your billing administrator.
- To subscribe to ClickHouse Cloud on the GCP Marketplace, you must be logged in with an account that has purchasing rights and choose the appropriate project.

## Steps to sign up {#steps-to-sign-up}

1. Go to the [GCP Marketplace](https://cloud.google.com/marketplace) and search for ClickHouse Cloud. Make sure you have the correct project chosen.

<Image img={gcp_marketplace_payg_1} size="md" alt="GCP Marketplace home page" border/>

2. Click on the [listing](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud) and then on **Subscribe**.

<Image img={gcp_marketplace_payg_2} size="md" alt="ClickHouse Cloud in GCP Marketplace" border/>

3. On the next screen, configure the subscription:

- The plan will default to "ClickHouse Cloud"
- Subscription time frame is "Monthly"
- Choose the appropriate billing account
- Accept the terms and click **Subscribe**

<br />

<Image img={gcp_marketplace_payg_3} size="sm" alt="Configure subscription in GCP Marketplace" border/>

<br />

4. Once you click **Subscribe**, you will see a modal **Sign up with ClickHouse**.

<br />

<Image img={gcp_marketplace_payg_4} size="md" alt="GCP Marketplace sign up modal" border/>

<br />

5. Note that at this point, the setup is not complete yet. You will need to redirect to ClickHouse Cloud by clicking on **Set up your account** and signing up on ClickHouse Cloud.

6. Once you redirect to ClickHouse Cloud, you can either login with an existing account, or register with a new account. This step is very important so we can bind your ClickHouse Cloud organization to the GCP Marketplace billing.

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

<Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

<br />

If you are an existing ClickHouse Cloud user, simply log in using your credentials.

7. After successfully logging in, a new ClickHouse Cloud organization will be created. This organization will be connected to your GCP billing account and all usage will be billed via your GCP account.

8. Once you login, you can confirm that your billing is in fact tied to the GCP Marketplace and start setting up your ClickHouse Cloud resources.

<br />

<Image img={gcp_marketplace_payg_5} size="md" alt="ClickHouse Cloud sign in page" border/>

<br />

<Image img={aws_marketplace_payg_11} size="md" alt="ClickHouse Cloud new services page" border/>

<br />

9. You should receive an email confirming the sign up:

<br />
<br />

<Image img={gcp_marketplace_payg_6} size="md" alt="GCP Marketplace confirmation email" border/>

<br />

<br />

If you run into any issues, please do not hesitate to contact [our support team](https://clickhouse.com/support/program).
