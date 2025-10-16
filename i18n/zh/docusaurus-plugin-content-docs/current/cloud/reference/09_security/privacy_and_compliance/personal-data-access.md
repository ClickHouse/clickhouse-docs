---
'sidebar_label': '个人数据访问'
'slug': '/cloud/security/personal-data-access'
'title': '个人数据访问'
'description': '作为注册用户，ClickHouse 允许您查看和管理您的个人账户数据，包括联系信息。'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';

## Intro {#intro}

作为注册用户，ClickHouse 允许您查看和管理个人账户数据，包括联系信息。根据您的角色，这可能还包括访问您组织中其他用户的联系信息、API 密钥详细信息和其他相关信息。您可以通过 ClickHouse 控制台以自助的方式直接管理这些详细信息。

**什么是数据主体访问请求 (DSAR)**

根据您所在的位置，适用法律可能还会赋予您对 ClickHouse 持有的个人数据的额外权利（数据主体权利），具体如下所述 ClickHouse 隐私政策。 行使数据主体权利的过程被称为数据主体访问请求 (DSAR)。

**个人数据的范围**

请查看 ClickHouse 的隐私政策，了解 ClickHouse 收集的个人数据及其用途。

## 自助服务 {#self-service}

默认情况下，ClickHouse 使用户能够直接从 ClickHouse 控制台查看其个人数据。

以下是 ClickHouse 在账户设置和服务使用过程中收集的数据摘要，以及在 ClickHouse 控制台中可以查看特定个人数据的位置。

| 位置/网址                                      | 描述                          | 个人数据                           |
|-----------------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | 账户注册                      | email, password                      |
| https://console.clickhouse.cloud/profile | 一般用户个人资料详细信息     | name, email                         |
| https://console.clickhouse.cloud/organizations/OrgID/members | 组织中的用户列表               | name, email                         |
| https://console.clickhouse.cloud/organizations/OrgID/keys | API 密钥列表及创建者           | email                               |
| https://console.clickhouse.cloud/organizations/OrgID/audit | 活动日志，列出个别用户的操作   | email                               |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 账单信息和发票                | billing address, email              |
| https://console.clickhouse.cloud/support | 与 ClickHouse 支持的互动      | name, email                         |

注意：带有 `OrgID` 的网址需要更新，以反映您特定账户的 `OrgID`。

### 当前客户 {#current-customers}

如果您在我们这里有账户，而自助服务选项未解决您的个人数据问题，您可以根据隐私政策提交数据主体访问请求。为此，登录您的 ClickHouse 账户并打开一个 [支持案例](https://console.clickhouse.cloud/support)。 这有助于我们验证您的身份并简化处理请求的过程。

请确保在您的支持案例中包含以下详细信息：

| 字段      | 请求中要包含的文本                         |
|-----------|-----------------------------------|
| 主题      | 数据主体访问请求 (DSAR)              |
| 描述      | 您希望 ClickHouse 查找、收集和/或提供的信息的详细描述。 |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloud 中的支持案例表单" border />

### 没有账户的个人 {#individuals-without-an-account}

如果您没有与我们建立账户，且上述自助服务选项未解决您的个人数据问题，并希望根据隐私政策提出数据主体访问请求，您可以通过电子邮件向 [privacy@clickhouse.com](mailto:privacy@clickhouse.com) 提交这些请求。

## 身份验证 {#identity-verification}

如果您通过电子邮件提交数据主体访问请求，我们可能会向您请求特定信息，以帮助我们确认您的身份并处理您的请求。适用法律可能要求或允许我们拒绝您的请求。如果我们拒绝您的请求，我们会告知您原因，但受法律限制。

有关更多信息，请查看 [ClickHouse 隐私政策](https://clickhouse.com/legal/privacy-policy)
