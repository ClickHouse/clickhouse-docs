---
sidebar_label: 'SAML 单点登录设置'
slug: /cloud/security/saml-setup
title: 'SAML 单点登录设置'
description: '如何在 ClickHouse Cloud 中设置 SAML 单点登录'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', '单点登录', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlSelfServe1 from '@site/static/images/cloud/security/saml-self-serve-1.png';
import samlSelfServe2 from '@site/static/images/cloud/security/saml-self-serve-2.png';
import samlSelfServe3 from '@site/static/images/cloud/security/saml-self-serve-3.png';
import samlSelfServe4 from '@site/static/images/cloud/security/saml-self-serve-4.png';
import samlSelfServe5 from '@site/static/images/cloud/security/saml-self-serve-5.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# 配置 SAML SSO \\{#saml-sso-setup\\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud 通过安全断言标记语言（SAML）支持单点登录（SSO）。这使您能够通过身份提供商（IdP）进行身份验证，从而安全地登录到您的 ClickHouse Cloud 组织。

我们目前支持由服务提供者发起的 SSO、通过独立连接接入的多个组织，以及即时（Just-in-time，JIT）预配。我们尚不支持跨域身份管理系统（SCIM）或属性映射功能。

启用 SAML 集成的客户还可以指定新用户的默认角色，并调整会话超时设置。

## 开始之前 \\{#before-you-begin\\}

你需要在你的 IdP 中拥有管理员（Admin）权限，能够在你所属域名的 DNS 设置中添加 TXT 记录，并在 ClickHouse Cloud 组织中具有 **Admin** 角色。我们建议在配置 SAML 连接的同时，额外设置一个**指向你组织的直接链接**，以简化登录流程。不同 IdP 的具体配置方式各不相同。请继续阅读，了解如何在你的 IdP 中完成这些操作。

## 如何配置 IdP \\{#how-to-configure-your-idp\\}

### 步骤 \\{#steps\\}

