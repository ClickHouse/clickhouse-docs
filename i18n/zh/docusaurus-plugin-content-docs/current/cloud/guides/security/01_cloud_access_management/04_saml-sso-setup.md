---
sidebar_label: 'SAML SSO 配置'
slug: /cloud/security/saml-setup
title: 'SAML SSO 配置'
description: '如何在 ClickHouse Cloud 中配置 SAML SSO'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', '单点登录', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# SAML SSO 设置

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud 通过安全断言标记语言（SAML）支持单点登录（SSO）。这使用户可以通过在身份提供商（IdP）处进行身份验证，安全地登录其 ClickHouse Cloud 组织。

我们目前支持由服务提供商发起的 SSO、多个组织使用各自独立的连接，以及即时（Just-in-time）预配。我们尚不支持跨域身份管理系统（SCIM）或属性映射。



## 开始之前 {#before-you-begin}

您需要在身份提供商（IdP）中拥有管理员权限，并在 ClickHouse Cloud 组织中具有 **Admin** 角色。在身份提供商中设置连接后，请联系我们并提供下述流程中要求的信息以完成配置。

我们建议在 SAML 连接之外设置一个**指向您组织的直接链接**，以简化登录流程。不同的身份提供商处理方式有所不同。请继续阅读以了解如何为您的身份提供商进行配置。


## 如何配置您的 IdP {#how-to-configure-your-idp}

### 步骤 {#steps}

