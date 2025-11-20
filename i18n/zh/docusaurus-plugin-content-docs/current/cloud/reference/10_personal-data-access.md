---
sidebar_label: '个人数据访问'
slug: /cloud/manage/personal-data-access
title: '个人数据访问'
description: '作为注册用户，你可以在 ClickHouse 中查看和管理你的个人账户数据，包括联系信息。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'personal data', 'DSAR', 'data subject access request', 'privacy policy', 'GDPR']
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';


## 简介 {#intro}

作为注册用户,您可以通过 ClickHouse 查看和管理个人账户数据,包括联系信息。根据您的角色权限,您还可能访问组织内其他用户的联系信息、API 密钥详情及其他相关信息。您可以直接通过 ClickHouse 控制台自助管理这些信息。

**什么是数据主体访问请求 (DSAR)**

根据您所在地区的适用法律,您可能对 ClickHouse 持有的您的个人数据享有额外权利(数据主体权利),具体说明请参见 ClickHouse 隐私政策。行使数据主体权利的流程称为数据主体访问请求 (DSAR)。

**个人数据范围**

有关 ClickHouse 收集的个人数据详情及其使用方式,请查阅 ClickHouse 隐私政策。


## 自助服务 {#self-service}

默认情况下,ClickHouse 允许用户直接从 ClickHouse 控制台查看其个人数据。

以下汇总了 ClickHouse 在账户设置和服务使用过程中收集的数据,以及可在 ClickHouse 控制台中查看特定个人数据的位置信息。

| 位置/URL                                                 | 描述                                       | 个人数据          |
| ------------------------------------------------------------ | ------------------------------------------------- | ---------------------- |
| https://auth.clickhouse.cloud/u/signup/                      | 账户注册                              | 电子邮件、密码        |
| https://console.clickhouse.cloud/profile                     | 用户配置文件详情                      | 姓名、电子邮件            |
| https://console.clickhouse.cloud/organizations/OrgID/members | 组织中的用户列表                  | 姓名、电子邮件            |
| https://console.clickhouse.cloud/organizations/OrgID/keys    | API 密钥列表及其创建者             | 电子邮件                  |
| https://console.clickhouse.cloud/organizations/OrgID/audit   | 活动日志,列出各用户的操作 | 电子邮件                  |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 账单信息和发票                  | 账单地址、电子邮件 |
| https://console.clickhouse.cloud/support                     | 与 ClickHouse 支持团队的交互              | 姓名、电子邮件            |

注意:包含 `OrgID` 的 URL 需要更新为您账户的实际 `OrgID`。

### 现有客户 {#current-customers}

如果您拥有我们的账户且自助服务选项未能解决您的个人数据问题,您可以根据隐私政策提交数据主体访问请求。为此,请登录您的 ClickHouse 账户并创建[支持工单](https://console.clickhouse.cloud/support)。这有助于我们验证您的身份并简化处理流程。

请务必在您的支持工单中包含以下详细信息:

| 字段       | 请求中应包含的文本                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------- |
| 主题     | 数据主体访问请求 (DSAR)                                                                  |
| 描述 | 您希望 ClickHouse 查找、收集和/或提供的信息的详细描述。 |

<Image
  img={support_case_form}
  size='sm'
  alt='ClickHouse Cloud 中的支持工单表单'
  border
/>

### 没有账户的个人 {#individuals-without-an-account}

如果您没有我们的账户且上述自助服务选项未能解决您的个人数据问题,并且您希望根据隐私政策提交数据主体访问请求,您可以通过电子邮件将请求发送至 [privacy@clickhouse.com](mailto:privacy@clickhouse.com)。


## 身份验证 {#identity-verification}

如果您通过电子邮件提交数据主体访问请求,我们可能会要求您提供特定信息,以便确认您的身份并处理您的请求。根据适用法律的要求或许可,我们可能会拒绝您的请求。如果我们拒绝您的请求,我们将在法律允许的范围内告知您拒绝的原因。

如需了解更多信息,请查阅 [ClickHouse 隐私政策](https://clickhouse.com/legal/privacy-policy)
