---
sidebar_label: '安全'
slug: /cloud/security
title: '安全'
description: '了解如何保障 ClickHouse Cloud 和 BYOC 的安全'
doc_type: 'reference'
keywords: ['security', 'cloud security', 'access control', 'compliance', 'data protection']
---



# ClickHouse Cloud 安全性

本文档详细介绍了用于保护 ClickHouse 组织和服务的安全选项与最佳实践。
ClickHouse 致力于提供安全的分析型数据库解决方案，因此将保护数据和服务的完整性作为首要任务。
本文所述信息涵盖多种方法，旨在帮助用户提升其 ClickHouse 环境的安全性。



## 云控制台身份验证 {#cloud-console-auth}

### 密码身份验证 {#password-auth}

ClickHouse Cloud 控制台密码按照 NIST 800-63B 标准配置,要求至少 12 个字符,并满足以下 4 项复杂度要求中的 3 项:大写字母、小写字母、数字和/或特殊字符。

了解更多关于[密码身份验证](/cloud/security/manage-my-account#email-and-password)的信息。

### 社交单点登录 (SSO) {#social-sso}

ClickHouse Cloud 支持使用 Google 或 Microsoft 社交账号进行单点登录 (SSO)。

了解更多关于[社交 SSO](/cloud/security/manage-my-account#social-sso) 的信息。

### 多因素身份验证 {#mfa}

使用电子邮件和密码或社交 SSO 登录的用户还可以配置多因素身份验证,通过 Authy 或 Google Authenticator 等身份验证器应用实现。

了解更多关于[多因素身份验证](/cloud/security/manage-my-account/#mfa)的信息。

### 安全断言标记语言 (SAML) 身份验证 {#saml-auth}

企业客户可以配置 SAML 身份验证。

了解更多关于 [SAML 身份验证](/cloud/security/saml-setup)的信息。

### API 身份验证 {#api-auth}

客户可以配置 API 密钥,用于 OpenAPI、Terraform 和 Query API 端点。

了解更多关于 [API 身份验证](/cloud/manage/openapi)的信息。


## 数据库身份验证 {#database-auth}

### 数据库密码身份验证 {#db-password-auth}

ClickHouse 数据库用户密码遵循 NIST 800-63B 标准配置,要求至少 12 个字符,并需满足复杂度要求:包含大写字母、小写字母、数字和/或特殊字符。

了解更多关于[数据库密码身份验证](/cloud/security/manage-database-users#database-user-id--password)。

### 安全外壳协议 (SSH) 数据库身份验证 {#ssh-auth}

ClickHouse 数据库用户可配置为使用 SSH 身份验证。

了解更多关于 [SSH 身份验证](/cloud/security/manage-database-users#database-ssh)。


## 访问控制 {#access-control}

### 控制台基于角色的访问控制 (RBAC) {#console-rbac}

ClickHouse Cloud 支持为组织、服务和数据库权限分配角色。通过此方式配置的数据库权限仅在 SQL 控制台中支持。

了解更多关于[控制台 RBAC](/cloud/security/console-roles) 的信息。

### 数据库用户授权 {#database-user-grants}

ClickHouse 数据库通过用户授权支持细粒度的权限管理和基于角色的访问控制。

了解更多关于[数据库用户授权](/cloud/security/manage-database-users#database-permissions) 的信息。


## 网络安全 {#network-security}

### IP 过滤器 {#ip-filters}

配置 IP 过滤器以限制对 ClickHouse 服务的入站连接。

了解更多关于 [IP 过滤器](/cloud/security/setting-ip-filters)的信息。

### 私有连接 {#private-connectivity}

使用私有连接从 AWS、GCP 或 Azure 连接到 ClickHouse 集群。

了解更多关于[私有连接](/cloud/security/connectivity/private-networking)的信息。


## 加密 {#encryption}

### 存储级加密 {#storage-encryption}

ClickHouse Cloud 默认使用云服务商托管的 AES 256 密钥对静态数据进行加密。

了解更多关于[存储加密](/cloud/security/cmek#storage-encryption)。

### 透明数据加密 {#tde}

除存储加密外,ClickHouse Cloud 企业版客户还可以启用数据库级透明数据加密以获得额外保护。

了解更多关于[透明数据加密](/cloud/security/cmek#transparent-data-encryption-tde)。

### 客户托管加密密钥 {#cmek}

ClickHouse Cloud 企业版客户可以使用自己的密钥进行数据库级加密。

了解更多关于[客户托管加密密钥](/cloud/security/cmek#customer-managed-encryption-keys-cmek)。


## 审计与日志 {#auditing-logging}

### 控制台审计日志 {#console-audit-log}

控制台内的活动将被记录。日志可供审查和导出。

了解更多关于[控制台审计日志](/cloud/security/audit-logging/console-audit-log)的信息。

### 数据库审计日志 {#database-audit-logs}

数据库内的活动将被记录。日志可供审查和导出。

了解更多关于[数据库审计日志](/cloud/security/audit-logging/database-audit-log)的信息。

### BYOC 安全手册 {#byoc-security-playbook}

为管理 ClickHouse BYOC 实例的安全团队提供的示例检测查询。

了解更多关于 [BYOC 安全手册](/cloud/security/audit-logging/byoc-security-playbook)的信息。


## 合规性 {#compliance}

### 安全与合规报告 {#compliance-reports}

ClickHouse 维护着完善的安全与合规体系。请定期查看最新的第三方审计报告。

了解更多[安全与合规报告](/cloud/security/compliance-overview)信息。

### HIPAA 合规服务 {#hipaa-compliance}

ClickHouse Cloud 企业版客户在签署商业伙伴协议 (BAA) 后,可将存储受保护健康信息 (PHI) 的服务部署到 HIPAA 合规区域。

了解更多 [HIPAA 合规](/cloud/security/compliance/hipaa-onboarding)信息。

### PCI 合规服务 {#pci-compliance}

ClickHouse Cloud 企业版客户可将存储信用卡信息的服务部署到 PCI 合规区域。

了解更多 [PCI 合规](/cloud/security/compliance/pci-onboarding)信息。
