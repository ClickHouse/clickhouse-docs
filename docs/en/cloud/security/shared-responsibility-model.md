---
sidebar_label: Shared Responsibility Model
slug: /en/cloud/security/shared-responsibility-model
title: Security Shared Responsibility Model
---
# Security Shared Responsibility Model

Security is a team effort and we are more successful together. This document is intended to provide information about where we rely on our cloud service providers (“CSP”) to provide security controls, where we manage security, and what you can do to improve security of your services with us. Read on to see how we are with you for every step in your journey.

## Cloud Service Provider Responsibilities
We rely on CSPs, including Amazon Web Services (“AWS”), Google Cloud Platform (“GCP”) and Microsoft Azure, to provide, configure and review physical security and environmental controls of our hosted environments. They also provide security of compute, storage, and network resources we leverage to provide our service.

## ClickHouse Responsibilities
In addition to security layers provided by CSPs, we securely configure and monitor operating systems, network resources and firewalls that support our services. We also manage infrastructure and application identity and access management of our internal users, and configure our systems to provide encryption in transit and at rest.

### Dedicated Security Team
We have a dedicated team of security experts that configure security settings, review alerts and respond to security incidents. Our team uses industry leading tools to monitor for vulnerabilities, misconfigurations and threats. We also have incident response playbooks and practice them. Want to help us out? Tell us about any vulnerabilities you may find by following the responsible disclosure steps in our [Security Policy](https://github.com/ClickHouse/ClickHouse/security/policy) page.

### Development Security
Security is part of everyday operations. Our engineering teams utilize static code and software composition analysis scans to identify vulnerabilities in our code or third party libraries and they run automated “fuzzing” to identify unexpected issues.

### Third Party Assessments & Compliance
We utilize independent experts to perform penetration testing, internal and external audits of our services. Need to demonstrate compliance for your cloud workloads? We can help you with that! We maintain SOC 2 Type II and ISO 27001 compliance. Visit our Trust Center at [trust.clickhouse.com](trust.clickhouse.com) to request copies of these reports.

## Customer Responsibilities
ClickHouse Cloud was built with security in mind. We provide a number of features to enable you to meet your security objectives. Always check with your security and compliance teams to determine the best combination of settings for you. 

### Cloud Console
Our cloud console allows you to manage users and some security settings of your services.

#### Identity & Access Management
- When using [email + password authentication](/docs/en/cloud/security/cloud-authentication.md#email--password), use strong passwords
- [Multi-factor authentication (MFA)](/docs/en/cloud/security/cloud-authentication.md#multi-factor-authhentication) can be configured for email + password users
- [Single-Sign On (SSO)](/docs/en/cloud/security/cloud-authentication.md#sso-using-google-or-microsoft-social-authentication) using Google Workspace or Microsoft 365 is available
- [Standard role-based access](/docs/en/cloud/security/users-and-roles.md#console-roles) is available
- Console users may use [passwordless access](/docs/en/cloud/security/users-and-roles.md#more-on-passwordless-authentication) to services via SQL console

#### Security Logging
- Console activities are logged and the [audit log](/docs/en/cloud/security/audit-logging.md) is available for review

#### Geographic Control
- Select your preferred [cloud provider and region](/docs/en/cloud/reference/supported-regions.md) for each service

#### Network Control
- Configure [IP filters](/docs/en/cloud/security/setting-ip-filters.md) to restrict database connections
- Configure [private link](/docs/en/cloud/security/private-link-overview.md) with your cloud provider

#### Transparent Database Encryption
- ADVANCED: [Customer managed encryption keys (CMEK)](/docs/en/cloud/security/cmek.md) are available

#### Backups
- Customers are provided with a limited number of [free daily backups](/docs/en/cloud/manage/backups.md#default-backup-policy)
- ADVANCED: [Custom backup configurations](/docs/en/cloud/manage/backups.md#configurable-backups) are available

### ClickHouse Services
ClickHouse Services (databases) provide additional levels of control.

#### Identity & Access Management
- Granular [role-based access control](/docs/en/cloud/security/users-and-roles.md#database-roles) may be configured in the database
- [Create users using sha256_hash](/docs/en/cloud/security/cloud-authentication.md#database-user-id--password) to avoid sharing plain text passwords
- Periodically [review access](/docs/en/cloud/security/users-and-roles.md#creating-sql-console-roles)

#### Security Logging
- [Session](/docs/en/operations/system-tables/session_log.md) and [query logs](/docs/en/operations/system-tables/query_log.md) are recorded within each database and are available for review

#### Data Retention
- Utilize [Time To Live (TTL)](/docs/en/sql-reference/statements/alter/ttl.md) settings to manage retention periods
- Use [ALTER TABLE DELETE](/docs/en/sql-reference/statements/alter/delete.md) or [lightweight DELETE](/docs/en/sql-reference/statements/delete.md) as needed

#### Field Level Encryption
- ADVANCED: [Field level encryption](/docs/en/sql-reference/functions/encrypt-functions.md) can be implemented with manual key management procedures

