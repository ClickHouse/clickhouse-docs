---
sidebar_label: '控制台角色和权限'
slug: /cloud/security/console-roles
title: '控制台角色和权限'
description: '本页介绍 ClickHouse Cloud 控制台中的标准角色及其相应权限'
doc_type: 'reference'
keywords: ['控制台角色', '权限', '访问控制', '安全', 'rbac']
---

## 组织角色 \{#organization-roles\}

有关分配组织角色的操作说明，请参阅[管理云用户](/cloud/security/manage-cloud-users)。

ClickHouse 提供四种组织级角色用于用户管理。只有 admin 角色默认具有服务访问权限。所有其他角色都必须与服务级角色结合使用才能与服务交互。

| 角色 | 描述 |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Admin          | 为组织执行所有管理活动并控制所有设置。此角色默认分配给组织中的第一个用户，并自动拥有所有服务上的 Service Admin 权限。 |
| Billing        | 查看使用情况和发票，并管理支付方式。                                         |
| Org API reader | 具有管理组织级设置和用户的 API 权限，不提供服务访问权限。 |
| Member         | 仅可登录，并可管理个人资料设置。默认分配给 SAML SSO 用户。 |

## 服务角色 \{#service-roles\}

有关分配服务角色的操作说明，请参阅 [管理云用户](/cloud/security/manage-cloud-users)。

对于 admin 角色之外的用户，服务权限必须由管理员显式授予。Service admin 角色预先配置了 SQL 控制台管理员访问权限，但可以修改以减少或移除权限。

| 角色                     | 描述                                                  |
|--------------------------|--------------------------------------------------------------|
| Service reader           | 查看服务和设置。                                  |
| Service admin            | 管理服务设置。                                     |
| Service API reader       | 读取所有服务的服务设置的 API 权限。   |
| Service API admin        | 管理所有服务的服务设置的 API 权限。 |
| Basic service API reader | 使用查询 API 端点的 API 权限。                  | 

## SQL 控制台角色 \{#sql-console-roles\}

有关如何分配 SQL 控制台角色的操作说明，请参阅[管理 SQL 控制台角色分配](/cloud/guides/sql-console/manage-sql-console-role-assignments)。

| 角色                  | 描述                                                                                           |
|-----------------------|------------------------------------------------------------------------------------------------|
| SQL console read only | 对服务中数据库的只读访问权限。                                                                 |
| SQL console admin     | 对服务中数据库的管理访问权限，与 Default 数据库角色等效。 |

## 控制台权限 \{#console-permissions\}

下表列出了 ClickHouse 控制台和 SQL 控制台的权限。每个类别标题中都附有更多信息链接。

| 权限                                                                                      | 描述                                                                      |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **组织** ([更多信息](/cloud/security/manage-cloud-users))                                     | 组织级权限                                                                   |
| control-plane:organization:view                                                         | 查看组织详细信息和只读元数据。                                                         |
| control-plane:organization:manage                                                       | 管理组织设置和用户。                                                              |
| **计费** ([更多信息](/cloud/manage/billing))                                                  | 计费和发票管理                                                                 |
| control-plane:organization:manage-billing                                               | 管理计费设置、支付方式和发票。                                                         |
| control-plane:organization:view-billing                                                 | 查看计费用量和发票。                                                              |
| **API 密钥** ([更多信息](/cloud/manage/cloud-api))                                            | 组织 API 密钥管理                                                             |
| control-plane:organization:view-api-keys                                                | 查看组织的 API 密钥。                                                           |
| control-plane:organization:create-api-keys                                              | 为组织创建新的 API 密钥。                                                         |
| control-plane:organization:update-api-keys                                              | 更新现有 API 密钥及其权限。                                                        |
| control-plane:organization:delete-api-keys                                              | 吊销或删除 API 密钥。                                                           |
| **支持** ([更多信息](/cloud/support))                                                         | 支持工单管理                                                                  |
| control-plane:support:manage                                                            | 创建和管理支持工单，以及与 ClickHouse 支持团队的沟通。                                       |
| **服务 (常规)&#x20;**                                                                       | 常规服务级权限                                                                 |
| control-plane:service:view                                                              | 查看服务级元数据、设置和状态。                                                         |
| control-plane:service:manage                                                            | 管理服务配置和生命周期操作。                                                          |
| **备份** ([更多信息](/cloud/features/backups))                                                | 服务备份和还原点                                                                |
| control-plane:service:view-backups                                                      | 查看服务的备份和还原点。                                                            |
| control-plane:service:manage-backups                                                    | 创建、管理和还原服务备份。                                                           |
| **IP 访问列表** ([更多信息](/cloud/security/setting-ip-filters))                                | 管理 IP 访问列表和网络过滤                                                         |
| control-plane:service:manage-ip-access-list                                             | 管理服务的 IP 访问列表和网络过滤。                                                     |
| **生成式 AI** ([更多信息](/cloud/features/ai-ml/ask-ai))                                       | 配置生成式 AI 功能                                                             |
| control-plane:service:manage-generative-ai                                              | 配置和管理服务的生成式 AI 功能及设置。                                                   |
| **查询 API 端点** ([更多信息](/cloud/get-started/query-endpoints))                              | 查询 API 端点                                                               |
| control-plane:service:view-query-api-endpoints                                          | 查看查询 API 端点及其配置。                                                        |
| control-plane:service:manage-query-api-endpoints                                        | 创建和管理查询 API 端点。                                                         |
| **私有端点** ([更多信息](/cloud/security/connectivity/private-networking))                      | 私有网络和端点                                                                 |
| control-plane:service:view-private-endpoints                                            | 查看服务的私有端点配置。                                                            |
| control-plane:service:manage-private-endpoints                                          | 创建和管理私有端点及私有网络。                                                         |
| **ClickPipes** ([更多信息](/integrations/clickpipes))                                       | ClickPipes 集成                                                           |
| control-plane:service:manage-clickpipes                                                 | 管理 ClickPipes 集成及相关设置。                                                  |
| **扩缩容** ([更多信息](/manage/scaling))                                                       | 扩缩容和自动扩缩容配置                                                             |
| control-plane:service:view-scaling-config                                               | 查看服务的扩缩容配置和自动扩缩容设置。                                                     |
| control-plane:service:manage-scaling-config                                             | 修改扩缩容配置并触发扩缩容操作。                                                        |
| **ClickStack** ([更多信息](/use-cases/observability/clickstack/overview))                   | ClickStack 可观测性集成                                                       |
| control-plane:service:manage-clickstack-api                                             | 管理 ClickStack API 访问及相关集成。                                              |
| **SQL 控制台角色映射** ([更多信息](/cloud/guides/sql-console/manage-sql-console-role-assignments)) | 管理 SQL 控制台角色分配                                                          |
| sql-console:database:access                                                             | 通过 SQL 控制台无密码访问数据库 (只能与 sql-console-admin 或 sql-console-readonly 一起使用)  |