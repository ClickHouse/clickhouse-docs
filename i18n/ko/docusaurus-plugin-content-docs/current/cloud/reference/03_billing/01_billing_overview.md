---
sidebar_label: '개요'
slug: /cloud/manage/billing/overview
title: '요금'
description: 'ClickHouse Cloud 요금 개요 페이지'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'pricing', 'billing', 'cloud costs', 'compute pricing']
---

요금 정보는 [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) 페이지를 참고하십시오.
ClickHouse Cloud는 컴퓨트, 스토리지, [데이터 전송](/cloud/manage/network-data-transfer) (인터넷 및 리전 간 아웃바운드 트래픽(egress)), 그리고 [ClickPipes](/integrations/clickpipes) 사용량을 기준으로 과금됩니다. 
청구 금액에 어떤 요소가 영향을 미치는지와 지출을 관리하는 방법을 알아보려면 계속 읽으십시오.

## Amazon Web Services (AWS) 예시 \{#amazon-web-services-aws-example\}

:::note

- 가격은 AWS us-east-1 리전 요금을 기준으로 합니다.
- 적용 가능한 데이터 전송 및 ClickPipes 요금은 [여기](/cloud/manage/network-data-transfer)에서 확인하십시오.
:::

### Basic: 월 $66.52부터 \{#basic-from-6652-per-month\}

적합한 용도: 데이터 양이 비교적 적고 엄격한 신뢰성 보장이 필요하지 않은 부서 단위 사용 사례.

**Basic 티어 서비스**

- 1 레플리카 x 8 GiB RAM, 2 vCPU
- 500 GB 압축 데이터
- 500 GB 데이터 백업
- 10 GB 공인 인터넷 이그레스 데이터 전송
- 5 GB 리전 간 데이터 전송

이 예시 구성의 요금 세부 내역:

<table><thead>
  <tr>
    <th></th>
    <th>하루 6시간 가동</th>
    <th>하루 12시간 가동</th>
    <th>하루 24시간 가동</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>\$39.91</td>
    <td>\$79.83</td>
    <td>\$159.66</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
  </tr>
  <tr>
    <td>공인 인터넷 이그레스 데이터 전송</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
  </tr>
  <tr>
    <td>리전 간 데이터 전송</td>
    <td>\$0.16</td>
    <td>\$0.16</td>
    <td>\$0.16</td>
  </tr>
  <tr>
    <td>합계</td>
    <td>\$66.52</td>
    <td>\$106.44</td>
    <td>\$186.27</td>
  </tr>
</tbody>
</table>

### Scale (항상 구동, 자동 스케일링): 월 \$499.38부터 \{#scale-always-on-auto-scaling-from-49938-per-month\}

강화된 SLA(레플리카 서비스 2개 이상), 우수한 확장성 및 고급 보안이 필요한 워크로드에 적합합니다.

**Scale 티어 서비스**

- 워크로드가 거의 100% 시간 동안 활성 상태
- 비용 폭증을 방지하기 위해 자동 스케일링 상한을 설정 가능
- 공용 인터넷 egress 데이터 전송 100 GB
- 리전 간 데이터 전송 10 GB

이 예시의 가격 구성은 다음과 같습니다:

<table><thead>
  <tr>
    <th></th>
    <th>예시 1</th>
    <th>예시 2</th>
    <th>예시 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>2 레플리카 x 8 GiB RAM, 2 vCPU<br></br>\$436.95</td>
    <td>2 레플리카 x 16 GiB RAM, 4 vCPU<br></br>\$873.89</td>
    <td>3 레플리카 x 16 GiB RAM, 4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>1 TB 데이터 + 백업 1개<br></br>\$50.60</td>
    <td>2 TB 데이터 + 백업 1개<br></br>\$101.20</td>
    <td>3 TB 데이터 + 백업 1개<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>공용 인터넷 egress 데이터 전송</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>리전 간 데이터 전송</td>
    <td>\$0.31</td>
    <td>\$0.31</td>
    <td>\$0.31</td>
  </tr>
  <tr>
    <td>합계</td>
    <td>\$499.38</td>
    <td>\$986.92</td>
    <td>\$1,474.47</td>
  </tr>
</tbody>
</table>

### 엔터프라이즈: 시작 가격은 다양합니다 \{#enterprise-starting-prices-vary\}

적합 대상: 보안 및 컴플라이언스 요구사항이 엄격한 대규모 미션 크리티컬 배포

