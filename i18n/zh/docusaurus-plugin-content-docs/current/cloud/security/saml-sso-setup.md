---
'sidebar_label': 'SAML SSO 设置'
'slug': '/cloud/security/saml-setup'
'title': 'SAML SSO 设置'
'description': '如何使用 ClickHouse Cloud 设置 SAML SSO'
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

ClickHouse Cloud 支持通过安全断言标记语言 (SAML) 的单点登录 (SSO)。这使您能够通过与您的身份提供者 (IdP) 进行身份验证，安全地登录到您的 ClickHouse Cloud 组织。

我们目前支持服务提供者启动的 SSO、多组织使用独立连接以及即时配置。我们尚不支持跨域身份管理系统 (SCIM) 或属性映射。

## 开始之前 {#before-you-begin}

您需要在您的 IdP 中具有管理员权限，并在您的 ClickHouse Cloud 组织中具有 **Admin** 角色。在您的 IdP 中设置好连接后，请使用下述程序中请求的信息与我们联系以完成该过程。

我们建议除了 SAML 连接之外，还设置一个 **直接链接到您的组织** 以简化登录过程。每个 IdP 处理此事的方式不同。继续了解如何为您的 IdP 执行此操作。

## 如何配置您的 IdP {#how-to-configure-your-idp}

### 步骤 {#steps}

