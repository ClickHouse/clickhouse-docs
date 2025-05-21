---
'sidebar_label': '云身份验证'
'slug': '/cloud/security/cloud-authentication'
'title': '云身份验证'
'description': '本指南解释了一些配置身份验证的良好实践。'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# 云认证

ClickHouse Cloud 提供多种认证方式。本指南解释了配置认证的一些最佳实践。在选择认证方法时，请始终与您的安全团队进行确认。

## 密码设置 {#password-settings}

我们控制台和服务 (数据库) 的最低密码设置目前符合 [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) 认证者保证级别 1：
- 最少 12 个字符
- 包含以下 4 项中的 3 项：
   - 1 个大写字母
   - 1 个小写字母
   - 1 个数字
   - 1 个特殊字符

## 电子邮件 + 密码 {#email--password}

ClickHouse Cloud 允许您使用电子邮件地址和密码进行认证。当使用此方法时，最好使用一个强密码来保护您的 ClickHouse 帐户。有许多在线资源可以帮助您想出一个您可以记住的密码。或者，您可以使用随机密码生成器，并将密码存储在密码管理器中以增强安全性。

## 使用 Google 或 Microsoft 社交认证的 SSO {#sso-using-google-or-microsoft-social-authentication}

如果您的公司使用 Google Workspace 或 Microsoft 365，您可以利用您当前的单点登录设置在 ClickHouse Cloud 中进行认证。为此，只需使用您的公司电子邮件地址注册，并邀请其他用户使用他们的公司电子邮件。效果是，您的用户必须通过您公司的登录流程进行登录，无论是通过您的身份提供者还是直接通过 Google 或 Microsoft 认证，然后才能认证到 ClickHouse Cloud。

## 多因素认证 {#multi-factor-authentication}

使用电子邮件 + 密码或社交认证的用户可以进一步通过多因素认证 (MFA) 来保护他们的帐户。设置 MFA 的步骤如下：
1. 登录到 console.clickhouse.cloud
2. 点击左上角 ClickHouse logo 旁边的首字母
3. 选择个人资料
4. 在左侧选择安全
5. 在认证应用程序区域点击设置
6. 使用如 Authy、1Password 或 Google Authenticator 的认证应用扫描二维码
7. 输入代码以确认
8. 在下一个屏幕上，复制恢复码并安全存放
9. 勾选 `I have safely recorded this code` 旁边的框
10. 点击继续

## 帐户恢复 {#account-recovery}

<details> 
   <summary>获取恢复码</summary>

   如果您之前注册了 MFA 但没有创建或丢失了恢复码，请按照以下步骤获取新的恢复码：
   1. 前往 https://console.clickhouse.cloud
   2. 使用您的凭据和 MFA 登录
   3. 在左上角转到您的个人资料
   4. 点击左侧的安全
   5. 点击您认证应用旁边的垃圾桶
   6. 点击移除认证应用
   7. 输入您的代码并点击继续
   8. 点击认证应用部分的设置
   9. 扫描二维码并输入新代码
   10. 复制您的恢复码并安全存放
   11. 勾选 `I have safely recorded this code` 旁边的框
   12. 点击继续
   
</details>
<details>
   <summary>忘记密码</summary>

   如果您忘记了密码，请按照以下步骤进行自助恢复：
   1. 前往 https://console.clickhouse.cloud
   2. 输入您的电子邮件地址并点击继续
   3. 点击忘记您的密码？
   4. 点击发送密码重置链接
   5. 检查您的电子邮件并点击电子邮件中的重置密码
   6. 输入您的新密码，确认密码并点击更新密码
   7. 点击返回以登录
   8. 使用您的新密码正常登录
            
</details>
<details>
   <summary>丢失 MFA 设备或令牌</summary>

   如果您丢失了 MFA 设备或删除了令牌，请按照以下步骤恢复并创建新令牌：
   1. 前往 https://console.clickhouse.cloud
   2. 输入您的凭据并点击继续
   3. 在多因素认证屏幕上点击取消
   4. 点击恢复码
   5. 输入代码并按继续
   6. 复制新的恢复码并存放在安全地方
   7. 勾选 `I have safely recorded this code` 旁边的框并点击继续
   8. 登录后，前往左上角的个人资料
   9. 点击左上角的安全
   10. 点击认证应用旁边的垃圾桶图标以移除旧的认证器
   11. 点击移除认证应用
   12. 当提示您进行多因素认证时，点击取消
   13. 点击恢复码
   14. 输入您的恢复码（这是第 7 步中生成的新代码）并点击继续
   15. 复制新的恢复码并存放在安全地方 - 这是在移除过程中离开屏幕的 fail safe
   16. 勾选 `I have safely recorded this code` 旁边的框并点击继续
   17. 按照上述流程设置新的 MFA 因素
       
</details>
<details>
   <summary>丢失 MFA 和恢复码</summary>

   如果您丢失了 MFA 设备和恢复码，或者您丢失了 MFA 设备并且从未获得恢复码，请按照以下步骤请求重置：

   **提交工单**：如果您所在的组织有其他管理员用户，即使您正在尝试访问单用户组织，仍然请组织中分配了管理员角色的成员登录该组织并提交工单以代表您重置 MFA。一旦我们验证请求的身份，我们将重置您的 MFA 并通知管理员。正常登录，无需 MFA，并转到您的个人资料设置以注册新的因素（如果您愿意）。

   **通过电子邮件重置**：如果您是组织中唯一的用户，请通过与您帐户相关的电子邮件地址发送支持案例电子邮件 (support@clickhouse.com)。一旦我们验证请求来自正确的电子邮件，我们将重置您的 MFA 和密码。访问您的电子邮件以获取密码重置链接。设置新密码，然后转到您的个人资料设置以注册新的因素（如果您愿意）。 
   
</details>

## SAML SSO {#saml-sso}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud 还支持安全声明标记语言 (SAML) 单点登录 (SSO)。有关更多信息，请参阅 [SAML SSO 设置](/cloud/security/saml-setup)。

## 数据库用户 ID + 密码 {#database-user-id--password}

在 [创建用户帐户](/sql-reference/statements/create/user.md) 时使用 SHA256_hash 方法来保护密码。

**提示：** 由于没有管理权限的用户无法设置自己的密码，因此请要求用户使用生成器对其密码进行哈希
，例如 [这个](https://tools.keycdn.com/sha256-online-generator)，然后提供给管理员以设置帐户。密码应遵循上述 [要求](#password-settings)。 

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```
