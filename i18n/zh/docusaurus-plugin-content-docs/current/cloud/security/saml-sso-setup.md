---
'sidebar_label': 'SAML SSO 设置'
'slug': '/cloud/security/saml-setup'
'title': 'SAML SSO 设置'
'description': '如何在 ClickHouse Cloud 上设置 SAML SSO'
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

ClickHouse Cloud 支持通过安全声明标记语言 (SAML) 实现单点登录 (SSO)。这使您能够通过与您的身份提供者 (IdP) 进行身份验证，安全地登录到您的 ClickHouse Cloud 组织。

我们目前支持服务提供者发起的 SSO、多个组织使用单独的连接以及即时配置。我们尚不支持跨域身份管理 (SCIM) 或属性映射系统。

## 开始之前 {#before-you-begin}

您需要在您的 IdP 中拥有管理员权限，以及在您的 ClickHouse Cloud 组织中拥有 **管理员** 角色。在您的 IdP 中设置连接后，请按照下面的程序与我们联系以提供所需的信息以完成此过程。

我们建议您设置一个**直接链接到您的组织**，以便在 SAML 连接的基础上简化登录过程。每个 IdP 在这方面的处理方式不同。继续阅读以了解如何为您的 IdP 执行此操作。

## 如何配置您的 IdP {#how-to-configure-your-idp}

### 步骤 {#steps}

