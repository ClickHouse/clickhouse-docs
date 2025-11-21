---
sidebar_label: '管理云用户'
slug: /cloud/security/manage-cloud-users
title: '管理云用户'
description: '本页介绍管理员如何添加用户、管理相关分配以及移除用户'
doc_type: 'guide'
keywords: ['云用户', '访问管理', '安全性', '权限', '团队管理']
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

本指南面向在 ClickHouse Cloud 中具有 Organization Admin（组织管理员）角色的用户。


## 将用户添加到您的组织 {#add-users}

### 邀请用户 {#invite-users}

管理员可以一次邀请最多三 (3) 位用户,并在邀请时分配组织和服务级别角色。

邀请用户:

1. 在左下角选择组织名称
2. 点击 `Users and roles`
3. 在左上角选择 `Invite members`
4. 输入最多 3 位新用户的电子邮件地址
5. 选择要分配给用户的组织和服务角色
6. 点击 `Send invites`

用户将收到一封电子邮件,可通过该邮件加入组织。有关接受邀请的更多信息,请参阅[管理我的账户](/cloud/security/manage-my-account)。

### 通过 SAML 身份提供商添加用户 {#add-users-via-saml}

<EnterprisePlanFeatureBadge feature='SAML SSO' />

如果您的组织已配置 [SAML SSO](/cloud/security/saml-setup),请按照以下步骤将用户添加到您的组织。

1. 在您的身份提供商中将用户添加到 SAML 应用程序,用户在首次登录之前不会显示在 ClickHouse 中
2. 当用户登录到 ClickHouse Cloud 时,系统将自动为其分配 `Member` 角色,该角色仅可登录且无其他访问权限
3. 按照下面 `Manage user role assignments` 中的说明授予权限

### 强制执行仅 SAML 身份验证 {#enforce-saml}

一旦组织中至少有一位 SAML 用户被分配了组织管理员角色,请从组织中移除使用其他身份验证方法的用户,以强制组织仅使用 SAML 身份验证。


## 管理用户角色分配 {#manage-role-assignments}

分配了组织管理员角色的用户可以随时更新其他用户的权限。

<VerticalStepper headerLevel="h3">

### 访问组织设置 {#access-organization-settings}

在服务页面中,选择您的组织名称:

<Image img={step_1} size='md' />

### 访问用户和角色 {#access-users-and-roles}

从弹出菜单中选择 `Users and roles` 菜单项。

<Image img={step_2} size='md' />

### 选择要更新的用户 {#select-user-to-update}

选择您想要修改访问权限的用户所在行末尾的菜单项:

<Image img={step_3} size='lg' />

### 选择 `edit` {#select-edit}

<Image img={step_4} size='lg' />

页面右侧将显示一个选项卡:

<Image img={step_5} size='lg' />

### 更新权限 {#update-permissions}

选择下拉菜单项以调整控制台范围的访问权限以及用户可以在 ClickHouse 控制台中访问的功能。有关角色和相关权限的列表,请参阅[控制台角色和权限](/cloud/security/console-roles)。

选择下拉菜单项以调整所选用户的服务角色访问范围。当选择 `Specific services` 时,您可以按服务控制用户的角色。

<Image img={step_6} size='md' />

### 保存更改 {#save-changes}

使用选项卡底部的 `Save changes` 按钮保存您的更改:

<Image img={step_7} size='md' />

</VerticalStepper>


## 移除用户 {#remove-user}

:::note 移除 SAML 用户
在您的身份提供商中从 ClickHouse 应用程序取消分配的 SAML 用户将无法登录 ClickHouse Cloud。该账户不会从控制台中自动移除,需要手动删除。
:::

按照以下步骤移除用户:

1. 在左下角选择组织名称
2. 点击 `用户和角色`
3. 点击用户名称旁边的三个点,然后选择 `移除`
4. 点击 `移除用户` 按钮确认操作
