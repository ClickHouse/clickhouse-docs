---
sidebar_label: '管理云端用户'
slug: /cloud/security/manage-cloud-users
title: '管理云端用户'
description: '本文介绍管理员如何添加用户、管理分配和移除用户'
doc_type: 'guide'
keywords: ['云端用户', '访问管理', '安全', '权限', '团队管理']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/control_plane/1_users_and_roles.png'
import step_2 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/2_invite_user.png'
import step_3 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/3_invite_user.png'
import step_4 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/4_invite_user.png'
import step_5 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/5_edit_user.png'
import step_6 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/6_edit_user.png'

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

本指南适用于在 ClickHouse Cloud 中拥有 Admin 角色的用户。

## 向组织添加用户 \{#add-users\}

### 邀请用户 \{#invite-users\}

管理员可以一次邀请多个用户，并在发出邀请时分配一个或多个角色。

<VerticalStepper headerLevel="h3">
  ### 进入组织设置并选择 `Users and roles`

  在服务页面中，选择您的组织名称。然后在弹出菜单中选择 `Users and roles`。

  <Image img={step_1} size="lg" />

  ### 在左上角选择 `Invite members`

  点击左上角的 `Invite members` 按钮。

  <Image img={step_2} size="lg" />

  ### 输入新成员的电子邮件地址并分配角色

  在邀请界面顶部输入电子邮件地址。选择要分配给这些用户的一个或多个角色。

  <Image img={step_3} size="lg" />

  ### 点击 `Send invites`

  点击界面底部的 `Send invites`。用户将收到一封电子邮件，并可通过邮件中的链接加入组织。有关如何接受邀请的更多信息，请参见 [管理我的账户](/cloud/security/manage-my-account)。

  <Image img={step_4} size="lg" />
</VerticalStepper>

### 通过 SAML 身份提供商添加用户 \{#users-and-roles-1\}

<EnterprisePlanFeatureBadge feature="SAML SSO" />

如果你的组织已配置 [SAML SSO](/cloud/security/saml-setup)，请按照以下步骤将用户添加到组织中。

1. 在身份提供商中将用户添加到你的 SAML 应用中。这些用户在首次登录之前不会出现在 ClickHouse 中。
2. 当用户登录 ClickHouse Cloud 时，会自动被分配你在 SAML 配置中选择的默认角色。
3. 按照下文中 `管理用户角色分配` 的说明授予权限

### 强制仅使用 SAML 进行身份验证 \{#invite-members\}

当组织中至少有一个被分配为 Admin 角色的 SAML 用户后，从组织中移除使用其他身份验证方式的用户，以在组织层面强制仅使用 SAML 进行身份验证。

## 管理用户角色分配

拥有 Admin 角色的用户可随时更新其他用户的权限。

<VerticalStepper headerLevel="h3">
  ### 访问组织设置并选择 `Users and roles`

  在服务页面中，选择您的组织名称。然后在弹出菜单中选择 `Users and roles`。

  <Image img={step_1} size="lg" />

  ### 选择要更新的用户并选择“编辑”

  在要修改访问权限的用户所在行末尾，选择菜单项。然后在弹出菜单中选择 `edit`。

  <Image img={step_5} size="lg" />

  ### 更新权限

  点击 `Roles` 框以展开菜单。选中相应复选框可为用户添加或移除角色。有关角色及其对应权限的列表，请参阅 [Console 角色和权限](/cloud/security/console-roles)。

  <Image img={step_6} size="lg" />

  ### 保存变更

  使用选项卡底部的 `Save changes` 按钮保存变更。
</VerticalStepper>

## 删除用户 {#remove-user}

:::note 删除 SAML 用户
在身份提供商中已从 ClickHouse 应用取消分配的 SAML 用户，将无法登录 ClickHouse Cloud。该用户账号不会从控制台中删除，需要手动移除。
:::

按照以下步骤删除用户：

1. 在左下角选择组织名称
2. 点击 `Users and roles`
3. 点击用户名右侧的三个点并选择 `Remove`
4. 点击 `Remove user` 按钮以确认操作