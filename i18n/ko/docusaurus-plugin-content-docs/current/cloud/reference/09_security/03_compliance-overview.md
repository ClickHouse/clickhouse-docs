---
title: '컴플라이언스 개요'
slug: /cloud/security/compliance-overview
description: 'SOC 2, ISO 27001, U.S. DPF, HIPAA 등 ClickHouse Cloud 보안 및 컴플라이언스 인증에 대한 개요'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'SOC 2 Type II', 'ISO 27001', 'HIPAA', 'U.S. DPF', 'PCI']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# 보안 및 컴플라이언스 보고서 \{#security-and-compliance-reports\}

ClickHouse는 고객의 보안 및 컴플라이언스 요구 사항을 평가하고, 요청되는 추가 보고서에 따라 관련 프로그램을 지속적으로 확대하고 있습니다. 추가 정보 확인 또는 보고서 다운로드를 위해 [Trust Center](https://trust.clickhouse.com)를 방문하십시오.

## SOC 2 Type II (2022년부터) \{#soc-2-type-ii-since-2022\}

System and Organization Controls (SOC) 2는 조직의 시스템에 적용되는 Trust Services Criteria(TSC)에 포함된 보안, 가용성, 기밀성, 처리 무결성 및 개인정보 보호(privacy) 기준에 초점을 둔 보고서로, 이 보고서를 신뢰하는 이해관계자(고객)에게 해당 통제 수준에 대한 신뢰를 제공하도록 설계되었습니다. ClickHouse는 독립적인 외부 감사인과 협력하여 매년 최소 한 차례 이상, 자사 시스템의 보안, 가용성 및 처리 무결성과 자사 시스템이 처리하는 데이터의 기밀성과 개인정보 보호에 대해 감사를 수행합니다. 이 보고서는 ClickHouse Cloud와 Bring Your Own Cloud(BYOC) 제공 모델 모두를 포괄합니다. 

## ISO 27001 (2023년부터) \{#iso-27001-since-2023\}

International Standards Organization (ISO) 27001은 정보 보안을 위한 국제 표준입니다. 이 표준은 기업이 위험 관리, 정책 수립 및 전달, 보안 통제 구현, 구성 요소가 계속해서 관련성과 효과성을 유지하는지 확인하기 위한 모니터링 절차를 포함하는 정보 보안 관리 시스템(Information Security Management System, ISMS)을 구축하도록 요구합니다. ClickHouse는 내부 감사를 수행하고 독립적인 외부 감사인과 협력하여, 인증서 발급 이후 2년 동안 감사 및 중간 점검을 진행합니다. 

## U.S. DPF(2024년 이후) \{#us-dpf-since-2024\}

U.S. Data Privacy Framework는 미국 내 조직이 유럽 연합/유럽 경제 지역, 영국, 스위스에서 미국으로 개인정보를 이전할 때 EU, 영국, 스위스 법률과 일치하는 신뢰할 수 있는 메커니즘을 제공하기 위해 마련되었습니다(https://dataprivacyframework.gov/Program-Overview). ClickHouse는 해당 프레임워크에 대해 자체적으로 인증을 완료했으며, [Data Privacy Framework List](https://dataprivacyframework.gov/list)에 등재되어 있습니다.

## HIPAA (2024년부터) \{#hipaa-since-2024\}

<EnterprisePlanFeatureBadge feature="HIPAA"/>

1996년에 제정된 Health Insurance Portability and Accountability Act(HIPAA)는 보호 대상 건강 정보(PHI)의 관리에 초점을 둔 미국의 개인정보 보호 법률입니다. HIPAA에는 여러 요구사항이 있으며, 그중 [Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)은 전자적 형태의 개인 건강 정보(ePHI)를 보호하는 데 중점을 둡니다. ClickHouse는 지정된 서비스에 저장된 ePHI의 기밀성, 무결성 및 보안을 보장하기 위해 관리적, 물리적 및 기술적 보호 조치를 구현했습니다. 이러한 활동은 당사 [Trust Center](https://trust.clickhouse.com)에서 다운로드할 수 있는 SOC 2 Type II 보고서에 반영되어 있습니다.

Business Associate Agreement(BAA)을 완료하고 HIPAA 요건을 충족하는 서비스를 배포하는 단계는 [HIPAA 온보딩](/cloud/security/compliance/hipaa-onboarding)을 참조하십시오.

## PCI 서비스 제공자(2025년부터) \{#pci-service-provider-since-2025\}

<EnterprisePlanFeatureBadge feature="PCI compliance"/>

[Payment Card Industry Data Security Standard (PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/)는 신용카드 결제 데이터를 보호하기 위해 PCI Security Standards Council이 제정한 데이터 보안 표준입니다. ClickHouse는 Qualified Security Assessor(QSA)가 수행한 외부 감사를 통해 신용카드 데이터 저장과 관련된 PCI 기준을 충족한다는 판정을 받았으며, 그 결과로 적합성 보고서(Report on Compliance, ROC)를 획득했습니다. 당사의 적합성 증명서(Attestation on Compliance, AOC) 사본과 PCI 책임 범위 개요를 다운로드하려면 [Trust Center](https://trust.clickhouse.com)를 방문하십시오.

PCI 규격을 준수하는 서비스를 배포하는 단계는 [PCI 온보딩](/cloud/security/compliance/pci-onboarding)을 참고하십시오.

## 개인정보 보호 규정 준수 \{#privacy-compliance\}

위 항목 외에도 ClickHouse는 일반 데이터 보호 규정(General Data Protection Regulation, GDPR), 캘리포니아 소비자 프라이버시법(California Consumer Privacy Act, CCPA) 및 기타 관련 개인정보 보호 프레임워크를 대상으로 하는 내부 규정 준수 프로그램을 운영합니다. 

## 결제 규정 준수 \{#payment-compliance\}

ClickHouse는 [PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/)을 준수하는 안전한 신용카드 결제 방식을 제공합니다. 