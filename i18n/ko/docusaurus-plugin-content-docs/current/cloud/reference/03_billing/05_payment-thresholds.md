---
sidebar_label: '결제 임계값'
slug: /cloud/billing/payment-thresholds
title: '결제 임계값'
description: 'ClickHouse Cloud의 결제 임계값과 자동 청구서 발행에 대한 안내.'
keywords: ['결제', '결제 임계값', '자동 청구서 발행', '청구서']
doc_type: 'guide'
---

# 결제 임계값 \{#payment-thresholds\}

ClickHouse Cloud의 청구 기간 동안 청구 금액이 미화 $10,000 또는 그에 상응하는 금액에 도달하면 결제 수단에서 자동으로 결제가 이루어집니다. 결제가 실패하면 유예 기간 이후 서비스가 일시 중단되거나 종료됩니다.

:::note
이 결제 임계값은 선지출 약정 계약이 있거나 ClickHouse와 별도의 계약 조건을 체결한 고객에게는 적용되지 않습니다.
:::

조직의 사용 금액이 결제 임계값의 90%에 도달하고, 청구 기간 중에 결제 임계값을 초과할 것으로 예상되는 경우 조직에 연결된 청구 이메일 주소로 알림 이메일이 발송됩니다. 결제 임계값을 초과하면 이메일 알림과 함께 인보이스도 수신하게 됩니다.

이 결제 임계값은 고객 요청 또는 ClickHouse 재무(Finance) 팀에 의해 미화 $10,000 미만으로 조정될 수 있습니다. 질문이 있는 경우 support@clickhouse.com으로 문의하여 자세한 내용을 확인하십시오.