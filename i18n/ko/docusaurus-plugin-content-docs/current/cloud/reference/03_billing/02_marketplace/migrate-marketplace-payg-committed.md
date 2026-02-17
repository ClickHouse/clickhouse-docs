---
slug: /cloud/billing/marketplace/migrate
title: '클라우드 마켓플레이스에서 종량제(PAYG) 과금에서 약정 지출 계약으로 전환하기'
description: '종량제 과금에서 약정 지출 계약으로 전환합니다.'
keywords: ['marketplace', 'billing', 'PAYG', 'pay-as-you-go', 'committed spend contract']
doc_type: 'guide'
---

# Cloud 마켓플레이스에서 종량제(pay-as-you-go, PAYG)에서 약정 사용량 계약으로 결제 방식 마이그레이션 \{#migrate-payg-to-committed\}

현재 ClickHouse 조직이 활성화된 Cloud 마켓플레이스 종량제(pay-as-you-go, PAYG) 구독(또는 주문)을 통해 과금되고 있으며, 동일한 Cloud 마켓플레이스를 통해 약정 사용량 계약 기반 과금으로 전환하려는 경우, 새 오퍼를 수락한 후 사용하는 Cloud 서비스 제공업체에 따라 아래 단계를 따르십시오.

## 중요 안내 사항 \{#important-notes\}

마켓플레이스 PAYG 구독을 취소하더라도 ClickHouse Cloud 계정 자체는 삭제되지 않으며, 마켓플레이스를 통한 청구 관계만 종료됩니다. 구독이 취소되면 시스템에서 마켓플레이스를 통한 ClickHouse Cloud 서비스 요금 청구를 중단합니다. (참고: 이 과정은 즉시 완료되지 않으며, 완료까지 몇 분 정도 소요될 수 있습니다.)

마켓플레이스 구독이 취소된 이후 ClickHouse 조직에 등록된 신용카드가 있는 경우, 그 전에 새로운 마켓플레이스 구독이 연결되지 않는 한 청구 주기 종료 시 해당 카드로 요금을 청구합니다.

취소 후 신용카드가 설정되어 있지 않은 경우, 조직에 유효한 신용카드 또는 새로운 Cloud 마켓플레이스 구독을 추가할 수 있는 기간이 14일 제공됩니다. 이 기간 내에 결제 수단이 설정되지 않으면 서비스가 중단되며, 조직은 [청구 컴플라이언스](/manage/clickhouse-cloud-billing-compliance)를 준수하지 않는 상태로 간주됩니다.

구독 취소 이후 발생한 모든 사용량은 이후에 설정되는 다음 유효한 결제 수단으로 청구됩니다. 우선순위는 선불 크레딧, 마켓플레이스 구독, 신용카드 순입니다.

조직을 새로운 마켓플레이스 구독에 맞게 구성하는 과정에서 문의 사항이 있거나 지원이 필요한 경우 ClickHouse [support](https://clickhouse.com/support/program)에 문의하여 도움을 받으십시오.

## AWS Marketplace \{#aws-marketplace\}

PAYG 구독을 약정형 지출 계약으로 마이그레이션하면서 동일한 AWS Account ID를 사용하려는 경우, 이 변경을 진행하려면 [영업팀에 문의](https://clickhouse.com/company/contact)하시는 방법을 권장합니다. 이렇게 하면 추가로 필요한 단계가 없으며 ClickHouse 조직이나 서비스에 중단이 발생하지 않습니다.

ClickHouse 조직을 PAYG 구독에서 약정형 지출 계약으로 마이그레이션하면서 다른 AWS Account ID를 사용하려는 경우에는 다음 단계를 따르십시오:

### AWS PAYG 구독을 취소하는 단계 \{#cancel-aws-payg\}

1. **[AWS Marketplace](https://us-east-1.console.aws.amazon.com/marketplace)로 이동합니다.**
2. **"Manage Subscriptions" 버튼을 클릭합니다.**
3. **"Your Subscriptions"으로 이동합니다.**
    - "Manage Subscriptions"를 클릭합니다.
4. **목록에서 ClickHouse Cloud를 찾습니다.**
    - "Your Subscriptions" 아래에서 ClickHouse Cloud를 찾아 클릭합니다.
5. **구독을 취소합니다.**
    - "Agreement" 아래에서 ClickHouse Cloud 항목 옆의 "Actions" 드롭다운 또는 버튼을 클릭합니다.
    - "Cancel subscription"을 선택합니다.

> **참고:** 구독 취소에 도움이 필요한 경우(예: 구독 취소 버튼을 사용할 수 없는 경우) [AWS Support](https://support.console.aws.amazon.com/support/home#/)에 문의하십시오.

다음으로, 새로 수락한 AWS 약정형 지출(Committed Spend) 계약에 ClickHouse 조직을 구성하려면 이 [단계](/cloud/billing/marketplace/aws-marketplace-committed-contract)를 따르십시오.

## GCP Marketplace \{#gcp-marketplace\}

### GCP PAYG 주문을 취소하는 단계 \{#cancel-gcp-payg\}

1. **[Google Cloud Marketplace Console](https://console.cloud.google.com/marketplace)로 이동합니다.**
    - 올바른 GCP 계정으로 로그인했는지, 적절한 프로젝트를 선택했는지 확인합니다.
2. **ClickHouse 주문을 찾습니다.**
    - 왼쪽 메뉴에서 "Your Orders"를 클릭합니다.
    - 활성 주문 목록에서 올바른 ClickHouse 주문을 찾습니다.
3. **주문을 취소합니다.**
    - 주문 오른쪽의 점 3개 메뉴를 찾아 ClickHouse 주문을 취소하라는 안내를 따릅니다.

> **참고:** 이 주문을 취소하는 데 도움이 필요하면 [GCP 지원](https://cloud.google.com/support/docs/get-billing-support)에 문의하십시오.

다음으로 [단계](/cloud/billing/marketplace/gcp-marketplace-committed-contract)를 따라 ClickHouse 조직을 새 GCP 커밋 지출 계약에 맞게 구성합니다.

## Azure Marketplace \{#azure-marketplace\}

### Azure PAYG 구독을 취소하는 단계 \{#cancel-azure-payg\}

1. **[Microsoft Azure Portal](http://portal.azure.com)에 접속합니다.**
2. **"Subscriptions"로 이동합니다.**
3. **취소하려는 활성 ClickHouse 구독을 찾습니다.**
4. **구독 취소:**
    - ClickHouse Cloud 구독을 클릭하여 구독 세부 정보를 엽니다.
    - "Cancel subscription" 버튼을 선택합니다.

> **참고:** 이 주문을 취소하는 데 도움이 필요하면 Azure Portal에서 지원 티켓을 생성하십시오.

다음으로, 이러한 [단계](/cloud/billing/marketplace/azure-marketplace-committed-contract)를 따라 ClickHouse 조직을 새 Azure 약정 지출 계약에 맞게 구성하십시오.

## 마켓플레이스 약정 사용량 계약에 연결하기 위한 요구 사항 \{#linking-requirements\}

> **참고:** 조직을 마켓플레이스 약정 사용량 계약에 연결하려면 다음 조건이 충족되어야 합니다.
> - 아래 단계를 수행하는 사용자는 구독을 연결하려는 ClickHouse 조직의 관리자여야 합니다.
> - 조직의 미결제 청구서는 모두 결제되어야 합니다(질문이 있는 경우 ClickHouse [support](https://clickhouse.com/support/program)로 문의하십시오).