<details>
  <summary> 获取您的组织 ID </summary>
  所有设置都需要您的组织 ID。获取组织 ID 的步骤:1.
  登录您的 [ClickHouse Cloud](https://console.clickhouse.cloud)
  组织。
  <Image img={samlOrgId} size='md' alt='组织 ID' force />
  3. 在左下角,点击 **Organization** 下的组织名称。4. 在弹出菜单中,选择 **Organization details**。5.
  记下您的 **Organization ID** 以便后续使用。
</details>

<details> 
   <summary>  配置您的 SAML 集成  </summary>
   
   ClickHouse 使用服务提供商发起的 SAML 连接。这意味着您可以通过 https://console.clickhouse.cloud 或直接链接登录。我们目前不支持身份提供商发起的连接。基本 SAML 配置包括以下内容:

- SSO URL 或 ACS URL:`https://auth.clickhouse.cloud/login/callback?connection={organizationid}`

- Audience URI 或 Entity ID:`urn:auth0:ch-production:{organizationid}`

- 应用程序用户名:`email`

- 属性映射:`email = user.email`

- 访问您组织的直接链接:`https://console.clickhouse.cloud/?connection={organizationid}`

  有关具体配置步骤,请参阅下文中您使用的身份提供商。

</details>

<details>
   <summary>  获取您的连接信息  </summary>

获取您的身份提供商 SSO URL 和 x.509 证书。有关如何获取此信息的说明,请参阅下文中您使用的身份提供商。

</details>

<details>
   <summary>  提交支持工单 </summary>
   
   1. 返回 ClickHouse Cloud 控制台。
      
   2. 在左侧选择 **Help**,然后选择 Support 子菜单。
   
   3. 点击 **New case**。
   
   4. 输入主题"SAML SSO Setup"。
   
   5. 在描述中,粘贴从上述说明中收集的所有链接,并将证书附加到工单。
   
   6. 还请告知我们此连接应允许哪些域(例如 domain.com、domain.ai 等)。
   
   7. 创建新工单。
   
   8. 我们将在 ClickHouse Cloud 中完成设置,并在准备好测试时通知您。

</details>

<details>
   <summary>  完成设置  </summary>

1.  在您的身份提供商中分配用户访问权限。

2.  通过 https://console.clickhouse.cloud 或您在上文"配置您的 SAML 集成"中配置的直接链接登录 ClickHouse。用户最初被分配"Member"角色,该角色可以登录组织并更新个人设置。

3.  退出 ClickHouse 组织。

4.  使用您原来的身份验证方法登录,以便为您的新 SSO 账户分配 Admin 角色。

- 对于电子邮件 + 密码账户,请使用 `https://console.clickhouse.cloud/?with=email`。
- 对于社交登录,请点击相应的按钮(**Continue with Google** 或 **Continue with Microsoft**)

:::note
上文 `?with=email` 中的 `email` 是字面参数值,而非占位符
:::

5.  使用您原来的身份验证方法退出,然后通过 https://console.clickhouse.cloud 或您在上文"配置您的 SAML 集成"中配置的直接链接重新登录。

6.  删除所有非 SAML 用户以强制组织使用 SAML。今后用户将通过您的身份提供商分配。

</details>

### 配置 Okta SAML {#configure-okta-saml}

您需要在 Okta 中为每个 ClickHouse 组织配置两个应用程序集成:一个 SAML 应用程序和一个用于存放直接链接的书签。

<details>
   <summary>  1. 创建一个组来管理访问权限  </summary>
   
   1. 以 **Administrator** 身份登录您的 Okta 实例。

2.  在左侧选择 **Groups**。

3.  点击 **Add group**。

4.  输入组的名称和描述。此组将用于保持 SAML 应用程序及其相关书签应用程序之间的用户一致性。

5.  点击 **Save**。

6.  点击您创建的组名称。

7.  点击 **Assign people** 以分配您希望授予此 ClickHouse 组织访问权限的用户。

</details>


<details>
  <summary>
    {" "}
    2. 创建书签应用以实现用户无缝登录{" "}
  </summary>
  1. 在左侧选择 **Applications**,然后选择 **Applications** 子标题。2. 点击 **Browse App Catalog**。3. 搜索并选择 **Bookmark App**。4. 点击 **Add integration**。5. 为应用选择一个标签。6. 输入 URL 为 `https://console.clickhouse.cloud/?connection=
  {organizationid}` 7. 转到 **Assignments** 选项卡并添加您在上面创建的组。
</details>

<details>
   <summary>  3. 创建 SAML 应用以启用连接  </summary>
   
   1. 在左侧选择 **Applications**,然后选择 **Applications** 子标题。
   
   2. 点击 **Create App Integration**。
   
   3. 选择 SAML 2.0 并点击 Next。
   
   4. 为您的应用输入名称,勾选 **Do not display application icon to users** 旁边的复选框,然后点击 **Next**。
   
   5. 使用以下值填充 SAML 设置屏幕。
   
      | 字段                          | 值 |
      |--------------------------------|-------|
      | 单点登录 URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 受众 URI(SP 实体 ID)    | `urn:auth0:ch-production:{organizationid}` |
      | 默认 RelayState             | 留空       |
      | 名称 ID 格式                 | 未指定       |
      | 应用用户名           | 电子邮件             |
      | 更新应用用户名时机 | 创建和更新 |
   
   7. 输入以下属性声明。

      | 名称    | 名称格式   | 值      |
      |---------|---------------|------------|
      | email   | 基本         | user.email |

9. 点击 **Next**。

10. 在反馈屏幕上输入所需信息并点击 **Finish**。

11. 转到 **Assignments** 选项卡并添加您在上面创建的组。

12. 在新应用的 **Sign On** 选项卡上,点击 **View SAML setup instructions** 按钮。

    <Image
      img={samlOktaSetup}
      size='md'
      alt='Okta SAML Setup Instructions'
      force
    />

13. 收集以下三项信息,然后转到上面的提交支持案例以完成流程。


     - 身份提供商单点登录 URL
     - 身份提供商颁发者
     - X.509 证书

</details>

### 配置 Google SAML {#configure-google-saml}

您需要在 Google 中为每个组织配置一个 SAML 应用,如果使用多组织 SSO,必须向用户提供直接链接(`https://console.clickhouse.cloud/?connection={organizationId}`)以便添加书签。

<details>
   <summary>  创建 Google Web 应用  </summary>
   
   1. 转到您的 Google Admin 控制台(admin.google.com)。

<Image img={samlGoogleApp} size='md' alt='Google SAML App' force />

2.  点击 **Apps**,然后点击左侧的 **Web and mobile apps**。

3.  从顶部菜单点击 **Add app**,然后选择 **Add custom SAML app**。

4.  为应用输入名称并点击 **Continue**。

5.  收集以下两项信息,然后转到上面的提交支持案例将信息提交给我们。注意:如果您在复制此数据之前完成了设置,请从应用主屏幕点击 **DOWNLOAD METADATA** 以获取 X.509 证书。


     - SSO URL
     - X.509 证书

7.  在下方输入 ACS URL 和实体 ID。

    | 字段     | 值                                                                      |
    | --------- | -------------------------------------------------------------------------- |
    | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | 实体 ID | `urn:auth0:ch-production:{organizationid}`                                 |

8.  勾选 **Signed response** 复选框。

9.  为名称 ID 格式选择 **EMAIL**,并将名称 ID 保留为 **Basic Information > Primary email**。

10. 点击 **Continue**。

11. 输入以下属性映射:
    | 字段             | 值         |
    | ----------------- | ------------- |
    | 基本信息 | 主要电子邮件 |
    | 应用属性    | email         |
12. 点击 **Finish**。


14. 要启用应用程序,请点击所有人的 **OFF** 并将设置更改为所有人的 **ON**。也可以通过选择屏幕左侧的选项将访问权限限制为特定组或组织单位。

</details>

### 配置 Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML 也可称为 Azure Active Directory (AD) 或 Microsoft Entra。

<details>
   <summary>  创建 Azure 企业应用程序 </summary>
   
   您将为每个组织设置一个应用程序集成,并使用单独的登录 URL。
   
   1. 登录到 Microsoft Entra 管理中心。
   
   2. 在左侧导航至 **Applications > Enterprise** 应用程序。
   
   3. 点击顶部菜单中的 **New application**。
   
   4. 点击顶部菜单中的 **Create your own application**。
   
   5. 输入名称并选择 **Integrate any other application you don't find in the gallery (Non-gallery)**,然后点击 **Create**。
   
      <Image img={samlAzureApp} size="md" alt="Azure 非库应用程序" force/>
   
   6. 点击左侧的 **Users and groups** 并分配用户。
   
   7. 点击左侧的 **Single sign-on**。
   
   8. 点击 **SAML**。
   
   9. 使用以下设置填充基本 SAML 配置屏幕。
   
      | 字段                     | 值 |
      |---------------------------|-------|
      | Identifier (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 空白 |
      | Logout URL                | 空白 |
   
   11. 在 Attributes & Claims 下添加 (A) 或更新 (U) 以下内容:
   
       | 声明名称                           | 格式        | 源属性 |
       |--------------------------------------|---------------|------------------|
       | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | Omitted       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="属性和声明" force/>
   
   12. 收集以下两项内容,然后转到上面的提交支持案例以完成流程:
     - Login URL
     - Certificate (Base64)

</details>

### 配置 Duo SAML {#configure-duo-saml}

<details>
   <summary> 为 Duo 创建通用 SAML 服务提供商 </summary>
   
   1. 按照 [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic) 的说明进行操作。 
   
   2. 使用以下桥接属性映射:

      |  桥接属性  |  ClickHouse 属性  |
      |:-------------------|:-----------------------|
      | Email Address      | email                  |

3.  使用以下值更新您在 Duo 中的云应用程序:

    | 字段                                | 值                                                                      |
    | :----------------------------------- | :------------------------------------------------------------------------- |
    | Entity ID                            | `urn:auth0:ch-production:{organizationid}`                                 |
    | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | Service Provider Login URL           | `https://console.clickhouse.cloud/?connection={organizationid}`            |

4.  收集以下两项内容,然后转到上面的提交支持案例以完成流程:
    - Single Sign-On URL
    - Certificate

</details>


## 工作原理 {#how-it-works}

### 使用 SAML SSO 管理用户 {#user-management-with-saml-sso}

有关管理用户权限和限制仅允许 SAML 连接访问的更多信息,请参阅[管理云用户](/cloud/security/manage-cloud-users)。

### 服务提供方发起的 SSO {#service-provider-initiated-sso}

我们仅使用服务提供方发起的 SSO。这意味着用户需访问 `https://console.clickhouse.cloud` 并输入电子邮件地址,然后被重定向到 IdP 进行身份验证。已通过您的 IdP 完成身份验证的用户可以使用直接链接自动登录到您的组织,无需在登录页面输入电子邮件地址。

### 多组织 SSO {#multi-org-sso}

ClickHouse Cloud 通过为每个组织提供独立的连接来支持多组织 SSO。使用直接链接(`https://console.clickhouse.cloud/?connection={organizationid}`)登录到相应的组织。请务必在登录另一个组织之前先退出当前组织。


## 附加信息 {#additional-information}

在身份验证方面,安全性是我们的首要任务。因此,我们在实现 SSO 时做出了一些您需要了解的决策。

- **我们仅处理服务提供方发起的身份验证流程。** 用户必须访问 `https://console.clickhouse.cloud` 并输入电子邮件地址,然后才会被重定向到您的身份提供方。为方便起见,我们提供了添加书签应用程序或快捷方式的说明,这样您的用户就无需记住该 URL。

- **我们不会自动关联 SSO 和非 SSO 账户。** 即使您的用户使用相同的电子邮件地址,您也可能在 ClickHouse 用户列表中看到该用户的多个账户。


## 常见问题排查 {#troubleshooting-common-issues}

| 错误                                                                                                                                                              | 原因                                                                                 | 解决方案                                                                                                                                                                                                                       |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 系统可能存在配置错误或服务中断                                                                                                | 身份提供商发起的登录                                                     | 要解决此错误,请尝试使用直接链接 `https://console.clickhouse.cloud/?connection={organizationid}`。按照上述针对您的身份提供商的说明,将其设置为用户的默认登录方式 |
| 您被重定向到身份提供商,然后又返回到登录页面                                                                                            | 身份提供商未配置电子邮件属性映射                       | 按照上述针对您的身份提供商的说明配置用户电子邮件属性,然后重新登录                                                                                                                |
| 用户未分配到此应用程序                                                                                                                           | 用户尚未在身份提供商中分配到 ClickHouse 应用程序 | 在身份提供商中将用户分配到该应用程序,然后重新登录                                                                                                                                                   |
| 您有多个集成了 SAML SSO 的 ClickHouse 组织,但无论使用哪个链接或磁贴,您始终登录到同一个组织 | 您仍然登录在第一个组织中                                     | 先退出登录,然后登录到其他组织                                                                                                                                                                                 |
| URL 短暂显示 `access denied`                                                                                                                              | 您的电子邮件域与我们配置的域不匹配                        | 请联系支持团队以获取解决此错误的帮助                                                                                                                                                                       |
