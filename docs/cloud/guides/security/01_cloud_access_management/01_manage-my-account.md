---
sidebar_label: 'Manage my account'
slug: /cloud/security/manage-my-account
title: 'Manage my account'
description: 'This page describes how users can accept invitations, manage MFA settings, and reset passwords'
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

## Accept an invitation {#accept-invitation}

Users may use multiple methods to accept an invitation to join an organization. If this is your first invitation, select the appropriate authentication method for your organization below. 

If this is not your first organization, either sign in with your existing organization then accept the invitation from the lower left hand side of the page OR accept the invitation from your email and sign in with your existing account. 

:::note SAML Users
Organizations using SAML have a unique login per ClickHouse organization. Use the direct link provided by your administrator to log in.
:::

### Email and password {#email-and-password}

ClickHouse Cloud allows you to authenticate with an email address and password. When using this method the best way to protect your ClickHouse account is to use a strong password. There are many online resources to help you devise a password you can remember. Alternatively, you can use a random password generator and store your password in a password manager for increased security.

Passwords must contain a minimum of 12 characters and meet 3 of 4 complexity requirements: upper case characters, lower case characters, numbers and/or special characters.

### Social single sign-on (SSO) {#social-sso}

Use `Continue with Google` or `Continue with Microsoft Account` to sign up for services or accept invitations.

If your company uses Google Workspace or Microsoft 365, you can leverage your current single sign-on setup within ClickHouse Cloud. To do this, simply sign up using your company email address and invite other users using their company email. The effect is that your users must login using your company's login flows, whether via your identity provider or directly through Google or Microsoft authentication, before they can authenticate into ClickHouse Cloud. 

### SAML single sign-on (SSO) {#saml-sso}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

Users using SAML SSO are automatically added by their identity provider upon sign in. ClickHouse Cloud users with the Organization Admin role may [manage roles](/cloud/security/manage-cloud-users) assigned to SAML users and enforce SAML as the only authentication method.

## Manage multi-factor authentication (MFA) {#mfa}

Users with email + password or social authentication can further secure their account using multi-factor authentication (MFA). To set up MFA:

1. Log into [console.clickhouse.cloud](https://console.clickhouse.cloud/)
2. Click your initials in the upper left corner next to the ClickHouse logo
3. Select Profile
4. Select Security on the left
5. Click Set up in the Authenticator app tile
6. Use an authenticator app such as Authy, 1Password or Google Authenticator to scan the QR code
7. Enter the code to confirm
8. On the next screen, copy the recovery code and store it in a safe place
9. Check the box next to `I have safely recorded this code`
10. Click Continue

### Obtain a new recovery code {#obtain-recovery-code}

If you previously enrolled in MFA and either did not create or misplaced your recovery code, follow these steps to get a new recovery code:
1. Go to https://console.clickhouse.cloud
2. Sign in with your credentials and MFA
3. Go to your profile in the upper left corner
4. Click Security on the left
5. Click the trash can next to your Authenticator app
6. Click Remove authenticator app
7. Enter your code and click Continue
8. Click Set up in the Authenticator app section
9. Scan the QR code and input the new code
10. Copy your recovery code and store it in a safe place
11. Check the box next to `I have safely recorded this code`
12. Click Continue

## Account recovery {#account-recovery}

### Forgot password {#forgot-password}

If you forgot your password, follow these steps for self-service recovery:
1. Go to https://console.clickhouse.cloud
2. Enter your email address and click Continue
3. Click Forgot your password?
4. Click Send password reset link
5. Check your email and click Reset password from the email
6. Enter your new password, confirm the password and click Update password
7. Click Back to sign in
8. Sign in normally with your new password

### MFA self-service recovery {#mfa-self-serivce-recovery}

If you lost your MFA device or deleted your token, follow these steps to recover and create a new token:
1. Go to https://console.clickhouse.cloud
2. Enter your credentials and click Continue
3. On the Multi-factor authentication screen click Cancel
4. Click Recovery code
5. Enter the code and press Continue
6. Copy the new recovery code and store it somewhere safe
7. Click the box next to `I have safely recorded this code` and click continue
8. Once signed in, go to your profile in the upper left
9. Click on security in the upper left
10. Click the trash can icon next to Authenticator app to remove your old authenticator
11. Click Remove authenticator app
12. When prompted for your Multi-factor authentication, click Cancel
13. Click Recovery code
14. Enter your recovery code (this is the new code generated in step 7) and click Continue
15. Copy the new recovery code and store it somewhere safe - this is a fail safe in case you leave the screen during the removal process
16. Click the box next to `I have safely recorded this code` and click Continue
17. Follow the process above to set up a new MFA factor
       
### Lost MFA and recovery code {#lost-mfa-and-recovery-code}

If you lost your MFA device AND recovery code or you lost your MFA device and never obtained a recovery code, follow these steps to request a reset:

**Submit a ticket**: If you are in an organization that has other administrative users, even if you are attempting to access a single user organization, ask a member of your organization assigned the Admin role to log into the organization and submit a support ticket to reset your MFA on your behalf. Once we verify the request is authenticated, we will reset your MFA and notify the Admin. Sign in as usual without MFA and go to your profile settings to enroll a new factor if you wish.

**Reset via email**: If you are the only user in the organization, submit a support case via email (support@clickhouse.com) using the email address associated with your account. Once we verify the request is coming from the correct email, we will reset your MFA AND password. Access your email to access the password reset link. Set up a new password then go to your profile settings to enroll a new factor if you wish. 
