---
sidebar_label: '결제 임계값'
slug: /cloud/billing/payment-thresholds
title: '결제 임계값'
description: 'ClickHouse Cloud의 결제 임계값과 자동 청구서 발행에 대한 안내.'
keywords: ['결제', '결제 임계값', '자동 청구서 발행', '청구서']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import billing_1 from '@site/static/images/cloud/reference/billing_payment_threshhold.png';
import billing_2 from '@site/static/images/cloud/reference/billing_payment_threshhold_2.png';

## 임계값 \{#threshholds\}

종량제 결제 고객이고 청구 기간 동안 ClickHouse Cloud에 대한 청구 금액이 1,000달러(USD)에 도달하거나 이에 상응하는 금액이 되는 경우, 조직에 설정된 결제 수단으로 자동 결제가 진행됩니다.

:::tip
첫 번째 인보이스 결제가 성공적으로 완료되면 임계값은 5,000달러(USD)로 상향됩니다. 두 번째 인보이스 결제가 성공적으로 완료되면 임계값은 10,000달러(USD)로 상향됩니다. 결제 임계값 금액을 조정하려면 [지원팀에 문의](mailto:support@clickhouse.com)하십시오.
:::

자동 결제가 실패하면 14일의 유예 기간 이후 서비스가 일시 중지됩니다.
하나의 청구 기간 동안 여러 인보이스를 받는 경우, 모든 인보이스는 수령 즉시 납부해야 하며, 이를 모두 납부해야 ClickHouse Cloud 조직의 [컴플라이언스](/manage/clickhouse-cloud-billing-compliance)를 유지할 수 있습니다.

자동 결제가 실패한 경우, 설정된 신용카드에 문제가 있거나, 신용카드에 대한 e-mandate를 설정하지 않았거나, 신용카드가 반복 온라인 거래를 위한 e-mandate 처리를 규정한 인도준비은행(Reserve Bank of India, RBI) 프레임워크를 준수하지 않기 때문일 수 있습니다.
신용카드가 RBI 요구 사항을 충족하지 않는 경우, RBI 규정을 준수하는 새 결제 수단을 추가하거나 카드에 e-mandate를 설정할 수 있을 때까지 수동 결제를 계속해야 합니다.

아래 예시는 Cloud 콘솔의 Billing UI를 보여줍니다:

<Image img={billing_1} size="sm" alt="UI에서 결제 관련 메뉴를 찾는 위치" />

<Image img={billing_2} size="lg" alt="인보이스" />

위 예시에서 볼 수 있듯이, 2월 28일~3월 31일 청구 기간 동안 한도 인보이스가 한 차례 발행되었고, 이후 같은 청구 기간에 1,000달러를 초과한 나머지 사용량에 대해 또 다른 인보이스가 발행되었습니다.

## 임계값 알림 \{#threshholds-notifications\}

조직의 사용 금액이 임계값의 90%에 도달하고, 청구 기간 중간에 임계값을 초과할 것으로 예상되는 경우 조직에 연결된 청구 담당자 이메일 주소로 알림 이메일이 발송됩니다.
임계값을 초과하면 이메일 알림과 함께 청구서도 수신하게 됩니다.

:::note
임계값 알림은 현재 후불(PAYG)로 청구되는 조직에만 지원됩니다
:::