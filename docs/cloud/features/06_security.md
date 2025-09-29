---
sidebar_label: 'Security'
slug: /cloud/security
title: 'Security'
description: 'Learn more about securing ClickHouse Cloud and BYOC'
doc_type: 'reference'
---

This document details the security options and best practices available for ClickHouse organization and service protection. ClickHouse is dedicated to providing secure analytical database solutions; therefore, safeguarding data and service integrity is a priority. The information herein covers various methods designed to assist users in securing their ClickHouse environments.

## Cloud console authentication

### [Password authentication](/cloud/security/manage-my-account#email-and-password)
ClickHouse Cloud console passwords are configured to [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) standards with a minimum of 12 characters and 3 of 4 complexity requirements: upper case characters, lower case characters, numbers and/or special characters.

### [Social single sign-on (SSO)](/cloud/security/manage-my-account#social-single-sign-on-sso)
ClickHouse Cloud supports Google or Microsoft social authentication for single sign-on (SSO).

### [Multi-factor authentication](/cloud/security/manage-my-account#manage-multi-factor-authentication-mfa)
Users using email and password or social SSO may also configure multi-factor authentication utilzing an authenticator app such as Authy or Google Authenticator.

### [Security assertion markup language (SAML) authentication](/cloud/security/saml-setup)
Enterprise customers may configure SAML authentication.

### [API authentication](/cloud/manage/openapi)
Customers may configure API keys for use with [OpenAPI](/cloud/manage/postman), [Terraform](/cloud/manage/api/api-overview#terraform-provider) and [Query API endpoints](/cloud/get-started/query-endpoints).

## Database authentication

### [Database password authentication](/cloud/security/manage-database-users#database-user-id--password)
ClickHouse database user passwords are configured to [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) standards with a minimum of 12 characters and complexity requirements: upper case characters, lower case characters, numbers and/or special characters.

### [Secure shell (SSH) database authentication](/cloud/security/manage-database-users#database-ssh)
ClickHouse database users may be configured to use SSH authentication.

## Access control

### [Console role-based access (RBAC)](/cloud/security/console-roles)
ClickHouse Cloud supports role assignment for organization, service and database permissions. Database permissions using this method are support in SQL console only.

### [Database user grants](/cloud/security/manage-database-users#database-permissions)
ClickHouse databases support granular permission management and role-based access via user grants.

## Network security

### [IP filters](/cloud/security/setting-ip-filters)
Configure IP filters to limit inbound connections to your ClickHouse service.

### [Private connectivity](/cloud/security/connectivity/private-networking)
Connect to your ClickHouse clusters from AWS, GCP or Azure using private connectivity.

## Encryption

### [Storage level encryption](/cloud/security/cmek#storage-encryption)
ClickHouse Cloud encrypts data at rest by default using cloud provider-managed AES 256 keys.

### [Transparent data encryption](/cloud/security/cmek#transparent-data-encryption-tde)
In addition to storage encryption, ClickHouse Cloud Enterprise customers may enable database level transparent data encryption for additional protection.

### [Customer managed encryption keys](/cloud/security/cmek#customer-managed-encryption-keys-cmek)
ClickHouse Cloud Enterprise customers may use their own key for database level encryption.

## Auditing and logging

### [Console audit log](/cloud/security/audit-logging/console-audit-log)
Activities within the console are logged. Logs are available for review and export.

### [Database audit logs](/cloud/security/audit-logging/database-audit-log)
Activities within the database are logged. Logs are available for review and export.

### [BYOC security playbook](/cloud/security/audit-logging/byoc-security-playbook)
Sample detection queries for security teams managing ClickHouse BYOC instances.

## Compliance

### [Security and compliance reports](/cloud/security/compliance-overview)
ClickHouse maintains a strong security and compliance program. Check back periodically for new third party audit reports.

### [HIPAA compliant services](/cloud/security/compliance/hipaa-onboarding)
ClickHouse Cloud Enterprise customers may deploy services housing protected health information (PHI) to HIPAA compliant regions after signing a Business Associate Agreement (BAA).

### [PCI compliant services](/cloud/security/compliance/pci-onboarding)
ClickHouse Cloud Enterprise customers may deploy services housing credit card information to PCI compliant regions.
