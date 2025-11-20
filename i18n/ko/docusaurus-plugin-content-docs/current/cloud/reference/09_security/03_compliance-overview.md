---
'title': '준수 개요'
'slug': '/cloud/security/compliance-overview'
'description': 'ClickHouse Cloud 보안 및 준수 인증 개요, SOC 2, ISO 27001, U.S. DPF, 및 HIPAA
  포함'
'doc_type': 'reference'
'keywords':
- 'ClickHouse Cloud'
- 'SOC 2 Type II'
- 'ISO 27001'
- 'HIPAA'
- 'U.S. DPF'
- 'PCI'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# 보안 및 컴플라이언스 보고서
ClickHouse는 고객의 보안 및 컴플라이언스 요구 사항을 평가하고 있으며, 추가 보고서 요청에 따라 프로그램을 지속적으로 확장하고 있습니다. 추가 정보 또는 보고서를 다운로드하려면 [신뢰 센터](https://trust.clickhouse.com)를 방문하십시오.

## SOC 2 Type II (2022년부터) {#soc-2-type-ii-since-2022}

시스템 및 조직 제어(SOC) 2는 보안, 가용성, 기밀성, 처리 무결성 및 개인 정보 보호 기준에 초점을 맞춘 보고서로, 신뢰 서비스 기준(TSC)에 적용되는 조직의 시스템을 기준으로 하며, 이러한 제어에 대한 보증을 의존하는 당사자(우리 고객)에게 제공하기 위해 설계되었습니다. ClickHouse는 독립적인 외부 감사인과 협력하여 보안, 가용성 및 시스템의 처리 무결성, 그리고 우리 시스템에서 처리되는 데이터의 기밀성과 개인 정보 보호를 다루는 감사를 매년 최소 한 번 수행합니다. 이 보고서는 우리의 ClickHouse Cloud와 Bring Your Own Cloud (BYOC) 제공 모두를 다룹니다.

## ISO 27001 (2023년부터) {#iso-27001-since-2023}

국제 표준화 기구(ISO) 27001은 정보 보안에 대한 국제 표준입니다. 이 표준은 기업이 위험 관리, 정책 수립 및 커뮤니케이션, 보안 제어 구현, 및 구성 요소가 관련성을 유지하고 효과적임을 보장하기 위한 모니터링을 포함하는 정보 보안 관리 시스템(ISMS)을 구현할 것을 요구합니다. ClickHouse는 내부 감사를 수행하고 독립적인 외부 감사인과 협력하여 인증서 발급 간의 2년간 감사 및 중간 검사를 수행합니다.

## 미국 데이터 개인 정보 보호 프레임워크 (2024년부터) {#us-dpf-since-2024}

미국 데이터 개인 정보 보호 프레임워크는 유럽 연합/유럽 경제 지역, 영국 및 스위스에서 미국으로의 개인 데이터 전송을 위한 신뢰할 수 있는 메커니즘을 제공하기 위해 개발되었습니다. 이는 EU, UK 및 스위스 법률과 일치합니다 (https://dataprivacyframework.gov/Program-Overview). ClickHouse는 프레임워크에 대해 자가 인증을 수행하였으며 [데이터 개인 정보 보호 프레임워크 목록](https://dataprivacyframework.gov/list)에 등재되었습니다.

## HIPAA (2024년부터) {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA"/>

1996년의 건강 보험 이동성 및 책임 법(HIPAA)은 보호된 건강 정보(PHI) 관리에 중점을 둔 미국 기반의 개인 정보 보호 법률입니다. HIPAA에는 전자 개인 건강 정보(ePHI)를 보호하는 데 중점을 두는 [보안 규칙](https://www.hhs.gov/hipaa/for-professionals/security/index.html) 등 여러 요구 사항이 있습니다. ClickHouse는 지정 서비스에 저장된 ePHI의 기밀성, 무결성 및 보안을 보장하기 위해 관리적, 물리적 및 기술적 안전 장치를 구현하였습니다. 이러한 활동은 우리 [신뢰 센터](https://trust.clickhouse.com)에서 다운로드할 수 있는 SOC 2 Type II 보고서에 포함되어 있습니다.

비즈니스 제휴 계약(Business Associate Agreement, BAA)을 완료하고 HIPAA 준수 서비스를 배포하는 단계에 대한 정보는 [HIPAA 온보딩](//cloud/security/compliance/hipaa-onboarding)을 참조하십시오.

## PCI 서비스 제공자 (2025년부터) {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance"/>

[결제 카드 산업 데이터 보안 표준(PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/)은 신용 카드 결제 데이터를 보호하기 위해 PCI 보안 표준 협의회가 만든 일련의 규칙입니다. ClickHouse는 신용 카드 데이터를 저장하는 것과 관련하여 PCI 기준에 대한 준수 보고서(Report on Compliance, ROC)가 통과된 자격 있는 보안 평가자(QSA)와의 외부 감사를 수행하였습니다. 우리의 준수 확인서(Attestation on Compliance, AOC) 및 PCI 책임 개요를 다운로드하려면 [신뢰 센터](https://trust.clickhouse.com)를 방문하십시오.

PCI 준수 서비스를 배포하기 위한 단계에 대한 정보는 [PCI 온보딩](//cloud/security/compliance/pci-onboarding)을 참조하십시오.

## 개인정보 보호 컴플라이언스 {#privacy-compliance}

위 항목 외에도 ClickHouse는 일반 데이터 보호 규정(GDPR), 캘리포니아 소비자 개인정보 보호법(CCPA) 및 기타 관련 개인정보 보호 프레임워크를 다루는 내부 컴플라이언스 프로그램을 유지하고 있습니다.

## 결제 컴플라이언스 {#payment-compliance}

ClickHouse는 [PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/)에 준수하는 신용 카드 결제 방법을 제공하니다.
