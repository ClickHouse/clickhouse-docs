---
'sidebar_label': '云认证'
'slug': '/cloud/security/cloud-authentication'
'title': '云认证'
'description': '本指南讲解了一些配置认证的良好实践。'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# Cloud Authentication

ClickHouse Cloud 提供了多种身份验证方式。本指南解释了一些配置身份验证的良好实践。在选择身份验证方法时，请始终与您的安全团队进行确认。

## Password Settings {#password-settings}

我们控制台和服务（数据库）的最低密码设置目前符合 [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) 认证机构保障级别 1：
- 最少 12 个字符
- 包含以下 4 项中的 3 项：
   - 1 个大写字母
   - 1 个小写字母
   - 1 个数字
   - 1 个特殊字符

## Email + Password {#email--password}

ClickHouse Cloud 允许您使用电子邮件地址和密码进行身份验证。使用此方法时，保护您的 ClickHouse 账户的最佳方式是使用强密码。有许多在线资源可以帮助您想出一个您可以记住的密码。或者，您可以使用随机密码生成器，并将密码存储在密码管理器中以提高安全性。

## SSO Using Google or Microsoft Social Authentication {#sso-using-google-or-microsoft-social-authentication}

如果您的公司使用 Google Workspace 或 Microsoft 365，您可以在 ClickHouse Cloud 中利用当前的单点登录设置。为此，只需使用您的公司电子邮件地址注册，并使用其他用户的公司电子邮件邀请他们。效果是您的用户必须通过您的身份提供者或直接通过 Google 或 Microsoft 身份验证使用您公司的登录流程进行登录，才能在 ClickHouse Cloud 中进行身份验证。

## Multi-Factor Authentication {#multi-factor-authentication}

使用电子邮件 + 密码或社交身份验证的用户可以进一步通过多因素身份验证 (MFA) 来保护其账户。要设置 MFA：
1. 登录到 console.clickhouse.cloud
2. 单击左上角 ClickHouse 标志旁边的您的首字母
3. 选择个人资料
4. 在左侧选择安全性
5. 单击身份验证应用程序区域中的设置
6. 使用 Authy、1Password 或 Google Authenticator 等身份验证应用程序扫描二维码
7. 输入代码以确认
8. 在下一个屏幕上，复制恢复代码并将其存储在安全的地方
9. 选中 `我已经安全记录了此代码` 旁边的框
10. 单击继续
    
## Account recovery {#account-recovery}

<details> 
   <summary>获取恢复代码</summary>

   如果您之前注册了 MFA，但没有创建或丢失了恢复代码，请按照以下步骤获取新的恢复代码：
   1. 访问 https://console.clickhouse.cloud
   2. 使用您的凭证和 MFA 登录
   3. 在左上角转到您的个人资料
   4. 单击左侧的安全性
   5. 单击您的身份验证应用程序旁边的垃圾桶
   6. 单击移除身份验证应用程序
   7. 输入您的代码，然后单击继续
   8. 单击身份验证应用程序部分中的设置
   9. 扫描二维码并输入新代码
   10. 复制您的恢复代码并将其存储在安全的地方
   11. 选中 `我已经安全记录了此代码` 旁边的框
   12. 单击继续
   
</details>
<details>
   <summary>忘记密码</summary>

   如果您忘记了密码，请按照以下步骤进行自助恢复：
   1. 访问 https://console.clickhouse.cloud
   2. 输入您的电子邮件地址并单击继续
   3. 单击忘记密码？
   4. 单击发送密码重置链接
   5. 检查您的电子邮件并单击电子邮件中的重置密码
   6. 输入您的新密码，确认密码并单击更新密码
   7. 单击返回以登录
   8. 使用您的新密码正常登录
            
</details>
<details>
   <summary>丢失 MFA 设备或令牌</summary>

   如果您丢失了 MFA 设备或删除了令牌，请按照以下步骤恢复并创建新的令牌：
   1. 访问 https://console.clickhouse.cloud
   2. 输入您的凭证并单击继续
   3. 在多因素身份验证屏幕上单击取消
   4. 单击恢复代码
   5. 输入代码并按继续
   6. 复制新的恢复代码并将其存储在安全的地方
   7. 选中 `我已经安全记录了此代码` 旁边的框并单击继续
   8. 登录后，在左上角转到您的个人资料
   9. 点击左上角的安全性
   10. 单击身份验证应用程序旁边的垃圾桶图标以去除您的旧身份验证器
   11. 单击移除身份验证应用程序
   12. 当提示您进行多因素身份验证时，单击取消
   13. 单击恢复代码
   14. 输入您的恢复代码（这是在步骤 7 中生成的新代码）并单击继续
   15. 复制新的恢复代码并将其存储在安全的地方 - 这是在移除过程中离开屏幕时的备用方案
   16. 选中 `我已经安全记录了此代码` 旁边的框并单击继续
   17. 按照上述过程设置新的 MFA 因素
       
</details>
<details>
   <summary>丢失 MFA 和恢复代码</summary>

   如果您丢失了您的 MFA 设备和恢复代码，或者您丢失了 MFA 设备且从未获得恢复代码，请按照以下步骤请求重置：

   **提交工单**：如果您所在的组织有其他管理用户，即使您尝试访问单用户组织，也请请求分配了管理员角色的组织成员登录组织并代表您提交支持工单以重置您的 MFA。一旦我们验证请求是经过身份验证的，我们将重置您的 MFA，并通知管理员。如果您希望，可以像往常一样登录而不需要 MFA，然后转到个人资料设置以注册新因素。

   **通过电子邮件重置**：如果您是组织中唯一的用户，请通过与您的帐户关联的电子邮件地址向支持团队提交支持案例（support@clickhouse.com）。一旦我们验证请求来自正确的电子邮件，我们将重置您的 MFA 和密码。访问您的电子邮件以访问密码重置链接。设置新密码，然后转到个人资料设置以注册新因素，如果您希望。
   
</details>

## SAML SSO {#saml-sso}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud 还支持安全断言标记语言 (SAML) 单点登录 (SSO)。有关更多信息，请参阅 [SAML SSO 设置](/cloud/security/saml-setup)。

## Database User ID + Password {#database-user-id--password}

在 [创建用户账户](/sql-reference/statements/create/user.md) 时使用 SHA256_hash 方法来保护密码。

**提示**：由于没有管理权限的用户无法设置自己的密码，请要求用户使用生成器对其密码进行哈希处理
例如 [这个](https://tools.keycdn.com/sha256-online-generator)，然后再提供给管理员以设置账户。密码应遵循上述的 [要求](#password-settings)。
