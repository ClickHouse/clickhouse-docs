---
sidebar_label: '결제 수단 관리'
slug: /manage/manage/billing/managing-payment-methods
title: '결제 수단 관리'
description: '마켓플레이스 구독을 관리하고 보조 신용카드를 추가합니다'
keywords: ['billing']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import add_payment_method from '@site/static/images/cloud/reference/billing/01-add-payment-method.png';
import edit_credit_card from '@site/static/images/cloud/reference/billing/02-edit-credit-card.png';
import edit_payment_method from '@site/static/images/cloud/reference/billing/03-edit-payment-method.png';
import edit_payment_method_2 from '@site/static/images/cloud/reference/billing/04-edit-payment-method.png';
import add_backup from '@site/static/images/cloud/reference/billing/05-add-backup.png';

이 문서에서는 신용카드와 마켓플레이스 과금 간 전환, 백업 신용카드 추가, 여러 조직에서 마켓플레이스 구독 공유를 포함하여 조직의 ClickHouse Cloud 과금 방식을 관리하고 변경하는 방법을 설명합니다.

## 필수 조건 \{#prerequisites\}

* 결제 수단을 업데이트하려면 해당 조직에서 Admin 또는 Billing 역할이 있어야 합니다.
* 사용할 수 있는 marketplace 구독은 Admin 또는 Billing 역할이 있는 다른 조직에서 활성화된 구독입니다.
* 다른 조직의 marketplace 구독을 공유하려면 현재 조직과 해당 marketplace 구독을 소유한 조직 모두에서 Admin 또는 Billing 역할이 있어야 합니다.
* marketplace 구독으로 요금을 청구하려는 조직의 모든 서비스는 marketplace와 동일한 클라우드 제공자(AWS, GCP 또는 Azure)를 사용해야 합니다.

:::note
다른 조직의 신용카드는 공유할 수 없습니다.
현재 결제 수단이 신용카드이고 이를 업데이트하려면 새 카드 정보를 입력해야 합니다.
:::

## 신용카드 결제 수단 추가 또는 업데이트 \{#add-update-cc-payment-method\}

현재 조직 요금이 신용카드로 청구되고 있다면 Billing 페이지에서 카드 정보를 업데이트할 수 있습니다.

### 신용 카드를 추가하거나 업데이트하는 방법 \{#steps-add-update\}

1. ClickHouse Cloud 콘솔에서 **Billing**으로 이동합니다.
2. 신용 카드를 추가하려면 페이지 상단에서 **add a payment method** 버튼을 클릭합니다.

<Image img={add_payment_method} alt="결제 방법 추가" size="lg" />

3. 신용 카드를 수정하려면 페이지 상단에서 **edit your credit card** 버튼을 클릭합니다.

<Image img={edit_credit_card} alt="신용 카드 수정" size="lg" />

4. 두 경우 모두 안내에 따라 신용 카드의 청구지 주소 정보를 추가하거나 업데이트합니다.

## 기존 마켓플레이스 구독으로 조직의 결제를 구성하기 \{#configure-billing-to-existing-mp-sub\}

여러 조직이 있는 경우 다음 작업을 수행할 수 있습니다:

* 조직의 결제 방식을 신용카드 결제에서, 다른 조직 중 하나에서 이미 활성화된 마켓플레이스 구독으로 전환합니다.
* 조직의 현재 마켓플레이스 구독을 다른 조직에서 사용 중인 구독으로 변경합니다.

### 이미 다른 조직에서 활성화된 마켓플레이스 구독으로 조직의 결제 방식을 신용카드 청구에서 전환하는 방법 \{#steps-switch-org-already-active\}

1. ClickHouse Cloud 콘솔의 **Billing** 페이지로 이동하세요.
2. **payment method** 옆의 수정 아이콘을 클릭하세요.

<Image img={edit_payment_method} alt="결제 방법 편집" size="lg" />

3. **Edit payment method** 대화 상자에서 현재 신용카드가 기본 결제 수단으로 표시됩니다.
4. 신용카드 아래에는 다른 조직에서 사용할 수 있는 마켓플레이스 구독이 표시됩니다. 각 항목에는 마켓플레이스 유형(예: AWS Marketplace)과 연결된 조직 이름이 표시됩니다.
5. 이 조직의 사용량이 청구되도록 할 마켓플레이스 구독을 선택하세요.
6. 확인하려면 **Update payment method**를 클릭하세요.

### 조직의 현재 마켓플레이스 구독을 다른 조직에서 사용 중인 구독으로 변경하는 방법 \{#steps-switch-org-different-org\}

1. ClickHouse Cloud 콘솔의 **Billing** 페이지로 이동하세요.
2. **payment method** 옆에 있는 편집 아이콘을 클릭하세요.

<Image img={edit_payment_method_2} alt="결제 방법 편집" size="lg" />

