---
slug: /cloud/billing/marketplace/aws-marketplace-committed-contract
title: AWS Marketplace Committed Contract
description: Subscribe to ClickHouse Cloud through the AWS Marketplace (Committed Contract)
keywords: [aws, amazon, marketplace, billing, committed, committed contract]
---

Get started with ClickHouse Cloud on the [AWS Marketplace](https://aws.amazon.com/marketplace) via a committed contract. A committed contract, also known as a a Private Offer, allows customers to commit to spending a certain amount on ClickHouse Cloud over a period of time.

## Prerequisites {#prerequisites}

- A Private Offer from ClickHouse based on specific contract terms.

## Steps to sign up {#steps-to-sign-up}

1. You should have received an email with a link to review and accept your private offer.

<br />

<img src={require('./images/aws-marketplace-committed-1.png').default}
    alt='AWS Marketplace private offer email'
    class='image'
    style={{width: '400px'}}
/>

<br />

2. Click on the **Review Offer** link in the email. This should take you to your AWS Marketplace page with the private offer details. While accepting the private offer, choose a value of 1 for the number of units in the Contract Options picklist. 

3. Complete the steps to subscribe on the AWS portal and click on **Set up your account**.
It is critical to redirect to ClickHouse Cloud at this point and either register for a new account, or sign in with an existing account. Without completing this step, we will not be able to link your AWS Marketplace subscription to ClickHouse Cloud.

4. Once you redirect to ClickHouse Cloud, you can either login with an existing account, or register with a new account. This step is very important so we can bind your ClickHouse Cloud organization to the AWS Marketplace billing.

<br />

<img src={require('./images/aws-marketplace-payg-6.png').default}
    alt='ClickHouse Cloud sign in page'
    class='image'
    style={{width: '300px'}}
/>

<br />

If you are a new ClickHouse Cloud user, click **Register** at the bottom of the page. You will be prompted to create a new user and verify the email. After verifying your email, you can leave the ClickHouse Cloud login page and login using the new username at the [https://console.clickhouse.cloud](https://console.clickhouse.cloud).

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

5. After successfully logging in, a new ClickHouse Cloud organization will be created. This organization will be connected to your AWS billing account and all usage will be billed via your AWS account.

6. Once you login, you can confirm that your billing is in fact tied to the AWS Marketplace and start setting up your ClickHouse Cloud resources.

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

6. You should receive an email confirming the sign up:

<br />

<img src={require('./images/aws-marketplace-payg-12.png').default}
    alt='AWS Marketplace confirmation email'
    class='image'
    style={{width: '500px'}}
/>

<br />

If you run into any issues, please do not hesitate to contact [our support team](https://clickhouse.com/support/program).
