---
slug: /cloud/managed-postgres/pricing
sidebar_label: '요금'
title: '요금'
description: 'ClickHouse 관리형 Postgres의 요금 모델, 티어, 인스턴스 유형 및 베타 요금 세부 정보'
keywords: ['postgres 요금', 'managed postgres 비용', 'postgres 베타 요금', 'postgres 요금 계산기', 'nvme 요금', 'postgres 티어 요금']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.pricing-beta" />

ClickHouse가 관리하는 Postgres는 로컬 NVMe 스토리지를 기반으로 구축되어, 기존의 네트워크 연결 스토리지 아키텍처에서 발생하는 추가 비용 부담 없이 프로덕션급 성능과 네이티브 ClickHouse 통합을 제공합니다. 이 페이지에서는 서비스의 요금 모델, 사용 가능한 인스턴스 유형, 그리고 티어별 비교를 설명합니다.

ClickHouse가 관리하는 Postgres는 이제 베타로 제공됩니다. 이 서비스는 사용량 계측이 시작되는 2026년 6월 15일까지 무료로 제공되므로, 과금이 시작되기 전에 인스턴스 규모를 적절히 산정할 수 있습니다.

베타 기간 동안 모든 플랜에는 50% 할인이 적용되며, 이는 초기 고객에 대한 당사의 지원 의지를 반영한 것입니다. 요금은 1 vCPU, 8 GB RAM, 59 GB NVMe 스토리지 구성 기준으로 월 약 **$30**부터 시작합니다.

