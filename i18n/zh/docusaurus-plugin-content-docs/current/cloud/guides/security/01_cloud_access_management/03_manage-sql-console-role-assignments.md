---
slug: /cloud/guides/sql-console/manage-sql-console-role-assignments
sidebar_label: '管理 SQL 控制台角色分配'
title: '管理 SQL 控制台角色分配'
description: '本指南介绍如何管理 SQL 控制台中的角色分配'
doc_type: 'guide'
keywords: ['sql console', '角色分配', '访问管理', '权限', '安全']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'

# 配置 SQL 控制台角色分配 \{#configuring-sql-console-role-assignments\}

> 本指南介绍如何配置 SQL 控制台角色分配，这些分配决定整个控制台的访问权限，以及用户在 Cloud 控制台中可使用的功能。

<VerticalStepper headerLevel="h3">

### 访问服务设置 \{#access-service-settings\}

在 Services 页面中，点击你希望调整 SQL 控制台访问设置的服务右上角菜单。

<Image img={step_1} size="lg"/>

在弹出菜单中选择 `settings`。

<Image img={step_2} size="lg"/>

### 调整 SQL 控制台访问权限 \{#adjust-sql-console-access\}

在 "Security" 部分下，找到 "SQL console access" 区域：

<Image img={step_3} size="md"/>

### 更新 Service Admin 的设置 \{#update-settings-for-service-admin\}

选择 Service Admin 的下拉菜单，更改 Service Admin 角色的访问控制设置：

<Image img={step_4} size="md"/>

你可以从以下角色中进行选择：

| 角色          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

### 更新 Service Read Only 的设置 \{#update-settings-for-service-read-only\}

选择 Service Read Only 的下拉菜单，更改 Service Read Only 角色的访问控制设置：

<Image img={step_5} size="md"/>

你可以从以下角色中进行选择：

| 角色          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

### 查看具有访问权限的用户 \{#review-users-with-access\}

点击用户数量可以查看该服务的用户概览：

<Image img={step_6} size="md"/>

页面右侧会打开一个标签页，显示用户总数及其角色：

<Image img={step_7} size="md"/>

</VerticalStepper>