<details>
   <summary> 获取您的组织 ID  </summary>
   
   所有设置都需要您的组织 ID。要获取您的组织 ID：
   
   1. 登录到您的 [ClickHouse Cloud](https://console.clickhouse.cloud) 组织。
   
      <Image img={samlOrgId} size="md" alt="Organization ID" />
      
   3. 在左下角，点击您在 **组织** 下的组织名称。
   
   4. 在弹出菜单中，选择 **组织详情**。
   
   5. 记下您的 **组织 ID**，以供后续使用。
      
</details>

<details> 
   <summary> 配置您的 SAML 集成  </summary>
   
   ClickHouse 使用服务提供者发起的 SAML 连接。这意味着您可以通过 https://console.clickhouse.cloud 或者通过直接链接登录。我们目前不支持身份提供者发起的连接。基本的 SAML 配置包括以下内容：

   - SSO URL 或 ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - 受众 URI 或实体 ID: `urn:auth0:ch-production:{organizationid}` 

   - 应用程序用户名: `email`

   - 属性映射: `email = user.email`

   - 访问您组织的直接链接: `https://console.clickhouse.cloud/?connection={organizationid}` 


   有关具体配置步骤，请参阅您特定的身份提供者。
   
</details>

<details>
   <summary> 获取您的连接信息  </summary>

   获取您的身份提供者 SSO URL 和 x.509 证书。请参阅您特定的身份提供者以获取有关如何检索此信息的说明。

</details>


<details>
   <summary> 提交支持案例 </summary>
   
   1. 返回 ClickHouse Cloud 控制台。
      
   2. 在左侧选择 **帮助**，然后选择支持子菜单。
   
   3. 点击 **新案例**。
   
   4. 输入主题 "SAML SSO 设置"。
   
   5. 在描述中，粘贴从上面的说明收集的任何链接，并将证书附加到工单中。
   
   6. 请同时告知我们此连接应允许哪些域（例如 domain.com, domain.ai 等）。
   
   7. 创建一个新案例。
   
   8. 我们将在 ClickHouse Cloud 中完成设置并通知您测试准备就绪。

</details>

<details>
   <summary> 完成设置  </summary>

   1. 在您的身份提供者中分配用户访问权限。 

   2. 通过 https://console.clickhouse.cloud 或您在上面的“配置您的 SAML 集成”中配置的直接链接登录 ClickHouse。用户最初被分配 **成员** 角色，可以登录到组织并更新个人设置。

   3. 从 ClickHouse 组织注销。 

   4. 使用您的原始身份验证方法登录以向您的新 SSO 帐户分配管理员角色。
   - 对于电子邮件 + 密码帐户，请使用 `https://console.clickhouse.cloud/?with=email`。
   - 对于社交登录，请点击相应的按钮 (**继续使用 Google** 或 **继续使用 Microsoft**)

   5. 使用您的原始身份验证方法注销，然后通过 https://console.clickhouse.cloud 或您在上面的“配置您的 SAML 集成”中配置的直接链接重新登录。

   6. 删除任何非 SAML 用户，以强制对组织实施 SAML。往后用户通过您的身份提供者进行分配。
   
</details>

### 配置 Okta SAML {#configure-okta-saml}

您将在 Okta 中为每个 ClickHouse 组织配置两个应用集成：一个 SAML 应用和一个用于存放直接链接的书签。

<details>
   <summary> 1. 创建一个组以管理访问权限 </summary>
   
   1. 以 **管理员** 身份登录到您的 Okta 实例。

   2. 在左侧选择 **组**。

   3. 点击 **添加组**。

   4. 输入组的名称和描述。该组将用于在 SAML 应用和其相关书签应用之间保持用户一致。

   5. 点击 **保存**。

   6. 点击您创建的组的名称。

   7. 点击 **分配人员** 以分配您希望访问此 ClickHouse 组织的用户。

</details>

<details>
   <summary> 2. 创建一个书签应用以使用户无缝登录 </summary>
   
   1. 在左侧选择 **应用程序**，然后选择 **应用程序** 子标题。
   
   2. 点击 **浏览应用目录**。
   
   3. 搜索并选择 **书签应用**。
   
   4. 点击 **添加集成**。
   
   5. 选择应用的标签。
   
   6. 输入 URL 为 `https://console.clickhouse.cloud/?connection={organizationid}`
   
   7. 转到 **分配** 标签，并添加您在上面创建的组。
   
</details>

<details>
   <summary> 3. 创建一个 SAML 应用以启用连接 </summary>
   
   1. 在左侧选择 **应用程序**，然后选择 **应用程序** 子标题。
   
   2. 点击 **创建应用集成**。
   
   3. 选择 SAML 2.0 并点击 下一步。
   
   4. 输入应用的名称，并勾选 **不向用户显示应用图标** 旁的框，然后点击 **下一步**。 
   
   5. 使用以下值填充 SAML 设置屏幕。
   
      | 字段                          | 值 |
      |--------------------------------|-------|
      | 单点登录 URL                  | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 受众 URI (SP 实体 ID)         | `urn:auth0:ch-production:{organizationid}` |
      | 默认 RelayState                | 保持空白       |
      | 名称 ID 格式                  | 未指定       |
      | 应用程序用户名                | 电子邮件             |
      | 更新应用程序用户名的方式      | 创建和更新 |
   
   7. 输入以下属性声明。

      | 姓名    | 名称格式   | 值      |
      |---------|---------------|------------|
      | email   | 基本         | user.email |
   
   9. 点击 **下一步**。
   
   10. 在反馈屏幕上输入所请求的信息，然后点击 **完成**。
   
   11. 转到 **分配** 标签，并添加您在上面创建的组。
   
   12. 在新应用的 **签署** 标签上，点击 **查看 SAML 设置说明** 按钮。 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML Setup Instructions" />
   
   13. 收集这三项内容并返回上面的提交支持案例以完成此过程。
     - 身份提供者单点登录 URL
     - 身份提供者签发者
     - X.509 证书
   
</details>


### 配置 Google SAML {#configure-google-saml}

您将在 Google 中为每个组织配置一个 SAML 应用，并必须为您的用户提供直接链接 (`https://console.clickhouse.cloud/?connection={organizationId}`)，以便在使用多组织 SSO 时进行书签。

<details>
   <summary> 创建 Google Web 应用  </summary>
   
   1. 转到您的 Google 管理控制台 (admin.google.com)。

   <Image img={samlGoogleApp} size="md" alt="Google SAML App" />

   2. 点击左侧的 **应用程序**，然后选择 **Web 和移动应用**。
   
   3. 点击顶部菜单中的 **添加应用**，然后选择 **添加自定义 SAML 应用**。
   
   4. 输入应用的名称并点击 **继续**。
   
   5. 收集这两项信息并返回上面的提交支持案例以将信息提交给我们。注意：如果您在复制此数据之前完成设置，请单击应用主屏幕上的 **下载元数据** 以获取 X.509 证书。
     - SSO URL
     - X.509 证书
   
   7. 输入下面的 ACS URL 和实体 ID。
   
      | 字段     | 值 |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 实体 ID   | `urn:auth0:ch-production:{organizationid}` |
   
   8. 勾选 **签名响应** 复选框。
   
   9. 选择 **EMAIL** 作为名称 ID 格式，并将名称 ID 保持为 **基本信息 > 主要电子邮件。**
   
   10. 点击 **继续**。
   
   11. 输入以下属性映射：
       
      | 字段             | 值         |
      |-------------------|---------------|
      | 基本信息         | 主要电子邮件 |
      | 应用程序属性      | email         |
       
   13. 点击 **完成**。
   
   14. 要启用该应用，单击 **OFF** 的所有人，将设置更改为 **ON** 的所有人。访问权限也可以通过选择屏幕左侧的选项来限制为小组或组织单位。
       
</details>

### 配置 Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML 也可以称为 Azure Active Directory (AD) 或 Microsoft Entra。

<details>
   <summary> 创建 Azure 企业应用程序 </summary>
   
   您将为每个组织设置一个应用集成，使用单独的登录 URL。
   
   1. 登录 Microsoft Entra 管理中心。
   
   2. 在左侧导航到 **应用程序 > 企业** 应用程序。
   
   3. 点击顶部菜单中的 **新应用程序**。
   
   4. 点击顶部菜单中的 **创建您自己的应用程序**。
   
   5. 输入名称并选择 **集成您在画廊中找不到的任何其他应用程序 (非画廊)**，然后点击 **创建**。
   
      <Image img={samlAzureApp} size="md" alt="Azure Non-Gallery App" />
   
   6. 点击左侧的 **用户和组**，并分配用户。
   
   7. 点击左侧的 **单点登录**。
   
   8. 点击 **SAML**。
   
   9. 使用以下设置填充基本 SAML 配置屏幕。
   
      | 字段                     | 值 |
      |---------------------------|-------|
      | 标识符 (实体 ID)         | `urn:auth0:ch-production:{organizationid}` |
      | 回复 URL (声明消费者服务 URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 登录 URL                 | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 空白 |
      | 注销 URL                 | 空白 |
   
   11. 在属性和声明下添加 (A) 或更新 (U) 以下内容：
   
       | 声明名称                           | 格式        | 源属性 |
       |--------------------------------------|---------------|------------------|
       | (U) 唯一用户标识符 (名称 ID)        | 电子邮件地址 | user.mail        |
       | (A) email                            | 基本         | user.mail        |
       | (U) /identity/claims/name            | 省略       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="Attributes and Claims" />
   
   12. 收集这两项内容并返回上面的提交支持案例以完成此过程：
     - 登录 URL
     - 证书 (Base64)

</details>

### 配置 Duo SAML {#configure-duo-saml}

<details>
   <summary> 创建一个用于 Duo 的通用 SAML 服务提供者 </summary>
   
   1. 按照 [Duo 单点登录通用 SAML 服务提供者](https://duo.com/docs/sso-generic) 的说明进行操作。
   
   2. 使用以下桥接属性映射：

      |  桥接属性  |  ClickHouse 属性  | 
      |:-------------------|:-----------------------|
      | 电子邮件地址      | email                  |
   
   3. 使用以下值更新您在 Duo 中的云应用：

      |  字段    |  值                                     |
      |:----------|:-------------------------------------------|
      | 表示 ID | `urn:auth0:ch-production:{organizationid}` |
      | 声明消费者服务 (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 服务提供者登录 URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. 收集这两项内容并返回上面的提交支持案例以完成此过程：
      - 单点登录 URL
      - 证书
   
</details>


## 工作原理 {#how-it-works}

### 服务提供者发起的 SSO {#service-provider-initiated-sso}

我们仅使用服务提供者发起的 SSO。这意味着用户访问 `https://console.clickhouse.cloud` 并输入其电子邮件地址以重定向到 IdP 进行身份验证。已经通过您的 IdP 进行身份验证的用户可以使用直接链接自动登录到您的组织，而无需在登录页面上输入电子邮件地址。

### 分配用户角色 {#assigning-user-roles}

在用户被分配到您的 IdP 应用并首次登录后，他们将出现在您的 ClickHouse Cloud 控制台中。组织中至少应为一个 SSO 用户分配管理员角色。使用社交登录或 `https://console.clickhouse.cloud/?with=email` 使用您的原始身份验证方法登录以更新您的 SSO 角色。

### 删除非 SSO 用户 {#removing-non-sso-users}

一旦您设置了 SSO 用户并为至少一个用户分配了管理员角色，管理员可以移除使用其他方法（例如社交身份验证或用户 ID + 密码）的用户。谷歌身份验证将在 SSO 设置后继续有效。用户 ID + 密码的用户将基于其电子邮件域重定向到 SSO，除非用户使用 `https://console.clickhouse.cloud/?with=email`。

### 管理用户 {#managing-users}

ClickHouse Cloud 当前实现了 SAML 以实现 SSO。我们尚未实施 SCIM 来管理用户。这意味着 SSO 用户必须在您的 IdP 中分配到应用程序，才能访问您的 ClickHouse Cloud 组织。用户必须至少登录一次才能出现在组织的 **用户** 区域。当用户在您的 IdP 中被删除时，他们将无法通过 SSO 登录到 ClickHouse Cloud。然而，SSO 用户仍然会显示在您的组织中，直到管理员手动删除该用户。

### 多组织 SSO {#multi-org-sso}

ClickHouse Cloud 支持多组织 SSO，通过为每个组织提供单独的连接。使用直接链接 (`https://console.clickhouse.cloud/?connection={organizationid}`) 登录到各自的组织。在登录到另一个组织之前，请确保退出一个组织。

## 其他信息 {#additional-information}

在身份验证方面，安全性是我们的首要任务。因此，在实施 SSO 时，我们做出了一些决定，您需要了解这些决定。

- **我们仅处理服务提供者发起的身份验证流程。** 用户必须导航到 `https://console.clickhouse.cloud` 并输入电子邮件地址，以便重定向到您的身份提供者。为方便起见，我们提供了添加书签应用程序或快捷方式的说明，以便您的用户无需记住 URL。

- **通过您的 IdP 分配给您应用的所有用户必须具有相同的电子邮件域。** 如果您有供应商、承包商或顾问希望访问您的 ClickHouse 帐户，他们的电子邮件地址必须与您的员工具有相同的域 (例如 user@domain.com)。

- **我们不会自动链接 SSO 和非 SSO 帐户。** 即使用户使用相同的电子邮件地址，您在 ClickHouse 用户列表中可能会看到多个帐户。
