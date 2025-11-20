---
'sidebar_label': 'ClickHouse Cloud 계층'
'slug': '/cloud/manage/cloud-tiers'
'title': 'ClickHouse Cloud 계층'
'description': 'ClickHouse Cloud에서 사용 가능한 클라우드 계층'
'keywords':
- 'cloud tiers'
- 'service plans'
- 'cloud pricing tiers'
- 'cloud service levels'
'doc_type': 'reference'
---


# ClickHouse Cloud 계층

ClickHouse Cloud에는 여러 계층이 있습니다. 
계층은 조직의 어떤 수준에서나 할당됩니다. 따라서 조직 내 서비스는 동일한 계층에 속합니다.
이 페이지에서는 특정 사용 사례에 적합한 계층에 대해 논의합니다.

**클라우드 계층 요약:**

<table><thead>
  <tr>
    <th></th>
    <th>[기본](#basic)</th>
    <th>[확장(추천)](#scale)</th>
    <th>[기업](#enterprise)</th>
  </tr></thead>
<tbody>
  <tr className="table-category-header">
    <td>**서비스 기능**</td>
    <td colspan="3"></td>
  </tr>
  <tr>
    <td>서비스 수</td>
    <td>✓ 무제한</td>
    <td>✓ 무제한</td>
    <td>✓ 무제한</td>
  </tr>
  <tr>
    <td>스토리지</td>
    <td>✓ 최대 1 TB / 서비스</td>
    <td>✓ 무제한</td>
    <td>✓ 무제한</td>
  </tr>
  <tr>
    <td>메모리</td>
    <td>✓ 총 8-12 GiB 메모리</td>
    <td>✓ 구성 가능</td>
    <td>✓ 구성 가능</td>
  </tr>
  <tr>
    <td>가용성</td>
    <td>✓ 1존</td>
    <td>✓ 2개 이상의 존</td>
    <td>✓ 2개 이상의 존</td>
  </tr>
  <tr>
    <td>백업</td>
    <td>✓ 24시간마다 1회 백업, 1일간 보관</td>
    <td>✓ 구성 가능</td>
    <td>✓ 구성 가능</td>
  </tr>
  <tr>
    <td>수직 확장</td>
    <td></td>
    <td>✓ 자동 확장</td>
    <td>✓ 표준 프로필의 경우 자동, 사용자 지정 프로필의 경우 수동</td>
  </tr>
  <tr>
    <td>수평 확장</td>
    <td></td>
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
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>컴퓨트-컴퓨트 분리</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>자신의 클라우드 계정으로 백업 내보내기</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>예약된 업그레이드</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>사용자 지정 하드웨어 프로필</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr className="table-category-header">
    <td>**보안**</td>
    <td colspan="3"></td>
  </tr>
  <tr>
    <td>SAML/SSO</td>
    <td></td>
    <td></td>
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
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>S3 기반 액세스 역할</td>
    <td></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td>투명한 데이터 암호화 (CMEK for TDE)</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
  <tr>
    <td>HIPAA</td>
    <td></td>
    <td></td>
    <td>✓</td>
  </tr>
</tbody></table>

## 기본 {#basic}

- 단일 복제 배포를 지원하는 비용 효율적인 옵션입니다.
- 신뢰성 보장이 엄격하지 않은 소규모 데이터 볼륨을 가진 부서 사용 사례에 적합합니다.

:::note
기본 계층의 서비스는 크기가 고정되어 있으며 자동 및 수동 확장을 허용하지 않습니다. 
서비스를 확장하려면 Scale 또는 Enterprise 계층으로 업그레이드해야 합니다.
:::

## 확장 {#scale}

향상된 SLA(2개 이상의 복제 배포), 확장성 및 고급 보안이 필요한 작업에 맞게 설계되었습니다.

- 다음과 같은 기능을 지원합니다:
  - [프라이빗 네트워킹 지원](/cloud/security/connectivity/private-networking).
  - [컴퓨트-컴퓨트 분리](../reference/warehouses#what-is-compute-compute-separation).
  - [유연한 확장](/manage/scaling) 옵션(확장 및 축소, 인아웃).
  - [구성 가능한 백업](/cloud/manage/backups/configurable-backups)

## 기업 {#enterprise}

엄격한 보안 및 규정 준수가 필요한 대규모, 미션 크리티컬 배포를 위한 것입니다.

- Scale의 모든 기능, **추가로**
- 유연한 확장: 표준 프로필(`1:4 vCPU:메모리 비율`) 및 `HighMemory (1:8 비율)` 및 `HighCPU (1:2 비율)` 사용자 지정 프로필.
- 최고의 성능 및 신뢰성 보장을 제공합니다.
- 기업 수준의 보안을 지원합니다:
  - Single Sign On (SSO)
  - 향상된 암호화: AWS 및 GCP 서비스의 경우. 서비스는 기본적으로 우리의 키로 암호화되며, 고객 관리 암호화 키(CMEK)를 활성화하기 위해 키를 전환할 수 있습니다.
- 예약된 업그레이드를 허용합니다: 데이터베이스 및 클라우드 릴리스를 위한 업그레이드를 위한 요일/시간 창을 선택할 수 있습니다.
- [HIPAA](/cloud/security/compliance-overview#hipaa-since-2024) 및 PCI 준수를 제공합니다.
- 사용자 계정으로 백업을 내보냅니다.

:::note 
세 가지 계층의 단일 복제 서비스는 크기가 고정되어 있습니다(`8 GiB`, `12 GiB`).
:::

## 다른 계층으로 업그레이드 {#upgrading-to-a-different-tier}

기본에서 확장 또는 확장에서 기업으로 업그레이드할 수 있습니다. 계층을 다운그레이드하려면 프리미엄 기능을 비활성화해야 합니다.

---

서비스 유형에 대한 질문이 있는 경우, [가격 페이지](https://clickhouse.com/pricing)를 참조하거나 support@clickhouse.com에 문의하십시오.
