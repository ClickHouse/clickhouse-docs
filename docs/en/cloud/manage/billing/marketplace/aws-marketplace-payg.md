---
slug: /en/cloud/billing/marketplace/aws-marketplace-payg
title: AWS Marketplace PAYG
description: Subscribe to ClickHouse Cloud through the AWS Marketplace (PAYG).
keywords: [aws, marketplace, billing, payg]
---

Get started with ClickHouse Cloud on the [AWS Marketplace](https://aws.amazon.com/marketplace) via a PAYG (Pay-as-you-go) Public Offer.

## Prerequisites

- An AWS account that is enabled with purchasing rights by your billing administrator.
- To purchase, you must be logged into the AWS marketplace with this account.

## Steps to sign up

1. Go to the [AWS Marketplace](https://aws.amazon.com/marketplace) and search for ClickHouse Cloud.

<br />

<img src={require('./images/aws-marketplace-payg-1.png').default}
    alt='AWS Marketplace home page'
    class='image'
    style={{width: '500px'}}
/>

<br />

2. Click on the [listing](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) and then on **View purchase options**.

<br />

<img src={require('./images/aws-marketplace-payg-2.png').default}
    alt='AWS Marketplace search for ClickHouse'
    class='image'
    style={{width: '500px'}}
/>

<br />

3. On the next screen, configure the contract:
- **Length of contract** - PAYG contracts run month to month.
- **Renewal settings** - You can set the contract to auto renew or not. 
Note that if you don't enable auto renewal, your organization is automatically put into a grace period at the end of the billing cycle and then decommissioned.

- **Contract options** - You can input any number (or just 1) into this text box. This will not affect the price you pay as the price for these units for the public offer is $0. These units are usually used when accepting a private offer from ClickHouse Cloud.

- **Purchase order** - This is optional and you can ignore this.

<br />

<img src={require('./images/aws-marketplace-payg-3.png').default}
    alt='AWS Marketplace configure contract'
    class='image'
    style={{width: '500px'}}
/>

<br />

After filling out the above information, click on **Create Contract**. You can confirm that the contract price displayed is zero dollars which essentially means that you have no payment due and will incur charges based on usage.

<br />

<img src={require('./images/aws-marketplace-payg-4.png').default}
    alt='AWS Marketplace confirm contract'
    class='image'
    style={{width: '500px'}}
/>

<br />

4. Once you click **Create Contract**, you will see a modal to confirm and pay ($0 due).

5. Once you click **Pay now**, you will see a confirmation that you are now subscribed to the AWS Marketplace offering for ClickHouse Cloud.

<br />

<img src={require('./images/aws-marketplace-payg-5.png').default}
    alt='AWS Marketplace payment confirmation'
    class='image'
    style={{width: '500px'}}
/>

<br />

6. Note that at this point, the setup is not complete yet. You will need to redirect to ClickHouse Cloud by clicking on **Set up your account** and signing up on ClickHouse Cloud.

7. Once you redirect to ClickHouse Cloud, you can either login with an existing account, or register with a new account. This step is very important so we can bind your ClickHouse Cloud organization to the AWS Marketplace billing.

<br />

<img src={require('./images/aws-marketplace-payg-6.png').default}
    alt='ClickHouse Cloud sign in page'
    class='image'
    style={{width: '300px'}}
/>

<br />

If you are a new ClickHouse Cloud user, click **Register** at the bottom of the page. You will be prompted to create a new user and verify the email. After verifying your email, you can leave the ClickHouse Cloud login page and login using the new username at the [https://clickhouse.cloud](https://clickhouse.cloud).

<br />

<img src={require('./images/aws-marketplace-payg-7.png').default}
    alt='ClickHouse Cloud sign up page'
    class='image'
    style={{width: '500px'}}
/>

<br />

Note that if you are a new user, you will also need to provide some basic information about your business. See the screenshots below.

<br />

<img src={require('./images/aws-marketplace-payg-8.png').default}
    alt='ClickHouse Cloud sign up info form'
    class='image'
    style={{width: '400px'}}
/>

<br />

<br />

<img src={require('./images/aws-marketplace-payg-9.png').default}
    alt='ClickHouse Cloud sign up info form 2'
    class='image'
    style={{width: '400px'}}
/>

<br />

If you are an existing ClickHouse Cloud user, simply log in using your credentials.

8. After successfully logging in, a new ClickHouse Cloud organization will be created. This organization will be connected to your AWS billing account and all usage will be billed via your AWS account.

9. Once you login, you can confirm that your billing is in fact tied to the AWS Marketplace and start setting up your ClickHouse Cloud resources.

<br />

<img src={require('./images/aws-marketplace-payg-10.png').default}
    alt='ClickHouse Cloud view AWS Marketplace billing'
    class='image'
    style={{width: '300px'}}
/>

<br />

<img src={require('./images/aws-marketplace-payg-11.png').default}
    alt='ClickHouse Cloud new services page'
    class='image'
    style={{width: '400px'}}
/>

<br />

10. You should receive an email confirming the sign up:

<br />

<img src={require('./images/aws-marketplace-payg-12.png').default}
    alt='AWS Marketplace confirmation email'
    class='image'
    style={{width: '500px'}}
/>

<br />

If you run into any issues, please do not hesitate to contact [our support team](https://clickhouse.com/support/program).