<details>
   <summary> 获取您的组织 ID </summary>
   
   所有设置都需要您的组织 ID。要获取您的组织 ID：
   
   1. 登录到您的 [ClickHouse Cloud](https://console.clickhouse.cloud) 组织。
   
      <Image img={samlOrgId} size="md" alt="Organization ID" />
      
   3. 在左下角，点击 **Organization** 下的组织名称。
   
   4. 在弹出菜单中，选择 **Organization details**。
   
   5. 记下您的 **Organization ID** 以供后续使用。
      
</details>

<details> 
   <summary> 配置您的 SAML 集成 </summary>
   
   ClickHouse 使用服务提供者发起的 SAML 连接。这意味着您可以通过 `https://console.clickhouse.cloud` 或通过直接链接登录。我们目前不支持身份提供者发起的连接。基本的 SAML 配置包括以下内容：

   - SSO URL 或 ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - Audience URI 或 Entity ID: `urn:auth0:ch-production:{organizationid}` 

   - 应用程序用户名: `email`

   - 属性映射: `email = user.email`

   - 访问您组织的直接链接: `https://console.clickhouse.cloud/?connection={organizationid}` 


   有关具体配置步骤，请参阅您特定的身份提供商下方的信息。
   
</details>

<details>
   <summary> 获取您的连接信息 </summary>

   获取您的身份提供者 SSO URL 和 x.509 证书。请参阅您特定的身份提供商下方以获取有关如何检索此信息的说明。

</details>


<details>
   <summary> 提交支持案例 </summary>
   
   1. 返回 ClickHouse Cloud 控制台。
      
   2. 在左侧选择 **Help**，然后选择支持子菜单。
   
   3. 点击 **New case**。
   
   4. 输入主题 "SAML SSO Setup"。
   
   5. 在描述中粘贴从上述说明中收集的任何链接，并将证书附加到票据中。
   
   6. 请告知我们哪些域应被允许用于此连接（例如 domain.com, domain.ai, 等）。
   
   7. 创建一个新案例。
   
   8. 我们将在 ClickHouse Cloud 内完成设置，并在准备好测试时通知您。

</details>

<details>
   <summary> 完成设置 </summary>

   1. 在您的身份提供者中分配用户访问权限。

   2. 通过 `https://console.clickhouse.cloud` 或者您在 "Configure your SAML integration" 中配置的直接链接登录 ClickHouse。用户最初被分配为 ‘Member’ 角色，可以登录到组织并更新个人设置。

   3. 登出 ClickHouse 组织。

   4. 使用您的原始身份验证方法登录以将 Admin 角色分配给您的新 SSO 帐户。
   - 对于邮箱 + 密码帐户，请使用 `https://console.clickhouse.cloud/?with=email`。
   - 对于社交登录，请点击相应的按钮 (**Continue with Google** 或 **Continue with Microsoft**)

   5. 使用您的原始身份验证方法登出，并通过 `https://console.clickhouse.cloud` 或您在 "Configure your SAML integration" 中配置的直接链接重新登录。

   6. 删除任何非 SAML 用户以强制执行组织的 SAML。以后的用户将通过您的身份提供者分配。
   
</details>

### 配置 Okta SAML {#configure-okta-saml}

您将在 Okta 中为每个 ClickHouse 组织配置两个应用集成：一个 SAML 应用和一个用于存放您直接链接的书签。

<details>
   <summary> 1. 创建一个组以管理访问权限 </summary>
   
   1. 作为 **Administrator** 登录到您的 Okta 实例。

   2. 在左侧选择 **Groups**。

   3. 点击 **Add group**。

   4. 输入组的名称和描述。此组将用于保持 SAML 应用与其相关书签应用之间的用户一致性。

   5. 点击 **Save**。

   6. 点击您创建的组的名称。

   7. 点击 **Assign people** 为希望访问此 ClickHouse 组织的用户分配权限。

</details>

<details>
   <summary> 2. 创建一个书签应用以使用户无缝登录 </summary>
   
   1. 在左侧选择 **Applications**，然后选择 **Applications** 子标题。
   
   2. 点击 **Browse App Catalog**。
   
   3. 搜索并选择 **Bookmark App**。
   
   4. 点击 **Add integration**。
   
   5. 为应用选择一个标签。
   
   6. 输入 URL 为 `https://console.clickhouse.cloud/?connection={organizationid}`
   
   7. 转到 **Assignments** 标签，将您上述创建的组添加进去。
   
</details>

<details>
   <summary> 3. 创建一个 SAML 应用以启用连接 </summary>
   
   1. 在左侧选择 **Applications**，然后选择 **Applications** 子标题。
   
   2. 点击 **Create App Integration**。
   
   3. 选择 SAML 2.0 并点击 Next。
   
   4. 输入您的应用程序名称，并勾选 **Do not display application icon to users** 旁边的框，然后点击 **Next**。 
   
   5. 使用以下值填充 SAML 设置屏幕。
   
      | 字段                          | 值 |
      |--------------------------------|-------|
      | 单点登录 URL                   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | 默认 RelayState                | 留空       |
      | Name ID 格式                  | 未指定       |
      | 应用程序用户名                | Email             |
      | 更新应用程序用户名的          | 创建和更新 |
   
   7. 输入以下属性声明。

      | 名称    | 名称格式   | 值      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |
   
   9. 点击 **Next**。
   
   10. 在反馈屏幕上输入所请求的信息，然后点击 **Finish**。
   
   11. 转到 **Assignments** 标签，将您上述创建的组添加进去。
   
   12. 在新应用的 **Sign On** 标签下，点击 **View SAML setup instructions** 按钮。 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML Setup Instructions" />
   
   13. 收集这三项，并前往提交支持案例以完成此过程。
     - 身份提供者单点登录 URL
     - 身份提供者发行者
     - X.509 证书
   
</details>


### 配置 Google SAML {#configure-google-saml}

您将为每个组织在 Google 中配置一个 SAML 应用，并且必须提供给用户直接链接（`https://console.clickhouse.cloud/?connection={organizationId}`）以便于书签，如果使用多组织 SSO。

<details>
   <summary> 创建一个 Google Web 应用 </summary>
   
   1. 前往您的 Google 管理控制台 (admin.google.com)。

   <Image img={samlGoogleApp} size="md" alt="Google SAML App" />

   2. 点击左侧的 **Apps**，然后选择 **Web and mobile apps**。
   
   3. 点击顶部菜单中的 **Add app**，然后选择 **Add custom SAML app**。
   
   4. 输入应用的名称并点击 **Continue**。
   
   5. 收集这两项内容，并前往提交支持案例以将信息提交给我们。注意：如果在复制此数据之前完成设置，请点击应用主页上的 **DOWNLOAD METADATA** 以获取 X.509 证书。
     - SSO URL
     - X.509 证书
   
   7. 输入以下 ACS URL 和实体 ID。
   
      | 字段     | 值 |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 实体 ID   | `urn:auth0:ch-production:{organizationid}` |
   
   8. 选中 **Signed response** 复选框。
   
   9. 选择 **EMAIL** 作为 Name ID 格式，并将 Name ID 留空为 **Basic Information > Primary email.**
   
   10. 点击 **Continue**。
   
   11. 输入以下属性映射：
       
      | 字段             | 值         |
      |-------------------|---------------|
      | 基本信息         | 主邮箱        |
      | 应用属性        | email         |
       
   13. 点击 **Finish**。
   
   14. 要启用应用，请对所有人点击 **OFF**，然后将设置更改为 **ON**。通过选择屏幕左侧的选项，也可以限制对组或组织单位的访问。
       
</details>

### 配置 Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML 也可以称为 Azure Active Directory (AD) 或 Microsoft Entra。

<details>
   <summary> 创建一个 Azure 企业应用 </summary>
   
   您将为每个组织设置一个具有单独登录 URL 的应用集成。
   
   1. 登录到 Microsoft Entra 管理中心。
   
   2. 在左侧导航到 **Applications > Enterprise** 应用。
   
   3. 点击顶部菜单中的 **New application**。
   
   4. 点击顶部菜单中的 **Create your own application**。
   
   5. 输入名称并选择 **Integrate any other application you don't find in the gallery (Non-gallery)**，然后点击 **Create**。
   
      <Image img={samlAzureApp} size="md" alt="Azure Non-Gallery App" />
   
   6. 点击左侧的 **Users and groups** 并分配用户。
   
   7. 点击左侧的 **Single sign-on**。
   
   8. 点击 **SAML**。
   
   9. 使用以下设置填充基本 SAML 配置屏幕。
   
      | 字段                     | 值 |
      |---------------------------|-------|
      | 标识符 (实体 ID)         | `urn:auth0:ch-production:{organizationid}` |
      | 回复 URL (断言消费者服务 URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 登录 URL                 | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 空白 |
      | 登出 URL                | 空白 |
   
   11. 在 Attributes & Claims 下添加 (A) 或更新 (U) 以下内容：
   
       | 声明名称                           | 格式        | 来源属性 |
       |--------------------------------------|---------------|------------------|
       | (U) 唯一用户标识符 (Name ID) | 邮件地址 | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | 省略          | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="Attributes and Claims" />
   
   12. 收集这两项，并前往提交支持案例以完成此过程：
     - 登录 URL
     - 证书 (Base64)

</details>

### 配置 Duo SAML {#configure-duo-saml}

<details>
   <summary> 创建一个 Duo 的通用 SAML 服务提供者 </summary>
   
   1. 遵循 [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic) 的说明。 
   
   2. 使用以下桥接属性映射：

      |  桥接属性  |  ClickHouse 属性  | 
      |:-------------------|:-----------------------|
      | 邮件地址        | email                  |
   
   3. 使用以下值更新 Duo 中的 Cloud 应用程序：

      |  字段    |  值                                     |
      |:----------|:-------------------------------------------|
      | 实体 ID | `urn:auth0:ch-production:{organizationid}` |
      | 断言消费者服务 (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 服务提供者登录 URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. 收集这两项，并前往提交支持案例以完成此过程：
      - 单点登录 URL
      - 证书
   
</details>


## 工作原理 {#how-it-works}

### 服务提供者发起的 SSO {#service-provider-initiated-sso}

我们仅使用服务提供者发起的 SSO。这意味着用户需要访问 `https://console.clickhouse.cloud` 并输入他们的电子邮件地址，以被重定向到 IdP 进行身份验证。已经通过您的 IdP 进行身份验证的用户可以使用直接链接，自动登录到您的组织，而无需在登录页面输入他们的电子邮件地址。

### 分配用户角色 {#assigning-user-roles}

用户将会在分配到您的 IdP 应用并第一次登录后出现在您的 ClickHouse Cloud 控制台中。至少应该将一个 SSO 用户分配为您组织中的 Admin 角色。使用社交登录或 `https://console.clickhouse.cloud/?with=email` 按照您原始的身份验证方法登录以更新您的 SSO 角色。

### 移除非 SSO 用户 {#removing-non-sso-users}

一旦您设置了 SSO 用户并将至少一个用户分配为 Admin 角色，管理员可以移除使用其他方法 (例如社交身份验证或用户 ID + 密码) 的用户。在设置 SSO 之后，Google 身份验证仍将有效。使用用户 ID + 密码的用户将根据他们的电子邮件域自动重定向到 SSO，除非用户使用 `https://console.clickhouse.cloud/?with=email`。

### 管理用户 {#managing-users}

ClickHouse Cloud 目前为 SSO 实现了 SAML。我们尚未实施 SCIM 来管理用户。这意味着 SSO 用户必须在您的 IdP 中被分配到应用程序才能访问您的 ClickHouse Cloud 组织。用户必须在 ClickHouse Cloud 中登录一次，才能在组织的 **Users** 区域中显示。当在您的 IdP 中移除用户时，他们将无法通过 SSO 登录 ClickHouse Cloud。然而，该 SSO 用户在您的组织中仍将显示，直到管理员手动移除该用户。

### 多组织 SSO {#multi-org-sso}

ClickHouse Cloud 通过为每个组织提供单独的连接，支持多组织 SSO。使用直接链接 (`https://console.clickhouse.cloud/?connection={organizationid}`) 登录到各自的组织。确保在登录到另一个组织之前退出当前组织。

## 其他信息 {#additional-information}

安全性是我们在身份验证方面的首要任务。因此，在实施 SSO 时，我们做出了一些决策，您需要了解这些决策。

- **我们只处理服务提供者发起的身份验证流程。** 用户必须访问 `https://console.clickhouse.cloud` 并输入电子邮件地址以重定向到您的身份提供者。提供了添加书签应用程序或快捷方式的说明，以便于您的用户，无需记住 URL。

- **通过您的 IdP 分配给您的应用的所有用户必须拥有相同的电子邮件域。** 如果您有供应商、承包商或顾问希望访问您的 ClickHouse 帐户，他们的电子邮件地址必须与您员工的域相同（例如 user@domain.com）。

- **我们不会自动链接 SSO 和非 SSO 帐户。** 即使它们使用相同的电子邮件地址，您可能会在 ClickHouse 用户列表中看到用户的多个帐户。
