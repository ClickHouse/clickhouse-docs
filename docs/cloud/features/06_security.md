---
sidebar_label: 'Security'
slug: /cloud/security
title: 'Security'
description: 'Learn more about securing ClickHouse Cloud and BYOC'
doc_type: 'reference'
---

# ClickHouse Cloud Security

This document details the security options and best practices available for ClickHouse organization and service protection.
ClickHouse is dedicated to providing secure analytical database solutions; therefore, safeguarding data and service integrity is a priority.
The information herein covers various methods designed to assist users in securing their ClickHouse environments.

## Cloud Console Authentication {#cloud-console-auth}

### Password Authentication {#password-auth}

ClickHouse Cloud console passwords are configured to NIST 800-63B standards with a minimum of 12 characters and 3 of 4 complexity requirements: upper case characters, lower case characters, numbers and/or special characters.

Learn more about [password authentication](/cloud/security/manage-my-account#email-and-password).

### Social Single Sign-On (SSO) {#social-sso}

ClickHouse Cloud supports Google or Microsoft social authentication for single sign-on (SSO).

Learn more about [social SSO](/cloud/security/manage-my-account#social-sso).

### Multi-Factor Authentication {#mfa}

Users using email and password or social SSO may also configure multi-factor authentication utilizing an authenticator app such as Authy or Google Authenticator.

Learn more about [multi-factor authentication](/cloud/security/manage-my-account/#mfa).

### Security Assertion Markup Language (SAML) Authentication {#saml-auth}

Enterprise customers may configure SAML authentication.

Learn more about [SAML authentication](/cloud/security/saml-setup).

### API Authentication {#api-auth}

Customers may configure API keys for use with OpenAPI, Terraform and Query API endpoints.

Learn more about [API authentication](/cloud/manage/openapi).

## Database Authentication {#database-auth}

### Database Password Authentication {#db-password-auth}

ClickHouse database user passwords are configured to NIST 800-63B standards with a minimum of 12 characters and complexity requirements: upper case characters, lower case characters, numbers and/or special characters.

Learn more about [database password authentication](/cloud/security/manage-database-users#database-user-id--password).

### Secure Shell (SSH) Database Authentication {#ssh-auth}

ClickHouse database users may be configured to use SSH authentication.

Learn more about [SSH authentication](/cloud/security/manage-database-users#database-ssh).

## Access Control {#access-control}

### Console Role-Based Access Control (RBAC) {#console-rbac}

ClickHouse Cloud supports role assignment for organization, service and database permissions. Database permissions using this method are supported in SQL console only.

Learn more about [console RBAC](/cloud/security/console-roles).

### Database User Grants {#database-user-grants}

ClickHouse databases support granular permission management and role-based access via user grants.

Learn more about [database user grants](/cloud/security/manage-database-users#database-permissions).

## Network Security {#network-security}

### IP Filters {#ip-filters}

Configure IP filters to limit inbound connections to your ClickHouse service.

Learn more about [IP filters](/cloud/security/setting-ip-filters).

### Private Connectivity {#private-connectivity}

Connect to your ClickHouse clusters from AWS, GCP or Azure using private connectivity.

Learn more about [private connectivity](/cloud/security/connectivity/private-networking).

## Encryption {#encryption}

### Storage Level Encryption {#storage-encryption}

ClickHouse Cloud encrypts data at rest by default using cloud provider-managed AES 256 keys.

Learn more about [storage encryption](/cloud/security/cmek#storage-encryption).

### Transparent Data Encryption {#tde}

In addition to storage encryption, ClickHouse Cloud Enterprise customers may enable database level transparent data encryption for additional protection.

Learn more about [transparent data encryption](/cloud/security/cmek#transparent-data-encryption-tde).

### Customer Managed Encryption Keys {#cmek}

ClickHouse Cloud Enterprise customers may use their own key for database level encryption.

Learn more about [customer managed encryption keys](/cloud/security/cmek#customer-managed-encryption-keys-cmek).

## Auditing and Logging {#auditing-logging}

### Console Audit Log {#console-audit-log}

Activities within the console are logged. Logs are available for review and export.

Learn more about [console audit logs](/cloud/security/audit-logging/console-audit-log).

### Database Audit Logs {#database-audit-logs}

Activities within the database are logged. Logs are available for review and export.

Learn more about [database audit logs](/cloud/security/audit-logging/database-audit-log).

### BYOC Security Playbook {#byoc-security-playbook}

Sample detection queries for security teams managing ClickHouse BYOC instances.

Learn more about the [BYOC security playbook](/cloud/security/audit-logging/byoc-security-playbook).

## Compliance {#compliance}

### Security and Compliance Reports {#compliance-reports}

ClickHouse maintains a strong security and compliance program. Check back periodically for new third party audit reports.

Learn more about [security and compliance reports](/cloud/security/compliance-overview).

### HIPAA Compliant Services {#hipaa-compliance}

ClickHouse Cloud Enterprise customers may deploy services housing protected health information (PHI) to HIPAA compliant regions after signing a Business Associate Agreement (BAA).

Learn more about [HIPAA compliance](/cloud/security/compliance/hipaa-onboarding).

### PCI Compliant Services {#pci-compliance}

ClickHouse Cloud Enterprise customers may deploy services housing credit card information to PCI compliant regions.

Learn more about [PCI compliance](/cloud/security/compliance/pci-onboarding).