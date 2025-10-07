---
'sidebar_label': 'SAML SSO 设置'
'slug': '/cloud/security/saml-setup'
'title': 'SAML SSO 设置'
'description': '如何在 ClickHouse Cloud 中设置 SAML SSO'
'doc_type': 'guide'
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

ClickHouse Cloud 支持通过安全声明标记语言（SAML）进行单点登录（SSO）。这使您能够通过身份提供者（IdP）安全地登录到您的 ClickHouse Cloud 组织。

我们目前支持服务提供商发起的 SSO、多组织使用单独连接和及时配置。我们尚不支持跨域身份管理（SCIM）或属性映射系统。

## 开始之前 {#before-you-begin}

您将需要在 IdP 中的管理员权限以及在 ClickHouse Cloud 组织中的 **Admin** 角色。在您的 IdP 中设置连接后，请按照下面程序中的信息与我们联系以完成该过程。

我们建议您在设置 SAML 连接的同时，为您的组织设置 **直接链接** 以简化登录过程。每个 IdP 的处理方式不同。请继续阅读以了解如何为您的 IdP 执行此操作。

## 如何配置您的 IdP {#how-to-configure-your-idp}

### 步骤 {#steps}

<details>
   <summary>获取您的组织 ID</summary>
   
   所有设置都需要您的组织 ID。要获取您的组织 ID：
   
   1. 登录到您的 [ClickHouse Cloud](https://console.clickhouse.cloud) 组织。
   
      <Image img={samlOrgId} size="md" alt="组织 ID" force/>
      
   3. 在左下角，单击 **组织** 下的组织名称。
   
   4. 在弹出菜单中，选择 **组织详细信息**。
   
   5. 记录您的 **组织 ID** 以供后用。
      
</details>

<details> 
   <summary>配置您的 SAML 集成</summary>
   
   ClickHouse 使用服务提供商发起的 SAML 连接。这意味着您可以通过 https://console.clickhouse.cloud 或通过直接链接登录。我们目前不支持身份提供者发起的连接。基本的 SAML 配置包括以下内容：

- SSO URL 或 ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

- Audience URI 或 Entity ID: `urn:auth0:ch-production:{organizationid}` 

- 应用程序用户名: `email`

- 属性映射: `email = user.email`

- 访问您组织的直接链接: `https://console.clickhouse.cloud/?connection={organizationid}` 

   有关特定的配置步骤，请参阅您特定的身份提供者。
   
</details>

<details>
   <summary>获取您的连接信息</summary>

   获取您的身份提供者 SSO URL 和 x.509 证书。有关如何检索此信息，请参阅您特定的身份提供者。

</details>

<details>
   <summary>提交支持案例</summary>
   
   1. 返回 ClickHouse Cloud 控制台。
      
   2. 在左侧选择 **帮助**，然后选择支持子菜单。
   
   3. 点击 **新案例**。
   
   4. 输入主题“SAML SSO 设置”。
   
   5. 在描述中粘贴从上面说明中收集的任何链接，并将证书附加到票据中。
   
   6. 请告知我们该连接应允许哪些域名（例如，domain.com，domain.ai等）。
   
   7. 创建一个新的案例。
   
   8. 我们将在 ClickHouse Cloud 中完成设置，并在可以测试时通知您。

</details>

<details>
   <summary>完成设置</summary>

   1. 在您的身份提供者中分配用户访问权限。 

   2. 通过 https://console.clickhouse.cloud 或您在“配置您的 SAML 集成”部分中配置的直接链接登录 ClickHouse。用户初始分配为“Member”角色，可以登录组织并更新个人设置。

   3. 从 ClickHouse 组织注销。 

   4. 使用原始身份验证方法登录，以将 Admin 角色分配给您的新 SSO 帐户。
- 对于电子邮件 + 密码帐户，请使用 `https://console.clickhouse.cloud/?with=email`。
- 对于社交登录，请单击适当的按钮 (**用 Google 登录** 或 **用 Microsoft 登录**)

:::note
`email` 在 `?with=email` 中是字面参数值，而不是占位符
:::

   5. 使用原始身份验证方法注销，并通过 https://console.clickhouse.cloud 或通过您在“配置您的 SAML 集成”部分中配置的直接链接重新登录。

   6. 删除任何非 SAML 用户，以强制实施组织的 SAML。以后，用户通过您的身份提供者分配。
   
</details>

### 配置 Okta SAML {#configure-okta-saml}

您将为每个 ClickHouse 组织在 Okta 中配置两个应用集成：一个 SAML 应用和一个用于存放直接链接的书签。

<details>
   <summary>1. 创建一个组以管理访问</summary>
   
   1. 以 **管理员** 身份登录到您的 Okta 实例。

   2. 在左侧选择 **组**。

   3. 点击 **添加组**。

   4. 输入组的名称和描述。该组将用于在 SAML 应用和其相关书签应用之间保持用户的一致性。

   5. 点击 **保存**。

   6. 点击您创建的组名称。

   7. 点击 **分配人员**，以分配希望访问此 ClickHouse 组织的用户。

</details>

<details>
   <summary>2. 创建书签应用以使用户无缝登录</summary>
   
   1. 在左侧选择 **应用程序**，然后选择 **应用程序** 子标题。
   
   2. 点击 **浏览应用程序目录**。
   
   3. 搜索并选择 **书签应用**。
   
   4. 点击 **添加集成**。
   
   5. 选择应用的标签。
   
   6. 将 URL 输入为 `https://console.clickhouse.cloud/?connection={organizationid}`
   
   7. 转到 **分配** 选项卡并添加您上面创建的组。
   
</details>

<details>
   <summary>3. 创建 SAML 应用以使连接可用</summary>
   
   1. 在左侧选择 **应用程序**，然后选择 **应用程序** 子标题。
   
   2. 点击 **创建应用集成**。
   
   3. 选择 SAML 2.0 并点击下一步。
   
   4. 为您的应用输入名称，并勾选 **不向用户显示应用图标** 旁边的框，然后点击 **下一步**。 
   
   5. 使用以下值填充 SAML 设置屏幕。
   
      | 字段                          | 值 |
      |--------------------------------|-------|
      | 单点登录 URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP 实体 ID)    | `urn:auth0:ch-production:{organizationid}` |
      | 默认 RelayState             | 留空       |
      | Name ID 格式                 | 未指定       |
      | 应用程序用户名           | 电子邮件             |
      | 更新应用程序用户名为 | 创建并更新 |
   
   7. 输入以下属性声明。

      | 名称    | 名称格式   | 值      |
      |---------|---------------|------------|
      | email   | 基本         | user.email |
   
   9. 点击 **下一步**。
   
   10. 在反馈屏幕上输入所请求的信息并点击 **完成**。
   
   11. 转到 **分配** 选项卡并添加您上面创建的组。
   
   12. 在新应用的 **单点登录** 选项卡上，点击 **查看 SAML 设置说明** 按钮。 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML 设置说明" force/>
   
   13. 收集这三个项目，并前往上面的提交支持案例以完成该过程。
     - 身份提供者单点登录 URL
     - 身份提供者发行者
     - X.509 证书
   
