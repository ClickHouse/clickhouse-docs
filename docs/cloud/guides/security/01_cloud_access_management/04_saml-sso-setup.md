---
sidebar_label: 'SAML SSO setup'
slug: /cloud/security/saml-setup
title: 'SAML SSO setup'
description: 'How to set up SAML SSO with ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'single sign-on', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlSelfServe1 from '@site/static/images/cloud/security/saml-self-serve-1.png';
import samlSelfServe2 from '@site/static/images/cloud/security/saml-self-serve-2.png';
import samlSelfServe3 from '@site/static/images/cloud/security/saml-self-serve-3.png';
import samlSelfServe4 from '@site/static/images/cloud/security/saml-self-serve-4.png';
import samlSelfServe5 from '@site/static/images/cloud/security/saml-self-serve-5.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

# SAML SSO setup

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud supports single-sign on (SSO) via security assertion markup language (SAML). This enables you to sign in securely to your ClickHouse Cloud organization by authenticating with your identity provider (IdP).

We currently support service provider-initiated SSO SSO, multiple organizations using separate connections, and just-in-time provisioning. We do not yet support a system for cross-domain identity management (SCIM) or attribute mapping.

Customers enabling SAML integrations can also designate the default role that will be assigned to new users and adjust session timeout settings.

## Before you begin {#before-you-begin}

You will need Admin permissions in your IdP, the ability to add a TXT record to the DNS settings for your domain, the **Admin** role in your ClickHouse Cloud organization. We recommend setting up a **direct link to your organization** in addition to your SAML connection to simplify the login process. Each IdP handles this differently. Read on for how to do this for your IdP.

## How to configure your IdP {#how-to-configure-your-idp}

### Steps {#steps}

<VerticalStepper headerLevel="h3">

### Access Organization settings {#access-organization-settings}

Click on your organization name in the lower left corner and select Organization details.

### Enable SAML single sign-on {#enable-saml-sso}

Click the toggle next to `Enable SAML single sign-on`. Leave this screen open as you will refer back to it several times during the setup process.

   <Image img={samlSelfServe1} size="lg" alt="Start SAML setup" force/>

### Create an application in your identity provider {#create-idp-application}

