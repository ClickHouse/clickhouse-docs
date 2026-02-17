---
sidebar_label: 'ClickHouse Cloud 청구 규정 준수'
slug: /manage/clickhouse-cloud-billing-compliance
title: 'ClickHouse Cloud 청구 규정 준수'
description: 'ClickHouse Cloud 청구 규정 준수를 설명하는 페이지'
keywords: ['청구 규정 준수', '종량제(pay-as-you-go)']
doc_type: 'guide'
---

import billing_compliance from '@site/static/images/cloud/manage/billing_compliance.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud 요금 청구 컴플라이언스 \{#clickhouse-cloud-billing-compliance\}



## 결제 규정 준수 \{#billing-compliance\}

ClickHouse Cloud를 사용하려면 조직에 활성 상태의 유효한 결제 수단이 구성되어 있어야 합니다.
30일 체험 기간이 종료되거나 체험 크레딧이 모두 소진되면(둘 중 먼저 발생하는 시점),
ClickHouse Cloud 사용을 계속하기 위한 결제 옵션은 다음과 같습니다:

| Billing option                                       | Description                                                                             |
|------------------------------------------------------|-----------------------------------------------------------------------------------------|
| [Direct PAYG](#direct-payg)                          | 조직에 유효한 신용카드를 추가하여 종량제(Pay-As-You-Go)로 결제합니다                           |
| [Marketplace PAYG](#cloud-marketplace-payg)          | 지원되는 Cloud 마켓플레이스 공급자를 통해 종량제(Pay-As-You-Go) 구독을 설정합니다          |
| [Committed spend contract](#committed-spend-contract) | 지원되는 Cloud 마켓플레이스를 통해 또는 직접 약정 지출 계약을 체결합니다 |

체험 기간이 종료되었는데 조직에 대해 어떤 결제 옵션도 구성되어 있지 않으면
모든 서비스가 중지됩니다. 2주가 지나도 여전히 결제 수단이
구성되지 않은 경우 모든 데이터가 삭제됩니다.

ClickHouse는 조직 단위로 서비스 요금을 청구합니다. 현재 결제 수단으로
결제를 처리할 수 없는 경우, 서비스 중단을 방지하기 위해 위의 세 가지 옵션
중 하나로 결제 수단을 반드시 업데이트해야 합니다. 선택한 결제 수단에 따라
달라지는 결제 규정에 대한 자세한 내용은 아래를 참조하십시오.

### 신용카드를 이용한 종량제 결제 \{#direct-payg\}

ClickHouse Cloud 사용 요금은 신용카드를 이용해 매월 후불 방식으로 결제할 수 있습니다.
신용카드를 추가하려면 다음 [지침](#add-credit-card)을 따르십시오.

ClickHouse의 월별 청구 주기는 조직 티어(Basic, Scale, Enterprise 중 하나)를
선택하고 조직 내에서 첫 번째 서비스를 생성한 날부터 시작됩니다.

등록된 신용카드는 일반적으로 월별 청구 주기 종료 시점에 청구되지만,
주기 중 누적 금액이 10,000달러(USD)에 도달하면 청구가 앞당겨질 수 있습니다
(결제 임계값에 대한 자세한 내용은 [여기](/cloud/billing/payment-thresholds)를 참조하십시오).

등록된 신용카드는 유효해야 하고, 만료되지 않았으며, 청구 금액 전체를
결제할 수 있을 만큼의 사용 가능 한도를 보유해야 합니다. 어떤 이유로든
전체 청구 금액을 청구하지 못한 경우, 다음과 같은 미납 인보이스 제한 사항이
즉시 적용됩니다:

* 레플리카당 최대 120 GiB까지로만 확장할 수 있습니다.
* 중지된 서비스를 시작할 수 없습니다.
* 새 서비스를 시작하거나 생성할 수 없습니다.

ClickHouse는 최대 30일간 조직에 대해 구성된 결제 수단으로 결제 처리를
시도합니다. 14일 이내에 결제가 성공하지 않으면 조직 내 모든 서비스가
중지됩니다. 30일 기간 종료 시점까지도 결제가 완료되지 않고 연장도
승인되지 않은 경우, 조직과 연관된 모든 데이터와 서비스가 삭제됩니다.

### Cloud 마켓플레이스를 통한 종량제 결제 \{#cloud-marketplace-payg\}

종량제(Pay-As-You-Go) 결제는 지원되는 Cloud 마켓플레이스
(AWS, GCP, Azure)를 통해 조직에 비용이 청구되도록 구성할 수도 있습니다.
Marketplace PAYG 결제에 가입하려면 다음
[지침](#marketplace-payg)을 따르십시오.

Direct PAYG를 통한 결제와 유사하게, ClickHouse에서의 Marketplace PAYG
월별 청구 주기는 조직 티어(Basic, Scale, Enterprise 중 하나)를 선택하고
조직 내에서 첫 번째 서비스를 생성한 날부터 시작됩니다.

다만, 마켓플레이스의 요구 사항으로 인해 종량제 사용 요금은 시간 단위로
보고됩니다. 인보이스는 해당 마켓플레이스와 체결한 계약 조건에 따라
발행되며, 일반적으로 달력 기준 월별 청구 주기를 따릅니다.

예를 들어, 1월 18일에 첫 번째 조직 서비스를 생성한 경우,
ClickHouse Cloud에서의 첫 번째 사용 청구 주기는 1월 18일부터
2월 17일 자정까지입니다. 그러나 Cloud 마켓플레이스로부터의 첫 번째
인보이스는 2월 초에 수신할 수 있습니다.

또한 PAYG 마켓플레이스 구독이 취소되거나 자동 갱신에 실패하는 경우,
조직에 등록된 신용카드가 있다면 해당 카드로 결제가 전환됩니다.
신용카드를 추가하려면 [지원팀에 문의](/about-us/support)하여
도움을 받으십시오. 유효한 신용카드를 제공하지 않은 경우,
[Direct PAYG](#direct-payg)에 대해 앞에서 설명한 것과 동일한
미납 인보이스 제한 사항이 적용되며, 여기에는 서비스 일시 중단과
최종적인 데이터 삭제가 포함됩니다.

### 약정 계약 기반 결제 \{#committed-spend-contract\}

조직은 약정 계약을 통해 다음과 같은 방식으로 크레딧을 구매할 수 있습니다:



1. 영업팀에 연락하여 ACH 또는 전신 송금 등의 결제 옵션으로 크레딧을 직접
   구매합니다. 결제 조건은 해당 주문서에 명시됩니다.
2. 영업팀에 연락하여 지원되는 Cloud 마켓플레이스(AWS, GCP, Azure 중 하나)의
   구독을 통해 크레딧을 구매합니다. 요금은 비공개 오퍼 수락 시 및 이후에는
   오퍼 조건에 따라 해당 마켓플레이스에 보고되지만, 실제 청구서는 그
   마켓플레이스와 체결한 계약의 조건에 따라 발행됩니다. 마켓플레이스를 통해
   결제하려면 다음 [지침](#marketplace-payg)을 따르십시오.

조직에 적용된 크레딧(예: 약정 계약 또는 환불을 통해 제공된 크레딧)은
주문서 또는 수락된 비공개 오퍼에 명시된 기간 동안 사용할 수 있습니다.
크레딧은 조직에서 최초로 조직 티어(Basic, Scale, Enterprise 중 하나)를
선택한 날짜를 기준으로 하는 청구 기간 동안, 크레딧이 부여된 날부터 사용되기
시작합니다.

조직이 Cloud 마켓플레이스 약정 계약을 사용하지 **않고** 크레딧을 모두
소진했거나 크레딧이 만료되면, 조직은 자동으로 종량제(Pay-As-You-Go, PAYG)
과금으로 전환됩니다. 이 경우, 조직에 등록된 신용카드가 있는 경우 해당
신용카드로 결제를 시도합니다.

조직이 Cloud 마켓플레이스 약정 계약을 사용하고 있고 크레딧을 모두
소진한 경우에도, 남은 구독 기간 동안 동일한 마켓플레이스를 통해 자동으로
PAYG 과금으로 전환됩니다. 다만, 구독이 갱신되지 않고 만료되는 경우에는
그 이후에 조직에 등록된 신용카드(있는 경우)를 사용하여 결제를 시도합니다.

두 경우 모두, 설정된 신용카드로 청구하지 못하는 경우에는 위에서 설명한
신용카드 기반 [종량제(PAYG)](#direct-payg) 과금의 미납 청구서 제한이 적용되며,
여기에는 서비스 중단이 포함됩니다. 약정 계약에서 PAYG 과금으로 전환하는 방법에
대한 자세한 내용은 [이용 약관](https://clickhouse.com/legal/agreements/terms-of-service)의 「Overconsumption」 절을 참고하십시오.
다만, 약정 계약 고객의 경우 데이터 삭제를 시작하기 전에 미납 청구서에 대해
별도로 연락을 드립니다. 데이터는 일정 기간이 지났다는 이유만으로 자동으로
삭제되지 않습니다.

기존 크레딧이 만료되거나 소진되기 전에 크레딧을 추가로 충전하고 싶다면
[당사에 문의](https://clickhouse.com/company/contact)하십시오.

### 신용카드로 결제하는 방법 \{#add-credit-card\}

ClickHouse Cloud UI의 Billing 섹션으로 이동하여 아래에 표시된 'Add Credit Card'
버튼을 클릭하여 설정을 완료하십시오. 궁금한 점이 있으면 [지원팀에 문의](/about-us/support)하여 도움을 받으십시오.

<Image img={billing_compliance} size="md" alt="신용카드를 추가하는 방법" />



## 마켓플레이스를 통한 결제 방법 \{#marketplace-payg\}

지원되는 마켓플레이스(AWS, GCP, Azure)를 통해 결제하려면,
도움이 필요할 때 [여기](/cloud/marketplace/marketplace-billing)에 안내된 단계를 따르십시오.
Cloud 마켓플레이스 청구와 관련된 문의 사항은 해당 Cloud 서비스 제공업체에 직접 문의하십시오.

마켓플레이스 청구 문제 해결을 위한 유용한 링크:
* [AWS Billing FAQs](https://aws.amazon.com/aws-cost-management/aws-billing/faqs/)
* [GCP Billing FAQs](https://cloud.google.com/compute/docs/billing-questions)
* [Azure Billing FAQs](https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-faq)
