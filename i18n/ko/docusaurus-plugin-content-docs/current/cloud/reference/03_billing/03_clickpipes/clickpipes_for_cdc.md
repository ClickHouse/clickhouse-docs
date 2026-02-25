---
sidebar_label: 'PostgreSQL CDC'
slug: /cloud/reference/billing/clickpipes/postgres-cdc
title: 'PostgreSQL CDC를 위한 ClickPipes'
description: 'PostgreSQL CDC ClickPipes에 대한 과금 개요'
doc_type: 'reference'
keywords: ['과금', 'clickpipes', 'CDC 요금', '비용', '요금']
---



# ClickPipes for PostgreSQL CDC \{#clickpipes-for-postgresql-cdc\}

이 섹션에서는 ClickPipes에서 Postgres Change Data Capture (CDC)
커넥터에 대한 가격 책정 모델을 설명합니다. 이 모델을 설계할 때의 목표는 다음의 핵심 비전을 유지하면서
가격 경쟁력을 매우 높게 유지하는 것이었습니다.

> 사용자가 Postgres에서 ClickHouse로 데이터를 이동하여
실시간 분석을 수행하는 과정을 원활하고
경제적으로 만들기.

이 커넥터는 외부 ETL 도구 및 다른 데이터베이스 플랫폼의 유사 기능과 비교하여
**비용 면에서 5배 이상 효율적**입니다.

:::note
Postgres CDC ClickPipes를 사용하는 모든 고객(기존 및 신규)에 대해
**2025년 9월 1일**부터 월별 청구 기준으로 과금이 시작되었습니다.
:::



## 가격 책정 기준 \{#pricing-dimensions\}

가격 책정에는 두 가지 주요 기준이 있습니다:

1. **수집된 데이터**: Postgres에서 전송되어 ClickHouse로 수집되는 압축되지 않은 원시 바이트입니다.
2. **컴퓨팅**: 서비스당 프로비저닝되는 컴퓨팅 유닛은 여러 Postgres CDC ClickPipes를 관리하며, ClickHouse Cloud 서비스에서 사용하는 컴퓨팅 유닛과는 별도입니다. 이 추가 컴퓨팅은 Postgres CDC ClickPipes 전용으로 할당됩니다. 컴퓨팅은 개별 파이프가 아닌 서비스 수준에서 청구됩니다. 각 컴퓨팅 유닛에는 2개의 vCPU와 8GB의 RAM이 포함됩니다.

### Ingested data \{#ingested-data\}

The Postgres CDC connector operates in two main phases:

- **Initial load / resync**: This captures a full snapshot of Postgres tables
  and occurs when a pipe is first created or re-synced.
- **Continuous Replication (CDC)**: Ongoing replication of changes—such as inserts,
  updates, deletes, and schema changes—from Postgres to ClickHouse.

In most use cases, continuous replication accounts for over 90% of a ClickPipe
life cycle. Because initial loads involve transferring a large volume of data all
at once, we offer a lower rate for that phase.

| Phase                            | Cost         |
| -------------------------------- | ------------ |
| **Initial load / resync**        | $0.10 per GB |
| **Continuous Replication (CDC)** | $0.20 per GB |

### Compute \{#compute\}

This dimension covers the compute units provisioned per service just for Postgres
ClickPipes. Compute is shared across all Postgres pipes within a service. **It
is provisioned when the first Postgres pipe is created and deallocated when no
Postgres CDC pipes remain**. The amount of compute provisioned depends on your
organization's tier:

| Tier                         | Cost                                          |
| ---------------------------- | --------------------------------------------- |
| **Basic Tier**               | 0.5 compute unit per service — $0.10 per hour |
| **Scale or Enterprise Tier** | 1 compute unit per service — $0.20 per hour   |

### Example \{#example\}

Let's say your service is in Scale tier and has the following setup:

- 2 Postgres ClickPipes running continuous replication
- Each pipe ingests 500 GB of data changes (CDC) per month
- When the first pipe is kicked off, the service provisions **1 compute unit under the Scale Tier** for Postgres CDC

#### Monthly cost breakdown \{#cost-breakdown\}

**Ingested Data (CDC)**:

