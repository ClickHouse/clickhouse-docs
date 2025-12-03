---
sidebar_label: 'SAML 单点登录设置'
slug: /cloud/security/saml-setup
title: 'SAML 单点登录设置'
description: '如何在 ClickHouse Cloud 中设置 SAML 单点登录'
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


# 配置 SAML SSO {#saml-sso-setup}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud 通过安全断言标记语言（SAML）支持单点登录（SSO）。这使您能够通过身份提供商（IdP）进行身份验证，从而安全地登录到您的 ClickHouse Cloud 组织。

我们目前支持由服务提供者发起的 SSO、通过独立连接接入的多个组织，以及即时（Just-in-time，JIT）预配。我们尚不支持跨域身份管理系统（SCIM）或属性映射功能。



## 开始之前 {#before-you-begin}

你需要在你的 IdP 中拥有管理员（Admin）权限，并在 ClickHouse Cloud 组织中具有 **Admin** 角色。在你在 IdP 中完成连接配置后，请按照下文步骤中所需的信息联系我们，以完成整个流程。

我们建议在配置 SAML 连接的同时，额外设置一个**指向你组织的直接链接**，以简化登录流程。不同 IdP 的具体配置方式各不相同。请继续阅读，了解如何在你的 IdP 中完成这些操作。



## 如何配置 IdP {#how-to-configure-your-idp}

### 步骤 {#steps}

