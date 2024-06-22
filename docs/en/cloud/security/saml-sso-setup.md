---
sidebar_label: SAML SSO Setup
slug: /en/cloud/security/saml-setup
title: SAML SSO Setup
---

# SAML SSO Setup

:::note 
SAML SSO is in private preview. Please contact support@clickhouse.com to see if this is available for your organization.
:::

ClickHouse supports single-sign on (SSO) via security assertion markup language (SAML). This enables you to sign in securely to your ClickHouse organization by authenticating with your identity provider (IdP). We currently support service provider initiated SSO, multiple organizations using separate connections, and just-in-time provisioning. We do not yet support system for cross-domain identity management (SCIM) or attribute mapping.

## Before you begin

You will need Admin permissions in your IdP and the Admin role in your ClickHouse Cloud organization. After setting up your connection within your IdP, contact us with the information requested in the procedure below to complete the process.

We recommend setting up a **direct link to your organization** in addition to your SAML connection to simplify the login process. Each IdP handles this differently. Read on for how to do this for your IdP.

## How to Configure Your IdP

### All IdPs

All setups require your organization ID. To obtain your organization ID:
1. Sign in to your [ClickHouse Cloud](https://console.clickhouse.cloud) organization.

   <img width='60%' alt="Org ID Screenshot" src="https://github.com/ClickHouse/clickhouse-docs/assets/110556185/0cb69e9e-1506-4eb4-957d-f104d8c15f3a"/>
   
3. In the lower left corner, click on your organization name under Organization.

4. In the pop-up menu, select 'Organization details'.

5. Make note of your Organization ID to use below.

### Configuring Okta SAML

You will configure two (2) App Integrations in Okta for each ClickHouse organization: one SAML app and one bookmark to house your direct link.

#### Create a group to manage access:
1. Log in to your Okta instance as an Administrator.

2. Select Groups on the left.

3. Click Add group.

4. Enter a name and description for the group. This group will be used to keep users consistent between the SAML app and its related bookmark app.

5. Click Save.

6. Click the name of the group that you created.

7. Click Assign people to assign users you would like to have access to this ClickHouse organization.

#### Create a bookmark app to enable users to seamlessly log in:
1. Select Applications on the left, then select the Applications subheading.
   
2. Click Browse App Catalog.

3. Search for and select Bookmark App.

4. Click Add integration.

5. Select a label for the app.

6. Enter the URL as https://console.clickhouse.cloud?connection={organizationid}

7. Go to the Assignments tab and add the group you created above.

#### Create a SAML app to enable the connection:
1. Select Applications on the left, then select the Applications subheading.

2. Click Create App Integration.

3. Select SAML 2.0 and click Next.

4. Enter a name for your application and check the box next to 'Do not display application icon to users' then click Next. 

5. Use the following values to populate the SAML settings screen.

   | Field                          | Value |
   |--------------------------------|-------|
   | Single Sign On URL             | https://auth.clickhouse.cloud/login/callback?connection={organizationid} |
   | Audience URI (SP Entity ID)    | urn:auth0:ch-production:{organizationid} |
   | Default RelayState             | Leave blank       |
   | Name ID format                 | Unspecified       |
   | Application username           | Email             |
   | Update application username on | Create and update |

7. Enter the following Attribute Statement.

   | Field       | Value      |
   |-------------|------------|
   | Name        | Basic      |
   | Name format | user.email |

8. Click Next.

9. Enter the requested information on the Feedback screen and click Finish.

10. Go to the Assignments tab and add the group you created above.

11. On the Sign On tab for your new app, click the View SAML setup instructions button. 

      <img width='60%' alt="Okta SAML Setup Instructions" src="https://github.com/ClickHouse/clickhouse-docs/assets/110556185/8d316548-5fb7-4d3a-aad9-5d025c51f158"/>

13. Gather these three items and go to [Submit a Support Case](#submit-a-support-case) below complete the process.
  - Identity Provider Single Sign-On URL
  - Identity Provider Issuer
  - X.509 Certificate

### Configuring Google SAML

You will configure one (1) SAML app in Google for each organization and must provide your users the direct link (https://console.clickhouse.cloud?connection={organizationId}) to bookmark if using multi-org SSO.

1. Go to your Google Admin console (admin.google.com).

   <img width='60%' alt="Google SAML App" src="https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b931bd12-2fdf-4e25-b0b5-1170bbd20760"/>

2. Click Apps, then Web and mobile apps on the left.

3. Click Add app from the top menu, then select Add custom SAML app.

4. Enter a name for the app and click Continue.

5. Gather these two items and go to [Submit a Support Case](#submit-a-support-case) below to submit the information to us. NOTE: If you complete the setup before copying this data, click 'DOWNLOAD METADATA' from the app's home screen to get the X.509 certificate.
  - SSO URL
  - X.509 Certificate

7. Enter the ACS URL and Entity ID below.

   | Field     | Value |
   |-----------|-------|
   | ACS URL   | https://auth.clickhouse.cloud/login/callback?connection={organizationid} |
   | Entity ID | urn:auth0:ch-production:{organizationid} |

8. Check the box for Signed response.

9. Select **EMAIL** for the Name ID Format and leave the Name ID as **Basic Inforamtion > Primary email.**

10. Click Continue.

11. Enter the following Attribute mapping:
    
   | Field             | Value   |
   |-------------------|---------|
   | Basic information | Primary email |
   | App attributes    | email         |
    
13. Click Finish.

14. To enable the app click OFF for everyone and change the setting to ON for everyone. Access can also be limited to groups or organizational units by selecting options on the left side of the screen.

### Configuring Azure (Microsoft) SAML

Azure (Microsoft) SAML may also be referred to as Azure Active Directory (AD) or Microsoft Entra.

You will set up one (1) application integration with a separate sign-on URL for each organization.

1. Log on to the Microsoft Entra admin center.

2. Navigate to Applications > Enterprise applications on the left.

3. Click New application on the top menu.

4. Click Create your own application on the top menu.

5. Enter a name and select 'Integrate any other application you don't find in the gallery (Non-gallery)', then click Create.

   <img width='60%' alt="Azure Non-Gallery App" src="https://github.com/ClickHouse/clickhouse-docs/assets/110556185/5577b3ed-56e0-46b9-a9f7-80aa27f9a97a"/>

6. Click Users and groups on the left and assign users.

7. Click Single sign-on on the left.

8. Click SAML.

9. Use the following settings to populate the Basic SAML Configuration screen.

   | Field                     | Value |
   |---------------------------|-------|
   | Identifier (Entity ID)    | urn:auth0:ch-production:{organizationid} |
   | Reply URL (Assertion Consumer Service URL) | https://auth.clickhouse.cloud/login/callback?connection={organizationid} |
   | Sign on URL               | https://console.clickhouse.cloud?connection={organizationid} |
   | Relay State               | Blank |
   | Logout URL                | Blank |

11. Add (A) or update (U) the following under Attributes & Claims:

    | Claim name                           | Format        | Source attribute |
    |--------------------------------------|---------------|------------------|
    | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
    | (A) email                            | Basic         | user.mail        |
    | (U) /identity/claims/name            | Omitted       | user.mail        |

      <img width='60%' alt="Attributes and Claims" src="https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b59af49f-4cdc-47f4-99e0-fe4a7ffbceda"/>

12. Gather these two items and go to [Submit a Support Case](#submit-a-support-case) below to complete the process:
  - Login URL
  - Certificate (Base64)


### Submit a Support Case
1. Return to your ClickHouse Cloud organization.
   
2. Select Help on the left, then the Support submenu.

3. Click New case.

4. Enter the subject "SAML SSO Setup".

5. In the description, paste any links gathered from the instructions above and attach the certificate to the ticket.

6. Please also let us know which domains should be allowed for this connection (e.g. domain.com, domain.ai, etc.).

7. Create a new case.

8. We will complete the setup within ClickHouse Cloud and let you know when it's ready to test.

9. Sign in with your original authentication method to assign the Admin role to your new SSO account.
    - For email + password accounts, please use https://console.clickhouse.cloud?with=email.
    - For social logins, please click the appropriate button ('Continue with Google' or 'Continue with Microsoft')

## How It Works

### Service Provider Initiated SSO
We only utilize service provider initiated SSO. This means users go to console.clickhouse.cloud and enter their email address to be redirected to the IdP for authentication. Users already authenticated via your IdP can use the direct link to automatically log in to your organization without entering their email address at the login page.

### Assigning User Roles
Users  will appear in your ClickHouse Cloud control panel after they are assigned to your IdP application and log in for the first time. At least one SSO user should be assigned the Admin role in your organization. Use social login or https://console.clickhouse.cloud?with=email to log in with your original authentication method to update your SSO role.

### Removing Non-SSO Users
Once you have SSO users set up and have assigned at least one user the Admin role, the Admin can remove users using other methods (e.g. social authentication or user ID + password). Google authentication will continue to work after SSO is set up. User ID + password users will be automatically redirected to SSO based on their email domain unless users use https://console.clickhouse.cloud?with=email.

### Managing Users
ClickHouse Cloud currently implements SAML for SSO. We have not yet implemented SCIM to manage users. This means SSO users must be assigned to the application in your IdP to access your ClickHouse Cloud organization. Users must log in to ClickHouse Cloud once to appear in the Users area in the organization. When users are removed in your IdP, they will not be able to log in to ClickHouse Cloud using SSO. However, the SSO user will still show in your organization until and administrator manually removes the user.

### Multi-Org SSO
ClickHouse Cloud supports multi-organization SSO by providing a separate connection for each organization. Use the direct link (https://console.clickhouse.cloud?organization={organizationid}) to log in to each respective organziation. Be sure to log out of one organization before logging into another.

## Additional Information
Security is our top priority when it comes to authentication. For this reason, we made a few decisions when implementing SSO that we need you to know.

- **We only process service provider initiated authentication flows.** Users must navigate to console.clickhouse.cloud and enter an email address to be redirected to your identity provider. Instructions to add a bookmark application or shortcut are provided for your convenience so your users don't need to remember the URL.

- **All users assigned to your app via your IdP must have the same email domain.** If you have vendors, contractors or consultants you would like to have access to your ClickHouse account, they must have an email address with the same domain (e.g. user@domain.com) as your employees.

- **We do not automatically link SSO and non-SSO accounts.** You may see multiple accounts for your users in your ClickHouse user list even if they are using the same email address.