:::tip[요금 계산기]
정확한 요금은 [요금 계산기](https://clickhouse.com/pricing?service=postgres#pricing-calculator)를 사용하여 워크로드에 가장 적합한 구성과 가격을 확인하십시오.
:::

## 가격 대비 성능 \{#price-performance\}

이 서비스는 로컬 NVMe 스토리지에서 실행되므로, 많은 워크로드에서 기존의 네트워크 연결 스토리지 아키텍처보다 가격 대비 성능이 훨씬 더 우수할 수 있습니다. 유사한 하드웨어 프로필에서 다른 Postgres 제공업체와 비교한 벤치마크는 [PostgresBench](https://postgresbench.clickhouse.com/)를 참조하십시오.

비슷한 워크로드에서는 컴퓨트 요구량이 최대 2–4×까지 더 낮아질 수 있습니다. 제공업체 간 가격을 비교할 때는 이러한 잠재적 효율 향상을 고려해야 하지만, 실제 개선 폭은 워크로드에 따라 달라지므로 각 애플리케이션을 기준으로 검증해야 합니다.

## 가격 모델 \{#pricing-model\}

이 서비스는 로컬 NVMe 스토리지에서 실행되므로, 컴퓨트와 디스크를 별도로 과금하는 방식이 아니라 CPU, 메모리, 스토리지를 포함한 전체 VM 구성을 기준으로 가격이 책정됩니다.

1 vCPU / 8 GB RAM / 59 GB NVMe부터 96 vCPUs / 768 GB RAM / 60 TB NVMe 스토리지까지 50개가 넘는 구성을 제공하므로, 컴퓨트 집약적인 Postgres 워크로드와 스토리지 사용량이 많은 Postgres 워크로드 모두에 유연하게 대응할 수 있습니다.

### 티어별 요금 \{#tier-based-pricing\}

요금, 기능 및 리소스 한도는 조직 티어([Basic, Scale, Enterprise](/cloud/manage/cloud-tiers))에 따라 달라집니다. 하지만 모든 티어에는 로컬 NVMe 스토리지에서 실행되는 프로덕션급 Postgres, ClickHouse로의 네이티브 CDC, 그리고 `pg_clickhouse` 확장 기능을 비롯한 서비스의 핵심 기능이 포함됩니다.

아래 표에는 각 티어에 포함된 기능, 제공 사항 및 한도가 요약되어 있습니다. 티어별 요금을 비교하려면 [요금 계산기](https://clickhouse.com/pricing?service=postgres#pricing-calculator)를 참조하십시오.

<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0'}}>
  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Basic</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>새로운 아이디어를 테스트하거나 초기 프로젝트를 시작하기에 적합합니다. 스토리지와 메모리는 제한적입니다.</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li><a href="/docs/cloud/managed-postgres/scaling">컴퓨트용 RAM 최대 8GB</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">로컬 NVMe 스토리지 최대 118GB</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">1일 보존 백업</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">PITR 및 브랜치</a></li>
      <li><a href="/docs/cloud/managed-postgres/high-availability">고가용성</a> 포함</li>
      <li><a href="/docs/cloud/managed-postgres/monitoring/query-insights">Query Insights</a> 1일 보존</li>
      <li><a href="/docs/cloud/managed-postgres/extensions">90개 이상의 Postgres 확장 기능</a></li>
      <li><a href="/docs/cloud/managed-postgres/clickhouse-integration">ClickHouse로의 네이티브 CDC</a></li>
      <li><a href="/docs/cloud/managed-postgres/extensions"><code>pg&#95;clickhouse</code> 확장 기능</a></li>
      <li><a href="/docs/cloud/managed-postgres/migrations/clickhouse-cloud">완전 관리형 데이터 마이그레이션</a></li>
      <li>영업일 기준 1일 응답의 전문가 지원</li>
      <li>Google 또는 Microsoft 소셜 로그인을 사용하는 <a href="/docs/cloud/security/manage-my-account">Single sign-on 인증(SSO)</a></li>
      <li><a href="/docs/cloud/security/manage-my-account#mfa">다단계 인증</a></li>
    </ul>
  </div>

  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Scale</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>프로덕션 환경, 대규모 데이터 워크로드 또는 전문적인 사용 사례에 적합합니다.</p>
    <p style={{fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem'}}>Basic의 모든 기능에 더해 다음이 포함됩니다</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li><a href="/docs/cloud/managed-postgres/scaling">최대 60 TB 스토리지</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">최대 96 vCPU 및 768 GB RAM</a></li>
      <li><a href="/docs/cloud/managed-postgres/scaling">스토리지 자동 스케일링</a></li>
      <li><a href="/docs/cloud/managed-postgres/read-replicas">읽기 레플리카</a></li>
      <li><a href="/docs/cloud/managed-postgres/security">프라이빗 네트워킹</a></li>
      <li><a href="/docs/cloud/managed-postgres/backup-and-restore">7일간 보관되는 백업</a></li>
      <li>7일간 보관되는 <a href="/docs/cloud/managed-postgres/monitoring/query-insights">쿼리 인사이트</a></li>
      <li>심각도 1 문제에 대해 연중무휴 24시간, 1시간 이내 응답하는 전문가 지원</li>
    </ul>
  </div>

  <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderTop: '3px solid var(--ifm-color-primary)', borderRadius: '8px', padding: '20px', background: 'var(--ifm-background-surface-color)'}}>
    <h4 style={{marginTop: 0, marginBottom: '8px', textAlign: 'center'}}>Enterprise</h4>
    <p style={{textAlign: 'center', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', minHeight: '3.5em', marginBottom: '16px'}}>프로덕션 환경 운영, 초대규모 데이터 처리, 또는 엔터프라이즈 사용 사례에 적합합니다.</p>
    <p style={{fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem'}}>Scale의 모든 기능에 더해 다음이 포함됩니다.</p>

    <ul style={{paddingLeft: '20px', margin: 0, fontSize: '0.9rem'}}>
      <li>심각도 1 문제에 대해 30분 응답 시간을 제공하는 Enterprise 지원</li>
      <li><a href="/docs/cloud/infrastructure/clickhouse-private">프라이빗 리전</a></li>
      <li>전담 리드 지원 엔지니어</li>
      <li><a href="/docs/cloud/managed-postgres/extensions">사용자 지정 확장 기능</a> (*승인 대기 중)</li>
      <li><a href="/docs/cloud/managed-postgres/migrations/clickhouse-cloud">컨설팅형 마이그레이션 가이드</a></li>
      <li><a href="/docs/cloud/managed-postgres/upgrades">예약 업그레이드</a></li>
    </ul>
  </div>
</div>

### 인스턴스 유형 \{#instance-types\}

워크로드 특성에 따라 인프라 선택을 간소화할 수 있도록 인스턴스 구성은 세 가지 범주로 나뉩니다.

* **메모리 최적화:** 메모리 대 CPU 비율이 더 높은(예: 1:8 또는 1:4) 메모리 집약적 워크로드를 위해 설계되었습니다. AWS Graviton 기반 `r8gd`, `r6gd`, `m6gd`, `m8gd` 제품군을 지원합니다. 대규모 작업 세트, 높은 캐시 적중률, 메모리 병목이 발생하는 데이터베이스 워크로드에 가장 적합합니다.
* **스토리지 최적화:** 컴퓨트를 비례적으로 스케일링하지 않고도 대용량 로컬 NVMe 스토리지가 필요한 워크로드를 위해 설계되었습니다. AWS Graviton 기반 `i8g`, `i8ge`, `i7i`, `i7ie` 제품군을 지원하며, 최대 60 TB의 로컬 NVMe 스토리지를 제공하는 구성이 있습니다. 대규모 데이터셋, 시계열 워크로드, 로그 및 이벤트 저장소, 스토리지 집약적인 OLTP 워크로드에 가장 적합합니다.
* **CPU 최적화:** 메모리 대 CPU 비율이 더 낮은(일반적으로 약 1:2) 컴퓨트 집약적 워크로드를 위해 설계되었습니다. `c6gd` 제품군을 지원하며, 높은 동시성의 트랜잭션 워크로드와 CPU 병목 쿼리에 가장 적합합니다.

## 요금 계산기 \{#pricing-calculator\}

다양한 워크로드 프로필과 구성에 따른 배포 비용을 추산하려면 [요금 계산기](https://clickhouse.com/pricing?service=postgres#pricing-calculator)를 사용하십시오. 다음 항목을 사용자 지정할 수 있습니다.

* 조직 티어(Basic, Scale, Enterprise)
* 리전
* 구성 유형(메모리, 스토리지 또는 CPU 최적화)
* CPU 아키텍처(ARM 또는 x86)
* vCPU, 메모리 및 스토리지 용량
* 대기/고가용성(HA) 구성

이를 통해 50개 이상의 지원되는 구성 조합에 대한 요금을 비교하고 워크로드에 가장 적합한 구성을 찾을 수 있습니다.

## 베타 요금 주요 내용 \{#beta-pricing-highlights\}

베타 기간에는 다음이 적용됩니다.

* **2026년 06월 15일**에 사용량 측정이 시작될 때까지 서비스는 무료입니다
* **ClickPipes**를 통한 네이티브 CDC가 추가 비용 없이 제공됩니다
* 현재는 **네트워크 이그레스** 또는 **백업**에 대한 요금이 부과되지 않습니다
* 현재 모든 플랜에 **50% 할인된 베타 요금**이 적용됩니다

## 유의 사항 \{#disclaimers\}

제품이 베타 기간 동안 발전함에 따라 일반 제공(일반 제공)에 앞서 가격 및 제공 방식이 조정될 수 있습니다. 다음 사항에 유의하십시오.

* 네트워크 이그레스 요금은 일반 제공 이후 도입될 예정입니다. 데이터베이스와 동일한 위치에 배치된 애플리케이션은 egress 비용이 거의 발생하지 않을 것으로 예상됩니다.
* 현재 기준을 정하는 중인 한도를 초과하는 보존 기간에는 일반 제공 시점부터 추가 백업 요금이 적용될 수 있습니다.
* Postgres와 ClickHouse가 동일한 리전에 함께 배치된 경우, ClickPipes를 통한 네이티브 CDC는 일반 제공 이후에도 무료이거나 매우 낮은 요금으로 유지될 것으로 예상합니다. 이는 통합된 OLTP + OLAP 플랫폼이라는 비전과도 부합합니다.
* 스케일링 및 유지 관리 작업 중에는 데이터베이스를 계속 온라인 상태로 유지하기 위해 새 인스턴스와 기존 인스턴스가 잠시 병렬로 실행됩니다. 전환이 완료되는 동안 기존 인스턴스와 새 인스턴스 모두에 대한 요금이 일시적으로 중복 청구될 수 있습니다. 이 기간은 인스턴스 유형과 스토리지 볼륨에 따라 달라집니다.
* 일부 가용 영역에서 선택한 인스턴스 유형의 용량이 일시적으로 제한되는 경우, 선택한 고가용성 구성을 유지하기 위해 서비스가 이전 세대의 유사한 인스턴스 유형으로 대체될 수 있습니다. 요금은 대상 인스턴스 유형 요율로 청구됩니다.
* 베타 기간 동안 실제 고객의 사용 패턴, 워크로드 특성, 인프라 요구 사항에 대해 더 많이 파악하게 되면, 기존 가격은 일반 제공 시점에 가까워질수록 조정되거나 변경될 수 있습니다.