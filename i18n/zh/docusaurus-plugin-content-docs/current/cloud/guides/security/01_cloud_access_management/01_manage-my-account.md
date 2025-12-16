---
sidebar_label: '管理我的账户'
slug: /cloud/security/manage-my-account
title: '管理我的账户'
description: '本页介绍您如何接受邀请、管理 MFA 设置以及重置密码'
doc_type: 'guide'
keywords: ['账户管理', '用户资料', '安全', '云控制台', '设置']
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


## 接受邀请 {#accept-invitation}

用户可以通过多种方式接受加入组织的邀请。如果这是您首次收到邀请，请在下方为您的组织选择合适的身份验证方式。 

如果这不是您的第一个组织，可以先使用现有组织的账户登录，然后在页面左下角接受邀请；或者先通过电子邮件中的邀请链接接受邀请，再使用现有账户登录。 

:::note SAML 用户
使用 SAML 的组织在每个 ClickHouse 组织下都有唯一的登录入口。请使用管理员提供的直接链接进行登录。
:::

### 电子邮件和密码 {#email-and-password}

ClickHouse Cloud 允许您使用电子邮件地址和密码进行身份验证。使用此方法时，保护 ClickHouse 账户的最佳方式是使用强密码。网上有许多资源可以帮助您设计一个便于记忆的密码。或者，您也可以使用随机密码生成器生成密码，并将密码存储在密码管理器中以提升安全性。

密码长度必须至少为 12 个字符，并满足以下复杂性要求中的任意 3 项：大写字母、小写字母、数字和/或特殊字符。

### 社交账号单点登录 (SSO) {#social-sso}

使用 `Continue with Google` 或 `Continue with Microsoft Account` 来注册服务或接受邀请。

如果您的公司使用 Google Workspace 或 Microsoft 365，您可以在 ClickHouse Cloud 中复用现有的单点登录配置。为此，只需使用公司邮箱地址注册，并使用他们的公司邮箱地址邀请其他用户。这样，您的用户必须先通过公司现有的登录流程（无论是通过身份提供商，还是直接使用 Google 或 Microsoft 身份验证），然后才能登录 ClickHouse Cloud。 

### SAML 单点登录 (SSO) {#saml-sso}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

使用 SAML SSO 的用户在登录时会由其身份提供商自动添加。具有 Organization Admin 角色的 ClickHouse Cloud 用户可以[管理分配给 SAML 用户的角色](/cloud/security/manage-cloud-users)，并强制将 SAML 设为唯一的身份验证方式。

## 管理多重身份验证（MFA） {#mfa}

使用电子邮件 + 密码或社交登录的用户，可以通过启用多重身份验证（MFA）进一步保护其账号。要设置 MFA：

1. 登录 [console.clickhouse.cloud](https://console.clickhouse.cloud/)
2. 点击左上角 ClickHouse 标志旁边显示的姓名首字母
3. 选择 Profile
4. 在左侧选择 Security
5. 在 Authenticator app 卡片中点击 Set up
6. 使用 Authy、1Password 或 Google Authenticator 等身份验证应用扫描二维码
7. 输入验证码进行确认
8. 在下一页面复制恢复代码（recovery code），并将其保存在安全的位置
9. 勾选 `I have safely recorded this code` 复选框
10. 点击 Continue

### 获取新的恢复代码 {#obtain-recovery-code}

如果你之前已启用 MFA，但没有创建恢复代码或已遗失恢复代码，请按照以下步骤获取新的恢复代码：
1. 访问 https://console.clickhouse.cloud
2. 使用你的凭据和 MFA 登录
3. 点击左上角进入你的个人资料（Profile）
4. 在左侧点击 Security
5. 点击 Authenticator app 旁边的垃圾桶图标
6. 点击 Remove authenticator app
7. 输入验证码并点击 Continue
8. 在 Authenticator app 部分点击 Set up
9. 扫描二维码并输入新的验证码
10. 复制你的恢复代码并将其保存在安全的位置
11. 勾选 `I have safely recorded this code` 复选框
12. 点击 Continue

## 账户恢复 {#account-recovery}

### 忘记密码 {#forgot-password}

如果您忘记了密码，请按照以下步骤自行恢复：

1. 访问 https://console.clickhouse.cloud
2. 输入您的邮箱地址并点击 Continue
3. 点击 Forgot your password?
4. 点击 Send password reset link
5. 查收电子邮件，并在邮件中点击 Reset password
6. 输入您的新密码，确认密码并点击 Update password
7. 点击 Back to sign in
8. 使用新密码正常登录

### MFA 自助恢复 {#mfa-self-serivce-recovery}

如果您丢失了 MFA 设备或删除了令牌，请按照以下步骤恢复并创建新令牌：

1. 访问 https://console.clickhouse.cloud
2. 输入您的登录凭证并点击 Continue
3. 在 Multi-factor authentication 界面点击 Cancel
4. 点击 Recovery code
5. 输入恢复代码并点击 Continue
6. 复制新的恢复代码并妥善保存
7. 勾选 `I have safely recorded this code`，然后点击 Continue
8. 登录后，前往左上角的个人资料
9. 点击左上角的 Security
10. 点击 Authenticator app 旁边的垃圾桶图标以移除旧的验证器
11. 点击 Remove authenticator app
12. 当系统提示进行 Multi-factor authentication 时，点击 Cancel
13. 点击 Recovery code
14. 输入您的恢复代码（即第 7 步生成的新代码）并点击 Continue
15. 再次复制新的恢复代码并妥善保存——这是在您在移除过程中离开该页面时的应急措施
16. 勾选 `I have safely recorded this code`，然后点击 Continue
17. 按照上面的流程设置新的 MFA 因子

### 丢失 MFA 和恢复代码 {#lost-mfa-and-recovery-code}

如果您同时丢失了 MFA 设备和恢复代码，或者丢失 MFA 设备且从未获取过恢复代码，请按照以下步骤请求重置：

**提交工单**：如果您所在的组织中还有其他管理员用户，即使您只是尝试访问一个单用户组织，也请让组织中具有 Admin 角色的成员登录组织，并代表您提交支持工单来重置您的 MFA。我们在验证请求已通过身份认证后，会重置您的 MFA 并通知该 Admin。之后您可以像往常一样在没有 MFA 的情况下登录，如有需要，可前往个人资料设置中注册新的因子。

**通过电子邮件重置**：如果您是组织中的唯一用户，请使用与您账户关联的邮箱地址，通过电子邮件（support@clickhouse.com）提交支持请求。我们在验证请求来自正确邮箱后，会重置您的 MFA 和密码。然后前往您的邮箱获取密码重置链接。设置新密码后，如有需要，可前往个人资料设置中注册新的因子。 