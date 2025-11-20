---
'sidebar_label': 'PostgreSQL CDC'
'slug': '/cloud/reference/billing/clickpipes/postgres-cdc'
'title': 'ClickPipes for PostgreSQL CDC'
'description': 'PostgreSQL CDC ClickPipes에 대한 청구 개요'
'doc_type': 'reference'
'keywords':
- 'billing'
- 'clickpipes'
- 'cdc pricing'
- 'costs'
- 'pricing'
---


# ClickPipes for PostgreSQL CDC {#clickpipes-for-postgresql-cdc}

이 섹션에서는 ClickPipes에서 Postgres Change Data Capture (CDC) 커넥터에 대한 가격 모델을 설명합니다. 이 모델을 설계하는 데 목표는 가격을 매우 경쟁력 있게 유지하면서도 우리의 핵심 비전을 유지하는 것이었습니다:

> Postgres에서 ClickHouse로 데이터를 원활하고 저렴하게 이동하여
실시간 분석을 수행할 수 있도록 합니다.

커넥터는 외부 ETL 도구 및 다른 데이터베이스 플랫폼에서 유사한 기능보다 **5배 이상 비용 효율적**입니다.

:::note
Postgres CDC ClickPipes를 사용하는 모든 고객(기존 고객 및 새로운 고객)을 위해 가격이 **2025년 9월 1일부터** 월별 청구서에서 측정되기 시작했습니다.
:::

## 가격 차원 {#pricing-dimensions}

가격에는 두 가지 주요 차원이 있습니다:

1. **소비된 데이터**: Postgres에서 ClickHouse로 수집되는 압축되지 않은 원시 바이트입니다.
2. **계산**: 서비스를 위해 프로비저닝된 계산 단위로, 여러 Postgres CDC ClickPipes를 관리하며 ClickHouse Cloud 서비스에서 사용되는 계산 단위와는 별개입니다. 이 추가 계산은 전적으로 Postgres CDC ClickPipes에 전용됩니다. 계산은 개별 파이프가 아니라 서비스 수준에서 청구됩니다. 각 계산 단위에는 2 vCPUs와 8 GB의 RAM이 포함됩니다.

### 소비된 데이터 {#ingested-data}

Postgres CDC 커넥터는 두 가지 주요 단계에서 작동합니다:

- **초기 로드 / 재동기화**: 이는 Postgres 테이블의 전체 스냅샷을 캡처하며 파이프가 처음 생성되거나 재동기화될 때 발생합니다.
- **지속적인 복제 (CDC)**: Postgres에서 ClickHouse로의 변경 사항(삽입, 업데이트, 삭제 및 스키마 변경)의 지속적인 복제입니다.

대부분의 사용 사례에서 지속적인 복제는 ClickPipe 생애 주기의 90% 이상을 차지합니다. 초기 로드는 대량의 데이터를 한 번에 전송하는 것을 포함하므로 해당 단계에 대해 더 낮은 요금을 제공합니다.

| 단계                            | 비용          |
|----------------------------------|---------------|
| **초기 로드 / 재동기화**        | GB당 $0.10   |
| **지속적인 복제 (CDC)**         | GB당 $0.20   |

### 계산 {#compute}

이 차원은 Postgres ClickPipes 전용으로 서비스당 프로비저닝된 계산 단위를 포함합니다. 계산은 서비스 내의 모든 Postgres 파이프에서 공유됩니다. **첫 번째 Postgres 파이프가 생성될 때 프로비저닝되고, 더 이상 Postgres CDC 파이프가 없을 때 해제됩니다**. 프로비저닝된 계산의 양은 조직의 계층에 따라 다릅니다.

| 계층                         | 비용                                         |
|------------------------------|----------------------------------------------|
| **기본 계층**               | 서비스당 0.5 계산 단위 — 시간당 $0.10      |
| **스케일 또는 엔터프라이즈 계층** | 서비스당 1 계산 단위 — 시간당 $0.20       |

### 예시 {#example}

당신의 서비스가 스케일 계층에 있고 다음과 같은 설정을 가지고 있다고 가정해 보겠습니다:

- 2개의 Postgres ClickPipes가 지속적인 복제를 실행 중
- 각 파이프가 월간 500 GB의 데이터 변경 사항(CDC)을 수집 중
- 첫 번째 파이프가 시작될 때, 서비스는 Postgres CDC에 대해 **스케일 계층에서 1 계산 단위**를 프로비저닝합니다.

