---
sidebar_label: '控制台角色和权限'
slug: /cloud/security/console-roles
title: '控制台角色和权限'
description: '本页介绍 ClickHouse Cloud 控制台中的标准角色及其相应权限'
doc_type: 'reference'
keywords: ['控制台角色', '权限', '访问控制', '安全', 'rbac']
---

## 组织角色 \{#organization-roles\}

有关分配组织角色的说明，请参阅[管理云用户](/cloud/security/manage-cloud-users)。

ClickHouse 提供四种组织级角色用于用户管理。只有 Admin 角色默认具备对服务的访问权限。所有其他角色都必须与服务级角色组合后才能与服务交互。

| Role      | Description                                                                                                                                                                                                                 |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Admin     | 为组织执行所有管理活动并控制所有设置。此角色默认分配给组织中的第一个用户，并在所有服务上自动拥有 Service Admin 权限。                                                                                                           |
| Developer | 具有查看组织的权限，并可生成权限不高于自身权限的 API 密钥。                                                                                                                                                                 |
| Billing   | 查看使用情况和发票，并管理支付方式。                                                                                                                                                                                        |
| Member    | 仅可登录，并可管理个人资料设置。默认分配给 SAML SSO 用户。                                                                                                                                                                  |

## 服务角色 \{#service-roles\}

有关分配服务角色的操作说明，请参阅 [管理云用户](/cloud/security/manage-cloud-users)。

对于除 admin 之外角色的用户，服务权限必须由管理员显式授予。Service admin 角色预先配置了 SQL 控制台管理员权限，但可以进行修改以减少或移除权限。

| 角色              | 说明                       |
|-------------------|----------------------------|
| Service read only | 查看服务和设置。          |
| Service admin     | 管理服务设置。            |

## SQL 控制台角色 \{#sql-console-roles\}

有关如何分配 SQL 控制台角色的操作说明，请参阅[管理 SQL 控制台角色分配](/cloud/guides/sql-console/manage-sql-console-role-assignments)。

| 角色                  | 描述                                                                                           |
|-----------------------|------------------------------------------------------------------------------------------------|
| SQL console read only | 对服务中数据库的只读访问权限。                                                                 |
| SQL console admin     | 对服务中数据库的管理访问权限，与 Default 数据库角色等效。 |