</details>

### 配置 Google SAML {#configure-google-saml}

您将为每个组织在 Google 中配置一个 SAML 应用，并必须向用户提供直接链接 (`https://console.clickhouse.cloud/?connection={organizationId}`) 以供书签使用，如果使用多组织 SSO。

<details>
   <summary>创建 Google Web 应用</summary>
   
   1. 转到您的 Google 管理控制台 (admin.google.com)。

   <Image img={samlGoogleApp} size="md" alt="Google SAML 应用" force/>

   2. 点击 **应用**，然后选择左侧的 **Web 和移动应用**。
   
   3. 点击顶部菜单中的 **添加应用**，然后选择 **添加自定义 SAML 应用**。
   
   4. 输入应用的名称并点击 **继续**。
   
   5. 收集这两个项目并前往上面的提交支持案例以提交信息给我们。注意：如果您在复制此数据之前完成设置，请点击应用主页上的 **下载元数据** 以获取 X.509 证书。
     - SSO URL
     - X.509 证书
   
   7. 在下面输入 ACS URL 和 Entity ID。
   
      | 字段     | 值 |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID | `urn:auth0:ch-production:{organizationid}` |
   
   8. 勾选 **已签名响应** 复选框。
   
   9. 选择 **EMAIL** 作为 Name ID 格式，并将 Name ID 留为 **基本信息 > 主电子邮件**。
   
   10. 点击 **继续**。
   
   11. 输入以下属性映射：
       
      | 字段             | 值         |
      |-------------------|---------------|
      | 基本信息 | 主电子邮件 |
      | 应用属性    | email         |
       
   13. 点击 **完成**。
   
   14. 为了使应用可用，单击 **OFF** 为每个人，然后将设置更改为 **ON** 为每个人。访问权限也可以通过选择屏幕左侧的选项，以限制为组或组织单位。
       
</details>

### 配置 Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML 也可称为 Azure Active Directory (AD) 或 Microsoft Entra。

<details>
   <summary>创建 Azure 企业应用</summary>
   
   您将为每个组织设置一个应用集成，使用单独的登录 URL。
   
   1. 登录到 Microsoft Entra 管理中心。
   
   2. 导航到左侧的 **应用程序 > 企业** 应用程序。
   
   3. 点击顶部菜单中的 **新建应用**。
   
   4. 点击顶部菜单中的 **创建您自己的应用**。
   
   5. 输入名称并选择 **集成您在画廊中找不到的其他应用程序（非画廊）**，然后点击 **创建**。
   
      <Image img={samlAzureApp} size="md" alt="Azure 非画廊应用" force/>
   
   6. 点击左侧的 **用户和组** 并分配用户。
   
   7. 点击左侧的 **单点登录**。
   
   8. 点击 **SAML**。
   
   9. 使用以下设置填充基本 SAML 配置屏幕。
   
      | 字段                     | 值 |
      |---------------------------|-------|
      | 标识符（实体 ID）    | `urn:auth0:ch-production:{organizationid}` |
      | 回复 URL（断言消费者服务 URL） | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 登录 URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 留空 |
      | 注销 URL                | 留空 |
   
   11. 在属性和声明下添加 (A) 或更新 (U) 以下内容：
   
       | 声明名称                           | 格式        | 源属性 |
       |--------------------------------------|---------------|------------------|
       | (U) 唯一用户标识符（Name ID） | 电子邮件地址 | user.mail        |
       | (A) email                            | 基本         | user.mail        |
       | (U) /identity/claims/name            | 被省略       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="属性和声明" force/>
   
   12. 收集这两个项目并前往上面的提交支持案例以完成该过程：
     - 登录 URL
     - 证书（Base64）

