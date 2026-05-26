---
sidebar_label: '账户关闭'
slug: /cloud/manage/close_account
title: '账户关闭与删除'
description: '我们理解有时会遇到需要关闭账户的情况。本指南将帮助您完成这一流程。'
keywords: ['ClickHouse Cloud', '账户关闭', '删除账户', '云账户管理', '账户删除']
doc_type: 'guide'
---

## 账户关闭和删除 \{#account-close--deletion\}

我们的目标是帮助您在项目中取得成功。如果您有本网站未能解答的问题，或在评估某个特殊使用场景时需要帮助，请通过 [support@clickhouse.com](mailto:support@clickhouse.com) 与我们联系。

我们理解有时可能会遇到需要关闭账户的情况。本指南将帮助您完成整个流程。

## 关闭账户与删除账户的区别 \{#close-vs-delete\}
客户在关闭账户后，仍可重新登录以查看使用情况、账单以及账户级活动日志。这样可以让你轻松访问对多种用途有用的详细信息，例如记录使用案例，或在年末为税务目的下载发票。
你也会继续收到产品更新通知，以便了解你可能一直在等待的某个功能是否已经可用。此外，已关闭的账户可在任何时间重新开启以启动新服务。

申请删除个人数据的客户需注意，此过程不可逆转。账户及其相关信息将不再可用。你将不会收到产品更新，也不能重新开启该账户。此操作不会影响任何新闻通讯订阅。

新闻通讯订阅者可以在任何时间通过新闻通讯邮件底部的退订链接取消订阅，而无需关闭账户或删除其信息。

## 账户关闭前的准备 \{#preparing-for-closure\}

在申请账户关闭之前，请先完成以下准备步骤。

<VerticalStepper headerLevel="h3">
  ### 1. 导出所有需要保留的数据。

  > 导出服务内容<br />
  > 导出控制台日志<br />
  > 导出数据库日志<br />

  ### 2. 停止并删除您的服务。

  > 这将避免您的账户继续产生额外费用

  ### 3. 移除除将申请账户关闭的管理员之外的所有用户。

  > 这样可以防止账户发生可能阻碍关闭的意外活动

  ### 4. 查看“Usage”和“Billing”选项卡，确认所有费用均已支付。

  > 我们无法关闭仍有未结清余额的账户。
</VerticalStepper>

## 申请关闭账户

我们必须对关闭和删除请求进行身份验证。为确保您的请求能够尽快处理，请按照以下步骤操作。

1. 登录您的 clickhouse.cloud 账户。
2. 完成上文 *Preparing for Closure* 部分中所有剩余的步骤。
3. 点击帮助按钮（屏幕右上角的问号图标）。
4. 在 “Support” 下点击 “Create case”。
5. 在 “Create new case” 界面中输入以下内容：

```text
Priority: Severity 3
Subject: Please close my ClickHouse account
Description: We would appreciate it if you would share a brief note about why you are cancelling.
```

5. 点击“Create new case”
6. 我们将关闭您的账户，并在完成后向您发送确认邮件。


## 请求删除您的个人数据 {#request-personal-data-deletion}

请注意，只有账户管理员可以向 ClickHouse 请求删除个人数据。如果您不是账户管理员，请联系
您的 ClickHouse 账户管理员，请其代您提交将您从该账户中移除的请求。

要请求删除数据，请按照上文 “Request Account Closure”（请求关闭账户） 中的步骤操作。在填写工单信息时，将主题更改为：
“Please close my ClickHouse account and delete my personal data.”

我们将在 30 天内完成个人数据删除请求。