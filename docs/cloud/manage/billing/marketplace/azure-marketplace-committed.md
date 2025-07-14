---
slug: /cloud/billing/marketplace/azure-marketplace-committed-contract
title: 'Azure Marketplace Committed Contract'
description: 'Subscribe to ClickHouse Cloud through the Azure Marketplace (Committed Contract)'
keywords: ['Microsoft', 'Azure', 'marketplace', 'billing', 'committed', 'committed contract']
---

import Image from '@theme/IdealImage';
import azure_marketplace_committed_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-1.png';
import azure_marketplace_committed_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-2.png';
import azure_marketplace_committed_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-3.png';
import azure_marketplace_committed_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-4.png';
import azure_marketplace_committed_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-5.png';
import azure_marketplace_committed_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-6.png';
import azure_marketplace_committed_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-7.png';
import azure_marketplace_committed_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-8.png';
import azure_marketplace_committed_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-committed-9.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

Get started with ClickHouse Cloud on the [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) via a committed contract. A committed contract, also known as a a Private Offer, allows customers to commit to spending a certain amount on ClickHouse Cloud over a period of time.

## Prerequisites {#prerequisites}

- A Private Offer from ClickHouse based on specific contract terms.

## Steps to sign up {#steps-to-sign-up}

1. You should have received an email with a link to review and accept your private offer.

    <Image img={azure_marketplace_committed_1} size="md" alt="Azure Marketplace private offer email" border/>

2. Click on the **Review Private Offer** link in the email. This should take you to your GCP Marketplace page with the private offer details.

    <Image img={azure_marketplace_committed_2} size="md" alt="Azure Marketplace private offer details" border/>

3. Once you accept the offer, you will be taken to a **Private Offer Management** screen. Azure may take some time to prepare the offer for purchase.

    <Image img={azure_marketplace_committed_3} size="md" alt="Azure Marketplace Private Offer Management page" border/>

    <Image img={azure_marketplace_committed_4} size="md" alt="Azure Marketplace Private Offer Management page loading" border/>

4. After a few minutes, refresh the page. The offer should be ready for **Purchase**.

    <Image img={azure_marketplace_committed_5} size="md" alt="Azure Marketplace Private Offer Management page purchase enabled" border/>

5. Click on **Purchase** - you will see a flyout open. Complete the following:

- Subscription and resource group
- Provide a name for the SaaS subscription
- Choose the billing plan that you have a private offer for. Only the term that the private offer was created (for example, 1 year) will have an amount against it. Other billing term options will be for $0 amounts.
- Choose whether you want recurring billing or not. If recurring billing is not selected, the contract will end at the end of the billing period and the resources will be set to decommissioned.
- Click on **Review + subscribe**.

    <Image img={azure_marketplace_committed_6} size="md" alt="Azure Marketplace subscription form" border/>

6. On the next screen, review all the details and hit **Subscribe**.

    <Image img={azure_marketplace_committed_7} size="md" alt="Azure Marketplace subscription confirmation" border/>

7. On the next screen, you will see **Your SaaS subscription in progress**.

    <Image img={azure_marketplace_committed_8} size="md" alt="Azure Marketplace subscription submitting page" border/>

8. Once ready, you can click on **Configure account now**. Note that is a critical step that binds the Azure subscription to a ClickHouse Cloud organization for your account. Without this step, your Marketplace subscription is not complete.

    <Image img={azure_marketplace_committed_9} size="md" alt="Azure Marketplace configure account now button" border/>

9. You will be redirected to the ClickHouse Cloud sign up or sign in page. You can either sign up using a new account or sign in using an existing account. Once you are signed in, a new organization will be created that is ready to be used and billed via the Azure Marketplace.

10. You will need to answer a few questions - address and company details - before you can proceed.

    <Image img={aws_marketplace_payg_8} size="md" alt="ClickHouse Cloud sign up info form" border/>

    <Image img={aws_marketplace_payg_9} size="md" alt="ClickHouse Cloud sign up info form 2" border/>

11. Once you hit **Complete sign up**, you will be taken to your organization within ClickHouse Cloud where you can view the billing screen to ensure you are being billed via the Azure Marketplace and can create services.

    <Image img={azure_marketplace_payg_11} size="sm" alt="ClickHouse Cloud sign up info form" border/>

    <Image img={azure_marketplace_payg_12} size="md" alt="ClickHouse Cloud sign up info form" border/>

    If you run into any issues, please do not hesitate to contact [our support team](https://clickhouse.com/support/program).
