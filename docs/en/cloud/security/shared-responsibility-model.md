---
sidebar_label: Shared Responsibility Model
slug: /en/cloud/security/shared-responsibility-model
title: Security Shared Responsibility Model
---

## Service types

ClickHouse Cloud offers three service types: Basic, Scale and Enterprise. For more information, review our [Service Types](/docs/en/cloud/manage/cloud-tiers) page.


## Cloud architecture

The Cloud architecture consists of the control plane and the data plane. The control plane is responsible for organization creation, user management within the control plane, service management, API key management, and billing. The data plane runs tooling for orchestration and management, and houses customer services. For more information, review our [ClickHouse Cloud Architecture](/docs/en/cloud/reference/architecture) diagram.

## BYOC architecture

Bring your own cloud (BYOC) enables customers to run the data plane in their own cloud account. For more information, review our [(BYOC) Bring Your Own Cloud](/docs/en/cloud/reference/byoc) page.


## ClickHouse Cloud shared responsibility model
The model below generally addresses ClickHouse responsibilities and shows responsibilities that should be addressed by customers of ClickHouse Cloud and ClickHouse BYOC, respectively. For more information on our PCI shared responsibility model, please download a copy of the overview available in our [Trust Center](https://trust.clickhouse.com).

| Control                                                               | ClickHouse         | Cloud Customer      | BYOC Customer       |
|-----------------------------------------------------------------------|--------------------|---------------------|---------------------|
| Maintain separation of environments                                   | :white_check_mark: |                     | :white_check_mark:  |
| Manage network settings                                               | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| Securely manage access to ClickHouse systems                          | :white_check_mark: |                     |                     |
| Securely manage organizational users in control plane and databases   |                    | :white_check_mark:  | :white_check_mark:  |
| User management and audit                                             | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| Encrypt data in transit and at rest                                   | :white_check_mark: |                     |                     |
| Securely handle customer managed encryption keys                      |                    | :white_check_mark:  | :white_check_mark:  |
| Provide redundant infrastructure                                      | :white_check_mark: |                     | :white_check_mark:  |
| Backup data                                                           | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| Verify backup recovery capabilities                                   | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| Implement data retention settings                                     |                    | :white_check_mark:  | :white_check_mark:  |
| Security configuration management                                     | :white_check_mark: |                     | :white_check_mark:  |
| Software and infrastructure vulnerability remediation                 | :white_check_mark: |                     |                     |
| Perform penetration tests                                             | :white_check_mark: |                     |                     |
| Threat detection and response                                         | :white_check_mark: |                     | :white_check_mark:  |
| Security incident response                                            | :white_check_mark: |                     | :white_check_mark:  |

## ClickHouse Cloud configurable security features

<details>
  <summary>Network connectivity</summary>

  | Setting                                                                                              | Status    | Cloud             | Service level        |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|----------------------|
  | [IP filters](/docs/en/cloud/security/setting-ip-filters) to restrict connections to services         | Available | AWS, GCP, Azure   | All                  |
  | [Private link](/docs/en/cloud/security/private-link-overview) to securely connect to services        | Available | AWS, GCP, Azure   | Scale or Enterprise  |
  
</details>
<details>
  <summary>Access management</summary>

  
  | Setting                                                                                              | Status    | Cloud             | Service level           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [Standard role-based access](/docs/en/cloud/security/cloud-access-management) in control plane | Available | AWS, GCP, Azure | All               | 
  | [Multi-factor authentication (MFA)](/docs/en/cloud/security/cloud-authentication#multi-factor-authhentication) available | Available | AWS, GCP, Azure | All   |
  | [SAML Single Sign-On](/docs/en/cloud/security/saml-setup) to control plane available                 | Preview   | AWS, GCP, Azure   | Enterprise              |
  | Granular [role-based access control](/docs/en/cloud/security/cloud-access-management#database-roles) in databases | Available | AWS, GCP, Azure | All          |
  
</details>
<details>
  <summary>Data security</summary>

  | Setting                                                                                              | Status    | Cloud             | Service level           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [Cloud provider and region](/docs/en/cloud/reference/supported-regions) selections                   | Available | AWS, GCP, Azure   | All                     |
  | Limited [free daily backups](/docs/en/cloud/manage/backups#default-backup-policy)                    | Available | AWS, GCP, Azure   | All                     |
  | [Custom backup configurations](/docs/en/cloud/manage/backups#configurable-backups) available         | Available | GCP, AWS, Azure   | Scale or Enterprise     |
  | [Customer managed encryption keys (CMEK)](/docs/en/cloud/security/cmek) for transparent<br/> data encryption available  | Available | AWS | Scale or Enterprise |
  | [Field level encryption](/docs/en/sql-reference/functions/encryption-functions) with manual key management for granular encryption | Available | GCP, AWS, Azure | All  |

  
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