Create an application within your identity provider and copy the values on the `Enable SAML single sign-on` screen to your identity provider configuration. For more information on this step, refer to your specific identity provider below.

   - [Configure Okta SAML](#configure-okta-saml)
   - [Configure Google SAML](#configure-google-saml)
   - [Configure Azure (Microsoft) SAML](#configure-azure-microsoft-saml)
   - [Configure Duo SAML](#configure-duo-saml)

:::tip
ClickHouse does not support identity provider initiated sign-in. To make it easy for your users to access ClickHouse Cloud, set up a bookmark for your users using this sign-in URL format: `https://console.clickhouse.cloud/?connection={orgId}` where the `{orgID}` is your organization ID on the Organization details page.
:::

   <Image img={samlSelfServe2} size="lg" alt="Create identity provider application" force/>

### Add the metadata URL to your SAML configuration {#add-metadata-url}

Obtain the `Metadata URL` from your SAML provider. Return to ClickHouse Cloud, click `Next: Provide metadata URL` and paste the URL in the text box.

   <Image img={samlSelfServe3} size="lg" alt="Add metadata URL" force/> 

### Get domain verification code {#get-domain-verification-code}

Click `Next: Verify your domains`. Enter your domain in the text box and click `Check domain`. The system will generate a random verification code for you to add to a TXT record with your DNS provider. 

   <Image img={samlSelfServe4} size="lg" alt="Add domain to verify" force/> 

### Verify your domain {#verify-your-domain}

Create a TXT record with your DNS provider. Copy the `TXT record name` to the TXT record Name field with your DNS provider. Copy the `Value` to the Content field with your DNS provider. Click `Verify and Finish` to complete the process.

:::note
It may take several minutes for the DNS record to update and be verified. You may leave the setup page and return later to complete the process without restarting.
:::

   <Image img={samlSelfServe5} size="lg" alt="Verify your domain" force/> 

### Update default role and session timeout {#update-defaults}

Once the SAML setup is complete, you can set the default role all users will be assigned when they log in and also adjust session timeout settings.

Available default roles include:
   - Admin
   - Service Admin
   - Service Read Only
   - Member

For more information regarding permissions assigned to these roles, please review [Console roles and permissions](/cloud/security/console-roles).

### Configure your admin user {#configure-your-admin-user}

:::note
Users configured with a different authentication method will be retained until an admin in your organization removes them. 
:::

To assign your first admin user via SAML:
1. Log out of [ClickHouse Cloud](https://console.clickhouse.cloud).
2. In your identity provider, assign the admin user to the ClickHouse application(s).
3. Ask the user to log in via https://console.clickhouse.cloud/?connection={orgId} (shortcut URL). This may be via a bookmark you created in the prior steps. The user will not appear in ClickHouse Cloud until their first login.
4. If the default SAML role is anything other than Admin, the user may need to log out and log back in with their original authentication method to update the new SAML user's role. 
   - For email + password accounts, please use `https://console.clickhouse.cloud/?with=email`.
   - For social logins, please click the appropriate button (**Continue with Google** or **Continue with Microsoft**)

:::note
`email` in `?with=email` above is the literal parameter value, not a placeholder
:::

5. Log out one more time and log back in via the shortcut URL to complete the last step below.

:::tip
To reduce steps, you may set your SAML default role to `Admin` initially. When the admin is assigned in your identity provider and logs in for the first time, they can change the default role to a different value.
:::

### Remove other authentication methods {#remove-other-auth-methods}

Remove any users that are using a non-SAML method to complete the integration and restrict access to only users originating from your identity provider connection.

</VerticalStepper>

### Configure Okta SAML {#configure-okta-saml}

You will configure two App Integrations in Okta for each ClickHouse organization: one SAML app and one bookmark to house your direct link.

<details>
   <summary>  1. Create a group to manage access  </summary>
   
   1. Log in to your Okta instance as an **Administrator**.

   2. Select **Groups** on the left.

   3. Click **Add group**.

   4. Enter a name and description for the group. This group will be used to keep users consistent between the SAML app and its related bookmark app.

   5. Click **Save**.

   6. Click the name of the group that you created.

   7. Click **Assign people** to assign users you would like to have access to this ClickHouse organization.

</details>

<details>
   <summary>  2. Create a bookmark app to enable users to seamlessly log in  </summary>
   
   1. Select **Applications** on the left, then select the **Applications** subheading.
   
   2. Click **Browse App Catalog**.
   
   3. Search for and select **Bookmark App**.
   
   4. Click **Add integration**.
   
   5. Select a label for the app.
   
   6. Enter the URL as `https://console.clickhouse.cloud/?connection={organizationid}`
   
   7. Go to the **Assignments** tab and add the group you created above.
   
</details>

<details>
   <summary>  3. Create a SAML app to enable the connection  </summary>
   
   1. Select **Applications** on the left, then select the **Applications** subheading.
   
   2. Click **Create App Integration**.
   
   3. Select SAML 2.0 and click Next.
   
   4. Enter a name for your application and check the box next to **Do not display application icon to users** then click **Next**. 
   
   5. Use the following values to populate the SAML settings screen.
   
      | Field                          | Value |
      |--------------------------------|-------|
      | Single Sign On URL             | Copy the Single Sign-On URL from the console |
      | Audience URI (SP Entity ID)    | Copy the Service Provider Entity ID from the console |
      | Default RelayState             | Leave blank       |
      | Name ID format                 | Unspecified       |
      | Application username           | Email             |
      | Update application username on | Create and update |
   
   7. Enter the following Attribute Statement.

      | Name    | Name format   | Value      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |
   
   9. Click **Next**.
   
   10. Enter the requested information on the Feedback screen and click **Finish**.
   
   11. Go to the **Assignments** tab and add the group you created above.
   
   12. On the **Sign On** tab for your new app, click the **Copy metadata URL** button. 
   
   13. Return to [Add the metadata URL to your SAML configuration](#add-metadata-url) to continue the process.
   
</details>

### Configure Google SAML {#configure-google-saml}

You will configure one SAML app in Google for each organization and must provide your users the direct link (`https://console.clickhouse.cloud/?connection={organizationId}`) to bookmark if using multi-org SSO.

<details>
   <summary>  Create a Google Web App  </summary>
   
   1. Go to your Google Admin console (admin.google.com).

   <Image img={samlGoogleApp} size="md" alt="Google SAML App" force/>

   2. Click **Apps**, then **Web and mobile apps** on the left.
   
   3. Click **Add app** from the top menu, then select **Add custom SAML app**.
   
   4. Enter a name for the app and click **Continue**.
   
   5. Copy the metadata URL and save it somewhere.
   
   7. Enter the ACS URL and Entity ID below.
   
      | Field     | Value |
      |-----------|-------|
      | ACS URL   | Copy the Single Sign-On URL from the console |
      | Entity ID | Copy the Service Provider Entity ID from the console |
   
   8. Check the box for **Signed response**.
   
   9. Select **EMAIL** for the Name ID Format and leave the Name ID as **Basic Information > Primary email.**
   
   10. Click **Continue**.
   
   11. Enter the following Attribute mapping:
       
      | Field             | Value         |
      |-------------------|---------------|
      | Basic information | Primary email |
      | App attributes    | email         |
       
   13. Click **Finish**.
   
   14. To enable the app click **OFF** for everyone and change the setting to **ON** for everyone. Access can also be limited to groups or organizational units by selecting options on the left side of the screen.

   15. Return to [Add the metadata URL to your SAML configuration](#add-metadata-url) to continue the process.
       
</details>

### Configure Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML may also be referred to as Azure Active Directory (AD) or Microsoft Entra.

<details>
   <summary>  Create an Azure Enterprise Application </summary>
   
   You will set up one application integration with a separate sign-on URL for each organization.
   
   1. Log on to the Microsoft Entra admin center.
   
   2. Navigate to **Applications > Enterprise** applications on the left.
   
   3. Click **New application** on the top menu.
   
   4. Click **Create your own application** on the top menu.
   
   5. Enter a name and select **Integrate any other application you don't find in the gallery (Non-gallery)**, then click **Create**.
   
      <Image img={samlAzureApp} size="md" alt="Azure Non-Gallery App" force/>
   
   6. Click **Users and groups** on the left and assign users.
   
   7. Click **Single sign-on** on the left.
   
   8. Click **SAML**.
   
   9. Use the following settings to populate the Basic SAML Configuration screen.
   
      | Field                     | Value |
      |---------------------------|-------|
      | Identifier (Entity ID)    | Copy the Service Provider Entity ID from the console |
      | Reply URL (Assertion Consumer Service URL) | Copy the Single Sign-On URL from the console |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | Blank |
      | Logout URL                | Blank |
   
   11. Add (A) or update (U) the following under Attributes & Claims:
   
       | Claim name                           | Format        | Source attribute |
       |--------------------------------------|---------------|------------------|
       | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | Omitted       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="Attributes and Claims" force/>
   
   12. Copy the metadata URL and return to [Add the metadata URL to your SAML configuration](#add-metadata-url) to continue the process.

</details>

### Configure Duo SAML {#configure-duo-saml}

<details>
   <summary> Create a Generic SAML Service Provider for Duo </summary>
   
   1. Follow the instructions for [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic). 
   
   2. Use the following Bridge Attribute mapping:

      |  Bridge Attribute  |  ClickHouse Attribute  | 
      |:-------------------|:-----------------------|
      | Email Address      | email                  |
   
   3. Use the following values to update your Cloud Application in Duo:

      |  Field    |  Value                                     |
      |:----------|:-------------------------------------------|
      | Entity ID | Copy the Service Provider Entity ID from the console |
      | Assertion Consumer Service (ACS) URL | Copy the Single Sign-On URL from the console |
      | Service Provider Login URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. Copy the metadata URL and return to [Add the metadata URL to your SAML configuration](#add-metadata-url) to continue the process.
   
</details>

## How it works {#how-it-works}

### User management with SAML SSO {#user-management-with-saml-sso}

For more information on managing user permissions and restricting access to only SAML connections, refer to [Manage cloud users](/cloud/security/manage-cloud-users).

### Service provider-initiated SSO {#service-provider-initiated-sso}

We only utilize service provider-initiated SSO. This means users go to `https://console.clickhouse.cloud` and enter their email address to be redirected to the IdP for authentication. Users already authenticated via your IdP can use the direct link to automatically log in to your organization without entering their email address at the login page.

### Multi-org SSO {#multi-org-sso}

ClickHouse Cloud supports multi-organization SSO by providing a separate connection for each organization. Use the direct link (`https://console.clickhouse.cloud/?connection={organizationid}`) to log in to each respective organization. Be sure to log out of one organization before logging into another.

## Additional information {#additional-information}

Security is our top priority when it comes to authentication. For this reason, we made a few decisions when implementing SSO that we need you to know.

- **We only process service provider-initiated authentication flows.** Users must navigate to `https://console.clickhouse.cloud` and enter an email address to be redirected to your identity provider. Instructions to add a bookmark application or shortcut are provided for your convenience so your users don't need to remember the URL.

- **We do not automatically link SSO and non-SSO accounts.** You may see multiple accounts for your users in your ClickHouse user list even if they are using the same email address.

## Troubleshooting Common Issues {#troubleshooting-common-issues}

| Error | Cause | Solution | 
|:------|:------|:---------|
| There could be a misconfiguration in the system or a service outage | Identity provider initiated login | To resolve this error try using the direct link `https://console.clickhouse.cloud/?connection={organizationid}`. Follow the instructions for your identity provider above to make this the default login method for your users | 
| You are directed to your identity provider, then back to the login page | The identity provider does not have the email attribute mapping |  Follow the instructions for your identity provider above to configure the user email attribute and log in again | 
| User is not assigned to this application | The user has not been assigned to the ClickHouse application in the identity provider | Assign the user to the application in the identity provider and log in again |
| You have multiple ClickHouse organizations integrated with SAML SSO and you are always logged into the same organization, regardless of which link or tile you use | You are still logged in to the first organization | Log out, then log in to the other organization |
| The URL briefly shows `access denied` | Your email domain does not match the domain we have configured | Reach out to support for assistance resolving this error |
