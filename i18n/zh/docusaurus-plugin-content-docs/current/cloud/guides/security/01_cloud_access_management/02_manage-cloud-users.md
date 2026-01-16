---
sidebar_label: '管理云端用户'
slug: /cloud/security/manage-cloud-users
title: '管理云端用户'
description: '本文介绍管理员如何添加用户、管理分配和移除用户'
doc_type: 'guide'
keywords: ['云端用户', '访问管理', '安全', '权限', '团队管理']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/org_level_access/1_org_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/org_level_access/2_org_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/org_level_access/3_org_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/org_level_access/4_org_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/org_level_access/5_org_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/org_level_access/6_org_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/org_level_access/7_org_settings.png'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

本指南适用于在 ClickHouse Cloud 中拥有 Organization Admin 角色的用户。


## 向组织添加用户 \{#add-users\}

### 邀请用户 \{#invite-users\}

管理员一次最多可以邀请三 (3) 名用户，并在发送邀请时为其分配组织和服务级别角色。

邀请用户的步骤：
1. 在左下角选择组织名称
2. 点击 `Users and roles`
3. 在左上角点击 `Invite members`
4. 输入最多 3 名新用户的电子邮箱地址
5. 选择要分配给这些用户的组织和服务角色
6. 点击 `Send invites`

用户将收到一封电子邮件，并可通过该邮件加入组织。有关如何接受邀请的更多信息，请参阅 [Manage my account](/cloud/security/manage-my-account)。

### 通过 SAML 身份提供方添加用户 \{#add-users-via-saml\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

如果你的组织已配置 [SAML SSO](/cloud/security/saml-setup)，请按照以下步骤将用户添加到组织中。

1. 在身份提供方中将用户添加到你的 SAML 应用中，这些用户在首次登录之前不会出现在 ClickHouse 中
2. 当用户登录 ClickHouse Cloud 时，会自动被分配 `Member` 角色，该角色只能登录，无其他访问权限
3. 按照下文中 `Manage user role assignments` 的说明授予权限

### 强制仅使用 SAML 进行身份验证 \{#enforce-saml\}

当组织中至少有一个被分配为 Organization Admin 角色的 SAML 用户后，从组织中移除使用其他身份验证方式的用户，以在组织层面强制仅使用 SAML 进行身份验证。



## 管理用户角色分配 \{#manage-role-assignments\}

被授予 `Organization Admin` 角色的用户可以随时更新其他用户的权限。

<VerticalStepper headerLevel="h3">

### 访问组织设置 \{#access-organization-settings\}

在 `Services` 页面中，选择你的组织名称：

<Image img={step_1} size="md"/>

### 访问用户和角色 \{#access-users-and-roles\}

从弹出菜单中选择 `Users and roles` 菜单项。

<Image img={step_2} size="md"/>

### 选择要更新的用户 \{#select-user-to-update\}

在你希望修改访问权限的用户所在行的末尾，选择该行末尾的菜单项：

<Image img={step_3} size="lg"/>

### 选择 `edit` \{#select-edit\}

<Image img={step_4} size="lg"/>

页面右侧会显示一个侧边选项卡：

<Image img={step_5} size="lg"/>

### 更新权限 \{#update-permissions\}

通过下拉菜单调整控制台范围的访问权限，以及用户在 ClickHouse 控制台中可访问的功能。有关角色及其关联权限的完整列表，请参阅 [Console roles and permissions](/cloud/security/console-roles)。

通过下拉菜单调整所选用户服务角色的访问范围。当选择 `Specific services` 时，你可以按服务分别控制该用户的角色。

<Image img={step_6} size="md"/>

### 保存更改 \{#save-changes\}

在选项卡底部点击 `Save changes` 按钮保存更改：

<Image img={step_7} size="md"/>

</VerticalStepper>



## 删除用户 \{#remove-user\}
:::note 删除 SAML 用户
在身份提供商中已从 ClickHouse 应用取消分配的 SAML 用户，将无法登录 ClickHouse Cloud。该用户账号不会从控制台中删除，需要手动移除。
:::

按照以下步骤删除用户：

1. 在左下角选择组织名称
2. 点击 `Users and roles`
3. 点击用户名右侧的三个点并选择 `Remove`
4. 点击 `Remove user` 按钮以确认操作
