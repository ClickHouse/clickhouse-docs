---
'slug': '/cloud/guides/sql-console/configure-org-service-role-assignments'
'sidebar_label': '配置组织和服务角色分配'
'title': '在控制台中配置组织和服务角色分配'
'description': '指南显示如何在控制台中配置 org 和服务角色分配'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/org_level_access/1_org_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/org_level_access/2_org_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/org_level_access/3_org_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/org_level_access/4_org_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/org_level_access/5_org_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/org_level_access/6_org_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/org_level_access/7_org_settings.png'


# 配置控制台中的组织和服务角色分配

> 本指南向您展示如何在组织和服务级别配置角色分配。

<VerticalStepper>

## 访问组织设置 {#access-service-settings}

从服务页面中，选择您组织的名称：

<Image img={step_1} size="md"/>

从弹出菜单中选择 `Users and roles` 菜单项。

<Image img={step_2} size="md"/>

## 调整每个用户的访问权限 {#access-per-user}

选择您希望修改访问权限的用户所在行末尾的菜单项：

<Image img={step_3} size="lg"/>

选择 `edit`：

<Image img={step_4} size="lg"/>

页面右侧将显示一个选项卡：

<Image img={step_5} size="lg"/>

选择下拉菜单项以调整控制台的访问权限和用户可以从 ClickHouse 控制台访问的功能。
这管理组织的高层次访问和管理设置：

| 角色        | 描述                                                                        |
|-------------|-------------------------------------------------------------------------------|
| `Admin`     | 执行组织的所有管理活动，控制所有设置。                                       |
| `Developer` | 查看除服务外的所有内容，创建具有相同或较低访问权限的 API 密钥。               |
| `Member`    | 仅登录，能够管理个人资料设置。                                              |
| `Billing`   | 查看使用情况和发票，并管理付款方式。                                        |

选择下拉菜单项以调整所选用户的服务角色访问范围。
这定义了特定服务的安全和操作设置：

| 访问范围           |
|---------------------|
| `All services`      |
| `Specific services` |
| `No services`       |

当选择 `Specific services` 时，您可以按服务控制用户的角色：

<Image img={step_6} size="md"/>

您可以选择以下角色：

| 角色        | 描述                                                             |
|-------------|-------------------------------------------------------------------|
| `Admin`     | 对配置和安全拥有完全控制。可以删除服务。                         |
| `Read-only` | 可以查看服务数据和安全设置。无法修改任何内容。                  |
| `No access` | 不知道该服务存在。                                             |

通过选项卡底部的 `Save changes` 按钮保存您的更改：

<Image img={step_7} size="md"/>

</VerticalStepper>
