---
sidebar_label: Cloud Authentication
slug: /en/cloud/security/cloud-authentication
title: Cloud Authentication
---
# Cloud Authentication

ClickHouse Cloud provides a number of ways to authenticate. This guide explains some good practices for configuring your authentication. Always check with your security team when selecting authentication methods.

## Password Settings

Minimum password settings for our console and services (databases) currently comply with [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) Authenticator Assurance Level 1:
- Minimum 12 characters
- Includes 3 of the following 4 items:
   - 1 uppercase letter
   - 1 lowercase letter
   - 1 number
   - 1 special character

## Email + Password

ClickHouse Cloud allows you to authenticate with an email address and password. When using this method the best way to protect your ClickHouse account use a strong password. There are many online resources to help you devise a password you can remember. Alternatively, you can use a random password generator and store your password in a password manager for increased security.

### Multi-Factor Authentication

Users with email and password authentication can further secure their account using multi-factor authentication (MFA). To set up MFA:
1. Log into console.clickhouse.cloud
2. Click your initials in the upper left corner next to the ClickHouse logo
3. Select Profile
4. Select Security on the left
5. Click Set up in the Authenticator app tile
6. Use an authenticator app such as Authy, 1Password or Google Authenticator to scan the QR code
7. Enter the code to confirm

## Database User ID + Password

Use the SHA256_hash method when [creating user accounts](/docs/en/sql-reference/statements/create/user.md) to secure passwords.

**TIP:** Since users with less than administrative privileges cannot set their own password, ask the user to hash their password using a generator
such as [this one](https://tools.keycdn.com/sha256-online-generator) before providing it to the admin to setup the account. Passwords should follow the [requirements](#establish-strong-passwords) listed above.

```
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```

## SSO Using Google or Microsoft Social Authentication

If your company uses Google Workspace or Microsoft 365, you can leverage your current single sign-on setup within ClickHouse Cloud. To do this, simply sign up using your company email address and invite other users using their company email. The effect is your users must login using your company's login flows, whether via your identity provider or directly through Google or Microsoft authentication, before they can authenticate into ClickHouse Cloud. This includes requiring multi-factor authentication as required by your login flow.
