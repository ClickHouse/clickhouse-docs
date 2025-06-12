---
sidebar_label: 'SAML SSO Setup'
slug: /cloud/security/saml-setup
title: 'SAML SSO Setup'
description: 'How to set up SAML SSO with ClickHouse Cloud'
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

# SAML SSO Setup

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud supports single-sign on (SSO) via security assertion markup language (SAML). This enables you to sign in securely to your ClickHouse Cloud organization by authenticating with your identity provider (IdP).

We currently support service provider-initiated SSO, multiple organizations using separate connections, and just-in-time provisioning. We do not yet support a system for cross-domain identity management (SCIM) or attribute mapping.

## Before you begin \{#before-you-begin}

You will need Admin permissions in your IdP and the **Admin** role in your ClickHouse Cloud organization. After setting up your connection within your IdP, contact us with the information requested in the procedure below to complete the process.

We recommend setting up a **direct link to your organization** in addition to your SAML connection to simplify the login process. Each IdP handles this differently. Read on for how to do this for your IdP.

## How to configure your IdP \{#how-to-configure-your-idp}

### Steps \{#steps}

<details>
   <summary>  Get your organization ID  </summary>
   
   All setups require your organization ID. To obtain your organization ID:
   
   1. Sign in to your [ClickHouse Cloud](https://console.clickhouse.cloud) organization.
   
      <Image img={samlOrgId} size="md" alt="Organization ID" />
      
   3. In the lower left corner, click on your organization name under **Organization**.
   
   4. In the pop-up menu, select **Organization details**.
   
   5. Make note of your **Organization ID** to use below.
      
</details>

<details> 
   <summary>  Configure your SAML integration  </summary>
   
   ClickHouse uses service provider-initiated SAML connections. This means you can log in via https://console.clickhouse.cloud or via a direct link. We do not currently support identity provider initiated connections. Basic SAML configurations include the following:

   - SSO URL or ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - Audience URI or Entity ID: `urn:auth0:ch-production:{organizationid}` 

   - Application username: `email`

   - Attribute mapping: `email = user.email`

   - Direct link to access your organization: `https://console.clickhouse.cloud/?connection={organizationid}` 


   For specific configuration steps, refer to your specific identity provider below.
   
</details>

<details>
   <summary>  Obtain your connection information  </summary>

   Obtain your Identity provider SSO URL and x.509 certificate. Refer to your specific identity provider below for instructions on how to retrieve this information.

</details>


<details>
   <summary>  Submit a support case </summary>
   
   1. Return to the ClickHouse Cloud console.
      
   2. Select **Help** on the left, then the Support submenu.
   
   3. Click **New case**.
   
   4. Enter the subject "SAML SSO Setup".
   
   5. In the description, paste any links gathered from the instructions above and attach the certificate to the ticket.
   
   6. Please also let us know which domains should be allowed for this connection (e.g. domain.com, domain.ai, etc.).
   
   7. Create a new case.
   
   8. We will complete the setup within ClickHouse Cloud and let you know when it's ready to test.

</details>

<details>
   <summary>  Complete the setup  </summary>

   1. Assign user access within your Identity Provider. 

   2. Log in to ClickHouse via https://console.clickhouse.cloud OR the direct link you configured in 'Configure your SAML integration' above. Users are initially assigned the 'Member' role, which can log in to the organization and update personal settings.

   3. Log out of the ClickHouse organization. 

   4. Log in with your original authentication method to assign the Admin role to your new SSO account.
   - For email + password accounts, please use `https://console.clickhouse.cloud/?with=email`.
   - For social logins, please click the appropriate button (**Continue with Google** or **Continue with Microsoft**)

   5. Log out with your original authentication method and log back in via https://console.clickhouse.cloud OR the direct link you configured in 'Configure your SAML integration' above.

   6. Remove any non-SAML users to enforce SAML for the organization. Going forward users are assigned via your Identity Provider.
   
</details>

### Configure Okta SAML \{#configure-okta-saml}

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
      | Single Sign On URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
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
   
   12. On the **Sign On** tab for your new app, click the **View SAML setup instructions** button. 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML Setup Instructions" />
   
   13. Gather these three items and go to Submit a Support Case above to complete the process.
     - Identity Provider Single Sign-On URL
     - Identity Provider Issuer
     - X.509 Certificate
   
</details>


### Configure Google SAML \{#configure-google-saml}

You will configure one SAML app in Google for each organization and must provide your users the direct link (`https://console.clickhouse.cloud/?connection={organizationId}`) to bookmark if using multi-org SSO.

<details>
   <summary>  Create a Google Web App  </summary>
   
   1. Go to your Google Admin console (admin.google.com).

   <Image img={samlGoogleApp} size="md" alt="Google SAML App" />

   2. Click **Apps**, then **Web and mobile apps** on the left.
   
   3. Click **Add app** from the top menu, then select **Add custom SAML app**.
   
   4. Enter a name for the app and click **Continue**.
   
   5. Gather these two items and go to Submit a Support Case above to submit the information to us. NOTE: If you complete the setup before copying this data, click **DOWNLOAD METADATA** from the app's home screen to get the X.509 certificate.
     - SSO URL
     - X.509 Certificate
   
   7. Enter the ACS URL and Entity ID below.
   
      | Field     | Value |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID | `urn:auth0:ch-production:{organizationid}` |
   
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
       
</details>

### Configure Azure (Microsoft) SAML \{#configure-azure-microsoft-saml}

Azure (Microsoft) SAML may also be referred to as Azure Active Directory (AD) or Microsoft Entra.

<details>
   <summary>  Create an Azure Enterprise Application </summary>
   
   You will set up one application integration with a separate sign-on URL for each organization.
   
   1. Log on to the Microsoft Entra admin center.
   
   2. Navigate to **Applications > Enterprise** applications on the left.
   
   3. Click **New application** on the top menu.
   
   4. Click **Create your own application** on the top menu.
   
   5. Enter a name and select **Integrate any other application you don't find in the gallery (Non-gallery)**, then click **Create**.
   
      <Image img={samlAzureApp} size="md" alt="Azure Non-Gallery App" />
   
   6. Click **Users and groups** on the left and assign users.
   
   7. Click **Single sign-on** on the left.
   
   8. Click **SAML**.
   
   9. Use the following settings to populate the Basic SAML Configuration screen.
   
      | Field                     | Value |
      |---------------------------|-------|
      | Identifier (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | Blank |
      | Logout URL                | Blank |
   
   11. Add (A) or update (U) the following under Attributes & Claims:
   
       | Claim name                           | Format        | Source attribute |
       |--------------------------------------|---------------|------------------|
       | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | Omitted       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="Attributes and Claims" />
   
   12. Gather these two items and go to Submit a Support Case above to complete the process:
     - Login URL
     - Certificate (Base64)

</details>

### Configure Duo SAML \{#configure-duo-saml}

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
      | Entity ID | `urn:auth0:ch-production:{organizationid}` |
      | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Service Provider Login URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. Gather these two items and go to Submit a Support Case above to complete the process:
      - Single Sign-On URL
      - Certificate
   
</details>


## How It Works \{#how-it-works}

### Service provider-initiated SSO \{#service-provider-initiated-sso}

We only utilize service provider-initiated SSO. This means users go to `https://console.clickhouse.cloud` and enter their email address to be redirected to the IdP for authentication. Users already authenticated via your IdP can use the direct link to automatically log in to your organization without entering their email address at the login page.

### Assigning user roles \{#assigning-user-roles}

Users will appear in your ClickHouse Cloud console after they are assigned to your IdP application and log in for the first time. At least one SSO user should be assigned the Admin role in your organization. Use social login or `https://console.clickhouse.cloud/?with=email` to log in with your original authentication method to update your SSO role.

### Removing Non-SSO Users \{#removing-non-sso-users}

Once you have SSO users set up and have assigned at least one user the Admin role, the Admin can remove users using other methods (e.g. social authentication or user ID + password). Google authentication will continue to work after SSO is set up. User ID + password users will be automatically redirected to SSO based on their email domain unless users use `https://console.clickhouse.cloud/?with=email`.

### Managing Users \{#managing-users}

ClickHouse Cloud currently implements SAML for SSO. We have not yet implemented SCIM to manage users. This means SSO users must be assigned to the application in your IdP to access your ClickHouse Cloud organization. Users must log in to ClickHouse Cloud once to appear in the **Users** area in the organization. When users are removed in your IdP, they will not be able to log in to ClickHouse Cloud using SSO. However, the SSO user will still show in your organization until and administrator manually removes the user.

### Multi-Org SSO \{#multi-org-sso}

ClickHouse Cloud supports multi-organization SSO by providing a separate connection for each organization. Use the direct link (`https://console.clickhouse.cloud/?connection={organizationid}`) to log in to each respective organization. Be sure to log out of one organization before logging into another.

## Additional Information \{#additional-information}

Security is our top priority when it comes to authentication. For this reason, we made a few decisions when implementing SSO that we need you to know.

- **We only process service provider-initiated authentication flows.** Users must navigate to `https://console.clickhouse.cloud` and enter an email address to be redirected to your identity provider. Instructions to add a bookmark application or shortcut are provided for your convenience so your users don't need to remember the URL.

- **All users assigned to your app via your IdP must have the same email domain.** If you have vendors, contractors or consultants you would like to have access to your ClickHouse account, they must have an email address with the same domain (e.g. user@domain.com) as your employees.

- **We do not automatically link SSO and non-SSO accounts.** You may see multiple accounts for your users in your ClickHouse user list even if they are using the same email address.
      
