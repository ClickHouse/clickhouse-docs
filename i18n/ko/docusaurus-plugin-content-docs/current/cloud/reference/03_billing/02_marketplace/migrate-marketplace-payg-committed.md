---
'slug': '/cloud/billing/marketplace/migrate'
'title': '클라우드 마켓플레이스에서 사용량 기반(PAYG) 청구를 약정 지출 계약으로 마이그레이션'
'description': '사용량 기반에서 약정 지출 계약으로 마이그레이션.'
'keywords':
- 'marketplace'
- 'billing'
- 'PAYG'
- 'pay-as-you-go'
- 'committed spend contract'
'doc_type': 'guide'
---


# 청구를 종량제(pay-as-you-go, PAYG)에서 클라우드 마켓플레이스의 약정 계약으로 이전하기 {#migrate-payg-to-committed}

현재 ClickHouse 조직이 활성 클라우드 마켓플레이스의 종량제(PAYG) 구독(또는 주문)을 통해 청구되고 있으며, 동일한 클라우드 마켓플레이스를 통한 약정 계약으로 청구로 이전하려는 경우, 새로운 제안을 수락한 후 아래의 단계에 따라 클라우드 서비스 제공업체에 맞게 진행해 주시기 바랍니다.

## 중요 메모 {#important-notes}

마켓플레이스 PAYG 구독을 취소하더라도 ClickHouse Cloud 계정이 삭제되지 않음을 유의하시기 바랍니다. 마켓플레이스를 통한 청구 관계만 삭제됩니다. 취소 후에는 시스템이 마켓플레이스를 통해 ClickHouse Cloud 서비스에 대한 청구를 중단합니다. (참고: 이 과정은 즉시 이루어지지 않으며 완료되는 데 몇 분이 걸릴 수 있습니다.)

마켓플레이스 구독이 취소된 후 ClickHouse 조직에 신용 카드가 등록되어 있으면 청구 주기 종료 시 해당 카드로 요금이 청구됩니다. 단, 그 이전에 새로운 마켓플레이스 구독이 연결되어 있지 않은 경우에 해당합니다.

취소 후 신용 카드가 등록되지 않으면, 유효한 신용 카드나 새로운 클라우드 마켓플레이스 구독을 조직에 추가할 수 있는 기간은 14일입니다. 이 기간 내에 결제 방법이 구성되지 않으면 서비스가 일시 중지되며 조직은 [청구 준수](/manage/clickhouse-cloud-billing-compliance)를 벗어난 것으로 간주됩니다.

구독이 취소된 후 발생한 모든 사용량은 다음에 구성된 유효한 결제 방법(선불 신용 카드, 마켓플레이스 구독 또는 신용 카드 순)으로 청구됩니다.

새로운 마켓플레이스 구독 구성을 위한 질문이나 지원이 필요하면 ClickHouse [지원](https://clickhouse.com/support/program) 팀에 도움을 요청하시기 바랍니다.

## AWS 마켓플레이스 {#aws-marketplace}

PAYG 구독을 약정 계약으로 이전하기 위해 동일한 AWS 계정 ID를 사용하려는 경우, 추천 방법은 [영업팀에 연락](https://clickhouse.com/company/contact)하여 이 변경을 요청하는 것입니다. 이렇게 하면 추가 단계가 필요하지 않으며 ClickHouse 조직이나 서비스에 중단이 발생하지 않습니다.

ClickHouse 조직을 PAYG 구독에서 약정 계약으로 이전하기 위해 다른 AWS 계정 ID를 사용하려면 다음 단계를 따라 주시기 바랍니다.

### AWS PAYG 구독 취소 단계 {#cancel-aws-payg}

1. **[AWS 마켓플레이스](https://us-east-1.console.aws.amazon.com/marketplace)로 가기**
2. **"구독 관리" 버튼 클릭**
3. **"귀하의 구독"으로 이동:**
    - "구독 관리" 클릭
4. **목록에서 ClickHouse Cloud 찾기:**
    - "귀하의 구독" 아래에서 ClickHouse Cloud를 찾아 클릭
5. **구독 취소하기:**
    - ClickHouse Cloud 목록 옆의 "동의"에서 "작업" 드롭다운 또는 버튼 클릭
    - "구독 취소" 선택

> **참고:** 구독 취소 버튼이 이용 불가능한 경우 구독을 취소하는 데 도움이 필요하면 [AWS 지원](https://support.console.aws.amazon.com/support/home#/)에 문의하시기 바랍니다.

다음으로 ClickHouse 조직을 수락한 새로운 AWS 약정 계약으로 구성하기 위해 이 [단계](/cloud/billing/marketplace/aws-marketplace-committed-contract)를 따라 주시기 바랍니다.

## GCP 마켓플레이스 {#gcp-marketplace}

### GCP PAYG 주문 취소 단계 {#cancel-gcp-payg}

1. **[Google Cloud Marketplace Console](https://console.cloud.google.com/marketplace)로 가기:**
    - 올바른 GCP 계정으로 로그인하고 적절한 프로젝트를 선택했는지 확인
2. **ClickHouse 주문 찾기:**
    - 왼쪽 메뉴에서 "귀하의 주문" 클릭
    - 활성 주문 목록에서 올바른 ClickHouse 주문 찾기
3. **주문 취소하기:**
    - 주문 오른쪽의 세 점 메뉴를 찾아 ClickHouse 주문을 취소하는 방법에 대한 지침 따르기

> **참고:** 이 주문을 취소하는 데 도움이 필요하면 [GCP 지원](https://cloud.google.com/support/docs/get-billing-support) 팀에 문의하시기 바랍니다.

다음으로 ClickHouse 조직을 새로운 GCP 약정 계약으로 구성하기 위해 이 [단계](/cloud/billing/marketplace/gcp-marketplace-committed-contract)를 따라 주시기 바랍니다.

## Azure 마켓플레이스 {#azure-marketplace}

### Azure PAYG 구독 취소 단계 {#cancel-azure-payg}

1. **[Microsoft Azure 포털](http://portal.azure.com)로 가기**
2. **"구독"으로 이동**
3. **취소하려는 활성 ClickHouse 구독 찾기**
4. **구독 취소하기:**
    - ClickHouse Cloud 구독을 클릭하여 구독 세부정보 열기
    - "구독 취소" 버튼 선택

> **참고:** 이 주문을 취소하는 데 도움이 필요하면 Azure 포털에서 지원 요청 티켓을 열어 주시기 바랍니다.

다음으로 ClickHouse 조직을 새로운 Azure 약정 계약으로 구성하기 위해 이 [단계](/cloud/billing/marketplace/azure-marketplace-committed-contract)를 따라 주시기 바랍니다.

## 약정 계약에 연결하기 위한 요구 사항 {#linking-requirements}

> **참고:** 조직을 마켓플레이스 약정 계약에 연결하려면:
> - 단계를 따르는 사용자가 구독을 연결할 ClickHouse 조직의 관리자 사용자여야 합니다.
> - 조직의 모든 미지급 청구서는 결제되어야 합니다(질문이 있는 경우 ClickHouse [지원](https://clickhouse.com/support/program) 팀에 문의하시기 바랍니다).
