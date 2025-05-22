import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

# 云身份验证

ClickHouse Cloud 提供了多种身份验证方式。本文档解释了一些配置身份验证的最佳实践。在选择身份验证方法时，请始终与您的安全团队进行确认。

## 密码设置 {#password-settings}

我们控制台和服务（数据库）的最低密码设置目前符合 [NIST 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#sec4) 验证器保证级别 1：
- 最少 12 个字符
- 包含以下 4 项中的 3 项：
   - 1 个大写字母
   - 1 个小写字母
   - 1 个数字
   - 1 个特殊字符

## 邮箱 + 密码 {#email--password}

ClickHouse Cloud 允许您使用电子邮件地址和密码进行身份验证。使用此方法的最佳方式是为您的 ClickHouse 帐户使用强密码。有许多在线资源可以帮助您制定一个可以记住的密码。或者，您可以使用随机密码生成器，并将您的密码存储在密码管理器中以提高安全性。

## 使用 Google 或 Microsoft 社交身份验证的单点登录 {#sso-using-google-or-microsoft-social-authentication}

如果您的公司使用 Google Workspace 或 Microsoft 365，您可以利用 ClickHouse Cloud 中当前的单点登录设置。为此，只需使用您的公司电子邮件地址注册，并邀请其他用户使用他们的公司电子邮件。效果是您的用户必须使用公司登录流程进行登录，无论是通过您的身份提供者，还是通过 Google 或 Microsoft 身份验证，才能验证进入 ClickHouse Cloud。

## 多因素身份验证 {#multi-factor-authentication}

具有电子邮件 + 密码或社交身份验证的用户可以通过多因素身份验证（MFA）进一步保护他们的账户。要设置 MFA：
1. 登录 console.clickhouse.cloud
2. 单击左上角 ClickHouse 徽标旁边的您的姓名首字母
3. 选择个人资料
4. 在左侧选择安全
5. 单击身份验证应用程序区域中的设置
6. 使用 Authy、1Password 或 Google Authenticator 等身份验证应用扫描二维码
7. 输入代码以确认
8. 在下一个屏幕上，复制恢复代码并将其存放在安全的地方
9. 勾选 `我已安全记录此代码` 旁边的框
10. 单击继续
    
## 帐户恢复 {#account-recovery}

<details> 
   <summary>获取恢复代码</summary>

   如果您之前注册了 MFA，但未创建或丢失了恢复代码，请按照以下步骤获取新恢复代码：
   1. 访问 https://console.clickhouse.cloud
   2. 使用您的凭据和 MFA 登录
   3. 转到左上角的个人资料
   4. 点击左侧的安全
   5. 点击您身份验证应用旁边的垃圾桶图标
   6. 点击删除身份验证应用
   7. 输入您的代码并单击继续
   8. 点击身份验证应用部分中的设置
   9. 扫描二维码并输入新代码
   10. 复制恢复代码并将其存放在安全的地方
   11. 勾选 `我已安全记录此代码` 旁边的框
   12. 单击继续
   
</details>
<details>
   <summary>忘记密码</summary>

   如果您忘记了密码，请按照以下步骤进行自助恢复：
   1. 访问 https://console.clickhouse.cloud
   2. 输入您的电子邮件地址并单击继续
   3. 点击忘记密码？
   4. 点击发送密码重置链接
   5. 检查您的电子邮件并单击邮件中的重置密码
   6. 输入新密码，确认密码并单击更新密码
   7. 单击返回以登录
   8. 使用新密码正常登录
            
</details>
<details>
   <summary>丢失 MFA 设备或令牌</summary>

   如果您丢失了 MFA 设备或删除了令牌，请按照以下步骤恢复并创建新的令牌：
   1. 访问 https://console.clickhouse.cloud
   2. 输入您的凭据并单击继续
   3. 在多因素身份验证屏幕上单击取消
   4. 点击恢复代码
   5. 输入代码并按继续
   6. 复制新的恢复代码并将其存放在安全的地方
   7. 勾选 `我已安全记录此代码` 旁边的框，然后点击继续
   8. 登录后，转到左上角的个人资料
   9. 点击左上角的安全
   10. 点击身份验证应用旁边的垃圾桶图标以删除旧的身份验证器
   11. 点击删除身份验证应用
   12. 当提示您输入多因素身份验证时，单击取消
   13. 点击恢复代码
   14. 输入您的恢复代码（这是在第 7 步中生成的新代码）并单击继续
   15. 复制新的恢复代码并将其存放在安全的地方 - 这是一个保障，以防您在删除过程中离开屏幕
   16. 勾选 `我已安全记录此代码` 旁边的框并单击继续
   17. 按照上面的过程设置新的 MFA 因素
       
</details>
<details>
   <summary>丢失 MFA 和恢复代码</summary>

   如果您丢失了 MFA 设备 AND 恢复代码，或您丢失了 MFA 设备并且从未获得恢复代码，请按照以下步骤请求重置：

   **提交工单**：如果您在一个拥有其他管理用户的组织中，即使您试图访问单用户组织，也请请求分配了 Admin 角色的组织成员登录组织并代表您提交支持工单以重置您的 MFA。 一旦我们验证请求已通过身份验证，我们将重置您的 MFA，并通知管理员。按照正常流程登录，无需 MFA，转到个人资料设置以注册新的因素（如果您愿意）。

   **通过电子邮件重置**：如果您是组织中唯一的用户，请通过电子邮件（support@clickhouse.com）提交支持案例，使用与您的账户关联的电子邮件地址。一旦我们确认请求来自正确的电子邮件，我们将重置您的 MFA 和密码。访问您的电子邮件以获取密码重置链接。设置新密码，然后访问您的个人资料设置以注册新的因素（如果您愿意）。
   
</details>

## SAML 单点登录 {#saml-sso}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud 还支持安全断言标记语言（SAML）单点登录（SSO）。更多信息，请参见 [SAML SSO 设置](/cloud/security/saml-setup)。

## 数据库用户 ID + 密码 {#database-user-id--password}

使用 SHA256_hash 方法，当 [创建用户账户](/sql-reference/statements/create/user.md) 时保护密码。

**提示：** 由于拥有较少管理权限的用户无法设置自己的密码，请请求用户使用生成器
例如 [这个](https://tools.keycdn.com/sha256-online-generator) 来哈希他们的密码，然后将其提供给管理员以设置账户。密码应遵循上述 [要求](#password-settings)。 

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```
