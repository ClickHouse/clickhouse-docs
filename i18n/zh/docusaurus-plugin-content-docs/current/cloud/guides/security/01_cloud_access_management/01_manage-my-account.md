---
sidebar_label: '管理我的账号'
slug: /cloud/security/manage-my-account
title: '管理我的账号'
description: '本页介绍用户如何接受邀请、管理 MFA 设置以及重置密码'
doc_type: 'guide'
keywords: ['account management', 'user profile', 'security', 'cloud console', 'settings']
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


## 接受邀请 {#accept-invitation}

用户可以通过多种方式接受加入组织的邀请。如果这是您首次收到邀请,请在下方选择适合您组织的身份验证方式。

如果您已加入其他组织,可以先使用现有组织账户登录,然后在页面左下角接受邀请;或者直接从邮件中接受邀请,并使用现有账户登录。

:::note SAML 用户
使用 SAML 的组织在每个 ClickHouse 组织中都有独立的登录方式。请使用管理员提供的直接链接登录。
:::

### 电子邮件和密码 {#email-and-password}

ClickHouse Cloud 支持使用电子邮件地址和密码进行身份验证。使用此方式时,保护 ClickHouse 账户的最佳做法是设置强密码。网上有许多资源可以帮助您创建易于记忆的密码。您也可以使用随机密码生成器,并将密码保存在密码管理器中以提高安全性。

密码必须至少包含 12 个字符,并满足以下 4 项复杂度要求中的 3 项:大写字母、小写字母、数字和/或特殊字符。

### 社交单点登录 (SSO) {#social-sso}

使用 `Continue with Google` 或 `Continue with Microsoft Account` 注册服务或接受邀请。

如果您的公司使用 Google Workspace 或 Microsoft 365,您可以在 ClickHouse Cloud 中利用现有的单点登录配置。只需使用公司邮箱地址注册,并使用公司邮箱邀请其他用户即可。这样一来,您的用户必须先通过公司的登录流程(无论是通过身份提供商,还是直接通过 Google 或 Microsoft 身份验证)完成登录,才能访问 ClickHouse Cloud。

### SAML 单点登录 (SSO) {#saml-sso}

<EnterprisePlanFeatureBadge feature='SAML SSO' />

使用 SAML SSO 的用户在登录时会由其身份提供商自动添加。拥有组织管理员角色的 ClickHouse Cloud 用户可以[管理角色](/cloud/security/manage-cloud-users),为 SAML 用户分配角色,并强制要求仅使用 SAML 进行身份验证。


## 管理多因素身份验证 (MFA) {#mfa}

使用电子邮件 + 密码或社交账号身份验证的用户可以通过多因素身份验证 (MFA) 进一步保护其账户。设置 MFA 的步骤如下:

1. 登录 [console.clickhouse.cloud](https://console.clickhouse.cloud/)
2. 点击左上角 ClickHouse 徽标旁边的您的姓名首字母
3. 选择"个人资料"(Profile)
4. 在左侧选择"安全"(Security)
5. 在"身份验证器应用"(Authenticator app)磁贴中点击"设置"(Set up)
6. 使用身份验证器应用(如 Authy、1Password 或 Google Authenticator)扫描二维码
7. 输入验证码以确认
8. 在下一个屏幕上,复制恢复代码并将其保存在安全的地方
9. 勾选 `I have safely recorded this code`(我已安全记录此代码)旁边的复选框
10. 点击"继续"(Continue)

### 获取新的恢复代码 {#obtain-recovery-code}

如果您之前已注册 MFA 但未创建或丢失了恢复代码,请按照以下步骤获取新的恢复代码:

1. 访问 https://console.clickhouse.cloud
2. 使用您的凭据和 MFA 登录
3. 转到左上角的个人资料
4. 在左侧点击"安全"(Security)
5. 点击"身份验证器应用"(Authenticator app)旁边的垃圾桶图标
6. 点击"移除身份验证器应用"(Remove authenticator app)
7. 输入您的验证码并点击"继续"(Continue)
8. 在"身份验证器应用"(Authenticator app)部分点击"设置"(Set up)
9. 扫描二维码并输入新的验证码
10. 复制您的恢复代码并将其保存在安全的地方
11. 勾选 `I have safely recorded this code`(我已安全记录此代码)旁边的复选框
12. 点击"继续"(Continue)


## 账户恢复 {#account-recovery}

### 忘记密码 {#forgot-password}

如果您忘记了密码,请按照以下步骤进行自助恢复:

1. 访问 https://console.clickhouse.cloud
2. 输入您的电子邮件地址并点击 Continue
3. 点击 Forgot your password?
4. 点击 Send password reset link
5. 查看您的电子邮件并点击邮件中的 Reset password
6. 输入您的新密码,确认密码并点击 Update password
7. 点击 Back to sign in
8. 使用新密码正常登录

### MFA 自助恢复 {#mfa-self-serivce-recovery}

如果您丢失了 MFA 设备或删除了令牌,请按照以下步骤恢复并创建新令牌:

1. 访问 https://console.clickhouse.cloud
2. 输入您的凭据并点击 Continue
3. 在 Multi-factor authentication 屏幕上点击 Cancel
4. 点击 Recovery code
5. 输入代码并点击 Continue
6. 复制新的恢复代码并将其保存在安全的地方
7. 勾选 `I have safely recorded this code` 旁边的复选框并点击 continue
8. 登录后,转到左上角的个人资料
9. 点击左上角的 security
10. 点击 Authenticator app 旁边的垃圾桶图标以移除旧的身份验证器
11. 点击 Remove authenticator app
12. 当提示进行 Multi-factor authentication 时,点击 Cancel
13. 点击 Recovery code
14. 输入您的恢复代码(这是步骤 6 中生成的新代码)并点击 Continue
15. 复制新的恢复代码并将其保存在安全的地方 - 这是在移除过程中离开屏幕时的故障保护措施
16. 勾选 `I have safely recorded this code` 旁边的复选框并点击 Continue
17. 按照上述流程设置新的 MFA 因子

### 丢失 MFA 和恢复代码 {#lost-mfa-and-recovery-code}

如果您同时丢失了 MFA 设备和恢复代码,或者您丢失了 MFA 设备且从未获取过恢复代码,请按照以下步骤请求重置:

**提交工单**:如果您所在的组织有其他管理用户,即使您尝试访问单用户组织,也请要求组织中被分配 Admin 角色的成员登录组织并代表您提交支持工单以重置您的 MFA。一旦我们验证请求已通过身份验证,我们将重置您的 MFA 并通知管理员。像往常一样在没有 MFA 的情况下登录,如果需要,请转到个人资料设置以注册新因子。

**通过电子邮件重置**:如果您是组织中的唯一用户,请使用与您账户关联的电子邮件地址向 support@clickhouse.com 发送电子邮件提交支持案例。一旦我们验证请求来自正确的电子邮件,我们将重置您的 MFA 和密码。查看您的电子邮件以获取密码重置链接。设置新密码,然后如果需要,请转到个人资料设置以注册新因子。
