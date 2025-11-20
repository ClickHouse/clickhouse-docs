---
'slug': '/cloud/billing/marketplace/aws-marketplace-payg'
'title': 'AWS Marketplace PAYG'
'description': 'AWS Marketplace (PAYG)을 통해 ClickHouse Cloud에 구독하세요.'
'keywords':
- 'aws'
- 'marketplace'
- 'billing'
- 'PAYG'
'doc_type': 'guide'
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

- 구매 권한이 있는 청구 관리자에 의해 활성화된 AWS 계정.
- 구매하려면 이 계정으로 AWS 마켓플레이스에 로그인해야 합니다.
- ClickHouse 조직을 구독에 연결하려면 해당 조직의 관리자가 되어야 합니다.

:::note
하나의 AWS 계정은 “ClickHouse Cloud - Pay As You Go” 구독에만 가입할 수 있으며, 이는 하나의 ClickHouse 조직에만 연결될 수 있습니다.
:::

## Steps to sign up {#steps-to-sign-up}

<VerticalStepper headerLevel="h3">

### Search for Clickhouse Cloud - Pay As You Go {#search-payg}

Go to the [AWS Marketplace](https://aws.amazon.com/marketplace) and search for “ClickHouse Cloud - Pay As You Go”.

<Image img={aws_marketplace_payg_1} alt="AWS Marketplace search for ClickHouse" border/>

### View purchase options {#purchase-options}

Click on the [listing](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu) and then on **View purchase options**.

<Image img={aws_marketplace_payg_2} alt="AWS Marketplace view purchase options" border/>

### Subscribe {#subscribe}

On the next screen, click subscribe.

:::note
**구매 주문 (PO) 번호**는 선택 사항이며 무시할 수 있습니다.
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

### Add the Marketplace Subscription to an Organization {#add-marketplace-subscription}

After successfully logging in, you can decide whether to create a new organization to bill to this marketplace subscription or choose an existing organization to bill to this subscription. 

<Image img={aws_marketplace_payg_8} size="md" alt="Add marketplace subscription" border/>

After completing this step your organization will be connected to this AWS subscription and all usage will be billed via your AWS account.

You can confirm from the organization's billing page in the ClickHouse UI that billing is indeed now linked to the AWS marketplace.

<Image img={aws_marketplace_payg_9} size="lg" alt="Confirm billing page" border/>

</VerticalStepper>

## Support {#support}

If you run into any issues, please do not hesitate to contact [our support team](https://clickhouse.com/support/program).