</details>

### 配置 Duo SAML {#configure-duo-saml}

<details>
   <summary>为 Duo 创建通用 SAML 服务提供商</summary>
   
   1. 按照 [Duo 单点登录通用 SAML 服务提供商的说明](https://duo.com/docs/sso-generic) 的说明进行操作。 
   
   2. 使用以下 Bridge 属性映射：

      |  Bridge 属性  |  ClickHouse 属性  | 
      |:-------------------|:-----------------------|
      | 电子邮件地址      | 电子邮件                  |
   
   3. 使用以下值更新您在 Duo 中的云应用：

      |  字段    |  值                                     |
      |:----------|:-------------------------------------------|
      | 实体 ID | `urn:auth0:ch-production:{organizationid}` |
      | 断言消费者服务 (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 服务提供商登录 URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. 收集这两个项目并前往上面的提交支持案例以完成该过程：
      - 单点登录 URL
      - 证书
   
</details>

## 它是如何工作的 {#how-it-works}

### 服务提供商发起的 SSO {#service-provider-initiated-sso}

我们仅利用服务提供商发起的 SSO。这意味着用户需要访问 `https://console.clickhouse.cloud` 并输入他们的电子邮件地址以便重定向到 IdP 进行身份验证。通过您的 IdP 已经身份验证的用户可以使用直接链接自动登录到您的组织，而无需在登录页面输入他们的电子邮件地址。

### 分配用户角色 {#assigning-user-roles}

用户在他们被分配到您的 IdP 应用程序并首次登录后，将出现在您的 ClickHouse Cloud 控制台中。至少应在您的组织中为一名 SSO 用户分配 Admin 角色，使用 SSO 登录的其他用户将以 ["Member"](/cloud/security/cloud-access-management/overview#console-users-and-roles) 角色创建，这意味着他们默认不能访问任何服务，并应由管理员更新他们的访问权限和角色。

使用社交登录或 `https://console.clickhouse.cloud/?with=email` 使用原始身份验证方法登录以更新您的 SSO 角色。

### 移除非 SSO 用户 {#removing-non-sso-users}

一旦您设置了 SSO 用户并为至少一个用户分配了 Admin 角色，管理员可以删除使用其他方法（例如社交身份验证或用户 ID + 密码）的用户。设置 SSO 后，Google 身份验证将继续有效。用户 ID + 密码用户将基于其电子邮件域被自动重定向到 SSO，除非用户使用 `https://console.clickhouse.cloud/?with=email`。

### 管理用户 {#managing-users}

ClickHouse Cloud 目前实现了 SAML 进行 SSO。我们尚未实现 SCIM 来管理用户。这意味着 SSO 用户必须在您的 IdP 中被分配到应用程序才能访问您的 ClickHouse Cloud 组织。用户必须首次登录 ClickHouse Cloud 才能出现在组织的 **用户** 区域中。当用户在您的 IdP 中被删除时，他们将无法再使用 SSO 登录 ClickHouse Cloud。然而，SSO 用户仍然会在您的组织中显示，直到管理员手动删除该用户。

### 多组织 SSO {#multi-org-sso}

ClickHouse Cloud 支持多组织 SSO，为每个组织提供单独的连接。使用直接链接 (`https://console.clickhouse.cloud/?connection={organizationid}`) 登录到各自的组织。在登录另一个组织之前，请确保注销一个组织。

## 其他信息 {#additional-information}

安全是我们在身份验证方面的首要任务。因此，我们在实现 SSO 时做出了一些需要您知晓的决定。

- **我们只处理服务提供商发起的身份验证流程。** 用户必须导航到 `https://console.clickhouse.cloud` 并输入电子邮件地址，以便被重定向到您的身份提供者。提供了添加书签应用或快捷方式的说明，以方便您的用户，无需记住 URL。

- **所有通过 IdP 分配给您应用的用户必须具有相同的电子邮件域。** 如果您有希望访问 ClickHouse 帐户的供应商、承包商或顾问，他们必须具有与您的员工相同域名的电子邮件地址（例如 user@domain.com）。

- **我们不会自动链接 SSO 和非 SSO 帐户。** 即使用户使用相同的电子邮件地址，您也可能在 ClickHouse 用户列表中看到用户的多个帐户。