**엔터프라이즈 티어 서비스**

- 워크로드가 거의 100% 시간 동안 활성 상태
- 공용 인터넷 이그레스(egress) 데이터 전송 1 TB
- 리전 간 데이터 전송 500 GB

<table><thead>
  <tr>
    <th></th>
    <th>예시 1</th>
    <th>예시 2</th>
    <th>예시 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>레플리카 2개 x 32 GiB RAM, 8 vCPU<br></br>\$2,285.60</td>
    <td>레플리카 2개 x 64 GiB RAM, 16 vCPU<br></br>\$4,571.19</td>
    <td>2 x 120 GiB RAM, 30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>5 TB + 백업 1개<br></br>\$253.00</td>
    <td>10 TB + 백업 1개<br></br>\$506.00</td>
    <td>20 TB + 백업 1개<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>공용 인터넷 이그레스(egress) 데이터 전송</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
  </tr>
  <tr>
    <td>리전 간 데이터 전송</td>
    <td>\$15.60</td>
    <td>\$15.60</td>
    <td>\$15.60</td>
  </tr>
  <tr>
    <td>합계</td>
    <td>\$2,669.40</td>
    <td>\$5,207.99</td>
    <td>\$9,713.79</td>
  </tr>
</tbody>
</table>

## 자주 묻는 질문 \{#faqs\}

### ClickHouse Credit(CHC)란 무엇입니까? \{#what-is-chc\}

ClickHouse Credit는 ClickHouse Cloud 사용에 대해 부여되는 크레딧 단위로, ClickHouse에서 당시 게시한 최신 가격표를 기준으로 미화 1달러(USD)에 해당합니다.

:::note 
Stripe를 통해 청구되는 경우, Stripe 청구서에서 1 CHC는 \$0.01 USD로 표시됩니다. 이는 Stripe가 당사의 표준 SKU인 1 CHC = \$1 USD에 대해 소수 단위 수량을 청구할 수 없는 제한 사항이 있어, Stripe에서 정확한 청구가 가능하도록 하기 위한 설정입니다.
:::

### 기존 요금제는 어디에서 확인할 수 있습니까? \{#find-legacy-pricing\}

