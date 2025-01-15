---
sidebar_label: Shared Responsibility Model
slug: /en/cloud/security/shared-responsibility-model
title: Security Shared Responsibility Model
---

## Service types

ClickHouse Cloud offers three service types. For more information, review our [Service Types](/docs/en/cloud/manage/service-types) page.

- Development: Best for small workloads and dev environments
- Production: Medium-sized workloads and customer-facing applications
- Dedicated: Applications with strict latency and isolation requirements


## Cloud architecture

The Cloud architecture consists of the control plane and the data plane. The control plane is responsible for organization creation, user management within the control plane, service management, API key management, and billing. The data plane runs tooling for orchestration and management, and houses customer services. For more information, review our [ClickHouse Cloud Architecture](/docs/en/cloud/reference/architecture) diagram.

## BYOC architecture

Bring your own cloud (BYOC) enables customers to run the data plane in their own cloud account. For more information, review our [(BYOC) Bring Your Own Cloud](/docs/en/cloud/reference/byoc) page.


## ClickHouse Cloud shared responsibility model

| Control                                                               | ClickHouse Cloud  | Customer - Cloud | Customer - BYOC |
|-----------------------------------------------------------------------|-------------------|------------------|-----------------|
| Maintain separation of environments                                   | ✔️                |                  | ✔️              |
| Manage network settings                                               | ✔️                | ✔️               | ✔️              |
| Securely manage access to ClickHouse systems                          | ✔️                |                  |                 |
| Securely manage organizational users in control plane and databases   |                   | ✔️               | ✔️              |
| User management and audit                                             | ✔️                | ✔️               | ✔️              |
| Encrypt data in transit and at rest                                   | ✔️                |                  |                 |
| Securely handle customer managed encryption keys                      |                   | ✔️               | ✔️              |
| Provide redundant infrastructure                                      | ✔️                |                  | ✔️              |
| Backup data                                                           | ✔️                |                  |                 |
| Verify backup recovery capabilities                                   | ✔️                |                  |                 |
| Implement data retention settings                                     |                   | ✔️               | ✔️              |
| Security configuration management                                     | ✔️                |                  | ✔️              |
| Software and infrastructure vulnerability remediation                 | ✔️                |                  |                 |
| Perform penetration tests                                             | ✔️                |                  |                 |
| Threat detection and response                                         | ✔️                |                  | ✔️              |
| Security incident response                                            | ✔️                |                  | ✔️              |

## ClickHouse Cloud configurable security features

<details>
  <summary>Network connectivity</summary>

  | Setting                                                                                              | Status    | Cloud             | Service level       |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|---------------------|
  | [IP filters](/docs/en/cloud/security/setting-ip-filters) to restrict connections to services         | Available | AWS, GCP, Azure   | All                 |
  | [Private link](/docs/en/cloud/security/private-link-overview) to securely connect to services        | Available | AWS, GCP, Azure   | Scale or Enterprise |
  
</details>
<details>
  <summary>Access management</summary>

  
  | Setting                                                                                              | Status    | Cloud             | Service level           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [Standard role-based access](/docs/en/cloud/security/cloud-access-management) in control plane       | Available | AWS, GCP, Azure   | All                     | 
  | [Multi-factor authentication (MFA)](/docs/en/cloud/security/cloud-authentication#multi-factor-authhentication) available | Available | AWS, GCP, Azure | All   |
  | [SAML Single Sign-On](/docs/en/cloud/security/saml-setup) to control plane available                 | Available | AWS, GCP, Azure   | Enterprise              |
  | Granular [role-based access control](/docs/en/cloud/security/cloud-access-management#database-roles) in databases | Available | AWS, GCP, Azure | All          |
  
</details>
<details>
  <summary>Data security</summary>

  | Setting                                                                                              | Status    | Cloud             | Service level           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [Cloud provider and region](/docs/en/cloud/reference/supported-regions) selections                   | Available | AWS, GCP, Azure   | All                     |
  | [Standard backups](/docs/en/cloud/manage/backups#default-backup-policy)                              | Available | AWS, GCP, Azure   | All                     |
  | [Custom backup configurations](/docs/en/cloud/manage/backups#configurable-backups) available         | Available | GCP, AWS, Azure   | Scale or Enterprise     |
  | [Customer managed encryption keys (CMEK)](/docs/en/cloud/security/cmek) for transparent<br/> data encryption available  | Available | AWS | Enterprise         |
  | [Field level encryption](/docs/en/sql-reference/functions/encryption-functions) with manual key management for granular encryption | Availablle | GCP, AWS, Azure | All  |

  
</details>
<details>
  <summary>Data retention</summary>

  | Setting                                                                                              | Status    | Cloud             | Service level           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [Time to live (TTL)](/docs/en/sql-reference/statements/alter/ttl) settings to manage retention       | Available | AWS, GCP, Azure   | All                     |
  | [ALTER TABLE DELETE](/docs/en/sql-reference/statements/alter/delete) for heavy deletion actions      | Available | AWS, GCP, Azure   | All                     |
  | [Lightweight DELETE](/docs/en/sql-reference/statements/delete) for measured deletion activities      | Available | AWS, GCP, Azure   | All                     |
  
</details>
<details>
  <summary>Auditing and logging</summary>

  | Setting                                                                                              | Status    | Cloud             | Service level           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [Audit log](/docs/en/cloud/security/audit-logging) for control plane activities                      | Available | AWS, GCP, Azure   | All                     |
  | [Session log](/docs/en/operations/system-tables/session_log) for database activities                 | Available | AWS, GCP, Azure   | All                     |
  | [Query log](/docs/en/operations/system-tables/query_log) for database activities                     | Available | AWS, GCP, Azure   | All                     |
  
</details>

## ClickHouse Cloud compliance

  | Framework                                                                                            | Status    | Cloud             | Service level           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | ISO 27001 compliance                                                                                 | Available | AWS, GCP, Azure   | All                     |
  | SOC 2 Type II compliance                                                                             | Available | AWS, GCP, Azure   | All                     |
  | GDPR and CCPA compliance                                                                             | Available | AWS, GCP, Azure   | All                     |
  | HIPAA compliance                                                                                     | Available | AWS, GCP          | Enterprise              |

  For more information on supported compliance frameworks, please review our [Security and Compliance](/docs/en/cloud/security/security-and-compliance) page.

