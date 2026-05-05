---
slug: /cloud/marketplace/marketplace-billing
title: '마켓플레이스 과금'
description: 'AWS, GCP, Azure 마켓플레이스를 통해 ClickHouse Cloud를 구독할 수 있습니다.'
keywords: ['aws', 'azure', 'gcp', 'google cloud', 'marketplace', 'billing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import marketplace_signup_and_org_linking from '@site/static/images/cloud/manage/billing/marketplace/marketplace_signup_and_org_linking.png'

AWS, GCP, Azure 마켓플레이스를 통해 ClickHouse Cloud를 구독할 수 있습니다. 이를 통해 기존 클라우드 제공자의 청구 체계를 통해 ClickHouse Cloud 사용료를 결제할 수 있습니다.

마켓플레이스에서 종량제(pay-as-you-go, PAYG)를 사용하거나 ClickHouse Cloud에 대한 약정 계약을 체결할 수 있습니다. 청구는 클라우드 제공자가 처리하며, 모든 클라우드 서비스에 대한 청구서를 한 번에 받아볼 수 있습니다.

* [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)


## 자주 묻는 질문 \{#faqs\}

### 내 조직이 마켓플레이스 청구에 연결되어 있는지 어떻게 확인할 수 있습니까?​ \{#how-can-i-verify-that-my-organization-is-connected-to-marketplace-billing\}

ClickHouse Cloud 콘솔에서 **Billing**으로 이동하십시오. **Payment details** 섹션에 마켓플레이스 이름과 링크가 표시되는 것을 확인할 수 있습니다.

### 기존 ClickHouse Cloud 사용자입니다. AWS / GCP / Azure 마켓플레이스를 통해 ClickHouse Cloud를 구독하면 어떻게 되나요?​ \{#i-am-an-existing-clickhouse-cloud-user-what-happens-when-i-subscribe-to-clickhouse-cloud-via-aws--gcp--azure-marketplace\}

클라우드 제공자의 마켓플레이스에서 ClickHouse Cloud를 구독하는 절차는 두 단계로 이루어집니다:

1. 먼저 클라우드 제공자의 마켓플레이스 포털에서 ClickHouse Cloud를 「구독(Subscribe)」합니다.  구독을 완료한 후, 마켓플레이스에 따라 「Pay Now」 또는 「Manage on Provider」를 클릭합니다. 그러면 ClickHouse Cloud로 자동으로 이동합니다.
2. ClickHouse Cloud에서 새 계정을 등록하거나 기존 계정으로 로그인합니다.  어느 쪽이든 마켓플레이스 결제에 연결된 새로운 ClickHouse Cloud 조직이 생성됩니다.

참고: 이전에 ClickHouse Cloud에 가입하여 사용 중이던 기존 서비스와 조직은 그대로 유지되며, 마켓플레이스 결제와는 연결되지 않습니다.  ClickHouse Cloud에서는 동일한 계정으로 여러 조직을 관리할 수 있으며, 각 조직은 서로 다른 결제 방식을 사용할 수 있습니다.

ClickHouse Cloud 콘솔의 왼쪽 하단 메뉴에서 조직을 전환할 수 있습니다.

### 기존 ClickHouse Cloud 사용자입니다. 기존 서비스를 마켓플레이스를 통해 과금되도록 하려면 어떻게 해야 하나요?​ \{#i-am-an-existing-clickhouse-cloud-user-what-should-i-do-if-i-want-my-existing-services-to-be-billed-via-marketplace\}

클라우드 공급자 마켓플레이스를 통해 ClickHouse Cloud를 구독해야 합니다. 마켓플레이스에서 구독을 완료한 뒤 ClickHouse Cloud로 자동 이동되면, 기존 ClickHouse Cloud 조직을 마켓플레이스 과금에 연결할 수 있는 옵션이 제공됩니다. 이후부터는 기존 리소스가 마켓플레이스를 통해 과금됩니다. 

<Image img={marketplace_signup_and_org_linking} size='md' alt='마켓플레이스 가입 및 조직 연결' border/>

조직의 결제 페이지에서 과금이 실제로 마켓플레이스에 연결되었는지 확인할 수 있습니다. 문제가 발생하면 [ClickHouse Cloud 지원](https://clickhouse.com/support/program)에 문의하십시오.

:::note
이전에 ClickHouse Cloud에 가입하여 사용 중이던 기존 서비스와 조직은 그대로 유지되며, 마켓플레이스 과금에는 연결되지 않은 상태로 남습니다.
:::

### 마켓플레이스에서 ClickHouse Cloud를 구독했습니다. 어떻게 구독을 취소할 수 있습니까?​ \{#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-how-can-i-unsubscribe\}

ClickHouse Cloud 사용을 중단하고 기존 ClickHouse Cloud 서비스를 모두 삭제하기만 해도 됩니다. 구독은 계속 활성 상태이지만 ClickHouse Cloud에는 정기 요금이 없으므로 비용이 청구되지 않습니다.

구독을 완전히 해지하려면 Cloud Provider 콘솔로 이동하여 구독 갱신을 취소하십시오. 구독이 종료되면 기존 서비스는 모두 중지되며 신용 카드를 추가하라는 메시지가 표시됩니다. 카드를 추가하지 않으면 2주 후 기존 서비스는 모두 삭제됩니다.

### 마켓플레이스 사용자로 ClickHouse Cloud를 구독했다가 구독을 취소했습니다. 이제 다시 구독하려면 어떻게 해야 합니까?​ \{#i-subscribed-to-clickhouse-cloud-as-a-marketplace-user-and-then-unsubscribed-now-i-want-to-subscribe-back-what-is-the-process\}

이 경우 일반적인 절차에 따라 ClickHouse Cloud를 다시 구독하면 됩니다(마켓플레이스를 통해 ClickHouse Cloud를 구독하는 섹션을 참조하십시오).

- AWS 마켓플레이스에서는 새 ClickHouse Cloud 조직이 생성되고 마켓플레이스에 연결됩니다.
- GCP 마켓플레이스에서는 이전 조직이 재활성화됩니다.

마켓플레이스 조직 재활성화에 문제가 발생하면 [ClickHouse Cloud Support](https://clickhouse.com/support/program)로 문의하십시오.

### Marketplace를 통해 구독한 ClickHouse Cloud 서비스의 청구서는 어떻게 확인합니까?​ \{#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service\}

- [AWS Billing 콘솔](https://us-east-1.console.aws.amazon.com/billing/home)
- [GCP Marketplace 주문](https://console.cloud.google.com/marketplace/orders) (구독에 사용한 결제 계정을 선택합니다)

### 왜 Usage SQL 문의 날짜가 Marketplace 인보이스와 일치하지 않습니까?​ \{#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice\}

Marketplace 청구는 달력을 기준으로 한 월별 주기를 따릅니다. 예를 들어 12월 1일부터 1월 1일 사이의 사용량에 대해서는 1월 3일부터 1월 5일 사이에 인보이스가 생성됩니다.

ClickHouse Cloud Usage SQL 문은 가입한 날을 시작으로 30일 동안의 사용량을 계측하고 보고하는 별도의 청구 주기를 따릅니다.

이 날짜들이 서로 다르면 사용량과 인보이스 날짜도 일치하지 않습니다. Usage SQL 문은 특정 서비스의 사용량을 일 단위로 추적하므로, 비용 내역을 확인할 때 해당 SQL 문을 기준으로 세부 내역을 확인할 수 있습니다.

### 일반적인 결제 정보는 어디에서 확인할 수 있습니까? \{#where-can-i-find-general-billing-information\}

[Billing 개요 페이지](/cloud/manage/billing)를 참조하십시오.

### ClickHouse Cloud 요금은 클라우드 제공업체 마켓플레이스를 통해 결제하는 경우와 ClickHouse에 직접 결제하는 경우에 차이가 있습니까? \{#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse\}

클라우드 마켓플레이스를 통한 결제와 ClickHouse에 직접 가입해 결제하는 경우 간에 요금 차이는 없습니다. 두 경우 모두 ClickHouse Cloud 사용량은 ClickHouse Cloud Credits(CHC) 기준으로 동일한 방식으로 측정되며, 그에 따라 청구됩니다.

### 여러 개의 ClickHouse Organization 사용량을 단일 클라우드 마켓플레이스 결제 계정(AWS, GCP, 또는 Azure)으로 청구하도록 설정할 수 있습니까? \{#multiple-organizations-to-bill-to-single-cloud-marketplace-account\}

예, 가능합니다. 여러 ClickHouse Organization을 구성하여 사용량을 후불 방식으로 동일한 클라우드 마켓플레이스 결제 계정(AWS, GCP, 또는 Azure)으로 청구되도록 설정할 수 있습니다. 다만 기본적으로 선불 크레딧은 Organization 간에 공유되지 않습니다. Organization 간에 크레딧을 공유해야 하는 경우 [ClickHouse Cloud Support](https://clickhouse.com/support/program)에 문의하십시오.

### ClickHouse Organization이 Cloud 마켓플레이스 커밋 스펜드 약정 계약을 통해 과금되는 경우 크레딧을 모두 소진하면 자동으로 PAYG 방식으로 전환되나요? \{#automatically-move-to-PAYG-when-running-out-of-credit\}

사용 중인 마켓플레이스 커밋 스펜드 약정 계약이 활성 상태이고 크레딧을 모두 소진하면, 조직의 과금 방식은 자동으로 PAYG로 전환됩니다. 다만 기존 계약이 만료되면, 조직에 새 마켓플레이스 계약을 연결하거나 조직의 과금 방식을 신용카드를 통한 직접 청구로 전환해야 합니다. 