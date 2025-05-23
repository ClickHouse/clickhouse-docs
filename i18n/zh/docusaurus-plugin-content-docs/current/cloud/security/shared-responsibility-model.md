---
'sidebar_label': '共享责任模型'
'slug': '/cloud/security/shared-responsibility-model'
'title': '安全共享责任模型'
'description': '了解有关ClickHouse Cloud的安全模型的更多信息'
---

## 服务类型 {#service-types}

ClickHouse Cloud 提供三种服务类型：Basic、Scale 和 Enterprise。欲了解更多信息，请查看我们的 [服务类型](/cloud/manage/cloud-tiers) 页面。

## 云架构 {#cloud-architecture}

云架构由控制平面和数据平面组成。控制平面负责组织创建、控制平面内用户管理、服务管理、API 密钥管理和账单。数据平面运行编排和管理的工具，并存放客户服务。欲了解更多信息，请查看我们的 [ClickHouse Cloud 架构](/cloud/reference/architecture) 图。

## BYOC 架构 {#byoc-architecture}

自带云 (BYOC) 使客户能够在自己的云账户中运行数据平面。欲了解更多信息，请查看我们的 [(BYOC) 自带云](/cloud/reference/byoc) 页面。

## ClickHouse Cloud 共享责任模型 {#clickhouse-cloud-shared-responsibility-model}
下面的模型大致说明了 ClickHouse 的责任，并显示了 ClickHouse Cloud 和 ClickHouse BYOC 客户需要承担的责任。有关我们的 PCI 共享责任模型的更多信息，请下载我们 [信任中心](https://trust.clickhouse.com) 中提供的概述副本。

| 控制                                                                  | ClickHouse        | 云客户             | BYOC 客户          |
|-----------------------------------------------------------------------|-------------------|---------------------|---------------------|
| 维护环境隔离                                                         | :white_check_mark: |                     | :white_check_mark:  |
| 管理网络设置                                                         | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| 安全地管理对 ClickHouse 系统的访问                                   | :white_check_mark: |                     |                     |
| 安全地管理控制平面和数据库中的组织用户                               |                   | :white_check_mark:  | :white_check_mark:  |
| 用户管理和审计                                                       | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| 加密数据在传输和静止状态下                                           | :white_check_mark: |                     |                     |
| 安全地处理客户管理的加密密钥                                         |                   | :white_check_mark:  | :white_check_mark:  |
| 提供冗余基础设施                                                     | :white_check_mark: |                     | :white_check_mark:  |
| 备份数据                                                             | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| 验证备份恢复能力                                                     | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| 实施数据保留设置                                                     |                   | :white_check_mark:  | :white_check_mark:  |
| 安全配置管理                                                         | :white_check_mark: |                     | :white_check_mark:  |
| 软件和基础设施漏洞修复                                               | :white_check_mark: |                     |                     |
| 执行渗透测试                                                         | :white_check_mark: |                     |                     |
| 威胁检测与响应                                                       | :white_check_mark: |                     | :white_check_mark:  |
| 安全事件响应                                                         | :white_check_mark: |                     | :white_check_mark:  |

## ClickHouse Cloud 可配置的安全功能 {#clickhouse-cloud-configurable-security-features}

<details>
  <summary>网络连接</summary>

  | 设置                                                                                                 | 状态      | 云                  | 服务级别             |  
  |------------------------------------------------------------------------------------------------------|-----------|---------------------|---------------------|
  | [IP 过滤器](/cloud/security/setting-ip-filters) 限制对服务的连接                                   | 可用     | AWS, GCP, Azure     | 所有                 |
  | [私有链接](/cloud/security/private-link-overview) 安全连接到服务                                   | 可用     | AWS, GCP, Azure     | Scale 或 Enterprise  |
  
</details>
<details>
  <summary>访问管理</summary>

  
  | 设置                                                                                                 | 状态      | 云                  | 服务级别             |  
  |------------------------------------------------------------------------------------------------------|-----------|---------------------|---------------------|
  | [标准基于角色的访问](/cloud/security/cloud-access-management) 在控制平面                          | 可用     | AWS, GCP, Azure     | 所有                 | 
  | [多因素认证 (MFA)](/cloud/security/cloud-authentication#multi-factor-authentication) 可用          | 可用     | AWS, GCP, Azure     | 所有                 |
  | [SAML 单点登录](/cloud/security/saml-setup) 可用于控制平面                                          | 预览     | AWS, GCP, Azure     | Enterprise           |
  | 数据库中的细粒度 [基于角色的访问控制](/cloud/security/cloud-access-management/overview#database-permissions) | 可用     | AWS, GCP, Azure     | 所有                 |
  
</details>
<details>
  <summary>数据安全</summary>

  | 设置                                                                                                 | 状态      | 云                  | 服务级别             |  
  |------------------------------------------------------------------------------------------------------|-----------|---------------------|---------------------|
  | [云提供商和地区](/cloud/reference/supported-regions) 选择                                          | 可用     | AWS, GCP, Azure     | 所有                 |
  | 有限的 [每日免费备份](/cloud/manage/backups/overview#default-backup-policy)                          | 可用     | AWS, GCP, Azure     | 所有                 |
  | [自定义备份配置](/cloud/manage/backups/overview#configurable-backups) 可用                          | 可用     | GCP, AWS, Azure     | Scale 或 Enterprise  |
  | [客户管理的加密密钥 (CMEK)](/cloud/security/cmek) 透明<br/> 数据加密可用                       | 可用     | AWS, GCP            | Enterprise           |
  | [字段级加密](/sql-reference/functions/encryption-functions) 带有手动密钥管理的细粒度加密            | 可用     | GCP, AWS, Azure     | 所有                 |

  
</details>
<details>
  <summary>数据保留</summary>

  | 设置                                                                                                 | 状态      | 云                  | 服务级别             |  
  |------------------------------------------------------------------------------------------------------|-----------|---------------------|---------------------|
  | [生存时间 (TTL)](/sql-reference/statements/alter/ttl) 设置管理保留                                  | 可用     | AWS, GCP, Azure     | 所有                 |
  | [ALTER TABLE DELETE](/sql-reference/statements/alter/delete) 进行大量删除操作                      | 可用     | AWS, GCP, Azure     | 所有                 |
  | [轻量级 DELETE](/sql-reference/statements/delete) 用于有计划的删除活动                             | 可用     | AWS, GCP, Azure     | 所有                 |
  
</details>
<details>
  <summary>审计与日志记录</summary>

  | 设置                                                                                                 | 状态      | 云                  | 服务级别             |  
  |------------------------------------------------------------------------------------------------------|-----------|---------------------|---------------------|
  | [审计日志](/cloud/security/audit-logging) 控制平面活动                                              | 可用     | AWS, GCP, Azure     | 所有                 |
  | [会话日志](/operations/system-tables/session_log) 数据库活动                                          | 可用     | AWS, GCP, Azure     | 所有                 |
  | [查询日志](/operations/system-tables/query_log) 数据库活动                                         | 可用     | AWS, GCP, Azure     | 所有                 |
  
</details>

## ClickHouse Cloud 合规性 {#clickhouse-cloud-compliance}

  | 框架                                                                                                 | 状态      | 云                  | 服务级别             |  
  |------------------------------------------------------------------------------------------------------|-----------|---------------------|---------------------|
  | ISO 27001 合规性                                                                                     | 可用     | AWS, GCP, Azure     | 所有                 |
  | SOC 2 类型 II 合规性                                                                                 | 可用     | AWS, GCP, Azure     | 所有                 |
  | GDPR 和 CCPA 合规性                                                                                 | 可用     | AWS, GCP, Azure     | 所有                 |
  | HIPAA 合规性                                                                                         | 可用     | AWS, GCP            | Enterprise           |
  | PCI 合规性                                                                                           | 可用     | AWS                 | Enterprise           |

  关于支持的合规框架的更多信息，请查看我们的 [安全与合规](/cloud/security/security-and-compliance) 页面。
