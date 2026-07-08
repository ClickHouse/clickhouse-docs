---
sidebar_label: '支出告警'
slug: /cloud/manage/billing/spend-alerts
title: '配置组织支出告警'
description: '配置支出告警，以便在一个计费周期内根据阈值监控 ClickHouse Cloud 使用量。'
keywords: ['计费', '支出告警', '使用量阈值', '通知', '成本监控', '组织计费']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import spend_alerts_actions from '@site/static/images/cloud/reference/billing/spend-alerts-actions.png';
import spend_alerts_config from '@site/static/images/cloud/reference/billing/spend-alerts-config.png';

支出告警会在您的组织在一个计费周期内的用量达到已配置阈值时通知您，帮助您避免意外收费。它们仅发送通知；如需了解会触发自动开票的阈值，请参见[支付阈值](/cloud/billing/payment-thresholds)。

## 前置条件 \{#prerequisites\}

* 你必须具有 **Organization Admin** 或 **Billing Admin** 角色，才能配置和查看支出告警。

## 支出告警的工作原理 \{#how-spend-alerts-work\}

* 告警基于一个计费周期内的总使用量，并在每个新周期开始时重置。
* 告警每小时触发一次，依据该时刻计算出的总使用量；因此，只有在超出阈值后才会触发。

:::note 支出告警不会限制使用
支出告警达到 100% 时，不会限制或封顶您的使用量——支出在超过 100% 阈值后仍会继续累计。
:::

## 设置支出告警 \{#set-up-spend-alert\}

<VerticalStepper headerLevel="h3">
  ### 打开支出告警对话框 \{#open-spend-alerts-dialog\}

  1. 在 ClickHouse Cloud 控制台中，前往 **Organization &gt; Billing**。
  2. 点击 **Actions &gt; Add spend alerts**。

  <Image img={spend_alerts_actions} alt="Billing 页面，Actions 菜单已展开，且 Add spend alerts 已高亮显示" size="lg" />

  ### 配置并保存告警 \{#configure-and-save\}

  1. 输入支出告警金额，单位为美元或每个计费周期的 credits。
  2. 选择通知渠道：**Email**、**UI** 和/或 **Slack**。
  3. 点击 **Save**。

  <Image img={spend_alerts_config} alt="组织支出告警对话框，包含支出上限、自动阈值告警和通知渠道" size="md" />
</VerticalStepper>

## 自动阈值告警 \{#threshold-alerts\}

系统会根据您配置的支出告警金额，自动创建三条告警，并在达到相应金额时触发：

| 阈值       | 触发条件     | 示例 ($10 告警)  |
| -------- | -------- | ------------ |
| **50%**  | 支出达到一半   | $5           |
| **75%**  | 支出达到四分之三 | $7.50        |
| **100%** | 支出达到全部   | $10          |

## 通知渠道 \{#notification-channels\}

| 渠道        | 描述                              |
| --------- | ------------------------------- |
| **Email** | 将告警发送到已配置的电子邮件地址。点击编辑图标可更改收件地址。 |
| **UI**    | 在 ClickHouse Cloud 控制台中显示告警。    |
| **Slack** | 将告警发送到 Slack 频道。点击编辑图标进行配置。     |