<VerticalStepper headerLevel="h3">
  ### 访问组织设置

  点击左下角的组织名称，然后选择 Organization details。

  ### 启用 SAML 单点登录

  点击 `Enable SAML single sign-on` 旁边的开关按钮。保持此页面打开，因为在设置过程中您会多次返回到该页面。

  <Image img={samlSelfServe1} size="lg" alt="开始 SAML 设置" force />

  ### 在身份提供商中创建应用程序

  在您的身份提供商中创建一个应用程序，并将 `Enable SAML single sign-on` 页面上的各项值复制到身份提供商的配置中。有关此步骤的更多信息，请参阅下方与您所使用的身份提供商对应的章节。

  * [配置 Okta SAML](#configure-okta-saml)
  * [配置 Google SAML](#configure-google-saml)
  * [配置 Azure（Microsoft）SAML](#configure-azure-microsoft-saml)
  * [配置 Duo SAML](#configure-duo-saml)

  :::tip
  ClickHouse 不支持由身份提供商发起的登录。为了方便您的用户访问 ClickHouse Cloud，请使用以下登录 URL 格式为用户设置书签：`https://console.clickhouse.cloud/?connection={orgId}`，其中 `{orgID}` 为 Organization details 页面上的组织 ID。
  :::

  <Image img={samlSelfServe2} size="lg" alt="创建身份提供商应用程序" force />

  ### 将元数据 URL 添加到您的 SAML 配置

  从您的 SAML 提供商获取 `Metadata URL`。返回 ClickHouse Cloud，点击 `Next: Provide metadata URL`，并将该 URL 粘贴到文本框中。

  <Image img={samlSelfServe3} size="lg" alt="添加元数据 URL" force />

  ### 获取域验证代码

  点击 `Next: Verify your domains`。在文本框中输入您的域名并点击 `Check domain`。系统会生成一个随机验证码，供您添加到 DNS 提供商中的 TXT 记录。

  <Image img={samlSelfServe4} size="lg" alt="添加要验证的域" force />

  ### 验证您的域

  在您的 DNS 提供商处创建一个 TXT 记录。将 `TXT record name` 复制到 DNS 提供商中 TXT 记录的 Name 字段，将 `Value` 复制到 DNS 提供商中的 Content 字段。点击 `Verify and Finish` 完成该流程。

  :::note
  DNS 记录可能需要几分钟时间才能更新并完成验证。您可以离开设置页面，稍后再返回完成流程，而无需重新开始。
  :::

  <Image img={samlSelfServe5} size="lg" alt="验证你的域" force />

  ### 更新默认角色和会话超时

  完成 SAML 设置后，您可以设置用户登录时将被分配的默认角色，并调整会话超时设置。

  可用的默认角色包括：

  * Admin
  * Service Admin
  * Service Read Only
  * Member

  有关这些角色所对应权限的更多信息，请参阅 [Console roles and permissions](/cloud/security/console-roles)。

  ### 配置管理员用户

  :::note
  使用其他认证方式配置的用户会保留，直到您组织中的管理员将其移除。
  :::

  要通过 SAML 分配首个管理员用户：

  1. 登出 [ClickHouse Cloud](https://console.clickhouse.cloud)。
  2. 在您的身份提供商中，将该管理员用户分配给 ClickHouse 应用程序。
  3. 让该用户通过 [https://console.clickhouse.cloud/?connection=&#123;orgId&#125;](https://console.clickhouse.cloud/?connection=\{orgId})（快捷 URL）登录。这可以通过您在前面步骤中创建的书签完成。在用户首次登录之前，他们不会出现在 ClickHouse Cloud 中。
  4. 如果默认 SAML 角色不是 Admin，则用户可能需要登出并使用其原有的认证方式重新登录，以更新新 SAML 用户的角色。
     * 对于电子邮箱 + 密码帐户，请使用 `https://console.clickhouse.cloud/?with=email`。
     * 对于社交登录，请点击相应按钮（**Continue with Google** 或 **Continue with Microsoft**）。

  :::note
  上面 `?with=email` 中的 `email` 是字面参数值，而不是占位符。
  :::

  5. 再次登出，并通过快捷 URL 重新登录，以完成下面的最后一步。

  :::tip
  为减少步骤，您可以在初始阶段将 SAML 默认角色设置为 `Admin`。当管理员在您的身份提供商中被分配并首次登录后，他们可以将默认角色更改为其他值。
  :::

  ### 移除其他认证方式

  移除所有使用非 SAML 方式的用户，以完成集成，并将访问权限限制为仅来自您的身份提供商连接的用户。
</VerticalStepper>

### 配置 Okta SAML \\{#configure-okta-saml\\}

您需要在 Okta 中为每个 ClickHouse 组织配置两个 App Integration：一个 SAML 应用和一个用于保存直接链接的书签应用。

<details>
   <summary>  1. 创建用于管理访问的组  </summary>
   
   1. 以 **Administrator** 身份登录到您的 Okta 实例。

   2. 在左侧选择 **Groups**。

   3. 点击 **Add group**。

   4. 为该组输入名称和描述。此组将用于在 SAML 应用及其关联的书签应用之间保持用户一致。

   5. 点击 **Save**。

   6. 点击您创建的组的名称。

   7. 点击 **Assign people**，为需要访问此 ClickHouse 组织的用户分配该组。

</details>

<details>
   <summary>  2. 创建书签应用以实现用户无缝登录  </summary>
   
   1. 在左侧选择 **Applications**，然后选择 **Applications** 子标题。
   
   2. 点击 **Browse App Catalog**。
   
   3. 搜索并选择 **Bookmark App**。
   
   4. 点击 **Add integration**。
   
   5. 为应用选择标签。
   
   6. 输入 URL 为 `https://console.clickhouse.cloud/?connection={organizationid}`
   
   7. 转到 **Assignments** 选项卡，并添加您在上面创建的组。
   
</details>

<details>
   <summary>  3. 创建 SAML 应用以启用连接  </summary>
   
   1. 在左侧选择 **Applications**，然后选择 **Applications** 子标题。
   
   2. 点击 **Create App Integration**。
   
   3. 选择 SAML 2.0 并点击 Next。
   
   4. 为应用输入名称，勾选 **Do not display application icon to users** 旁边的复选框，然后点击 **Next**。 
   
   5. 使用以下值填充 SAML 设置屏幕。
   
      | 字段                          | 值 |
      |--------------------------------|-------|
      | Single Sign On URL             | 从控制台复制 Single Sign-On URL |
      | Audience URI (SP Entity ID)    | 从控制台复制 Service Provider Entity ID |
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
   
   11. 转到 **Assignments** 选项卡，并添加您在上面创建的组。
   
   12. 在新应用的 **Sign On** 选项卡上，点击 **Copy metadata URL** 按钮。 
   
   13. 返回 [将 metadata URL 添加到 SAML 配置](#add-metadata-url) 以继续该流程。
   
</details>

### 配置 Google SAML \\{#configure-google-saml\\}

您需要在 Google 中为每个组织配置一个 SAML 应用。如果使用多组织 SSO，必须向用户提供直接链接 (`https://console.clickhouse.cloud/?connection={organizationId}`)，以便他们添加书签。

<details>
   <summary>  创建 Google Web 应用  </summary>
   
   1. 转到您的 Google Admin 控制台 (admin.google.com)。

   <Image img={samlGoogleApp} size="md" alt="Google SAML 应用" force/>

   2. 点击 **Apps**，然后点击左侧的 **Web and mobile apps**。
   
   3. 从顶部菜单点击 **Add app**，然后选择 **Add custom SAML app**。
   
   4. 为应用输入名称并点击 **Continue**。
   
   5. 复制元数据 URL 并保存备用。
   
   7. 在下方输入 ACS URL 和 Entity ID。
   
      | 字段     | 值 |
      |-----------|-------|
      | ACS URL   | 从控制台复制 Single Sign-On URL |
      | Entity ID | 从控制台复制 Service Provider Entity ID |
   
   8. 勾选 **Signed response** 复选框。
   
   9. 为 Name ID Format 选择 **EMAIL**，并将 Name ID 保留为 **Basic Information > Primary email.**
   
   10. 点击 **Continue**。
   
   11. 输入以下属性映射:
       
      | 字段             | 值         |
      |-------------------|---------------|
      | Basic information | Primary email |
      | App attributes    | email         |
       
   13. 点击 **Finish**。
   
   14. 要启用该应用，请点击 **OFF** for everyone，并将设置更改为 **ON** for everyone。也可以通过选择屏幕左侧的选项，将访问权限限制为特定的组或组织单位。

   15. 返回 [将元数据 URL 添加到 SAML 配置](#add-metadata-url) 以继续流程。
       
</details>

### 配置 Azure (Microsoft) SAML \\{#configure-azure-microsoft-saml\\}

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
      | Identifier (Entity ID)    | 从控制台复制 Service Provider Entity ID |
      | Reply URL (Assertion Consumer Service URL) | 从控制台复制 Single Sign-On URL |
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
   
   12. 复制元数据 URL,然后返回到 [将元数据 URL 添加到 SAML 配置](#add-metadata-url) 以继续该流程。

</details>

### 配置 Duo SAML \\{#configure-duo-saml\\}

<details>
   <summary> 为 Duo 创建通用 SAML 服务提供商 </summary>
   
   1. 按照 [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic) 的说明操作。 
   
   2. 使用以下桥接属性映射：

      |  桥接属性  |  ClickHouse 属性  | 
      |:-------------------|:-----------------------|
      | Email Address      | email                  |
   
   3. 使用以下值更新您在 Duo 中的 Cloud 应用程序：

      |  字段    |  值                                     |
      |:----------|:-------------------------------------------|
      | Entity ID | 从控制台复制 Service Provider Entity ID |
      | Assertion Consumer Service (ACS) URL | 从控制台复制 Single Sign-On URL |
      | Service Provider Login URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. 复制 metadata URL，然后返回到 [将 metadata URL 添加到 SAML 配置](#add-metadata-url) 以继续流程。
   
</details>

## 工作原理 {#how-it-works}

### 使用 SAML SSO 的用户管理 \\{#user-management-with-saml-sso\\}

有关管理用户权限以及将访问限制为仅允许通过 SAML 连接访问的更多信息，请参阅[管理云用户](/cloud/security/manage-cloud-users)。

### 服务提供方发起的 SSO \\{#service-provider-initiated-sso\\}

我们只支持由服务提供方发起的 SSO。这意味着用户访问 `https://console.clickhouse.cloud`，输入其电子邮件地址后，将被重定向至 IdP 进行身份验证。已经通过你的 IdP 完成身份验证的用户，可以使用直接链接自动登录到你的组织，而无需在登录页面再次输入电子邮件地址。

### 多组织 SSO \\{#multi-org-sso\\}

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