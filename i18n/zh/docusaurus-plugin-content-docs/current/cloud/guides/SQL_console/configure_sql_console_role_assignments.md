---
'slug': '/cloud/guides/sql-console/config-sql-console-role-assignments'
'sidebar_label': '配置 SQL 控制台角色分配'
'title': '配置 SQL 控制台角色分配'
'description': '指南，介绍如何配置 SQL 控制台角色分配'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'


# 配置 SQL 控制台角色分配

> 本指南向您展示如何配置 SQL 控制台角色分配，这决定了控制台范围内的访问权限以及用户可以在云控制台中访问的功能。

<VerticalStepper>

## 访问服务设置 {#access-service-settings}

在服务页面，点击您想要调整 SQL 控制台访问设置的服务右上角的菜单。

<Image img={step_1} size="lg"/>

从弹出菜单中选择 `settings`。

<Image img={step_2} size="lg"/>

## 调整 SQL 控制台访问 {#adjust-sql-console-access}

在“安全”部分，找到“SQL 控制台访问”区域：

<Image img={step_3} size="md"/>

选择服务管理员的下拉菜单以更改服务管理员角色的访问控制设置：

<Image img={step_4} size="md"/>

您可以从以下角色中选择：

| 角色          |
|---------------|
| `无访问`      |
| `只读`       |
| `完全访问`    |

选择服务只读的下拉菜单以更改服务只读角色的访问控制设置：

<Image img={step_5} size="md"/>

您可以从以下角色中选择：

| 角色          |
|---------------|
| `无访问`      |
| `只读`       |
| `完全访问`    |

通过选择用户计数，可以查看该服务的用户概览：

<Image img={step_6} size="md"/>

页面右侧将打开一个标签，显示用户总数及其角色：

<Image img={step_7} size="md"/>

</VerticalStepper>
