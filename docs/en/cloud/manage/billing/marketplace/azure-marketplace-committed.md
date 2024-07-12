---
slug: /en/cloud/billing/marketplace/azure-marketplace-committed-contract
title: Azure Marketplace Committed Contract
description: Subscribe to ClickHouse Cloud through the Azure Marketplace (Committed Contract).
keywords: [azure, marketplace, billing, committed, committed contract]
---

Get started with ClickHouse Cloud on the [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) via a committed contract. A committed contract, also known as a a Private Offer, allows customers to commit to spending a certain amount on ClickHouse Cloud over a period of time.


## Prerequisites

- A Private Offer from ClickHouse based on specific contract terms.

## Steps to sign up

1. You should have received an email with a link to review and accept your private offer.

<br />

<img src={require('./images/azure-marketplace-committed-1.png').default}
    alt='Azure Marketplace private offer email'
    class='image'
    style={{width: '400px'}}
/>

<br />

2. Click on the **Review Private Offer** link in the email. This should take you to your GCP Marketplace page with the private offer details.

<br />

<img src={require('./images/azure-marketplace-committed-2.png').default}
    alt='Azure Marketplace private offer details'
    class='image'
    style={{width: '600px'}}
/>

<br />

3. Once you accept the offer, you will be taken to a **Private Offer Management** screen. Azure may take some time to prepare the offer for purchase.

<br />

<img src={require('./images/azure-marketplace-committed-3.png').default}
    alt='Azure Marketplace Private Offer Management page'
    class='image'
    style={{width: '600px'}}
/>

<br />

<img src={require('./images/azure-marketplace-committed-4.png').default}
    alt='Azure Marketplace Private Offer Management page loading'
    class='image'
    style={{width: '600px'}}
/>

<br />

4. After a few minutes, refresh the page. The offer should be ready for **Purchase**.

<br />

<img src={require('./images/azure-marketplace-committed-5.png').default}
    alt='Azure Marketplace Private Offer Management page purchase enabled'
    class='image'
    style={{width: '500px'}}
/>

<br />

5. Click on **Purchase** - you will see a flyout open. Complete the following:

<br />

- Subscription and resource group 
- Provide a name for the SaaS subscription
- Choose the billing plan that you have a private offer for. Only the term that the private offer was created (for example, 1 year) will have an amount against it. Other billing term options will be for $0 amounts. 
- Choose whether you want recurring billing or not. If recurring billing is not selected, the contract will end at the end of the billing period and the resources will be set to decommissioned.
- Click on **Review + subscribe**.

<br />

<img src={require('./images/azure-marketplace-committed-6.png').default}
    alt='Azure Marketplace subscription form'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. On the next screen, review all the details and hit **Subscribe**.

<br />

<img src={require('./images/azure-marketplace-committed-7.png').default}
    alt='Azure Marketplace subscription confirmation'
    class='image'
    style={{width: '500px'}}
/>

<br />

7. On the next screen, you will see **Your SaaS subscription in progress**.

<br />

<img src={require('./images/azure-marketplace-committed-8.png').default}
    alt='Azure Marketplace subscription submitting page'
    class='image'
    style={{width: '500px'}}
/>

<br />

8. Once ready, you can click on **Configure account now**. Note that is a critical step that binds the Azure subscription to a ClickHouse Cloud organization for your account. Without this step, your Marketplace subscription is not complete.

<br />

<img src={require('./images/azure-marketplace-committed-9.png').default}
    alt='Azure Marketplace configure account now button'
    class='image'
    style={{width: '400px'}}
/>

<br />

9. You will be redirected to the ClickHouse Cloud sign up or sign in page. You can either sign up using a new account or sign in using an existing account. Once you are signed in, a new organization will be created that is ready to be used and billed via the Azure Marketplace.

10. You will need to answer a few questions - address and company details - before you can proceed.

<br />

<img src={require('./images/aws-marketplace-payg-8.png').default}
    alt='ClickHouse Cloud sign up info form'
    class='image'
    style={{width: '400px'}}
/>

<br />

<img src={require('./images/aws-marketplace-payg-9.png').default}
    alt='ClickHouse Cloud sign up info form 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

11. Once you hit **Complete sign up**, you will be taken to your organization within ClickHouse Cloud where you can view the billing screen to ensure you are being billed via the Azure Marketplace and can create services.

<br />

<br />

<img src={require('./images/azure-marketplace-payg-11.png').default}
    alt='ClickHouse Cloud sign up info form'
    class='image'
    style={{width: '300px'}}
/>

<br />

<br />

<img src={require('./images/azure-marketplace-payg-12.png').default}
    alt='ClickHouse Cloud sign up info form'
    class='image'
    style={{width: '500px'}}
/>

<br />

If you run into any issues, please do not hesitate to contact [our support team](https://clickhouse.com/support/program).

