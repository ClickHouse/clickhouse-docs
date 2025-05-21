---
'sidebar_label': 'Personal Data Access'
'slug': '/cloud/security/personal-data-access'
'title': 'Personal Data Access'
'description': 'As a registered user, ClickHouse allows you to view and manage your
  personal account data, including contact information.'
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';

## 介绍 {#intro}

作为注册用户，ClickHouse 允许您查看和管理您的个人帐户数据，包括联系方式。根据您的角色，这可能还包括访问您所在组织中其他用户的联系方式、API 密钥详情和其他相关信息。您可以通过 ClickHouse 控制台自行管理这些详细信息。

**数据主体访问请求 (DSAR) 是什么**

根据您的所在位置，适用的法律可能还会为您提供与 ClickHouse 持有的个人数据相关的额外权利（数据主体权利），如 ClickHouse 隐私政策中所述。行使数据主体权利的过程称为数据主体访问请求 (DSAR)。

**个人数据范围**

请查看 ClickHouse 的隐私政策以获取有关 ClickHouse 收集的个人数据及其可能用途的详细信息。

## 自助服务 {#self-service}

默认情况下，ClickHouse 允许用户直接从 ClickHouse 控制台查看其个人数据。

以下是 ClickHouse 在帐户设置和服务使用期间收集的数据的摘要，以及在 ClickHouse 控制台中可以查看特定个人数据的位置。

| 位置/URL | 描述 | 个人数据 |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | 帐户注册 | email, password |
| https://console.clickhouse.cloud/profile | 一般用户配置文件详细信息 | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | 组织中的用户列表 | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | API 密钥列表及其创建者 | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | 活动日志，列出各个用户的操作 | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 账单信息和发票 | billing address, email |
| https://console.clickhouse.cloud/support | 与 ClickHouse 支持的互动 | name, email |

注意：包含 `OrgID` 的 URL 需要更新为反映您特定帐户的 `OrgID`。

### 当前客户 {#current-customers}

如果您与我们有帐户且自助服务选项未能解决您的个人数据问题，您可以根据隐私政策提交数据主体访问请求。为此，请登录您的 ClickHouse 帐户并打开一个 [支持案例](https://console.clickhouse.cloud/support)。这帮助我们验证您的身份并简化处理您的请求的流程。

请确保在您的支持案例中包含以下详细信息：

| 字段 | 请求中包含的文本 |
|-------------|---------------------------------------------------|
| 主题       | 数据主体访问请求 (DSAR)                        |
| 描述       | 您希望 ClickHouse 查找、收集和/或提供的信息的详细描述。 |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloud 中的支持案例表单" border />

### 没有帐户的个人 {#individuals-without-an-account}

如果您没有与我们创建帐户，且上述自助服务选项未能解决您的个人数据问题，并且您希望依据隐私政策提出数据主体访问请求，您可以通过电子邮件将这些请求发送至 [privacy@clickhouse.com](mailto:privacy@clickhouse.com)。

## 身份验证 {#identity-verification}

如果您通过电子邮件提交数据主体访问请求，我们可能会向您请求特定信息，以帮助我们确认您的身份并处理您的请求。适用的法律可能要求或允许我们拒绝您的请求。如果我们拒绝您的请求，我们会告知您原因，但受法律限制。

有关更多信息，请查看 [ClickHouse 隐私政策](https://clickhouse.com/legal/privacy-policy)
