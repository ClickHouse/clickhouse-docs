---
sidebar_label: 'SAML SSO 设置'
slug: '/cloud/security/saml-setup'
title: 'SAML SSO 设置'
description: '如何在 ClickHouse Cloud 上设置 SAML SSO'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge' 


# SAML SSO 设置

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud 支持通过安全声明标记语言（SAML）实现单点登录（SSO）。这使您能够通过身份提供商（IdP）进行身份验证，安全地登录到您的 ClickHouse Cloud 组织。

我们目前支持服务提供商发起的 SSO、多个组织使用单独连接以及随需供应。我们尚不支持跨域身份管理系统（SCIM）或属性映射。

## 开始之前 {#before-you-begin}

您需要在您的 IdP 中具有管理员权限，并在您的 ClickHouse Cloud 组织中具有 **管理** 角色。在您设置完 IdP 内部的连接后，请按照下面的程序要求与我们联系，以完成该过程。

我们建议在设置 SAML 连接的同时设置 **直接链接到您的组织**，以简化登录过程。每个 IdP 的处理方式有所不同。继续阅读以获取如何对您的 IdP 进行此操作的信息。

## 如何配置您的 IdP {#how-to-configure-your-idp}

### 步骤 {#steps}

<details>
   <summary>  获取您的组织 ID  </summary>
   
   所有设置都需要您的组织 ID。要获取您的组织 ID：
   
   1. 登录到您的 [ClickHouse Cloud](https://console.clickhouse.cloud) 组织。
   
      <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/0cb69e9e-1506-4eb4-957d-f104d8c15f3a'
           class="image"
           alt="组织 ID"
           style={{width: '60%', display: 'inline'}} />
      
   3. 在左下角，点击 **组织** 下的您的组织名称。
   
   4. 在弹出菜单中，选择 **组织详情**。
   
   5. 记下您的 **组织 ID** 以便在下面使用。
      
</details>

<details> 
   <summary>  配置您的 SAML 集成  </summary>
   
   ClickHouse 使用服务提供商发起的 SAML 连接。这意味着您可以通过 https://console.clickhouse.cloud 或通过直接链接登录。我们目前不支持身份提供商发起的连接。基本 SAML 配置包括以下内容：

   - SSO URL 或 ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

   - 受众 URI 或实体 ID: `urn:auth0:ch-production:{organizationid}` 

   - 应用程序用户名: `email`

   - 属性映射: `email = user.email`

   - 访问您组织的直接链接: `https://console.clickhouse.cloud/?connection={organizationid}` 


   有关具体配置步骤，请参阅下面的特定身份提供商。
   
</details>

<details>
   <summary>  获取您的连接信息  </summary>

   获取您的身份提供商 SSO URL 和 x.509 证书。有关如何检索此信息，请参阅下面的特定身份提供商。

</details>

<details>
   <summary>  提交支持案例 </summary>
   
   1. 返回 ClickHouse Cloud 控制台。
      
   2. 在左侧选择 **帮助**，然后选择支持子菜单。
   
   3. 点击 **新建案例**。
   
   4. 输入主题 "SAML SSO 设置"。
   
   5. 在描述中，粘贴从上面的说明中收集的任何链接，并将证书附加到票据中。
   
   6. 请告知我们哪些域应该允许进行此连接（例如 domain.com、domain.ai 等）。
   
   7. 创建新案例。
   
   8. 我们将在 ClickHouse Cloud 中完成设置，并在准备好进行测试时通知您。

</details>

<details>
   <summary>  完成设置  </summary>

   1. 在您的身份提供商中分配用户访问权限。 

   2. 通过 https://console.clickhouse.cloud 登录到 ClickHouse 或您在上面“配置您的 SAML 集成”中配置的直接链接。用户最初被分配为“开发者”角色，具备组织的只读访问权限。

   3. 注销 ClickHouse 组织。 

   4. 使用您的原始身份验证方法登录，以将管理角色分配给您的新 SSO 帐户。
   - 对于电子邮件 + 密码帐户，请使用 `https://console.clickhouse.cloud/?with=email`。
   - 对于社交登录，请单击适当的按钮（**使用 Google 登录**或 **使用 Microsoft 登录**）。

   5. 使用您的原始身份验证方法注销，并通过 https://console.clickhouse.cloud 或者您在上面“配置您的 SAML 集成”中配置的直接链接重新登录。

   6. 删除任何非 SAML 用户，以强制组织使用 SAML。今后用户将通过您的身份提供商分配。
   
</details>

### 配置 Okta SAML {#configure-okta-saml}

您将在 Okta 中为每个 ClickHouse 组织配置两个应用集成：一个 SAML 应用和一个书签以保存您的直接链接。

<details>
   <summary>  1. 创建一个组以管理访问权限  </summary>
   
   1. 以 **管理员** 身份登录到您的 Okta 实例。

   2. 在左侧选择 **组**。

   3. 点击 **添加组**。

   4. 输入组的名称和描述。该组将用于在 SAML 应用和其相关书签应用之间保持用户一致性。

   5. 点击 **保存**。

   6. 点击您创建的组的名称。

   7. 点击 **分配人员** ，分配您希望拥有访问此 ClickHouse 组织权限的用户。

</details>

<details>
   <summary>  2. 创建一个书签应用以使用户能够无缝登录  </summary>
   
   1. 在左侧选择 **应用程序**，然后选择 **应用程序** 子标题。
   
   2. 点击 **浏览应用目录**。
   
   3. 搜索并选择 **书签应用**。
   
   4. 点击 **添加集成**。
   
   5. 为应用选择一个标签。
   
   6. 输入 URL 为 `https://console.clickhouse.cloud/?connection={organizationid}`
   
   7. 转到 **分配** 选项卡，添加您创建的组。
   
</details>

<details>
   <summary>  3. 创建一个 SAML 应用以启用连接  </summary>
   
   1. 在左侧选择 **应用程序**，然后选择 **应用程序** 子标题。
   
   2. 点击 **创建应用集成**。
   
   3. 选择 SAML 2.0 并点击下一步。
   
   4. 输入您的应用程序名称，勾选 **不向用户显示应用程序图标** 旁边的框，然后点击 **下一步**。 
   
   5. 使用以下值填充 SAML 设置屏幕。
   
      | 字段                          | 值 |
      |--------------------------------|-------|
      | 单点登录 URL                  | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 受众 URI (SP 实体 ID)        | `urn:auth0:ch-production:{organizationid}` |
      | 默认 RelayState              | 留空       |
      | 名称 ID 格式                 | 未指定       |
      | 应用程序用户名               | 电子邮件             |
      | 更新应用程序用户名方式      | 创建并更新 |
   
   7. 输入以下属性声明。

      | 名称    | 名称格式   | 值      |
      |---------|---------------|------------|
      | email   | 基本         | user.email |
   
   9. 点击 **下一步**。
   
   10. 在反馈屏幕上输入请求的信息并点击 **完成**。
   
   11. 转到 **分配** 选项卡，添加您创建的组。
   
   12. 在新应用程序的 **单点登录** 选项卡上，点击 **查看 SAML 设置说明** 按钮。 
   
         <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/8d316548-5fb7-4d3a-aad9-5d025c51f158'
              class="image"
              alt="Okta SAML 设置说明"
              style={{width: '60%', display: 'inline'}} />
   
   13. 收集这三项内容，并前往上面的“提交支持案例”以完成过程。
     - 身份提供商单点登录 URL
     - 身份提供商发行者
     - X.509 证书
   
</details>


### 配置 Google SAML {#configure-google-saml}

您将为每个组织在 Google 中配置一个 SAML 应用，并必须提供用户直接链接（`https://console.clickhouse.cloud/?connection={organizationId}`）以进行书签，如果使用多组织 SSO。

<details>
   <summary>  创建一个 Google Web 应用  </summary>
   
   1. 访问您的 Google 管理控制台 (admin.google.com)。

   <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b931bd12-2fdf-4e25-b0b5-1170bbd20760'
        class="image"
        alt="Google SAML 应用"
        style={{width: '60%', display: 'inline'}} />

   2. 点击左侧的 **应用程序**，然后选择 **Web 和移动应用**。
   
   3. 点击顶部菜单中的 **添加应用**，然后选择 **添加自定义 SAML 应用**。
   
   4. 输入应用名称并点击 **继续**。
   
   5. 收集这两个项目并到上面“提交支持案例”提交信息给我们。注意：如果您在复制此数据之前完成设置，请点击应用主屏幕上的 **下载元数据** 以获取 X.509 证书。
     - SSO URL
     - X.509 证书
   
   7. 输入下面的 ACS URL 和实体 ID。
   
      | 字段     | 值 |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 实体 ID   | `urn:auth0:ch-production:{organizationid}` |
   
   8. 勾选 “已签名的响应” 选项。
   
   9. 为名称 ID 格式选择 **EMAIL**，并保持名称 ID 为 **基本信息 > 主要电子邮件**。
   
   10. 点击 **继续**。
   
   11. 输入以下属性映射：
       
      | 字段             | 值         |
      |-------------------|---------------|
      | 基本信息          | 主要电子邮件 |
      | 应用属性         | email         |
       
   13. 点击 **完成**。
   
   14. 为了启用该应用，点击 **关闭**，然后更改设置为 **开启**。还可以通过选择屏幕左侧的选项，将访问权限限制为组或组织单位。
       
</details>

### 配置 Azure (Microsoft) SAML {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML 也可能被称为 Azure Active Directory (AD) 或 Microsoft Entra。

<details>
   <summary>  创建一个 Azure 企业应用程序 </summary>
   
   您将为每个组织设置一个应用集成，具有单独的单点登录 URL。
   
   1. 登录到 Microsoft Entra 管理中心。
   
   2. 在左侧导航到 **应用程序 > 企业** 应用程序。
   
   3. 点击顶部菜单中的 **新建应用程序**。
   
   4. 点击顶部菜单中的 **创建您自己的应用程序**。
   
   5. 输入名称并选择 **集成您在画廊中找不到的任何其他应用程序（非画廊）** ，然后点击 **创建**。
   
      <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/5577b3ed-56e0-46b9-a9f7-80aa27f9a97a'
           class="image"
           alt="Azure 非画廊应用"
           style={{width: '60%', display: 'inline'}} />
   
   6. 点击左侧的 **用户和组** 并分配用户。
   
   7. 点击左侧的 **单点登录**。
   
   8. 点击 **SAML**。
   
   9. 使用以下设置填充基本 SAML 配置屏幕。
   
      | 字段                      | 值 |
      |---------------------------|-------|
      | 标识符 (实体 ID)          | `urn:auth0:ch-production:{organizationid}` |
      | 回复 URL (断言消费者服务 URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 登录 URL                  | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 空白 |
      | 登出 URL                 | 空白 |
   
   11. 在属性和声明下添加 (A) 或更新 (U) 以下内容：
   
       | 声明名称                           | 格式        | 源属性 |
       |--------------------------------------|---------------|------------------|
       | (U) 唯一用户标识符 (名称 ID)        | 电子邮件地址 | user.mail        |
       | (A) email                            | 基本         | user.mail        |
       | (U) /identity/claims/name            | 省略       | user.mail        |
   
         <img src='https://github.com/ClickHouse/clickhouse-docs/assets/110556185/b59af49f-4cdc-47f4-99e0-fe4a7ffbceda'
              class="image"
              alt="属性和声明"
              style={{width: '60%', display: 'inline'}} />
   
   12. 收集这两项内容并前往上面的“提交支持案例”以完成过程：
     - 登录 URL
     - 证书 (Base64)

</details>

### 配置 Duo SAML {#configure-duo-saml}

<details>
   <summary> 创建一个 Duo 的通用 SAML 服务提供商 </summary>
   
   1. 按照 [Duo 单点登录服务提供商的通用 SAML 说明](https://duo.com/docs/sso-generic)。 
   
   2. 使用以下 Bridge 属性映射：

      |  Bridge 属性  |  ClickHouse 属性  | 
      |:-------------------|:-----------------------|
      | 电子邮件地址      | email                  |
   
   3. 使用以下值更新您在 Duo 的云应用：

      |  字段    |  值                                     |
      |:----------|:-------------------------------------------|
      | 实体 ID | `urn:auth0:ch-production:{organizationid}` |
      | 断言消费者服务 (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 服务提供商登录 URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. 收集这两项内容并前往上面的“提交支持案例”以完成过程：
      - 单点登录 URL
      - 证书
   
</details>


## 工作原理 {#how-it-works}

### 服务提供商发起的 SSO {#service-provider-initiated-sso}

我们只利用服务提供商发起的 SSO。这意味着用户访问 `https://console.clickhouse.cloud` 并输入他们的电子邮件地址，以便被重定向到 IdP 进行身份验证。通过 IdP 已经验证的用户可以使用直接链接自动登录到其组织，而无需在登录页面输入电子邮件地址。

### 分配用户角色 {#assigning-user-roles}

用户在被分配到您的 IdP 应用并首次登录后，将出现在您的 ClickHouse Cloud 控制台中。在您的组织中，至少应该有一个 SSO 用户被分配为管理角色。使用社交登录或 `https://console.clickhouse.cloud/?with=email` 使用您的原始身份验证方法登录以更新您的 SSO 角色。

### 移除非 SSO 用户 {#removing-non-sso-users}

一旦您设置了 SSO 用户并至少分配了一个用户为管理角色，则管理员可以移除使用其他方式（例如社交身份验证或用户 ID + 密码）的用户。完成 SSO 设置后，Google 身份验证将继续有效。用户 ID + 密码的用户将根据其电子邮件域被自动重定向到 SSO，除非用户使用 `https://console.clickhouse.cloud/?with=email`。

### 管理用户 {#managing-users}

ClickHouse Cloud 目前实施 SAML 以进行 SSO。我们尚未实施 SCIM 来管理用户。这意味着 SSO 用户必须在您的 IdP 中被分配到该应用程序，才能访问您的 ClickHouse Cloud 组织。用户必须登录一次 ClickHouse Cloud 才会出现在组织的 **用户** 区域。当用户在您的 IdP 中被移除时，他们将无法使用 SSO 登录 ClickHouse Cloud。但是，SSO 用户在您的组织中仍会显示，直到管理员手动移除该用户。

### 多组织 SSO {#multi-org-sso}

ClickHouse Cloud 通过为每个组织提供单独的连接来支持多组织 SSO。使用直接链接 (`https://console.clickhouse.cloud/?connection={organizationid}`) 登录到各自的组织。请确保在登录其他组织之前登出一个组织。

## 附加信息 {#additional-information}

安全性是我们在身份验证方面的首要任务。出于这个原因，我们在实现 SSO 时做出了一些需要您知道的决定。

- **我们仅处理服务提供商发起的身份验证流。** 用户必须访问 `https://console.clickhouse.cloud` 并输入电子邮件地址以被重定向到您的身份提供商。为方便用户，我们提供了添加书签应用或快捷方式的说明，以便他们无需记住 URL。

- **所有通过您的 IdP 分配到应用程序的用户必须使用相同的电子邮件域。** 如果您有希望访问您 ClickHouse 帐户的供应商、承包商或顾问，他们必须拥有与您的员工相同域名的电子邮件地址（例如 user@domain.com）。

- **我们不会自动链接 SSO 和非 SSO 帐户。** 即使用户使用相同的电子邮件地址，您可能在 ClickHouse 用户列表中看到多个帐户。
