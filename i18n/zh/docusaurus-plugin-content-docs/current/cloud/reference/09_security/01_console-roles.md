---
sidebar_label: '控制台角色和权限'
slug: /cloud/security/console-roles
title: '控制台角色和权限'
description: '本页介绍 ClickHouse Cloud 控制台中的标准角色及其相关权限'
doc_type: 'reference'
keywords: ['console roles', 'permissions', 'access control', 'security', 'rbac']
---



## 组织角色 {#organization-roles}

有关分配组织角色的说明,请参阅[管理云用户](/cloud/security/manage-cloud-users)。

ClickHouse 提供四种组织级角色用于用户管理。只有管理员角色默认拥有服务访问权限。其他所有角色必须与服务级角色结合使用才能与服务进行交互。

| 角色      | 描述                                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin     | 执行组织的所有管理活动并控制所有设置。此角色默认分配给组织中的第一个用户,并自动拥有所有服务的服务管理员权限。 |
| Developer | 查看组织访问权限,并能够生成具有相同或更低权限的 API 密钥。                                                                                                                        |
| Billing   | 查看使用情况和账单,以及管理付款方式。                                                                                                                                                                        |
| Member    | 仅可登录,能够管理个人配置文件设置。默认分配给 SAML SSO 用户。                                                                                                                   |


## 服务角色 {#service-roles}

有关分配服务角色的说明,请参阅[管理云用户](/cloud/security/manage-cloud-users)。

服务权限必须由管理员明确授予给非管理员角色的用户。服务管理员预配置了 SQL 控制台管理员访问权限,但可以修改以减少或移除权限。

| 角色              | 描述                 |
| ----------------- | -------------------- |
| Service read only | 查看服务和设置。     |
| Service admin     | 管理服务设置。       |


## SQL 控制台角色 {#sql-console-roles}

有关分配 SQL 控制台角色的说明,请参阅[管理 SQL 控制台角色分配](/cloud/guides/sql-console/manage-sql-console-role-assignments)。

| 角色                  | 描述                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| SQL console read only | 对服务内数据库的只读访问权限。                                              |
| SQL console admin     | 对服务内数据库的管理访问权限,等同于默认数据库角色。 |
