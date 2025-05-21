---
'sidebar_label': 'SAML SSO Setup'
'slug': '/cloud/security/saml-setup'
'title': 'SAML SSO Setup'
'description': 'How to set up SAML SSO with ClickHouse Cloud'
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

ClickHouse Cloud 支持通过安全声明标记语言 (SAML) 实现单点登录 (SSO)。这使您能够通过与您的身份提供者 (IdP) 进行身份验证来安全地登录到您的 ClickHouse Cloud 组织。

我们目前支持服务提供者发起的 SSO、多个组织使用不同的连接以及即时配置。我们尚不支持跨域身份管理 (SCIM) 或属性映射的系统。

## 开始之前 {#before-you-begin}

您需要在您的 IdP 中具有管理员权限，并在您的 ClickHouse Cloud 组织中拥有 **管理员** 角色。在您的 IdP 中设置完连接后，请按照下面过程中的要求与我们联系以完成此过程。

我们建议您除了 SAML 连接外，还设置一个 **指向您组织的直接链接**，以简化登录过程。每个 IdP 的处理方式不同。继续阅读以了解如何为您的 IdP 设置此内容。

## 如何配置您的 IdP {#how-to-configure-your-idp}

### 步骤 {#steps}

<details>
   <summary>获取您的组织 ID</summary>
   
   所有设置都需要您的组织 ID。要获取您的组织 ID：
   
   1. 登录到您的 [ClickHouse Cloud](https://console.clickhouse.cloud) 组织。
   
      <Image img={samlOrgId} size="md" alt="组织 ID" />
      
   3. 在左下角，点击 **组织** 下的组织名称。
   
   4. 在弹出菜单中选择 **组织详情**。
   
   5. 记下您的 **组织 ID** 以供后续使用。
      
</details>

<details> 
   <summary>配置您的 SAML 集成</summary>
   
   ClickHouse 使用服务提供者发起的 SAML 连接。这意味着您可以通过 https://console.clickhouse.cloud 或通过直接链接登录。我们目前不支持身份提供者发起的连接。基本的 SAML 配置包括以下内容：

   - SSO URL 或 ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - 受众 URI 或实体 ID: `urn:auth0:ch-production:{organizationid}` 

   - 应用程序用户名: `email`

   - 属性映射: `email = user.email`

   - 访问您组织的直接链接: `https://console.clickhouse.cloud/?connection={organizationid}` 

   有关特定配置步骤，请参阅您的具体身份提供者。
   
</details>

<details>
   <summary>获取您的连接信息</summary>

   获取您的身份提供者 SSO URL 和 x.509 证书。请参阅您的具体身份提供者以获取有关如何检索此信息的说明。

</details>

<details>
   <summary>提交支持案例</summary>
   
   1. 返回到 ClickHouse Cloud 控制台。
      
   2. 在左侧选择 **帮助**，然后选择支持子菜单。
   
   3. 点击 **新案例**。
   
   4. 输入主题 “SAML SSO 设置”。
   
   5. 在描述中，粘贴从以上说明中收集的任何链接，并将证书附加到工单中。
   
   6. 请告知我们哪些域名应被允许用于此连接 (例如 domain.com, domain.ai 等)。
   
   7. 创建一个新案例。
   
   8. 我们将在 ClickHouse Cloud 中完成设置，并在测试准备好时通知您。

</details>

<details>
   <summary>完成设置</summary>

   1. 在您的身份提供者中分配用户访问权限。 

   2. 通过 https://console.clickhouse.cloud 或者在上方“配置您的 SAML 集成”中的直接链接登录 ClickHouse。用户最初被分配“成员”角色，可以登录组织并更新个人设置。

   3. 从 ClickHouse 组织中注销。 

   4. 使用原始身份验证方法登录，将管理员角色分配给您的新 SSO 帐户。
   - 对于电子邮件 + 密码帐户，请使用 `https://console.clickhouse.cloud/?with=email`。
   - 对于社交登录，请点击相应的按钮 (**使用 Google 继续** 或 **使用 Microsoft 继续**)。

   5. 使用原始身份验证方法注销，然后通过 https://console.clickhouse.cloud 或者在上方“配置您的 SAML 集成”中的直接链接重新登录。

   6. 删除任何非 SAML 用户以强制要求组织使用 SAML。往后，用户将通过您的身份提供者进行分配。
   
</details>

### 配置 Okta SAML {#configure-okta-saml}

您将为每个 ClickHouse 组织在 Okta 中配置两个应用集成：一个 SAML 应用和一个书签来保存您的直接链接。

<details>
   <summary>1. 创建一个组以管理访问</summary>
   
   1. 以 **管理员** 身份登录您的 Okta 实例。

   2. 在左侧选择 **组**。

   3. 点击 **添加组**。

   4. 输入组的名称和描述。该组将用于保持 SAML 应用与其相关书签应用之间的用户一致性。

   5. 点击 **保存**。

   6. 点击您创建的组的名称。

   7. 点击 **分配人员** 来分配您希望访问此 ClickHouse 组织的用户。

</details>

<details>
   <summary>2. 创建一个书签应用以使用户无缝登录</summary>
   
   1. 在左侧选择 **应用**，然后选择 **应用** 子标题。
   
   2. 点击 **浏览应用目录**。
   
   3. 搜索并选择 **书签应用**。
   
   4. 点击 **添加集成**。
   
   5. 为该应用选择一个标签。
   
   6. 将 URL 输入为 `https://console.clickhouse.cloud/?connection={organizationid}`
   
   7. 转到 **分配** 选项卡并添加您上面创建的组。
   
</details>

<details>
   <summary>3. 创建一个 SAML 应用以启用连接</summary>
   
   1. 在左侧选择 **应用**，然后选择 **应用** 子标题。
   
   2. 点击 **创建应用集成**。
   
   3. 选择 SAML 2.0 并点击 下一步。
   
   4. 输入您的应用程序名称，并勾选 **不向用户显示应用图标** 旁边的框，然后点击 **下一步**。 
   
   5. 使用以下值填充 SAML 设置屏幕。
   
      | 字段                          | 值 |
      |------------------------------|-------|
      | 单点登录 URL                | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 受众 URI (SP 实体 ID)       | `urn:auth0:ch-production:{organizationid}` |
      | 默认 RelayState              | 留空       |
      | 名称 ID 格式                | 未指定       |
      | 应用程序用户名              | 电子邮件             |
      | 在更新应用程序用户名时      | 创建并更新 |

   7. 输入以下属性声明。

      | 名称    | 名称格式   | 值      |
      |---------|------------|------------|
      | email   | 基本信息   | user.email |
   
   9. 点击 **下一步**。
   
   10. 在反馈屏幕上输入请求的信息并点击 **完成**。
   
   11. 转到 **分配** 选项卡并添加您上面创建的组。
   
   12. 在新应用的 **单点登录** 选项卡中，点击 **查看 SAML 设置说明** 按钮。 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML 设置说明" />
   
   13. 收集这三项内容并前往上方的提交支持案例以完成此过程。
     - 身份提供者单点登录 URL
     - 身份提供者签发人
     - X.509 证书
   
</details>

### 配置 Google SAML {#configure-google-saml}

您将在Google中为每个组织配置一个SAML应用，并必须为用户提供直接链接（`https://console.clickhouse.cloud/?connection={organizationId}`）以便在使用多组织SSO时添加书签。

<details>
   <summary>创建一个 Google 网络应用</summary>
   
   1. 前往您的 Google 管理控制台 (admin.google.com)。

   <Image img={samlGoogleApp} size="md" alt="Google SAML 应用" />

   2. 点击 **应用**，然后在左侧选择 **网络和移动应用**。
   
   3. 在顶部菜单中点击 **添加应用**，然后选择 **添加自定义 SAML 应用**。
   
   4. 输入应用程序的名称并点击 **继续**。
   
   5. 收集这两个项目并前往上方的提交支持案例，将信息提交给我们。注意：如果在复制此数据之前完成设置，请点击应用的主屏幕上的 **下载元数据** 以获取 X.509 证书。
     - SSO URL
     - X.509 证书
   
   7. 输入下面的 ACS URL 和实体 ID。
   
      | 字段     | 值 |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 实体 ID   | `urn:auth0:ch-production:{organizationid}` |
   
   8. 勾选 **已签名响应** 的框。
   
   9. 选择 **电子邮件** 作为名称 ID 格式，并将名称 ID 保留为 **基本信息 > 主要电子邮件**。
   
   10. 点击 **继续**。
   
   11. 输入以下属性映射：
       
      | 字段                  | 值         |
      |----------------------|-------------|
      | 基本信息            | 主要电子邮件 |
      | 应用程序属性        | email       |
       
   13. 点击 **完成**。
   
   14. 要启用该应用，请点击所有人的 **关闭**，然后将设置更改为 **开启**。也可以通过选择屏幕左侧的选项限制访问仅限于组或组织单位。
       
</details>

### 配置 Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML 也可称为 Azure Active Directory (AD) 或 Microsoft Entra。

<details>
   <summary>创建 Azure 企业应用</summary>
   
   您将为每个组织设置一个应用集成，并为每个组织提供单独的登录 URL。
   
   1. 登录到 Microsoft Entra 管理中心。
   
   2. 在左侧导航至 **应用 > 企业** 应用。
   
   3. 在顶部菜单中点击 **新应用**。
   
   4. 在顶部菜单中点击 **创建您自己的应用**。
   
   5. 输入一个名称并选择 **整合您在画廊中找不到的任何其他应用 (非画廊)**，然后点击 **创建**。
   
      <Image img={samlAzureApp} size="md" alt="Azure 非画廊应用" />
   
   6. 点击左侧的 **用户和组** 并指派用户。
   
   7. 点击左侧的 **单点登录**。
   
   8. 点击 **SAML**。
   
   9. 使用以下设置填充基本 SAML 配置屏幕。
   
      | 字段                       | 值 |
      |----------------------------|-------|
      | 标识符 (实体 ID)           | `urn:auth0:ch-production:{organizationid}` |
      | 回复 URL (断言消费者服务 URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 登录 URL                   | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State                | 留空 |
      | 注销 URL                   | 留空 |
   
   11. 在属性和声明下添加 (A) 或更新 (U) 以下内容：
   
       | 声明名称                             | 格式        | 源属性       |
       |--------------------------------------|-------------|--------------|
       | (U) 唯一用户标识符 (名称 ID)        | 电子邮件地址 | user.mail    |
       | (A) email                            | 基本        | user.mail    |
       | (U) /identity/claims/name            | 省略        | user.mail    |
   
         <Image img={samlAzureClaims} size="md" alt="属性和声明" />
   
   12. 收集这两个项目并前往上方的提交支持案例以完成此过程：
     - 登录 URL
     - 证书 (Base64)

</details>

### 配置 Duo SAML {#configure-duo-saml}

<details>
   <summary>为 Duo 创建一个通用 SAML 服务提供者</summary>
   
   1. 按照 [Duo 单点登录通用 SAML 服务提供者的说明](https://duo.com/docs/sso-generic)。 
   
   2. 使用以下桥接属性映射：

      |  桥接属性    |  ClickHouse 属性   | 
      |:-------------------|:-----------------------|
      | 电子邮件地址      | email                  |
   
   3. 使用以下值更新您在 Duo 中的 Cloud 应用：

      |  字段    |  值                                     |
      |:----------|:-------------------------------------------|
      | 实体 ID | `urn:auth0:ch-production:{organizationid}` |
      | 断言消费者服务 (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 服务提供商登录 URL | `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. 收集这两个项目并前往上方的提交支持案例以完成此过程：
      - 单点登录 URL
      - 证书
   
</details>

## 工作原理 {#how-it-works}

### 服务提供者发起的 SSO {#service-provider-initiated-sso}

我们只使用服务提供者发起的 SSO。这意味着用户访问 `https://console.clickhouse.cloud` 并输入他们的电子邮件地址，然后重定向到 IdP 进行身份验证。已经通过您的 IdP 进行身份验证的用户可以使用直接链接自动登录到您的组织，而无需在登录页面输入他们的电子邮件地址。

### 分配用户角色 {#assigning-user-roles}

用户将在分配给您的 IdP 应用并首次登录之后出现在您的 ClickHouse Cloud 控制台中。在您的组织中，至少应分配一个 SSO 用户为管理员角色。使用社交登录或 `https://console.clickhouse.cloud/?with=email` 以原始身份验证方法登录以更新您的 SSO 角色。

### 删除非 SSO 用户 {#removing-non-sso-users}

一旦您设置了 SSO 用户并至少分配了一个用户为管理员角色，管理员可以删除使用其他身份验证方法（例如社交身份验证或用户 ID + 密码）的用户。设置 SSO 后，Google 身份验证将继续有效。用户 ID + 密码用户将在其电子邮件域名下自动重定向到 SSO，除非用户使用 `https://console.clickhouse.cloud/?with=email`。

### 管理用户 {#managing-users}

ClickHouse Cloud 目前为 SSO 实施 SAML。我们尚未实现 SCIM 来管理用户。这意味着 SSO 用户必须在您的 IdP 中被分配到应用程序才能访问您的 ClickHouse Cloud 组织。用户必须首次登录 ClickHouse Cloud 才会出现在组织的 **用户** 区域中。当用户在您的 IdP 中被删除时，他们将无法使用 SSO 登录 ClickHouse Cloud。然而，SSO 用户在您的组织中仍然会显示，直到管理员手动删除用户。

### 多组织 SSO {#multi-org-sso}

ClickHouse Cloud 通过为每个组织提供单独的连接来支持多组织 SSO。使用直接链接（`https://console.clickhouse.cloud/?connection={organizationid}`）登录每个相关组织。确保在登录另一个组织之前先退出一个组织。

## 附加信息 {#additional-information}

安全是我们在身份验证方面的首要任务。因此，在实施 SSO 时我们做出了一些决策，需要您了解。

- **我们只处理服务提供者发起的身份验证流。** 用户必须导航到 `https://console.clickhouse.cloud` 并输入电子邮件地址以重定向到您的身份提供者。为方便您的用户，我们提供了添加书签应用程序或快捷方式的说明，以便他们无需记住 URL。

- **所有通过您 IdP 分配给您应用的用户必须具有相同的电子邮件域。** 如果您有供应商、承包商或顾问希望访问您的 ClickHouse 帐户，他们必须使用与您的员工相同域的电子邮件地址 (例如 user@domain.com)。

- **我们不会自动将 SSO 和非 SSO 帐户关联。** 即使用户使用相同的电子邮件地址，您在 ClickHouse 用户列表中仍可能会看到多个帐户。