$$ 2 \text{ pipes} \times 500 \text{ GB} = 1,000 \text{ GB per month} $$

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**Compute**:

$$1 \text{ compute unit} \times \$0.20/\text{hr} \times 730 \text{ hours (approximate month)} = \$146$$

:::note
Compute is shared across both pipes
:::

**Total Monthly Cost**:

$$\$200 \text{ (ingest)} + \$146 \text{ (compute)} = \$346$$


## Postgres CDC ClickPipes FAQ \{#faq-postgres-cdc-clickpipe\}

<details>

<summary>가격 책정 시 수집된 데이터는 압축된 크기 기준인가요, 비압축 크기 기준인가요?</summary>

수집된 데이터는 Postgres에서 전송되는 _비압축 데이터_ 기준으로 측정됩니다. 이는
초기 로드와 CDC(복제 슬롯을 통한) 모두에 적용됩니다. Postgres는 기본적으로
전송 중 데이터를 압축하지 않으며, ClickPipe는 압축되지 않은 원시 바이트를
처리합니다.

</details>

<details>

<summary>Postgres CDC 요금은 언제부터 청구서에 표시되나요?</summary>

Postgres CDC ClickPipes 요금은 모든 고객(기존 및 신규)을 대상으로
**2025년 9월 1일**부터 월별 청구서에 표시되기 시작했습니다.

</details>

<details>

<summary>파이프를 일시 중지하면 요금이 청구되나요?</summary>

파이프가 일시 중지된 동안에는 데이터가 이동하지 않으므로 데이터 수집 요금은
청구되지 않습니다. 그러나 조직 등급에 따라 0.5 또는 1 compute unit의
컴퓨트 요금은 계속 청구됩니다. 이는 고정된 서비스 수준 비용이며, 해당 서비스
내의 모든 파이프에 공통으로 적용됩니다.

</details>

<details>

<summary>요금을 어떻게 추정할 수 있나요?</summary>

ClickPipes의 Overview 페이지에서는 초기 로드/재동기화 및 CDC 데이터 볼륨에 대한
메트릭을 제공합니다. 이러한 메트릭을 ClickPipes 가격과 함께 활용하여
Postgres CDC 비용을 추정할 수 있습니다.

</details>

<details>

<summary>서비스에서 Postgres CDC에 할당된 컴퓨트를 확장할 수 있나요?</summary>

기본적으로 컴퓨트 확장은 사용자가 직접 구성할 수 없습니다. 프로비저닝된
리소스는 대부분의 고객 워크로드를 효율적으로 처리하도록 최적화되어 있습니다.
사용 사례에 따라 더 많거나 더 적은 컴퓨트가 필요한 경우, 요청을 검토할 수
있도록 지원 티켓을 생성해 주십시오.

</details>

<details>

<summary>가격 책정의 최소 단위는 어떻게 되나요?</summary>

- **Compute**: 시간당 청구됩니다. 1시간 미만 사용 시 다음 1시간으로 올림 처리됩니다.
- **수집된 데이터**: 비압축 데이터 기준 기가바이트(GB) 단위로 측정 및 청구됩니다.

</details>

<details>

<summary>ClickPipes를 통한 Postgres CDC에 ClickHouse Cloud 크레딧을 사용할 수 있나요?</summary>

예. ClickPipes 가격은 통합 ClickHouse Cloud 가격의 일부입니다. 보유 중인
플랫폼 크레딧은 자동으로 ClickPipes 사용량에도 적용됩니다.

</details>

<details>

<summary>기존 월간 ClickHouse Cloud 사용 비용에서 Postgres CDC ClickPipes로 인해 어느 정도의 추가 비용이 발생하나요?</summary>

비용은 사용 사례, 데이터 볼륨, 조직 등급에 따라 달라집니다.
일반적으로 대부분의 기존 고객은 체험 기간 이후 기존 월간
ClickHouse Cloud 비용 대비 **0–15%** 정도 증가하는 것으로 확인됩니다.
실제 비용은 워크로드에 따라 달라질 수 있습니다. 데이터 볼륨은 크지만
처리가 적은 워크로드도 있고, 데이터는 적지만 더 많은 처리가 필요한
워크로드도 있기 때문입니다.

</details>
