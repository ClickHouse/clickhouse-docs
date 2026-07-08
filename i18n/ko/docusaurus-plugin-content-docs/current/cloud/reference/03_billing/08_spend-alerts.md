---
sidebar_label: '지출 알림'
slug: /cloud/manage/billing/spend-alerts
title: '조직 지출 알림 구성'
description: '청구 기간 동안 설정된 임계값을 기준으로 ClickHouse Cloud 사용량을 모니터링할 수 있도록 지출 알림을 구성합니다.'
keywords: ['청구', '지출 알림', '사용량 임계값', '알림', '비용 모니터링', '조직 청구']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import spend_alerts_actions from '@site/static/images/cloud/reference/billing/spend-alerts-actions.png';
import spend_alerts_config from '@site/static/images/cloud/reference/billing/spend-alerts-config.png';

지출 알림은 청구 기간 내에 조직의 사용량이 설정된 임계값에 도달하면 알려 주므로, 예상치 못한 청구를 방지할 수 있습니다. 이 기능은 알림만 전송합니다. 자동 청구가 발생하는 임계값은 [임계값](/cloud/billing/payment-thresholds)을 참조하십시오.

## 사전 요구사항 \{#prerequisites\}

* 지출 알림을 구성하고 확인하려면 **Organization Admin** 또는 **Billing Admin** 역할이 있어야 합니다.

## 지출 알림의 작동 방식 \{#how-spend-alerts-work\}

* 알림은 청구 기간 내 총 사용량을 기준으로 하며, 새 주기가 시작될 때마다 재설정됩니다.
* 알림은 매시간 해당 시점에 계산된 총 사용량을 기준으로 트리거되므로, 임계값을 초과한 후에 발생합니다.

:::note 지출 알림은 사용량에 상한을 두지 않습니다
지출 알림이 100%에 도달해도 사용이 제한되거나 상한이 적용되지는 않으며, 지출은 100% 임계값을 초과한 이후에도 계속 누적됩니다.
:::

## 지출 알림 설정 \{#set-up-spend-alert\}

<VerticalStepper headerLevel="h3">
  ### 지출 알림 대화 상자 열기 \{#open-spend-alerts-dialog\}

  1. ClickHouse Cloud 콘솔에서 **Organization &gt; Billing**으로 이동합니다.
  2. **Actions &gt; Add spend alerts**를 클릭합니다.

  <Image img={spend_alerts_actions} alt="Billing 페이지에서 Actions 메뉴를 열고 Add spend alerts를 강조 표시한 모습" size="lg" />

  ### 알림 구성 및 저장 \{#configure-and-save\}

  1. 청구 기간당 달러 또는 크레딧 기준의 지출 알림 금액을 입력합니다.
  2. 알림 채널(**Email**, **UI**, **Slack**)을 하나 이상 선택합니다.
  3. **Save**를 클릭합니다.

  <Image img={spend_alerts_config} alt="지출 한도, 자동 임계값 알림, 알림 채널이 표시된 조직 지출 알림 대화 상자" size="md" />
</VerticalStepper>

## 자동 임계값 알림 \{#threshold-alerts\}

설정된 지출 알림 금액에 따라 3개의 알림이 자동으로 생성되고 트리거됩니다:

| 임계값      | 트리거          | 예시 ($10 알림) |
| -------- | ------------ | ----------- |
| **50%**  | 지출액의 50%에 도달 | $5          |
| **75%**  | 지출액의 75%에 도달 | $7.50       |
| **100%** | 설정한 지출액에 도달  | $10         |

## 알림 채널 \{#notification-channels\}

| 채널        | 설명                                             |
| --------- | ---------------------------------------------- |
| **Email** | 설정된 이메일 주소로 알림을 보냅니다. 편집 아이콘을 클릭하여 수신자를 변경하세요. |
| **UI**    | ClickHouse Cloud 콘솔에 알림을 표시합니다.                |
| **Slack** | Slack 채널로 알림을 보냅니다. 편집 아이콘을 클릭하여 설정하세요.        |