#### 월별 비용 내역 {#cost-breakdown}

**소비된 데이터 (CDC)**:

$$ 2 \text{ 파이프} \times 500 \text{ GB} = 1,000 \text{ GB per month} $$

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**계산**:

$$1 \text{ 계산 단위} \times \$0.20/\text{hr} \times 730 \text{ 시간 (대략적인 월)} = \$146$$

:::note
계산은 두 개의 파이프에서 공유됩니다.
:::

**총 월별 비용**:

$$\$200 \text{ (수집)} + \$146 \text{ (계산)} = \$346$$

## Postgres CDC ClickPipes에 대한 FAQ {#faq-postgres-cdc-clickpipe}

<details>

<summary>소비된 데이터는 압축된 크기와 압축되지 않은 크기 중 어떤 기반으로 측정되나요?</summary>

소비된 데이터는 Postgres에서 오는 _압축되지 않은 데이터_로 측정됩니다—초기 로드 및 CDC(복제 슬롯을 통해) 모두에서. Postgres는 기본적으로 전송 중 데이터를 압축하지 않으며 ClickPipe는 원시, 압축되지 않은 바이트를 처리합니다.

</details>

<details>

<summary>Postgres CDC 가격은 언제 내 청구서에 나타나기 시작하나요?</summary>

Postgres CDC ClickPipes 가격은 **2025년 9월 1일부터** 모든 고객(기존 고객 및 새로운 고객)에게 월별 청구서에 나타나기 시작했습니다.

</details>

<details>

<summary>파이프를 일시 중지하면 요금이 부과되나요?</summary>

파이프가 일시 중지되어 있는 동안 데이터 수집 요금은 부과되지 않습니다. 데이터가 이동하지 않기 때문입니다. 그러나 0.5 또는 1 계산 단위에 따라 계산 요금은 여전히 적용됩니다—조직의 계층에 따라 다릅니다. 이는 고정 서비스 수준 비용으로 해당 서비스 내의 모든 파이프에 적용됩니다.

</details>

<details>

<summary>내 가격을 어떻게 추정할 수 있나요?</summary>

ClickPipes의 개요 페이지는 초기 로드/재동기화 및 CDC 데이터 볼륨에 대한 메트릭을 제공합니다. 이러한 메트릭과 ClickPipes 가격을 결합하여 Postgres CDC 비용을 추정할 수 있습니다.

</details>

<details>

<summary>내 서비스에서 Postgres CDC에 할당된 계산을 확장할 수 있나요?</summary>

기본적으로 계산 확장은 사용자 구성 가능하지 않습니다. 프로비저닝된 리소스는 대부분의 고객 워크로드를 최적화하여 처리하도록 설계되었습니다. 사용 사례가 더 많은 또는 적은 계산을 필요로 하는 경우, 요청을 평가할 수 있도록 지원 티켓을 열어 주시기 바랍니다.

</details>

<details>

<summary>가격의 세분화 수준은 무엇인가요?</summary>

- **계산**: 시간당 청구됩니다. 부분 시간은 다음 시간으로 반올림됩니다.
- **소비된 데이터**: 압축되지 않은 데이터의 기가바이트(GB)로 측정되고 청구됩니다.

</details>

<details>

<summary>ClickPipes를 통한 Postgres CDC에 ClickHouse Cloud 크레딧을 사용할 수 있나요?</summary>

예. ClickPipes 가격은 통합된 ClickHouse Cloud 가격의 일부입니다. 보유하고 있는 플랫폼 크레딧은 ClickPipes 사용에도 자동으로 적용됩니다.

</details>

<details>

<summary>내 기존 월별 ClickHouse Cloud 지출에서 Postgres CDC ClickPipes로 인해 추가 비용이 얼마나 예상되나요?</summary>

비용은 사용 사례, 데이터 볼륨 및 조직 계층에 따라 다릅니다. 일반적으로 기존 고객은 평가판 후 기존 월별 ClickHouse Cloud 지출에 **0–15%** 증가를 경험합니다. 실제 비용은 워크로드에 따라 다를 수 있습니다—일부 워크로드는 처리량이 적은 높은 데이터 볼륨을 포함하고, 다른 워크로드는 데이터가 적은 처리량을 요구합니다.

</details>
