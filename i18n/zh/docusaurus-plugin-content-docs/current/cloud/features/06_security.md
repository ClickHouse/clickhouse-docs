---
sidebar_label: '安全'
slug: /cloud/security
title: '安全'
description: '深入了解如何保障 ClickHouse Cloud 和 BYOC 的安全性'
doc_type: 'reference'
keywords: ['安全', '云安全', '访问控制', '合规性', '数据保护']
---

# ClickHouse Cloud 安全性 \\{#clickhouse-cloud-security\\}

本文档详细介绍了用于保护 ClickHouse Cloud 组织和服务的安全选项和最佳实践。
ClickHouse 致力于提供安全的分析型数据库解决方案，因此保护数据和服务的完整性是重中之重。
本文所含信息涵盖多种方法，旨在帮助用户增强其 ClickHouse 环境的安全性。

## 云控制台身份认证 \\{#cloud-console-auth\\}

### 密码认证 \\{#password-auth\\}

ClickHouse Cloud 控制台密码按照 NIST 800-63B 标准进行配置，至少包含 12 个字符，并满足以下复杂度要求中的至少 3 项：大写字母、小写字母、数字和/或特殊字符。

了解更多[密码认证](/cloud/security/manage-my-account#email-and-password)。

### 社交单点登录（SSO）\\{#social-sso\\}

ClickHouse Cloud 支持通过 Google 或 Microsoft 进行社交身份认证，以实现单点登录（SSO）。

了解更多[社交 SSO](/cloud/security/manage-my-account#social-sso)。

### 多因素认证 \\{#mfa\\}

使用电子邮件和密码或社交 SSO 的用户也可以配置多因素认证，使用 Authy 或 Google Authenticator 等认证器应用。

了解更多[多因素认证](/cloud/security/manage-my-account/#mfa)。

### 安全断言标记语言（SAML）认证 \\{#saml-auth\\}

企业客户可以配置 SAML 认证。

了解更多[SAML 认证](/cloud/security/saml-setup)。

### API 认证 \\{#api-auth\\}

客户可以为 OpenAPI、Terraform 和 Query API 端点配置 API 密钥。

了解更多[API 认证](/cloud/manage/openapi)。

## 数据库身份验证 \\{#database-auth\\}

### 数据库密码身份验证 \\{#db-password-auth\\}

ClickHouse 数据库用户密码符合 NIST 800-63B 标准进行配置，长度至少为 12 个字符，并需满足复杂度要求：包含大写字符、小写字符、数字和/或特殊字符。

详细了解[数据库密码身份验证](/cloud/security/manage-database-users#database-user-id--password)。

### 安全外壳 (SSH) 数据库身份验证 \\{#ssh-auth\\}

可以将 ClickHouse 数据库用户配置为使用 SSH 身份验证。

详细了解[SSH 身份验证](/cloud/security/manage-database-users#database-ssh)。

## 访问控制 \\{#access-control\\}

### 控制台基于角色的访问控制（RBAC） \\{#console-rbac\\}

ClickHouse Cloud 支持为组织、服务和数据库访问权限分配角色。通过此方式管理的数据库权限仅在 SQL 控制台中支持。

了解更多关于 [控制台 RBAC](/cloud/security/console-roles)。

### 数据库用户授权 \\{#database-user-grants\\}

ClickHouse 数据库支持通过用户授权实现细粒度的权限管理和基于角色的访问控制。

了解更多关于 [数据库用户授权](/cloud/security/manage-database-users#database-permissions)。

## 网络安全 \\{#network-security\\}

### IP 过滤器 \\{#ip-filters\\}

配置 IP 过滤器以限制对 ClickHouse 服务的入站连接。

详细了解 [IP 过滤器](/cloud/security/setting-ip-filters)。

### 私有网络连接 \\{#private-connectivity\\}

通过私有网络连接从 AWS、GCP 或 Azure 访问您的 ClickHouse 集群。

详细了解 [私有网络连接](/cloud/security/connectivity/private-networking)。

## 加密 \\{#encryption\\}

### 存储级加密 \\{#storage-encryption\\}

ClickHouse Cloud 默认使用由云服务商管理的 AES 256 密钥对静止数据进行加密。

详细了解[存储加密](/cloud/security/cmek#storage-encryption)。

### 透明数据加密 \\{#tde\\}

除了存储级加密之外，ClickHouse Cloud Enterprise 客户还可以启用数据库级透明数据加密，以获得额外保护。

详细了解[透明数据加密](/cloud/security/cmek#transparent-data-encryption-tde)。

### 客户管理加密密钥 \\{#cmek\\}

ClickHouse Cloud Enterprise 客户可以使用自己的密钥进行数据库级加密。

详细了解[客户管理加密密钥](/cloud/security/cmek#customer-managed-encryption-keys-cmek)。

## 审计与日志记录 \\{#auditing-logging\\}

### 控制台审计日志 \\{#console-audit-log\\}

所有控制台活动都会记录在案。日志可供查看和导出。

详细了解[控制台审计日志](/cloud/security/audit-logging/console-audit-log)。

### 数据库审计日志 \\{#database-audit-logs\\}

所有数据库活动都会记录在案。日志可供查看和导出。

详细了解[数据库审计日志](/cloud/security/audit-logging/database-audit-log)。

### BYOC 安全操作手册 \\{#byoc-security-playbook\\}

供安全团队管理 ClickHouse BYOC 实例时使用的示例检测查询。

详细了解[BYOC 安全操作手册](/cloud/security/audit-logging/byoc-security-playbook)。

## 合规性 \\{#compliance\\}

### 安全与合规报告 \\{#compliance-reports\\}

ClickHouse 实施了健全的安全与合规计划。请定期查看以获取新的第三方审计报告。

了解更多[安全与合规报告](/cloud/security/compliance-overview)。

### HIPAA 合规服务 \\{#hipaa-compliance\\}

ClickHouse Cloud Enterprise 客户在签署业务伙伴协议（BAA）后，可以在符合 HIPAA 要求的区域部署承载受保护健康信息（PHI）的服务。

了解更多 [HIPAA 合规性](/cloud/security/compliance/hipaa-onboarding)。

### PCI 合规服务 \\{#pci-compliance\\}

ClickHouse Cloud Enterprise 客户可以在符合 PCI 要求的区域部署承载信用卡信息的服务。

了解更多 [PCI 合规性](/cloud/security/compliance/pci-onboarding)。