3. **Edit payment method** 대화 상자에서 현재 마켓플레이스 구독이 결제 방법으로 표시됩니다.
4. 현재 마켓플레이스 구독 아래에는 다른 조직에서 사용 가능한 다른 마켓플레이스 구독이 표시됩니다. 각 항목에는 마켓플레이스 유형(예: AWS Marketplace)과 연결된 조직 이름이 표시됩니다.
5. 이 조직의 사용량에 청구할 새 마켓플레이스 구독을 선택하세요.
6. 확인하려면 **Update payment method**를 클릭하세요.

## 마켓플레이스 조직에 예비 신용카드 추가하기 \{#add-backup-cc-to-marketplace-org\}

조직의 기본 결제 수단이 Marketplace 구독인 경우, 예비 결제 수단으로 신용카드를 추가할 수 있습니다. 예비 카드는 마켓플레이스 구독으로 사용 요금을 청구할 수 없는 경우에만 청구됩니다(예: 구독이 취소되었거나 만료된 경우).

:::note
ClickHouse Cloud를 사용하려면 조직에 활성 상태의 유효한 결제 수단이 최소 1개 이상 구성되어 있어야 합니다(마켓플레이스 구독 또는 신용카드). 청구 규정 준수에 관한 자세한 내용은 [여기](/manage/clickhouse-cloud-billing-compliance#billing-compliance)를 참조하십시오.
:::

### 백업 신용카드 추가 방법 \{#steps-add-backup-cc\}

1. ClickHouse Cloud 콘솔의 **Billing** 페이지로 이동합니다.
2. Billing 페이지 상단에는 기본 결제 수단이 Marketplace 구독으로, 백업 결제 수단은 **None**으로 표시됩니다.
3. 백업 결제 수단을 설정하려면 **add credit card** 버튼을 클릭합니다.

<Image img={add_backup} alt="백업 신용카드 추가" size="lg" />

4. 안내에 따라 신용카드의 청구지 주소 정보를 추가하거나 업데이트합니다. 저장하면 **Billing** 페이지에 기본 Marketplace 구독과 함께 백업 신용카드가 표시됩니다.

:::note
백업 신용카드를 설정한 후에는 버튼을 클릭해 신용카드를 수정하고 기본 결제 수단으로 지정할 수도 있습니다.
하지만 이렇게 하면 해당 신용카드가 조직의 유일한 결제 수단이 되며, Marketplace 구독은 ClickHouse Cloud에서 완전히 제거됩니다.
이 경우 [「클라우드 제공자에서 마켓플레이스 과금 설정 방법」](#set-up-marketplace-billing-from-cp) 섹션의 단계에 따라 마켓플레이스 계정으로 돌아가 다시 구성해야 합니다.
:::

## 클라우드 제공자를 통해 마켓플레이스 과금 설정하기 \{#set-up-marketplace-billing-from-cp\}

ClickHouse Cloud 콘솔을 통하지 않고도 클라우드 마켓플레이스에서 조직의 마켓플레이스 구독을 직접 설정하거나 업데이트할 수 있습니다. 다른 마켓플레이스 과금 계정의 새 구독을 통해 ClickHouse 조직의 과금이 이루어지도록 전환하려는 경우에 유용합니다.

마켓플레이스와 구독 유형에 따라 아래 안내를 따르십시오.

* [AWS Marketplace PAYG](/cloud/billing/marketplace/aws-marketplace-payg)
* [AWS Marketplace Committed Contract](/cloud/billing/marketplace/aws-marketplace-committed-contract)
* [GCP Marketplace PAYG](/cloud/billing/marketplace/gcp-marketplace-payg)
* [GCP Marketplace Committed Contract](/cloud/billing/marketplace/gcp-marketplace-committed-contract)
* [Azure Marketplace PAYG](/cloud/billing/marketplace/azure-marketplace-payg)
* [Azure Marketplace Committed Contract](/cloud/billing/marketplace/azure-marketplace-committed-contract)

이 절차를 완료하면 선택한 조직의 과금이 새 마켓플레이스 구독에 연결되고, ClickHouse Cloud 콘솔의 Billing 페이지에도 해당 업데이트가 반영됩니다.

## 지원 \{#support\}

문제가 발생하면 언제든지 [지원 팀에 문의하세요](https://clickhouse.com/support/program).

## 자주 묻는 질문(FAQ) \{#faqs\}

### 과금 주기 중간에 과금 방식을 변경하면 사용 요금은 어떻게 처리됩니까? \{#what-happens-to-my-usage-charges-if-i-switch-billing-methods-mid-billing-cycle\}

변경 방향에 따라 달라집니다:

마켓플레이스 과금에서 신용카드 과금으로 변경하는 경우: 과금 주기 시작 시점부터 변경 시점까지의 사용량은 마켓플레이스로 전송됩니다. 변경 시점부터 과금 주기 종료 시점까지의 나머지 사용량은 과금 주기 종료 시점에 신용카드로 인보이스 처리됩니다.

신용카드 과금에서 마켓플레이스 과금으로 변경하는 경우: 전체 과금 기간에 대한 모든 미인보이스 사용량이 마켓플레이스로 전송됩니다.