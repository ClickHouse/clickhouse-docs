---
slug: /cloud/guides/sql-console/manage-sql-console-role-assignments
sidebar_label: '管理 SQL 控制台角色指派'
title: '管理 SQL 控制台角色指派'
description: '介绍如何管理 SQL 控制台角色指派的指南'
doc_type: 'guide'
keywords: ['sql console', 'role assignments', 'access management', 'permissions', 'security']
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

> 本指南介绍如何配置 SQL 控制台角色分配,这些分配决定了控制台范围的访问权限以及用户可以在 Cloud 控制台中访问的功能。

<VerticalStepper headerLevel="h3">

### 访问服务设置 {#access-service-settings}

在服务页面中,点击您想要调整 SQL 控制台访问设置的服务右上角的菜单。

<Image img={step_1} size='lg' />

从弹出菜单中选择 `settings`。

<Image img={step_2} size='lg' />

### 调整 SQL 控制台访问权限 {#adjust-sql-console-access}

在"Security"部分下,找到"SQL console access"区域:

<Image img={step_3} size='md' />

### 更新 Service Admin 的设置 {#update-settings-for-service-admin}

选择 Service Admin 的下拉菜单以更改 Service Admin 角色的访问控制设置:

<Image img={step_4} size='md' />

您可以从以下角色中选择:

| 角色          |
| ------------- |
| `无访问权限`   |
| `只读`   |
| `完全访问` |

### 更新 Service Read Only 的设置 {#update-settings-for-service-read-only}

选择 Service Read Only 的下拉菜单以更改 Service Read Only 角色的访问控制设置:

<Image img={step_5} size='md' />

您可以从以下角色中选择:

| 角色          |
| ------------- |
| `无访问权限`   |
| `只读`   |
| `完全访问` |

### 查看具有访问权限的用户 {#review-users-with-access}

可以通过选择用户数量来查看该服务的用户概览:

<Image img={step_6} size='md' />

页面右侧将打开一个标签页,显示用户总数及其角色:

<Image img={step_7} size='md' />

</VerticalStepper>
