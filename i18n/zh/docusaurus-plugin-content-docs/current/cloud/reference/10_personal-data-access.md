---
sidebar_label: '个人数据访问'
slug: /cloud/manage/personal-data-access
title: '个人数据访问'
description: '作为注册用户，ClickHouse 允许您查看和管理您的个人账户数据，包括联系信息。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '个人数据', 'DSAR', '数据主体访问请求', '隐私政策', 'GDPR']
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';


## 简介 {#intro}

作为注册用户，ClickHouse 允许您查看和管理您的个人账户数据，包括联系信息。根据您的角色权限，这还可能包括访问您所在组织中其他用户的联系信息、API 密钥详细信息以及其他相关信息。您可以通过 ClickHouse 控制台以自助方式直接管理这些信息。

**什么是数据主体访问请求（Data Subject Access Request，DSAR）**

根据您所在的地区，适用法律还可能就 ClickHouse 所持有的关于您的个人数据（“数据主体权利”）赋予您额外权利，具体如 ClickHouse 隐私政策中所述。行使数据主体权利的流程称为数据主体访问请求（Data Subject Access Request，DSAR）。

**个人数据的范围**

请查阅 ClickHouse 的隐私政策，了解 ClickHouse 收集的个人数据及其可能的使用方式的详细信息。



## 自助服务 {#self-service}

默认情况下，ClickHouse 允许用户直接在 ClickHouse 控制台中查看其个人数据。

以下是 ClickHouse 在账户设置和服务使用过程中收集的数据摘要，以及在 ClickHouse 控制台中可以查看特定个人数据的位置说明。

| 位置/URL | 描述 | 个人数据 |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | 账户注册 | 电子邮件（email）、密码（password） |
| https://console.clickhouse.cloud/profile | 用户基本资料 | 姓名（name）、电子邮件（email） |
| https://console.clickhouse.cloud/organizations/OrgID/members | 组织中的用户列表 | 姓名（name）、电子邮件（email） |
| https://console.clickhouse.cloud/organizations/OrgID/keys | API key 列表及其创建者 | 电子邮件（email） |
| https://console.clickhouse.cloud/organizations/OrgID/audit | 活动日志，按单个用户列出操作 | 电子邮件（email） |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 账单信息和发票 | 账单地址（billing address）、电子邮件（email） |
| https://console.clickhouse.cloud/support | 与 ClickHouse 支持团队的交互记录 | 姓名（name）、电子邮件（email） |

注意：带有 `OrgID` 的 URL 需要更新为与您特定账户相对应的 `OrgID`。

### 现有客户 {#current-customers}

如果您已经在我们这里拥有账户，但通过自助服务仍未解决您的个人数据问题，您可以根据隐私政策提交数据主体访问请求（Data Subject Access Request，DSAR）。为此，请登录您的 ClickHouse 账户并创建一个[支持工单](https://console.clickhouse.cloud/support)。这有助于我们验证您的身份并简化处理您请求的流程。

请务必在支持工单中包含以下详细信息：

| 字段 | 在请求中需要包含的内容 |
|-------------|---------------------------------------------------|
| Subject     | Data Subject Access Request (DSAR)                |
| Description | 您希望 ClickHouse 查找、收集和/或提供的相关信息的详细说明。 |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloud 中的支持工单表单" border />

### 无账户的个人用户 {#individuals-without-an-account}

如果您在我们这里没有账户，并且上述自助服务仍未解决您的个人数据问题，同时您希望根据隐私政策提交数据主体访问请求，您可以通过电子邮件将这些请求发送至 [privacy@clickhouse.com](mailto:privacy@clickhouse.com)。



## 身份验证 {#identity-verification}

如果您通过电子邮件提交数据主体访问请求，我们可能会向您索取特定信息，以帮助我们确认您的身份并处理您的请求。适用法律可能要求或允许我们不予满足您的请求。如果我们拒绝您的请求，在不违反法律限制的前提下，我们会向您说明原因。

如需更多信息，请查阅 [ClickHouse 隐私政策](https://clickhouse.com/legal/privacy-policy)。