기존 요금제에 대한 정보는 [여기](https://clickhouse.com/pricing?legacy=true)에서 확인할 수 있습니다.

### 컴퓨트는 어떻게 과금되나요? \{#how-is-compute-metered\}

ClickHouse Cloud에서는 컴퓨트 사용량을 8G RAM 단위로, 분 단위로 측정합니다.  
컴퓨트 비용은 티어, 리전, 클라우드 서비스 제공자에 따라 달라집니다.

### 디스크 저장 용량은 어떻게 계산됩니까? \{#how-is-storage-on-disk-calculated\}

ClickHouse Cloud는 클라우드 객체 스토리지를 사용하며, 사용량은 ClickHouse 테이블에 저장된 데이터의 압축 크기를 기준으로 측정됩니다. 
스토리지 비용은 모든 티어에서 동일하며, 지역과 클라우드 서비스 제공자에 따라 달라집니다. 

### 백업은 총 스토리지에 포함됩니까? \{#do-backups-count-toward-total-storage\}

스토리지와 백업은 모두 스토리지 비용 산정에 포함되며, 별도로 청구됩니다.  
모든 서비스는 기본적으로 하루 동안 보관되는 백업 1개가 제공됩니다.  
추가 백업이 필요한 경우 Cloud 콘솔의 설정 탭에서 추가 [백업](/cloud/manage/backups/overview)을 구성하면 됩니다.

### 압축률은 어떻게 추정합니까? \{#how-do-i-estimate-compression\}

압축률은 데이터셋마다 달라질 수 있습니다.
얼마나 달라지는지는 우선 데이터 자체가 어느 정도까지 압축 가능한지(높은 카디널리티 필드와 낮은 카디널리티 필드의 개수),
그리고 사용자가 스키마를 어떻게 구성하는지(예를 들어 선택적 코덱을 사용하는지 여부)에 따라 달라집니다.
일반적인 분석 데이터 유형의 경우 대략 10배 정도의 압축률을 기대할 수 있지만, 이보다 훨씬 낮거나 높을 수도 있습니다.
안내를 위해 [최적화 문서](/optimize/asynchronous-inserts)를 참고하고, 상세한 로깅 사용 사례 예시는 이 [Uber 블로그](https://www.uber.com/blog/logging/)를 참고하십시오.
정확히 알 수 있는 유일한 실질적인 방법은 데이터셋을 ClickHouse로 수집한 뒤, 원본 데이터셋의 크기와 ClickHouse에 저장된 크기를 비교하는 것입니다.

다음 쿼리를 사용할 수 있습니다:

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```


### 자가 관리형 배포를 사용 중인 경우 Cloud에서 서비스를 운영하는 비용을 추정하기 위해 ClickHouse가 제공하는 도구에는 무엇이 있습니까? \{#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment\}

ClickHouse 쿼리 로그는 ClickHouse Cloud에서 워크로드를 운영하는 비용을 추정하는 데 사용할 수 있는 [핵심 메트릭](/operations/system-tables/query_log)을 기록합니다. 
자가 관리형 환경에서 ClickHouse Cloud로 마이그레이션하는 방법에 대한 자세한 내용은 [마이그레이션 문서](/cloud/migration/clickhouse-to-cloud)를 참고하고, 추가로 궁금한 점이 있으면 [ClickHouse Cloud 지원](https://console.clickhouse.cloud/support)에 문의하십시오.

### ClickHouse Cloud에는 어떤 결제 옵션이 있습니까? \{#what-billing-options-are-available-for-clickhouse-cloud\}

ClickHouse Cloud에서는 다음과 같은 결제 옵션을 지원합니다:

- 셀프 서비스 월별 결제(미국 달러 기준, 신용카드 결제).
- 직접 판매 방식의 연간/다년 약정(선불 「ClickHouse Credits」를 통해, 미국 달러 기준, 추가 결제 수단 제공).
- AWS, GCP, Azure 마켓플레이스를 통한 결제(PAYG 종량제 또는 마켓플레이스를 통한 ClickHouse Cloud와의 약정 계약).

:::note
PAYG용 ClickHouse Cloud 크레딧은 \$0.01 단위로 청구되므로, 사용량에 따라 ClickHouse 크레딧을 부분 단위로 과금할 수 있습니다. 이는 약정형 ClickHouse 크레딧과는 다르며, 약정형 크레딧은 미리 \$1 정수 단위로 선구매됩니다.
:::

### 신용카드를 삭제할 수 있습니까? \{#can-i-delete-my-credit-card\}

Billing UI에서는 신용카드를 삭제할 수 없지만, 언제든지 신용카드 정보를 업데이트할 수 있습니다. 이는 조직에 항상 유효한 결제 수단이 있도록 하기 위한 것입니다. 신용카드를 반드시 삭제해야 하는 경우 [ClickHouse Cloud support](https://console.clickhouse.cloud/support)에 문의하여 도움을 받으십시오.

### 청구 주기는 얼마나 되나요? \{#how-long-is-the-billing-cycle\}

청구는 월 단위 청구 주기로 진행되며, 시작일은 ClickHouse Cloud 조직이 생성된 날짜입니다.

### 활성 PAYG 마켓플레이스 구독이 있는 상태에서 약정 계약을 체결하면, 약정 크레딧이 먼저 차감됩니까? \{#committed-credits-consumed-first-with-active-payg-subscription\}

네. 사용량은 다음 결제 수단에서 아래 순서로 차감됩니다:

- 약정(선불) 크레딧
- 마켓플레이스 구독(PAYG)
- 신용카드

### ClickHouse Cloud에서 Scale 및 Enterprise 서비스 비용을 관리하기 위해 제공하는 제어 기능은 무엇입니까? \{#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services\}

- Trial 및 Annual Commit 고객은 사용량이 `50%`, `75%`, `90%`의 특정 임계값에 도달하면 자동으로 이메일 알림을 받습니다. 이를 통해 사용량을 사전에 관리할 수 있습니다.
- ClickHouse Cloud에서는 분석 워크로드의 주요 비용 요소인 컴퓨트 리소스에 대해 [Advanced scaling control](/manage/scaling)을 사용하여 최대 자동 확장 한도를 설정할 수 있습니다.
- [Advanced scaling control](/manage/scaling)을 사용하면 비활성 상태일 때 일시 중지/유휴 상태 동작을 제어할 수 있는 옵션과 함께 메모리 한도를 설정할 수 있습니다.

### Basic 서비스의 비용을 관리하기 위해 ClickHouse Cloud에서는 어떤 제어 기능을 제공합니까? \{#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services\}

- [Advanced scaling control](/manage/scaling)을 사용하면 유휴 상태일 때 서비스의 일시 중지/유휴 동작을 제어할 수 있습니다. Basic 서비스에서는 메모리 할당 조정을 지원하지 않습니다.
- 기본 설정에서는 일정 시간 동안 활동이 없으면 서비스가 일시 중지됩니다.

### 여러 개의 서비스가 있는 경우 서비스별로 각각 청구서를 받게 되나요, 아니면 통합 청구서를 받게 되나요? \{#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice\}

각 청구 기간마다 하나의 조직에 포함된 모든 서비스에 대해 통합 청구서가 발행됩니다.

### 평가 기간과 크레딧이 만료되기 전에 신용카드를 추가하고 업그레이드하면, 요금이 청구되나요? \{#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged\}

사용자가 30일 평가 기간이 끝나기 전에 유료 플랜으로 전환했지만 평가 크레딧 한도에서 남은 크레딧이 있는 경우,
초기 30일 평가 기간 동안에는 남은 평가 크레딧을 계속 사용하고, 그 이후에 신용카드로 요금을 청구합니다.

### 지출 상황은 어떻게 파악할 수 있습니까? \{#how-can-i-keep-track-of-my-spending\}

ClickHouse Cloud 콘솔에는 서비스별 사용량을 자세히 보여 주는 Usage 화면이 있습니다. 사용량 차원별로 구성된 이 내역을 통해 각 과금 단위에 해당하는 비용을 보다 명확하게 파악할 수 있습니다.

### ClickHouse Cloud 서비스 구독에 대한 청구서를 어떻게 확인할 수 있습니까? \{#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service\}

신용카드로 직접 구독한 경우:

청구서를 확인하려면 ClickHouse Cloud UI의 왼쪽 탐색 모음에서 조직을 선택한 다음 「Billing」으로 이동하십시오. 모든 청구서는 「Invoices」 섹션에 목록으로 표시됩니다.

클라우드 마켓플레이스를 통한 구독의 경우:

모든 마켓플레이스 구독은 해당 마켓플레이스에서 과금 및 청구서 발행이 이루어집니다. 사용 중인 클라우드 제공자의 마켓플레이스에서 직접 청구서를 확인할 수 있습니다.

### 사용량 명세서의 날짜가 Marketplace 인보이스와 일치하지 않는 이유는 무엇입니까? \{#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice\}

AWS Marketplace 과금은 달력 기준 월 단위 청구 주기를 따릅니다.
예를 들어 2024-12-01부터 2025-01-01 사이의 사용량에 대해서는 
2025-01-03에서 2025-01-05 사이에 인보이스(청구서)가 생성됩니다.

ClickHouse Cloud 사용량 명세서는 다른 청구 주기를 따르며, 가입한 날짜를 기준으로 30일 동안의 사용량을 계량하고 보고합니다.

이 날짜들이 동일하지 않다면 사용량과 인보이스 날짜가 서로 다르게 표시됩니다. 사용량 명세서는 특정 서비스의 사용량을 일 단위로 추적하므로, 비용 내역을 확인할 때 명세서를 기준으로 삼으면 됩니다.

### 선불 크레딧 사용에 제한 사항이 있습니까? \{#are-there-any-restrictions-around-the-usage-of-prepaid-credits\}

ClickHouse Cloud 선불 크레딧(ClickHouse를 통해 직접 구매했는지, 또는 클라우드 제공자의 마켓플레이스를 통해 구매했는지 여부와 무관)은 
계약 조건에 따라서만 사용할 수 있습니다. 
이는 선불 크레딧이 계약 수락일 또는 이후의 날짜에 적용될 수 있지만, 그 이전 기간에는 적용될 수 없음을 의미합니다. 
선불 크레딧으로 충당되지 않은 초과 사용분은 신용카드 결제 또는 마켓플레이스의 월별 청구로 결제되어야 합니다.

### Cloud 제공자 마켓플레이스를 통해 결제하든 ClickHouse에 직접 결제하든 ClickHouse Cloud 요금에 차이가 있습니까? \{#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse\}

마켓플레이스를 통한 결제와 ClickHouse에 직접 결제하는 경우 사이에는 요금 차이가 없습니다.  
두 경우 모두 ClickHouse Cloud 사용량은 동일한 방식으로 계측되는 ClickHouse Cloud Credits (CHCs) 기준으로 추적되며, 그에 따라 청구됩니다.

### 컴퓨트-컴퓨트 분리는 어떻게 과금됩니까? \{#how-is-compute-compute-separation-billed\}

기존 서비스에 더해 새 서비스를 생성할 때, 
이 새 서비스가 기존 서비스와 동일한 데이터를 공유할지 선택할 수 있습니다. 
공유하도록 선택하면 이 두 서비스는 [warehouse](/cloud/reference/warehouses)를 형성합니다. 
warehouse에는 데이터가 저장되어 있고, 여러 컴퓨트 서비스가 이 데이터에 접근합니다.

데이터는 한 번만 저장되므로, 여러 서비스가 접근하더라도 데이터 사본에 대해서는 한 번만 비용을 지불하면 됩니다. 
컴퓨트 비용은 기존과 동일하게 지불되며, 컴퓨트-컴퓨트 분리/warehouse 사용에 대한 추가 요금은 없습니다.
이 구성에서 공유 스토리지를 활용하면 스토리지와 백업 비용 모두에서 절감 효과를 얻을 수 있습니다.

컴퓨트-컴퓨트 분리는 일부 상황에서 상당한 ClickHouse Credits 절감을 가져올 수 있습니다. 
예를 들면 다음과 같은 구성이 있습니다.

1. 24/7로 실행되며 서비스로 데이터를 수집하는 ETL 작업이 있습니다. 이 ETL 작업은 많은 메모리를 요구하지 않으므로, 예를 들어 32 GiB RAM을 가진 작은 인스턴스에서 실행할 수 있습니다.

2. 동일한 팀의 데이터 과학자는 애드혹 리포팅 요구 사항이 있으며, 상당한 메모리(236 GiB)가 필요한 쿼리를 실행해야 하지만, 고가용성은 필요 없고 최초 실행이 실패하면 기다렸다가 다시 쿼리를 실행해도 괜찮다고 합니다.

이 예시에서 데이터베이스 관리자는 다음과 같이 할 수 있습니다.

1. 레플리카 16 GiB 두 개로 구성된 작은 서비스를 생성합니다. 이렇게 하면 ETL 작업을 처리하면서 고가용성을 제공할 수 있습니다.

2. 데이터 과학자를 위해 동일한 warehouse 안에 레플리카 1개, 236 GiB로 구성된 두 번째 서비스를 생성할 수 있습니다. 이 서비스에 대해 유휴(idling) 기능을 활성화하면, 데이터 과학자가 사용하지 않을 때는 이 서비스에 대한 비용을 지불하지 않게 됩니다.

이 예시에 대한 월간 비용 예상( **Scale Tier** 기준):

- 상위(parent) 서비스: 하루 24시간 활성, 레플리카 2개 × 16 GiB, 레플리카당 4 vCPU
- 하위(child) 서비스: 레플리카 1개 × 236 GiB, 레플리카당 59 vCPU
- 압축 데이터 3 TB + 백업 1개
- 공용 인터넷 송신(egress) 데이터 전송 100 GB
- 리전 간 데이터 전송 50 GB

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>하위 서비스</span><br/><span>하루 1시간 활성</span></th>
    <th><span>하위 서비스</span><br/><span>하루 2시간 활성</span></th>
    <th><span>하위 서비스</span><br/><span>하루 4시간 활성</span></th>
  </tr></thead>
<tbody>
  <tr>
    <td>Compute</td>
    <td>\$1,142.43</td>
    <td>\$1,410.97</td>
    <td>\$1,948.05</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
  </tr>
  <tr>
    <td>Public internet egress data transfer</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>Cross-region data transfer</td>
    <td>\$1.56</td>
    <td>\$1.56</td>
    <td>\$1.56</td>
  </tr>
  <tr>
    <td>Total</td>
    <td>\$1,307.31</td>
    <td>\$1,575.85</td>
    <td>\$2,112.93</td>
  </tr>
</tbody>
</table>

warehouse가 없다면, 데이터 엔지니어가 쿼리에 필요로 하는 메모리 용량 전체에 대해 비용을 지불해야 합니다. 
그러나 두 서비스를 하나의 warehouse로 결합하고 그중 하나를 유휴 상태로 두면 비용을 절감할 수 있습니다.

## ClickPipes 요금 \{#clickpipes-pricing\}

ClickPipes 청구 방식에 대한 자세한 내용은 별도의 ["ClickPipes billing" 섹션](/cloud/reference/billing/clickpipes)을 참고하십시오.