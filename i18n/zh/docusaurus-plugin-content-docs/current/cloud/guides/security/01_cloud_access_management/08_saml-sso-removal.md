---
sidebar_label: '移除 SAML SSO'
slug: /cloud/security/saml-removal
title: '移除 SAML SSO'
description: '如何在 ClickHouse Cloud 中移除 SAML SSO'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', '单点登录', 'IdP']
---

# 移除 SAML SSO \{#saml-sso-removal\}

客户可能需要从某个组织中移除 SAML 集成，例如在更换身份提供商时。SAML 用户是独立于其他用户类型的身份。请按照以下说明切换到其他身份验证方式。

:::warning
此操作无法撤销。移除 SAML 集成会使基于 SAML 的用户账号失效，且无法恢复。请严格按照以下说明操作，以确保您仍然可以访问该组织。
:::

## 开始之前 \{#before-you-begin\}

在移除 SAML 之后，组织必须至少有一名使用其他身份验证方式的管理员用户，以便在移除 SAML 后将用户重新邀请回组织。执行这些步骤需要一名在 ClickHouse Cloud 中具有 Admin 权限的用户。

<VerticalStepper headerLevel="h3">

### 启用邀请功能 \{#enable-invitations\}

登录 [ClickHouse Cloud](https://console.clickhouse.cloud)，并提交一个支持工单，主题为 `Enable invitations for SAML organization`。这是为了申请在不使用 SAML 的情况下添加用户的能力。

### 记录需要重新邀请的用户 \{#note-users-to-be-reinvited\}

点击左下角的组织名称，然后选择 `Users and Roles`。查看每个用户的 `Provider` 列；所有显示 `Signed in with SSO` 的用户在移除 SAML 后都需要被重新邀请回组织。

确保这些用户知晓，在 SAML 被移除后，他们需要先接受新的邀请才能访问其账户。

</VerticalStepper>

## 将非 SAML 用户添加到组织 \{#add-non-saml-users\}

<VerticalStepper headerLevel="h3">

### 邀请用户 \{#invite-users\}

点击左下角的组织名称，然后选择 `Users and Roles`。按照说明[邀请用户](/cloud/security/manage-cloud-users#invite-users)。 

### 用户接受邀请 \{#accept-invitation\}

用户在接受邀请之前，应当先从所有基于 SAML 的会话中完全登出。使用 Google 或 Microsoft 社交登录接受邀请时，用户应点击 `Continue with Google` 或 `Continue with Microsoft` 按钮。使用邮箱和密码的用户应访问 https://console.clickhouse.cloud/?with=email 登录并接受邀请。

:::note
为避免用户因 SAML 配置被自动重定向，最佳做法是复制用于接受邀请的链接，将其粘贴到单独的浏览器，或在隐私/无痕浏览会话中打开该链接以完成邀请接受。
::: 

### 保存查询和仪表板 \{#save-queries-and-dashboards\}

用户使用新身份完成登录后，应先登出，然后使用其 SAML 账号重新登录，将已保存的查询或仪表板共享给其新身份。随后在新身份下保存一份副本以完成该流程。

</VerticalStepper>

## 移除 SAML \{#remove-saml\}

请仔细检查，确保已完成以下各项：

- 组织中至少有一名使用非 SAML 登录方式的用户被分配为 Admin 角色
- 所有需要的用户已通过其他身份验证方式重新邀请
- 所有已保存的查询和仪表板都已迁移至非 SAML 用户

如果以上项目都已完成，前往 Organization settings 选项卡，将 `Enable SAML single sign-on` 开关切换为关闭。此时会显示一条警告信息。点击 `Disable`。然后前往 Users and roles 选项卡以移除 SAML 用户。