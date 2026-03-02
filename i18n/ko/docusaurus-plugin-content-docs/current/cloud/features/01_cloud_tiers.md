---
sidebar_label: 'ClickHouse Cloud 티어'
slug: /cloud/manage/cloud-tiers
title: 'ClickHouse Cloud 티어'
description: 'ClickHouse Cloud에서 사용할 수 있는 Cloud 티어'
keywords: ['Cloud 티어', '서비스 요금제', 'Cloud 요금제 티어', 'Cloud 서비스 수준']
doc_type: 'reference'
---

# ClickHouse Cloud 티어 \{#clickhouse-cloud-tiers\}

ClickHouse Cloud에는 여러 티어가 있습니다. 
티어는 조직 내 어떤 수준에든 할당될 수 있습니다. 따라서 조직 내 서비스는 모두 동일한 티어에 속합니다.
이 페이지에서는 특정 사용 사례에 가장 적합한 티어를 설명합니다.

**Cloud 티어 요약:**

<table>
  <thead>
    <tr>
      <th />

      <th>[Basic](#basic)</th>
      <th>[Scale (권장)](#scale)</th>
      <th>[Enterprise](#enterprise)</th>
    </tr>
  </thead>

  <tbody>
    <tr className="table-category-header">
      <td>**서비스 기능**</td>

      <td colspan="3" />
    </tr>

    <tr>
      <td>서비스 수</td>
      <td>✓ 무제한</td>
      <td>✓ 무제한</td>
      <td>✓ 무제한</td>
    </tr>

    <tr>
      <td>스토리지</td>
      <td>✓ 서비스당 최대 1 TB</td>
      <td>✓ 무제한</td>
      <td>✓ 무제한</td>
    </tr>

    <tr>
      <td>메모리</td>
      <td>✓ 총 메모리 8~12 GiB</td>
      <td>✓ 구성 가능</td>
      <td>✓ 구성 가능</td>
    </tr>

    <tr>
      <td>가용성</td>
      <td>✓ 1개 가용 영역</td>
      <td>✓ 2개 이상 가용 영역</td>
      <td>✓ 2개 이상 가용 영역</td>
    </tr>

    <tr>
      <td>백업</td>
      <td>✓ 24시간마다 1회 백업, 1일 보관</td>
      <td>✓ 구성 가능</td>
      <td>✓ 구성 가능</td>
    </tr>

    <tr>
      <td>수직 확장</td>

      <td />

      <td>✓ 자동 확장</td>
      <td>✓ 표준 프로필은 자동, 사용자 정의 프로필은 수동</td>
    </tr>

    <tr>
      <td>수평 확장</td>

      <td />

      <td>✓ 수동 확장</td>
      <td>✓ 수동 확장</td>
    </tr>

    <tr>
      <td>ClickPipes</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>조기 업그레이드</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>컴퓨트 리소스 분리</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>백업을 자체 Cloud 계정으로 내보내기</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>예약 업그레이드</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>사용자 정의 하드웨어 프로필</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr className="table-category-header">
      <td>**보안**</td>

      <td colspan="3" />
    </tr>

    <tr>
      <td>SAML/SSO</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>MFA</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>SOC 2 Type II</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>ISO 27001</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>프라이빗 네트워킹</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>S3 역할 기반 액세스</td>

      <td />

      <td>✓</td>
      <td>✓</td>
    </tr>

    <tr>
      <td>투명한 데이터 암호화(TDE를 위한 CMEK)</td>

      <td />

      <td />

      <td>✓</td>
    </tr>

    <tr>
      <td>HIPAA</td>

      <td />

      <td />

      <td>✓</td>
    </tr>
  </tbody>
</table>

## Basic \{#basic\}

- 단일 레플리카 배포를 지원하는 비용 효율적인 옵션입니다.
- 높은 수준의 안정성 보장이 필수적이지 않고 데이터 양이 비교적 적은 부서 단위 사용 사례에 적합합니다.

:::note
Basic 티어의 서비스는 크기가 고정되어 있으며 자동 및 수동 확장을 모두 허용하지 않습니다. 
서비스를 확장하려면 Scale 또는 Enterprise 티어로 업그레이드해야 합니다.
:::

## 확장 \{#scale\}

향상된 SLA(레플리카 2개 이상 배포), 확장성, 고급 보안이 필요한 워크로드를 위해 설계되었습니다.

- 다음과 같은 기능을 지원합니다.
  - [프라이빗 네트워킹 지원](/cloud/security/connectivity/private-networking)
  - [Compute-compute 분리](/../reference/warehouses#what-is-compute-compute-separation)
  - [유연한 스케일링](/manage/scaling) 옵션(스케일 업/다운, 인/아웃)
  - [구성 가능한 백업](/cloud/manage/backups/configurable-backups)

## Enterprise \{#enterprise\}

엄격한 보안 및 컴플라이언스 요구 사항을 가진 대규모 미션 크리티컬 배포를 위한 티어입니다.

- Scale 티어의 모든 기능을 포함하며, **여기에 다음이 추가됩니다.**
- 유연한 스케일링: 표준 프로필(`1:4 vCPU:memory ratio`)뿐만 아니라 `HighMemory (1:8 ratio)` 및 `HighCPU (1:2 ratio)` 커스텀 프로필을 제공합니다.
- 최고 수준의 성능 및 복원력 보장을 제공합니다.
- 엔터프라이즈급 보안을 지원합니다:
  - Single Sign On (SSO)
  - 향상된 암호화: AWS 및 GCP 서비스용. 서비스는 기본적으로 당사 키로 암호화되며, 고객 관리 암호화 키(Customer Managed Encryption Keys, CMEK)를 활성화하기 위해 고객 키로 교체할 수 있습니다.
- 예약 업그레이드를 지원합니다. 데이터베이스와 Cloud 릴리스를 포함하여 업그레이드가 수행될 요일과 시간대를 선택할 수 있습니다.  
- [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024) 및 PCI 컴플라이언스를 제공합니다.
- 백업을 사용자 계정으로 내보낼 수 있습니다.

:::note 
세 가지 티어 전체에서 단일 레플리카 서비스는 크기가 고정(`8 GiB`, `12 GiB`)되도록 설계되어 있습니다.
:::

## 다른 티어로 업그레이드하기 \{#upgrading-to-a-different-tier\}

언제든지 Basic 티어에서 Scale 티어로, 또는 Scale 티어에서 Enterprise 티어로 업그레이드할 수 있습니다. 티어를 다운그레이드하려면 프리미엄 기능을 비활성화해야 합니다.

---

서비스 티어에 대해 궁금한 점이 있으면 [요금제 페이지](https://clickhouse.com/pricing)를 참고하거나 support@clickhouse.com으로 문의하십시오.