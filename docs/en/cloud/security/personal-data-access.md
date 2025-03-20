---
sidebar_label: Personal Data Access
slug: /en/cloud/security/personal-data-access
title: Personal Data Access
---

## Intro

As a registered user, ClickHouse allows you to view and manage your personal account data, including contact information. Depending on your role, this may also include access to the contact information of other users in your organization, API key details, and other relevant information. You can manage these details directly through the ClickHouse console on a self-serve basis.

**What is a Data Subject Access Request (DSAR)**

Depending on where you are located, applicable law may also provide you additional rights as to personal data that ClickHouse holds about you (Data Subject Rights), as described in the ClickHouse Privacy Policy.  The process for exercising Data Subject Rights is known as a Data Subject Access Request (DSAR).

**Scope of Personal Data**

Please review ClickHouse’s Privacy Policy for details on personal data that ClickHouse collects and how it may be used.

## Self Service

By default, ClickHouse empowers users to view their personal data directly from the ClickHouse console.

Below is a summary of the data ClickHouse collects during account setup and service usage, along with information on where specific personal data can be viewed within the ClickHouse console.

| Location/URL | Description | Personal Data |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | Account registration | email, password |
| https://console.clickhouse.cloud/profile | General user profile details |  name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | List of users in an organization | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | List of API keys and who created them | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | Activity log, listing actions by individual users | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | Billing information and invoices | billing address, email |
| https://console.clickhouse.cloud/support | Interactions with ClickHouse Support | name, email |

Note: URLs with `OrgID` need to be updated to reflect the `OrgID` for your specific account.

### Current Customers

If you have an account with us and the self-service option has not resolved your personal data issue, you can submit a Data Subject Access Request under the Privacy Policy. To do so, log into your ClickHouse account and open a [support case](https://console.clickhouse.cloud/support). This helps us verify your identity and streamline the process to address your request.

Please be sure to include the following details in your support case:

| Field | Text to include in your request |
|-------------|---------------------------------------------------|
| Subject     | Data Subject Access Request (DSAR)                |
| Description | Detailed description of the information you’d like ClickHouse to look for, collect, and/or provide. |

<img src={require('./images/support-case-form.png').default}
  class="image"
  alt="Support Case Form"
  style={{width: '30%'}} />

### Individuals Without an Account

If you do not have an account with us and the self-service option above has not resolved your personal-data issue, and you wish to make a Data Subject Access Request pursuant to the Privacy Policy, you may submit these requests by email to [privacy@clickhouse.com](mailto:privacy@clickhouse.com).

## Identity Verification

Should you submit a Data Subject Access Request through email, we may request specific information from you to help us confirm your identity and process your request. Applicable law may require or permit us to decline your request. If we decline your request, we will tell you why, subject to legal restrictions. 

For more information, please review the [ClickHouse Privacy Policy](https://clickhouse.com/legal/privacy-policy)
