---
sidebar_label: '云认证'
slug: '/cloud/security/cloud-authentication'
title: '云认证'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# 云认证

ClickHouse Cloud 提供多种认证方式。本指南解释了配置认证的一些最佳实践。选择认证方法时，请始终与安全团队确认。

## 密码设置 {#password-settings}

我们控制台和服务（数据库）的最低密码设置目前符合 [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) 的认证保证级别 1：
- 最少 12 个字符
- 包含以下四项中的三项：
   - 1 个大写字母
   - 1 个小写字母
   - 1 个数字
   - 1 个特殊字符

## 邮箱 + 密码 {#email--password}

ClickHouse Cloud 允许您使用电子邮件地址和密码进行认证。使用这种方法时，保护您的 ClickHouse 账户的最佳方法是使用强密码。有许多在线资源可以帮助您制定一个易于记忆的密码。或者，您可以使用随机密码生成器，并将密码存储在密码管理器中以增强安全性。

## 使用 Google 或 Microsoft 社交认证的单点登录 (SSO) {#sso-using-google-or-microsoft-social-authentication}

如果您的公司使用 Google Workspace 或 Microsoft 365，您可以利用您当前的单点登录设置在 ClickHouse Cloud 中进行认证。为此，只需使用您的公司电子邮件地址注册，并邀请其他用户使用他们的公司电子邮件。结果是，您的用户必须使用您公司的登录流程进行登录，无论是通过您的身份提供者，还是直接通过 Google 或 Microsoft 认证，然后才能在 ClickHouse Cloud 中进行认证。

## 多因素认证 {#multi-factor-authentication}

使用电子邮件 + 密码或社交认证的用户可以通过使用多因素认证 (MFA) 进一步保护他们的账户。要设置 MFA：
1. 登录 console.clickhouse.cloud
2. 点击 ClickHouse 徽标旁边左上角的您的姓名首字母
3. 选择个人资料
4. 在左侧选择安全
5. 点击认证器应用的设置
6. 使用 Authy、1Password 或 Google Authenticator 等认证器应用扫描二维码
7. 输入代码以确认
8. 在下一个屏幕上，复制恢复代码并将其存储在安全的地方
9. 勾选 `我已经安全地记录了此代码`
10. 点击继续
    
## 账户恢复 {#account-recovery}

<details> 
   <summary>获取恢复代码</summary>

   如果您之前已注册 MFA，但没有创建或遗失恢复代码，请按照以下步骤获取新恢复代码：
   1. 前往 https://console.clickhouse.cloud
   2. 使用您的凭据和 MFA 登录
   3. 前往左上角的您的个人资料
   4. 点击左侧的安全
   5. 点击您认证器应用旁边的垃圾桶图标
   6. 点击移除认证器应用
   7. 输入您的代码并点击继续
   8. 点击认证器应用部分的设置
   9. 扫描二维码并输入新代码
   10. 复制您的恢复代码并将其存储在安全的地方
   11. 勾选 `我已经安全地记录了此代码`
   12. 点击继续
   
</details>
<details>
   <summary>忘记密码</summary>

   如果您忘记了密码，请按照以下步骤进行自助恢复：
   1. 前往 https://console.clickhouse.cloud
   2. 输入您的电子邮件地址并点击继续
   3. 点击忘记密码？
   4. 点击发送密码重置链接
   5. 检查您的电子邮件并从电子邮件中点击重置密码
   6. 输入您的新密码，确认密码并点击更新密码
   7. 点击返回登录
   8. 使用您的新密码正常登录
            
</details>
<details>
   <summary>丢失 MFA 设备或令牌</summary>

   如果您丢失了 MFA 设备或删除了令牌，请按照以下步骤恢复并创建新令牌：
   1. 前往 https://console.clickhouse.cloud
   2. 输入您的凭据并点击继续
   3. 在多因素认证屏幕上点击取消
   4. 点击恢复代码
   5. 输入代码并按继续
   6. 复制新的恢复代码并将其安全存储
   7. 勾选 `我已经安全地记录了此代码`，然后点击继续
   8. 登录后，前往左上角的个人资料
   9. 点击左上角的安全
   10. 点击认证器应用旁边的垃圾桶图标以移除旧认证器
   11. 点击移除认证器应用
   12. 当提示您进行多因素认证时，点击取消
   13. 点击恢复代码
   14. 输入您的恢复代码（这是在第 7 步生成的新代码）并点击继续
   15. 复制新恢复代码并将其安全存储 - 这是在移除过程中如果您离开屏幕的备用方案
   16. 勾选 `我已经安全地记录了此代码`，然后点击继续
   17. 按照上述过程设置新的 MFA 因素
       
</details>
<details>
   <summary>丢失 MFA 和恢复代码</summary>

   如果您丢失了 MFA 设备和恢复代码，或者您丢失了 MFA 设备且从未获得恢复代码，请按照以下步骤请求重置：

   **提交工单**：如果您所在的组织有其他管理员用户，即使您试图访问的是单用户组织，请要求您组织中被分配为管理员角色的成员登录组织并提交支持工单以代表您重置 MFA。一旦我们验证请求是经过认证的，我们将重置您的 MFA 并通知管理员。按常规登录，无需 MFA，并前往个人资料设置以注册新的因素（如果愿意）。

   **通过电子邮件重置**：如果您是组织中的唯一用户，请使用与您的账户关联的电子邮件地址通过电子邮件（support@clickhouse.com）提交支持案例。一旦我们验证请求是来自正确的电子邮件，我们将重置您的 MFA 和密码。访问您的电子邮件以访问密码重置链接。设置新密码，然后前往个人资料设置以注册新的因素（如果愿意）。 
   
</details>

## SAML SSO {#saml-sso}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud 还支持安全断言标记语言（SAML）单点登录（SSO）。有关更多信息，请参见 [SAML SSO 设置](/cloud/security/saml-setup)。

## 数据库用户 ID + 密码 {#database-user-id--password}

在 [创建用户账户](/sql-reference/statements/create/user.md) 时使用 SHA256_hash 方法来保护密码。

**提示：** 由于权限低于管理员的用户无法设置自己的密码，请要求用户在将密码提供给管理员设置账户之前，使用 [这个](https://tools.keycdn.com/sha256-online-generator) 生成器对其密码进行哈希处理。密码应遵循上述 [要求](#password-settings)。 

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```