<details>
   <summary>  获取你的组织 ID  </summary>
   
   所有配置都需要你的组织 ID。要获取组织 ID：
   
   1. 登录到你的 [ClickHouse Cloud](https://console.clickhouse.cloud) 组织。
   
      <Image img={samlOrgId} size="md" alt="组织 ID" force/>
      
   3. 在左下角，点击 **Organization** 下方的组织名称。
   
   4. 在弹出的菜单中选择 **Organization details**。
   
   5. 记录你的 **Organization ID**，以便在下面使用。
      
</details>

<details> 
   <summary>  配置你的 SAML 集成  </summary>
   
   ClickHouse 使用由服务提供方发起的 SAML 连接。这意味着你可以通过 https://console.clickhouse.cloud 或直接链接登录。目前我们不支持由身份提供方发起的连接。基础的 SAML 配置包括以下内容：

- SSO URL 或 ACS URL：`https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

- Audience URI 或 Entity ID：`urn:auth0:ch-production:{organizationid}` 

- Application username：`email`

- Attribute mapping：`email = user.email`

- 访问你组织的直接链接：`https://console.clickhouse.cloud/?connection={organizationid}` 

   关于具体的配置步骤，请参考下方与你的身份提供方对应的部分。
   
</details>

<details>
   <summary>  获取你的连接信息  </summary>

   获取你的身份提供方 SSO URL 和 X.509 证书。请参考下方与你的身份提供方对应的部分，了解如何获取这些信息。

</details>

<details>
   <summary>  提交支持工单 </summary>
   
   1. 返回 ClickHouse Cloud 控制台。
      
   2. 在左侧选择 **Help**，然后选择 Support 子菜单。
   
   3. 点击 **New case**。
   
   4. 在主题中输入 “SAML SSO Setup”。
   
   5. 在描述中粘贴你在上述步骤中收集到的所有链接，并将证书作为附件添加到工单中。
   
   6. 另外请告知我们此连接应允许哪些域名（例如：domain.com、domain.ai 等）。
   
   7. 创建新的工单。
   
   8. 我们会在 ClickHouse Cloud 中完成设置，并在可以进行测试时通知你。

</details>

<details>
   <summary>  完成设置  </summary>

   1. 在你的身份提供方中为用户分配访问权限。 

   2. 通过 https://console.clickhouse.cloud 或上文“Configure your SAML integration” 中配置的直接链接登录 ClickHouse。用户初始会被分配为 `Member` 角色，该角色可以登录组织并更新个人设置。

   3. 从 ClickHouse 组织中登出。 

   4. 使用你原先的认证方式登录，为新的 SSO 帐户分配 Admin 角色。
- 对于邮箱 + 密码帐户，请使用 `https://console.clickhouse.cloud/?with=email`。
- 对于社交登录，请点击相应按钮（**Continue with Google** 或 **Continue with Microsoft**）

:::note
上文 `?with=email` 中的 `email` 是字面量参数值，而不是占位符
:::

   5. 使用你原先的认证方式登出，然后通过 https://console.clickhouse.cloud 或上文“Configure your SAML integration” 中配置的直接链接重新登录。

   6. 移除所有非 SAML 用户，以在组织中强制使用 SAML。之后用户将通过你的身份提供方进行分配。
   
</details>

### 配置 Okta SAML {#configure-okta-saml}

你需要在 Okta 中为每个 ClickHouse 组织配置两个 App Integration：一个 SAML 应用和一个用于保存直接链接的书签应用。

<details>
   <summary>  1. 创建用于管理访问的组  </summary>
   
   1. 以 **Administrator** 身份登录到你的 Okta 实例。

   2. 在左侧选择 **Groups**。

   3. 点击 **Add group**。

   4. 输入该组的名称和描述。此组将用于在 SAML 应用及其关联的书签应用之间保持用户一致。

   5. 点击 **Save**。

   6. 点击你创建的组名称。

   7. 点击 **Assign people**，为你希望访问该 ClickHouse 组织的用户分配权限。

</details>



<details>
  <summary>
    {" "}
    2. 创建书签应用以实现用户无缝登录{" "}
  </summary>
  1. 在左侧选择 **Applications**,然后选择 **Applications** 子标题。2. 点击 **Browse App Catalog**。3. 搜索并选择 **Bookmark App**。4. 点击 **Add integration**。5. 为应用选择标签。6. 输入 URL:`https://console.clickhouse.cloud/?connection=
  {organizationid}` 7. 转到 **Assignments** 选项卡,添加您在上面创建的组。
</details>

<details>
   <summary>  3. 创建 SAML 应用以启用连接  </summary>
   
   1. 在左侧选择 **Applications**,然后选择 **Applications** 子标题。
   
   2. 点击 **Create App Integration**。
   
   3. 选择 SAML 2.0 并点击 Next。
   
   4. 为应用输入名称,勾选 **Do not display application icon to users** 旁边的复选框,然后点击 **Next**。
   
   5. 使用以下值填充 SAML 设置屏幕。
   
      | 字段                          | 值 |
      |--------------------------------|-------|
      | Single Sign On URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Default RelayState             | 留空       |
      | Name ID format                 | Unspecified       |
      | Application username           | Email             |
      | Update application username on | Create and update |
   
   7. 输入以下属性声明。

      | 名称    | 名称格式   | 值      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |

9. 点击 **Next**。

10. 在反馈屏幕上输入所需信息并点击 **Finish**。

11. 转到 **Assignments** 选项卡,添加您在上面创建的组。

12. 在新应用的 **Sign On** 选项卡上,点击 **View SAML setup instructions** 按钮。

    <Image
      img={samlOktaSetup}
      size='md'
      alt='Okta SAML 设置说明'
      force
    />

13. 收集以下三项信息,然后转到上面的提交支持案例以完成流程。


     - Identity Provider Single Sign-On URL
     - Identity Provider Issuer
     - X.509 证书

</details>

### 配置 Google SAML {#configure-google-saml}

您需要在 Google 中为每个组织配置一个 SAML 应用,如果使用多组织 SSO,必须向用户提供直接链接 (`https://console.clickhouse.cloud/?connection={organizationId}`) 以便添加书签。

<details>
   <summary>  创建 Google Web 应用  </summary>
   
   1. 转到您的 Google Admin 控制台 (admin.google.com)。

<Image img={samlGoogleApp} size='md' alt='Google SAML 应用' force />

2.  点击 **Apps**,然后点击左侧的 **Web and mobile apps**。

3.  从顶部菜单点击 **Add app**,然后选择 **Add custom SAML app**。

4.  为应用输入名称并点击 **Continue**。

5.  收集以下两项信息,然后转到上面的提交支持案例将信息提交给我们。注意:如果您在复制此数据之前完成设置,请从应用主屏幕点击 **DOWNLOAD METADATA** 以获取 X.509 证书。


     - SSO URL
     - X.509 证书

7.  在下方输入 ACS URL 和 Entity ID。

    | 字段     | 值                                                                      |
    | --------- | -------------------------------------------------------------------------- |
    | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
    | Entity ID | `urn:auth0:ch-production:{organizationid}`                                 |

8.  勾选 **Signed response** 复选框。

9.  为 Name ID Format 选择 **EMAIL**,并将 Name ID 保留为 **Basic Information > Primary email**。

10. 点击 **Continue**。

11. 输入以下属性映射:
    | 字段             | 值         |
    | ----------------- | ------------- |
    | Basic information | Primary email |
    | App attributes    | email         |
12. 点击 **Finish**。


14. 要启用应用程序,请点击 **OFF** 将所有人的设置更改为 **ON**。也可以通过选择屏幕左侧的选项将访问权限限制为特定组或组织单位。

</details>

### 配置 Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML 也可称为 Azure Active Directory (AD) 或 Microsoft Entra。

<details>
   <summary>  创建 Azure 企业应用程序 </summary>
   
   您需要为每个组织设置一个应用程序集成,并使用单独的登录 URL。
   
   1. 登录 Microsoft Entra 管理中心。
   
   2. 在左侧导航至 **Applications > Enterprise** 应用程序。
   
   3. 在顶部菜单中点击 **New application**。
   
   4. 在顶部菜单中点击 **Create your own application**。
   
   5. 输入名称并选择 **Integrate any other application you don't find in the gallery (Non-gallery)**,然后点击 **Create**。
   
      <Image img={samlAzureApp} size="md" alt="Azure 非库应用程序" force/>
   
   6. 在左侧点击 **Users and groups** 并分配用户。
   
   7. 在左侧点击 **Single sign-on**。
   
   8. 点击 **SAML**。
   
   9. 使用以下设置填充基本 SAML 配置屏幕。
   
      | 字段                     | 值 |
      |---------------------------|-------|
      | Identifier (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | Reply URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 留空 |
      | Logout URL                | 留空 |
   
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
   
   1. 按照 [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic) 的说明操作。
   
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

### 使用 SAML SSO 的用户管理 {#user-management-with-saml-sso}

有关管理用户权限以及将访问限制为仅允许通过 SAML 连接访问的更多信息，请参阅[管理云用户](/cloud/security/manage-cloud-users)。

### 服务提供方发起的 SSO {#service-provider-initiated-sso}

我们只支持由服务提供方发起的 SSO。这意味着用户访问 `https://console.clickhouse.cloud`，输入其电子邮件地址后，将被重定向至 IdP 进行身份验证。已经通过你的 IdP 完成身份验证的用户，可以使用直接链接自动登录到你的组织，而无需在登录页面再次输入电子邮件地址。

### 多组织 SSO {#multi-org-sso}

ClickHouse Cloud 通过为每个组织提供单独的连接来支持多组织 SSO。使用直接链接（`https://console.clickhouse.cloud/?connection={organizationid}`）登录到各自的组织。在登录另一个组织之前，请务必先从当前组织注销。



## 附加信息 {#additional-information}

在身份验证方面，安全性是我们的首要任务。基于这一点，在实现 SSO 时我们做出了一些决策，需要提前告知您。

- **我们只处理由服务提供商发起的身份验证流程。** 用户必须访问 `https://console.clickhouse.cloud` 并输入电子邮件地址，才能被重定向到您的身份提供商。我们提供了添加书签或应用快捷方式的说明，方便您的用户使用，这样他们就不需要记住该 URL。

- **我们不会自动关联 SSO 与非 SSO 账户。** 即使用户使用相同的电子邮件地址，您在 ClickHouse 用户列表中也可能会看到他们的多个账户。



## 常见问题排查 {#troubleshooting-common-issues}

| 错误 | 原因 | 解决方案 | 
|:------|:------|:---------|
| 系统可能存在配置错误或服务中断 | 登录由身份提供方发起（Identity provider initiated login） | 要解决此错误，请尝试使用直接链接 `https://console.clickhouse.cloud/?connection={organizationid}`。根据上文中针对您的身份提供方的说明，将其设置为用户的默认登录方式 | 
| 您被重定向到身份提供方，然后又返回到登录页面 | 身份提供方未配置 email 属性映射 | 按照上文中针对您的身份提供方的说明配置用户 email 属性，然后重新登录 | 
| 用户未被分配到此应用程序 | 该用户尚未在身份提供方中被分配到 ClickHouse 应用程序 | 在身份提供方中将该用户分配到该应用程序，然后重新登录 |
| 您将多个 ClickHouse 组织与 SAML SSO 集成，但无论使用哪个链接或图标，您总是登录到同一个组织 | 您仍然登录在第一个组织中 | 先注销，然后登录到另一个组织 |
| URL 会短暂显示 `access denied` | 您的邮箱域名与我们配置的域名不匹配 | 联系支持团队以获取帮助并解决此错误 |
