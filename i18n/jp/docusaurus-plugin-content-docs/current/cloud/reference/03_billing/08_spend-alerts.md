---
sidebar_label: '支出アラート'
slug: /cloud/manage/billing/spend-alerts
title: '組織の支出アラートを設定する'
description: '請求期間内の閾値に対する ClickHouse Cloud の使用量を監視するために、支出アラートを設定します。'
keywords: ['請求', '支出アラート', '使用量の閾値', '通知', 'コスト監視', '組織の請求']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import spend_alerts_actions from '@site/static/images/cloud/reference/billing/spend-alerts-actions.png';
import spend_alerts_config from '@site/static/images/cloud/reference/billing/spend-alerts-config.png';

Spend alerts は、請求期間内に組織の利用量が設定した閾値に達すると通知し、想定外の請求を防ぐのに役立ちます。通知を送信するだけで、自動請求は行いません。自動請求をトリガーする閾値については、[支払いしきい値](/cloud/billing/payment-thresholds)を参照してください。

## 前提条件 \{#prerequisites\}

* 支出アラートを設定および表示するには、**Organization Admin** または **Billing Admin** ロールが必要です。

## 支出アラートの仕組み \{#how-spend-alerts-work\}

* アラートは請求期間内の総使用量に基づき、各期間の開始時にリセットされます。
* アラートは毎時、その時点で算出された総使用量に基づいて評価されるため、閾値を超えると発報されます。

:::note 支出アラートは使用量を制限しません
支出アラートが 100% に達しても、使用量が制限されたり上限が設定されたりすることはありません。支出は 100% の閾値を超えても引き続き積み上がります。
:::

## 支出アラートを設定する \{#set-up-spend-alert\}

<VerticalStepper headerLevel="h3">
  ### 支出アラートのダイアログを開く \{#open-spend-alerts-dialog\}

  1. ClickHouse Cloud コンソールで **Organization &gt; Billing** に移動します。
  2. **Actions &gt; Add spend alerts** をクリックします。

  <Image img={spend_alerts_actions} alt="Actions メニューを開き、Add spend alerts が強調表示された Billing ページ" size="lg" />

  ### アラートを設定して保存する \{#configure-and-save\}

  1. 請求期間あたりのドルまたはクレジットで、支出アラートの金額を入力します。
  2. 通知チャネルとして **Email**、**UI**、および/または **Slack** を選択します。
  3. **Save** をクリックします。

  <Image img={spend_alerts_config} alt="支出上限、自動閾値アラート、通知チャネルを含む Organization の支出アラートダイアログ" size="md" />
</VerticalStepper>

## 自動閾値アラート \{#threshold-alerts\}

設定した支出アラート金額に応じて、3 つのアラートが自動的に作成され、トリガーされます。

| 閾値       | トリガー              | 例 ($10 のアラート)  |
| -------- | ----------------- | -------------- |
| **50%**  | 支出額の半分に達した時       | $5             |
| **75%**  | 支出額の 4 分の 3 に達した時 | $7.50          |
| **100%** | 支出額の全額に達した時       | $10            |

## 通知チャネル \{#notification-channels\}

| チャネル      | 説明                                                 |
| --------- | -------------------------------------------------- |
| **Email** | 設定されたメールアドレスにアラートを送信します。受信者を変更するには、編集アイコンをクリックします。 |
| **UI**    | ClickHouse Cloudコンソールにアラートを表示します。                  |
| **Slack** | Slackチャンネルにアラートを送信します。設定するには、編集アイコンをクリックします。       |